//! Outbox worker for processing async email and notification delivery
//!
//! # Idempotency
//!
//! The worker uses a `delivered_at` timestamp to ensure at-most-once delivery.
//! When processing an event:
//! 1. If `delivered_at` is already set, skip sending and mark done
//! 2. After successful send, set `delivered_at` before marking done
//! 3. If crash occurs between send and mark_done, retry will see `delivered_at`
//!    is set and skip re-sending
//!
//! This protects against duplicate deliveries in crash scenarios.

mod config;
mod email_handlers;
mod notification_handlers;

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
use crate::services::{AdminNotification, EmailService, NotificationService, NotificationSeverity};
use crate::utils::TokenCipher;

use email_handlers::process_email_event;
use notification_handlers::process_notification_event;

/// Sanitize error message for safe logging (truncate and redact potential PII)
fn sanitize_error_for_log(error: &str) -> String {
    const MAX_LEN: usize = 150;

    // Truncate first
    let truncated = if error.chars().count() > MAX_LEN {
        let mut value: String = error.chars().take(MAX_LEN).collect();
        value.push_str("...(truncated)");
        value
    } else {
        error.to_string()
    };

    // Simple email pattern redaction (look for @ followed by common patterns)
    let mut result = String::with_capacity(truncated.len());
    let mut i = 0;
    // S-33: Collects into Vec<char> for random-access indexing. The input is
    // capped at 500 chars (truncated above), so the allocation is negligible.
    let chars: Vec<char> = truncated.chars().collect();

    while i < chars.len() {
        if chars[i] == '@' && i > 0 {
            // Found @, redact backwards to whitespace/punctuation and forwards to whitespace
            let start = result
                .rfind(|c: char| c.is_whitespace() || c == '"' || c == '<' || c == '\'')
                .map(|p| p + 1)
                .unwrap_or(0);
            result.truncate(start);
            result.push_str("[REDACTED]");
            // Skip forward past the domain
            while i < chars.len()
                && !chars[i].is_whitespace()
                && chars[i] != '>'
                && chars[i] != '"'
                && chars[i] != '\''
            {
                i += 1;
            }
        } else {
            result.push(chars[i]);
            i += 1;
        }
    }

    result
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
        }
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
        let events = self
            .outbox_repo
            .fetch_pending(self.config.batch_size, self.config.lock_timeout_secs)
            .await?;

        if events.is_empty() {
            return Ok(());
        }

        debug!(count = events.len(), "Processing outbox events");

        // MAINT-04: MAX_CONCURRENCY is hardcoded; consider making configurable via
        // OutboxWorkerConfig for environments with different resource constraints.
        // Higher values improve throughput but increase memory/connection usage.
        const MAX_CONCURRENCY: usize = 8;
        // S-26: events.len() is guaranteed > 0 here (checked above), so .max(1) was dead code.
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
                    let safe_error = sanitize_error_for_log(&e.to_string());
                    warn!(
                        event_id = %event_id,
                        event_type = %event_type.as_str(),
                        error = %safe_error,
                        "Failed to process outbox event"
                    );
                }
                Ok((_event_id, _event_type, Ok(()))) => {}
                Err(join_err) => {
                    // REL-006: Escalate task join errors to error level - these indicate
                    // panics or other serious issues that need immediate attention
                    error!(error = %join_err, "Outbox worker task panicked or was cancelled");
                }
            }
        }

        Ok(())
    }

    /// Process a single event
    async fn process_event(&self, event: &OutboxEvent) -> Result<(), AppError> {
        // REL-004: Check idempotency BEFORE mark_processing to prevent events
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
        self.outbox_repo.mark_processing(event.id).await?;
        let current_attempts = event.attempts.saturating_add(1);

        // Process based on type with timeout to prevent stuck workers
        let delivery_timeout = Duration::from_secs(self.config.delivery_timeout_secs);
        let result = if event.event_type.is_email() {
            tokio::time::timeout(
                delivery_timeout,
                process_email_event(
                    event,
                    self.email_service.as_ref(),
                    &self.base_url,
                    &self.token_cipher,
                ),
            )
            .await
        } else {
            tokio::time::timeout(
                delivery_timeout,
                process_notification_event(event, self.notification_service.as_ref()),
            )
            .await
        }
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Delivery timed out after {}s",
                self.config.delivery_timeout_secs
            ))
        })?;

        match result {
            Ok(()) => {
                // REL-005: Add timeout to post-delivery DB ops to prevent worker hanging
                const DB_OP_TIMEOUT: Duration = Duration::from_secs(5);

                // Mark as delivered first (idempotency protection)
                tokio::time::timeout(DB_OP_TIMEOUT, self.outbox_repo.mark_delivered(event.id))
                    .await
                    .map_err(|_| {
                        AppError::Internal(anyhow::anyhow!(
                            "Timeout marking event {} as delivered",
                            event.id
                        ))
                    })??;

                // Then mark as done
                tokio::time::timeout(DB_OP_TIMEOUT, self.outbox_repo.mark_done(event.id))
                    .await
                    .map_err(|_| {
                        AppError::Internal(anyhow::anyhow!(
                            "Timeout marking event {} as done",
                            event.id
                        ))
                    })??;

                debug!(
                    event_id = %event.id,
                    event_type = %event.event_type.as_str(),
                    "Outbox event processed successfully"
                );
            }
            Err(e) => {
                let error_msg = e.to_string();
                // Sanitize for logging/notifications to prevent PII leakage
                let safe_error = sanitize_error_for_log(&error_msg);

                // Check if we should retry or fail permanently
                if current_attempts >= event.max_attempts {
                    // Store full error in DB (not exposed in logs)
                    self.outbox_repo.mark_failed(event.id, &error_msg).await?;
                    error!(
                        event_id = %event.id,
                        event_type = %event.event_type.as_str(),
                        attempts = current_attempts,
                        error = %safe_error,
                        "Outbox event permanently failed"
                    );

                    // Send critical alert for permanent failures (with sanitized error)
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
                } else {
                    // Store full error in DB (not exposed in logs)
                    self.outbox_repo.mark_retry(event.id, &error_msg).await?;
                    debug!(
                        event_id = %event.id,
                        event_type = %event.event_type.as_str(),
                        attempts = event.attempts,
                        error = %safe_error,
                        "Outbox event scheduled for retry"
                    );
                }

                return Err(e);
            }
        }

        Ok(())
    }
}
