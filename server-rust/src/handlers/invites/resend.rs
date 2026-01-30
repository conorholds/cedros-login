//! Resend invite handler

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{InviteResponse, InviteWithTokenResponse};
use crate::repositories::{
    default_invite_expiry, generate_invite_token, hash_invite_token, InviteEntity, OrgRole,
};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// POST /orgs/:org_id/invites/:invite_id/resend - Resend an invite
pub async fn resend_invite<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path((org_id, invite_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<InviteWithTokenResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Check caller's membership - must be admin+ to resend invites
    let caller_membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    if !caller_membership.role.has_at_least(OrgRole::Admin) {
        return Err(AppError::Forbidden(
            "Only owners and admins can resend invites".into(),
        ));
    }

    // Find the invite
    let old_invite = state
        .invite_repo
        .find_by_id(invite_id)
        .await?
        .ok_or(AppError::NotFound("Invite not found".into()))?;

    // Verify invite belongs to this org
    if old_invite.org_id != org_id {
        return Err(AppError::NotFound("Invite not found".into()));
    }

    // Can't resend already accepted invite
    if old_invite.accepted_at.is_some() {
        return Err(AppError::Validation(
            "Invite has already been accepted".into(),
        ));
    }

    // Delete the old invite
    state.invite_repo.delete(invite_id).await?;

    // Generate new invite token
    let invite_token = generate_invite_token();
    let token_hash = hash_invite_token(&invite_token);

    // Create new invite with fresh expiry
    let new_invite = InviteEntity {
        id: Uuid::new_v4(),
        org_id,
        email: old_invite.email,
        role: old_invite.role,
        token_hash,
        invited_by: auth.user_id, // Update to current user
        created_at: chrono::Utc::now(),
        expires_at: default_invite_expiry(),
        accepted_at: None,
    };

    let created = state.invite_repo.create(new_invite).await?;

    // Get org name for email
    let org = state
        .org_repo
        .find_by_id(org_id)
        .await?
        .ok_or(AppError::NotFound("Organization not found".into()))?;

    // Get inviter's name for email
    let inviter = state.user_repo.find_by_id(auth.user_id).await?;
    let inviter_name = inviter.and_then(|u| u.name);

    // Queue invite email via outbox for async delivery
    state
        .comms_service
        .queue_invite_email(
            &created.email,
            &org.name,
            inviter_name.as_deref(),
            created.role.as_str(),
            &invite_token,
            org_id,
            auth.user_id,
        )
        .await?;

    Ok(Json(InviteWithTokenResponse {
        invite: InviteResponse::from_entity(&created),
        token: invite_token,
    }))
}
