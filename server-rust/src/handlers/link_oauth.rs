//! OAuth account linking handler
//!
//! Links a Google or Apple OAuth account to an existing email/password user
//! after verifying ownership via password proof.

use axum::{extract::State, http::HeaderMap, response::IntoResponse, Json};
use chrono::{Duration, Utc};
use std::sync::Arc;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::handlers::auth::call_authenticated_callback_with_timeout;
use crate::models::{AuthMethod, AuthResponse, LinkOAuthRequest};
use crate::repositories::{normalize_email, AuditEventType, SessionEntity};
use crate::services::{
    exchange_and_encrypt_refresh_token, sync_apple_credential,
    verify_apple_id_token_for_allowed_clients, EmailService,
};
use crate::utils::{
    build_json_response_with_cookies, compute_post_login, extract_client_ip_with_fallback,
    get_default_org_context, hash_refresh_token, user_entity_to_auth_user, PeerIp,
};
use crate::AppState;

/// POST /auth/link-oauth — Link an OAuth provider to an existing account.
///
/// Requires password proof to prevent account takeover. The OAuth id_token
/// is re-verified server-side.
pub async fn link_oauth<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<LinkOAuthRequest>,
) -> Result<impl IntoResponse, AppError> {
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
                        .verify_access_token(access_token)
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
            let verified = verify_apple_id_token_for_allowed_clients(
                &state.apple_service,
                &state.settings_service,
                &state.config.apple,
                id_token,
            )
            .await?;
            let claims = verified.claims;
            let client_id = verified.client_id;
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

    // Look up user by email from the verified token
    let user = state.user_repo.find_by_email(&oauth_email).await?;

    // Timing-safe password verification
    let user = match user {
        None => {
            state
                .password_service
                .verify_dummy(req.password.clone())
                .await;
            return Err(AppError::InvalidCredentials);
        }
        Some(u) => match &u.password_hash {
            None => {
                state
                    .password_service
                    .verify_dummy(req.password.clone())
                    .await;
                return Err(AppError::InvalidCredentials);
            }
            Some(hash) => {
                if !state
                    .password_service
                    .verify(req.password.clone(), hash.clone())
                    .await?
                {
                    return Err(AppError::InvalidCredentials);
                }
                u
            }
        },
    };

    // Check OAuth sub isn't already linked to a *different* user
    let conflict = match auth_method {
        AuthMethod::Google => state.user_repo.find_by_google_id(&oauth_sub).await?,
        AuthMethod::Apple => state.user_repo.find_by_apple_id(&oauth_sub).await?,
        _ => None,
    };
    if let Some(other) = conflict {
        if other.id != user.id {
            return Err(AppError::Validation(
                "OAuth account already linked to another user".into(),
            ));
        }
        // Same user already linked — treat as idempotent login below.
    }

    // Link the OAuth provider to the user
    let mut updated = user.clone();
    let now = Utc::now();
    updated.updated_at = now;
    updated.last_login_at = Some(now);

    match auth_method {
        AuthMethod::Google => {
            updated.google_id = Some(oauth_sub);
            if !updated.auth_methods.contains(&AuthMethod::Google) {
                updated.auth_methods.push(AuthMethod::Google);
            }
        }
        AuthMethod::Apple => {
            updated.apple_id = Some(oauth_sub);
            if !updated.auth_methods.contains(&AuthMethod::Apple) {
                updated.auth_methods.push(AuthMethod::Apple);
            }
        }
        _ => unreachable!(),
    }

    let user = state.user_repo.update(updated).await?;

    if let Some((refresh_token, client_id)) = apple_refresh_token {
        sync_apple_credential(
            state.credential_repo.as_ref(),
            user.id,
            refresh_token,
            &client_id,
        )
        .await?;
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
    state.session_repo.create(session).await?;

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
        post_login: compute_post_login(
            &user,
            &state.settings_service,
            &*state.totp_repo,
            &*state.credential_repo,
            &*state.wallet_material_repo,
            &*state.storage.pending_wallet_recovery_repo,
        )
        .await,
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
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
