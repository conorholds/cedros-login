use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::RwLock;

use super::{AdminNotification, NotificationService};
use crate::errors::AppError;

pub(super) const LOG_NOTIFICATION_BUFFER_MAX: usize = 1000;

/// Log-based notification service for development.
#[derive(Debug, Clone, Default)]
pub struct LogNotificationService {
    notifications: Arc<RwLock<Vec<AdminNotification>>>,
}

impl LogNotificationService {
    pub fn new() -> Self {
        Self::default()
    }

    /// Get all notifications (for testing).
    pub async fn get_notifications(&self) -> Vec<AdminNotification> {
        self.notifications.read().await.clone()
    }

    /// Clear notifications (for testing).
    pub async fn clear(&self) {
        self.notifications.write().await.clear();
    }
}

fn redact_notification(notification: &AdminNotification) -> AdminNotification {
    let mut redacted = notification.clone();
    redacted.body = "[redacted]".to_string();
    redacted.metadata = None;
    redacted
}

#[async_trait]
impl NotificationService for LogNotificationService {
    async fn notify(&self, notification: AdminNotification) -> Result<(), AppError> {
        let redacted = redact_notification(&notification);
        tracing::info!(
            severity = %redacted.severity.as_str(),
            title = %redacted.title,
            org_slug = ?redacted.org_slug,
            correlation_id = ?redacted.correlation_id,
            "Admin notification (logged)"
        );
        let mut notifications = self.notifications.write().await;
        notifications.push(redacted);
        if notifications.len() > LOG_NOTIFICATION_BUFFER_MAX {
            let overflow = notifications.len() - LOG_NOTIFICATION_BUFFER_MAX;
            notifications.drain(0..overflow);
        }
        Ok(())
    }
}

/// No-op notification service.
#[derive(Debug, Clone, Default)]
pub struct NoopNotificationService;

impl NoopNotificationService {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl NotificationService for NoopNotificationService {
    async fn notify(&self, _notification: AdminNotification) -> Result<(), AppError> {
        Ok(())
    }
}
