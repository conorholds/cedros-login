//! File upload handlers (avatar images)

use axum::{
    extract::{Multipart, State},
    http::HeaderMap,
    response::IntoResponse,
    Json,
};
use serde::Serialize;
use std::{future::Future, sync::Arc, time::Duration};

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::services::{build_s3_image_storage_service, EmailService, ImageStorageService};
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

    // Admit before accumulating the body; overload retains no decoded image or queued job.
    let cpu = crate::services::cpu_work::admit_image()?;

    let data = upload_body_deadline(
        async {
            // Extract file from multipart
            let field = multipart
                .next_field()
                .await
                .map_err(|e| AppError::Validation(format!("Invalid multipart data: {e}")))?
                .ok_or_else(|| AppError::Validation("No file provided".into()))?;

            // Validate content type
            let content_type = field
                .content_type()
                .unwrap_or("application/octet-stream")
                .to_string();
            const ALLOWED_TYPES: &[&str] = &["image/jpeg", "image/png", "image/gif", "image/webp"];
            if !ALLOWED_TYPES.contains(&content_type.as_str()) {
                return Err(AppError::Validation(format!(
                    "Unsupported image type '{content_type}'. Allowed: JPEG, PNG, GIF, WebP."
                )));
            }

            // Read file bytes
            let data = field
                .bytes()
                .await
                .map_err(|e| AppError::Validation(format!("Failed to read upload data: {e}")))?;
            Ok(data)
        },
        Duration::from_secs(30),
    )
    .await?;

    // Process image (resize + convert to WebP)
    let processed = cpu.run(move || process_avatar(&data)).await?;

    // Build S3 service from settings
    let storage_service = build_storage_service(&state).await?;

    // Upload
    let url = storage_service
        .upload_avatar(auth.user_id, &processed)
        .await?;

    // Update user.picture in database
    let mut user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;
    let user_revision = user.updated_at;
    user.picture = Some(url.clone());
    let updated = state
        .user_repo
        .update_if_current(user, user_revision)
        .await?;

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
pub(crate) async fn build_storage_service<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
) -> Result<crate::services::S3ImageStorageService, AppError> {
    build_s3_image_storage_service(&state.settings_service).await
}

// Admission also covers body accumulation, so a slow sender must not retain the
// sole image slot indefinitely. Dropping this future releases the handler permit.
async fn upload_body_deadline<T>(
    read: impl Future<Output = Result<T, AppError>>,
    deadline: Duration,
) -> Result<T, AppError> {
    tokio::time::timeout(deadline, read)
        .await
        .map_err(|_| AppError::Validation("Upload body timed out".into()))?
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn upload_body_deadline_preserves_success_and_validation_errors() {
        assert_eq!(
            upload_body_deadline(async { Ok(42) }, Duration::from_secs(1))
                .await
                .unwrap(),
            42
        );
        let result = upload_body_deadline(
            async { Err::<(), _>(AppError::Validation("invalid multipart".into())) },
            Duration::from_secs(1),
        )
        .await;
        assert!(
            matches!(result, Err(AppError::Validation(message)) if message == "invalid multipart")
        );
    }

    #[tokio::test]
    async fn stalled_body_is_cancelled_and_releases_owned_resources() {
        let pool = Arc::new(tokio::sync::Semaphore::new(1));
        let permit = pool.clone().acquire_owned().await.unwrap();
        let result = upload_body_deadline(
            async move {
                let _permit = permit;
                std::future::pending::<Result<(), AppError>>().await
            },
            Duration::from_millis(10),
        )
        .await;
        assert!(
            matches!(result, Err(AppError::Validation(message)) if message == "Upload body timed out")
        );
        assert_eq!(pool.available_permits(), 1);
    }
}
