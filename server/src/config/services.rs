//! Service configurations (webhook, rate limiting, notifications)

use serde::Deserialize;

fn default_true() -> bool {
    true
}

/// Admin notification configuration
#[derive(Debug, Clone, Deserialize)]
pub struct NotificationConfig {
    /// Discord webhook URL for admin notifications
    pub discord_webhook_url: Option<String>,
    /// Telegram bot token for admin notifications
    pub telegram_bot_token: Option<String>,
    /// Telegram chat ID for admin notifications
    pub telegram_chat_id: Option<String>,
    /// Environment name (e.g., "production", "staging") for notification context
    #[serde(default = "default_environment")]
    pub environment: String,
}

pub fn default_environment() -> String {
    "development".to_string()
}

/// SSO configuration
#[derive(Debug, Clone, Deserialize, Default)]
pub struct SsoConfig {
    /// Enable Enterprise SSO validation and flow
    #[serde(default)]
    pub enabled: bool,
}

impl Default for NotificationConfig {
    fn default() -> Self {
        Self {
            discord_webhook_url: None,
            telegram_bot_token: None,
            telegram_chat_id: None,
            environment: default_environment(),
        }
    }
}

impl NotificationConfig {
    /// Check if Discord notifications are configured
    pub fn discord_enabled(&self) -> bool {
        self.discord_webhook_url.is_some()
    }

    /// Check if Telegram notifications are configured
    pub fn telegram_enabled(&self) -> bool {
        self.telegram_bot_token.is_some() && self.telegram_chat_id.is_some()
    }

    /// Check if any notification channel is configured
    pub fn any_enabled(&self) -> bool {
        self.discord_enabled() || self.telegram_enabled()
    }
}

/// Webhook configuration for standalone mode
#[derive(Debug, Clone, Deserialize)]
pub struct WebhookConfig {
    /// Enable webhook callbacks
    #[serde(default)]
    pub enabled: bool,
    /// Target URL for webhook callbacks
    pub url: Option<String>,
    /// Secret for HMAC-SHA256 signing
    pub secret: Option<String>,
    /// Request timeout in seconds
    #[serde(default = "default_webhook_timeout")]
    pub timeout_secs: u64,
    /// Number of retry attempts
    #[serde(default = "default_webhook_retries")]
    pub retry_attempts: u32,
}

pub fn default_webhook_timeout() -> u64 {
    10
}

pub fn default_webhook_retries() -> u32 {
    2
}

impl Default for WebhookConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            url: None,
            secret: None,
            timeout_secs: default_webhook_timeout(),
            retry_attempts: default_webhook_retries(),
        }
    }
}

/// Rate limit infrastructure configuration.
///
/// Limit values are stored in the `system_settings` table and managed via admin UI.
///
/// ## Horizontal Scaling
///
/// Two backends are available for rate limiting:
///
/// **"memory" (default)**: In-memory store
/// - Works correctly for single-instance deployments
/// - No additional dependencies required
/// - NOT suitable for multi-instance/load-balanced deployments
/// - Each instance maintains independent counters
///
/// **"redis"**: Redis-backed store (requires `redis-rate-limit` feature)
/// - Shared counters across all instances
/// - Requires REDIS_URL environment variable
/// - Recommended for production multi-instance deployments
/// - Uses atomic Lua scripts for consistency
///
/// For multi-instance deployments without Redis, consider:
/// - Using REPLICAS env var to auto-adjust limits per instance
/// - External rate limiting (Cloudflare, AWS WAF, nginx)
#[derive(Debug, Clone, Deserialize)]
pub struct RateLimitConfig {
    /// Enable rate limiting
    #[serde(default = "default_true")]
    pub enabled: bool,
    /// Store backend for rate limiting: "memory" or "redis"
    #[serde(default = "default_rate_limit_store")]
    pub store: String,
    /// Redis URL for rate limiting (required when store = "redis")
    /// Format: redis://[user:password@]host:port/db
    pub redis_url: Option<String>,
}

pub fn default_auth_limit() -> u32 {
    10 // Fallback if DB not available
}

pub fn default_general_limit() -> u32 {
    60 // Fallback if DB not available
}

pub fn default_window_secs() -> u64 {
    60 // Fallback if DB not available
}

pub fn default_rate_limit_store() -> String {
    "memory".to_string()
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            store: default_rate_limit_store(),
            redis_url: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_webhook_config_defaults() {
        let config = WebhookConfig::default();
        assert!(!config.enabled);
        assert!(config.url.is_none());
        assert!(config.secret.is_none());
        assert_eq!(config.timeout_secs, 10);
        assert_eq!(config.retry_attempts, 2);
    }

    #[test]
    fn test_rate_limit_config_defaults() {
        let config = RateLimitConfig::default();
        assert!(config.enabled);
        assert_eq!(config.store, "memory");
    }

    #[test]
    fn test_notification_config_defaults() {
        let config = NotificationConfig::default();
        assert!(config.discord_webhook_url.is_none());
        assert!(config.telegram_bot_token.is_none());
        assert!(config.telegram_chat_id.is_none());
        assert_eq!(config.environment, "development");
        assert!(!config.discord_enabled());
        assert!(!config.telegram_enabled());
        assert!(!config.any_enabled());
    }

    #[test]
    fn test_notification_config_discord_enabled() {
        let config = NotificationConfig {
            discord_webhook_url: Some("https://discord.com/webhook".to_string()),
            ..Default::default()
        };
        assert!(config.discord_enabled());
        assert!(!config.telegram_enabled());
        assert!(config.any_enabled());
    }

    #[test]
    fn test_notification_config_telegram_enabled() {
        let config = NotificationConfig {
            telegram_bot_token: Some("bot123".to_string()),
            telegram_chat_id: Some("chat456".to_string()),
            ..Default::default()
        };
        assert!(!config.discord_enabled());
        assert!(config.telegram_enabled());
        assert!(config.any_enabled());
    }
}
