//! Request ID middleware for request tracing

use axum::{
    body::Body,
    http::{header::HeaderName, HeaderValue, Request, Response},
};
use std::{
    future::Future,
    pin::Pin,
    task::{Context, Poll},
};
use tower::{Layer, Service};
use uuid::Uuid;

/// Header name for request ID
pub const REQUEST_ID_HEADER: &str = "x-request-id";

/// Request ID stored in request extensions
#[derive(Debug, Clone)]
pub struct RequestId(pub String);

impl RequestId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Default for RequestId {
    fn default() -> Self {
        Self::new()
    }
}

/// Layer that adds request IDs to all requests
#[derive(Debug, Clone, Default)]
pub struct RequestIdLayer;

impl RequestIdLayer {
    pub fn new() -> Self {
        Self
    }
}

impl<S> Layer<S> for RequestIdLayer {
    type Service = RequestIdService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        RequestIdService { inner }
    }
}

/// Service that handles request ID generation
#[derive(Debug, Clone)]
pub struct RequestIdService<S> {
    inner: S,
}

impl<S, B> Service<Request<B>> for RequestIdService<S>
where
    S: Service<Request<B>, Response = Response<Body>> + Clone + Send + 'static,
    S::Future: Send,
    B: Send + 'static,
{
    type Response = S::Response;
    type Error = S::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, mut request: Request<B>) -> Self::Future {
        // Check for existing request ID in headers, or generate new one
        // Validate client-provided IDs to prevent header injection attacks:
        // - Must be valid UUID format (or reasonable length for other ID schemes)
        // - Max 64 chars to prevent oversized headers
        let request_id = request
            .headers()
            .get(REQUEST_ID_HEADER)
            .and_then(|v| v.to_str().ok())
            .filter(|s| s.len() <= 64) // Reject oversized values
            .filter(|s| Uuid::parse_str(s).is_ok()) // Must be valid UUID
            .map(|s| RequestId(s.to_string()))
            .unwrap_or_default();

        // Insert request ID into extensions for handlers to access
        request.extensions_mut().insert(request_id.clone());

        let mut inner = self.inner.clone();

        Box::pin(async move {
            let response = inner.call(request).await?;
            let (mut parts, body) = response.into_parts();

            // Add request ID to response headers
            let header_name = HeaderName::from_static(REQUEST_ID_HEADER);
            if let Ok(header_value) = HeaderValue::from_str(request_id.as_str()) {
                parts.headers.insert(header_name, header_value);
            }

            Ok(Response::from_parts(parts, body))
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_request_id_generation() {
        let id1 = RequestId::new();
        let id2 = RequestId::new();

        // Each ID should be unique
        assert_ne!(id1.0, id2.0);

        // Should be valid UUIDs
        assert!(Uuid::parse_str(&id1.0).is_ok());
        assert!(Uuid::parse_str(&id2.0).is_ok());
    }

    #[test]
    fn test_request_id_as_str() {
        let id = RequestId("test-id-123".to_string());
        assert_eq!(id.as_str(), "test-id-123");
    }

    #[test]
    fn test_request_id_layer_creation() {
        let _layer = RequestIdLayer::new();
    }

    #[test]
    fn test_request_id_default() {
        let id = RequestId::default();
        assert!(!id.0.is_empty());
        assert!(Uuid::parse_str(&id.0).is_ok());
    }
}
