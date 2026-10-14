//! MFA recovery-code regeneration handler.

use crate::repositories::TotpUpdate;
use axum::{extract::State, http::HeaderMap, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use super::mfa::get_authenticated_session;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::AuditEventType;
use crate::services::{EmailService, TotpService};
use crate::AppState;

/// Response for recovery code regeneration.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegenerateRecoveryCodesResponse {
    /// New recovery codes (only shown once!).
    pub recovery_codes: Vec<String>,
}

/// POST /auth/mfa/recovery-codes/regenerate - Regenerate recovery codes.
/// Requires TOTP verification for security.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegenerateRecoveryCodesRequest {
    /// Current TOTP code to verify identity.
    pub code: String,
}

/// POST /auth/mfa/recovery-codes/regenerate - Regenerate recovery codes.
pub async fn regenerate_recovery_codes<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<RegenerateRecoveryCodesRequest>,
) -> Result<Json<RegenerateRecoveryCodesResponse>, AppError> {
    let (user_id, session_id) = get_authenticated_session(&state, &headers).await?;

    state
        .mfa_attempt_service
        .check_allowed(user_id)
        .await
        .map_err(|remaining| {
            AppError::TooManyRequests(format!(
                "Too many verification attempts. Try again in {} seconds",
                remaining.as_secs()
            ))
        })?;

    let totp_secret = state
        .totp_repo
        .find_by_user(user_id)
        .await?
        .ok_or(AppError::Validation("MFA not configured".into()))?;

    if !totp_secret.enabled {
        return Err(AppError::Validation("MFA not enabled".into()));
    }

    let db_user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    let email = db_user.email.ok_or(AppError::Internal(anyhow::anyhow!(
        "User has MFA but no email"
    )))?;

    // Verify the TOTP code with replay protection (step-up auth)
    let time_step = match state.totp_service.verify_with_replay_check(
        &totp_secret.secret,
        &req.code,
        &email,
        totp_secret.last_used_time_step,
    )? {
        Some(time_step) => time_step,
        None => {
            let _ = state.mfa_attempt_service.record_failed(user_id).await;
            return Err(AppError::Validation("Invalid verification code".into()));
        }
    };

    let recovery_codes = state.totp_service.generate_recovery_codes();
    let code_hashes = TotpService::hash_recovery_codes(recovery_codes.clone()).await?;

    if !state
        .totp_repo
        .update_enrollment(
            user_id,
            totp_secret.id,
            TotpUpdate::ReplaceRecoveryCodes {
                time_step,
                hashes: code_hashes,
            },
        )
        .await?
    {
        let _ = state.mfa_attempt_service.record_failed(user_id).await;
        return Err(AppError::Validation("Invalid verification code".into()));
    }

    state.step_up_service.record_strong_auth(session_id).await?;
    state.mfa_attempt_service.record_success(user_id).await;

    state
        .session_repo
        .revoke_all_except(user_id, session_id)
        .await?;

    // Log audit event with warning on failure (security-critical event)
    if let Err(e) = state
        .audit_service
        .log_user_event(
            AuditEventType::MfaRecoveryCodesRegenerated,
            user_id,
            Some(&headers),
        )
        .await
    {
        tracing::warn!(error = %e, user_id = %user_id, "Failed to log MFA recovery codes regenerated audit event");
    }

    Ok(Json(RegenerateRecoveryCodesResponse { recovery_codes }))
}
