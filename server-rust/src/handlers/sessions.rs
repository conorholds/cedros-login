//! Session management handlers

use axum::{
    extract::{Query, State},
    http::HeaderMap,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{ListSessionsResponse, RevokeAllSessionsResponse, SessionResponse};
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::services::EmailService;
use crate::utils::extract_access_token;
use crate::AppState;

/// GET /auth/sessions - List all active sessions for the current user
pub async fn list_sessions<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<ListSessionsQueryParams>,
) -> Result<Json<ListSessionsResponse>, AppError> {
    // Extract and validate token
    let token = extract_access_token(&headers, &state.config.cookie.access_cookie_name)
        .ok_or(AppError::InvalidToken)?;
    let claims = state.jwt_service.validate_access_token(&token)?;

    // Verify current session
    let current_session = state
        .session_repo
        .find_by_id(claims.sid)
        .await?
        .ok_or(AppError::InvalidToken)?;
    if current_session.user_id != claims.sub || !current_session.is_valid() {
        return Err(AppError::InvalidToken);
    }

    let limit = cap_limit(params.limit);
    let offset = cap_offset(params.offset);
    let sessions = state
        .session_repo
        .find_active_by_user_id_paged(claims.sub, limit, offset)
        .await?;
    let total = state
        .session_repo
        .count_active_by_user_id(claims.sub)
        .await? as usize;
    let active_sessions: Vec<SessionResponse> = sessions
        .iter()
        .map(|s| SessionResponse::from_entity(s, claims.sid))
        .collect();

    Ok(Json(ListSessionsResponse {
        sessions: active_sessions,
        total,
        limit,
        offset,
    }))
}

/// DELETE /auth/sessions - Revoke all sessions except the current one
pub async fn revoke_all_sessions<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<RevokeAllSessionsResponse>, AppError> {
    // Extract and validate token
    let token = extract_access_token(&headers, &state.config.cookie.access_cookie_name)
        .ok_or(AppError::InvalidToken)?;
    let claims = state.jwt_service.validate_access_token(&token)?;

    // Verify current session
    let current_session = state
        .session_repo
        .find_by_id(claims.sid)
        .await?
        .ok_or(AppError::InvalidToken)?;
    if current_session.user_id != claims.sub || !current_session.is_valid() {
        return Err(AppError::InvalidToken);
    }

    let revoked_count = state
        .session_repo
        .revoke_all_except(claims.sub, claims.sid)
        .await? as usize;

    Ok(Json(RevokeAllSessionsResponse {
        revoked_count,
        message: format!(
            "Successfully revoked {} other session{}",
            revoked_count,
            if revoked_count == 1 { "" } else { "s" }
        ),
    }))
}

#[derive(Debug, Deserialize)]
pub struct ListSessionsQueryParams {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    50
}
