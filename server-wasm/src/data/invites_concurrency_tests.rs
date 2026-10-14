use super::*;
use crate::host::db::{test_support::with_db, Condition, Versioned, MEMBERSHIPS, ORGS};
use serde_json::{json, Value};
use std::cell::Cell;
use std::rc::Rc;

fn fixture() -> (
    InviteEntry,
    super::super::memberships::VersionedMembership,
    Versioned<super::super::orgs::OrgEntry>,
) {
    let invite = InviteEntry {
        id: "invite".into(),
        org_id: "org".into(),
        email: Some("fixture@example.test".into()),
        wallet_address: None,
        role: "member".into(),
        token_hash: "old-hash".into(),
        invited_by: "owner".into(),
        created_at: crate::clock::now_iso(),
        expires_at: crate::clock::in_secs(3600),
        accepted_at: None,
    };
    let actor = super::super::memberships::VersionedMembership {
        value:serde_json::from_value(json!({"id":"membership","userId":"owner","orgId":"org","role":"owner","joinedAt":"now"})).unwrap(),
        entry_key:"membership".into(), condition:Condition::version(MEMBERSHIPS,"membership","actor-version").unwrap(), host_updated_at:"now".into(),
    };
    let org = Versioned { value:serde_json::from_value(json!({"id":"org","name":"Org","slug":"org","isPersonal":false,"ownerId":"owner","createdAt":"now","updatedAt":"now"})).unwrap(), condition:Condition::version(ORGS,"org","org-version").unwrap() };
    (invite, actor, org)
}

fn row(key: &str, payload: Value, version: &str) -> Value {
    json!({"entries":[{"entry_key":key,"payload":payload,"version":version}]})
}

#[test]
fn cancel_and_resend_guard_actor_invite_and_organization_in_one_commit() {
    for resend in [false, true] {
        for conflict in [false, true] {
            let (invite, actor, org) = fixture();
            let stored = serde_json::to_value(&invite).unwrap();
            let org_value = serde_json::to_value(&org.value).unwrap();
            let calls = Rc::new(Cell::new(0));
            let captured = calls.clone();
            let next = InviteEntry {
                id: "replacement".into(),
                token_hash: "new-hash".into(),
                ..serde_json::from_value(stored.clone()).unwrap()
            };
            with_db(
                move |op, collection, query| {
                    if op == "compare-and-set" {
                        captured.set(captured.get() + 1);
                        let body = &query.filters[0].value;
                        assert_eq!(body["conditions"][0]["expectedVersion"], "actor-version");
                        assert_eq!(body["conditions"][1]["expectedVersion"], "invite-version");
                        assert_eq!(body["conditions"][2]["expectedVersion"], "org-version");
                        assert_eq!(
                            body["ops"].as_array().unwrap().len(),
                            if resend { 3 } else { 2 }
                        );
                        if resend {
                            assert_eq!(body["conditions"][3]["predicate"], "absent");
                        }
                        // Simulates acceptance/cancellation/resend/role removal between read and commit.
                        if conflict {
                            return Err(invite_conflict());
                        }
                        return Ok(
                            json!({"outcome":"applied","applied":if resend {3} else {2},"entries":[],"results":[],"replayed":false}),
                        );
                    }
                    assert_eq!(
                        op, "read",
                        "no separate destructive delete or write is allowed"
                    );
                    match collection.model {
                        "cedros-login:invite-records" => {
                            Ok(row("invite", stored.clone(), "invite-version"))
                        }
                        "cedros-login:orgs" => Ok(row("org", org_value.clone(), "org-version")),
                        _ => panic!("unexpected collection"),
                    }
                },
                || {
                    assert_eq!(
                        change_pending_authorized(
                            &invite,
                            &actor,
                            if resend { Some(&next) } else { None }
                        )
                        .is_err(),
                        conflict
                    )
                },
            );
            assert_eq!(calls.get(), 1);
        }
    }
}

#[test]
fn accepted_cancelled_or_changed_invites_and_invalid_authority_never_write() {
    for scenario in [
        "accepted",
        "cancelled",
        "changed",
        "member",
        "foreign-actor",
        "owner-invite",
        "foreign-replacement",
    ] {
        let (mut invite, mut actor, org) = fixture();
        let mut stored = serde_json::to_value(&invite).unwrap();
        match scenario {
            "accepted" => stored["acceptedAt"] = json!("now"),
            "changed" => stored["tokenHash"] = json!("another-token"),
            "member" => actor.value.role = "member".into(),
            "foreign-actor" => actor.value.org_id = "other-org".into(),
            "owner-invite" => {
                invite.role = "owner".into();
                actor.value.role = "admin".into();
            }
            _ => {}
        }
        let next = InviteEntry {
            id: "replacement".into(),
            org_id: if scenario == "foreign-replacement" {
                "foreign".into()
            } else {
                "org".into()
            },
            ..serde_json::from_value(serde_json::to_value(&invite).unwrap()).unwrap()
        };
        let org_value = serde_json::to_value(&org.value).unwrap();
        with_db(
            move |op, collection, _| {
                assert_eq!(
                    op, "read",
                    "stale or unauthorized snapshots cannot reach a write"
                );
                if scenario == "cancelled" {
                    return Ok(json!({"entries":[]}));
                }
                match collection.model {
                    "cedros-login:invite-records" => {
                        Ok(row("invite", stored.clone(), "invite-version"))
                    }
                    "cedros-login:orgs" => Ok(row("org", org_value.clone(), "org-version")),
                    _ => panic!("unexpected collection"),
                }
            },
            || assert!(change_pending_authorized(&invite, &actor, Some(&next)).is_err()),
        );
    }
}

#[test]
fn creation_serializes_recipient_and_seat_checks_against_other_invitation_writers() {
    for conflict in [false, true] {
        let (invite, actor, org) = fixture();
        with_db(
            move |op, _, query| {
                assert_eq!(op, "compare-and-set");
                let body = &query.filters[0].value;
                assert_eq!(body["conditions"][0]["expectedVersion"], "actor-version");
                assert_eq!(body["conditions"][1]["expectedVersion"], "org-version");
                assert_eq!(body["conditions"][2]["predicate"], "absent");
                assert_eq!(body["ops"].as_array().unwrap().len(), 2);
                if conflict {
                    return Err(invite_conflict());
                }
                Ok(
                    json!({"outcome":"applied","applied":2,"entries":[],"results":[],"replayed":false}),
                )
            },
            || assert_eq!(create_authorized(&invite, &actor, &org).is_err(), conflict),
        );
    }
}
