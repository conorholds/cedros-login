//! Tiered deposit handlers (public and micro deposits)
//!
//! GET /deposit/quote - Jupiter swap quote for public deposits
//! POST /deposit/public - Execute public deposit via Jupiter swap
//! POST /deposit/micro - Record SOL micro deposit (direct transfer)

use axum::{
    extract::{Query, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::DepositQuoteResponse;
use crate::services::{EmailService, JupiterOrderParams, TieredDepositService};
use crate::utils::authenticate;
use crate::AppState;

/// Lamports per SOL
const LAMPORTS_PER_SOL: f64 = 1_000_000_000.0;

fn parse_total_output_amount(total_output_amount: Option<&str>) -> Result<i64, AppError> {
    let raw = total_output_amount.ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!(
            "Jupiter execute succeeded but missing total_output_amount"
        ))
    })?;
    raw.parse::<i64>().map_err(|e| {
        AppError::Internal(anyhow::anyhow!(
            "Invalid Jupiter total_output_amount '{}': {}",
            raw,
            e
        ))
    })
}

/// Query params for swap quote
#[derive(Debug, serde::Deserialize)]
pub struct DepositQuoteQuery {
    /// Input token mint address (SOL, USDC, or USDT mint)
    pub input_mint: String,
    /// Amount in smallest unit of input token
    pub amount: u64,
    /// User's wallet address (signs the transaction)
    pub taker: String,
}

/// GET /deposit/quote - Get a swap quote for public deposits
///
/// Returns a Jupiter Ultra swap order with an unsigned transaction.
/// The frontend signs the transaction and submits it via `POST /deposit`.
pub async fn deposit_quote<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<DepositQuoteQuery>,
) -> Result<Json<DepositQuoteResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Deposits not enabled".into()));
    }

    // Require authentication
    let _auth_user = authenticate(&state, &headers).await?;

    // Require Jupiter swap service
    let jupiter = state.jupiter_swap_service.as_ref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("Jupiter swap service not configured"))
    })?;

    // Get the swap order from Jupiter
    let order = jupiter
        .get_order(&JupiterOrderParams {
            input_mint: query.input_mint,
            amount: query.amount,
            taker: query.taker,
        })
        .await?;

    // The transaction must exist (get_order validates this)
    let transaction = order
        .transaction
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Jupiter order missing transaction")))?;

    Ok(Json(DepositQuoteResponse {
        input_mint: order.input_mint,
        output_mint: order.output_mint,
        in_amount: order.in_amount,
        out_amount: order.out_amount,
        in_usd_value: order.in_usd_value,
        out_usd_value: order.out_usd_value,
        slippage_bps: order.slippage_bps,
        transaction,
        request_id: order.request_id,
    }))
}

/// Request to execute a public deposit (Jupiter swap to company wallet)
#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicDepositRequest {
    /// Base64-encoded signed transaction (from /deposit/quote flow)
    pub signed_transaction: String,
    /// Request ID from the quote response
    pub request_id: String,
    /// Input token mint address
    pub input_mint: String,
    /// Input amount in smallest unit
    pub input_amount: u64,
    /// User's wallet address
    pub wallet_address: String,
}

/// Response from a public or micro deposit
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TieredDepositResponse {
    /// Session ID for tracking
    pub session_id: Uuid,
    /// Transaction signature on Solana
    pub tx_signature: String,
    /// Human-readable message
    pub message: String,
    /// Deposit type
    pub deposit_type: String,
}

/// POST /deposit/public - Execute a public deposit via Jupiter swap
///
/// The user signs a Jupiter swap transaction (from /deposit/quote) and
/// submits it here. The server executes via Jupiter Ultra, verifies the
/// swap, and credits the user immediately.
pub async fn execute_public_deposit<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<PublicDepositRequest>,
) -> Result<Json<TieredDepositResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Deposits not enabled".into()));
    }

    let auth_user = authenticate(&state, &headers).await?;

    // Require Jupiter swap service
    let jupiter = state.jupiter_swap_service.as_ref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("Jupiter swap service not configured"))
    })?;

    // Execute the swap via Jupiter Ultra
    let execute_result = jupiter
        .execute_order(&request.signed_transaction, &request.request_id)
        .await?;

    if !execute_result.is_success() {
        let error_msg = execute_result
            .error
            .unwrap_or_else(|| "Unknown error".to_string());
        return Err(AppError::Internal(anyhow::anyhow!(
            "Jupiter swap failed: {}",
            error_msg
        )));
    }

    let tx_signature = execute_result.signature.ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!(
            "Jupiter execute succeeded but no signature"
        ))
    })?;

    // Parse output amount
    let output_amount = parse_total_output_amount(execute_result.total_output_amount.as_deref())?;

    // Record the deposit and credit the user
    let tiered_service = TieredDepositService::new(
        state.deposit_repo.clone(),
        state.credit_repo.clone(),
        state.deposit_credit_service.clone(),
    );
    let result = tiered_service
        .record_public_deposit(
            auth_user.user_id,
            &request.wallet_address,
            &tx_signature,
            output_amount,
            &state.config.privacy.company_currency,
            Some(&request.input_mint),
            Some(request.input_amount as i64),
        )
        .await?;

    Ok(Json(TieredDepositResponse {
        session_id: result.session_id,
        tx_signature: result.tx_signature,
        message: "Public deposit completed successfully".to_string(),
        deposit_type: "public".to_string(),
    }))
}

/// Request to execute a SOL micro deposit (direct transfer)
#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MicroDepositRequest {
    /// Transaction signature of the SOL transfer (already submitted to network)
    pub tx_signature: String,
    /// Amount transferred in lamports
    pub amount_lamports: u64,
    /// User's wallet address (sender)
    pub wallet_address: String,
}

/// POST /deposit/micro - Record a SOL micro deposit
///
/// For small deposits (< $10 USD), users transfer SOL directly to the
/// configured treasury wallet. The frontend submits the transfer tx to the
/// network and then calls this endpoint to record it and receive credit.
pub async fn execute_micro_deposit<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<MicroDepositRequest>,
) -> Result<Json<TieredDepositResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Deposits not enabled".into()));
    }

    let auth_user = authenticate(&state, &headers).await?;

    // Resolve the configured treasury wallet (global)
    let treasury_config = state
        .treasury_config_repo
        .find_for_org(None)
        .await?
        .ok_or_else(|| AppError::Config("Treasury wallet not configured".into()))?;
    let treasury_wallet_address = treasury_config.wallet_address;

    // Bind the claimed sender to the authenticated user.
    // - If the user has a linked external Solana wallet, require it matches.
    // - Otherwise, allow the user's embedded wallet pubkey (if enrolled).
    let user = state
        .user_repo
        .find_by_id(auth_user.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    let mut allowed_senders: Vec<String> = Vec::new();
    if let Some(wallet) = user.wallet_address.clone() {
        allowed_senders.push(wallet);
    }
    if let Some(material) = state
        .wallet_material_repo
        .find_by_user(auth_user.user_id)
        .await?
    {
        allowed_senders.push(material.solana_pubkey);
    }

    if allowed_senders.is_empty() {
        return Err(AppError::Forbidden(
            "Micro deposits require a linked Solana wallet".into(),
        ));
    }

    if !allowed_senders
        .iter()
        .any(|w| w.as_str() == request.wallet_address.as_str())
    {
        return Err(AppError::Forbidden(
            "Micro deposit sender does not match your linked wallet".into(),
        ));
    }

    // Idempotency / replay protection by tx signature.
    if let Some(existing) = state
        .deposit_repo
        .find_micro_by_tx_signature(&request.tx_signature)
        .await?
    {
        if existing.user_id != auth_user.user_id {
            return Err(AppError::Forbidden(
                "Micro deposit transaction already claimed".into(),
            ));
        }

        let amount_lamports = existing.detected_amount_lamports.unwrap_or(0);
        let sol_amount = amount_lamports as f64 / LAMPORTS_PER_SOL;
        return Ok(Json(TieredDepositResponse {
            session_id: existing.session_id,
            tx_signature: request.tx_signature,
            message: format!("SOL micro deposit already recorded ({:.4} SOL)", sol_amount),
            deposit_type: "sol_micro".to_string(),
        }));
    }

    // Verify the transaction on-chain via the sidecar (uses configured RPC URL).
    let sidecar = state
        .privacy_sidecar_client
        .as_ref()
        .ok_or_else(|| AppError::Config("Privacy sidecar not configured".into()))?;
    let verified = sidecar
        .verify_sol_transfer(
            &request.tx_signature,
            &request.wallet_address,
            &treasury_wallet_address,
            Some(request.amount_lamports),
        )
        .await?;

    let amount_lamports: i64 = verified
        .observed_lamports
        .try_into()
        .map_err(|_| AppError::Validation("Deposit amount overflow".into()))?;

    let tiered_service = TieredDepositService::new(
        state.deposit_repo.clone(),
        state.credit_repo.clone(),
        state.deposit_credit_service.clone(),
    );
    let result = tiered_service
        .record_micro_deposit(
            auth_user.user_id,
            &request.wallet_address,
            &request.tx_signature,
            amount_lamports,
        )
        .await?;

    let sol_amount = result.amount_lamports as f64 / LAMPORTS_PER_SOL;

    Ok(Json(TieredDepositResponse {
        session_id: result.session_id,
        tx_signature: result.tx_signature,
        message: format!("SOL micro deposit of {:.4} SOL credited", sol_amount),
        deposit_type: "sol_micro".to_string(),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_total_output_amount_ok() {
        assert_eq!(parse_total_output_amount(Some("123")).unwrap(), 123);
    }

    #[test]
    fn test_parse_total_output_amount_rejects_missing_or_invalid() {
        assert!(parse_total_output_amount(None).is_err());
        assert!(parse_total_output_amount(Some("not-a-number")).is_err());
    }
}
