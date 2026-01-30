//! Micro batch worker for batching SOL micro deposits into Jupiter swaps
//!
//! Polls for pending micro deposits and batches them when the accumulated
//! value reaches the configured threshold (default: $10 = Jupiter minimum).
//!
//! # Configuration
//!
//! Runtime-tunable settings via SettingsService:
//! - `micro_batch_threshold_usd`: Minimum USD value before batch swap (default: 10)
//! - `micro_batch_poll_secs`: Poll interval in seconds (default: 300)
//!
//! # Flow
//!
//! 1. Poll for PendingBatch micro deposits
//! 2. Sum total lamports, convert to USD
//! 3. If >= threshold, fetch treasury config
//! 4. Decrypt treasury private key
//! 5. Get Jupiter swap quote (SOL → company currency)
//! 6. Sign transaction with treasury key
//! 7. Execute via Jupiter Ultra
//! 8. Mark deposits as Batched

use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use std::sync::Arc;
use std::time::Duration;
use tokio::task::JoinHandle;
use tokio_util::sync::CancellationToken;
use tracing::{debug, error, info};
use uuid::Uuid;
use zeroize::Zeroize;

use crate::errors::AppError;
use crate::repositories::{DepositRepository, TreasuryConfigRepository};
use crate::services::{
    NoteEncryptionService, PrivacySidecarClient, SettingsService, SolPriceService, NOTE_NONCE_SIZE,
};

/// Default poll interval (5 minutes)
const DEFAULT_POLL_SECS: u64 = 300;
/// Default batch threshold ($10 = Jupiter minimum)
const DEFAULT_THRESHOLD_USD: f64 = 10.0;
/// Lamports per SOL
const LAMPORTS_PER_SOL: f64 = 1_000_000_000.0;

/// Micro batch worker for processing accumulated SOL micro deposits
pub struct MicroBatchWorker {
    deposit_repo: Arc<dyn DepositRepository>,
    treasury_repo: Arc<dyn TreasuryConfigRepository>,
    sidecar_client: Arc<PrivacySidecarClient>,
    sol_price_service: Arc<SolPriceService>,
    note_encryption: Arc<NoteEncryptionService>,
    settings_service: Arc<SettingsService>,
    /// Company's preferred currency (e.g., "USDC")
    company_currency: String,
}

impl MicroBatchWorker {
    /// Create a new micro batch worker
    pub fn new(
        deposit_repo: Arc<dyn DepositRepository>,
        treasury_repo: Arc<dyn TreasuryConfigRepository>,
        sidecar_client: Arc<PrivacySidecarClient>,
        sol_price_service: Arc<SolPriceService>,
        note_encryption: Arc<NoteEncryptionService>,
        settings_service: Arc<SettingsService>,
        company_currency: String,
    ) -> Self {
        Self {
            deposit_repo,
            treasury_repo,
            sidecar_client,
            sol_price_service,
            note_encryption,
            settings_service,
            company_currency,
        }
    }

    /// Get poll interval from settings (with fallback default)
    async fn get_poll_interval(&self) -> u64 {
        self.settings_service
            .get_u64("micro_batch_poll_secs")
            .await
            .ok()
            .flatten()
            .unwrap_or(DEFAULT_POLL_SECS)
    }

    /// Get batch threshold in USD from settings (with fallback default)
    async fn get_threshold_usd(&self) -> f64 {
        self.settings_service
            .get_u64("micro_batch_threshold_usd")
            .await
            .ok()
            .flatten()
            .map(|v| v as f64)
            .unwrap_or(DEFAULT_THRESHOLD_USD)
    }

    /// Start the worker as a background task with graceful shutdown support
    pub fn start(self, cancel_token: CancellationToken) -> JoinHandle<()> {
        tokio::spawn(async move {
            let poll_interval = self.get_poll_interval().await;
            info!(
                poll_interval = poll_interval,
                "Micro batch worker started (settings from DB)"
            );

            let mut interval = tokio::time::interval(Duration::from_secs(poll_interval));
            let mut current_poll_interval = poll_interval;

            loop {
                tokio::select! {
                    _ = cancel_token.cancelled() => {
                        info!("Micro batch worker shutting down gracefully");
                        break;
                    }
                    _ = interval.tick() => {
                        // Check if poll interval changed
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
                            error!(error = %e, "Failed to process micro batch");
                        }
                    }
                }
            }

            info!("Micro batch worker stopped");
        })
    }

    /// Process pending micro deposits if threshold is reached
    async fn process_batch(&self) -> Result<(), AppError> {
        // Get total pending lamports
        let total_lamports = self.deposit_repo.sum_pending_batch_lamports().await?;
        if total_lamports == 0 {
            debug!("No pending micro deposits");
            return Ok(());
        }

        // Get current SOL price
        let sol_price_usd = self.sol_price_service.get_sol_price_usd().await?;
        let total_sol = total_lamports as f64 / LAMPORTS_PER_SOL;
        let total_usd = total_sol * sol_price_usd;

        // Check threshold
        let threshold_usd = self.get_threshold_usd().await;
        if total_usd < threshold_usd {
            debug!(
                total_lamports,
                total_usd, threshold_usd, "Pending batch below threshold, skipping"
            );
            return Ok(());
        }

        info!(
            total_lamports,
            total_usd, threshold_usd, "Batch threshold reached, executing swap"
        );

        // Get treasury config (global fallback)
        let treasury = self
            .treasury_repo
            .find_for_org(None)
            .await?
            .ok_or_else(|| AppError::Config("No treasury configured for micro deposits".into()))?;

        // Decrypt treasury private key
        let mut private_key = self.decrypt_treasury_key(&treasury.encrypted_private_key)?;

        // Execute the batch swap via sidecar
        let result = self
            .execute_batch_swap(total_lamports as u64, &private_key)
            .await;

        // Zeroize private key immediately
        private_key.zeroize();

        // Handle result
        let (tx_signature, output_amount) = result?;

        // Get deposit IDs to mark as batched
        let deposits = self.deposit_repo.get_pending_batch_deposits().await?;
        let deposit_ids: Vec<Uuid> = deposits.iter().map(|d| d.id).collect();

        // Mark deposits as batched
        let batch_id = Uuid::new_v4();
        self.deposit_repo
            .mark_batch_complete(&deposit_ids, batch_id, &tx_signature)
            .await?;

        info!(
            batch_id = %batch_id,
            deposit_count = deposit_ids.len(),
            tx_signature = %tx_signature,
            input_lamports = total_lamports,
            output_amount,
            "Micro batch swap completed"
        );

        Ok(())
    }

    /// Decrypt treasury private key from stored encrypted value
    fn decrypt_treasury_key(&self, encrypted: &str) -> Result<String, AppError> {
        // Decode base64
        let combined = BASE64.decode(encrypted).map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Invalid treasury key encoding: {}", e))
        })?;

        // Split nonce and ciphertext
        if combined.len() < NOTE_NONCE_SIZE {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Treasury key too short"
            )));
        }

        let nonce = &combined[..NOTE_NONCE_SIZE];
        let ciphertext = &combined[NOTE_NONCE_SIZE..];

        // Decrypt
        let plaintext = self.note_encryption.decrypt(nonce, ciphertext)?;

        // Convert to string (should be base58 encoded keypair)
        String::from_utf8(plaintext)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid treasury key format: {}", e)))
    }

    /// Execute a batch swap via the sidecar (Jupiter)
    ///
    /// Returns (tx_signature, output_amount)
    async fn execute_batch_swap(
        &self,
        amount_lamports: u64,
        private_key: &str,
    ) -> Result<(String, i64), AppError> {
        // Call sidecar to execute the swap
        let result = self
            .sidecar_client
            .batch_swap(private_key, amount_lamports, &self.company_currency)
            .await?;

        if !result.success {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Batch swap failed: {}",
                result.error.unwrap_or_else(|| "Unknown error".to_string())
            )));
        }

        let output_amount: i64 = result
            .output_amount
            .parse()
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid output amount: {}", e)))?;

        info!(
            tx_signature = %result.tx_signature,
            input_lamports = amount_lamports,
            output_amount,
            output_currency = %result.output_currency,
            "Batch swap executed successfully"
        );

        Ok((result.tx_signature, output_amount))
    }
}
