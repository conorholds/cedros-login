use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};

use crate::errors::AppError;
use crate::middleware::rate_limit::RateLimitStore;

use super::model::Config;

/// Minimum recommended length for JWT secrets.
pub(super) const MIN_JWT_SECRET_LENGTH: usize = 32;

#[derive(Clone, Copy)]
struct EnvironmentKind {
    is_production_like: bool,
}

impl EnvironmentKind {
    fn from_config(config: &Config) -> Self {
        let environment = config.notification.environment.trim().to_ascii_lowercase();
        Self {
            is_production_like: !matches!(
                environment.as_str(),
                "dev" | "development" | "local" | "test"
            ),
        }
    }
}

impl Config {
    /// Validate the configuration for security and correctness.
    pub fn validate(&self) -> Result<(), AppError> {
        self.validate_jwt()?;
        let environment = EnvironmentKind::from_config(self);
        self.validate_rate_limit(environment.is_production_like)?;
        self.validate_auth_providers()?;
        self.validate_webhook()?;
        self.validate_cookie(environment.is_production_like)?;
        self.validate_notifications()?;
        self.validate_production_secrets(environment.is_production_like)?;
        self.validate_sso(environment.is_production_like)?;
        self.validate_cors(environment.is_production_like)?;
        self.validate_frontend_and_email(environment.is_production_like)?;
        self.validate_persistence(environment.is_production_like)
    }

    fn validate_jwt(&self) -> Result<(), AppError> {
        if self.jwt.secret.len() < MIN_JWT_SECRET_LENGTH {
            return Err(AppError::Config(format!(
                "JWT_SECRET must be at least {} characters for security (got {})",
                MIN_JWT_SECRET_LENGTH,
                self.jwt.secret.len()
            )));
        }
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
        if self.jwt.refresh_token_expiry <= self.jwt.access_token_expiry {
            tracing::warn!(
                "JWT_REFRESH_EXPIRY ({}) should be longer than JWT_ACCESS_EXPIRY ({})",
                self.jwt.refresh_token_expiry,
                self.jwt.access_token_expiry
            );
        }
        Ok(())
    }

    fn validate_rate_limit(&self, is_production_like: bool) -> Result<(), AppError> {
        if !self.rate_limit.enabled {
            return Ok(());
        }
        match self.rate_limit.store.as_str() {
            "memory" => {
                if is_production_like && RateLimitStore::is_multi_instance_environment() {
                    return Err(AppError::Config(
                        "RATE_LIMIT_STORE=memory is not allowed in production-like multi-instance deployments. Use RATE_LIMIT_STORE=redis."
                            .into(),
                    ));
                }
            }
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
        Ok(())
    }

    fn validate_auth_providers(&self) -> Result<(), AppError> {
        if self.google.enabled && self.google.client_id.is_none() {
            return Err(AppError::Config(
                "GOOGLE_CLIENT_ID is required when Google auth is enabled".into(),
            ));
        }
        if self.apple.enabled {
            if self.apple.client_id.is_none() && self.apple.allowed_client_ids.is_empty() {
                return Err(AppError::Config(
                    "APPLE_CLIENT_ID or APPLE_ALLOWED_CLIENT_IDS is required when Apple auth is enabled".into(),
                ));
            }
            if self.apple.team_id.is_none() {
                return Err(AppError::Config(
                    "APPLE_TEAM_ID is required when Apple auth is enabled".into(),
                ));
            }
        }
        Ok(())
    }

    fn validate_webhook(&self) -> Result<(), AppError> {
        if !self.webhook.enabled {
            return Ok(());
        }
        let url = self.webhook.url.as_ref().ok_or_else(|| {
            AppError::Config("WEBHOOK_URL is required when webhooks are enabled".into())
        })?;
        if self.webhook.secret.is_none() {
            return Err(AppError::Config(
                "WEBHOOK_SECRET is required when webhooks are enabled".into(),
            ));
        }
        validate_webhook_url(url, &self.notification.environment)
    }

    fn validate_cookie(&self, is_production_like: bool) -> Result<(), AppError> {
        if self.cookie.enabled && !self.cookie.secure {
            if is_production_like {
                return Err(AppError::Config(
                    "COOKIE_SECURE must be true in production-like environments".into(),
                ));
            }
            let is_localhost = matches!(
                self.server.host.as_str(),
                "127.0.0.1" | "localhost" | "::1" | "0.0.0.0"
            );
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
        Ok(())
    }

    fn validate_notifications(&self) -> Result<(), AppError> {
        validate_nonempty_setting(
            self.notification.discord_webhook_url.as_deref(),
            "DISCORD_WEBHOOK_URL",
        )?;
        validate_nonempty_setting(
            self.notification.telegram_bot_token.as_deref(),
            "TELEGRAM_BOT_TOKEN",
        )?;
        validate_nonempty_setting(
            self.notification.telegram_chat_id.as_deref(),
            "TELEGRAM_CHAT_ID",
        )
    }

    fn validate_production_secrets(&self, is_production_like: bool) -> Result<(), AppError> {
        if is_production_like
            && std::env::var("TOTP_ENCRYPTION_SECRET")
                .unwrap_or_default()
                .is_empty()
        {
            return Err(AppError::Config(
                "TOTP_ENCRYPTION_SECRET is required in production-like environments".into(),
            ));
        }
        if is_production_like
            && std::env::var("TOTP_ENCRYPTION_SECRET")
                .unwrap_or_default()
                .trim()
                .len()
                < MIN_JWT_SECRET_LENGTH
        {
            return Err(AppError::Config("TOTP_ENCRYPTION_SECRET must contain at least 32 characters in production-like environments".into()));
        }
        if is_production_like && self.jwt.rsa_private_key_pem.is_none() {
            return Err(AppError::Config(
                "JWT_RSA_PRIVATE_KEY is required in production-like environments".into(),
            ));
        }
        if let Some(pem) = &self.jwt.rsa_private_key_pem {
            use rsa::pkcs1::DecodeRsaPrivateKey;
            rsa::RsaPrivateKey::from_pkcs1_pem(pem).map_err(|error| {
                AppError::Config(format!(
                    "Invalid JWT_RSA_PRIVATE_KEY (expected PKCS#1 PEM): {error}"
                ))
            })?;
        }
        Ok(())
    }

    fn validate_persistence(&self, is_production_like: bool) -> Result<(), AppError> {
        if is_production_like
            && self
                .database
                .url
                .as_ref()
                .is_none_or(|url| url.trim().is_empty())
        {
            return Err(AppError::Config("DATABASE_URL is required in production-like environments; in-memory identity state is not durable".into()));
        }
        #[cfg(not(feature = "postgres"))]
        if self.database.url.is_some() || is_production_like {
            return Err(AppError::Config(
                "Persistent identity storage requires the postgres feature".into(),
            ));
        }
        Ok(())
    }

    fn validate_frontend_and_email(&self, is_production: bool) -> Result<(), AppError> {
        if let Some(frontend) = &self.server.frontend_url {
            validate_public_url(frontend, "FRONTEND_URL", is_production)?;
        } else if is_production {
            return Err(AppError::Config(
                "FRONTEND_URL is required in production-like environments".into(),
            ));
        }
        if self.server.frontend_url.is_none() {
            tracing::warn!(
                "FRONTEND_URL not set - email verification and password reset links \
                will use http://localhost:57164. Set FRONTEND_URL in production."
            );
        }
        if is_production && !self.email.require_verification {
            tracing::warn!(
                "EMAIL_REQUIRE_VERIFICATION is false in production. \
                Users can register without verifying their email address."
            );
        }
        Ok(())
    }

    fn validate_sso(&self, is_production: bool) -> Result<(), AppError> {
        if let Some(callback_url) = &self.server.sso_callback_url {
            validate_public_url(callback_url, "SSO_CALLBACK_URL", is_production)?;
            let url = url::Url::parse(callback_url)
                .map_err(|error| AppError::Config(format!("Invalid SSO_CALLBACK_URL: {error}")))?;
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
        Ok(())
    }

    fn validate_cors(&self, is_production_like: bool) -> Result<(), AppError> {
        for origin in &self.cors.allowed_origins {
            let url = url::Url::parse(origin)
                .map_err(|_| AppError::Config(format!("Invalid CORS origin: {origin}")))?;
            validate_public_url(origin, "CORS_ORIGINS", is_production_like)?;
            if url.scheme() != "http" && url.scheme() != "https" {
                return Err(AppError::Config(format!(
                    "Invalid CORS origin scheme: {origin}"
                )));
            }
            if url.path() != "/" || url.query().is_some() || url.fragment().is_some() {
                return Err(AppError::Config(
                    "CORS_ORIGINS must contain only origins, without paths, queries or fragments"
                        .into(),
                ));
            }
            if url.host_str().is_none() {
                return Err(AppError::Config(format!(
                    "Invalid CORS origin host: {origin}"
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
        Ok(())
    }
}

fn validate_nonempty_setting(value: Option<&str>, name: &str) -> Result<(), AppError> {
    if value.is_some_and(|value| value.trim().is_empty()) {
        return Err(AppError::Config(format!("{name} cannot be empty when set")));
    }
    Ok(())
}

fn validate_webhook_url(url: &str, environment: &str) -> Result<(), AppError> {
    let url = url::Url::parse(url)
        .map_err(|error| AppError::Config(format!("Invalid WEBHOOK_URL: {error}")))?;
    let is_production =
        environment.eq_ignore_ascii_case("production") || environment.eq_ignore_ascii_case("prod");
    if is_production && url.scheme() != "https" {
        return Err(AppError::Config(
            "WEBHOOK_URL must use HTTPS in production".into(),
        ));
    }
    if url.scheme() != "http" && url.scheme() != "https" {
        return Err(AppError::Config(
            "WEBHOOK_URL must use http or https scheme".into(),
        ));
    }
    let host = url
        .host()
        .ok_or_else(|| AppError::Config("WEBHOOK_URL must have a host".into()))?;
    validate_webhook_host(host)
}

fn validate_webhook_host(host: url::Host<&str>) -> Result<(), AppError> {
    match host {
        url::Host::Ipv4(ip) if is_private_ip(IpAddr::V4(ip)) => Err(AppError::Config(
            "WEBHOOK_URL cannot point to private IP addresses".into(),
        )),
        url::Host::Ipv6(ip) if is_private_ip(IpAddr::V6(ip)) => Err(AppError::Config(
            "WEBHOOK_URL cannot point to private IP addresses".into(),
        )),
        url::Host::Domain("localhost") => Err(AppError::Config(
            "WEBHOOK_URL cannot point to localhost".into(),
        )),
        url::Host::Domain(domain)
            if domain.ends_with(".internal") || domain.ends_with(".local") =>
        {
            Err(AppError::Config(
                "WEBHOOK_URL cannot point to internal endpoints".into(),
            ))
        }
        _ => Ok(()),
    }
}

/// Check if an IP address is private or local-only.
fn is_private_ip(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(ip) => is_private_ipv4(ip),
        IpAddr::V6(ip) => {
            ip.is_loopback()
                || ip.is_unspecified()
                || ip.is_multicast()
                || is_unique_local_v6(ip)
                || is_link_local_v6(ip)
        }
    }
}

/// Check if an IPv4 address is in a private or otherwise local-only range.
fn is_private_ipv4(ip: Ipv4Addr) -> bool {
    let octets = ip.octets();
    octets[0] == 10
        || (octets[0] == 172 && (16..=31).contains(&octets[1]))
        || (octets[0] == 192 && octets[1] == 168)
        || octets[0] == 127
        || (octets[0] == 169 && octets[1] == 254)
        || octets[0] == 0
        || (octets[0] == 100 && (octets[1] & 0b1100_0000) == 64)
        || (octets[0] == 192 && octets[1] == 0 && octets[2] == 0)
        || (octets[0] == 198 && matches!(octets[1], 18 | 19))
        || octets[0] >= 224
}

/// Check if an IPv6 address is unique local (fc00::/7).
///
/// This manual implementation maintains the crate's Rust 1.75 MSRV.
fn is_unique_local_v6(ip: Ipv6Addr) -> bool {
    (ip.segments()[0] & 0xfe00) == 0xfc00
}

/// Check if an IPv6 address is link-local unicast (fe80::/10).
///
/// This manual implementation maintains the crate's Rust 1.75 MSRV.
fn is_link_local_v6(ip: Ipv6Addr) -> bool {
    (ip.segments()[0] & 0xffc0) == 0xfe80
}

fn validate_public_url(value: &str, name: &str, production: bool) -> Result<(), AppError> {
    let url = url::Url::parse(value).map_err(|_| AppError::Config(format!("Invalid {name}")))?;
    if production && url.scheme() != "https" {
        return Err(AppError::Config(format!(
            "{name} must use HTTPS in production-like environments"
        )));
    }
    if !matches!(url.scheme(), "http" | "https")
        || url.host_str().is_none()
        || !url.username().is_empty()
        || url.password().is_some()
        || url.fragment().is_some()
        || url.query().is_some()
    {
        return Err(AppError::Config(format!(
            "{name} must be an HTTP(S) URL without credentials, query or fragment"
        )));
    }
    Ok(())
}
