//! Account deletion orchestration.
//!
//! Anonymizes the user row in place so FK-linked financial and audit records remain valid,
//! while removing login credentials and revoking all access paths.

use std::collections::HashSet;
use std::sync::Arc;
use std::time::Duration as StdDuration;

use axum::http::HeaderMap;
use tokio::time::timeout;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::{AuditEventType, CredentialType, MembershipEntity, OrgEntity, OrgRole};
use crate::services::{
    avatar_key_for_user, build_s3_image_storage_service, extract_apple_refresh_token_metadata,
    revoke_encrypted_refresh_token, EmailService, ImageStorageService,
};
use crate::AppState;

const CALLBACK_TIMEOUT_SECS: u64 = 2;

#[derive(Debug, Clone, Default)]
pub struct AccountDeletionOutcome {
    pub deleted_org_names: Vec<String>,
    pub transferred_org_names: Vec<String>,
    pub removed_org_names: Vec<String>,
}

#[derive(Debug, Default)]
struct AccountDeletionPlan {
    orgs_to_delete: Vec<OrgEntity>,
    ownership_transfers: Vec<OrgEntity>,
    memberships_to_delete: Vec<MembershipEntity>,
    removed_org_names: Vec<String>,
    blockers: Vec<String>,
}

fn deletion_referral_code(user_id: Uuid) -> String {
    let compact = user_id.simple().to_string().to_uppercase();
    format!("DEL{}", &compact[..13])
}

pub async fn delete_account<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: Uuid,
    headers: Option<&HeaderMap>,
) -> Result<AccountDeletionOutcome, AppError> {
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    if user.is_deleted() {
        return Err(AppError::Validation("Account is already deleted".into()));
    }

    ensure_can_delete_system_admin(state, &user).await?;

    let plan = build_deletion_plan(state, user_id).await?;
    if !plan.blockers.is_empty() {
        return Err(AppError::Validation(plan.blockers.join(" ")));
    }

    // PostgreSQL performs organization and identity deletion in one transaction.
    #[cfg(feature = "postgres")]
    let atomic_org_deletion = state.storage.pg_pool.is_some();
    #[cfg(not(feature = "postgres"))]
    let atomic_org_deletion = false;
    if !atomic_org_deletion {
        for org in plan.ownership_transfers.clone() {
            state.org_repo.update(org.clone()).await?;
        }

        for membership in &plan.memberships_to_delete {
            if !state
                .membership_repo
                .delete_if_not_last_owner(membership.id, membership.org_id, user_id)
                .await?
            {
                return Err(AppError::Validation(
                "Organization ownership changed; assign another owner before deleting this account"
                    .into(),
            ));
            }
        }

        for org in &plan.orgs_to_delete {
            state.invite_repo.delete_by_org(org.id).await?;
            state.membership_repo.delete_by_org(org.id).await?;
            state.custom_role_repo.delete_by_org(org.id).await?;
            state.policy_repo.delete_by_org(org.id).await?;
            if state.config.database.url.is_none() {
                state.audit_repo.delete_by_org(org.id).await?;
                state.outbox_repo.delete_by_org(org.id).await?;
            }
            state.org_repo.delete(org.id).await?;
        }
    }

    let apple_credentials = state
        .credential_repo
        .find_by_user_and_type(user_id, CredentialType::OauthApple)
        .await?;
    state
        .storage
        .credential_lifecycle_repo
        .delete_identity_if_current(&user, &deletion_referral_code(user_id))
        .await?;

    for credential in apple_credentials {
        if let Some((refresh_token, client_id)) =
            extract_apple_refresh_token_metadata(&credential.metadata)
        {
            if let Err(error) = revoke_encrypted_refresh_token(
                &state.settings_service,
                &state.config.apple,
                &state.config.jwt.secret,
                &client_id,
                &refresh_token,
            )
            .await
            {
                tracing::warn!(
                    user_id = %user_id,
                    client_id = %client_id,
                    error = %error,
                    "Failed to revoke Apple refresh token during account deletion"
                );
            }
        }
    }

    if let Err(error) =
        delete_avatar_object_if_configured(state, user_id, user.picture.as_deref()).await
    {
        tracing::warn!(
            user_id = %user_id,
            error = %error,
            "Account deletion could not delete avatar object"
        );
    }

    log_deletion_callback(&state.callback, &user_id.to_string()).await;
    state
        .audit_service
        .log_user_event_or_warn(AuditEventType::AccountDeleted, user_id, headers)
        .await;

    Ok(AccountDeletionOutcome {
        deleted_org_names: plan
            .orgs_to_delete
            .into_iter()
            .map(|org| org.name)
            .collect(),
        transferred_org_names: plan
            .ownership_transfers
            .into_iter()
            .map(|org| org.name)
            .collect(),
        removed_org_names: plan.removed_org_names,
    })
}

async fn ensure_can_delete_system_admin<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &crate::repositories::UserEntity,
) -> Result<(), AppError> {
    if !user.is_system_admin {
        return Ok(());
    }

    let admin_count = state.user_repo.count_system_admins().await?;
    if admin_count <= 1 {
        return Err(AppError::Validation(
            "Transfer system administrator access before deleting the last system admin account."
                .into(),
        ));
    }

    Ok(())
}

async fn build_deletion_plan<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: Uuid,
) -> Result<AccountDeletionPlan, AppError> {
    let memberships = state.membership_repo.find_by_user(user_id).await?;
    let mut plan = AccountDeletionPlan::default();
    let mut removed_org_names = HashSet::new();

    for membership in memberships {
        let mut org = state
            .org_repo
            .find_by_id(membership.org_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Organization not found".into()))?;
        let org_memberships = state.membership_repo.find_by_org(org.id).await?;
        let owner_memberships: Vec<_> = org_memberships
            .iter()
            .filter(|existing| existing.role == OrgRole::Owner)
            .cloned()
            .collect();

        if org.owner_id == user_id && org_memberships.len() == 1 {
            plan.orgs_to_delete.push(org);
            continue;
        }

        if org.owner_id == user_id {
            if let Some(replacement_owner) = owner_memberships
                .iter()
                .find(|existing| existing.user_id != user_id)
            {
                org.owner_id = replacement_owner.user_id;
                plan.ownership_transfers.push(org.clone());
                if removed_org_names.insert(org.name.clone()) {
                    plan.removed_org_names.push(org.name.clone());
                }
                plan.memberships_to_delete.push(membership);
                continue;
            }

            plan.blockers.push(format!(
                "Transfer ownership of '{}' to another member before deleting this account.",
                org.name
            ));
            continue;
        }

        if membership.role == OrgRole::Owner && owner_memberships.len() <= 1 {
            plan.blockers.push(format!(
                "Assign another owner in '{}' before deleting this account.",
                org.name
            ));
            continue;
        }

        if removed_org_names.insert(org.name.clone()) {
            plan.removed_org_names.push(org.name);
        }
        plan.memberships_to_delete.push(membership);
    }

    Ok(plan)
}

async fn delete_avatar_object_if_configured<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: Uuid,
    picture: Option<&str>,
) -> Result<(), AppError> {
    if picture.is_none() {
        return Ok(());
    }

    let enabled = state
        .settings_service
        .get("image_storage_enabled")
        .await?
        .unwrap_or_default();
    if enabled != "true" {
        return Ok(());
    }

    let storage = build_s3_image_storage_service(&state.settings_service).await?;
    storage.delete_avatar(&avatar_key_for_user(user_id)).await
}

async fn log_deletion_callback<C: AuthCallback>(callback: &Arc<C>, user_id: &str) {
    match timeout(
        StdDuration::from_secs(CALLBACK_TIMEOUT_SECS),
        callback.on_logout(user_id),
    )
    .await
    {
        Ok(Ok(())) => {}
        Ok(Err(error)) => {
            tracing::warn!(user_id = %user_id, error = %error, "Account deletion logout callback failed");
        }
        Err(_) => {
            tracing::warn!(user_id = %user_id, timeout_secs = CALLBACK_TIMEOUT_SECS, "Account deletion logout callback timed out");
        }
    }
}
