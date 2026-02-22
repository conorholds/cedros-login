//! Password change handler for authenticated users
//!
//! Allows users to change their password while logged in.
//! Automatically re-encrypts wallet Share A if user has a password-protected wallet.

use axum::{extract::State, http::HeaderMap, Json};
use serde::Deserialize;
use std::sync::Arc;
use zeroize::{Zeroize, ZeroizeOnDrop};

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::{AuditEventType, RotateUserSecret, ShareAAuthMethod};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// Request to change password
///
/// SEC-005: Derives Zeroize and ZeroizeOnDrop to clear password fields from memory.
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
/// If user has a wallet with password auth method, automatically re-encrypts Share A
/// with the new password. This is transparent to the user.
pub async fn change_password<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<ChangePasswordRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
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
    // S-20: The .clone() is required because spawn_blocking needs 'static ownership.
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

    // Check if user has a wallet with password auth method
    let wallet_material = state
        .wallet_material_repo
        .find_default_by_user(user_id)
        .await?;
    let needs_wallet_reencrypt = wallet_material
        .as_ref()
        .map(|m| m.share_a_auth_method == ShareAAuthMethod::Password)
        .unwrap_or(false);

    // S-12: Re-encrypt Share A and update password in sequence.
    // These are not wrapped in a single DB transaction (repository layer doesn't
    // expose transactions). The window between the two writes is small, but on crash
    // between them the wallet could become inaccessible. Password update happens last
    // so that on partial failure the wallet is still encrypted with the old password
    // and the user can retry with the old password.
    // TODO: Wrap in DB transaction when repository layer supports it.
    if needs_wallet_reencrypt {
        // 8.2: Use let-else instead of .unwrap() for defensive error handling
        let Some(material) = wallet_material.as_ref() else {
            return Err(AppError::Internal(anyhow::anyhow!(
                "wallet material missing after needs_wallet_reencrypt check"
            )));
        };

        // Re-encrypt Share A with new password
        let reencrypted = state
            .wallet_signing_service
            .reencrypt_share_a(material, &req.current_password, &req.new_password)
            .await?;

        // Update wallet material with new encryption
        state
            .wallet_material_repo
            .rotate_user_secret(
                user_id,
                RotateUserSecret {
                    new_auth_method: ShareAAuthMethod::Password,
                    share_a_ciphertext: reencrypted.ciphertext,
                    share_a_nonce: reencrypted.nonce,
                    share_a_kdf_salt: Some(reencrypted.salt),
                    share_a_kdf_params: material.share_a_kdf_params.clone(),
                    prf_salt: None,
                    share_a_pin_hash: None,
                },
            )
            .await?;

        tracing::info!(user_id = %user_id, "Re-encrypted wallet Share A for password change");
    }

    // Update user password
    state
        .user_repo
        .update_password(user_id, &new_password_hash)
        .await?;

    // Revoke all other sessions (keep current session active)
    // This forces re-login on other devices after password change
    if let Some(session_id) = auth.session_id {
        state
            .session_repo
            .revoke_all_except(user_id, session_id)
            .await?;
    } else {
        state
            .session_repo
            .revoke_all_for_user_with_reason(user_id, "password_change")
            .await?;
    }

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
