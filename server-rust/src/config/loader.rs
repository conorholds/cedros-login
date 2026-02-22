//! Configuration loading helpers

use super::*;

/// Helper to parse boolean from env var
fn parse_bool(var: &str, default: bool) -> bool {
    std::env::var(var)
        .map(|v| v == "true" || v == "1")
        .unwrap_or(default)
}

/// Helper to parse optional u64 from env var
fn parse_u64(var: &str, default: fn() -> u64) -> u64 {
    std::env::var(var)
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or_else(default)
}

/// Helper to parse optional u32 from env var
fn parse_u32(var: &str, default: fn() -> u32) -> u32 {
    std::env::var(var)
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or_else(default)
}

/// Helper to parse optional u16 from env var
fn parse_u16(var: &str, default: fn() -> u16) -> u16 {
    std::env::var(var)
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or_else(default)
}

/// Load server configuration from environment
pub fn load_server_config() -> ServerConfig {
    ServerConfig {
        host: std::env::var("HOST").unwrap_or_else(|_| default_host()),
        port: parse_u16("PORT", default_port),
        auth_base_path: std::env::var("AUTH_BASE_PATH")
            .unwrap_or_else(|_| default_auth_base_path()),
        frontend_url: std::env::var("FRONTEND_URL").ok(),
        sso_callback_url: std::env::var("SSO_CALLBACK_URL").ok(),
        bootstrap_admin_email: std::env::var("BOOTSTRAP_ADMIN_EMAIL").ok(),
        trust_proxy: std::env::var("TRUST_PROXY")
            .map(|v| v == "true" || v == "1")
            .unwrap_or(false),
    }
}

/// Load JWT configuration from environment
pub fn load_jwt_config(secret: String) -> JwtConfig {
    // Load RSA private key for RS256 JWT signing (optional - ephemeral if not set)
    let rsa_private_key_pem = std::env::var("JWT_RSA_PRIVATE_KEY").ok();

    JwtConfig {
        secret,
        rsa_private_key_pem,
        issuer: std::env::var("JWT_ISSUER").unwrap_or_else(|_| default_issuer()),
        audience: std::env::var("JWT_AUDIENCE").unwrap_or_else(|_| default_audience()),
        access_token_expiry: parse_u64("JWT_ACCESS_EXPIRY", default_access_expiry),
        refresh_token_expiry: parse_u64("JWT_REFRESH_EXPIRY", default_refresh_expiry),
    }
}

/// Load email configuration from environment
pub fn load_email_config() -> EmailConfig {
    EmailConfig {
        enabled: parse_bool("EMAIL_ENABLED", true),
        require_verification: parse_bool(
            "EMAIL_REQUIRE_VERIFICATION",
            email_require_verification_default(),
        ),
        block_disposable_emails: parse_bool("EMAIL_BLOCK_DISPOSABLE", false),
    }
}

/// Load Google OAuth configuration from environment
pub fn load_google_config() -> GoogleConfig {
    GoogleConfig {
        enabled: parse_bool("GOOGLE_ENABLED", true),
        client_id: std::env::var("GOOGLE_CLIENT_ID").ok(),
    }
}

/// Load Apple Sign-In configuration from environment
pub fn load_apple_config() -> AppleConfig {
    AppleConfig {
        enabled: parse_bool("APPLE_ENABLED", true),
        client_id: std::env::var("APPLE_CLIENT_ID").ok(),
        team_id: std::env::var("APPLE_TEAM_ID").ok(),
    }
}

/// Load Solana configuration from environment
pub fn load_solana_config() -> SolanaConfig {
    SolanaConfig {
        enabled: parse_bool("SOLANA_ENABLED", true),
        challenge_expiry_seconds: parse_u64("SOLANA_CHALLENGE_EXPIRY", default_challenge_expiry),
    }
}

/// Load CORS configuration from environment
pub fn load_cors_config() -> CorsConfig {
    CorsConfig {
        allowed_origins: std::env::var("CORS_ORIGINS")
            .map(|v| v.split(',').map(|s| s.trim().to_string()).collect())
            .unwrap_or_else(|_| CorsConfig::default().allowed_origins),
        disabled: std::env::var("CORS_DISABLED")
            .map(|v| v == "true" || v == "1")
            .unwrap_or(false),
    }
}

/// Load cookie configuration from environment
pub fn load_cookie_config() -> CookieConfig {
    CookieConfig {
        enabled: parse_bool("COOKIE_ENABLED", true),
        domain: std::env::var("COOKIE_DOMAIN").ok(),
        secure: parse_bool("COOKIE_SECURE", cookie_secure_default()),
        same_site: std::env::var("COOKIE_SAME_SITE").unwrap_or_else(|_| default_same_site()),
        access_cookie_name: std::env::var("COOKIE_ACCESS_NAME")
            .unwrap_or_else(|_| default_access_cookie_name()),
        refresh_cookie_name: std::env::var("COOKIE_REFRESH_NAME")
            .unwrap_or_else(|_| default_refresh_cookie_name()),
        path_prefix: std::env::var("COOKIE_PATH_PREFIX")
            .or_else(|_| std::env::var("AUTH_BASE_PATH"))
            .unwrap_or_else(|_| default_path_prefix()),
    }
}

fn cookie_secure_default() -> bool {
    matches!(
        std::env::var("ENVIRONMENT").as_deref(),
        Ok("production") | Ok("prod") | Ok("PRODUCTION") | Ok("PROD")
    )
}

fn email_require_verification_default() -> bool {
    matches!(
        std::env::var("ENVIRONMENT").as_deref(),
        Ok("production") | Ok("prod") | Ok("PRODUCTION") | Ok("PROD")
    )
}

/// Load webhook configuration from environment
pub fn load_webhook_config() -> WebhookConfig {
    WebhookConfig {
        enabled: parse_bool("WEBHOOK_ENABLED", false),
        url: std::env::var("WEBHOOK_URL").ok(),
        secret: std::env::var("WEBHOOK_SECRET").ok(),
        timeout_secs: parse_u64("WEBHOOK_TIMEOUT", default_webhook_timeout),
        retry_attempts: parse_u32("WEBHOOK_RETRIES", default_webhook_retries),
    }
}

/// Load rate limit configuration from environment
pub fn load_rate_limit_config() -> RateLimitConfig {
    RateLimitConfig {
        enabled: parse_bool("RATE_LIMIT_ENABLED", true),
        auth_limit: parse_u32("RATE_LIMIT_AUTH", default_auth_limit),
        general_limit: parse_u32("RATE_LIMIT_GENERAL", default_general_limit),
        credit_limit: parse_u32("RATE_LIMIT_CREDIT", default_credit_limit),
        window_secs: parse_u64("RATE_LIMIT_WINDOW", default_window_secs),
        store: std::env::var("RATE_LIMIT_STORE").unwrap_or_else(|_| default_rate_limit_store()),
        redis_url: std::env::var("REDIS_URL").ok(),
    }
}

/// Load database configuration from environment
pub fn load_database_config() -> DatabaseConfig {
    DatabaseConfig {
        url: std::env::var("DATABASE_URL").ok(),
        max_connections: parse_u32("DATABASE_MAX_CONNECTIONS", default_max_connections),
        min_connections: parse_u32("DATABASE_MIN_CONNECTIONS", default_min_connections),
        connect_timeout_secs: parse_u64("DATABASE_CONNECT_TIMEOUT", default_connect_timeout),
        idle_timeout_secs: parse_u64("DATABASE_IDLE_TIMEOUT", default_idle_timeout),
    }
}

/// Load notification configuration from environment
pub fn load_notification_config() -> NotificationConfig {
    NotificationConfig {
        discord_webhook_url: std::env::var("DISCORD_WEBHOOK_URL").ok(),
        telegram_bot_token: std::env::var("TELEGRAM_BOT_TOKEN").ok(),
        telegram_chat_id: std::env::var("TELEGRAM_CHAT_ID").ok(),
        environment: std::env::var("ENVIRONMENT").unwrap_or_else(|_| default_environment()),
    }
}

/// Load SSO configuration from environment
pub fn load_sso_config() -> SsoConfig {
    SsoConfig {
        enabled: parse_bool("SSO_ENABLED", false),
    }
}

/// Load WebAuthn configuration from environment
pub fn load_webauthn_config() -> WebAuthnConfig {
    WebAuthnConfig {
        enabled: parse_bool("WEBAUTHN_ENABLED", false),
        rp_id: std::env::var("WEBAUTHN_RP_ID").ok(),
        rp_name: std::env::var("WEBAUTHN_RP_NAME").ok(),
        rp_origin: std::env::var("WEBAUTHN_RP_ORIGIN").ok(),
        challenge_ttl_seconds: parse_u64("WEBAUTHN_CHALLENGE_TTL", default_challenge_ttl),
        allow_platform: parse_bool("WEBAUTHN_ALLOW_PLATFORM", true),
        allow_cross_platform: parse_bool("WEBAUTHN_ALLOW_CROSS_PLATFORM", true),
        require_user_verification: parse_bool("WEBAUTHN_REQUIRE_UV", true),
    }
}

/// Load wallet configuration from environment
pub fn load_wallet_config() -> WalletConfig {
    use super::WalletRecoveryMode;

    WalletConfig {
        enabled: parse_bool("WALLET_ENABLED", false),
        recovery_mode: std::env::var("WALLET_RECOVERY_MODE")
            .ok()
            .and_then(|v| v.parse::<WalletRecoveryMode>().ok())
            .unwrap_or_default(),
        unlock_ttl_secs: parse_u64("WALLET_UNLOCK_TTL", default_wallet_unlock_ttl),
    }
}

/// Load privacy (Privacy Cash) configuration from environment
pub fn load_privacy_config() -> super::PrivacyConfig {
    use super::privacy::*;

    super::PrivacyConfig {
        enabled: parse_bool("PRIVACY_CASH_ENABLED", false),
        sidecar_url: std::env::var("PRIVACY_CASH_SIDECAR_URL")
            .unwrap_or_else(|_| default_sidecar_url()),
        sidecar_timeout_ms: parse_u64(
            "PRIVACY_CASH_SIDECAR_TIMEOUT_MS",
            default_sidecar_timeout_ms,
        ),
        sidecar_api_key: std::env::var("SIDECAR_API_KEY").ok(),
        note_encryption_key: std::env::var("NOTE_ENCRYPTION_KEY").ok(),
        note_encryption_key_id: std::env::var("NOTE_ENCRYPTION_KEY_ID")
            .unwrap_or_else(|_| "v1".to_string()),
        min_deposit_lamports: parse_u64("DEPOSIT_MIN_LAMPORTS", default_min_deposit_lamports),
        max_deposit_lamports: parse_u64("DEPOSIT_MAX_LAMPORTS", default_max_deposit_lamports),
        max_spend_per_transaction_lamports: parse_u64(
            "MAX_SPEND_PER_TRANSACTION_LAMPORTS",
            default_max_spend_per_transaction_lamports,
        ),
        session_ttl_secs: parse_u64("DEPOSIT_SESSION_TTL_SECS", default_session_ttl_secs),
        company_wallet_address: std::env::var("COMPANY_WALLET_ADDRESS").ok(),
        company_currency: std::env::var("COMPANY_CURRENCY")
            .unwrap_or_else(|_| default_company_currency()),
        deposit_webhook_secret: std::env::var("DEPOSIT_WEBHOOK_SECRET").ok(),
        // SPL token whitelist: comma-separated list of mint addresses
        // Defaults to USDC and USDT if not specified
        spl_token_whitelist: std::env::var("SPL_TOKEN_WHITELIST")
            .ok()
            .map(|s| s.split(',').map(|t| t.trim().to_string()).collect())
            .unwrap_or_else(|| vec![USDC_MINT.to_string(), USDT_MINT.to_string()]),
        // Note: Withdrawal worker settings (privacy_period_secs, withdrawal_*) are now
        // stored in the database (system_settings table) and managed via admin UI.
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;

    struct EnvGuard {
        key: &'static str,
        prev: Option<String>,
    }

    impl Drop for EnvGuard {
        fn drop(&mut self) {
            if let Some(value) = &self.prev {
                std::env::set_var(self.key, value);
            } else {
                std::env::remove_var(self.key);
            }
        }
    }

    fn set_env(key: &'static str, value: &str) -> EnvGuard {
        let prev = std::env::var(key).ok();
        std::env::set_var(key, value);
        EnvGuard { key, prev }
    }

    fn clear_env(key: &'static str) -> EnvGuard {
        let prev = std::env::var(key).ok();
        std::env::remove_var(key);
        EnvGuard { key, prev }
    }

    static ENV_LOCK: Mutex<()> = Mutex::new(());

    #[test]
    fn test_cookie_secure_default_in_production() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _env = set_env("ENVIRONMENT", "production");
        let _clear_secure = clear_env("COOKIE_SECURE");
        let config = load_cookie_config();
        assert!(config.secure);
    }

    #[test]
    fn test_cookie_secure_default_in_development() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _env = set_env("ENVIRONMENT", "development");
        let _clear_secure = clear_env("COOKIE_SECURE");
        let config = load_cookie_config();
        assert!(!config.secure);
    }

    #[test]
    fn test_cookie_secure_env_override_in_production() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _env = set_env("ENVIRONMENT", "production");
        let _secure = set_env("COOKIE_SECURE", "false");
        let config = load_cookie_config();
        assert!(!config.secure);
    }

    #[test]
    fn test_email_verification_default_in_production() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _env = set_env("ENVIRONMENT", "production");
        let _clear = clear_env("EMAIL_REQUIRE_VERIFICATION");
        let config = load_email_config();
        assert!(config.require_verification);
    }

    #[test]
    fn test_email_verification_default_in_development() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _env = set_env("ENVIRONMENT", "development");
        let _clear = clear_env("EMAIL_REQUIRE_VERIFICATION");
        let config = load_email_config();
        assert!(!config.require_verification);
    }

    #[test]
    fn test_cors_defaults_to_empty_when_unset() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _clear = clear_env("CORS_ORIGINS");
        let config = load_cors_config();
        assert!(config.allowed_origins.is_empty());
    }

    #[test]
    fn test_cookie_path_prefix_defaults_to_auth_base_path() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _auth = set_env("AUTH_BASE_PATH", "/auth");
        let _clear = clear_env("COOKIE_PATH_PREFIX");
        let config = load_cookie_config();
        assert_eq!(config.path_prefix, "/auth");
    }

    #[test]
    fn test_load_server_config_sso_callback_url() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _env = set_env(
            "SSO_CALLBACK_URL",
            "https://auth.example.com/auth/sso/callback",
        );
        let config = load_server_config();
        assert_eq!(
            config.sso_callback_url.as_deref(),
            Some("https://auth.example.com/auth/sso/callback")
        );
    }

    #[test]
    fn test_load_server_config_auth_base_path() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _env = set_env("AUTH_BASE_PATH", "/auth/v2");
        let config = load_server_config();
        assert_eq!(config.auth_base_path, "/auth/v2");
    }
}
