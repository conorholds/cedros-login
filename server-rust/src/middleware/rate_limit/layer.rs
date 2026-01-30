//! Rate limiting layer and service implementation

use axum::{body::Body, extract::ConnectInfo, http::Request, http::Response};
use std::net::SocketAddr;
use tower::{Layer, Service};

use super::types::{RateLimitBackend, RateLimitConfig, RateLimitError, RateLimitResult};
use crate::utils::extract_client_ip;

/// How to extract the rate limit key from a request
#[derive(Clone)]
pub enum KeyExtractor {
    /// Use IP address only
    IpOnly,
    /// Use IP + path
    IpAndPath,
}

/// Layer for applying rate limiting
#[derive(Clone)]
pub struct RateLimitLayer {
    backend: RateLimitBackend,
    config: RateLimitConfig,
    key_extractor: KeyExtractor,
    trust_proxy: bool,
}

impl RateLimitLayer {
    /// Create a new rate limit layer
    pub fn new<B: Into<RateLimitBackend>>(backend: B, config: RateLimitConfig) -> Self {
        Self {
            backend: backend.into(),
            config,
            key_extractor: KeyExtractor::IpAndPath,
            trust_proxy: false,
        }
    }

    /// Set the key extractor
    pub fn with_key_extractor(mut self, extractor: KeyExtractor) -> Self {
        self.key_extractor = extractor;
        self
    }

    /// Set whether to trust proxy headers for client IP
    pub fn with_trust_proxy(mut self, trust_proxy: bool) -> Self {
        self.trust_proxy = trust_proxy;
        self
    }
}

impl<S> Layer<S> for RateLimitLayer {
    type Service = RateLimitService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        RateLimitService {
            inner,
            backend: self.backend.clone(),
            config: self.config.clone(),
            key_extractor: self.key_extractor.clone(),
            trust_proxy: self.trust_proxy,
        }
    }
}

/// Rate limiting service wrapper
#[derive(Clone)]
pub struct RateLimitService<S> {
    inner: S,
    backend: RateLimitBackend,
    config: RateLimitConfig,
    key_extractor: KeyExtractor,
    trust_proxy: bool,
}

impl<S> Service<Request<Body>> for RateLimitService<S>
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
        let backend = self.backend.clone();
        let config = self.config.clone();
        let key_extractor = self.key_extractor.clone();
        let trust_proxy = self.trust_proxy;
        let mut inner = self.inner.clone();

        Box::pin(async move {
            // Build rate limit key
            let key = build_rate_limit_key(&req, key_extractor, trust_proxy);

            // Check rate limit
            let result = backend.check_and_record(&key, &config).await;

            if !result.allowed {
                // Return 429 Too Many Requests
                let error = RateLimitError {
                    code: "RATE_LIMITED",
                    message: "Too many requests. Please try again later.".to_string(),
                    retry_after: result.reset_secs,
                };

                let mut response = axum::response::IntoResponse::into_response(error);
                add_rate_limit_headers(&mut response, &result);
                return Ok(response);
            }

            // Proceed with the request
            let mut response = inner.call(req).await?;
            add_rate_limit_headers(&mut response, &result);
            Ok(response)
        })
    }
}

/// Add rate limit headers to a response
fn add_rate_limit_headers(response: &mut Response<Body>, result: &RateLimitResult) {
    use axum::http::HeaderValue;

    let headers = response.headers_mut();

    // Safe: numeric strings always produce valid header values
    if let Ok(limit) = HeaderValue::from_str(&result.limit.to_string()) {
        headers.insert("X-RateLimit-Limit", limit);
    }
    if let Ok(remaining) = HeaderValue::from_str(&result.remaining.to_string()) {
        headers.insert("X-RateLimit-Remaining", remaining);
    }
    if let Ok(reset) = HeaderValue::from_str(&result.reset_secs.to_string()) {
        headers.insert("X-RateLimit-Reset", reset);
    }
}

fn build_rate_limit_key(
    req: &Request<Body>,
    key_extractor: KeyExtractor,
    trust_proxy: bool,
) -> String {
    let ip = resolve_client_ip(req, trust_proxy);
    let path = req.uri().path();

    match key_extractor {
        KeyExtractor::IpOnly => ip.unwrap_or_else(|| {
            // SEC-007: Warn when client IP cannot be resolved.
            // Unknown IPs share a bucket which maintains rate limiting but could
            // theoretically be DoS'd if attacker can make requests without IP.
            // This is acceptable because:
            // 1. Most deployments have IP from ConnectInfo or proxy headers
            // 2. Unknown IP typically indicates proxy misconfiguration
            // 3. Grouped rate limiting is better than no rate limiting
            tracing::warn!(
                path = path,
                "Rate limit: unable to resolve client IP, using shared fallback key"
            );
            format!("unknown:{}", path)
        }),
        KeyExtractor::IpAndPath => match ip {
            Some(ip) => format!("{}:{}", ip, path),
            None => {
                // SEC-007: Warn when client IP cannot be resolved (see above)
                tracing::warn!(
                    path = path,
                    "Rate limit: unable to resolve client IP, using shared fallback key"
                );
                format!("unknown:{}", path)
            }
        },
    }
}

fn resolve_client_ip(req: &Request<Body>, trust_proxy: bool) -> Option<String> {
    if trust_proxy {
        extract_client_ip(req.headers(), true).or_else(|| {
            req.extensions()
                .get::<ConnectInfo<SocketAddr>>()
                .map(|ci| ci.0.ip().to_string())
        })
    } else {
        req.extensions()
            .get::<ConnectInfo<SocketAddr>>()
            .map(|ci| ci.0.ip().to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::middleware::rate_limit::RateLimitStore;

    #[test]
    fn test_key_extractor_clone() {
        let extractor = KeyExtractor::IpOnly;
        let cloned = extractor.clone();
        assert!(matches!(cloned, KeyExtractor::IpOnly));

        let extractor = KeyExtractor::IpAndPath;
        let cloned = extractor.clone();
        assert!(matches!(cloned, KeyExtractor::IpAndPath));
    }

    #[test]
    fn test_rate_limit_layer_creation() {
        let store = RateLimitStore::new();
        let config = RateLimitConfig {
            limit: 10,
            window_secs: 60,
        };

        let layer = RateLimitLayer::new(store.clone(), config.clone());
        let _ = layer.with_key_extractor(KeyExtractor::IpOnly);
    }

    #[test]
    fn test_build_rate_limit_key_connect_info() {
        let mut req = Request::builder()
            .uri("/login")
            .body(Body::empty())
            .unwrap();
        let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
        req.extensions_mut().insert(ConnectInfo(addr));

        let key = build_rate_limit_key(&req, KeyExtractor::IpOnly, false);
        assert_eq!(key, "127.0.0.1");

        let key = build_rate_limit_key(&req, KeyExtractor::IpAndPath, false);
        assert_eq!(key, "127.0.0.1:/login");
    }

    #[test]
    fn test_build_rate_limit_key_trust_proxy() {
        let mut req = Request::builder()
            .uri("/login")
            .body(Body::empty())
            .unwrap();
        req.headers_mut().insert(
            "x-forwarded-for",
            axum::http::HeaderValue::from_static("192.168.1.10"),
        );

        let key = build_rate_limit_key(&req, KeyExtractor::IpOnly, true);
        assert_eq!(key, "192.168.1.10");
    }

    #[test]
    fn test_build_rate_limit_key_trust_proxy_prefers_xff() {
        let mut req = Request::builder()
            .uri("/login")
            .body(Body::empty())
            .unwrap();
        let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
        req.extensions_mut().insert(ConnectInfo(addr));
        req.headers_mut().insert(
            "x-forwarded-for",
            axum::http::HeaderValue::from_static("203.0.113.9"),
        );

        let key = build_rate_limit_key(&req, KeyExtractor::IpOnly, true);
        assert_eq!(key, "203.0.113.9");
    }

    #[test]
    fn test_build_rate_limit_key_missing_ip_fallback() {
        let req = Request::builder()
            .uri("/login")
            .body(Body::empty())
            .unwrap();

        // When IP cannot be resolved, use shared fallback key per path
        // See SEC-007 comment in build_rate_limit_key for rationale
        let key = build_rate_limit_key(&req, KeyExtractor::IpOnly, false);
        assert_eq!(key, "unknown:/login");

        let key = build_rate_limit_key(&req, KeyExtractor::IpAndPath, false);
        assert_eq!(key, "unknown:/login");
    }
}
