use std::collections::HashMap;

use super::http::BodySnippet;
use super::log::LOG_NOTIFICATION_BUFFER_MAX;
use super::metadata::{sanitize_metadata_for_display, truncate_value, TEST_MAX_METADATA_VALUE_LEN};
use super::telegram::escape_markdown;
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
async fn log_notification_service_retains_notification() {
    let service = LogNotificationService::new();
    let notification =
        AdminNotification::new(NotificationSeverity::Warn, "Test Alert", "This is a test");

    service.notify(notification).await.unwrap();

    let notifications = service.get_notifications().await;
    assert_eq!(notifications.len(), 1);
    assert_eq!(notifications[0].title, "Test Alert");
}

#[tokio::test]
async fn log_notification_service_caps_buffer() {
    let service = LogNotificationService::new();

    for index in 0..(LOG_NOTIFICATION_BUFFER_MAX + 1) {
        service
            .notify(AdminNotification::new(
                NotificationSeverity::Info,
                &format!("Title {index}"),
                "Body",
            ))
            .await
            .unwrap();
    }

    assert_eq!(
        service.get_notifications().await.len(),
        LOG_NOTIFICATION_BUFFER_MAX
    );
}

#[tokio::test]
async fn log_notification_service_redacts_body_and_metadata() {
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
fn notification_severity_renders_channel_values() {
    assert_eq!(NotificationSeverity::Info.as_str(), "INFO");
    assert_eq!(NotificationSeverity::Critical.emoji(), "🚨");
    assert_eq!(NotificationSeverity::Warn.discord_color(), 0xf1c40f);
}

#[test]
fn notification_builder_sets_optional_fields() {
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
fn truncate_value_truncates_ascii_and_adds_ellipsis() {
    let output = truncate_value("a".repeat(TEST_MAX_METADATA_VALUE_LEN + 1));

    assert_eq!(output.len(), TEST_MAX_METADATA_VALUE_LEN + '…'.len_utf8());
    assert!(output.ends_with('…'));
}

#[test]
fn truncate_value_handles_multibyte_without_panic() {
    let output = truncate_value("€".repeat(54));

    assert!(output.ends_with('…'));
    assert!(std::str::from_utf8(output.as_bytes()).is_ok());
}

#[test]
fn sanitize_metadata_redacts_by_key() {
    let metadata = serde_json::json!({
        "accessToken": "abcd",
        "api_key": "abcd",
        "password": "abcd",
        "safe": "ok"
    });
    let map: HashMap<_, _> = sanitize_metadata_for_display(&metadata)
        .into_iter()
        .collect();

    assert_eq!(map.get("accessToken").unwrap(), "[redacted]");
    assert_eq!(map.get("api_key").unwrap(), "[redacted]");
    assert_eq!(map.get("password").unwrap(), "[redacted]");
    assert_eq!(map.get("safe").unwrap(), "ok");
}

#[test]
fn sanitize_metadata_redacts_jwt_like_values() {
    let jwt_like = format!("{}.{}.{}", "a".repeat(20), "b".repeat(20), "c".repeat(20));
    let metadata = serde_json::json!({
        "note": jwt_like,
        "other": "not-a-jwt"
    });
    let map: HashMap<_, _> = sanitize_metadata_for_display(&metadata)
        .into_iter()
        .collect();

    assert_eq!(map.get("note").unwrap(), "[redacted]");
    assert_eq!(map.get("other").unwrap(), "not-a-jwt");
}

#[test]
fn escape_markdown_escapes_supported_characters() {
    assert_eq!(escape_markdown("hello_world"), "hello\\_world");
    assert_eq!(escape_markdown("*bold*"), "\\*bold\\*");
    assert_eq!(escape_markdown("[link](url)"), "\\[link\\]\\(url\\)");
}
