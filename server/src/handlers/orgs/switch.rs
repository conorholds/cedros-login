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
    authenticate_session, build_json_response_with_cookies, extract_client_ip_with_fallback,
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
/// The source and replacement are changed atomically, sharing one revocable
/// session family. Concurrent logout cannot leave a switched session alive.
pub async fn switch_org<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Path(org_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let auth = authenticate_session(&state, &headers).await?;
    let session_id = auth.session_id.ok_or(AppError::InvalidToken)?;
    let session = state
        .session_repo
        .find_by_id(session_id)
        .await?
        .ok_or(AppError::InvalidToken)?;
    state
        .org_repo
        .find_by_id(org_id)
        .await?
        .ok_or(AppError::Forbidden("Organization unavailable".into()))?;

    // Check membership in the target org
    let membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    // Fetch user for is_system_admin flag
    let user = state
        .user_repo
        .find_by_id(auth.user_id)
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
        auth.user_id,
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
        auth.user_id,
        hash_refresh_token(&token_pair.refresh_token, &state.config.jwt.secret),
        refresh_expiry,
        ip_address,
        user_agent,
    );
    if !state
        .session_repo
        .rotate(&session, new_session, "org_switch")
        .await?
    {
        return Err(AppError::InvalidToken);
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
