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
    RegenerateApiKeyResponse, ValidateApiKeyRequest, ValidateApiKeyResponse,
};
use crate::repositories::{generate_api_key, ApiKeyEntity};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// GET /user/api-key - Get current user's API key metadata
///
/// Returns the API key metadata (prefix, created_at, last_used_at) but NOT the key itself.
/// The full key is only shown once at creation/regeneration.
pub async fn get_api_key<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<ApiKeyResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Get first API key for user (backwards compat)
    let api_key = state
        .api_key_repo
        .find_one_by_user_id(auth.user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("No API key found for user".to_string()))?;

    Ok(Json(ApiKeyResponse::from(&api_key)))
}

/// POST /user/api-key/regenerate - Regenerate API key
///
/// Deletes the existing key (if any) and creates a new one.
/// Returns the full API key - this is the only time the user will see it.
pub async fn regenerate_api_key<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<RegenerateApiKeyResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // S-18: Create new key before deleting old ones.
    // If creation fails, user retains the old key (no keyless window).
    let old_keys = state.api_key_repo.find_by_user_id(auth.user_id).await?;
    let raw_key = generate_api_key();
    let entity = ApiKeyEntity::new(auth.user_id, &raw_key, "default");
    let created = state.api_key_repo.create(entity).await?;

    // Delete old keys individually (skip the new one)
    for old_key in &old_keys {
        if old_key.id != created.id {
            let _ = state
                .api_key_repo
                .delete_by_id(old_key.id, auth.user_id)
                .await;
        }
    }

    Ok(Json(RegenerateApiKeyResponse {
        api_key: raw_key,
        key_prefix: created.key_prefix,
        label: created.label,
        created_at: created.created_at,
        message: "Store this key securely. It cannot be retrieved again.".to_string(),
    }))
}

/// POST /auth/api-key/validate - Validate an API key
///
/// Public endpoint (no auth required) - the API key itself is the authentication.
/// Returns user info if valid.
pub async fn validate_api_key<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Json(request): Json<ValidateApiKeyRequest>,
) -> Result<Json<ValidateApiKeyResponse>, AppError> {
    // R-02: Use find_by_key which performs constant-time hash comparison
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

    // S-17: Return uniform "invalid" response if user is missing (e.g. deleted)
    // to avoid leaking that a valid API key exists for a removed user.
    let user = match state.user_repo.find_by_id(api_key.user_id).await? {
        Some(u) => u,
        None => {
            return Ok(Json(ValidateApiKeyResponse {
                valid: false,
                user_id: None,
                user_email: None,
                message: Some("Invalid API key".to_string()),
            }));
        }
    };

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
    let auth = authenticate(&state, &headers).await?;
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
    let auth = authenticate(&state, &headers).await?;

    let label = req.label.trim().to_string();
    // S-32: Use chars().count() for Unicode-aware length check
    if label.is_empty() || label.chars().count() > 100 {
        return Err(AppError::Validation(
            "Label must be 1-100 characters".into(),
        ));
    }

    // S-02: Enforce per-user API key limit to prevent resource exhaustion.
    // S-19: This check-then-insert has a small TOCTOU window where concurrent
    // requests could both pass the check. The consequence is at most +1 extra key,
    // not a security issue. A DB unique constraint or serializable transaction
    // would eliminate the race but is not worth the complexity.
    const MAX_KEYS_PER_USER: usize = 10;
    let existing = state.api_key_repo.find_by_user_id(auth.user_id).await?;
    if existing.len() >= MAX_KEYS_PER_USER {
        return Err(AppError::Validation(format!(
            "Maximum of {} API keys per user reached",
            MAX_KEYS_PER_USER
        )));
    }

    let raw_key = generate_api_key();
    let entity = ApiKeyEntity::new(auth.user_id, &raw_key, &label);
    let created = state.api_key_repo.create(entity).await?;

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
/// When deleting a key that has a linked wallet, the wallet becomes orphaned
/// (inaccessible via API key auth). User can rotate or delete it separately.
pub async fn delete_api_key<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(key_id): Path<Uuid>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;

    let deleted = state
        .api_key_repo
        .delete_by_id(key_id, auth.user_id)
        .await?;

    if !deleted {
        return Err(AppError::NotFound("API key not found".into()));
    }

    // Check if a wallet was linked to this key
    let orphaned_wallet = state
        .wallet_material_repo
        .find_by_api_key_id(key_id)
        .await?;

    let message = if orphaned_wallet.is_some() {
        "API key deleted. Note: a wallet was linked to this key and is now inaccessible. \
         Use wallet rotation to replace it."
            .to_string()
    } else {
        "API key deleted".to_string()
    };

    Ok(Json(MessageResponse { message }))
}
