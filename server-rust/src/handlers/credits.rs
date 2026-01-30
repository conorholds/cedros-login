//! Credit balance and transaction history handlers
//!
//! GET /credits/balance - Get all credit balances
//! GET /credits/balance/sol - Get SOL credit balance
//! GET /credits/history - Get transaction history
//! GET /credits/holds - Get pending credit holds
//! GET /credits/usage - Get usage analytics
//! POST /credits/refund-request - Submit a refund request

use axum::{
    extract::{Query, State},
    http::HeaderMap,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{
    BalancesResponse, CreditBalanceResponse, CreditHistoryResponse, CreditUsageResponse,
    PendingHoldsResponse, RefundRequestInput, RefundRequestResponse,
};
use crate::repositories::{CreditRefundRequestEntity};
use crate::services::{CreditService, EmailService};
use crate::utils::authenticate;
use crate::AppState;

/// Query parameters for credit history
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreditHistoryParams {
    /// Currency filter (optional, defaults to all)
    pub currency: Option<String>,
    /// Transaction type filter: "deposit", "spend", or "adjustment"
    pub tx_type: Option<String>,
    /// Limit (max 100, default 20)
    #[serde(default = "default_limit")]
    pub limit: u32,
    /// Offset for pagination (default 0)
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    20
}

/// GET /credits/balance - Get user's credit balances (all currencies)
pub async fn get_balance<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<BalancesResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Credits not enabled".into()));
    }

    let auth_user = authenticate(&state, &headers).await?;

    // Create credit service
    let credit_service =
        CreditService::new(state.credit_repo.clone(), state.credit_hold_repo.clone());

    // Get all balances
    let balances = credit_service.get_all_balances(auth_user.user_id).await?;

    Ok(Json(BalancesResponse {
        balances: balances.into_iter().map(Into::into).collect(),
    }))
}

/// GET /credits/balance/sol - Get user's SOL credit balance
pub async fn get_sol_balance<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<CreditBalanceResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Credits not enabled".into()));
    }

    let auth_user = authenticate(&state, &headers).await?;

    // Create credit service
    let credit_service =
        CreditService::new(state.credit_repo.clone(), state.credit_hold_repo.clone());

    // Get SOL balance
    let balance = credit_service.get_balance(auth_user.user_id, "SOL").await?;

    Ok(Json(balance.into()))
}

/// GET /credits/history - Get credit transaction history
pub async fn get_history<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<CreditHistoryParams>,
) -> Result<Json<CreditHistoryResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Credits not enabled".into()));
    }

    let auth_user = authenticate(&state, &headers).await?;

    // Cap limit at 100
    let limit = params.limit.min(100);

    // Create credit service
    let credit_service =
        CreditService::new(state.credit_repo.clone(), state.credit_hold_repo.clone());

    // Get transaction history
    let history = credit_service
        .get_history(
            auth_user.user_id,
            params.currency.as_deref(),
            params.tx_type.as_deref(),
            limit,
            params.offset,
        )
        .await?;

    Ok(Json(history.into()))
}

/// Query parameters for pending holds
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingHoldsParams {
    /// Currency filter (optional, defaults to all)
    pub currency: Option<String>,
}

/// GET /credits/holds - Get user's pending credit holds
pub async fn get_pending_holds<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<PendingHoldsParams>,
) -> Result<Json<PendingHoldsResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Credits not enabled".into()));
    }

    let auth_user = authenticate(&state, &headers).await?;

    // Create credit service
    let credit_service =
        CreditService::new(state.credit_repo.clone(), state.credit_hold_repo.clone());

    // Get pending holds
    let holds = credit_service
        .get_pending_holds(auth_user.user_id, params.currency.as_deref())
        .await?;

    let total_held: i64 = holds.iter().map(|h| h.amount).sum();

    Ok(Json(PendingHoldsResponse {
        holds: holds.into_iter().map(Into::into).collect(),
        total_held_lamports: total_held,
    }))
}

/// Query parameters for usage analytics
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreditUsageParams {
    /// Currency to get stats for (default: "SOL")
    #[serde(default = "default_sol")]
    pub currency: String,
}

fn default_sol() -> String {
    "SOL".to_string()
}

/// GET /credits/usage - Get credit usage analytics
///
/// Returns user's credit usage statistics including total deposited,
/// total spent, and transaction counts.
pub async fn get_usage<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<CreditUsageParams>,
) -> Result<Json<CreditUsageResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Credits not enabled".into()));
    }

    let auth_user = authenticate(&state, &headers).await?;

    // Create credit service
    let credit_service =
        CreditService::new(state.credit_repo.clone(), state.credit_hold_repo.clone());

    // Get user stats
    let stats = credit_service
        .get_user_stats(auth_user.user_id, &params.currency)
        .await?;

    Ok(Json(stats.into()))
}

/// POST /credits/refund-request - Submit a refund request
///
/// Allows users to request a refund for credits. The request is sent
/// to admins for review via the notification system. Once approved,
/// admins can issue the refund via the adjustment endpoint.
pub async fn request_refund<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(input): Json<RefundRequestInput>,
) -> Result<Json<RefundRequestResponse>, AppError> {
    if !state.config.privacy.enabled {
        return Err(AppError::NotFound("Credits not enabled".into()));
    }

    let auth_user = authenticate(&state, &headers).await?;

    // Validate input
    if input.amount_lamports <= 0 {
        return Err(AppError::Validation(
            "Refund amount must be positive".into(),
        ));
    }

    let reason = input.reason.trim();
    if reason.is_empty() {
        return Err(AppError::Validation("Reason is required".into()));
    }

    if reason.len() > 1000 {
        return Err(AppError::Validation(
            "Reason must be 1000 characters or less".into(),
        ));
    }

    // Validate original transaction exists and belongs to user
    let original_tx = state
        .credit_repo
        .find_transaction_by_id(input.transaction_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Original transaction not found".into()))?;

    if original_tx.user_id != auth_user.user_id {
        return Err(AppError::Forbidden(
            "Cannot refund another user's transaction".into(),
        ));
    }

    if original_tx.amount <= 0 {
        return Err(AppError::Validation(
            "Only positive credit transactions can be refunded".into(),
        ));
    }

    if input.amount_lamports > original_tx.amount {
        return Err(AppError::Validation(
            "Refund amount cannot exceed original transaction amount".into(),
        ));
    }

    // Persist the refund request for admin workflow
    let entity = CreditRefundRequestEntity::new(
        auth_user.user_id,
        input.transaction_id,
        input.amount_lamports,
        original_tx.currency.clone(),
        reason.to_string(),
    )?;
    let created = state.credit_refund_request_repo.create(entity).await?;

    // Get user email for the notification
    let user = state.user_repo.find_by_id(auth_user.user_id).await?;
    let user_email = user.as_ref().and_then(|u| u.email.as_deref());

    // Queue the refund request notification
    let request_id = state
        .comms_service
        .notify_refund_requested(
            auth_user.user_id,
            user_email,
            input.amount_lamports,
            &original_tx.currency,
            Some(input.transaction_id),
            reason,
        )
        .await?;

    tracing::info!(
        user_id = %auth_user.user_id,
        amount_lamports = input.amount_lamports,
        currency = %original_tx.currency,
        transaction_id = %input.transaction_id,
        refund_request_id = %created.id,
        request_id = %request_id,
        "Refund request submitted"
    );

    Ok(Json(RefundRequestResponse {
        submitted: true,
        message: "Refund request submitted. You will be notified once it has been reviewed."
            .to_string(),
        request_id: created.id,
    }))
}
