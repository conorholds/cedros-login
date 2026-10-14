use super::*;
use crate::repositories::{
    InMemorySystemSettingsRepository, SystemSetting, SystemSettingsRepository,
};
use crate::services::SettingsService;
use std::sync::Arc;

async fn upsert(repo: &InMemorySystemSettingsRepository, key: &str, value: &str) {
    repo.upsert(SystemSetting::new(
        key.to_string(),
        value.to_string(),
        "test".to_string(),
    ))
    .await
    .unwrap();
}

#[tokio::test]
async fn restart_settings_are_applied_before_composition() {
    let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
    for (key, value) in [
        ("security_cors_origins", "https://app.example.com"),
        ("security_cookie_secure", "true"),
        ("security_cookie_same_site", "none"),
        ("security_session_timeout", "7200"),
        ("security_jwt_issuer", "cedros-production"),
        ("security_jwt_audience", "cedros-users"),
        ("server_frontend_url", "https://app.example.com"),
        ("server_base_path", "/login"),
        ("server_trust_proxy", "true"),
        (
            "sso_callback_url",
            "https://app.example.com/login/sso/callback",
        ),
    ] {
        upsert(&repo, key, value).await;
    }
    let settings = SettingsService::new(repo);
    let mut config = base_config();

    config.apply_db_settings(&settings).await.unwrap();

    assert_eq!(config.cors.allowed_origins, ["https://app.example.com"]);
    assert!(config.cookie.secure);
    assert_eq!(config.cookie.same_site, "none");
    assert_eq!(config.jwt.refresh_token_expiry, 7200);
    assert_eq!(config.jwt.issuer, "cedros-production");
    assert_eq!(config.jwt.audience, "cedros-users");
    assert_eq!(
        config.server.frontend_url.as_deref(),
        Some("https://app.example.com")
    );
    assert_eq!(config.server.auth_base_path, "/login");
    assert!(config.server.trust_proxy);
    assert_eq!(
        config.server.sso_callback_url.as_deref(),
        Some("https://app.example.com/login/sso/callback")
    );
}

#[tokio::test]
async fn invalid_legacy_restart_value_does_not_override_static_config() {
    let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
    upsert(&repo, "security_cookie_secure", "yes").await;
    let settings = SettingsService::new(repo);
    let mut config = base_config();
    config.cookie.secure = false;

    config.apply_db_settings(&settings).await.unwrap();

    assert!(!config.cookie.secure);
}

#[tokio::test]
async fn unsupported_webhook_rows_do_not_override_host_configuration() {
    let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
    let settings = SettingsService::new(repo);
    let mut config = base_config();
    config.webhook.enabled = true;
    config.webhook.url = Some("https://8.8.8.8/events".to_string());
    config.webhook.secret = Some("a-production-grade-webhook-secret".to_string());

    config.apply_db_settings(&settings).await.unwrap();

    assert!(config.webhook.enabled);
    assert_eq!(
        config.webhook.url.as_deref(),
        Some("https://8.8.8.8/events")
    );
    assert_eq!(
        config.webhook.secret.as_deref(),
        Some("a-production-grade-webhook-secret")
    );
}

#[test]
fn environment_validation_waits_for_persisted_restart_settings() {
    let _lock = lock_env();
    let jwt_secret = "j".repeat(MIN_JWT_SECRET_LENGTH);
    let _jwt = set_env("JWT_SECRET", Some(&jwt_secret));
    let _google_enabled = set_env("GOOGLE_ENABLED", Some("true"));
    let _google_client = set_env("GOOGLE_CLIENT_ID", None);
    let _apple_enabled = set_env("APPLE_ENABLED", Some("true"));
    let _apple_client = set_env("APPLE_CLIENT_ID", None);
    let _apple_clients = set_env("APPLE_ALLOWED_CLIENT_IDS", None);
    let _apple_team = set_env("APPLE_TEAM_ID", None);

    assert!(Config::from_env().is_err());
    let mut config = Config::from_env_for_settings_merge().unwrap();
    let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
    let settings = SettingsService::new(repo);
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(config.apply_db_settings(&settings))
        .unwrap();

    assert!(!config.google.enabled);
    assert!(!config.apple.enabled);
}
