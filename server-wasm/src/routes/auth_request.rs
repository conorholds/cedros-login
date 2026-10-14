//! Request/header and settings coercion helpers for auth routes.
use crate::exports::cedros::extension::routes::RouteRequest;
use crate::host::settings;

/// The authoritative end-user IP supplied by the host route envelope.
pub(crate) fn client_ip(request: &RouteRequest) -> Option<String> {
    crate::context::RouteContext::parse(&request.context_json)
        .client_ip?
        .parse::<std::net::IpAddr>()
        .ok()
        .map(|address| address.to_string())
}

pub(crate) fn user_agent(request: &RouteRequest) -> Option<String> {
    header(request, "user-agent").map(str::to_string)
}

pub(super) fn setting_u64(key: &str, default: u64) -> u64 {
    settings::get(key)
        .ok()
        .flatten()
        .and_then(|v| v.trim().trim_matches('"').parse().ok())
        .unwrap_or(default)
}

pub(super) fn setting_i64(key: &str, default: i64) -> i64 {
    settings::get(key)
        .ok()
        .flatten()
        .and_then(|v| v.trim().trim_matches('"').parse().ok())
        .unwrap_or(default)
}

pub(crate) fn default_org_id_from_optional_setting(value: Option<String>) -> Option<String> {
    value.and_then(default_org_id_from_setting)
}

pub(crate) fn default_org_id_from_setting(value: String) -> Option<String> {
    let trimmed = value.trim().trim_matches('"').to_string();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    }
}

fn header<'a>(request: &'a RouteRequest, name: &str) -> Option<&'a str> {
    request
        .headers
        .iter()
        .find(|(key, _)| key.eq_ignore_ascii_case(name))
        .map(|(_, value)| value.as_str())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request(context_json: &str) -> RouteRequest {
        RouteRequest {
            route_id: String::new(),
            method: "POST".into(),
            path: "/login".into(),
            headers: vec![("X-Forwarded-For".into(), "198.51.100.99".into())],
            query: vec![],
            body: String::new(),
            context_json: context_json.into(),
        }
    }

    #[test]
    fn client_ip_uses_only_the_authoritative_context_value() {
        assert_eq!(
            client_ip(&request(r#"{"clientIp":"203.0.113.7"}"#)).as_deref(),
            Some("203.0.113.7")
        );
        assert_eq!(
            client_ip(&request(r#"{"clientIp":"2001:db8::1"}"#)).as_deref(),
            Some("2001:db8::1")
        );
        assert!(client_ip(&request(r#"{"clientIp":"attacker-controlled-value"}"#)).is_none());
        assert!(client_ip(&request("{}")).is_none());
    }
}

/// Public authentication requests can establish cookies before a session exists.
/// CORS alone does not stop simple cross-origin POSTs from reaching a handler.
pub(crate) fn require_browser_auth_origin(request: &RouteRequest) -> Result<(), super::RouteError> {
    if matches!(request.method.as_str(), "GET" | "HEAD" | "OPTIONS") {
        return Ok(());
    }
    let Some(origin) = header(request, "origin") else {
        // Native/server clients omit Origin; browser cross-origin writes do not.
        return Ok(());
    };
    let expected = settings::get("server_frontend_url")?
        .or(settings::get("frontend_url")?)
        .and_then(|value| url::Url::parse(value.trim().trim_matches('"')).ok())
        .ok_or(super::RouteError::Status(503, "auth_origin_not_configured"))?;
    let sent = url::Url::parse(origin)
        .map_err(|_| super::RouteError::Status(403, "auth_origin_mismatch"))?;
    if origin == "null"
        || sent.origin() != expected.origin()
        || !matches!(sent.scheme(), "http" | "https")
        || !sent.username().is_empty()
        || sent.password().is_some()
        || sent.path() != "/"
        || sent.query().is_some()
        || sent.fragment().is_some()
    {
        return Err(super::RouteError::Status(403, "auth_origin_mismatch"));
    }
    Ok(())
}

#[cfg(test)]
mod browser_tests {
    use super::*;
    #[test]
    fn browser_login_rejects_cross_site_null_and_malformed_origins() {
        crate::host::key_value_test_support::with_values(
            |_, key| Ok((key == "server_frontend_url").then(|| "https://login.example".into())),
            || {
                for (origin, valid) in [
                    ("https://login.example", true),
                    ("https://evil.example", false),
                    ("null", false),
                    ("https://login.example.evil.test", false),
                    ("https://login.example:444", false),
                    ("https://user@login.example", false),
                ] {
                    let request = RouteRequest {
                        route_id: String::new(),
                        method: "POST".into(),
                        path: "/google".into(),
                        headers: vec![("origin".into(), origin.into())],
                        query: vec![],
                        body: "{}".into(),
                        context_json: "{}".into(),
                    };
                    assert_eq!(
                        require_browser_auth_origin(&request).is_ok(),
                        valid,
                        "{origin}"
                    );
                }
            },
        );
    }
}
