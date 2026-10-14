//! Durable setup-state inspection and idempotent default-organization repair.
use sha2::{Digest, Sha256};

use super::{DEFAULT_ORG_ID_SETTING, DEFAULT_ORG_NAME};
use crate::clock;
use crate::data::memberships::{self, MembershipEntry};
use crate::data::orgs::{self, OrgEntry};
use crate::data::users;
use crate::domain::permissions::OrgRole;
use crate::host::db::{self, AtomicBatchOp, BatchOp, Query, MEMBERSHIPS, ORGS};
use crate::host::{log, settings, Result, SeamError};

pub(super) struct SetupState {
    pub has_admin: bool,
    pub complete: bool,
}

/// Setup is complete only when the configured org, its system-admin owner, and
/// that owner's membership are all durable.
pub(super) fn setup_state() -> Result<SetupState> {
    let has_admin = users::count_system_admins()? > 0;
    if !has_admin {
        return Ok(SetupState {
            has_admin,
            complete: false,
        });
    }
    let complete = match configured_org()? {
        Some(org) => configured_org_is_complete(&org)?,
        None => false,
    };
    Ok(SetupState {
        has_admin,
        complete,
    })
}

/// The configured pointer, even when its organization root is stale. Lifecycle
/// checks use this to prevent deleting the currently selected default.
pub(crate) fn configured_default_org_id() -> Result<Option<String>> {
    let raw = settings::get(DEFAULT_ORG_ID_SETTING)?;
    Ok(super::super::auth::default_org_id_from_optional_setting(
        raw,
    ))
}

/// A configured default is usable for signup only when the complete setup
/// relationship still exists. Missing/tombstoned roots return `None`.
pub(crate) fn usable_default_org_id() -> Result<Option<String>> {
    let Some(org) = configured_org()? else {
        return Ok(None);
    };
    if configured_org_is_complete(&org)? {
        Ok(Some(org.id))
    } else {
        Ok(None)
    }
}

fn configured_org_is_complete(org: &OrgEntry) -> Result<bool> {
    let owner_id = org.owner_id.trim();
    if owner_id.is_empty() {
        return Ok(false);
    }
    let owner_is_admin = users::find_by_id(owner_id)?.is_some_and(|owner| owner.is_system_admin);
    if !owner_is_admin {
        return Ok(false);
    }
    let membership = memberships::find(owner_id, &org.id)?;
    Ok(relationship_is_complete(
        owner_is_admin,
        membership.as_ref(),
    ))
}

fn relationship_is_complete(owner_is_admin: bool, membership: Option<&MembershipEntry>) -> bool {
    owner_is_admin && membership.is_some_and(|value| value.role == OrgRole::Owner.as_str())
}

/// Attach a newly claimed first admin to a durable default organization.
pub(super) fn bootstrap_admin_org(user_id: &str, name: String, now: &str) -> Result<()> {
    reconcile_admin_org(user_id, &name, now).map(|_| ())
}

/// Repair a partial setup without ever adopting an unrelated tenant's org.
pub(crate) fn ensure_default_org_bootstrap() -> Result<String> {
    let configured = configured_org()?;
    let configured_owner = match configured.as_ref() {
        Some(org) => configured_admin_owner(org)?,
        None => None,
    };
    let admin_id = match configured_owner {
        Some(id) => id,
        None => users::find_first_system_admin()?
            .map(|user| user.id)
            .ok_or_else(|| {
                SeamError::Settings("setup required before default org repair".into())
            })?,
    };
    reconcile_admin_org(&admin_id, DEFAULT_ORG_NAME, &clock::now_iso())
}

fn configured_admin_owner(org: &OrgEntry) -> Result<Option<String>> {
    let owner_id = org.owner_id.trim();
    if owner_id.is_empty() {
        return Ok(None);
    }
    Ok(users::find_by_id(owner_id)?
        .filter(|user| user.is_system_admin)
        .map(|user| user.id))
}

fn reconcile_admin_org(user_id: &str, name: &str, now: &str) -> Result<String> {
    let admin_memberships = memberships::find_by_user(user_id)?;
    let (org, is_new) = choose_org(user_id, name, &admin_memberships)?;
    let existing_membership = admin_memberships
        .iter()
        .find(|membership| membership.org_id == org.id);
    let plan = ReconcilePlan::new(org, existing_membership, user_id, now, is_new)?;
    persist(plan)
}

fn choose_org(
    user_id: &str,
    name: &str,
    admin_memberships: &[MembershipEntry],
) -> Result<(OrgEntry, bool)> {
    if let Some(org) = configured_org()?.filter(|org| adoptable(org, user_id)) {
        return Ok((org, false));
    }
    if let Some(org) = membership_org(user_id, admin_memberships)? {
        return Ok((org, false));
    }
    choose_org_without_membership(user_id, name)
}

fn membership_org(user_id: &str, values: &[MembershipEntry]) -> Result<Option<OrgEntry>> {
    for membership in values {
        if membership.org_id.trim().is_empty() {
            continue;
        }
        if let Some(org) = orgs::find_by_id(&membership.org_id)? {
            if adoptable(&org, user_id) {
                return Ok(Some(org));
            }
        }
    }
    Ok(None)
}

fn choose_org_without_membership(user_id: &str, name: &str) -> Result<(OrgEntry, bool)> {
    let base_slug = normalized_slug(name);
    let base_match = orgs::find_by_slug(&base_slug)?;
    if let Some(org) = base_match.as_ref().filter(|org| adoptable(org, user_id)) {
        return Ok((clone_org(org), false));
    }
    let owned = admin_owned_orgs(user_id)?;
    if let Some(org) = owned.into_iter().next() {
        return Ok((org, false));
    }
    let slug = if base_match.is_none() {
        base_slug
    } else {
        let fallback = collision_safe_slug(&base_slug, user_id);
        match orgs::find_by_slug(&fallback)? {
            Some(org) if adoptable(&org, user_id) => return Ok((org, false)),
            Some(_) => {
                return Err(SeamError::Db(
                    "setup organization slug is unavailable".into(),
                ))
            }
            None => fallback,
        }
    };
    Ok((
        OrgEntry::new(name.to_string(), slug, user_id.to_string(), false),
        true,
    ))
}

fn admin_owned_orgs(user_id: &str) -> Result<Vec<OrgEntry>> {
    db::read_typed(
        ORGS,
        &Query {
            filters: vec![db::eq("ownerId", user_id)],
            order_by: Some(db::asc("createdAt")),
            ..Default::default()
        },
    )
}

fn configured_org() -> Result<Option<OrgEntry>> {
    let Some(id) = configured_default_org_id()? else {
        return Ok(None);
    };
    orgs::find_by_id(&id)
}

fn adoptable(org: &OrgEntry, user_id: &str) -> bool {
    org.owner_id.trim().is_empty() || org.owner_id == user_id
}

fn normalized_slug(name: &str) -> String {
    let slug = orgs::generate_slug(name);
    if slug.is_empty() {
        "organization".to_string()
    } else {
        slug
    }
}

fn collision_safe_slug(base: &str, user_id: &str) -> String {
    let digest = hex::encode(Sha256::digest(user_id.as_bytes()));
    let prefix: String = base.chars().take(80).collect();
    format!("{prefix}-{}", &digest[..16])
}

fn clone_org(org: &OrgEntry) -> OrgEntry {
    OrgEntry {
        id: org.id.clone(),
        name: org.name.clone(),
        slug: org.slug.clone(),
        logo_url: org.logo_url.clone(),
        is_personal: org.is_personal,
        owner_id: org.owner_id.clone(),
        created_at: org.created_at.clone(),
        updated_at: org.updated_at.clone(),
    }
}

struct ReconcilePlan {
    org: OrgEntry,
    membership: MembershipEntry,
    write_org: bool,
    write_membership: bool,
}

impl ReconcilePlan {
    fn new(
        mut org: OrgEntry,
        existing: Option<&MembershipEntry>,
        user_id: &str,
        now: &str,
        is_new: bool,
    ) -> Result<Self> {
        if !adoptable(&org, user_id) {
            return Err(SeamError::Db("setup organization has another owner".into()));
        }
        let write_org = is_new || org.owner_id.trim().is_empty();
        if write_org {
            org.owner_id = user_id.to_string();
            org.updated_at = now.to_string();
        }
        let (membership, write_membership) = owner_membership(existing, user_id, &org.id, now);
        Ok(Self {
            org,
            membership,
            write_org,
            write_membership,
        })
    }
}

fn owner_membership(
    existing: Option<&MembershipEntry>,
    user_id: &str,
    org_id: &str,
    now: &str,
) -> (MembershipEntry, bool) {
    if let Some(existing) = existing {
        let mut membership = existing.clone();
        let changed = membership.role != OrgRole::Owner.as_str();
        membership.role = OrgRole::Owner.as_str().to_string();
        return (membership, changed);
    }
    (
        MembershipEntry {
            id: owner_membership_id(user_id, org_id),
            user_id: user_id.to_string(),
            org_id: org_id.to_string(),
            role: OrgRole::Owner.as_str().to_string(),
            joined_at: now.to_string(),
        },
        true,
    )
}

fn owner_membership_id(user_id: &str, org_id: &str) -> String {
    let digest = Sha256::digest(format!("{user_id}\0{org_id}").as_bytes());
    format!("setup-owner-{}", hex::encode(digest))
}

fn persist(plan: ReconcilePlan) -> Result<String> {
    let ops = persistence_ops(&plan)?;
    if !ops.is_empty() {
        db::batch_with_results(&ops)?;
    }
    remember_default_org(&plan.org.id)?;
    Ok(plan.org.id)
}

fn persistence_ops(plan: &ReconcilePlan) -> Result<Vec<AtomicBatchOp>> {
    let mut ops = Vec::with_capacity(2);
    if plan.write_org {
        ops.push(write_op(ORGS, &plan.org.id, &plan.org)?);
    }
    if plan.write_membership {
        ops.push(write_op(
            MEMBERSHIPS,
            &plan.membership.id,
            &plan.membership,
        )?);
    }
    Ok(ops)
}

fn write_op<T: serde::Serialize>(
    collection: db::Collection,
    key: &str,
    value: &T,
) -> Result<AtomicBatchOp> {
    let value =
        serde_json::to_value(value).map_err(|error| SeamError::Encoding(error.to_string()))?;
    Ok(BatchOp::write(collection, key, value).into())
}

fn remember_default_org(org_id: &str) -> Result<()> {
    settings::set(DEFAULT_ORG_ID_SETTING, org_id).inspect_err(|error| {
        log::op_warn("setup", "default-org-write", error.code());
    })
}

#[cfg(test)]
#[path = "bootstrap_tests.rs"]
mod tests;
