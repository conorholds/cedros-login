//! MFA (Multi-Factor Authentication) handlers

use axum::{extract::State, http::HeaderMap, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use zeroize::{Zeroize, ZeroizeOnDrop};

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

/// Request to disable MFA
///
/// SEC-06: Password is zeroized on drop.
#[derive(Debug, Deserialize, Zeroize, ZeroizeOnDrop)]
#[serde(rename_all = "camelCase")]
pub struct DisableMfaRequest {
    /// Password for confirmation
    pub password: String,
}

/// Response for MFA status
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MfaStatusResponse {
    /// Whether MFA is enabled
    pub enabled: bool,
    /// Number of unused recovery codes remaining
    pub recovery_codes_remaining: usize,
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
async fn get_authenticated_session<C: AuthCallback, E: EmailService>(
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
/// ## HANDLER-09: Security Trade-off
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

    // Store secret (not yet enabled)
    state.totp_repo.upsert_secret(user_id, &secret).await?;

    // Generate otpauth URI
    let otpauth_uri = state.totp_service.get_otpauth_uri(&secret, &email)?;

    // Generate recovery codes and hash them with Argon2id
    let recovery_codes = state.totp_service.generate_recovery_codes();
    let code_hashes: Vec<String> = recovery_codes
        .iter()
        .map(|c| TotpService::hash_recovery_code(c))
        .collect::<Result<Vec<_>, _>>()?;
    state
        .totp_repo
        .store_recovery_codes(user_id, code_hashes)
        .await?;

    // REL-001: Log audit event with warning on failure (security-critical event)
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

    // S-14: Verify the code with replay protection
    let time_step = state
        .totp_service
        .verify_with_replay_check(
            &totp_secret.secret,
            &req.code,
            &email,
            totp_secret.last_used_time_step,
        )?
        .ok_or(AppError::Validation("Invalid verification code".into()))?;

    // S-14: Record the used time step to prevent replay
    if !state
        .totp_repo
        .record_used_time_step_if_newer(user_id, time_step)
        .await?
    {
        return Err(AppError::Validation("Invalid verification code".into()));
    }

    // Enable MFA
    state.totp_repo.enable_mfa(user_id).await?;

    // REL-001: Log audit event with warning on failure (security-critical event)
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

/// POST /auth/mfa/disable - Disable MFA
pub async fn disable_mfa<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<DisableMfaRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let (user_id, _) = get_authenticated_session(&state, &headers).await?;

    // Get user and verify password
    let db_user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    let password_hash = db_user.password_hash.ok_or(AppError::Validation(
        "Password required to disable MFA".into(),
    ))?;

    if !state
        .password_service
        .verify(req.password.clone(), password_hash)
        .await?
    {
        return Err(AppError::InvalidCredentials);
    }

    // Disable MFA
    state.totp_repo.disable_mfa(user_id).await?;

    // REL-001: Log audit event with warning on failure (security-critical event)
    if let Err(e) = state
        .audit_service
        .log_user_event(AuditEventType::MfaDisabled, user_id, Some(&headers))
        .await
    {
        tracing::warn!(error = %e, user_id = %user_id, "Failed to log MFA disabled audit event");
    }

    Ok(Json(MessageResponse {
        message: "MFA disabled successfully".into(),
    }))
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
    }))
}

/// POST /auth/mfa/verify - Verify MFA code (authenticated step-up)
/// This endpoint validates a code for an already-authenticated session.
///
/// # Security (SEC-04)
///
/// This endpoint has multiple layers of brute-force protection:
/// 1. IP-based rate limiting (10/min via auth_sensitive_routes)
/// 2. TOTP replay protection (S-14, prevents code reuse within skew window)
/// 3. Per-user attempt tracking (SEC-04, 5 failures = 15 min lockout)
pub async fn verify_mfa<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<VerifyMfaRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let (user_id, session_id) = get_authenticated_session(&state, &headers).await?;

    // SEC-04: Check if user is locked out due to too many failed attempts
    if let Err(remaining) = state.mfa_attempt_service.check_allowed(user_id).await {
        // CLEAN-03: Use div_ceil for cleaner rounding up
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

    // S-14: Verify the code with replay protection
    let verification_result = state.totp_service.verify_with_replay_check(
        &totp_secret.secret,
        &req.code,
        &email,
        totp_secret.last_used_time_step,
    )?;

    match verification_result {
        Some(time_step) => {
            // SEC-04: Clear failed attempts on success
            state.mfa_attempt_service.record_success(user_id).await;

            // S-14: Record the used time step to prevent replay
            if !state
                .totp_repo
                .record_used_time_step_if_newer(user_id, time_step)
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
            // SEC-04: Record failed attempt
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
/// # Security (SEC-04)
///
/// This endpoint shares the same per-user attempt tracking as verify_mfa.
/// Failed recovery code attempts count toward the same lockout threshold.
pub async fn use_recovery_code<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<RecoveryCodeRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let (user_id, session_id) = get_authenticated_session(&state, &headers).await?;

    // SEC-04: Check if user is locked out due to too many failed attempts
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
        // SEC-04: Record failed attempt (same pool as TOTP failures)
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

    // SEC-04: Clear failed attempts on success
    state.mfa_attempt_service.record_success(user_id).await;

    // Record strong auth for step-up protected operations.
    state.step_up_service.record_strong_auth(session_id).await?;

    // REL-001: Log audit event with warning on failure (security-critical event)
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

/// Response for recovery code regeneration
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegenerateRecoveryCodesResponse {
    /// New recovery codes (only shown once!)
    pub recovery_codes: Vec<String>,
}

/// POST /auth/mfa/recovery-codes/regenerate - Regenerate recovery codes
/// Requires TOTP verification for security
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegenerateRecoveryCodesRequest {
    /// Current TOTP code to verify identity
    pub code: String,
}

/// POST /auth/mfa/recovery-codes/regenerate - Regenerate recovery codes
pub async fn regenerate_recovery_codes<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<RegenerateRecoveryCodesRequest>,
) -> Result<Json<RegenerateRecoveryCodesResponse>, AppError> {
    let (user_id, session_id) = get_authenticated_session(&state, &headers).await?;

    // Check MFA is enabled
    let totp_secret = state
        .totp_repo
        .find_by_user(user_id)
        .await?
        .ok_or(AppError::Validation("MFA not configured".into()))?;

    if !totp_secret.enabled {
        return Err(AppError::Validation("MFA not enabled".into()));
    }

    // Get user email for TOTP verification
    let db_user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    let email = db_user.email.ok_or(AppError::Internal(anyhow::anyhow!(
        "User has MFA but no email"
    )))?;

    // S-14: Verify the TOTP code with replay protection (step-up auth)
    let time_step = state
        .totp_service
        .verify_with_replay_check(
            &totp_secret.secret,
            &req.code,
            &email,
            totp_secret.last_used_time_step,
        )?
        .ok_or(AppError::Validation("Invalid verification code".into()))?;

    // S-14: Record the used time step to prevent replay
    if !state
        .totp_repo
        .record_used_time_step_if_newer(user_id, time_step)
        .await?
    {
        return Err(AppError::Validation("Invalid verification code".into()));
    }

    // Record strong auth for step-up protected operations.
    state.step_up_service.record_strong_auth(session_id).await?;

    // Generate new recovery codes
    let recovery_codes = state.totp_service.generate_recovery_codes();
    let code_hashes: Vec<String> = recovery_codes
        .iter()
        .map(|c| TotpService::hash_recovery_code(c))
        .collect::<Result<Vec<_>, _>>()?;

    // Store new recovery codes (replaces existing)
    state
        .totp_repo
        .store_recovery_codes(user_id, code_hashes)
        .await?;

    // REL-001: Log audit event with warning on failure (security-critical event)
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
    fn test_disable_mfa_request_deserialize() {
        let json = r#"{"password": "mypassword"}"#;
        let req: DisableMfaRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.password, "mypassword");
    }

    #[test]
    fn test_mfa_status_response_serialize() {
        let response = MfaStatusResponse {
            enabled: true,
            recovery_codes_remaining: 8,
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"enabled\":true"));
        assert!(json.contains("\"recoveryCodesRemaining\":8"));
    }
}
