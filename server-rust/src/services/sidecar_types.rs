//! Privacy Cash Sidecar request/response types
//!
//! Contains DTOs for communicating with the Privacy Cash sidecar service.

use serde::{Deserialize, Serialize};

use crate::errors::AppError;

/// Configuration for the sidecar client
#[derive(Debug, Clone)]
pub struct SidecarClientConfig {
    /// Base URL of the sidecar (e.g., "http://localhost:3100")
    pub base_url: String,
    /// Request timeout in milliseconds
    pub timeout_ms: u64,
    /// API key for authentication
    pub api_key: String,
}

/// Request to execute a deposit (SSS embedded wallet)
#[derive(Debug, Serialize)]
pub struct DepositRequest {
    pub user_private_key: String,
    pub amount_lamports: u64,
}

/// Response from executing a deposit
#[derive(Debug, Deserialize)]
pub struct DepositResponse {
    pub success: bool,
    pub tx_signature: String,
    pub user_pubkey: String,
}

/// Request to withdraw from a user's Privacy Cash account
#[derive(Debug, Serialize)]
pub struct WithdrawRequest {
    pub user_private_key: String,
    pub amount_lamports: u64,
    /// Target currency for withdrawal (SOL, USDC, USDT). Default: SOL
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_currency: Option<String>,
}

/// Response from withdrawing
#[derive(Debug, Deserialize)]
pub struct WithdrawResponse {
    pub success: bool,
    pub tx_signature: String,
    pub fee_lamports: i64,
    /// Actual amount withdrawn (after fees) - may be less than requested if partial
    pub amount_lamports: i64,
    /// True if the full requested amount couldn't be withdrawn (insufficient balance)
    pub is_partial: bool,
    /// The currency the funds were withdrawn to (SOL, USDC, USDT)
    pub currency: Option<String>,
    /// Swap transaction signature (if swapped to USDC/USDT)
    pub swap_tx_signature: Option<String>,
    /// Output amount in target currency (if swapped)
    pub output_amount: Option<String>,
    /// True if swap was requested but failed (funds remain in SOL)
    pub swap_failed: Option<bool>,
    /// Error message if swap failed
    pub swap_error: Option<String>,
}

/// Request to swap SPL token to SOL and deposit (gasless)
#[derive(Debug, Serialize)]
pub struct SwapAndDepositRequest {
    /// User's private key (base58 encoded)
    pub user_private_key: String,
    /// SPL token mint address to swap from (e.g., USDC mint)
    pub input_mint: String,
    /// Amount of SPL token in smallest unit (e.g., "10000000" for 10 USDC)
    pub amount: String,
}

/// Response from swap and deposit
#[derive(Debug, Deserialize)]
pub struct SwapAndDepositResponse {
    pub success: bool,
    /// Transaction signature of the swap
    pub swap_tx_signature: String,
    /// Transaction signature of the Privacy Cash deposit
    pub deposit_tx_signature: String,
    /// Amount of SOL deposited (in lamports) - after swap
    pub sol_amount_lamports: i64,
    /// Input token mint address (e.g., USDC mint)
    pub input_mint: String,
    /// Input token amount (pre-swap) in smallest unit
    pub input_amount: String,
    /// User's public key
    pub user_pubkey: String,
}

/// Request to execute a batch swap (SOL → stablecoin)
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchSwapRequest {
    /// Base58-encoded private key of the treasury wallet
    pub private_key: String,
    /// Amount of SOL to swap in lamports
    pub amount_lamports: u64,
    /// Output currency: "USDC" or "USDT"
    pub output_currency: String,
}

/// Response from batch swap
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchSwapResponse {
    pub success: bool,
    /// Transaction signature on Solana
    pub tx_signature: String,
    /// Input amount in lamports
    pub input_lamports: u64,
    /// Output amount in smallest token unit
    pub output_amount: String,
    /// Output currency
    pub output_currency: String,
    /// Error message if failed
    pub error: Option<String>,
}

/// Request to get a user's private balance
#[derive(Debug, Serialize)]
pub struct BalanceRequest {
    pub user_private_key: String,
}

/// Response from getting private balance
#[derive(Debug, Deserialize)]
pub struct BalanceResponse {
    pub balance_lamports: u64,
    pub balance_sol: f64,
    pub user_pubkey: String,
}

/// Request to verify a finalized SOL transfer
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifySolTransferRequest {
    pub signature: String,
    pub expected_source: String,
    pub expected_destination: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min_lamports: Option<u64>,
}

/// Response from transfer verification
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifySolTransferResponse {
    pub ok: bool,
    pub signature: String,
    pub observed_lamports: u64,
    pub source: String,
    pub destination: String,
}

/// Health check response
#[derive(Debug, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub timestamp: String,
    pub network: String,
    pub checks: HealthChecks,
}

#[derive(Debug, Deserialize)]
pub struct HealthChecks {
    pub rpc_connected: bool,
    pub sdk_loaded: bool,
}

/// Error response from sidecar
#[derive(Debug, Deserialize)]
pub(crate) struct ErrorResponse {
    pub error: String,
    #[serde(default)]
    pub details: Option<String>,
}

/// Trait for checking sidecar operation success
pub(crate) trait SidecarSuccess {
    fn is_success(&self) -> bool;
    fn failure_reason(&self) -> Option<&str> {
        None
    }
}

impl SidecarSuccess for DepositResponse {
    fn is_success(&self) -> bool {
        self.success
    }
}

impl SidecarSuccess for WithdrawResponse {
    fn is_success(&self) -> bool {
        self.success
    }

    fn failure_reason(&self) -> Option<&str> {
        self.swap_error.as_deref()
    }
}

impl SidecarSuccess for SwapAndDepositResponse {
    fn is_success(&self) -> bool {
        self.success
    }
}

impl SidecarSuccess for BatchSwapResponse {
    fn is_success(&self) -> bool {
        self.success
    }

    fn failure_reason(&self) -> Option<&str> {
        self.error.as_deref()
    }
}

/// Ensure sidecar operation succeeded, returning error if not
pub(crate) fn ensure_sidecar_success<T: SidecarSuccess>(value: T) -> Result<T, AppError> {
    if value.is_success() {
        Ok(value)
    } else if let Some(reason) = value.failure_reason() {
        Err(AppError::Internal(anyhow::anyhow!(
            "Sidecar reported failure: {}",
            reason
        )))
    } else {
        Err(AppError::Internal(anyhow::anyhow!(
            "Sidecar reported failure (success=false)"
        )))
    }
}
