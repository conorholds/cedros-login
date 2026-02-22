//! Helper for assigning new users to the site-wide default organization.
//!
//! During setup, a default org is created and its ID stored in system_settings.
//! New user registrations join that org as members. If the setting is missing
//! (e.g. migration ran before any non-personal orgs existed), this module
//! auto-provisions a "Default" org and persists the setting.

use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::{OrgEntity, OrgRole, SystemSetting};
use crate::services::EmailService;
use crate::AppState;

/// Resolved org assignment for a new user.
pub struct OrgAssignment {
    /// The org the user should join
    pub org_id: Uuid,
    /// The role the user gets in that org
    pub role: OrgRole,
}

/// Resolve which org a new user should join.
///
/// 1. If `default_org_id` is already configured, returns that org.
/// 2. Otherwise looks for any existing non-personal org and adopts it.
/// 3. As a last resort, creates a "Default" org owned by `creator_id`.
///
/// In all cases the `default_org_id` setting is persisted so subsequent
/// calls take the fast path.
pub async fn resolve_org_assignment<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    creator_id: Uuid,
) -> Result<OrgAssignment, AppError> {
    // Fast path: setting already exists
    if let Some(setting) = state
        .system_settings_repo
        .get_by_key("default_org_id")
        .await?
    {
        let org_id: Uuid = setting
            .value
            .parse()
            .map_err(|_| AppError::Internal(anyhow::anyhow!("Invalid default_org_id setting")))?;
        return Ok(OrgAssignment {
            org_id,
            role: OrgRole::Member,
        });
    }

    // Setting missing — find or create a default org.
    // Check if a non-personal org already exists (e.g. created manually).
    let existing_orgs = state.org_repo.list_all(100, 0).await?;
    if let Some(org) = existing_orgs.into_iter().find(|o| !o.is_personal) {
        persist_default_org_id(state, org.id).await;
        return Ok(OrgAssignment {
            org_id: org.id,
            role: OrgRole::Member,
        });
    }

    // No non-personal orgs at all — create the system default.
    let default_org = OrgEntity::new(
        "Default".to_string(),
        "default".to_string(),
        creator_id,
        false,
    );
    match state.org_repo.create(default_org).await {
        Ok(created) => {
            persist_default_org_id(state, created.id).await;
            Ok(OrgAssignment {
                org_id: created.id,
                role: OrgRole::Member,
            })
        }
        Err(_) => {
            // Race: another request created the slug first. Re-read setting.
            let setting = state
                .system_settings_repo
                .get_by_key("default_org_id")
                .await?
                .ok_or_else(|| {
                    AppError::Internal(anyhow::anyhow!(
                        "Failed to create or find default organization"
                    ))
                })?;
            let org_id: Uuid = setting.value.parse().map_err(|_| {
                AppError::Internal(anyhow::anyhow!("Invalid default_org_id setting"))
            })?;
            Ok(OrgAssignment {
                org_id,
                role: OrgRole::Member,
            })
        }
    }
}

/// Persist `default_org_id` in system_settings (best-effort).
async fn persist_default_org_id<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    org_id: Uuid,
) {
    let setting = SystemSetting::new(
        "default_org_id".to_string(),
        org_id.to_string(),
        "org".to_string(),
    );
    if let Err(e) = state.system_settings_repo.upsert(setting).await {
        tracing::warn!("Failed to persist default_org_id setting: {e}");
    }
}
