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

/// Rate limit configuration
///
/// Note: Rate limit values (auth_limit, general_limit, credit_limit, window_secs)
/// are stored in the database (system_settings table) and managed via admin UI.
/// This config only holds infrastructure settings.
///
/// ## SEC-03: Horizontal Scaling
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

    // =========================================================================
    // DEPRECATED: These fields are kept for backwards compatibility during
    // migration but are no longer used. Values are read from system_settings.
    // These will be removed in a future version.
    // =========================================================================
    #[serde(default = "default_auth_limit")]
    pub auth_limit: u32,
    #[serde(default = "default_general_limit")]
    pub general_limit: u32,
    #[serde(default = "default_credit_limit")]
    pub credit_limit: u32,
    #[serde(default = "default_window_secs")]
    pub window_secs: u64,
}

pub fn default_auth_limit() -> u32 {
    10 // Fallback if DB not available
}

pub fn default_general_limit() -> u32 {
    60 // Fallback if DB not available
}

pub fn default_credit_limit() -> u32 {
    30 // Fallback if DB not available
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
            // Deprecated fields - kept for backwards compat
            auth_limit: default_auth_limit(),
            general_limit: default_general_limit(),
            credit_limit: default_credit_limit(),
            window_secs: default_window_secs(),
        }
    }
}

/// Wallet recovery mode determines what the user writes down during enrollment
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum WalletRecoveryMode {
    /// User writes down Share C only - can recover within app but not portable
    /// This is the default (more secure - wallet is app-locked)
    #[default]
    ShareCOnly,
    /// User writes down full seed - portable, can use wallet elsewhere
    /// Admin must explicitly enable this
    FullSeed,
    /// No recovery option - user cannot recover wallet on their own
    /// Required for Privacy Cash deposits (prevents user from front-running withdrawals)
    None,
}

impl WalletRecoveryMode {
    pub fn as_str(&self) -> &'static str {
        match self {
            WalletRecoveryMode::ShareCOnly => "share_c_only",
            WalletRecoveryMode::FullSeed => "full_seed",
            WalletRecoveryMode::None => "none",
        }
    }

    /// Returns true if this mode allows wallet recovery by the user
    pub fn has_recovery(&self) -> bool {
        matches!(
            self,
            WalletRecoveryMode::ShareCOnly | WalletRecoveryMode::FullSeed
        )
    }
}

impl std::str::FromStr for WalletRecoveryMode {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "share_c_only" | "sharec" | "share_c" => Ok(WalletRecoveryMode::ShareCOnly),
            "full_seed" | "fullseed" | "full" | "portable" => Ok(WalletRecoveryMode::FullSeed),
            "none" | "no_recovery" | "norecovery" => Ok(WalletRecoveryMode::None),
            _ => Err(format!("Invalid recovery mode: {}", s)),
        }
    }
}

/// Wallet configuration for server-side signing
#[derive(Debug, Clone, Deserialize)]
pub struct WalletConfig {
    /// Enable server-side signing wallet feature
    #[serde(default)]
    pub enabled: bool,

    /// Recovery mode: what recovery phrase to show user
    /// - share_c_only (default): Can only recover within app
    /// - full_seed: Portable wallet, can use elsewhere
    #[serde(default)]
    pub recovery_mode: WalletRecoveryMode,

    /// TTL for session-based unlock (seconds)
    /// After unlock, user doesn't need to re-enter credential until TTL expires
    #[serde(default = "default_wallet_unlock_ttl")]
    pub unlock_ttl_secs: u64,
}

pub fn default_wallet_unlock_ttl() -> u64 {
    15 * 60 // 15 minutes
}

impl Default for WalletConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            recovery_mode: WalletRecoveryMode::default(),
            unlock_ttl_secs: default_wallet_unlock_ttl(),
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
        assert_eq!(config.auth_limit, 10);
        assert_eq!(config.general_limit, 60);
        assert_eq!(config.window_secs, 60);
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

    #[test]
    fn test_wallet_config_defaults() {
        let config = WalletConfig::default();
        assert!(!config.enabled);
        assert_eq!(config.recovery_mode, WalletRecoveryMode::ShareCOnly);
        assert_eq!(config.unlock_ttl_secs, 15 * 60);
    }

    #[test]
    fn test_wallet_recovery_mode_from_str() {
        assert_eq!(
            "share_c_only".parse::<WalletRecoveryMode>().unwrap(),
            WalletRecoveryMode::ShareCOnly
        );
        assert_eq!(
            "full_seed".parse::<WalletRecoveryMode>().unwrap(),
            WalletRecoveryMode::FullSeed
        );
        assert_eq!(
            "portable".parse::<WalletRecoveryMode>().unwrap(),
            WalletRecoveryMode::FullSeed
        );
        assert_eq!(
            "none".parse::<WalletRecoveryMode>().unwrap(),
            WalletRecoveryMode::None
        );
        assert_eq!(
            "no_recovery".parse::<WalletRecoveryMode>().unwrap(),
            WalletRecoveryMode::None
        );
        assert!("invalid".parse::<WalletRecoveryMode>().is_err());
    }

    #[test]
    fn test_wallet_recovery_mode_as_str() {
        assert_eq!(WalletRecoveryMode::ShareCOnly.as_str(), "share_c_only");
        assert_eq!(WalletRecoveryMode::FullSeed.as_str(), "full_seed");
        assert_eq!(WalletRecoveryMode::None.as_str(), "none");
    }

    #[test]
    fn test_wallet_recovery_mode_has_recovery() {
        assert!(WalletRecoveryMode::ShareCOnly.has_recovery());
        assert!(WalletRecoveryMode::FullSeed.has_recovery());
        assert!(!WalletRecoveryMode::None.has_recovery());
    }
}
