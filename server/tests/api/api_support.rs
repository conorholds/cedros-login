//! Shared helpers for API integration tests.

pub use axum::{
    body::Body,
    http::{header, Method, Request, StatusCode},
};
pub use cedros_login::repositories::{LoginAttemptConfig, OrgEntity, SystemSetting};
pub use cedros_login::{
    router, router_with_storage, router_with_storage_and_email_delivery, Config,
    EmailDeliveryCapability, NoopCallback, Storage,
};
pub use http_body_util::BodyExt;
pub use serde_json::{json, Value};
pub use std::sync::Arc;
pub use tower::ServiceExt;

use async_trait::async_trait;
use std::sync::OnceLock;

pub const AUTH_BASE_PATH: &str = "/auth";

pub fn test_rsa_private_key_pem() -> &'static str {
    static KEY: OnceLock<String> = OnceLock::new();
    KEY.get_or_init(|| {
        use rand::rngs::OsRng;
        use rsa::pkcs1::EncodeRsaPrivateKey;
        use rsa::RsaPrivateKey;

        // Use 2048 bits to satisfy RS256 minimums enforced by some backends.
        let key = RsaPrivateKey::new(&mut OsRng, 2048).unwrap();
        key.to_pkcs1_pem(rsa::pkcs1::LineEnding::LF)
            .unwrap()
            .to_string()
    })
}

/// Create a test configuration
pub fn test_config() -> Config {
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
            enabled: false, // Disable cookies for these request/response assertions
            domain: None,
            secure: false,
            same_site: "lax".to_string(),
            access_cookie_name: "cedros_access".to_string(),
            refresh_cookie_name: "cedros_refresh".to_string(),
            path_prefix: "".to_string(),
        },
        webhook: cedros_login::config::WebhookConfig {
            enabled: false, // Disable webhooks for tests
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
            url: None, // Use in-memory storage for tests
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

pub async fn seed_default_org(storage: &Storage) {
    let owner_id = uuid::Uuid::new_v4();
    let org = OrgEntity::new(
        "Default Org".to_string(),
        format!("default-{}", uuid::Uuid::new_v4()),
        owner_id,
        false,
    );
    let org = storage.org_repo.create(org).await.unwrap();
    storage
        .system_settings_repo
        .upsert(SystemSetting::new(
            "default_org_id".to_string(),
            org.id.to_string(),
            "setup".to_string(),
        ))
        .await
        .unwrap();
}

pub async fn seed_runtime_auth_settings(storage: &Storage, config: &Config) {
    let settings = [
        ("auth_email_enabled", config.email.enabled, "auth.email"),
        (
            "auth_email_require_verification",
            config.email.require_verification,
            "auth.email",
        ),
        ("auth_google_enabled", config.google.enabled, "auth.google"),
        ("auth_apple_enabled", config.apple.enabled, "auth.apple"),
        ("auth_solana_enabled", config.solana.enabled, "auth.solana"),
        (
            "auth_webauthn_enabled",
            config.webauthn.enabled,
            "auth.webauthn",
        ),
        (
            "auth_instantlink_enabled",
            config.email.enabled,
            "auth.instantlink",
        ),
    ];

    for (key, enabled, category) in settings {
        storage
            .system_settings_repo
            .upsert(SystemSetting::new(
                key.to_string(),
                enabled.to_string(),
                category.to_string(),
            ))
            .await
            .unwrap();
    }
}

pub async fn create_seeded_storage() -> Storage {
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &test_config()).await;
    storage
}

/// Create a test app with setup-complete storage.
pub async fn create_test_app() -> axum::Router {
    let config = test_config();
    let callback = Arc::new(NoopCallback);
    router_with_storage(config, callback, create_seeded_storage().await)
}

/// Create a test app with custom config and setup-complete storage.
pub async fn create_test_app_with_config(config: Config) -> axum::Router {
    let callback = Arc::new(NoopCallback);
    let storage = create_seeded_storage().await;
    seed_runtime_auth_settings(&storage, &config).await;
    router_with_storage(config, callback, storage)
}

/// Helper to make a JSON request
pub async fn json_request(
    app: axum::Router,
    method: Method,
    uri: &str,
    body: Option<Value>,
) -> (StatusCode, Value) {
    let mut req_builder = Request::builder().method(method).uri(with_auth_base(uri));
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

    let request = req_builder.body(body).unwrap();

    let response = app.oneshot(request).await.unwrap();
    let status = response.status();

    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let body = parse_response_json(&body_bytes, uri);

    (status, body)
}

/// Helper to make an authenticated request
pub async fn auth_request(
    app: axum::Router,
    method: Method,
    uri: &str,
    token: &str,
    body: Option<Value>,
) -> (StatusCode, Value) {
    let mut req_builder = Request::builder()
        .method(method)
        .uri(with_auth_base(uri))
        .header(header::AUTHORIZATION, format!("Bearer {token}"));

    let body = if let Some(json_body) = body {
        req_builder = req_builder.header(header::CONTENT_TYPE, "application/json");
        Body::from(serde_json::to_string(&json_body).unwrap())
    } else {
        Body::empty()
    };

    let request = req_builder.body(body).unwrap();

    let response = app.oneshot(request).await.unwrap();
    let status = response.status();

    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let body = parse_response_json(&body_bytes, uri);

    (status, body)
}

#[derive(Default)]
pub struct FailingOutboxRepository {
    inner: cedros_login::repositories::InMemoryOutboxRepository,
}

impl FailingOutboxRepository {
    pub fn new() -> Self {
        Self {
            inner: cedros_login::repositories::InMemoryOutboxRepository::new(),
        }
    }
}

#[async_trait]
impl cedros_login::repositories::OutboxRepository for FailingOutboxRepository {
    async fn create(
        &self,
        _event: cedros_login::repositories::OutboxEvent,
    ) -> Result<cedros_login::repositories::OutboxEvent, cedros_login::errors::AppError> {
        Err(cedros_login::errors::AppError::Internal(anyhow::anyhow!(
            "Outbox create failed"
        )))
    }

    async fn find_by_id(
        &self,
        id: uuid::Uuid,
    ) -> Result<Option<cedros_login::repositories::OutboxEvent>, cedros_login::errors::AppError>
    {
        self.inner.find_by_id(id).await
    }

    async fn fetch_pending(
        &self,
        limit: u32,
        lock_timeout_secs: u64,
    ) -> Result<Vec<cedros_login::repositories::OutboxEvent>, cedros_login::errors::AppError> {
        self.inner.fetch_pending(limit, lock_timeout_secs).await
    }

    async fn mark_processing(
        &self,
        event: &cedros_login::repositories::OutboxEvent,
    ) -> Result<bool, cedros_login::errors::AppError> {
        self.inner.mark_processing(event).await
    }

    async fn mark_done(&self, id: uuid::Uuid) -> Result<(), cedros_login::errors::AppError> {
        self.inner.mark_done(id).await
    }

    async fn mark_delivered(&self, id: uuid::Uuid) -> Result<(), cedros_login::errors::AppError> {
        self.inner.mark_delivered(id).await
    }

    async fn mark_retry(
        &self,
        event: &cedros_login::repositories::OutboxEvent,
        error: &str,
    ) -> Result<(), cedros_login::errors::AppError> {
        self.inner.mark_retry(event, error).await
    }

    async fn mark_failed(
        &self,
        event: &cedros_login::repositories::OutboxEvent,
        error: &str,
    ) -> Result<(), cedros_login::errors::AppError> {
        self.inner.mark_failed(event, error).await
    }

    async fn cleanup_old(
        &self,
        older_than: chrono::DateTime<chrono::Utc>,
    ) -> Result<u64, cedros_login::errors::AppError> {
        self.inner.cleanup_old(older_than).await
    }

    async fn count_pending(&self) -> Result<u64, cedros_login::errors::AppError> {
        self.inner.count_pending().await
    }

    async fn count_failed(&self) -> Result<u64, cedros_login::errors::AppError> {
        self.inner.count_failed().await
    }

    async fn delete_by_org(
        &self,
        org_id: uuid::Uuid,
    ) -> Result<u64, cedros_login::errors::AppError> {
        self.inner.delete_by_org(org_id).await
    }
}

// =============================================================================
// Health Check Tests
// =============================================================================

pub fn with_auth_base(uri: &str) -> String {
    if uri.starts_with("http://") || uri.starts_with("https://") {
        return uri.to_string();
    }
    if matches!(
        uri,
        "/health" | "/ready" | "/metrics" | "/.well-known/jwks.json" | "/setup/status"
    ) || uri.starts_with("/setup/")
    {
        return uri.to_string();
    }
    if uri == AUTH_BASE_PATH || uri.starts_with(&format!("{AUTH_BASE_PATH}/")) {
        return uri.to_string();
    }
    format!("{AUTH_BASE_PATH}{uri}")
}

pub fn parse_response_json(body_bytes: &[u8], context: &str) -> Value {
    if body_bytes.is_empty() {
        return json!({});
    }

    serde_json::from_slice(body_bytes).unwrap_or_else(|err| {
        let body = String::from_utf8_lossy(body_bytes);
        panic!("invalid JSON response for {context}: {err}; body={body}");
    })
}
