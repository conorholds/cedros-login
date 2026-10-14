//! Helper for assigning new users to the site-wide default organization.
//!
//! During setup, a default org is created and its ID stored in system_settings.
//! New user registrations join that org as members.

use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::OrgRole;
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
/// Reads `default_org_id` from system_settings and returns that org ID
/// with Member role. Fails if setup hasn't been completed.
pub async fn resolve_org_assignment<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    _creator_id: Uuid,
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

    Err(AppError::SetupRequired)
}
