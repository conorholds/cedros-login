//! Admin CRUD for enterprise SSO providers (part of the
//! `cedros-login:admin-users-settings-audit` family). Gates on the host admin
//! session like the other `/admin/*` routes; mutations also require CSRF-immune
//! auth. Client secrets are stored only in the host secret seam and never
//! returned. Port of server/src/handlers/admin/sso_providers.rs.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::{
    admin_actor, error_response, json, require_system_admin, require_system_admin_write,
    validation, RouteError,
};
use crate::clock;
use crate::data::sso_providers::{self, SsoProviderEntry};
use crate::data::{audit, orgs};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, to_json};

fn default_scopes() -> Vec<String> {
    vec![
        "openid".to_string(),
        "email".to_string(),
        "profile".to_string(),
    ]
}
fn default_true() -> bool {
    true
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateSsoProviderRequest {
    org_id: String,
    name: String,
    issuer_url: String,
    client_id: String,
    client_secret: String,
    #[serde(default = "default_scopes")]
    scopes: Vec<String>,
    #[serde(default = "default_true")]
    enabled: bool,
    #[serde(default = "default_true")]
    allow_registration: bool,
    #[serde(default)]
    email_domain: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateSsoProviderRequest {
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    issuer_url: Option<String>,
    #[serde(default)]
    client_id: Option<String>,
    #[serde(default)]
    client_secret: Option<String>,
    #[serde(default)]
    scopes: Option<Vec<String>>,
    #[serde(default)]
    enabled: Option<bool>,
    #[serde(default)]
    allow_registration: Option<bool>,
    #[serde(default)]
    email_domain: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SsoProviderView {
    id: String,
    org_id: String,
    name: String,
    issuer_url: String,
    client_id: String,
    scopes: Vec<String>,
    enabled: bool,
    allow_registration: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    email_domain: Option<String>,
    created_at: String,
    updated_at: String,
}

impl SsoProviderView {
    /// Never includes the client secret or its storage key.
    fn from_entry(p: &SsoProviderEntry) -> Self {
        SsoProviderView {
            id: p.id.clone(),
            org_id: p.org_id.clone(),
            name: p.name.clone(),
            issuer_url: p.issuer_url.clone(),
            client_id: p.client_id.clone(),
            scopes: p.scopes.clone(),
            enabled: p.enabled,
            allow_registration: p.allow_registration,
            email_domain: p.email_domain.clone(),
            created_at: p.created_at.clone(),
            updated_at: p.updated_at.clone(),
        }
    }
}

#[derive(Serialize)]
struct ListResponse {
    providers: Vec<SsoProviderView>,
}

#[derive(Serialize)]
struct MessageResponse {
    message: String,
}

pub fn list(request: &RouteRequest) -> RouteResponse {
    run(list_inner(request))
}
pub fn create(request: &RouteRequest) -> RouteResponse {
    run(create_inner(request))
}
pub fn get(request: &RouteRequest) -> RouteResponse {
    run(get_inner(request))
}
pub fn update(request: &RouteRequest) -> RouteResponse {
    run(update_inner(request))
}
pub fn delete(request: &RouteRequest) -> RouteResponse {
    run(delete_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let providers = sso_providers::find_all()?
        .iter()
        .map(SsoProviderView::from_entry)
        .collect();
    Ok(json(200, &to_json(&ListResponse { providers })?))
}

fn create_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let req: CreateSsoProviderRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let name = non_empty(&req.name, "name")?;
    let issuer_url = non_empty(&req.issuer_url, "issuerUrl")?;
    require_https_issuer(&issuer_url)?;
    let client_id = non_empty(&req.client_id, "clientId")?;
    if req.client_secret.trim().is_empty() {
        return Err(validation("clientSecret is required"));
    }
    if orgs::find_by_id(&req.org_id)?.is_none() {
        return Err(RouteError::Status(404, "organization_not_found"));
    }
    let now = clock::now_iso();
    let provider_id = Uuid::new_v4().to_string();
    let provider = SsoProviderEntry {
        id: provider_id.clone(),
        org_id: req.org_id,
        name,
        issuer_url,
        client_id,
        client_secret_encrypted: None,
        scopes: req.scopes,
        enabled: req.enabled,
        allow_registration: req.allow_registration,
        email_domain: req.email_domain.filter(|d| !d.trim().is_empty()),
        created_at: now.clone(),
        updated_at: now,
    };
    super::sso_credentials::set(&provider_id, &req.client_secret)?;
    if let Err(error) = sso_providers::create(&provider) {
        if super::sso_credentials::delete(&provider_id).is_err() {
            crate::host::log::op_warn("sso", "client-secret-rollback", "secrets_error");
        }
        return Err(error.into());
    }
    let _ = audit::log(
        audit::ADMIN_SSO_PROVIDER_CREATED,
        admin_actor(request).as_deref(),
        Some("sso_provider"),
        Some(&provider.id),
    );
    Ok(json(
        201,
        &to_json(&SsoProviderView::from_entry(&provider))?,
    ))
}

fn get_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let provider = load(request)?;
    Ok(json(
        200,
        &to_json(&SsoProviderView::from_entry(&provider))?,
    ))
}

fn update_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let mut provider = load(request)?;
    let req: UpdateSsoProviderRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;

    if let Some(name) = req.name {
        provider.name = non_empty(&name, "name")?;
    }
    if let Some(issuer_url) = req.issuer_url {
        let issuer_url = non_empty(&issuer_url, "issuerUrl")?;
        require_https_issuer(&issuer_url)?;
        provider.issuer_url = issuer_url;
    }
    if let Some(client_id) = req.client_id {
        provider.client_id = non_empty(&client_id, "clientId")?;
    }
    let replacement_secret = req.client_secret.filter(|s| !s.trim().is_empty());
    if let Some(scopes) = req.scopes {
        provider.scopes = scopes;
    }
    if let Some(enabled) = req.enabled {
        provider.enabled = enabled;
    }
    if let Some(allow) = req.allow_registration {
        provider.allow_registration = allow;
    }
    if let Some(domain) = req.email_domain {
        provider.email_domain = Some(domain).filter(|d| !d.trim().is_empty());
    }
    provider.updated_at = clock::now_iso();

    let previous_secret = if replacement_secret.is_some() {
        super::sso_credentials::current(&provider.id)?
    } else {
        None
    };
    if let Some(secret) = replacement_secret.as_deref() {
        super::sso_credentials::set(&provider.id, secret)?;
        provider.client_secret_encrypted = None;
    }
    if let Err(error) = sso_providers::update(&provider) {
        if replacement_secret.is_some() {
            super::sso_credentials::restore_after_failed_write(
                &provider.id,
                previous_secret.as_deref(),
            );
        }
        return Err(error.into());
    }
    let _ = audit::log(
        audit::ADMIN_SSO_PROVIDER_UPDATED,
        admin_actor(request).as_deref(),
        Some("sso_provider"),
        Some(&provider.id),
    );
    Ok(json(
        200,
        &to_json(&SsoProviderView::from_entry(&provider))?,
    ))
}

fn delete_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let provider = load(request)?;
    if !sso_providers::delete(&provider.id)? {
        return Err(RouteError::Status(404, "not_found"));
    }
    if super::sso_credentials::delete(&provider.id).is_err() {
        crate::host::log::op_warn("sso", "client-secret-delete", "secrets_error");
    }
    let _ = audit::log(
        audit::ADMIN_SSO_PROVIDER_DELETED,
        admin_actor(request).as_deref(),
        Some("sso_provider"),
        Some(&provider.id),
    );
    Ok(json(
        200,
        &to_json(&MessageResponse {
            message: "SSO provider deleted".to_string(),
        })?,
    ))
}

/// Load the path-addressed provider (404 if absent).
fn load(request: &RouteRequest) -> Result<SsoProviderEntry, RouteError> {
    let id = path_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    sso_providers::find_by_id(id)?.ok_or(RouteError::Status(404, "not_found"))
}

fn non_empty(value: &str, field: &str) -> Result<String, RouteError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Err(validation(&format!("{field} is required")));
    }
    Ok(trimmed.to_string())
}

/// The OIDC issuer must be a real https host — the discovery/token/JWKS fetches
/// and the discovery origin-pinning (sso::discover) depend on it.
fn require_https_issuer(issuer_url: &str) -> Result<(), RouteError> {
    if crate::services::sso::https_origin(issuer_url).is_none() {
        return Err(validation(
            "issuerUrl must be an https URL with a valid host",
        ));
    }
    Ok(())
}

/// The provider id from `/admin/sso-providers/{id}`.
fn path_id(path: &str) -> Option<&str> {
    path.strip_prefix("/admin/sso-providers/")?
        .split('/')
        .next()
        .filter(|s| !s.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn path_id_extracts_segment() {
        assert_eq!(path_id("/admin/sso-providers/p1"), Some("p1"));
        assert_eq!(path_id("/admin/sso-providers/"), None);
        assert_eq!(path_id("/admin/sso-providers"), None);
    }
}
