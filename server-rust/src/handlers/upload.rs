//! File upload handlers (avatar images)

use axum::{
    extract::{Multipart, State},
    http::HeaderMap,
    response::IntoResponse,
    Json,
};
use serde::Serialize;
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::services::{EmailService, S3ImageStorageConfig, S3ImageStorageService, ImageStorageService};
use crate::utils::{authenticate, process_avatar, user_entity_to_auth_user};
use crate::AppState;

/// POST /upload/avatar — Upload and process a profile picture
///
/// Accepts multipart/form-data with a single image file.
/// Resizes to 256x256 WebP and stores in S3-compatible storage.
/// Updates `users.picture` with the resulting URL.
pub async fn upload_avatar<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, AppError> {
    // Authenticate
    let auth = authenticate(&state, &headers).await?;

    // Check if image storage is enabled
    let enabled = state
        .settings_service
        .get("image_storage_enabled")
        .await?
        .unwrap_or_default();
    if enabled != "true" {
        return Err(AppError::Validation(
            "Image storage is not enabled. Configure it in admin settings.".into(),
        ));
    }

    // Extract file from multipart
    let field = multipart
        .next_field()
        .await
        .map_err(|e| AppError::Validation(format!("Invalid multipart data: {}", e)))?
        .ok_or_else(|| AppError::Validation("No file provided".into()))?;

    // Validate content type
    let content_type = field
        .content_type()
        .unwrap_or("application/octet-stream")
        .to_string();
    const ALLOWED_TYPES: &[&str] = &["image/jpeg", "image/png", "image/gif", "image/webp"];
    if !ALLOWED_TYPES.contains(&content_type.as_str()) {
        return Err(AppError::Validation(format!(
            "Unsupported image type '{}'. Allowed: JPEG, PNG, GIF, WebP.",
            content_type
        )));
    }

    // Read file bytes
    let data = field.bytes().await.map_err(|e| {
        AppError::Validation(format!("Failed to read upload data: {}", e))
    })?;

    // Process image (resize + convert to WebP)
    let processed = process_avatar(&data)?;

    // Build S3 service from settings
    let storage_service = build_storage_service(&state).await?;

    // Upload
    let url = storage_service.upload_avatar(auth.user_id, &processed).await?;

    // Update user.picture in database
    let mut user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;
    user.picture = Some(url.clone());
    let updated = state.user_repo.update(user).await?;

    Ok(Json(AvatarUploadResponse {
        picture: url,
        user: crate::models::UserResponse {
            user: user_entity_to_auth_user(&updated),
        },
    }))
}

#[derive(Serialize)]
pub struct AvatarUploadResponse {
    pub picture: String,
    pub user: crate::models::UserResponse,
}

/// Build an S3ImageStorageService from runtime settings, decrypting secrets.
async fn build_storage_service<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
) -> Result<S3ImageStorageService, AppError> {
    let ss = &state.settings_service;

    let bucket = ss.get("image_storage_bucket").await?.unwrap_or_default();
    let region = ss.get("image_storage_region").await?.unwrap_or_default();
    let endpoint = ss.get("image_storage_endpoint").await?.unwrap_or_default();
    let cdn_url = ss.get("image_storage_cdn_url").await?.unwrap_or_default();

    // Secrets are encrypted — use get_secret for decryption
    let access_key = ss.get_secret("image_storage_access_key").await?.unwrap_or_default();
    let secret_key = ss.get_secret("image_storage_secret_key").await?.unwrap_or_default();

    if bucket.is_empty() {
        return Err(AppError::Validation(
            "Image storage bucket is not configured".into(),
        ));
    }
    if access_key.is_empty() || secret_key.is_empty() {
        return Err(AppError::Validation(
            "Image storage credentials are not configured".into(),
        ));
    }

    S3ImageStorageService::new(S3ImageStorageConfig {
        bucket,
        region,
        endpoint,
        access_key,
        secret_key,
        cdn_url: Some(cdn_url),
    })
}
