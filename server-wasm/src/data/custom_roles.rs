//! Per-org custom role definitions over the host DB seam
//! (`cedros-login:custom-roles`, org-db). A custom role is a named set of
//! permission wire values ([`crate::domain::permissions::Permission`]). These are
//! app-facing authorization definitions; cedros-login's own routes still gate on
//! the built-in OrgRole. Mirrors server/src/repositories/custom_role_repository.rs.
use crate::host::db::{self, Query, CUSTOM_ROLES};
use crate::host::Result;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CustomRoleEntry {
    pub id: String,
    pub org_id: String,
    pub name: String,
    pub description: Option<String>,
    pub permissions: Vec<String>,
    pub is_default: bool,
    pub created_at: String,
    pub updated_at: String,
}

pub fn create(role: &CustomRoleEntry) -> Result<()> {
    db::write(CUSTOM_ROLES, &role.id, role)
}

pub fn update(expected: &CustomRoleEntry, role: &CustomRoleEntry) -> Result<()> {
    let current = db::read_versioned::<CustomRoleEntry>(CUSTOM_ROLES, &role.id)?
        .ok_or_else(|| crate::host::SeamError::Db("role unavailable".into()))?;
    if current.value != *expected || expected.org_id != role.org_id || expected.id != role.id {
        return Err(crate::host::SeamError::Db("role changed".into()));
    }
    let mut data =
        serde_json::to_value(role).map_err(|e| crate::host::SeamError::Encoding(e.to_string()))?;
    data["isDefault"] = serde_json::Value::Bool(current.value.is_default);
    data["updatedAt"] = serde_json::Value::String(crate::clock::now_iso());
    db::compare_and_set(
        &[current.condition],
        &[db::BatchOp::write(CUSTOM_ROLES, &role.id, data)],
    )
}

/// Replace default flags as one version-checked transaction. Definitions read by
/// the handler are the exact definitions whose permissions it authorized.
pub fn set_default(roles: Vec<CustomRoleEntry>, target_id: &str) -> Result<()> {
    if !roles.iter().any(|role| role.id == target_id) {
        return Err(crate::host::SeamError::Db("role unavailable".into()));
    }
    let mut conditions = Vec::new();
    let mut ops = Vec::new();
    for mut role in roles {
        let current = db::read_versioned::<CustomRoleEntry>(db::CUSTOM_ROLES, &role.id)?
            .filter(|current| current.value == role)
            .ok_or(crate::host::SeamError::Db("role changed".into()))?;
        conditions.push(current.condition);
        let should_be_default = role.id == target_id;
        if role.is_default != should_be_default {
            role.is_default = should_be_default;
            role.updated_at = crate::clock::now_iso();
            ops.push(db::BatchOp::write(
                db::CUSTOM_ROLES,
                &role.id,
                serde_json::to_value(&role)
                    .map_err(|e| crate::host::SeamError::Encoding(e.to_string()))?,
            ));
        }
    }
    if !ops.is_empty() {
        db::compare_and_set(&conditions, &ops)?;
    }
    Ok(())
}

pub fn find_by_id(id: &str) -> Result<Option<CustomRoleEntry>> {
    db::find_one(CUSTOM_ROLES, &Query::key(id))
}

/// An org's custom roles, newest first.
pub fn find_by_org(org_id: &str) -> Result<Vec<CustomRoleEntry>> {
    db::read_typed(
        CUSTOM_ROLES,
        &Query {
            filters: vec![db::eq("orgId", org_id)],
            order_by: Some(db::desc("createdAt")),
            ..Default::default()
        },
    )
}

pub fn delete(id: &str) -> Result<bool> {
    db::delete(CUSTOM_ROLES, id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_camelcase() {
        let r = CustomRoleEntry {
            id: "r1".into(),
            org_id: "o1".into(),
            name: "Billing".into(),
            description: Some("Manage billing".into()),
            permissions: vec!["org:read".into(), "audit:read".into()],
            is_default: false,
            created_at: "2026-06-01T00:00:00.000Z".into(),
            updated_at: "2026-06-01T00:00:00.000Z".into(),
        };
        let j = serde_json::to_value(&r).unwrap();
        assert_eq!(j["orgId"], "o1");
        assert_eq!(j["isDefault"], false);
        assert_eq!(j["permissions"][0], "org:read");
        assert_eq!(serde_json::from_value::<CustomRoleEntry>(j).unwrap(), r);
    }
    fn role(id: &str, default: bool) -> CustomRoleEntry {
        CustomRoleEntry {
            id: id.into(),
            org_id: "org".into(),
            name: id.into(),
            description: None,
            permissions: vec!["org:read".into()],
            is_default: default,
            created_at: "now".into(),
            updated_at: "now".into(),
        }
    }

    #[test]
    fn default_replacement_is_one_guarded_commit_and_conflicts_fail_closed() {
        use crate::host::db::test_support::with_db;
        use serde_json::json;
        for conflict in [false, true] {
            with_db(
                move |op, _, query| {
                    if op == "read" {
                        let id = &query.entry_keys[0];
                        let current = role(id, id == "old");
                        return Ok(
                            json!({"entries":[{"entry_key":id,"payload":current,"version":format!("version-{id}")}]}),
                        );
                    }
                    assert_eq!(op, "compare-and-set");
                    let body = &query.filters[0].value;
                    assert_eq!(body["conditions"].as_array().unwrap().len(), 2);
                    assert_eq!(body["ops"].as_array().unwrap().len(), 2);
                    if conflict {
                        return Err(crate::host::SeamError::DbConflict {
                            category: crate::host::DbConflictCategory::Precondition,
                            operation: op.into(),
                        });
                    }
                    Ok(
                        json!({"outcome":"applied","applied":2,"entries":[],"results":[],"replayed":false}),
                    )
                },
                || {
                    assert_eq!(
                        set_default(vec![role("old", true), role("new", false)], "new").is_ok(),
                        !conflict
                    )
                },
            );
        }
    }

    #[test]
    fn stale_role_snapshot_cannot_restore_old_permissions_or_default() {
        use crate::host::db::test_support::with_db;
        use serde_json::json;
        with_db(
            |op, _, _| {
                assert_eq!(op, "read", "stale role must not write");
                Ok(
                    json!({"entries":[{"entry_key":"role","payload":role("role",false),"version":"new"}]}),
                )
            },
            || assert!(update(&role("role", true), &role("role", true)).is_err()),
        );
    }
    #[test]
    fn current_role_edit_preserves_default_and_binds_revision() {
        use crate::host::db::test_support::with_db;
        use serde_json::json;
        with_db(
            |op, _, query| {
                if op == "read" {
                    return Ok(
                        json!({"entries":[{"entry_key":"role","payload":role("role",false),"version":"current"}]}),
                    );
                }
                assert_eq!(op, "compare-and-set");
                let body = &query.filters[0].value;
                assert_eq!(body["conditions"][0]["expectedVersion"], "current");
                assert_eq!(body["ops"][0]["data"]["name"], "Renamed");
                assert_eq!(body["ops"][0]["data"]["isDefault"], false);
                Ok(
                    json!({"outcome":"applied","applied":1,"entries":[],"results":[],"replayed":false}),
                )
            },
            || {
                let expected = role("role", false);
                let mut updated = expected.clone();
                updated.name = "Renamed".into();
                updated.is_default = true;
                update(&expected, &updated).unwrap();
            },
        );
    }
}
