//! System settings repository for runtime-configurable values
//!
//! Settings are stored in the database and can be modified via admin UI.
//! This replaces environment variables for settings that should be
//! configurable without restart.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// System setting entity
#[derive(Debug, Clone)]
pub struct SystemSetting {
    /// Unique setting key (e.g., "privacy_period_secs")
    pub key: String,
    /// Setting value as string (parsed by consumers)
    /// For secrets, this is the encrypted value
    pub value: String,
    /// Category for grouping (e.g., "privacy", "withdrawal", "rate_limit")
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

    /// Insert or update a setting
    async fn upsert(&self, setting: SystemSetting) -> Result<SystemSetting, AppError>;

    /// Insert or update multiple settings
    async fn upsert_many(
        &self,
        settings: Vec<SystemSetting>,
    ) -> Result<Vec<SystemSetting>, AppError>;
}

/// In-memory system settings repository for development/testing
pub struct InMemorySystemSettingsRepository {
    settings: RwLock<HashMap<String, SystemSetting>>,
}

impl InMemorySystemSettingsRepository {
    pub fn new() -> Self {
        Self {
            settings: RwLock::new(HashMap::new()),
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
        }
    }

    /// Get default settings matching migration seed
    fn default_settings() -> Vec<SystemSetting> {
        vec![
            // Privacy
            SystemSetting::new(
                "privacy_period_secs".to_string(),
                "604800".to_string(),
                "privacy".to_string(),
            )
            .with_description("Time before withdrawal to company wallet (seconds)"),
            // Withdrawal
            SystemSetting::new(
                "withdrawal_poll_interval_secs".to_string(),
                "3600".to_string(),
                "withdrawal".to_string(),
            )
            .with_description("How often to check for ready withdrawals (seconds)"),
            SystemSetting::new(
                "withdrawal_batch_size".to_string(),
                "10".to_string(),
                "withdrawal".to_string(),
            )
            .with_description("Maximum withdrawals to process per poll cycle"),
            SystemSetting::new(
                "withdrawal_timeout_secs".to_string(),
                "120".to_string(),
                "withdrawal".to_string(),
            )
            .with_description("Timeout for individual withdrawal transactions (seconds)"),
            SystemSetting::new(
                "withdrawal_max_retries".to_string(),
                "3".to_string(),
                "withdrawal".to_string(),
            )
            .with_description("Maximum retry attempts for failed withdrawals"),
            SystemSetting::new(
                "withdrawal_percentage".to_string(),
                "100".to_string(),
                "withdrawal".to_string(),
            )
            .with_description("Percentage of ready funds to withdraw per cycle (1-100)"),
            SystemSetting::new(
                "partial_withdrawal_count".to_string(),
                "0".to_string(),
                "withdrawal".to_string(),
            )
            .with_description("Maximum partial withdrawals per batch (0 = disabled)"),
            SystemSetting::new(
                "partial_withdrawal_min_lamports".to_string(),
                "500000000".to_string(),
                "withdrawal".to_string(),
            )
            .with_description("Minimum balance for partial withdrawals (lamports)"),
            // Rate limit
            SystemSetting::new(
                "rate_limit_auth".to_string(),
                "10".to_string(),
                "rate_limit".to_string(),
            )
            .with_description("Maximum auth attempts per window"),
            SystemSetting::new(
                "rate_limit_general".to_string(),
                "60".to_string(),
                "rate_limit".to_string(),
            )
            .with_description("Maximum general requests per window"),
            SystemSetting::new(
                "rate_limit_credit".to_string(),
                "30".to_string(),
                "rate_limit".to_string(),
            )
            .with_description("Maximum credit operations per window"),
            SystemSetting::new(
                "rate_limit_window".to_string(),
                "60".to_string(),
                "rate_limit".to_string(),
            )
            .with_description("Rate limit window size (seconds)"),
            // Deposit display
            SystemSetting::new(
                "deposit_quick_action_tokens".to_string(),
                "USDC,USDT,EURC".to_string(),
                "deposit".to_string(),
            )
            .with_description(
                "Comma-separated token symbols shown as quick actions in the deposit flow",
            ),
            SystemSetting::new(
                "deposit_custom_tokens".to_string(),
                "SOL,USDC,USDT,EURC,USD1,PYUSD,USDH,CASH,BONK,ORE".to_string(),
                "deposit".to_string(),
            )
            .with_description("Comma-separated token symbols shown in the custom token list"),
            // Server/Logging settings
            SystemSetting::new(
                "server_log_level".to_string(),
                "info".to_string(),
                "server".to_string(),
            )
            .with_description("Log level: trace, debug, info, warn, error"),
            SystemSetting::new(
                "server_log_format".to_string(),
                "json".to_string(),
                "server".to_string(),
            )
            .with_description("Log format: json (structured) or pretty (human-readable)"),
            SystemSetting::new(
                "server_environment".to_string(),
                "development".to_string(),
                "server".to_string(),
            )
            .with_description("Deployment environment: development, staging, production"),
            SystemSetting::new(
                "server_cedros_pay_api_key".to_string(),
                "".to_string(),
                "server".to_string(),
            )
            .with_description("API key for Cedros Pay integration"),
            SystemSetting::new(
                "server_metrics_api_key".to_string(),
                "".to_string(),
                "server".to_string(),
            )
            .with_description("API key for Prometheus metrics endpoint"),
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

    async fn upsert(&self, setting: SystemSetting) -> Result<SystemSetting, AppError> {
        let mut settings = self.settings.write().await;
        let mut setting = setting;
        setting.updated_at = Utc::now();
        settings.insert(setting.key.clone(), setting.clone());
        Ok(setting)
    }

    async fn upsert_many(
        &self,
        new_settings: Vec<SystemSetting>,
    ) -> Result<Vec<SystemSetting>, AppError> {
        let mut settings = self.settings.write().await;
        let now = Utc::now();
        let mut result = Vec::with_capacity(new_settings.len());

        for mut setting in new_settings {
            setting.updated_at = now;
            settings.insert(setting.key.clone(), setting.clone());
            result.push(setting);
        }

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_all_empty() {
        let repo = InMemorySystemSettingsRepository::new();
        let settings = repo.get_all().await.unwrap();
        assert!(settings.is_empty());
    }

    #[tokio::test]
    async fn test_with_defaults() {
        let repo = InMemorySystemSettingsRepository::with_defaults();
        let settings = repo.get_all().await.unwrap();
        assert_eq!(settings.len(), 19); // All default settings (14 original + 5 server/logging/metrics)
    }

    #[tokio::test]
    async fn test_upsert_and_get() {
        let repo = InMemorySystemSettingsRepository::new();

        let setting = SystemSetting::new(
            "test_key".to_string(),
            "test_value".to_string(),
            "test".to_string(),
        );

        repo.upsert(setting).await.unwrap();

        let found = repo.get_by_key("test_key").await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().value, "test_value");
    }

    #[tokio::test]
    async fn test_upsert_updates_existing() {
        let repo = InMemorySystemSettingsRepository::new();

        let setting1 =
            SystemSetting::new("key".to_string(), "value1".to_string(), "test".to_string());
        repo.upsert(setting1).await.unwrap();

        let setting2 =
            SystemSetting::new("key".to_string(), "value2".to_string(), "test".to_string());
        repo.upsert(setting2).await.unwrap();

        let found = repo.get_by_key("key").await.unwrap().unwrap();
        assert_eq!(found.value, "value2");
    }

    #[tokio::test]
    async fn test_get_by_category() {
        let repo = InMemorySystemSettingsRepository::with_defaults();

        let withdrawal = repo.get_by_category("withdrawal").await.unwrap();
        assert_eq!(withdrawal.len(), 7);

        let privacy = repo.get_by_category("privacy").await.unwrap();
        assert_eq!(privacy.len(), 1);

        let rate_limit = repo.get_by_category("rate_limit").await.unwrap();
        assert_eq!(rate_limit.len(), 4); // auth, general, credit, window
    }

    #[tokio::test]
    async fn test_upsert_many() {
        let repo = InMemorySystemSettingsRepository::new();

        let settings = vec![
            SystemSetting::new("k1".to_string(), "v1".to_string(), "cat".to_string()),
            SystemSetting::new("k2".to_string(), "v2".to_string(), "cat".to_string()),
        ];

        let result = repo.upsert_many(settings).await.unwrap();
        assert_eq!(result.len(), 2);

        let all = repo.get_all().await.unwrap();
        assert_eq!(all.len(), 2);
    }

    #[tokio::test]
    async fn test_parse_helpers() {
        let setting = SystemSetting::new("test".to_string(), "42".to_string(), "test".to_string());

        assert_eq!(setting.as_u64(), Some(42));
        assert_eq!(setting.as_u32(), Some(42));
        assert_eq!(setting.as_u8(), Some(42));

        let bool_setting =
            SystemSetting::new("bool".to_string(), "true".to_string(), "test".to_string());
        assert_eq!(bool_setting.as_bool(), Some(true));
    }
}
