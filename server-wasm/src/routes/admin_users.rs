//! Admin user-management reads (`cedros-login:admin-users-settings-audit`):
//! list users and get one. Like the other admin routes ([`super::admin`]), these
//! gate on the host admin session in the route context (the host owns admin
//! auth) — not the extension's own JWT. Reads need no CSRF.
//!
//! Port of the read handlers in `server/src/handlers/admin/users.rs`. User
//! mutations (update / set-system-admin / force-password-reset / delete) and the
//! `/admin/users/stats` breakdown (needs host count-by-array aggregation) follow
//! separately.
use serde::{Deserialize, Serialize};

use super::{
    admin_actor, error_response, json, pagination, require_system_admin,
    require_system_admin_write, validation, RouteError,
};
use crate::clock;
use crate::data::account;
use crate::data::audit;
use crate::data::canonical_email;
use crate::data::user_emails;
use crate::data::users::{self, UserEntry};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::db::{self, ConditionalBatchOp, ConditionalOperation};
use crate::host::{from_json, to_json};
use crate::services::email::{is_valid_email, normalize_email, validate_ascii_local};

const DEFAULT_LIMIT: u32 = 50;
const MAX_LIMIT: u32 = 100;
const MAX_OFFSET: u32 = 1_000_000;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AdminUserView {
    id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    email: Option<String>,
    email_verified: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    picture: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    wallet_address: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    google_id: Option<String>,
    auth_methods: Vec<String>,
    status: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    suspended_at: Option<String>,
    is_system_admin: bool,
    created_at: String,
    updated_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    last_login_at: Option<String>,
}

impl AdminUserView {
    fn from_entry(user: &UserEntry) -> Self {
        AdminUserView {
            id: user.id.clone(),
            email: user.email.clone(),
            email_verified: user.email_verified,
            name: user.name.clone(),
            username: user.username.clone(),
            picture: user.picture.clone(),
            wallet_address: user.wallet_address.clone(),
            google_id: user.google_id.clone(),
            auth_methods: users::public_auth_methods(user),
            status: if user.suspended_at.is_some() {
                "suspended"
            } else {
                "active"
            },
            suspended_at: user.suspended_at.clone(),
            is_system_admin: user.is_system_admin,
            created_at: user.created_at.clone(),
            updated_at: user.updated_at.clone(),
            last_login_at: user.last_login_at.clone(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ListUsersResponse {
    users: Vec<AdminUserView>,
    total: u64,
    limit: u32,
    offset: u32,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateUserRequest {
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    email: Option<String>,
    #[serde(default)]
    email_verified: Option<bool>,
    #[serde(default)]
    suspended: Option<bool>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetSystemAdminRequest {
    is_admin: bool,
}

#[derive(Serialize)]
struct MessageResponse {
    message: String,
}

pub fn list_users(request: &RouteRequest) -> RouteResponse {
    run(list_users_inner(request))
}
pub fn get_user(request: &RouteRequest) -> RouteResponse {
    run(get_user_inner(request))
}
pub fn update_user(request: &RouteRequest) -> RouteResponse {
    run(update_user_inner(request))
}
pub fn set_system_admin(request: &RouteRequest) -> RouteResponse {
    run(set_system_admin_inner(request))
}
pub fn delete_user(request: &RouteRequest) -> RouteResponse {
    run(delete_user_inner(request))
}
pub fn stats(request: &RouteRequest) -> RouteResponse {
    run(stats_inner(request))
}
pub fn force_password_reset(request: &RouteRequest) -> RouteResponse {
    run(force_password_reset_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// GET /admin/users — one page of users, newest first, with the total.
fn list_users_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let (limit, offset) = pagination::paged(&request.query, DEFAULT_LIMIT, MAX_LIMIT, MAX_OFFSET);
    let total = users::count()?;
    let users_out = users::list_all(limit, offset)?
        .iter()
        .map(AdminUserView::from_entry)
        .collect();
    Ok(json(
        200,
        &to_json(&ListUsersResponse {
            users: users_out,
            total,
            limit,
            offset,
        })?,
    ))
}

/// GET /admin/users/:user_id — one user.
fn get_user_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let user_id = path_user_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let user = users::find_by_id(user_id)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    Ok(json(200, &to_json(&AdminUserView::from_entry(&user))?))
}

/// Window (seconds) for the new-account growth counts: 7 and 30 days.
const GROWTH_7D_SECS: i64 = 7 * 24 * 60 * 60;
const GROWTH_30D_SECS: i64 = 30 * 24 * 60 * 60;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UserStatsResponse {
    total: u64,
    /// Accounts with a verified email (backs the verified-account rate).
    verified: u64,
    /// New accounts created in the trailing 7 / 30 days (user-growth signal).
    new_accounts7d: u64,
    new_accounts30d: u64,
    /// Per-auth-method breakdown requires a host GROUP BY over the `authMethods`
    /// array that the JSONB seam does not expose; the scalar counts above are
    /// exact, the breakdown is left empty until the seam supports array
    /// aggregation.
    auth_method_counts: std::collections::HashMap<String, u64>,
}

/// GET /admin/users/stats — aggregate account stats: total, verified, and
/// trailing 7d/30d new-account growth (+ a reserved auth-method breakdown). All
/// counts are redacted aggregates — no identifiers.
fn stats_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let total = users::count()?;
    let verified = users::count_verified()?;
    let new_accounts7d = users::count_created_after(Some(&clock::ago_iso(GROWTH_7D_SECS)))?;
    let new_accounts30d = users::count_created_after(Some(&clock::ago_iso(GROWTH_30D_SECS)))?;
    Ok(json(
        200,
        &to_json(&UserStatsResponse {
            total,
            verified,
            new_accounts7d,
            new_accounts30d,
            auth_method_counts: std::collections::HashMap::new(),
        })?,
    ))
}

/// POST /admin/users/:user_id/force-password-reset — queue a reset email for the
/// target user. State-changing → CSRF-immune admin auth required.
fn force_password_reset_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let user_id = path_user_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let user = users::find_by_id(user_id)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let email = user
        .email
        .clone()
        .filter(|value| !value.trim().is_empty())
        .ok_or(validation("User has no email address to reset"))?;
    super::account::issue_password_reset(&user, &email)?;
    Ok(json(
        200,
        &to_json(&MessageResponse {
            message: "Password reset email sent".to_string(),
        })?,
    ))
}

/// PATCH /admin/users/:user_id — update name / email / email-verified.
fn update_user_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let user_id = path_user_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let req: UpdateUserRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let name = req.name.map(|name| {
        let trimmed = name.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_string())
        }
    });
    let email = req
        .email
        .map(|email| validate_admin_email(user_id, &email))
        .transpose()?;
    let mut user = canonical_email::admin_update(user_id, name, email, req.email_verified)?
        .ok_or(RouteError::Status(404, "user_not_found"))?;
    if let Some(suspended) = req.suspended {
        let was_suspended = user.suspended_at.is_some();
        if suspended != was_suspended {
            let original = user.clone();
            user.suspended_at = suspended.then(clock::now_iso);
            user.updated_at = clock::now_iso();
            users::update_if_current(&original, &user)?;
            if suspended {
                crate::data::sessions::revoke_all_for_user(user_id, "account_suspended", None)?;
            }
        }
    }
    let _ = audit::log(
        audit::ADMIN_USER_UPDATED,
        admin_actor(request).as_deref(),
        Some("user"),
        Some(user_id),
    );
    Ok(json(200, &to_json(&AdminUserView::from_entry(&user))?))
}

fn validate_admin_email(user_id: &str, email: &str) -> Result<String, RouteError> {
    if !is_valid_email(email) {
        return Err(validation("Invalid email format"));
    }
    validate_ascii_local(email)?;
    let normalized = normalize_email(email);
    if users::find_by_email(&normalized)?.is_some_and(|existing| existing.id != user_id)
        || user_emails::find_by_email(&normalized)?
            .is_some_and(|existing| existing.user_id != user_id)
    {
        return Err(validation("Email is already in use"));
    }
    Ok(normalized)
}

/// POST /admin/users/:user_id/system-admin — grant/revoke system-admin.
fn set_system_admin_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let user_id = path_user_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let req: SetSystemAdminRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let versioned =
        users::find_by_id_versioned(user_id)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let mut user = versioned.value;

    if user.is_system_admin && !req.is_admin {
        demote_system_admin(&versioned.entry_key, &versioned.updated_at)?;
    } else if user.is_system_admin != req.is_admin {
        let original = user.clone();
        user.is_system_admin = req.is_admin;
        user.updated_at = clock::now_iso();
        users::update_if_current(&original, &user)?;
    }
    let _ = audit::log(
        audit::ADMIN_SYSTEM_ADMIN_CHANGED,
        admin_actor(request).as_deref(),
        Some("user"),
        Some(user_id),
    );
    let action = if req.is_admin { "granted" } else { "revoked" };
    Ok(json(
        200,
        &to_json(&MessageResponse {
            message: format!("System admin status {action}"),
        })?,
    ))
}

/// Revoke system-admin through the host transaction that version-checks the
/// target and serializes the last-admin invariant across workers.
fn demote_system_admin(entry_key: &str, expected_updated_at: &str) -> crate::host::Result<()> {
    let op = system_admin_demotion_op(entry_key, expected_updated_at);
    db::batch_with_results(&[op.into()]).map(|_| ())
}

fn system_admin_demotion_op(entry_key: &str, expected_updated_at: &str) -> ConditionalBatchOp {
    ConditionalBatchOp::new(
        ConditionalOperation::DemoteSystemAdmin,
        serde_json::json!({
            "entryKey": entry_key,
            "expectedUpdatedAt": expected_updated_at,
        }),
    )
}

/// DELETE /admin/users/:user_id — purge the user and their data.
fn delete_user_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let user_id = path_user_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let user = users::find_by_id(user_id)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    if user.is_system_admin {
        return Err(validation(
            "Cannot delete a system admin. Remove admin status first.",
        ));
    }
    account::purge_user(user_id, None)?;
    let _ = audit::log(
        audit::ADMIN_USER_DELETED,
        admin_actor(request).as_deref(),
        Some("user"),
        Some(user_id),
    );
    Ok(json(
        200,
        &to_json(&MessageResponse {
            message: "User deleted successfully".to_string(),
        })?,
    ))
}

/// The user id from `/admin/users/{user_id}` (or `.../{user_id}/system-admin`).
fn path_user_id(path: &str) -> Option<&str> {
    path.strip_prefix("/admin/users/")?
        .split('/')
        .next()
        .filter(|s| !s.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_admin_user_id() {
        assert_eq!(path_user_id("/admin/users/u1"), Some("u1"));
        assert_eq!(path_user_id("/admin/users/"), None);
        assert_eq!(path_user_id("/admin/users"), None);
    }

    #[test]
    fn rejects_invalid_admin_email_before_host_access() {
        assert!(validate_admin_email("u1", "not-an-email").is_err());
        assert!(validate_admin_email("u1", "\u{0430}dmin@example.com").is_err());
    }

    #[test]
    fn demotion_uses_host_row_version_and_conditional_operation() {
        let value = serde_json::to_value(system_admin_demotion_op(
            "user-entry",
            "2026-07-10T12:00:00Z",
        ))
        .unwrap();
        assert_eq!(value["op"], "conditional");
        assert_eq!(value["operationId"], "identity.system-admin.demote");
        assert_eq!(value["params"]["entryKey"], "user-entry");
        assert_eq!(value["params"]["expectedUpdatedAt"], "2026-07-10T12:00:00Z");
    }
}
