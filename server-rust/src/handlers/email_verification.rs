//! Email verification handlers

use axum::{extract::State, http::StatusCode, Json};
use serde::Deserialize;
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::{
    default_expiry, generate_verification_token, hash_verification_token, normalize_email,
    TokenType,
};
use crate::services::EmailService;
use crate::AppState;

/// Request to send verification email
#[derive(Debug, Deserialize)]
pub struct SendVerificationRequest {
    pub email: String,
}

/// Request to verify email with token
#[derive(Debug, Deserialize)]
pub struct VerifyEmailRequest {
    pub token: String,
}

/// POST /auth/send-verification - Send verification email
pub async fn send_verification<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Json(req): Json<SendVerificationRequest>,
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

    let response = (
        StatusCode::OK,
        Json(MessageResponse {
            message: "If an account exists, a verification email has been sent".to_string(),
        }),
    );

    // F-34: Normalize email (NFKC + lowercase) to prevent Unicode homograph bypasses
    let email = normalize_email(&req.email);
    let user = match state.user_repo.find_by_email(&email).await? {
        Some(user) => user,
        None => return Ok(response),
    };

    if user.email_verified {
        return Ok(response);
    }

    // Delete any existing verification tokens for this user
    state
        .verification_repo
        .delete_for_user(user.id, TokenType::EmailVerify)
        .await?;

    // Generate and store token
    let token = generate_verification_token();
    let token_hash = hash_verification_token(&token);

    state
        .verification_repo
        .create(
            user.id,
            &token_hash,
            TokenType::EmailVerify,
            default_expiry(TokenType::EmailVerify),
        )
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create token: {}", e)))?;

    // Queue verification email via outbox for async delivery
    state
        .comms_service
        .queue_verification_email(&email, user.name.as_deref(), &token, Some(user.id))
        .await?;

    Ok(response)
}

/// POST /auth/verify-email - Verify email with token
pub async fn verify_email<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Json(req): Json<VerifyEmailRequest>,
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

    let token_hash = hash_verification_token(&req.token);

    // Atomically consume the token (prevents TOCTOU race conditions)
    let token = state
        .verification_repo
        .consume_if_valid(&token_hash)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to consume token: {}", e)))?
        .ok_or_else(|| AppError::Validation("Invalid or expired token".to_string()))?;

    if token.token_type != TokenType::EmailVerify {
        return Err(AppError::Validation("Invalid token type".to_string()));
    }

    // Update user email_verified status
    state
        .user_repo
        .set_email_verified(token.user_id, true)
        .await?;

    Ok((
        StatusCode::OK,
        Json(MessageResponse {
            message: "Email verified successfully".to_string(),
        }),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verification_request_deserialize() {
        let json = r#"{"email": "test@example.com"}"#;
        let req: SendVerificationRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "test@example.com");
    }

    #[test]
    fn test_verify_email_request_deserialize() {
        let json = r#"{"token": "abc123"}"#;
        let req: VerifyEmailRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.token, "abc123");
    }

    #[test]
    fn test_message_response_serialize() {
        let resp = MessageResponse {
            message: "Test message".to_string(),
        };
        let json = serde_json::to_string(&resp).unwrap();
        assert!(json.contains("Test message"));
    }
}
