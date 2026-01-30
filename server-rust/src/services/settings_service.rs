//! Settings service with caching for runtime-configurable values
//!
//! Reads settings from the database and caches them for performance.
//! Cache is automatically refreshed after TTL expires.

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

use crate::errors::AppError;
use crate::repositories::SystemSettingsRepository;

/// Default cache TTL (60 seconds)
const DEFAULT_CACHE_TTL_SECS: u64 = 60;

/// Service for reading system settings with caching
pub struct SettingsService {
    repo: Arc<dyn SystemSettingsRepository>,
    cache: RwLock<HashMap<String, String>>,
    last_refresh: RwLock<Option<Instant>>,
    cache_ttl: Duration,
}

impl SettingsService {
    /// Create a new settings service
    pub fn new(repo: Arc<dyn SystemSettingsRepository>) -> Self {
        Self {
            repo,
            cache: RwLock::new(HashMap::new()),
            last_refresh: RwLock::new(None),
            cache_ttl: Duration::from_secs(DEFAULT_CACHE_TTL_SECS),
        }
    }

    /// Create with custom cache TTL
    pub fn with_ttl(repo: Arc<dyn SystemSettingsRepository>, ttl_secs: u64) -> Self {
        Self {
            repo,
            cache: RwLock::new(HashMap::new()),
            last_refresh: RwLock::new(None),
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
        let settings = self.repo.get_all().await?;

        let mut cache = self.cache.write().await;
        cache.clear();
        for setting in settings {
            cache.insert(setting.key, setting.value);
        }

        let mut last_refresh = self.last_refresh.write().await;
        *last_refresh = Some(Instant::now());

        Ok(())
    }

    /// Ensure cache is fresh, refreshing if needed
    async fn ensure_fresh(&self) -> Result<(), AppError> {
        if self.needs_refresh().await {
            self.refresh().await?;
        }
        Ok(())
    }

    /// Get a setting value as string
    pub async fn get(&self, key: &str) -> Result<Option<String>, AppError> {
        self.ensure_fresh().await?;
        let cache = self.cache.read().await;
        Ok(cache.get(key).cloned())
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

    /// Get a required u64 setting, panicking if not found
    pub async fn require_u64(&self, key: &str) -> Result<u64, AppError> {
        self.get_u64(key).await?.ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "Required setting '{}' not found or invalid",
                key
            ))
        })
    }

    /// Get a required u32 setting, panicking if not found
    pub async fn require_u32(&self, key: &str) -> Result<u32, AppError> {
        self.get_u32(key).await?.ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "Required setting '{}' not found or invalid",
                key
            ))
        })
    }

    /// Get a required u8 setting, panicking if not found
    pub async fn require_u8(&self, key: &str) -> Result<u8, AppError> {
        self.get_u8(key).await?.ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "Required setting '{}' not found or invalid",
                key
            ))
        })
    }

    /// Get all cached settings (for admin API)
    pub async fn get_all_cached(&self) -> Result<HashMap<String, String>, AppError> {
        self.ensure_fresh().await?;
        let cache = self.cache.read().await;
        Ok(cache.clone())
    }

    // =========================================================================
    // Sync accessors for use in sync contexts (e.g., middleware/router setup)
    // These read from cache without refreshing or blocking
    // =========================================================================

    /// Get a setting from cache synchronously (does not refresh)
    /// Returns None if cache is empty, key not found, or lock unavailable
    pub fn get_cached_sync(&self, key: &str) -> Option<String> {
        // Use try_read to avoid blocking - safe within async runtime
        self.cache
            .try_read()
            .ok()
            .and_then(|cache| cache.get(key).cloned())
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
mod tests {
    use super::*;
    use crate::repositories::InMemorySystemSettingsRepository;

    #[tokio::test]
    async fn test_get_setting() {
        let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
        let service = SettingsService::new(repo);

        let value = service.get("privacy_period_secs").await.unwrap();
        assert_eq!(value, Some("604800".to_string()));
    }

    #[tokio::test]
    async fn test_get_u64() {
        let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
        let service = SettingsService::new(repo);

        let value = service.get_u64("privacy_period_secs").await.unwrap();
        assert_eq!(value, Some(604800));
    }

    #[tokio::test]
    async fn test_require_u64_missing() {
        let repo = Arc::new(InMemorySystemSettingsRepository::new());
        let service = SettingsService::new(repo);

        let result = service.require_u64("nonexistent").await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_cache_refresh() {
        let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
        let service = SettingsService::with_ttl(repo.clone(), 0); // 0 TTL = always refresh

        // First access triggers refresh
        let _ = service.get("privacy_period_secs").await.unwrap();

        // Update repo directly
        use crate::repositories::{SystemSetting, SystemSettingsRepository};
        repo.upsert(SystemSetting::new(
            "privacy_period_secs".to_string(),
            "1000".to_string(),
            "privacy".to_string(),
        ))
        .await
        .unwrap();

        // With 0 TTL, next access should see new value
        let value = service.get_u64("privacy_period_secs").await.unwrap();
        assert_eq!(value, Some(1000));
    }

    #[tokio::test]
    async fn test_get_all_cached() {
        let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
        let service = SettingsService::new(repo);

        let all = service.get_all_cached().await.unwrap();
        assert_eq!(all.len(), 14); // All default settings
        assert_eq!(all.get("privacy_period_secs"), Some(&"604800".to_string()));
    }
}
