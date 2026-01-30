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

/// Determine credit currency from token mint
fn currency_from_mint(mint: &str) -> &'static str {
    match mint {
        USDC_MINT | USDT_MINT => "USD",
        _ => "USD",
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

        let session_id = Uuid::new_v4();
        let deposit_currency = currency_from_mint(input_mint.unwrap_or(USDC_MINT));

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
        self.deposit_repo.create(session).await?;

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

        // Credit user immediately
        let credit_tx = CreditTransactionEntity::new_privacy_deposit(
            user_id,
            credit_result.amount,
            &credit_result.currency,
            session_id,
        );
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
        self.deposit_repo.create(session).await?;

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

        // Credit user immediately in company currency
        let credit_tx = CreditTransactionEntity::new_privacy_deposit(
            user_id,
            credit_result.amount,
            &credit_result.currency,
            session_id,
        );
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
    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
    use zeroize::Zeroize;

    let session_id = session.id;

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

    // Decode and decrypt the private key
    let combined = BASE64.decode(encrypted_data).map_err(|e| {
        AppError::Internal(anyhow::anyhow!(
            "Failed to decode encrypted private key: {}",
            e
        ))
    })?;

    // Split into nonce (12 bytes) and ciphertext
    const NONCE_SIZE: usize = 12;
    if combined.len() <= NONCE_SIZE {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Invalid encrypted private key format"
        )));
    }

    let nonce = &combined[..NONCE_SIZE];
    let ciphertext = &combined[NONCE_SIZE..];

    // Decrypt the private key
    let mut private_key_bytes = note_encryption.decrypt(ciphertext, nonce)?;
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
