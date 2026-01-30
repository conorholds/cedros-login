//! Update member role handler

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{MemberResponse, UpdateMemberRoleRequest};
use crate::repositories::OrgRole;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// PATCH /orgs/:org_id/members/:user_id - Update member role
pub async fn update_member_role<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path((org_id, user_id)): Path<(Uuid, Uuid)>,
    Json(req): Json<UpdateMemberRoleRequest>,
) -> Result<Json<MemberResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // TOCTOU-FIX: Prevent self-role-change to avoid privilege escalation edge cases
    // (check early, before any DB lookups)
    if user_id == auth.user_id {
        return Err(AppError::Forbidden("Cannot change your own role".into()));
    }

    // Parse the new role early to fail fast on invalid input
    let new_role =
        OrgRole::from_str(&req.role).ok_or_else(|| AppError::Validation("Invalid role".into()))?;

    // PERF-03: Parallelize caller and target membership lookups.
    // Both must succeed for the operation to proceed, and the order
    // of failure doesn't affect security (both are required).
    let (caller_result, target_result) = tokio::join!(
        state
            .membership_repo
            .find_by_user_and_org(auth.user_id, org_id),
        state.membership_repo.find_by_user_and_org(user_id, org_id)
    );

    let caller_membership = caller_result?.ok_or(AppError::Forbidden(
        "Not a member of this organization".into(),
    ))?;
    let target_membership = target_result?.ok_or(AppError::NotFound("Member not found".into()))?;

    // Check caller's membership - must be owner or admin
    if !caller_membership.role.has_at_least(OrgRole::Admin) {
        return Err(AppError::Forbidden(
            "Only owners and admins can change member roles".into(),
        ));
    }

    // Owners can't be demoted by non-owners
    if target_membership.role == OrgRole::Owner && caller_membership.role != OrgRole::Owner {
        return Err(AppError::Forbidden(
            "Only owners can change the role of other owners".into(),
        ));
    }

    // Can't promote to owner unless caller is owner
    if new_role == OrgRole::Owner && caller_membership.role != OrgRole::Owner {
        return Err(AppError::Forbidden(
            "Only owners can promote members to owner".into(),
        ));
    }

    // Capture the old role for the notification
    let old_role = target_membership.role;

    // TOCTOU-01: Use atomic update that checks owner count in the same operation
    // This prevents race conditions where concurrent demotions could leave an org ownerless
    let updated = state
        .membership_repo
        .update_role_if_not_last_owner(target_membership.id, org_id, new_role)
        .await?
        .ok_or_else(|| {
            AppError::Validation(
                "Cannot demote owner - organization must have at least one owner".into(),
            )
        })?;

    // Get org details for the notification
    let org = state.org_repo.find_by_id(org_id).await?;
    let org_slug = org.map(|o| o.slug).unwrap_or_default();

    // Send role change notification (fire-and-forget)
    // Check if this is an owner transfer (critical) or regular role change (warn)
    if new_role == OrgRole::Owner || old_role == OrgRole::Owner {
        // Owner transfer is critical
        let _ = state
            .comms_service
            .notify_owner_transfer(org_id, &org_slug, auth.user_id, user_id)
            .await;
    } else if old_role != new_role {
        // Regular role change
        let _ = state
            .comms_service
            .notify_role_change(
                org_id,
                &org_slug,
                user_id,
                auth.user_id,
                old_role.as_str(),
                new_role.as_str(),
            )
            .await;
    }

    // Get user details
    let (email, name) = if let Some(user) = state.user_repo.find_by_id(user_id).await? {
        (user.email, user.name)
    } else {
        (None, None)
    };

    Ok(Json(MemberResponse::from_membership(&updated, email, name)))
}
