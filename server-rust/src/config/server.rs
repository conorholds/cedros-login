//! Server configuration

use serde::Deserialize;

/// Server configuration
#[derive(Debug, Clone, Deserialize)]
pub struct ServerConfig {
    #[serde(default = "default_host")]
    pub host: String,
    #[serde(default = "default_port")]
    pub port: u16,
    /// Base path for auth routes when mounted behind a proxy or sub-router
    #[serde(default = "default_auth_base_path")]
    pub auth_base_path: String,
    /// Frontend URL for verification/reset links
    pub frontend_url: Option<String>,
    /// Optional override for the SSO callback URL
    pub sso_callback_url: Option<String>,
    /// Email to auto-promote to system admin on first admin access
    /// Only works when no system admins exist (bootstrap scenario)
    pub bootstrap_admin_email: Option<String>,
    /// Trust X-Forwarded-For header for client IP (set to true behind a reverse proxy)
    /// When false, IP-based features like rate limiting won't use proxy headers
    #[serde(default)]
    pub trust_proxy: bool,
}

pub fn default_host() -> String {
    "0.0.0.0".to_string()
}

pub fn default_port() -> u16 {
    8080
}

pub fn default_auth_base_path() -> String {
    "/auth".to_string()
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            host: default_host(),
            port: default_port(),
            auth_base_path: default_auth_base_path(),
            frontend_url: None,
            sso_callback_url: None,
            bootstrap_admin_email: None,
            trust_proxy: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_server_config_defaults() {
        let config = ServerConfig::default();
        assert_eq!(config.host, "0.0.0.0");
        assert_eq!(config.port, 8080);
        assert_eq!(config.auth_base_path, "/auth");
        assert!(config.sso_callback_url.is_none());
    }
}
