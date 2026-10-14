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
use crate::autosave::strong_revision_etag;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::SystemSetting;
use crate::services::EmailService;
use crate::settings_registry::{
    setting_spec, validate_setting_value, ApplicationMode, SettingsRuntime,
};
use crate::AppState;

mod update;
pub(super) use update::build_setting_update;
use update::build_setting_updates;

pub(super) const SYSTEM_SETTINGS_RESOURCE_TYPE: &str = "cedros.system_settings";
pub(super) const SYSTEM_SETTINGS_RESOURCE_ID: &str = "global";

/// Individual setting in API response
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingResponse {
    pub key: String,
    pub value: String,
    pub description: Option<String>,
    pub is_secret: bool,
    #[serde(default)]
    pub has_value: bool,
    #[serde(default)]
    pub application_mode: ApplicationMode,
    pub validation_error: Option<String>,
    pub updated_at: DateTime<Utc>,
    pub updated_by: Option<Uuid>,
}

impl From<SystemSetting> for SettingResponse {
    fn from(s: SystemSetting) -> Self {
        let has_value = !s.value.is_empty();
        let spec = setting_spec(&s.key, SettingsRuntime::Standalone);
        let application_mode = spec
            .map(|spec| spec.application_mode)
            .unwrap_or(ApplicationMode::Unsupported);
        let validation_error = spec
            .and_then(|spec| validate_setting_value(spec, &s.value).err())
            .or_else(|| {
                spec.is_none().then(|| {
                    "No executable capability specification exists for this setting.".into()
                })
            });
        Self {
            key: s.key,
            value: if s.is_secret { String::new() } else { s.value },
            description: s.description,
            is_secret: s.is_secret,
            has_value,
            application_mode,
            validation_error,
            updated_at: s.updated_at,
            updated_by: s.updated_by,
        }
    }
}

/// Response for GET /admin/settings
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListSettingsResponse {
    /// Settings grouped by category
    pub settings: HashMap<String, Vec<SettingResponse>>,
    pub revision: u64,
    pub etag: String,
}

/// Request to update a single setting
#[derive(Debug, Clone, Deserialize, Serialize)]
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
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingsResponse {
    pub updated: Vec<SettingResponse>,
    pub revision: u64,
    pub etag: String,
}

/// GET /admin/settings - List all system settings
///
/// Returns settings grouped by category.
/// Requires system admin privileges.
pub async fn list_settings<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<ListSettingsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let (all_settings, revision) = state.system_settings_repo.get_all_with_revision().await?;

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
    Ok(Json(ListSettingsResponse {
        settings: grouped,
        revision,
        etag: settings_etag(revision),
    }))
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

    let all_settings = state.system_settings_repo.get_all().await?;
    let updates = build_setting_updates(
        all_settings,
        request.settings,
        admin_id,
        &state.encryption_service,
    )?;

    // Apply updates
    let (updated, revision) = state
        .system_settings_repo
        .upsert_many_with_revision(updates)
        .await?;

    // The repository commit is authoritative. Patch the current cache snapshot
    // directly so a transient post-commit read failure cannot turn success into
    // an ambiguous 5xx response.
    state
        .settings_service
        .publish_committed(&updated, revision)
        .await;

    // Log the settings changes for audit
    let updated_keys: Vec<&str> = updated.iter().map(|s| s.key.as_str()).collect();
    tracing::info!(
        admin_id = %admin_id,
        updated_settings = ?updated_keys,
        "Admin updated system settings"
    );

    let responses: Vec<SettingResponse> = updated.into_iter().map(Into::into).collect();

    Ok(Json(UpdateSettingsResponse {
        updated: responses,
        revision,
        etag: settings_etag(revision),
    }))
}

pub(super) fn settings_etag(revision: u64) -> String {
    strong_revision_etag(SYSTEM_SETTINGS_RESOURCE_TYPE, revision)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::services::EncryptionService;

    const EMAIL_VERIFICATION_REQUIRED_KEY: &str = "auth_email_require_verification";

    #[test]
    fn build_setting_update_encrypts_secret_values() {
        let encryption = EncryptionService::from_secret("test-settings-secret");
        let existing = SystemSetting::new_secret(
            "server_metrics_api_key".to_string(),
            "".to_string(),
            "server".to_string(),
            "v1",
        );
        let admin_id = Uuid::new_v4();

        let updated = build_setting_update(
            &existing,
            UpdateSettingRequest {
                key: existing.key.clone(),
                value: "plain-secret".to_string(),
            },
            admin_id,
            &encryption,
        )
        .unwrap();

        assert!(updated.is_secret);
        assert_ne!(updated.value, "plain-secret");
        assert_eq!(updated.encryption_version.as_deref(), Some("v1"));
        assert_eq!(updated.updated_by, Some(admin_id));
        assert_eq!(encryption.decrypt(&updated.value).unwrap(), "plain-secret");
    }

    #[test]
    fn build_setting_update_preserves_plain_values_for_non_secret_settings() {
        let encryption = EncryptionService::from_secret("test-settings-secret");
        let existing = SystemSetting::new(
            "rate_limit_auth".to_string(),
            "10".to_string(),
            "rate_limit".to_string(),
        );
        let admin_id = Uuid::new_v4();

        let updated = build_setting_update(
            &existing,
            UpdateSettingRequest {
                key: existing.key.clone(),
                value: "20".to_string(),
            },
            admin_id,
            &encryption,
        )
        .unwrap();

        assert!(!updated.is_secret);
        assert_eq!(updated.value, "20");
        assert_eq!(updated.encryption_version, None);
        assert_eq!(updated.updated_by, Some(admin_id));
    }

    #[test]
    fn build_setting_update_rejects_invalid_postlogin_flow_order() {
        let encryption = EncryptionService::from_secret("test-settings-secret");
        let existing = SystemSetting::new(
            "postlogin_flow_order".to_string(),
            "subscription,username,welcome,profile".to_string(),
            "postlogin".to_string(),
        );
        let admin_id = Uuid::new_v4();

        let result = build_setting_update(
            &existing,
            UpdateSettingRequest {
                key: existing.key.clone(),
                value: "username,username,welcome,profile".to_string(),
            },
            admin_id,
            &encryption,
        );

        assert!(
            matches!(result, Err(AppError::Validation(message)) if message.contains("Duplicate postlogin_flow_order step"))
        );
    }

    #[test]
    fn build_setting_update_rejects_invalid_verification_policy() {
        let encryption = EncryptionService::from_secret("test-settings-secret");
        let existing = SystemSetting::new(
            EMAIL_VERIFICATION_REQUIRED_KEY.to_string(),
            "true".to_string(),
            "auth.email".to_string(),
        );

        let result = build_setting_update(
            &existing,
            UpdateSettingRequest {
                key: existing.key.clone(),
                value: "sometimes".to_string(),
            },
            Uuid::new_v4(),
            &encryption,
        );

        assert!(matches!(result, Err(AppError::Validation(_))));
    }

    #[test]
    fn known_settings_reject_values_consumers_cannot_execute() {
        let encryption = EncryptionService::from_secret("test-settings-secret");
        let admin_id = Uuid::new_v4();
        let invalid = [
            ("auth_email_enabled", "yes", "auth.email"),
            ("rate_limit_auth", "0", "rate_limit"),
            ("rate_limit_general", "4294967296", "rate_limit"),
            ("security_cookie_same_site", "garbage", "security"),
            ("server_log_format", "xml", "server"),
            ("server_environment", "somewhere", "server"),
            ("security_cors_origins", "not an origin", "security"),
            ("auth_webauthn_rp_origin", "not a url", "auth.webauthn"),
            ("server_frontend_url", "relative/path", "server"),
            ("webhook_url", "javascript:alert(1)", "webhook"),
        ];

        let accepted: Vec<_> = invalid
            .into_iter()
            .filter_map(|(key, value, category)| {
                let existing = SystemSetting::new(
                    key.to_string(),
                    "existing".to_string(),
                    category.to_string(),
                );
                build_setting_update(
                    &existing,
                    UpdateSettingRequest {
                        key: key.to_string(),
                        value: value.to_string(),
                    },
                    admin_id,
                    &encryption,
                )
                .is_ok()
                .then_some((key, value))
            })
            .collect();

        assert!(
            accepted.is_empty(),
            "settings API accepted invalid values: {accepted:?}"
        );
    }

    #[test]
    fn unsupported_legacy_sender_settings_are_not_writable() {
        let encryption = EncryptionService::from_secret("test-settings-secret");
        let admin_id = Uuid::new_v4();
        let unsupported = [
            "email_provider",
            "email_smtp_host",
            "email_smtp_port",
            "email_smtp_user",
            "email_smtp_password",
            "email_smtp_tls",
            "email_from_address",
            "email_from_name",
        ];

        let writable: Vec<_> = unsupported
            .into_iter()
            .filter(|key| {
                let existing =
                    SystemSetting::new((*key).to_string(), String::new(), "email".to_string());
                build_setting_update(
                    &existing,
                    UpdateSettingRequest {
                        key: (*key).to_string(),
                        value: "operator-value".to_string(),
                    },
                    admin_id,
                    &encryption,
                )
                .is_ok()
            })
            .collect();

        assert!(
            writable.is_empty(),
            "unsupported sender settings remained writable: {writable:?}"
        );
    }

    #[test]
    fn setting_response_exposes_application_mode_and_legacy_validation_diagnostic() {
        let invalid = SettingResponse::from(SystemSetting::new(
            "security_cookie_same_site".to_string(),
            "garbage".to_string(),
            "security".to_string(),
        ));
        let invalid_json = serde_json::to_value(invalid).unwrap();
        assert_eq!(invalid_json["applicationMode"], "restart");
        assert!(
            invalid_json["validationError"].as_str().is_some(),
            "legacy invalid rows must be diagnosed instead of silently accepted"
        );

        let hot = SettingResponse::from(SystemSetting::new(
            EMAIL_VERIFICATION_REQUIRED_KEY.to_string(),
            "true".to_string(),
            "auth.email".to_string(),
        ));
        let hot_json = serde_json::to_value(hot).unwrap();
        assert_eq!(hot_json["applicationMode"], "hot");
        assert!(hot_json["validationError"].is_null());
    }
}
