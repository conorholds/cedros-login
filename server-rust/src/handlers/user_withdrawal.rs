//! User withdrawal handlers
//!
//! POST /wallet/withdraw/sol       - Withdraw SOL from embedded wallet to external address
//! POST /wallet/withdraw/spl       - Withdraw SPL tokens from embedded wallet to external address
//! GET  /wallet/withdraw/balances  - Get all token balances for the user's wallet
//! GET  /wallet/withdraw/history   - Get paginated withdrawal history for the authenticated user
//!
//! Gated by `feature_user_withdrawals` system setting (disabled by default).
//! Requires an unlocked SSS wallet (cached encryption key) for transfers.

use axum::{
    extract::{Query, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::UserWithdrawalLogEntry;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// Request to withdraw SOL to an external address
#[derive(Debug, serde::Deserialize)]
pub struct WithdrawSolRequest {
    /// Destination Solana address (base58)
    pub destination: String,
    /// Amount in lamports
    pub amount_lamports: u64,
}

/// Request to withdraw SPL tokens to an external address
#[derive(Debug, serde::Deserialize)]
pub struct WithdrawSplRequest {
    /// Destination Solana address (base58)
    pub destination: String,
    /// SPL token mint address
    pub token_mint: String,
    /// Amount in smallest token unit (string for precision)
    pub amount: String,
}

/// Response from a user withdrawal
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WithdrawalResponse {
    /// Transaction signature on Solana
    pub tx_signature: String,
    /// Transaction fee in lamports
    pub fee_lamports: i64,
}

/// Token balance information returned to the UI
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletBalancesResponse {
    pub sol_lamports: u64,
    pub tokens: Vec<TokenBalance>,
}

/// A single token balance entry
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenBalance {
    pub mint: String,
    pub amount: String,
    pub decimals: u8,
}

/// Query parameters for withdrawal history pagination
#[derive(Debug, serde::Deserialize)]
pub struct WithdrawalHistoryQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

/// A single item in the user withdrawal history response
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserWithdrawalHistoryItem {
    pub id: String,
    pub token_type: String,
    pub token_mint: Option<String>,
    pub amount: String,
    pub destination: String,
    pub tx_signature: String,
    pub fee_lamports: i64,
    pub created_at: String,
}

/// Response for GET /wallet/withdraw/history
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserWithdrawalHistoryResponse {
    pub items: Vec<UserWithdrawalHistoryItem>,
    pub total: u64,
}

/// Validate a base58-encoded Solana address
fn validate_destination(destination: &str) -> Result<(), AppError> {
    if destination.len() < 32 || destination.len() > 50 {
        return Err(AppError::Validation(
            "Invalid destination address length".into(),
        ));
    }
    if bs58::decode(destination).into_vec().is_err() {
        return Err(AppError::Validation(
            "Invalid destination address (not valid base58)".into(),
        ));
    }
    Ok(())
}

/// Check if user withdrawals feature is enabled
async fn check_feature_enabled<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
) -> Result<(), AppError> {
    let enabled = state
        .settings_service
        .get_bool("feature_user_withdrawals")
        .await?
        .unwrap_or(false);

    if !enabled {
        return Err(AppError::NotFound("User withdrawals not enabled".into()));
    }
    Ok(())
}

/// Reconstruct private key from wallet material + cached unlock key.
/// Returns the base58-encoded private key (zeroized on drop) and the user ID.
async fn reconstruct_key<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
) -> Result<(zeroize::Zeroizing<String>, uuid::Uuid), AppError> {
    let auth_user = authenticate(state, headers).await?;

    let wallet_material = state
        .wallet_material_repo
        .find_default_by_user(auth_user.user_id)
        .await?
        .ok_or_else(|| {
            AppError::NotFound("SSS wallet not enrolled. Withdrawals require SSS wallet.".into())
        })?;

    let session_id = auth_user.session_id.ok_or_else(|| {
        AppError::Unauthorized("Session required for embedded wallet operations".into())
    })?;

    let cached_key = state
        .wallet_unlock_cache
        .get(session_id)
        .await
        .ok_or_else(|| {
            AppError::Unauthorized("Wallet is locked. Call POST /wallet/unlock first.".into())
        })?;

    let user_private_key = state
        .wallet_signing_service
        .reconstruct_private_key(&wallet_material, &cached_key)
        .map_err(|e| {
            tracing::error!(error = %e, "Failed to reconstruct private key for withdrawal");
            AppError::Internal(anyhow::anyhow!("Failed to reconstruct wallet key"))
        })?;

    Ok((user_private_key, auth_user.user_id))
}

/// GET /wallet/withdraw/balances
///
/// Get SOL balance + all SPL token balances for the authenticated user's wallet.
/// Only requires authentication (wallet does not need to be unlocked).
pub async fn withdraw_balances<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<WalletBalancesResponse>, AppError> {
    check_feature_enabled(&state).await?;

    let auth_user = authenticate(&state, &headers).await?;

    // Get wallet material to find the pubkey (no unlock required)
    let wallet_material = state
        .wallet_material_repo
        .find_default_by_user(auth_user.user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("SSS wallet not enrolled".into()))?;

    let wallet_address = &wallet_material.solana_pubkey;

    let sidecar = state.privacy_sidecar_client.clone().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("Privacy sidecar client not configured"))
    })?;

    let balances = sidecar.get_wallet_balances(wallet_address).await?;

    Ok(Json(WalletBalancesResponse {
        sol_lamports: balances.sol_lamports,
        tokens: balances
            .tokens
            .into_iter()
            .map(|t| TokenBalance {
                mint: t.mint,
                amount: t.amount,
                decimals: t.decimals,
            })
            .collect(),
    }))
}

/// POST /wallet/withdraw/sol
///
/// Withdraw SOL from the user's embedded wallet to an external Solana address.
/// Requires `feature_user_withdrawals` enabled and unlocked wallet.
pub async fn withdraw_sol<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<WithdrawSolRequest>,
) -> Result<Json<WithdrawalResponse>, AppError> {
    check_feature_enabled(&state).await?;

    validate_destination(&request.destination)?;
    if request.amount_lamports == 0 {
        return Err(AppError::Validation(
            "amount_lamports must be positive".into(),
        ));
    }

    let (user_private_key, user_id) = reconstruct_key(&state, &headers).await?;

    let sidecar = state.privacy_sidecar_client.clone().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("Privacy sidecar client not configured"))
    })?;

    tracing::info!(
        user_id = %user_id,
        destination = %request.destination,
        amount_lamports = request.amount_lamports,
        "User SOL withdrawal initiated"
    );

    let result = sidecar
        .transfer_sol(
            &user_private_key,
            &request.destination,
            request.amount_lamports,
        )
        .await?;

    tracing::info!(
        user_id = %user_id,
        tx_signature = %result.tx_signature,
        "User SOL withdrawal completed"
    );

    // Log the withdrawal (failure must not fail the response — tx already sent)
    if let Err(e) = state
        .user_withdrawal_log_repo
        .create(UserWithdrawalLogEntry::new(
            user_id,
            "sol",
            None,
            request.amount_lamports as i64,
            &request.destination,
            &result.tx_signature,
            result.fee_lamports,
        ))
        .await
    {
        tracing::error!(error = %e, user_id = %user_id, "Failed to log user SOL withdrawal");
    }

    Ok(Json(WithdrawalResponse {
        tx_signature: result.tx_signature,
        fee_lamports: result.fee_lamports,
    }))
}

/// POST /wallet/withdraw/spl
///
/// Withdraw any SPL token from the user's embedded wallet to an external address.
/// Requires `feature_user_withdrawals` enabled and unlocked wallet.
pub async fn withdraw_spl<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<WithdrawSplRequest>,
) -> Result<Json<WithdrawalResponse>, AppError> {
    check_feature_enabled(&state).await?;

    validate_destination(&request.destination)?;

    // Validate token_mint is a valid base58 address
    if request.token_mint.len() < 32
        || request.token_mint.len() > 50
        || bs58::decode(&request.token_mint).into_vec().is_err()
    {
        return Err(AppError::Validation(
            "token_mint must be a valid Solana address".into(),
        ));
    }

    // Validate amount
    let amount_val: u64 = request
        .amount
        .parse()
        .map_err(|_| AppError::Validation("amount must be a valid integer string".into()))?;
    if amount_val == 0 {
        return Err(AppError::Validation("amount must be positive".into()));
    }

    let (user_private_key, user_id) = reconstruct_key(&state, &headers).await?;

    let sidecar = state.privacy_sidecar_client.clone().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("Privacy sidecar client not configured"))
    })?;

    tracing::info!(
        user_id = %user_id,
        destination = %request.destination,
        token_mint = %request.token_mint,
        amount = %request.amount,
        "User SPL withdrawal initiated"
    );

    let result = sidecar
        .transfer_spl(
            &user_private_key,
            &request.destination,
            &request.token_mint,
            &request.amount,
        )
        .await?;

    tracing::info!(
        user_id = %user_id,
        tx_signature = %result.tx_signature,
        "User SPL withdrawal completed"
    );

    // Log the withdrawal (failure must not fail the response — tx already sent)
    if let Err(e) = state
        .user_withdrawal_log_repo
        .create(UserWithdrawalLogEntry::new(
            user_id,
            "spl",
            Some(&request.token_mint),
            amount_val as i64,
            &request.destination,
            &result.tx_signature,
            result.fee_lamports,
        ))
        .await
    {
        tracing::error!(error = %e, user_id = %user_id, "Failed to log user SPL withdrawal");
    }

    Ok(Json(WithdrawalResponse {
        tx_signature: result.tx_signature,
        fee_lamports: result.fee_lamports,
    }))
}

/// GET /wallet/withdraw/history
///
/// Get paginated withdrawal history for the authenticated user.
/// Requires `feature_user_withdrawals` enabled and authentication.
pub async fn withdraw_history<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<WithdrawalHistoryQuery>,
) -> Result<Json<UserWithdrawalHistoryResponse>, AppError> {
    check_feature_enabled(&state).await?;

    let auth_user = authenticate(&state, &headers).await?;
    let limit = params.limit.unwrap_or(10).min(100);
    let offset = params.offset.unwrap_or(0);

    let entries = state
        .user_withdrawal_log_repo
        .find_by_user(auth_user.user_id, limit, offset)
        .await?;
    let total = state
        .user_withdrawal_log_repo
        .count_by_user(auth_user.user_id)
        .await?;

    let items = entries
        .into_iter()
        .map(|e| UserWithdrawalHistoryItem {
            id: e.id.to_string(),
            token_type: e.token_type,
            token_mint: e.token_mint,
            amount: e.amount.to_string(),
            destination: e.destination,
            tx_signature: e.tx_signature,
            fee_lamports: e.fee_lamports,
            created_at: e.created_at.to_rfc3339(),
        })
        .collect();

    Ok(Json(UserWithdrawalHistoryResponse { items, total }))
}
