//! Admin organization handlers

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::{AppError, ERR_SYSTEM_ADMIN_REQUIRED};
use crate::models::{AdminOrgResponse, ListAdminOrgsResponse, ListOrgsQueryParams};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// Validate system admin access
async fn validate_system_admin<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
) -> Result<Uuid, AppError> {
    // Authenticate via JWT or API key
    let auth_user = authenticate(state, headers).await?;

    let user = state
        .user_repo
        .find_by_id(auth_user.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    if !user.is_system_admin {
        return Err(AppError::Forbidden(ERR_SYSTEM_ADMIN_REQUIRED.into()));
    }

    Ok(auth_user.user_id)
}

/// GET /admin/orgs - List all organizations
///
/// Requires system admin privileges.
pub async fn list_orgs<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<ListOrgsQueryParams>,
) -> Result<Json<ListAdminOrgsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let orgs = state.org_repo.list_all(params.limit, params.offset).await?;
    let total = state.org_repo.count().await?;

    let org_responses: Vec<AdminOrgResponse> = orgs.iter().map(AdminOrgResponse::from).collect();

    Ok(Json(ListAdminOrgsResponse {
        orgs: org_responses,
        total,
        limit: params.limit,
        offset: params.offset,
    }))
}

/// GET /admin/orgs/:org_id - Get a specific organization
///
/// Requires system admin privileges.
pub async fn get_org<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
) -> Result<Json<AdminOrgResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let org = state
        .org_repo
        .find_by_id(org_id)
        .await?
        .ok_or(AppError::NotFound("Organization not found".into()))?;

    Ok(Json(AdminOrgResponse::from(&org)))
}
