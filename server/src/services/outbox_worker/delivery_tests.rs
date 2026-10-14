use super::*;
use crate::repositories::{InMemoryOutboxRepository, OutboxEventType, OutboxStatus};
use crate::services::{Email, LogNotificationService};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::sync::Mutex;
use uuid::Uuid;

struct FailingAcknowledgementRepository {
    inner: InMemoryOutboxRepository,
    fail_next_ack: AtomicBool,
}

impl FailingAcknowledgementRepository {
    fn new() -> Self {
        Self {
            inner: InMemoryOutboxRepository::new(),
            fail_next_ack: AtomicBool::new(true),
        }
    }
}

#[async_trait]
impl OutboxRepository for FailingAcknowledgementRepository {
    async fn create(&self, event: OutboxEvent) -> Result<OutboxEvent, AppError> {
        self.inner.create(event).await
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<OutboxEvent>, AppError> {
        self.inner.find_by_id(id).await
    }

    async fn fetch_pending(
        &self,
        limit: u32,
        lock_timeout_secs: u64,
    ) -> Result<Vec<OutboxEvent>, AppError> {
        self.inner.fetch_pending(limit, lock_timeout_secs).await
    }

    async fn mark_processing(&self, event: &OutboxEvent) -> Result<bool, AppError> {
        self.inner.mark_processing(event).await
    }

    async fn mark_done(&self, id: Uuid) -> Result<(), AppError> {
        self.inner.mark_done(id).await
    }

    async fn mark_delivered(&self, id: Uuid) -> Result<(), AppError> {
        self.inner.mark_delivered(id).await
    }

    async fn mark_delivered_with_receipt(
        &self,
        id: Uuid,
        provider_message_id: Option<&str>,
    ) -> Result<(), AppError> {
        if self.fail_next_ack.swap(false, Ordering::SeqCst) {
            return Err(AppError::Internal(anyhow::anyhow!(
                "injected delivery acknowledgement failure"
            )));
        }
        self.inner
            .mark_delivered_with_receipt(id, provider_message_id)
            .await
    }

    async fn mark_retry(&self, event: &OutboxEvent, error: &str) -> Result<(), AppError> {
        self.inner.mark_retry(event, error).await
    }

    async fn mark_failed(&self, event: &OutboxEvent, error: &str) -> Result<(), AppError> {
        self.inner.mark_failed(event, error).await
    }

    async fn cleanup_old(&self, older_than: DateTime<Utc>) -> Result<u64, AppError> {
        self.inner.cleanup_old(older_than).await
    }

    async fn count_pending(&self) -> Result<u64, AppError> {
        self.inner.count_pending().await
    }

    async fn count_failed(&self) -> Result<u64, AppError> {
        self.inner.count_failed().await
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        self.inner.delete_by_org(org_id).await
    }
}

#[derive(Default)]
struct ContextCapturingEmailService {
    contexts: Mutex<Vec<EmailDeliveryContext>>,
}

#[async_trait]
impl EmailService for ContextCapturingEmailService {
    async fn send(&self, _email: Email) -> Result<(), AppError> {
        Ok(())
    }

    async fn send_with_context(
        &self,
        _email: Email,
        context: &EmailDeliveryContext,
    ) -> Result<EmailDeliveryReceipt, AppError> {
        let mut contexts = self.contexts.lock().await;
        contexts.push(context.clone());
        Ok(EmailDeliveryReceipt {
            provider_message_id: Some(format!("provider-acceptance-{}", contexts.len())),
        })
    }
}

#[tokio::test]
async fn acknowledgement_failure_replays_with_stable_identity_and_duplicate_warning() {
    let repo = Arc::new(FailingAcknowledgementRepository::new());
    let email_service = Arc::new(ContextCapturingEmailService::default());
    let worker = OutboxWorker::new(
        repo.clone(),
        email_service.clone(),
        Arc::new(LogNotificationService::new()),
        OutboxWorkerConfig::default(),
        "https://example.com".into(),
        TokenCipher::new("test-secret"),
    );
    let event = OutboxEvent::new(
        OutboxEventType::EmailVerification,
        serde_json::json!({
            "to": "recipient@example.com",
            "verification_url": "https://example.com/verify",
            "expires_in_hours": 24
        }),
    );
    repo.create(event.clone()).await.unwrap();

    let first = worker.process_event(&event).await;
    assert!(
        first.is_err(),
        "injected acknowledgement failure must surface"
    );
    let retry_event = repo.find_by_id(event.id).await.unwrap().unwrap();
    assert_eq!(retry_event.status, OutboxStatus::Processing);
    assert!(retry_event.delivered_at.is_none());

    worker.process_event(&retry_event).await.unwrap();
    let contexts = email_service.contexts.lock().await;
    assert_eq!(
        contexts.len(),
        2,
        "at-least-once may replay after ack failure"
    );
    assert_eq!(contexts[0].delivery_id, contexts[1].delivery_id);
    assert!(!contexts[0].duplicate_risk);
    assert!(contexts[1].duplicate_risk);

    let delivered = repo.find_by_id(event.id).await.unwrap().unwrap();
    assert_eq!(delivered.status, OutboxStatus::Done);
    assert!(delivered.delivered_at.is_some());
}
