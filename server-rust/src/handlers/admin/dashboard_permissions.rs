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

/// Default permissions for new orgs
fn default_permissions() -> DashboardPermissions {
    let mut admin = HashMap::new();
    admin.insert("users".to_string(), true);
    admin.insert("team".to_string(), true);
    admin.insert("deposits".to_string(), true);
    admin.insert("withdrawals".to_string(), true);
    admin.insert("settings-wallet".to_string(), true);
    admin.insert("settings-auth".to_string(), true);
    admin.insert("settings-messaging".to_string(), true);
    admin.insert("settings-credits".to_string(), true);
    admin.insert("settings-server".to_string(), true);

    let mut member = HashMap::new();
    member.insert("users".to_string(), false);
    member.insert("team".to_string(), true);
    member.insert("deposits".to_string(), false);
    member.insert("withdrawals".to_string(), false);
    member.insert("settings-wallet".to_string(), false);
    member.insert("settings-auth".to_string(), false);
    member.insert("settings-messaging".to_string(), false);
    member.insert("settings-credits".to_string(), false);
    member.insert("settings-server".to_string(), false);

    DashboardPermissions { admin, member }
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
        Some(s) => serde_json::from_str(&s.value).unwrap_or_else(|_| default_permissions()),
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
