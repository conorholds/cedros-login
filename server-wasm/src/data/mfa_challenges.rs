//! Coordinated persistence for MFA factor state and pending login challenges.
//!
//! The challenge claim, replay-protection update, and session creation execute
//! in one host transaction. Any failed factor/session write rolls back the
//! purpose-bound claim, so the user can retry without creating duplicate state.

use crate::data::sessions::SessionEntry;
use crate::data::sso_identities::SsoIdentityEntry;
use crate::data::totp::TotpEntry;
use crate::data::verifications::{self, VerificationEntry};
use crate::host::db::{self, BatchOp, Condition, SESSIONS, SSO_IDENTITIES, VERIFICATIONS};
use crate::host::{Result, SeamError};

pub const MFA_PENDING_TOKEN_TYPE: &str = "mfa_pending";

/// Bind the opaque primary-factor proof to the account snapshot it verified.
/// The whole raw token is stored hashed, so the binding cannot be replaced.
/// Legacy unbound pending tokens fail closed and require restarting sign-in.
pub fn account_binding(user: &super::users::UserEntry) -> Result<String> {
    let serialized = serde_json::to_string(user).map_err(|e| SeamError::Encoding(e.to_string()))?;
    Ok(crate::services::tokens::hash_verification_token(
        &serialized,
    ))
}

pub fn token_matches_account(raw: &str, user: &super::users::UserEntry) -> Result<bool> {
    let mut parts = raw.split('.');
    let method = parts.next().unwrap_or_default();
    let nonce = parts.next().unwrap_or_default();
    let binding = parts.next().unwrap_or_default();
    Ok(!method.is_empty()
        && !nonce.is_empty()
        && parts.next().is_none()
        && binding == account_binding(user)?)
}

/// Find a live, unused MFA-pending token by hash without consuming it.
pub fn find_pending(token_hash: &str, now_iso: &str) -> Result<Option<VerificationEntry>> {
    Ok(verifications::find_by_token_hash(token_hash)?
        .filter(|entry| eligible(entry, token_hash, now_iso)))
}

/// Claim `pending` and persist factor/session state in one host transaction.
/// Returns false only for an internally inconsistent caller-supplied plan;
/// host claim races surface through the standard redacted conflict path.
pub fn consume_with_factor_and_session(
    pending: &VerificationEntry,
    updated_totp: &TotpEntry,
    factor_condition: Condition,
    user_condition: Condition,
    session: &SessionEntry,
    sso_identity: Option<&SsoIdentityEntry>,
    now_iso: &str,
) -> Result<bool> {
    if !eligible(pending, &pending.token_hash, now_iso)
        || updated_totp.user_id != pending.user_id
        || !updated_totp.enabled
        || session.user_id != pending.user_id
        || sso_identity.is_some_and(|identity| {
            identity.user_id != pending.user_id
                || pending.subject_id.as_deref() != Some(identity.id.as_str())
        })
    {
        return Ok(false);
    }
    let current = db::read_versioned::<VerificationEntry>(VERIFICATIONS, &pending.id)?;
    let Some(current) = current
        .filter(|row| row.value == *pending && eligible(&row.value, &pending.token_hash, now_iso))
    else {
        return Ok(false);
    };
    let mut conditions = vec![
        factor_condition,
        current.condition,
        Condition::absent(SESSIONS, &session.id),
        user_condition,
    ];
    let mut ops = vec![
        BatchOp::delete(VERIFICATIONS, &pending.id),
        super::totp::write_op(updated_totp)?,
        BatchOp::write(
            SESSIONS,
            &session.id,
            serde_json::to_value(session).map_err(|e| SeamError::Encoding(e.to_string()))?,
        ),
    ];
    if let Some(identity) = sso_identity {
        // The identity was not linked before the second factor. Never overwrite
        // another concurrent linking decision.
        conditions.push(Condition::absent(SSO_IDENTITIES, &identity.id));
        ops.push(BatchOp::write(
            SSO_IDENTITIES,
            &identity.id,
            serde_json::to_value(identity).map_err(|e| SeamError::Encoding(e.to_string()))?,
        ));
    }
    db::compare_and_set(&conditions, &ops)?;
    Ok(true)
}

fn eligible(entry: &VerificationEntry, token_hash: &str, now_iso: &str) -> bool {
    entry.token_hash == token_hash
        && entry.token_type == MFA_PENDING_TOKEN_TYPE
        && entry.used_at.is_none()
        && entry.expires_at.as_str() > now_iso
}

#[cfg(test)]
mod tests {

    use super::*;
    use crate::host::db::TOTP;

    fn entry(token_type: &str, expires_at: &str, used_at: Option<&str>) -> VerificationEntry {
        VerificationEntry {
            id: "pending-1".into(),
            user_id: "user-1".into(),
            token_hash: "hash-1".into(),
            token_type: token_type.into(),
            target_email: None,
            subject_id: None,
            created_at: "2026-07-10T00:00:00.000Z".into(),
            expires_at: expires_at.into(),
            used_at: used_at.map(str::to_string),
        }
    }

    fn factor() -> TotpEntry {
        TotpEntry {
            user_id: "user-1".into(),
            secret: Some("ciphertext".into()),
            secret_key: None,
            enabled: true,
            created_at: "2026-07-10T00:00:00.000Z".into(),
            enabled_at: Some("2026-07-10T00:00:00.000Z".into()),
            last_used_time_step: Some(42),
            recovery_codes: vec!["remaining".into()],
        }
    }

    fn session() -> SessionEntry {
        SessionEntry {
            id: "session-1".into(),
            user_id: "user-1".into(),
            refresh_token_hash: "refresh-hash".into(),
            ip_address: None,
            user_agent: None,
            created_at: "2026-07-10T00:00:00.000Z".into(),
            expires_at: "2026-07-17T00:00:00.000Z".into(),
            revoked_at: None,
            revoked_reason: None,
            last_strong_auth_at: Some("2026-07-10T00:00:00.000Z".into()),
        }
    }

    #[test]
    fn eligibility_binds_hash_purpose_liveness_and_single_use() {
        let now = "2026-07-10T00:01:00.000Z";
        assert!(eligible(
            &entry(MFA_PENDING_TOKEN_TYPE, "2026-07-10T00:02:00.000Z", None),
            "hash-1",
            now
        ));
        assert!(!eligible(
            &entry("password_reset", "2026-07-10T00:02:00.000Z", None),
            "hash-1",
            now
        ));
        assert!(!eligible(
            &entry(MFA_PENDING_TOKEN_TYPE, now, None),
            "hash-1",
            now
        ));
        assert!(!eligible(
            &entry(
                MFA_PENDING_TOKEN_TYPE,
                "2026-07-10T00:02:00.000Z",
                Some(now)
            ),
            "hash-1",
            now
        ));
    }

    #[test]
    fn stale_factor_revision_cannot_spend_a_code_on_a_distinct_challenge() {
        let pending = entry(MFA_PENDING_TOKEN_TYPE, "2099-07-10T00:02:00.000Z", None);
        let snapshot = serde_json::to_value(&pending).unwrap();
        db::test_support::with_db(
            move |operation, _, query| {
                if operation == "read" {
                    return Ok(
                        serde_json::json!({"entries":[{"entry_key":"pending-1","payload":snapshot,"version":"challenge-version"}]}),
                    );
                }
                assert_eq!(operation, "compare-and-set");
                let body = &query.filters[0].value;
                assert_eq!(body["conditions"][0]["contentModelId"], TOTP.model);
                assert_eq!(
                    body["conditions"][0]["expectedVersion"],
                    "factor-before-spend"
                );
                assert_eq!(
                    body["conditions"][1]["expectedVersion"],
                    "challenge-version"
                );
                assert_eq!(body["conditions"][2]["predicate"], "absent");
                assert_eq!(body["ops"].as_array().unwrap().len(), 3);
                Err(SeamError::DbConflict {
                    category: crate::host::DbConflictCategory::Precondition,
                    operation: "compare-and-set".into(),
                })
            },
            || {
                let condition = Condition::version(TOTP, "user-1", "factor-before-spend").unwrap();
                assert!(consume_with_factor_and_session(
                    &pending,
                    &factor(),
                    condition,
                    Condition::version(db::USERS, "user-1", "user-version").unwrap(),
                    &session(),
                    None,
                    "2026-07-10T00:01:00.000Z"
                )
                .is_err());
            },
        );
    }
    #[test]
    fn one_factor_snapshot_can_complete_only_one_pending_login() {
        use std::{cell::RefCell, collections::HashMap, rc::Rc};
        let pending = entry(MFA_PENDING_TOKEN_TYPE, "2099-07-10T00:02:00.000Z", None);
        let mut other = entry(MFA_PENDING_TOKEN_TYPE, "2099-07-10T00:02:00.000Z", None);
        other.id = "pending-2".into();
        let mut rows = HashMap::new();
        for proof in [&pending, &other] {
            rows.insert(
                (VERIFICATIONS.model.to_string(), proof.id.clone()),
                ("initial".to_string(), serde_json::to_value(proof).unwrap()),
            );
        }
        rows.insert(
            (TOTP.model.to_string(), "user-1".into()),
            ("initial".into(), serde_json::to_value(factor()).unwrap()),
        );
        rows.insert(
            (db::USERS.model.to_string(), "user-1".into()),
            ("initial".into(), serde_json::json!({})),
        );
        let rows = Rc::new(RefCell::new(rows));
        let host = rows.clone();
        db::test_support::with_db(
            move |operation, collection, query| {
                let mut rows = host.borrow_mut();
                if operation == "read" {
                    let key = &query.entry_keys[0];
                    let entries: Vec<_> = rows.get(&(collection.model.into(), key.clone())).map(|(version, payload)|
                    serde_json::json!({"entry_key":key,"version":version,"payload":payload})).into_iter().collect();
                    return Ok(serde_json::json!({"entries":entries}));
                }
                assert_eq!(operation, "compare-and-set");
                let body = &query.filters[0].value;
                for condition in body["conditions"].as_array().unwrap() {
                    let key = (
                        condition["contentModelId"].as_str().unwrap().to_string(),
                        condition["entryKey"].as_str().unwrap().to_string(),
                    );
                    let matches = match condition["predicate"].as_str().unwrap() {
                        "absent" => !rows.contains_key(&key),
                        "version" => rows
                            .get(&key)
                            .is_some_and(|(version, _)| condition["expectedVersion"] == *version),
                        _ => panic!("invalid condition"),
                    };
                    if !matches {
                        return Err(SeamError::DbConflict {
                            category: crate::host::DbConflictCategory::Precondition,
                            operation: "compare-and-set".into(),
                        });
                    }
                }
                let ops = body["ops"].as_array().unwrap();
                for op in ops {
                    let key = (
                        op["contentModelId"].as_str().unwrap().to_string(),
                        op["entryKey"].as_str().unwrap().to_string(),
                    );
                    match op["op"].as_str().unwrap() {
                        "delete" => {
                            rows.remove(&key);
                        }
                        "write" => {
                            rows.insert(key, ("changed".into(), op["data"].clone()));
                        }
                        _ => panic!("invalid operation"),
                    }
                }
                Ok(
                    serde_json::json!({"outcome":"applied","applied":ops.len(),"entries":[],"results":[],"replayed":false}),
                )
            },
            || {
                let revision = || Condition::version(TOTP, "user-1", "initial").unwrap();
                let now = "2026-07-10T00:01:00.000Z";
                assert!(consume_with_factor_and_session(
                    &pending,
                    &factor(),
                    revision(),
                    Condition::version(db::USERS, "user-1", "initial").unwrap(),
                    &session(),
                    None,
                    now
                )
                .unwrap());
                assert!(!consume_with_factor_and_session(
                    &pending,
                    &factor(),
                    revision(),
                    Condition::version(db::USERS, "user-1", "initial").unwrap(),
                    &session(),
                    None,
                    now
                )
                .unwrap());
                let mut second_session = session();
                second_session.id = "session-2".into();
                assert!(consume_with_factor_and_session(
                    &other,
                    &factor(),
                    revision(),
                    Condition::version(db::USERS, "user-1", "initial").unwrap(),
                    &second_session,
                    None,
                    now
                )
                .is_err());
                assert!(rows
                    .borrow()
                    .contains_key(&(VERIFICATIONS.model.into(), other.id.clone())));
                assert!(!rows
                    .borrow()
                    .contains_key(&(SESSIONS.model.into(), second_session.id)));
            },
        );
    }
}
