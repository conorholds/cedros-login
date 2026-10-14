use async_trait::async_trait;
use serde::Serialize;

use super::http::{read_webhook_error_body, NOTIFICATION_TIMEOUT_SECS};
use super::metadata::sanitize_metadata_for_display;
use super::{AdminNotification, NotificationService};
use crate::errors::AppError;

/// Telegram bot notification service.
#[derive(Debug, Clone)]
pub struct TelegramNotificationService {
    bot_token: String,
    chat_id: String,
    client: reqwest::Client,
    environment: String,
}

#[derive(Debug, Serialize)]
struct TelegramMessage {
    chat_id: String,
    text: String,
    parse_mode: String,
}

impl TelegramNotificationService {
    pub fn new(bot_token: String, chat_id: String, environment: String) -> Self {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(NOTIFICATION_TIMEOUT_SECS))
            .build()
            .unwrap_or_else(|error| {
                tracing::error!(error = %error, "Failed to build Telegram HTTP client; falling back to defaults");
                reqwest::Client::new()
            });
        Self {
            bot_token,
            chat_id,
            client,
            environment,
        }
    }

    fn render_text(&self, notification: &AdminNotification) -> String {
        let mut text = format!(
            "{} *{}*\n\n{}",
            notification.severity.emoji(),
            escape_markdown(&notification.title),
            escape_markdown(&notification.body)
        );
        text.push_str(&format!("\n\n📍 *Environment:* {}", self.environment));
        if let Some(organization) = &notification.org_slug {
            text.push_str(&format!(
                "\n🏢 *Organization:* {}",
                escape_markdown(organization)
            ));
        }
        append_metadata(&mut text, notification.metadata.as_ref());
        text
    }
}

#[async_trait]
impl NotificationService for TelegramNotificationService {
    async fn notify(&self, notification: AdminNotification) -> Result<(), AppError> {
        let message = TelegramMessage {
            chat_id: self.chat_id.clone(),
            text: self.render_text(&notification),
            parse_mode: "Markdown".to_string(),
        };
        let url = format!("https://api.telegram.org/bot{}/sendMessage", self.bot_token);
        let response = tokio::time::timeout(
            std::time::Duration::from_secs(NOTIFICATION_TIMEOUT_SECS),
            self.client.post(&url).json(&message).send(),
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Telegram API request timed out after {NOTIFICATION_TIMEOUT_SECS}s"
            ))
        })?
        .map_err(|error| AppError::Internal(anyhow::anyhow!("Telegram API failed: {error}")))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = read_webhook_error_body(response).await;
            return Err(AppError::Internal(anyhow::anyhow!(
                "Telegram API returned {status}: {body}"
            )));
        }

        tracing::info!(
            severity = %notification.severity.as_str(),
            title = %notification.title,
            "Telegram notification sent"
        );
        Ok(())
    }
}

fn append_metadata(text: &mut String, metadata: Option<&serde_json::Value>) {
    let Some(metadata) = metadata else {
        return;
    };
    let items = sanitize_metadata_for_display(metadata);
    if items.is_empty() {
        return;
    }
    text.push_str("\n\n📋 *Details:*");
    for (key, value) in items {
        text.push_str(&format!(
            "\n• {}: `{}`",
            escape_markdown(&key),
            escape_markdown(&value)
        ));
    }
}

/// Escape special characters for Telegram Markdown.
/// Covers all Markdown special chars: _ * [ ] ( ) ` ~
pub(super) fn escape_markdown(text: &str) -> String {
    text.replace('_', "\\_")
        .replace('*', "\\*")
        .replace('[', "\\[")
        .replace(']', "\\]")
        .replace('(', "\\(")
        .replace(')', "\\)")
        .replace('`', "\\`")
        .replace('~', "\\~")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::services::NotificationSeverity;

    #[test]
    fn message_preserves_channel_copy_and_redacts_sensitive_metadata() {
        let service = TelegramNotificationService::new(
            "bot-token".to_string(),
            "chat-123".to_string(),
            "production".to_string(),
        );
        let notification = AdminNotification::new(
            NotificationSeverity::Warn,
            "Delivery_warning",
            "Review *delivery*",
        )
        .with_org("acme_org")
        .with_metadata(serde_json::json!({"password": "do-not-render", "region": "us-west"}));

        let text = service.render_text(&notification);

        assert!(text.starts_with("⚠️ *Delivery\\_warning*\n\nReview \\*delivery\\*"));
        assert!(text.contains("📍 *Environment:* production"));
        assert!(text.contains("🏢 *Organization:* acme\\_org"));
        assert!(text.contains("password: `\\[redacted\\]`"));
        assert!(text.contains("region: `us-west`"));
        assert!(!text.contains("do-not-render"));
    }
}
