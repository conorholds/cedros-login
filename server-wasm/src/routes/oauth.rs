//! Native OAuth authorization-code + S256 PKCE, resource consent, rotating
//! refresh tokens and live revocation, on Login's existing identity/session seam.
mod authority;
#[cfg(test)]
mod authority_tests;
pub(crate) mod cleanup;
mod config;
mod protocol;
#[cfg(test)]
mod tests;
mod tokens;

use super::{auth, error_response, json, RouteError};
use crate::clock;
use crate::data::oauth::{self as store, Connection};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, settings, to_json};
use crate::services::jwt::AccessTokenClaims;
use crate::services::tokens::{generate_invite_token, hash_refresh_token, hash_verification_token};
use config::Config;
use protocol::*;
use serde::{Deserialize, Serialize};
use url::Url;

const REQUEST_TTL: i64 = 600;
const CODE_TTL: i64 = 120;
pub(crate) const ACCESS_TTL: i64 = 300;
const ACCOUNT_SCOPES: &[&str] = &["cedros:sites:read", "cedros:sites:create"];
const SITE_SCOPES: &[&str] = &[
    "cedros:site:read",
    "cedros:site:write",
    "cedros:site:publish",
];

fn wrap(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    let mut response = match result {
        Ok(r) => r,
        Err(e) => error_response(e),
    };
    response.headers.extend([
        ("cache-control".into(), "no-store".into()),
        ("pragma".into(), "no-cache".into()),
        ("referrer-policy".into(), "no-referrer".into()),
    ]);
    response
}
pub fn metadata(_: &RouteRequest) -> RouteResponse {
    wrap(metadata_inner())
}
pub fn authorize(r: &RouteRequest) -> RouteResponse {
    wrap(authorize_inner(r))
}
pub fn request_info(r: &RouteRequest) -> RouteResponse {
    wrap(info_inner(r))
}
pub fn decide(r: &RouteRequest) -> RouteResponse {
    wrap(decide_inner(r))
}
pub fn token(r: &RouteRequest) -> RouteResponse {
    wrap(tokens::exchange(r))
}
pub fn authority(r: &RouteRequest) -> RouteResponse {
    wrap(authority::check(r))
}
pub fn introspect(r: &RouteRequest) -> RouteResponse {
    wrap(tokens::introspect(r))
}
pub fn revoke(r: &RouteRequest) -> RouteResponse {
    wrap(tokens::revoke(r))
}
pub fn disconnect(r: &RouteRequest) -> RouteResponse {
    wrap(disconnect_inner(r))
}
pub fn config_get(r: &RouteRequest) -> RouteResponse {
    match config::get(r) {
        Err(RouteError::Status(503, "oauth_not_configured")) => wrap(Ok(json(
            503,
            r#"{"error":"oauth_not_configured","code":"oauth_not_configured"}"#,
        ))),
        result => wrap(result),
    }
}
pub fn config_put(r: &RouteRequest) -> RouteResponse {
    wrap(config::put(r))
}

fn metadata_inner() -> Result<RouteResponse, RouteError> {
    let c = Config::load()?;
    let mut scopes: Vec<&str> = c
        .clients
        .iter()
        .flat_map(|c| c.scopes.iter().map(String::as_str))
        .collect();
    scopes.sort_unstable();
    scopes.dedup();
    Ok(json(200, &serde_json::json!({
        "issuer":c.issuer,
        "authorization_endpoint":format!("{}/oauth/authorize",c.issuer),
        "token_endpoint":format!("{}/oauth/token",c.issuer),
        "revocation_endpoint":format!("{}/oauth/revoke",c.issuer),
        "jwks_uri":format!("{}/v1/.well-known/jwks.json",c.issuer),
        "response_types_supported":["code"],"grant_types_supported":["authorization_code","refresh_token"],
        "code_challenge_methods_supported":["S256"],"token_endpoint_auth_methods_supported":["none"],
        "revocation_endpoint_auth_methods_supported":["none"],"scopes_supported":scopes,
        "client_id_metadata_document_supported":false,"authorization_response_iss_parameter_supported":true
    }).to_string()))
}

fn authorize_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let config = Config::load()?;
    let p = parameters(&request.query)?;
    let client = config.client(required(&p, "client_id")?)?;
    if required(&p, "response_type")? != "code" {
        return Err(RouteError::Status(400, "unsupported_response_type"));
    }
    let redirect_uri = required(&p, "redirect_uri")?;
    if !config::redirect_matches(&client.redirect_uris, redirect_uri) {
        return Err(RouteError::Status(400, "invalid_request"));
    }
    let resource = required(&p, "resource")?;
    if !client.resources.iter().any(|u| u == resource) {
        return Err(RouteError::Status(400, "invalid_target"));
    }
    let scope = scopes(required(&p, "scope")?, client)?;
    let state = required(&p, "state")?;
    if state.len() > 2048
        || required(&p, "code_challenge_method")? != "S256"
        || !challenge_valid(required(&p, "code_challenge")?)
    {
        return Err(RouteError::Status(400, "invalid_request"));
    }
    let c = Connection {
        id: generate_invite_token(),
        client_id: client.client_id.clone(),
        issuer: config.issuer.clone(),
        redirect_uri: redirect_uri.into(),
        resource: resource.into(),
        scope,
        state: state.into(),
        code_challenge: required(&p, "code_challenge")?.into(),
        created_at: clock::now_iso(),
        expires_at: clock::in_secs(REQUEST_TTL),
        status: "pending".into(),
        identity: None,
        csrf_hash: None,
        code_hash: None,
        code_expires_at: None,
        site_id: None,
        runtime_site_id: None,
        site_name: None,
        refresh_generation: 0,
        cleanup_protocol_version: Some(1),
        cleanup_state: None,
        cleanup_check_at: None,
    };
    store::create(&c)?;
    let mut destination = config::https(&config.consent_uri)?;
    destination
        .query_pairs_mut()
        .append_pair("request_id", &c.id);
    Ok(RouteResponse {
        status: 302,
        headers: vec![("location".into(), destination.into())],
        body: String::new(),
    })
}

fn identity_matches(a: &AccessTokenClaims, b: &AccessTokenClaims) -> bool {
    a.sub == b.sub
        && a.sid == b.sid
        && a.org_id == b.org_id
        && a.role == b.role
        && a.is_system_admin == b.is_system_admin
        && a.email_verified == b.email_verified
}
fn site_required(scope: &str) -> bool {
    scope.split(' ').any(|s| SITE_SCOPES.contains(&s))
}
fn current_request(id: &str) -> Result<crate::host::db::Versioned<Connection>, RouteError> {
    store::read(id)?
        .filter(|r| r.value.id == id && r.value.expires_at > clock::now_iso())
        .ok_or(RouteError::Status(400, "invalid_request"))
}
fn info_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let config = Config::load()?;
    let id = id_from_path(&request.path)?;
    let selection = parameters(&request.query)?;
    if selection.len() != 1 {
        return Err(RouteError::Status(400, "organization_required"));
    }
    let context = consent_context(request, required(&selection, "organizationId")?)?;
    let org = context
        .claims
        .org_id
        .as_deref()
        .ok_or(RouteError::Status(403, "organization_required"))?;
    let mut row = current_request(id)?;
    if row.value.status != "pending" {
        return Err(RouteError::Status(400, "invalid_request"));
    }
    let client = config.client(&row.value.client_id)?;
    tokens::validate_registration(&config, &row.value)?;
    let csrf = hash_refresh_token(
        &format!("oauth-csrf:{id}:{}", context.claims.sid),
        &auth::hmac_secret()?,
    );
    if let Some(identity) = &row.value.identity {
        if !identity_matches(identity, &context.claims) {
            return Err(RouteError::Status(403, "consent_session_mismatch"));
        }
    } else {
        row.value.identity = Some(context.claims.clone());
        row.value.csrf_hash = Some(hash_verification_token(&csrf));
        store::save(&row.value, row.condition)?;
    }
    Ok(json(200,&serde_json::json!({
        "requestId":id,"clientId":client.client_id,"clientName":client.client_name,
        "resource":row.value.resource,"scopes":row.value.scope.split(' ').collect::<Vec<_>>(),
        "redirectUri":row.value.redirect_uri,"accountId":context.claims.sub,"organizationId":org,
        "csrfToken":csrf,"expiresAt":row.value.expires_at,"siteRequired":site_required(&row.value.scope)
    }).to_string()))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Decision {
    decision: String,
    csrf_token: String,
    organization_id: String,
    site_id: Option<String>,
    scopes: Option<Vec<String>>,
}

fn decide_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    if request.body.len() > 8192 {
        return Err(RouteError::Status(413, "request_too_large"));
    }
    let config = Config::load()?;
    let body: Decision =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_request"))?;
    let id = id_from_path(&request.path)?;
    if !request.query.is_empty() {
        return Err(RouteError::Status(400, "invalid_request"));
    }
    let context = consent_context(request, &body.organization_id)?;
    let mut row = current_request(id)?;
    let c = &mut row.value;
    tokens::validate_registration(&config, c)?;
    if c.status != "pending"
        || !c
            .identity
            .as_ref()
            .is_some_and(|i| identity_matches(i, &context.claims))
        || !c
            .csrf_hash
            .as_deref()
            .is_some_and(|h| constant_time_eq(h, &hash_verification_token(&body.csrf_token)))
    {
        return Err(RouteError::Status(403, "invalid_consent"));
    }
    let mut oauth_session = None;
    let redirect_uri = match body.decision.as_str() {
        "deny" => {
            c.status = "denied".into();
            redirect(c, "error", "access_denied")?
        }
        "approve" => {
            if let Some(selected) = body.scopes.as_ref() {
                if selected.is_empty()
                    || selected.iter().any(|scope| {
                        !config::scope_token(scope)
                            || !c.scope.split(' ').any(|requested| requested == scope)
                    })
                {
                    return Err(RouteError::Status(400, "invalid_scope"));
                }
                c.scope = scopes(&selected.join(" "), config.client(&c.client_id)?)?;
            }
            if let Some(site_id) = body.site_id.as_deref() {
                let authority = site_authority(&config, request, &context.claims, site_id)?;
                c.site_id = Some(authority.site_id);
                c.runtime_site_id = Some(authority.runtime_site_id);
                c.site_name = Some(authority.site_name);
            } else if site_required(&c.scope) {
                return Err(RouteError::Status(400, "site_required"));
            }
            let code = format!("{}.{}", c.id, generate_invite_token());
            c.code_hash = Some(hash_verification_token(&code));
            c.code_expires_at = Some(clock::in_secs(CODE_TTL));
            let token_context = crate::services::jwt::TokenContext {
                org_id: context.claims.org_id.clone(),
                role: context.claims.role.clone(),
                is_system_admin: context.claims.is_system_admin,
                email_verified: context.claims.email_verified,
            };
            let (unused_login_tokens, mut session) = auth::prepare_session(
                &context.user,
                &token_context,
                auth::client_ip(request),
                Some(format!(
                    "Cedros OAuth: {}",
                    config.client(&c.client_id)?.client_name
                )),
                context.session.last_strong_auth_at.clone(),
            )?;
            // Never expose a normal Login access/refresh credential for this
            // session: only resource-bound OAuth tokens leave this module.
            drop(unused_login_tokens);
            session.expires_at = session.expires_at.min(clock::in_secs(30 * 24 * 60 * 60));
            c.expires_at = session.expires_at.clone();
            c.identity
                .as_mut()
                .ok_or(RouteError::Status(403, "invalid_consent"))?
                .sid = session.id.clone();
            oauth_session = Some(session);
            c.status = "code".into();
            c.cleanup_check_at = Some(clock::in_secs(cleanup::CHECK_INTERVAL));
            redirect(c, "code", &code)?
        }
        _ => return Err(RouteError::Status(400, "invalid_request")),
    };
    c.csrf_hash = None;
    if let Some(session) = oauth_session {
        store::approve(
            c,
            row.condition,
            &session,
            &context.user,
            &context.claims.sid,
        )?;
    } else {
        store::save(c, row.condition)?;
    }
    Ok(json(
        200,
        &serde_json::json!({"redirectUri":redirect_uri,"grantId":c.id}).to_string(),
    ))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SiteAuthority {
    contract_version: String,
    subject_id: String,
    tenant_id: String,
    site_id: String,
    site_name: String,
    runtime_site_id: String,
}
fn site_authority(
    config: &Config,
    request: &RouteRequest,
    identity: &AccessTokenClaims,
    site_id: &str,
) -> Result<SiteAuthority, RouteError> {
    if site_id.is_empty() || site_id.len() > 200 || site_id.chars().any(char::is_control) {
        return Err(RouteError::Status(400, "invalid_site"));
    }
    let mut url = config::https(&config.consent_uri)?;
    url.set_path("/extensions/cedros-portal/connect/sites");
    url.path_segments_mut()
        .map_err(|_| RouteError::Status(503, "invalid_oauth_configuration"))?
        .push(site_id)
        .push("authority");
    let org = identity
        .org_id
        .as_deref()
        .ok_or(RouteError::Status(403, "organization_required"))?;
    url.query_pairs_mut().append_pair("organizationId", org);
    let bearer = strict_token(request, false)?;
    let response = crate::host::http::fetch(&crate::host::http::HttpRequest {
        method: "GET",
        url: url.as_str(),
        headers: vec![("authorization".into(), format!("Bearer {bearer}"))],
        body: None,
    })?;
    if response.status != 200 {
        return Err(RouteError::Status(403, "site_not_authorized"));
    }
    let authority: SiteAuthority =
        from_json(&response.body).map_err(|_| RouteError::Status(502, "invalid_site_authority"))?;
    if authority.contract_version != "cedros-portal:connect-site-authority:v1"
        || authority.subject_id != identity.sub
        || authority.tenant_id != org
        || authority.site_id != site_id
        || authority.runtime_site_id.is_empty()
    {
        return Err(RouteError::Status(403, "site_not_authorized"));
    }
    Ok(authority)
}

fn disconnect_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let id = request
        .path
        .strip_prefix("/oauth/connections/")
        .ok_or(RouteError::Status(400, "invalid_request"))?;
    let context = strict_context(request, true)?;
    let mut row = current_request(id)?;
    // A pending/denied request has only the browser approval proof, not an
    // independent OAuth session. Cancelling it must never sign that browser out.
    if !matches!(row.value.status.as_str(), "code" | "active" | "revoked") {
        return Err(RouteError::Status(400, "invalid_request"));
    }
    if !row
        .value
        .identity
        .as_ref()
        .is_some_and(|i| i.sub == context.claims.sub)
    {
        return Err(RouteError::Status(403, "forbidden"));
    }
    row.value.status = "revoked".into();
    cleanup::revoke(&row.value, row.condition)?;
    Ok(json(200, "{}"))
}

/// This consent boundary deliberately does not inherit the general Login
/// helper's permissive first-header/cookie fallback. Ambiguous credentials are
/// rejected before any account lookup or consent state change.
fn strict_token(request: &RouteRequest, require_bearer: bool) -> Result<String, RouteError> {
    let invalid = || RouteError::Status(401, "invalid_token");
    let auth: Vec<_> = request
        .headers
        .iter()
        .filter(|(k, _)| k.eq_ignore_ascii_case("authorization"))
        .collect();
    let cookies: Vec<_> = request
        .headers
        .iter()
        .filter(|(k, _)| k.eq_ignore_ascii_case("cookie"))
        .collect();
    if auth.len() > 1 || cookies.len() > 1 {
        return Err(invalid());
    }
    let valid_token = |value: &str| {
        !value.is_empty()
            && value.len() <= 8192
            && !value
                .chars()
                .any(|c| c.is_whitespace() || c.is_control() || c == ',')
    };
    let bearer = if let Some((_, value)) = auth.first() {
        let (scheme, token) = value.split_once(' ').ok_or_else(invalid)?;
        if !scheme.eq_ignore_ascii_case("bearer") || !valid_token(token) {
            return Err(invalid());
        }
        Some(token.to_string())
    } else {
        None
    };
    let mut cookie_token = None;
    if let Some((_, header)) = cookies.first() {
        let config = super::cookies::config();
        let mut names = std::collections::HashSet::new();
        for item in header.split(';') {
            let (name, value) = item.trim().split_once('=').ok_or_else(invalid)?;
            if name == config.access_name || name == config.refresh_name {
                if !names.insert(name) || !valid_token(value) {
                    return Err(invalid());
                }
                if name == config.access_name {
                    cookie_token = Some(value.to_string());
                }
            }
        }
    }
    if require_bearer && bearer.is_none() {
        return Err(RouteError::Status(403, "bearer_required"));
    }
    if matches!((&bearer, &cookie_token), (Some(a), Some(b)) if a != b) {
        return Err(invalid());
    }
    bearer.or(cookie_token).ok_or_else(invalid)
}
/// The browser JWT proves its session, not the organization selected in Portal.
/// Resolve that explicit selection from current membership and bind every consent
/// read/decision to it. Rebinding a pending request to another org is forbidden.
fn consent_context(
    request: &RouteRequest,
    organization_id: &str,
) -> Result<auth::AuthenticatedContext, RouteError> {
    if organization_id.is_empty()
        || organization_id.len() > 180
        || !organization_id
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"-_".contains(&b))
    {
        return Err(RouteError::Status(400, "invalid_organization"));
    }
    let mut claims = strict_context(request, false)?.claims;
    let membership = crate::data::memberships::find(&claims.sub, organization_id)?
        .ok_or(RouteError::Status(403, "organization_membership_removed"))?;
    claims.org_id = Some(membership.org_id);
    claims.role = Some(membership.role);
    auth::authoritative_session(claims)
}

fn strict_context(
    request: &RouteRequest,
    require_bearer: bool,
) -> Result<auth::AuthenticatedContext, RouteError> {
    let token = strict_token(request, require_bearer)?;
    let (jwt, _) = auth::build_jwt()?;
    auth::authoritative_session(jwt.validate_access_token(&token)?)
}
