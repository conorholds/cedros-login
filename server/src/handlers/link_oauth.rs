//! OAuth account linking handler
//!
//! Links a Google or Apple OAuth account after verifying ownership via either
//! password proof or a recent step-up session.

use axum::{
    extract::State,
    http::HeaderMap,
    response::{IntoResponse, Response},
    Json,
};
use chrono::{Duration, Utc};
use sha2::Digest;
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::handlers::auth::call_authenticated_callback_with_timeout;
use crate::models::{AuthMethod, AuthResponse, LinkOAuthRequest};
use crate::repositories::{normalize_email, AuditEventType, SessionEntity, UserEntity};
use crate::services::{
    exchange_and_encrypt_refresh_token, sync_apple_credential,
    verify_apple_id_token_for_allowed_clients, EmailService,
};
use crate::utils::{
    authenticate, build_json_response_with_cookies, compute_authenticated_post_login,
    extract_client_ip_with_fallback, find_user_by_verified_email, get_default_org_context,
    hash_refresh_token, user_entity_to_auth_user, PeerIp,
};
use crate::AppState;

/// POST /auth/link-oauth — Link an OAuth provider to an existing account.
///
/// Requires password proof or a recent step-up session to prevent account
/// takeover. The OAuth token is re-verified server-side.
pub async fn link_oauth<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<LinkOAuthRequest>,
) -> Result<Response, AppError> {
    // Validate provider — accept either id_token or access_token (Google popup
    // flow only returns access_token via initTokenClient).
    let (auth_method, oauth_sub, oauth_email, apple_refresh_token) = match req.provider.as_str() {
        "google" => {
            let client_id = resolve_google_client_id(&state).await?;
            let claims = match (&req.id_token, &req.access_token) {
                (Some(id_token), _) => {
                    state
                        .google_service
                        .verify_id_token(id_token, &client_id)
                        .await?
                }
                (_, Some(access_token)) => {
                    state
                        .google_service
                        .verify_access_token(access_token, &client_id)
                        .await?
                }
                _ => {
                    return Err(AppError::Validation(
                        "Either idToken or accessToken is required".into(),
                    ))
                }
            };
            let email = claims
                .email
                .ok_or(AppError::Validation("Email not provided by Google".into()))?;
            (
                AuthMethod::Google,
                claims.sub,
                normalize_email(&email),
                None,
            )
        }
        "apple" => {
            let id_token = req
                .id_token
                .as_ref()
                .ok_or(AppError::Validation("idToken is required for Apple".into()))?;
            let client_nonce = req
                .nonce
                .as_deref()
                .ok_or(AppError::Validation("nonce is required for Apple".into()))?;
            let verified = verify_apple_id_token_for_allowed_clients(
                &state.apple_service,
                &state.settings_service,
                &state.config.apple,
                id_token,
            )
            .await?;
            let claims = verified.claims;
            let client_id = verified.client_id;
            validate_apple_link_nonce(client_nonce, claims.nonce.as_deref())?;
            super::apple::consume_apple_nonce(&state, client_nonce).await?;
            let email = claims
                .email
                .ok_or(AppError::Validation("Email not provided by Apple".into()))?;
            let refresh_token = exchange_and_encrypt_refresh_token(
                &state.settings_service,
                &state.config.apple,
                &state.config.jwt.secret,
                req.authorization_code.as_deref(),
                &client_id,
            )
            .await?;
            (
                AuthMethod::Apple,
                claims.sub,
                normalize_email(&email),
                Some((refresh_token, client_id)),
            )
        }
        _ => {
            return Err(AppError::Validation(
                "provider must be \"google\" or \"apple\"".into(),
            ))
        }
    };

    let ip_address =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);
    let target =
        resolve_link_target(&state, &headers, &req, &oauth_email, ip_address.as_deref()).await?;
    let proof = target.proof;
    let user = link_verified_oauth_to_user(&state, target.user, auth_method, oauth_sub).await?;

    match proof {
        LinkProof::Session(session_id) => {
            state
                .session_repo
                .revoke_all_except(user.id, session_id)
                .await?;
        }
        LinkProof::Password => {
            state
                .session_repo
                .revoke_all_for_user_with_reason(user.id, "oauth_credential_linked")
                .await?;
        }
    }

    if let Some((refresh_token, client_id)) = apple_refresh_token {
        sync_apple_credential(
            state.credential_repo.as_ref(),
            user.id,
            refresh_token,
            &client_id,
        )
        .await?;
    }

    if matches!(proof, LinkProof::Session(_)) {
        let body = serde_json::json!({
            "linked": auth_method.as_str(),
            "user": user_entity_to_auth_user(&user),
        });
        return Ok(Json(body).into_response());
    }

    // Create session + return AuthResponse (mirrors google.rs / apple.rs)
    let memberships = state.membership_repo.find_by_user(user.id).await?;
    let token_context =
        get_default_org_context(&memberships, user.is_system_admin, user.email_verified);

    let session_id = uuid::Uuid::new_v4();
    let token_pair =
        state
            .jwt_service
            .generate_token_pair_with_context(user.id, session_id, &token_context)?;
    let refresh_expiry =
        Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);

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

    // Fire callback
    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: auth_method,
        is_new_user: false,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
        referral: None,
    };
    let callback_data = call_authenticated_callback_with_timeout(&state.callback, &payload).await;

    // Audit log
    let _ = state
        .audit_service
        .log_user_event(AuditEventType::UserLogin, user.id, Some(&headers))
        .await;

    let response_tokens = if state.config.cookie.enabled {
        None
    } else {
        Some(token_pair.clone())
    };

    let response = AuthResponse {
        user: auth_user,
        tokens: response_tokens,
        is_new_user: false,
        callback_data,
        api_key: None,
        email_queued: None,
        invite_code_required: None,
        pending_invite_token: None,
        method: Some(auth_method),
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
    )
    .into_response())
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum LinkProof {
    Password,
    Session(Uuid),
}

#[derive(Debug)]
struct LinkTarget {
    user: UserEntity,
    proof: LinkProof,
}

async fn resolve_link_target<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
    req: &LinkOAuthRequest,
    oauth_email: &str,
    ip_address: Option<&str>,
) -> Result<LinkTarget, AppError> {
    if let Some(password) = req.password.as_ref() {
        let user = password_link_target(state, oauth_email, password, ip_address).await?;
        return Ok(LinkTarget {
            user,
            proof: LinkProof::Password,
        });
    }
    let (user, session_id) = session_link_target(state, headers).await?;
    Ok(LinkTarget {
        user,
        proof: LinkProof::Session(session_id),
    })
}

async fn session_link_target<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
) -> Result<(UserEntity, Uuid), AppError> {
    let auth = authenticate(state, headers).await?;
    let session_id = auth.session_id.ok_or(AppError::StepUpRequired)?;
    state.step_up_service.require_step_up(session_id).await?;
    let user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;
    Ok((user, session_id))
}

async fn password_link_target<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    oauth_email: &str,
    password: &str,
    ip_address: Option<&str>,
) -> Result<UserEntity, AppError> {
    require_not_locked(state, oauth_email).await?;
    let user = find_user_by_verified_email(state, oauth_email).await?;
    let user = match user {
        Some(user) => verify_link_password(state, user, oauth_email, password, ip_address).await?,
        None => {
            state
                .password_service
                .verify_dummy(password.to_string())
                .await?;
            record_link_failure(state, None, oauth_email, ip_address).await?;
            return Err(AppError::InvalidCredentials);
        }
    };
    let verification_required = state
        .settings_service
        .email_verification_required(state.config.email.require_verification)
        .await?;
    if verification_required && !user.email_verified {
        return Err(AppError::InvalidCredentials);
    }
    let _ = state
        .login_attempt_repo
        .clear_failed_attempts(oauth_email)
        .await;
    if state.totp_repo.has_mfa_enabled(user.id).await? {
        return Err(AppError::StepUpRequired);
    }
    Ok(user)
}

async fn require_not_locked<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    oauth_email: &str,
) -> Result<(), AppError> {
    let status = state
        .login_attempt_repo
        .get_lockout_status(oauth_email, &state.login_attempt_config)
        .await?;
    if !status.is_locked {
        return Ok(());
    }
    let remaining_mins = status
        .lockout_remaining_secs
        .map(|s| (s + 59) / 60)
        .unwrap_or(0);
    Err(AppError::AccountLocked(format!(
        "Too many failed attempts. Try again in {} minute{}",
        remaining_mins,
        if remaining_mins == 1 { "" } else { "s" }
    )))
}

async fn verify_link_password<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    user: UserEntity,
    oauth_email: &str,
    password: &str,
    ip_address: Option<&str>,
) -> Result<UserEntity, AppError> {
    let Some(hash) = user.password_hash.as_ref() else {
        state
            .password_service
            .verify_dummy(password.to_string())
            .await?;
        record_link_failure(state, Some(user.id), oauth_email, ip_address).await?;
        return Err(AppError::InvalidCredentials);
    };
    if state
        .password_service
        .verify(password.to_string(), hash.clone())
        .await?
    {
        return Ok(user);
    }
    let status = record_link_failure(state, Some(user.id), oauth_email, ip_address).await?;
    if status.failed_attempts == state.login_attempt_config.max_attempts {
        let _ = state
            .comms_service
            .notify_login_threshold(oauth_email, status.failed_attempts, ip_address)
            .await;
    }
    Err(AppError::InvalidCredentials)
}

async fn record_link_failure<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    user_id: Option<Uuid>,
    oauth_email: &str,
    ip_address: Option<&str>,
) -> Result<crate::repositories::LockoutStatus, AppError> {
    state
        .login_attempt_repo
        .record_failed_attempt_atomic(
            user_id,
            oauth_email,
            ip_address,
            &state.login_attempt_config,
        )
        .await
}

async fn link_verified_oauth_to_user<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    user: UserEntity,
    auth_method: AuthMethod,
    oauth_sub: String,
) -> Result<UserEntity, AppError> {
    let conflict = match auth_method {
        AuthMethod::Google => state.user_repo.find_by_google_id(&oauth_sub).await?,
        AuthMethod::Apple => state.user_repo.find_by_apple_id(&oauth_sub).await?,
        _ => None,
    };
    if let Some(other) = conflict {
        if other.id != user.id {
            return Err(AppError::OAuthAccountExists);
        }
    }

    let user_revision = user.updated_at;
    let mut updated = user;
    let now = Utc::now();
    updated.updated_at = now;
    updated.last_login_at = Some(now);
    match auth_method {
        AuthMethod::Google => {
            if updated
                .google_id
                .as_deref()
                .is_some_and(|existing| existing != oauth_sub)
            {
                return Err(AppError::OAuthAccountExists);
            }
            updated.google_id = Some(oauth_sub);
        }
        AuthMethod::Apple => {
            if updated
                .apple_id
                .as_deref()
                .is_some_and(|existing| existing != oauth_sub)
            {
                return Err(AppError::OAuthAccountExists);
            }
            updated.apple_id = Some(oauth_sub);
        }
        _ => unreachable!(),
    }
    if !updated.auth_methods.contains(&auth_method) {
        updated.auth_methods.push(auth_method);
    }
    state
        .user_repo
        .update_if_current(updated, user_revision)
        .await
}

fn validate_apple_link_nonce(
    client_nonce: &str,
    token_nonce: Option<&str>,
) -> Result<(), AppError> {
    let Some(token_nonce) = token_nonce else {
        tracing::warn!("Apple link nonce missing from token");
        return Err(AppError::InvalidToken);
    };

    let expected_hash = hex::encode(sha2::Sha256::digest(client_nonce.as_bytes()));
    if token_nonce == expected_hash {
        Ok(())
    } else {
        tracing::warn!("Apple link nonce mismatch");
        Err(AppError::InvalidToken)
    }
}

/// Resolve Google client_id from runtime settings or static config.
async fn resolve_google_client_id<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
) -> Result<String, AppError> {
    state
        .settings_service
        .get("auth_google_client_id")
        .await
        .ok()
        .flatten()
        .filter(|s| !s.is_empty())
        .or_else(|| state.config.google.client_id.clone())
        .ok_or_else(|| AppError::Config("Google client ID not configured".into()))
}

#[cfg(test)]
#[path = "link_oauth_tests.rs"]
mod link_oauth_tests;
