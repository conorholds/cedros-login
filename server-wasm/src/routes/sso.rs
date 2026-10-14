//! Enterprise SSO login (`cedros-login:sso`): OIDC Authorization Code + PKCE over
//! the `http` egress seam (the original's openidconnect/reqwest stack doesn't
//! build to wasip2). `start` returns the authorization URL; `callback` exchanges
//! the code, verifies the id_token (JWKS + nonce), and issues a session.
//!
//! Opt-in + fail-closed: requires `feature_sso=true`, an `sso_callback_url`
//! (the exact redirect URI registered at the IdP), and the IdP host allowlisted
//! for egress. Per-request fresh instance ⇒ the PKCE/nonce state is persisted in
//! the `verifications` store (single-use, 5-min TTL).
use serde::{Deserialize, Serialize};
use unicode_normalization::UnicodeNormalization;
use uuid::Uuid;

#[path = "sso/callback.rs"]
mod callback_flow;
#[path = "sso/completion.rs"]
mod completion;

use super::auth;
use super::cookies;
use super::{error_response, json, RouteError};
use crate::clock;
use crate::data::sso_providers;
use crate::data::users::UserEntry;
use crate::data::verifications::{self, VerificationEntry};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::http::{self, HttpRequest};
use crate::host::{from_json, log, settings, telemetry, to_json};
use crate::services::email::normalize_email;
use crate::services::oidc;
use crate::services::sso as oidc_flow;

const SSO_STATE_TTL_SECS: i64 = 300;
const SSO_STATE_TYPE: &str = "sso_state";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct StartSsoRequest {
    org_id: String,
    #[serde(default)]
    redirect_uri: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct StartSsoResponse {
    auth_url: String,
    state_id: String,
}

/// Transient auth state (JSON in the verifications row, keyed by state id).
#[derive(Serialize, Deserialize)]
struct SsoState {
    provider_id: String,
    pkce_verifier: String,
    nonce: String,
    redirect_uri: Option<String>,
}

#[derive(Deserialize)]
struct DiscoveryDoc {
    authorization_endpoint: String,
    token_endpoint: String,
    jwks_uri: String,
}

#[derive(Deserialize)]
struct TokenResponse {
    #[serde(default)]
    id_token: Option<String>,
}

#[derive(Deserialize)]
struct SsoIdClaims {
    sub: String,
    #[serde(default)]
    email: Option<String>,
    #[serde(default)]
    email_verified: Option<bool>,
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    picture: Option<String>,
    #[serde(default)]
    nonce: Option<String>,
}

pub fn start(request: &RouteRequest) -> RouteResponse {
    run(start_inner(request))
}
pub fn callback(request: &RouteRequest) -> RouteResponse {
    run(callback_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// POST /sso/start — resolve the org's provider and return the authorize URL.
fn start_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_sso_enabled()?;
    let req: StartSsoRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let callback_uri = callback_url()?;

    let provider = sso_providers::find_enabled_for_org(&req.org_id)?
        .ok_or(RouteError::Status(404, "no_sso_provider"))?;
    let meta = discover(&provider.issuer_url)?;

    let pkce = oidc_flow::generate_pkce();
    let nonce = oidc_flow::random_token();
    let state_id = Uuid::new_v4().to_string();
    let state = SsoState {
        provider_id: provider.id.clone(),
        pkce_verifier: pkce.verifier,
        nonce: nonce.clone(),
        redirect_uri: req.redirect_uri,
    };
    verifications::create(&VerificationEntry {
        id: state_id.clone(),
        user_id: String::new(),
        token_hash: to_json(&state)?,
        token_type: SSO_STATE_TYPE.to_string(),
        target_email: None,
        subject_id: None,
        created_at: clock::now_iso(),
        expires_at: clock::in_secs(SSO_STATE_TTL_SECS),
        used_at: None,
    })?;

    let scope = provider.scopes.join(" ");
    let auth_url = oidc_flow::authorize_url(
        &meta.authorization_endpoint,
        &provider.client_id,
        &callback_uri,
        &scope,
        &state_id,
        &nonce,
        &pkce.challenge,
    );
    Ok(json(
        200,
        &to_json(&StartSsoResponse { auth_url, state_id })?,
    ))
}

/// GET /sso/callback — provider redirect: exchange code, verify, issue session.
fn callback_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_sso_enabled()?;
    let frontend = super::frontend_url();
    if let Some(error) = query(request, "error") {
        return Ok(redirect(&format!(
            "{frontend}?ssoError={}",
            oidc_flow::percent_encode(&error)
        )));
    }
    callback_flow::run(request, &frontend)
}

/// Build a new SSO-provisioned user (email pre-verified by the IdP).
fn build_sso_user(
    id: String,
    email: &str,
    email_verified: Option<bool>,
    name: Option<String>,
    picture: Option<String>,
    binding: String,
) -> UserEntry {
    let now = clock::now_iso();
    UserEntry {
        id,
        email: Some(email.to_string()),
        email_verified: email_verified.unwrap_or(false),
        password_hash: None,
        name,
        username: None,
        picture,
        wallet_address: None,
        evm_wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec!["sso".to_string(), binding],
        suspended_at: None,
        is_system_admin: false,
        created_at: now.clone(),
        updated_at: now,
        last_login_at: None,
        welcome_completed_at: None,
        avatar_content_type: None,
    }
}

/// Bind an enterprise identity to the exact configured provider and immutable
/// OIDC subject. Email is profile/recovery data, not an SSO account key.
fn sso_binding(provider_id: &str, subject: &str) -> String {
    use sha2::{Digest, Sha256};
    let mut digest = Sha256::new();
    digest.update(provider_id.as_bytes());
    digest.update([0]);
    digest.update(subject.as_bytes());
    format!("sso:{}", hex::encode(digest.finalize()))
}

fn sso_user_id(provider_id: &str, subject: &str) -> String {
    use sha2::{Digest, Sha256};
    let mut digest = Sha256::new();
    digest.update(provider_id.as_bytes());
    digest.update([0]);
    digest.update(subject.as_bytes());
    let digest = digest.finalize();
    let mut bytes = [0_u8; 16];
    bytes.copy_from_slice(&digest[..16]);
    bytes[6] = (bytes[6] & 0x0f) | 0x50;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    Uuid::from_bytes(bytes).to_string()
}

fn has_sso_binding(user: &UserEntry, binding: &str) -> bool {
    user.auth_methods.iter().any(|method| method == binding)
}

fn has_any_sso_binding(user: &UserEntry) -> bool {
    user.auth_methods
        .iter()
        .any(|method| method.starts_with("sso:"))
}

/// OIDC discovery over egress: {authorization,token}_endpoint + jwks_uri.
fn discover(issuer_url: &str) -> Result<DiscoveryDoc, RouteError> {
    // The issuer must be https with a real host, and every endpoint the discovery
    // doc returns must stay on the issuer's exact origin — otherwise a malicious
    // or compromised IdP could pivot the guest's fetches (incl. the client_secret
    // POST to token_endpoint) to a different allowlisted origin.
    oidc_flow::https_origin(issuer_url).ok_or_else(|| {
        log::op_warn("sso", "oidc-discovery", "issuer_not_https");
        RouteError::Status(400, "invalid_issuer")
    })?;
    let url = format!(
        "{}/.well-known/openid-configuration",
        issuer_url.trim_end_matches('/')
    );
    let raw = http::get_json(&url)?;
    let doc: DiscoveryDoc = from_json(&raw.to_string()).map_err(|_| {
        log::op_warn("sso", "oidc-discovery", "malformed_document");
        RouteError::Status(502, "oidc_discovery_failed")
    })?;
    for endpoint in [
        &doc.authorization_endpoint,
        &doc.token_endpoint,
        &doc.jwks_uri,
    ] {
        if !oidc_flow::same_origin(issuer_url, endpoint) {
            log::op_warn("sso", "oidc-discovery", "endpoint_origin_mismatch");
            return Err(RouteError::Status(502, "oidc_discovery_failed"));
        }
    }
    Ok(doc)
}

/// Exchange the authorization code for tokens; returns the id_token.
fn exchange_code(
    token_endpoint: &str,
    code: &str,
    redirect_uri: &str,
    client_id: &str,
    client_secret: &str,
    code_verifier: &str,
) -> Result<String, RouteError> {
    let form =
        oidc_flow::token_request_form(code, redirect_uri, client_id, client_secret, code_verifier);
    let response = http::fetch(&HttpRequest {
        method: "POST",
        url: token_endpoint,
        headers: vec![(
            "content-type".to_string(),
            "application/x-www-form-urlencoded".to_string(),
        )],
        body: Some(form),
    })?;
    if !(200..300).contains(&response.status) {
        // Surface IdP token-exchange rejections (misconfigured client/secret,
        // clock skew, revoked code). The upstream status code is safe; never
        // log the response body (may carry tokens/error detail).
        log::op_warn(
            "sso",
            "token-exchange",
            &format!("upstream_status_{}", response.status),
        );
        return Err(RouteError::Status(401, "token_exchange_failed"));
    }
    let token: TokenResponse =
        from_json(&response.body).map_err(|_| RouteError::Status(502, "token_response_invalid"))?;
    token.id_token.ok_or(RouteError::Status(401, "no_id_token"))
}

struct PendingSsoState {
    entry: VerificationEntry,
    state: SsoState,
}

/// Load a live SSO state without consuming it. The callback validates the
/// provider response before committing this proof with its result writes.
fn load_state(state_id: &str) -> Result<PendingSsoState, RouteError> {
    let entry =
        verifications::find_by_id(state_id)?.ok_or(RouteError::Status(400, "invalid_state"))?;
    if entry.token_type != SSO_STATE_TYPE
        || entry.used_at.is_some()
        || entry.expires_at <= clock::now_iso()
    {
        return Err(RouteError::Status(400, "invalid_state"));
    }
    let state = from_json::<SsoState>(&entry.token_hash)
        .map_err(|_| RouteError::Status(400, "invalid_state"))?;
    Ok(PendingSsoState { entry, state })
}

/// Only honor a same-origin redirect target (prevent open redirect).
fn safe_redirect(requested: Option<String>, frontend: &str) -> String {
    match requested {
        Some(uri) if !frontend.is_empty() && uri.starts_with(frontend) => uri,
        _ => frontend.to_string(),
    }
}

/// Exact-match domain check (NFKC + lowercase; rejects subdomains/homographs).
fn validate_domain(normalized_email: &str, expected: &str) -> Result<(), RouteError> {
    let email_domain = normalized_email.split('@').nth(1).unwrap_or("");
    let expected_norm: String = expected.to_lowercase().nfkc().collect();
    if email_domain != expected_norm {
        return Err(RouteError::Status(403, "email_domain_not_allowed"));
    }
    Ok(())
}

fn require_sso_enabled() -> Result<(), RouteError> {
    let enabled = settings::get("feature_sso")
        .ok()
        .flatten()
        .map(|v| {
            let t = v.trim().trim_matches('"');
            t == "true" || t == "1"
        })
        .unwrap_or(false);
    if enabled {
        Ok(())
    } else {
        Err(RouteError::Status(404, "sso_disabled"))
    }
}

/// The exact redirect URI registered at the IdP (operator-set; fail closed).
fn callback_url() -> Result<String, RouteError> {
    str_setting("sso_callback_url").ok_or(RouteError::Status(501, "sso_not_configured"))
}

fn redirect(location: &str) -> RouteResponse {
    RouteResponse {
        status: 302,
        headers: vec![("location".to_string(), location.to_string())],
        body: String::new(),
    }
}

fn query(request: &RouteRequest, key: &str) -> Option<String> {
    request
        .query
        .iter()
        .find(|(k, _)| k == key)
        .map(|(_, v)| v.clone())
}

fn str_setting(key: &str) -> Option<String> {
    settings::get(key)
        .ok()
        .flatten()
        .map(|v| v.trim().trim_matches('"').to_string())
        .filter(|s| !s.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn safe_redirect_only_allows_same_origin() {
        let fe = "https://app.example.com";
        assert_eq!(
            safe_redirect(Some("https://app.example.com/x".into()), fe),
            "https://app.example.com/x"
        );
        assert_eq!(safe_redirect(Some("https://evil.test/x".into()), fe), fe);
        assert_eq!(safe_redirect(None, fe), fe);
    }

    #[test]
    fn domain_check_rejects_subdomain_and_mismatch() {
        assert!(validate_domain("u@acme.test", "acme.test").is_ok());
        assert!(validate_domain("u@evil.acme.test", "acme.test").is_err());
        assert!(validate_domain("u@other.test", "acme.test").is_err());
    }

    #[test]
    fn sso_identity_is_provider_and_subject_bound_not_email_bound() {
        let binding = sso_binding("provider-a", "subject-1");
        assert_ne!(binding, sso_binding("provider-b", "subject-1"));
        assert_ne!(binding, sso_binding("provider-a", "subject-2"));
        let user = build_sso_user(
            sso_user_id("provider-a", "subject-1"),
            "same@example.com",
            Some(true),
            None,
            None,
            binding.clone(),
        );
        assert!(has_sso_binding(&user, &binding));
        assert!(!has_sso_binding(
            &user,
            &sso_binding("provider-a", "subject-2")
        ));
        assert_ne!(
            sso_user_id("provider-a", "subject-1"),
            sso_user_id("provider-a", "subject-2")
        );
    }
}
