//! HTTP metrics middleware.

use axum::{body::Body, extract::MatchedPath, http::Request, middleware::Next, response::Response};
use std::time::Instant;

use crate::services::record_http_request;

/// Records Prometheus-compatible request count and latency metrics.
///
/// Labels use Axum's matched route pattern when available to avoid per-resource
/// high-cardinality paths; unmatched requests use a fixed placeholder label.
pub async fn record_http_metrics(request: Request<Body>, next: Next) -> Response {
    let method = request.method().clone();
    let path = metric_path(&request);
    let started_at = Instant::now();

    let response = next.run(request).await;

    record_http_request(
        method.as_str(),
        &path,
        response.status().as_u16(),
        started_at.elapsed().as_secs_f64(),
    );

    response
}

fn metric_path(request: &Request<Body>) -> String {
    request
        .extensions()
        .get::<MatchedPath>()
        .map(|path| path.as_str().to_string())
        .unwrap_or_else(|| "__unmatched__".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{http::StatusCode, middleware, response::IntoResponse, routing::get, Router};
    use tower::ServiceExt;

    #[test]
    fn metric_path_uses_unmatched_placeholder_without_match() {
        let request = Request::builder()
            .uri("/users/123?debug=true")
            .body(Body::empty())
            .expect("request builds");

        assert_eq!(metric_path(&request), "__unmatched__");
    }

    #[tokio::test]
    async fn metrics_middleware_preserves_success_response() {
        let app = Router::new()
            .route("/health", get(|| async { "ok" }))
            .layer(middleware::from_fn(record_http_metrics));

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/health")
                    .body(Body::empty())
                    .expect("request builds"),
            )
            .await
            .expect("request succeeds");

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn metrics_middleware_preserves_error_response() {
        let app = Router::new()
            .route(
                "/fail",
                get(|| async { (StatusCode::BAD_GATEWAY, "upstream failed").into_response() }),
            )
            .layer(middleware::from_fn(record_http_metrics));

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/fail")
                    .body(Body::empty())
                    .expect("request builds"),
            )
            .await
            .expect("request succeeds");

        assert_eq!(response.status(), StatusCode::BAD_GATEWAY);
    }
}
