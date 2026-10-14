//! Apple Sign-In authentication handler

use axum::{extract::State, http::HeaderMap, response::IntoResponse, Json};
use chrono::{Duration, Utc};
use serde::Serialize;
use std::sync::Arc;

use sha2::{Digest, Sha256};

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::handlers::auth::{
    call_authenticated_callback_with_timeout, call_registered_callback_with_timeout,
    pending_invite_response,
};
use crate::models::{AppleAuthRequest, AuthMethod, AuthResponse};
use crate::repositories::{
    generate_api_key, generate_verification_token, normalize_email, ApiKeyEntity, AuditEventType,
    MembershipEntity, NonceEntity, SessionEntity, UserEntity,
};
use crate::services::{
    exchange_and_encrypt_refresh_token, sync_apple_credential,
    verify_apple_id_token_for_allowed_clients, EmailService,
};
use crate::utils::{
    build_json_response_with_cookies, compute_authenticated_post_login, email_blocks_signup,
    ensure_primary_email_row, extract_client_ip_with_fallback, get_default_org_context,
    hash_refresh_token, resolve_org_assignment, user_entity_to_auth_user, PeerIp,
};
use crate::AppState;

pub(crate) const APPLE_NONCE_PURPOSE: &str = "apple_sign_in";
const APPLE_NONCE_TTL_MINUTES: i64 = 5;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppleNonceResponse {
    nonce: String,
}

/// POST /auth/apple/nonce - issue a server-owned, one-time Apple nonce.
pub async fn apple_nonce<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Result<Json<AppleNonceResponse>, AppError> {
    ensure_apple_enabled(&state).await?;
    let nonce = generate_verification_token();
    state
        .nonce_repo
        .create(NonceEntity::new(
            nonce.clone(),
            APPLE_NONCE_PURPOSE.into(),
            APPLE_NONCE_PURPOSE.into(),
            Utc::now() + Duration::minutes(APPLE_NONCE_TTL_MINUTES),
        ))
        .await?;
    Ok(Json(AppleNonceResponse { nonce }))
}

async fn ensure_apple_enabled<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
) -> Result<(), AppError> {
    let enabled = state
        .settings_service
        .get_bool("auth_apple_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.apple.enabled);
    if enabled {
        Ok(())
    } else {
        Err(AppError::NotFound("Apple auth disabled".into()))
    }
}

/// POST /auth/apple - Authenticate with Apple ID token
pub async fn apple_auth<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<AppleAuthRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Enabled check: runtime setting > static config
    ensure_apple_enabled(&state).await?;

    // Verify the Apple ID token
    let verified = verify_apple_id_token_for_allowed_clients(
        &state.apple_service,
        &state.settings_service,
        &state.config.apple,
        &req.id_token,
    )
    .await?;
    let claims = verified.claims;
    let matched_client_id = verified.client_id;

    validate_apple_nonce(&req.nonce, claims.nonce.as_deref())?;
    consume_apple_nonce(&state, &req.nonce).await?;
    // Check if user exists by Apple ID
    let existing_user = state.user_repo.find_by_apple_id(&claims.sub).await?;

    let (user, is_new_user, api_key) = if let Some(user) = existing_user {
        (user, false, None)
    } else {
        // Validate real_user_status to prevent bot registrations.
        // Apple's anti-fraud system indicates if the user is likely a real person.
        // We only block new user registrations with status=1 (unknown/potential bot).
        // Existing users and status=0 (unsupported device) or status=2 (real) are allowed.
        if !claims.is_likely_real() {
            tracing::warn!(
                apple_id = %claims.sub,
                real_user_status = ?claims.real_user_status,
                "Rejected Apple Sign-In registration: potential bot detected"
            );
            return Err(AppError::Validation(
                "Unable to verify account authenticity. Please try again later.".to_string(),
            ));
        }

        let normalized_email = claims.email.as_deref().map(normalize_email);
        let email_is_authoritative = claims.is_email_verified();
        if email_is_authoritative {
            if let Some(ref email) = normalized_email {
                if email_blocks_signup(&state, email).await? {
                    return Err(AppError::AccountLinkRequired {
                        provider: "apple".to_string(),
                    });
                }
            }
        }
        let mut signup_limit_permit = state.signup_limit_service.acquire().await?;
        signup_limit_permit.ensure_available().await?;

        // Create new user. Apple may not provide email in rare edge cases;
        // those users can only authenticate via Apple ID.
        let now = Utc::now();
        let mut user = UserEntity {
            id: uuid::Uuid::new_v4(),
            email: normalized_email.filter(|_| email_is_authoritative),
            email_verified: email_is_authoritative,
            password_hash: None,
            // Use name from request (Apple only provides on first sign-in)
            name: req.name,
            username: None,
            picture: None, // Apple doesn't provide profile pictures
            wallet_address: None,
            google_id: None,
            apple_id: Some(claims.sub),
            auth_methods: vec![AuthMethod::Apple],
            is_system_admin: false,
            created_at: now,
            updated_at: now,
            last_login_at: Some(now),
            welcome_completed_at: None,
            referral_code: crate::repositories::generate_referral_code(),
            referred_by: None,
        };

        if let Some(code) = req
            .referral
            .as_deref()
            .map(str::trim)
            .filter(|code| !code.is_empty())
        {
            match state.user_repo.find_by_referral_code(code).await {
                Ok(Some(referrer)) => user.referred_by = Some(referrer.id),
                Ok(None) => {}
                Err(error) => {
                    tracing::warn!(error = %error, "Failed to resolve referral code, ignoring")
                }
            }
        }

        // Persist user FIRST — org resolution may auto-create a "Default" org
        // whose owner_id FK references users.id, so the user row must exist.
        let user = state.user_repo.create(user).await?;
        signup_limit_permit.record_created();
        ensure_primary_email_row(&state, &user).await?;

        // NOW resolve org assignment — user exists in DB, FK satisfied
        let org_assignment = resolve_org_assignment(&state, user.id).await?;
        let membership = MembershipEntity::new(user.id, org_assignment.org_id, org_assignment.role);
        state.membership_repo.create(membership).await?;

        if let Some(response) =
            pending_invite_response(&state, &user, AuthMethod::Apple, &headers).await?
        {
            return Ok(response);
        }

        let raw_api_key = generate_api_key();
        let api_key_entity = ApiKeyEntity::new(user.id, &raw_api_key, "default");
        state.api_key_repo.create(api_key_entity).await?;

        (user, true, Some(raw_api_key))
    };
    let encrypted_refresh_token = exchange_and_encrypt_refresh_token(
        &state.settings_service,
        &state.config.apple,
        &state.config.jwt.secret,
        req.authorization_code.as_deref(),
        &matched_client_id,
    )
    .await?;
    sync_apple_credential(
        state.credential_repo.as_ref(),
        user.id,
        encrypted_refresh_token,
        &matched_client_id,
    )
    .await?;

    if let Some(response) =
        super::auth::pending_invite_login_response(&state, &user, AuthMethod::Apple).await?
    {
        return Ok(response);
    }
    if let Some(response) =
        super::auth::pending_mfa_response(&state, &user, AuthMethod::Apple, &headers).await?
    {
        return Ok(response);
    }

    // Get user's memberships to find default org context
    let memberships = state.membership_repo.find_by_user(user.id).await?;
    let token_context =
        get_default_org_context(&memberships, user.is_system_admin, user.email_verified);

    // Create session with org context
    let session_id = uuid::Uuid::new_v4();
    let token_pair =
        state
            .jwt_service
            .generate_token_pair_with_context(user.id, session_id, &token_context)?;
    let refresh_expiry =
        Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);

    let ip_address =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);
    let user_agent = headers
        .get(axum::http::header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let mut session = SessionEntity::new_with_id(
        session_id,
        user.id,
        hash_refresh_token(&token_pair.refresh_token, &state.config.jwt.secret),
        refresh_expiry,
        ip_address.clone(),
        user_agent.clone(),
    );
    session.last_strong_auth_at = Some(Utc::now());
    super::auth::maybe_queue_new_device_alert(
        &state,
        &user,
        ip_address.as_deref(),
        user_agent.as_deref(),
        false,
    )
    .await;
    state
        .storage
        .credential_lifecycle_repo
        .create_session_if_current(&user, session)
        .await?;
    if !is_new_user {
        // New users get last_login_at at creation; stamp returning logins.
        super::auth::touch_last_login(&state.user_repo, user.id).await;
    }

    // Fire callback
    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::Apple,
        is_new_user,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
        referral: req.referral.clone(),
    };

    let callback_data = if is_new_user {
        call_registered_callback_with_timeout(&state.callback, &payload).await
    } else {
        call_authenticated_callback_with_timeout(&state.callback, &payload).await
    };

    // Log audit event (fire-and-forget)
    let audit_event = if is_new_user {
        AuditEventType::UserRegister
    } else {
        AuditEventType::UserLogin
    };
    let _ = state
        .audit_service
        .log_user_event(audit_event, user.id, Some(&headers))
        .await;

    let response_tokens = if state.config.cookie.enabled {
        None
    } else {
        Some(token_pair.clone())
    };

    let response = AuthResponse {
        user: auth_user,
        tokens: response_tokens,
        is_new_user,
        callback_data,
        api_key,
        email_queued: None,
        invite_code_required: None,
        pending_invite_token: None,
        method: Some(AuthMethod::Apple),
        post_login: compute_authenticated_post_login(
            &user,
            &token_pair.access_token,
            &state.settings_service,
            &*state.totp_repo,
            &*state.credential_repo,
            &state.subscription_selection_service,
        )
        .await?,
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}

pub(crate) async fn consume_apple_nonce<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    raw_nonce: &str,
) -> Result<(), AppError> {
    let nonce = state
        .nonce_repo
        .consume_if_valid(raw_nonce)
        .await?
        .filter(|nonce| {
            nonce.public_key == APPLE_NONCE_PURPOSE && nonce.message == APPLE_NONCE_PURPOSE
        })
        .ok_or(AppError::InvalidToken)?;
    debug_assert!(nonce.used_at.is_some());
    Ok(())
}

fn validate_apple_nonce(client_nonce: &str, token_nonce: Option<&str>) -> Result<(), AppError> {
    match token_nonce {
        None => {
            tracing::warn!("Apple nonce missing from token despite client sending nonce");
            Err(AppError::InvalidToken)
        }
        Some(token_nonce) => {
            let expected_hash = hex::encode(Sha256::digest(client_nonce.as_bytes()));
            if token_nonce == expected_hash {
                Ok(())
            } else {
                tracing::warn!(
                    "Apple nonce mismatch: token nonce does not match client nonce hash"
                );
                Err(AppError::InvalidToken)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::validate_apple_nonce;
    use crate::errors::AppError;
    use sha2::{Digest, Sha256};

    #[test]
    fn validates_nonce_when_present_in_token_and_request() {
        let nonce = "nonce-123";
        let token_nonce = hex::encode(Sha256::digest(nonce.as_bytes()));

        assert!(validate_apple_nonce(nonce, Some(&token_nonce)).is_ok());
    }

    #[test]
    fn rejects_missing_token_nonce() {
        let result = validate_apple_nonce("nonce-123", None);

        assert!(matches!(result, Err(AppError::InvalidToken)));
    }

    #[test]
    fn rejects_nonce_mismatch() {
        let result = validate_apple_nonce("nonce-123", Some("hashed-nonce"));

        assert!(matches!(result, Err(AppError::InvalidToken)));
    }
}
