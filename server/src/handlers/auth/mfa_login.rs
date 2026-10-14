//! MFA completion after any supported primary authentication method.

use axum::{
    extract::State,
    http::{header, HeaderMap},
    response::IntoResponse,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use super::login_session::{finalize_prepared_login, prepare_login_session};
use crate::callback::AuthCallback;
use crate::domain::verify_recovery_code;
use crate::errors::AppError;
use crate::models::{AuthMethod, AuthResponse, MfaLoginRequest};
use crate::repositories::{
    hash_verification_token, AuditEventType, MfaFactorClaim, MfaFactorClaimOutcome, TokenType,
    UserEntity,
};
use crate::services::EmailService;
use crate::utils::{
    build_json_response_with_cookies, compute_authenticated_post_login, compute_post_login,
    extract_client_ip_with_fallback, PeerIp,
};
use crate::AppState;

/// POST /auth/login/mfa - complete an MFA login with TOTP or a recovery code.
///
/// An incorrect factor leaves the live, purpose-bound challenge usable. A
/// successful factor is followed by atomic challenge consumption before any
/// session is issued, so concurrent valid submissions can issue at most one
/// session. Invalid/expired/wrong-purpose/lost-race challenges share one error.
pub async fn complete_mfa_login<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<MfaLoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let method = primary_method_from_token(&req.mfa_token)?;
    let token_hash = hash_verification_token(&req.mfa_token);
    let pending = find_pending_challenge(&state, &token_hash).await?;
    enforce_attempt_limit(&state, pending.user_id).await?;
    let (user, secret) = load_mfa_context(&state, pending.user_id).await?;
    let invite_pending = state.invite_code_service.is_user_pending(user.id).await?;
    if invite_pending && state.invite_code_service.gate_enabled().await? {
        state
            .verification_repo
            .delete_for_user(user.id, TokenType::MfaPending)
            .await?;
        return Err(AppError::Forbidden(
            "Invite code required. Restart sign-in to continue.".into(),
        ));
    }
    if invite_pending {
        state.invite_code_service.activate_user(user.id).await?;
    }

    let Some(factor) = verify_factor(&state, &user, &secret, &req.code).await? else {
        record_failed_factor(&state, &headers, user.id).await?;
        return Err(AppError::Validation("Invalid verification code".into()));
    };

    complete_verified_mfa_login(&state, &headers, peer_ip, user, &token_hash, factor, method).await
}

fn primary_method_from_token(token: &str) -> Result<AuthMethod, AppError> {
    let (method, opaque) = token.split_once('.').ok_or_else(invalid_mfa_token)?;
    if opaque.is_empty() {
        return Err(invalid_mfa_token());
    }
    AuthMethod::from_wire(method).ok_or_else(invalid_mfa_token)
}

async fn find_pending_challenge<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    token_hash: &str,
) -> Result<crate::repositories::VerificationToken, AppError> {
    state
        .verification_repo
        .find_valid(token_hash, &[TokenType::MfaPending])
        .await
        .map_err(|error| AppError::Internal(anyhow::anyhow!("Failed to find MFA token: {error}")))?
        .ok_or_else(invalid_mfa_token)
}

async fn enforce_attempt_limit<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    user_id: Uuid,
) -> Result<(), AppError> {
    state
        .mfa_attempt_service
        .check_allowed(user_id)
        .await
        .map_err(|remaining| {
            AppError::TooManyRequests(format!(
                "Too many verification attempts. Try again in {} seconds",
                remaining.as_secs()
            ))
        })
}

async fn load_mfa_context<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    user_id: Uuid,
) -> Result<(UserEntity, crate::repositories::TotpSecret), AppError> {
    let secret = state
        .totp_repo
        .find_by_user(user_id)
        .await?
        .ok_or(AppError::Validation("MFA not configured".into()))?;
    if !secret.enabled {
        return Err(AppError::Validation("MFA not enabled".into()));
    }
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;
    Ok((user, secret))
}

async fn verify_factor<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    user: &UserEntity,
    secret: &crate::repositories::TotpSecret,
    code: &str,
) -> Result<Option<MfaFactorClaim>, AppError> {
    let code = code.trim();
    if !is_totp_code(code) {
        let recovery_codes = state.totp_repo.get_recovery_codes(user.id).await?;
        let code = code.to_owned();
        return crate::services::cpu_work::auth(move || {
            let mut matched_id = None;
            for recovery_code in recovery_codes {
                if verify_recovery_code(&code, &recovery_code.code_hash) {
                    matched_id = Some(recovery_code.id);
                }
            }
            Ok(matched_id.map(MfaFactorClaim::RecoveryCode))
        })
        .await;
    }
    let email = user
        .email
        .as_deref()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("User has MFA but no email")))?;
    let Some(time_step) = state.totp_service.verify_with_replay_check(
        &secret.secret,
        code,
        email,
        secret.last_used_time_step,
    )?
    else {
        return Ok(None);
    };
    Ok(Some(MfaFactorClaim::TotpTimeStep {
        enrollment_id: secret.id,
        time_step,
    }))
}

fn is_totp_code(code: &str) -> bool {
    code.len() == 6 && code.bytes().all(|byte| byte.is_ascii_digit())
}

async fn record_failed_factor<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    headers: &HeaderMap,
    user_id: Uuid,
) -> Result<(), AppError> {
    let _ = state
        .audit_service
        .log_user_event(
            AuditEventType::MfaVerificationFailed,
            user_id,
            Some(headers),
        )
        .await;
    state
        .mfa_attempt_service
        .record_failed(user_id)
        .await
        .map(|_| ())
        .map_err(|lockout| {
            AppError::TooManyRequests(format!(
                "Too many verification attempts. Try again in {} seconds",
                lockout.as_secs()
            ))
        })
}

fn invalid_mfa_token() -> AppError {
    AppError::Validation("Invalid or expired MFA token".into())
}

async fn complete_verified_mfa_login<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
    peer_ip: Option<std::net::IpAddr>,
    user: UserEntity,
    token_hash: &str,
    factor: MfaFactorClaim,
    method: AuthMethod,
) -> Result<axum::response::Response, AppError> {
    let ip_address =
        extract_client_ip_with_fallback(headers, state.config.server.trust_proxy, peer_ip);
    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|value| value.to_str().ok())
        .map(str::to_string);
    enforce_post_login_policy(state, &user).await?;
    let prepared = prepare_login_session(state, &user, ip_address, user_agent).await?;
    let post_login = compute_authenticated_post_login(
        &user,
        &prepared.token_pair.access_token,
        &state.settings_service,
        &*state.totp_repo,
        &*state.credential_repo,
        &state.subscription_selection_service,
    )
    .await?;
    claim_mfa_session(
        state,
        headers,
        token_hash,
        user.id,
        factor,
        &prepared.session,
    )
    .await?;
    state.mfa_attempt_service.record_success(user.id).await;
    super::maybe_queue_new_device_alert_after_session(
        state,
        &user,
        prepared.ip_address.as_deref(),
        prepared.user_agent.as_deref(),
        prepared.session.id,
    )
    .await;
    let (token_pair, auth_user, callback_data) =
        finalize_prepared_login(state, &user, prepared, method).await;
    log_mfa_completion(state, headers, user.id).await;
    let tokens = (!state.config.cookie.enabled).then(|| token_pair.clone());
    let response = AuthResponse {
        user: auth_user,
        tokens,
        is_new_user: false,
        callback_data,
        api_key: None,
        email_queued: None,
        invite_code_required: None,
        pending_invite_token: None,
        post_login,
        method: Some(method),
    };
    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}

async fn claim_mfa_session<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    headers: &HeaderMap,
    token_hash: &str,
    user_id: Uuid,
    factor: MfaFactorClaim,
    session: &crate::repositories::SessionEntity,
) -> Result<(), AppError> {
    let outcome = state
        .storage
        .atomic_mfa_repo
        .claim_with_session(token_hash, user_id, factor, session.clone())
        .await
        .map_err(|error| {
            AppError::Internal(anyhow::anyhow!("Failed to commit MFA login: {error}"))
        })?;
    match outcome {
        MfaFactorClaimOutcome::Claimed => Ok(()),
        MfaFactorClaimOutcome::ChallengeUnavailable => Err(invalid_mfa_token()),
        MfaFactorClaimOutcome::FactorUnavailable => {
            record_failed_factor(state, headers, user_id).await?;
            Err(AppError::Validation("Invalid verification code".into()))
        }
    }
}

async fn enforce_post_login_policy<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    user: &UserEntity,
) -> Result<(), AppError> {
    let action = compute_post_login(
        user,
        &state.settings_service,
        &*state.totp_repo,
        &*state.credential_repo,
    )
    .await?;
    if matches!(action.as_ref(), Some(action) if action.action == "setup_mfa") {
        return Err(AppError::Forbidden(
            "MFA setup is required before completing login".into(),
        ));
    }
    Ok(())
}

async fn log_mfa_completion<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    headers: &HeaderMap,
    user_id: Uuid,
) {
    if let Err(error) = state
        .audit_service
        .log_user_event(AuditEventType::MfaLoginCompleted, user_id, Some(headers))
        .await
    {
        tracing::warn!(%error, %user_id, "Failed to log MFA login audit event");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn primary_method_is_bound_to_mfa_token() {
        assert_eq!(
            primary_method_from_token("google.opaque-token").unwrap(),
            AuthMethod::Google
        );
        assert_eq!(
            primary_method_from_token("webauthn.opaque-token").unwrap(),
            AuthMethod::WebAuthn
        );
    }

    #[test]
    fn malformed_or_unknown_mfa_token_fails_closed() {
        assert!(primary_method_from_token("legacy-token-without-purpose").is_err());
        assert!(primary_method_from_token("unknown.opaque-token").is_err());
        assert!(primary_method_from_token("email.").is_err());
    }
}
