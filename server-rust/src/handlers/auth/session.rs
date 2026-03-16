//! Session management handlers (logout, get user, update profile)
//!
//! # M-02: Granular Logout Design
//!
//! Two logout endpoints are provided:
//! - `/logout` - Revokes only the CURRENT session (better UX for multi-device users)
//! - `/logout-all` - Revokes ALL sessions (for credential compromise scenarios)
//!
//! Users can use `/logout-all` when they suspect credential compromise and need to
//! immediately invalidate all active sessions across all devices.

use axum::{
    extract::State,
    http::{header, HeaderMap, HeaderValue},
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;

use super::call_logout_callback_with_timeout;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use axum::http::StatusCode;
use crate::models::{MessageResponse, UserResponse};
use crate::repositories::AuditEventType;
use crate::services::EmailService;
use crate::utils::{
    authenticate, build_logout_cookies, extract_access_token, extract_cookie, hash_refresh_token,
    user_entity_to_auth_user,
};
use crate::AppState;

/// POST /auth/logout - Logout current session only
///
/// M-02: Revokes only the current session, preserving other active sessions.
/// Use `/logout-all` to revoke all sessions at once.
pub async fn logout<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    // Extract token from Authorization header or cookie
    let token = extract_access_token(&headers, &state.config.cookie.access_cookie_name);

    // Validate token if present. If token is missing/invalid and cookies are enabled,
    // we still allow logout so stale cookies can be cleared.
    let claims = token.and_then(|token| state.jwt_service.validate_access_token(&token).ok());
    if claims.is_none() && !state.config.cookie.enabled {
        return Err(AppError::InvalidToken);
    }

    if let Some(claims) = claims {
        // NEW-06: Session lookup may return None if session was already revoked elsewhere.
        // This is acceptable idempotent behavior - logout succeeds regardless.
        // Only when session exists do we verify ownership before revoking.
        if let Some(session) = state.session_repo.find_by_id(claims.sid).await? {
            if session.user_id == claims.sub {
                // M-02: Revoke only the current session (not all sessions)
                state
                    .session_repo
                    .revoke_with_reason(claims.sid, "logout")
                    .await?;

                // Fire callback
                call_logout_callback_with_timeout(&state.callback, &claims.sub.to_string()).await;

                // Log audit event (fire-and-forget, don't fail logout on audit error)
                if let Err(e) = state
                    .audit_service
                    .log_user_event(AuditEventType::UserLogout, claims.sub, Some(&headers))
                    .await
                {
                    tracing::warn!(error = %e, user_id = %claims.sub, "Failed to log user logout audit event");
                }
            }
        }
    } else if state.config.cookie.enabled {
        // HANDLER-06: Cookie fallback path - revoke session but skip callback/audit.
        // Without valid JWT claims, we can't reliably identify user for callback.
        // This asymmetry is intentional: security (revocation) > observability (callback).
        if let Some(refresh_token) =
            extract_cookie(&headers, &state.config.cookie.refresh_cookie_name)
        {
            if let Some(session) = state
                .session_repo
                .find_by_refresh_token(&hash_refresh_token(
                    &refresh_token,
                    &state.config.jwt.secret,
                ))
                .await?
            {
                // M-02: Revoke only this session
                state
                    .session_repo
                    .revoke_with_reason(session.id, "logout")
                    .await?;
            }
        }
    }

    // Build response with cookie deletion if cookies enabled
    let message = MessageResponse {
        message: "Logged out successfully".to_string(),
    };

    if state.config.cookie.enabled {
        let cookies = build_logout_cookies(&state.config.cookie);
        let mut resp = Json(message).into_response();
        let headers_mut = resp.headers_mut();
        for cookie in cookies {
            if let Ok(value) = HeaderValue::from_str(&cookie) {
                headers_mut.append(header::SET_COOKIE, value);
            }
        }
        Ok(resp)
    } else {
        Ok(Json(message).into_response())
    }
}

/// POST /auth/logout-all - Logout all sessions for the user
///
/// M-02: Revokes ALL sessions for the user. Use this when:
/// - Credential compromise is suspected
/// - User wants to sign out from all devices
/// - Security incident response
pub async fn logout_all<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    // Extract token from Authorization header or cookie
    let token = extract_access_token(&headers, &state.config.cookie.access_cookie_name);

    // Validate token if present. If token is missing/invalid and cookies are enabled,
    // we still allow logout so stale cookies can be cleared.
    let claims = token.and_then(|token| state.jwt_service.validate_access_token(&token).ok());
    if claims.is_none() && !state.config.cookie.enabled {
        return Err(AppError::InvalidToken);
    }

    if let Some(claims) = claims {
        if let Some(session) = state.session_repo.find_by_id(claims.sid).await? {
            if session.user_id == claims.sub {
                // 4.1: Ownership is implicit via the DB: `claims.sub` comes from the
                // validated JWT, and we verify the session's `user_id` matches `sub`
                // above. A user can only revoke their own sessions.
                state
                    .session_repo
                    .revoke_all_for_user_with_reason(claims.sub, "logout_all")
                    .await?;

                // Fire callback
                call_logout_callback_with_timeout(&state.callback, &claims.sub.to_string()).await;

                // Log audit event
                if let Err(e) = state
                    .audit_service
                    .log_user_event(AuditEventType::UserLogoutAll, claims.sub, Some(&headers))
                    .await
                {
                    tracing::warn!(error = %e, user_id = %claims.sub, "Failed to log user logout-all audit event");
                }
            }
        }
    } else if state.config.cookie.enabled {
        // HANDLER-06: Same asymmetry as logout - see comment there
        if let Some(refresh_token) =
            extract_cookie(&headers, &state.config.cookie.refresh_cookie_name)
        {
            if let Some(session) = state
                .session_repo
                .find_by_refresh_token(&hash_refresh_token(
                    &refresh_token,
                    &state.config.jwt.secret,
                ))
                .await?
            {
                state
                    .session_repo
                    .revoke_all_for_user_with_reason(session.user_id, "logout_all")
                    .await?;
            }
        }
    }

    // Build response with cookie deletion if cookies enabled
    let message = MessageResponse {
        message: "Logged out from all devices successfully".to_string(),
    };

    if state.config.cookie.enabled {
        let cookies = build_logout_cookies(&state.config.cookie);
        let mut resp = Json(message).into_response();
        let headers_mut = resp.headers_mut();
        for cookie in cookies {
            if let Ok(value) = HeaderValue::from_str(&cookie) {
                headers_mut.append(header::SET_COOKIE, value);
            }
        }
        Ok(resp)
    } else {
        Ok(Json(message).into_response())
    }
}

/// GET /auth/user - Get current user
pub async fn get_user<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Get user
    let user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    Ok(Json(UserResponse {
        user: user_entity_to_auth_user(&user),
    }))
}

/// Request to update user profile
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProfileRequest {
    /// User's display name
    pub name: Option<String>,
    /// Unique handle-style username (3-30 chars, lowercase alphanumeric + underscores)
    pub username: Option<String>,
    /// User's profile picture URL
    pub picture: Option<String>,
    /// Solana wallet address for direct referral payouts (pass empty string to clear)
    pub payout_wallet_address: Option<String>,
}

/// PATCH /auth/me - Update current user's profile
///
/// Allows users to update their name and profile picture.
pub async fn update_profile<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<UpdateProfileRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Get current user
    let mut user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    // Update fields if provided
    if let Some(name) = req.name {
        // Validate name length
        let trimmed = name.trim();
        if trimmed.is_empty() {
            return Err(AppError::Validation("Name cannot be empty".into()));
        }
        if trimmed.len() > 100 {
            return Err(AppError::Validation(
                "Name must be 100 characters or less".into(),
            ));
        }
        user.name = Some(trimmed.to_string());
    }

    if let Some(username) = req.username {
        let trimmed = username.trim().to_lowercase();
        validate_username(&trimmed)?;
        // Check uniqueness
        if state.user_repo.username_exists(&trimmed).await? {
            return Err(AppError::Validation("Username is already taken".into()));
        }
        user.username = Some(trimmed);
    }

    if let Some(picture) = req.picture {
        // Validate picture URL (basic check)
        let trimmed = picture.trim();
        if !trimmed.is_empty() {
            if !trimmed.starts_with("https://") && !trimmed.starts_with("http://") {
                return Err(AppError::Validation("Picture must be a valid URL".into()));
            }
            if trimmed.len() > 2048 {
                return Err(AppError::Validation(
                    "Picture URL must be 2048 characters or less".into(),
                ));
            }
            user.picture = Some(trimmed.to_string());
        } else {
            // Empty string clears the picture
            user.picture = None;
        }
    }

    // Handle payout wallet address (set via dedicated repo method, not general update)
    if let Some(payout_addr) = req.payout_wallet_address {
        let trimmed = payout_addr.trim();
        let addr_opt = if trimmed.is_empty() {
            None
        } else {
            // Basic Solana address validation: 32-44 base58 chars
            if trimmed.len() < 32 || trimmed.len() > 44 {
                return Err(AppError::Validation(
                    "Payout wallet address must be a valid Solana address (32-44 characters)".into(),
                ));
            }
            // Validate base58 character set (no 0, O, I, l)
            if !trimmed.chars().all(|c| matches!(c,
                '1'..='9' | 'A'..='H' | 'J'..='N' | 'P'..='Z' | 'a'..='k' | 'm'..='z'
            )) {
                return Err(AppError::Validation(
                    "Payout wallet address contains invalid characters (must be base58)".into(),
                ));
            }
            Some(trimmed)
        };
        state
            .user_repo
            .set_payout_wallet_address(auth.user_id, addr_opt)
            .await?;
        // Sync in-memory entity so the response reflects the new value
        user.payout_wallet_address = addr_opt.map(|a| a.to_string());
    }

    // Save updated user
    let updated_user = state.user_repo.update(user).await?;

    // Log audit event
    let _ = state
        .audit_service
        .log_user_event(
            AuditEventType::UserProfileUpdated,
            auth.user_id,
            Some(&headers),
        )
        .await;

    Ok(Json(UserResponse {
        user: user_entity_to_auth_user(&updated_user),
    }))
}

/// Reserved usernames that cannot be claimed
const RESERVED_USERNAMES: &[&str] = &[
    "admin", "system", "support", "help", "root", "moderator", "mod", "staff", "cedros",
];

/// Validate a username: 3-30 chars, lowercase alphanumeric + underscores,
/// no leading/trailing underscores, not reserved.
fn validate_username(username: &str) -> Result<(), AppError> {
    if username.len() < 3 {
        return Err(AppError::Validation(
            "Username must be at least 3 characters".into(),
        ));
    }
    if username.len() > 30 {
        return Err(AppError::Validation(
            "Username must be 30 characters or less".into(),
        ));
    }
    if !username
        .chars()
        .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_')
    {
        return Err(AppError::Validation(
            "Username may only contain lowercase letters, numbers, and underscores".into(),
        ));
    }
    if username.starts_with('_') || username.ends_with('_') {
        return Err(AppError::Validation(
            "Username cannot start or end with an underscore".into(),
        ));
    }
    if RESERVED_USERNAMES.contains(&username) {
        return Err(AppError::Validation("This username is reserved".into()));
    }
    Ok(())
}

/// POST /auth/welcome-completed - Mark the welcome flow as completed
///
/// Sets `welcome_completed_at` on the current user so the one-time welcome
/// page is not shown again on subsequent logins. Returns 204 No Content.
pub async fn welcome_completed<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    let auth = authenticate(&state, &headers).await?;

    state
        .user_repo
        .set_welcome_completed(auth.user_id)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
