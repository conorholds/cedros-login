//! Admin system settings handlers
//!
//! GET /admin/settings - Get all system settings grouped by category
//! PATCH /admin/settings - Update multiple settings

use axum::{extract::State, http::HeaderMap, Json};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

use super::users::validate_system_admin;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::SystemSetting;
use crate::services::EmailService;
use crate::AppState;

/// Individual setting in API response
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingResponse {
    pub key: String,
    pub value: String,
    pub description: Option<String>,
    pub updated_at: DateTime<Utc>,
    pub updated_by: Option<Uuid>,
}

impl From<SystemSetting> for SettingResponse {
    fn from(s: SystemSetting) -> Self {
        Self {
            key: s.key,
            value: s.value,
            description: s.description,
            updated_at: s.updated_at,
            updated_by: s.updated_by,
        }
    }
}

/// Response for GET /admin/settings
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListSettingsResponse {
    /// Settings grouped by category
    pub settings: HashMap<String, Vec<SettingResponse>>,
}

/// Request to update a single setting
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingRequest {
    pub key: String,
    pub value: String,
}

/// Request body for PATCH /admin/settings
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingsRequest {
    pub settings: Vec<UpdateSettingRequest>,
}

/// Response for PATCH /admin/settings
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingsResponse {
    pub updated: Vec<SettingResponse>,
}

/// GET /admin/settings - List all system settings
///
/// Returns settings grouped by category (privacy, withdrawal, rate_limit).
/// Requires system admin privileges.
pub async fn list_settings<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<ListSettingsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let all_settings = state.system_settings_repo.get_all().await?;

    // Group by category
    let mut grouped: HashMap<String, Vec<SettingResponse>> = HashMap::new();
    for setting in all_settings {
        let category = setting.category.clone();
        grouped
            .entry(category)
            .or_default()
            .push(SettingResponse::from(setting));
    }

    // Sort each category's settings by key for consistent ordering
    for settings in grouped.values_mut() {
        settings.sort_by(|a, b| a.key.cmp(&b.key));
    }

    Ok(Json(ListSettingsResponse { settings: grouped }))
}

/// PATCH /admin/settings - Update multiple settings
///
/// Updates the specified settings and refreshes the settings cache.
/// Requires system admin privileges.
pub async fn update_settings<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<UpdateSettingsRequest>,
) -> Result<Json<UpdateSettingsResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    if request.settings.is_empty() {
        return Err(AppError::Validation("No settings provided".into()));
    }

    // Validate all settings exist before updating
    let all_settings = state.system_settings_repo.get_all().await?;
    let known_keys: std::collections::HashSet<_> =
        all_settings.iter().map(|s| s.key.as_str()).collect();

    for update in &request.settings {
        if !known_keys.contains(update.key.as_str()) {
            return Err(AppError::Validation(format!(
                "Unknown setting key: {}",
                update.key
            )));
        }
    }

    // Find current settings to get category info
    let settings_map: HashMap<_, _> = all_settings
        .into_iter()
        .map(|s| (s.key.clone(), s))
        .collect();

    // Build update list
    let updates: Vec<SystemSetting> = request
        .settings
        .into_iter()
        .filter_map(|u| {
            settings_map.get(&u.key).map(|existing| SystemSetting {
                key: u.key,
                value: u.value,
                category: existing.category.clone(),
                description: existing.description.clone(),
                updated_at: Utc::now(),
                updated_by: Some(admin_id),
            })
        })
        .collect();

    // Apply updates
    let updated = state.system_settings_repo.upsert_many(updates).await?;

    // Refresh settings cache
    state.settings_service.refresh().await?;

    // Log the settings changes for audit
    let updated_keys: Vec<&str> = updated.iter().map(|s| s.key.as_str()).collect();
    tracing::info!(
        admin_id = %admin_id,
        updated_settings = ?updated_keys,
        "Admin updated system settings"
    );

    let responses: Vec<SettingResponse> = updated.into_iter().map(Into::into).collect();

    Ok(Json(UpdateSettingsResponse { updated: responses }))
}
