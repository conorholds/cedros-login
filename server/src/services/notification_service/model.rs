use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use crate::errors::AppError;

/// Severity level for notifications.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum NotificationSeverity {
    Info,
    Warn,
    Critical,
}

impl NotificationSeverity {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Info => "INFO",
            Self::Warn => "WARN",
            Self::Critical => "CRITICAL",
        }
    }

    pub fn emoji(&self) -> &'static str {
        match self {
            Self::Info => "ℹ️",
            Self::Warn => "⚠️",
            Self::Critical => "🚨",
        }
    }

    pub fn discord_color(&self) -> u32 {
        match self {
            Self::Info => 0x3498db,     // Blue
            Self::Warn => 0xf1c40f,     // Yellow
            Self::Critical => 0xe74c3c, // Red
        }
    }
}

/// Admin notification to send.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdminNotification {
    pub severity: NotificationSeverity,
    pub title: String,
    pub body: String,
    pub metadata: Option<serde_json::Value>,
    pub org_slug: Option<String>,
    pub correlation_id: Option<String>,
}

impl AdminNotification {
    pub fn new(severity: NotificationSeverity, title: &str, body: &str) -> Self {
        Self {
            severity,
            title: title.to_string(),
            body: body.to_string(),
            metadata: None,
            org_slug: None,
            correlation_id: None,
        }
    }

    pub fn with_metadata(mut self, metadata: serde_json::Value) -> Self {
        self.metadata = Some(metadata);
        self
    }

    pub fn with_org(mut self, org_slug: &str) -> Self {
        self.org_slug = Some(org_slug.to_string());
        self
    }

    pub fn with_correlation_id(mut self, id: &str) -> Self {
        self.correlation_id = Some(id.to_string());
        self
    }
}

/// Sends operational notifications to an administrator-facing channel.
#[async_trait]
pub trait NotificationService: Send + Sync {
    /// Send a notification, returning an error if the configured channel does
    /// not accept it.
    async fn notify(&self, notification: AdminNotification) -> Result<(), AppError>;
}
