//! Automated referral payout worker
//!
//! Polls for pending referral payouts and processes them on-chain.
//! Controlled by runtime-tunable settings:
//! - `payout_auto_enabled`: whether the worker processes payouts
//! - `payout_poll_interval_secs`: polling interval (default: 3600)
//! - `payout_batch_size`: max payouts per cycle (default: 50)

use std::sync::Arc;
use std::time::Duration;
use tokio::task::JoinHandle;
use tokio_util::sync::CancellationToken;
use tracing::{debug, error, info, warn};

use crate::errors::AppError;
use crate::repositories::{ReferralPayoutRepository, TreasuryConfigRepository};
use crate::services::payout_transfer::{decrypt_treasury_key, execute_transfer};
use crate::services::{NoteEncryptionService, PrivacySidecarClient, SettingsService};

mod defaults {
    pub const POLL_INTERVAL_SECS: u64 = 3600;
    pub const BATCH_SIZE: u32 = 50;
}

/// Background worker that processes pending referral payouts automatically
pub struct ReferralPayoutWorker {
    referral_payout_repo: Arc<dyn ReferralPayoutRepository>,
    treasury_config_repo: Arc<dyn TreasuryConfigRepository>,
    sidecar: Arc<PrivacySidecarClient>,
    note_encryption: Arc<NoteEncryptionService>,
    settings_service: Arc<SettingsService>,
}

impl ReferralPayoutWorker {
    pub fn new(
        referral_payout_repo: Arc<dyn ReferralPayoutRepository>,
        treasury_config_repo: Arc<dyn TreasuryConfigRepository>,
        sidecar: Arc<PrivacySidecarClient>,
        note_encryption: Arc<NoteEncryptionService>,
        settings_service: Arc<SettingsService>,
    ) -> Self {
        Self {
            referral_payout_repo,
            treasury_config_repo,
            sidecar,
            note_encryption,
            settings_service,
        }
    }

    async fn get_poll_interval(&self) -> u64 {
        self.settings_service
            .get_u64("payout_poll_interval_secs")
            .await
            .ok()
            .flatten()
            .unwrap_or(defaults::POLL_INTERVAL_SECS)
    }

    async fn get_batch_size(&self) -> u32 {
        self.settings_service
            .get_u32("payout_batch_size")
            .await
            .ok()
            .flatten()
            .unwrap_or(defaults::BATCH_SIZE)
    }

    async fn is_auto_enabled(&self) -> bool {
        self.settings_service
            .get("payout_auto_enabled")
            .await
            .ok()
            .flatten()
            .map(|v| v == "true")
            .unwrap_or(false)
    }

    async fn is_direct_payout_mode(&self) -> bool {
        self.settings_service
            .get("referral_reward_type")
            .await
            .ok()
            .flatten()
            .map(|v| v == "direct_payout")
            .unwrap_or(false)
    }

    /// Start the worker as a background task with graceful shutdown support
    pub fn start(self, cancel_token: CancellationToken) -> JoinHandle<()> {
        tokio::spawn(async move {
            let poll_interval = self.get_poll_interval().await;
            info!(
                poll_interval = poll_interval,
                "Referral payout worker started"
            );

            let mut interval = tokio::time::interval(Duration::from_secs(poll_interval));
            let mut current_poll_interval = poll_interval;

            loop {
                tokio::select! {
                    _ = cancel_token.cancelled() => {
                        info!("Referral payout worker shutting down gracefully");
                        break;
                    }
                    _ = interval.tick() => {
                        // Check if poll interval changed
                        let new_poll_interval = self.get_poll_interval().await;
                        if new_poll_interval != current_poll_interval {
                            info!(
                                old_interval = current_poll_interval,
                                new_interval = new_poll_interval,
                                "Payout poll interval changed, updating timer"
                            );
                            interval = tokio::time::interval(
                                Duration::from_secs(new_poll_interval),
                            );
                            current_poll_interval = new_poll_interval;
                        }

                        if let Err(e) = self.process_batch().await {
                            error!(error = %e, "Failed to process referral payout batch");
                        }
                    }
                }
            }

            info!("Referral payout worker stopped");
        })
    }

    /// Process a batch of pending referral payouts
    async fn process_batch(&self) -> Result<(), AppError> {
        // Check auto-enabled flag
        if !self.is_auto_enabled().await {
            debug!("Payout auto-processing is disabled, skipping");
            return Ok(());
        }

        // Only process when in direct_payout mode
        if !self.is_direct_payout_mode().await {
            debug!("Reward type is not direct_payout, skipping");
            return Ok(());
        }

        let batch_size = self.get_batch_size().await;

        // Fetch pending referrer summaries
        let summaries = self
            .referral_payout_repo
            .pending_by_referrer(batch_size, 0)
            .await?;

        if summaries.is_empty() {
            return Ok(());
        }

        // Decrypt treasury private key
        let treasury = self
            .treasury_config_repo
            .find_global()
            .await?
            .ok_or_else(|| AppError::NotFound("No global treasury configured".into()))?;

        let private_key =
            decrypt_treasury_key(&self.note_encryption, &treasury.encrypted_private_key)?;

        let mut processed: u64 = 0;
        let mut failed: u64 = 0;

        for summary in &summaries {
            let dest = match &summary.payout_wallet_address {
                Some(addr) => addr.clone(),
                None => {
                    debug!(
                        referrer_id = %summary.referrer_id,
                        "Skipping referrer with no payout wallet"
                    );
                    continue;
                }
            };

            // Fetch individual pending payouts for this referrer
            let payouts = self
                .referral_payout_repo
                .list_pending(500, 0)
                .await?
                .into_iter()
                .filter(|p| p.referrer_id == summary.referrer_id && p.currency == summary.currency)
                .collect::<Vec<_>>();

            let all_ids: Vec<uuid::Uuid> = payouts.iter().map(|p| p.id).collect();

            // Atomically claim pending payouts → prevents handler/worker race
            let claimed_ids = self
                .referral_payout_repo
                .claim_for_processing(&all_ids)
                .await?;

            if claimed_ids.is_empty() {
                continue; // Another process already claimed them
            }

            let amount_sum: i64 = payouts
                .iter()
                .filter(|p| claimed_ids.contains(&p.id))
                .map(|p| p.amount)
                .sum();

            if amount_sum <= 0 {
                warn!(
                    referrer_id = %summary.referrer_id,
                    amount_sum = amount_sum,
                    "Skipping payout: aggregated amount is zero or negative"
                );
                for id in &claimed_ids {
                    let _ = self
                        .referral_payout_repo
                        .mark_failed(*id, "zero amount")
                        .await;
                }
                continue;
            }

            let tx_result = execute_transfer(
                &self.sidecar,
                &private_key,
                &dest,
                &summary.currency,
                amount_sum,
            )
            .await;

            match tx_result {
                Ok(tx_sig) => {
                    for id in &claimed_ids {
                        if let Err(e) = self.referral_payout_repo.mark_completed(*id, &tx_sig).await
                        {
                            error!(payout_id = %id, error = %e, "Failed to mark payout completed");
                        }
                    }
                    processed += claimed_ids.len() as u64;
                    info!(
                        referrer_id = %summary.referrer_id,
                        amount = amount_sum,
                        currency = %summary.currency,
                        tx_sig = %tx_sig,
                        "Auto-processed referral payout"
                    );
                }
                Err(e) => {
                    let err_str = e.to_string();
                    error!(
                        referrer_id = %summary.referrer_id,
                        error = %err_str,
                        "Auto-payout failed"
                    );
                    for id in &claimed_ids {
                        if let Err(e) = self.referral_payout_repo.mark_failed(*id, &err_str).await {
                            error!(payout_id = %id, error = %e, "Failed to mark payout failed");
                        }
                    }
                    failed += claimed_ids.len() as u64;
                }
            }
        }

        if processed > 0 || failed > 0 {
            info!(
                processed = processed,
                failed = failed,
                "Referral payout batch complete"
            );
        }

        Ok(())
    }
}
