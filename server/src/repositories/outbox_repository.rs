//! Outbox repository for reliable async message delivery

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::errors::AppError;

mod in_memory;
mod model;

pub use in_memory::InMemoryOutboxRepository;
pub use model::{OutboxEvent, OutboxEventType, OutboxStatus};

/// Outbox repository trait
#[async_trait]
pub trait OutboxRepository: Send + Sync {
    /// Create a new outbox event
    async fn create(&self, event: OutboxEvent) -> Result<OutboxEvent, AppError>;

    /// Replace unused proofs and enqueue their email in one durable transaction.
    /// Implementations must fail without changing either side if unsupported.
    async fn create_with_tokens(
        &self,
        _event: OutboxEvent,
        _tokens: &[super::VerificationToken],
    ) -> Result<OutboxEvent, AppError> {
        Err(AppError::ServiceUnavailable(
            "Atomic token email persistence unavailable".into(),
        ))
    }

    /// Find event by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<OutboxEvent>, AppError>;

    /// Fetch and lock pending events for processing
    async fn fetch_pending(
        &self,
        limit: u32,
        lock_timeout_secs: u64,
    ) -> Result<Vec<OutboxEvent>, AppError>;

    /// Start an attempt only if the supplied claim snapshot still owns the row.
    /// Returns false for stale, already-started or acknowledged claims.
    async fn mark_processing(&self, event: &OutboxEvent) -> Result<bool, AppError>;

    /// Mark event as done
    async fn mark_done(&self, id: Uuid) -> Result<(), AppError>;

    /// Record local acknowledgement after a provider accepts the message.
    ///
    /// This cannot make the external send atomic. If this operation fails, the
    /// worker retries later and the provider may receive the message again.
    async fn mark_delivered(&self, id: Uuid) -> Result<(), AppError>;

    /// Record delivery plus an optional provider acceptance reference.
    ///
    /// The default preserves compatibility with custom repositories compiled
    /// against the original `mark_delivered` contract.
    async fn mark_delivered_with_receipt(
        &self,
        id: Uuid,
        _provider_message_id: Option<&str>,
    ) -> Result<(), AppError> {
        self.mark_delivered(id).await
    }

    /// Retry only the attempt started from this claim; stale failures do nothing.
    async fn mark_retry(&self, event: &OutboxEvent, error: &str) -> Result<(), AppError>;

    /// Permanently fail only the attempt started from this claim.
    async fn mark_failed(&self, event: &OutboxEvent, error: &str) -> Result<(), AppError>;

    /// Clean up old completed events
    async fn cleanup_old(&self, older_than: DateTime<Utc>) -> Result<u64, AppError>;

    /// Get count of pending events (for metrics)
    async fn count_pending(&self) -> Result<u64, AppError>;

    /// Get count of failed events (for alerts)
    async fn count_failed(&self) -> Result<u64, AppError>;

    /// Delete events by organization
    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError>;
}

/// Validate the immutable envelope before either persistence adapter writes it.
pub(crate) fn validate_token_email(
    event: &OutboxEvent,
    tokens: &[super::VerificationToken],
) -> Result<(), AppError> {
    use super::TokenType;
    let allowed: &[TokenType] = match event.event_type {
        OutboxEventType::EmailVerification => {
            &[TokenType::EmailVerify, TokenType::AccountEmailVerify]
        }
        OutboxEventType::EmailPasswordReset => &[TokenType::PasswordReset, TokenType::InstantLink],
        OutboxEventType::EmailInstantLink => &[TokenType::InstantLink],
        OutboxEventType::EmailAccountDeletion => &[TokenType::AccountDeletion],
        _ => &[],
    };
    if tokens.is_empty()
        || tokens.len() > 2
        || tokens.iter().enumerate().any(|(index, token)| {
            Some(token.user_id) != event.user_id
                || !token.is_valid()
                || token.subject_id.is_none()
                || !allowed.contains(&token.token_type)
                || tokens[..index].iter().any(|other| {
                    other.token_type == token.token_type || other.token_hash == token.token_hash
                })
        })
    {
        return Err(AppError::Validation("Invalid token email".into()));
    }
    Ok(())
}
