//! Deposit service for Privacy Cash integration (SSS wallets only)
//!
//! Executes deposits to user's Privacy Cash account using their SSS keypair.
//! Stores Share B during "privacy period" for later withdrawal to company wallet.
//!
//! Tiered deposit recording (public, micro) is in deposit_tiered_service.rs.

use chrono::{Duration, Utc};
use std::sync::Arc;
use uuid::Uuid;

use crate::config::PrivacyConfig;
use crate::errors::AppError;
use crate::repositories::{
    CreditRepository, CreditTransactionEntity, DepositRepository, DepositSessionEntity,
};
use crate::services::{CreditParams, DepositCreditService, PrivacySidecarClient};

/// Result of executing a deposit
pub struct DepositResult {
    /// Session ID for tracking
    pub session_id: Uuid,
    /// Transaction signature on Solana
    pub tx_signature: String,
    /// Amount deposited (in lamports)
    pub amount_lamports: i64,
    /// User's public key (Privacy Cash account owner)
    pub user_pubkey: String,
    /// When the privacy period ends (withdrawal can occur)
    pub withdrawal_available_at: chrono::DateTime<Utc>,
}

/// Result of executing an SPL token deposit (swap + deposit)
pub struct SplDepositResult {
    /// Session ID for tracking
    pub session_id: Uuid,
    /// Transaction signature of the swap
    pub swap_tx_signature: String,
    /// Transaction signature of the Privacy Cash deposit
    pub deposit_tx_signature: String,
    /// Amount of SOL deposited (in lamports) after swap
    pub sol_amount_lamports: i64,
    /// Input token mint address
    pub input_mint: String,
    /// Input token amount (pre-swap) - this is what user is credited
    pub input_amount: i64,
    /// Currency credited (e.g., "USD" for stablecoins)
    pub credit_currency: String,
    /// User's public key
    pub user_pubkey: String,
    /// When the privacy period ends
    pub withdrawal_available_at: chrono::DateTime<Utc>,
}

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

/// Deposit service configuration
///
/// Note: privacy_period_secs is read from the database (system_settings table)
/// and passed to methods at call time for dynamic configuration.
pub struct DepositServiceConfig {
    /// Minimum deposit amount in lamports
    pub min_deposit_lamports: u64,
    /// Maximum deposit amount in lamports (0 = no limit)
    pub max_deposit_lamports: u64,
}

/// Result of listing deposits
pub struct DepositListResult {
    pub deposits: Vec<DepositSessionEntity>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

/// Deposit service for SSS embedded wallets
pub struct DepositService {
    deposit_repo: Arc<dyn DepositRepository>,
    credit_repo: Arc<dyn CreditRepository>,
    sidecar: Arc<PrivacySidecarClient>,
    credit_service: Arc<DepositCreditService>,
    config: DepositServiceConfig,
}

impl DepositService {
    /// Create a new deposit service
    pub fn new(
        deposit_repo: Arc<dyn DepositRepository>,
        credit_repo: Arc<dyn CreditRepository>,
        sidecar: Arc<PrivacySidecarClient>,
        credit_service: Arc<DepositCreditService>,
        config: &PrivacyConfig,
    ) -> Self {
        Self {
            deposit_repo,
            credit_repo,
            sidecar,
            credit_service,
            config: DepositServiceConfig {
                min_deposit_lamports: config.min_deposit_lamports,
                max_deposit_lamports: config.max_deposit_lamports,
            },
        }
    }

    /// Execute a Privacy Cash deposit for an SSS embedded wallet
    ///
    /// The deposit goes to the USER's Privacy Cash account (user's pubkey is owner).
    /// This provides privacy because the withdrawal to company wallet is unlinkable.
    ///
    /// Requirements:
    /// - User must have no-recovery wallet (no Share C)
    /// - Encrypted private key must be stored for later withdrawal
    ///
    /// # Arguments
    /// * `privacy_period_secs` - Read from system_settings table via SettingsService
    pub async fn execute_deposit(
        &self,
        user_id: Uuid,
        user_private_key: &str,
        encrypted_private_key: &str,
        amount_lamports: u64,
        privacy_period_secs: u64,
    ) -> Result<DepositResult, AppError> {
        // Validate amount
        if amount_lamports < self.config.min_deposit_lamports {
            return Err(AppError::Validation(format!(
                "Minimum deposit is {} lamports",
                self.config.min_deposit_lamports
            )));
        }

        // Check max limit (0 means no limit)
        if self.config.max_deposit_lamports > 0
            && amount_lamports > self.config.max_deposit_lamports
        {
            tracing::warn!(
                user_id = %user_id,
                amount_lamports = amount_lamports,
                max_allowed = self.config.max_deposit_lamports,
                "Deposit amount exceeds maximum limit"
            );
            return Err(AppError::Validation(format!(
                "Maximum deposit is {} lamports",
                self.config.max_deposit_lamports
            )));
        }

        // Generate session ID
        let session_id = Uuid::new_v4();

        // Calculate when withdrawal becomes available
        let withdrawal_available_at = Utc::now() + Duration::seconds(privacy_period_secs as i64);

        // Execute deposit via sidecar (deposits to user's Privacy Cash account)
        let sidecar_response = self
            .sidecar
            .deposit(user_private_key, amount_lamports)
            .await
            .map_err(|e| {
                tracing::error!(
                    session_id = %session_id,
                    user_id = %user_id,
                    error = %e,
                    "Failed to execute deposit via sidecar"
                );
                e
            })?;

        // Create deposit session with encrypted private key for later withdrawal
        let deposit_session = DepositSessionEntity::new_privacy_deposit(
            user_id,
            session_id,
            sidecar_response.user_pubkey.clone(),
            amount_lamports as i64,
            sidecar_response.tx_signature.clone(),
            encrypted_private_key.to_string(),
            withdrawal_available_at,
        );
        self.deposit_repo.create(deposit_session).await?;

        // Calculate credit amount (converts to company currency, applies fee policy)
        let credit_result = self
            .credit_service
            .calculate(CreditParams {
                deposit_amount: amount_lamports as i64,
                deposit_currency: "SOL".to_string(),
                has_swap: false,
                has_privacy: true,
            })
            .await?;

        // Credit the user
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
            user_pubkey = %sidecar_response.user_pubkey,
            amount_lamports = %amount_lamports,
            credit_amount = %credit_result.amount,
            credit_currency = %credit_result.currency,
            fee_deducted = %credit_result.fee_deducted,
            tx_signature = %sidecar_response.tx_signature,
            withdrawal_available_at = %withdrawal_available_at,
            "Privacy deposit completed successfully"
        );

        Ok(DepositResult {
            session_id,
            tx_signature: sidecar_response.tx_signature,
            amount_lamports: amount_lamports as i64,
            user_pubkey: sidecar_response.user_pubkey,
            withdrawal_available_at,
        })
    }

    /// Get deposits ready for withdrawal (privacy period elapsed)
    pub async fn get_pending_withdrawals(&self) -> Result<Vec<DepositSessionEntity>, AppError> {
        self.deposit_repo
            .find_ready_for_withdrawal(Utc::now())
            .await
    }

    /// Mark a deposit as withdrawn
    pub async fn mark_withdrawn(
        &self,
        session_id: Uuid,
        withdrawal_tx_signature: &str,
    ) -> Result<(), AppError> {
        self.deposit_repo
            .mark_withdrawn(session_id, withdrawal_tx_signature)
            .await
    }

    /// Get a deposit session by ID (for status checks)
    pub async fn get_session(
        &self,
        session_id: Uuid,
        user_id: Uuid,
    ) -> Result<DepositSessionEntity, AppError> {
        let session = self
            .deposit_repo
            .find_by_id(session_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Deposit session not found".into()))?;

        if session.user_id != user_id {
            return Err(AppError::Forbidden(
                "Not authorized to view this deposit".into(),
            ));
        }

        Ok(session)
    }

    /// List deposits for a user with pagination
    pub async fn list_deposits(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<DepositListResult, AppError> {
        let deposits = self
            .deposit_repo
            .list_by_user(user_id, None, limit, offset)
            .await?;
        let total = self.deposit_repo.count_by_user(user_id, None).await?;

        Ok(DepositListResult {
            deposits,
            total,
            limit,
            offset,
        })
    }

    /// Execute an SPL token deposit (swap to SOL + Privacy Cash deposit)
    ///
    /// Uses Jupiter gasless swap to convert SPL tokens to SOL, then deposits
    /// to the user's Privacy Cash account.
    ///
    /// Requirements:
    /// - User wallet must have < 0.01 SOL (gasless requirement)
    /// - Trade size must be > ~$10 USD (Jupiter minimum)
    /// - User must have no-recovery wallet
    ///
    /// # Arguments
    /// * `privacy_period_secs` - Read from system_settings table via SettingsService
    pub async fn execute_spl_deposit(
        &self,
        user_id: Uuid,
        user_private_key: &str,
        encrypted_private_key: &str,
        input_mint: &str,
        amount: &str,
        privacy_period_secs: u64,
    ) -> Result<SplDepositResult, AppError> {
        // Generate session ID
        let session_id = Uuid::new_v4();

        // Calculate when withdrawal becomes available
        let withdrawal_available_at = Utc::now() + Duration::seconds(privacy_period_secs as i64);

        // Execute swap and deposit via sidecar
        let sidecar_response = self
            .sidecar
            .swap_and_deposit(user_private_key, input_mint, amount)
            .await
            .map_err(|e| {
                tracing::error!(
                    session_id = %session_id,
                    user_id = %user_id,
                    input_mint = %input_mint,
                    error = %e,
                    "Failed to execute SPL swap and deposit via sidecar"
                );
                e
            })?;

        let sol_amount_lamports = sidecar_response.sol_amount_lamports;

        // Parse input amount for credit calculation
        let input_amount: i64 = sidecar_response.input_amount.parse().map_err(|_| {
            AppError::Internal(anyhow::anyhow!("Invalid input amount from sidecar"))
        })?;

        // Determine deposit currency from token mint
        let deposit_currency = currency_from_mint(&sidecar_response.input_mint);

        // Create deposit session with encrypted private key for later withdrawal
        // Note: We store sol_amount_lamports for Privacy Cash tracking
        let deposit_session = DepositSessionEntity::new_privacy_deposit(
            user_id,
            session_id,
            sidecar_response.user_pubkey.clone(),
            sol_amount_lamports,
            sidecar_response.deposit_tx_signature.clone(),
            encrypted_private_key.to_string(),
            withdrawal_available_at,
        );
        self.deposit_repo.create(deposit_session).await?;

        // Calculate credit amount (converts to company currency, applies fee policy)
        let credit_result = self
            .credit_service
            .calculate(CreditParams {
                deposit_amount: input_amount,
                deposit_currency: deposit_currency.to_string(),
                has_swap: true,
                has_privacy: true,
            })
            .await?;

        // Credit the user
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
            user_pubkey = %sidecar_response.user_pubkey,
            input_mint = %input_mint,
            input_amount = %input_amount,
            credit_amount = %credit_result.amount,
            credit_currency = %credit_result.currency,
            fee_deducted = %credit_result.fee_deducted,
            sol_amount_lamports = %sol_amount_lamports,
            swap_tx = %sidecar_response.swap_tx_signature,
            deposit_tx = %sidecar_response.deposit_tx_signature,
            withdrawal_available_at = %withdrawal_available_at,
            "SPL deposit (swap + privacy deposit) completed"
        );

        Ok(SplDepositResult {
            session_id,
            swap_tx_signature: sidecar_response.swap_tx_signature,
            deposit_tx_signature: sidecar_response.deposit_tx_signature,
            sol_amount_lamports,
            input_mint: sidecar_response.input_mint,
            input_amount,
            credit_currency: credit_result.currency,
            user_pubkey: sidecar_response.user_pubkey,
            withdrawal_available_at,
        })
    }
}
