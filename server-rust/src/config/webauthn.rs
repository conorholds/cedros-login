//! WebAuthn configuration
//!
//! Configuration for WebAuthn passkeys and security keys.

use serde::Deserialize;

/// Default challenge TTL in seconds (5 minutes)
pub fn default_challenge_ttl() -> u64 {
    300
}

/// WebAuthn configuration
#[derive(Debug, Clone, Deserialize)]
pub struct WebAuthnConfig {
    /// Whether WebAuthn is enabled
    #[serde(default)]
    pub enabled: bool,

    /// Relying Party ID (usually the domain, e.g., "example.com")
    /// Required if WebAuthn is enabled.
    #[serde(default)]
    pub rp_id: Option<String>,

    /// Relying Party name (displayed to user, e.g., "My App")
    #[serde(default)]
    pub rp_name: Option<String>,

    /// Origin URL (e.g., "https://example.com")
    /// Required if WebAuthn is enabled.
    #[serde(default)]
    pub rp_origin: Option<String>,

    /// Challenge TTL in seconds (default: 300)
    #[serde(default = "default_challenge_ttl")]
    pub challenge_ttl_seconds: u64,

    /// Allow platform authenticators (passkeys stored on device)
    #[serde(default = "default_true")]
    pub allow_platform: bool,

    /// Allow cross-platform authenticators (security keys like YubiKey)
    #[serde(default = "default_true")]
    pub allow_cross_platform: bool,

    /// Require user verification (biometric/PIN) for registration
    #[serde(default = "default_true")]
    pub require_user_verification: bool,
}

fn default_true() -> bool {
    true
}

impl Default for WebAuthnConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            rp_id: None,
            rp_name: None,
            rp_origin: None,
            challenge_ttl_seconds: default_challenge_ttl(),
            allow_platform: true,
            allow_cross_platform: true,
            require_user_verification: true,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_webauthn_config_defaults() {
        let config = WebAuthnConfig::default();
        assert!(!config.enabled);
        assert!(config.rp_id.is_none());
        assert!(config.allow_platform);
        assert!(config.allow_cross_platform);
        assert!(config.require_user_verification);
        assert_eq!(config.challenge_ttl_seconds, 300);
    }
}
