//! WebAuthn relying-party config and browser option builders.
//!
//! The JSON shape intentionally matches `webauthn-rs` from the standalone
//! server: handlers return `{ challengeId, options: { publicKey: ... } }`.

use serde_json::{json, Value};

use super::RouteError;
use crate::exports::cedros::extension::routes::RouteRequest;
use crate::host::settings;
use crate::services::webauthn as rp;

const AUTH_WEBAUTHN_RP_ID_KEY: &str = "auth_webauthn_rp_id";
const AUTH_WEBAUTHN_RP_NAME_KEY: &str = "auth_webauthn_rp_name";
const AUTH_WEBAUTHN_RP_ORIGIN_KEY: &str = "auth_webauthn_rp_origin";
const AUTH_WEBAUTHN_ENABLED_KEY: &str = "auth_webauthn_enabled";

pub(super) const REQUIRE_USER_VERIFICATION: bool = true;
const TIMEOUT_MS: u64 = 300_000;

pub(super) struct WebauthnConfig {
    pub rp_id: String,
    pub rp_name: String,
    pub origins: Vec<String>,
}

pub(super) fn require_enabled() -> Result<(), RouteError> {
    if bool_setting(AUTH_WEBAUTHN_ENABLED_KEY, false) {
        Ok(())
    } else {
        Err(RouteError::Status(404, "webauthn_auth_disabled"))
    }
}

pub(super) fn creation_options(
    cfg: &WebauthnConfig,
    user_id: &str,
    name: &str,
    display_name: &str,
    challenge: &str,
    exclude: &[String],
) -> Value {
    json!({
        "publicKey": {
            "challenge": challenge,
            "rp": { "id": cfg.rp_id, "name": cfg.rp_name },
            "user": {
                "id": rp::b64url_encode(user_id.as_bytes()),
                "name": name,
                "displayName": display_name
            },
            "pubKeyCredParams": [{ "type": "public-key", "alg": rp::ES256 }],
            "timeout": TIMEOUT_MS,
            "attestation": "none",
            "authenticatorSelection": {
                "residentKey": "preferred",
                "userVerification": "required"
            },
            "excludeCredentials": cred_descriptors(exclude),
        }
    })
}

pub(super) fn request_options(cfg: &WebauthnConfig, challenge: &str, allow: &[String]) -> Value {
    json!({
        "publicKey": {
            "challenge": challenge,
            "rpId": cfg.rp_id,
            "timeout": TIMEOUT_MS,
            "userVerification": "required",
            "allowCredentials": cred_descriptors(allow),
        }
    })
}

fn cred_descriptors(ids: &[String]) -> Vec<Value> {
    ids.iter()
        .map(|id| json!({ "type": "public-key", "id": id }))
        .collect()
}

/// Trust only operator-configured origins. The RP ID defaults to that trusted
/// origin's host; malformed or mismatched configuration fails closed.
pub(super) fn config(request: &RouteRequest) -> Result<WebauthnConfig, RouteError> {
    let configured_origin = str_setting(AUTH_WEBAUTHN_RP_ORIGIN_KEY)?;
    let fallback = str_setting("server_frontend_url")?.or(str_setting("frontend_url")?);
    let origin = configured_origin
        .as_deref()
        .or(fallback.as_deref())
        .and_then(normalize_origin)
        .ok_or(RouteError::Status(501, "webauthn_not_configured"))?;
    // Host/Forwarded/Origin are request data, never authority for an RP.
    if let Some(sent) = header_value(request, "origin") {
        if normalize_origin(sent).as_deref() != Some(origin.as_str()) {
            return Err(RouteError::Status(403, "webauthn_origin_mismatch"));
        }
    }
    let rp_id = select_rp_id(str_setting(AUTH_WEBAUTHN_RP_ID_KEY)?.as_deref(), &origin)
        .ok_or(RouteError::Status(501, "webauthn_not_configured"))?;
    let rp_name =
        str_setting(AUTH_WEBAUTHN_RP_NAME_KEY)?.unwrap_or_else(|| "Cedros Login".to_string());
    Ok(WebauthnConfig {
        rp_id,
        rp_name,
        origins: vec![origin],
    })
}

fn str_setting(key: &str) -> Result<Option<String>, RouteError> {
    Ok(settings::get(key)?
        .map(|v| v.trim().trim_matches('"').to_string())
        .filter(|s| !s.is_empty()))
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

fn select_rp_id(configured_rp_id: Option<&str>, origin: &str) -> Option<String> {
    match configured_rp_id {
        Some(rp_id) if is_valid_rp_id(rp_id) && rp_id_matches_origin(rp_id, origin) => {
            Some(rp_id.to_ascii_lowercase())
        }
        Some(_) => None,
        None => Some(host_of(origin)),
    }
}

fn header_value<'a>(request: &'a RouteRequest, name: &str) -> Option<&'a str> {
    request
        .headers
        .iter()
        .find(|(key, _)| key.eq_ignore_ascii_case(name))
        .map(|(_, value)| value.as_str())
}

fn normalize_origin(value: &str) -> Option<String> {
    let url = url::Url::parse(value).ok()?;
    let host = url.host_str()?;
    if !url.username().is_empty()
        || url.password().is_some()
        || url.path() != "/"
        || url.query().is_some()
        || url.fragment().is_some()
        || (url.scheme() != "https"
            && !(url.scheme() == "http" && matches!(host, "localhost" | "127.0.0.1" | "[::1]")))
    {
        return None;
    }
    Some(url.origin().ascii_serialization())
}

fn is_valid_rp_id(rp_id: &str) -> bool {
    let trimmed = rp_id.trim();
    !trimmed.is_empty()
        && !trimmed.contains("://")
        && !trimmed.contains('/')
        && !trimmed.contains(':')
        && !trimmed.contains('@')
}

fn rp_id_matches_origin(rp_id: &str, origin: &str) -> bool {
    let rp_id = rp_id.trim().trim_end_matches('.').to_ascii_lowercase();
    let host = host_of(origin).trim_end_matches('.').to_ascii_lowercase();
    host == rp_id || host.ends_with(&format!(".{rp_id}"))
}

/// The host of an origin URL (`https://app.example.com:8443/x` -> `app.example.com`).
fn host_of(url: &str) -> String {
    let normalized = normalize_origin(url);
    let source = normalized.as_deref().unwrap_or(url);
    let after_scheme = source.split("://").nth(1).unwrap_or(source);
    let host_port = after_scheme
        .split(['/', '?', '#'])
        .next()
        .unwrap_or(after_scheme)
        .trim();
    if let Some(stripped) = host_port.strip_prefix('[') {
        if let Some((host, _)) = stripped.split_once(']') {
            return host.to_string();
        }
    }
    host_port.split(':').next().unwrap_or(host_port).to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn cfg() -> WebauthnConfig {
        WebauthnConfig {
            rp_id: "app.example.com".to_string(),
            rp_name: "Cedros Login".to_string(),
            origins: vec!["https://app.example.com".to_string()],
        }
    }

    #[test]
    fn creation_options_match_standalone_public_key_envelope() {
        let options = creation_options(&cfg(), "user-1", "user", "User", "challenge", &[]);
        assert!(options.get("challenge").is_none());
        let public_key = &options["publicKey"];
        assert_eq!(public_key["challenge"], "challenge");
        assert_eq!(public_key["rp"]["id"], "app.example.com");
        assert_eq!(public_key["user"]["id"], "dXNlci0x");
        assert!(public_key["authenticatorSelection"]
            .get("authenticatorAttachment")
            .is_none());
        assert_eq!(
            public_key["authenticatorSelection"]["userVerification"],
            "required"
        );
    }

    #[test]
    fn request_options_match_standalone_public_key_envelope() {
        let allow = vec!["AQID".to_string()];
        let options = request_options(&cfg(), "challenge", &allow);
        assert!(options.get("rpId").is_none());
        let public_key = &options["publicKey"];
        assert_eq!(public_key["challenge"], "challenge");
        assert_eq!(public_key["rpId"], "app.example.com");
        assert_eq!(public_key["userVerification"], "required");
        assert_eq!(public_key["allowCredentials"][0]["id"], "AQID");
    }

    #[test]
    fn host_of_strips_scheme_path_and_port() {
        assert_eq!(host_of("https://app.example.com"), "app.example.com");
        assert_eq!(
            host_of("https://app.example.com:8443/x/y"),
            "app.example.com"
        );
        assert_eq!(host_of("example.com"), "example.com");
    }

    #[test]
    fn origin_and_rp_configuration_fail_closed() {
        for origin in [
            "http://example.com",
            "https://user@example.com",
            "https://example.com/path",
            "https://example.com?x",
            "https://example.com#x",
            "https://example.com:bad",
        ] {
            assert!(normalize_origin(origin).is_none(), "{origin}");
        }
        assert_eq!(
            normalize_origin("https://example.com:443"),
            Some("https://example.com".into())
        );
        assert_eq!(select_rp_id(Some("evil.test"), "https://example.com"), None);
        assert_eq!(
            select_rp_id(Some("example.com"), "https://app.example.com"),
            Some("example.com".into())
        );
    }

    #[test]
    fn client_headers_cannot_configure_or_override_the_relying_party() {
        crate::host::key_value_test_support::with_values(
            |_, _| Ok(None),
            || {
                assert!(config(&request(vec![
                    ("origin", "https://evil.test"),
                    ("x-forwarded-host", "evil.test")
                ]))
                .is_err());
            },
        );
    }

    #[test]
    fn webauthn_config_uses_admin_settings_catalog_keys() {
        assert_eq!(AUTH_WEBAUTHN_ENABLED_KEY, "auth_webauthn_enabled");
        assert_eq!(AUTH_WEBAUTHN_RP_ID_KEY, "auth_webauthn_rp_id");
        assert_eq!(AUTH_WEBAUTHN_RP_NAME_KEY, "auth_webauthn_rp_name");
        assert_eq!(AUTH_WEBAUTHN_RP_ORIGIN_KEY, "auth_webauthn_rp_origin");
    }

    fn request(headers: Vec<(&str, &str)>) -> RouteRequest {
        RouteRequest {
            route_id: "cedros-login:public-auth-webauthn-auth-options".into(),
            method: "POST".into(),
            path: "/webauthn/auth/options".into(),
            headers: headers
                .into_iter()
                .map(|(key, value)| (key.to_string(), value.to_string()))
                .collect(),
            query: vec![],
            body: String::new(),
            context_json: String::new(),
        }
    }
}
