//! Settings-backed system-admin config: dashboard permissions and the
//! disposable-email blocklist. Host-admin gated (reads) / CSRF-immune
//! (writes). Ports `server/src/handlers/admin/dashboard_permissions.rs` +
//! `disposable_domains.rs` over the per-extension settings seam.
use std::collections::{HashMap, HashSet};

use serde::{Deserialize, Serialize};

use super::{error_response, json, require_system_admin, require_system_admin_write, RouteError};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, settings, to_json};

const DASHBOARD_KEY: &str = "dashboard_permissions";
const DISPOSABLE_CUSTOM_KEY: &str = "custom_blocked_domains";
const DISPOSABLE_ENABLED_KEY: &str = "auth_email_block_disposable";

#[derive(Default, Serialize, Deserialize)]
struct DashboardPermissions {
    #[serde(default)]
    admin: HashMap<String, bool>,
    #[serde(default)]
    member: HashMap<String, bool>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DashboardResponse {
    permissions: DashboardPermissions,
}

/// Seed only the three Cedros Login sidebar entries (matches standalone).
fn default_permissions() -> DashboardPermissions {
    let admin = [("users", true), ("team", true), ("login", true)]
        .into_iter()
        .map(|(k, v)| (k.to_string(), v))
        .collect();
    let member = [("users", false), ("team", true), ("login", false)]
        .into_iter()
        .map(|(k, v)| (k.to_string(), v))
        .collect();
    DashboardPermissions { admin, member }
}

pub fn dashboard_get(request: &RouteRequest) -> RouteResponse {
    wrap(dashboard_get_inner(request))
}
pub fn dashboard_put(request: &RouteRequest) -> RouteResponse {
    wrap(dashboard_put_inner(request))
}
pub fn disposable_get(request: &RouteRequest) -> RouteResponse {
    wrap(disposable_get_inner(request))
}
pub fn disposable_put(request: &RouteRequest) -> RouteResponse {
    wrap(disposable_put_inner(request))
}

fn wrap(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn dashboard_get_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let permissions = match settings::get(DASHBOARD_KEY)? {
        Some(raw) => from_json(&raw).map_err(|_| RouteError::Status(500, "invalid_setting"))?,
        None => default_permissions(),
    };
    Ok(json(200, &to_json(&DashboardResponse { permissions })?))
}

fn dashboard_put_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let permissions: DashboardPermissions =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    settings::set(DASHBOARD_KEY, &to_json(&permissions)?)?;
    Ok(json(200, &to_json(&DashboardResponse { permissions })?))
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DisposableResponse {
    /// The wasm component bundles no built-in disposable list; custom domains
    /// and the enabled flag are owner-managed via settings.
    built_in_count: u32,
    custom_domains: Vec<String>,
    enabled: bool,
}

#[derive(Deserialize)]
struct UpdateDisposableRequest {
    #[serde(default)]
    domains: Vec<String>,
}

fn disposable_get_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    Ok(json(
        200,
        &to_json(&DisposableResponse {
            built_in_count: 0,
            custom_domains: custom_domains()?,
            enabled: disposable_enabled(),
        })?,
    ))
}

fn disposable_put_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let req: UpdateDisposableRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let mut seen = HashSet::new();
    let domains: Vec<String> = req
        .domains
        .into_iter()
        .map(|domain| domain.trim().to_lowercase())
        .filter(|domain| !domain.is_empty() && seen.insert(domain.clone()))
        .collect();
    settings::set(DISPOSABLE_CUSTOM_KEY, &to_json(&domains)?)?;
    Ok(json(
        200,
        &to_json(&DisposableResponse {
            built_in_count: 0,
            custom_domains: domains,
            enabled: disposable_enabled(),
        })?,
    ))
}

fn custom_domains() -> Result<Vec<String>, RouteError> {
    match settings::get(DISPOSABLE_CUSTOM_KEY)? {
        Some(raw) => Ok(from_json(&raw).unwrap_or_default()),
        None => Ok(Vec::new()),
    }
}

/// Defaults to true (matches the standalone `block_disposable_emails` default).
fn disposable_enabled() -> bool {
    settings::get(DISPOSABLE_ENABLED_KEY)
        .ok()
        .flatten()
        .map(|value| {
            let trimmed = value.trim().trim_matches('"');
            trimmed != "false" && trimmed != "0"
        })
        .unwrap_or(true)
}
