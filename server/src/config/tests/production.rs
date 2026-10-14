use super::*;

#[test]
fn test_cookie_secure_required_in_production() {
    let mut config = base_config();
    config.notification.environment = "production".to_string();
    config.cookie.secure = false;
    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("COOKIE_SECURE must be true in production-like environments"));
}

#[test]
fn test_cookie_secure_required_in_staging() {
    let mut config = base_config();
    config.notification.environment = "staging".to_string();
    config.cookie.secure = false;
    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("COOKIE_SECURE must be true in production-like environments"));
}

#[test]
fn test_cookie_secure_allowed_in_non_production() {
    let mut config = base_config();
    config.notification.environment = "development".to_string();
    config.cookie.secure = false;
    assert!(config.validate().is_ok());
}

#[test]
fn test_cookie_secure_passes_in_production() {
    let _lock = lock_env();
    let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", Some(&totp_secret));

    let mut config = base_config();
    config.notification.environment = "production".to_string();
    config.cookie.secure = true;
    config.cors.allowed_origins = vec!["https://example.com".to_string()];
    config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
    assert!(config.validate().is_ok());
}

#[test]
fn test_jwt_rsa_private_key_required_in_production() {
    let _lock = lock_env();
    let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", Some(&totp_secret));

    let mut config = base_config();
    config.notification.environment = "production".to_string();
    config.cookie.secure = true;
    config.cors.allowed_origins = vec!["https://example.com".to_string()];
    config.jwt.rsa_private_key_pem = None;

    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("JWT_RSA_PRIVATE_KEY is required in production-like environments"));
}

#[test]
fn test_jwt_rsa_private_key_required_in_staging() {
    let _lock = lock_env();
    let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", Some(&totp_secret));

    let mut config = base_config();
    config.notification.environment = "staging".to_string();
    config.cookie.secure = true;
    config.jwt.rsa_private_key_pem = None;

    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("JWT_RSA_PRIVATE_KEY is required in production-like environments"));
}

#[test]
fn test_jwt_rsa_private_key_rejects_invalid_pem() {
    let mut config = base_config();
    config.jwt.rsa_private_key_pem = Some("not-a-pem".to_string());
    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("Invalid JWT_RSA_PRIVATE_KEY"));
}

#[test]
fn test_rate_limit_store_rejects_invalid() {
    let mut config = base_config();
    config.rate_limit.store = "invalid".to_string();
    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("RATE_LIMIT_STORE must be 'memory' or 'redis'"));
}

#[test]
#[cfg(feature = "redis-rate-limit")]
fn test_rate_limit_redis_requires_url() {
    let mut config = base_config();
    config.rate_limit.store = "redis".to_string();
    config.rate_limit.redis_url = None;
    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("REDIS_URL is required"));
}

#[test]
#[cfg(feature = "redis-rate-limit")]
fn test_rate_limit_redis_accepts_valid_url() {
    let mut config = base_config();
    config.rate_limit.store = "redis".to_string();
    config.rate_limit.redis_url = Some("redis://localhost:6379".to_string());
    assert!(config.validate().is_ok());
}

#[test]
fn test_rate_limit_memory_rejected_in_production_multi_instance() {
    let _lock = lock_env();
    let _replicas = set_env("REPLICAS", Some("2"));

    let mut config = base_config();
    config.notification.environment = "production".to_string();
    config.cookie.secure = true;
    config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
    config.cors.allowed_origins = vec!["https://app.example.com".to_string()];
    config.rate_limit.store = "memory".to_string();
    config.rate_limit.redis_url = None;

    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("RATE_LIMIT_STORE=memory is not allowed"));
}

#[test]
fn test_from_env_runs_validation() {
    let _lock = lock_env();
    let _jwt = set_env("JWT_SECRET", Some("short"));
    let _google = set_env("GOOGLE_ENABLED", Some("false"));

    let err = Config::from_env().unwrap_err().to_string();
    assert!(err.contains("JWT_SECRET must be at least"));
}

#[test]
fn test_cors_required_in_production() {
    let _lock = lock_env();
    let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", Some(&totp_secret));

    let mut config = base_config();
    config.notification.environment = "production".to_string();
    config.cookie.secure = true;
    config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
    config.cors.allowed_origins = vec![];
    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("CORS_ORIGINS must be configured in production-like environments"));
}

#[test]
fn test_cors_required_in_staging() {
    let _lock = lock_env();
    let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", Some(&totp_secret));

    let mut config = base_config();
    config.notification.environment = "staging".to_string();
    config.cookie.secure = true;
    config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
    config.cors.allowed_origins = vec![];
    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("CORS_ORIGINS must be configured in production-like environments"));
}

#[test]
fn test_cors_allowed_empty_in_development() {
    let mut config = base_config();
    config.notification.environment = "development".to_string();
    config.cors.allowed_origins = vec![];
    assert!(config.validate().is_ok());
}

#[test]
fn test_cors_passes_in_production_with_origins() {
    let _lock = lock_env();
    let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", Some(&totp_secret));

    let mut config = base_config();
    config.notification.environment = "production".to_string();
    config.cookie.secure = true;
    config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
    config.cors.allowed_origins = vec!["https://example.com".to_string()];
    assert!(config.validate().is_ok());
}

#[test]
fn test_sso_callback_url_requires_https_in_production() {
    let _lock = lock_env();
    let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", Some(&totp_secret));

    let mut config = base_config();
    config.notification.environment = "production".to_string();
    config.sso.enabled = true;
    config.cookie.secure = true;
    config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
    config.cors.allowed_origins = vec!["https://example.com".to_string()];
    config.server.sso_callback_url = Some("http://auth.example.com/auth/sso/callback".into());
    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("SSO_CALLBACK_URL must use HTTPS in production"));
}

#[test]
fn test_sso_callback_url_required_when_frontend_not_https_in_production() {
    let _lock = lock_env();
    let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", Some(&totp_secret));

    let mut config = base_config();
    config.notification.environment = "production".to_string();
    config.sso.enabled = true;
    config.cookie.secure = true;
    config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
    config.cors.allowed_origins = vec!["https://example.com".to_string()];
    config.server.frontend_url = Some("http://example.com".to_string());
    config.server.sso_callback_url = None;
    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains(
        "SSO_CALLBACK_URL must be set to an HTTPS URL in production when FRONTEND_URL is not https"
    ));
}

#[test]
fn test_totp_encryption_secret_required_in_production() {
    let _lock = lock_env();
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", Some(""));

    let mut config = base_config();
    config.notification.environment = "production".to_string();
    config.cookie.secure = true;
    config.cors.allowed_origins = vec!["https://example.com".to_string()];
    config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());

    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("TOTP_ENCRYPTION_SECRET is required in production-like environments"));
}

#[test]
fn test_totp_encryption_secret_required_in_staging() {
    let _lock = lock_env();
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", Some(""));

    let mut config = base_config();
    config.notification.environment = "staging".to_string();
    config.cookie.secure = true;
    config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());

    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("TOTP_ENCRYPTION_SECRET is required in production-like environments"));
}

#[test]
fn production_urls_and_durable_storage_fail_closed() {
    let _lock = lock_env();
    let _totp = set_env(
        "TOTP_ENCRYPTION_SECRET",
        Some("test-secret-at-least-thirty-two-bytes"),
    );
    let mut config = base_config();
    config.notification.environment = "staging".into();
    config.cookie.secure = true;
    config.cors.allowed_origins = vec!["https://example.com".into()];
    config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
    assert!(config.validate().is_ok());
    config.database.url = None;
    assert!(config
        .validate()
        .unwrap_err()
        .to_string()
        .contains("DATABASE_URL"));
    config.database.url = Some("postgresql://localhost/login".into());
    for bad in [
        None,
        Some("http://example.com"),
        Some("https://user:secret@example.com"),
        Some("https://example.com/#token"),
        Some("https://example.com/?token=value"),
    ] {
        config.server.frontend_url = bad.map(str::to_string);
        assert!(config
            .validate()
            .unwrap_err()
            .to_string()
            .contains("FRONTEND_URL"));
    }
    config.server.frontend_url = Some("https://example.com/app".into());
    for bad in [
        "http://example.com",
        "https://example.com/path",
        "https://example.com/?site=other",
        "https://user:secret@example.com",
    ] {
        config.cors.allowed_origins = vec![bad.into()];
        assert!(config.validate().is_err(), "{bad}");
    }
    config.cors.allowed_origins = vec!["https://example.com".into()];
    config.server.sso_callback_url = Some("http://example.com/callback".into());
    assert!(config
        .validate()
        .unwrap_err()
        .to_string()
        .contains("SSO_CALLBACK_URL"));
    config.server.sso_callback_url = Some("https://example.com/callback".into());
    assert!(config.validate().is_ok());
}

#[test]
fn production_rejects_short_totp_encryption_keys() {
    let _lock = lock_env();
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", Some("weak-key"));
    let mut config = base_config();
    config.notification.environment = "production".into();
    config.cookie.secure = true;
    assert!(config
        .validate()
        .unwrap_err()
        .to_string()
        .contains("at least 32 characters"));
}
