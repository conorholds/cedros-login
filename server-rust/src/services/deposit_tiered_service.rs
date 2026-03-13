//! Tiered deposit recording service (public and micro deposits)
//!
//! Records already-completed deposits (public Jupiter swaps and SOL micro
//! transfers) and credits users. These deposits don't use the Privacy Cash
//! sidecar - funds go directly to the company wallet.

use chrono::Utc;
use std::sync::Arc;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    CreditRepository, CreditTransactionEntity, DepositRepository, DepositSessionEntity,
    DepositStatus, DepositType, WalletType,
};
use crate::services::{CreditParams, DepositCreditService};

/// Well-known stablecoin mint addresses
const USDC_MINT: &str = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDT_MINT: &str = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

/// Determine credit currency from token mint.
/// R2-M01: Returns error for unrecognized mints instead of silently defaulting to USD.
fn currency_from_mint(mint: &str) -> Result<&'static str, AppError> {
    match mint {
        USDC_MINT | USDT_MINT => Ok("USD"),
        _ => Err(AppError::Validation(format!(
            "Unsupported token mint for credit currency: {}",
            mint
        ))),
    }
}

/// Result of a public deposit (Jupiter swap to company wallet)
pub struct PublicDepositResult {
    /// Session ID for tracking
    pub session_id: Uuid,
    /// Transaction signature on Solana
    pub tx_signature: String,
    /// Output amount in company currency (smallest unit)
    pub output_amount: i64,
    /// Company currency (e.g., "USDC")
    pub credit_currency: String,
}

/// Result of a SOL micro deposit (direct transfer)
pub struct MicroDepositResult {
    /// Session ID for tracking
    pub session_id: Uuid,
    /// Transaction signature on Solana
    pub tx_signature: String,
    /// Amount in lamports
    pub amount_lamports: i64,
}

/// Service for recording tiered (non-private) deposits
///
/// Unlike DepositService, this doesn't need a Privacy Cash sidecar.
/// It records already-completed on-chain transactions and credits users.
pub struct TieredDepositService {
    deposit_repo: Arc<dyn DepositRepository>,
    credit_repo: Arc<dyn CreditRepository>,
    credit_service: Arc<DepositCreditService>,
}

impl TieredDepositService {
    pub fn new(
        deposit_repo: Arc<dyn DepositRepository>,
        credit_repo: Arc<dyn CreditRepository>,
        credit_service: Arc<DepositCreditService>,
    ) -> Self {
        Self {
            deposit_repo,
            credit_repo,
            credit_service,
        }
    }

    /// Record a public deposit after Jupiter swap execution
    ///
    /// Called after Jupiter `/execute` confirms the swap landed. Credits the user
    /// with the output amount in company currency. No privacy period needed since
    /// funds go directly to company wallet.
    #[allow(clippy::too_many_arguments)]
    pub async fn record_public_deposit(
        &self,
        user_id: Uuid,
        wallet_address: &str,
        tx_signature: &str,
        output_amount: i64,
        company_currency: &str,
        input_mint: Option<&str>,
        input_amount: Option<i64>,
    ) -> Result<PublicDepositResult, AppError> {
        // Validate output amount
        if output_amount <= 0 {
            return Err(AppError::Validation(
                "Output amount must be positive".into(),
            ));
        }

        // C-01: Idempotency — check if this tx_signature was already recorded as a public deposit.
        // The DB also enforces this via a UNIQUE index on (detected_tx_signature, deposit_type),
        // but checking first gives a clean response instead of an internal error.
        if let Some(existing) = self
            .deposit_repo
            .find_by_tx_signature_and_type(tx_signature, DepositType::Public)
            .await?
        {
            tracing::info!(
                session_id = %existing.session_id,
                tx_signature = %tx_signature,
                "Public deposit already recorded (idempotent return)"
            );
            return Ok(PublicDepositResult {
                session_id: existing.session_id,
                tx_signature: tx_signature.to_string(),
                output_amount: existing.deposit_amount_lamports.unwrap_or(output_amount),
                credit_currency: existing.currency,
            });
        }

        let session_id = Uuid::new_v4();
        // R2-M02: Default to "SOL" when input_mint is None (direct SOL deposit)
        let deposit_currency = match input_mint {
            Some(mint) => currency_from_mint(mint)?,
            None => "SOL",
        };

        // Create deposit session (completed immediately, no privacy period)
        let session = DepositSessionEntity {
            id: session_id,
            user_id,
            session_id,
            wallet_address: wallet_address.to_string(),
            wallet_type: WalletType::External,
            deposit_type: DepositType::Public,
            currency: company_currency.to_string(),
            unlock_expires_at: None,
            status: DepositStatus::Withdrawn, // Funds already at company wallet
            detected_amount_lamports: None,
            detected_tx_signature: Some(tx_signature.to_string()),
            detected_at: Some(Utc::now()),
            completed_at: Some(Utc::now()),
            error_message: None,
            expected_message_hash: None,
            expected_message_bytes: None,
            privacy_deposit_tx_signature: Some(tx_signature.to_string()),
            deposit_amount_lamports: Some(output_amount),
            fee_buffer_lamports: None,
            tx_expires_at: None,
            processing_attempts: 0,
            last_processing_error: None,
            last_processing_attempt_at: None,
            created_at: Utc::now(),
            privacy_note_id: None,
            stored_share_b: None,
            withdrawal_available_at: None,
            withdrawal_tx_signature: Some(tx_signature.to_string()),
            input_token_mint: input_mint.map(String::from),
            input_token_amount: input_amount,
            withdrawn_amount_lamports: output_amount,
            batch_id: None,
            batched_at: None,
        };
        // C-02: Handle race condition — if two concurrent requests pass the idempotency
        // check above, the DB UNIQUE index will reject the second insert. Catch that
        // and return the existing session instead of an internal error.
        match self.deposit_repo.create(session).await {
            Ok(_) => {}
            Err(_) => {
                if let Some(existing) = self
                    .deposit_repo
                    .find_by_tx_signature_and_type(tx_signature, DepositType::Public)
                    .await?
                {
                    tracing::info!(
                        session_id = %existing.session_id,
                        tx_signature = %tx_signature,
                        "Public deposit race resolved (returning existing session)"
                    );
                    return Ok(PublicDepositResult {
                        session_id: existing.session_id,
                        tx_signature: tx_signature.to_string(),
                        output_amount: existing.deposit_amount_lamports.unwrap_or(output_amount),
                        credit_currency: existing.currency,
                    });
                }
                return Err(AppError::Internal(anyhow::anyhow!(
                    "Failed to create public deposit session for tx {}",
                    tx_signature
                )));
            }
        }

        // Calculate credit amount (converts to company currency, applies fee policy)
        let credit_result = self
            .credit_service
            .calculate(CreditParams {
                deposit_amount: output_amount,
                deposit_currency: deposit_currency.to_string(),
                has_swap: true,
                has_privacy: false,
            })
            .await?;

        // Credit user immediately (H-06: persist conversion rate)
        let mut credit_tx = CreditTransactionEntity::new_privacy_deposit(
            user_id,
            credit_result.amount,
            &credit_result.currency,
            session_id,
        );
        credit_tx.conversion_rate = credit_result.conversion_rate;
        self.credit_repo
            .add_credit(
                user_id,
                credit_result.amount,
                &credit_result.currency,
                credit_tx,
            )
            .await?;

        tracing::info!(
            session_id = %session_id,
            user_id = %user_id,
            tx_signature = %tx_signature,
            output_amount = %output_amount,
            credit_amount = %credit_result.amount,
            credit_currency = %credit_result.currency,
            fee_deducted = %credit_result.fee_deducted,
            "Public deposit recorded and credited"
        );

        Ok(PublicDepositResult {
            session_id,
            tx_signature: tx_signature.to_string(),
            output_amount,
            credit_currency: credit_result.currency,
        })
    }

    /// Record a SOL micro deposit after direct transfer verification
    ///
    /// Called after verifying a direct SOL transfer to the treasury wallet.
    /// Credits the user immediately. The SOL accumulates until batch threshold
    /// is reached, then a Jupiter swap converts it to company currency.
    pub async fn record_micro_deposit(
        &self,
        user_id: Uuid,
        wallet_address: &str,
        tx_signature: &str,
        amount_lamports: i64,
    ) -> Result<MicroDepositResult, AppError> {
        // Validate amount
        if amount_lamports <= 0 {
            return Err(AppError::Validation(
                "Deposit amount must be positive".into(),
            ));
        }

        // C-02: Idempotency — check if this tx_signature was already recorded as a micro deposit.
        // The DB also enforces this via a UNIQUE index on (detected_tx_signature, deposit_type),
        // but checking first gives a clean response instead of an internal error.
        if let Some(existing) = self
            .deposit_repo
            .find_by_tx_signature_and_type(tx_signature, DepositType::SolMicro)
            .await?
        {
            tracing::info!(
                session_id = %existing.session_id,
                tx_signature = %tx_signature,
                "SOL micro deposit already recorded (idempotent return)"
            );
            return Ok(MicroDepositResult {
                session_id: existing.session_id,
                tx_signature: tx_signature.to_string(),
                amount_lamports: existing.detected_amount_lamports.unwrap_or(amount_lamports),
            });
        }

        let session_id = Uuid::new_v4();

        // Create deposit session (pending batch - awaiting Jupiter swap)
        // User is credited immediately, but the SOL sits in treasury until batched
        let session = DepositSessionEntity {
            id: session_id,
            user_id,
            session_id,
            wallet_address: wallet_address.to_string(),
            wallet_type: WalletType::External,
            deposit_type: DepositType::SolMicro,
            currency: "SOL".to_string(),
            unlock_expires_at: None,
            status: DepositStatus::PendingBatch, // Awaiting batch swap
            detected_amount_lamports: Some(amount_lamports),
            detected_tx_signature: Some(tx_signature.to_string()),
            detected_at: Some(Utc::now()),
            completed_at: None, // Not complete until batched
            error_message: None,
            expected_message_hash: None,
            expected_message_bytes: None,
            privacy_deposit_tx_signature: Some(tx_signature.to_string()),
            deposit_amount_lamports: Some(amount_lamports),
            fee_buffer_lamports: None,
            tx_expires_at: None,
            processing_attempts: 0,
            last_processing_error: None,
            last_processing_attempt_at: None,
            created_at: Utc::now(),
            privacy_note_id: None,
            stored_share_b: None,
            withdrawal_available_at: None,
            withdrawal_tx_signature: None, // No swap tx yet
            input_token_mint: None,
            input_token_amount: None,
            withdrawn_amount_lamports: 0, // No swap yet
            batch_id: None,
            batched_at: None,
        };
        // C-02: Handle race condition — if two concurrent requests pass the idempotency
        // check above, the DB UNIQUE index will reject the second insert. Catch that
        // and return the existing session instead of an internal error.
        match self.deposit_repo.create(session).await {
            Ok(_) => {}
            Err(_) => {
                if let Some(existing) = self
                    .deposit_repo
                    .find_by_tx_signature_and_type(tx_signature, DepositType::SolMicro)
                    .await?
                {
                    tracing::info!(
                        session_id = %existing.session_id,
                        tx_signature = %tx_signature,
                        "SOL micro deposit race resolved (returning existing session)"
                    );
                    return Ok(MicroDepositResult {
                        session_id: existing.session_id,
                        tx_signature: tx_signature.to_string(),
                        amount_lamports: existing.detected_amount_lamports.unwrap_or(amount_lamports),
                    });
                }
                // Not a duplicate — re-raise the original error
                return Err(AppError::Internal(anyhow::anyhow!(
                    "Failed to create micro deposit session for tx {}",
                    tx_signature
                )));
            }
        }

        // Calculate credit amount (converts to company currency, applies fee policy)
        // Note: has_swap=false because the batch swap happens later (user credited now at SOL rate)
        let credit_result = self
            .credit_service
            .calculate(CreditParams {
                deposit_amount: amount_lamports,
                deposit_currency: "SOL".to_string(),
                has_swap: false, // Batch swap happens later
                has_privacy: false,
            })
            .await?;

        // Credit user immediately in company currency (H-06: persist conversion rate)
        let mut credit_tx = CreditTransactionEntity::new_privacy_deposit(
            user_id,
            credit_result.amount,
            &credit_result.currency,
            session_id,
        );
        credit_tx.conversion_rate = credit_result.conversion_rate;
        self.credit_repo
            .add_credit(
                user_id,
                credit_result.amount,
                &credit_result.currency,
                credit_tx,
            )
            .await?;

        tracing::info!(
            session_id = %session_id,
            user_id = %user_id,
            tx_signature = %tx_signature,
            amount_lamports = %amount_lamports,
            credit_amount = %credit_result.amount,
            credit_currency = %credit_result.currency,
            fee_deducted = %credit_result.fee_deducted,
            "SOL micro deposit recorded and credited"
        );

        Ok(MicroDepositResult {
            session_id,
            tx_signature: tx_signature.to_string(),
            amount_lamports,
        })
    }
}

/// Execute an admin-triggered withdrawal for a specific deposit session.
///
/// This is used by admin handlers to manually trigger withdrawals,
/// including early withdrawals (before privacy period ends).
///
/// Returns the transaction signature on success.
pub async fn execute_admin_withdrawal<
    C: crate::callback::AuthCallback,
    E: crate::services::EmailService,
>(
    state: &crate::AppState<C, E>,
    session: &DepositSessionEntity,
) -> Result<String, AppError> {
    use zeroize::Zeroize;

    let session_id = session.id;

    // L-02: Defense-in-depth: reject already-withdrawn sessions
    if session.status == crate::repositories::DepositStatus::Withdrawn {
        return Err(AppError::Validation(
            "Session already fully withdrawn".into(),
        ));
    }

    // Get required services
    let sidecar = state
        .privacy_sidecar_client
        .as_ref()
        .ok_or_else(|| AppError::Config("Privacy sidecar not configured".into()))?;

    let note_encryption = state
        .note_encryption_service
        .as_ref()
        .ok_or_else(|| AppError::Config("Note encryption service not configured".into()))?;

    // Get encrypted private key from session
    let encrypted_data = session.stored_share_b.as_ref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!(
            "Session {} missing encrypted private key",
            session_id
        ))
    })?;

    let mut private_key_bytes = crate::services::decrypt_base64_payload(
        note_encryption.as_ref(),
        encrypted_data,
        "Failed to decode encrypted private key",
        "Invalid encrypted private key format",
    )?;
    let mut private_key = String::from_utf8(private_key_bytes.clone()).map_err(|e| {
        private_key_bytes.zeroize();
        AppError::Internal(anyhow::anyhow!("Invalid private key encoding: {}", e))
    })?;
    private_key_bytes.zeroize();

    // Get deposit amount (safely convert i64 to u64)
    let stored_amount = session.deposit_amount_lamports.ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!(
            "Session {} missing deposit amount",
            session_id
        ))
    })?;
    let amount_lamports: u64 = stored_amount.try_into().map_err(|_| {
        AppError::Internal(anyhow::anyhow!(
            "Session {} has invalid deposit amount: {}",
            session_id,
            stored_amount
        ))
    })?;

    // Determine target currency (None for SOL = no swap needed)
    let target_currency = if state.config.privacy.company_currency.to_uppercase() == "SOL" {
        None
    } else {
        Some(state.config.privacy.company_currency.as_str())
    };

    // Execute withdrawal via sidecar
    let withdrawal_response = sidecar
        .withdraw(&private_key, amount_lamports, target_currency)
        .await;

    // Zeroize private key immediately
    private_key.zeroize();

    let response = withdrawal_response?;

    // Mark session as withdrawn
    state
        .deposit_repo
        .mark_withdrawn(session_id, &response.tx_signature)
        .await?;

    tracing::info!(
        session_id = %session_id,
        user_id = %session.user_id,
        tx_signature = %response.tx_signature,
        amount_lamports = %response.amount_lamports,
        "Admin withdrawal completed successfully"
    );

    Ok(response.tx_signature)
}
