use chrono::Utc;
use std::collections::{HashMap, HashSet};
use uuid::Uuid;

use super::UpdateSettingRequest;
use crate::errors::AppError;
use crate::repositories::SystemSetting;
use crate::services::EncryptionService;
use crate::settings_registry::{
    setting_spec, validate_setting_value, ApplicationMode, SettingsRuntime,
};
use crate::utils::validate_post_login_flow_order_value;

pub(super) fn build_setting_updates(
    all_settings: Vec<SystemSetting>,
    requested: Vec<UpdateSettingRequest>,
    admin_id: Uuid,
    encryption: &EncryptionService,
) -> Result<Vec<SystemSetting>, AppError> {
    let known_keys: HashSet<_> = all_settings
        .iter()
        .map(|setting| setting.key.as_str())
        .collect();
    for update in &requested {
        if !known_keys.contains(update.key.as_str()) {
            return Err(AppError::Validation(format!(
                "Unknown setting key: {}",
                update.key
            )));
        }
    }

    let settings_by_key: HashMap<_, _> = all_settings
        .into_iter()
        .map(|setting| (setting.key.clone(), setting))
        .collect();
    requested
        .into_iter()
        .map(|update| {
            let existing = settings_by_key.get(&update.key).ok_or_else(|| {
                AppError::Validation(format!("Unknown setting key: {}", update.key))
            })?;
            build_setting_update(existing, update, admin_id, encryption)
        })
        .collect()
}

pub(in crate::handlers::admin) fn build_setting_update(
    existing: &SystemSetting,
    update: UpdateSettingRequest,
    admin_id: Uuid,
    encryption: &EncryptionService,
) -> Result<SystemSetting, AppError> {
    validate_setting_update_value(&update.key, &update.value)?;

    let (value, encryption_version) = if existing.is_secret {
        if update.value.is_empty() {
            (String::new(), None)
        } else {
            (
                encryption.encrypt(&update.value)?,
                Some(format!("v{}", encryption.key_version())),
            )
        }
    } else {
        (update.value, existing.encryption_version.clone())
    };

    Ok(SystemSetting {
        key: update.key,
        value,
        category: existing.category.clone(),
        description: existing.description.clone(),
        is_secret: existing.is_secret,
        encryption_version,
        updated_at: Utc::now(),
        updated_by: Some(admin_id),
    })
}

fn validate_setting_update_value(key: &str, value: &str) -> Result<(), AppError> {
    if key == "postlogin_flow_order" {
        validate_post_login_flow_order_value(value)?;
    }
    let spec = setting_spec(key, SettingsRuntime::Standalone).ok_or_else(|| {
        AppError::Validation(format!(
            "Setting '{key}' has no executable capability specification"
        ))
    })?;
    if !spec.application_mode.is_writable() {
        return Err(AppError::Validation(format!(
            "Setting '{key}' is {} and cannot be updated through this API",
            application_mode_label(spec.application_mode)
        )));
    }
    validate_setting_value(spec, value).map_err(AppError::Validation)
}

fn application_mode_label(mode: ApplicationMode) -> &'static str {
    match mode {
        ApplicationMode::Hot => "hot",
        ApplicationMode::Restart => "restart-applied",
        ApplicationMode::HostOwned => "host-owned",
        ApplicationMode::Unsupported => "unsupported",
    }
}
