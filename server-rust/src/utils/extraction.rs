//! Request extraction utilities for tokens, cookies, and client IP

use axum::{
    extract::{ConnectInfo, FromRequestParts},
    http::{header, request::Parts, HeaderMap},
};
use std::convert::Infallible;
use std::future;
use std::net::{IpAddr, SocketAddr};

/// Extract access token from Authorization header or cookie
pub fn extract_access_token(headers: &HeaderMap, cookie_name: &str) -> Option<String> {
    // First try Authorization header
    if let Some(auth_header) = headers.get(header::AUTHORIZATION) {
        if let Ok(auth_str) = auth_header.to_str() {
            if let Some(token) = auth_str.strip_prefix("Bearer ") {
                return Some(token.to_string());
            }
        }
    }

    // Fall back to cookie
    extract_cookie(headers, cookie_name)
}

/// Maximum cookie value length (4KB - standard browser limit)
const MAX_COOKIE_VALUE_LEN: usize = 4096;

/// SEC-02: Maximum total Cookie header length (16KB)
/// This prevents DoS from oversized headers causing excessive memory allocation
/// during parsing. Most HTTP servers already limit header size, but this provides
/// defense-in-depth.
const MAX_COOKIE_HEADER_LEN: usize = 16 * 1024;

/// Extract a cookie value by name from headers
pub fn extract_cookie(headers: &HeaderMap, name: &str) -> Option<String> {
    for cookie_header in headers.get_all(header::COOKIE).iter() {
        let Ok(cookies) = cookie_header.to_str() else {
            continue;
        };
        // SEC-02: Reject oversized cookie headers before parsing
        if cookies.len() > MAX_COOKIE_HEADER_LEN {
            return None;
        }
        for cookie in cookies.split(';') {
            let cookie = cookie.trim();
            if let Some(value) = cookie.strip_prefix(&format!("{}=", name)) {
                // Validate length to prevent excessive memory allocation
                if value.len() > MAX_COOKIE_VALUE_LEN {
                    return None;
                }
                return Some(value.to_string());
            }
        }
    }
    None
}

/// Extract peer IP address from request extensions (if available).
#[derive(Debug, Clone, Copy)]
pub struct PeerIp(pub Option<IpAddr>);

impl<S> FromRequestParts<S> for PeerIp
where
    S: Send + Sync,
{
    type Rejection = Infallible;

    fn from_request_parts(
        parts: &mut Parts,
        _state: &S,
    ) -> impl std::future::Future<Output = Result<Self, Self::Rejection>> + Send {
        let ip = parts
            .extensions
            .get::<ConnectInfo<SocketAddr>>()
            .map(|info| info.0.ip());
        future::ready(Ok(PeerIp(ip)))
    }
}

/// Maximum length for IP address strings (IPv6 max is ~45 chars)
const MAX_IP_LEN: usize = 64;

/// Extract and validate client IP address from X-Forwarded-For header.
///
/// # Security
/// - Only returns a valid IP address (IPv4 or IPv6)
/// - Takes only the first address from the header (client IP)
/// - Returns None for invalid/malformed addresses
/// - Should only be used when trust_proxy is true
///
/// # Arguments
/// * `headers` - Request headers
/// * `trust_proxy` - Whether to trust X-Forwarded-For header
pub fn extract_client_ip(headers: &HeaderMap, trust_proxy: bool) -> Option<String> {
    if !trust_proxy {
        return None;
    }

    headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| {
            // Take only the first IP (leftmost = client IP)
            let first_ip = s.split(',').next()?.trim();

            // Validate length to prevent parsing attacks
            if first_ip.len() > MAX_IP_LEN {
                return None;
            }

            // S-07: Parse and return canonical form for consistent storage
            let parsed = first_ip.parse::<IpAddr>().ok()?;

            Some(parsed.to_string())
        })
}

/// Extract client IP using proxy headers when trusted, otherwise fallback to peer IP.
pub fn extract_client_ip_with_fallback(
    headers: &HeaderMap,
    trust_proxy: bool,
    peer_ip: Option<IpAddr>,
) -> Option<String> {
    extract_client_ip(headers, trust_proxy).or_else(|| peer_ip.map(|ip| ip.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::HeaderValue;

    #[test]
    fn test_extract_access_token_from_bearer_header() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_static("Bearer test-access-token"),
        );

        let token = extract_access_token(&headers, "cedros_access");
        assert_eq!(token, Some("test-access-token".to_string()));
    }

    #[test]
    fn test_extract_access_token_from_cookie() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::COOKIE,
            HeaderValue::from_static("cedros_access=cookie-token; other=value"),
        );

        let token = extract_access_token(&headers, "cedros_access");
        assert_eq!(token, Some("cookie-token".to_string()));
    }

    #[test]
    fn test_extract_access_token_prefers_header() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_static("Bearer header-token"),
        );
        headers.insert(
            header::COOKIE,
            HeaderValue::from_static("cedros_access=cookie-token"),
        );

        let token = extract_access_token(&headers, "cedros_access");
        assert_eq!(token, Some("header-token".to_string()));
    }

    #[test]
    fn test_extract_access_token_none_when_missing() {
        let headers = HeaderMap::new();
        let token = extract_access_token(&headers, "cedros_access");
        assert_eq!(token, None);
    }

    #[test]
    fn test_extract_access_token_none_for_invalid_bearer() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_static("Basic credentials"),
        );

        let token = extract_access_token(&headers, "cedros_access");
        assert_eq!(token, None);
    }

    #[test]
    fn test_extract_cookie_single() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::COOKIE,
            HeaderValue::from_static("my_cookie=my_value"),
        );

        let value = extract_cookie(&headers, "my_cookie");
        assert_eq!(value, Some("my_value".to_string()));
    }

    #[test]
    fn test_extract_cookie_multiple() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::COOKIE,
            HeaderValue::from_static("first=1; second=2; third=3"),
        );

        assert_eq!(extract_cookie(&headers, "first"), Some("1".to_string()));
        assert_eq!(extract_cookie(&headers, "second"), Some("2".to_string()));
        assert_eq!(extract_cookie(&headers, "third"), Some("3".to_string()));
    }

    #[test]
    fn test_extract_cookie_multiple_headers() {
        let mut headers = HeaderMap::new();
        headers.append(header::COOKIE, HeaderValue::from_static("a=1"));
        headers.append(header::COOKIE, HeaderValue::from_static("b=2"));

        assert_eq!(extract_cookie(&headers, "a"), Some("1".to_string()));
        assert_eq!(extract_cookie(&headers, "b"), Some("2".to_string()));
    }

    #[test]
    fn test_extract_cookie_with_leading_space() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::COOKIE,
            HeaderValue::from_static("first=1;  spaced=value;  other=test"),
        );

        let value = extract_cookie(&headers, "spaced");
        assert_eq!(value, Some("value".to_string()));
    }

    #[test]
    fn test_extract_cookie_not_found() {
        let mut headers = HeaderMap::new();
        headers.insert(header::COOKIE, HeaderValue::from_static("other=value"));

        let value = extract_cookie(&headers, "missing");
        assert_eq!(value, None);
    }

    #[test]
    fn test_extract_cookie_empty_headers() {
        let headers = HeaderMap::new();
        let value = extract_cookie(&headers, "any");
        assert_eq!(value, None);
    }

    #[test]
    fn test_extract_cookie_rejects_oversized_header() {
        // SEC-02: Cookie headers over 16KB should be rejected
        let mut headers = HeaderMap::new();
        let oversized = "a".repeat(17 * 1024); // 17KB
        headers.insert(
            header::COOKIE,
            HeaderValue::from_str(&format!("my_cookie={}", oversized)).unwrap(),
        );
        assert_eq!(extract_cookie(&headers, "my_cookie"), None);
    }

    #[test]
    fn test_extract_client_ip_valid_ipv4() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", HeaderValue::from_static("192.168.1.1"));
        assert_eq!(
            extract_client_ip(&headers, true),
            Some("192.168.1.1".to_string())
        );
    }

    #[test]
    fn test_extract_client_ip_valid_ipv6() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", HeaderValue::from_static("::1"));
        assert_eq!(extract_client_ip(&headers, true), Some("::1".to_string()));
    }

    #[test]
    fn test_extract_client_ip_multiple_takes_first() {
        let mut headers = HeaderMap::new();
        headers.insert(
            "x-forwarded-for",
            HeaderValue::from_static("10.0.0.1, 192.168.1.1, 172.16.0.1"),
        );
        assert_eq!(
            extract_client_ip(&headers, true),
            Some("10.0.0.1".to_string())
        );
    }

    #[test]
    fn test_extract_client_ip_rejects_invalid() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", HeaderValue::from_static("not-an-ip"));
        assert_eq!(extract_client_ip(&headers, true), None);
    }

    #[test]
    fn test_extract_client_ip_rejects_script() {
        let mut headers = HeaderMap::new();
        headers.insert(
            "x-forwarded-for",
            HeaderValue::from_static("<script>alert(1)</script>"),
        );
        assert_eq!(extract_client_ip(&headers, true), None);
    }

    #[test]
    fn test_extract_client_ip_with_fallback_uses_peer_ip() {
        let headers = HeaderMap::new();
        let peer_ip = Some("203.0.113.10".parse::<IpAddr>().unwrap());
        assert_eq!(
            extract_client_ip_with_fallback(&headers, false, peer_ip),
            Some("203.0.113.10".to_string())
        );
    }

    #[test]
    fn test_extract_client_ip_with_fallback_prefers_proxy() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", HeaderValue::from_static("192.0.2.1"));
        let peer_ip = Some("203.0.113.10".parse::<IpAddr>().unwrap());
        assert_eq!(
            extract_client_ip_with_fallback(&headers, true, peer_ip),
            Some("192.0.2.1".to_string())
        );
    }

    #[test]
    fn test_extract_client_ip_respects_trust_proxy_false() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", HeaderValue::from_static("192.168.1.1"));
        assert_eq!(extract_client_ip(&headers, false), None);
    }

    #[test]
    fn test_extract_client_ip_none_when_missing() {
        let headers = HeaderMap::new();
        assert_eq!(extract_client_ip(&headers, true), None);
    }
}
