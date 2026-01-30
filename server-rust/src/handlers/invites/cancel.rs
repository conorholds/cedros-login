//! Cancel invite handler

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

/// DELETE /orgs/:org_id/invites/:invite_id - Cancel an invite
pub async fn cancel_invite<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path((org_id, invite_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<MessageResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Check caller's membership - must be admin+ to cancel invites
    let caller_membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    if !caller_membership.role.has_at_least(OrgRole::Admin) {
        return Err(AppError::Forbidden(
            "Only owners and admins can cancel invites".into(),
        ));
    }

    // Find the invite
    let invite = state
        .invite_repo
        .find_by_id(invite_id)
        .await?
        .ok_or(AppError::NotFound("Invite not found".into()))?;

    // Verify invite belongs to this org
    if invite.org_id != org_id {
        return Err(AppError::NotFound("Invite not found".into()));
    }

    // Can't cancel already accepted invite
    if invite.accepted_at.is_some() {
        return Err(AppError::Validation(
            "Invite has already been accepted".into(),
        ));
    }

    // Delete the invite
    state.invite_repo.delete(invite_id).await?;

    Ok(Json(MessageResponse {
        message: "Invite canceled successfully".to_string(),
    }))
}
