//! Hybrid auth helpers for API integration tests.

use crate::api_cookie_support::extract_cookie_value;
use crate::api_support::*;

/// Helper to make a request with both Authorization header AND cookies (hybrid auth)
pub async fn request_with_hybrid_auth(
    app: axum::Router,
    method: Method,
    uri: &str,
    bearer_token: &str,
    cookie: &str,
    include_csrf: bool,
    body: Option<Value>,
) -> (StatusCode, axum::http::HeaderMap, Value) {
    let mut req_builder = Request::builder()
        .method(method)
        .uri(with_auth_base(uri))
        .header(header::AUTHORIZATION, format!("Bearer {bearer_token}"))
        .header(header::COOKIE, cookie);

    // Only include CSRF header if requested
    if include_csrf {
        if let Some(csrf_token) = extract_cookie_value(cookie, "XSRF-TOKEN") {
            req_builder = req_builder.header("x-csrf-token", csrf_token);
        }
    }

    let body = if let Some(json_body) = body {
        req_builder = req_builder.header(header::CONTENT_TYPE, "application/json");
        Body::from(serde_json::to_string(&json_body).unwrap())
    } else {
        Body::empty()
    };

    let request = req_builder.body(body).unwrap();
    let response = app.oneshot(request).await.unwrap();
    let status = response.status();
    let headers = response.headers().clone();
    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let body = parse_response_json(&body_bytes, uri);

    (status, headers, body)
}
