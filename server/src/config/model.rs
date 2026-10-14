use serde::Deserialize;

use super::auth::{AppleConfig, EmailConfig, GoogleConfig, SolanaConfig};
use super::database::DatabaseConfig;
use super::jwt::JwtConfig;
use super::network::{CookieConfig, CorsConfig};
use super::server::ServerConfig;
use super::services::{NotificationConfig, RateLimitConfig, SsoConfig, WebhookConfig};
use super::webauthn::WebAuthnConfig;

/// Main application configuration.
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
}
