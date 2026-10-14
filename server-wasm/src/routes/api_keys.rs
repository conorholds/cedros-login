//! API key management (authenticated end user) + validation (programmatic auth).
//! Ported from server/src/handlers/api_keys.rs. The raw key is returned once on
//! create; only its hash + display prefix are stored.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::auth::{authenticated_user, email_verification_blocks_session};
use super::{error_response, json, RouteError};
use crate::clock;
use crate::data::api_keys::{self, ApiKeyEntry};
use crate::data::users::{self, UserEntry};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, to_json};
use crate::services::api_key;
use crate::services::AuthError;

const MAX_KEYS_PER_USER: u64 = 10;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct CreateRequest {
    label: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RevokeRequest {
    id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ValidateRequest {
    api_key: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct KeyView {
    id: String,
    key_prefix: String,
    label: String,
    created_at: String,
    last_used_at: Option<String>,
}

pub fn create(request: &RouteRequest) -> RouteResponse {
    wrap(create_inner(request))
}
pub fn list(request: &RouteRequest) -> RouteResponse {
    wrap(list_inner(request))
}
pub fn revoke(request: &RouteRequest) -> RouteResponse {
    wrap(revoke_inner(request))
}
pub fn validate(request: &RouteRequest) -> RouteResponse {
    wrap(validate_inner(request))
}

fn wrap(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn create_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    super::auth::require_step_up(&claims)?;
    super::abuse::enforce_proof_action(request, &claims.sub)?;
    let req: CreateRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let label = req.label.trim().to_string();
    if label.is_empty() || label.chars().count() > 100 {
        return Err(
            AuthError::Validation(vec!["Label must be 1-100 characters".to_string()]).into(),
        );
    }
    if api_keys::count_by_user(&claims.sub)? >= MAX_KEYS_PER_USER {
        return Err(RouteError::Status(409, "api_key_limit_reached"));
    }
    let raw = api_key::generate();
    let entry = ApiKeyEntry {
        id: Uuid::new_v4().to_string(),
        user_id: claims.sub.clone(),
        key_hash: api_key::hash(&raw),
        key_prefix: api_key::display_prefix(&raw),
        label,
        created_at: clock::now_iso(),
        last_used_at: None,
        portal_agent: None,
    };
    api_keys::create(&entry, &claims.sid)?;
    let body = to_json(&serde_json::json!({
        "apiKey": raw,
        "id": entry.id,
        "keyPrefix": entry.key_prefix,
        "label": entry.label,
        "createdAt": entry.created_at,
        "message": "Store this key securely. It cannot be retrieved again.",
    }))?;
    Ok(json(201, &body))
}

fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    let keys: Vec<KeyView> = api_keys::find_by_user(&claims.sub)?
        .into_iter()
        .map(|k| KeyView {
            id: k.id,
            key_prefix: k.key_prefix,
            label: k.label,
            created_at: k.created_at,
            last_used_at: k.last_used_at,
        })
        .collect();
    let body = to_json(&serde_json::json!({ "keys": keys }))?;
    Ok(json(200, &body))
}

fn revoke_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    let req: RevokeRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    match api_keys::find_by_id(&req.id)? {
        Some(key) if key.user_id == claims.sub => {
            api_keys::delete(&req.id)?;
            Ok(json(200, r#"{"message":"API key revoked"}"#))
        }
        // Don't reveal whether a key id exists for another user.
        _ => Err(RouteError::Status(404, "api_key_not_found")),
    }
}

/// POST /api-keys/validate — resolve a raw key to its user (programmatic auth).
/// Returns `{valid:false}` uniformly for unknown keys or deleted users.
fn validate_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let req: ValidateRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let entry = match api_keys::find_by_hash(&api_key::hash(&req.api_key))? {
        Some(entry) => entry,
        None => return Ok(json(200, r#"{"valid":false}"#)),
    };
    // Scoped Portal credentials must never be promoted to unrestricted API-key identity.
    if entry.portal_agent.is_some() {
        return Ok(json(200, r#"{"valid":false}"#));
    }
    let user = match users::find_by_id(&entry.user_id)? {
        Some(user)
            if api_key_owner_is_active(&user) && !email_verification_blocks_session(&user) =>
        {
            user
        }
        _ => return Ok(json(200, r#"{"valid":false}"#)),
    };
    api_keys::touch_last_used(entry, &clock::now_iso())?;
    let body =
        to_json(&serde_json::json!({ "valid": true, "userId": user.id, "userEmail": user.email }))?;
    Ok(json(200, &body))
}

fn api_key_owner_is_active(user: &UserEntry) -> bool {
    user.suspended_at.is_none()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn user(suspended_at: Option<&str>) -> UserEntry {
        serde_json::from_value(serde_json::json!({
            "id": "user-1",
            "email": "user@example.test",
            "emailVerified": true,
            "passwordHash": null,
            "name": null,
            "username": null,
            "picture": null,
            "walletAddress": null,
            "googleId": null,
            "appleId": null,
            "authMethods": [],
            "suspendedAt": suspended_at,
            "isSystemAdmin": false,
            "createdAt": "2026-08-08T00:00:00.000Z",
            "updatedAt": "2026-08-08T00:00:00.000Z",
            "lastLoginAt": null,
            "welcomeCompletedAt": null,
            "avatarContentType": null
        }))
        .unwrap()
    }

    #[test]
    fn api_key_owner_is_active_for_unsuspended_accounts() {
        assert!(api_key_owner_is_active(&user(None)));
    }

    #[test]
    fn api_key_owner_is_inactive_for_suspended_accounts() {
        assert!(!api_key_owner_is_active(&user(Some(
            "2026-08-08T00:00:00.000Z"
        ))));
    }
    #[test]
    fn key_creation_rejects_unsupported_scope_and_identity_fields() {
        assert!(serde_json::from_value::<CreateRequest>(serde_json::json!({"label":"ok"})).is_ok());
        for field in ["scopes", "orgId", "userId", "isSystemAdmin"] {
            let mut request = serde_json::json!({"label":"restricted"});
            request[field] = serde_json::json!(["read"]);
            assert!(
                serde_json::from_value::<CreateRequest>(request).is_err(),
                "{field}"
            );
        }
    }
}
