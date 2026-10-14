//! Shared org-route access checks: membership lookup, role parsing, path id
//! extraction, and batch-payload serialization — used by the organization,
//! member, and invite route handlers.
use super::RouteError;
use crate::data::memberships::{self, MembershipEntry};
use crate::domain::permissions::OrgRole;
use crate::host::SeamError;
use serde::Serialize;

/// The caller's membership in `org_id`, or 403 if they are not a member.
pub fn require_membership(user_id: &str, org_id: &str) -> Result<MembershipEntry, RouteError> {
    memberships::find(user_id, org_id)?.ok_or(RouteError::Status(403, "forbidden"))
}

/// Policies constrain the built-in endpoint guards; callers cannot assert ABAC attributes.
pub fn require_permission(
    user_id: &str,
    org_id: &str,
    permission: crate::domain::permissions::Permission,
) -> Result<(), RouteError> {
    if !crate::services::abac::evaluate(user_id, org_id, permission.as_str(), None, false)?.allowed
    {
        return Err(RouteError::Status(403, "forbidden"));
    }
    Ok(())
}

/// Parse a stored membership role; fail closed (403) on an unrecognized value.
pub fn role_of(membership: &MembershipEntry) -> Result<OrgRole, RouteError> {
    OrgRole::from_str(&membership.role).ok_or(RouteError::Status(403, "forbidden"))
}

/// The org id segment from any `/orgs/{org_id}/...` path (or `/orgs/{org_id}`).
pub fn org_id(path: &str) -> Option<&str> {
    path.strip_prefix("/orgs/")?
        .split('/')
        .next()
        .filter(|s| !s.is_empty())
}

/// Serialize to a JSON `Value` for a `BatchOp` payload (the seam nests it into
/// the batch document — unlike `to_json`, which yields a string).
pub fn as_value<T: Serialize>(value: &T) -> Result<serde_json::Value, RouteError> {
    serde_json::to_value(value).map_err(|e| SeamError::Encoding(e.to_string()).into())
}

#[cfg(test)]
mod tests {
    use super::org_id;

    #[test]
    fn extracts_org_id_segment() {
        assert_eq!(org_id("/orgs/o1"), Some("o1"));
        assert_eq!(org_id("/orgs/o1/switch"), Some("o1"));
        assert_eq!(org_id("/orgs/o1/members/u2"), Some("o1"));
        assert_eq!(org_id("/orgs/"), None);
        assert_eq!(org_id("/orgs"), None);
    }
}
