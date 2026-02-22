//! Notification service for Discord and Telegram admin alerts

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::errors::AppError;

/// Default timeout for notification webhooks (seconds)
const NOTIFICATION_TIMEOUT_SECS: u64 = 10;
/// Max number of notifications retained in log-only service
const LOG_NOTIFICATION_BUFFER_MAX: usize = 1000;
/// Max number of bytes read from webhook error bodies (avoid large reads/logs)
const WEBHOOK_ERROR_BODY_MAX_BYTES: usize = 4096;

const MAX_METADATA_FIELDS: usize = 5;
const MAX_METADATA_VALUE_LEN: usize = 160;

fn should_redact_metadata_key(key: &str) -> bool {
    let k = key.to_ascii_lowercase();
    k.contains("token")
        || k.contains("secret")
        || k.contains("password")
        || k.contains("authorization")
        || k.contains("cookie")
        || k.ends_with("_key")
        || k.ends_with("_api_key")
}

fn looks_like_secret_value(value: &str) -> bool {
    // JWT-ish (three base64url segments)
    if value.matches('.').count() == 2 && value.len() > 40 {
        return true;
    }

    // Long base64/base64url-ish blobs
    let longish = value.len() > 64;
    let mostly_b64 = value.chars().all(|c| {
        c.is_ascii_alphanumeric() || c == '+' || c == '/' || c == '=' || c == '-' || c == '_'
    });
    longish && mostly_b64
}

fn truncate_value(mut s: String) -> String {
    if s.len() > MAX_METADATA_VALUE_LEN {
        s.truncate(MAX_METADATA_VALUE_LEN);
        s.push('…');
    }
    s
}

fn sanitize_metadata_for_display(metadata: &serde_json::Value) -> Vec<(String, String)> {
    let Some(obj) = metadata.as_object() else {
        return vec![];
    };

    obj.iter()
        .take(MAX_METADATA_FIELDS)
        .map(|(key, value)| {
            let value_str = value.to_string().trim_matches('"').to_string();

            let rendered = if should_redact_metadata_key(key) || looks_like_secret_value(&value_str)
            {
                "[redacted]".to_string()
            } else {
                truncate_value(value_str)
            };

            (key.clone(), rendered)
        })
        .collect()
}

struct BodySnippet {
    buf: Vec<u8>,
    max_bytes: usize,
    truncated: bool,
}

impl BodySnippet {
    fn new(max_bytes: usize) -> Self {
        Self {
            buf: Vec::new(),
            max_bytes,
            truncated: false,
        }
    }

    fn push_chunk(&mut self, chunk: &[u8]) {
        if self.truncated {
            return;
        }

        if self.buf.len() >= self.max_bytes {
            self.truncated = true;
            return;
        }

        let remaining = self.max_bytes - self.buf.len();
        if chunk.len() > remaining {
            self.buf.extend_from_slice(&chunk[..remaining]);
            self.truncated = true;
        } else {
            self.buf.extend_from_slice(chunk);
        }
    }

    fn finish(self) -> String {
        let mut body = String::from_utf8_lossy(&self.buf).to_string();
        if self.truncated {
            body.push_str("… [truncated]");
        }
        body
    }
}

async fn read_webhook_error_body(mut response: reqwest::Response) -> String {
    let mut snippet = BodySnippet::new(WEBHOOK_ERROR_BODY_MAX_BYTES);

    loop {
        match response.chunk().await {
            Ok(Some(chunk)) => {
                snippet.push_chunk(&chunk);
                if snippet.truncated {
                    break;
                }
            }
            Ok(None) => break,
            Err(_) => break,
        }
    }

    snippet.finish()
}

/// Severity level for notifications
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

/// Admin notification to send
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

/// Notification service trait
#[async_trait]
pub trait NotificationService: Send + Sync {
    /// Send a notification
    async fn notify(&self, notification: AdminNotification) -> Result<(), AppError>;
}

/// Discord webhook notification service
#[derive(Debug, Clone)]
pub struct DiscordNotificationService {
    webhook_url: String,
    client: reqwest::Client,
    environment: String,
}

/// Discord webhook embed structure
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
            .unwrap_or_else(|e| {
                tracing::error!(error = %e, "Failed to build Discord HTTP client; falling back to defaults");
                reqwest::Client::new()
            });
        Self {
            webhook_url,
            client,
            environment,
        }
    }
}

#[async_trait]
impl NotificationService for DiscordNotificationService {
    async fn notify(&self, notification: AdminNotification) -> Result<(), AppError> {
        let mut fields = vec![];

        if let Some(org) = &notification.org_slug {
            fields.push(DiscordField {
                name: "Organization".to_string(),
                value: org.clone(),
                inline: true,
            });
        }

        fields.push(DiscordField {
            name: "Environment".to_string(),
            value: self.environment.clone(),
            inline: true,
        });

        if let Some(metadata) = &notification.metadata {
            for (key, value) in sanitize_metadata_for_display(metadata) {
                fields.push(DiscordField {
                    name: key,
                    value,
                    inline: true,
                });
            }
        }

        let embed = DiscordEmbed {
            title: format!("{} {}", notification.severity.emoji(), notification.title),
            description: notification.body,
            color: notification.severity.discord_color(),
            fields,
            footer: DiscordFooter {
                text: format!("Cedros Login | {}", notification.severity.as_str()),
            },
            timestamp: chrono::Utc::now().to_rfc3339(),
        };

        let payload = DiscordWebhookPayload {
            content: if notification.severity == NotificationSeverity::Critical {
                Some("@here".to_string())
            } else {
                None
            },
            embeds: vec![embed],
        };

        let response_fut = self.client.post(&self.webhook_url).json(&payload).send();

        let response = tokio::time::timeout(
            std::time::Duration::from_secs(NOTIFICATION_TIMEOUT_SECS),
            response_fut,
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Discord webhook timed out after {}s",
                NOTIFICATION_TIMEOUT_SECS
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Discord webhook failed: {}", e)))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = read_webhook_error_body(response).await;
            return Err(AppError::Internal(anyhow::anyhow!(
                "Discord webhook returned {}: {}",
                status,
                body
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

/// Telegram bot notification service
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
            .unwrap_or_else(|e| {
                tracing::error!(error = %e, "Failed to build Telegram HTTP client; falling back to defaults");
                reqwest::Client::new()
            });
        Self {
            bot_token,
            chat_id,
            client,
            environment,
        }
    }
}

#[async_trait]
impl NotificationService for TelegramNotificationService {
    async fn notify(&self, notification: AdminNotification) -> Result<(), AppError> {
        let mut text = format!(
            "{} *{}*\n\n{}",
            notification.severity.emoji(),
            escape_markdown(&notification.title),
            escape_markdown(&notification.body)
        );

        text.push_str(&format!("\n\n📍 *Environment:* {}", self.environment));

        if let Some(org) = &notification.org_slug {
            text.push_str(&format!("\n🏢 *Organization:* {}", escape_markdown(org)));
        }

        if let Some(metadata) = &notification.metadata {
            let items = sanitize_metadata_for_display(metadata);
            if !items.is_empty() {
                text.push_str("\n\n📋 *Details:*");
                for (key, value) in items {
                    text.push_str(&format!(
                        "\n• {}: `{}`",
                        escape_markdown(&key),
                        escape_markdown(&value)
                    ));
                }
            }
        }

        let message = TelegramMessage {
            chat_id: self.chat_id.clone(),
            text,
            parse_mode: "Markdown".to_string(),
        };

        let url = format!("https://api.telegram.org/bot{}/sendMessage", self.bot_token);

        let response_fut = self.client.post(&url).json(&message).send();

        let response = tokio::time::timeout(
            std::time::Duration::from_secs(NOTIFICATION_TIMEOUT_SECS),
            response_fut,
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Telegram API request timed out after {}s",
                NOTIFICATION_TIMEOUT_SECS
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Telegram API failed: {}", e)))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = read_webhook_error_body(response).await;
            return Err(AppError::Internal(anyhow::anyhow!(
                "Telegram API returned {}: {}",
                status,
                body
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

/// Escape special characters for Telegram Markdown.
/// Covers all Markdown special chars: _ * [ ] ( ) ` ~
fn escape_markdown(text: &str) -> String {
    text.replace('_', "\\_")
        .replace('*', "\\*")
        .replace('[', "\\[")
        .replace(']', "\\]")
        .replace('(', "\\(")
        .replace(')', "\\)")
        .replace('`', "\\`")
        .replace('~', "\\~")
}

/// Log-based notification service for development
#[derive(Debug, Clone, Default)]
pub struct LogNotificationService {
    notifications: Arc<RwLock<Vec<AdminNotification>>>,
}

impl LogNotificationService {
    pub fn new() -> Self {
        Self::default()
    }

    /// Get all notifications (for testing)
    pub async fn get_notifications(&self) -> Vec<AdminNotification> {
        self.notifications.read().await.clone()
    }

    /// Clear notifications (for testing)
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

/// No-op notification service
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn body_snippet_keeps_small_body() {
        let mut snippet = BodySnippet::new(10);
        snippet.push_chunk(b"hello");
        assert_eq!(snippet.finish(), "hello");
    }

    #[test]
    fn body_snippet_truncates_large_body() {
        let mut snippet = BodySnippet::new(5);
        snippet.push_chunk(b"hello world");
        assert_eq!(snippet.finish(), "hello… [truncated]");
    }

    #[test]
    fn body_snippet_marks_truncated_when_more_data_arrives_after_exact_limit() {
        let mut snippet = BodySnippet::new(5);
        snippet.push_chunk(b"hello");
        snippet.push_chunk(b"!");
        assert_eq!(snippet.finish(), "hello… [truncated]");
    }

    #[test]
    fn escape_markdown_escapes_tilde() {
        assert_eq!(escape_markdown("a~b"), "a\\~b");
    }

    #[tokio::test]
    async fn test_log_notification_service() {
        let service = LogNotificationService::new();
        let notification =
            AdminNotification::new(NotificationSeverity::Warn, "Test Alert", "This is a test");

        service.notify(notification).await.unwrap();

        let notifications = service.get_notifications().await;
        assert_eq!(notifications.len(), 1);
        assert_eq!(notifications[0].title, "Test Alert");
    }

    #[tokio::test]
    async fn test_log_notification_service_buffer_cap() {
        let service = LogNotificationService::new();

        for i in 0..(LOG_NOTIFICATION_BUFFER_MAX + 1) {
            service
                .notify(AdminNotification::new(
                    NotificationSeverity::Info,
                    &format!("Title {}", i),
                    "Body",
                ))
                .await
                .unwrap();
        }

        let notifications = service.get_notifications().await;
        assert_eq!(notifications.len(), LOG_NOTIFICATION_BUFFER_MAX);
    }

    #[tokio::test]
    async fn test_log_notification_service_redacts() {
        let service = LogNotificationService::new();
        let notification =
            AdminNotification::new(NotificationSeverity::Warn, "PII Alert", "user@example.com")
                .with_metadata(serde_json::json!({"ip": "192.168.1.1"}))
                .with_org("acme-corp")
                .with_correlation_id("req-999");

        service.notify(notification).await.unwrap();

        let notifications = service.get_notifications().await;
        assert_eq!(notifications.len(), 1);
        assert_eq!(notifications[0].body, "[redacted]");
        assert!(notifications[0].metadata.is_none());
    }

    #[test]
    fn test_notification_severity() {
        assert_eq!(NotificationSeverity::Info.as_str(), "INFO");
        assert_eq!(NotificationSeverity::Critical.emoji(), "🚨");
        assert_eq!(NotificationSeverity::Warn.discord_color(), 0xf1c40f);
    }

    #[test]
    fn test_notification_builder() {
        let notification = AdminNotification::new(
            NotificationSeverity::Critical,
            "Token Reuse",
            "Refresh token reuse detected",
        )
        .with_org("acme-corp")
        .with_metadata(serde_json::json!({"ip": "192.168.1.1"}))
        .with_correlation_id("req-123");

        assert_eq!(notification.org_slug, Some("acme-corp".to_string()));
        assert!(notification.metadata.is_some());
        assert_eq!(notification.correlation_id, Some("req-123".to_string()));
    }

    #[test]
    fn test_sanitize_metadata_redacts_by_key() {
        let md = serde_json::json!({
            "accessToken": "abcd",
            "api_key": "abcd",
            "password": "abcd",
            "safe": "ok"
        });
        let items = sanitize_metadata_for_display(&md);
        let map: std::collections::HashMap<_, _> = items.into_iter().collect();
        assert_eq!(map.get("accessToken").unwrap(), "[redacted]");
        assert_eq!(map.get("api_key").unwrap(), "[redacted]");
        assert_eq!(map.get("password").unwrap(), "[redacted]");
        assert_eq!(map.get("safe").unwrap(), "ok");
    }

    #[test]
    fn test_sanitize_metadata_redacts_jwt_like_values() {
        let jwt_like = format!("{}.{}.{}", "a".repeat(20), "b".repeat(20), "c".repeat(20));
        let md = serde_json::json!({
            "note": jwt_like,
            "other": "not-a-jwt"
        });
        let items = sanitize_metadata_for_display(&md);
        let map: std::collections::HashMap<_, _> = items.into_iter().collect();
        assert_eq!(map.get("note").unwrap(), "[redacted]");
        assert_eq!(map.get("other").unwrap(), "not-a-jwt");
    }

    #[test]
    fn test_escape_markdown() {
        assert_eq!(escape_markdown("hello_world"), "hello\\_world");
        assert_eq!(escape_markdown("*bold*"), "\\*bold\\*");
        assert_eq!(escape_markdown("[link](url)"), "\\[link\\]\\(url\\)");
    }
}
