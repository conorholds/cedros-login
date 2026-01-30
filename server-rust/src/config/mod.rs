//! Configuration management for the authentication server

mod auth;
mod database;
mod jwt;
mod loader;
mod network;
pub mod privacy;
mod server;
mod services;
mod webauthn;

pub use auth::{default_challenge_expiry, AppleConfig, EmailConfig, GoogleConfig, SolanaConfig};
pub use database::{
    default_connect_timeout, default_idle_timeout, default_max_connections,
    default_min_connections, DatabaseConfig,
};
pub use jwt::{
    default_access_expiry, default_audience, default_issuer, default_refresh_expiry, JwtConfig,
};
pub use network::{
    default_access_cookie_name, default_path_prefix, default_refresh_cookie_name,
    default_same_site, CookieConfig, CorsConfig,
};
pub use privacy::{
    default_min_deposit_lamports, default_session_ttl_secs, default_sidecar_timeout_ms,
    default_sidecar_url, PrivacyConfig,
};
pub use server::{default_auth_base_path, default_host, default_port, ServerConfig};
pub use services::{
    default_auth_limit, default_credit_limit, default_environment, default_general_limit,
    default_rate_limit_store, default_wallet_unlock_ttl, default_webhook_retries,
    default_webhook_timeout, default_window_secs, NotificationConfig, RateLimitConfig, SsoConfig,
    WalletConfig, WalletRecoveryMode, WebhookConfig,
};
pub use webauthn::{default_challenge_ttl, WebAuthnConfig};

use crate::errors::AppError;
use loader::*;
use serde::Deserialize;

/// Main application configuration
#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    #[serde(default)]
    pub server: ServerConfig,
    pub jwt: JwtConfig,
    #[serde(default)]
    pub email: EmailConfig,
    #[serde(default)]
    pub google: GoogleConfig,
    #[serde(default)]
    pub apple: AppleConfig,
    #[serde(default)]
    pub solana: SolanaConfig,
    #[serde(default)]
    pub webauthn: WebAuthnConfig,
    #[serde(default)]
    pub cors: CorsConfig,
    #[serde(default)]
    pub cookie: CookieConfig,
    #[serde(default)]
    pub webhook: WebhookConfig,
    #[serde(default)]
    pub rate_limit: RateLimitConfig,
    #[serde(default)]
    pub database: DatabaseConfig,
    #[serde(default)]
    pub notification: NotificationConfig,
    #[serde(default)]
    pub sso: SsoConfig,
    #[serde(default)]
    pub wallet: WalletConfig,
    #[serde(default)]
    pub privacy: PrivacyConfig,
}

/// Minimum recommended length for JWT secret
const MIN_JWT_SECRET_LENGTH: usize = 32;

/// Check if an IPv4 address is in a private range (RFC 1918, loopback, link-local)
fn is_private_ipv4(ip: std::net::Ipv4Addr) -> bool {
    // 10.0.0.0/8
    ip.octets()[0] == 10
        // 172.16.0.0/12
        || (ip.octets()[0] == 172 && (ip.octets()[1] >= 16 && ip.octets()[1] <= 31))
        // 192.168.0.0/16
        || (ip.octets()[0] == 192 && ip.octets()[1] == 168)
        // 127.0.0.0/8 (loopback)
        || ip.octets()[0] == 127
        // 169.254.0.0/16 (link-local)
        || (ip.octets()[0] == 169 && ip.octets()[1] == 254)
        // 0.0.0.0/8 (current network)
        || ip.octets()[0] == 0
        // 100.64.0.0/10 (carrier-grade NAT)
        || (ip.octets()[0] == 100 && (ip.octets()[1] & 0b1100_0000) == 64)
        // 192.0.0.0/24 (IETF protocol assignments)
        || (ip.octets()[0] == 192 && ip.octets()[1] == 0 && ip.octets()[2] == 0)
        // 198.18.0.0/15 (benchmarking)
        || (ip.octets()[0] == 198 && (ip.octets()[1] == 18 || ip.octets()[1] == 19))
        // 224.0.0.0/4 (multicast) and 240.0.0.0/4 (reserved)
        || ip.octets()[0] >= 224
}

/// Check if an IPv6 address is unique local (fc00::/7)
///
/// Note: Using manual implementation to maintain MSRV 1.75 compatibility.
/// `Ipv6Addr::is_unique_local()` was stabilized in Rust 1.84.
fn is_unique_local_v6(v6: std::net::Ipv6Addr) -> bool {
    // fc00::/7 covers fc00::/8 and fd00::/8
    let segments = v6.segments();
    (segments[0] & 0xfe00) == 0xfc00
}

/// Check if an IPv6 address is link-local unicast (fe80::/10)
///
/// Note: Using manual implementation to maintain MSRV 1.75 compatibility.
/// `Ipv6Addr::is_unicast_link_local()` was stabilized in Rust 1.84.
fn is_link_local_v6(v6: std::net::Ipv6Addr) -> bool {
    let segments = v6.segments();
    (segments[0] & 0xffc0) == 0xfe80
}

/// Check if an IP address is private or local-only
fn is_private_ip(ip: std::net::IpAddr) -> bool {
    match ip {
        std::net::IpAddr::V4(v4) => is_private_ipv4(v4),
        std::net::IpAddr::V6(v6) => {
            v6.is_loopback()
                || v6.is_unspecified()
                || v6.is_multicast()
                || is_unique_local_v6(v6)
                || is_link_local_v6(v6)
        }
    }
}

impl Config {
    /// Validate the configuration for security and correctness
    pub fn validate(&self) -> Result<(), AppError> {
        // JWT secret must be sufficiently long
        if self.jwt.secret.len() < MIN_JWT_SECRET_LENGTH {
            return Err(AppError::Config(format!(
                "JWT_SECRET must be at least {} characters for security (got {})",
                MIN_JWT_SECRET_LENGTH,
                self.jwt.secret.len()
            )));
        }

        // Token expiries must be positive
        if self.jwt.access_token_expiry == 0 {
            return Err(AppError::Config(
                "JWT_ACCESS_EXPIRY must be greater than 0".into(),
            ));
        }
        if self.jwt.refresh_token_expiry == 0 {
            return Err(AppError::Config(
                "JWT_REFRESH_EXPIRY must be greater than 0".into(),
            ));
        }

        // Refresh expiry should be longer than access expiry
        if self.jwt.refresh_token_expiry <= self.jwt.access_token_expiry {
            tracing::warn!(
                "JWT_REFRESH_EXPIRY ({}) should be longer than JWT_ACCESS_EXPIRY ({})",
                self.jwt.refresh_token_expiry,
                self.jwt.access_token_expiry
            );
        }

        // Rate limits must be reasonable
        if self.rate_limit.enabled {
            if self.rate_limit.auth_limit == 0 {
                return Err(AppError::Config(
                    "RATE_LIMIT_AUTH must be greater than 0 when rate limiting is enabled".into(),
                ));
            }
            if self.rate_limit.window_secs == 0 {
                return Err(AppError::Config(
                    "RATE_LIMIT_WINDOW must be greater than 0 when rate limiting is enabled".into(),
                ));
            }
            match self.rate_limit.store.as_str() {
                "memory" => {}
                "redis" => {
                    #[cfg(not(feature = "redis-rate-limit"))]
                    return Err(AppError::Config(
                        "RATE_LIMIT_STORE=redis requires the 'redis-rate-limit' feature. \
                         Compile with: cargo build --features redis-rate-limit"
                            .into(),
                    ));
                    #[cfg(feature = "redis-rate-limit")]
                    if self.rate_limit.redis_url.is_none() {
                        return Err(AppError::Config(
                            "REDIS_URL is required when RATE_LIMIT_STORE=redis".into(),
                        ));
                    }
                }
                _ => {
                    return Err(AppError::Config(
                        "RATE_LIMIT_STORE must be 'memory' or 'redis'".into(),
                    ));
                }
            }
        }

        // Google requires client_id if enabled
        if self.google.enabled && self.google.client_id.is_none() {
            return Err(AppError::Config(
                "GOOGLE_CLIENT_ID is required when Google auth is enabled".into(),
            ));
        }

        // Apple requires client_id and team_id if enabled
        if self.apple.enabled {
            if self.apple.client_id.is_none() {
                return Err(AppError::Config(
                    "APPLE_CLIENT_ID is required when Apple auth is enabled".into(),
                ));
            }
            if self.apple.team_id.is_none() {
                return Err(AppError::Config(
                    "APPLE_TEAM_ID is required when Apple auth is enabled".into(),
                ));
            }
        }

        // Webhook requires url and secret if enabled
        if self.webhook.enabled {
            let url_str = self.webhook.url.as_ref().ok_or_else(|| {
                AppError::Config("WEBHOOK_URL is required when webhooks are enabled".into())
            })?;

            if self.webhook.secret.is_none() {
                return Err(AppError::Config(
                    "WEBHOOK_SECRET is required when webhooks are enabled".into(),
                ));
            }

            // Validate webhook URL to prevent SSRF attacks
            self.validate_webhook_url(url_str)?;
        }

        let env_lc = self.notification.environment.trim().to_ascii_lowercase();
        let is_production_strict = matches!(env_lc.as_str(), "production" | "prod");
        let is_production_like =
            !matches!(env_lc.as_str(), "dev" | "development" | "local" | "test");

        if self.cookie.enabled && !self.cookie.secure {
            if is_production_like {
                return Err(AppError::Config(
                    "COOKIE_SECURE must be true in production-like environments".into(),
                ));
            }

            // M-09: Stronger warning for non-localhost development
            let is_localhost = self.server.host == "127.0.0.1"
                || self.server.host == "localhost"
                || self.server.host == "::1"
                || self.server.host == "0.0.0.0"; // binds locally

            if is_localhost {
                tracing::info!(
                    "COOKIE_SECURE is false (localhost development mode). \
                    Set COOKIE_SECURE=true for non-localhost deployments."
                );
            } else {
                tracing::warn!(
                    "COOKIE_SECURE is false but HOST is {} (not localhost). \
                    Cookies will be transmitted insecurely over HTTP! \
                    Set COOKIE_SECURE=true and use HTTPS for any non-localhost deployment.",
                    self.server.host
                );
            }
        }

        if self.cookie.same_site.to_lowercase() == "none" && !self.cookie.secure {
            return Err(AppError::Config(
                "COOKIE_SAME_SITE=none requires COOKIE_SECURE=true".into(),
            ));
        }

        if let Some(ref webhook_url) = self.notification.discord_webhook_url {
            if webhook_url.trim().is_empty() {
                return Err(AppError::Config(
                    "DISCORD_WEBHOOK_URL cannot be empty when set".into(),
                ));
            }
        }

        if let Some(ref token) = self.notification.telegram_bot_token {
            if token.trim().is_empty() {
                return Err(AppError::Config(
                    "TELEGRAM_BOT_TOKEN cannot be empty when set".into(),
                ));
            }
        }

        if let Some(ref chat_id) = self.notification.telegram_chat_id {
            if chat_id.trim().is_empty() {
                return Err(AppError::Config(
                    "TELEGRAM_CHAT_ID cannot be empty when set".into(),
                ));
            }
        }

        let is_production = is_production_strict;

        if is_production_like {
            let totp_secret = std::env::var("TOTP_ENCRYPTION_SECRET").unwrap_or_default();
            if totp_secret.is_empty() {
                return Err(AppError::Config(
                    "TOTP_ENCRYPTION_SECRET is required in production-like environments".into(),
                ));
            }
        }

        if is_production_like && self.jwt.rsa_private_key_pem.is_none() {
            return Err(AppError::Config(
                "JWT_RSA_PRIVATE_KEY is required in production-like environments".into(),
            ));
        }

        if let Some(ref pem) = self.jwt.rsa_private_key_pem {
            use rsa::pkcs1::DecodeRsaPrivateKey;
            use rsa::RsaPrivateKey;

            RsaPrivateKey::from_pkcs1_pem(pem).map_err(|e| {
                AppError::Config(format!(
                    "Invalid JWT_RSA_PRIVATE_KEY (expected PKCS#1 PEM): {}",
                    e
                ))
            })?;
        }

        if self.server.frontend_url.is_none() {
            tracing::warn!(
                "FRONTEND_URL not set - email verification and password reset links \
                will use http://localhost:3000. Set FRONTEND_URL in production."
            );
        }

        if is_production && !self.email.require_verification {
            tracing::warn!(
                "EMAIL_REQUIRE_VERIFICATION is false in production. \
                Users can register without verifying their email address."
            );
        }

        if let Some(callback_url) = &self.server.sso_callback_url {
            let url = url::Url::parse(callback_url)
                .map_err(|e| AppError::Config(format!("Invalid SSO_CALLBACK_URL: {}", e)))?;
            if url.scheme() != "http" && url.scheme() != "https" {
                return Err(AppError::Config(
                    "SSO_CALLBACK_URL must use http or https scheme".into(),
                ));
            }
            if is_production && url.scheme() != "https" {
                return Err(AppError::Config(
                    "SSO_CALLBACK_URL must use HTTPS in production".into(),
                ));
            }
        } else if is_production && self.sso.enabled {
            let frontend_https = self
                .server
                .frontend_url
                .as_ref()
                .map(|url| url.starts_with("https://"))
                .unwrap_or(false);

            if !frontend_https {
                return Err(AppError::Config(
                    "SSO_CALLBACK_URL must be set to an HTTPS URL in production when FRONTEND_URL is not https".into(),
                ));
            }
        }

        // Validate CORS configuration - require explicit origins in production
        for origin in &self.cors.allowed_origins {
            let url = url::Url::parse(origin)
                .map_err(|_| AppError::Config(format!("Invalid CORS origin: {}", origin)))?;
            if url.scheme() != "http" && url.scheme() != "https" {
                return Err(AppError::Config(format!(
                    "Invalid CORS origin scheme: {}",
                    origin
                )));
            }
            if url.host_str().is_none() {
                return Err(AppError::Config(format!(
                    "Invalid CORS origin host: {}",
                    origin
                )));
            }
        }

        if is_production_like && self.cors.allowed_origins.is_empty() {
            return Err(AppError::Config(
                "CORS_ORIGINS must be configured in production-like environments. \
                Set CORS_ORIGINS to a comma-separated list of allowed origins."
                    .into(),
            ));
        }

        // Privacy Cash validation
        if self.privacy.enabled {
            if self.privacy.sidecar_api_key.is_none() {
                return Err(AppError::Config(
                    "SIDECAR_API_KEY is required when Privacy Cash is enabled".into(),
                ));
            }

            if let Some(ref key) = self.privacy.note_encryption_key {
                // Validate key is valid base64 and decodes to 32 bytes
                match base64::Engine::decode(&base64::engine::general_purpose::STANDARD, key) {
                    Ok(bytes) if bytes.len() == 32 => {}
                    Ok(bytes) => {
                        return Err(AppError::Config(format!(
                            "NOTE_ENCRYPTION_KEY must decode to 32 bytes (got {} bytes)",
                            bytes.len()
                        )));
                    }
                    Err(e) => {
                        return Err(AppError::Config(format!(
                            "NOTE_ENCRYPTION_KEY must be valid base64: {}",
                            e
                        )));
                    }
                }
            } else {
                return Err(AppError::Config(
                    "NOTE_ENCRYPTION_KEY is required when Privacy Cash is enabled".into(),
                ));
            }

            // Validate sidecar URL
            let url = url::Url::parse(&self.privacy.sidecar_url).map_err(|e| {
                AppError::Config(format!("Invalid PRIVACY_CASH_SIDECAR_URL: {}", e))
            })?;
            if url.scheme() != "http" && url.scheme() != "https" {
                return Err(AppError::Config(
                    "PRIVACY_CASH_SIDECAR_URL must use http or https scheme".into(),
                ));
            }
            if is_production && url.scheme() != "https" {
                return Err(AppError::Config(
                    "PRIVACY_CASH_SIDECAR_URL must use HTTPS in production".into(),
                ));
            }
        }

        Ok(())
    }

    /// Validate webhook URL to prevent SSRF attacks
    fn validate_webhook_url(&self, url_str: &str) -> Result<(), AppError> {
        use std::net::IpAddr;
        use url::Url;

        let url = Url::parse(url_str)
            .map_err(|e| AppError::Config(format!("Invalid WEBHOOK_URL: {}", e)))?;

        // Require HTTPS in production
        let is_production = self
            .notification
            .environment
            .eq_ignore_ascii_case("production")
            || self.notification.environment.eq_ignore_ascii_case("prod");
        if is_production && url.scheme() != "https" {
            return Err(AppError::Config(
                "WEBHOOK_URL must use HTTPS in production".into(),
            ));
        }

        // Must be http or https
        if url.scheme() != "http" && url.scheme() != "https" {
            return Err(AppError::Config(
                "WEBHOOK_URL must use http or https scheme".into(),
            ));
        }

        // Get the host
        let host = url
            .host()
            .ok_or_else(|| AppError::Config("WEBHOOK_URL must have a host".into()))?;

        match host {
            url::Host::Ipv4(ipv4) => {
                if is_private_ip(IpAddr::V4(ipv4)) {
                    return Err(AppError::Config(
                        "WEBHOOK_URL cannot point to private IP addresses".into(),
                    ));
                }
                return Ok(());
            }
            url::Host::Ipv6(ipv6) => {
                if is_private_ip(IpAddr::V6(ipv6)) {
                    return Err(AppError::Config(
                        "WEBHOOK_URL cannot point to private IP addresses".into(),
                    ));
                }
                return Ok(());
            }
            url::Host::Domain(domain) => {
                // Block dangerous hostnames
                if domain == "localhost" {
                    return Err(AppError::Config(
                        "WEBHOOK_URL cannot point to localhost".into(),
                    ));
                }

                // CFG-001: Block internal hostnames (metadata IPs like 169.254.169.254 are
                // handled by the Ipv4 branch above and blocked by is_private_ip)
                if domain.ends_with(".internal") || domain.ends_with(".local") {
                    return Err(AppError::Config(
                        "WEBHOOK_URL cannot point to internal endpoints".into(),
                    ));
                }

                // DNS resolution is deferred to runtime webhook validation to avoid
                // blocking startup on slow or unavailable DNS.
            }
        }

        Ok(())
    }

    /// Load configuration from environment variables
    pub fn from_env() -> Result<Self, AppError> {
        let jwt_secret = std::env::var("JWT_SECRET")
            .map_err(|_| AppError::Config("JWT_SECRET environment variable is required".into()))?;

        let config = Config {
            server: load_server_config(),
            jwt: load_jwt_config(jwt_secret),
            email: load_email_config(),
            google: load_google_config(),
            apple: load_apple_config(),
            solana: load_solana_config(),
            webauthn: load_webauthn_config(),
            cors: load_cors_config(),
            cookie: load_cookie_config(),
            webhook: load_webhook_config(),
            rate_limit: load_rate_limit_config(),
            database: load_database_config(),
            notification: load_notification_config(),
            sso: load_sso_config(),
            wallet: load_wallet_config(),
            privacy: load_privacy_config(),
        };

        config.validate()?;
        Ok(config)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::Engine;
    use std::sync::Mutex;

    fn base_config() -> Config {
        Config {
            server: ServerConfig::default(),
            jwt: JwtConfig {
                secret: "s".repeat(MIN_JWT_SECRET_LENGTH),
                rsa_private_key_pem: None,
                issuer: default_issuer(),
                audience: default_audience(),
                access_token_expiry: default_access_expiry(),
                refresh_token_expiry: default_refresh_expiry(),
            },
            email: EmailConfig::default(),
            google: GoogleConfig {
                enabled: false,
                client_id: None,
            },
            apple: AppleConfig {
                enabled: false,
                client_id: None,
                team_id: None,
            },
            solana: SolanaConfig::default(),
            webauthn: WebAuthnConfig::default(),
            cors: CorsConfig::default(),
            cookie: CookieConfig::default(),
            webhook: WebhookConfig::default(),
            rate_limit: RateLimitConfig::default(),
            database: DatabaseConfig::default(),
            notification: NotificationConfig::default(),
            sso: SsoConfig::default(),
            wallet: WalletConfig::default(),
            privacy: PrivacyConfig::default(),
        }
    }

    fn valid_note_key() -> String {
        base64::engine::general_purpose::STANDARD.encode([0u8; 32])
    }

    fn test_rsa_private_key_pem() -> String {
        use rand::rngs::OsRng;
        use rsa::pkcs1::EncodeRsaPrivateKey;
        use rsa::RsaPrivateKey;

        // Keep small for test speed; validation only checks parseability.
        let key = RsaPrivateKey::new(&mut OsRng, 1024).unwrap();
        key.to_pkcs1_pem(rsa::pkcs1::LineEnding::LF)
            .unwrap()
            .to_string()
    }

    fn enable_privacy(config: &mut Config) {
        config.privacy.enabled = true;
        config.privacy.sidecar_api_key = Some("sidecar-key".to_string());
        config.privacy.note_encryption_key = Some(valid_note_key());
    }

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
        let _lock = ENV_LOCK.lock().unwrap();
        let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", &totp_secret);

        let mut config = base_config();
        config.notification.environment = "production".to_string();
        config.cookie.secure = true;
        // Production requires CORS origins to be set
        config.cors.allowed_origins = vec!["https://example.com".to_string()];
        config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_jwt_rsa_private_key_required_in_production() {
        let _lock = ENV_LOCK.lock().unwrap();
        let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", &totp_secret);

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
        let _lock = ENV_LOCK.lock().unwrap();
        let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", &totp_secret);

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

    static ENV_LOCK: Mutex<()> = Mutex::new(());

    #[test]
    fn test_from_env_runs_validation() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _jwt = set_env("JWT_SECRET", "short");
        let _google = set_env("GOOGLE_ENABLED", "false");

        let err = Config::from_env().unwrap_err().to_string();
        assert!(err.contains("JWT_SECRET must be at least"));
    }

    #[test]
    fn test_cors_required_in_production() {
        // F-03: CORS origins must be configured in production-like envs
        let _lock = ENV_LOCK.lock().unwrap();
        let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", &totp_secret);

        let mut config = base_config();
        config.notification.environment = "production".to_string();
        config.cookie.secure = true; // Must be true in production
        config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
        config.cors.allowed_origins = vec![];
        let err = config.validate().unwrap_err().to_string();
        assert!(err.contains("CORS_ORIGINS must be configured in production-like environments"));
    }

    #[test]
    fn test_cors_required_in_staging() {
        let _lock = ENV_LOCK.lock().unwrap();
        let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", &totp_secret);

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
        // F-03: Empty CORS allowed in non-production (fails closed)
        let mut config = base_config();
        config.notification.environment = "development".to_string();
        config.cors.allowed_origins = vec![];
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_cors_passes_in_production_with_origins() {
        let _lock = ENV_LOCK.lock().unwrap();
        let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", &totp_secret);

        let mut config = base_config();
        config.notification.environment = "production".to_string();
        config.cookie.secure = true;
        config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
        config.cors.allowed_origins = vec!["https://example.com".to_string()];
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_privacy_sidecar_requires_https_in_production() {
        let _lock = ENV_LOCK.lock().unwrap();
        let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", &totp_secret);

        let mut config = base_config();
        config.notification.environment = "production".to_string();
        config.cookie.secure = true;
        config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
        config.cors.allowed_origins = vec!["https://example.com".to_string()];
        enable_privacy(&mut config);
        config.privacy.sidecar_url = "http://sidecar.example.com".to_string();
        let err = config.validate().unwrap_err().to_string();
        assert!(err.contains("PRIVACY_CASH_SIDECAR_URL must use HTTPS in production"));
    }

    #[test]
    fn test_privacy_sidecar_allows_http_in_development() {
        let mut config = base_config();
        config.notification.environment = "development".to_string();
        enable_privacy(&mut config);
        config.privacy.sidecar_url = "http://sidecar.example.com".to_string();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_cors_rejects_invalid_origin() {
        let mut config = base_config();
        config.cors.allowed_origins = vec!["not-a-url".to_string()];
        let err = config.validate().unwrap_err().to_string();
        assert!(err.contains("Invalid CORS origin"));
    }

    #[test]
    fn test_sso_callback_url_requires_https_in_production() {
        let _lock = ENV_LOCK.lock().unwrap();
        let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", &totp_secret);

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
        let _lock = ENV_LOCK.lock().unwrap();
        let totp_secret = "s".repeat(MIN_JWT_SECRET_LENGTH);
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", &totp_secret);

        let mut config = base_config();
        config.notification.environment = "production".to_string();
        config.sso.enabled = true;
        config.cookie.secure = true;
        config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());
        config.cors.allowed_origins = vec!["https://example.com".to_string()];
        config.server.frontend_url = Some("http://example.com".to_string());
        config.server.sso_callback_url = None;
        let err = config.validate().unwrap_err().to_string();
        assert!(err.contains("SSO_CALLBACK_URL must be set to an HTTPS URL in production"));
    }

    #[test]
    fn test_totp_encryption_secret_required_in_production() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", "");

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
        let _lock = ENV_LOCK.lock().unwrap();
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", "");

        let mut config = base_config();
        config.notification.environment = "staging".to_string();
        config.cookie.secure = true;
        config.jwt.rsa_private_key_pem = Some(test_rsa_private_key_pem());

        let err = config.validate().unwrap_err().to_string();
        assert!(err.contains("TOTP_ENCRYPTION_SECRET is required in production-like environments"));
    }

    #[test]
    fn test_webhook_url_rejects_private_ipv6() {
        let mut config = base_config();
        config.webhook.enabled = true;
        config.webhook.url = Some("http://[fd00::1]/webhook".to_string());
        config.webhook.secret = Some("secret".to_string());

        let err = config.validate().unwrap_err().to_string();
        assert!(err.contains("private IP addresses"), "{}", err);
    }

    #[test]
    fn test_webhook_url_accepts_public_ipv6() {
        let mut config = base_config();
        config.webhook.enabled = true;
        config.webhook.url = Some("http://[2001:db8::1]/webhook".to_string());
        config.webhook.secret = Some("secret".to_string());

        if let Err(e) = config.validate() {
            panic!("{}", e);
        }
    }

    #[test]
    fn test_webhook_url_rejects_reserved_ipv4() {
        let cases = [
            "http://0.0.0.0/webhook",
            "http://100.64.0.1/webhook",
            "http://192.0.0.1/webhook",
            "http://198.18.0.1/webhook",
            "http://224.0.0.1/webhook",
        ];

        for url in cases {
            let mut config = base_config();
            config.webhook.enabled = true;
            config.webhook.url = Some(url.to_string());
            config.webhook.secret = Some("secret".to_string());
            let err = config.validate().unwrap_err().to_string();
            assert!(err.contains("private IP addresses"), "{}", err);
        }
    }

    #[test]
    fn test_webhook_url_rejects_local_hostname() {
        let mut config = base_config();
        config.webhook.enabled = true;
        config.webhook.url = Some("http://webhook.local/path".to_string());
        config.webhook.secret = Some("secret".to_string());

        let err = config.validate().unwrap_err().to_string();
        assert!(err.contains("internal endpoints"), "{}", err);
    }

    #[test]
    fn test_notification_config_rejects_empty_discord_webhook() {
        let mut config = base_config();
        config.notification.discord_webhook_url = Some("   ".to_string());
        let err = config.validate().unwrap_err().to_string();
        assert!(
            err.contains("DISCORD_WEBHOOK_URL cannot be empty"),
            "{}",
            err
        );
    }

    #[test]
    fn test_notification_config_rejects_empty_telegram_fields() {
        let mut config = base_config();
        config.notification.telegram_bot_token = Some("".to_string());
        config.notification.telegram_chat_id = Some(" ".to_string());
        let err = config.validate().unwrap_err().to_string();
        assert!(
            err.contains("TELEGRAM_BOT_TOKEN cannot be empty"),
            "{}",
            err
        );
    }

    #[test]
    fn test_notification_config_rejects_empty_telegram_chat_id() {
        let mut config = base_config();
        config.notification.telegram_bot_token = Some("token".to_string());
        config.notification.telegram_chat_id = Some(" ".to_string());
        let err = config.validate().unwrap_err().to_string();
        assert!(err.contains("TELEGRAM_CHAT_ID cannot be empty"), "{}", err);
    }
}
