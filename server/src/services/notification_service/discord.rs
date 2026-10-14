use async_trait::async_trait;
use serde::Serialize;

use super::http::{read_webhook_error_body, NOTIFICATION_TIMEOUT_SECS};
use super::metadata::sanitize_metadata_for_display;
use super::{AdminNotification, NotificationService, NotificationSeverity};
use crate::errors::AppError;

/// Discord webhook notification service.
#[derive(Debug, Clone)]
pub struct DiscordNotificationService {
    webhook_url: String,
    client: reqwest::Client,
    environment: String,
}

#[derive(Debug, Serialize)]
struct DiscordEmbed {
    title: String,
    description: String,
    color: u32,
    fields: Vec<DiscordField>,
    footer: DiscordFooter,
    timestamp: String,
}

#[derive(Debug, Serialize)]
struct DiscordField {
    name: String,
    value: String,
    inline: bool,
}

#[derive(Debug, Serialize)]
struct DiscordFooter {
    text: String,
}

#[derive(Debug, Serialize)]
struct DiscordWebhookPayload {
    content: Option<String>,
    embeds: Vec<DiscordEmbed>,
}

impl DiscordNotificationService {
    pub fn new(webhook_url: String, environment: String) -> Self {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(NOTIFICATION_TIMEOUT_SECS))
            .build()
            .unwrap_or_else(|error| {
                tracing::error!(error = %error, "Failed to build Discord HTTP client; falling back to defaults");
                reqwest::Client::new()
            });
        Self {
            webhook_url,
            client,
            environment,
        }
    }

    fn payload(&self, notification: &AdminNotification) -> DiscordWebhookPayload {
        let mut fields = self.base_fields(notification);
        if let Some(metadata) = &notification.metadata {
            fields.extend(sanitize_metadata_for_display(metadata).into_iter().map(
                |(name, value)| DiscordField {
                    name,
                    value,
                    inline: true,
                },
            ));
        }

        DiscordWebhookPayload {
            content: (notification.severity == NotificationSeverity::Critical)
                .then(|| "@here".to_string()),
            embeds: vec![DiscordEmbed {
                title: format!("{} {}", notification.severity.emoji(), notification.title),
                description: notification.body.clone(),
                color: notification.severity.discord_color(),
                fields,
                footer: DiscordFooter {
                    text: format!("Cedros Login | {}", notification.severity.as_str()),
                },
                timestamp: chrono::Utc::now().to_rfc3339(),
            }],
        }
    }

    fn base_fields(&self, notification: &AdminNotification) -> Vec<DiscordField> {
        let mut fields = Vec::new();
        if let Some(organization) = &notification.org_slug {
            fields.push(DiscordField {
                name: "Organization".to_string(),
                value: organization.clone(),
                inline: true,
            });
        }
        fields.push(DiscordField {
            name: "Environment".to_string(),
            value: self.environment.clone(),
            inline: true,
        });
        fields
    }
}

#[async_trait]
impl NotificationService for DiscordNotificationService {
    async fn notify(&self, notification: AdminNotification) -> Result<(), AppError> {
        let response = tokio::time::timeout(
            std::time::Duration::from_secs(NOTIFICATION_TIMEOUT_SECS),
            self.client
                .post(&self.webhook_url)
                .json(&self.payload(&notification))
                .send(),
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Discord webhook timed out after {NOTIFICATION_TIMEOUT_SECS}s"
            ))
        })?
        .map_err(|error| AppError::Internal(anyhow::anyhow!("Discord webhook failed: {error}")))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = read_webhook_error_body(response).await;
            return Err(AppError::Internal(anyhow::anyhow!(
                "Discord webhook returned {status}: {body}"
            )));
        }

        tracing::info!(
            severity = %notification.severity.as_str(),
            title = %notification.title,
            "Discord notification sent"
        );
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn payload_preserves_critical_routing_and_redacts_sensitive_metadata() {
        let service = DiscordNotificationService::new(
            "https://example.invalid/webhook".to_string(),
            "production".to_string(),
        );
        let notification = AdminNotification::new(
            NotificationSeverity::Critical,
            "Delivery failed",
            "A delivery needs attention",
        )
        .with_org("acme")
        .with_metadata(serde_json::json!({"password": "do-not-render", "region": "us-west"}));

        let payload = service.payload(&notification);

        assert_eq!(payload.content.as_deref(), Some("@here"));
        let embed = &payload.embeds[0];
        assert_eq!(embed.title, "🚨 Delivery failed");
        assert_eq!(embed.description, "A delivery needs attention");
        assert_eq!(embed.color, 0xe74c3c);
        assert_eq!(embed.footer.text, "Cedros Login | CRITICAL");
        assert_eq!(embed.fields[0].name, "Organization");
        assert_eq!(embed.fields[0].value, "acme");
        assert_eq!(embed.fields[1].name, "Environment");
        assert_eq!(embed.fields[1].value, "production");
        assert!(embed
            .fields
            .iter()
            .any(|field| field.name == "password" && field.value == "[redacted]"));
        assert!(embed
            .fields
            .iter()
            .any(|field| field.name == "region" && field.value == "us-west"));
    }
}
