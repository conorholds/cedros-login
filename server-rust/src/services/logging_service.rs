//! Dynamic logging configuration service
//!
//! Allows runtime changes to log level via the admin dashboard.
//! Uses tracing_subscriber's reload layer for dynamic updates.

use tracing::info;
use tracing_subscriber::reload::Handle;
use tracing_subscriber::EnvFilter;

use crate::errors::AppError;
use crate::services::SettingsService;

/// Log level options matching the UI settings
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

impl LogLevel {
    /// Parse from string (case-insensitive)
    pub fn parse(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "trace" => Some(LogLevel::Trace),
            "debug" => Some(LogLevel::Debug),
            "info" => Some(LogLevel::Info),
            "warn" | "warning" => Some(LogLevel::Warn),
            "error" => Some(LogLevel::Error),
            _ => None,
        }
    }

    /// Convert to tracing level string
    pub fn as_tracing_level(&self) -> &'static str {
        match self {
            LogLevel::Trace => "trace",
            LogLevel::Debug => "debug",
            LogLevel::Info => "info",
            LogLevel::Warn => "warn",
            LogLevel::Error => "error",
        }
    }
}

/// Service for managing dynamic log configuration
pub struct LoggingService {
    reload_handle: Handle<EnvFilter, tracing_subscriber::Registry>,
    default_filter: String,
}

impl LoggingService {
    /// Create a new logging service with the reload handle
    pub fn new(
        reload_handle: Handle<EnvFilter, tracing_subscriber::Registry>,
        default_filter: String,
    ) -> Self {
        Self {
            reload_handle,
            default_filter,
        }
    }

    /// Build an EnvFilter from log level and optional format settings
    fn build_filter(&self, level: LogLevel) -> EnvFilter {
        // Build filter string: cedros_login={level},tower_http={level}
        let level_str = level.as_tracing_level();
        let filter_str = format!(
            "cedros_login={},tower_http={},axum={}",
            level_str, level_str, level_str
        );

        EnvFilter::try_new(&filter_str).unwrap_or_else(|_| {
            EnvFilter::try_new(&self.default_filter).expect("Default filter should always be valid")
        })
    }

    /// Update the log level at runtime
    pub fn set_level(&self, level: LogLevel) -> Result<(), AppError> {
        let filter = self.build_filter(level);

        self.reload_handle.reload(filter).map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to reload log filter: {}", e))
        })?;

        info!(level = ?level, "Log level updated");
        Ok(())
    }

    /// Apply logging settings from the SettingsService
    pub async fn apply_from_settings(&self, settings: &SettingsService) -> Result<(), AppError> {
        // Read log level from settings
        let level_str = settings.get("server_log_level").await?;

        let level = level_str
            .as_deref()
            .and_then(LogLevel::parse)
            .unwrap_or(LogLevel::Info); // Default to Info

        self.set_level(level)?;

        // Log format and environment are informational only at runtime
        // (they affect startup behavior but can't be changed dynamically)
        if let Some(format) = settings.get("server_log_format").await? {
            if format != "json" {
                info!(
                    format = %format,
                    "Note: Log format can only be changed at server restart"
                );
            }
        }

        Ok(())
    }

    /// Get the default filter string (used for fallback)
    pub fn default_filter(&self) -> &str {
        &self.default_filter
    }
}

/// Initialize tracing with a reloadable filter
///
/// Returns the LoggingService that can be used to change log levels at runtime.
///
/// # Example
/// ```text
/// let logging_service = init_logging("cedros_login=info,tower_http=info");
/// // Later, to change log level:
/// logging_service.set_level(LogLevel::Debug)?;
/// ```
pub fn init_logging(default_filter: &str) -> LoggingService {
    use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

    // Try to get initial filter from RUST_LOG env var, fall back to default
    let initial_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::try_new(default_filter).expect("Invalid default filter"));

    // Create reloadable filter layer
    let (filter, reload_handle) = tracing_subscriber::reload::Layer::new(initial_filter);

    // Initialize the subscriber with the reloadable filter
    tracing_subscriber::registry()
        .with(filter)
        .with(tracing_subscriber::fmt::layer())
        .init();

    LoggingService::new(reload_handle, default_filter.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_log_level_parsing() {
        assert_eq!(LogLevel::parse("trace"), Some(LogLevel::Trace));
        assert_eq!(LogLevel::parse("DEBUG"), Some(LogLevel::Debug));
        assert_eq!(LogLevel::parse("Info"), Some(LogLevel::Info));
        assert_eq!(LogLevel::parse("WARN"), Some(LogLevel::Warn));
        assert_eq!(LogLevel::parse("warning"), Some(LogLevel::Warn));
        assert_eq!(LogLevel::parse("error"), Some(LogLevel::Error));
        assert_eq!(LogLevel::parse("invalid"), None);
    }

    #[test]
    fn test_log_level_to_tracing() {
        assert_eq!(LogLevel::Trace.as_tracing_level(), "trace");
        assert_eq!(LogLevel::Debug.as_tracing_level(), "debug");
        assert_eq!(LogLevel::Info.as_tracing_level(), "info");
        assert_eq!(LogLevel::Warn.as_tracing_level(), "warn");
        assert_eq!(LogLevel::Error.as_tracing_level(), "error");
    }
}
