//! Settings service with caching for runtime-configurable values
//!
//! Reads settings from the database and caches them for performance.
//! Cache is automatically refreshed after TTL expires.
//!
//! Supports encrypted secrets via the EncryptionService.

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{Mutex, RwLock};

use crate::errors::AppError;
use crate::repositories::{SystemSetting, SystemSettingsRepository};
use crate::services::EncryptionService;
use crate::settings_registry::{setting_spec, validate_setting_value, SettingsRuntime};

/// Default cache TTL (60 seconds)
const DEFAULT_CACHE_TTL_SECS: u64 = 60;
pub(crate) const EMAIL_AUTH_ENABLED_KEY: &str = "auth_email_enabled";
pub(crate) const EMAIL_VERIFICATION_REQUIRED_KEY: &str = "auth_email_require_verification";

/// Cached setting with metadata
#[derive(Clone)]
struct CachedSetting {
    value: String,
    is_secret: bool,
    is_valid: bool,
}

impl CachedSetting {
    fn from_setting(setting: &SystemSetting) -> Self {
        let is_valid = setting_spec(&setting.key, SettingsRuntime::Standalone)
            .map(|spec| validate_setting_value(spec, &setting.value).is_ok())
            .unwrap_or(true);
        if !is_valid {
            tracing::warn!(
                setting_key = %setting.key,
                "Ignoring invalid persisted setting value until an operator corrects it"
            );
        }
        Self {
            value: setting.value.clone(),
            is_secret: setting.is_secret,
            is_valid,
        }
    }
}

/// Service for reading system settings with caching
pub struct SettingsService {
    repo: Arc<dyn SystemSettingsRepository>,
    encryption: Option<EncryptionService>,
    cache: RwLock<HashMap<String, CachedSetting>>,
    cache_revision: RwLock<Option<u64>>,
    last_refresh: RwLock<Option<Instant>>,
    refresh_lock: Mutex<()>,
    cache_ttl: Duration,
}

impl SettingsService {
    /// Create a new settings service
    pub fn new(repo: Arc<dyn SystemSettingsRepository>) -> Self {
        Self {
            repo,
            encryption: None,
            cache: RwLock::new(HashMap::new()),
            cache_revision: RwLock::new(None),
            last_refresh: RwLock::new(None),
            refresh_lock: Mutex::new(()),
            cache_ttl: Duration::from_secs(DEFAULT_CACHE_TTL_SECS),
        }
    }

    /// Create with encryption service for handling secrets
    pub fn with_encryption(
        repo: Arc<dyn SystemSettingsRepository>,
        encryption: EncryptionService,
    ) -> Self {
        Self {
            repo,
            encryption: Some(encryption),
            cache: RwLock::new(HashMap::new()),
            cache_revision: RwLock::new(None),
            last_refresh: RwLock::new(None),
            refresh_lock: Mutex::new(()),
            cache_ttl: Duration::from_secs(DEFAULT_CACHE_TTL_SECS),
        }
    }

    /// Create with custom cache TTL
    pub fn with_ttl(repo: Arc<dyn SystemSettingsRepository>, ttl_secs: u64) -> Self {
        Self {
            repo,
            encryption: None,
            cache: RwLock::new(HashMap::new()),
            cache_revision: RwLock::new(None),
            last_refresh: RwLock::new(None),
            refresh_lock: Mutex::new(()),
            cache_ttl: Duration::from_secs(ttl_secs),
        }
    }

    /// Create with encryption and custom TTL
    pub fn with_encryption_and_ttl(
        repo: Arc<dyn SystemSettingsRepository>,
        encryption: EncryptionService,
        ttl_secs: u64,
    ) -> Self {
        Self {
            repo,
            encryption: Some(encryption),
            cache: RwLock::new(HashMap::new()),
            cache_revision: RwLock::new(None),
            last_refresh: RwLock::new(None),
            refresh_lock: Mutex::new(()),
            cache_ttl: Duration::from_secs(ttl_secs),
        }
    }

    /// Check if cache needs refresh
    async fn needs_refresh(&self) -> bool {
        let last = self.last_refresh.read().await;
        match *last {
            None => true,
            Some(instant) => instant.elapsed() > self.cache_ttl,
        }
    }

    /// Refresh the cache from database
    pub async fn refresh(&self) -> Result<(), AppError> {
        let _refresh_guard = self.refresh_lock.lock().await;
        self.refresh_locked().await
    }

    /// The caller must hold refresh_lock, including through publication.
    async fn refresh_locked(&self) -> Result<(), AppError> {
        let (settings, revision) = self.repo.get_all_with_revision().await?;

        let mut cache = self.cache.write().await;
        cache.clear();
        for setting in settings {
            cache.insert(setting.key.clone(), CachedSetting::from_setting(&setting));
        }

        let mut cache_revision = self.cache_revision.write().await;
        *cache_revision = Some(revision);

        let mut last_refresh = self.last_refresh.write().await;
        *last_refresh = Some(Instant::now());

        Ok(())
    }

    /// Publish settings that the repository has already committed into this
    /// service's current complete cache snapshot without another storage read.
    ///
    /// If this instance has not loaded a complete snapshot yet, it remains
    /// invalidated; inserting a partial cache and marking it fresh would hide
    /// unrelated settings. Other `SettingsService` instances observe the write
    /// only after their explicit refresh or TTL expiry.
    pub async fn publish_committed(&self, settings: &[SystemSetting], revision: u64) {
        let _refresh_guard = self.refresh_lock.lock().await;
        let current_revision = *self.cache_revision.read().await;
        if self.last_refresh.read().await.is_none() || current_revision.is_none() {
            tracing::debug!(
                updated_settings = settings.len(),
                revision,
                "Settings commit completed before this cache loaded a full snapshot"
            );
            return;
        }

        let current_revision = current_revision.expect("checked above");
        if revision <= current_revision {
            tracing::debug!(
                revision,
                current_revision,
                "Ignoring an already represented settings commit"
            );
            return;
        }

        if current_revision.checked_add(1) != Some(revision) {
            self.cache.write().await.clear();
            *self.cache_revision.write().await = None;
            *self.last_refresh.write().await = None;
            tracing::warn!(
                revision,
                current_revision,
                "Invalidated settings cache after observing a commit revision gap"
            );
            return;
        }

        let mut cache = self.cache.write().await;
        for setting in settings {
            cache.insert(setting.key.clone(), CachedSetting::from_setting(setting));
        }
        *self.cache_revision.write().await = Some(revision);
    }

    /// Ensure cache is fresh, refreshing if needed
    async fn ensure_fresh(&self) -> Result<(), AppError> {
        if self.needs_refresh().await {
            let _refresh_guard = self.refresh_lock.lock().await;
            // Another getter may have loaded a complete snapshot while we waited.
            if self.needs_refresh().await {
                self.refresh_locked().await?;
            }
        }
        Ok(())
    }

    /// Get a setting value as string
    /// Note: For secrets, this returns the encrypted value. Use `get_secret()` for decrypted values.
    pub async fn get(&self, key: &str) -> Result<Option<String>, AppError> {
        self.ensure_fresh().await?;
        let cache = self.cache.read().await;
        Ok(cache
            .get(key)
            .filter(|setting| setting.is_valid)
            .map(|setting| setting.value.clone()))
    }

    /// Return a non-secret value to a domain consumer that must distinguish an
    /// absent setting from a present-but-invalid setting and owns stricter
    /// validation/error semantics than the generic registry.
    pub(crate) async fn get_for_domain_validation(
        &self,
        key: &str,
    ) -> Result<Option<String>, AppError> {
        self.ensure_fresh().await?;
        let cache = self.cache.read().await;
        match cache.get(key) {
            Some(setting) if setting.is_secret => Err(AppError::Internal(anyhow::anyhow!(
                "Secret setting '{key}' cannot bypass registry validation"
            ))),
            Some(setting) => Ok(Some(setting.value.clone())),
            None => Ok(None),
        }
    }

    /// Get a secret setting value (decrypted)
    /// Returns None if key not found, or error if decryption fails
    pub async fn get_secret(&self, key: &str) -> Result<Option<String>, AppError> {
        self.ensure_fresh().await?;
        let cache = self.cache.read().await;

        match cache.get(key) {
            None => Ok(None),
            Some(cached) if !cached.is_valid => Ok(None),
            Some(cached) => {
                if !cached.is_secret {
                    // Not a secret, return as-is
                    return Ok(Some(cached.value.clone()));
                }

                // Empty secret value means not configured
                if cached.value.is_empty() {
                    return Ok(Some(String::new()));
                }

                // Decrypt the secret
                let encryption = self.encryption.as_ref().ok_or_else(|| {
                    AppError::Internal(anyhow::anyhow!(
                        "EncryptionService required to read secret '{key}'"
                    ))
                })?;

                encryption.decrypt(&cached.value).map(Some).map_err(|err| {
                    AppError::Internal(anyhow::anyhow!(
                        "Failed to decrypt secret setting '{key}': {err}"
                    ))
                })
            }
        }
    }

    /// Set a secret setting value (encrypts before storing)
    pub async fn set_secret(
        &self,
        key: &str,
        plaintext: &str,
        category: &str,
        updated_by: Option<uuid::Uuid>,
    ) -> Result<(), AppError> {
        let _refresh_guard = self.refresh_lock.lock().await;
        let encryption = self.encryption.as_ref().ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "EncryptionService required to write secret '{key}'"
            ))
        })?;

        let encrypted = encryption.encrypt(plaintext)?;
        let version = format!("v{}", encryption.key_version());

        let mut setting =
            SystemSetting::new_secret(key.to_string(), encrypted, category.to_string(), &version);
        setting.updated_by = updated_by;

        self.repo.upsert(setting).await?;

        self.invalidate_cache().await;

        Ok(())
    }

    /// Set a regular (non-secret) setting value
    pub async fn set(
        &self,
        key: &str,
        value: &str,
        category: &str,
        updated_by: Option<uuid::Uuid>,
    ) -> Result<(), AppError> {
        let _refresh_guard = self.refresh_lock.lock().await;
        let mut setting =
            SystemSetting::new(key.to_string(), value.to_string(), category.to_string());
        setting.updated_by = updated_by;

        self.repo.upsert(setting).await?;

        self.invalidate_cache().await;

        Ok(())
    }

    async fn invalidate_cache(&self) {
        self.cache.write().await.clear();
        *self.cache_revision.write().await = None;
        *self.last_refresh.write().await = None;
    }

    /// Check if a setting is marked as a secret
    pub async fn is_secret(&self, key: &str) -> Result<bool, AppError> {
        self.ensure_fresh().await?;
        let cache = self.cache.read().await;
        Ok(cache.get(key).map(|s| s.is_secret).unwrap_or(false))
    }

    /// Get a setting value as u64
    pub async fn get_u64(&self, key: &str) -> Result<Option<u64>, AppError> {
        let value = self.get(key).await?;
        Ok(value.and_then(|v| v.parse().ok()))
    }

    /// Get a setting value as u32
    pub async fn get_u32(&self, key: &str) -> Result<Option<u32>, AppError> {
        let value = self.get(key).await?;
        Ok(value.and_then(|v| v.parse().ok()))
    }

    /// Get a setting value as u8
    pub async fn get_u8(&self, key: &str) -> Result<Option<u8>, AppError> {
        let value = self.get(key).await?;
        Ok(value.and_then(|v| v.parse().ok()))
    }

    /// Get a setting value as bool
    pub async fn get_bool(&self, key: &str) -> Result<Option<bool>, AppError> {
        let value = self.get(key).await?;
        Ok(value.and_then(|v| match v.to_lowercase().as_str() {
            "true" | "1" | "yes" => Some(true),
            "false" | "0" | "no" => Some(false),
            _ => None,
        }))
    }

    /// Resolve the executable email-verification policy for one operation.
    /// Runtime settings take precedence; missing or invalid values use static config.
    pub async fn email_verification_required(
        &self,
        static_fallback: bool,
    ) -> Result<bool, AppError> {
        Ok(self
            .get_bool(EMAIL_VERIFICATION_REQUIRED_KEY)
            .await?
            .unwrap_or(static_fallback))
    }

    /// Resolve whether email authentication is executable for one operation.
    /// Runtime settings take precedence; missing or invalid values use static config.
    pub async fn email_auth_enabled(&self, static_fallback: bool) -> Result<bool, AppError> {
        Ok(self
            .get_bool(EMAIL_AUTH_ENABLED_KEY)
            .await?
            .unwrap_or(static_fallback))
    }

    /// Get a required u64 setting, panicking if not found
    pub async fn require_u64(&self, key: &str) -> Result<u64, AppError> {
        self.get_u64(key).await?.ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "Required setting '{key}' not found or invalid"
            ))
        })
    }

    /// Get a required u32 setting, panicking if not found
    pub async fn require_u32(&self, key: &str) -> Result<u32, AppError> {
        self.get_u32(key).await?.ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "Required setting '{key}' not found or invalid"
            ))
        })
    }

    /// Get a required u8 setting, panicking if not found
    pub async fn require_u8(&self, key: &str) -> Result<u8, AppError> {
        self.get_u8(key).await?.ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "Required setting '{key}' not found or invalid"
            ))
        })
    }

    /// Get all cached settings (for admin API)
    /// Note: Secret values are returned as-is (encrypted). Use get_secret() to decrypt.
    pub async fn get_all_cached(&self) -> Result<HashMap<String, String>, AppError> {
        self.ensure_fresh().await?;
        let cache = self.cache.read().await;
        Ok(cache
            .iter()
            .map(|(k, v)| (k.clone(), v.value.clone()))
            .collect())
    }

    /// Get all settings by category prefix (e.g., "auth.google" matches "auth.google.*")
    pub async fn get_by_category_prefix(
        &self,
        prefix: &str,
    ) -> Result<HashMap<String, String>, AppError> {
        self.ensure_fresh().await?;
        let cache = self.cache.read().await;
        let prefix_with_sep = if prefix.ends_with('.') || prefix.ends_with('_') {
            prefix.to_string()
        } else {
            format!("{prefix}.")
        };

        Ok(cache
            .iter()
            .filter(|(k, setting)| {
                setting.is_valid && (k.starts_with(&prefix_with_sep) || k.starts_with(prefix))
            })
            .map(|(k, v)| (k.clone(), v.value.clone()))
            .collect())
    }

    // =========================================================================
    // Sync accessors for use in sync contexts (e.g., middleware/router setup)
    // These read from cache without refreshing or blocking
    // =========================================================================

    /// Get a setting from cache synchronously (does not refresh)
    /// Returns None if cache is empty, key not found, or lock unavailable
    pub fn get_cached_sync(&self, key: &str) -> Option<String> {
        // Use try_read to avoid blocking - safe within async runtime
        self.cache.try_read().ok().and_then(|cache| {
            cache
                .get(key)
                .filter(|setting| setting.is_valid)
                .map(|setting| setting.value.clone())
        })
    }

    /// Get u32 from cache synchronously
    pub fn get_cached_u32_sync(&self, key: &str) -> Option<u32> {
        self.get_cached_sync(key).and_then(|v| v.parse().ok())
    }

    /// Get u64 from cache synchronously
    pub fn get_cached_u64_sync(&self, key: &str) -> Option<u64> {
        self.get_cached_sync(key).and_then(|v| v.parse().ok())
    }
}

#[cfg(test)]
#[path = "settings_service_test_support.rs"]
mod test_support;

#[cfg(test)]
#[path = "settings_service_tests.rs"]
mod tests;
