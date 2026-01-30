//! Delete organization handler

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::{AuditEventType, OrgRole};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// DELETE /orgs/:org_id - Delete organization
pub async fn delete_org<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
) -> Result<Json<MessageResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Check membership - only owner can delete
    let membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    if membership.role != OrgRole::Owner {
        return Err(AppError::Forbidden(
            "Only the owner can delete an organization".into(),
        ));
    }

    // Get organization
    let org = state
        .org_repo
        .find_by_id(org_id)
        .await?
        .ok_or(AppError::NotFound("Organization not found".into()))?;

    // H-02: Verify user is the actual owner (owner_id), not just any promoted Owner
    if org.owner_id != auth.user_id {
        return Err(AppError::Forbidden(
            "Only the organization creator can delete it".into(),
        ));
    }

    // Cannot delete personal organization
    if org.is_personal {
        return Err(AppError::Validation(
            "Cannot delete personal organization".into(),
        ));
    }

    // H-11: Log audit event before deletion (so org_id is still valid for logging)
    let _ = state
        .audit_service
        .log_org_event(
            AuditEventType::OrgDeleted,
            auth.user_id,
            org_id,
            Some(&headers),
        )
        .await;

    if state.config.database.url.is_none() {
        // In-memory storage doesn't enforce FK cascades.
        state.invite_repo.delete_by_org(org_id).await?;
        state.membership_repo.delete_by_org(org_id).await?;
        state.custom_role_repo.delete_by_org(org_id).await?;
        state.policy_repo.delete_by_org(org_id).await?;
        state.audit_repo.delete_by_org(org_id).await?;
        state.outbox_repo.delete_by_org(org_id).await?;
    }

    // Delete the organization
    state.org_repo.delete(org_id).await?;

    Ok(Json(MessageResponse {
        message: "Organization deleted successfully".to_string(),
    }))
}
