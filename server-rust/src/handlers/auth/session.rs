//! Session management handlers (logout, get user)
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
use std::sync::Arc;

use super::call_logout_callback_with_timeout;
use crate::callback::AuthCallback;
use crate::errors::AppError;
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
                let _ = state
                    .audit_service
                    .log_user_event(AuditEventType::UserLogout, claims.sub, Some(&headers))
                    .await;
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
                // Revoke ALL sessions for user
                state
                    .session_repo
                    .revoke_all_for_user_with_reason(claims.sub, "logout_all")
                    .await?;

                // Fire callback
                call_logout_callback_with_timeout(&state.callback, &claims.sub.to_string()).await;

                // Log audit event
                let _ = state
                    .audit_service
                    .log_user_event(AuditEventType::UserLogoutAll, claims.sub, Some(&headers))
                    .await;
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
