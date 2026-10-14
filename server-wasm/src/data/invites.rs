//! Org invites over the host DB seam (`cedros-login:invite-records`, org-db). Keyed by
//! invite id; presented invite tokens are looked up by their hash. Mirrors
//! server/src/repositories/invite_repository.rs::InviteEntity.
use crate::host::db::{self, Query, INVITES};
use crate::host::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct InviteEntry {
    pub id: String,
    pub org_id: String,
    pub email: Option<String>,
    pub wallet_address: Option<String>,
    pub role: String,
    pub token_hash: String,
    pub invited_by: String,
    pub created_at: String,
    pub expires_at: String,
    pub accepted_at: Option<String>,
}

/// Consume the exact invitation and create its membership in one guarded commit.
/// Touching the organization revision serializes competing invitations for the
/// same recipient, including invitations with different IDs.
pub fn accept(invite: &InviteEntry, user_id: &str) -> Result<super::memberships::MembershipEntry> {
    use crate::domain::permissions::OrgRole;
    use crate::host::{
        db::{BatchOp, MEMBERSHIPS, ORGS},
        SeamError,
    };
    let invalid = || SeamError::Db("invalid or stale invitation".into());
    let current = db::read_versioned::<InviteEntry>(INVITES, &invite.id)?.ok_or_else(invalid)?;
    if current.value != *invite
        || invite.accepted_at.is_some()
        || OrgRole::from_str(&invite.role).is_none()
        || invite.email.is_some() == invite.wallet_address.is_some()
    {
        return Err(invalid());
    }
    let expiry = chrono::DateTime::parse_from_rfc3339(&invite.expires_at).map_err(|_| invalid())?;
    let now = crate::clock::now_iso();
    if expiry <= chrono::DateTime::parse_from_rfc3339(&now).map_err(|_| invalid())? {
        return Err(invalid());
    }
    let org =
        db::read_versioned::<super::orgs::OrgEntry>(ORGS, &invite.org_id)?.ok_or_else(invalid)?;
    if super::memberships::find(user_id, &invite.org_id)?.is_some() {
        return Err(invalid());
    }
    let membership = super::memberships::MembershipEntry {
        id: uuid::Uuid::new_v4().to_string(),
        user_id: user_id.into(),
        org_id: invite.org_id.clone(),
        role: invite.role.clone(),
        joined_at: now.clone(),
    };
    let mut accepted = current.value;
    accepted.accepted_at = Some(now);
    let value = |v| serde_json::to_value(v).map_err(|error| SeamError::Encoding(error.to_string()));
    db::compare_and_set(
        &[
            current.condition,
            org.condition,
            db::Condition::absent(MEMBERSHIPS, &membership.id),
        ],
        &[
            BatchOp::write(INVITES, &invite.id, value(&accepted)?),
            BatchOp::write(
                ORGS,
                &invite.org_id,
                serde_json::to_value(org.value)
                    .map_err(|error| SeamError::Encoding(error.to_string()))?,
            ),
            BatchOp::write(
                MEMBERSHIPS,
                &membership.id,
                serde_json::to_value(&membership)
                    .map_err(|error| SeamError::Encoding(error.to_string()))?,
            ),
        ],
    )?;
    Ok(membership)
}

/// Reserve a new invitation only while its actor and the organization revision
/// used for recipient/seat checks are unchanged. Other invitation writers touch
/// that same revision, so concurrent duplicate/seat checks cannot both commit.
pub fn create_authorized(
    invite: &InviteEntry,
    actor: &super::memberships::VersionedMembership,
    org: &db::Versioned<super::orgs::OrgEntry>,
) -> Result<()> {
    use crate::host::db::{BatchOp, Condition, ORGS};
    ensure_actor(invite, actor)?;
    if org.value.id != invite.org_id || invite.accepted_at.is_some() {
        return Err(invite_conflict());
    }
    db::compare_and_set(
        &[
            actor.condition.clone(),
            org.condition.clone(),
            Condition::absent(INVITES, &invite.id),
        ],
        &[
            BatchOp::write(
                INVITES,
                &invite.id,
                serde_json::to_value(invite).map_err(encode_error)?,
            ),
            BatchOp::write(
                ORGS,
                &org.value.id,
                serde_json::to_value(&org.value).map_err(encode_error)?,
            ),
        ],
    )?;
    Ok(())
}

/// Cancel or rotate an exact pending invitation in one commit. Acceptance,
/// another resend, removal and actor revocation all invalidate this write.
pub fn change_pending_authorized(
    old: &InviteEntry,
    actor: &super::memberships::VersionedMembership,
    replacement: Option<&InviteEntry>,
) -> Result<()> {
    use crate::host::db::{BatchOp, Condition, ORGS};
    ensure_actor(old, actor)?;
    let current =
        db::read_versioned::<InviteEntry>(INVITES, &old.id)?.ok_or_else(invite_conflict)?;
    if current.value != *old || old.accepted_at.is_some() {
        return Err(invite_conflict());
    }
    let org = db::read_versioned::<super::orgs::OrgEntry>(ORGS, &old.org_id)?
        .ok_or_else(invite_conflict)?;
    if org.value.id != old.org_id {
        return Err(invite_conflict());
    }
    let mut conditions = vec![actor.condition.clone(), current.condition, org.condition];
    let mut ops = vec![
        BatchOp::delete(INVITES, &old.id),
        BatchOp::write(
            ORGS,
            &old.org_id,
            serde_json::to_value(&org.value).map_err(encode_error)?,
        ),
    ];
    if let Some(next) = replacement {
        if next.id == old.id
            || next.org_id != old.org_id
            || next.email != old.email
            || next.wallet_address != old.wallet_address
            || next.role != old.role
            || next.accepted_at.is_some()
            || next.invited_by != actor.value.user_id
        {
            return Err(invite_conflict());
        }
        conditions.push(Condition::absent(INVITES, &next.id));
        ops.push(BatchOp::write(
            INVITES,
            &next.id,
            serde_json::to_value(next).map_err(encode_error)?,
        ));
    }
    db::compare_and_set(&conditions, &ops)?;
    Ok(())
}

fn ensure_actor(
    invite: &InviteEntry,
    actor: &super::memberships::VersionedMembership,
) -> Result<()> {
    use crate::domain::permissions::OrgRole;
    let role = OrgRole::from_str(&actor.value.role).ok_or_else(invite_conflict)?;
    let invited_role = OrgRole::from_str(&invite.role).ok_or_else(invite_conflict)?;
    if actor.value.org_id != invite.org_id
        || !role.has_at_least(OrgRole::Admin)
        || (invited_role == OrgRole::Owner && role != OrgRole::Owner)
    {
        return Err(invite_conflict());
    }
    Ok(())
}
fn invite_conflict() -> crate::host::SeamError {
    crate::host::SeamError::DbConflict {
        category: crate::host::DbConflictCategory::Precondition,
        operation: "invite-write".into(),
    }
}
fn encode_error(error: serde_json::Error) -> crate::host::SeamError {
    crate::host::SeamError::Encoding(error.to_string())
}

/// Delete invites past their expiry (accepted or not) — clears stale invite
/// `token_hash`es from the cleanup job. An accepted invite's membership is a
/// separate row and is unaffected. Bounded by `page`.
pub fn sweep_expired(now_iso: &str, page: u32) -> Result<u64> {
    db::sweep_expired(INVITES, "expiresAt", now_iso, page)
}

pub fn find_by_id(id: &str) -> Result<Option<InviteEntry>> {
    db::find_one(INVITES, &Query::key(id))
}

pub fn find_by_token_hash(token_hash: &str) -> Result<Option<InviteEntry>> {
    db::find_one(
        INVITES,
        &Query {
            filters: vec![db::eq("tokenHash", token_hash)],
            limit: Some(1),
            ..Default::default()
        },
    )
}

pub fn find_pending_by_org(org_id: &str) -> Result<Vec<InviteEntry>> {
    let mut invites = db::read_typed::<InviteEntry>(
        INVITES,
        &Query {
            filters: vec![db::eq("orgId", org_id)],
            order_by: Some(db::desc("createdAt")),
            ..Default::default()
        },
    )?;
    invites.retain(|i| i.accepted_at.is_none());
    Ok(invites)
}

pub fn delete(id: &str) -> Result<bool> {
    db::delete(INVITES, id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_camelcase() {
        let i = InviteEntry {
            id: "i1".into(),
            org_id: "o1".into(),
            email: Some("u@x.test".into()),
            wallet_address: None,
            role: "member".into(),
            token_hash: "h".into(),
            invited_by: "u0".into(),
            created_at: "2026-06-01T00:00:00.000Z".into(),
            expires_at: "2026-06-08T00:00:00.000Z".into(),
            accepted_at: None,
        };
        let j = serde_json::to_value(&i).unwrap();
        assert_eq!(j["orgId"], "o1");
        assert_eq!(j["tokenHash"], "h");
        assert_eq!(serde_json::from_value::<InviteEntry>(j).unwrap(), i);
    }
    #[test]
    fn acceptance_is_guarded_against_replay_cancel_and_concurrent_membership() {
        use crate::host::db::test_support::with_db;
        use serde_json::json;
        for scenario in [
            "valid",
            "replay",
            "cancelled",
            "changed",
            "expired",
            "member",
            "conflict",
            "ambiguous",
        ] {
            let invite = InviteEntry {
                id: "invite".into(),
                org_id: "org".into(),
                email: Some("u@example.com".into()),
                wallet_address: None,
                role: "member".into(),
                token_hash: "hash".into(),
                invited_by: "owner".into(),
                created_at: crate::clock::now_iso(),
                expires_at: crate::clock::in_secs(3600),
                accepted_at: None,
            };
            let mut stored = serde_json::to_value(&invite).unwrap();
            match scenario {
                "replay" => stored["acceptedAt"] = json!(crate::clock::now_iso()),
                "changed" => stored["role"] = json!("owner"),
                "expired" => stored["expiresAt"] = json!(crate::clock::ago_iso(1)),
                "ambiguous" => stored["walletAddress"] = json!("wallet"),
                _ => {}
            }
            // Expiry/ambiguity are also rejected when they are the caller's exact snapshot.
            let invite = if matches!(scenario, "expired" | "ambiguous") {
                serde_json::from_value(stored.clone()).unwrap()
            } else {
                invite
            };
            with_db(
                move |op, collection, query| {
                    if op == "compare-and-set" {
                        let body = &query.filters[0].value;
                        assert_eq!(body["conditions"][0]["expectedVersion"], "invite-version");
                        assert_eq!(body["conditions"][1]["expectedVersion"], "org-version");
                        assert_eq!(body["conditions"][2]["predicate"], "absent");
                        assert_eq!(body["ops"].as_array().unwrap().len(), 3);
                        if scenario == "conflict" {
                            return Err(crate::host::SeamError::DbConflict {
                                category: crate::host::DbConflictCategory::Precondition,
                                operation: op.into(),
                            });
                        }
                        assert_eq!(scenario, "valid");
                        return Ok(
                            json!({"outcome":"applied","applied":3,"entries":[],"results":[],"replayed":false}),
                        );
                    }
                    assert_eq!(op, "read");
                    let (key, payload, version) = match collection.model {
                        "cedros-login:invite-records" => {
                            if scenario == "cancelled" {
                                return Ok(json!({"entries":[]}));
                            }
                            ("invite", stored.clone(), "invite-version")
                        }
                        "cedros-login:orgs" => (
                            "org",
                            json!({"id":"org","name":"Org","slug":"org","isPersonal":false,"ownerId":"owner","createdAt":"now","updatedAt":"now"}),
                            "org-version",
                        ),
                        "cedros-login:memberships" => {
                            if scenario != "member" {
                                return Ok(json!({"entries":[]}));
                            }
                            (
                                "member",
                                json!({"id":"member","userId":"user","orgId":"org","role":"member","joinedAt":"now"}),
                                "member-version",
                            )
                        }
                        _ => panic!("unexpected collection"),
                    };
                    Ok(json!({"entries":[{"entry_key":key,"payload":payload,"version":version}]}))
                },
                || {
                    assert_eq!(
                        accept(&invite, "user").is_ok(),
                        scenario == "valid",
                        "{scenario}"
                    )
                },
            );
        }
    }
}

#[cfg(test)]
#[path = "invites_concurrency_tests.rs"]
mod concurrency_tests;
