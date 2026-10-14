//! Organizations over the host DB seam (`cedros-login:orgs`, org-db access).
//! Mirrors server/src/repositories/org_repository.rs::OrgEntity.
use crate::clock;
use crate::host::db::{self, Query, ORGS};
use crate::host::Result;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct OrgEntry {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub logo_url: Option<String>,
    pub is_personal: bool,
    pub owner_id: String,
    pub created_at: String,
    pub updated_at: String,
}

/// An organization payload paired with the host-managed revision used by
/// lifecycle operations. The revision is entry metadata, not payload data.
pub struct VersionedOrgEntry {
    pub value: OrgEntry,
    pub entry_key: String,
    pub host_updated_at: String,
}

impl OrgEntry {
    /// New org with a fresh id and equal created/updated timestamps.
    pub fn new(name: String, slug: String, owner_id: String, is_personal: bool) -> Self {
        let now = clock::now_iso();
        OrgEntry {
            id: Uuid::new_v4().to_string(),
            name,
            slug,
            logo_url: None,
            is_personal,
            owner_id,
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

/// Slugify a name: lowercase, non-alphanumerics → hyphens, collapse/trim repeats.
/// Mirrors `server/src/repositories/org_repository.rs::generate_slug`.
pub fn generate_slug(name: &str) -> String {
    name.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

pub fn find_by_ids(ids: &[String]) -> Result<std::collections::HashMap<String, OrgEntry>> {
    db::read_keyed(ORGS, ids)
}

pub fn find_by_id(id: &str) -> Result<Option<OrgEntry>> {
    db::find_one(ORGS, &Query::key(id))
}

pub fn find_by_id_versioned(id: &str) -> Result<Option<VersionedOrgEntry>> {
    let Some(row) = db::read_entries(ORGS, &Query::key(id))?.into_iter().next() else {
        return Ok(None);
    };
    let host_updated_at = row.updated_at.ok_or_else(|| {
        crate::host::SeamError::Db("organization row is missing host revision metadata".into())
    })?;
    let value: OrgEntry = serde_json::from_value(row.payload)
        .map_err(|error| crate::host::SeamError::Encoding(error.to_string()))?;
    if value.id != row.entry_key {
        return Err(crate::host::SeamError::Db(
            "organization row identity does not match its entry key".into(),
        ));
    }
    Ok(Some(VersionedOrgEntry {
        value,
        entry_key: row.entry_key,
        host_updated_at,
    }))
}

pub fn find_by_slug(slug: &str) -> Result<Option<OrgEntry>> {
    db::find_one(
        ORGS,
        &Query {
            filters: vec![db::eq("slug", slug)],
            limit: Some(1),
            ..Default::default()
        },
    )
}

pub fn slug_exists(slug: &str) -> Result<bool> {
    Ok(find_by_slug(slug)?.is_some())
}

/// One page of all orgs, newest first (system-admin listing).
pub fn list_all(limit: u32, offset: u32) -> Result<Vec<OrgEntry>> {
    db::read_typed(
        ORGS,
        &Query {
            order_by: Some(db::desc("createdAt")),
            limit: Some(limit),
            offset: Some(offset),
            ..Default::default()
        },
    )
}

/// Total org count.
pub fn count() -> Result<u64> {
    db::count(ORGS, &Query::default())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_camelcase() {
        let o = OrgEntry {
            id: "o1".into(),
            name: "Acme".into(),
            slug: "acme".into(),
            logo_url: None,
            is_personal: false,
            owner_id: "u1".into(),
            created_at: "2026-06-01T00:00:00.000Z".into(),
            updated_at: "2026-06-01T00:00:00.000Z".into(),
        };
        let j = serde_json::to_value(&o).unwrap();
        assert_eq!(j["ownerId"], "u1");
        assert_eq!(j["isPersonal"], false);
        assert_eq!(serde_json::from_value::<OrgEntry>(j).unwrap(), o);
    }

    #[test]
    fn slug_lowercases_collapses_and_trims() {
        assert_eq!(generate_slug("Acme Corp"), "acme-corp");
        assert_eq!(generate_slug("  Hello--World!! "), "hello-world");
        assert_eq!(generate_slug("***"), "");
    }
}
