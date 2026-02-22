//! Prometheus metrics endpoint
//!
//! Exposes application metrics in Prometheus text format.
//! Protected by API key authentication configured via `server_metrics_api_key`.

use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::services::{render_metrics, EmailService};
use crate::AppState;

/// Metrics endpoint for Prometheus scraping
///
/// Requires `server_metrics_api_key` to be set and provided via:
/// - `Authorization: Bearer <api_key>` header, or
/// - `X-Metrics-Api-Key: <api_key>` header
///
/// Returns 401 if no API key configured or provided key doesn't match.
/// Returns 200 with Prometheus text format on success.
pub async fn prometheus_metrics<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> impl IntoResponse {
    // Get configured API key from settings
    let configured_key = match state.settings_service.get("server_metrics_api_key").await {
        Ok(Some(key)) if !key.is_empty() => key,
        Ok(_) => {
            tracing::warn!("Metrics endpoint accessed but server_metrics_api_key not configured");
            return (
                StatusCode::SERVICE_UNAVAILABLE,
                [(header::CONTENT_TYPE, "text/plain")],
                "Metrics API key not configured".to_string(),
            );
        }
        Err(e) => {
            tracing::error!(error = %e, "Failed to read metrics API key from settings");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "text/plain")],
                "Failed to read configuration".to_string(),
            );
        }
    };

    // Extract API key from request headers
    let provided_key = extract_api_key(&headers);

    // Validate API key
    match provided_key {
        Some(key) if key == configured_key => {
            // Authorized - return metrics
            let metrics = render_metrics();
            (
                StatusCode::OK,
                [(
                    header::CONTENT_TYPE,
                    "text/plain; version=0.0.4; charset=utf-8",
                )],
                metrics,
            )
        }
        Some(_) => {
            tracing::warn!("Invalid metrics API key provided");
            (
                StatusCode::UNAUTHORIZED,
                [(header::CONTENT_TYPE, "text/plain")],
                "Invalid API key".to_string(),
            )
        }
        None => (
            StatusCode::UNAUTHORIZED,
            [(header::CONTENT_TYPE, "text/plain")],
            "API key required".to_string(),
        ),
    }
}

/// Extract API key from request headers
///
/// Checks in order:
/// 1. `Authorization: Bearer <key>` header
/// 2. `X-Metrics-Api-Key: <key>` header
fn extract_api_key(headers: &HeaderMap) -> Option<String> {
    // Check Authorization header
    if let Some(auth) = headers.get(header::AUTHORIZATION) {
        if let Ok(auth_str) = auth.to_str() {
            if let Some(key) = auth_str.strip_prefix("Bearer ") {
                return Some(key.to_string());
            }
        }
    }

    // Check X-Metrics-Api-Key header
    if let Some(key) = headers.get("x-metrics-api-key") {
        if let Ok(key_str) = key.to_str() {
            return Some(key_str.to_string());
        }
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::HeaderValue;

    #[test]
    fn test_extract_api_key_bearer() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_static("Bearer test-key-123"),
        );

        assert_eq!(extract_api_key(&headers), Some("test-key-123".to_string()));
    }

    #[test]
    fn test_extract_api_key_custom_header() {
        let mut headers = HeaderMap::new();
        headers.insert("x-metrics-api-key", HeaderValue::from_static("custom-key"));

        assert_eq!(extract_api_key(&headers), Some("custom-key".to_string()));
    }

    #[test]
    fn test_extract_api_key_bearer_takes_precedence() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_static("Bearer bearer-key"),
        );
        headers.insert("x-metrics-api-key", HeaderValue::from_static("custom-key"));

        assert_eq!(extract_api_key(&headers), Some("bearer-key".to_string()));
    }

    #[test]
    fn test_extract_api_key_none() {
        let headers = HeaderMap::new();
        assert_eq!(extract_api_key(&headers), None);
    }
}
