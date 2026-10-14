//! API key management handlers

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{
    ApiKeyListResponse, ApiKeyResponse, CreateApiKeyRequest, CreateApiKeyResponse, MessageResponse,
    ValidateApiKeyRequest, ValidateApiKeyResponse,
};
use crate::repositories::{generate_api_key, ApiKeyEntity};
use crate::services::EmailService;
use crate::utils::authenticate_session;
use crate::AppState;

/// POST /auth/api-key/validate - Validate an API key
///
/// Public endpoint (no auth required) - the API key itself is the authentication.
/// Returns user info if valid.
pub async fn validate_api_key<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Json(request): Json<ValidateApiKeyRequest>,
) -> Result<Json<ValidateApiKeyResponse>, AppError> {
    // Use find_by_key which performs constant-time hash comparison
    let api_key = match state.api_key_repo.find_by_key(&request.api_key).await? {
        Some(key) => key,
        None => {
            return Ok(Json(ValidateApiKeyResponse {
                valid: false,
                user_id: None,
                user_email: None,
                message: Some("Invalid API key".to_string()),
            }));
        }
    };

    // Update last_used_at
    state.api_key_repo.update_last_used(api_key.id).await?;

    // Return uniform "invalid" response if user is missing (e.g. deleted)
    // to avoid leaking that a valid API key exists for a removed user.
    let user = match state.user_repo.find_by_id(api_key.user_id).await? {
        Some(user) if !user.is_deleted() => user,
        None => {
            return Ok(Json(ValidateApiKeyResponse {
                valid: false,
                user_id: None,
                user_email: None,
                message: Some("Invalid API key".to_string()),
            }));
        }
        Some(_) => {
            return Ok(Json(ValidateApiKeyResponse {
                valid: false,
                user_id: None,
                user_email: None,
                message: Some("Invalid API key".to_string()),
            }));
        }
    };
    let verification_required = state
        .settings_service
        .email_verification_required(state.config.email.require_verification)
        .await?;
    if (verification_required && user.email.is_some() && !user.email_verified)
        || state.invite_code_service.is_user_blocked(user.id).await?
    {
        return Ok(Json(ValidateApiKeyResponse {
            valid: false,
            user_id: None,
            user_email: None,
            message: Some("Invalid API key".to_string()),
        }));
    }

    Ok(Json(ValidateApiKeyResponse {
        valid: true,
        user_id: Some(user.id),
        user_email: user.email,
        message: None,
    }))
}

/// GET /user/api-keys - List all API keys for current user
pub async fn list_api_keys<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<ApiKeyListResponse>, AppError> {
    let auth = authenticate_session(&state, &headers).await?;
    let keys = state.api_key_repo.find_by_user_id(auth.user_id).await?;
    let keys: Vec<ApiKeyResponse> = keys.iter().map(ApiKeyResponse::from).collect();
    Ok(Json(ApiKeyListResponse { keys }))
}

/// POST /user/api-keys - Create a new API key with a label
pub async fn create_api_key<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<CreateApiKeyRequest>,
) -> Result<Json<CreateApiKeyResponse>, AppError> {
    let auth = authenticate_session(&state, &headers).await?;
    let session_id = auth.session_id.ok_or(AppError::StepUpRequired)?;
    state.step_up_service.require_step_up(session_id).await?;
    let user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;
    if auth.email_verified != Some(user.email_verified) {
        return Err(AppError::InvalidToken);
    }

    let label = req.label.trim().to_string();
    // Use chars().count() for Unicode-aware length check
    if label.is_empty() || label.chars().count() > 100 {
        return Err(AppError::Validation(
            "Label must be 1-100 characters".into(),
        ));
    }

    // Enforce per-user API key limit to prevent resource exhaustion.
    // This check-then-insert has a small TOCTOU window where concurrent
    // requests could both pass the check. The consequence is at most +1 extra key,
    // not a security issue. A DB unique constraint or serializable transaction
    // would eliminate the race but is not worth the complexity.
    const MAX_KEYS_PER_USER: usize = 10;
    let existing = state.api_key_repo.find_by_user_id(auth.user_id).await?;
    if existing.len() >= MAX_KEYS_PER_USER {
        return Err(AppError::Validation(format!(
            "Maximum of {MAX_KEYS_PER_USER} API keys per user reached"
        )));
    }

    let raw_key = generate_api_key();
    let entity = ApiKeyEntity::new(auth.user_id, &raw_key, &label);
    let created = state
        .storage
        .credential_lifecycle_repo
        .create_api_key_if_current(&user, session_id, entity)
        .await?;

    Ok(Json(CreateApiKeyResponse {
        api_key: raw_key,
        id: created.id,
        key_prefix: created.key_prefix,
        label: created.label,
        created_at: created.created_at,
        message: "Store this key securely. It cannot be retrieved again.".to_string(),
    }))
}

/// DELETE /user/api-keys/{id} - Delete a specific API key
///
pub async fn delete_api_key<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(key_id): Path<Uuid>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate_session(&state, &headers).await?;

    let deleted = state
        .api_key_repo
        .delete_by_id(key_id, auth.user_id)
        .await?;

    if !deleted {
        return Err(AppError::NotFound("API key not found".into()));
    }

    Ok(Json(MessageResponse {
        message: "API key deleted".to_string(),
    }))
}
