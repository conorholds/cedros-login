//! Tests for the outbox worker

use super::*;
use crate::repositories::{InMemoryOutboxRepository, OutboxEventType};
use crate::services::{Email, EmailService, LogEmailService, LogNotificationService};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Duration;
use tokio::time::sleep;

#[derive(Clone)]
struct CountingEmailService {
    active: Arc<AtomicUsize>,
    max_active: Arc<AtomicUsize>,
    delay: Duration,
}

#[async_trait::async_trait]
impl EmailService for CountingEmailService {
    async fn send(&self, _email: Email) -> Result<(), AppError> {
        let current = self.active.fetch_add(1, Ordering::SeqCst) + 1;
        self.max_active.fetch_max(current, Ordering::SeqCst);
        sleep(self.delay).await;
        self.active.fetch_sub(1, Ordering::SeqCst);
        Ok(())
    }
}

#[tokio::test]
async fn test_process_email_verification_event() {
    let outbox_repo = Arc::new(InMemoryOutboxRepository::new());
    let email_service = Arc::new(LogEmailService::new());
    let notification_service = Arc::new(LogNotificationService::new());
    let token_cipher = TokenCipher::new("test-secret");

    let worker = OutboxWorker::new(
        outbox_repo.clone(),
        email_service.clone(),
        notification_service,
        OutboxWorkerConfig::default(),
        "https://example.com".to_string(),
        token_cipher.clone(),
    );

    let token_enc = token_cipher.encrypt("abc").unwrap();
    let event = crate::repositories::OutboxEvent::new(
        OutboxEventType::EmailVerification,
        serde_json::json!({
            "to": "test@example.com",
            "user_name": "Test User",
            "token_enc": token_enc,
            "expires_in_hours": 24
        }),
    );
    outbox_repo.create(event.clone()).await.unwrap();

    worker.process_event(&event).await.unwrap();

    let emails = email_service.get_sent_emails().await;
    assert_eq!(emails.len(), 1);
    assert_eq!(emails[0].to, "test@example.com");
}

#[tokio::test]
async fn test_process_notification_event() {
    let outbox_repo = Arc::new(InMemoryOutboxRepository::new());
    let email_service = Arc::new(LogEmailService::new());
    let notification_service = Arc::new(LogNotificationService::new());

    let worker = OutboxWorker::new(
        outbox_repo.clone(),
        email_service,
        notification_service.clone(),
        OutboxWorkerConfig::default(),
        "https://example.com".to_string(),
        TokenCipher::new("test-secret"),
    );

    let event = crate::repositories::OutboxEvent::new(
        OutboxEventType::NotifyLoginThreshold,
        serde_json::json!({
            "severity": "warn",
            "title": "Login Threshold Reached",
            "body": "5 failed login attempts for user@example.com",
            "metadata": {"ip": "192.168.1.1"}
        }),
    );
    outbox_repo.create(event.clone()).await.unwrap();

    worker.process_event(&event).await.unwrap();

    let notifications = notification_service.get_notifications().await;
    assert_eq!(notifications.len(), 1);
    assert_eq!(notifications[0].title, "Login Threshold Reached");
}

#[tokio::test]
async fn test_process_security_alert_event() {
    let outbox_repo = Arc::new(InMemoryOutboxRepository::new());
    let email_service = Arc::new(LogEmailService::new());
    let notification_service = Arc::new(LogNotificationService::new());

    let worker = OutboxWorker::new(
        outbox_repo.clone(),
        email_service.clone(),
        notification_service,
        OutboxWorkerConfig::default(),
        "https://example.com".to_string(),
        TokenCipher::new("test-secret"),
    );

    let event = crate::repositories::OutboxEvent::new(
        OutboxEventType::EmailSecurityAlert,
        serde_json::json!({
            "to": "user@example.com",
            "user_name": "Test User",
            "login_time": "December 13, 2025 at 14:30 UTC",
            "ip_address": "192.168.1.1",
            "device": "Mac",
            "browser": "Chrome",
            "action_url": "https://example.com/account/security"
        }),
    );
    outbox_repo.create(event.clone()).await.unwrap();

    worker.process_event(&event).await.unwrap();

    let emails = email_service.get_sent_emails().await;
    assert_eq!(emails.len(), 1);
    assert_eq!(emails[0].to, "user@example.com");
    assert_eq!(emails[0].subject, "New sign-in to your account");
    assert!(emails[0].html_body.contains("Test User"));
    assert!(emails[0].html_body.contains("Mac"));
    assert!(emails[0].html_body.contains("Chrome"));
}

#[tokio::test]
async fn test_process_password_reset_event() {
    let outbox_repo = Arc::new(InMemoryOutboxRepository::new());
    let email_service = Arc::new(LogEmailService::new());
    let notification_service = Arc::new(LogNotificationService::new());
    let token_cipher = TokenCipher::new("test-secret");

    let worker = OutboxWorker::new(
        outbox_repo.clone(),
        email_service.clone(),
        notification_service,
        OutboxWorkerConfig::default(),
        "https://example.com".to_string(),
        token_cipher.clone(),
    );

    let token_enc = token_cipher.encrypt("abc123").unwrap();
    let event = crate::repositories::OutboxEvent::new(
        OutboxEventType::EmailPasswordReset,
        serde_json::json!({
            "to": "user@example.com",
            "user_name": "Test User",
            "token_enc": token_enc,
            "expires_in_minutes": 60
        }),
    );
    outbox_repo.create(event.clone()).await.unwrap();

    worker.process_event(&event).await.unwrap();

    let emails = email_service.get_sent_emails().await;
    assert_eq!(emails.len(), 1);
    assert_eq!(emails[0].to, "user@example.com");
    assert!(emails[0].html_body.contains("Reset"));
    assert!(emails[0].html_body.contains("60 minutes"));
}

#[tokio::test]
async fn test_process_invite_event() {
    let outbox_repo = Arc::new(InMemoryOutboxRepository::new());
    let email_service = Arc::new(LogEmailService::new());
    let notification_service = Arc::new(LogNotificationService::new());
    let token_cipher = TokenCipher::new("test-secret");

    let worker = OutboxWorker::new(
        outbox_repo.clone(),
        email_service.clone(),
        notification_service,
        OutboxWorkerConfig::default(),
        "https://example.com".to_string(),
        token_cipher.clone(),
    );

    let token_enc = token_cipher.encrypt("xyz").unwrap();
    let event = crate::repositories::OutboxEvent::new(
        OutboxEventType::EmailInvite,
        serde_json::json!({
            "to": "invitee@example.com",
            "org_name": "Acme Corp",
            "inviter_name": "John Doe",
            "role": "member",
            "token_enc": token_enc,
            "expires_in_days": 7
        }),
    );
    outbox_repo.create(event.clone()).await.unwrap();

    worker.process_event(&event).await.unwrap();

    let emails = email_service.get_sent_emails().await;
    assert_eq!(emails.len(), 1);
    assert_eq!(emails[0].to, "invitee@example.com");
    assert!(emails[0].subject.contains("Acme Corp"));
    assert!(emails[0].html_body.contains("John Doe"));
}

#[tokio::test]
async fn test_process_instant_link_event() {
    let outbox_repo = Arc::new(InMemoryOutboxRepository::new());
    let email_service = Arc::new(LogEmailService::new());
    let notification_service = Arc::new(LogNotificationService::new());
    let token_cipher = TokenCipher::new("test-secret");

    let worker = OutboxWorker::new(
        outbox_repo.clone(),
        email_service.clone(),
        notification_service,
        OutboxWorkerConfig::default(),
        "https://example.com".to_string(),
        token_cipher.clone(),
    );

    let token_enc = token_cipher.encrypt("abc").unwrap();
    let event = crate::repositories::OutboxEvent::new(
        OutboxEventType::EmailInstantLink,
        serde_json::json!({
            "to": "user@example.com",
            "user_name": "Test User",
            "token_enc": token_enc,
            "expires_in_minutes": 15
        }),
    );
    outbox_repo.create(event.clone()).await.unwrap();

    worker.process_event(&event).await.unwrap();

    let emails = email_service.get_sent_emails().await;
    assert_eq!(emails.len(), 1);
    assert_eq!(emails[0].to, "user@example.com");
    assert!(emails[0].subject.contains("sign-in"));
    assert!(emails[0].html_body.contains("15 minutes"));
}

#[tokio::test]
async fn test_process_event_marks_failed_on_max_attempts() {
    let outbox_repo = Arc::new(InMemoryOutboxRepository::new());
    let email_service = Arc::new(LogEmailService::new());
    let notification_service = Arc::new(LogNotificationService::new());

    let worker = OutboxWorker::new(
        outbox_repo.clone(),
        email_service,
        notification_service,
        OutboxWorkerConfig::default(),
        "https://example.com".to_string(),
        TokenCipher::new("test-secret"),
    );

    let mut event = crate::repositories::OutboxEvent::new(
        OutboxEventType::EmailVerification,
        serde_json::json!({}),
    );
    event.max_attempts = 1;
    let event_id = event.id;
    outbox_repo.create(event.clone()).await.unwrap();

    let result = worker.process_event(&event).await;
    assert!(result.is_err());

    let updated = outbox_repo.find_by_id(event_id).await.unwrap().unwrap();
    assert_eq!(updated.status, crate::repositories::OutboxStatus::Failed);
}

#[test]
fn test_sanitize_error_for_log() {
    // Email addresses should be redacted
    let error = "Failed to send email to user@example.com: connection refused";
    let sanitized = sanitize_error_for_log(error);
    assert!(!sanitized.contains("user@example.com"));
    assert!(sanitized.contains("[REDACTED]"));
    assert!(sanitized.contains("connection refused"));

    // Multiple emails should be redacted
    let error = "Error: foo@bar.com and baz@qux.org failed";
    let sanitized = sanitize_error_for_log(error);
    assert!(!sanitized.contains("foo@bar.com"));
    assert!(!sanitized.contains("baz@qux.org"));
    assert_eq!(sanitized.matches("[REDACTED]").count(), 2);

    // Long messages should be truncated
    let long_error = "x".repeat(200);
    let sanitized = sanitize_error_for_log(&long_error);
    assert!(sanitized.len() < 200);
    assert!(sanitized.contains("(truncated)"));

    // Multibyte content should truncate safely
    let multibyte = "🙂".repeat(200);
    let sanitized = sanitize_error_for_log(&multibyte);
    assert!(sanitized.contains("(truncated)"));

    // Normal errors should pass through
    let error = "Connection timeout after 30 seconds";
    let sanitized = sanitize_error_for_log(error);
    assert_eq!(sanitized, error);
}

#[tokio::test]
async fn test_process_batch_runs_concurrently() {
    let outbox_repo = Arc::new(InMemoryOutboxRepository::new());
    let active = Arc::new(AtomicUsize::new(0));
    let max_active = Arc::new(AtomicUsize::new(0));
    let email_service = Arc::new(CountingEmailService {
        active: active.clone(),
        max_active: max_active.clone(),
        delay: Duration::from_millis(50),
    });
    let notification_service = Arc::new(LogNotificationService::new());

    let worker = OutboxWorker::new(
        outbox_repo.clone(),
        email_service,
        notification_service,
        OutboxWorkerConfig {
            batch_size: 4,
            ..OutboxWorkerConfig::default()
        },
        "https://example.com".to_string(),
        TokenCipher::new("test-secret"),
    );

    for _ in 0..4 {
        let event = crate::repositories::OutboxEvent::new(
            OutboxEventType::EmailVerification,
            serde_json::json!({
                "to": "test@example.com",
                "verification_url": "https://example.com/verify",
                "expires_in_hours": 24
            }),
        );
        outbox_repo.create(event).await.unwrap();
    }

    worker.process_batch().await.unwrap();

    assert!(max_active.load(Ordering::SeqCst) >= 2);
}

#[tokio::test]
async fn test_idempotency_skips_already_delivered_event() {
    let outbox_repo = Arc::new(InMemoryOutboxRepository::new());
    let email_service = Arc::new(LogEmailService::new());
    let notification_service = Arc::new(LogNotificationService::new());
    let token_cipher = TokenCipher::new("test-secret");

    let worker = OutboxWorker::new(
        outbox_repo.clone(),
        email_service.clone(),
        notification_service,
        OutboxWorkerConfig::default(),
        "https://example.com".to_string(),
        token_cipher.clone(),
    );

    // Create an event with a valid payload
    let token_enc = token_cipher.encrypt("abc").unwrap();
    let mut event = crate::repositories::OutboxEvent::new(
        OutboxEventType::EmailVerification,
        serde_json::json!({
            "to": "test@example.com",
            "user_name": "Test User",
            "token_enc": token_enc,
            "expires_in_hours": 24
        }),
    );

    // Simulate: event was already delivered (e.g., crash after delivery but before mark_done)
    event.delivered_at = Some(chrono::Utc::now());

    let event_id = event.id;
    outbox_repo.create(event.clone()).await.unwrap();

    // Process the event - should skip sending due to delivered_at being set
    worker.process_event(&event).await.unwrap();

    // Verify no email was sent (idempotency worked)
    let emails = email_service.get_sent_emails().await;
    assert_eq!(
        emails.len(),
        0,
        "Expected no email to be sent for already-delivered event"
    );

    // Verify event is marked as done
    let updated = outbox_repo.find_by_id(event_id).await.unwrap().unwrap();
    assert_eq!(updated.status, crate::repositories::OutboxStatus::Done);
}

#[tokio::test]
async fn test_mark_delivered_sets_timestamp() {
    let outbox_repo = Arc::new(InMemoryOutboxRepository::new());
    let email_service = Arc::new(LogEmailService::new());
    let notification_service = Arc::new(LogNotificationService::new());
    let token_cipher = TokenCipher::new("test-secret");

    let worker = OutboxWorker::new(
        outbox_repo.clone(),
        email_service.clone(),
        notification_service,
        OutboxWorkerConfig::default(),
        "https://example.com".to_string(),
        token_cipher.clone(),
    );

    let token_enc = token_cipher.encrypt("abc").unwrap();
    let event = crate::repositories::OutboxEvent::new(
        OutboxEventType::EmailVerification,
        serde_json::json!({
            "to": "test@example.com",
            "user_name": "Test User",
            "token_enc": token_enc,
            "expires_in_hours": 24
        }),
    );
    let event_id = event.id;
    outbox_repo.create(event.clone()).await.unwrap();

    // Before processing, delivered_at should be None
    let before = outbox_repo.find_by_id(event_id).await.unwrap().unwrap();
    assert!(before.delivered_at.is_none());

    // Process the event
    worker.process_event(&event).await.unwrap();

    // After processing, delivered_at should be set
    let after = outbox_repo.find_by_id(event_id).await.unwrap().unwrap();
    assert!(
        after.delivered_at.is_some(),
        "Expected delivered_at to be set after successful processing"
    );
    assert_eq!(after.status, crate::repositories::OutboxStatus::Done);
}
