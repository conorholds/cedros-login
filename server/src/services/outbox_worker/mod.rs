//! Outbox worker for processing async email and notification delivery
//!
//! # Delivery guarantee
//!
//! External provider acceptance and local acknowledgement cannot be one atomic
//! transaction, so delivery is **at least once**. A stable delivery identity is
//! sent for correlation, but providers without idempotency support may deliver a
//! duplicate if local acknowledgement fails after provider acceptance.

mod config;
mod email_handlers;
mod notification_handlers;

#[cfg(test)]
mod delivery_tests;
#[cfg(test)]
mod tests;

pub use config::OutboxWorkerConfig;

use std::sync::Arc;
use std::time::Duration;
use tokio::task::JoinHandle;
use tokio_util::sync::CancellationToken;
use tracing::{debug, error, info, warn};

use crate::errors::AppError;
use crate::repositories::{OutboxEvent, OutboxRepository};
use crate::services::{
    set_outbox_queue_counts, AdminNotification, EmailDeliveryContext, EmailDeliveryReceipt,
    EmailService, NotificationService, NotificationSeverity, SettingsService,
};
use crate::utils::TokenCipher;

use email_handlers::process_email_event;
use notification_handlers::process_notification_event;

/// Provider/DB error text is untrusted and can contain tokens, URLs or PII.
fn delivery_error_kind(error: &AppError) -> &'static str {
    match error {
        AppError::ServiceUnavailable(_) => "service_unavailable",
        AppError::Database(_) => "database_error",
        AppError::Validation(_) => "invalid_delivery",
        AppError::Config(_) => "configuration_error",
        AppError::Internal(_) => "internal_error",
        _ => "delivery_error",
    }
}

/// Outbox worker that processes pending events
#[derive(Clone)]
pub struct OutboxWorker {
    outbox_repo: Arc<dyn OutboxRepository>,
    email_service: Arc<dyn EmailService>,
    notification_service: Arc<dyn NotificationService>,
    config: OutboxWorkerConfig,
    base_url: String,
    token_cipher: TokenCipher,
    settings_service: Option<Arc<SettingsService>>,
}

impl OutboxWorker {
    pub fn new(
        outbox_repo: Arc<dyn OutboxRepository>,
        email_service: Arc<dyn EmailService>,
        notification_service: Arc<dyn NotificationService>,
        config: OutboxWorkerConfig,
        base_url: String,
        token_cipher: TokenCipher,
    ) -> Self {
        Self {
            outbox_repo,
            email_service,
            notification_service,
            config,
            base_url,
            token_cipher,
            settings_service: None,
        }
    }

    /// Set the settings service for reading custom email subjects
    pub fn with_settings(mut self, settings_service: Arc<SettingsService>) -> Self {
        self.settings_service = Some(settings_service);
        self
    }

    /// Start the worker as a background task with graceful shutdown support
    ///
    /// The worker will process events until the cancellation token is triggered.
    /// When cancelled, it finishes processing the current batch before exiting.
    pub fn start(self, cancel_token: CancellationToken) -> JoinHandle<()> {
        tokio::spawn(async move {
            info!(
                poll_interval = self.config.poll_interval_secs,
                batch_size = self.config.batch_size,
                "Outbox worker started"
            );

            let mut interval =
                tokio::time::interval(Duration::from_secs(self.config.poll_interval_secs));

            loop {
                tokio::select! {
                    _ = cancel_token.cancelled() => {
                        info!("Outbox worker shutting down gracefully");
                        break;
                    }
                    _ = interval.tick() => {
                        if let Err(e) = self.process_batch().await {
                            error!(error = %e, "Failed to process outbox batch");
                        }
                    }
                }
            }

            info!("Outbox worker stopped");
        })
    }

    /// Process a batch of pending events
    async fn process_batch(&self) -> Result<(), AppError> {
        self.record_queue_counts().await;

        let events = self
            .outbox_repo
            .fetch_pending(self.config.batch_size, self.config.lock_timeout_secs)
            .await?;

        if events.is_empty() {
            return Ok(());
        }

        debug!(count = events.len(), "Processing outbox events");

        // MAX_CONCURRENCY is hardcoded; consider making configurable via
        // OutboxWorkerConfig for environments with different resource constraints.
        // Higher values improve throughput but increase memory/connection usage.
        const MAX_CONCURRENCY: usize = 8;
        // `events` is non-empty (early-returned above), so this is always >= 1.
        let concurrency = std::cmp::min(events.len(), MAX_CONCURRENCY);
        let semaphore = Arc::new(tokio::sync::Semaphore::new(concurrency));
        let mut join_set = tokio::task::JoinSet::new();

        for event in events {
            let permit = semaphore
                .clone()
                .acquire_owned()
                .await
                .map_err(|_| AppError::Internal(anyhow::anyhow!("Semaphore closed")))?;
            let worker = self.clone();

            join_set.spawn(async move {
                let _permit = permit;
                let event_type = event.event_type.clone();
                let result = worker.process_event(&event).await;
                (event.id, event_type, result)
            });
        }

        while let Some(joined) = join_set.join_next().await {
            match joined {
                Ok((event_id, event_type, Err(e))) => {
                    let safe_error = delivery_error_kind(&e);
                    warn!(
                        event_id = %event_id,
                        event_type = %event_type.as_str(),
                        error = %safe_error,
                        "Failed to process outbox event"
                    );
                }
                Ok((_event_id, _event_type, Ok(()))) => {}
                Err(join_err) => {
                    // Escalate task join errors to error level - these indicate
                    // panics or other serious issues that need immediate attention
                    error!(
                        cancelled = join_err.is_cancelled(),
                        panicked = join_err.is_panic(),
                        "Outbox worker task panicked or was cancelled"
                    );
                }
            }
        }

        self.record_queue_counts().await;
        Ok(())
    }

    /// Update queue gauges without failing the worker if metric collection fails.
    async fn record_queue_counts(&self) {
        match (
            self.outbox_repo.count_pending().await,
            self.outbox_repo.count_failed().await,
        ) {
            (Ok(pending), Ok(failed)) => set_outbox_queue_counts(pending, failed),
            (pending, failed) => warn!(
                pending_failed = pending.is_err(),
                failed_count_failed = failed.is_err(),
                "Failed to record outbox queue metrics"
            ),
        }
    }

    /// Process a single event
    async fn process_event(&self, event: &OutboxEvent) -> Result<(), AppError> {
        // Check idempotency BEFORE mark_processing to prevent events
        // getting stuck in Processing state if crash occurs after mark_processing
        if event.delivered_at.is_some() {
            debug!(
                event_id = %event.id,
                event_type = %event.event_type.as_str(),
                "Skipping already-delivered event"
            );
            self.outbox_repo.mark_done(event.id).await?;
            return Ok(());
        }

        // Mark as processing (now safe - we know it needs processing)
        if !self.outbox_repo.mark_processing(event).await? {
            debug!(event_id = %event.id, "Skipping superseded outbox claim");
            return Ok(());
        }
        let current_attempts = event.attempts.saturating_add(1);
        let delivery_context = EmailDeliveryContext::for_outbox(event.id, current_attempts);
        log_delivery_attempt(event, &delivery_context);

        match self.deliver_event(event, &delivery_context).await {
            Ok(receipt) => {
                self.acknowledge_delivery(event, &delivery_context, receipt)
                    .await?
            }
            Err(error) => {
                return self
                    .handle_delivery_failure(event, current_attempts, error)
                    .await
            }
        }

        Ok(())
    }

    async fn deliver_event(
        &self,
        event: &OutboxEvent,
        context: &EmailDeliveryContext,
    ) -> Result<EmailDeliveryReceipt, AppError> {
        let timeout = Duration::from_secs(self.config.delivery_timeout_secs);
        let result = if event.event_type.is_email() {
            tokio::time::timeout(
                timeout,
                process_email_event(
                    event,
                    self.email_service.as_ref(),
                    context,
                    &self.base_url,
                    &self.token_cipher,
                    self.settings_service.clone(),
                ),
            )
            .await
        } else {
            tokio::time::timeout(timeout, async {
                process_notification_event(event, self.notification_service.as_ref())
                    .await
                    .map(|_| EmailDeliveryReceipt::default())
            })
            .await
        };
        result.map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Delivery timed out after {}s",
                self.config.delivery_timeout_secs
            ))
        })?
    }

    async fn handle_delivery_failure(
        &self,
        event: &OutboxEvent,
        current_attempts: u32,
        error: AppError,
    ) -> Result<(), AppError> {
        let safe_error = delivery_error_kind(&error);
        if current_attempts < event.max_attempts {
            self.outbox_repo.mark_retry(event, safe_error).await?;
            debug!(
                event_id = %event.id,
                event_type = %event.event_type.as_str(),
                attempts = current_attempts,
                error = %safe_error,
                "Outbox event scheduled for retry"
            );
            return Err(error);
        }

        self.outbox_repo.mark_failed(event, safe_error).await?;
        error!(
            event_id = %event.id,
            event_type = %event.event_type.as_str(),
            attempts = current_attempts,
            error = %safe_error,
            "Outbox event permanently failed"
        );
        let alert = AdminNotification::new(
            NotificationSeverity::Critical,
            "Outbox Event Failed",
            &format!(
                "Event {} ({}) failed after {} attempts: {}",
                event.id,
                event.event_type.as_str(),
                current_attempts,
                safe_error
            ),
        );
        let _ = self.notification_service.notify(alert).await;
        Err(error)
    }

    async fn acknowledge_delivery(
        &self,
        event: &OutboxEvent,
        context: &EmailDeliveryContext,
        receipt: EmailDeliveryReceipt,
    ) -> Result<(), AppError> {
        const DB_OP_TIMEOUT: Duration = Duration::from_secs(5);
        let provider_message_id = receipt.provider_message_id.as_deref();
        info!(
            event_id = %event.id,
            delivery_id = %context.delivery_id,
            attempt = context.attempt,
            duplicate_risk = context.duplicate_risk,
            provider_message_id = provider_message_id.unwrap_or("unavailable"),
            "Outbox provider accepted delivery"
        );

        let acknowledgement = tokio::time::timeout(
            DB_OP_TIMEOUT,
            self.outbox_repo
                .mark_delivered_with_receipt(event.id, provider_message_id),
        )
        .await;
        match acknowledgement {
            Ok(Ok(())) => {}
            Ok(Err(error)) => {
                warn_ack_failure(event, context, provider_message_id, "repository_error");
                return Err(error);
            }
            Err(_) => {
                warn_ack_failure(event, context, provider_message_id, "timeout");
                return Err(AppError::Internal(anyhow::anyhow!(
                    "Timeout acknowledging delivery for event {}",
                    event.id
                )));
            }
        }

        tokio::time::timeout(DB_OP_TIMEOUT, self.outbox_repo.mark_done(event.id))
            .await
            .map_err(|_| {
                AppError::Internal(anyhow::anyhow!(
                    "Timeout marking event {} as done",
                    event.id
                ))
            })??;
        debug!(event_id = %event.id, "Outbox event acknowledged successfully");
        Ok(())
    }
}

fn log_delivery_attempt(event: &OutboxEvent, context: &EmailDeliveryContext) {
    info!(
        event_id = %event.id,
        event_type = %event.event_type.as_str(),
        delivery_id = %context.delivery_id,
        attempt = context.attempt,
        duplicate_risk = context.duplicate_risk,
        "Attempting outbox delivery"
    );
}

fn warn_ack_failure(
    event: &OutboxEvent,
    context: &EmailDeliveryContext,
    provider_message_id: Option<&str>,
    cause: &str,
) {
    warn!(
        event_id = %event.id,
        delivery_id = %context.delivery_id,
        attempt = context.attempt,
        duplicate_risk_on_retry = true,
        provider_message_id = provider_message_id.unwrap_or("unavailable"),
        cause,
        "Provider accepted delivery but local acknowledgement failed"
    );
}
