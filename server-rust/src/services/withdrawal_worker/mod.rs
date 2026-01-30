//! Withdrawal worker for processing Privacy Cash withdrawals
//!
//! Polls for completed deposits where the privacy period has elapsed,
//! then withdraws funds from user's Privacy Cash account to company wallet.
//!
//! # Configuration
//!
//! Runtime-tunable settings are read from the database via SettingsService:
//! - `withdrawal_poll_interval_secs`: How often to poll (default: 3600)
//! - `withdrawal_batch_size`: Max withdrawals per cycle (default: 10)
//! - `withdrawal_timeout_secs`: Transaction timeout (default: 120)
//! - `withdrawal_max_retries`: Retry attempts (default: 3)
//! - `withdrawal_percentage`: % of ready funds per cycle (default: 100)
//! - `withdrawal_min_lamports`: Min amount to withdraw (default: 1000000000 = 1 SOL)
//! - `partial_withdrawal_count`: Max partial withdrawals (default: 0)
//! - `partial_withdrawal_min_lamports`: Min balance for partial (default: 500000000)
//!
//! # Security
//!
//! - User's private key is decrypted from stored encrypted value
//! - Encrypted private key is cleared from deposit session after successful withdrawal
//! - All secrets are zeroized after use

mod config;

pub use config::WithdrawalWorkerConfig;

use rand::seq::SliceRandom;
use std::sync::Arc;
use std::time::Duration;
use tokio::task::JoinHandle;
use tokio_util::sync::CancellationToken;
use tracing::{debug, error, info, warn};
use zeroize::Zeroize;

use crate::errors::AppError;
use crate::repositories::{
    DepositRepository, DepositSessionEntity, DepositStatus, WithdrawalHistoryEntry,
    WithdrawalHistoryRepository,
};
use crate::services::{
    AdminNotification, NoteEncryptionService, NotificationService, NotificationSeverity,
    PrivacySidecarClient, SettingsService, NOTE_NONCE_SIZE,
};

/// Default values used when settings are missing from the database
mod defaults {
    pub const POLL_INTERVAL_SECS: u64 = 3600;
    pub const BATCH_SIZE: u32 = 10;
    pub const TIMEOUT_SECS: u64 = 120;
    pub const MAX_RETRIES: u32 = 3;
    pub const WITHDRAWAL_PERCENTAGE: u8 = 100;
    pub const PARTIAL_COUNT: u8 = 0;
    pub const PARTIAL_MIN_LAMPORTS: u64 = 500_000_000;
    /// Minimum withdrawal amount (1 SOL) - skip smaller withdrawals to avoid wasting fees
    /// Fees are ~0.006 SOL + 0.35% + Jupiter, so at 1 SOL fees are ~1%
    pub const MIN_LAMPORTS: u64 = 1_000_000_000;
}

/// Withdrawal worker that processes Privacy Cash withdrawals
#[derive(Clone)]
pub struct WithdrawalWorker {
    deposit_repo: Arc<dyn DepositRepository>,
    withdrawal_history_repo: Arc<dyn WithdrawalHistoryRepository>,
    sidecar: Arc<PrivacySidecarClient>,
    note_encryption: Arc<NoteEncryptionService>,
    notification_service: Arc<dyn NotificationService>,
    settings_service: Arc<SettingsService>,
    config: WithdrawalWorkerConfig,
}

impl WithdrawalWorker {
    fn compute_spent_lamports(amount_lamports: i64, fee_lamports: i64) -> Result<i64, AppError> {
        if amount_lamports < 0 {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Negative withdrawal amount from sidecar"
            )));
        }
        if fee_lamports < 0 {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Negative withdrawal fee from sidecar"
            )));
        }

        let spent = (amount_lamports as i128)
            .checked_add(fee_lamports as i128)
            .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Withdrawal amount overflow")))?;

        i64::try_from(spent)
            .map_err(|_| AppError::Internal(anyhow::anyhow!("Withdrawal amount overflow")))
    }

    pub fn new(
        deposit_repo: Arc<dyn DepositRepository>,
        withdrawal_history_repo: Arc<dyn WithdrawalHistoryRepository>,
        sidecar: Arc<PrivacySidecarClient>,
        note_encryption: Arc<NoteEncryptionService>,
        notification_service: Arc<dyn NotificationService>,
        settings_service: Arc<SettingsService>,
        config: WithdrawalWorkerConfig,
    ) -> Self {
        Self {
            deposit_repo,
            withdrawal_history_repo,
            sidecar,
            note_encryption,
            notification_service,
            settings_service,
            config,
        }
    }

    /// Get poll interval from settings (with fallback default)
    async fn get_poll_interval(&self) -> u64 {
        self.settings_service
            .get_u64("withdrawal_poll_interval_secs")
            .await
            .ok()
            .flatten()
            .unwrap_or(defaults::POLL_INTERVAL_SECS)
    }

    /// Get batch size from settings (with fallback default)
    async fn get_batch_size(&self) -> u32 {
        self.settings_service
            .get_u32("withdrawal_batch_size")
            .await
            .ok()
            .flatten()
            .unwrap_or(defaults::BATCH_SIZE)
    }

    /// Get timeout from settings (with fallback default)
    async fn get_timeout(&self) -> u64 {
        self.settings_service
            .get_u64("withdrawal_timeout_secs")
            .await
            .ok()
            .flatten()
            .unwrap_or(defaults::TIMEOUT_SECS)
    }

    /// Get max retries from settings (with fallback default)
    async fn get_max_retries(&self) -> u32 {
        self.settings_service
            .get_u32("withdrawal_max_retries")
            .await
            .ok()
            .flatten()
            .unwrap_or(defaults::MAX_RETRIES)
    }

    /// Get withdrawal percentage from settings (with fallback default)
    async fn get_withdrawal_percentage(&self) -> u8 {
        self.settings_service
            .get_u32("withdrawal_percentage")
            .await
            .ok()
            .flatten()
            .map(|v| v.clamp(1, 100) as u8)
            .unwrap_or(defaults::WITHDRAWAL_PERCENTAGE)
    }

    /// Get partial withdrawal count from settings (with fallback default)
    async fn get_partial_count(&self) -> u8 {
        self.settings_service
            .get_u32("partial_withdrawal_count")
            .await
            .ok()
            .flatten()
            .map(|v| v as u8)
            .unwrap_or(defaults::PARTIAL_COUNT)
    }

    /// Get partial withdrawal min lamports from settings (with fallback default)
    async fn get_partial_min_lamports(&self) -> u64 {
        self.settings_service
            .get_u64("partial_withdrawal_min_lamports")
            .await
            .ok()
            .flatten()
            .unwrap_or(defaults::PARTIAL_MIN_LAMPORTS)
    }

    /// Get minimum withdrawal amount from settings (with fallback default)
    /// Withdrawals below this amount are skipped to avoid wasting transaction fees
    async fn get_min_lamports(&self) -> u64 {
        self.settings_service
            .get_u64("withdrawal_min_lamports")
            .await
            .ok()
            .flatten()
            .unwrap_or(defaults::MIN_LAMPORTS)
    }

    /// Start the worker as a background task with graceful shutdown support
    pub fn start(self, cancel_token: CancellationToken) -> JoinHandle<()> {
        tokio::spawn(async move {
            // Read initial poll interval from settings
            let poll_interval = self.get_poll_interval().await;
            info!(
                poll_interval = poll_interval,
                "Withdrawal worker started (settings from DB)"
            );

            let mut interval = tokio::time::interval(Duration::from_secs(poll_interval));
            let mut current_poll_interval = poll_interval;

            loop {
                tokio::select! {
                    _ = cancel_token.cancelled() => {
                        info!("Withdrawal worker shutting down gracefully");
                        break;
                    }
                    _ = interval.tick() => {
                        // Check if poll interval changed and recreate timer if needed
                        let new_poll_interval = self.get_poll_interval().await;
                        if new_poll_interval != current_poll_interval {
                            info!(
                                old_interval = current_poll_interval,
                                new_interval = new_poll_interval,
                                "Poll interval changed, updating timer"
                            );
                            interval = tokio::time::interval(Duration::from_secs(new_poll_interval));
                            current_poll_interval = new_poll_interval;
                        }

                        if let Err(e) = self.process_batch().await {
                            error!(error = %e, "Failed to process withdrawal batch");
                        }
                    }
                }
            }

            info!("Withdrawal worker stopped");
        })
    }

    /// Process a batch of pending withdrawals
    ///
    /// Respects `withdrawal_percentage` setting to limit how much is withdrawn per cycle.
    /// Supports partial withdrawals: up to `partial_withdrawal_count` sessions will
    /// have a random portion withdrawn (30-70%), leaving the rest for future cycles.
    /// Skips withdrawals below `withdrawal_min_lamports` to avoid wasting transaction fees.
    async fn process_batch(&self) -> Result<(), AppError> {
        // Read settings from DB (cached with TTL)
        let batch_size = self.get_batch_size().await;
        let withdrawal_percentage = self.get_withdrawal_percentage().await;
        let partial_count = self.get_partial_count().await as usize;
        let partial_min_lamports = self.get_partial_min_lamports().await as i64;
        let min_lamports = self.get_min_lamports().await as i64;

        let now = chrono::Utc::now();
        let mut sessions = self
            .deposit_repo
            .claim_ready_for_withdrawal(now, batch_size)
            .await?;

        if sessions.is_empty() {
            return Ok(());
        }

        // Filter out sessions with remaining balance below minimum (avoid wasting fees)
        let skipped_count = sessions.len();
        sessions.retain(|s| s.remaining_lamports() >= min_lamports);
        let skipped_count = skipped_count - sessions.len();
        if skipped_count > 0 {
            debug!(
                skipped = skipped_count,
                min_lamports = min_lamports,
                "Skipped withdrawals below minimum amount"
            );
        }

        if sessions.is_empty() {
            return Ok(());
        }

        // Calculate how many to process based on withdrawal percentage
        let pct = withdrawal_percentage.clamp(1, 100) as usize;
        let total_ready = sessions.len();
        let target_count = if pct == 100 {
            sessions.len()
        } else {
            let target = (sessions.len() * pct).div_ceil(100);
            target.clamp(1, sessions.len())
        };

        // Generate random partial percentages before shuffle (RNG not Send)
        // Partial withdrawals withdraw 30-70% of remaining balance
        let partial_percentages: Vec<u8> = {
            use rand::Rng;
            let mut rng = rand::thread_rng();
            (0..partial_count).map(|_| rng.gen_range(30..=70)).collect()
        };

        // Randomly shuffle to prevent deterministic ordering
        {
            let mut rng = rand::thread_rng();
            sessions.shuffle(&mut rng);
        }

        // Take only the target count
        sessions.truncate(target_count);

        // Determine partial vs full for each session
        let mut partial_assigned = 0usize;
        let withdrawal_plans: Vec<_> = sessions
            .iter()
            .map(|session| {
                let remaining = session.remaining_lamports();
                let should_partial = partial_assigned < partial_count
                    && remaining >= partial_min_lamports
                    && partial_count > 0;

                if should_partial {
                    let pct = partial_percentages[partial_assigned];
                    partial_assigned += 1;
                    // Calculate partial amount, ensure at least min_lamports to avoid wasting fees
                    let partial_amount = (remaining * pct as i64 / 100)
                        .max(min_lamports)
                        .min(remaining);
                    (session, partial_amount, true)
                } else {
                    (session, remaining, false)
                }
            })
            .collect();

        info!(
            ready_count = total_ready,
            processing = withdrawal_plans.len(),
            partial_count = partial_assigned,
            percentage = pct,
            "Processing pending withdrawals"
        );

        for (session, amount, is_partial) in withdrawal_plans {
            if let Err(e) = self
                .process_withdrawal(session, amount as u64, is_partial)
                .await
            {
                warn!(
                    session_id = %session.id,
                    user_id = %session.user_id,
                    error = %e,
                    "Failed to process withdrawal"
                );
            }
        }

        Ok(())
    }

    /// Process a single withdrawal
    ///
    /// # Arguments
    /// * `session` - The deposit session to withdraw from
    /// * `amount_lamports` - Amount to withdraw (may be partial)
    /// * `is_partial` - Whether this is a partial withdrawal
    async fn process_withdrawal(
        &self,
        session: &DepositSessionEntity,
        amount_lamports: u64,
        is_partial: bool,
    ) -> Result<(), AppError> {
        let session_id = session.id;
        let user_id = session.user_id;

        // Read timeout and max_retries from settings
        let timeout_secs = self.get_timeout().await;
        let max_retries = self.get_max_retries().await;

        debug!(
            session_id = %session_id,
            user_id = %user_id,
            amount_lamports = amount_lamports,
            is_partial = is_partial,
            "Processing withdrawal"
        );

        // Get encrypted private key from session
        let encrypted_data = session.stored_share_b.as_ref().ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "Session {} missing encrypted private key",
                session_id
            ))
        })?;

        // Decode and decrypt the private key
        use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
        let combined = BASE64.decode(encrypted_data).map_err(|e| {
            AppError::Internal(anyhow::anyhow!(
                "Failed to decode encrypted private key: {}",
                e
            ))
        })?;

        // Split into nonce (12 bytes) and ciphertext
        if combined.len() <= NOTE_NONCE_SIZE {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Invalid encrypted private key format"
            )));
        }

        let nonce = &combined[..NOTE_NONCE_SIZE];
        let ciphertext = &combined[NOTE_NONCE_SIZE..];

        // Decrypt the private key (ciphertext first, then nonce)
        let mut private_key_bytes = self.note_encryption.decrypt(ciphertext, nonce)?;
        let mut private_key = String::from_utf8(private_key_bytes.clone()).map_err(|e| {
            private_key_bytes.zeroize();
            AppError::Internal(anyhow::anyhow!("Invalid private key encoding: {}", e))
        })?;
        private_key_bytes.zeroize();

        // Swap-on-withdraw is not supported by the sidecar.
        // Withdrawals always return SOL to the company wallet; conversion can be handled separately.
        let company_currency = self.config.company_currency.to_uppercase();
        if company_currency != "SOL" {
            warn!(
                company_currency = %self.config.company_currency,
                "Company currency swap on withdrawal not supported; withdrawing SOL"
            );
        }
        let target_currency: Option<&str> = None;

        // Execute withdrawal via sidecar with timeout
        let withdrawal_result = tokio::time::timeout(
            Duration::from_secs(timeout_secs),
            self.sidecar
                .withdraw(&private_key, amount_lamports, target_currency),
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Withdrawal timed out after {}s",
                timeout_secs
            ))
        })?;

        // Zeroize private key immediately
        private_key.zeroize();

        let withdrawal_response = match withdrawal_result {
            Ok(response) => response,
            Err(e) => {
                let error_msg = e.to_string();
                let attempts = session.processing_attempts.saturating_add(1);

                if let Err(update_err) = self
                    .deposit_repo
                    .record_processing_attempt(session_id, Some(&error_msg))
                    .await
                {
                    warn!(
                        session_id = %session_id,
                        error = %update_err,
                        "Failed to record withdrawal attempt"
                    );
                }

                let status = if attempts >= max_retries as i32 {
                    DepositStatus::Failed
                } else {
                    DepositStatus::Completed
                };

                if let Err(update_err) = self
                    .deposit_repo
                    .update_status(session_id, status, Some(error_msg))
                    .await
                {
                    warn!(
                        session_id = %session_id,
                        error = %update_err,
                        "Failed to update withdrawal status"
                    );
                }

                return Err(e);
            }
        };

        // Record the withdrawal (handles partial vs full automatically)
        let withdrawn_amount = Self::compute_spent_lamports(
            withdrawal_response.amount_lamports,
            withdrawal_response.fee_lamports,
        )?;
        let deposit_amount = session.deposit_amount_lamports.unwrap_or(0);
        let previous_withdrawn = session.withdrawn_amount_lamports;
        let cumulative = previous_withdrawn + withdrawn_amount;
        let remaining = (deposit_amount - cumulative).max(0);

        let fully_withdrawn = self
            .deposit_repo
            .record_partial_withdrawal(
                session_id,
                withdrawn_amount,
                &withdrawal_response.tx_signature,
            )
            .await?;

        // Record in withdrawal history for audit trail
        let withdrawal_pct = if is_partial {
            // Calculate what percentage this withdrawal was
            let pct = if deposit_amount > 0 {
                (withdrawn_amount * 100 / deposit_amount) as i16
            } else {
                100
            };
            Some(pct)
        } else {
            Some(100)
        };

        let history_entry = WithdrawalHistoryEntry::new(
            session_id,
            user_id,
            withdrawn_amount,
            withdrawal_response.tx_signature.clone(),
            cumulative,
            remaining,
            fully_withdrawn,
            withdrawal_pct,
        );

        if let Err(e) = self.withdrawal_history_repo.create(history_entry).await {
            // Log but don't fail the withdrawal - the actual withdrawal succeeded
            warn!(
                session_id = %session_id,
                error = %e,
                "Failed to record withdrawal history entry"
            );
        }

        info!(
            session_id = %session_id,
            user_id = %user_id,
            tx_signature = %withdrawal_response.tx_signature,
            requested_lamports = %amount_lamports,
            actual_lamports = %withdrawal_response.amount_lamports,
            fee_lamports = %withdrawal_response.fee_lamports,
            spent_lamports = %withdrawn_amount,
            intentional_partial = %is_partial,
            fully_withdrawn = %fully_withdrawn,
            "Withdrawal completed successfully"
        );

        // Alert on unintentional partial withdrawals (insufficient balance in Privacy Cash)
        // This is different from our intentional partial withdrawals for timing obfuscation
        if withdrawal_response.is_partial && !is_partial {
            let alert = AdminNotification::new(
                NotificationSeverity::Warn,
                "Unexpected Partial Withdrawal",
                &format!(
                    "Session {} for user {} had unexpected partial withdrawal (insufficient balance): \
                    requested {} lamports, withdrew {} lamports",
                    session_id, user_id, amount_lamports, withdrawal_response.amount_lamports
                ),
            );
            let _ = self.notification_service.notify(alert).await;
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::{
        InMemoryDepositRepository, InMemorySystemSettingsRepository,
        InMemoryWithdrawalHistoryRepository,
    };
    use crate::services::LogNotificationService;
    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
    use std::sync::Arc;
    use uuid::Uuid;

    fn build_worker(
        repo: Arc<InMemoryDepositRepository>,
        note_encryption: Arc<NoteEncryptionService>,
        settings_service: Arc<SettingsService>,
    ) -> WithdrawalWorker {
        let sidecar = PrivacySidecarClient::new(crate::services::SidecarClientConfig {
            base_url: "http://127.0.0.1:1".to_string(),
            timeout_ms: 10,
            api_key: "test".to_string(),
        })
        .unwrap();

        WithdrawalWorker::new(
            repo,
            Arc::new(InMemoryWithdrawalHistoryRepository::new()),
            Arc::new(sidecar),
            note_encryption,
            Arc::new(LogNotificationService::new()),
            settings_service,
            WithdrawalWorkerConfig::default(),
        )
    }

    fn build_settings_service() -> Arc<SettingsService> {
        let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
        Arc::new(SettingsService::new(repo))
    }

    fn build_session(note_encryption: &NoteEncryptionService) -> DepositSessionEntity {
        let encrypted = note_encryption.encrypt(b"test-private-key").unwrap();
        let mut combined = encrypted.nonce;
        combined.extend(encrypted.ciphertext);
        let stored_share_b = BASE64.encode(combined);

        DepositSessionEntity::new_privacy_deposit(
            Uuid::new_v4(),
            Uuid::new_v4(),
            "Wallet".to_string(),
            1_000_000_000,
            "tx_sig".to_string(),
            stored_share_b,
            chrono::Utc::now() - chrono::Duration::hours(1),
        )
    }

    #[tokio::test]
    async fn test_settings_defaults() {
        let settings = build_settings_service();
        // Settings should be seeded with defaults
        assert_eq!(
            settings
                .get_u64("withdrawal_poll_interval_secs")
                .await
                .unwrap(),
            Some(3600)
        );
        assert_eq!(
            settings.get_u32("withdrawal_batch_size").await.unwrap(),
            Some(10)
        );
        assert_eq!(
            settings.get_u64("withdrawal_timeout_secs").await.unwrap(),
            Some(120)
        );
        assert_eq!(
            settings.get_u32("withdrawal_max_retries").await.unwrap(),
            Some(3)
        );
    }

    #[test]
    fn test_compute_spent_lamports_includes_fee() {
        let spent = WithdrawalWorker::compute_spent_lamports(100, 7).unwrap();
        assert_eq!(spent, 107);
    }

    #[test]
    fn test_compute_spent_lamports_rejects_negative_fee() {
        assert!(WithdrawalWorker::compute_spent_lamports(100, -1).is_err());
    }

    #[tokio::test]
    async fn test_withdrawal_failure_resets_to_completed_for_retry() {
        let repo = Arc::new(InMemoryDepositRepository::new());
        let note_encryption = Arc::new(NoteEncryptionService::new(&[7u8; 32], "v1").unwrap());
        let settings = build_settings_service();
        let worker = build_worker(repo.clone(), note_encryption.clone(), settings);

        let session = build_session(note_encryption.as_ref());
        let session_id = session.id;
        repo.create(session).await.unwrap();

        let session = repo.find_by_id(session_id).await.unwrap().unwrap();
        let amount = session.remaining_lamports() as u64;
        let result = worker.process_withdrawal(&session, amount, false).await;
        assert!(result.is_err());

        let updated = repo.find_by_id(session_id).await.unwrap().unwrap();
        assert_eq!(updated.status, DepositStatus::Completed);
        assert_eq!(updated.processing_attempts, 1);
        assert!(updated.last_processing_error.is_some());
    }

    #[tokio::test]
    async fn test_withdrawal_failure_marks_failed_after_max_retries() {
        use crate::repositories::{SystemSetting, SystemSettingsRepository};

        let repo = Arc::new(InMemoryDepositRepository::new());
        let note_encryption = Arc::new(NoteEncryptionService::new(&[9u8; 32], "v1").unwrap());

        // Create settings with max_retries = 1
        let settings_repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
        settings_repo
            .upsert(SystemSetting {
                key: "withdrawal_max_retries".to_string(),
                value: "1".to_string(),
                category: "withdrawal".to_string(),
                description: None,
                updated_at: chrono::Utc::now(),
                updated_by: None,
            })
            .await
            .unwrap();
        let settings = Arc::new(SettingsService::new(settings_repo));

        let worker = build_worker(repo.clone(), note_encryption.clone(), settings);

        let session = build_session(note_encryption.as_ref());
        let session_id = session.id;
        repo.create(session).await.unwrap();

        let session = repo.find_by_id(session_id).await.unwrap().unwrap();
        let amount = session.remaining_lamports() as u64;
        let result = worker.process_withdrawal(&session, amount, false).await;
        assert!(result.is_err());

        let updated = repo.find_by_id(session_id).await.unwrap().unwrap();
        assert_eq!(updated.status, DepositStatus::Failed);
        assert_eq!(updated.processing_attempts, 1);
        assert!(updated.last_processing_error.is_some());
    }
}
