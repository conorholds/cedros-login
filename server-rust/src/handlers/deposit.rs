//! Privacy deposit handlers
//!
//! POST /deposit - Execute a privacy deposit (SSS embedded wallet)
//! GET /deposit/status/{session_id} - Check deposit status
//! GET /deposit/config - Get deposit configuration with tier thresholds
//! POST /deposit/cancel/{session_id} - Cancel a deposit (not supported)
//! GET /deposits - List deposits for authenticated user
//!
//! Tiered deposit handlers (public, micro) are in deposit_tiered.rs.

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

#[cfg(feature = "postgres")]
use sqlx::FromRow;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{
    ConfirmSplDepositRequest, ConfirmSplDepositResponse, DepositConfigResponse,
    DepositItemResponse, DepositListResponse, DepositStatusResponse, MessageResponse,
    PendingSplDepositItemResponse, PendingSplDepositListResponse,
};
use crate::services::{DepositService, EmailService, SolPriceService};
use crate::utils::authenticate;
use crate::AppState;

/// Request to execute a privacy deposit
#[derive(Debug, serde::Deserialize)]
pub struct PrivacyDepositRequest {
    /// Amount to deposit in lamports
    pub amount_lamports: u64,
}

/// Response from executing a privacy deposit
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PrivacyDepositResponse {
    /// Session ID for tracking
    pub session_id: Uuid,
    /// Transaction signature on Solana
    pub tx_signature: String,
    /// Amount deposited in lamports
    pub amount_lamports: i64,
    /// Human-readable message
    pub message: String,
    /// When withdrawal becomes available
    pub withdrawal_available_at: chrono::DateTime<chrono::Utc>,
}

/// Helper to create a DepositService from AppState
pub(crate) fn create_deposit_service<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
) -> Result<DepositService, AppError> {
    let sidecar = state.privacy_sidecar_client.clone().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("Privacy sidecar client not configured"))
    })?;

    Ok(DepositService::new(
        state.deposit_repo.clone(),
        state.credit_repo.clone(),
        sidecar,
        state.deposit_credit_service.clone(),
        &state.config.privacy,
    ))
}

/// POST /deposit - Execute a privacy deposit for SSS embedded wallet
///
/// Deposits to the user's Privacy Cash account using their SSS keypair.
/// Server stores Share B during privacy period for later withdrawal.
///
/// Requirements:
/// - User must have SSS wallet enrolled
/// - Wallet must be unlocked (cached encryption key)
/// - Wallet must be enrolled in "no recovery" mode (prevents user front-running withdrawals)
pub async fn execute_deposit<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<PrivacyDepositRequest>,
) -> Result<Json<PrivacyDepositResponse>, AppError> {
    // Verify privacy deposits are enabled
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Privacy deposits not enabled".into()));
    }

    // Verify wallet is configured for no-recovery mode
    // This is required for Privacy Cash to prevent users from front-running withdrawals
    use crate::config::WalletRecoveryMode;
    if state.config.wallet.recovery_mode != WalletRecoveryMode::None {
        return Err(AppError::Validation(
            "Privacy deposits require no-recovery wallet mode. Contact administrator.".into(),
        ));
    }

    // Authenticate user
    let auth_user = authenticate(&state, &headers).await?;

    // Get wallet material - user must have enrolled SSS wallet
    let wallet_material = state
        .wallet_material_repo
        .find_by_user(auth_user.user_id)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(
                "SSS wallet not enrolled. Privacy deposits require SSS wallet.".into(),
            )
        })?;

    // Get session ID for wallet unlock cache
    let session_id_for_cache = auth_user.session_id.ok_or_else(|| {
        AppError::Unauthorized("Session required for embedded wallet operations".into())
    })?;

    // Get cached encryption key (wallet must be unlocked)
    let cached_key = state
        .wallet_unlock_cache
        .get(session_id_for_cache)
        .await
        .ok_or_else(|| {
            AppError::Unauthorized("Wallet is locked. Call POST /wallet/unlock first.".into())
        })?;

    // Reconstruct the user's private key from SSS shares
    let user_private_key = state
        .wallet_signing_service
        .reconstruct_private_key(&wallet_material, &cached_key)
        .map_err(|e| {
            tracing::error!(error = %e, "Failed to reconstruct private key for deposit");
            AppError::Internal(anyhow::anyhow!("Failed to reconstruct wallet key"))
        })?;

    // Encrypt private key for storage during privacy period (for later withdrawal)
    // We use NoteEncryptionService which uses a server-side AES-256-GCM key
    let note_encryption = state
        .note_encryption_service
        .as_ref()
        .ok_or_else(|| AppError::Config("Note encryption not configured".into()))?;

    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
    let encrypted = note_encryption.encrypt(user_private_key.as_bytes())?;

    // Store as: nonce (12 bytes) + ciphertext, all base64 encoded
    let mut combined = encrypted.nonce;
    combined.extend(&encrypted.ciphertext);
    let encrypted_private_key = BASE64.encode(&combined);

    // Read privacy period from database settings
    let privacy_period_secs = state
        .settings_service
        .get_u64("privacy_period_secs")
        .await?
        .unwrap_or(604800); // 7 days default

    // Create deposit service
    let deposit_service = create_deposit_service(&state)?;

    // Execute the deposit
    let result = deposit_service
        .execute_deposit(
            auth_user.user_id,
            &user_private_key,
            &encrypted_private_key,
            request.amount_lamports,
            privacy_period_secs,
        )
        .await?;

    let sol_amount = result.amount_lamports as f64 / 1_000_000_000.0;

    Ok(Json(PrivacyDepositResponse {
        session_id: result.session_id,
        tx_signature: result.tx_signature,
        amount_lamports: result.amount_lamports,
        message: format!("Successfully deposited {:.4} SOL", sol_amount),
        withdrawal_available_at: result.withdrawal_available_at,
    }))
}

/// GET /deposit/status/{session_id} - Get deposit session status
pub async fn deposit_status<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(session_id): Path<Uuid>,
) -> Result<Json<DepositStatusResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Privacy deposits not enabled".into()));
    }

    let auth_user = authenticate(&state, &headers).await?;

    // Create deposit service
    let deposit_service = create_deposit_service(&state)?;

    // Get the session
    let session = deposit_service
        .get_session(session_id, auth_user.user_id)
        .await?;

    Ok(Json(DepositStatusResponse::from(&session)))
}

/// Default private deposit minimum in lamports (0.25 SOL)
const DEFAULT_PRIVATE_MIN_LAMPORTS: u64 = 250_000_000;
/// Lamports per SOL
const LAMPORTS_PER_SOL: f64 = 1_000_000_000.0;
/// Jupiter minimum swap USD value
const JUPITER_MIN_USD: f64 = 10.0;
const DEFAULT_QUICK_ACTION_TOKENS: &str = "USDC,USDT,EURC";
const DEFAULT_CUSTOM_TOKENS: &str = "SOL,USDC,USDT,EURC,USD1,PYUSD,USDH,CASH,BONK,ORE";

/// Token mint addresses for price lookups (non-stablecoin tokens)
const BONK_MINT: &str = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
const ORE_MINT: &str = "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp";
const EURC_MINT: &str = "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr";

fn parse_token_list(value: String) -> Vec<String> {
    value
        .split(',')
        .map(|token| token.trim())
        .filter(|token| !token.is_empty())
        .map(|token| token.to_uppercase())
        .collect()
}

/// GET /deposit/config - Get deposit configuration with tier thresholds
pub async fn deposit_config<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Result<Json<DepositConfigResponse>, AppError> {
    // Read privacy period from database settings
    let privacy_period_secs = state
        .settings_service
        .get_u64("privacy_period_secs")
        .await?
        .unwrap_or(604800); // 7 days default

    // Get current SOL price
    let sol_price_usd = state.sol_price_service.get_sol_price_usd().await?;

    // Get private deposit minimum (configurable via admin settings)
    let private_min_lamports = state
        .settings_service
        .get_u64("private_deposit_min_lamports")
        .await?
        .unwrap_or(DEFAULT_PRIVATE_MIN_LAMPORTS);

    // Calculate tier thresholds
    let private_min_sol = private_min_lamports as f64 / LAMPORTS_PER_SOL;
    let private_min_usd_raw = private_min_sol * sol_price_usd;
    // Round up to nearest $5 (favors company)
    let private_min_usd = SolPriceService::round_up_to_nearest_5(private_min_usd_raw);

    // Company wallet and currency from config
    let company_wallet = state
        .config
        .privacy
        .company_wallet_address
        .clone()
        .unwrap_or_default();
    let company_currency = state.config.privacy.company_currency.clone();

    // Get treasury wallet for micro deposits (global fallback)
    let treasury_config = state.treasury_config_repo.find_for_org(None).await?;
    let micro_deposit_address = treasury_config.map(|c| c.wallet_address);

    // Get micro batch threshold (default: $10 = Jupiter minimum)
    let micro_batch_threshold_usd = state
        .settings_service
        .get_u64("micro_batch_threshold_usd")
        .await?
        .map(|v| v as f64)
        .unwrap_or(JUPITER_MIN_USD);

    // Get fee configuration for display
    let fee_config = state.deposit_credit_service.get_fee_config().await?;
    let fee_policy = match fee_config.policy {
        crate::services::FeePolicy::CompanyPaysAll => "company_pays_all",
        crate::services::FeePolicy::UserPaysSwap => "user_pays_swap",
        crate::services::FeePolicy::UserPaysPrivacy => "user_pays_privacy",
        crate::services::FeePolicy::UserPaysAll => "user_pays_all",
    };

    let quick_action_tokens = state
        .settings_service
        .get("deposit_quick_action_tokens")
        .await?
        .unwrap_or_else(|| DEFAULT_QUICK_ACTION_TOKENS.to_string());
    let custom_token_symbols = state
        .settings_service
        .get("deposit_custom_tokens")
        .await?
        .unwrap_or_else(|| DEFAULT_CUSTOM_TOKENS.to_string());

    // Fetch prices for non-stablecoin tokens (BONK, ORE, EURC)
    // SOL price already fetched above; stablecoins are assumed $1
    let token_mints = &[BONK_MINT, ORE_MINT, EURC_MINT];
    let mint_prices = state
        .sol_price_service
        .get_token_prices(token_mints)
        .await
        .unwrap_or_default();

    // Build symbol -> price map
    let mut token_prices = std::collections::HashMap::new();
    token_prices.insert("SOL".to_string(), sol_price_usd);
    if let Some(&price) = mint_prices.get(BONK_MINT) {
        token_prices.insert("BONK".to_string(), price);
    }
    if let Some(&price) = mint_prices.get(ORE_MINT) {
        token_prices.insert("ORE".to_string(), price);
    }
    if let Some(&price) = mint_prices.get(EURC_MINT) {
        token_prices.insert("EURC".to_string(), price);
    }

    // Private deposits require no-recovery wallet mode (to prevent front-running)
    use crate::config::WalletRecoveryMode;
    let private_deposits_enabled = state.config.wallet.recovery_mode == WalletRecoveryMode::None;

    Ok(Json(DepositConfigResponse {
        enabled: state.config.privacy.enabled,
        private_deposits_enabled,
        privacy_period_secs,
        company_wallet,
        company_currency,
        sol_price_usd,
        token_prices,
        private_min_sol,
        private_min_usd,
        public_min_usd: JUPITER_MIN_USD,
        sol_micro_max_usd: JUPITER_MIN_USD,
        supported_currencies: vec!["SOL".to_string(), "USDC".to_string(), "USDT".to_string()],
        quick_action_tokens: parse_token_list(quick_action_tokens),
        custom_token_symbols: parse_token_list(custom_token_symbols),
        micro_deposit_address,
        micro_batch_threshold_usd,
        fee_policy: fee_policy.to_string(),
        privacy_fee_percent: fee_config.privacy_percent_bps as f64 / 100.0,
        privacy_fee_fixed_lamports: fee_config.privacy_fixed_lamports,
        swap_fee_percent: fee_config.swap_percent_bps as f64 / 100.0,
        swap_fee_fixed_lamports: fee_config.swap_fixed_lamports,
        company_fee_percent: fee_config.company_percent_bps as f64 / 100.0,
        company_fee_fixed_lamports: fee_config.company_fixed_lamports,
    }))
}

/// Placeholder response for cancel - deposits cannot be cancelled after execution
pub async fn cancel_deposit<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(_session_id): Path<Uuid>,
) -> Result<Json<MessageResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Privacy deposits not enabled".into()));
    }

    let _auth_user = authenticate(&state, &headers).await?;

    // In the new flow, deposits are executed immediately and cannot be cancelled
    Err(AppError::Validation(
        "Privacy deposits cannot be cancelled after execution".into(),
    ))
}

/// Query params for listing deposits
#[derive(Debug, serde::Deserialize)]
pub struct ListDepositsQuery {
    /// Max number of deposits to return (default: 20, max: 100)
    #[serde(default = "default_limit")]
    pub limit: u32,
    /// Offset for pagination (default: 0)
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    20
}

/// GET /deposits - List deposits for authenticated user
pub async fn list_deposits<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<ListDepositsQuery>,
) -> Result<Json<DepositListResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Privacy deposits not enabled".into()));
    }

    let auth_user = authenticate(&state, &headers).await?;

    // Clamp limit to max 100
    let limit = query.limit.min(100);

    // Create deposit service
    let deposit_service = create_deposit_service(&state)?;

    // List deposits
    let result = deposit_service
        .list_deposits(auth_user.user_id, limit, query.offset)
        .await?;

    Ok(Json(DepositListResponse {
        deposits: result
            .deposits
            .iter()
            .map(DepositItemResponse::from)
            .collect(),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
    }))
}

// =============================================================================
// Pending SPL Deposits
// =============================================================================

#[cfg(feature = "postgres")]
#[derive(Debug, FromRow)]
struct PendingSplDepositRow {
    id: Uuid,
    wallet_address: String,
    token_mint: String,
    token_amount_raw: String,
    token_amount: Option<i64>,
    tx_signature: String,
    created_at: chrono::DateTime<chrono::Utc>,
    expires_at: chrono::DateTime<chrono::Utc>,
}

/// GET /deposit/pending-spl - List pending SPL deposits awaiting user confirmation
pub async fn list_pending_spl_deposits<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<ListDepositsQuery>,
) -> Result<Json<PendingSplDepositListResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Privacy deposits not enabled".into()));
    }

    let auth_user = authenticate(&state, &headers).await?;
    let limit = query.limit.min(100);

    #[cfg(feature = "postgres")]
    let pool = state.postgres_pool.as_ref().ok_or_else(|| {
        AppError::Config("Postgres pool is required for pending SPL deposits".into())
    })?;

    #[cfg(not(feature = "postgres"))]
    {
        let _ = auth_user;
        let _ = limit;
        return Err(AppError::Config(
            "Pending SPL deposits require the 'postgres' feature".into(),
        ));
    }

    #[cfg(feature = "postgres")]
    {
        let rows: Vec<PendingSplDepositRow> = sqlx::query_as(
            r#"
            SELECT id, wallet_address, token_mint, token_amount_raw, token_amount,
                   tx_signature, created_at, expires_at
            FROM pending_spl_deposits
            WHERE user_id = $1
              AND status = 'pending'
              AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(auth_user.user_id)
        .bind(limit as i64)
        .bind(query.offset as i64)
        .fetch_all(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let total: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*)
            FROM pending_spl_deposits
            WHERE user_id = $1
              AND status = 'pending'
              AND expires_at > NOW()
            "#,
        )
        .bind(auth_user.user_id)
        .fetch_one(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let deposits = rows
            .into_iter()
            .filter_map(|r| {
                let token_amount = r.token_amount?;
                Some(PendingSplDepositItemResponse {
                    id: r.id,
                    wallet_address: r.wallet_address,
                    token_mint: r.token_mint,
                    token_amount_raw: r.token_amount_raw,
                    token_amount,
                    tx_signature: r.tx_signature,
                    created_at: r.created_at,
                    expires_at: r.expires_at,
                })
            })
            .collect();

        Ok(Json(PendingSplDepositListResponse {
            deposits,
            total: total as u64,
            limit,
            offset: query.offset,
        }))
    }
}

/// POST /deposit/confirm-spl - Confirm and process a pending SPL deposit
pub async fn confirm_spl_deposit<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<ConfirmSplDepositRequest>,
) -> Result<Json<ConfirmSplDepositResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Privacy deposits not enabled".into()));
    }

    // Privacy deposits require no-recovery wallet mode
    use crate::config::WalletRecoveryMode;
    if state.config.wallet.recovery_mode != WalletRecoveryMode::None {
        return Err(AppError::Validation(
            "Privacy deposits require no-recovery wallet mode. Contact administrator.".into(),
        ));
    }

    let auth_user = authenticate(&state, &headers).await?;

    #[cfg(feature = "postgres")]
    let pool = state.postgres_pool.as_ref().ok_or_else(|| {
        AppError::Config("Postgres pool is required for confirming SPL deposits".into())
    })?;

    #[cfg(not(feature = "postgres"))]
    {
        let _ = auth_user;
        let _ = request;
        return Err(AppError::Config(
            "Confirming SPL deposits requires the 'postgres' feature".into(),
        ));
    }

    // Fetch and atomically claim the pending record
    #[cfg(feature = "postgres")]
    let pending: PendingSplDepositRow = {
        let row = sqlx::query_as::<_, PendingSplDepositRow>(
            r#"
            UPDATE pending_spl_deposits
            SET status = 'processing'
            WHERE id = $1
              AND user_id = $2
              AND status = 'pending'
              AND expires_at > NOW()
            RETURNING id, wallet_address, token_mint, token_amount_raw, token_amount,
                      tx_signature, created_at, expires_at
            "#,
        )
        .bind(request.pending_id)
        .bind(auth_user.user_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.ok_or_else(|| AppError::NotFound("Pending SPL deposit not found".into()))?
    };

    let token_amount = pending
        .token_amount
        .ok_or_else(|| AppError::Validation("Pending SPL deposit missing token_amount".into()))?;

    // CRITICAL: Defense-in-depth validation - verify token is still whitelisted
    // (Token may have been removed from whitelist since webhook received deposit)
    if !state.config.privacy.is_token_whitelisted(&pending.token_mint) {
        tracing::warn!(
            pending_id = %pending.id,
            token_mint = %pending.token_mint,
            user_id = %auth_user.user_id,
            "Attempted to confirm deposit with non-whitelisted token"
        );
        return Err(AppError::Validation(format!(
            "Token {} is not whitelisted for deposits",
            pending.token_mint
        )));
    }

    // Get wallet material - user must have enrolled SSS wallet
    let wallet_material = state
        .wallet_material_repo
        .find_by_user(auth_user.user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("SSS wallet not enrolled".into()))?;

    // Get session ID for wallet unlock cache
    let session_id_for_cache = auth_user.session_id.ok_or_else(|| {
        AppError::Unauthorized("Session required for embedded wallet operations".into())
    })?;

    // Get cached encryption key (wallet must be unlocked)
    let cached_key = state
        .wallet_unlock_cache
        .get(session_id_for_cache)
        .await
        .ok_or_else(|| {
            AppError::Unauthorized("Wallet is locked. Call POST /wallet/unlock first.".into())
        })?;

    // Reconstruct the user's private key from SSS shares
    let user_private_key = state
        .wallet_signing_service
        .reconstruct_private_key(&wallet_material, &cached_key)
        .map_err(|e| {
            tracing::error!(error = %e, "Failed to reconstruct private key for SPL deposit");
            AppError::Internal(anyhow::anyhow!("Failed to reconstruct wallet key"))
        })?;

    // Encrypt private key for storage during privacy period (for later withdrawal)
    let note_encryption = state
        .note_encryption_service
        .as_ref()
        .ok_or_else(|| AppError::Config("Note encryption not configured".into()))?;

    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
    let encrypted = note_encryption.encrypt(user_private_key.as_bytes())?;
    let mut combined = encrypted.nonce;
    combined.extend(&encrypted.ciphertext);
    let encrypted_private_key = BASE64.encode(&combined);

    // Read privacy period from database settings
    let privacy_period_secs = state
        .settings_service
        .get_u64("privacy_period_secs")
        .await?
        .unwrap_or(604800);

    let deposit_service = create_deposit_service(&state)?;

    let result = deposit_service
        .execute_spl_deposit(
            auth_user.user_id,
            &user_private_key,
            &encrypted_private_key,
            &pending.token_mint,
            &token_amount.to_string(),
            privacy_period_secs,
        )
        .await;

    #[cfg(feature = "postgres")]
    match result {
        Ok(ok) => {
            let _ = sqlx::query(
                r#"
                UPDATE pending_spl_deposits
                SET status = 'completed',
                    deposit_session_id = $2,
                    processed_at = NOW(),
                    error_message = NULL
                WHERE id = $1
                "#,
            )
            .bind(pending.id)
            .bind(ok.session_id)
            .execute(pool)
            .await;

            Ok(Json(ConfirmSplDepositResponse {
                success: true,
                pending_id: pending.id,
                deposit_session_id: Some(ok.session_id),
                swap_tx_signature: Some(ok.swap_tx_signature),
                deposit_tx_signature: Some(ok.deposit_tx_signature),
                error: None,
            }))
        }
        Err(e) => {
            let msg = e.to_string();
            let _ = sqlx::query(
                r#"
                UPDATE pending_spl_deposits
                SET status = 'failed',
                    processed_at = NOW(),
                    error_message = $2
                WHERE id = $1
                "#,
            )
            .bind(pending.id)
            .bind(&msg)
            .execute(pool)
            .await;

            Ok(Json(ConfirmSplDepositResponse {
                success: false,
                pending_id: pending.id,
                deposit_session_id: None,
                swap_tx_signature: None,
                deposit_tx_signature: None,
                error: Some(msg),
            }))
        }
    }
}
