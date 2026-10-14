//! Per-org ABAC policy management: `/orgs/{org_id}/policies`. CRUD over the
//! policies content model; reads and writes require admin+.
//! Enforcement runs through `/authorize` + [`crate::services::abac`]; these are
//! CRUD-only. Port of `server/src/handlers/policies.rs`.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::org_access::{org_id, require_membership, role_of};
use super::{auth, error_response, json, validation, RouteError};
use crate::clock;
use crate::data::policies;
use crate::domain::permissions::{OrgRole, Permission};
use crate::domain::policy::{AbacPolicy, PolicyConditions, PolicyEffect};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, to_json};

fn default_true() -> bool {
    true
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreatePolicyRequest {
    name: String,
    #[serde(default)]
    description: Option<String>,
    permission: String,
    #[serde(default)]
    conditions: PolicyConditions,
    effect: PolicyEffect,
    #[serde(default)]
    priority: i32,
    #[serde(default = "default_true")]
    enabled: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdatePolicyRequest {
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    permission: Option<String>,
    #[serde(default)]
    conditions: Option<PolicyConditions>,
    #[serde(default)]
    effect: Option<PolicyEffect>,
    #[serde(default)]
    priority: Option<i32>,
    #[serde(default)]
    enabled: Option<bool>,
}

#[derive(Serialize)]
struct ListResponse {
    policies: Vec<AbacPolicy>,
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

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let (org, _) = admin_org(request)?;
    let policies = policies::find_by_org(&org)?;
    Ok(json(200, &to_json(&ListResponse { policies })?))
}

fn create_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let (org, role) = admin_org(request)?;
    let req: CreatePolicyRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let name = validate_name(&req.name)?;
    let permission = validate_policy_permission(&req.permission, role)?;
    let now = clock::now_iso();
    let policy = AbacPolicy {
        id: Uuid::new_v4().to_string(),
        org_id: org,
        name,
        description: req.description.filter(|d| !d.trim().is_empty()),
        permission,
        conditions: req.conditions,
        effect: req.effect,
        priority: req.priority,
        enabled: req.enabled,
        created_at: now.clone(),
        updated_at: now,
    };
    policies::create(&policy)?;
    Ok(json(201, &to_json(&policy)?))
}

fn get_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let (org, _) = admin_org(request)?;
    let policy = load(request, &org)?;
    Ok(json(200, &to_json(&policy)?))
}

fn update_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let (org, role) = admin_org(request)?;
    let mut policy = load(request, &org)?;
    require_permission_management(&policy.permission, role)?;
    let req: UpdatePolicyRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    if let Some(name) = req.name {
        policy.name = validate_name(&name)?;
    }
    if let Some(description) = req.description {
        policy.description = Some(description).filter(|d| !d.trim().is_empty());
    }
    if let Some(permission) = req.permission {
        policy.permission = validate_policy_permission(&permission, role)?;
    }
    if let Some(conditions) = req.conditions {
        policy.conditions = conditions;
    }
    if let Some(effect) = req.effect {
        policy.effect = effect;
    }
    if let Some(priority) = req.priority {
        policy.priority = priority;
    }
    if let Some(enabled) = req.enabled {
        policy.enabled = enabled;
    }
    policy.updated_at = clock::now_iso();
    policies::update(&policy)?;
    Ok(json(200, &to_json(&policy)?))
}

fn delete_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let (org, role) = admin_org(request)?;
    let policy = load(request, &org)?;
    require_permission_management(&policy.permission, role)?;
    policies::delete(&policy.id)?;
    Ok(json(
        200,
        &to_json(&MessageResponse {
            message: "Policy deleted".to_string(),
        })?,
    ))
}

/// Resolve the caller's org from the path and require admin+.
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

/// Load the path-addressed policy, scoped to `org` (404 across orgs — no leak).
fn load(request: &RouteRequest, org: &str) -> Result<AbacPolicy, RouteError> {
    let policy_id = policy_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let policy = policies::find_by_id(policy_id)?.ok_or(RouteError::Status(404, "not_found"))?;
    if policy.org_id != org {
        return Err(RouteError::Status(404, "not_found"));
    }
    Ok(policy)
}

fn validate_name(name: &str) -> Result<String, RouteError> {
    let trimmed = name.trim();
    if trimmed.is_empty() || trimmed.chars().count() > 100 {
        return Err(validation("Policy name must be 1-100 characters"));
    }
    Ok(trimmed.to_string())
}

fn validate_policy_permission(permission: &str, role: OrgRole) -> Result<String, RouteError> {
    if !Permission::is_valid(permission) {
        return Err(validation(&format!("Unknown permission: {permission}")));
    }
    require_permission_management(permission, role)?;
    Ok(permission.to_string())
}

fn require_permission_management(permission: &str, role: OrgRole) -> Result<(), RouteError> {
    if Permission::from_str(permission).is_none_or(|permission| !permission.is_allowed_for(role)) {
        return Err(RouteError::Status(403, "forbidden"));
    }
    Ok(())
}

/// The policy id from `/orgs/{org_id}/policies/{policy_id}`.
fn policy_id(path: &str) -> Option<&str> {
    path.split("/policies/")
        .nth(1)?
        .split('/')
        .next()
        .filter(|s| !s.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn policy_id_extracts_segment() {
        assert_eq!(policy_id("/orgs/o1/policies/p1"), Some("p1"));
        assert_eq!(policy_id("/orgs/o1/policies"), None);
        assert_eq!(policy_id("/orgs/o1/policies/"), None);
    }

    #[test]
    fn validate_policy_permission_rejects_unknown() {
        assert!(validate_policy_permission("member:remove", OrgRole::Admin).is_ok());
        assert!(matches!(
            validate_policy_permission("bogus", OrgRole::Admin),
            Err(RouteError::Auth(_))
        ));
    }

    #[test]
    fn validate_policy_permission_requires_owner_for_extension_trust() {
        assert!(validate_policy_permission(
            Permission::ManageExtensionTrust.as_str(),
            OrgRole::Owner
        )
        .is_ok());
        assert!(matches!(
            validate_policy_permission(Permission::ManageExtensionTrust.as_str(), OrgRole::Admin),
            Err(RouteError::Status(403, "forbidden"))
        ));
    }
    #[test]
    fn delegation_never_exceeds_actor_role_matrix() {
        for role in [OrgRole::Owner, OrgRole::Admin, OrgRole::Member] {
            for permission in Permission::ALL {
                assert_eq!(
                    validate_policy_permission(permission.as_str(), role).is_ok(),
                    permission.is_allowed_for(role),
                    "role={role:?} permission={permission:?}"
                );
            }
        }
    }
}
