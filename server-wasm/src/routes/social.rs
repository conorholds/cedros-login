//! Federated login: Google + Apple, via the `http` egress seam (the operator
//! must allowlist the provider hosts in `CEDROS_EXTENSION_HTTP_ALLOWLIST`).
//! Verifies the provider ID token (JWKS RS256) then finds-or-creates the user by
//! provider id. Faithful port of the core of server/src/handlers/{google,apple}.rs.
//!
//! Federated login also supports linking a provider to a logged-in account via
//! POST /link-oauth (the resolution path for the 409 `account_link_required`
//! returned when a provider email already maps to a local account).
//!
//! DEFERRED (tracked): referral persistence; API-key issuance; Apple
//! private-relay accounts that arrive with no email on first sign-in.
use serde::{Deserialize, Deserializer};
use uuid::Uuid;

#[path = "social/google.rs"]
mod google_provider;
#[path = "social/registration.rs"]
mod registration;
#[cfg(test)]
use google_provider::GoogleAccessTokenInfo;

use super::auth::{
    authenticated_user, client_ip, email_blocks_signup, ensure_email_verified_session_allowed,
    issue_session, require_step_up, respond, touch_login_timestamp, user_agent, user_view,
};
use super::cookies;
use super::{error_response, json, validation, RouteError};
use crate::clock;
use crate::data::users::{self, UserEntry};
use crate::data::verifications::{self, VerificationEntry};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{
    from_json,
    http::{self, HttpRequest},
    settings, telemetry, to_json,
};
use crate::services::email::normalize_email;
use crate::services::tokens::{generate_verification_token, hash_verification_token};
use crate::services::{oidc, AuthError};

const GOOGLE_JWKS_URL: &str = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_TOKENINFO_URL: &str = "https://www.googleapis.com/oauth2/v3/tokeninfo";
const GOOGLE_USERINFO_URL: &str = "https://www.googleapis.com/oauth2/v3/userinfo";
const GOOGLE_ISSUERS: &[&str] = &["accounts.google.com", "https://accounts.google.com"];
const APPLE_JWKS_URL: &str = "https://appleid.apple.com/auth/keys";
const APPLE_ISSUERS: &[&str] = &["https://appleid.apple.com"];
const APPLE_NONCE_TYPE: &str = "apple_sign_in";
const APPLE_NONCE_TTL_SECS: i64 = 5 * 60;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TokenRequest {
    #[serde(default)]
    id_token: Option<String>,
    #[serde(default)]
    access_token: Option<String>,
    #[serde(default)]
    referral: Option<String>,
    #[serde(default, alias = "access_code")]
    access_code: Option<String>,
    // Raw client nonce for Apple replay-binding (Apple echoes SHA-256(nonce) in
    // the id_token); the React client sends it, the server verifies the match.
    #[serde(default)]
    nonce: Option<String>,
}

/// Claims we read from a provider ID token (`sub` is the provider user id).
#[derive(Deserialize)]
struct ProviderClaims {
    sub: String,
    #[serde(default)]
    email: Option<String>,
    // Apple emits `email_verified` as a STRING ("true"); Google as a bool. Accept
    // both. An account is only recorded as verified when this is true (a missing
    // or false claim must NOT be silently upgraded to verified — see finish()).
    #[serde(default, deserialize_with = "de_opt_bool_lenient")]
    email_verified: Option<bool>,
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    picture: Option<String>,
    #[serde(default)]
    hd: Option<String>,
    // Apple embeds SHA-256(client-nonce) here; bound against the client's raw nonce.
    #[serde(default)]
    nonce: Option<String>,
}

/// Deserialize a JSON `true`/`false` OR `"true"`/`"false"` into `Option<bool>`.
fn de_opt_bool_lenient<'de, D: Deserializer<'de>>(d: D) -> Result<Option<bool>, D::Error> {
    #[derive(Deserialize)]
    #[serde(untagged)]
    enum BoolOrStr {
        B(bool),
        S(String),
    }
    Ok(Option::<BoolOrStr>::deserialize(d)?.map(|v| match v {
        BoolOrStr::B(b) => b,
        BoolOrStr::S(s) => s.eq_ignore_ascii_case("true"),
    }))
}

pub fn google(request: &RouteRequest) -> RouteResponse {
    match google_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

pub fn apple(request: &RouteRequest) -> RouteResponse {
    match apple_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

pub fn apple_nonce(_request: &RouteRequest) -> RouteResponse {
    match apple_nonce_inner() {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn apple_nonce_inner() -> Result<RouteResponse, RouteError> {
    provider_client_id("auth_apple_enabled", "auth_apple_client_id")?;
    let nonce = generate_verification_token();
    let entry = VerificationEntry {
        id: Uuid::new_v4().to_string(),
        user_id: String::new(),
        token_hash: hash_verification_token(&nonce),
        token_type: APPLE_NONCE_TYPE.to_string(),
        target_email: None,
        subject_id: None,
        created_at: clock::now_iso(),
        expires_at: clock::in_secs(APPLE_NONCE_TTL_SECS),
        used_at: None,
    };
    verifications::create(&entry)?;
    Ok(json(200, &to_json(&serde_json::json!({ "nonce": nonce }))?))
}

pub fn link(request: &RouteRequest) -> RouteResponse {
    match link_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LinkRequest {
    provider: String,
    #[serde(default)]
    id_token: Option<String>,
    #[serde(default)]
    access_token: Option<String>,
    #[serde(default)]
    nonce: Option<String>,
}

/// POST /link-oauth — attach a Google/Apple identity to the authenticated user.
fn link_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let caller = authenticated_user(request)?;
    require_step_up(&caller)?;
    super::abuse::enforce_provider_action(request, &caller.sub)?;
    let req: LinkRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let claims = link_claims(&req)?;
    if req.provider == "apple" {
        verify_and_consume_apple_nonce(&claims, req.nonce.as_deref())?;
    }

    // Reject if this provider identity is already linked to a different account.
    let existing = match req.provider.as_str() {
        "google" => users::find_by_google_id(&claims.sub)?,
        _ => users::find_by_apple_id(&claims.sub)?,
    };
    if let Some(other) = existing {
        if other.id != caller.sub {
            return Err(RouteError::Status(409, "already_linked_to_another_account"));
        }
    }

    let mut current = users::find_by_id_versioned(&caller.sub)?
        .ok_or(RouteError::Status(404, "user_not_found"))?;
    let user = &mut current.value;
    match req.provider.as_str() {
        "google" => bind_provider_id(&mut user.google_id, claims.sub)?,
        _ => bind_provider_id(&mut user.apple_id, claims.sub)?,
    }
    if !user.auth_methods.iter().any(|m| m == &req.provider) {
        user.auth_methods.push(req.provider.clone());
    }
    user.updated_at = clock::now_iso();
    crate::data::sessions::update_user_and_revoke_others(
        &current,
        &caller.sid,
        "oauth_credential_linked",
    )?;
    super::emit_identifier_linked(&req.provider, "cedros-login:link-oauth");
    let body = to_json(&serde_json::json!({
        "linked": req.provider,
        "user": user_view(&current.value),
    }))?;
    Ok(json(200, &body))
}

fn bind_provider_id(slot: &mut Option<String>, subject: String) -> Result<(), RouteError> {
    if slot.as_deref().is_some_and(|existing| existing != subject) {
        return Err(RouteError::Status(409, "provider_already_linked"));
    }
    *slot = Some(subject);
    Ok(())
}

fn link_claims(request: &LinkRequest) -> Result<ProviderClaims, RouteError> {
    match request.provider.as_str() {
        "google" => {
            let client_id = provider_client_id("auth_google_enabled", "auth_google_client_id")?;
            Ok(google_provider::claims(
                &TokenRequest {
                    id_token: request.id_token.clone(),
                    access_token: request.access_token.clone(),
                    referral: None,
                    access_code: None,
                    nonce: None,
                },
                &client_id,
            )?)
        }
        "apple" => {
            let client_id = provider_client_id("auth_apple_enabled", "auth_apple_client_id")?;
            Ok(oidc::verify_id_token(
                APPLE_JWKS_URL,
                id_token_from_optional(request.id_token.as_deref(), "id_token_required")?,
                &[&client_id],
                APPLE_ISSUERS,
            )?)
        }
        _ => Err(validation("provider must be \"google\" or \"apple\"")),
    }
}

fn google_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let client_id = provider_client_id("auth_google_enabled", "auth_google_client_id")?;
    let req = token_request(request)?;
    let claims = google_provider::claims(&req, &client_id)?;
    let existing = users::find_by_google_id(&claims.sub)?;
    finish(request, "google", claims, existing, &req)
}

fn apple_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let client_id = provider_client_id("auth_apple_enabled", "auth_apple_client_id")?;
    let req = token_request(request)?;
    let claims: ProviderClaims = oidc::verify_id_token(
        APPLE_JWKS_URL,
        id_token(&req)?,
        &[&client_id],
        APPLE_ISSUERS,
    )?;
    verify_and_consume_apple_nonce(&claims, req.nonce.as_deref())?;
    let existing = users::find_by_apple_id(&claims.sub)?;
    finish(request, "apple", claims, existing, &req)
}

fn verify_apple_nonce(claims: &ProviderClaims, sent_nonce: Option<&str>) -> Result<(), RouteError> {
    let token_nonce = claims
        .nonce
        .as_deref()
        .ok_or_else(|| AuthError::Unauthorized("nonce missing from token".to_string()))?;
    let raw = sent_nonce
        .ok_or_else(|| AuthError::Unauthorized("nonce required for this token".to_string()))?;
    if hex_sha256(raw) != token_nonce {
        return Err(AuthError::Unauthorized("nonce mismatch".to_string()).into());
    }
    Ok(())
}

fn verify_and_consume_apple_nonce(
    claims: &ProviderClaims,
    sent_nonce: Option<&str>,
) -> Result<(), RouteError> {
    verify_apple_nonce(claims, sent_nonce)?;
    let raw = sent_nonce.ok_or(RouteError::Status(401, "invalid_nonce"))?;
    let proof = verifications::find_by_token_hash(&hash_verification_token(raw))?
        .filter(|entry| {
            entry.token_type == APPLE_NONCE_TYPE
                && entry.used_at.is_none()
                && entry.expires_at > clock::now_iso()
        })
        .ok_or(RouteError::Status(401, "invalid_nonce"))?;
    let result = crate::host::db::batch_with_results(&[verifications::consume_operation(
        &proof,
        &[APPLE_NONCE_TYPE],
    )
    .into()])?;
    verifications::consumed_payload(&result, &proof, &[APPLE_NONCE_TYPE])?;
    Ok(())
}

/// Lowercase-hex SHA-256, matching the client's nonce-hash encoding.
fn hex_sha256(input: &str) -> String {
    use sha2::{Digest, Sha256};
    Sha256::digest(input.as_bytes())
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

/// Shared tail: find-or-create the user by provider id, then issue a session.
fn finish(
    request: &RouteRequest,
    provider: &str,
    claims: ProviderClaims,
    existing: Option<UserEntry>,
    req: &TokenRequest,
) -> Result<RouteResponse, RouteError> {
    if provider_email_claim_blocks_session(&claims) {
        return Err(RouteError::Status(403, "email_not_verified"));
    }

    let mut user = match existing {
        Some(user) => user,
        None => {
            let user = build_new_user(provider, claims, req)?;
            return registration::complete(request, provider, user);
        }
    };

    if let Some(response) = super::invite_codes::pending_login_response(request, &user, provider)? {
        return Ok(response);
    }

    if crate::data::totp::has_mfa(&user.id)? {
        return super::auth::mfa_challenge(&user, provider);
    }

    touch_login_timestamp(&mut user);
    ensure_email_verified_session_allowed(&user)?;
    let tokens = issue_session(&user, client_ip(request), user_agent(request))?;
    let route_id = format!("cedros-login:{provider}-login");
    let _ = telemetry::emit_event(
        "cedros-login:authenticated",
        "",
        &serde_json::json!({ "method": provider, "routeId": route_id }),
    );
    let _ = telemetry::emit_event(
        "cedros-login:user-login",
        "",
        &serde_json::json!({ "method": provider, "routeId": route_id }),
    );
    respond(
        200,
        &user,
        tokens,
        false,
        Some(provider),
        &cookies::config(),
    )
}

fn build_new_user(
    provider: &str,
    claims: ProviderClaims,
    req: &TokenRequest,
) -> Result<UserEntry, RouteError> {
    let email_verified = provider_email_is_authoritative(provider, &claims);
    let email = claims
        .email
        .ok_or_else(|| AuthError::Validation(vec![format!("Email not provided by {provider}")]))?;
    let normalized = normalize_email(&email);
    if email_verified && email_blocks_signup(&normalized)? {
        return Err(RouteError::Status(409, "account_link_required"));
    }
    super::signup_access::enforce(req.access_code.as_deref())?;
    let _accepted_referral = req
        .referral
        .as_deref()
        .map(str::trim)
        .filter(|v| !v.is_empty());
    let now = clock::now_iso();
    let mut user = UserEntry {
        id: Uuid::new_v4().to_string(),
        email: email_verified.then_some(normalized),
        email_verified,
        password_hash: None,
        name: claims.name,
        username: None,
        picture: claims.picture,
        wallet_address: None,
        evm_wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec![provider.to_string()],
        suspended_at: None,
        is_system_admin: false,
        created_at: now.clone(),
        updated_at: now.clone(),
        last_login_at: Some(now),
        welcome_completed_at: None,
        avatar_content_type: None,
    };
    match provider {
        "google" => user.google_id = Some(claims.sub),
        "apple" => user.apple_id = Some(claims.sub),
        _ => {}
    }
    Ok(user)
}

fn provider_email_is_authoritative(provider: &str, claims: &ProviderClaims) -> bool {
    if claims.email_verified != Some(true) {
        return false;
    }
    provider == "apple"
        || claims.hd.is_some()
        || claims
            .email
            .as_deref()
            .is_some_and(|email| email.to_ascii_lowercase().ends_with("@gmail.com"))
}

fn provider_email_claim_blocks_session(claims: &ProviderClaims) -> bool {
    claims.email.is_some() && claims.email_verified != Some(true)
}

fn token_request(request: &RouteRequest) -> Result<TokenRequest, RouteError> {
    from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))
}

fn id_token(req: &TokenRequest) -> Result<&str, RouteError> {
    id_token_from_optional(req.id_token.as_deref(), "id_token_required")
}

fn id_token_from_optional<'a>(
    id_token: Option<&'a str>,
    error: &'static str,
) -> Result<&'a str, RouteError> {
    id_token.ok_or(RouteError::Status(400, error))
}

fn percent_encode_query(value: &str) -> String {
    let mut encoded = String::with_capacity(value.len());
    for byte in value.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'.' | b'_' | b'~' => {
                encoded.push(char::from(byte));
            }
            _ => encoded.push_str(&format!("%{byte:02X}")),
        }
    }
    encoded
}

/// A provider is opt-in: disabled unless the operator turned it on AND set a
/// client id (fail closed).
fn provider_client_id(enabled_key: &str, client_id_key: &str) -> Result<String, RouteError> {
    if !bool_setting(enabled_key) {
        return Err(RouteError::Status(404, "provider_disabled"));
    }
    str_setting(client_id_key).ok_or(RouteError::Status(500, "provider_not_configured"))
}

fn bool_setting(key: &str) -> bool {
    settings::get(key)
        .ok()
        .flatten()
        .map(|v| {
            let t = v.trim().trim_matches('"');
            t == "true" || t == "1"
        })
        .unwrap_or(false)
}

fn str_setting(key: &str) -> Option<String> {
    settings::get(key)
        .ok()
        .flatten()
        .map(|v| v.trim().trim_matches('"').to_string())
        .filter(|s| !s.is_empty())
}

#[cfg(test)]
#[path = "social_tests.rs"]
mod tests;
