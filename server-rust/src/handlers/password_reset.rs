//! Password reset handlers
//!
//! # Security (SEC-07)
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
use crate::AppState;

/// SEC-003: Add random delay to mask timing differences and prevent email enumeration.
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
/// SEC-005: Derives Zeroize and ZeroizeOnDrop to clear password from memory.
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
    if !state.config.email.enabled {
        return Err(AppError::NotFound("Email auth disabled".into()));
    }

    // Always return success to prevent email enumeration
    let response = (
        StatusCode::OK,
        Json(MessageResponse {
            message: "If an account exists, a reset email has been sent".to_string(),
        }),
    );

    // F-34: Normalize email (NFKC + lowercase) to prevent Unicode homograph bypasses
    let email = normalize_email(&req.email);

    // Find user by email first
    let user = match state.user_repo.find_by_email(&email).await? {
        Some(u) => u,
        None => {
            // SEC-003: Add delay to prevent timing-based email enumeration
            add_timing_normalization_delay().await;
            return Ok(response); // Don't reveal if email exists
        }
    };

    // S-15: Rate-limit after user lookup so attackers can't lock out real users
    // by flooding reset requests for their email address. Non-existent emails
    // are handled above with a timing-normalized early return.
    let throttle_key = format!("password_reset:{}", email);
    let throttle_status = state
        .login_attempt_repo
        .record_failed_attempt_atomic(None, &throttle_key, None, &state.login_attempt_config)
        .await?;
    if throttle_status.is_locked {
        if let Some(remaining) = throttle_status.lockout_remaining_secs {
            return Err(AppError::TooManyRequests(format!(
                "Too many password reset requests. Try again in {} seconds",
                remaining
            )));
        }
        return Err(AppError::RateLimited);
    }

    // User must have a password (email auth method)
    if user.password_hash.is_none() {
        // SEC-003: Add delay to prevent timing-based email enumeration
        add_timing_normalization_delay().await;
        return Ok(response); // Don't reveal if user has no password
    }

    // Delete any existing reset tokens for this user
    state
        .verification_repo
        .delete_for_user(user.id, TokenType::PasswordReset)
        .await?;

    // Generate and store token
    let token = generate_verification_token();
    let token_hash = hash_verification_token(&token);

    state
        .verification_repo
        .create(
            user.id,
            &token_hash,
            TokenType::PasswordReset,
            default_expiry(TokenType::PasswordReset),
        )
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create token: {}", e)))?;

    // Queue password reset email via outbox for async delivery
    state
        .comms_service
        .queue_password_reset_email(&email, user.name.as_deref(), &token, Some(user.id))
        .await?;

    // REL-001: Log audit event with warning on failure (security-critical event)
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
    if !state.config.email.enabled {
        return Err(AppError::NotFound("Email auth disabled".into()));
    }

    // S-21: Validate and hash password BEFORE consuming token so that if
    // either fails, the token is not wasted and the user can retry.
    state.password_service.validate(&req.new_password)?;
    let password_hash = state
        .password_service
        .hash(req.new_password.clone())
        .await?;

    let token_hash = hash_verification_token(&req.token);

    // Atomically consume the token (prevents TOCTOU race conditions)
    let token = state
        .verification_repo
        .consume_if_valid(&token_hash)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to consume token: {}", e)))?
        .ok_or_else(|| AppError::Validation("Invalid or expired token".to_string()))?;

    if token.token_type != TokenType::PasswordReset {
        return Err(AppError::Validation("Invalid token type".to_string()));
    }

    // Update user password
    state
        .user_repo
        .update_password(token.user_id, &password_hash)
        .await?;

    // Revoke all sessions for this user (force re-login)
    state
        .session_repo
        .revoke_all_for_user_with_reason(token.user_id, "password_reset")
        .await?;

    // REL-001: Log audit event with warning on failure (security-critical event)
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
