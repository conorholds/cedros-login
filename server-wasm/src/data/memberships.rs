//! Org memberships over the host DB seam (`cedros-login:memberships`, org-db).
//! `role` is owner | admin | member (mirrors domain::permissions::OrgRole).
use crate::host::db::{self, BatchOp, Condition, Query, MEMBERSHIPS};
use crate::host::Result;
use serde::{Deserialize, Serialize};

/// A membership payload paired with the host row version used by conditional
/// role changes and removals.
pub struct VersionedMembership {
    pub value: MembershipEntry,
    pub entry_key: String,
    pub condition: Condition,
    pub host_updated_at: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct MembershipEntry {
    pub id: String,
    pub user_id: String,
    pub org_id: String,
    pub role: String,
    pub joined_at: String,
}

/// A user's membership in a specific org, if any.
pub fn find(user_id: &str, org_id: &str) -> Result<Option<MembershipEntry>> {
    let mut rows: Vec<MembershipEntry> =
        db::read_typed(MEMBERSHIPS, &point_query(user_id, org_id))?;
    if rows.len() > 1
        || rows
            .iter()
            .any(|m| m.user_id != user_id || m.org_id != org_id)
    {
        return Err(crate::host::SeamError::Db("ambiguous membership".into()));
    }
    Ok(rows.pop())
}

/// Fetch one membership and its opaque CAS version. The version is
/// metadata on the host entry, not a field in the membership payload.
pub fn find_versioned(user_id: &str, org_id: &str) -> Result<Option<VersionedMembership>> {
    let mut rows = db::read_entries(MEMBERSHIPS, &point_query(user_id, org_id))?;
    if rows.len() > 1 {
        return Err(crate::host::SeamError::Db("ambiguous membership".into()));
    }
    let Some(row) = rows.pop() else {
        return Ok(None);
    };
    let membership = versioned(row)?;
    if membership.value.user_id != user_id || membership.value.org_id != org_id {
        return Err(crate::host::SeamError::Db(
            "membership scope mismatch".into(),
        ));
    }
    Ok(Some(membership))
}

fn versioned(row: db::Entry) -> Result<VersionedMembership> {
    let condition = Condition::version(
        MEMBERSHIPS,
        &row.entry_key,
        row.version.as_deref().unwrap_or(""),
    )?;
    let host_updated_at = row
        .updated_at
        .ok_or_else(|| crate::host::SeamError::Db("missing membership revision".into()))?;
    let value: MembershipEntry = serde_json::from_value(row.payload)
        .map_err(|error| crate::host::SeamError::Encoding(error.to_string()))?;
    if value.id != row.entry_key {
        return Err(crate::host::SeamError::Db(
            "membership row identity does not match its entry key".into(),
        ));
    }
    Ok(VersionedMembership {
        value,
        entry_key: row.entry_key,
        condition,
        host_updated_at,
    })
}

/// Commit only while the actor, target and a surviving owner retain their
/// observed revisions. This prevents stale actors and concurrent owner write skew.
pub fn change_authorized(
    actor: &VersionedMembership,
    current: &VersionedMembership,
    new_role: Option<crate::domain::permissions::OrgRole>,
) -> Result<()> {
    use crate::domain::permissions::OrgRole;
    let caller = &actor.value;
    let target = &current.value;
    let role = OrgRole::from_str(&caller.role)
        .ok_or_else(|| crate::host::SeamError::Db("invalid actor role".into()))?;
    let target_role = OrgRole::from_str(&target.role)
        .ok_or_else(|| crate::host::SeamError::Db("invalid target role".into()))?;
    let is_self = caller.user_id == target.user_id;
    if caller.org_id != target.org_id
        || (is_self && new_role.is_some())
        || (!is_self
            && (!role.has_at_least(OrgRole::Admin)
                || ((target_role == OrgRole::Owner || new_role == Some(OrgRole::Owner))
                    && role != OrgRole::Owner)))
    {
        return Err(crate::host::SeamError::Db(
            "insufficient membership authority".into(),
        ));
    }
    let mut conditions = vec![current.condition.clone()];
    if actor.entry_key != current.entry_key {
        conditions.push(actor.condition.clone());
    }
    if target_role == OrgRole::Owner && new_role != Some(OrgRole::Owner) {
        let owners = db::read_entries(
            MEMBERSHIPS,
            &Query {
                filters: vec![
                    db::eq("orgId", target.org_id.clone()),
                    db::eq("role", "owner"),
                ],
                limit: Some(2),
                ..Default::default()
            },
        )?;
        let witness = owners
            .into_iter()
            .find(|row| row.entry_key != current.entry_key)
            .ok_or_else(|| crate::host::SeamError::Db("cannot remove last owner".into()))?;
        let witness = versioned(witness)?;
        if witness.value.org_id != target.org_id || witness.value.role != "owner" {
            return Err(crate::host::SeamError::Db("invalid owner witness".into()));
        }
        if witness.entry_key != actor.entry_key {
            conditions.push(witness.condition);
        }
    }
    let op = if let Some(role) = new_role {
        let mut value = target.clone();
        value.role = role.as_str().into();
        BatchOp::write(
            MEMBERSHIPS,
            &current.entry_key,
            serde_json::to_value(value)
                .map_err(|error| crate::host::SeamError::Encoding(error.to_string()))?,
        )
    } else {
        BatchOp::delete(MEMBERSHIPS, &current.entry_key)
    };
    db::compare_and_set(&conditions, &[op])
}

fn point_query(user_id: &str, org_id: &str) -> Query {
    Query {
        filters: vec![db::eq("userId", user_id), db::eq("orgId", org_id)],
        limit: Some(2),
        ..Default::default()
    }
}

fn page_query(field: &str, id: &str, limit: u32, offset: u32) -> Query {
    Query {
        filters: vec![db::eq(field, id)],
        order_by: Some(db::asc("joinedAt")),
        limit: Some(limit),
        offset: Some(offset),
        ..Default::default()
    }
}

pub fn page_by_user(user_id: &str, limit: u32, offset: u32) -> Result<Vec<MembershipEntry>> {
    db::read_typed(MEMBERSHIPS, &page_query("userId", user_id, limit, offset))
}

pub fn page_by_org(org_id: &str, limit: u32, offset: u32) -> Result<Vec<MembershipEntry>> {
    db::read_typed(MEMBERSHIPS, &page_query("orgId", org_id, limit, offset))
}

pub fn count_by_user(user_id: &str) -> Result<u64> {
    db::count(
        MEMBERSHIPS,
        &Query {
            filters: vec![db::eq("userId", user_id)],
            ..Default::default()
        },
    )
}

pub fn find_by_user(user_id: &str) -> Result<Vec<MembershipEntry>> {
    db::read_typed(
        MEMBERSHIPS,
        &Query {
            filters: vec![db::eq("userId", user_id)],
            order_by: Some(db::asc("joinedAt")),
            ..Default::default()
        },
    )
}

pub fn count_by_org(org_id: &str) -> Result<u64> {
    db::count(
        MEMBERSHIPS,
        &Query {
            filters: vec![db::eq("orgId", org_id)],
            ..Default::default()
        },
    )
}

#[cfg(test)]
#[path = "memberships_tests.rs"]
mod tests;
