//! Outbox repository for reliable async message delivery

use async_trait::async_trait;
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Status of an outbox event
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OutboxStatus {
    Pending,
    Processing,
    Done,
    Failed,
}

impl OutboxStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Processing => "processing",
            Self::Done => "done",
            Self::Failed => "failed",
        }
    }
}

/// Type of outbox event
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OutboxEventType {
    // Email events
    EmailVerification,
    EmailPasswordReset,
    EmailInvite,
    EmailInstantLink,
    EmailSecurityAlert,
    // Admin notification events
    NotifyLoginThreshold,
    NotifyTokenReuse,
    NotifyRoleChange,
    NotifyOwnerTransfer,
    NotifyAdminAction,
    // Credit events (admin notifications)
    CreditLowBalance,
    CreditSpend,
    CreditHoldExpired,
    CreditRefundRequested,
}

impl OutboxEventType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::EmailVerification => "email.verification",
            Self::EmailPasswordReset => "email.password_reset",
            Self::EmailInvite => "email.invite",
            Self::EmailInstantLink => "email.instant_link",
            Self::EmailSecurityAlert => "email.security_alert",
            Self::NotifyLoginThreshold => "notify.login_threshold",
            Self::NotifyTokenReuse => "notify.token_reuse",
            Self::NotifyRoleChange => "notify.role_change",
            Self::NotifyOwnerTransfer => "notify.owner_transfer",
            Self::NotifyAdminAction => "notify.admin_action",
            Self::CreditLowBalance => "credit.low_balance",
            Self::CreditSpend => "credit.spend",
            Self::CreditHoldExpired => "credit.hold_expired",
            Self::CreditRefundRequested => "credit.refund_requested",
        }
    }

    pub fn is_email(&self) -> bool {
        matches!(
            self,
            Self::EmailVerification
                | Self::EmailPasswordReset
                | Self::EmailInvite
                | Self::EmailInstantLink
                | Self::EmailSecurityAlert
        )
    }

    pub fn is_notification(&self) -> bool {
        matches!(
            self,
            Self::NotifyLoginThreshold
                | Self::NotifyTokenReuse
                | Self::NotifyRoleChange
                | Self::NotifyOwnerTransfer
                | Self::NotifyAdminAction
        )
    }

    pub fn is_credit_event(&self) -> bool {
        matches!(
            self,
            Self::CreditLowBalance
                | Self::CreditSpend
                | Self::CreditHoldExpired
                | Self::CreditRefundRequested
        )
    }
}

/// Outbox event entity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutboxEvent {
    pub id: Uuid,
    pub event_type: OutboxEventType,
    pub payload: Value,
    pub status: OutboxStatus,
    pub attempts: u32,
    pub max_attempts: u32,
    pub next_attempt_at: DateTime<Utc>,
    pub locked_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    /// Timestamp when the message was actually delivered (email sent, notification pushed).
    /// Used for idempotency: if set, the worker skips re-sending on retry.
    pub delivered_at: Option<DateTime<Utc>>,
    pub last_error: Option<String>,
    pub correlation_id: Option<String>,
    pub org_id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

impl OutboxEvent {
    pub fn new(event_type: OutboxEventType, payload: Value) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            event_type,
            payload,
            status: OutboxStatus::Pending,
            attempts: 0,
            max_attempts: 10,
            next_attempt_at: now,
            locked_at: None,
            completed_at: None,
            delivered_at: None,
            last_error: None,
            correlation_id: None,
            org_id: None,
            user_id: None,
            created_at: now,
        }
    }

    pub fn with_correlation_id(mut self, id: &str) -> Self {
        self.correlation_id = Some(id.to_string());
        self
    }

    pub fn with_org_id(mut self, org_id: Uuid) -> Self {
        self.org_id = Some(org_id);
        self
    }

    pub fn with_user_id(mut self, user_id: Uuid) -> Self {
        self.user_id = Some(user_id);
        self
    }

    /// Calculate next retry delay using exponential backoff
    pub fn calculate_next_attempt(&self) -> DateTime<Utc> {
        // Backoff: 30s, 2m, 10m, 30m, 1h, 2h, 4h, 8h, 16h, 24h
        let attempt_index = self.attempts.saturating_sub(1);
        let delay_secs = match attempt_index {
            0 => 30,
            1 => 120,
            2 => 600,
            3 => 1800,
            4 => 3600,
            5 => 7200,
            6 => 14400,
            7 => 28800,
            8 => 57600,
            _ => 86400,
        };
        Utc::now() + Duration::seconds(delay_secs)
    }
}

/// Outbox repository trait
#[async_trait]
pub trait OutboxRepository: Send + Sync {
    /// Create a new outbox event
    async fn create(&self, event: OutboxEvent) -> Result<OutboxEvent, AppError>;

    /// Find event by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<OutboxEvent>, AppError>;

    /// Fetch and lock pending events for processing
    async fn fetch_pending(
        &self,
        limit: u32,
        lock_timeout_secs: u64,
    ) -> Result<Vec<OutboxEvent>, AppError>;

    /// Mark event as processing (lock it)
    async fn mark_processing(&self, id: Uuid) -> Result<(), AppError>;

    /// Mark event as done
    async fn mark_done(&self, id: Uuid) -> Result<(), AppError>;

    /// Mark event as delivered (message sent successfully).
    /// Called after successful send but before mark_done.
    /// Provides idempotency: if delivered_at is set, worker skips re-sending.
    async fn mark_delivered(&self, id: Uuid) -> Result<(), AppError>;

    /// Mark event as failed with retry
    async fn mark_retry(&self, id: Uuid, error: &str) -> Result<(), AppError>;

    /// Mark event as permanently failed
    async fn mark_failed(&self, id: Uuid, error: &str) -> Result<(), AppError>;

    /// Clean up old completed events
    async fn cleanup_old(&self, older_than: DateTime<Utc>) -> Result<u64, AppError>;

    /// Get count of pending events (for metrics)
    async fn count_pending(&self) -> Result<u64, AppError>;

    /// Get count of failed events (for alerts)
    async fn count_failed(&self) -> Result<u64, AppError>;

    /// Delete events by organization
    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError>;
}

/// In-memory outbox repository for development/testing
pub struct InMemoryOutboxRepository {
    events: RwLock<HashMap<Uuid, OutboxEvent>>,
}

impl InMemoryOutboxRepository {
    pub fn new() -> Self {
        Self {
            events: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryOutboxRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl OutboxRepository for InMemoryOutboxRepository {
    async fn create(&self, event: OutboxEvent) -> Result<OutboxEvent, AppError> {
        let mut events = self.events.write().await;
        events.insert(event.id, event.clone());
        Ok(event)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<OutboxEvent>, AppError> {
        let events = self.events.read().await;
        Ok(events.get(&id).cloned())
    }

    async fn fetch_pending(
        &self,
        limit: u32,
        lock_timeout_secs: u64,
    ) -> Result<Vec<OutboxEvent>, AppError> {
        let now = Utc::now();
        let lock_cutoff = now - Duration::seconds(lock_timeout_secs as i64);
        let mut events = self.events.write().await;

        let mut candidates: Vec<(Uuid, DateTime<Utc>)> = events
            .values()
            .filter(|e| {
                let lock_expired = e.locked_at.map(|t| t < lock_cutoff).unwrap_or(true);
                (e.status == OutboxStatus::Pending && e.next_attempt_at <= now && lock_expired)
                    || (e.status == OutboxStatus::Processing && lock_expired)
            })
            .map(|e| (e.id, e.created_at))
            .collect();

        candidates.sort_by(|a, b| a.1.cmp(&b.1));
        candidates.truncate(limit as usize);

        let mut pending = Vec::with_capacity(candidates.len());
        for (event_id, _) in candidates {
            if let Some(event) = events.get_mut(&event_id) {
                event.locked_at = Some(now);
                pending.push(event.clone());
            }
        }

        Ok(pending)
    }

    async fn mark_processing(&self, id: Uuid) -> Result<(), AppError> {
        let mut events = self.events.write().await;

        if let Some(event) = events.get_mut(&id) {
            event.status = OutboxStatus::Processing;
            event.locked_at = Some(Utc::now());
            event.attempts += 1;
        } else {
            // REPO-2: Log when event not found (idempotent operation)
            tracing::debug!(event_id = %id, "Outbox event not found for mark_processing");
        }
        Ok(())
    }

    async fn mark_done(&self, id: Uuid) -> Result<(), AppError> {
        let mut events = self.events.write().await;

        if let Some(event) = events.get_mut(&id) {
            event.status = OutboxStatus::Done;
            event.locked_at = None;
            event.completed_at = Some(Utc::now());
        }
        Ok(())
    }

    async fn mark_delivered(&self, id: Uuid) -> Result<(), AppError> {
        let mut events = self.events.write().await;

        if let Some(event) = events.get_mut(&id) {
            event.delivered_at = Some(Utc::now());
        }
        Ok(())
    }

    async fn mark_retry(&self, id: Uuid, error: &str) -> Result<(), AppError> {
        let mut events = self.events.write().await;

        if let Some(event) = events.get_mut(&id) {
            event.last_error = Some(error.to_string());
            event.locked_at = None;

            // Auto-fail events that have exceeded max_attempts
            if event.attempts >= event.max_attempts {
                event.status = OutboxStatus::Failed;
                event.completed_at = Some(Utc::now());
            } else {
                event.status = OutboxStatus::Pending;
                event.next_attempt_at = event.calculate_next_attempt();
            }
        }
        Ok(())
    }

    async fn mark_failed(&self, id: Uuid, error: &str) -> Result<(), AppError> {
        let mut events = self.events.write().await;

        if let Some(event) = events.get_mut(&id) {
            event.status = OutboxStatus::Failed;
            event.locked_at = None;
            event.last_error = Some(error.to_string());
            event.completed_at = Some(Utc::now());
        }
        Ok(())
    }

    async fn cleanup_old(&self, older_than: DateTime<Utc>) -> Result<u64, AppError> {
        let mut events = self.events.write().await;

        let to_remove: Vec<Uuid> = events
            .values()
            .filter(|e| {
                matches!(e.status, OutboxStatus::Done | OutboxStatus::Failed)
                    && e.created_at < older_than
            })
            .map(|e| e.id)
            .collect();

        let count = to_remove.len() as u64;
        for id in to_remove {
            events.remove(&id);
        }
        Ok(count)
    }

    async fn count_pending(&self) -> Result<u64, AppError> {
        let events = self.events.read().await;
        Ok(events
            .values()
            .filter(|e| e.status == OutboxStatus::Pending)
            .count() as u64)
    }

    async fn count_failed(&self) -> Result<u64, AppError> {
        let events = self.events.read().await;
        Ok(events
            .values()
            .filter(|e| e.status == OutboxStatus::Failed)
            .count() as u64)
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let mut events = self.events.write().await;

        let to_remove: Vec<Uuid> = events
            .values()
            .filter(|event| event.org_id == Some(org_id))
            .map(|event| event.id)
            .collect();

        let count = to_remove.len() as u64;
        for id in to_remove {
            events.remove(&id);
        }
        Ok(count)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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

        // Create pending event
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
        repo.create(event).await.unwrap();

        repo.mark_processing(event_id).await.unwrap();

        // Force the lock to appear stale.
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

        repo.mark_processing(created.id).await.unwrap();
        let found = repo.find_by_id(created.id).await.unwrap().unwrap();
        assert_eq!(found.status, OutboxStatus::Processing);
        assert_eq!(found.attempts, 1);

        repo.mark_done(created.id).await.unwrap();
        let found = repo.find_by_id(created.id).await.unwrap().unwrap();
        assert_eq!(found.status, OutboxStatus::Done);
    }

    #[tokio::test]
    async fn test_mark_retry_with_backoff() {
        let repo = InMemoryOutboxRepository::new();
        let event = OutboxEvent::new(OutboxEventType::NotifyLoginThreshold, serde_json::json!({}));
        let created = repo.create(event).await.unwrap();

        repo.mark_processing(created.id).await.unwrap();
        repo.mark_retry(created.id, "Connection timeout")
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

        repo.mark_processing(created.id).await.unwrap();
        repo.mark_retry(created.id, "fail").await.unwrap();

        let updated = repo.find_by_id(created.id).await.unwrap().unwrap();
        let delay = updated
            .next_attempt_at
            .signed_duration_since(Utc::now())
            .num_seconds();
        assert!((25..=35).contains(&delay), "delay was {}s", delay);
    }

    #[tokio::test]
    async fn test_event_type_classification() {
        assert!(OutboxEventType::EmailVerification.is_email());
        assert!(OutboxEventType::EmailInvite.is_email());
        assert!(!OutboxEventType::NotifyRoleChange.is_email());

        assert!(OutboxEventType::NotifyTokenReuse.is_notification());
        assert!(!OutboxEventType::EmailInstantLink.is_notification());
    }

    #[tokio::test]
    async fn test_credit_event_type_classification() {
        // Credit events are not emails
        assert!(!OutboxEventType::CreditLowBalance.is_email());
        assert!(!OutboxEventType::CreditSpend.is_email());
        assert!(!OutboxEventType::CreditHoldExpired.is_email());
        assert!(!OutboxEventType::CreditRefundRequested.is_email());

        // Credit events are not notifications (they have their own category)
        assert!(!OutboxEventType::CreditLowBalance.is_notification());
        assert!(!OutboxEventType::CreditSpend.is_notification());
        assert!(!OutboxEventType::CreditHoldExpired.is_notification());
        assert!(!OutboxEventType::CreditRefundRequested.is_notification());

        // Credit events are credit events
        assert!(OutboxEventType::CreditLowBalance.is_credit_event());
        assert!(OutboxEventType::CreditSpend.is_credit_event());
        assert!(OutboxEventType::CreditHoldExpired.is_credit_event());
        assert!(OutboxEventType::CreditRefundRequested.is_credit_event());

        // Other types are not credit events
        assert!(!OutboxEventType::EmailVerification.is_credit_event());
        assert!(!OutboxEventType::NotifyRoleChange.is_credit_event());
    }

    #[tokio::test]
    async fn test_credit_event_type_as_str() {
        assert_eq!(
            OutboxEventType::CreditLowBalance.as_str(),
            "credit.low_balance"
        );
        assert_eq!(OutboxEventType::CreditSpend.as_str(), "credit.spend");
        assert_eq!(
            OutboxEventType::CreditHoldExpired.as_str(),
            "credit.hold_expired"
        );
        assert_eq!(
            OutboxEventType::CreditRefundRequested.as_str(),
            "credit.refund_requested"
        );
    }
}
