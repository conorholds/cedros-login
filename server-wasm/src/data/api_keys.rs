//! API keys over the host DB seam (`cedros-login:api-keys`), keyed by key id.
//! Only the SHA-256 hash + a display prefix are stored — never the raw key.
use crate::host::db::{self, Query, API_KEYS};
use crate::host::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeyEntry {
    pub id: String,
    pub user_id: String,
    pub key_hash: String,
    pub key_prefix: String,
    pub label: String,
    pub created_at: String,
    pub last_used_at: Option<String>,
    #[serde(default)]
    pub portal_agent: Option<PortalAgentBinding>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PortalAgentBinding {
    pub organization_id: String,
    pub membership_revision: String,
    pub expires_at: String,
}

pub fn create(entry: &ApiKeyEntry, session_id: &str) -> Result<()> {
    let user = db::read_versioned::<crate::data::users::UserEntry>(db::USERS, &entry.user_id)?
        .ok_or_else(|| crate::host::SeamError::Db("API key owner not found".into()))?;
    let session =
        db::read_versioned::<crate::data::sessions::SessionEntry>(db::SESSIONS, session_id)?
            .ok_or_else(|| crate::host::SeamError::Db("API key session not found".into()))?;
    if session.value.user_id != entry.user_id
        || (session.value.revoked_at.is_some()
            || session.value.expires_at <= crate::clock::now_iso())
    {
        return Err(crate::host::SeamError::Db("API key session invalid".into()));
    }
    let access = if entry.portal_agent.is_some() {
        db::ACCOUNT_LIFECYCLE_DB
    } else {
        db::IDENTITY_DB
    };
    let mut conditions = vec![
        user.condition.in_access(access),
        session.condition.in_access(access),
        db::Condition::absent(API_KEYS, &entry.id).in_access(access),
    ];
    if let Some(binding) = &entry.portal_agent {
        let membership =
            crate::data::memberships::find_versioned(&entry.user_id, &binding.organization_id)?
                .ok_or_else(|| crate::host::SeamError::Db("Agent membership missing".into()))?;
        if user.value.suspended_at.is_some()
            || !user.value.email_verified
            || membership.condition.observed_version() != Some(binding.membership_revision.as_str())
            || !matches!(membership.value.role.as_str(), "owner" | "admin")
        {
            return Err(crate::host::SeamError::Db(
                "Agent membership changed".into(),
            ));
        }
        conditions.push(membership.condition.in_access(access));
    }
    db::compare_and_set(
        &conditions,
        &[
            db::BatchOp::write(
                db::Collection {
                    access,
                    ..db::USERS
                },
                &entry.user_id,
                serde_json::to_value(&user.value)
                    .map_err(|e| crate::host::SeamError::Encoding(e.to_string()))?,
            ),
            db::BatchOp::write(
                db::Collection { access, ..API_KEYS },
                &entry.id,
                serde_json::to_value(entry)
                    .map_err(|e| crate::host::SeamError::Encoding(e.to_string()))?,
            ),
        ],
    )
}

pub fn find_by_id(id: &str) -> Result<Option<ApiKeyEntry>> {
    db::find_one(API_KEYS, &Query::key(id))
}

pub fn find_by_user(user_id: &str) -> Result<Vec<ApiKeyEntry>> {
    db::read_typed(
        API_KEYS,
        &Query {
            filters: vec![db::eq("userId", user_id)],
            order_by: Some(db::desc("createdAt")),
            ..Default::default()
        },
    )
}

pub fn find_by_hash(key_hash: &str) -> Result<Option<ApiKeyEntry>> {
    db::find_one(
        API_KEYS,
        &Query {
            filters: vec![db::eq("keyHash", key_hash)],
            limit: Some(1),
            ..Default::default()
        },
    )
}

pub fn count_by_user(user_id: &str) -> Result<u64> {
    db::count(
        API_KEYS,
        &Query {
            filters: vec![db::eq("userId", user_id)],
            ..Default::default()
        },
    )
}

pub fn delete(id: &str) -> Result<bool> {
    db::delete(API_KEYS, id)
}

/// Record recent use for the listing UI, coalescing writes within one minute.
/// Authorization is still checked on every request before this metadata update.
pub fn touch_last_used(entry: ApiKeyEntry, now_iso: &str) -> Result<()> {
    const MAX_ATTEMPTS: usize = 3;
    let mut attempt = 0;
    loop {
        attempt += 1;
        let Some(mut current) = db::read_versioned::<ApiKeyEntry>(API_KEYS, &entry.id)? else {
            return Ok(());
        };
        if current.value.key_hash != entry.key_hash
            || current.value.user_id != entry.user_id
            || current.value.portal_agent != entry.portal_agent
        {
            return Err(crate::host::SeamError::Db("API key changed".into()));
        }
        if let Some(last_used) = current.value.last_used_at.as_deref() {
            if let (Ok(last), Ok(now)) = (
                chrono::DateTime::parse_from_rfc3339(last_used),
                chrono::DateTime::parse_from_rfc3339(now_iso),
            ) {
                if now.signed_duration_since(last).num_seconds() < 60 {
                    return Ok(());
                }
            }
        }
        // Preserve concurrent label and other metadata changes from this read.
        current.value.last_used_at = Some(now_iso.to_string());
        match db::compare_and_set(
            &[current.condition],
            &[db::BatchOp::write(
                API_KEYS,
                &entry.id,
                serde_json::to_value(&current.value)
                    .map_err(|e| crate::host::SeamError::Encoding(e.to_string()))?,
            )],
        ) {
            Err(crate::host::SeamError::DbConflict {
                category: crate::host::DbConflictCategory::Precondition,
                ..
            }) if attempt < MAX_ATTEMPTS => continue,
            result => return result,
        }
    }
}

/// Delete keys observed before an atomic account ownership transition. Issuance
/// checks the same user revision, so it cannot race through the transition.
pub fn delete_operations(user_id: &str) -> Result<Vec<db::BatchOp>> {
    Ok(find_by_user(user_id)?
        .into_iter()
        .map(|key| db::BatchOp::delete(API_KEYS, &key.id))
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_camelcase() {
        let k = ApiKeyEntry {
            id: "k1".into(),
            user_id: "u1".into(),
            key_hash: "h".into(),
            key_prefix: "ck_abcdef".into(),
            label: "ci".into(),
            created_at: "2026-06-01T00:00:00.000Z".into(),
            last_used_at: None,
            portal_agent: None,
        };
        let j = serde_json::to_value(&k).unwrap();
        assert_eq!(j["userId"], "u1");
        assert_eq!(j["keyHash"], "h");
        assert_eq!(serde_json::from_value::<ApiKeyEntry>(j).unwrap(), k);
    }
}

#[cfg(test)]
mod lifecycle_tests {
    use super::*;
    use serde_json::json;

    fn key() -> ApiKeyEntry {
        ApiKeyEntry {
            id: "k".into(),
            user_id: "u".into(),
            key_hash: "hash".into(),
            key_prefix: "ck_test".into(),
            label: "test".into(),
            created_at: "t".into(),
            last_used_at: None,
            portal_agent: None,
        }
    }

    #[test]
    fn usage_updates_never_resurrect_deleted_keys() {
        db::test_support::with_db(
            |op, _, _| {
                assert_eq!(op, "read", "deleted key must never be written");
                Ok(json!({"entries":[]}))
            },
            || touch_last_used(key(), "now").unwrap(),
        );
        for conflict in [false, true] {
            db::test_support::with_db(
                move |op, _, query| {
                    if op == "read" {
                        return Ok(
                            json!({"entries":[{"entry_key":"k","version":"key-version","payload":key()}]}),
                        );
                    }
                    assert_eq!(op, "compare-and-set");
                    let request = &query.filters[0].value;
                    assert_eq!(request["conditions"][0]["expectedVersion"], "key-version");
                    if conflict {
                        return Err(crate::host::SeamError::Db("concurrently revoked".into()));
                    }
                    Ok(
                        json!({"outcome":"applied","applied":1,"replayed":false,"entries":[],"results":[]}),
                    )
                },
                || assert_eq!(touch_last_used(key(), "now").is_err(), conflict),
            );
        }
    }

    fn observed_key(entry: ApiKeyEntry, version: &str) -> serde_json::Value {
        json!({"entries":[{"entry_key":"k","version":version,"payload":entry}]})
    }

    fn usage_conflict(category: crate::host::DbConflictCategory) -> crate::host::SeamError {
        crate::host::SeamError::DbConflict {
            category,
            operation: "compare-and-set".into(),
        }
    }

    #[test]
    fn usage_is_coalesced_and_preserves_current_metadata() {
        for (last_used, write) in [
            ("2026-10-13T10:00:01Z", false),
            ("2026-10-13T10:01:01Z", false),
            ("2026-10-13T10:00:00Z", true),
            ("invalid", true),
        ] {
            let writes = std::rc::Rc::new(std::cell::Cell::new(0));
            let seen = writes.clone();
            db::test_support::with_db(
                move |op, _, query| {
                    if op == "read" {
                        let mut current = key();
                        current.label = "renamed".into();
                        current.last_used_at = Some(last_used.into());
                        return Ok(observed_key(current, "v1"));
                    }
                    assert!(write, "recent usage must not write");
                    seen.set(seen.get() + 1);
                    let request = &query.filters[0].value;
                    assert_eq!(request["ops"][0]["data"]["label"], "renamed");
                    assert_eq!(
                        request["ops"][0]["data"]["lastUsedAt"],
                        "2026-10-13T10:01:00Z"
                    );
                    Ok(
                        json!({"outcome":"applied","applied":1,"replayed":false,"entries":[],"results":[]}),
                    )
                },
                || touch_last_used(key(), "2026-10-13T10:01:00Z").unwrap(),
            );
            assert_eq!(writes.get(), usize::from(write));
        }
    }

    #[test]
    fn usage_reconciles_conflicts_without_overwriting_or_resurrecting_keys() {
        for scenario in ["recent", "renamed", "deleted", "hash", "owner", "binding"] {
            let attempts = std::rc::Rc::new(std::cell::Cell::new(0));
            let seen = attempts.clone();
            db::test_support::with_db(
                move |op, _, query| {
                    if op == "read" {
                        let mut current = key();
                        if seen.get() > 0 {
                            match scenario {
                                "deleted" => return Ok(json!({"entries":[]})),
                                "recent" => {
                                    current.last_used_at = Some("2026-10-13T10:01:00Z".into())
                                }
                                "renamed" => current.label = "concurrent rename".into(),
                                "hash" => current.key_hash = "replacement".into(),
                                "owner" => current.user_id = "other".into(),
                                "binding" => {
                                    current.portal_agent = Some(PortalAgentBinding {
                                        organization_id: "other".into(),
                                        membership_revision: "revision".into(),
                                        expires_at: "2099-01-01T00:00:00Z".into(),
                                    })
                                }
                                _ => unreachable!(),
                            }
                        }
                        return Ok(observed_key(
                            current,
                            if seen.get() == 0 { "v1" } else { "v2" },
                        ));
                    }
                    assert_eq!(op, "compare-and-set");
                    seen.set(seen.get() + 1);
                    if seen.get() == 1 {
                        return Err(usage_conflict(
                            crate::host::DbConflictCategory::Precondition,
                        ));
                    }
                    assert_eq!(scenario, "renamed");
                    let request = &query.filters[0].value;
                    assert_eq!(request["conditions"][0]["expectedVersion"], "v2");
                    assert_eq!(request["ops"][0]["data"]["label"], "concurrent rename");
                    Ok(
                        json!({"outcome":"applied","applied":1,"replayed":false,"entries":[],"results":[]}),
                    )
                },
                || {
                    assert_eq!(
                        touch_last_used(key(), "2026-10-13T10:01:00Z").is_err(),
                        matches!(scenario, "hash" | "owner" | "binding")
                    )
                },
            );
            assert_eq!(attempts.get(), if scenario == "renamed" { 2 } else { 1 });
        }
    }

    #[test]
    fn usage_retries_are_bounded_and_storage_failures_propagate() {
        for category in [
            crate::host::DbConflictCategory::Precondition,
            crate::host::DbConflictCategory::Unique,
            crate::host::DbConflictCategory::Lease,
        ] {
            let expected = if category == crate::host::DbConflictCategory::Precondition {
                3
            } else {
                1
            };
            let attempts = std::rc::Rc::new(std::cell::Cell::new(0));
            let seen = attempts.clone();
            db::test_support::with_db(
                move |op, _, _| {
                    if op == "read" {
                        return Ok(observed_key(key(), "v1"));
                    }
                    seen.set(seen.get() + 1);
                    Err(usage_conflict(category))
                },
                || assert!(touch_last_used(key(), "2026-10-13T10:01:00Z").is_err()),
            );
            assert_eq!(attempts.get(), expected);
        }
        db::test_support::with_db(
            |_, _, _| Err(crate::host::SeamError::Db("storage unavailable".into())),
            || assert!(touch_last_used(key(), "2026-10-13T10:01:00Z").is_err()),
        );
    }

    #[test]
    fn scoped_issuance_serializes_with_current_membership_and_legacy_keys_still_decode() {
        for scenario in ["current", "changed", "removed"] {
            let mut entry = key();
            entry.portal_agent = Some(PortalAgentBinding {
                organization_id: "org".into(),
                membership_revision: "member-version".into(),
                expires_at: "2099-01-01T00:00:00Z".into(),
            });
            db::test_support::with_db(
                move |op, collection, query| {
                    if op == "read" && collection.model == db::USERS.model {
                        return Ok(
                            json!({"entries":[{"entry_key":"u","version":"user-version","payload":{"id":"u","email":"owner@example.test","emailVerified":true,"authMethods":["email"],"isSystemAdmin":false,"createdAt":"t","updatedAt":"t"}}]}),
                        );
                    }
                    if op == "read" && collection.model == db::SESSIONS.model {
                        return Ok(
                            json!({"entries":[{"entry_key":"s","version":"session-version","payload":{"id":"s","userId":"u","refreshTokenHash":"hash","createdAt":"t","expiresAt":"2099-01-01T00:00:00Z"}}]}),
                        );
                    }
                    if op == "read" && collection.model == db::MEMBERSHIPS.model {
                        if scenario == "removed" {
                            return Ok(json!({"entries":[]}));
                        }
                        return Ok(
                            json!({"entries":[{"entry_key":"membership","version":if scenario=="changed" {"new-version"} else {"member-version"},"updated_at":"revision","payload":{"id":"membership","userId":"u","orgId":"org","role":"owner","joinedAt":"t"}}]}),
                        );
                    }
                    assert_eq!(scenario, "current", "stale membership must not write keys");
                    assert_eq!(op, "compare-and-set");
                    let request = &query.filters[0].value;
                    assert_eq!(request["conditions"].as_array().unwrap().len(), 4);
                    assert_eq!(
                        request["conditions"][3]["expectedVersion"],
                        "member-version"
                    );
                    Ok(
                        json!({"outcome":"applied","applied":2,"replayed":false,"entries":[],"results":[]}),
                    )
                },
                || {
                    let result = create(&entry, "s");
                    assert_eq!(
                        result.is_ok(),
                        scenario == "current",
                        "{scenario}: {result:?}"
                    );
                },
            );
        }
        let mut old = serde_json::to_value(key()).unwrap();
        old.as_object_mut().unwrap().remove("portalAgent");
        assert!(serde_json::from_value::<ApiKeyEntry>(old)
            .unwrap()
            .portal_agent
            .is_none());
    }

    #[test]
    fn issuance_checks_session_and_serializes_with_mailbox_claim() {
        for revoked in [false, true] {
            db::test_support::with_db(
                move |op, collection, query| {
                    if op == "read" && collection.model == db::USERS.model {
                        return Ok(
                            json!({"entries":[{"entry_key":"u","version":"user-version","payload":{
                                "id":"u","email":"owner@example.com","emailVerified":true,"authMethods":["email"],"isSystemAdmin":false,"createdAt":"t","updatedAt":"t"
                            }}]}),
                        );
                    }
                    if op == "read" && collection.model == db::SESSIONS.model {
                        return Ok(
                            json!({"entries":[{"entry_key":"s","version":"session-version","payload":{
                                "id":"s","userId":"u","refreshTokenHash":"hash","createdAt":"t","expiresAt":"2099-01-01T00:00:00Z","revokedAt":if revoked {Some("now")} else {None}
                            }}]}),
                        );
                    }
                    assert!(!revoked, "revoked sessions cannot issue keys");
                    assert_eq!(op, "compare-and-set");
                    let request = &query.filters[0].value;
                    assert_eq!(request["conditions"].as_array().unwrap().len(), 3);
                    assert_eq!(request["conditions"][0]["expectedVersion"], "user-version");
                    assert_eq!(
                        request["conditions"][1]["expectedVersion"],
                        "session-version"
                    );
                    assert_eq!(request["conditions"][2]["predicate"], "absent");
                    assert_eq!(request["ops"][0]["contentModelId"], db::USERS.model);
                    assert_eq!(request["ops"][1]["contentModelId"], API_KEYS.model);
                    Ok(
                        json!({"outcome":"applied","applied":2,"replayed":false,"entries":[],"results":[]}),
                    )
                },
                || assert_eq!(create(&key(), "s").is_err(), revoked),
            );
        }
    }
}
