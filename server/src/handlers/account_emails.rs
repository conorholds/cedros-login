//! Account email management handlers.
//!
//! Emails are globally unique while verified or pending. Login lookup only uses
//! verified rows. Primary changes require recent step-up and keep `users.email`
//! denormalized for AuthUser compatibility.

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::{
    default_expiry, generate_verification_token, hash_verification_token, normalize_email,
    validate_email_ascii_local, TokenType, UserEmailEntity,
};
use crate::services::{CanonicalEmailService, EmailService};
use crate::utils::{authenticate_session, email_blocks_signup, is_valid_email};
use crate::AppState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountEmailResponse {
    pub id: Uuid,
    pub email: String,
    pub verified: bool,
    pub primary: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountEmailListResponse {
    pub emails: Vec<AccountEmailResponse>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddAccountEmailRequest {
    /// Email address to add. It is lowercased and must not be active on any account.
    pub email: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyAccountEmailRequest {
    /// Verification token sent to the added email address.
    pub token: String,
}

/// GET /auth/account/emails - list the authenticated user's emails.
pub async fn list_account_emails<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<AccountEmailListResponse>, AppError> {
    let auth = authenticate_session(&state, &headers).await?;
    Ok(Json(email_list(&state, auth.user_id).await?))
}

/// POST /auth/account/emails - add a pending email and send verification.
pub async fn add_account_email<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<AddAccountEmailRequest>,
) -> Result<Json<AccountEmailListResponse>, AppError> {
    let auth = authenticate_session(&state, &headers).await?;
    let session_id = auth.session_id.ok_or(AppError::StepUpRequired)?;
    state.step_up_service.require_step_up(session_id).await?;
    let user = current_user(&state, auth.user_id).await?;
    let email = validate_new_email(&state, &req.email).await?;
    let row = UserEmailEntity::new(user.id, email.clone(), false, false);
    let row = state.user_email_repo.create(row).await?;
    queue_email_verification(&state, &user, &row).await?;
    Ok(Json(email_list(&state, user.id).await?))
}

/// POST /auth/account/emails/{id}/resend - resend verification for a pending email.
pub async fn resend_account_email<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate_session(&state, &headers).await?;
    let user = current_user(&state, auth.user_id).await?;
    let row = owned_email(&state, user.id, id).await?;
    if row.verified_at.is_some() {
        return Ok(Json(MessageResponse {
            message: "Email is already verified".into(),
        }));
    }
    queue_email_verification(&state, &user, &row).await?;
    Ok(Json(MessageResponse {
        message: "Verification email sent".into(),
    }))
}

/// DELETE /auth/account/emails/{id} - remove a non-primary email.
pub async fn delete_account_email<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<AccountEmailListResponse>, AppError> {
    let auth = authenticate_session(&state, &headers).await?;
    let session_id = auth.session_id.ok_or(AppError::StepUpRequired)?;
    state.step_up_service.require_step_up(session_id).await?;
    let row = owned_email(&state, auth.user_id, id).await?;
    if row.is_primary {
        return Err(AppError::Validation(
            "Primary email cannot be removed".into(),
        ));
    }
    state.user_email_repo.delete(id).await?;
    state
        .session_repo
        .revoke_all_except(auth.user_id, session_id)
        .await?;
    Ok(Json(email_list(&state, auth.user_id).await?))
}

/// POST /auth/account/emails/{id}/primary - promote a verified email to primary.
pub async fn set_primary_account_email<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<AccountEmailListResponse>, AppError> {
    let auth = authenticate_session(&state, &headers).await?;
    let session_id = auth.session_id.ok_or(AppError::StepUpRequired)?;
    state.step_up_service.require_step_up(session_id).await?;
    let row = owned_email(&state, auth.user_id, id).await?;
    if row.verified_at.is_none() {
        return Err(AppError::Validation(
            "Primary email must be verified".into(),
        ));
    }
    CanonicalEmailService::new(state.storage.canonical_email_repo.clone())
        .promote(auth.user_id, id)
        .await?;
    state
        .session_repo
        .revoke_all_except(auth.user_id, session_id)
        .await?;
    Ok(Json(email_list(&state, auth.user_id).await?))
}

/// POST /auth/account/emails/verify - consume an added-email verification token.
pub async fn verify_account_email<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Json(req): Json<VerifyAccountEmailRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    consume_account_email_token(&state, &req.token).await?;
    Ok(Json(MessageResponse {
        message: "Email verified successfully".into(),
    }))
}

pub async fn consume_account_email_token<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    token: &str,
) -> Result<UserEmailEntity, AppError> {
    let token_hash = hash_verification_token(token);
    let outcome = state
        .storage
        .email_verification_repo
        .verify_email_token(&token_hash, &[TokenType::AccountEmailVerify])
        .await
        .map_err(|error| {
            if matches!(
                error,
                AppError::Validation(_) | AppError::NotFound(_) | AppError::ServiceUnavailable(_)
            ) {
                error
            } else {
                AppError::Internal(anyhow::anyhow!("Failed to verify email token: {error}"))
            }
        })?
        .ok_or_else(|| AppError::Validation("Invalid or expired token".into()))?;
    state
        .session_repo
        .revoke_all_for_user_with_reason(outcome.email.user_id, "email_identity_changed")
        .await?;
    Ok(outcome.email)
}

async fn validate_new_email<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    email: &str,
) -> Result<String, AppError> {
    if !is_valid_email(email) {
        return Err(AppError::Validation("Invalid email format".into()));
    }
    validate_email_ascii_local(email)?;
    let normalized = normalize_email(email);
    if email_blocks_signup(state, &normalized).await? {
        return Err(AppError::EmailExists);
    }
    Ok(normalized)
}

async fn queue_email_verification<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &crate::repositories::UserEntity,
    row: &UserEmailEntity,
) -> Result<(), AppError> {
    let token = generate_verification_token();
    let token_hash = hash_verification_token(&token);
    let proof = crate::repositories::VerificationToken::new(
        user.id,
        Some(row.id),
        token_hash,
        TokenType::AccountEmailVerify,
        default_expiry(TokenType::AccountEmailVerify),
    );
    state
        .comms_service
        .queue_verification_email(
            &row.email,
            user.name.as_deref(),
            &token,
            Some(user.id),
            &[proof],
        )
        .await?;
    Ok(())
}

async fn email_list<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: Uuid,
) -> Result<AccountEmailListResponse, AppError> {
    let emails = state
        .user_email_repo
        .list_by_user(user_id)
        .await?
        .into_iter()
        .map(email_response)
        .collect();
    Ok(AccountEmailListResponse { emails })
}

async fn current_user<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: Uuid,
) -> Result<crate::repositories::UserEntity, AppError> {
    state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::InvalidToken)
}

async fn owned_email<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: Uuid,
    id: Uuid,
) -> Result<UserEmailEntity, AppError> {
    state
        .user_email_repo
        .find_by_id(id)
        .await?
        .filter(|row| row.user_id == user_id)
        .ok_or_else(|| AppError::NotFound("Email not found".into()))
}

fn email_response(row: UserEmailEntity) -> AccountEmailResponse {
    AccountEmailResponse {
        id: row.id,
        email: row.email,
        verified: row.verified_at.is_some(),
        primary: row.is_primary,
        created_at: row.created_at,
    }
}
