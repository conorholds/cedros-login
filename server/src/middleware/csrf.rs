//! CSRF protection middleware (double-submit cookie)
//!
//! # Security Design
//!
//! The CSRF token cookie is intentionally **not HttpOnly**. This is required for
//! the double-submit cookie pattern:
//!
//! 1. Server sets CSRF token in a non-HttpOnly cookie (readable by JavaScript)
//! 2. Client reads the cookie and sends the value in X-CSRF-Token header
//! 3. Server validates that cookie value matches header value
//!
//! Since attackers cannot read cookies from other domains (Same-Origin Policy),
//! they cannot include the correct header value in forged requests. The token
//! being readable by JavaScript on the same origin is safe because:
//!
//! - XSS on the same origin would already have access to session cookies
//! - The threat model is cross-site request forgery, not same-site attacks
//! - HttpOnly would break the pattern (client couldn't read the token)
//!
//! The SameSite=Strict attribute on the cookie adds defense-in-depth by
//! preventing the browser from sending the cookie on cross-site requests.
//!
use axum::{
    body::Body,
    http::{header, Method, Request, Response},
    response::IntoResponse,
};
use rand::{distributions::Alphanumeric, rngs::OsRng, Rng};
use tower::{Layer, Service};

use crate::config::CookieConfig;
use crate::errors::AppError;
use crate::utils::{extract_cookie, is_valid_cookie_domain};

const CSRF_COOKIE_NAME: &str = "XSRF-TOKEN";
const CSRF_HEADER_NAME: &str = "x-csrf-token";

/// CSRF cookie max-age in seconds (default: 24 hours)
///
/// This value determines how long the CSRF token cookie remains valid.
/// A shorter duration (e.g., 1 hour) improves security but may cause
/// issues for long-lived browser tabs. A longer duration (e.g., 7 days)
/// improves UX but extends the window for token compromise.
///
/// Current default of 24 hours balances security and usability for
/// typical web application usage patterns. For applications requiring
/// stricter security, consider adding a configuration option.
const CSRF_COOKIE_MAX_AGE_SECS: u64 = 60 * 60 * 24; // 24 hours

/// CSRF protection layer for cookie-based auth.
#[derive(Clone)]
pub struct CsrfLayer {
    cookie_config: CookieConfig,
    trusted_origins: Vec<String>,
}

impl CsrfLayer {
    pub fn new(cookie_config: CookieConfig) -> Self {
        Self {
            cookie_config,
            trusted_origins: Vec::new(),
        }
    }
    /// Trusted browser origins also protect login before an auth cookie exists.
    pub fn with_trusted_origins(mut self, origins: impl IntoIterator<Item = String>) -> Self {
        self.trusted_origins = origins
            .into_iter()
            .filter_map(|value| {
                let url = url::Url::parse(&value).ok()?;
                matches!(url.scheme(), "https" | "http").then(|| url.origin().ascii_serialization())
            })
            .collect();
        self
    }
}

impl<S> Layer<S> for CsrfLayer {
    type Service = CsrfService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        CsrfService {
            inner,
            cookie_config: self.cookie_config.clone(),
            trusted_origins: self.trusted_origins.clone(),
        }
    }
}

#[derive(Clone)]
pub struct CsrfService<S> {
    inner: S,
    cookie_config: CookieConfig,
    trusted_origins: Vec<String>,
}

impl<S> Service<Request<Body>> for CsrfService<S>
where
    S: Service<Request<Body>, Response = Response<Body>> + Clone + Send + 'static,
    S::Future: Send,
{
    type Response = Response<Body>;
    type Error = S::Error;
    type Future = std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<Self::Response, Self::Error>> + Send>,
    >;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: Request<Body>) -> Self::Future {
        let cookie_config = self.cookie_config.clone();
        let trusted_origins = self.trusted_origins.clone();
        let mut inner = self.inner.clone();

        Box::pin(async move {
            if !matches!(*req.method(), Method::GET | Method::HEAD | Method::OPTIONS)
                && !browser_origin_allowed(req.headers(), &trusted_origins)
            {
                return Ok(AppError::Forbidden("Untrusted browser origin".into()).into_response());
            }
            if !cookie_config.enabled {
                return inner.call(req).await;
            }

            let method = req.method().clone();
            let headers = req.headers();

            let csrf_cookie = extract_cookie(headers, CSRF_COOKIE_NAME);
            let csrf_header = headers
                .get(CSRF_HEADER_NAME)
                .and_then(|v| v.to_str().ok())
                .map(str::to_string);

            // Check if auth cookies are present (hybrid auth scenario)
            let has_auth_cookie = extract_cookie(headers, &cookie_config.access_cookie_name)
                .is_some()
                || extract_cookie(headers, &cookie_config.refresh_cookie_name).is_some();

            let is_safe_method = matches!(method, Method::GET | Method::HEAD | Method::OPTIONS);

            // CSRF protection only applies to cookie-authenticated requests.
            // This prevents cross-site request forgery for browser sessions while
            // allowing non-browser callers (e.g. webhooks) that do not use auth cookies.
            if has_auth_cookie && !is_safe_method {
                match (csrf_cookie.as_deref(), csrf_header.as_deref()) {
                    (Some(cookie), Some(header)) if cookie == header => {}
                    _ => {
                        let mut response =
                            AppError::Forbidden("Invalid or missing CSRF token".into())
                                .into_response();
                        if csrf_cookie.is_none() {
                            let token = generate_token();
                            if let Ok(value) = header::HeaderValue::from_str(&build_csrf_cookie(
                                &cookie_config,
                                &token,
                            )) {
                                response.headers_mut().append(header::SET_COOKIE, value);
                            }
                        }
                        return Ok(response);
                    }
                }
            }

            let mut response = inner.call(req).await?;

            if csrf_cookie.is_none() {
                let token = generate_token();
                if let Ok(value) =
                    header::HeaderValue::from_str(&build_csrf_cookie(&cookie_config, &token))
                {
                    response.headers_mut().append(header::SET_COOKIE, value);
                }
            }

            Ok(response)
        })
    }
}

fn browser_origin_allowed(headers: &axum::http::HeaderMap, trusted: &[String]) -> bool {
    let mut origins = headers.get_all(header::ORIGIN).iter();
    let Some(origin) = origins.next() else {
        return true;
    };
    if origins.next().is_some() {
        return false;
    }
    let Ok(value) = origin.to_str() else {
        return false;
    };
    let Ok(url) = url::Url::parse(value) else {
        return false;
    };
    matches!(url.scheme(), "http" | "https")
        && url.username().is_empty()
        && url.password().is_none()
        && url.path() == "/"
        && url.query().is_none()
        && url.fragment().is_none()
        && trusted.contains(&url.origin().ascii_serialization())
}

fn generate_token() -> String {
    // Increase entropy to 262 bits (matching refresh tokens)
    // 44 alphanumeric chars = log2(62^44) ≈ 262 bits
    // Use OsRng for cryptographic random generation
    OsRng
        .sample_iter(&Alphanumeric)
        .take(44)
        .map(char::from)
        .collect()
}

fn build_csrf_cookie(config: &CookieConfig, token: &str) -> String {
    let path = csrf_cookie_path(config);
    let mut cookie =
        format!("{CSRF_COOKIE_NAME}={token}; Path={path}; Max-Age={CSRF_COOKIE_MAX_AGE_SECS}");

    if config.secure {
        cookie.push_str("; Secure");
    }

    match config.same_site.to_lowercase().as_str() {
        "strict" => cookie.push_str("; SameSite=Strict"),
        "none" => cookie.push_str("; SameSite=None"),
        _ => cookie.push_str("; SameSite=Lax"),
    }

    // Validate domain before including in cookie
    if let Some(ref domain) = config.domain {
        if is_valid_cookie_domain(domain) {
            cookie.push_str(&format!("; Domain={domain}"));
        } else {
            tracing::warn!(
                domain = %domain,
                "Invalid CSRF cookie domain format, skipping Domain attribute"
            );
        }
    }

    cookie
}

fn csrf_cookie_path(config: &CookieConfig) -> String {
    let trimmed = config.path_prefix.trim_end_matches('/');
    if trimmed.is_empty() {
        "/".to_string()
    } else {
        trimmed.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{routing::get, routing::post, Router};
    use http_body_util::BodyExt;
    use tower::ServiceExt;

    fn cookie_config() -> CookieConfig {
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

    #[tokio::test]
    async fn test_sets_csrf_cookie_on_safe_request() {
        let app = Router::new()
            .route("/", get(|| async { "ok" }))
            .layer(CsrfLayer::new(cookie_config()));

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .method(Method::GET)
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        let header_value = response.headers().get(header::SET_COOKIE).unwrap();
        assert!(header_value.to_str().unwrap().contains("XSRF-TOKEN="));
    }

    #[tokio::test]
    async fn test_csrf_cookie_path_respects_prefix() {
        let mut config = cookie_config();
        config.path_prefix = "/auth".to_string();

        let app = Router::new()
            .route("/", get(|| async { "ok" }))
            .layer(CsrfLayer::new(config));

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .method(Method::GET)
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        let header_value = response.headers().get(header::SET_COOKIE).unwrap();
        assert!(header_value.to_str().unwrap().contains("Path=/auth"));
    }

    #[tokio::test]
    async fn test_blocks_missing_csrf_on_unsafe_request() {
        let app = Router::new()
            .route("/", post(|| async { "ok" }))
            .layer(CsrfLayer::new(cookie_config()));

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .method(Method::POST)
                    .header(
                        header::COOKIE,
                        "cedros_access=session123; XSRF-TOKEN=abc123",
                    )
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), axum::http::StatusCode::FORBIDDEN);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        assert!(std::str::from_utf8(&body)
            .unwrap()
            .contains("Invalid or missing CSRF token"));
    }

    #[tokio::test]
    async fn test_blocks_missing_csrf_cookie_on_unsafe_request() {
        let app = Router::new()
            .route("/", post(|| async { "ok" }))
            .layer(CsrfLayer::new(cookie_config()));

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .method(Method::POST)
                    .header(CSRF_HEADER_NAME, "abc123")
                    .header(header::COOKIE, "cedros_access=session123")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), axum::http::StatusCode::FORBIDDEN);
    }

    #[tokio::test]
    async fn test_missing_csrf_sets_cookie_on_forbidden() {
        let app = Router::new()
            .route("/", post(|| async { "ok" }))
            .layer(CsrfLayer::new(cookie_config()));

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .method(Method::POST)
                    .header(header::COOKIE, "cedros_access=session123")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), axum::http::StatusCode::FORBIDDEN);
        let header_value = response.headers().get(header::SET_COOKIE).unwrap();
        assert!(header_value.to_str().unwrap().contains("XSRF-TOKEN="));
    }

    #[tokio::test]
    async fn test_allows_valid_csrf_on_unsafe_request() {
        let app = Router::new()
            .route("/", post(|| async { "ok" }))
            .layer(CsrfLayer::new(cookie_config()));

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .method(Method::POST)
                    .header(
                        header::COOKIE,
                        "cedros_access=session123; XSRF-TOKEN=abc123",
                    )
                    .header(CSRF_HEADER_NAME, "abc123")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), axum::http::StatusCode::OK);
    }

    #[test]
    fn test_csrf_token_length() {
        // Verify token has 44 chars for 262-bit entropy
        let token = generate_token();
        assert_eq!(
            token.len(),
            44,
            "CSRF token should be 44 chars for 262-bit entropy"
        );
    }

    #[test]
    fn test_csrf_token_uniqueness() {
        // Verify tokens are unique
        let mut tokens = std::collections::HashSet::new();
        for _ in 0..1000 {
            let token = generate_token();
            assert!(tokens.insert(token), "Generated duplicate CSRF token");
        }
    }

    #[tokio::test]
    async fn test_csrf_required_with_hybrid_auth() {
        // CSRF should be required even with Authorization header if cookies present
        let mut config = cookie_config();
        config.access_cookie_name = "cedros_access".to_string();

        let app = Router::new()
            .route("/", post(|| async { "ok" }))
            .layer(CsrfLayer::new(config));

        // Request with both Authorization header AND auth cookie - CSRF required
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .method(Method::POST)
                    .header(header::AUTHORIZATION, "Bearer token123")
                    .header(header::COOKIE, "cedros_access=session123")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        // Should be blocked without CSRF token (hybrid auth)
        assert_eq!(response.status(), axum::http::StatusCode::FORBIDDEN);
    }

    #[tokio::test]
    async fn test_csrf_skipped_for_pure_token_auth() {
        // CSRF is not required when no auth cookies are present.
        let config = cookie_config();

        let app = Router::new()
            .route("/", post(|| async { "ok" }))
            .layer(CsrfLayer::new(config));

        // Request with only Authorization header, no cookies
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .method(Method::POST)
                    .header(header::AUTHORIZATION, "Bearer token123")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        // Should be allowed without CSRF token (pure token auth)
        assert_eq!(response.status(), axum::http::StatusCode::OK);
    }

    #[tokio::test]
    async fn test_csrf_not_required_without_auth_cookies() {
        // External service callers (e.g. webhooks) do not use auth cookies.
        // Ensure they are not blocked by CSRF middleware when cookie auth is enabled.
        let app = Router::new()
            .route("/", post(|| async { "ok" }))
            .layer(CsrfLayer::new(cookie_config()));

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .method(Method::POST)
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), axum::http::StatusCode::OK);
    }

    #[tokio::test]
    async fn test_csrf_success_with_hybrid_auth_and_valid_token() {
        // Comprehensive test - hybrid auth succeeds when CSRF token is valid
        let mut config = cookie_config();
        config.access_cookie_name = "cedros_access".to_string();
        let csrf_token = generate_token();

        let app = Router::new()
            .route("/", post(|| async { "ok" }))
            .layer(CsrfLayer::new(config));

        // Request with Authorization header + auth cookie + valid CSRF token
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .method(Method::POST)
                    .header(header::AUTHORIZATION, "Bearer token123")
                    .header(
                        header::COOKIE,
                        format!("cedros_access=session123; {CSRF_COOKIE_NAME}={csrf_token}"),
                    )
                    .header("X-CSRF-Token", &csrf_token)
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        // Should succeed with valid CSRF token in hybrid auth
        assert_eq!(response.status(), axum::http::StatusCode::OK);
    }

    #[tokio::test]
    async fn test_csrf_cookie_only_auth_requires_token() {
        // Cookie-only auth (no Authorization header) requires CSRF
        let mut config = cookie_config();
        config.access_cookie_name = "cedros_access".to_string();

        let app = Router::new()
            .route("/", post(|| async { "ok" }))
            .layer(CsrfLayer::new(config));

        // Request with only auth cookie, no Authorization header
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .method(Method::POST)
                    .header(header::COOKIE, "cedros_access=session123")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        // Should be blocked without CSRF token
        assert_eq!(response.status(), axum::http::StatusCode::FORBIDDEN);
    }

    #[test]
    fn test_build_csrf_cookie_rejects_invalid_domain() {
        // Invalid domains should not be included in cookie
        let mut config = cookie_config();
        config.domain = Some(".com".to_string()); // Pure TLD - invalid

        let cookie = build_csrf_cookie(&config, "test_token");

        // Should NOT contain Domain attribute for invalid domain
        assert!(
            !cookie.contains("Domain="),
            "Invalid domain .com should be rejected"
        );
    }

    #[test]
    fn test_build_csrf_cookie_accepts_valid_domain() {
        // Valid domains should be included in cookie
        let mut config = cookie_config();
        config.domain = Some(".example.com".to_string());

        let cookie = build_csrf_cookie(&config, "test_token");

        // Should contain Domain attribute for valid domain
        assert!(
            cookie.contains("Domain=.example.com"),
            "Valid domain should be included"
        );
    }
    #[tokio::test]
    async fn browser_login_requires_trusted_origin_before_any_cookie_exists() {
        for (origin, expected) in [
            ("https://login.example", 200),
            ("https://evil.example", 403),
            ("null", 403),
            ("https://login.example.evil.test", 403),
            ("https://login.example:444", 403),
            ("https://user@login.example", 403),
            ("https://login.example/path", 403),
        ] {
            let app = Router::new().route("/", post(|| async { "ok" })).layer(
                CsrfLayer::new(cookie_config())
                    .with_trusted_origins(["https://login.example".into()]),
            );
            let response = app
                .oneshot(
                    Request::builder()
                        .uri("/")
                        .method(Method::POST)
                        .header(header::ORIGIN, origin)
                        .body(Body::empty())
                        .unwrap(),
                )
                .await
                .unwrap();
            assert_eq!(response.status().as_u16(), expected, "{origin}");
        }
    }
}
