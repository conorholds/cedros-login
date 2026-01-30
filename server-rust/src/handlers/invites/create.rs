//! Create invite handler

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{CreateInviteRequest, InviteResponse, InviteWithTokenResponse};
use crate::repositories::{
    default_invite_expiry, generate_invite_token, hash_invite_token, InviteEntity, OrgRole,
};
use crate::services::EmailService;
use crate::utils::{authenticate, is_valid_email};
use crate::AppState;

/// POST /orgs/:org_id/invites - Create an invite
pub async fn create_invite<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
    Json(req): Json<CreateInviteRequest>,
) -> Result<Json<InviteWithTokenResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Check caller's membership - must be admin+ to invite
    let caller_membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    if !caller_membership.role.has_at_least(OrgRole::Admin) {
        return Err(AppError::Forbidden(
            "Only owners and admins can invite members".into(),
        ));
    }

    // Validate email
    let email = req.email.trim().to_lowercase();
    if !is_valid_email(&email) {
        return Err(AppError::Validation("Invalid email format".into()));
    }

    // Parse and validate role
    let role =
        OrgRole::from_str(&req.role).ok_or_else(|| AppError::Validation("Invalid role".into()))?;

    // Can't invite as owner unless caller is owner
    if role == OrgRole::Owner && caller_membership.role != OrgRole::Owner {
        return Err(AppError::Forbidden(
            "Only owners can invite new owners".into(),
        ));
    }

    // Check if user is already a member
    if let Some(existing_user) = state.user_repo.find_by_email(&email).await? {
        if state
            .membership_repo
            .find_by_user_and_org(existing_user.id, org_id)
            .await?
            .is_some()
        {
            return Err(AppError::Validation(
                "User is already a member of this organization".into(),
            ));
        }
    }

    // Check for existing pending invite
    if let Some(existing) = state
        .invite_repo
        .find_by_org_and_email(org_id, &email)
        .await?
    {
        if existing.accepted_at.is_none() && existing.expires_at > chrono::Utc::now() {
            return Err(AppError::Validation(
                "An invite already exists for this email".into(),
            ));
        }
    }

    // Generate invite token
    let invite_token = generate_invite_token();
    let token_hash = hash_invite_token(&invite_token);

    // Create invite entity
    let invite = InviteEntity {
        id: Uuid::new_v4(),
        org_id,
        email: email.clone(),
        role,
        token_hash,
        invited_by: auth.user_id,
        created_at: chrono::Utc::now(),
        expires_at: default_invite_expiry(),
        accepted_at: None,
    };

    // H-04: Create invite in database FIRST, before queuing email.
    // If email queue fails, we delete the invite (see below).
    // This ensures we never have orphaned emails for non-existent invites.
    let created = state.invite_repo.create(invite).await?;

    // PERF-01: Parallelize org and inviter lookups for better latency.
    // These queries are independent and can run concurrently.
    let (org_result, inviter) = tokio::join!(
        state.org_repo.find_by_id(org_id),
        state.user_repo.find_by_id(auth.user_id)
    );
    let org = org_result?.ok_or(AppError::NotFound("Organization not found".into()))?;
    let inviter_name = inviter?.and_then(|u| u.name);

    // H-04: Queue email AFTER invite is created. If email queue fails,
    // roll back by deleting the invite to maintain consistency.
    if let Err(err) = state
        .comms_service
        .queue_invite_email(
            &email,
            &org.name,
            inviter_name.as_deref(),
            role.as_str(),
            &invite_token,
            org_id,
            auth.user_id,
        )
        .await
    {
        // Clean up the invite if email queue fails
        let _ = state.invite_repo.delete(created.id).await;
        return Err(err);
    }

    Ok(Json(InviteWithTokenResponse {
        invite: InviteResponse::from_entity(&created),
        token: invite_token,
    }))
}
