//! Shared payout transfer logic for referral payouts.
//!
//! Used by both the admin handler (manual process) and the automated payout worker.

use std::sync::Arc;

use crate::errors::AppError;
use crate::services::{NoteEncryptionService, PrivacySidecarClient};

/// Well-known SPL mint addresses
pub const USDC_MINT: &str = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
pub const USDT_MINT: &str = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

/// Execute a single payout transfer via the privacy sidecar.
///
/// Dispatches SOL or SPL transfer depending on currency.
/// Returns the on-chain transaction signature on success.
pub async fn execute_transfer(
    sidecar: &PrivacySidecarClient,
    private_key: &str,
    destination: &str,
    currency: &str,
    amount: i64,
) -> Result<String, AppError> {
    if amount <= 0 {
        return Err(AppError::Validation(
            "Transfer amount must be positive".into(),
        ));
    }

    let resp = match currency.to_uppercase().as_str() {
        "SOL" => {
            sidecar
                .transfer_sol(private_key, destination, amount as u64)
                .await?
        }
        "USDC" => {
            sidecar
                .transfer_spl(private_key, destination, USDC_MINT, &amount.to_string())
                .await?
        }
        "USDT" => {
            sidecar
                .transfer_spl(private_key, destination, USDT_MINT, &amount.to_string())
                .await?
        }
        "USD" => {
            // Default USD to USDC
            sidecar
                .transfer_spl(private_key, destination, USDC_MINT, &amount.to_string())
                .await?
        }
        other => {
            return Err(AppError::Validation(format!(
                "Unsupported payout currency: {}",
                other
            )));
        }
    };

    Ok(resp.tx_signature)
}

/// Decrypt the treasury private key from encrypted storage.
///
/// Returns the private key as a UTF-8 string.
pub fn decrypt_treasury_key(
    note_encryption: &NoteEncryptionService,
    encrypted_private_key: &str,
) -> Result<String, AppError> {
    let private_key_bytes = crate::services::decrypt_base64_payload(
        note_encryption,
        encrypted_private_key,
        "Failed to decode treasury private key",
        "Treasury private key payload too short",
    )?;
    String::from_utf8(private_key_bytes)
        .map_err(|_| AppError::Internal(anyhow::anyhow!("Treasury private key is not valid UTF-8")))
}

/// Resolve sidecar and note encryption services from optional Arc references.
///
/// Returns an error if either is not configured.
pub fn resolve_payout_services(
    sidecar: &Option<Arc<PrivacySidecarClient>>,
    note_encryption: &Option<Arc<NoteEncryptionService>>,
) -> Result<(Arc<PrivacySidecarClient>, Arc<NoteEncryptionService>), AppError> {
    let sidecar = sidecar
        .as_ref()
        .ok_or_else(|| AppError::Config("Privacy sidecar not configured".into()))?
        .clone();
    let note_encryption = note_encryption
        .as_ref()
        .ok_or_else(|| AppError::Config("Note encryption not configured".into()))?
        .clone();
    Ok((sidecar, note_encryption))
}
