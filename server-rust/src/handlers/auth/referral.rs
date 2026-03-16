//! Referral code endpoints (user-facing)

use axum::{extract::State, http::HeaderMap, Json};
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
