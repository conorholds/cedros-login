//! Organization member routes (`cedros-login:members`): list, update role,
//! remove. Faithful port of `server/src/handlers/members/*`.
//!
//! Acting end-user auth via [`auth::principal`] (RS256 token or `ck_` API key).
//! Last-owner protection and stale-write rejection are enforced by the host's
//! versioned membership transaction across all workers. Role-change
//! notifications are deferred to the comms/providers slice.
use serde::{Deserialize, Serialize};

use super::org_access::{require_membership, role_of};
use super::{auth, error_response, json, pagination, validation, RouteError};
use crate::data::memberships::{self, MembershipEntry};
use crate::data::orgs;
use crate::data::users;
use crate::domain::permissions::OrgRole;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, to_json};

const DEFAULT_LIMIT: u32 = 50;
const MAX_LIMIT: u32 = 200;
const MAX_OFFSET: u32 = 1_000_000;

#[derive(Deserialize)]
struct UpdateRoleRequest {
    role: String,
    #[serde(flatten)]
    expected: MemberPrecondition,
}

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase")]
struct MemberPrecondition {
    #[serde(default)]
    expected_role: Option<String>,
    #[serde(default)]
    expected_membership_id: Option<String>,
}

fn check_member_precondition(
    expected: &MemberPrecondition,
    target: &MembershipEntry,
) -> Result<(), RouteError> {
    if expected
        .expected_role
        .as_ref()
        .is_some_and(|role| role != &target.role)
        || expected
            .expected_membership_id
            .as_ref()
            .is_some_and(|id| id != &target.id)
    {
        return Err(RouteError::Status(409, "membership_changed"));
    }
    Ok(())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MemberView {
    id: String,
    user_id: String,
    role: String,
    joined_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    name: Option<String>,
}

impl MemberView {
    fn new(m: &MembershipEntry, email: Option<String>, name: Option<String>) -> Self {
        MemberView {
            id: m.id.clone(),
            user_id: m.user_id.clone(),
            role: m.role.clone(),
            joined_at: m.joined_at.clone(),
            email,
            name,
        }
    }
}

#[derive(Serialize)]
struct ListMembersResponse {
    members: Vec<MemberView>,
    total: u64,
}

#[derive(Serialize)]
struct MessageResponse {
    message: String,
}

pub fn list(request: &RouteRequest) -> RouteResponse {
    run(list_inner(request))
}
pub fn update_role(request: &RouteRequest) -> RouteResponse {
    run(update_role_inner(request))
}
pub fn remove(request: &RouteRequest) -> RouteResponse {
    run(remove_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// GET /orgs/:org_id/members — list members (with email/name); members only.
fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let org_id =
        super::org_access::org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    super::org_access::require_permission(
        &user_id,
        org_id,
        crate::domain::permissions::Permission::MemberRead,
    )?;
    require_membership(&user_id, org_id)?;

    let (limit, offset) = pagination::paged(&request.query, DEFAULT_LIMIT, MAX_LIMIT, MAX_OFFSET);
    let page = memberships::page_by_org(org_id, limit, offset)?;
    let total = memberships::count_by_org(org_id)?;
    let users = users::find_by_ids(&page.iter().map(|m| m.user_id.clone()).collect::<Vec<_>>())?;
    let members = page
        .iter()
        .map(|m| {
            let user = users.get(&m.user_id);
            MemberView::new(
                m,
                user.and_then(|u| u.email.clone()),
                user.and_then(|u| u.name.clone()),
            )
        })
        .collect();
    Ok(json(
        200,
        &to_json(&ListMembersResponse { members, total })?,
    ))
}

/// PATCH /orgs/:org_id/members/:user_id — change a member's role.
fn update_role_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let org_id =
        super::org_access::org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    super::org_access::require_permission(
        &user_id,
        org_id,
        crate::domain::permissions::Permission::MemberRoleChange,
    )?;
    let target_id = target_user_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let req: UpdateRoleRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;

    // Prevent self-role-change (privilege-escalation edge cases) before any lookup.
    if target_id == user_id {
        return Err(RouteError::Status(403, "forbidden"));
    }
    let new_role = OrgRole::from_str(&req.role).ok_or_else(|| validation("Invalid role"))?;

    let actor = memberships::find_versioned(&user_id, org_id)?
        .ok_or(RouteError::Status(403, "forbidden"))?;
    let caller_role = role_of(&actor.value)?;
    let versioned = memberships::find_versioned(target_id, org_id)?
        .ok_or(RouteError::Status(404, "member_not_found"))?;
    check_member_precondition(&req.expected, &versioned.value)?;
    let mut target = versioned.value.clone();
    let target_role = role_of(&target)?;

    if !caller_role.has_at_least(OrgRole::Admin) {
        return Err(RouteError::Status(403, "forbidden"));
    }
    // Only owners may change an owner's role or promote to owner.
    if (target_role == OrgRole::Owner || new_role == OrgRole::Owner)
        && caller_role != OrgRole::Owner
    {
        return Err(RouteError::Status(403, "forbidden"));
    }
    target.role = new_role.as_str().to_string();
    memberships::change_authorized(&actor, &versioned, Some(new_role))?;
    let (email, name) = user_email_name(target_id)?;
    Ok(json(200, &to_json(&MemberView::new(&target, email, name))?))
}

/// DELETE /orgs/:org_id/members/:user_id — remove a member, or self-leave.
fn remove_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let org_id =
        super::org_access::org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let target_id = target_user_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;

    let actor = memberships::find_versioned(&user_id, org_id)?
        .ok_or(RouteError::Status(403, "forbidden"))?;
    let caller = &actor.value;
    let is_self = target_id == user_id;
    if !is_self {
        super::org_access::require_permission(
            &user_id,
            org_id,
            crate::domain::permissions::Permission::MemberRemove,
        )?;
    }
    let versioned = memberships::find_versioned(target_id, org_id)?
        .ok_or(RouteError::Status(404, "member_not_found"))?;
    let expected = if request.body.trim().is_empty() {
        MemberPrecondition::default()
    } else {
        from_json::<MemberPrecondition>(&request.body)
            .map_err(|_| RouteError::Status(400, "invalid_body"))?
    };
    check_member_precondition(&expected, &versioned.value)?;
    let target = &versioned.value;
    let org = orgs::find_by_id(org_id)?.ok_or(RouteError::Status(404, "not_found"))?;

    if org.is_personal && is_self {
        return Err(validation("Cannot leave your personal organization"));
    }
    if !is_self {
        let caller_role = role_of(caller)?;
        if !caller_role.has_at_least(OrgRole::Admin) {
            return Err(RouteError::Status(403, "forbidden"));
        }
        if role_of(target)? == OrgRole::Owner && caller_role != OrgRole::Owner {
            return Err(RouteError::Status(403, "forbidden"));
        }
    }
    memberships::change_authorized(&actor, &versioned, None)?;
    let message = if is_self {
        "Left organization successfully"
    } else {
        "Member removed successfully"
    };
    Ok(json(
        200,
        &to_json(&MessageResponse {
            message: message.to_string(),
        })?,
    ))
}

/// Resolve a member's email/name for the response; absent user → both `None`.
fn user_email_name(user_id: &str) -> Result<(Option<String>, Option<String>), RouteError> {
    Ok(match users::find_by_id(user_id)? {
        Some(user) => (user.email, user.name),
        None => (None, None),
    })
}

/// The target user id from `/orgs/{org_id}/members/{user_id}`.
fn target_user_id(path: &str) -> Option<&str> {
    let mut parts = path.strip_prefix("/orgs/")?.split('/');
    parts.next()?; // org id
    if parts.next()? != "members" {
        return None;
    }
    parts.next().filter(|s| !s.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_target_user_id() {
        assert_eq!(target_user_id("/orgs/o1/members/u2"), Some("u2"));
        assert_eq!(target_user_id("/orgs/o1/members"), None);
        assert_eq!(target_user_id("/orgs/o1/switch"), None);
    }
}

#[cfg(test)]
mod precondition_tests {
    use super::*;
    #[test]
    fn stale_role_and_recreated_membership_are_rejected() {
        let target = MembershipEntry {
            id: "membership-new".into(),
            user_id: "user".into(),
            org_id: "org".into(),
            role: "admin".into(),
            joined_at: "now".into(),
        };
        assert!(check_member_precondition(&MemberPrecondition::default(), &target).is_ok());
        let matching: MemberPrecondition = serde_json::from_value(
            serde_json::json!({"expectedRole":"admin","expectedMembershipId":"membership-new"}),
        )
        .unwrap();
        assert!(check_member_precondition(&matching, &target).is_ok());
        for value in [
            serde_json::json!({"expectedRole":"member"}),
            serde_json::json!({"expectedMembershipId":"membership-old"}),
        ] {
            let expected = serde_json::from_value(value).unwrap();
            assert!(matches!(
                check_member_precondition(&expected, &target),
                Err(RouteError::Status(409, "membership_changed"))
            ));
        }
    }
}
