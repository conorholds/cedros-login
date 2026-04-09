//! Dashboard permissions handlers
//!
//! GET /admin/dashboard-permissions - Get current dashboard permissions config
//! PUT /admin/dashboard-permissions - Update dashboard permissions (owner only)
//!
//! Dashboard permissions control which sections of the admin dashboard each role
//! (admin, member) can access. Owner always has full access (enforced in frontend).

use axum::{extract::State, http::HeaderMap, Json};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;

use super::users::validate_system_admin;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::SystemSetting;
use crate::services::EmailService;
use crate::AppState;

/// Dashboard section identifier
type DashboardSection = String;

/// Dashboard permissions per role
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DashboardPermissions {
    pub admin: HashMap<DashboardSection, bool>,
    pub member: HashMap<DashboardSection, bool>,
}

/// Response for GET/PUT /admin/dashboard-permissions
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardPermissionsResponse {
    pub permissions: DashboardPermissions,
}

/// Key used in system_settings table
const DASHBOARD_PERMISSIONS_KEY: &str = "dashboard_permissions";
const DASHBOARD_PERMISSIONS_CATEGORY: &str = "dashboard";
const SETTINGS_MESSAGING_KEY: &str = "settings-messaging";
const SETTINGS_EMAIL_KEY: &str = "settings-email";
const SETTINGS_WEBHOOKS_KEY: &str = "settings-webhooks";

/// Default permissions for new orgs
fn default_permissions() -> DashboardPermissions {
    let mut admin = HashMap::new();
    admin.insert("users".to_string(), true);
    admin.insert("team".to_string(), true);
    admin.insert("referrals".to_string(), true);
    admin.insert("deposits".to_string(), true);
    admin.insert("withdrawals".to_string(), true);
    admin.insert("compliance".to_string(), true);
    admin.insert("accreditation-queue".to_string(), true);
    admin.insert("sanctions".to_string(), true);
    admin.insert("signup-gating".to_string(), true);
    admin.insert("settings-wallet".to_string(), true);
    admin.insert("settings-auth".to_string(), true);
    admin.insert(SETTINGS_EMAIL_KEY.to_string(), true);
    admin.insert(SETTINGS_WEBHOOKS_KEY.to_string(), true);
    admin.insert("settings-credits".to_string(), true);
    admin.insert("settings-compliance".to_string(), true);
    admin.insert("settings-referrals".to_string(), true);
    admin.insert("settings-signup".to_string(), true);
    admin.insert("settings-server".to_string(), true);
    admin.insert("settings-images".to_string(), true);

    let mut member = HashMap::new();
    member.insert("users".to_string(), false);
    member.insert("team".to_string(), true);
    member.insert("referrals".to_string(), false);
    member.insert("deposits".to_string(), false);
    member.insert("withdrawals".to_string(), false);
    member.insert("compliance".to_string(), false);
    member.insert("accreditation-queue".to_string(), false);
    member.insert("sanctions".to_string(), false);
    member.insert("signup-gating".to_string(), false);
    member.insert("settings-wallet".to_string(), false);
    member.insert("settings-auth".to_string(), false);
    member.insert(SETTINGS_EMAIL_KEY.to_string(), false);
    member.insert(SETTINGS_WEBHOOKS_KEY.to_string(), false);
    member.insert("settings-credits".to_string(), false);
    member.insert("settings-compliance".to_string(), false);
    member.insert("settings-referrals".to_string(), false);
    member.insert("settings-signup".to_string(), false);
    member.insert("settings-server".to_string(), false);
    member.insert("settings-images".to_string(), false);

    DashboardPermissions { admin, member }
}

fn normalize_permissions(mut permissions: DashboardPermissions) -> DashboardPermissions {
    normalize_role_permissions(&mut permissions.admin);
    normalize_role_permissions(&mut permissions.member);
    permissions
}

fn normalize_role_permissions(permissions: &mut HashMap<DashboardSection, bool>) {
    if let Some(settings_messaging) = permissions.remove(SETTINGS_MESSAGING_KEY) {
        permissions
            .entry(SETTINGS_EMAIL_KEY.to_string())
            .or_insert(settings_messaging);
        permissions
            .entry(SETTINGS_WEBHOOKS_KEY.to_string())
            .or_insert(settings_messaging);
    }
}

/// GET /admin/dashboard-permissions
///
/// Returns the current dashboard permissions configuration.
/// If not configured, returns default permissions.
pub async fn get_dashboard_permissions<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<DashboardPermissionsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    // Try to get permissions from system_settings
    let setting = state
        .system_settings_repo
        .get_by_key(DASHBOARD_PERMISSIONS_KEY)
        .await?;

    let permissions = match setting {
        Some(s) => normalize_permissions(
            serde_json::from_str(&s.value).unwrap_or_else(|_| default_permissions()),
        ),
        None => default_permissions(),
    };

    Ok(Json(DashboardPermissionsResponse { permissions }))
}

/// PUT /admin/dashboard-permissions
///
/// Updates the dashboard permissions configuration.
/// Requires system admin privileges.
pub async fn update_dashboard_permissions<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(permissions): Json<DashboardPermissions>,
) -> Result<Json<DashboardPermissionsResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    let permissions = normalize_permissions(permissions);

    // Serialize permissions to JSON
    let value = serde_json::to_string(&permissions).map_err(|e| AppError::Internal(e.into()))?;

    // Upsert the setting
    let setting = SystemSetting {
        key: DASHBOARD_PERMISSIONS_KEY.to_string(),
        value,
        category: DASHBOARD_PERMISSIONS_CATEGORY.to_string(),
        description: Some("Dashboard permissions per role".to_string()),
        is_secret: false,
        encryption_version: None,
        updated_at: chrono::Utc::now(),
        updated_by: Some(admin_id),
    };

    state
        .system_settings_repo
        .upsert_many(vec![setting])
        .await?;

    tracing::info!(
        admin_id = %admin_id,
        "Admin updated dashboard permissions"
    );

    Ok(Json(DashboardPermissionsResponse { permissions }))
}

#[cfg(test)]
mod tests {
    use super::{normalize_permissions, DashboardPermissions, SETTINGS_EMAIL_KEY, SETTINGS_WEBHOOKS_KEY};
    use std::collections::HashMap;

    #[test]
    fn normalize_permissions_splits_legacy_settings_messaging_key() {
        let mut admin = HashMap::new();
        admin.insert("settings-messaging".to_string(), true);
        let mut member = HashMap::new();
        member.insert("settings-messaging".to_string(), false);

        let permissions = normalize_permissions(DashboardPermissions { admin, member });

        assert_eq!(permissions.admin.get(SETTINGS_EMAIL_KEY), Some(&true));
        assert_eq!(permissions.admin.get(SETTINGS_WEBHOOKS_KEY), Some(&true));
        assert_eq!(permissions.member.get(SETTINGS_EMAIL_KEY), Some(&false));
        assert_eq!(permissions.member.get(SETTINGS_WEBHOOKS_KEY), Some(&false));
        assert!(!permissions.admin.contains_key("settings-messaging"));
        assert!(!permissions.member.contains_key("settings-messaging"));
    }
}
