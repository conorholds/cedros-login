//! Deposit request and response models for Privacy Cash (SSS wallets only)

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

use crate::repositories::DepositSessionEntity;

/// Deposit session status response
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DepositStatusResponse {
    pub session_id: Uuid,
    pub status: String,
    pub wallet_address: String,
    pub amount_lamports: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tx_signature: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completed_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub withdrawal_available_at: Option<DateTime<Utc>>,
}

impl From<&DepositSessionEntity> for DepositStatusResponse {
    fn from(entity: &DepositSessionEntity) -> Self {
        Self {
            session_id: entity.id,
            status: entity.status.as_str().to_string(),
            wallet_address: entity.wallet_address.clone(),
            amount_lamports: entity.deposit_amount_lamports,
            tx_signature: entity.privacy_deposit_tx_signature.clone(),
            error_message: entity.error_message.clone(),
            created_at: entity.created_at,
            completed_at: entity.completed_at,
            withdrawal_available_at: entity.withdrawal_available_at,
        }
    }
}

/// Deposit configuration response with tiered thresholds
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DepositConfigResponse {
    /// Whether deposits are enabled
    pub enabled: bool,
    /// Whether private deposits are available (false if recovery mode is enabled)
    pub private_deposits_enabled: bool,
    /// Privacy period in seconds (time before withdrawal to company wallet)
    pub privacy_period_secs: u64,
    /// Company wallet address (destination for public/micro deposits)
    pub company_wallet: String,
    /// Company's preferred currency (e.g., "USDC")
    pub company_currency: String,
    /// Current SOL price in USD (cached, ~30s TTL)
    pub sol_price_usd: f64,
    /// Token prices in USD (symbol -> price), fetched from Jupiter
    /// Includes non-stablecoin tokens like BONK, ORE, EURC
    pub token_prices: HashMap<String, f64>,

    // Tier thresholds
    /// Minimum SOL for private deposits (default: 0.25 SOL)
    pub private_min_sol: f64,
    /// USD equivalent of private_min_sol (rounded up to nearest $5)
    pub private_min_usd: f64,
    /// Minimum USD for public deposits (Jupiter minimum: $10)
    pub public_min_usd: f64,
    /// Maximum USD for SOL micro deposits (same as public_min: $10)
    pub sol_micro_max_usd: f64,
    /// Supported currencies for deposits
    pub supported_currencies: Vec<String>,
    /// Token symbols shown as quick actions in the deposit flow
    pub quick_action_tokens: Vec<String>,
    /// Token symbols shown in the custom token list
    pub custom_token_symbols: Vec<String>,
    /// Treasury wallet address for micro deposits (None if no treasury configured)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub micro_deposit_address: Option<String>,
    /// Batch threshold in USD before executing Jupiter swap
    pub micro_batch_threshold_usd: f64,

    // Fee configuration
    /// Fee policy: company_pays_all, user_pays_swap, user_pays_privacy, user_pays_all
    pub fee_policy: String,
    /// Privacy Cash fee percentage (e.g., 0.35 for 0.35%)
    pub privacy_fee_percent: f64,
    /// Privacy Cash fixed fee in lamports
    pub privacy_fee_fixed_lamports: u64,
    /// Swap fee percentage (e.g., 0.1 for 0.1%)
    pub swap_fee_percent: f64,
    /// Swap fixed fee in lamports
    pub swap_fee_fixed_lamports: u64,
    /// Company processing fee percentage (e.g., 0.05 for 0.05%, default: 0)
    pub company_fee_percent: f64,
    /// Company processing fixed fee in lamports (default: 0)
    pub company_fee_fixed_lamports: u64,

    // UI configuration
    /// Whether to show the explainer step for non-crypto-native users
    pub show_explainer: bool,
    /// Custom token definitions from admin settings
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_tokens: Option<Vec<CustomTokenDefinition>>,
}

/// Custom token definition for deposits
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomTokenDefinition {
    /// Token symbol (e.g., "MYTOKEN")
    pub symbol: String,
    /// Solana mint address
    pub mint: String,
    /// Token decimals (e.g., 6 for USDC, 9 for SOL)
    pub decimals: u8,
    /// Optional logo URL
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logo_url: Option<String>,
}

/// Swap quote response for public deposits
///
/// Returned by `GET /deposit/quote` - contains Jupiter Ultra order details.
/// Frontend signs the transaction and submits back via `POST /deposit`.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DepositQuoteResponse {
    /// Input token mint
    pub input_mint: String,
    /// Output token mint (company currency)
    pub output_mint: String,
    /// Input amount (smallest unit)
    pub in_amount: String,
    /// Output amount (smallest unit)
    pub out_amount: String,
    /// Input USD value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub in_usd_value: Option<f64>,
    /// Output USD value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub out_usd_value: Option<f64>,
    /// Slippage in basis points
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slippage_bps: Option<u32>,
    /// Base64-encoded unsigned transaction for the user to sign
    pub transaction: String,
    /// Request ID (pass this back when executing)
    pub request_id: String,
}

/// Individual deposit item in list response
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DepositItemResponse {
    pub session_id: Uuid,
    pub status: String,
    pub amount_lamports: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tx_signature: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub withdrawal_tx_signature: Option<String>,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completed_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub withdrawal_available_at: Option<DateTime<Utc>>,
}

impl From<&DepositSessionEntity> for DepositItemResponse {
    fn from(entity: &DepositSessionEntity) -> Self {
        Self {
            session_id: entity.id,
            status: entity.status.as_str().to_string(),
            amount_lamports: entity.deposit_amount_lamports,
            tx_signature: entity.privacy_deposit_tx_signature.clone(),
            withdrawal_tx_signature: entity.withdrawal_tx_signature.clone(),
            created_at: entity.created_at,
            completed_at: entity.completed_at,
            withdrawal_available_at: entity.withdrawal_available_at,
        }
    }
}

/// Deposit list response with pagination
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DepositListResponse {
    pub deposits: Vec<DepositItemResponse>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

// =============================================================================
// Pending SPL Deposits (webhook-detected)
// =============================================================================

/// Webhook-detected SPL token deposit awaiting user confirmation.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingSplDepositItemResponse {
    pub id: Uuid,
    pub wallet_address: String,
    pub token_mint: String,
    /// Raw amount string as received/normalized from webhook
    pub token_amount_raw: String,
    /// Amount in smallest unit (e.g., 10.5 USDC => 10500000)
    pub token_amount: i64,
    pub tx_signature: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

/// List response for pending SPL deposits
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingSplDepositListResponse {
    pub deposits: Vec<PendingSplDepositItemResponse>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

/// Request to confirm a pending SPL deposit
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfirmSplDepositRequest {
    pub pending_id: Uuid,
}

/// Response from confirming a pending SPL deposit
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfirmSplDepositResponse {
    pub success: bool,
    pub pending_id: Uuid,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deposit_session_id: Option<Uuid>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub swap_tx_signature: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deposit_tx_signature: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_pending_spl_deposit_list_response_serialization() {
        let resp = PendingSplDepositListResponse {
            deposits: vec![],
            total: 0,
            limit: 20,
            offset: 0,
        };

        let v = serde_json::to_value(resp).unwrap();
        assert_eq!(v, json!({"deposits":[],"total":0,"limit":20,"offset":0}));
    }
}
