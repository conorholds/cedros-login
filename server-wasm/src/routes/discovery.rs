//! Public discovery (`cedros-login:auth`): the JWKS — so clients and relying
//! parties can verify cedros-login's RS256 access tokens — and an auth-config
//! document advertising which sign-in methods the operator enabled.
use serde::Serialize;

use super::auth::{build_jwt, JWKS_CACHE_MAX_AGE_SECS};
use super::{error_response, json, require_system_admin_write, RouteError};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{settings, to_json};

const AUTH_INSTANTLINK_ENABLED_KEY: &str = "auth_instantlink_enabled";
const AUTH_WEBAUTHN_ENABLED_KEY: &str = "auth_webauthn_enabled";
const SIGNUP_ACCESS_CODE_ENABLED_KEY: &str = "signup_access_code_enabled";
const AUTH_WEBAUTHN_RP_ORIGIN_KEY: &str = "auth_webauthn_rp_origin";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AuthConfigResponse {
    version: String,
    auth_methods: AuthMethods,
    api_key_usage: ApiKeyUsage,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AuthMethods {
    email: bool,
    google: bool,
    apple: bool,
    solana: bool,
    sso: bool,
    webauthn: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ApiKeyUsage {
    header: String,
    format: String,
    key_prefix: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AiDiscoveryIndex {
    version: &'static str,
    name: &'static str,
    description: &'static str,
    endpoints: AiEndpoints,
    capabilities: Vec<&'static str>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AiEndpoints {
    auth_discovery: &'static str,
    jwks: &'static str,
}

/// GET /.well-known/jwks.json — the public RS256 verification key set.
pub fn jwks(_request: &RouteRequest) -> RouteResponse {
    match jwks_inner() {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn jwks_inner() -> Result<RouteResponse, RouteError> {
    let (jwt, _) = build_jwt()?;
    jwks_response(&jwt)
}

fn jwks_response(jwt: &crate::services::jwt::JwtService) -> Result<RouteResponse, RouteError> {
    Ok(RouteResponse {
        status: 200,
        headers: vec![
            ("content-type".to_string(), "application/json".to_string()),
            (
                "cache-control".to_string(),
                format!("public, max-age={JWKS_CACHE_MAX_AGE_SECS}, must-revalidate"),
            ),
        ],
        body: to_json(&jwt.jwks())?,
    })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RotationResponse {
    active_kid: String,
    previous_kid: String,
    previous_valid_until: String,
}

/// POST /admin/jwt/rotate — system-admin-only signing-key rotation. The old
/// verification key remains published through the overlap deadline.
pub fn rotate_jwt(request: &RouteRequest) -> RouteResponse {
    match rotate_jwt_inner(request) {
        Ok(response) => response,
        Err(error) => error_response(error),
    }
}

fn rotate_jwt_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let (active_kid, previous_kid, valid_until) = super::auth::rotate_signing_key()?;
    let previous_valid_until = crate::clock::from_unix(valid_until as i64)
        .ok_or(RouteError::Status(500, "key_rotation_failed"))?;
    Ok(json(
        200,
        &to_json(&RotationResponse {
            active_kid,
            previous_kid,
            previous_valid_until,
        })?,
    ))
}

/// GET /discovery — which auth methods are enabled + how to present an API key.
pub fn auth_config(_request: &RouteRequest) -> RouteResponse {
    let methods = AuthMethods {
        email: bool_setting("auth_email_enabled", true),
        google: bool_setting("auth_google_enabled", false),
        apple: bool_setting("auth_apple_enabled", false),
        solana: bool_setting("auth_solana_enabled", false),
        sso: bool_setting("feature_sso", false),
        webauthn: webauthn_enabled(),
    };
    let response = AuthConfigResponse {
        version: "1.0".to_string(),
        auth_methods: methods,
        api_key_usage: ApiKeyUsage {
            header: "Authorization".to_string(),
            format: "Bearer <api-key>".to_string(),
            key_prefix: "ck_".to_string(),
        },
    };
    match to_json(&response) {
        Ok(body) => json(200, &body),
        Err(err) => error_response(err.into()),
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct FeaturesResponse {
    email: bool,
    google: bool,
    apple: bool,
    solana: bool,
    webauthn: bool,
    instant_link: bool,
    signup_access_code_required: bool,
    subscription_selection_required: bool,
    subscription_selection_route: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    google_client_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    apple_client_id: Option<String>,
    username_enabled: bool,
    social_button_order: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    signup_availability: Option<crate::data::signup_limit::SignupLimitAvailability>,
}

/// GET /features — flat public feature flags for the frontend (which auth methods
/// are enabled + public client ids + button order). Port of
/// `server/src/handlers/features.rs::auth_features`.
pub fn features(_request: &RouteRequest) -> RouteResponse {
    let google = bool_setting("auth_google_enabled", false);
    let apple = bool_setting("auth_apple_enabled", false);
    let response = FeaturesResponse {
        email: bool_setting("auth_email_enabled", true),
        google,
        apple,
        solana: bool_setting("auth_solana_enabled", false),
        webauthn: webauthn_enabled(),
        instant_link: bool_setting(AUTH_INSTANTLINK_ENABLED_KEY, false),
        signup_access_code_required: bool_setting(SIGNUP_ACCESS_CODE_ENABLED_KEY, false),
        subscription_selection_required: bool_setting("subscription_selection_required", false),
        subscription_selection_route: super::subscription_selection::normalize_route(
            settings::get("subscription_selection_route").ok().flatten(),
        ),
        google_client_id: google
            .then(|| str_setting("auth_google_client_id"))
            .flatten(),
        apple_client_id: apple.then(|| str_setting("auth_apple_client_id")).flatten(),
        username_enabled: bool_setting("postlogin_username_enabled", false),
        social_button_order: social_button_order(),
        signup_availability: crate::data::signup_limit::public_availability()
            .ok()
            .flatten(),
    };
    match to_json(&response) {
        Ok(body) => RouteResponse {
            status: 200,
            headers: vec![
                ("content-type".into(), "application/json".into()),
                ("cache-control".into(), "no-store".into()),
            ],
            body,
        },
        Err(err) => error_response(err.into()),
    }
}

/// GET /.well-known/ai-discovery.json — a machine-readable pointer to the auth
/// API + its enabled capabilities (links only to endpoints this extension serves).
pub fn ai_discovery(_request: &RouteRequest) -> RouteResponse {
    let index = AiDiscoveryIndex {
        version: "1.0",
        name: "Cedros Login",
        description: "Authentication & identity API: passwords, social (Google/Apple), Solana wallet, passkeys (WebAuthn), enterprise SSO, MFA, magic links, organizations, and API keys.",
        endpoints: AiEndpoints { auth_discovery: "/discovery", jwks: "/.well-known/jwks.json" },
        capabilities: enabled_capabilities(),
    };
    match to_json(&index) {
        Ok(body) => json(200, &body),
        Err(err) => error_response(err.into()),
    }
}

/// The auth capabilities advertised to agents — enabled methods + always-on
/// resources.
fn enabled_capabilities() -> Vec<&'static str> {
    let mut caps = vec!["sessions", "organizations", "api-keys", "mfa"];
    if bool_setting("auth_email_enabled", true) {
        caps.push("password");
    }
    if bool_setting("auth_google_enabled", false) {
        caps.push("google");
    }
    if bool_setting("auth_apple_enabled", false) {
        caps.push("apple");
    }
    if bool_setting("auth_solana_enabled", false) {
        caps.push("solana");
    }
    if bool_setting("feature_sso", false) {
        caps.push("sso");
    }
    if bool_setting(AUTH_INSTANTLINK_ENABLED_KEY, false) {
        caps.push("magic-link");
    }
    if webauthn_enabled() {
        caps.push("webauthn");
    }
    caps
}

fn webauthn_enabled() -> bool {
    bool_setting(AUTH_WEBAUTHN_ENABLED_KEY, false) && webauthn_origin_configured()
}

fn webauthn_origin_configured() -> bool {
    str_setting(AUTH_WEBAUTHN_RP_ORIGIN_KEY).is_some() || !super::frontend_url().is_empty()
}

fn bool_setting(key: &str, default: bool) -> bool {
    settings::get(key)
        .ok()
        .flatten()
        .map(|v| {
            let t = v.trim().trim_matches('"');
            t == "true" || t == "1"
        })
        .unwrap_or(default)
}

/// A non-empty string setting (quotes/whitespace trimmed), if set.
fn str_setting(key: &str) -> Option<String> {
    settings::get(key)
        .ok()
        .flatten()
        .map(|v| v.trim().trim_matches('"').to_string())
        .filter(|s| !s.is_empty())
}

/// Operator-configured social-button order, or the default ordering.
fn social_button_order() -> Vec<String> {
    str_setting("ui_social_button_order")
        .map(|value| {
            value
                .split(',')
                .map(|part| part.trim().to_string())
                .filter(|part| !part.is_empty())
                .collect()
        })
        .unwrap_or_else(|| {
            ["webauthn", "google", "apple", "solana"]
                .iter()
                .map(|s| s.to_string())
                .collect()
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn feature_discovery_uses_admin_settings_catalog_keys() {
        assert_eq!(AUTH_INSTANTLINK_ENABLED_KEY, "auth_instantlink_enabled");
        assert_eq!(AUTH_WEBAUTHN_ENABLED_KEY, "auth_webauthn_enabled");
        assert_eq!(AUTH_WEBAUTHN_RP_ORIGIN_KEY, "auth_webauthn_rp_origin");
        assert_eq!(SIGNUP_ACCESS_CODE_ENABLED_KEY, "signup_access_code_enabled");
    }

    #[test]
    fn jwks_response_is_publicly_cacheable_and_contains_only_public_material() {
        let pem = crate::services::jwt::generate_private_key_pem().unwrap();
        let jwt = crate::services::jwt::JwtService::from_pem(
            &pem,
            "cedros-login".into(),
            "cedros".into(),
            900,
        )
        .unwrap();

        let response = jwks_response(&jwt).unwrap();
        assert_eq!(response.status, 200);
        assert!(response.headers.iter().any(|(name, value)| {
            name == "cache-control" && value == "public, max-age=60, must-revalidate"
        }));
        assert!(response.body.contains("\"alg\":\"RS256\""));
        assert!(!response.body.contains("PRIVATE KEY"));
    }
}
