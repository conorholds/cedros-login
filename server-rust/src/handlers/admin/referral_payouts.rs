//! Admin referral payout handlers
//!
//! GET  /admin/referral-payouts                  - List pending payouts grouped by referrer
//! POST /admin/referral-payouts/process           - Execute all pending payouts on-chain
//! POST /admin/referral-payouts/retry-failed      - Reset failed payouts to pending
//! GET  /admin/referral-payouts/list              - Paginated individual payout list
//! POST /admin/referral-payouts/{id}/process      - Process single payout
//! POST /admin/referral-payouts/{id}/cancel       - Cancel single payout

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use super::users::validate_system_admin;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::ReferrerPayoutSummary;
use crate::services::payout_transfer::{decrypt_treasury_key, execute_transfer, resolve_payout_services};
use crate::services::EmailService;
use crate::AppState;

// =============================================================================
// Existing response types
// =============================================================================

/// Response for GET /admin/referral-payouts
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListReferralPayoutsResponse {
    pub referrers: Vec<ReferrerPayoutSummary>,
    pub total: u64,
}

/// Response for POST /admin/referral-payouts/process
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessReferralPayoutsResponse {
    pub processed: u64,
    pub failed: u64,
    pub total_amount: i64,
    pub skipped_no_wallet: u64,
}

/// Response for POST /admin/referral-payouts/retry-failed
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RetryFailedPayoutsResponse {
    pub reset_count: u64,
}

// =============================================================================
// New response/request types for individual payout operations
// =============================================================================

/// Individual payout item with referrer info (for the list endpoint)
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminPayoutItem {
    pub id: Uuid,
    pub referrer_id: Uuid,
    pub referrer_email: Option<String>,
    pub referrer_name: Option<String>,
    pub referred_user_id: Uuid,
    pub trigger_type: String,
    pub amount: i64,
    pub currency: String,
    pub status: String,
    pub tx_signature: Option<String>,
    pub error_message: Option<String>,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

/// Response for GET /admin/referral-payouts/list
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListPayoutsResponse {
    pub payouts: Vec<AdminPayoutItem>,
    pub total: u64,
}

/// Query params for GET /admin/referral-payouts/list
#[derive(Debug, Deserialize)]
pub struct ListPayoutsQuery {
    pub status: Option<String>,
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

/// Response for POST /admin/referral-payouts/{id}/process
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessSingleResponse {
    pub tx_signature: String,
}

// =============================================================================
// Existing handlers
// =============================================================================

/// POST /admin/referral-payouts/retry-failed — reset failed payouts to pending
pub async fn retry_failed_payouts<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<RetryFailedPayoutsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let reset_count = state.referral_payout_repo.reset_failed().await?;

    tracing::info!(reset_count = reset_count, "Reset failed referral payouts to pending");

    Ok(Json(RetryFailedPayoutsResponse { reset_count }))
}

/// GET /admin/referral-payouts — list pending payouts grouped by referrer
pub async fn list_referral_payouts<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<ListReferralPayoutsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let total = state.referral_payout_repo.count_pending_referrers().await?;
    let referrers = state
        .referral_payout_repo
        .pending_by_referrer(100, 0)
        .await?;

    Ok(Json(ListReferralPayoutsResponse { referrers, total }))
}

/// POST /admin/referral-payouts/process — execute all pending payouts on-chain
pub async fn process_referral_payouts<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<ProcessReferralPayoutsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let (sidecar, note_encryption) =
        resolve_payout_services(&state.privacy_sidecar_client, &state.note_encryption_service)?;

    // Fetch treasury (global)
    let treasury = state
        .treasury_config_repo
        .find_global()
        .await?
        .ok_or_else(|| AppError::NotFound("No global treasury configured".into()))?;

    let private_key = decrypt_treasury_key(&note_encryption, &treasury.encrypted_private_key)?;

    // Load all pending referrer summaries (up to 100)
    let summaries = state
        .referral_payout_repo
        .pending_by_referrer(100, 0)
        .await?;

    let mut processed: u64 = 0;
    let mut failed: u64 = 0;
    let mut total_amount: i64 = 0;
    let mut skipped_no_wallet: u64 = 0;

    for summary in &summaries {
        let dest = match &summary.payout_wallet_address {
            Some(addr) => addr.clone(),
            None => {
                skipped_no_wallet += 1;
                continue;
            }
        };

        let payouts = state
            .referral_payout_repo
            .list_pending(500, 0)
            .await?
            .into_iter()
            .filter(|p| p.referrer_id == summary.referrer_id && p.currency == summary.currency)
            .collect::<Vec<_>>();

        let all_ids: Vec<Uuid> = payouts.iter().map(|p| p.id).collect();

        // Atomically claim pending payouts → prevents worker/handler race
        let claimed_ids = state
            .referral_payout_repo
            .claim_for_processing(&all_ids)
            .await?;

        if claimed_ids.is_empty() {
            continue; // Another process already claimed them
        }

        let amount_sum: i64 = payouts
            .iter()
            .filter(|p| claimed_ids.contains(&p.id))
            .map(|p| p.amount)
            .sum();

        if amount_sum <= 0 {
            tracing::warn!(
                referrer_id = %summary.referrer_id,
                amount_sum = amount_sum,
                "Skipping payout: aggregated amount is zero or negative"
            );
            // Release claimed payouts back to pending
            for id in &claimed_ids {
                let _ = state.referral_payout_repo.mark_failed(*id, "zero amount").await;
            }
            skipped_no_wallet += 1;
            continue;
        }

        let tx_result = execute_transfer(
            &sidecar,
            &private_key,
            &dest,
            &summary.currency,
            amount_sum,
        )
        .await;

        match tx_result {
            Ok(tx_sig) => {
                for id in &claimed_ids {
                    if let Err(e) = state
                        .referral_payout_repo
                        .mark_completed(*id, &tx_sig)
                        .await
                    {
                        tracing::error!(payout_id = %id, error = %e, "Failed to mark payout as completed");
                    }
                }
                processed += claimed_ids.len() as u64;
                total_amount += amount_sum;
                tracing::info!(
                    referrer_id = %summary.referrer_id,
                    dest = %dest,
                    amount = amount_sum,
                    currency = %summary.currency,
                    tx_sig = %tx_sig,
                    "Referral payout executed"
                );
            }
            Err(e) => {
                let err_str = e.to_string();
                tracing::error!(
                    referrer_id = %summary.referrer_id,
                    error = %err_str,
                    "Referral payout failed"
                );
                for id in &claimed_ids {
                    if let Err(e) = state
                        .referral_payout_repo
                        .mark_failed(*id, &err_str)
                        .await
                    {
                        tracing::error!(payout_id = %id, error = %e, "Failed to mark payout as failed");
                    }
                }
                failed += claimed_ids.len() as u64;
            }
        }
    }

    Ok(Json(ProcessReferralPayoutsResponse {
        processed,
        failed,
        total_amount,
        skipped_no_wallet,
    }))
}

// =============================================================================
// New handlers: individual payout operations
// =============================================================================

/// GET /admin/referral-payouts/list — paginated individual payout list
///
/// Query params: status (optional filter), limit (default 20), offset (default 0).
/// Joins user table for referrer email/name.
pub async fn list_all_payouts<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<ListPayoutsQuery>,
) -> Result<Json<ListPayoutsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.offset.unwrap_or(0);
    let status_filter = query.status.as_deref();

    let total = state
        .referral_payout_repo
        .count_all(status_filter)
        .await?;
    let entities = state
        .referral_payout_repo
        .list_all(status_filter, limit, offset)
        .await?;

    // Resolve referrer info from user repo
    let mut payouts = Vec::with_capacity(entities.len());
    for entity in entities {
        let (referrer_email, referrer_name) =
            match state.user_repo.find_by_id(entity.referrer_id).await? {
                Some(user) => (user.email.clone(), user.name.clone()),
                None => (None, None),
            };

        payouts.push(AdminPayoutItem {
            id: entity.id,
            referrer_id: entity.referrer_id,
            referrer_email,
            referrer_name,
            referred_user_id: entity.referred_user_id,
            trigger_type: entity.trigger_type,
            amount: entity.amount,
            currency: entity.currency,
            status: entity.status,
            tx_signature: entity.tx_signature,
            error_message: entity.error_message,
            created_at: entity.created_at,
            completed_at: entity.completed_at,
        });
    }

    Ok(Json(ListPayoutsResponse { payouts, total }))
}

/// POST /admin/referral-payouts/{id}/process — process a single payout
///
/// Decrypts treasury, executes transfer, marks completed or failed.
pub async fn process_single_payout<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<ProcessSingleResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let payout = state
        .referral_payout_repo
        .find_by_id(id)
        .await?
        .ok_or_else(|| AppError::NotFound("Payout not found".into()))?;

    if payout.status != "pending" && payout.status != "failed" {
        return Err(AppError::Validation(format!(
            "Payout status is '{}', only pending or failed payouts can be processed",
            payout.status
        )));
    }

    // Atomically claim the payout to prevent concurrent processing
    let claimed = state
        .referral_payout_repo
        .claim_for_processing(&[id])
        .await?;

    if claimed.is_empty() {
        return Err(AppError::Validation(
            "Payout is already being processed by another operation".into(),
        ));
    }

    // Look up referrer's payout wallet
    let user = state
        .user_repo
        .find_by_id(payout.referrer_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Referrer user not found".into()))?;

    let dest = user
        .payout_wallet_address
        .ok_or_else(|| AppError::Validation("Referrer has no payout wallet address".into()))?;

    let (sidecar, note_encryption) =
        resolve_payout_services(&state.privacy_sidecar_client, &state.note_encryption_service)?;

    let treasury = state
        .treasury_config_repo
        .find_global()
        .await?
        .ok_or_else(|| AppError::NotFound("No global treasury configured".into()))?;

    let private_key = decrypt_treasury_key(&note_encryption, &treasury.encrypted_private_key)?;

    match execute_transfer(&sidecar, &private_key, &dest, &payout.currency, payout.amount).await {
        Ok(tx_sig) => {
            state
                .referral_payout_repo
                .mark_completed(id, &tx_sig)
                .await?;
            tracing::info!(
                payout_id = %id,
                referrer_id = %payout.referrer_id,
                amount = payout.amount,
                tx_sig = %tx_sig,
                "Single referral payout processed"
            );
            Ok(Json(ProcessSingleResponse { tx_signature: tx_sig }))
        }
        Err(e) => {
            let err_str = e.to_string();
            let _ = state
                .referral_payout_repo
                .mark_failed(id, &err_str)
                .await;
            Err(e)
        }
    }
}

/// POST /admin/referral-payouts/{id}/cancel — cancel a single payout
///
/// Only pending payouts can be cancelled.
pub async fn cancel_payout<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let payout = state
        .referral_payout_repo
        .find_by_id(id)
        .await?
        .ok_or_else(|| AppError::NotFound("Payout not found".into()))?;

    if payout.status != "pending" {
        return Err(AppError::Validation(format!(
            "Only pending payouts can be cancelled, current status: '{}'",
            payout.status
        )));
    }

    let cancelled = state.referral_payout_repo.cancel(id).await?;

    if !cancelled {
        return Err(AppError::Validation(
            "Payout could not be cancelled — it may have been claimed for processing".into(),
        ));
    }

    tracing::info!(
        payout_id = %id,
        referrer_id = %payout.referrer_id,
        "Referral payout cancelled"
    );

    Ok(Json(serde_json::json!({ "cancelled": true })))
}
