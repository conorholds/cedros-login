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
use crate::utils::{authenticate, AuthenticatedUser};
use crate::AppState;

/// Request to set initial password (for OAuth-only users)
///
/// Derives Zeroize and ZeroizeOnDrop to clear password from memory.
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
    ensure_interactive_session(&auth)?;
    let session_id = auth.session_id.ok_or(AppError::StepUpRequired)?;
    state.step_up_service.require_step_up(session_id).await?;
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

    state
        .storage
        .credential_lifecycle_repo
        .change_password(user_id, None, &password_hash, Some(session_id))
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

fn ensure_interactive_session(auth: &AuthenticatedUser) -> Result<(), AppError> {
    if auth.is_api_key_auth {
        return Err(AppError::Forbidden(
            "Setting a password requires an interactive session".into(),
        ));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn test_set_password_request_deserialize() {
        let json = r#"{"password": "MyStr0ng!Pass"}"#;
        let req: SetPasswordRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.password, "MyStr0ng!Pass");
    }

    #[test]
    fn test_ensure_interactive_session_rejects_api_key_auth() {
        let auth = AuthenticatedUser {
            user_id: Uuid::new_v4(),
            session_id: None,
            org_id: None,
            role: None,
            is_api_key_auth: true,
            api_key_id: Some(Uuid::new_v4()),
            raw_api_key: Some("ck_test".to_string()),
            is_system_admin: None,
            email_verified: Some(true),
        };

        let result = ensure_interactive_session(&auth);
        assert!(matches!(result, Err(AppError::Forbidden(_))));
    }

    #[test]
    fn test_ensure_interactive_session_allows_jwt_auth() {
        let auth = AuthenticatedUser {
            user_id: Uuid::new_v4(),
            session_id: Some(Uuid::new_v4()),
            org_id: None,
            role: None,
            is_api_key_auth: false,
            api_key_id: None,
            raw_api_key: None,
            is_system_admin: None,
            email_verified: Some(true),
        };

        let result = ensure_interactive_session(&auth);
        assert!(result.is_ok());
    }
}
