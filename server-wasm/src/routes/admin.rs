//! Admin system-settings routes. Mirrors the standalone server's
//! `handlers/admin/settings.rs`: GET returns every known setting grouped by
//! category (each carrying its current value or catalog default); PATCH applies
//! a batch of updates. Host-admin gated (read) / CSRF-immune (write). Secret
//! values use the encrypted host secret seam and are redacted on read. Legacy
//! plaintext settings migrate before their values are cleared.
use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use super::{
    error_response, json, require_admin_write, require_system_admin, validation, RouteError,
};
use crate::clock;
use crate::domain::{
    settings_catalog::{self, SettingDef},
    settings_registry::{setting_spec, validate_setting_value, ApplicationMode, SettingsRuntime},
};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, settings, to_json};

/// One setting as the admin UI consumes it. Matches the standalone
/// `SettingResponse` (camelCase: key/value/description/updatedAt/updatedBy).
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SettingView {
    key: String,
    value: String,
    description: Option<String>,
    is_secret: bool,
    has_value: bool,
    application_mode: ApplicationMode,
    validation_error: Option<String>,
    updated_at: String,
    updated_by: Option<String>,
}

#[derive(Serialize)]
struct ListResponse {
    /// Settings grouped by category (BTreeMap → stable category ordering).
    settings: BTreeMap<String, Vec<SettingView>>,
}

#[derive(Serialize)]
struct UpdateResponse {
    updated: Vec<SettingView>,
}

#[derive(Deserialize)]
struct UpdateRequest {
    settings: Vec<UpdateItem>,
}

#[derive(Deserialize)]
struct UpdateItem {
    key: String,
    value: String,
}

/// GET /admin/settings — all known settings grouped by category, each carrying
/// its current value (seam override or catalog default). Keys are pushed in the
/// catalog's sorted order, so each category lists settings by key (matches the
/// standalone's stable ordering).
pub fn get_settings(request: &RouteRequest) -> RouteResponse {
    match list(request) {
        Ok(resp) => resp,
        Err(e) => error_response(e),
    }
}

fn list(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let now = clock::now_iso();
    let mut grouped: BTreeMap<String, Vec<SettingView>> = BTreeMap::new();
    for def in settings_catalog::SETTINGS {
        let (value, has_value) = current_value(def)?;
        grouped
            .entry(def.category.to_string())
            .or_default()
            .push(view(def, value, has_value, &now));
    }
    Ok(json(200, &to_json(&ListResponse { settings: grouped })?))
}

/// PATCH /admin/settings — batch upsert. Validates every key against the catalog
/// (fail closed on unknown/empty input) before writing any value to the seam.
pub fn update_settings(request: &RouteRequest) -> RouteResponse {
    match apply(request) {
        Ok(resp) => resp,
        Err(e) => error_response(e),
    }
}

fn apply(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_admin_write(request)?;
    require_system_admin(request)?;
    let body: UpdateRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    validate_batch(&body.settings)?;
    let now = clock::now_iso();
    let mut updated = Vec::with_capacity(body.settings.len());
    for item in body.settings {
        let def = settings_catalog::SETTINGS
            .iter()
            .find(|s| s.key == item.key)
            .expect("key validated against the catalog above");
        if def.is_secret {
            settings::set_secret(&item.key, &item.value)?;
        } else {
            settings::set(&item.key, &item.value)?;
        }
        // Echo back the stored value, redacting secrets like the read path.
        let has_value = !item.value.is_empty();
        let value = if def.is_secret {
            String::new()
        } else {
            item.value
        };
        updated.push(view(def, value, has_value, &now));
    }
    Ok(json(200, &to_json(&UpdateResponse { updated })?))
}

/// Current value of a setting: the seam override if present, else the catalog
/// default. Secret values are redacted to "" so stored secret material is never
/// returned on read.
fn current_value(def: &SettingDef) -> Result<(String, bool), RouteError> {
    let stored = if def.is_secret {
        settings::get_secret(def.key)?
    } else {
        settings::get(def.key)?
    };
    let has_value = stored.as_deref().is_some_and(|value| !value.is_empty());
    if def.is_secret {
        return Ok((String::new(), has_value));
    }
    let value = stored.unwrap_or_else(|| def.default.to_string());
    let has_value = !value.is_empty();
    Ok((value, has_value))
}

fn view(def: &SettingDef, value: String, has_value: bool, now: &str) -> SettingView {
    let spec = setting_spec(def.key, SettingsRuntime::Wasm)
        .expect("Wasm settings catalog must have an authoritative setting specification");
    let validation_error = validate_setting_value(spec, &value).err();
    SettingView {
        key: def.key.to_string(),
        value,
        description: None,
        is_secret: def.is_secret,
        has_value,
        application_mode: spec.application_mode,
        validation_error,
        updated_at: now.to_string(),
        updated_by: None,
    }
}

/// Reject empty batches and any key not in the catalog (fail closed) before
/// touching the seam, so a single bad key aborts the whole update untouched.
fn validate_batch(items: &[UpdateItem]) -> Result<(), RouteError> {
    if items.is_empty() {
        return Err(validation("No settings provided"));
    }
    if items.len() != 1 {
        return Err(validation(
            "The host settings seam supports exactly one setting per atomic update",
        ));
    }
    for item in items {
        if !settings_catalog::is_known(&item.key) {
            return Err(validation(&format!("Unknown setting key: {}", item.key)));
        }
        let spec = setting_spec(&item.key, SettingsRuntime::Wasm).ok_or_else(|| {
            validation(&format!(
                "Setting '{}' has no executable capability specification",
                item.key
            ))
        })?;
        if !spec.application_mode.is_writable() {
            return Err(validation(&format!(
                "Setting '{}' is managed by the host runtime",
                item.key
            )));
        }
        validate_setting_value(spec, &item.value).map_err(|message| validation(&message))?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    const ADMIN_SETTINGS_RESPONSE_FIXTURE: &str =
        include_str!("../../../contracts/fixtures/cedros-login-admin-settings-response.json");

    fn item(key: &str) -> UpdateItem {
        item_with_value(key, "v")
    }

    fn item_with_value(key: &str, value: &str) -> UpdateItem {
        UpdateItem {
            key: key.to_string(),
            value: value.to_string(),
        }
    }

    #[test]
    fn validate_batch_accepts_known_rejects_unknown_and_empty() {
        // Happy path: the settings host seam can safely apply one validated key.
        assert!(validate_batch(&[item_with_value("auth_email_enabled", "true")]).is_ok());
        // Edge: an unknown key fails closed (whole batch rejected, untouched).
        assert!(matches!(
            validate_batch(&[item("auth_email_enabled"), item("totally_bogus")]),
            Err(RouteError::Auth(_))
        ));
        // Edge: empty batch is rejected.
        assert!(matches!(validate_batch(&[]), Err(RouteError::Auth(_))));
    }

    #[test]
    fn multi_key_write_is_rejected_when_host_seam_cannot_commit_atomically() {
        let result = validate_batch(&[
            item_with_value("auth_email_enabled", "false"),
            item_with_value("feature_mfa", "false"),
        ]);

        assert!(
            result.is_err(),
            "sequential host writes must not claim atomic multi-key success"
        );
    }

    #[test]
    fn known_settings_reject_values_consumers_cannot_execute() {
        let invalid = [
            ("auth_email_enabled", "yes"),
            ("auth_instantlink_expiry", "0"),
            ("auth_solana_challenge_expiry", "4294967296"),
            ("auth_webauthn_rp_origin", "not a url"),
            ("server_frontend_url", "relative/path"),
            ("postlogin_welcome_route", "relative/path"),
        ];

        let accepted: Vec<_> = invalid
            .into_iter()
            .filter(|(key, value)| validate_batch(&[item_with_value(key, value)]).is_ok())
            .collect();

        assert!(
            accepted.is_empty(),
            "Wasm settings API accepted invalid values: {accepted:?}"
        );
    }

    #[test]
    fn host_owned_settings_are_not_writable_through_the_guest_seam() {
        let writable: Vec<_> = [
            "server_base_path",
            "server_environment",
            "server_log_format",
            "server_trust_proxy",
        ]
        .into_iter()
        .filter(|key| validate_batch(&[item_with_value(key, "operator-value")]).is_ok())
        .collect();

        assert!(
            writable.is_empty(),
            "host-owned settings remained guest-writable: {writable:?}"
        );
    }

    #[test]
    fn list_response_matches_grouped_camelcase_contract() {
        // Guards the exact shape the admin UI consumes (the bug we fixed: it was a
        // flat key→value map). Must be { settings: { category: [SystemSetting] } }
        // with camelCase keys and JSON null for absent description/updatedBy.
        let def = SettingDef {
            key: "auth_email_enabled",
            category: "auth.email",
            default: "true",
            is_secret: false,
        };
        let mut grouped: BTreeMap<String, Vec<SettingView>> = BTreeMap::new();
        grouped
            .entry(def.category.to_string())
            .or_default()
            .push(view(
                &def,
                "true".to_string(),
                true,
                "2026-01-01T00:00:00.000Z",
            ));
        let json = to_json(&ListResponse { settings: grouped }).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        let fixture: serde_json::Value =
            serde_json::from_str(ADMIN_SETTINGS_RESPONSE_FIXTURE).unwrap();

        assert_eq!(parsed, fixture);
        let row = &parsed["settings"]["auth.email"][0];
        assert_eq!(row["key"], "auth_email_enabled");
        assert_eq!(row["value"], "true");
        assert_eq!(row["isSecret"], false);
        assert_eq!(row["hasValue"], true);
        assert_eq!(row["applicationMode"], "hot");
        assert!(row["validationError"].is_null());
        assert_eq!(row["updatedAt"], "2026-01-01T00:00:00.000Z");
        assert!(row["description"].is_null());
        assert!(row["updatedBy"].is_null());
    }

    fn settings_request(method: &str, context_json: &str) -> RouteRequest {
        RouteRequest {
            route_id: String::new(),
            method: method.to_string(),
            path: "/admin/settings".to_string(),
            headers: vec![],
            query: vec![],
            body: "{\"settings\":[]}".to_string(),
            context_json: context_json.to_string(),
        }
    }

    #[test]
    fn settings_read_forbidden_for_authenticated_non_admin() {
        // Fails closed at the authorization gate (403) before touching the host
        // settings seam — an authenticated host actor is not enough.
        let resp = get_settings(&settings_request(
            "GET",
            r#"{"actorId":"u_1","authenticated":true,"csrfVerified":true}"#,
        ));
        assert_eq!(resp.status, 403);
        assert!(resp.body.contains("admin_required"));
    }

    #[test]
    fn settings_write_forbidden_for_authenticated_non_admin() {
        let resp = update_settings(&settings_request(
            "PATCH",
            r#"{"actorId":"u_1","authenticated":true,"csrfVerified":true}"#,
        ));
        assert_eq!(resp.status, 403);
        assert!(resp.body.contains("admin_required"));
    }
}
