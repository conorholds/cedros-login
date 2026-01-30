//! Update organization handler

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{OrgResponse, UpdateOrgRequest};
use crate::repositories::OrgRole;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// PATCH /orgs/:org_id - Update organization
pub async fn update_org<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
    Json(req): Json<UpdateOrgRequest>,
) -> Result<Json<OrgResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Check membership - must be owner or admin to update
    let membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    if !membership.role.has_at_least(OrgRole::Admin) {
        return Err(AppError::Forbidden(
            "Only owners and admins can update organization settings".into(),
        ));
    }

    // Get current organization
    let mut org = state
        .org_repo
        .find_by_id(org_id)
        .await?
        .ok_or(AppError::NotFound("Organization not found".into()))?;

    // Update fields if provided
    if let Some(name) = req.name {
        let name = name.trim();
        if name.is_empty() || name.len() > 255 {
            return Err(AppError::Validation(
                "Organization name must be 1-255 characters".into(),
            ));
        }
        org.name = name.to_string();
    }

    if let Some(slug) = req.slug {
        let slug = slug.trim().to_lowercase();
        if slug.is_empty() || slug.len() > 100 {
            return Err(AppError::Validation("Slug must be 1-100 characters".into()));
        }
        if !slug.chars().all(|c| c.is_alphanumeric() || c == '-') {
            return Err(AppError::Validation(
                "Slug can only contain letters, numbers, and hyphens".into(),
            ));
        }
        // Check if new slug exists (excluding current org)
        if slug != org.slug && state.org_repo.slug_exists(&slug).await? {
            return Err(AppError::Validation(
                "Organization slug already exists".into(),
            ));
        }
        org.slug = slug;
    }

    if let Some(logo_url) = req.logo_url {
        org.logo_url = if logo_url.is_empty() {
            None
        } else {
            Some(logo_url)
        };
    }

    // Save updates
    let updated = state.org_repo.update(org).await?;

    Ok(Json(OrgResponse::from_entity(&updated, membership.role)))
}
