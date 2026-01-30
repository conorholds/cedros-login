//! Remove member handler

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
use crate::repositories::OrgRole;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// DELETE /orgs/:org_id/members/:user_id - Remove a member from organization
pub async fn remove_member<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path((org_id, user_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<MessageResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Check caller's membership
    let caller_membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    // Users can remove themselves (leave org), but not from personal org
    let is_self = user_id == auth.user_id;

    // Check if target is in the org
    let target_membership = state
        .membership_repo
        .find_by_user_and_org(user_id, org_id)
        .await?
        .ok_or(AppError::NotFound("Member not found".into()))?;

    // Get org to check if personal
    let org = state
        .org_repo
        .find_by_id(org_id)
        .await?
        .ok_or(AppError::NotFound("Organization not found".into()))?;

    // Can't leave personal organization
    if org.is_personal && is_self {
        return Err(AppError::Validation(
            "Cannot leave your personal organization".into(),
        ));
    }

    // Permission checks
    if !is_self {
        // Need admin+ permission to remove others
        if !caller_membership.role.has_at_least(OrgRole::Admin) {
            return Err(AppError::Forbidden(
                "Only owners and admins can remove members".into(),
            ));
        }

        // Only owners can remove other owners
        if target_membership.role == OrgRole::Owner && caller_membership.role != OrgRole::Owner {
            return Err(AppError::Forbidden(
                "Only owners can remove other owners".into(),
            ));
        }
    }

    // TOCTOU-02: Use atomic delete that checks owner count in the same operation
    // This prevents race conditions where concurrent removals could leave an org ownerless
    let deleted = state
        .membership_repo
        .delete_if_not_last_owner(target_membership.id, org_id)
        .await?;

    if !deleted {
        return Err(AppError::Validation(
            "Cannot remove the last owner of an organization".into(),
        ));
    }

    let message = if is_self {
        "Left organization successfully".to_string()
    } else {
        "Member removed successfully".to_string()
    };

    Ok(Json(MessageResponse { message }))
}
