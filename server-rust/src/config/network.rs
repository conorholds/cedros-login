//! Network-related configurations (CORS, cookies)

use serde::Deserialize;

fn default_true() -> bool {
    true
}

/// CORS configuration
#[derive(Debug, Clone, Deserialize, Default)]
pub struct CorsConfig {
    #[serde(default)]
    pub allowed_origins: Vec<String>,
}

/// Cookie configuration
#[derive(Debug, Clone, Deserialize)]
pub struct CookieConfig {
    /// Enable cookie-based token storage
    #[serde(default = "default_true")]
    pub enabled: bool,
    /// Cookie domain (e.g., ".example.com" for subdomains)
    pub domain: Option<String>,
    /// Secure flag (should be true in production)
    #[serde(default)]
    pub secure: bool,
    /// SameSite attribute
    #[serde(default = "default_same_site")]
    pub same_site: String,
    /// Access token cookie name
    #[serde(default = "default_access_cookie_name")]
    pub access_cookie_name: String,
    /// Refresh token cookie name
    #[serde(default = "default_refresh_cookie_name")]
    pub refresh_cookie_name: String,
    /// Optional path prefix when mounting the router under a subpath (e.g., "/auth")
    #[serde(default = "default_path_prefix")]
    pub path_prefix: String,
}

pub fn default_same_site() -> String {
    "lax".to_string()
}

pub fn default_access_cookie_name() -> String {
    "cedros_access".to_string()
}

pub fn default_refresh_cookie_name() -> String {
    "cedros_refresh".to_string()
}

pub fn default_path_prefix() -> String {
    "".to_string()
}

impl Default for CookieConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            domain: None,
            secure: false,
            same_site: default_same_site(),
            access_cookie_name: default_access_cookie_name(),
            refresh_cookie_name: default_refresh_cookie_name(),
            path_prefix: default_path_prefix(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cors_config_defaults() {
        let config = CorsConfig::default();
        assert!(config.allowed_origins.is_empty());
    }

    #[test]
    fn test_cookie_config_defaults() {
        let config = CookieConfig::default();
        assert!(config.enabled);
        assert!(config.domain.is_none());
        assert!(!config.secure);
        assert_eq!(config.same_site, "lax");
        assert_eq!(config.access_cookie_name, "cedros_access");
        assert_eq!(config.refresh_cookie_name, "cedros_refresh");
        assert_eq!(config.path_prefix, "");
    }
}
