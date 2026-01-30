//! Jupiter Ultra Swap API client
//!
//! Handles swap quotes and transaction execution via Jupiter Ultra API.
//! Used for "public deposit" tier: user swaps tokens to company wallet via Jupiter.
//!
//! Flow:
//! 1. `get_order()` - Get quote + unsigned transaction from Jupiter `/order`
//! 2. Frontend signs the transaction
//! 3. `execute_order()` - Submit signed tx to Jupiter `/execute`

use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tracing::{debug, warn};

use crate::errors::AppError;

/// Jupiter Ultra API base URL
const ULTRA_API_BASE: &str = "https://api.jup.ag/ultra/v1";

/// Known token mint addresses
pub const SOL_MINT: &str = "So11111111111111111111111111111111111111112";
pub const USDC_MINT: &str = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
pub const USDT_MINT: &str = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

/// Jupiter Ultra Swap API client
pub struct JupiterSwapService {
    http_client: Client,
    /// Company wallet address (receives swap output)
    company_wallet: String,
    /// Company currency mint address
    company_currency_mint: String,
    /// Optional API key for higher rate limits
    api_key: Option<String>,
}

/// Parameters for requesting a swap order
#[derive(Debug)]
pub struct OrderParams {
    /// Input token mint address
    pub input_mint: String,
    /// Amount of input token (in smallest unit)
    pub amount: u64,
    /// User's wallet address (taker/signer)
    pub taker: String,
}

/// Swap order response from Jupiter Ultra API
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SwapOrder {
    /// Input token mint
    pub input_mint: String,
    /// Output token mint
    pub output_mint: String,
    /// Input amount (string of smallest unit)
    pub in_amount: String,
    /// Output amount (string of smallest unit)
    pub out_amount: String,
    /// Input USD value
    #[serde(default)]
    pub in_usd_value: Option<f64>,
    /// Output USD value
    #[serde(default)]
    pub out_usd_value: Option<f64>,
    /// Slippage in basis points
    #[serde(default)]
    pub slippage_bps: Option<u32>,
    /// Base64-encoded unsigned transaction (None if error)
    pub transaction: Option<String>,
    /// Request ID for execute step
    pub request_id: String,
    /// Error code (if transaction is None)
    #[serde(default)]
    pub error_code: Option<u32>,
    /// Error message
    #[serde(default)]
    pub error_message: Option<String>,
}

/// Execute response from Jupiter Ultra API
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecuteResult {
    /// "Success" or "Failed"
    pub status: String,
    /// Status code
    pub code: u32,
    /// Transaction signature on Solana
    #[serde(default)]
    pub signature: Option<String>,
    /// Slot number
    #[serde(default)]
    pub slot: Option<String>,
    /// Error message if failed
    #[serde(default)]
    pub error: Option<String>,
    /// Total input amount
    #[serde(default)]
    pub total_input_amount: Option<String>,
    /// Total output amount
    #[serde(default)]
    pub total_output_amount: Option<String>,
}

impl ExecuteResult {
    /// Whether the swap succeeded
    pub fn is_success(&self) -> bool {
        self.status == "Success"
    }
}

/// Mint address for a currency name
pub fn mint_for_currency(currency: &str) -> Option<&'static str> {
    match currency.to_uppercase().as_str() {
        "SOL" => Some(SOL_MINT),
        "USDC" => Some(USDC_MINT),
        "USDT" => Some(USDT_MINT),
        _ => None,
    }
}

impl JupiterSwapService {
    /// Create a new Jupiter swap service
    ///
    /// - `company_wallet`: Wallet address that receives swap output
    /// - `company_currency`: Currency name (e.g., "USDC") - resolved to mint
    /// - `api_key`: Optional Jupiter API key for higher rate limits
    pub fn new(
        company_wallet: String,
        company_currency: &str,
        api_key: Option<String>,
    ) -> Result<Self, AppError> {
        let company_currency_mint = mint_for_currency(company_currency)
            .ok_or_else(|| {
                AppError::Internal(anyhow::anyhow!(
                    "Unknown company currency: {}",
                    company_currency
                ))
            })?
            .to_string();

        let http_client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .map_err(|e| {
                AppError::Internal(anyhow::anyhow!("Failed to create HTTP client: {}", e))
            })?;

        Ok(Self {
            http_client,
            company_wallet,
            company_currency_mint,
            api_key,
        })
    }

    /// Get a swap order (quote + unsigned transaction) from Jupiter Ultra API
    ///
    /// Returns the order with an unsigned transaction for the user to sign.
    /// The `receiver` is set to the company wallet so output goes directly there.
    pub async fn get_order(&self, params: &OrderParams) -> Result<SwapOrder, AppError> {
        let url = format!(
            "{}/order?inputMint={}&outputMint={}&amount={}&taker={}&receiver={}",
            ULTRA_API_BASE,
            params.input_mint,
            self.company_currency_mint,
            params.amount,
            params.taker,
            self.company_wallet,
        );

        let mut request = self.http_client.get(&url);
        if let Some(key) = &self.api_key {
            request = request.header("x-api-key", key);
        }

        let response = request.send().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Jupiter order request failed: {}", e))
        })?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            warn!(status = %status, body = %body, "Jupiter order API error");
            return Err(AppError::Internal(anyhow::anyhow!(
                "Jupiter order API returned {}: {}",
                status,
                body
            )));
        }

        let order: SwapOrder = response.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse Jupiter order: {}", e))
        })?;

        // Check for error in response
        if order.transaction.is_none() {
            let msg = order
                .error_message
                .as_deref()
                .unwrap_or("No transaction returned");
            return Err(AppError::Validation(format!(
                "Jupiter could not create swap: {}",
                msg
            )));
        }

        debug!(
            input_mint = %order.input_mint,
            output_mint = %order.output_mint,
            in_amount = %order.in_amount,
            out_amount = %order.out_amount,
            "Got Jupiter swap order"
        );

        Ok(order)
    }

    /// Execute a signed swap transaction via Jupiter Ultra API
    ///
    /// The frontend signs the transaction from `get_order()` and sends it here.
    pub async fn execute_order(
        &self,
        signed_transaction: &str,
        request_id: &str,
    ) -> Result<ExecuteResult, AppError> {
        let url = format!("{}/execute", ULTRA_API_BASE);

        let body = serde_json::json!({
            "signedTransaction": signed_transaction,
            "requestId": request_id,
        });

        let mut request = self.http_client.post(&url).json(&body);
        if let Some(key) = &self.api_key {
            request = request.header("x-api-key", key);
        }

        let response = request.send().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Jupiter execute request failed: {}", e))
        })?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            warn!(status = %status, body = %body, "Jupiter execute API error");
            return Err(AppError::Internal(anyhow::anyhow!(
                "Jupiter execute API returned {}: {}",
                status,
                body
            )));
        }

        let result: ExecuteResult = response.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse Jupiter execute: {}", e))
        })?;

        if result.is_success() {
            debug!(
                signature = ?result.signature,
                output = ?result.total_output_amount,
                "Jupiter swap executed successfully"
            );
        } else {
            warn!(
                error = ?result.error,
                code = result.code,
                "Jupiter swap execution failed"
            );
        }

        Ok(result)
    }

    /// Get the company currency mint address
    pub fn company_currency_mint(&self) -> &str {
        &self.company_currency_mint
    }
}
