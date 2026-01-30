//! Accept invite handler

use axum::{extract::State, http::HeaderMap, Json};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{AcceptInviteRequest, AcceptInviteResponse};
use crate::repositories::{hash_invite_token, AuditEventType, MembershipEntity};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// POST /invites/accept - Accept an invite
///
/// Requires authentication. The authenticated user will be added to the organization.
pub async fn accept_invite<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<AcceptInviteRequest>,
) -> Result<Json<AcceptInviteResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Get the user
    let user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    // Hash the invite token and find the invite
    let token_hash = hash_invite_token(&req.token);
    let invite = state
        .invite_repo
        .find_by_token_hash(&token_hash)
        .await?
        .ok_or(AppError::NotFound("Invalid or expired invite".into()))?;

    // Verify email matches (case-insensitive) before attempting acceptance
    let user_email = user.email.as_ref().ok_or(AppError::Validation(
        "You must have an email to accept invites".into(),
    ))?;

    if user_email.to_lowercase() != invite.email.to_lowercase() {
        return Err(AppError::Forbidden(
            "This invite was sent to a different email address".into(),
        ));
    }

    // Check if user is already a member
    if state
        .membership_repo
        .find_by_user_and_org(auth.user_id, invite.org_id)
        .await?
        .is_some()
    {
        return Err(AppError::Validation(
            "You are already a member of this organization".into(),
        ));
    }

    // Atomically mark invite as accepted BEFORE creating membership.
    // This prevents race conditions where concurrent requests could both create memberships.
    let accepted_invite = state
        .invite_repo
        .mark_accepted_if_valid(invite.id)
        .await?
        .ok_or(AppError::Validation(
            "Invite has already been accepted or has expired".into(),
        ))?;

    // Get the organization
    let org = state
        .org_repo
        .find_by_id(accepted_invite.org_id)
        .await?
        .ok_or(AppError::NotFound("Organization not found".into()))?;

    // Create membership (only reached if atomic acceptance succeeded)
    let membership =
        MembershipEntity::new(auth.user_id, accepted_invite.org_id, accepted_invite.role);
    if let Err(err) = state.membership_repo.create(membership).await {
        // Roll back invite acceptance to avoid accepted invites without memberships.
        // H-03: Log rollback failures - they indicate data inconsistency requiring manual intervention.
        if let Err(rollback_err) = state.invite_repo.unmark_accepted(accepted_invite.id).await {
            tracing::error!(
                invite_id = %accepted_invite.id,
                user_id = %auth.user_id,
                org_id = %accepted_invite.org_id,
                original_error = %err,
                rollback_error = %rollback_err,
                "CRITICAL: Invite rollback failed - invite marked accepted but no membership created. Manual intervention required."
            );

            // H-03: Log audit event for data inconsistency (fire-and-forget)
            let _ = state
                .audit_service
                .log_org_event(
                    AuditEventType::InviteRollbackFailed,
                    auth.user_id,
                    accepted_invite.org_id,
                    Some(&headers),
                )
                .await;
        }
        return Err(err);
    }

    Ok(Json(AcceptInviteResponse {
        org_id: org.id,
        org_name: org.name,
        role: accepted_invite.role.as_str().to_string(),
    }))
}
