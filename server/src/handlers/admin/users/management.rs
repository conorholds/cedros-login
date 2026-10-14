//! Admin mutations for individual users.

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use super::access::validate_system_admin;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{
    AdminUpdateUserRequest, AdminUserResponse, MessageResponse, SetSystemAdminRequest,
};
use crate::repositories::{
    default_expiry, generate_verification_token, hash_verification_token, TokenType, UserEntity,
};
use crate::services::{delete_account, CanonicalEmailService, EmailService};
use crate::AppState;

/// Set a user's system-admin status.
pub async fn set_system_admin<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Json(request): Json<SetSystemAdminRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;
    if user_id == admin_id && !request.is_admin {
        return Err(AppError::Validation(
            "Cannot remove your own system admin status".into(),
        ));
    }

    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;
    if user.is_system_admin == request.is_admin {
        let status = if request.is_admin { "already" } else { "not" };
        return Ok(Json(MessageResponse {
            message: format!("User is {status} a system admin"),
        }));
    }

    state
        .user_repo
        .set_system_admin(user_id, request.is_admin)
        .await?;
    let action = if request.is_admin {
        "granted"
    } else {
        "revoked"
    };
    tracing::info!(
        admin_id = %admin_id,
        target_user_id = %user_id,
        action,
        "Admin {} system admin status for user",
        action
    );
    Ok(Json(MessageResponse {
        message: format!("System admin status {action} for user"),
    }))
}

/// Update a user's profile through the canonical-email transition service.
pub async fn update_user<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Json(request): Json<AdminUpdateUserRequest>,
) -> Result<Json<AdminUserResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;
    let name_changed = request.name.is_some();
    let email_changed = request.email.is_some();
    let updated_email_verified = request.email_verified;
    let updated = CanonicalEmailService::new(state.storage.canonical_email_repo.clone())
        .admin_update(user_id, request.name, request.email, request.email_verified)
        .await?;

    tracing::info!(
        admin_id = %admin_id,
        target_user_id = %user_id,
        name_changed,
        email_changed,
        updated_email_verified = ?updated_email_verified,
        "Admin updated user profile"
    );
    Ok(Json(AdminUserResponse::from(&updated)))
}

/// Delete a non-admin user account.
pub async fn delete_user<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
) -> Result<Json<MessageResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;
    if user_id == admin_id {
        return Err(AppError::Validation(
            "Cannot delete your own account".into(),
        ));
    }

    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;
    reject_system_admin_deletion(&user)?;
    delete_account(&state, user_id, Some(&headers)).await?;

    tracing::info!(
        admin_id = %admin_id,
        deleted_user_id = %user_id,
        "Admin deleted user account"
    );
    Ok(Json(MessageResponse {
        message: "User deleted successfully".to_string(),
    }))
}

fn reject_system_admin_deletion(user: &UserEntity) -> Result<(), AppError> {
    if user.is_system_admin {
        return Err(AppError::Validation(
            "Cannot delete a system admin. Remove admin status first.".into(),
        ));
    }
    Ok(())
}

/// Queue a password-reset email for a user.
pub async fn force_password_reset<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
) -> Result<Json<MessageResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;
    let email = user
        .email
        .as_deref()
        .ok_or(AppError::Validation("User has no email address".into()))?;
    if user.password_hash.is_none() {
        return Err(AppError::Validation(
            "User does not have a password to reset".into(),
        ));
    }

    let token = generate_verification_token();
    crate::utils::ensure_primary_email_row(&state, &user).await?;
    let primary = state
        .user_email_repo
        .find_active_by_email(email)
        .await?
        .filter(|row| row.user_id == user_id && row.is_primary)
        .ok_or_else(|| AppError::Validation("Primary email unavailable".into()))?;
    let proof = crate::repositories::VerificationToken::new(
        user_id,
        Some(primary.id),
        hash_verification_token(&token),
        TokenType::PasswordReset,
        default_expiry(TokenType::PasswordReset),
    );
    state
        .comms_service
        .queue_password_reset_email(
            email,
            user.name.as_deref(),
            &token,
            Some(user_id),
            None,
            user.password_hash.is_some(),
            &[proof],
        )
        .await?;

    Ok(Json(MessageResponse {
        message: "Password reset email queued".to_string(),
    }))
}
