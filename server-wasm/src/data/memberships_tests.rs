use super::*;

#[test]
fn round_trips_camelcase() {
    let membership = membership("owner");
    let value = serde_json::to_value(&membership).unwrap();
    assert_eq!(value["userId"], "u1");
    assert_eq!(value["orgId"], "o1");
    assert_eq!(
        serde_json::from_value::<MembershipEntry>(value).unwrap(),
        membership
    );
}

#[test]
fn mutation_binds_actor_and_target_versions_and_fails_on_conflict() {
    use crate::host::db::test_support::with_db;
    for conflict in [false, true] {
        with_db(
            move |op, _, query| {
                assert_eq!(op, "compare-and-set");
                let body = &query.filters[0].value;
                assert_eq!(body["conditions"].as_array().unwrap().len(), 2);
                assert_eq!(body["conditions"][0]["expectedVersion"], "target-version");
                assert_eq!(body["conditions"][1]["expectedVersion"], "actor-version");
                if conflict {
                    return Err(crate::host::SeamError::DbConflict {
                        category: crate::host::DbConflictCategory::Precondition,
                        operation: op.into(),
                    });
                }
                Ok(
                    serde_json::json!({"outcome":"applied","applied":1,"entries":[],"results":[],"replayed":false}),
                )
            },
            || {
                let target = versioned_membership("member");
                let mut actor = versioned_membership("admin");
                actor.value.id = "actor".into();
                actor.value.user_id = "admin".into();
                actor.entry_key = "actor".into();
                actor.condition =
                    Condition::version(MEMBERSHIPS, "actor", "actor-version").unwrap();
                assert_eq!(
                    change_authorized(
                        &actor,
                        &target,
                        Some(crate::domain::permissions::OrgRole::Admin)
                    )
                    .is_err(),
                    conflict
                );
            },
        );
    }
}

#[test]
fn insufficient_authority_and_cross_org_never_reach_storage() {
    let target = versioned_membership("owner");
    let mut actor = versioned_membership("admin");
    actor.value.user_id = "another".into();
    assert!(change_authorized(&actor, &target, None).is_err());
    actor.value.role = "owner".into();
    actor.value.org_id = "other-org".into();
    assert!(change_authorized(&actor, &target, None).is_err());
}

#[test]
fn versioned_membership_fails_closed_without_revision_or_matching_key() {
    let payload = serde_json::to_value(membership("owner")).unwrap();
    assert!(versioned(db::Entry {
        entry_key: "m1".into(),
        payload: payload.clone(),
        updated_at: None,
        version: None,
    })
    .is_err());
    assert!(versioned(db::Entry {
        entry_key: "wrong".into(),
        payload,
        updated_at: Some("2026-07-10T12:00:00Z".into()),
        version: None,
    })
    .is_err());
}

fn versioned_membership(role: &str) -> VersionedMembership {
    VersionedMembership {
        value: membership(role),
        entry_key: "membership-entry".into(),
        host_updated_at: "membership-revision".into(),
        condition: Condition::version(MEMBERSHIPS, "membership-entry", "target-version").unwrap(),
    }
}

fn membership(role: &str) -> MembershipEntry {
    MembershipEntry {
        id: "m1".into(),
        user_id: "u1".into(),
        org_id: "o1".into(),
        role: role.into(),
        joined_at: "2026-06-01T00:00:00.000Z".into(),
    }
}

#[test]
fn point_and_page_reads_are_scoped_and_explicitly_bounded() {
    use crate::host::db::test_support::with_db;
    with_db(
        |op, collection, query| {
            assert_eq!(collection.model, MEMBERSHIPS.model);
            let q = serde_json::to_value(query).unwrap();
            match op {
                "count" => {
                    assert_eq!(q["filters"][0]["value"], "user");
                    assert!(q.get("limit").is_none());
                    Ok(serde_json::json!({"count": 100_000}))
                }
                "read" => {
                    if q["limit"] == 2 {
                        assert_eq!(
                            q["filters"],
                            serde_json::json!([
                                {"field":"userId", "op":"eq", "value":"user"},
                                {"field":"orgId", "op":"eq", "value":"org"}
                            ])
                        );
                    } else {
                        assert_eq!(q["limit"], 50);
                        assert_eq!(q["offset"], 5000);
                        assert_eq!(q["filters"][0]["field"], "orgId");
                        assert_eq!(q["filters"][0]["value"], "org");
                        assert_eq!(q["orderBy"]["field"], "joinedAt");
                    }
                    Ok(serde_json::json!({"entries":[]}))
                }
                _ => panic!("unexpected operation"),
            }
        },
        || {
            assert!(find("user", "org").unwrap().is_none());
            assert!(page_by_org("org", 50, 5000).unwrap().is_empty());
            assert_eq!(count_by_user("user").unwrap(), 100_000);
        },
    );
}

#[test]
fn bulk_details_are_keyed_independently_of_order_and_empty_input_does_no_io() {
    use crate::host::db::test_support::with_db;
    use serde_json::{json, Value};
    use std::cell::Cell;
    use std::rc::Rc;
    let calls = Rc::new(Cell::new(0));
    let counter = calls.clone();
    with_db(
        move |op, _, query| {
            counter.set(counter.get() + 1);
            assert_eq!(op, "read");
            assert_eq!(query.entry_keys.len(), 3);
            assert_eq!(query.limit, Some(3));
            Ok(
                json!({"entries":[{"entry_key":"b", "payload":{"id":"b"}}, {"entry_key":"a", "payload":{"id":"a"}}]}),
            )
        },
        || {
            assert!(db::read_keyed::<Value>(db::USERS, &[]).unwrap().is_empty());
            let result = db::read_keyed::<Value>(
                db::USERS,
                &["a".into(), "b".into(), "missing".into(), "a".into()],
            )
            .unwrap();
            assert_eq!(result["a"]["id"], "a");
            assert_eq!(result["b"]["id"], "b");
            assert!(!result.contains_key("missing"));
            assert_eq!(calls.get(), 1);
        },
    );
}

#[test]
fn bulk_details_chunk_large_pages_with_explicit_host_limits() {
    use crate::host::db::test_support::with_db;
    use serde_json::{json, Value};
    use std::{cell::Cell, rc::Rc};
    let calls = Rc::new(Cell::new(0));
    let counter = calls.clone();
    with_db(
        move |op, _, query| {
            assert_eq!(op, "read");
            assert!(query.entry_keys.len() <= 200);
            assert_eq!(query.limit, Some(query.entry_keys.len() as u32));
            counter.set(counter.get() + 1);
            let entries: Vec<Value> = query
                .entry_keys
                .iter()
                .rev()
                .map(|key| json!({"entry_key": key, "payload": {"id": key}}))
                .collect();
            Ok(json!({"entries": entries}))
        },
        || {
            let keys: Vec<String> = (0..501).map(|n| n.to_string()).collect();
            let rows = db::read_keyed::<Value>(db::USERS, &keys).unwrap();
            assert_eq!(calls.get(), 3);
            assert_eq!(rows.len(), keys.len());
            for key in keys {
                assert_eq!(rows[&key]["id"], key);
            }
        },
    );
}

#[test]
fn owner_removal_requires_an_unchanged_surviving_owner() {
    use crate::host::db::test_support::with_db;
    use serde_json::json;
    for witness in [false, true] {
        with_db(
            move |op, _, query| {
                if op == "read" {
                    assert_eq!(query.limit, Some(2));
                    return Ok(if witness {
                        json!({"entries":[{
                            "entry_key":"other-owner", "version":"owner-version", "updated_at":"host-revision",
                            "payload":{"id":"other-owner","userId":"other","orgId":"o1","role":"owner","joinedAt":"now"}
                        }]})
                    } else {
                        json!({"entries":[]})
                    });
                }
                assert_eq!(op, "compare-and-set");
                assert!(witness);
                let conditions = query.filters[0].value["conditions"].as_array().unwrap();
                assert_eq!(conditions.len(), 2);
                assert_eq!(conditions[1]["entryKey"], "other-owner");
                assert_eq!(conditions[1]["expectedVersion"], "owner-version");
                Ok(
                    json!({"outcome":"applied","applied":1,"entries":[],"results":[],"replayed":false}),
                )
            },
            || {
                let owner = versioned_membership("owner");
                assert_eq!(change_authorized(&owner, &owner, None).is_ok(), witness);
            },
        );
    }
}

#[test]
fn ambiguous_or_wrong_scope_memberships_fail_closed() {
    use crate::host::db::test_support::with_db;
    use serde_json::json;
    for scenario in ["valid", "duplicate", "wrong-user", "wrong-org"] {
        with_db(
            move |_, _, query| {
                assert_eq!(query.limit, Some(2));
                let entry = json!({"entry_key":"m1","version":"opaque","updated_at":"now","payload":{
                    "id":"m1","userId":if scenario == "wrong-user" {"other"} else {"u1"},
                    "orgId":if scenario == "wrong-org" {"other"} else {"o1"},"role":"member","joinedAt":"now"
                }});
                Ok(
                    json!({"entries": if scenario == "duplicate" {vec![entry.clone(),entry]} else {vec![entry]}}),
                )
            },
            || {
                assert_eq!(find("u1", "o1").is_ok(), scenario == "valid");
                assert_eq!(find_versioned("u1", "o1").is_ok(), scenario == "valid");
            },
        );
    }
}
