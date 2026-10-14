//! Configuration management for the authentication server.

mod auth;
mod database;
mod database_settings;
mod environment;
mod jwt;
mod loader;
mod model;
mod network;
mod server;
mod services;
mod validation;
mod webauthn;

pub use auth::{default_challenge_expiry, AppleConfig, EmailConfig, GoogleConfig, SolanaConfig};
pub use database::{
    default_connect_timeout, default_idle_timeout, default_max_connections,
    default_min_connections, DatabaseConfig,
};
pub use jwt::{
    default_access_expiry, default_audience, default_issuer, default_refresh_expiry, JwtConfig,
};
pub use model::Config;
pub use network::{
    default_access_cookie_name, default_path_prefix, default_refresh_cookie_name,
    default_same_site, CookieConfig, CorsConfig,
};
pub use server::{default_auth_base_path, default_host, default_port, ServerConfig};
pub use services::{
    default_auth_limit, default_environment, default_general_limit, default_rate_limit_store,
    default_webhook_retries, default_webhook_timeout, default_window_secs, NotificationConfig,
    RateLimitConfig, SsoConfig, WebhookConfig,
};
pub use webauthn::{default_challenge_ttl, WebAuthnConfig};

#[cfg(test)]
mod tests;
