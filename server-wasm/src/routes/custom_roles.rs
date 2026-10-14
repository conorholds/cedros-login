//! Per-org custom role management (part of `cedros-login:organizations`):
//! `/orgs/{org_id}/roles`. A custom role is a named set of [`Permission`] wire
//! values an org defines for its own (app-facing) authorization. cedros-login's
//! own routes still gate on the built-in OrgRole, so these are CRUD-only — no
//! enforcement here. Reads require membership; writes require admin+.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::org_access::{org_id, require_membership, role_of};
use super::{auth, error_response, json, validation, RouteError};
use crate::clock;
use crate::data::custom_roles::{self, CustomRoleEntry};
use crate::domain::permissions::{OrgRole, Permission};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, to_json};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateRoleRequest {
    name: String,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    permissions: Vec<String>,
    #[serde(default)]
    is_default: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateRoleRequest {
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    permissions: Option<Vec<String>>,
    #[serde(default)]
    is_default: Option<bool>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RoleView {
    id: String,
    org_id: String,
    name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
    permissions: Vec<String>,
    is_default: bool,
    created_at: String,
    updated_at: String,
}

impl RoleView {
    fn from_entry(role: &CustomRoleEntry) -> Self {
        RoleView {
            id: role.id.clone(),
            org_id: role.org_id.clone(),
            name: role.name.clone(),
            description: role.description.clone(),
            permissions: role.permissions.clone(),
            is_default: role.is_default,
            created_at: role.created_at.clone(),
            updated_at: role.updated_at.clone(),
        }
    }
}

#[derive(Serialize)]
struct ListResponse {
    roles: Vec<RoleView>,
}

#[derive(Serialize)]
struct MessageResponse {
    message: String,
}

pub fn list(request: &RouteRequest) -> RouteResponse {
    run(list_inner(request))
}
pub fn create(request: &RouteRequest) -> RouteResponse {
    run(create_inner(request))
}
pub fn get(request: &RouteRequest) -> RouteResponse {
    run(get_inner(request))
}
pub fn update(request: &RouteRequest) -> RouteResponse {
    run(update_inner(request))
}
pub fn delete(request: &RouteRequest) -> RouteResponse {
    run(delete_inner(request))
}
pub fn set_default(request: &RouteRequest) -> RouteResponse {
    run(set_default_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let org = member_org(request)?;
    let roles = custom_roles::find_by_org(&org)?
        .iter()
        .map(RoleView::from_entry)
        .collect();
    Ok(json(200, &to_json(&ListResponse { roles })?))
}

fn create_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let (org, actor_role) = admin_org(request)?;
    let req: CreateRoleRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    reject_inline_default(req.is_default)?;
    let name = validate_name(&req.name)?;
    let permissions = validate_permissions(req.permissions, actor_role)?;
    let now = clock::now_iso();
    let role = CustomRoleEntry {
        id: Uuid::new_v4().to_string(),
        org_id: org,
        name,
        description: req.description.filter(|d| !d.trim().is_empty()),
        permissions,
        is_default: false,
        created_at: now.clone(),
        updated_at: now,
    };
    custom_roles::create(&role)?;
    Ok(json(201, &to_json(&RoleView::from_entry(&role))?))
}

fn get_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let org = member_org(request)?;
    let role = load(request, &org)?;
    Ok(json(200, &to_json(&RoleView::from_entry(&role))?))
}

fn update_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let (org, actor_role) = admin_org(request)?;
    let mut role = load(request, &org)?;
    let expected = role.clone();
    validate_permissions(role.permissions.clone(), actor_role)?;
    let req: UpdateRoleRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    if let Some(name) = req.name {
        role.name = validate_name(&name)?;
    }
    if let Some(description) = req.description {
        role.description = Some(description).filter(|d| !d.trim().is_empty());
    }
    if let Some(permissions) = req.permissions {
        role.permissions = validate_permissions(permissions, actor_role)?;
    }
    if req.is_default.is_some() {
        return Err(validation(
            "Use the default-role endpoint to change the default",
        ));
    }
    custom_roles::update(&expected, &role)?;
    role = custom_roles::find_by_id(&role.id)?.ok_or(RouteError::Status(404, "not_found"))?;
    Ok(json(200, &to_json(&RoleView::from_entry(&role))?))
}

fn delete_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let (org, actor_role) = admin_org(request)?;
    let role = load(request, &org)?;
    validate_permissions(role.permissions.clone(), actor_role)?;
    custom_roles::delete(&role.id)?;
    Ok(json(
        200,
        &to_json(&MessageResponse {
            message: "Custom role deleted".to_string(),
        })?,
    ))
}

/// POST /orgs/:org_id/roles/:role_id/default — make one role the org default,
/// clearing the flag on every other role in the org.
fn set_default_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let (org, actor_role) = admin_org(request)?;
    let target = load(request, &org)?;
    validate_permissions(target.permissions.clone(), actor_role)?;
    let roles = custom_roles::find_by_org(&org)?;
    if !roles.iter().any(|role| role == &target) {
        return Err(RouteError::Status(409, "role_changed"));
    }
    for role in roles.iter().filter(|role| role.is_default) {
        validate_permissions(role.permissions.clone(), actor_role)?;
    }
    custom_roles::set_default(roles, &target.id)?;
    Ok(json(
        200,
        &to_json(&MessageResponse {
            message: "Default role updated".to_string(),
        })?,
    ))
}

/// Resolve the caller's org from the path; require they are a member.
fn member_org(request: &RouteRequest) -> Result<String, RouteError> {
    let user_id = auth::principal(request)?;
    let org = org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    require_membership(&user_id, org)?;
    Ok(org.to_string())
}

/// Like [`member_org`] but require the caller to be admin+ (manage roles).
fn admin_org(request: &RouteRequest) -> Result<(String, OrgRole), RouteError> {
    let user_id = auth::principal(request)?;
    let org = org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let membership = require_membership(&user_id, org)?;
    let role = role_of(&membership)?;
    if !role.has_at_least(OrgRole::Admin) {
        return Err(RouteError::Status(403, "forbidden"));
    }
    Ok((org.to_string(), role))
}

/// Load the path-addressed role, scoped to `org` (404 across orgs — no leak).
fn load(request: &RouteRequest, org: &str) -> Result<CustomRoleEntry, RouteError> {
    let role_id = role_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let role = custom_roles::find_by_id(role_id)?.ok_or(RouteError::Status(404, "not_found"))?;
    if role.org_id != org {
        return Err(RouteError::Status(404, "not_found"));
    }
    Ok(role)
}

fn reject_inline_default(is_default: bool) -> Result<(), RouteError> {
    if is_default {
        return Err(validation(
            "Use the default-role endpoint to change the default",
        ));
    }
    Ok(())
}

fn validate_name(name: &str) -> Result<String, RouteError> {
    let trimmed = name.trim();
    if trimmed.is_empty() || trimmed.chars().count() > 100 {
        return Err(validation("Role name must be 1-100 characters"));
    }
    Ok(trimmed.to_string())
}

/// Validate + dedup permission wire values; reject any unrecognized permission.
fn validate_permissions(
    permissions: Vec<String>,
    actor_role: OrgRole,
) -> Result<Vec<String>, RouteError> {
    let mut out: Vec<String> = Vec::with_capacity(permissions.len());
    for permission in permissions {
        if !Permission::is_valid(&permission) {
            return Err(validation(&format!("Unknown permission: {permission}")));
        }
        if !out.contains(&permission) {
            out.push(permission);
        }
    }
    if out.iter().any(|value| {
        Permission::from_str(value).is_none_or(|permission| !permission.is_allowed_for(actor_role))
    }) {
        return Err(RouteError::Status(403, "forbidden"));
    }
    Ok(out)
}

/// The role id from `/orgs/{org_id}/roles/{role_id}`.
fn role_id(path: &str) -> Option<&str> {
    path.split("/roles/")
        .nth(1)?
        .split('/')
        .next()
        .filter(|s| !s.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn role_id_extracts_segment() {
        assert_eq!(role_id("/orgs/o1/roles/r1"), Some("r1"));
        assert_eq!(role_id("/orgs/o1/roles"), None);
        assert_eq!(role_id("/orgs/o1/roles/"), None);
    }

    #[test]
    fn validate_permissions_rejects_unknown_and_dedups() {
        assert_eq!(
            validate_permissions(vec!["org:read".into(), "org:read".into()], OrgRole::Admin,)
                .unwrap(),
            vec!["org:read"]
        );
        assert!(matches!(
            validate_permissions(vec!["bogus".into()], OrgRole::Owner),
            Err(RouteError::Auth(_))
        ));
    }

    #[test]
    fn only_owner_can_put_extension_trust_in_custom_role() {
        let permission = vec![Permission::ManageExtensionTrust.as_str().to_string()];
        assert!(validate_permissions(permission.clone(), OrgRole::Owner).is_ok());
        assert!(matches!(
            validate_permissions(permission, OrgRole::Admin),
            Err(RouteError::Status(403, "forbidden"))
        ));
    }
    #[test]
    fn delegation_never_exceeds_actor_role_matrix() {
        for role in [OrgRole::Owner, OrgRole::Admin, OrgRole::Member] {
            for permission in Permission::ALL {
                assert_eq!(
                    validate_permissions(vec![permission.as_str().to_string()], role).is_ok(),
                    permission.is_allowed_for(role),
                    "role={role:?} permission={permission:?}"
                );
            }
        }
    }
    #[test]
    fn inline_default_cannot_bypass_the_guarded_default_endpoint() {
        assert!(reject_inline_default(false).is_ok());
        assert!(reject_inline_default(true).is_err());
    }
}
