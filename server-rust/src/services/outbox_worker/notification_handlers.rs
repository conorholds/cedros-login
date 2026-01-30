//! Notification event handlers for the outbox worker

use crate::errors::AppError;
use crate::repositories::OutboxEvent;
use crate::services::{AdminNotification, NotificationService, NotificationSeverity};

/// Process a notification event
pub async fn process_notification_event(
    event: &OutboxEvent,
    notification_service: &dyn NotificationService,
) -> Result<(), AppError> {
    // REL-008: Return error for unknown severity values to prevent silent downgrade
    let severity = match event.payload["severity"].as_str() {
        Some("critical") => NotificationSeverity::Critical,
        Some("warn") => NotificationSeverity::Warn,
        Some("info") | None => NotificationSeverity::Info,
        Some(unknown) => {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Unknown notification severity: {}",
                unknown
            )));
        }
    };

    let title = event.payload["title"]
        .as_str()
        .unwrap_or("Alert")
        .to_string();

    let body = event.payload["body"].as_str().unwrap_or("").to_string();

    let mut notification = AdminNotification::new(severity, &title, &body);

    if let Some(metadata) = event.payload.get("metadata") {
        notification = notification.with_metadata(metadata.clone());
    }

    if let Some(org_slug) = event.payload["org_slug"].as_str() {
        notification = notification.with_org(org_slug);
    }

    if let Some(correlation_id) = &event.correlation_id {
        notification = notification.with_correlation_id(correlation_id);
    }

    notification_service.notify(notification).await
}
