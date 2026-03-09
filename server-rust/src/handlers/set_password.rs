//! Set initial password handler for OAuth-only users
//!
//! Allows users who signed up via Google/Apple/SSO to set an account password.
//! This is required before wallet enrollment can use password-based Share A encryption.

use axum::{extract::State, http::HeaderMap, Json};
use serde::Deserialize;
use std::sync::Arc;
use zeroize::{Zeroize, ZeroizeOnDrop};

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::{AuditEventType, CredentialEntity, CredentialType};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// Request to set initial password (for OAuth-only users)
///
/// SEC-005: Derives Zeroize and ZeroizeOnDrop to clear password from memory.
#[derive(Debug, Deserialize, Zeroize, ZeroizeOnDrop)]
#[serde(rename_all = "camelCase")]
pub struct SetPasswordRequest {
    pub password: String,
}

/// POST /auth/set-password - Set initial password for OAuth-only user
///
/// Rejects users who already have a password. For password changes, use
/// POST /auth/change-password instead.
pub async fn set_password<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<SetPasswordRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // Get user
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    // Reject users who already have a password
    if user.password_hash.is_some() {
        return Err(AppError::Validation(
            "User already has a password. Use change-password instead.".into(),
        ));
    }

    // Validate password
    state.password_service.validate(&req.password)?;

    // Hash password
    let password_hash = state.password_service.hash(req.password.clone()).await?;

    // Update user password
    state
        .user_repo
        .update_password(user_id, &password_hash)
        .await?;

    // Create password credential entry
    let credential = CredentialEntity::new(user_id, CredentialType::Password, None);
    let _ = state.credential_repo.create(credential).await;

    // Audit log (reuse UserPasswordChanged — semantically correct for "password set")
    let _ = state
        .audit_service
        .log_password_event(AuditEventType::UserPasswordChanged, user_id, Some(&headers))
        .await;

    Ok(Json(MessageResponse {
        message: "Password set successfully".into(),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_set_password_request_deserialize() {
        let json = r#"{"password": "MyStr0ng!Pass"}"#;
        let req: SetPasswordRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.password, "MyStr0ng!Pass");
    }
}
