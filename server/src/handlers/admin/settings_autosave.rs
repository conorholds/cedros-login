//! Autosave endpoint for non-secret system settings.

use axum::{
    extract::State,
    http::HeaderMap,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::{
    collections::{HashMap, HashSet},
    sync::Arc,
};
use uuid::Uuid;

use super::{
    settings::{
        build_setting_update, settings_etag, SettingResponse, UpdateSettingRequest,
        UpdateSettingsResponse, SYSTEM_SETTINGS_RESOURCE_ID, SYSTEM_SETTINGS_RESOURCE_TYPE,
    },
    users::validate_system_admin,
};
use crate::{
    autosave::{
        autosave_payload_fingerprint, ensure_payload_size, extract_autosave_headers,
        revision_from_strong_etag, validate_autosave_request, validate_update_mask_fields,
        AutosaveIdempotencyScope, AutosaveProblem, AutosaveRequest,
        DEFAULT_AUTOSAVE_MAX_PAYLOAD_BYTES,
    },
    callback::AuthCallback,
    errors::AppError,
    repositories::{
        SettingsAutosaveCommit, SettingsAutosaveDecision, SettingsAutosaveError, SystemSetting,
    },
    services::EmailService,
    settings_registry::{setting_spec, SettingsRuntime},
    AppState,
};

pub async fn autosave_settings<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<AutosaveRequest<Vec<UpdateSettingRequest>>>,
) -> Result<Json<UpdateSettingsResponse>, Response> {
    let admin_id = validate_system_admin(&state, &headers)
        .await
        .map_err(IntoResponse::into_response)?;
    let autosave_headers =
        extract_autosave_headers(&headers).map_err(IntoResponse::into_response)?;
    validate_autosave_request(&request).map_err(IntoResponse::into_response)?;
    ensure_payload_size(
        serde_json::to_vec(&request)
            .map_err(|_| malformed_response())?
            .len(),
        DEFAULT_AUTOSAVE_MAX_PAYLOAD_BYTES,
    )
    .map_err(IntoResponse::into_response)?;

    let expected_revision = revision_from_strong_etag(&autosave_headers.if_match)
        .map_err(IntoResponse::into_response)?;
    let all_settings = state
        .system_settings_repo
        .get_all()
        .await
        .map_err(IntoResponse::into_response)?;
    let settings_map = settings_by_key(all_settings);
    validate_settings_autosave_request(&request, &settings_map)
        .map_err(IntoResponse::into_response)?;

    let fingerprint = autosave_payload_fingerprint(&json!({
        "ifMatch": &autosave_headers.if_match,
        "body": &request,
    }))
    .map_err(IntoResponse::into_response)?;
    let scope = settings_autosave_scope(admin_id, autosave_headers.idempotency_key);

    apply_settings_autosave(
        &state,
        request,
        &settings_map,
        admin_id,
        expected_revision,
        &scope,
        &fingerprint,
    )
    .await
    .map(Json)
}

pub(super) fn is_autosave_allowed_setting(setting: &SystemSetting) -> bool {
    !setting.is_secret
        && setting_spec(&setting.key, SettingsRuntime::Standalone)
            .is_some_and(|spec| spec.application_mode.is_writable())
}

fn settings_by_key(settings: Vec<SystemSetting>) -> HashMap<String, SystemSetting> {
    settings
        .into_iter()
        .map(|setting| (setting.key.clone(), setting))
        .collect()
}

fn validate_settings_autosave_request(
    request: &AutosaveRequest<Vec<UpdateSettingRequest>>,
    settings_map: &HashMap<String, SystemSetting>,
) -> Result<(), AutosaveProblem> {
    let blocked_fields = blocked_autosave_fields(settings_map);
    validate_update_mask_fields(&request.update_mask, &[], &blocked_fields)?;
    let patch_keys = patch_key_set(&request.patch)?;
    let mask_keys: HashSet<&str> = request.update_mask.iter().map(String::as_str).collect();
    if patch_keys != mask_keys {
        return Err(AutosaveProblem::invalid_patch(
            "updateMask must exactly match autosave patch keys.",
        ));
    }
    for key in patch_keys {
        let setting = settings_map.get(key).ok_or_else(|| {
            AutosaveProblem::invalid_patch("Autosave includes an unknown setting.")
        })?;
        if !is_autosave_allowed_setting(setting) {
            return Err(AutosaveProblem::invalid_patch(
                "Autosave includes a setting blocked by policy.",
            ));
        }
    }
    Ok(())
}

fn patch_key_set(patch: &[UpdateSettingRequest]) -> Result<HashSet<&str>, AutosaveProblem> {
    let mut keys = HashSet::with_capacity(patch.len());
    for update in patch {
        if update.key.trim().is_empty() || !keys.insert(update.key.as_str()) {
            return Err(AutosaveProblem::invalid_patch(
                "Autosave patch keys must be non-empty and unique.",
            ));
        }
    }
    Ok(keys)
}

fn blocked_autosave_fields(settings_map: &HashMap<String, SystemSetting>) -> Vec<&str> {
    settings_map
        .values()
        .filter(|setting| !is_autosave_allowed_setting(setting))
        .map(|setting| setting.key.as_str())
        .collect()
}

async fn apply_settings_autosave<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    request: AutosaveRequest<Vec<UpdateSettingRequest>>,
    settings_map: &HashMap<String, SystemSetting>,
    admin_id: Uuid,
    expected_revision: u64,
    scope: &AutosaveIdempotencyScope,
    fingerprint: &str,
) -> Result<UpdateSettingsResponse, Response> {
    let updates =
        build_settings_updates(request.patch, settings_map, admin_id, state).map_err(|err| *err)?;
    let response_builder = |updated: &[SystemSetting], revision| {
        serde_json::to_value(settings_autosave_response(updated, revision))
            .map_err(|error| AppError::Internal(error.into()))
    };
    let decision = state
        .system_settings_repo
        .commit_autosave(
            updates,
            expected_revision,
            scope,
            fingerprint,
            &response_builder,
        )
        .await
        .map_err(settings_autosave_error_response)?;
    let response = match decision {
        SettingsAutosaveDecision::Committed(commit) => {
            publish_settings_commit(state, admin_id, &commit).await;
            commit.response
        }
        SettingsAutosaveDecision::Replay(response) => response,
    };
    serde_json::from_value(response).map_err(|error| {
        AppError::Internal(anyhow::anyhow!(
            "invalid stored settings autosave response: {error}"
        ))
        .into_response()
    })
}

async fn publish_settings_commit<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    admin_id: Uuid,
    commit: &SettingsAutosaveCommit,
) {
    state
        .settings_service
        .publish_committed(&commit.updated, commit.revision)
        .await;
    let updated_keys: Vec<&str> = commit
        .updated
        .iter()
        .map(|setting| setting.key.as_str())
        .collect();
    tracing::info!(
        admin_id = %admin_id,
        updated_settings = ?updated_keys,
        revision = commit.revision,
        "Admin autosaved system settings"
    );
}

fn settings_autosave_response(updated: &[SystemSetting], revision: u64) -> UpdateSettingsResponse {
    UpdateSettingsResponse {
        updated: updated.iter().cloned().map(SettingResponse::from).collect(),
        revision,
        etag: settings_etag(revision),
    }
}

fn build_settings_updates<C: AuthCallback, E: EmailService>(
    patch: Vec<UpdateSettingRequest>,
    settings_map: &HashMap<String, SystemSetting>,
    admin_id: Uuid,
    state: &AppState<C, E>,
) -> Result<Vec<SystemSetting>, Box<Response>> {
    patch
        .into_iter()
        .map(|update| {
            let existing = settings_map.get(&update.key).ok_or_else(|| {
                Box::new(
                    AutosaveProblem::invalid_patch("Autosave includes an unknown setting.")
                        .into_response(),
                )
            })?;
            build_setting_update(existing, update, admin_id, &state.encryption_service)
                .map_err(|error| Box::new(setting_update_error_response(error)))
        })
        .collect()
}

fn setting_update_error_response(error: AppError) -> Response {
    match error {
        AppError::Validation(_) => {
            AutosaveProblem::invalid_patch("Autosave setting value is invalid.").into_response()
        }
        other => other.into_response(),
    }
}

fn settings_autosave_error_response(error: SettingsAutosaveError) -> Response {
    match error {
        SettingsAutosaveError::Stale { current_revision } => AutosaveProblem::stale(
            "The system settings resource changed after the client draft was based.",
        )
        .with_conflict(json!({
            "currentRevision": current_revision,
            "currentEtag": settings_etag(current_revision),
        }))
        .into_response(),
        SettingsAutosaveError::FingerprintMismatch => AutosaveProblem::invalid_patch(
            "Idempotency key was reused with a different autosave payload.",
        )
        .into_response(),
        SettingsAutosaveError::InProgress => AutosaveProblem::in_progress().into_response(),
        SettingsAutosaveError::App(error) => error.into_response(),
    }
}

fn settings_autosave_scope(admin_id: Uuid, idempotency_key: String) -> AutosaveIdempotencyScope {
    AutosaveIdempotencyScope {
        tenant_id: "system".to_string(),
        user_id: admin_id.to_string(),
        resource_type: SYSTEM_SETTINGS_RESOURCE_TYPE.to_string(),
        resource_id: SYSTEM_SETTINGS_RESOURCE_ID.to_string(),
        operation: "autosave.patch".to_string(),
        key: idempotency_key,
    }
}

fn malformed_response() -> Response {
    AutosaveProblem::malformed("Autosave request is not serializable.").into_response()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn allows_known_non_secret_settings() {
        let allowed = SystemSetting::new(
            "auth_email_require_verification".to_string(),
            "true".to_string(),
            "auth.email".to_string(),
        );
        let secret = SystemSetting::new_secret(
            "server_metrics_api_key".to_string(),
            "".to_string(),
            "server".to_string(),
            "v1",
        );

        assert!(is_autosave_allowed_setting(&allowed));
        assert!(!is_autosave_allowed_setting(&secret));
    }

    #[test]
    fn accepts_non_secret_settings_outside_the_old_static_allowlist() {
        let mut settings = HashMap::new();
        settings.insert(
            "auth_email_require_verification".to_string(),
            SystemSetting::new(
                "auth_email_require_verification".to_string(),
                "true".to_string(),
                "auth.email".to_string(),
            ),
        );
        let request = AutosaveRequest {
            autosave: true,
            client_mutation_id: Uuid::new_v4(),
            editing_session_id: Uuid::new_v4(),
            client_seq: 1,
            update_mask: vec!["auth_email_require_verification".to_string()],
            patch: vec![UpdateSettingRequest {
                key: "auth_email_require_verification".to_string(),
                value: "false".to_string(),
            }],
            schema_version: "v1".to_string(),
        };

        assert!(validate_settings_autosave_request(&request, &settings).is_ok());
    }

    #[test]
    fn rejects_secret_setting_patch() {
        let mut settings = HashMap::new();
        settings.insert(
            "server_metrics_api_key".to_string(),
            SystemSetting::new_secret(
                "server_metrics_api_key".to_string(),
                "".to_string(),
                "server".to_string(),
                "v1",
            ),
        );
        let request = AutosaveRequest {
            autosave: true,
            client_mutation_id: Uuid::new_v4(),
            editing_session_id: Uuid::new_v4(),
            client_seq: 1,
            update_mask: vec!["server_metrics_api_key".to_string()],
            patch: vec![UpdateSettingRequest {
                key: "server_metrics_api_key".to_string(),
                value: "secret".to_string(),
            }],
            schema_version: "v1".to_string(),
        };

        assert!(validate_settings_autosave_request(&request, &settings).is_err());
    }

    #[test]
    fn rejects_patch_when_update_mask_does_not_match_patch_keys() {
        let mut settings = HashMap::new();
        settings.insert(
            "email_from_name".to_string(),
            SystemSetting::new(
                "email_from_name".to_string(),
                "Cedros".to_string(),
                "email".to_string(),
            ),
        );
        let request = AutosaveRequest {
            autosave: true,
            client_mutation_id: Uuid::new_v4(),
            editing_session_id: Uuid::new_v4(),
            client_seq: 1,
            update_mask: vec!["server_log_level".to_string()],
            patch: vec![UpdateSettingRequest {
                key: "email_from_name".to_string(),
                value: "Cedros Login".to_string(),
            }],
            schema_version: "v1".to_string(),
        };

        assert!(validate_settings_autosave_request(&request, &settings).is_err());
    }
}
