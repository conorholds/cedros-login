//! Password change handler for authenticated users
//!
//! Allows users to change their password while logged in.

use axum::{extract::State, http::HeaderMap, Json};
use serde::Deserialize;
use std::sync::Arc;
use zeroize::{Zeroize, ZeroizeOnDrop};

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::AuditEventType;
use crate::services::EmailService;
use crate::utils::authenticate_session;
use crate::AppState;

/// Request to change password
///
/// Derives Zeroize and ZeroizeOnDrop to clear password fields from memory.
#[derive(Debug, Deserialize, Zeroize, ZeroizeOnDrop)]
#[serde(rename_all = "camelCase")]
pub struct ChangePasswordRequest {
    /// Current password for verification
    pub current_password: String,
    /// New password
    pub new_password: String,
}

/// POST /auth/change-password - Change password for authenticated user
///
pub async fn change_password<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<ChangePasswordRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate_session(&state, &headers).await?;
    let user_id = auth.user_id;

    // Get user
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    // User must have a password (email auth method)
    let password_hash = user
        .password_hash
        .as_ref()
        .ok_or_else(|| AppError::Validation("User has no password set".into()))?;

    // Verify current password
    // The .clone() is required because spawn_blocking needs 'static ownership.
    // The clone is dropped (not zeroized) after verify completes. The original in
    // `req` IS zeroized on drop (via ZeroizeOnDrop derive). Accepted trade-off:
    // spawn_blocking fundamentally requires an owned copy.
    if !state
        .password_service
        .verify(req.current_password.clone(), password_hash.clone())
        .await?
    {
        return Err(AppError::InvalidCredentials);
    }

    // Validate new password
    state.password_service.validate(&req.new_password)?;

    // Hash new password
    let new_password_hash = state
        .password_service
        .hash(req.new_password.clone())
        .await?;

    state
        .storage
        .credential_lifecycle_repo
        .change_password(
            user_id,
            user.password_hash.as_deref(),
            &new_password_hash,
            auth.session_id,
        )
        .await?;

    // Log audit event
    let _ = state
        .audit_service
        .log_password_event(AuditEventType::UserPasswordChanged, user_id, Some(&headers))
        .await;

    Ok(Json(MessageResponse {
        message: "Password changed successfully".into(),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_change_password_request_deserialize() {
        let json = r#"{"currentPassword": "old123", "newPassword": "new456"}"#;
        let req: ChangePasswordRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.current_password, "old123");
        assert_eq!(req.new_password, "new456");
    }
}
