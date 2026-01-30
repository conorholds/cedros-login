//! JWT configuration

use serde::Deserialize;

/// JWT configuration
#[derive(Debug, Clone, Deserialize)]
pub struct JwtConfig {
    /// Symmetric secret for refresh token hashing and encryption operations.
    /// Must be at least 32 characters.
    pub secret: String,
    /// RSA private key in PKCS#1 PEM format for RS256 JWT signing.
    /// If not set, an ephemeral key is generated (tokens invalid after restart).
    /// Set via JWT_RSA_PRIVATE_KEY env var.
    #[serde(default)]
    pub rsa_private_key_pem: Option<String>,
    #[serde(default = "default_issuer")]
    pub issuer: String,
    #[serde(default = "default_audience")]
    pub audience: String,
    #[serde(default = "default_access_expiry")]
    pub access_token_expiry: u64,
    #[serde(default = "default_refresh_expiry")]
    pub refresh_token_expiry: u64,
}

pub fn default_issuer() -> String {
    "cedros-login".to_string()
}

pub fn default_audience() -> String {
    "cedros-app".to_string()
}

pub fn default_access_expiry() -> u64 {
    900 // 15 minutes
}

pub fn default_refresh_expiry() -> u64 {
    604800 // S-12: 7 days (reduced from 30 days for security)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_jwt_config_defaults() {
        assert_eq!(default_issuer(), "cedros-login");
        assert_eq!(default_audience(), "cedros-app");
        assert_eq!(default_access_expiry(), 900);
        assert_eq!(default_refresh_expiry(), 604800); // 7 days
    }
}
