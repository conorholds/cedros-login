use super::*;
use crate::config::validation::MIN_JWT_SECRET_LENGTH;
pub(super) use crate::test_env::{lock_env, set_env};

mod database_settings;
mod notification;
mod production;
mod webhook;

pub(super) fn base_config() -> Config {
    Config {
        server: ServerConfig {
            frontend_url: Some("https://example.com".into()),
            ..ServerConfig::default()
        },
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
            ..AppleConfig::default()
        },
        solana: SolanaConfig::default(),
        webauthn: WebAuthnConfig::default(),
        cors: CorsConfig::default(),
        cookie: CookieConfig::default(),
        webhook: WebhookConfig::default(),
        rate_limit: RateLimitConfig::default(),
        database: DatabaseConfig {
            url: Some("postgresql://localhost/login".into()),
            ..DatabaseConfig::default()
        },
        notification: NotificationConfig::default(),
        sso: SsoConfig::default(),
    }
}

pub(super) fn test_rsa_private_key_pem() -> String {
    use rand::rngs::OsRng;
    use rsa::pkcs1::EncodeRsaPrivateKey;
    use rsa::RsaPrivateKey;

    // Keep small for test speed; validation only checks parseability.
    let key = RsaPrivateKey::new(&mut OsRng, 1024).unwrap();
    key.to_pkcs1_pem(rsa::pkcs1::LineEnding::LF)
        .unwrap()
        .to_string()
}
