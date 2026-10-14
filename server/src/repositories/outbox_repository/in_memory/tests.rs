use super::*;
use crate::repositories::outbox_repository::OutboxEventType;

#[tokio::test]
async fn test_create_and_find_event() {
    let repo = InMemoryOutboxRepository::new();
    let event = OutboxEvent::new(
        OutboxEventType::EmailVerification,
        serde_json::json!({"to": "test@example.com"}),
    );

    let created = repo.create(event.clone()).await.unwrap();
    let found = repo.find_by_id(created.id).await.unwrap();
    assert!(found.is_some());
    assert_eq!(found.unwrap().id, created.id);
}

#[tokio::test]
async fn test_fetch_pending_events() {
    let repo = InMemoryOutboxRepository::new();
    let event = OutboxEvent::new(
        OutboxEventType::EmailInvite,
        serde_json::json!({"to": "test@example.com"}),
    );
    repo.create(event).await.unwrap();

    let pending = repo.fetch_pending(10, 300).await.unwrap();
    assert_eq!(pending.len(), 1);
}

#[tokio::test]
async fn test_fetch_pending_locks_events() {
    let repo = InMemoryOutboxRepository::new();
    let event = OutboxEvent::new(
        OutboxEventType::EmailInvite,
        serde_json::json!({"to": "test@example.com"}),
    );
    repo.create(event).await.unwrap();

    let first = repo.fetch_pending(10, 300).await.unwrap();
    assert_eq!(first.len(), 1);
    let second = repo.fetch_pending(10, 300).await.unwrap();
    assert_eq!(second.len(), 0);
}

#[tokio::test]
async fn test_fetch_pending_reclaims_stale_processing() {
    let repo = InMemoryOutboxRepository::new();
    let event = OutboxEvent::new(
        OutboxEventType::EmailInvite,
        serde_json::json!({"to": "test@example.com"}),
    );
    let event_id = event.id;
    repo.create(event.clone()).await.unwrap();
    repo.mark_processing(&event).await.unwrap();

    {
        let mut events = repo.events.write().await;
        if let Some(entry) = events.get_mut(&event_id) {
            entry.locked_at = Some(Utc::now() - Duration::seconds(120));
        }
    }

    let reclaimed = repo.fetch_pending(10, 60).await.unwrap();
    assert_eq!(reclaimed.len(), 1);
    assert_eq!(reclaimed[0].id, event_id);
}

#[tokio::test]
async fn test_cleanup_removes_failed() {
    let repo = InMemoryOutboxRepository::new();
    let mut event = OutboxEvent::new(
        OutboxEventType::EmailInvite,
        serde_json::json!({"to": "test@example.com"}),
    );
    event.status = OutboxStatus::Failed;
    event.created_at = Utc::now() - Duration::days(31);
    let event_id = event.id;
    repo.create(event).await.unwrap();

    let cutoff = Utc::now() - Duration::days(30);
    let removed = repo.cleanup_old(cutoff).await.unwrap();
    assert_eq!(removed, 1);
    assert!(repo.find_by_id(event_id).await.unwrap().is_none());
}

#[tokio::test]
async fn test_mark_processing_and_done() {
    let repo = InMemoryOutboxRepository::new();
    let event = OutboxEvent::new(OutboxEventType::EmailPasswordReset, serde_json::json!({}));
    let created = repo.create(event).await.unwrap();

    repo.mark_processing(&created).await.unwrap();
    let found = repo.find_by_id(created.id).await.unwrap().unwrap();
    assert_eq!(found.status, OutboxStatus::Processing);
    assert_eq!(found.attempts, 1);

    repo.mark_delivered(created.id).await.unwrap();
    repo.mark_done(created.id).await.unwrap();
    let found = repo.find_by_id(created.id).await.unwrap().unwrap();
    assert_eq!(found.status, OutboxStatus::Done);
}

#[tokio::test]
async fn test_mark_retry_with_backoff() {
    let repo = InMemoryOutboxRepository::new();
    let event = OutboxEvent::new(OutboxEventType::NotifyLoginThreshold, serde_json::json!({}));
    let created = repo.create(event).await.unwrap();

    repo.mark_processing(&created).await.unwrap();
    repo.mark_retry(&created, "Connection timeout")
        .await
        .unwrap();

    let found = repo.find_by_id(created.id).await.unwrap().unwrap();
    assert_eq!(found.status, OutboxStatus::Pending);
    assert_eq!(found.last_error, Some("Connection timeout".to_string()));
    assert!(found.next_attempt_at > Utc::now());
}

#[tokio::test]
async fn test_mark_retry_first_failure_uses_30s_backoff() {
    let repo = InMemoryOutboxRepository::new();
    let event = OutboxEvent::new(OutboxEventType::EmailVerification, serde_json::json!({}));
    let created = repo.create(event).await.unwrap();

    repo.mark_processing(&created).await.unwrap();
    repo.mark_retry(&created, "fail").await.unwrap();

    let updated = repo.find_by_id(created.id).await.unwrap().unwrap();
    let delay = updated
        .next_attempt_at
        .signed_duration_since(Utc::now())
        .num_seconds();
    assert!((25..=35).contains(&delay), "delay was {delay}s");
}

#[tokio::test]
async fn test_event_type_classification() {
    assert!(OutboxEventType::EmailVerification.is_email());
    assert!(OutboxEventType::EmailInvite.is_email());
    assert!(!OutboxEventType::NotifyRoleChange.is_email());

    assert!(OutboxEventType::NotifyTokenReuse.is_notification());
    assert!(!OutboxEventType::EmailInstantLink.is_notification());
}
