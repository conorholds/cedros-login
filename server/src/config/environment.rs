use crate::errors::AppError;

use super::loader::*;
use super::model::Config;

impl Config {
    /// Load configuration from environment variables and validate the result.
    pub fn from_env() -> Result<Self, AppError> {
        let config = Self::from_env_for_settings_merge()?;
        config.validate()?;
        Ok(config)
    }

    /// Load environment configuration before database-managed settings are merged.
    ///
    /// The returned value is intentionally not validated because persisted
    /// restart settings may supply or disable values needed to make the merged
    /// configuration valid. Call [`Config::apply_db_settings`] before composing
    /// services; that method validates the final configuration.
    pub fn from_env_for_settings_merge() -> Result<Self, AppError> {
        let jwt_secret = std::env::var("JWT_SECRET")
            .map_err(|_| AppError::Config("JWT_SECRET environment variable is required".into()))?;

        Ok(Config {
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
        })
    }
}
