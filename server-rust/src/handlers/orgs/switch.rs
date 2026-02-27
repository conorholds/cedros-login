//! Switch active organization handler

use axum::{
    extract::{Path, State},
    http::{header, HeaderMap},
    response::IntoResponse,
};
use chrono::{Duration, Utc};
use serde::Serialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::TokenPair;
use crate::repositories::SessionEntity;
use crate::services::{EmailService, TokenContext};
use crate::utils::{
    build_json_response_with_cookies, extract_access_token, extract_client_ip_with_fallback,
    hash_refresh_token, PeerIp,
};
use crate::AppState;

/// Response for switching organizations
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SwitchOrgResponse {
    pub org_id: Uuid,
    pub role: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tokens: Option<TokenPair>,
}

/// POST /orgs/:org_id/switch - Switch active organization
///
/// Switches the user's active organization and issues new tokens with the updated org_id and role.
///
/// # Security (SEC-03)
///
/// This handler implements session rotation to prevent session fixation attacks:
/// 1. A NEW session ID is always generated for the switched organization context
/// 2. The old session is revoked after the new session is confirmed created
/// 3. Compensation logic handles partial failures (H-02):
///    - If old session revoke fails, the new session is also revoked
///    - This prevents duplicate active sessions
///
/// The create-then-revoke ordering ensures users aren't logged out on failure.
pub async fn switch_org<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Path(org_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    // Extract and validate token
    let token = extract_access_token(&headers, &state.config.cookie.access_cookie_name)
        .ok_or(AppError::InvalidToken)?;
    let claims = state.jwt_service.validate_access_token(&token)?;

    // Verify current session
    let session = state
        .session_repo
        .find_by_id(claims.sid)
        .await?
        .ok_or(AppError::InvalidToken)?;
    if session.user_id != claims.sub || !session.is_valid() {
        return Err(AppError::InvalidToken);
    }

    // Check membership in the target org
    let membership = state
        .membership_repo
        .find_by_user_and_org(claims.sub, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    // Fetch user for is_system_admin flag
    let user = state
        .user_repo
        .find_by_id(claims.sub)
        .await?
        .ok_or(AppError::InvalidToken)?;

    // Create new session with updated org context BEFORE revoking old session
    // This prevents the user from being logged out if session creation fails
    let new_session_id = Uuid::new_v4();
    let token_context = TokenContext {
        org_id: Some(org_id),
        role: Some(membership.role.as_str().to_string()),
        is_system_admin: if user.is_system_admin {
            Some(true)
        } else {
            None
        },
        email_verified: Some(user.email_verified),
    };
    let token_pair = state.jwt_service.generate_token_pair_with_context(
        claims.sub,
        new_session_id,
        &token_context,
    )?;

    let refresh_expiry =
        Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);

    let ip_address =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);
    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let new_session = SessionEntity::new_with_id(
        new_session_id,
        claims.sub,
        hash_refresh_token(&token_pair.refresh_token, &state.config.jwt.secret),
        refresh_expiry,
        ip_address,
        user_agent,
    );
    state.session_repo.create(new_session).await?;

    // H-02: Only revoke old session after new one is confirmed created.
    // If revoke fails, compensate by revoking the new session to prevent duplicate active sessions.
    if let Err(revoke_err) = state
        .session_repo
        .revoke_with_reason(claims.sid, "org_switch")
        .await
    {
        // Compensating transaction: revoke the new session we just created
        if let Err(cleanup_err) = state
            .session_repo
            .revoke_with_reason(new_session_id, "org_switch_cleanup")
            .await
        {
            // Log critical error: both revokes failed, user may have duplicate sessions
            tracing::error!(
                user_id = %claims.sub,
                old_session_id = %claims.sid,
                new_session_id = %new_session_id,
                revoke_error = %revoke_err,
                cleanup_error = %cleanup_err,
                "H-02 CRITICAL: Failed to revoke old session AND cleanup new session during org switch"
            );
        } else {
            tracing::warn!(
                user_id = %claims.sub,
                old_session_id = %claims.sid,
                new_session_id = %new_session_id,
                revoke_error = %revoke_err,
                "H-02: Failed to revoke old session during org switch, cleaned up new session"
            );
        }
        return Err(revoke_err);
    }

    let response_tokens = if state.config.cookie.enabled {
        None
    } else {
        Some(token_pair.clone())
    };

    let response = SwitchOrgResponse {
        org_id,
        role: membership.role.as_str().to_string(),
        tokens: response_tokens,
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}
