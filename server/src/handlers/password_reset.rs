//! Password reset handlers
//!
//! # Security
//!
//! Rate limiting uses both IP-based controls and per-email throttling to prevent
//! multi-source abuse for a single account. Mitigations in place:
//!
//! 1. IP-based rate limiting prevents single-source abuse
//! 2. Per-email throttling limits repeated reset requests
//! 3. Constant-time responses prevent email enumeration
//! 4. Tokens expire within configured window (default: 1 hour)
//! 5. Tokens are single-use and invalidated after use

use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    Json,
};
use rand::Rng;
use serde::Deserialize;
use std::sync::Arc;
use std::time::Duration;
use zeroize::{Zeroize, ZeroizeOnDrop};

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::{
    default_expiry, generate_verification_token, hash_verification_token, normalize_email,
    AuditEventType, TokenType,
};
use crate::services::EmailService;
use crate::utils::{ensure_primary_email_row, find_user_by_password_email};
use crate::AppState;

/// Add random delay to mask timing differences and prevent email enumeration.
///
/// This function adds a random delay between 50-150ms to make it harder to distinguish
/// between "user exists" and "user not found" responses based on timing.
async fn add_timing_normalization_delay() {
    let delay_ms = rand::thread_rng().gen_range(50..=150);
    tokio::time::sleep(Duration::from_millis(delay_ms)).await;
}

/// Request to send password reset email
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ForgotPasswordRequest {
    pub email: String,
}

/// Request to reset password with token
///
/// Derives Zeroize and ZeroizeOnDrop to clear password from memory.
#[derive(Debug, Deserialize, Zeroize, ZeroizeOnDrop)]
#[serde(rename_all = "camelCase")]
pub struct ResetPasswordRequest {
    pub token: String,
    pub new_password: String,
}

/// POST /auth/forgot-password - Send password reset email
pub async fn forgot_password<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<ForgotPasswordRequest>,
) -> Result<(StatusCode, Json<MessageResponse>), AppError> {
    // Enabled check: runtime setting > static config
    let email_enabled = state
        .settings_service
        .get_bool("auth_email_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.email.enabled);
    if !email_enabled {
        return Err(AppError::NotFound("Email auth disabled".into()));
    }

    // Always return success to prevent email enumeration
    let response = (
        StatusCode::OK,
        Json(MessageResponse {
            message: "If an account exists, a reset email has been sent".to_string(),
        }),
    );

    // Normalize email (NFKC + lowercase) to prevent Unicode homograph bypasses
    let email = normalize_email(&req.email);

    // Find user by email
    let user = match find_user_by_password_email(&state, &email, false).await? {
        Some(u) if password_recovery_allowed(&u) => u,
        None => {
            // Add delay to prevent timing-based email enumeration
            add_timing_normalization_delay().await;
            return Ok(response); // Don't reveal if email exists
        }
        Some(_) => {
            // Password reset is recovery for an existing password, not a way
            // to add a weaker credential to an OAuth/passkey/wallet account.
            add_timing_normalization_delay().await;
            return Ok(response);
        }
    };
    ensure_primary_email_row(&state, &user).await?;
    let target_email = state
        .user_email_repo
        .find_active_by_email(&email)
        .await?
        .filter(|row| {
            row.user_id == user.id
                && (row.is_verified() || (row.is_primary && !user.email_verified))
        });
    let Some(target_email) = target_email else {
        add_timing_normalization_delay().await;
        return Ok(response);
    };

    // Apply per-email throttling only after confirming an account exists,
    // so unauthenticated callers cannot lock out arbitrary email addresses.
    let throttle_key = format!("password_reset:{email}");
    let throttle_status = state
        .login_attempt_repo
        .record_failed_attempt_atomic(None, &throttle_key, None, &state.login_attempt_config)
        .await?;
    if throttle_status.is_locked {
        // Normalize timing and response to match non-existing users.
        add_timing_normalization_delay().await;
        return Ok(response);
    }
    let has_password = user.password_hash.is_some();

    // Generate and store password reset token
    let token = generate_verification_token();
    let token_hash = hash_verification_token(&token);

    let proof = crate::repositories::VerificationToken::new(
        user.id,
        Some(target_email.id),
        token_hash,
        TokenType::PasswordReset,
        default_expiry(TokenType::PasswordReset),
    );

    // Generate instant link token so the email can include a "just sign in" option
    let il_token = generate_verification_token();
    let il_token_hash = hash_verification_token(&il_token);
    let il_proof = crate::repositories::VerificationToken::new(
        user.id,
        Some(target_email.id),
        il_token_hash,
        TokenType::InstantLink,
        default_expiry(TokenType::InstantLink),
    );

    // Queue password reset email via outbox for async delivery
    state
        .comms_service
        .queue_password_reset_email(
            &email,
            user.name.as_deref(),
            &token,
            Some(user.id),
            Some(&il_token),
            has_password,
            &[proof, il_proof],
        )
        .await?;

    // Log audit event with warning on failure (security-critical event)
    if let Err(e) = state
        .audit_service
        .log_password_event(
            AuditEventType::PasswordResetRequested,
            user.id,
            Some(&headers),
        )
        .await
    {
        tracing::warn!(error = %e, user_id = %user.id, "Failed to log password reset requested audit event");
    }

    Ok(response)
}

/// POST /auth/reset-password - Reset password with token
pub async fn reset_password<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<ResetPasswordRequest>,
) -> Result<(StatusCode, Json<MessageResponse>), AppError> {
    // Enabled check: runtime setting > static config
    let email_enabled = state
        .settings_service
        .get_bool("auth_email_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.email.enabled);
    if !email_enabled {
        return Err(AppError::NotFound("Email auth disabled".into()));
    }

    // Validate and hash password BEFORE consuming token so that if
    // either fails, the token is not wasted and the user can retry.
    state.password_service.validate(&req.new_password)?;
    let password_hash = state
        .password_service
        .hash(req.new_password.clone())
        .await?;

    let token_hash = hash_verification_token(&req.token);

    let pending = state
        .verification_repo
        .find_valid(&token_hash, &[TokenType::PasswordReset])
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to load token: {e}")))?
        .ok_or_else(|| AppError::Validation("Invalid or expired token".to_string()))?;
    let user = state
        .user_repo
        .find_by_id(pending.user_id)
        .await?
        .ok_or_else(|| AppError::Validation("Invalid or expired token".to_string()))?;
    let Some(recovery_target) = recovery_target(&state, &user, pending.subject_id).await? else {
        return Err(AppError::Validation("Invalid or expired token".to_string()));
    };
    if !password_recovery_allowed(&user) {
        return Err(AppError::Validation("Invalid or expired token".to_string()));
    }

    // Atomically consume the live, purpose-bound token before mutation.
    let token = state
        .verification_repo
        .consume_if_valid(&token_hash, &[TokenType::PasswordReset])
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to consume token: {e}")))?
        .ok_or_else(|| AppError::Validation("Invalid or expired token".to_string()))?;

    if token.id != pending.id {
        return Err(AppError::Validation("Invalid or expired token".to_string()));
    }

    let claimed_unverified = target_claims_unverified_primary(&user, &recovery_target);
    if claimed_unverified {
        state
            .storage
            .email_verification_repo
            .claim_unverified_primary(&user, recovery_target.id, Some(&password_hash))
            .await?;
    } else {
        state
            .storage
            .credential_lifecycle_repo
            .change_password(
                token.user_id,
                user.password_hash.as_deref(),
                &password_hash,
                None,
            )
            .await?;
    }

    // Revoke all sessions for this user (force re-login)
    state
        .session_repo
        .revoke_all_for_user_with_reason(token.user_id, "password_reset")
        .await?;

    // Log audit event with warning on failure (security-critical event)
    if let Err(e) = state
        .audit_service
        .log_password_event(
            AuditEventType::PasswordResetCompleted,
            token.user_id,
            Some(&headers),
        )
        .await
    {
        tracing::warn!(error = %e, user_id = %token.user_id, "Failed to log password reset completed audit event");
    }

    Ok((
        StatusCode::OK,
        Json(MessageResponse {
            message: "Password reset successfully".to_string(),
        }),
    ))
}

fn password_recovery_allowed(user: &crate::repositories::UserEntity) -> bool {
    user.password_hash.is_some()
        || (user.email_verified
            && user
                .auth_methods
                .contains(&crate::models::AuthMethod::Email))
}

async fn recovery_target<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &crate::repositories::UserEntity,
    subject_id: Option<uuid::Uuid>,
) -> Result<Option<crate::repositories::UserEmailEntity>, AppError> {
    let Some(subject_id) = subject_id else {
        return Ok(None);
    };
    Ok(state
        .user_email_repo
        .find_by_id(subject_id)
        .await?
        .filter(|row| {
            row.user_id == user.id
                && (row.is_verified() || (row.is_primary && !user.email_verified))
        }))
}

fn target_claims_unverified_primary(
    user: &crate::repositories::UserEntity,
    target: &crate::repositories::UserEmailEntity,
) -> bool {
    !user.email_verified
        && target.is_primary
        && user.email.as_deref().map(normalize_email) == Some(normalize_email(&target.email))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_forgot_password_request_deserialize() {
        let json = r#"{"email": "test@example.com"}"#;
        let req: ForgotPasswordRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "test@example.com");
    }

    #[test]
    fn test_reset_password_request_deserialize() {
        let json = r#"{"token": "abc123", "newPassword": "NewPassword1!"}"#;
        let req: ResetPasswordRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.token, "abc123");
        assert_eq!(req.new_password, "NewPassword1!");
    }
}
