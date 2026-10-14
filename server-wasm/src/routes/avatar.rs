//! Profile avatar upload / serve / delete (`cedros-login:auth`). Opt-in via the
//! `auth_avatar_upload_enabled` setting. Images live in the site storage provider
//! at the extension-namespaced key `avatars/{user_id}` as a normalized 256px WebP
//! (base64). The storage seam has no presigned URL and the route body is text, so
//! GET returns JSON `{ contentType, content (base64) }` for the client data URL.
use serde::{Deserialize, Serialize};

use base64::engine::general_purpose::STANDARD;
use base64::Engine;

use super::auth::authenticated_user;
use super::{error_response, json, validation, RouteError};
use crate::clock;
use crate::data::users;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, log, settings, storage, to_json};
use crate::services::image_processing::{process_avatar, AvatarImageError, AVATAR_CONTENT_TYPE};

const ALLOWED_TYPES: &[&str] = &["image/png", "image/jpeg", "image/webp", "image/gif"];

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UploadRequest {
    content_type: String,
    /// Base64 (standard) of the source image bytes.
    content: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AvatarResponse {
    content_type: String,
    content: String,
}

pub fn upload(request: &RouteRequest) -> RouteResponse {
    wrap(upload_inner(request))
}
pub fn get(request: &RouteRequest) -> RouteResponse {
    wrap(get_inner(request))
}
pub fn delete(request: &RouteRequest) -> RouteResponse {
    wrap(delete_inner(request))
}

fn wrap(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// POST /me/avatar — store the caller's avatar (opt-in).
fn upload_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let claims = authenticated_user(request)?;
    let req: UploadRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    if !ALLOWED_TYPES.contains(&req.content_type.as_str()) {
        return Err(validation("Unsupported image type (png, jpeg, webp, gif)"));
    }
    let bytes = STANDARD
        .decode(req.content.as_bytes())
        .map_err(|_| validation("content must be base64"))?;
    let processed = process_avatar(&bytes).map_err(|error| match error {
        AvatarImageError::Empty | AvatarImageError::Invalid => {
            validation("Choose a valid JPG, PNG, GIF, or WebP image")
        }
        AvatarImageError::ResourceLimit => validation("Image dimensions are too large to process"),
        AvatarImageError::Encode => {
            log::op_error("avatar", "process", "image_encode_error");
            RouteError::Status(500, "avatar_processing_failed")
        }
    })?;
    let content = STANDARD.encode(processed);

    let mut user =
        users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let original = user.clone();
    storage::put(&object_key(&claims.sub), &content, AVATAR_CONTENT_TYPE)?;
    user.avatar_content_type = Some(AVATAR_CONTENT_TYPE.to_string());
    user.updated_at = clock::now_iso();
    users::update_if_current(&original, &user)?;
    Ok(json(
        200,
        &to_json(&AvatarResponse {
            content_type: AVATAR_CONTENT_TYPE.to_string(),
            content,
        })?,
    ))
}

/// GET /me/avatar — the caller's avatar as `{ contentType, content }`, or 404.
fn get_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let content_type = user
        .avatar_content_type
        .ok_or(RouteError::Status(404, "no_avatar"))?;
    let content = storage::get(&object_key(&claims.sub))?;
    Ok(json(
        200,
        &to_json(&AvatarResponse {
            content_type,
            content,
        })?,
    ))
}

/// DELETE /me/avatar — remove the caller's avatar (idempotent).
fn delete_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let claims = authenticated_user(request)?;
    let mut user =
        users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let original = user.clone();
    if user.avatar_content_type.is_some() {
        storage::delete(&object_key(&claims.sub))?;
        user.avatar_content_type = None;
        user.updated_at = clock::now_iso();
        users::update_if_current(&original, &user)?;
    }
    Ok(json(200, r#"{"message":"Avatar removed"}"#))
}

/// Opt-in gate: avatar uploads require `auth_avatar_upload_enabled=true` (the
/// site must also have a storage provider configured). Fail closed.
fn require_enabled() -> Result<(), RouteError> {
    let enabled = settings::bool("auth_avatar_upload_enabled", false);
    if enabled {
        Ok(())
    } else {
        Err(RouteError::Status(404, "avatar_upload_disabled"))
    }
}

fn object_key(user_id: &str) -> String {
    format!("avatars/{user_id}")
}
