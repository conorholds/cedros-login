use async_trait::async_trait;
use chrono::{DateTime, Duration, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::{AppError, OutboxEvent, OutboxRepository, OutboxStatus};

/// In-memory outbox repository for development/testing.
#[derive(Default)]
pub struct InMemoryOutboxRepository {
    verification: crate::repositories::InMemoryVerificationRepository,
    events: RwLock<HashMap<Uuid, OutboxEvent>>,
}

impl InMemoryOutboxRepository {
    pub fn with_verification_repository(
        verification: crate::repositories::InMemoryVerificationRepository,
    ) -> Self {
        Self {
            verification,
            ..Self::default()
        }
    }

    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl OutboxRepository for InMemoryOutboxRepository {
    async fn create(&self, event: OutboxEvent) -> Result<OutboxEvent, AppError> {
        let mut events = self.events.write().await;
        events.insert(event.id, event.clone());
        Ok(event)
    }

    async fn create_with_tokens(
        &self,
        event: OutboxEvent,
        proofs: &[crate::repositories::VerificationToken],
    ) -> Result<OutboxEvent, AppError> {
        super::validate_token_email(&event, proofs)?;
        // Acquire all locks before mutation, so cancellation cannot leave half a write.
        let mut tokens = self.verification.tokens.write().await;
        let mut events = self.events.write().await;
        if events.contains_key(&event.id) {
            return Err(AppError::Validation("Duplicate outbox event".into()));
        }
        if proofs.iter().any(|proof| {
            tokens
                .values()
                .any(|t| t.token_hash == proof.token_hash || t.id == proof.id)
        }) {
            return Err(AppError::Validation("Duplicate verification token".into()));
        }
        for proof in proofs {
            tokens.retain(|_, existing| {
                !(existing.user_id == proof.user_id
                    && existing.token_type == proof.token_type
                    && existing.subject_id == proof.subject_id
                    && existing.used_at.is_none())
            });
            tokens.insert(proof.id, proof.clone());
        }
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
            .filter(|event| {
                let lock_expired = event
                    .locked_at
                    .map(|locked_at| locked_at < lock_cutoff)
                    .unwrap_or(true);
                (event.status == OutboxStatus::Pending
                    && event.next_attempt_at <= now
                    && lock_expired)
                    || (event.status == OutboxStatus::Processing && lock_expired)
            })
            .map(|event| (event.id, event.created_at))
            .collect();

        candidates.sort_by_key(|a| a.1);
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

    async fn mark_processing(&self, expected: &OutboxEvent) -> Result<bool, AppError> {
        let mut events = self.events.write().await;
        let Some(event) = events.get_mut(&expected.id) else {
            return Ok(false);
        };
        if event.locked_at != expected.locked_at
            || event.attempts != expected.attempts
            || !matches!(
                event.status,
                OutboxStatus::Pending | OutboxStatus::Processing
            )
            || event.delivered_at.is_some()
        {
            return Ok(false);
        }
        event.status = OutboxStatus::Processing;
        event.attempts += 1;
        Ok(true)
    }

    async fn mark_done(&self, id: Uuid) -> Result<(), AppError> {
        let mut events = self.events.write().await;

        if let Some(event) = events.get_mut(&id) {
            if event.delivered_at.is_none() {
                return Ok(());
            }
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

    async fn mark_delivered_with_receipt(
        &self,
        id: Uuid,
        _provider_message_id: Option<&str>,
    ) -> Result<(), AppError> {
        self.mark_delivered(id).await
    }

    async fn mark_retry(&self, expected: &OutboxEvent, error: &str) -> Result<(), AppError> {
        let mut events = self.events.write().await;

        if let Some(event) = events.get_mut(&expected.id) {
            if event.locked_at != expected.locked_at
                || event.attempts != expected.attempts + 1
                || event.status != OutboxStatus::Processing
                || event.delivered_at.is_some()
            {
                return Ok(());
            }
            event.last_error = Some(error.to_string());
            event.locked_at = None;

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

    async fn mark_failed(&self, expected: &OutboxEvent, error: &str) -> Result<(), AppError> {
        let mut events = self.events.write().await;

        if let Some(event) = events.get_mut(&expected.id) {
            if event.locked_at != expected.locked_at
                || event.attempts != expected.attempts + 1
                || event.status != OutboxStatus::Processing
                || event.delivered_at.is_some()
            {
                return Ok(());
            }
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
            .filter(|event| {
                matches!(event.status, OutboxStatus::Done | OutboxStatus::Failed)
                    && event.created_at < older_than
            })
            .map(|event| event.id)
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
            .filter(|event| event.status == OutboxStatus::Pending)
            .count() as u64)
    }

    async fn count_failed(&self) -> Result<u64, AppError> {
        let events = self.events.read().await;
        Ok(events
            .values()
            .filter(|event| event.status == OutboxStatus::Failed)
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
mod tests;
