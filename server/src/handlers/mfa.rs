//! MFA (Multi-Factor Authentication) handlers

use crate::repositories::TotpUpdate;
use axum::{extract::State, http::HeaderMap, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::AuditEventType;
use crate::services::{EmailService, TotpService};
use crate::utils::authenticate;
use crate::AppState;

/// Response for MFA setup initiation
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MfaSetupResponse {
    /// Base32-encoded secret for manual entry
    pub secret: String,
    /// otpauth:// URI for QR code generation
    pub otpauth_uri: String,
    /// Recovery codes (only shown once!)
    pub recovery_codes: Vec<String>,
}

/// Request to enable MFA (verify setup)
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnableMfaRequest {
    /// TOTP code to verify setup is correct
    pub code: String,
}

/// Response for MFA status
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MfaStatusResponse {
    /// Whether MFA is enabled
    pub enabled: bool,
    /// Number of unused recovery codes remaining
    pub recovery_codes_remaining: usize,
    /// Confirmations accepted by the disable endpoint for this account.
    pub disable_methods: Vec<&'static str>,
}

/// Request to verify MFA code (during login)
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyMfaRequest {
    /// TOTP code
    pub code: String,
}

/// Request to use a recovery code
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecoveryCodeRequest {
    /// Recovery code
    pub code: String,
}

/// Extract and validate user from token
pub(super) async fn get_authenticated_session<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
) -> Result<(uuid::Uuid, uuid::Uuid), AppError> {
    let auth = authenticate(state, headers).await?;
    let session_id = auth.session_id.ok_or(AppError::StepUpRequired)?;
    Ok((auth.user_id, session_id))
}

/// POST /auth/mfa/setup - Start MFA setup
/// Returns the secret and QR code URI for the user to set up their authenticator app
///
/// ## Security Trade-off
///
/// This endpoint requires step-up authentication (recent re-authentication) rather than
/// a completely fresh login. Trade-offs considered:
///
/// - **Fresh login required**: Maximum security but poor UX (forces full logout/login flow)
/// - **Step-up required** (current): Good security (re-auth within time window) with better UX
/// - **No check**: Unacceptable - stolen sessions could enroll attacker's MFA device
///
/// Step-up provides reasonable protection: attacker would need both the session token AND
/// the user's password to enroll MFA. If stricter controls are needed, applications can
/// require fresh login via the callback mechanism.
pub async fn setup_mfa<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<MfaSetupResponse>, AppError> {
    let (user_id, session_id) = get_authenticated_session(&state, &headers).await?;

    // Require recent strong authentication to prevent MFA enrollment via stolen sessions.
    state.step_up_service.require_step_up(session_id).await?;

    // Check if MFA is already enabled
    if state.totp_repo.has_mfa_enabled(user_id).await? {
        return Err(AppError::Validation("MFA is already enabled".into()));
    }

    // Get user email for the QR code
    let db_user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    let email = db_user
        .email
        .ok_or(AppError::Validation("Email required for MFA setup".into()))?;

    // Generate secret
    let secret = state.totp_service.generate_secret();

    // Generate otpauth URI
    let otpauth_uri = state.totp_service.get_otpauth_uri(&secret, &email)?;

    // Generate recovery codes and hash them with Argon2id
    let recovery_codes = state.totp_service.generate_recovery_codes();
    let code_hashes = TotpService::hash_recovery_codes(recovery_codes.clone()).await?;
    state
        .totp_repo
        .setup_factor(user_id, &secret, code_hashes)
        .await?;

    // Log audit event with warning on failure (security-critical event)
    if let Err(e) = state
        .audit_service
        .log_user_event(AuditEventType::MfaSetupStarted, user_id, Some(&headers))
        .await
    {
        tracing::warn!(error = %e, user_id = %user_id, "Failed to log MFA setup audit event");
    }

    Ok(Json(MfaSetupResponse {
        secret,
        otpauth_uri,
        recovery_codes,
    }))
}

/// POST /auth/mfa/enable - Enable MFA after verifying setup
pub async fn enable_mfa<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<EnableMfaRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let (user_id, session_id) = get_authenticated_session(&state, &headers).await?;

    // Require recent strong authentication for MFA enablement.
    state.step_up_service.require_step_up(session_id).await?;
    enforce_mfa_attempt_limit(&state, user_id).await?;

    // Get the pending secret
    let totp_secret = state
        .totp_repo
        .find_by_user(user_id)
        .await?
        .ok_or(AppError::Validation("MFA setup not started".into()))?;

    if totp_secret.enabled {
        return Err(AppError::Validation("MFA is already enabled".into()));
    }

    // Get user email for verification
    let db_user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    let email = db_user
        .email
        .ok_or(AppError::Validation("Email required for MFA".into()))?;

    // Verify the code with replay protection
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

    // Record the used time step to prevent replay
    if !state
        .totp_repo
        .enable_enrollment(user_id, totp_secret.id, time_step)
        .await?
    {
        let _ = state.mfa_attempt_service.record_failed(user_id).await;
        return Err(AppError::Validation("Invalid verification code".into()));
    }

    state
        .session_repo
        .revoke_all_except(user_id, session_id)
        .await?;
    state.mfa_attempt_service.record_success(user_id).await;

    // Log audit event with warning on failure (security-critical event)
    if let Err(e) = state
        .audit_service
        .log_user_event(AuditEventType::MfaEnabled, user_id, Some(&headers))
        .await
    {
        tracing::warn!(error = %e, user_id = %user_id, "Failed to log MFA enabled audit event");
    }

    Ok(Json(MessageResponse {
        message: "MFA enabled successfully".into(),
    }))
}

async fn enforce_mfa_attempt_limit<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: uuid::Uuid,
) -> Result<(), AppError> {
    state
        .mfa_attempt_service
        .check_allowed(user_id)
        .await
        .map_err(|remaining| {
            AppError::TooManyRequests(format!(
                "Too many verification attempts. Try again in {} seconds",
                remaining.as_secs()
            ))
        })
}

/// GET /auth/mfa/status - Get MFA status
pub async fn mfa_status<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<MfaStatusResponse>, AppError> {
    let (user_id, _) = get_authenticated_session(&state, &headers).await?;

    let enabled = state.totp_repo.has_mfa_enabled(user_id).await?;
    let recovery_codes = state.totp_repo.get_recovery_codes(user_id).await?;
    Ok(Json(MfaStatusResponse {
        enabled,
        recovery_codes_remaining: recovery_codes.len(),
        disable_methods: disable_methods(),
    }))
}

fn disable_methods() -> Vec<&'static str> {
    vec!["code", "recoveryCode"]
}

/// POST /auth/mfa/verify - Verify MFA code (authenticated step-up)
/// This endpoint validates a code for an already-authenticated session.
///
/// # Security
///
/// This endpoint has multiple layers of brute-force protection:
/// 1. IP-based rate limiting (10/min via auth_sensitive_routes)
/// 2. TOTP replay protection (prevents code reuse within skew window)
/// 3. Per-user attempt tracking (5 failures = 15 min lockout)
pub async fn verify_mfa<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<VerifyMfaRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let (user_id, session_id) = get_authenticated_session(&state, &headers).await?;

    // Check if user is locked out due to too many failed attempts
    if let Err(remaining) = state.mfa_attempt_service.check_allowed(user_id).await {
        // Use div_ceil for cleaner rounding up
        let minutes = remaining.as_secs().div_ceil(60);
        return Err(AppError::TooManyRequests(format!(
            "Too many failed attempts. Try again in {} minute{}",
            minutes,
            if minutes == 1 { "" } else { "s" }
        )));
    }

    // Get user's TOTP secret
    let totp_secret = state
        .totp_repo
        .find_by_user(user_id)
        .await?
        .ok_or(AppError::Validation("MFA not configured".into()))?;

    if !totp_secret.enabled {
        return Err(AppError::Validation("MFA not enabled".into()));
    }

    // Get user email
    let db_user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    let email = db_user.email.ok_or(AppError::Internal(anyhow::anyhow!(
        "User has MFA but no email"
    )))?;

    // Verify the code with replay protection
    let verification_result = state.totp_service.verify_with_replay_check(
        &totp_secret.secret,
        &req.code,
        &email,
        totp_secret.last_used_time_step,
    )?;

    match verification_result {
        Some(time_step) => {
            // Clear failed attempts on success
            state.mfa_attempt_service.record_success(user_id).await;

            // Record the used time step to prevent replay
            if !state
                .totp_repo
                .update_enrollment(user_id, totp_secret.id, TotpUpdate::RecordStep(time_step))
                .await?
            {
                return Err(AppError::Validation("Invalid verification code".into()));
            }

            // Record strong auth for step-up protected operations.
            state.step_up_service.record_strong_auth(session_id).await?;

            Ok(Json(MessageResponse {
                message: "MFA verification successful".into(),
            }))
        }
        None => {
            // Record failed attempt
            if let Err(lockout_duration) = state.mfa_attempt_service.record_failed(user_id).await {
                let minutes = lockout_duration.as_secs().div_ceil(60);
                return Err(AppError::TooManyRequests(format!(
                    "Too many failed attempts. Try again in {} minute{}",
                    minutes,
                    if minutes == 1 { "" } else { "s" }
                )));
            }

            Err(AppError::Validation("Invalid verification code".into()))
        }
    }
}

/// POST /auth/mfa/recovery - Use a recovery code (authenticated step-up)
///
/// # Security
///
/// This endpoint shares the same per-user attempt tracking as verify_mfa.
/// Failed recovery code attempts count toward the same lockout threshold.
pub async fn use_recovery_code<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<RecoveryCodeRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let (user_id, session_id) = get_authenticated_session(&state, &headers).await?;

    // Check if user is locked out due to too many failed attempts
    if let Err(remaining) = state.mfa_attempt_service.check_allowed(user_id).await {
        let minutes = remaining.as_secs().div_ceil(60);
        return Err(AppError::TooManyRequests(format!(
            "Too many failed attempts. Try again in {} minute{}",
            minutes,
            if minutes == 1 { "" } else { "s" }
        )));
    }

    // Check MFA is enabled
    if !state.totp_repo.has_mfa_enabled(user_id).await? {
        return Err(AppError::Validation("MFA not enabled".into()));
    }

    // Try to use the recovery code (repository will verify against stored hashes)
    let used = state
        .totp_repo
        .use_recovery_code(user_id, &req.code)
        .await?;

    if !used {
        // Record failed attempt (same pool as TOTP failures)
        if let Err(lockout_duration) = state.mfa_attempt_service.record_failed(user_id).await {
            let minutes = lockout_duration.as_secs().div_ceil(60);
            return Err(AppError::TooManyRequests(format!(
                "Too many failed attempts. Try again in {} minute{}",
                minutes,
                if minutes == 1 { "" } else { "s" }
            )));
        }
        return Err(AppError::Validation("Invalid recovery code".into()));
    }

    // Clear failed attempts on success
    state.mfa_attempt_service.record_success(user_id).await;

    // Record strong auth for step-up protected operations.
    state.step_up_service.record_strong_auth(session_id).await?;

    // Log audit event with warning on failure (security-critical event)
    if let Err(e) = state
        .audit_service
        .log_user_event(AuditEventType::MfaRecoveryCodeUsed, user_id, Some(&headers))
        .await
    {
        tracing::warn!(error = %e, user_id = %user_id, "Failed to log MFA recovery code audit event");
    }

    Ok(Json(MessageResponse {
        message: "Recovery code accepted".into(),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_enable_mfa_request_deserialize() {
        let json = r#"{"code": "123456"}"#;
        let req: EnableMfaRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.code, "123456");
    }

    #[test]
    fn test_mfa_status_response_serialize() {
        let response = MfaStatusResponse {
            enabled: true,
            recovery_codes_remaining: 8,
            disable_methods: disable_methods(),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"enabled\":true"));
        assert!(json.contains("\"recoveryCodesRemaining\":8"));
        assert!(json.contains("\"disableMethods\":[\"code\",\"recoveryCode\"]"));
    }
}
