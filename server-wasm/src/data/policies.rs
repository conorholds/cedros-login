//! ABAC policies over the host DB seam (`cedros-login:policies`, org-db).
//! Stores [`AbacPolicy`] (camelCase, string ids). Ported from
//! `server/src/repositories/policy_repository.rs`. Priority ordering is applied
//! in memory (highest first) so evaluation order does not depend on the seam's
//! numeric sort.
use crate::domain::policy::AbacPolicy;
use crate::host::db::{self, Query, POLICIES};
use crate::host::Result;

pub fn create(policy: &AbacPolicy) -> Result<()> {
    db::write(POLICIES, &policy.id, policy)
}

pub fn update(policy: &AbacPolicy) -> Result<()> {
    db::write(POLICIES, &policy.id, policy)
}

pub fn find_by_id(id: &str) -> Result<Option<AbacPolicy>> {
    db::find_one(POLICIES, &Query::key(id))
}

/// All policies for an org, highest priority first.
pub fn find_by_org(org_id: &str) -> Result<Vec<AbacPolicy>> {
    let mut policies: Vec<AbacPolicy> = db::read_typed(
        POLICIES,
        &Query {
            filters: vec![db::eq("orgId", org_id)],
            ..Default::default()
        },
    )?;
    policies.sort_by_key(|b| std::cmp::Reverse(b.priority));
    Ok(policies)
}

/// Enabled policies for an org + permission, highest priority first — the
/// evaluation order the policy service relies on.
pub fn find_by_org_and_permission(org_id: &str, permission: &str) -> Result<Vec<AbacPolicy>> {
    let mut policies: Vec<AbacPolicy> = db::read_typed(
        POLICIES,
        &Query {
            filters: vec![
                db::eq("orgId", org_id),
                db::eq("permission", permission),
                db::eq("enabled", true),
            ],
            ..Default::default()
        },
    )?;
    policies.sort_by_key(|b| std::cmp::Reverse(b.priority));
    Ok(policies)
}

pub fn delete(id: &str) -> Result<bool> {
    db::delete(POLICIES, id)
}
