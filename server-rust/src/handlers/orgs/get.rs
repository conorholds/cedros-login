//! Get organization handler

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::OrgResponse;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// GET /orgs/:org_id - Get organization details
pub async fn get_org<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
) -> Result<Json<OrgResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Check membership - user must be a member of the org to view it
    let membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    // Get organization
    let org = state
        .org_repo
        .find_by_id(org_id)
        .await?
        .ok_or(AppError::NotFound("Organization not found".into()))?;

    Ok(Json(OrgResponse::from_entity(&org, membership.role)))
}
