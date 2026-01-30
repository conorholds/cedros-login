//! Cookie building utilities for token storage

use axum::{
    http::{header, HeaderValue},
    response::IntoResponse,
    response::Response,
    Json,
};
use serde::Serialize;

use crate::config::CookieConfig;
use crate::models::TokenPair;

/// S-16/MW-03: Validate cookie domain format.
///
/// Valid domains:
/// - Contain only alphanumeric chars, dots, and hyphens
/// - Have at least 2 domain labels (e.g., `example.com`, not just `com`)
/// - Are not pure TLDs like `.com`, `.org`, `.net`
///
/// # Security (MW-03)
///
/// Overly broad domains like `.com` would make cookies accessible to ALL
/// websites on that TLD - a massive security vulnerability. We require
/// at least 2 labels to ensure cookies are scoped to a specific domain.
pub(crate) fn is_valid_cookie_domain(domain: &str) -> bool {
    if domain.is_empty() {
        return false;
    }

    // Check character validity
    if !domain
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-')
    {
        return false;
    }

    // MW-03: Require at least 2 domain labels
    // Strip leading dot if present (e.g., ".example.com" -> "example.com")
    let stripped = domain.strip_prefix('.').unwrap_or(domain);

    // Reject empty labels (e.g., "example..com" or "example.com.")
    if stripped.split('.').any(|s| s.is_empty()) {
        return false;
    }

    let labels: Vec<&str> = stripped.split('.').collect();

    // Must have at least 2 labels (e.g., "example.com" has 2: ["example", "com"])
    if labels.len() < 2 {
        return false;
    }

    // All labels must be non-empty (handled by filter above) and valid
    // Each label must start and end with alphanumeric (not hyphen)
    labels.iter().all(|label| {
        !label.is_empty()
            && label
                .chars()
                .next()
                .is_some_and(|c| c.is_ascii_alphanumeric())
            && label
                .chars()
                .last()
                .is_some_and(|c| c.is_ascii_alphanumeric())
    })
}

/// Build a Set-Cookie header value for the access token
pub fn build_access_cookie(config: &CookieConfig, token: &str, max_age_secs: u64) -> String {
    let path = access_cookie_path(config);
    build_cookie(
        &config.access_cookie_name,
        token,
        max_age_secs,
        &path,
        config,
        true, // HttpOnly
    )
}

/// Build a Set-Cookie header value for the refresh token
pub fn build_refresh_cookie(config: &CookieConfig, token: &str, max_age_secs: u64) -> String {
    let path = refresh_cookie_path(config);
    build_cookie(
        &config.refresh_cookie_name,
        token,
        max_age_secs,
        &path, // Restrict to refresh endpoint (with optional prefix)
        config,
        true, // HttpOnly
    )
}

/// Build a cookie deletion header (expired cookie)
pub fn build_delete_cookie(config: &CookieConfig, name: &str, path: &str) -> String {
    let mut cookie = format!("{}=deleted; Path={}; Max-Age=0", name, path);

    if config.secure {
        cookie.push_str("; Secure");
    }

    cookie.push_str("; HttpOnly");

    match config.same_site.to_lowercase().as_str() {
        "strict" => cookie.push_str("; SameSite=Strict"),
        "none" => cookie.push_str("; SameSite=None"),
        _ => cookie.push_str("; SameSite=Lax"),
    }

    // S-16: Validate domain before including in cookie
    if let Some(ref domain) = config.domain {
        if is_valid_cookie_domain(domain) {
            cookie.push_str(&format!("; Domain={}", domain));
        } else {
            tracing::warn!(
                domain = %domain,
                "Invalid cookie domain format, skipping Domain attribute"
            );
        }
    }

    cookie
}

/// Build a Set-Cookie header value
fn build_cookie(
    name: &str,
    value: &str,
    max_age_secs: u64,
    path: &str,
    config: &CookieConfig,
    http_only: bool,
) -> String {
    let mut cookie = format!(
        "{}={}; Path={}; Max-Age={}",
        name, value, path, max_age_secs
    );

    if config.secure {
        cookie.push_str("; Secure");
    }

    if http_only {
        cookie.push_str("; HttpOnly");
    }

    match config.same_site.to_lowercase().as_str() {
        "strict" => cookie.push_str("; SameSite=Strict"),
        "none" => cookie.push_str("; SameSite=None"),
        _ => cookie.push_str("; SameSite=Lax"),
    }

    // S-16: Validate domain before including in cookie
    if let Some(ref domain) = config.domain {
        if is_valid_cookie_domain(domain) {
            cookie.push_str(&format!("; Domain={}", domain));
        } else {
            tracing::warn!(
                domain = %domain,
                "Invalid cookie domain format, skipping Domain attribute"
            );
        }
    }

    cookie
}

/// Build both access and refresh cookies for a token pair
pub fn build_token_cookies(
    config: &CookieConfig,
    tokens: &TokenPair,
    refresh_expiry_secs: u64,
) -> Vec<String> {
    vec![
        build_access_cookie(config, &tokens.access_token, tokens.expires_in),
        build_refresh_cookie(config, &tokens.refresh_token, refresh_expiry_secs),
    ]
}

/// Build a JSON response and attach auth cookies when enabled.
pub fn build_json_response_with_cookies<T: Serialize>(
    config: &CookieConfig,
    tokens: &TokenPair,
    refresh_expiry_secs: u64,
    response: T,
) -> Response {
    let resp = Json(response).into_response();
    attach_auth_cookies(config, tokens, refresh_expiry_secs, resp)
}

/// Attach auth cookies to an existing response when enabled.
pub fn attach_auth_cookies(
    config: &CookieConfig,
    tokens: &TokenPair,
    refresh_expiry_secs: u64,
    mut response: Response,
) -> Response {
    if !config.enabled {
        return response;
    }

    let cookies = build_token_cookies(config, tokens, refresh_expiry_secs);
    let headers = response.headers_mut();
    for cookie in cookies {
        match HeaderValue::from_str(&cookie) {
            Ok(value) => {
                headers.append(header::SET_COOKIE, value);
            }
            Err(e) => {
                // R-02: Log serialization failures instead of silently ignoring
                tracing::warn!(
                    error = %e,
                    "Failed to serialize auth cookie header value"
                );
            }
        }
    }
    response
}

/// Build deletion cookies for both access and refresh tokens
pub fn build_logout_cookies(config: &CookieConfig) -> Vec<String> {
    let access_path = access_cookie_path(config);
    let refresh_path = refresh_cookie_path(config);
    vec![
        build_delete_cookie(config, &config.access_cookie_name, &access_path),
        build_delete_cookie(config, &config.refresh_cookie_name, &refresh_path),
    ]
}

fn access_cookie_path(config: &CookieConfig) -> String {
    let trimmed = config.path_prefix.trim_end_matches('/');
    if trimmed.is_empty() {
        "/".to_string()
    } else {
        trimmed.to_string()
    }
}

fn refresh_cookie_path(config: &CookieConfig) -> String {
    let trimmed = config.path_prefix.trim_end_matches('/');
    if trimmed.is_empty() {
        "/refresh".to_string()
    } else {
        format!("{}/refresh", trimmed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::response::Response;

    fn test_config() -> CookieConfig {
        CookieConfig {
            enabled: true,
            domain: None,
            secure: false,
            same_site: "lax".to_string(),
            access_cookie_name: "cedros_access".to_string(),
            refresh_cookie_name: "cedros_refresh".to_string(),
            path_prefix: "".to_string(),
        }
    }

    #[test]
    fn test_build_access_cookie() {
        let config = test_config();
        let cookie = build_access_cookie(&config, "test_token", 900);

        assert!(cookie.contains("cedros_access=test_token"));
        assert!(cookie.contains("Path=/"));
        assert!(cookie.contains("Max-Age=900"));
        assert!(cookie.contains("HttpOnly"));
        assert!(cookie.contains("SameSite=Lax"));
    }

    #[test]
    fn test_access_cookie_with_prefix() {
        let mut config = test_config();
        config.path_prefix = "/auth".to_string();

        let cookie = build_access_cookie(&config, "test_token", 900);
        assert!(cookie.contains("Path=/auth"));

        let logout_cookies = build_logout_cookies(&config);
        assert!(logout_cookies[0].contains("Path=/auth"));
    }

    #[test]
    fn test_build_refresh_cookie() {
        let config = test_config();
        let cookie = build_refresh_cookie(&config, "refresh_token", 604800);

        assert!(cookie.contains("cedros_refresh=refresh_token"));
        assert!(cookie.contains("Path=/refresh"));
        assert!(cookie.contains("Max-Age=604800"));
        assert!(cookie.contains("HttpOnly"));
    }

    #[test]
    fn test_secure_cookie() {
        let mut config = test_config();
        config.secure = true;
        let cookie = build_access_cookie(&config, "token", 900);

        assert!(cookie.contains("Secure"));
    }

    #[test]
    fn test_domain_cookie() {
        let mut config = test_config();
        config.domain = Some(".example.com".to_string());
        let cookie = build_access_cookie(&config, "token", 900);

        assert!(cookie.contains("Domain=.example.com"));
    }

    #[test]
    fn test_same_site_strict() {
        let mut config = test_config();
        config.same_site = "strict".to_string();
        let cookie = build_access_cookie(&config, "token", 900);

        assert!(cookie.contains("SameSite=Strict"));
    }

    #[test]
    fn test_delete_cookie() {
        let config = test_config();
        let cookie = build_delete_cookie(&config, "cedros_access", "/");

        assert!(cookie.contains("cedros_access=deleted"));
        assert!(cookie.contains("Max-Age=0"));
    }

    #[test]
    fn test_refresh_cookie_with_prefix() {
        let mut config = test_config();
        config.path_prefix = "/auth".to_string();

        let cookie = build_refresh_cookie(&config, "refresh_token", 60);
        assert!(cookie.contains("Path=/auth/refresh"));

        let logout_cookies = build_logout_cookies(&config);
        assert!(logout_cookies[1].contains("Path=/auth/refresh"));
    }

    #[test]
    fn test_build_json_response_with_cookies_enabled() {
        let config = test_config();
        let tokens = TokenPair {
            access_token: "access".to_string(),
            refresh_token: "refresh".to_string(),
            expires_in: 60,
        };

        let response = build_json_response_with_cookies(&config, &tokens, 120, "ok");
        let cookie_count = response
            .headers()
            .get_all(header::SET_COOKIE)
            .iter()
            .count();
        assert_eq!(cookie_count, 2);
    }

    #[test]
    fn test_build_json_response_with_cookies_disabled() {
        let mut config = test_config();
        config.enabled = false;
        let tokens = TokenPair {
            access_token: "access".to_string(),
            refresh_token: "refresh".to_string(),
            expires_in: 60,
        };

        let response = build_json_response_with_cookies(&config, &tokens, 120, "ok");
        let cookie_count = response
            .headers()
            .get_all(header::SET_COOKIE)
            .iter()
            .count();
        assert_eq!(cookie_count, 0);
    }

    #[test]
    fn test_attach_auth_cookies_on_non_json_response() {
        let config = test_config();
        let tokens = TokenPair {
            access_token: "access".to_string(),
            refresh_token: "refresh".to_string(),
            expires_in: 60,
        };

        let response = Response::new(Body::empty());
        let response = attach_auth_cookies(&config, &tokens, 120, response);
        let cookie_count = response
            .headers()
            .get_all(header::SET_COOKIE)
            .iter()
            .count();
        assert_eq!(cookie_count, 2);
    }

    #[test]
    fn test_is_valid_cookie_domain() {
        // Valid domains
        assert!(is_valid_cookie_domain(".example.com"));
        assert!(is_valid_cookie_domain("example.com"));
        assert!(is_valid_cookie_domain("sub-domain.example.com"));
        assert!(is_valid_cookie_domain("example123.com"));
        assert!(is_valid_cookie_domain("a.b.c.example.com"));

        // Invalid domains (S-16 - character validation)
        assert!(!is_valid_cookie_domain(""));
        assert!(!is_valid_cookie_domain("example.com; Secure"));
        assert!(!is_valid_cookie_domain("example.com\nEvil: header"));
        assert!(!is_valid_cookie_domain("example com"));

        // Invalid domains (MW-03 - structural validation)
        assert!(!is_valid_cookie_domain(".com")); // Pure TLD
        assert!(!is_valid_cookie_domain(".org")); // Pure TLD
        assert!(!is_valid_cookie_domain("com")); // Single label
        assert!(!is_valid_cookie_domain(".")); // Empty labels
        assert!(!is_valid_cookie_domain("example..com")); // Empty label
        assert!(!is_valid_cookie_domain("example.com.")); // Trailing dot
        assert!(!is_valid_cookie_domain("-example.com")); // Label starts with hyphen
        assert!(!is_valid_cookie_domain("example-.com")); // Label ends with hyphen
    }
}
