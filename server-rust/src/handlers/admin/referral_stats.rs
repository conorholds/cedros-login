//! Admin referral analytics handler
//!
//! GET /admin/referral-stats — return referral analytics for the admin dashboard.

use axum::{extract::State, http::HeaderMap, Json};
use chrono::Utc;
use serde::Serialize;
use std::sync::Arc;
use uuid::Uuid;

use super::users::validate_system_admin;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::services::EmailService;
use crate::AppState;

/// Response for GET /admin/referral-stats
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReferralStatsResponse {
    /// Total users with referred_by set (all time)
    pub total_referrals: u64,
    /// Referrals created in the last 30 days
    pub referrals_this_month: u64,
    /// Total pending payout amount
    pub total_pending_payouts: i64,
    /// Total completed payout amount
    pub total_completed_payouts: i64,
    /// Top affiliates by referral count (top 10)
    pub top_affiliates: Vec<TopAffiliate>,
}

/// One entry in the top-affiliates list.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TopAffiliate {
    pub user_id: Uuid,
    pub email: Option<String>,
    pub name: Option<String>,
    pub referral_count: u64,
    pub referral_code: String,
}

/// GET /admin/referral-stats — referral analytics
///
/// Returns aggregate referral counts and top affiliates.
/// Requires system admin privileges.
pub async fn get_referral_stats<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<ReferralStatsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let since_30_days = Utc::now() - chrono::Duration::days(30);

    let (total_referrals, referrals_this_month, total_pending_payouts, total_completed_payouts, top_rows) = tokio::try_join!(
        state.user_repo.count_referred(),
        state.user_repo.count_referred_since(since_30_days),
        state.referral_payout_repo.sum_by_status("pending"),
        state.referral_payout_repo.sum_by_status("completed"),
        state.user_repo.top_referrers(10),
    )?;

    let top_affiliates = top_rows
        .into_iter()
        .map(|r| TopAffiliate {
            user_id: r.user_id,
            email: r.email,
            name: r.name,
            referral_count: r.referral_count,
            referral_code: r.referral_code,
        })
        .collect();

    Ok(Json(ReferralStatsResponse {
        total_referrals,
        referrals_this_month,
        total_pending_payouts,
        total_completed_payouts,
        top_affiliates,
    }))
}
