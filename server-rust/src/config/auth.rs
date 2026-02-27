//! Authentication method configurations (email, Google, Solana)

use serde::Deserialize;

fn default_true() -> bool {
    true
}

/// Email auth configuration
#[derive(Debug, Clone, Deserialize)]
pub struct EmailConfig {
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default)]
    pub require_verification: bool,
    /// Block registrations from disposable/temporary email providers
    #[serde(default)]
    pub block_disposable_emails: bool,
    /// Additional domains to block beyond the built-in list (embedder-provided)
    #[serde(default)]
    pub custom_blocked_domains: Vec<String>,
}

impl Default for EmailConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            require_verification: false,
            block_disposable_emails: false,
            custom_blocked_domains: Vec::new(),
        }
    }
}

/// Google OAuth configuration
#[derive(Debug, Clone, Deserialize)]
pub struct GoogleConfig {
    #[serde(default = "default_true")]
    pub enabled: bool,
    pub client_id: Option<String>,
}

impl Default for GoogleConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            client_id: None,
        }
    }
}

/// Apple Sign-In configuration
#[derive(Debug, Clone, Deserialize)]
pub struct AppleConfig {
    #[serde(default = "default_true")]
    pub enabled: bool,
    /// Apple Services ID (client_id) - e.g., "com.yourapp.service"
    pub client_id: Option<String>,
    /// Apple Team ID - 10-character identifier
    pub team_id: Option<String>,
}

impl Default for AppleConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            client_id: None,
            team_id: None,
        }
    }
}

/// Solana auth configuration
#[derive(Debug, Clone, Deserialize)]
pub struct SolanaConfig {
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default = "default_challenge_expiry")]
    pub challenge_expiry_seconds: u64,
}

pub fn default_challenge_expiry() -> u64 {
    300 // 5 minutes
}

impl Default for SolanaConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            challenge_expiry_seconds: default_challenge_expiry(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_email_config_defaults() {
        let config = EmailConfig::default();
        assert!(config.enabled);
        assert!(!config.require_verification);
    }

    #[test]
    fn test_google_config_defaults() {
        let config = GoogleConfig::default();
        assert!(config.enabled);
        assert!(config.client_id.is_none());
    }

    #[test]
    fn test_solana_config_defaults() {
        let config = SolanaConfig::default();
        assert!(config.enabled);
        assert_eq!(config.challenge_expiry_seconds, 300);
    }

    #[test]
    fn test_apple_config_defaults() {
        let config = AppleConfig::default();
        assert!(config.enabled);
        assert!(config.client_id.is_none());
        assert!(config.team_id.is_none());
    }
}
