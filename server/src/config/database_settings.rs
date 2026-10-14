use crate::errors::AppError;
use crate::services::SettingsService;

use super::model::Config;

impl Config {
    /// Apply settings from database, overriding env-loaded values where DB values are set.
    ///
    /// This method is used during server initialization to merge database-managed
    /// settings with the environment-loaded config. Database settings take precedence
    /// when they have non-empty values.
    ///
    /// # Settings applied
    /// - Request-time fallback config for executable auth providers and SSO
    /// - Security composition: CORS, cookies, session lifetime, JWT claims
    /// - Server composition: frontend URL, SSO callback, base path, proxy trust
    ///
    /// The standalone binary calls this after loading the complete settings
    /// snapshot and before constructing services or the router. Runtime settings
    /// such as feature gates continue to be read via `SettingsService` per request.
    pub async fn apply_db_settings(&mut self, settings: &SettingsService) -> Result<(), AppError> {
        self.apply_google_settings(settings).await?;
        self.apply_apple_settings(settings).await?;
        self.apply_solana_settings(settings).await?;
        self.apply_webauthn_settings(settings).await?;
        self.apply_email_settings(settings).await?;
        self.apply_feature_settings(settings).await?;
        self.apply_security_settings(settings).await?;
        self.apply_jwt_settings(settings).await?;
        self.apply_server_settings(settings).await?;
        self.validate()?;
        tracing::info!("Applied database settings (DB values override environment)");
        Ok(())
    }

    async fn apply_google_settings(&mut self, settings: &SettingsService) -> Result<(), AppError> {
        if let Some(enabled) = settings.get_bool("auth_google_enabled").await? {
            self.google.enabled = enabled;
            tracing::debug!(enabled, "DB override: auth_google_enabled");
        }
        if let Some(client_id) = settings.get("auth_google_client_id").await? {
            if !client_id.is_empty() {
                self.google.client_id = Some(client_id);
                tracing::debug!("DB override: auth_google_client_id");
            }
        }
        Ok(())
    }

    async fn apply_apple_settings(&mut self, settings: &SettingsService) -> Result<(), AppError> {
        if let Some(enabled) = settings.get_bool("auth_apple_enabled").await? {
            self.apple.enabled = enabled;
            tracing::debug!(enabled, "DB override: auth_apple_enabled");
        }
        if let Some(client_id) = settings.get("auth_apple_client_id").await? {
            if !client_id.is_empty() {
                self.apple.client_id = Some(client_id);
                tracing::debug!("DB override: auth_apple_client_id");
            }
        }
        self.apply_apple_allowed_clients(settings).await?;
        if let Some(team_id) = settings.get("auth_apple_team_id").await? {
            if !team_id.is_empty() {
                self.apple.team_id = Some(team_id);
                tracing::debug!("DB override: auth_apple_team_id");
            }
        }
        if let Some(key_id) = settings.get("auth_apple_key_id").await? {
            if !key_id.is_empty() {
                self.apple.key_id = Some(key_id);
                tracing::debug!("DB override: auth_apple_key_id");
            }
        }
        if let Some(private_key_pem) = settings.get("auth_apple_private_key_pem").await? {
            if !private_key_pem.is_empty() {
                self.apple.private_key_pem = Some(private_key_pem);
                tracing::debug!("DB override: auth_apple_private_key_pem");
            }
        }
        Ok(())
    }

    async fn apply_apple_allowed_clients(
        &mut self,
        settings: &SettingsService,
    ) -> Result<(), AppError> {
        if let Some(client_ids) = settings.get("auth_apple_allowed_client_ids").await? {
            let parsed = client_ids
                .split(',')
                .map(|value| value.trim().to_string())
                .filter(|value| !value.is_empty())
                .collect::<Vec<_>>();
            if !parsed.is_empty() {
                self.apple.allowed_client_ids = parsed;
                tracing::debug!("DB override: auth_apple_allowed_client_ids");
            }
        }
        Ok(())
    }

    async fn apply_solana_settings(&mut self, settings: &SettingsService) -> Result<(), AppError> {
        if let Some(enabled) = settings.get_bool("auth_solana_enabled").await? {
            self.solana.enabled = enabled;
            tracing::debug!(enabled, "DB override: auth_solana_enabled");
        }
        if let Some(expiry) = settings.get_u64("auth_solana_challenge_expiry").await? {
            self.solana.challenge_expiry_seconds = expiry;
            tracing::debug!(expiry, "DB override: auth_solana_challenge_expiry");
        }
        Ok(())
    }

    async fn apply_webauthn_settings(
        &mut self,
        settings: &SettingsService,
    ) -> Result<(), AppError> {
        if let Some(enabled) = settings.get_bool("auth_webauthn_enabled").await? {
            self.webauthn.enabled = enabled;
            tracing::debug!(enabled, "DB override: auth_webauthn_enabled");
        }
        if let Some(rp_id) = settings.get("auth_webauthn_rp_id").await? {
            if !rp_id.is_empty() {
                self.webauthn.rp_id = Some(rp_id);
                tracing::debug!("DB override: auth_webauthn_rp_id");
            }
        }
        if let Some(rp_name) = settings.get("auth_webauthn_rp_name").await? {
            if !rp_name.is_empty() {
                self.webauthn.rp_name = Some(rp_name);
                tracing::debug!("DB override: auth_webauthn_rp_name");
            }
        }
        if let Some(rp_origin) = settings.get("auth_webauthn_rp_origin").await? {
            if !rp_origin.is_empty() {
                self.webauthn.rp_origin = Some(rp_origin);
                tracing::debug!("DB override: auth_webauthn_rp_origin");
            }
        }
        Ok(())
    }

    async fn apply_email_settings(&mut self, settings: &SettingsService) -> Result<(), AppError> {
        if let Some(enabled) = settings.get_bool("auth_email_enabled").await? {
            self.email.enabled = enabled;
            tracing::debug!(enabled, "DB override: auth_email_enabled");
        }
        if let Some(require_verification) =
            settings.get_bool("auth_email_require_verification").await?
        {
            self.email.require_verification = require_verification;
            tracing::debug!(
                require_verification,
                "DB override: auth_email_require_verification"
            );
        }
        if let Some(block_disposable) = settings.get_bool("auth_email_block_disposable").await? {
            self.email.block_disposable_emails = block_disposable;
            tracing::debug!(block_disposable, "DB override: auth_email_block_disposable");
        }
        Ok(())
    }

    async fn apply_feature_settings(&mut self, settings: &SettingsService) -> Result<(), AppError> {
        if let Some(enabled) = settings.get_bool("feature_sso").await? {
            self.sso.enabled = enabled;
            tracing::debug!(enabled, "DB override: feature_sso");
        }
        Ok(())
    }

    async fn apply_security_settings(
        &mut self,
        settings: &SettingsService,
    ) -> Result<(), AppError> {
        if let Some(cors_origins) = settings.get("security_cors_origins").await? {
            if !cors_origins.is_empty() {
                self.cors.allowed_origins = cors_origins
                    .split(',')
                    .map(|value| value.trim().to_string())
                    .filter(|value| !value.is_empty())
                    .collect();
                tracing::debug!("DB override: security_cors_origins");
            }
        }
        if let Some(cookie_domain) = settings.get("security_cookie_domain").await? {
            if !cookie_domain.is_empty() {
                self.cookie.domain = Some(cookie_domain);
                tracing::debug!("DB override: security_cookie_domain");
            }
        }
        if let Some(cookie_secure) = settings.get_bool("security_cookie_secure").await? {
            self.cookie.secure = cookie_secure;
            tracing::debug!(cookie_secure, "DB override: security_cookie_secure");
        }
        if let Some(same_site) = settings.get("security_cookie_same_site").await? {
            if !same_site.is_empty() {
                self.cookie.same_site = same_site;
                tracing::debug!("DB override: security_cookie_same_site");
            }
        }
        if let Some(session_timeout) = settings.get_u64("security_session_timeout").await? {
            self.jwt.refresh_token_expiry = session_timeout;
            tracing::debug!(session_timeout, "DB override: security_session_timeout");
        }
        Ok(())
    }

    async fn apply_jwt_settings(&mut self, settings: &SettingsService) -> Result<(), AppError> {
        if let Some(issuer) = non_empty(settings.get("security_jwt_issuer").await?) {
            self.jwt.issuer = issuer;
            tracing::debug!("DB override: security_jwt_issuer");
        }
        if let Some(audience) = non_empty(settings.get("security_jwt_audience").await?) {
            self.jwt.audience = audience;
            tracing::debug!("DB override: security_jwt_audience");
        }
        Ok(())
    }

    async fn apply_server_settings(&mut self, settings: &SettingsService) -> Result<(), AppError> {
        if let Some(frontend_url) = settings.get("server_frontend_url").await? {
            if !frontend_url.is_empty() {
                self.server.frontend_url = Some(frontend_url);
                tracing::debug!("DB override: server_frontend_url");
            }
        }
        if let Some(callback_url) = non_empty(settings.get("sso_callback_url").await?) {
            self.server.sso_callback_url = Some(callback_url);
            tracing::debug!("DB override: sso_callback_url");
        }
        if let Some(base_path) = settings.get("server_base_path").await? {
            if !base_path.is_empty() {
                self.server.auth_base_path = base_path;
                tracing::debug!("DB override: server_base_path");
            }
        }
        if let Some(trust_proxy) = settings.get_bool("server_trust_proxy").await? {
            self.server.trust_proxy = trust_proxy;
            tracing::debug!(trust_proxy, "DB override: server_trust_proxy");
        }
        Ok(())
    }
}

fn non_empty(value: Option<String>) -> Option<String> {
    value.filter(|value| !value.is_empty())
}
