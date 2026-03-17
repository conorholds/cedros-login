//! Referral code endpoints (user-facing)

use axum::{extract::State, http::HeaderMap, Json};
use axum::extract::Query;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReferralResponse {
    pub referral_code: String,
    pub referral_count: u64,
    /// Whether the admin has enabled direct payouts (so UI can show wallet input)
    pub direct_payout_enabled: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegenerateReferralResponse {
    pub referral_code: String,
}

/// GET /referral — get current user's referral code and count
pub async fn get_referral<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<ReferralResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;

    // Feature gate
    let enabled = state
        .settings_service
        .get_bool("feature_referrals_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);
    if !enabled {
        return Err(AppError::NotFound("Referrals not enabled".into()));
    }

    let user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    let count = state.user_repo.count_referrals(auth.user_id).await?;

    let direct_payout_enabled = state
        .settings_service
        .get("referral_reward_type")
        .await
        .ok()
        .flatten()
        .map(|v| v == "direct_payout")
        .unwrap_or(false);

    Ok(Json(ReferralResponse {
        referral_code: user.referral_code,
        referral_count: count,
        direct_payout_enabled,
    }))
}

/// POST /referral/regenerate — regenerate current user's referral code
pub async fn regenerate_referral<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<RegenerateReferralResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;

    // Feature gate
    let enabled = state
        .settings_service
        .get_bool("feature_referrals_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);
    if !enabled {
        return Err(AppError::NotFound("Referrals not enabled".into()));
    }

    // Archive the current code before regenerating (history preserved inside the repo impl).
    let new_code = state
        .user_repo
        .regenerate_referral_code(auth.user_id)
        .await?;

    Ok(Json(RegenerateReferralResponse {
        referral_code: new_code,
    }))
}

/// Request body for POST /referral/set-code
#[derive(Debug, Deserialize)]
pub struct SetReferralCodeRequest {
    pub code: String,
}

/// POST /referral/set-code — set a vanity referral code
///
/// Validates that the code is 4–16 uppercase alphanumeric characters and is unique.
pub async fn set_referral_code<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(body): Json<SetReferralCodeRequest>,
) -> Result<Json<RegenerateReferralResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;

    // Feature gate
    let enabled = state
        .settings_service
        .get_bool("feature_referrals_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);
    if !enabled {
        return Err(AppError::NotFound("Referrals not enabled".into()));
    }

    // Normalise to uppercase and validate.
    let code = body.code.to_uppercase();
    validate_vanity_code(&code)?;

    // Check uniqueness — someone else might already hold this code.
    if let Some(existing) = state.user_repo.find_by_referral_code(&code).await? {
        if existing.id != auth.user_id {
            return Err(AppError::Validation("Referral code is already taken".into()));
        }
        // They already own this exact code — return it without mutation.
        return Ok(Json(RegenerateReferralResponse { referral_code: code }));
    }

    // set_referral_code archives the old code to history internally.
    state.user_repo.set_referral_code(auth.user_id, &code).await?;

    Ok(Json(RegenerateReferralResponse { referral_code: code }))
}

/// Validate a vanity referral code: 4–16 uppercase alphanumeric characters.
fn validate_vanity_code(code: &str) -> Result<(), AppError> {
    let len = code.len();
    if len < 4 || len > 16 {
        return Err(AppError::Validation(
            "Referral code must be 4–16 characters".into(),
        ));
    }
    if !code.chars().all(|c| c.is_ascii_uppercase() || c.is_ascii_digit()) {
        return Err(AppError::Validation(
            "Referral code must contain only uppercase letters and digits (A-Z, 0-9)".into(),
        ));
    }
    Ok(())
}

// ============================================================================
// Rewards summary and history
// ============================================================================

/// Response for GET /referral/rewards
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RewardsInfoResponse {
    /// Total rewards earned (completed direct payouts + referral credits), in smallest unit
    pub total_earned: i64,
    /// Pending direct payouts waiting to be processed
    pub pending_amount: i64,
    /// Number of pending payouts
    pub pending_count: u64,
    /// Currency for the amounts (from settings)
    pub currency: String,
    /// Reward type: "credits" or "direct_payout"
    pub reward_type: String,
    /// User's configured payout wallet (None if not set)
    pub payout_wallet_address: Option<String>,
    /// Number of users referred
    pub referral_count: u64,
}

/// GET /referral/rewards — aggregated rewards summary for the authenticated user
pub async fn get_rewards_info<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<RewardsInfoResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;

    let enabled = state
        .settings_service
        .get_bool("feature_referrals_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);
    if !enabled {
        return Err(AppError::NotFound("Referrals not enabled".into()));
    }

    let user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    let reward_type = state
        .settings_service
        .get("referral_reward_type")
        .await
        .ok()
        .flatten()
        .unwrap_or_else(|| "credits".to_string());

    let currency = state
        .settings_service
        .get("referral_reward_currency")
        .await
        .ok()
        .flatten()
        .unwrap_or_else(|| "USD".to_string());

    let referral_count = state.user_repo.count_referrals(auth.user_id).await?;

    let (total_earned, pending_amount, pending_count) = if reward_type == "direct_payout" {
        let total = state
            .referral_payout_repo
            .sum_for_referrer(auth.user_id)
            .await?;
        let pending_sum = state
            .referral_payout_repo
            .sum_by_status_for_referrer(auth.user_id, "pending")
            .await
            .unwrap_or(0);
        let p_count = state
            .referral_payout_repo
            .count_by_referrer(auth.user_id, Some("pending"))
            .await?;
        (total, pending_sum, p_count)
    } else {
        // credits mode: sum positive adjustments with referral_ prefix
        let total = state
            .credit_repo
            .sum_adjustments_by_reference_type_prefix(auth.user_id, &currency, "referral_")
            .await?;
        (total, 0i64, 0u64)
    };

    Ok(Json(RewardsInfoResponse {
        total_earned,
        pending_amount,
        pending_count,
        currency,
        reward_type,
        payout_wallet_address: user.payout_wallet_address,
        referral_count,
    }))
}

/// A single item in rewards history
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RewardHistoryItem {
    pub id: String,
    pub trigger_type: String,
    pub amount: i64,
    pub currency: String,
    /// "pending", "processing", "completed", "failed", "cancelled", or "credited"
    pub status: String,
    pub tx_signature: Option<String>,
    pub created_at: String,
    pub completed_at: Option<String>,
}

/// Response for GET /referral/rewards/history
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RewardsHistoryResponse {
    pub items: Vec<RewardHistoryItem>,
    pub total: u64,
}

/// Query params for GET /referral/rewards/history
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RewardsHistoryQuery {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    20
}

/// GET /referral/rewards/history — paginated reward history for the authenticated user.
///
/// For "direct_payout" mode, returns payout records. For "credits" mode, returns
/// credit transactions whose reference_type starts with "referral_".
pub async fn get_rewards_history<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<RewardsHistoryQuery>,
) -> Result<Json<RewardsHistoryResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;

    let enabled = state
        .settings_service
        .get_bool("feature_referrals_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);
    if !enabled {
        return Err(AppError::NotFound("Referrals not enabled".into()));
    }

    let reward_type = state
        .settings_service
        .get("referral_reward_type")
        .await
        .ok()
        .flatten()
        .unwrap_or_else(|| "credits".to_string());

    let limit = query.limit.min(100);

    if reward_type == "direct_payout" {
        let payouts = state
            .referral_payout_repo
            .list_by_referrer(auth.user_id, None, limit, query.offset)
            .await?;
        let total = state
            .referral_payout_repo
            .count_by_referrer(auth.user_id, None)
            .await?;

        let items = payouts
            .into_iter()
            .map(|p| RewardHistoryItem {
                id: p.id.to_string(),
                trigger_type: p.trigger_type,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                tx_signature: p.tx_signature,
                created_at: p.created_at.to_rfc3339(),
                completed_at: p.completed_at.map(|t| t.to_rfc3339()),
            })
            .collect();

        return Ok(Json(RewardsHistoryResponse { items, total }));
    }

    // credits mode: query credit transactions with referral_ reference_type prefix
    let currency = state
        .settings_service
        .get("referral_reward_currency")
        .await
        .ok()
        .flatten()
        .unwrap_or_else(|| "USD".to_string());

    let txs = state
        .credit_repo
        .list_by_reference_type_prefix(auth.user_id, &currency, "referral_", limit, query.offset)
        .await?;
    let total = state
        .credit_repo
        .count_by_reference_type_prefix(auth.user_id, &currency, "referral_")
        .await?;

    let items = txs
        .into_iter()
        .map(|t| {
            // "referral_signup" -> "signup", "referral_first_spend" -> "first_spend", etc.
            let trigger_type = t
                .reference_type
                .as_deref()
                .and_then(|rt| rt.strip_prefix("referral_"))
                .unwrap_or("unknown")
                .to_string();
            RewardHistoryItem {
                id: t.id.to_string(),
                trigger_type,
                amount: t.amount,
                currency: t.currency,
                status: "credited".to_string(),
                tx_signature: None,
                created_at: t.created_at.to_rfc3339(),
                completed_at: Some(t.created_at.to_rfc3339()),
            }
        })
        .collect();

    Ok(Json(RewardsHistoryResponse { items, total }))
}

// ============================================================================
// Payout wallet management
// ============================================================================

/// Request body for POST /referral/payout-wallet
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetPayoutWalletRequest {
    /// Base58-encoded 32-byte Solana public key, or null to clear
    pub wallet_address: Option<String>,
}

/// Response for POST /referral/payout-wallet
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetPayoutWalletResponse {
    pub ok: bool,
    pub wallet_address: Option<String>,
}

/// Validate a base58-encoded Solana public key (32 decoded bytes).
fn validate_solana_wallet(address: &str) -> Result<(), AppError> {
    let decoded = bs58::decode(address)
        .into_vec()
        .map_err(|_| AppError::Validation("Invalid wallet address: not valid base58".into()))?;
    if decoded.len() != 32 {
        return Err(AppError::Validation(
            "Invalid wallet address: must be a 32-byte Solana public key".into(),
        ));
    }
    Ok(())
}

/// POST /referral/payout-wallet — set or clear the authenticated user's payout wallet address
pub async fn set_payout_wallet<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(body): Json<SetPayoutWalletRequest>,
) -> Result<Json<SetPayoutWalletResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;

    let enabled = state
        .settings_service
        .get_bool("feature_referrals_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);
    if !enabled {
        return Err(AppError::NotFound("Referrals not enabled".into()));
    }

    if let Some(ref addr) = body.wallet_address {
        validate_solana_wallet(addr)?;
    }

    state
        .user_repo
        .set_payout_wallet_address(auth.user_id, body.wallet_address.as_deref())
        .await?;

    Ok(Json(SetPayoutWalletResponse {
        ok: true,
        wallet_address: body.wallet_address,
    }))
}
