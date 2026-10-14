//! Cookie helpers for API integration tests.

use crate::api_support::*;

/// Create a test configuration with cookies enabled
pub fn test_config_with_cookies() -> Config {
    Config {
        server: cedros_login::config::ServerConfig {
            host: "127.0.0.1".to_string(),
            port: 8080,
            auth_base_path: "/auth".to_string(),
            frontend_url: Some("http://localhost:3000".to_string()),
            sso_callback_url: None,
            bootstrap_admin_email: None,
            setup_token: Some("0123456789abcdef0123456789abcdef".to_string()),
            trust_proxy: false,
        },
        jwt: cedros_login::config::JwtConfig {
            secret: "test-secret-key-for-integration-tests".to_string(),
            rsa_private_key_pem: Some(test_rsa_private_key_pem().to_string()),
            issuer: "cedros-login-test".to_string(),
            audience: "test-app".to_string(),
            access_token_expiry: 900,
            refresh_token_expiry: 604800,
        },
        email: cedros_login::config::EmailConfig {
            enabled: true,
            require_verification: false,
            block_disposable_emails: false,
            custom_blocked_domains: Vec::new(),
        },
        google: cedros_login::config::GoogleConfig {
            enabled: true,
            client_id: Some("test-google-client-id".to_string()),
        },
        apple: cedros_login::config::AppleConfig {
            enabled: false,
            client_id: None,
            team_id: None,
            ..cedros_login::config::AppleConfig::default()
        },
        solana: cedros_login::config::SolanaConfig {
            enabled: true,
            challenge_expiry_seconds: 300,
        },
        webauthn: cedros_login::config::WebAuthnConfig::default(),
        cors: cedros_login::config::CorsConfig {
            allowed_origins: vec!["http://localhost:3000".to_string()],
            ..Default::default()
        },
        cookie: cedros_login::config::CookieConfig {
            enabled: true,
            domain: None,
            secure: false,
            same_site: "lax".to_string(),
            access_cookie_name: "cedros_access".to_string(),
            refresh_cookie_name: "cedros_refresh".to_string(),
            path_prefix: "".to_string(),
        },
        webhook: cedros_login::config::WebhookConfig {
            enabled: false,
            url: None,
            secret: None,
            timeout_secs: 10,
            retry_attempts: 0,
        },
        rate_limit: cedros_login::config::RateLimitConfig {
            enabled: false, // Disable rate limiting for tests
            store: "memory".to_string(),
            redis_url: None,
        },
        database: cedros_login::config::DatabaseConfig {
            url: None,
            max_connections: 5,
            min_connections: 1,
            connect_timeout_secs: 30,
            idle_timeout_secs: 600,
        },
        notification: cedros_login::config::NotificationConfig {
            discord_webhook_url: None,
            telegram_bot_token: None,
            telegram_chat_id: None,
            environment: "test".to_string(),
        },
        sso: cedros_login::config::SsoConfig::default(),
    }
}

/// Create a test app with cookies enabled
pub async fn create_test_app_with_cookies() -> axum::Router {
    let config = test_config_with_cookies();
    let callback = Arc::new(NoopCallback);
    router_with_storage(config, callback, create_seeded_storage().await)
}

/// Helper to make a JSON request and return full response with headers
pub async fn json_request_with_headers(
    app: axum::Router,
    method: Method,
    uri: &str,
    body: Option<Value>,
) -> (StatusCode, axum::http::HeaderMap, Value) {
    let mut req_builder = Request::builder().method(method).uri(with_auth_base(uri));

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

/// Helper to make a request with a cookie header
pub async fn request_with_cookie(
    app: axum::Router,
    method: Method,
    uri: &str,
    cookie: &str,
    body: Option<Value>,
) -> (StatusCode, axum::http::HeaderMap, Value) {
    let mut req_builder = Request::builder()
        .method(method)
        .uri(with_auth_base(uri))
        .header(header::COOKIE, cookie);

    if let Some(csrf_token) = extract_cookie_value(cookie, "XSRF-TOKEN") {
        req_builder = req_builder.header("x-csrf-token", csrf_token);
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

pub fn extract_cookie_value(cookie_header: &str, name: &str) -> Option<String> {
    cookie_header
        .split(';')
        .map(|part| part.trim())
        .find_map(|part| {
            let mut iter = part.splitn(2, '=');
            match (iter.next(), iter.next()) {
                (Some(key), Some(value)) if key == name => Some(value.to_string()),
                _ => None,
            }
        })
}

pub fn cookies_from_set_cookie(
    headers: &axum::http::HeaderMap,
) -> std::collections::HashMap<String, String> {
    let mut cookies = std::collections::HashMap::new();
    for value in headers.get_all(header::SET_COOKIE).iter() {
        let cookie = value.to_str().unwrap();
        // Ignore legacy-path deletion cookies when extracting active credentials.
        if cookie.contains("; Max-Age=0") {
            continue;
        }
        if let Some(pair) = cookie.split(';').next() {
            let mut iter = pair.splitn(2, '=');
            if let (Some(name), Some(val)) = (iter.next(), iter.next()) {
                cookies.insert(name.to_string(), val.to_string());
            }
        }
    }
    cookies
}

pub async fn fetch_csrf_cookie(app: axum::Router) -> String {
    let (_, headers, _) = json_request_with_headers(app, Method::GET, "/health", None).await;
    let cookies = cookies_from_set_cookie(&headers);
    cookies
        .get("XSRF-TOKEN")
        .expect("CSRF cookie not found")
        .to_string()
}
