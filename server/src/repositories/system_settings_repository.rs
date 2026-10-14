//! System settings repository for runtime-configurable values
//!
//! Settings are stored in the database and can be modified via admin UI.
//! This replaces environment variables for settings that should be
//! configurable without restart.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::sync::Mutex;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::autosave::AutosaveIdempotencyScope;
use crate::errors::AppError;
use crate::repositories::system_settings_autosave::InMemorySettingsAutosaveRecord;
use crate::repositories::SettingsAutosaveResponseBuilder;
use crate::repositories::{SettingsAutosaveDecision, SettingsAutosaveError};

/// System setting entity
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SystemSetting {
    /// Unique setting key (e.g., "rate_limit_window")
    pub key: String,
    /// Setting value as string (parsed by consumers)
    /// For secrets, this is the encrypted value
    pub value: String,
    /// Category for grouping (e.g., "auth", "rate_limit", "server")
    pub category: String,
    /// Human-readable description
    pub description: Option<String>,
    /// Whether this setting contains a secret (encrypted value)
    pub is_secret: bool,
    /// Encryption key version (for key rotation support)
    pub encryption_version: Option<String>,
    /// Last update timestamp
    pub updated_at: DateTime<Utc>,
    /// User who last updated this setting
    pub updated_by: Option<Uuid>,
}

#[derive(Debug)]
pub enum SettingsRevisionUpdateError {
    Stale { current_revision: u64 },
    App(AppError),
}

impl From<AppError> for SettingsRevisionUpdateError {
    fn from(error: AppError) -> Self {
        Self::App(error)
    }
}

impl SystemSetting {
    /// Create a new system setting
    pub fn new(key: String, value: String, category: String) -> Self {
        Self {
            key,
            value,
            category,
            description: None,
            is_secret: false,
            encryption_version: None,
            updated_at: Utc::now(),
            updated_by: None,
        }
    }

    /// Create a new secret setting (value should already be encrypted)
    pub fn new_secret(
        key: String,
        encrypted_value: String,
        category: String,
        version: &str,
    ) -> Self {
        Self {
            key,
            value: encrypted_value,
            category,
            description: None,
            is_secret: true,
            encryption_version: Some(version.to_string()),
            updated_at: Utc::now(),
            updated_by: None,
        }
    }

    /// Create with description
    pub fn with_description(mut self, description: &str) -> Self {
        self.description = Some(description.to_string());
        self
    }

    /// Mark as secret
    pub fn as_secret(mut self, encryption_version: &str) -> Self {
        self.is_secret = true;
        self.encryption_version = Some(encryption_version.to_string());
        self
    }

    /// Parse value as u64
    pub fn as_u64(&self) -> Option<u64> {
        self.value.parse().ok()
    }

    /// Parse value as u32
    pub fn as_u32(&self) -> Option<u32> {
        self.value.parse().ok()
    }

    /// Parse value as u8
    pub fn as_u8(&self) -> Option<u8> {
        self.value.parse().ok()
    }

    /// Parse value as bool
    pub fn as_bool(&self) -> Option<bool> {
        match self.value.to_lowercase().as_str() {
            "true" | "1" | "yes" => Some(true),
            "false" | "0" | "no" => Some(false),
            _ => None,
        }
    }
}

/// System settings repository trait
#[async_trait]
pub trait SystemSettingsRepository: Send + Sync {
    /// Get all settings
    async fn get_all(&self) -> Result<Vec<SystemSetting>, AppError>;

    /// Get a setting by key
    async fn get_by_key(&self, key: &str) -> Result<Option<SystemSetting>, AppError>;

    /// Get all settings in a category
    async fn get_by_category(&self, category: &str) -> Result<Vec<SystemSetting>, AppError>;

    /// Return one internally consistent settings snapshot and its monotonic
    /// resource revision. Production repositories must override this default
    /// when separate reads cannot provide snapshot isolation.
    async fn get_all_with_revision(&self) -> Result<(Vec<SystemSetting>, u64), AppError> {
        let settings = self.get_all().await?;
        let revision = collection_revision(&settings)?;
        Ok((settings, revision))
    }

    /// Insert or update a setting
    async fn upsert(&self, setting: SystemSetting) -> Result<SystemSetting, AppError>;

    /// Insert or update multiple settings
    async fn upsert_many(
        &self,
        settings: Vec<SystemSetting>,
    ) -> Result<Vec<SystemSetting>, AppError>;

    async fn get_revision(&self) -> Result<u64, AppError> {
        collection_revision(&self.get_all().await?)
    }

    async fn upsert_many_with_revision(
        &self,
        settings: Vec<SystemSetting>,
    ) -> Result<(Vec<SystemSetting>, u64), AppError> {
        let updated = self.upsert_many(settings).await?;
        let revision = self.get_revision().await?;
        Ok((updated, revision))
    }

    async fn upsert_many_if_revision(
        &self,
        settings: Vec<SystemSetting>,
        expected_revision: u64,
    ) -> Result<(Vec<SystemSetting>, u64), SettingsRevisionUpdateError> {
        let current_revision = self.get_revision().await?;
        if current_revision != expected_revision {
            return Err(SettingsRevisionUpdateError::Stale { current_revision });
        }
        self.upsert_many_with_revision(settings)
            .await
            .map_err(SettingsRevisionUpdateError::App)
    }

    /// Atomically revision-check settings, persist them, and durably complete
    /// the scoped idempotency record used to replay the committed result.
    /// `response_builder` must produce the fully redacted public response.
    /// Implementations that cannot provide one storage transaction fail
    /// closed; callers must never emulate this with separate writes.
    async fn commit_autosave(
        &self,
        settings: Vec<SystemSetting>,
        expected_revision: u64,
        scope: &AutosaveIdempotencyScope,
        fingerprint: &str,
        response_builder: &dyn SettingsAutosaveResponseBuilder,
    ) -> Result<SettingsAutosaveDecision, SettingsAutosaveError> {
        let _ = (
            settings,
            expected_revision,
            scope,
            fingerprint,
            response_builder,
        );
        Err(SettingsAutosaveError::App(AppError::Internal(
            anyhow::anyhow!("system settings repository does not support atomic autosave"),
        )))
    }
}

/// In-memory system settings repository for development/testing
pub struct InMemorySystemSettingsRepository {
    pub(super) settings: RwLock<HashMap<String, SystemSetting>>,
    pub(super) revision: RwLock<u64>,
    pub(super) autosave_records:
        Mutex<HashMap<AutosaveIdempotencyScope, InMemorySettingsAutosaveRecord>>,
}

impl InMemorySystemSettingsRepository {
    pub fn new() -> Self {
        Self {
            settings: RwLock::new(HashMap::new()),
            revision: RwLock::new(1),
            autosave_records: Mutex::new(HashMap::new()),
        }
    }

    /// Create with default settings pre-populated
    pub fn with_defaults() -> Self {
        let defaults = Self::default_settings();
        let mut settings = HashMap::new();
        for setting in defaults {
            settings.insert(setting.key.clone(), setting);
        }
        Self {
            settings: RwLock::new(settings),
            revision: RwLock::new(1),
            autosave_records: Mutex::new(HashMap::new()),
        }
    }

    /// Get default settings matching migration seed
    #[rustfmt::skip]
    fn default_settings() -> Vec<SystemSetting> {
        fn setting(key: &str, value: &str, category: &str, description: &str) -> SystemSetting {
            SystemSetting::new(key.into(), value.into(), category.into()).with_description(description)
        }

        fn secret(key: &str, value: &str, category: &str, description: &str) -> SystemSetting {
            SystemSetting::new_secret(key.into(), value.into(), category.into(), "v1")
                .with_description(description)
        }

        vec![
            setting("rate_limit_auth", "10", "rate_limit", "Maximum auth attempts per window"),
            setting("rate_limit_general", "60", "rate_limit", "Maximum general requests per window"),
            setting("rate_limit_window", "60", "rate_limit", "Rate limit window size in seconds"),
            setting("auth_email_enabled", "true", "auth.email", "Enable email/password authentication"),
            setting("auth_email_require_verification", "true", "auth.email", "Require email verification before login"),
            setting("auth_email_block_disposable", "false", "auth.email", "Block disposable email domains"),
            setting("auth_google_enabled", "false", "auth.google", "Enable Google Sign-In"),
            setting("auth_google_client_id", "", "auth.google", "Google OAuth client ID"),
            setting("auth_apple_enabled", "false", "auth.apple", "Enable Sign in with Apple"),
            setting("auth_apple_client_id", "", "auth.apple", "Apple Services ID"),
            setting("auth_apple_team_id", "", "auth.apple", "Apple Developer Team ID"),
            setting("auth_solana_enabled", "false", "auth.solana", "Enable Solana wallet authentication"),
            setting("auth_solana_challenge_expiry", "300", "auth.solana", "Challenge expiration time in seconds"),
            setting("auth_webauthn_enabled", "false", "auth.webauthn", "Enable WebAuthn/passkey authentication"),
            setting("auth_webauthn_rp_id", "", "auth.webauthn", "WebAuthn relying party ID"),
            setting("auth_webauthn_rp_name", "", "auth.webauthn", "WebAuthn relying party display name"),
            setting("auth_webauthn_rp_origin", "", "auth.webauthn", "Allowed WebAuthn origin"),
            setting("auth_instantlink_enabled", "false", "auth.instantlink", "Enable instant link login"),
            setting("auth_instantlink_expiry", "900", "auth.instantlink", "Instant link lifetime in seconds"),
            setting("auth_instantlink_rate_limit", "5", "auth.instantlink", "Maximum instant link requests per email per hour"),
            setting("feature_sso", "false", "features", "Enable enterprise SSO"),
            setting("feature_organizations", "true", "features", "Enable multi-user organizations"),
            setting("feature_mfa", "true", "features", "Enable two-factor authentication"),
            setting("feature_instant_link", "true", "features", "Enable instant link login"),
            setting("security_cors_origins", "", "security", "Allowed CORS origins, comma-separated"),
            setting("security_cookie_domain", "", "security", "Cookie domain"),
            setting("security_cookie_secure", "true", "security", "Require HTTPS for cookies"),
            setting("security_cookie_same_site", "lax", "security", "Cookie SameSite policy"),
            setting("security_session_timeout", "604800", "security", "Session timeout in seconds"),
            setting("security_jwt_issuer", "", "security", "JWT issuer claim"),
            setting("security_jwt_audience", "", "security", "JWT audience claim"),
            setting("security_require_mfa", "false", "security", "Require email/password users to set up MFA"),
            setting("auth_new_device_alert_enabled", "true", "security", "Email users when a sign-in uses a new device"),
            setting("email_smtp_host", "", "email", "SMTP server hostname"),
            setting("email_smtp_port", "587", "email", "SMTP server port"),
            setting("email_smtp_user", "", "email", "SMTP username"),
            secret("email_smtp_password", "", "email", "SMTP password"),
            setting("email_smtp_tls", "true", "email", "Use TLS for SMTP"),
            setting("email_from_address", "", "email", "Default from email address"),
            setting("email_from_name", "", "email", "Default from display name"),
            setting("email_provider", "custom", "email", "Email delivery provider"),
            setting("email_subject_verification", "", "email", "Custom verification email subject"),
            setting("email_subject_password_reset", "", "email", "Custom password reset email subject"),
            setting("email_subject_instant_link", "", "email", "Custom instant link email subject"),
            setting("email_subject_invite", "", "email", "Custom organization invite email subject"),
            setting("email_subject_security_alert", "", "email", "Custom security alert email subject"),
            setting("webhook_enabled", "false", "webhook", "Enable webhook notifications"),
            setting("webhook_url", "", "webhook", "Webhook endpoint URL"),
            secret("webhook_secret", "", "webhook", "Webhook signing secret"),
            setting("webhook_timeout", "30", "webhook", "Webhook request timeout in seconds"),
            setting("webhook_retries", "3", "webhook", "Maximum webhook retry attempts"),
            setting("server_frontend_url", "", "server", "Frontend URL for redirects and emails"),
            setting("server_base_path", "/auth", "server", "Base path for auth endpoints"),
            setting("server_trust_proxy", "false", "server", "Trust X-Forwarded-For headers"),
            setting("server_log_level", "info", "server", "Log level"),
            setting("server_log_format", "json", "server", "Log format"),
            setting("server_environment", "development", "server", "Deployment environment"),
            secret("server_metrics_api_key", "", "server", "API key for Prometheus metrics endpoint"),
            setting("postlogin_redirect_url", "", "postlogin", "URL to redirect to after login"),
            setting("postlogin_flow_order", "subscription,username,welcome,profile", "postlogin", "Order of reorderable post-login flow steps"),
            setting("postlogin_welcome_enabled", "false", "postlogin.welcome", "Show a one-time welcome page"),
            setting("postlogin_welcome_route", "/welcome", "postlogin.welcome", "Route for welcome/onboarding"),
            setting("postlogin_complete_enabled", "false", "postlogin.complete", "Prompt users to complete profile information"),
            setting("postlogin_username_enabled", "false", "postlogin.username", "Prompt users to choose a username"),
            setting("ui_social_button_order", "webauthn,google,apple,solana", "ui", "Order of social login buttons"),
            setting("image_storage_enabled", "false", "image_storage", "Enable S3-compatible image storage"),
            setting("image_storage_provider", "s3", "image_storage", "Image storage provider"),
            setting("image_storage_bucket", "", "image_storage", "Image storage bucket"),
            setting("image_storage_region", "", "image_storage", "Image storage region"),
            setting("image_storage_endpoint", "", "image_storage", "Image storage endpoint"),
            secret("image_storage_access_key", "", "image_storage", "Image storage access key"),
            secret("image_storage_secret_key", "", "image_storage", "Image storage secret key"),
            setting("image_storage_cdn_url", "", "image_storage", "Image storage CDN URL"),
            setting("invite_codes_enabled", "false", "auth.invite_codes", "Require invite codes before newly registered users can sign in"),
            setting("invite_codes_users_can_issue", "false", "auth.invite_codes", "Allow active users to receive one-time invite codes"),
            setting("invite_codes_per_user", "0", "auth.invite_codes", "One-time invite codes each user receives per reset window"),
            setting("invite_codes_reset_interval_days", "30", "auth.invite_codes", "How often user invite codes reset in days"),
            setting("signup_limit_enabled", "false", "auth.signup_limits", "Limit new account registrations per UTC calendar period"),
            setting("signup_limit_period", "monthly", "auth.signup_limits", "UTC calendar period used for the signup limit"),
            setting("signup_limit_max", "100", "auth.signup_limits", "Maximum new accounts allowed per signup limit period"),
            setting("signup_limit_show_remaining", "false", "auth.signup_limits", "Show remaining signup capacity on public registration forms"),
            setting("subscription_selection_required", "false", "postlogin.subscription", "Require users to choose a Cedros Pay subscription plan"),
            setting("subscription_selection_route", "/subscribe", "postlogin.subscription", "App route that renders the subscription-plan chooser"),
        ]
    }
}

impl Default for InMemorySystemSettingsRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SystemSettingsRepository for InMemorySystemSettingsRepository {
    async fn get_all(&self) -> Result<Vec<SystemSetting>, AppError> {
        let settings = self.settings.read().await;
        Ok(settings.values().cloned().collect())
    }

    async fn get_by_key(&self, key: &str) -> Result<Option<SystemSetting>, AppError> {
        let settings = self.settings.read().await;
        Ok(settings.get(key).cloned())
    }

    async fn get_by_category(&self, category: &str) -> Result<Vec<SystemSetting>, AppError> {
        let settings = self.settings.read().await;
        Ok(settings
            .values()
            .filter(|s| s.category == category)
            .cloned()
            .collect())
    }

    async fn get_all_with_revision(&self) -> Result<(Vec<SystemSetting>, u64), AppError> {
        let settings = self.settings.read().await;
        let revision = self.revision.read().await;
        Ok((settings.values().cloned().collect(), *revision))
    }

    async fn upsert(&self, setting: SystemSetting) -> Result<SystemSetting, AppError> {
        let mut settings = self.settings.write().await;
        let mut revision = self.revision.write().await;
        let mut setting = setting;
        setting.updated_at = Utc::now();
        settings.insert(setting.key.clone(), setting.clone());
        *revision += 1;
        Ok(setting)
    }

    async fn upsert_many(
        &self,
        new_settings: Vec<SystemSetting>,
    ) -> Result<Vec<SystemSetting>, AppError> {
        let mut settings = self.settings.write().await;
        let mut revision = self.revision.write().await;
        let now = Utc::now();
        let mut result = Vec::with_capacity(new_settings.len());

        for mut setting in new_settings {
            setting.updated_at = now;
            settings.insert(setting.key.clone(), setting.clone());
            result.push(setting);
        }

        if !result.is_empty() {
            *revision += 1;
        }

        Ok(result)
    }

    async fn get_revision(&self) -> Result<u64, AppError> {
        Ok(*self.revision.read().await)
    }

    async fn upsert_many_with_revision(
        &self,
        new_settings: Vec<SystemSetting>,
    ) -> Result<(Vec<SystemSetting>, u64), AppError> {
        let updated = self.upsert_many(new_settings).await?;
        let revision = self.get_revision().await?;
        Ok((updated, revision))
    }

    async fn upsert_many_if_revision(
        &self,
        new_settings: Vec<SystemSetting>,
        expected_revision: u64,
    ) -> Result<(Vec<SystemSetting>, u64), SettingsRevisionUpdateError> {
        let mut settings = self.settings.write().await;
        let mut revision = self.revision.write().await;
        if *revision != expected_revision {
            return Err(SettingsRevisionUpdateError::Stale {
                current_revision: *revision,
            });
        }

        let now = Utc::now();
        let mut result = Vec::with_capacity(new_settings.len());
        for mut setting in new_settings {
            setting.updated_at = now;
            settings.insert(setting.key.clone(), setting.clone());
            result.push(setting);
        }

        if !result.is_empty() {
            *revision += 1;
        }

        Ok((result, *revision))
    }

    async fn commit_autosave(
        &self,
        settings: Vec<SystemSetting>,
        expected_revision: u64,
        scope: &AutosaveIdempotencyScope,
        fingerprint: &str,
        response_builder: &dyn SettingsAutosaveResponseBuilder,
    ) -> Result<SettingsAutosaveDecision, SettingsAutosaveError> {
        self.commit_autosave_atomic(
            settings,
            expected_revision,
            scope,
            fingerprint,
            response_builder,
            |_| Ok(()),
        )
        .await
    }
}

fn collection_revision(settings: &[SystemSetting]) -> Result<u64, AppError> {
    let millis = settings
        .iter()
        .filter_map(|setting| setting.updated_at.timestamp_millis().try_into().ok())
        .max()
        .unwrap_or(1);
    Ok(millis)
}

#[cfg(test)]
#[path = "system_settings_repository_tests.rs"]
mod tests;
