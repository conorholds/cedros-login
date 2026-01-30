//! Database configuration

use serde::Deserialize;

/// Database configuration
#[derive(Debug, Clone, Deserialize)]
pub struct DatabaseConfig {
    /// Database connection URL (e.g., postgres://user:pass@host:5432/dbname)
    pub url: Option<String>,
    /// Maximum number of connections in the pool
    #[serde(default = "default_max_connections")]
    pub max_connections: u32,
    /// Minimum number of connections in the pool
    #[serde(default = "default_min_connections")]
    pub min_connections: u32,
    /// Connection timeout in seconds
    #[serde(default = "default_connect_timeout")]
    pub connect_timeout_secs: u64,
    /// Idle timeout in seconds
    #[serde(default = "default_idle_timeout")]
    pub idle_timeout_secs: u64,
}

/// P-01: Increased from 10 to 20 for better concurrency under load
pub fn default_max_connections() -> u32 {
    20
}

/// REL-009: Increased from 1 to 2 to reduce connection acquisition latency
/// at startup and after idle periods
pub fn default_min_connections() -> u32 {
    2
}

pub fn default_connect_timeout() -> u64 {
    30
}

pub fn default_idle_timeout() -> u64 {
    600
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            url: None,
            max_connections: default_max_connections(),
            min_connections: default_min_connections(),
            connect_timeout_secs: default_connect_timeout(),
            idle_timeout_secs: default_idle_timeout(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_config_defaults() {
        let config = DatabaseConfig::default();
        assert!(config.url.is_none());
        assert_eq!(config.max_connections, 20); // P-01: Updated from 10
        assert_eq!(config.min_connections, 2); // REL-009: Updated from 1
        assert_eq!(config.connect_timeout_secs, 30);
        assert_eq!(config.idle_timeout_secs, 600);
    }
}
