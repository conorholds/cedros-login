//! Dashboard permissions handlers
//!
//! GET /admin/dashboard-permissions - Get current dashboard permissions config
//! PUT /admin/dashboard-permissions - Update dashboard permissions (owner only)
//!
//! Dashboard permissions control which sections of the admin dashboard each role
//! (admin, member) can access. Owner always has full access (enforced in frontend).
//!
//! The Cedros Login extension exposes three sidebar entries (`users`, `team`,
//! `login`). Legacy per-feature keys (`settings-auth`, `settings-email`, etc.)
//! were removed when the Login admin page was consolidated into one section
//! with internal tabs; persisted permission blobs that still mention those
//! keys deserialize cleanly because extra keys land in the `HashMap` and are
//! preserved without inspection.

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
const USERS_KEY: &str = "users";
const TEAM_KEY: &str = "team";
const LOGIN_KEY: &str = "login";

/// Default permissions for new orgs.
///
/// Only the three Cedros Login sidebar entries are seeded. Other extensions
/// (e.g. Cedros Affiliates) own their own keys and append them to persisted
/// blobs through their own defaults.
fn default_permissions() -> DashboardPermissions {
    let mut admin = HashMap::new();
    admin.insert(USERS_KEY.to_string(), true);
    admin.insert(TEAM_KEY.to_string(), true);
    admin.insert(LOGIN_KEY.to_string(), true);

    let mut member = HashMap::new();
    member.insert(USERS_KEY.to_string(), false);
    member.insert(TEAM_KEY.to_string(), true);
    member.insert(LOGIN_KEY.to_string(), false);

    DashboardPermissions { admin, member }
}

fn parse_dashboard_permissions(value: &str) -> Result<DashboardPermissions, AppError> {
    serde_json::from_str(value).map_err(|e| {
        AppError::Internal(anyhow::anyhow!(
            "Invalid dashboard_permissions setting: {e}"
        ))
    })
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
        Some(s) => parse_dashboard_permissions(&s.value)?,
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
    use super::{default_permissions, parse_dashboard_permissions, LOGIN_KEY, TEAM_KEY, USERS_KEY};
    use crate::errors::AppError;

    #[test]
    fn parses_dashboard_permissions_json() {
        let value = serde_json::to_string(&default_permissions()).unwrap();
        let permissions = parse_dashboard_permissions(&value).unwrap();

        assert_eq!(permissions.admin.get(USERS_KEY), Some(&true));
        assert_eq!(permissions.member.get(TEAM_KEY), Some(&true));
        assert_eq!(permissions.member.get(LOGIN_KEY), Some(&false));
    }

    #[test]
    fn rejects_invalid_dashboard_permissions_json() {
        let err = parse_dashboard_permissions("not json").unwrap_err();

        assert!(matches!(err, AppError::Internal(_)));
    }

    #[test]
    fn default_permissions_seed_cedros_login_sidebar_entries() {
        let permissions = default_permissions();

        for key in [USERS_KEY, TEAM_KEY, LOGIN_KEY] {
            assert!(
                permissions.admin.contains_key(key),
                "admin defaults must include {key}"
            );
            assert!(
                permissions.member.contains_key(key),
                "member defaults must include {key}"
            );
        }
        assert_eq!(permissions.admin.get(USERS_KEY), Some(&true));
        assert_eq!(permissions.admin.get(TEAM_KEY), Some(&true));
        assert_eq!(permissions.admin.get(LOGIN_KEY), Some(&true));
        assert_eq!(permissions.member.get(USERS_KEY), Some(&false));
        assert_eq!(permissions.member.get(TEAM_KEY), Some(&true));
        assert_eq!(permissions.member.get(LOGIN_KEY), Some(&false));
    }

    #[test]
    fn default_permissions_do_not_seed_legacy_per_feature_keys() {
        let permissions = default_permissions();

        for legacy in [
            "settings-auth",
            "settings-email",
            "settings-webhooks",
            "settings-server",
            "settings-images",
            "settings-wallet",
        ] {
            assert!(
                !permissions.admin.contains_key(legacy),
                "legacy admin key {legacy} must not be seeded once the consolidated Login section ships"
            );
            assert!(
                !permissions.member.contains_key(legacy),
                "legacy member key {legacy} must not be seeded once the consolidated Login section ships"
            );
        }
    }
}
