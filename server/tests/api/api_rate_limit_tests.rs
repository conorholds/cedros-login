use crate::api_cookie_support::json_request_with_headers;
use crate::api_support::*;

// ============================================================================
// Rate Limiting Tests
// ============================================================================

/// Create a test config with rate limiting enabled
fn test_config_with_rate_limiting() -> Config {
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
            enabled: false,
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
            enabled: true, // Enable rate limiting
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

/// Test that rate limiting blocks excessive login attempts
#[tokio::test]
async fn test_rate_limit_blocks_excessive_login_attempts() {
    let config = test_config_with_rate_limiting();
    let callback = Arc::new(NoopCallback);
    let app = router_with_storage(config, callback, create_seeded_storage().await);

    // First, register a user
    let (status, _) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "ratelimit-test@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);

    // Registration consumed one slot in the shared authentication budget.
    let auth_limit = cedros_login::config::default_auth_limit();

    // Make login attempts up to the canonical auth limit.
    for i in 0..auth_limit.saturating_sub(1) {
        let (status, _) = json_request(
            app.clone(),
            Method::POST,
            "/login",
            Some(json!({
                "email": "ratelimit-test@example.com",
                "password": "SecurePassword1!"
            })),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "Login {} should succeed", i + 1);
    }

    // The next attempt should be rate limited.
    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/login",
        Some(json!({
            "email": "ratelimit-test@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
    assert_eq!(body["code"], "RATE_LIMITED");
}

/// Test that rate limit headers are included in responses
/// Note: /health is intentionally NOT rate-limited; use /discovery which IS rate-limited
#[tokio::test]
async fn test_rate_limit_headers_present() {
    let config = test_config_with_rate_limiting();
    let callback = Arc::new(NoopCallback);
    let app = router(config, callback);

    let (status, headers, _body) =
        json_request_with_headers(app, Method::GET, "/discovery", None).await;

    assert_eq!(status, StatusCode::OK);

    // Check rate limit headers are present
    assert!(
        headers.contains_key("x-ratelimit-limit"),
        "Should have X-RateLimit-Limit header"
    );
    assert!(
        headers.contains_key("x-ratelimit-remaining"),
        "Should have X-RateLimit-Remaining header"
    );
    assert!(
        headers.contains_key("x-ratelimit-reset"),
        "Should have X-RateLimit-Reset header"
    );
}

/// Test that different endpoints have different rate limits
/// Note: /health is intentionally NOT rate-limited; use /discovery which IS rate-limited
#[tokio::test]
async fn test_rate_limit_different_endpoints() {
    let config = test_config_with_rate_limiting();
    let callback = Arc::new(NoopCallback);
    let app = router(config, callback);

    let general_limit = cedros_login::config::default_general_limit();

    // Discovery endpoint should have the canonical general limit.
    for i in 0..general_limit {
        let (status, _, _) =
            json_request_with_headers(app.clone(), Method::GET, "/discovery", None).await;
        assert_eq!(
            status,
            StatusCode::OK,
            "Discovery request {} should succeed",
            i + 1
        );
    }

    // The next discovery request should be rate limited.
    let (status, _, body) =
        json_request_with_headers(app.clone(), Method::GET, "/discovery", None).await;
    assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
    assert_eq!(body["code"], "RATE_LIMITED");
}

/// Test that rate limiting is disabled when config says so
#[tokio::test]
async fn test_rate_limit_disabled() {
    let config = test_config(); // Rate limiting disabled
    let callback = Arc::new(NoopCallback);
    let app = router(config, callback);

    // Should be able to make many requests without rate limiting
    for i in 0..20 {
        let (status, _) = json_request(app.clone(), Method::GET, "/health", None).await;
        assert_eq!(status, StatusCode::OK, "Request {} should succeed", i + 1);
    }
}
