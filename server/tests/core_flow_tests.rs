//! Core app-flow smoke tests for first-run setup and admin login.

use axum::{
    body::Body,
    http::{header, Method, Request, StatusCode},
};
use cedros_login::{router, Config, NoopCallback};
use http_body_util::BodyExt;
use serde_json::{json, Value};
use std::sync::{Arc, OnceLock};
use tower::ServiceExt;

const AUTH_BASE_PATH: &str = "/auth";

fn test_rsa_private_key_pem() -> &'static str {
    static KEY: OnceLock<String> = OnceLock::new();
    KEY.get_or_init(|| {
        use rand::rngs::OsRng;
        use rsa::pkcs1::EncodeRsaPrivateKey;
        use rsa::RsaPrivateKey;

        let key = RsaPrivateKey::new(&mut OsRng, 2048).unwrap();
        key.to_pkcs1_pem(rsa::pkcs1::LineEnding::LF)
            .unwrap()
            .to_string()
    })
}

fn test_config() -> Config {
    Config {
        server: cedros_login::config::ServerConfig {
            host: "127.0.0.1".to_string(),
            port: 8080,
            auth_base_path: AUTH_BASE_PATH.to_string(),
            frontend_url: Some("http://localhost:3000".to_string()),
            sso_callback_url: None,
            bootstrap_admin_email: None,
            setup_token: Some("0123456789abcdef0123456789abcdef".to_string()),
            trust_proxy: false,
        },
        jwt: cedros_login::config::JwtConfig {
            secret: "test-secret-key-for-core-flow-tests".to_string(),
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
            enabled: false,
            client_id: None,
        },
        apple: cedros_login::config::AppleConfig {
            enabled: false,
            client_id: None,
            team_id: None,
            ..cedros_login::config::AppleConfig::default()
        },
        solana: cedros_login::config::SolanaConfig {
            enabled: false,
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
            enabled: false,
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

fn create_test_app() -> axum::Router {
    router(test_config(), Arc::new(NoopCallback))
}

async fn json_request(
    app: axum::Router,
    method: Method,
    uri: &str,
    body: Option<Value>,
) -> (StatusCode, Value) {
    let mut req_builder = Request::builder().method(method).uri(uri);
    if uri == "/setup/admin" {
        req_builder =
            req_builder.header("x-cedros-setup-token", "0123456789abcdef0123456789abcdef");
    }
    let body = if let Some(json_body) = body {
        req_builder = req_builder.header(header::CONTENT_TYPE, "application/json");
        Body::from(serde_json::to_string(&json_body).unwrap())
    } else {
        Body::empty()
    };

    let response = app.oneshot(req_builder.body(body).unwrap()).await.unwrap();
    let status = response.status();
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let body = serde_json::from_slice(&body).expect("response body should be valid JSON");
    (status, body)
}

async fn auth_get(app: axum::Router, uri: &str, token: &str) -> (StatusCode, Value) {
    let request = Request::builder()
        .method(Method::GET)
        .uri(uri)
        .header(header::AUTHORIZATION, format!("Bearer {token}"))
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();
    let status = response.status();
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let body = serde_json::from_slice(&body).expect("response body should be valid JSON");
    (status, body)
}

#[tokio::test]
async fn registration_before_setup_returns_setup_required() {
    let app = create_test_app();

    let (status, body) = json_request(
        app,
        Method::POST,
        &format!("{AUTH_BASE_PATH}/register"),
        Some(json!({
            "email": "fresh-user@example.com",
            "password": "SecureCoreFlowPass1!",
            "name": "Fresh User"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(body["code"], "SETUP_REQUIRED");
    assert_eq!(body["message"], "Initial setup required");
}

#[tokio::test]
async fn unauthenticated_admin_hash_import_is_forbidden() {
    let app = create_test_app();

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/setup/admin/import",
        Some(json!({
            "email": "attacker@example.com",
            "passwordHash": "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$nhb9JHf9knLxhw2tOV70EvJ6zp/9VkvBAzCldwZS3r0",
            "passwordHashScheme": "argon2id-phc",
            "name": "Attacker"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::FORBIDDEN);
    assert_eq!(body["code"], "FORBIDDEN");

    let (status, body) = json_request(app, Method::GET, "/setup/status", None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["needsSetup"], true);
}

#[tokio::test]
async fn first_run_setup_login_and_admin_core_flow() {
    let app = create_test_app();

    let (status, body) = json_request(app.clone(), Method::GET, "/setup/status", None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["needsSetup"], true);

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/setup/admin",
        Some(json!({
            "email": "admin@example.com",
            "password": "SecureCoreFlowPass1!",
            "name": "Admin User",
            "orgName": "Core Flow Org"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED, "setup response: {body}");
    assert_eq!(body["success"], true);

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        &format!("{AUTH_BASE_PATH}/login"),
        Some(json!({
            "email": "admin@example.com",
            "password": "SecureCoreFlowPass1!"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let token = body["tokens"]["accessToken"].as_str().unwrap();
    assert_eq!(body["user"]["email"], "admin@example.com");

    let (status, body) = auth_get(app.clone(), &format!("{AUTH_BASE_PATH}/user"), token).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["user"]["email"], "admin@example.com");
    let admin_id = body["user"]["id"].as_str().unwrap().to_string();
    let referral_code = body["user"]["referralCode"].as_str().unwrap().to_string();

    let (status, body) = auth_get(app.clone(), &format!("{AUTH_BASE_PATH}/orgs"), token).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["orgs"][0]["name"], "Core Flow Org");
    assert_eq!(body["orgs"][0]["role"], "owner");

    let (status, body) = auth_get(
        app.clone(),
        &format!("{AUTH_BASE_PATH}/admin/users/stats"),
        token,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["total"], 1);

    let (status, body) = auth_get(
        app.clone(),
        &format!("{AUTH_BASE_PATH}/admin/users/{admin_id}"),
        token,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["referralCount"], 0);

    let (status, _body) = json_request(
        app.clone(),
        Method::POST,
        &format!("{AUTH_BASE_PATH}/register"),
        Some(json!({
            "email": "referred@example.com",
            "password": "SecureCoreFlowPass1!",
            "name": "Referred User",
            "referral": referral_code
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);

    let (status, body) = auth_get(
        app.clone(),
        &format!("{AUTH_BASE_PATH}/admin/users/{admin_id}"),
        token,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["referralCount"], 1);

    let (status, body) = json_request(
        app,
        Method::POST,
        &format!("{AUTH_BASE_PATH}/login"),
        Some(json!({
            "email": "admin@example.com",
            "password": "wrong-password"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
    assert_eq!(body["code"], "INVALID_CREDENTIALS");
}
