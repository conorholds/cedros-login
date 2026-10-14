use std::sync::Arc;

use axum::http::{header, HeaderValue, Method};
use axum::{middleware, Extension, Router};
use tower_http::cors::{AllowOrigin, Any, CorsLayer};
use tower_http::set_header::SetResponseHeaderLayer;
use tower_http::trace::TraceLayer;

use crate::callback::AuthCallback;
#[cfg(feature = "redis-rate-limit")]
use crate::middleware::rate_limit::RedisRateLimitStore;
use crate::middleware::rate_limit::{
    KeyExtractor, RateLimitBackend, RateLimitConfig as MiddlewareRateLimitConfig, RateLimitLayer,
    RateLimitStore,
};
use crate::middleware::request_id::RequestIdLayer;
use crate::middleware::{record_http_metrics, CsrfLayer};
use crate::services::{EmailDeliveryCapability, EmailService};
use crate::AppState;

pub(super) fn cors<C: AuthCallback + 'static, E: EmailService + 'static>(
    state: &AppState<C, E>,
) -> CorsLayer {
    let headers = [
        header::CONTENT_TYPE,
        header::AUTHORIZATION,
        header::ACCEPT,
        header::COOKIE,
        header::IF_MATCH,
        header::HeaderName::from_static("x-csrf-token"),
        header::HeaderName::from_static("idempotency-key"),
    ];
    let methods = [
        Method::GET,
        Method::POST,
        Method::PUT,
        Method::PATCH,
        Method::DELETE,
        Method::OPTIONS,
    ];

    if state.config.cors.allowed_origins.is_empty() {
        tracing::warn!(
            "CORS_ORIGINS not configured - allowing any origin (wildcard). \
             This is only acceptable for local development. \
             Set CORS_ORIGINS to a comma-separated list of allowed origins for production."
        );
        CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(methods)
            .allow_headers(headers)
    } else {
        let origins = state
            .config
            .cors
            .allowed_origins
            .iter()
            .filter_map(|origin| origin.parse().ok())
            .collect::<Vec<_>>();
        CorsLayer::new()
            .allow_origin(AllowOrigin::list(origins))
            .allow_methods(methods)
            .allow_headers(headers)
            .allow_credentials(true)
    }
}

pub(super) fn rate_limits<C: AuthCallback + 'static, E: EmailService + 'static>(
    state: &AppState<C, E>,
) -> (RateLimitLayer, RateLimitLayer) {
    let backend = rate_limit_backend(&state.config.rate_limit);
    let replicas = RateLimitStore::replicas_hint();
    let auth = state
        .settings_service
        .get_cached_u32_sync("rate_limit_auth")
        .unwrap_or_else(crate::config::default_auth_limit);
    let general = state
        .settings_service
        .get_cached_u32_sync("rate_limit_general")
        .unwrap_or_else(crate::config::default_general_limit);
    let window_secs = state
        .settings_service
        .get_cached_u64_sync("rate_limit_window")
        .unwrap_or_else(crate::config::default_window_secs);
    let auth = per_replica_limit(auth, replicas, "auth", &backend);
    let general = per_replica_limit(general, replicas, "general", &backend);
    let trust_proxy = state.config.server.trust_proxy;

    (
        RateLimitLayer::new(
            backend.clone(),
            MiddlewareRateLimitConfig {
                limit: auth,
                window_secs,
            },
        )
        .with_key_extractor(KeyExtractor::Authentication)
        .with_trust_proxy(trust_proxy),
        RateLimitLayer::new(
            backend,
            MiddlewareRateLimitConfig {
                limit: general,
                window_secs,
            },
        )
        .with_key_extractor(KeyExtractor::IpOnly)
        .with_trust_proxy(trust_proxy),
    )
}

fn per_replica_limit(
    configured: u32,
    replicas: u32,
    kind: &str,
    backend: &RateLimitBackend,
) -> u32 {
    // Distributed counters already enforce the cluster-wide allowance.
    if replicas <= 1 || !matches!(backend, RateLimitBackend::Memory(_)) {
        return configured;
    }
    let effective = std::cmp::max(1, configured / replicas);
    if kind == "auth" && configured < replicas {
        tracing::warn!(
            configured = configured,
            effective_per_instance = effective,
            replicas = replicas,
            "Rate limit per replica is less than 1; floored to 1 (higher than configured)"
        );
    } else if effective != configured {
        tracing::warn!(
            configured = configured,
            effective_per_instance = effective,
            replicas = replicas,
            "Rate limit adjusted per instance due to multi-instance deployment"
        );
    }
    effective
}

pub(super) fn apply<C: AuthCallback + 'static, E: EmailService + 'static>(
    routed: Router<Arc<AppState<C, E>>>,
    state: Arc<AppState<C, E>>,
    cors: CorsLayer,
    email_delivery: EmailDeliveryCapability,
) -> Router {
    let router = routed
        .layer(
            CsrfLayer::new(state.config.cookie.clone()).with_trusted_origins(
                state
                    .config
                    .cors
                    .allowed_origins
                    .iter()
                    .cloned()
                    .chain(state.config.server.frontend_url.clone()),
            ),
        )
        .layer(middleware::from_fn(record_http_metrics))
        .layer(RequestIdLayer::new())
        .layer(TraceLayer::new_for_http().make_span_with(
            |request: &axum::http::Request<axum::body::Body>| {
                // Action-link query strings can contain single-use credentials.
                tracing::info_span!("http_request", method = %request.method(), path = request.uri().path())
            },
        ));
    let router = if state.config.cors.disabled {
        router
    } else {
        router.layer(cors)
    };

    router
        .layer(Extension(email_delivery))
        .layer(SetResponseHeaderLayer::if_not_present(
            header::CACHE_CONTROL,
            HeaderValue::from_static("no-store"),
        ))
        .layer(security_header(header::X_FRAME_OPTIONS, "DENY"))
        .layer(security_header(header::X_CONTENT_TYPE_OPTIONS, "nosniff"))
        .layer(security_header(header::REFERRER_POLICY, "no-referrer"))
        .layer(security_header(
            header::HeaderName::from_static("permissions-policy"),
            "geolocation=(), microphone=(), camera=()",
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            header::STRICT_TRANSPORT_SECURITY,
            HeaderValue::from_static("max-age=31536000; includeSubDomains"),
        ))
        .with_state(state)
}

fn security_header(
    name: header::HeaderName,
    value: &'static str,
) -> SetResponseHeaderLayer<HeaderValue> {
    SetResponseHeaderLayer::overriding(name, HeaderValue::from_static(value))
}

fn rate_limit_backend(config: &crate::config::RateLimitConfig) -> RateLimitBackend {
    match config.store.as_str() {
        #[cfg(feature = "redis-rate-limit")]
        "redis" => {
            let url = config
                .redis_url
                .as_deref()
                .expect("REDIS_URL must be configured when RATE_LIMIT_STORE=redis");
            let store = RedisRateLimitStore::new(url)
                .unwrap_or_else(|error| panic!("Failed to create Redis rate limit store: {error}"));
            tracing::info!("Redis rate limiter initialized (shared across instances)");
            RateLimitBackend::Redis(store)
        }
        _ => RateLimitBackend::Memory(RateLimitStore::new()),
    }
}

#[cfg(all(test, feature = "redis-rate-limit"))]
mod tests {
    #[test]
    fn redis_capacity_is_not_divided_again_when_replicas_increase() {
        let redis = super::RateLimitBackend::Redis(
            super::RedisRateLimitStore::new("redis://127.0.0.1:6379/").unwrap(),
        );
        let memory = super::RateLimitBackend::Memory(super::RateLimitStore::with_max_entries(10));
        assert_eq!(super::per_replica_limit(10, 10, "auth", &redis), 10);
        assert_eq!(super::per_replica_limit(10, 10, "auth", &memory), 1);
        assert_eq!(super::per_replica_limit(10, 1, "auth", &memory), 10);
    }

    #[test]
    #[should_panic(expected = "REDIS_URL must be configured when RATE_LIMIT_STORE=redis")]
    fn redis_missing_url_panics() {
        let config = crate::config::RateLimitConfig {
            enabled: true,
            store: "redis".to_string(),
            redis_url: None,
        };
        let _ = super::rate_limit_backend(&config);
    }
}
