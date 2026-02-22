//! Admin deposit handlers for Privacy Cash management
//!
//! GET /admin/deposits - List all deposits (system admin only)
//! GET /admin/deposits/stats - Get deposit statistics (system admin only)
//! GET /admin/withdrawals/pending - List pending withdrawals (system admin only)
//! POST /admin/withdrawals/:id/process - Process a single withdrawal (system admin only)
//! POST /admin/withdrawals/process-all - Process all ready withdrawals (system admin only)

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::repositories::{DepositStats, DepositStatus};
use crate::services::EmailService;
use crate::AppState;

use super::users::validate_system_admin;

/// Query params for listing deposits
#[derive(Debug, serde::Deserialize)]
pub struct ListDepositsQuery {
    /// Filter by status (comma-separated: pending,completed,withdrawn)
    pub status: Option<String>,
    /// Max results (default: 20, max: 100)
    #[serde(default = "default_limit")]
    pub limit: u32,
    /// Offset for pagination
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    20
}

/// Admin deposit item response
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminDepositItem {
    pub id: String,
    pub user_id: String,
    pub wallet_address: String,
    pub status: String,
    pub amount_lamports: Option<i64>,
    pub tx_signature: Option<String>,
    pub withdrawal_tx_signature: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub completed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub withdrawal_available_at: Option<chrono::DateTime<chrono::Utc>>,
    pub error_message: Option<String>,
}

/// Admin deposit list response
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminDepositListResponse {
    pub deposits: Vec<AdminDepositItem>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

/// Admin deposit stats response
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminDepositStatsResponse {
    // Basic stats
    pub total_deposits: u64,
    pub total_deposited_lamports: i64,
    pub total_deposited_sol: f64,
    pub pending_withdrawal_count: u64,
    pub pending_withdrawal_lamports: i64,
    pub pending_withdrawal_sol: f64,
    pub total_withdrawn_count: u64,
    pub total_withdrawn_lamports: i64,
    pub total_withdrawn_sol: f64,
    pub failed_count: u64,

    // Ready vs in-privacy-period breakdown
    pub ready_for_withdrawal_count: u64,
    pub ready_for_withdrawal_lamports: i64,
    pub ready_for_withdrawal_sol: f64,
    pub in_privacy_period_count: u64,
    pub in_privacy_period_lamports: i64,
    pub in_privacy_period_sol: f64,

    // Input token breakdown (original deposit currency)
    pub usdc_deposit_count: u64,
    /// Total USDC deposited (in smallest unit, divide by 1_000_000 for display)
    pub total_usdc_input: i64,
    /// Total USDC deposited as display value (e.g., 100.50)
    pub total_usdc_display: f64,
    pub usdt_deposit_count: u64,
    /// Total USDT deposited (in smallest unit, divide by 1_000_000 for display)
    pub total_usdt_input: i64,
    /// Total USDT deposited as display value
    pub total_usdt_display: f64,
    pub native_sol_deposit_count: u64,
    /// Total native SOL deposited (in lamports)
    pub total_native_sol_input: i64,
    /// Total native SOL deposited as display value
    pub total_native_sol_display: f64,
}

impl From<DepositStats> for AdminDepositStatsResponse {
    fn from(stats: DepositStats) -> Self {
        Self {
            total_deposits: stats.total_deposits,
            total_deposited_lamports: stats.total_deposited_lamports,
            total_deposited_sol: stats.total_deposited_lamports as f64 / 1_000_000_000.0,
            pending_withdrawal_count: stats.pending_withdrawal_count,
            pending_withdrawal_lamports: stats.pending_withdrawal_lamports,
            pending_withdrawal_sol: stats.pending_withdrawal_lamports as f64 / 1_000_000_000.0,
            total_withdrawn_count: stats.total_withdrawn_count,
            total_withdrawn_lamports: stats.total_withdrawn_lamports,
            total_withdrawn_sol: stats.total_withdrawn_lamports as f64 / 1_000_000_000.0,
            failed_count: stats.failed_count,
            // Ready vs in-privacy-period
            ready_for_withdrawal_count: stats.ready_for_withdrawal_count,
            ready_for_withdrawal_lamports: stats.ready_for_withdrawal_lamports,
            ready_for_withdrawal_sol: stats.ready_for_withdrawal_lamports as f64 / 1_000_000_000.0,
            in_privacy_period_count: stats.in_privacy_period_count,
            in_privacy_period_lamports: stats.in_privacy_period_lamports,
            in_privacy_period_sol: stats.in_privacy_period_lamports as f64 / 1_000_000_000.0,
            // Input token breakdown (stablecoins have 6 decimals)
            usdc_deposit_count: stats.usdc_deposit_count,
            total_usdc_input: stats.total_usdc_input,
            total_usdc_display: stats.total_usdc_input as f64 / 1_000_000.0,
            usdt_deposit_count: stats.usdt_deposit_count,
            total_usdt_input: stats.total_usdt_input,
            total_usdt_display: stats.total_usdt_input as f64 / 1_000_000.0,
            native_sol_deposit_count: stats.native_sol_deposit_count,
            total_native_sol_input: stats.total_native_sol_input,
            total_native_sol_display: stats.total_native_sol_input as f64 / 1_000_000_000.0,
        }
    }
}

/// GET /admin/deposits - List all deposits
///
/// Requires system admin privileges.
pub async fn list_deposits<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<ListDepositsQuery>,
) -> Result<Json<AdminDepositListResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let limit = cap_limit(query.limit).min(100);
    let offset = cap_offset(query.offset);

    // Parse status filter
    let statuses: Option<Vec<DepositStatus>> = query.status.as_ref().map(|s| {
        s.split(',')
            .filter_map(|status| status.trim().parse().ok())
            .collect()
    });

    let statuses_ref: Option<&[DepositStatus]> = statuses.as_deref();

    // Fetch deposits and count in parallel
    let (deposits_result, total_result) = tokio::join!(
        state.deposit_repo.list_all(statuses_ref, limit, offset),
        state.deposit_repo.count_all(statuses_ref)
    );
    let deposits = deposits_result?;
    let total = total_result?;

    let items: Vec<AdminDepositItem> = deposits
        .iter()
        .map(|d| AdminDepositItem {
            id: d.id.to_string(),
            user_id: d.user_id.to_string(),
            wallet_address: d.wallet_address.clone(),
            status: d.status.as_str().to_string(),
            amount_lamports: d.deposit_amount_lamports,
            tx_signature: d.privacy_deposit_tx_signature.clone(),
            withdrawal_tx_signature: d.withdrawal_tx_signature.clone(),
            created_at: d.created_at,
            completed_at: d.completed_at,
            withdrawal_available_at: d.withdrawal_available_at,
            error_message: d.error_message.clone(),
        })
        .collect();

    Ok(Json(AdminDepositListResponse {
        deposits: items,
        total,
        limit,
        offset,
    }))
}

/// GET /admin/deposits/in-privacy-period - List deposits still in privacy period
///
/// Returns deposits where privacy period has NOT elapsed (completed but not yet ready).
/// Requires system admin privileges.
pub async fn list_in_privacy_period<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<ListDepositsQuery>,
) -> Result<Json<AdminDepositListResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let limit = cap_limit(query.limit).min(100);
    let offset = cap_offset(query.offset);

    let now = chrono::Utc::now();
    let (deposits, total) = tokio::join!(
        state
            .deposit_repo
            .find_in_privacy_period(now, limit, offset),
        state.deposit_repo.count_in_privacy_period(now)
    );
    let deposits = deposits?;
    let total = total?;

    let items: Vec<AdminDepositItem> = deposits
        .iter()
        .map(|d| AdminDepositItem {
            id: d.id.to_string(),
            user_id: d.user_id.to_string(),
            wallet_address: d.wallet_address.clone(),
            status: d.status.as_str().to_string(),
            amount_lamports: d.deposit_amount_lamports,
            tx_signature: d.privacy_deposit_tx_signature.clone(),
            withdrawal_tx_signature: d.withdrawal_tx_signature.clone(),
            created_at: d.created_at,
            completed_at: d.completed_at,
            withdrawal_available_at: d.withdrawal_available_at,
            error_message: d.error_message.clone(),
        })
        .collect();

    Ok(Json(AdminDepositListResponse {
        deposits: items,
        total,
        limit,
        offset,
    }))
}

/// GET /admin/deposits/stats - Get deposit statistics
///
/// Requires system admin privileges.
pub async fn get_stats<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<AdminDepositStatsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let stats = state.deposit_repo.get_stats().await?;
    Ok(Json(AdminDepositStatsResponse::from(stats)))
}

/// GET /admin/withdrawals/pending - List pending withdrawals
///
/// Returns deposits where privacy period has elapsed but withdrawal hasn't completed.
/// Requires system admin privileges.
pub async fn list_pending_withdrawals<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<ListDepositsQuery>,
) -> Result<Json<AdminDepositListResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let limit = cap_limit(query.limit).min(100);
    let offset = cap_offset(query.offset);

    // Get deposits ready for withdrawal (paged)
    let now = chrono::Utc::now();
    let (deposits, total) = tokio::join!(
        state
            .deposit_repo
            .list_ready_for_withdrawal(now, limit, offset),
        state.deposit_repo.count_ready_for_withdrawal(now)
    );
    let deposits = deposits?;
    let total = total?;

    let items: Vec<AdminDepositItem> = deposits
        .iter()
        .map(|d| AdminDepositItem {
            id: d.id.to_string(),
            user_id: d.user_id.to_string(),
            wallet_address: d.wallet_address.clone(),
            status: d.status.as_str().to_string(),
            amount_lamports: d.deposit_amount_lamports,
            tx_signature: d.privacy_deposit_tx_signature.clone(),
            withdrawal_tx_signature: d.withdrawal_tx_signature.clone(),
            created_at: d.created_at,
            completed_at: d.completed_at,
            withdrawal_available_at: d.withdrawal_available_at,
            error_message: d.error_message.clone(),
        })
        .collect();

    Ok(Json(AdminDepositListResponse {
        deposits: items,
        total,
        limit,
        offset,
    }))
}

/// Request body for processing a single withdrawal
#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessWithdrawalRequest {
    /// Force early withdrawal (before privacy period ends)
    /// Requires explicit confirmation due to privacy implications
    #[serde(default)]
    pub force: bool,
}

/// Response for withdrawal processing
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessWithdrawalResponse {
    pub success: bool,
    pub session_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tx_signature: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    /// True if this was an early withdrawal (before privacy period)
    pub early_withdrawal: bool,
}

/// Response for batch withdrawal processing
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessAllWithdrawalsResponse {
    pub total_processed: u32,
    pub total_succeeded: u32,
    pub total_failed: u32,
    pub results: Vec<ProcessWithdrawalResponse>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessAllWithdrawalsQuery {
    /// Maximum withdrawals to process in this request (default 50, capped to 100)
    pub limit: Option<u32>,
}

fn cap_process_all_limit(limit: Option<u32>) -> u32 {
    let limit = limit.unwrap_or(50);
    cap_limit(limit).min(100)
}

/// POST /admin/withdrawals/:id/process - Process a single withdrawal
///
/// Forces processing of a specific withdrawal. With `force: true`, can process
/// withdrawals before the privacy period ends (admin override for emergencies).
///
/// Requires system admin privileges.
pub async fn process_withdrawal<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(session_id): Path<Uuid>,
    Json(request): Json<ProcessWithdrawalRequest>,
) -> Result<Json<ProcessWithdrawalResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    // Get the deposit session
    let session = state
        .deposit_repo
        .find_by_id(session_id)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Deposit session {} not found", session_id)))?;

    // Check if already withdrawn
    if session.status == DepositStatus::Withdrawn {
        return Err(AppError::Validation("Withdrawal already completed".into()));
    }

    // Check if deposit is completed (has funds to withdraw)
    if session.status != DepositStatus::Completed && session.status != DepositStatus::PendingRetry {
        return Err(AppError::Validation(format!(
            "Cannot withdraw: deposit status is '{}'",
            session.status.as_str()
        )));
    }

    // Check privacy period
    let now = chrono::Utc::now();
    let early_withdrawal = if let Some(available_at) = session.withdrawal_available_at {
        available_at > now
    } else {
        // No withdrawal_available_at means it was never set - shouldn't happen for completed deposits
        true
    };

    // Require force flag for early withdrawals
    if early_withdrawal && !request.force {
        return Err(AppError::Validation(
            "Privacy period has not ended. Use force=true for early withdrawal.".into(),
        ));
    }

    // Log early withdrawal for audit
    if early_withdrawal {
        tracing::warn!(
            session_id = %session_id,
            user_id = %session.user_id,
            "Admin initiating early withdrawal (before privacy period)"
        );
    }

    // Execute the withdrawal via deposit service
    let result = crate::services::execute_admin_withdrawal(&state, &session).await;

    match result {
        Ok(tx_signature) => {
            tracing::info!(
                session_id = %session_id,
                tx_signature = %tx_signature,
                early = early_withdrawal,
                "Admin withdrawal processed successfully"
            );
            Ok(Json(ProcessWithdrawalResponse {
                success: true,
                session_id: session_id.to_string(),
                tx_signature: Some(tx_signature),
                error: None,
                early_withdrawal,
            }))
        }
        Err(e) => {
            tracing::error!(
                session_id = %session_id,
                error = %e,
                "Admin withdrawal failed"
            );
            Ok(Json(ProcessWithdrawalResponse {
                success: false,
                session_id: session_id.to_string(),
                tx_signature: None,
                error: Some(e.to_string()),
                early_withdrawal,
            }))
        }
    }
}

/// POST /admin/withdrawals/process-all - Process all ready withdrawals
///
/// Processes all withdrawals that have passed their privacy period.
/// Does NOT process early withdrawals - use the single endpoint with force=true for those.
///
/// Requires system admin privileges.
pub async fn process_all_withdrawals<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<ProcessAllWithdrawalsQuery>,
) -> Result<Json<ProcessAllWithdrawalsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let limit = cap_process_all_limit(query.limit);

    // Get deposits ready for withdrawal (bounded)
    let now = chrono::Utc::now();
    let ready_sessions = state
        .deposit_repo
        .list_ready_for_withdrawal(now, limit, 0)
        .await?;

    if ready_sessions.is_empty() {
        return Ok(Json(ProcessAllWithdrawalsResponse {
            total_processed: 0,
            total_succeeded: 0,
            total_failed: 0,
            results: vec![],
        }));
    }

    tracing::info!(
        count = ready_sessions.len(),
        limit = limit,
        "Admin initiating batch withdrawal processing"
    );

    let mut results = Vec::with_capacity(ready_sessions.len());
    let mut succeeded = 0u32;
    let mut failed = 0u32;

    for session in &ready_sessions {
        let result = crate::services::execute_admin_withdrawal(&state, session).await;

        match result {
            Ok(tx_signature) => {
                succeeded += 1;
                results.push(ProcessWithdrawalResponse {
                    success: true,
                    session_id: session.id.to_string(),
                    tx_signature: Some(tx_signature),
                    error: None,
                    early_withdrawal: false,
                });
            }
            Err(e) => {
                failed += 1;
                results.push(ProcessWithdrawalResponse {
                    success: false,
                    session_id: session.id.to_string(),
                    tx_signature: None,
                    error: Some(e.to_string()),
                    early_withdrawal: false,
                });
            }
        }
    }

    tracing::info!(
        total = ready_sessions.len(),
        succeeded = succeeded,
        failed = failed,
        "Admin batch withdrawal processing complete"
    );

    Ok(Json(ProcessAllWithdrawalsResponse {
        total_processed: ready_sessions.len() as u32,
        total_succeeded: succeeded,
        total_failed: failed,
        results,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cap_process_all_limit_defaults_and_caps() {
        assert_eq!(cap_process_all_limit(None), 50);
        assert_eq!(cap_process_all_limit(Some(10)), 10);
        assert_eq!(cap_process_all_limit(Some(500)), 100);
    }
}

/// Privacy Cash system status response
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PrivacyStatusResponse {
    /// Whether Privacy Cash is enabled
    pub enabled: bool,
    /// Company wallet address (masked except last 4 chars)
    pub company_wallet: Option<String>,
    /// Company preferred withdrawal currency (SOL, USDC, USDT)
    pub company_currency: String,
    /// Privacy period in seconds
    pub privacy_period_secs: u64,
    /// Privacy period as human-readable string
    pub privacy_period_display: String,
    /// Minimum deposit in lamports (0 = no minimum)
    pub min_deposit_lamports: u64,
    /// Minimum deposit as display value
    pub min_deposit_sol: f64,
    /// Withdrawal worker poll interval in seconds
    pub withdrawal_poll_interval_secs: u64,
    /// Withdrawal batch size
    pub withdrawal_batch_size: u32,
    /// Percentage of ready funds to withdraw per cycle (1-100)
    /// Lower values spread withdrawals over time to prevent timing analysis
    pub withdrawal_percentage: u8,
    /// Minimum withdrawal amount (lamports) - skip smaller withdrawals
    pub withdrawal_min_lamports: u64,
    /// Minimum withdrawal amount (SOL)
    pub withdrawal_min_sol: f64,
    /// Maximum partial withdrawals per batch (0 = disabled)
    pub partial_withdrawal_count: u8,
    /// Minimum amount (lamports) for partial withdrawals
    pub partial_withdrawal_min_lamports: u64,
    /// Minimum amount (SOL) for partial withdrawals
    pub partial_withdrawal_min_sol: f64,
    /// Sidecar connection status
    pub sidecar_status: String,
    /// Sidecar URL (masked)
    pub sidecar_url: String,
    /// Whether webhook authentication is configured
    pub webhook_configured: bool,
}

/// GET /admin/privacy/status - Get Privacy Cash system status
///
/// Returns current configuration and health status.
/// Requires system admin privileges.
pub async fn get_status<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<PrivacyStatusResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let config = &state.config.privacy;

    // Read runtime settings from database (via SettingsService)
    let privacy_period_secs = state
        .settings_service
        .get_u64("privacy_period_secs")
        .await?
        .unwrap_or(604800); // 7 days default
    let withdrawal_poll_interval_secs = state
        .settings_service
        .get_u64("withdrawal_poll_interval_secs")
        .await?
        .unwrap_or(3600);
    let withdrawal_batch_size = state
        .settings_service
        .get_u32("withdrawal_batch_size")
        .await?
        .unwrap_or(10);
    let withdrawal_percentage = state
        .settings_service
        .get_u32("withdrawal_percentage")
        .await?
        .map(|v| v as u8)
        .unwrap_or(100);
    let partial_withdrawal_count = state
        .settings_service
        .get_u32("partial_withdrawal_count")
        .await?
        .map(|v| v as u8)
        .unwrap_or(0);
    let partial_withdrawal_min_lamports = state
        .settings_service
        .get_u64("partial_withdrawal_min_lamports")
        .await?
        .unwrap_or(500_000_000);
    let withdrawal_min_lamports = state
        .settings_service
        .get_u64("withdrawal_min_lamports")
        .await?
        .unwrap_or(1_000_000_000); // 1 SOL default

    // Mask company wallet (show only last 4 chars)
    let company_wallet = config.company_wallet_address.as_ref().map(|addr| {
        if addr.len() > 8 {
            format!("{}...{}", &addr[..4], &addr[addr.len() - 4..])
        } else {
            addr.clone()
        }
    });

    // Format privacy period as human-readable
    let privacy_period_display = format_duration(privacy_period_secs);

    // Check sidecar connectivity
    let sidecar_status = match &state.privacy_sidecar_client {
        Some(client) => match client.health().await {
            Ok(_) => "connected".to_string(),
            Err(e) => format!("error: {}", e),
        },
        None => "not_configured".to_string(),
    };

    // Mask sidecar URL (show only host)
    let sidecar_url = if config.sidecar_url.contains("localhost") {
        "localhost".to_string()
    } else {
        config
            .sidecar_url
            .split("://")
            .nth(1)
            .and_then(|s| s.split('/').next())
            .unwrap_or("configured")
            .to_string()
    };

    Ok(Json(PrivacyStatusResponse {
        enabled: config.enabled,
        company_wallet,
        company_currency: config.company_currency.clone(),
        privacy_period_secs,
        privacy_period_display,
        min_deposit_lamports: config.min_deposit_lamports,
        min_deposit_sol: config.min_deposit_lamports as f64 / 1_000_000_000.0,
        withdrawal_poll_interval_secs,
        withdrawal_batch_size,
        withdrawal_percentage,
        withdrawal_min_lamports,
        withdrawal_min_sol: withdrawal_min_lamports as f64 / 1_000_000_000.0,
        partial_withdrawal_count,
        partial_withdrawal_min_lamports,
        partial_withdrawal_min_sol: partial_withdrawal_min_lamports as f64 / 1_000_000_000.0,
        sidecar_status,
        sidecar_url,
        webhook_configured: config.deposit_webhook_secret.is_some(),
    }))
}

/// Format seconds as human-readable duration
fn format_duration(secs: u64) -> String {
    if secs >= 86400 {
        let days = secs / 86400;
        format!("{} day{}", days, if days == 1 { "" } else { "s" })
    } else if secs >= 3600 {
        let hours = secs / 3600;
        format!("{} hour{}", hours, if hours == 1 { "" } else { "s" })
    } else if secs >= 60 {
        let minutes = secs / 60;
        format!("{} minute{}", minutes, if minutes == 1 { "" } else { "s" })
    } else {
        format!("{} second{}", secs, if secs == 1 { "" } else { "s" })
    }
}
