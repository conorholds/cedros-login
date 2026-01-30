//! API key management handlers

use axum::{extract::State, http::HeaderMap, Json};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{
    ApiKeyResponse, RegenerateApiKeyResponse, ValidateApiKeyRequest, ValidateApiKeyResponse,
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

    // Get API key for user
    let api_key = state
        .api_key_repo
        .find_by_user_id(auth.user_id)
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

    // Delete existing key first, then create new one.
    // Note: If create fails after delete, user temporarily has no key. However:
    // - This only happens on DB failure, which would prevent API use anyway
    // - User can retry regeneration once DB recovers
    // - JWT auth still works as a fallback
    state.api_key_repo.delete_for_user(auth.user_id).await?;

    // Generate and store new key
    let raw_key = generate_api_key();
    let entity = ApiKeyEntity::new(auth.user_id, &raw_key);
    let created = state.api_key_repo.create(entity).await?;

    Ok(Json(RegenerateApiKeyResponse {
        api_key: raw_key,
        key_prefix: created.key_prefix,
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

    // Get user info
    let user = state
        .user_repo
        .find_by_id(api_key.user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    Ok(Json(ValidateApiKeyResponse {
        valid: true,
        user_id: Some(user.id),
        user_email: user.email,
        message: None,
    }))
}
