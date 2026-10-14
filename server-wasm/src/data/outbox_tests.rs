use super::claim::{
    claim_op, decode_claim_output, decode_claimed_entry, is_claim_contention, ClaimedOutbox,
    DELIVERY_LEASE_SECS,
};
use super::delivery::delivery_id;
use super::state::{backoff_secs, select_candidates, STATUS_SENDING};
use super::transition::{complete_op, release_op};
use super::*;
use crate::host::db::ConditionalOperation;
use crate::host::{DbConflictCategory, SeamError};
use serde_json::Value;

const T0: &str = "2026-07-10T12:00:00Z";
const T1: &str = "2026-07-10T12:05:00Z";

#[test]
fn legacy_row_defaults_lease_fields_and_round_trips() {
    let value = legacy_row();
    let entry: OutboxEntry = serde_json::from_value(value).unwrap();
    assert_eq!(entry.user_id, None);
    assert_eq!(entry.lease_owner, None);
    assert_eq!(entry.lease_expires_at, None);
    let encoded = serde_json::to_value(entry).unwrap();
    assert!(encoded["leaseOwner"].is_null());
    assert!(encoded["leaseExpiresAt"].is_null());
}

#[test]
fn account_owned_row_serializes_user_link_for_atomic_deletion() {
    let entry = new_entry(
        Some("u1"),
        "user@example.test",
        "Welcome",
        None,
        Some("Welcome"),
        "out-1".into(),
        T0.into(),
    );
    let encoded = serde_json::to_value(entry).unwrap();
    assert_eq!(encoded["userId"], "u1");
}

#[test]
fn required_email_batches_token_and_user_owned_outbox_row() {
    let token = crate::data::verifications::VerificationEntry {
        id: "00000000-0000-4000-8000-000000000011".into(),
        user_id: "u1".into(),
        token_hash: "hash".into(),
        token_type: "password_reset".into(),
        target_email: Some("user@example.test".into()),
        subject_id: None,
        created_at: T0.into(),
        expires_at: T1.into(),
        used_at: None,
    };
    let email = new_entry(
        Some("u1"),
        "user@example.test",
        "Reset",
        Some("<p>Reset link</p>"),
        Some("Reset link"),
        "00000000-0000-4000-8000-000000000012".into(),
        T0.into(),
    );

    let wire = serde_json::to_value(token_email_ops(&token, &email).unwrap()).unwrap();
    assert_eq!(wire.as_array().unwrap().len(), 1);
    assert_eq!(
        wire[0]["operationId"],
        "identity.outbox.enqueue-token-email"
    );
    assert_eq!(
        wire[0]["params"]["verification"]["data"]["tokenType"],
        "password_reset"
    );
    assert_eq!(wire[0]["params"]["outbox"]["data"]["userId"], "u1");
    assert_eq!(
        wire[0]["params"]["outbox"]["data"]["status"],
        STATUS_PENDING
    );
}

#[test]
fn token_email_batch_preserves_authoritative_recipient_binding() {
    let token = crate::data::verifications::VerificationEntry {
        id: "00000000-0000-4000-8000-000000000021".into(),
        user_id: "u1".into(),
        token_hash: "hash".into(),
        token_type: "instant_link".into(),
        target_email: Some("user@example.test".into()),
        subject_id: None,
        created_at: T0.into(),
        expires_at: T1.into(),
        used_at: None,
    };
    let email = new_entry(
        Some("u1"),
        "user@example.test",
        "Sign in",
        Some("<p>Sign in</p>"),
        Some("Sign in"),
        "00000000-0000-4000-8000-000000000022".into(),
        T0.into(),
    );

    let wire = serde_json::to_value(token_email_ops(&token, &email).unwrap()).unwrap();
    assert_eq!(
        wire[0]["params"]["verification"]["data"]["targetEmail"],
        wire[0]["params"]["outbox"]["data"]["to"]
    );
}

#[test]
fn claimed_row_round_trips_typed_lease_and_future_host_fields() {
    let mut value = legacy_row();
    value["status"] = Value::String(STATUS_SENDING.into());
    value["attempts"] = Value::from(1);
    value["leaseOwner"] = Value::String("worker-a".into());
    value["leaseExpiresAt"] = Value::String(T1.into());
    value["futureHostField"] = serde_json::json!({"revision": 7});
    value["essentialEmailEvidence"] = serde_json::json!({"version": 1, "reference": "receipt"});

    let entry = decode_claimed_entry(&value, "out-1", "worker-a").unwrap();
    let encoded = serde_json::to_value(entry).unwrap();
    assert_eq!(encoded["leaseOwner"], "worker-a");
    assert_eq!(encoded["leaseExpiresAt"], T1);
    assert_eq!(encoded["futureHostField"]["revision"], 7);
    assert_eq!(encoded["essentialEmailEvidence"]["reference"], "receipt");
}

#[test]
fn claim_requires_returned_key_owner_status_and_incremented_attempt() {
    let base = claimed_row("worker-a", 1);
    assert!(decode_claimed_entry(&base, "out-1", "worker-a").is_ok());
    assert!(decode_claimed_entry(&base, "other", "worker-a").is_err());
    assert!(decode_claimed_entry(&base, "out-1", "worker-b").is_err());

    let mut pending = base.clone();
    pending["status"] = Value::String(STATUS_PENDING.into());
    assert!(decode_claimed_entry(&pending, "out-1", "worker-a").is_err());
    let mut unincremented = base;
    unincremented["attempts"] = Value::from(0);
    assert!(decode_claimed_entry(&unincremented, "out-1", "worker-a").is_err());
}

#[test]
fn claim_requires_host_revision_for_safe_terminal_transition() {
    let payload = claimed_row("worker-a", 1);
    let output = serde_json::json!({"payload": payload, "updatedAt": T1});
    let claimed = decode_claim_output(&output, "out-1", "worker-a").unwrap();
    assert_eq!(claimed.updated_at, T1);

    let missing_revision = serde_json::json!({"payload": claimed_row("worker-a", 1)});
    assert!(decode_claim_output(&missing_revision, "out-1", "worker-a").is_err());
}

#[test]
fn terminal_transition_ops_bind_lease_owner_revision_and_delivery_identity() {
    let claimed = claimed("worker-a", 2);
    let complete = serde_json::to_value(complete_op(
        &claimed,
        T1,
        Some("provider-message-reference"),
    ))
    .unwrap();
    assert_eq!(complete["operationId"], "identity.outbox.complete-delivery");
    assert_eq!(complete["params"]["leaseOwner"], "worker-a");
    assert_eq!(complete["params"]["expectedUpdatedAt"], T1);
    assert_eq!(complete["params"]["deliveryId"], delivery_id("out-1"));

    let release = serde_json::to_value(release_op(
        &claimed,
        STATUS_PENDING,
        "2026-07-10T12:07:00Z",
        "provider_unavailable",
    ))
    .unwrap();
    assert_eq!(release["operationId"], "identity.outbox.release-delivery");
    assert_eq!(release["params"]["leaseOwner"], "worker-a");
    assert_eq!(release["params"]["expectedUpdatedAt"], T1);
    assert_eq!(release["params"]["status"], STATUS_PENDING);
}

#[test]
fn two_workers_build_same_row_claim_with_distinct_lease_owners() {
    let first = serde_json::to_value(claim_op("out-1", "worker-a")).unwrap();
    let second = serde_json::to_value(claim_op("out-1", "worker-b")).unwrap();
    assert_eq!(first["operationId"], "identity.outbox.claim-delivery");
    assert_eq!(first["params"]["entryKey"], second["params"]["entryKey"]);
    assert_ne!(
        first["params"]["leaseOwner"],
        second["params"]["leaseOwner"]
    );
    assert_eq!(first["params"]["leaseSeconds"], DELIVERY_LEASE_SECS);
}

#[test]
fn only_exact_claim_lease_conflict_is_a_benign_race() {
    let claim = SeamError::DbConflict {
        category: DbConflictCategory::Lease,
        operation: ConditionalOperation::ClaimOutboxDelivery.id().into(),
    };
    let stale = SeamError::DbConflict {
        category: DbConflictCategory::Precondition,
        operation: ConditionalOperation::ClaimOutboxDelivery.id().into(),
    };
    assert!(is_claim_contention(&claim));
    assert!(!is_claim_contention(&stale));
    assert!(!is_claim_contention(&SeamError::Db(
        "host unavailable".into()
    )));
}

#[test]
fn expired_sending_lease_is_reclaim_candidate_but_active_lease_is_not() {
    let mut pending: OutboxEntry = serde_json::from_value(legacy_row()).unwrap();
    pending.id = "pending-1".into();
    let expired: OutboxEntry = serde_json::from_value(claimed_row("worker-a", 1)).unwrap();
    let mut active = expired.clone();
    active.id = "out-2".into();
    active.lease_expires_at = Some("2026-07-10T12:10:00Z".into());

    let selected = select_candidates(vec![pending], vec![expired, active], T1, 10);
    assert_eq!(
        selected
            .iter()
            .map(|entry| entry.id.as_str())
            .collect::<Vec<_>>(),
        vec!["out-1", "pending-1"]
    );
}

#[test]
fn backoff_grows_then_caps_and_delivery_identity_is_stable() {
    assert_eq!(backoff_secs(1), 60);
    assert_eq!(backoff_secs(2), 120);
    assert_eq!(backoff_secs(3), 240);
    assert_eq!(backoff_secs(30), BACKOFF_CAP_SECS);
    assert_eq!(
        delivery_id("018f94eb-6d42-7a4e-bf3a-221fac6a9d12"),
        "cedros-login-outbox-018f94eb-6d42-7a4e-bf3a-221fac6a9d12"
    );
}

#[test]
fn immediate_dispatch_claims_only_the_requested_durable_entry() {
    let stats = dispatch_one_with(
        "out-1",
        T0,
        "worker-immediate",
        |entry_id, worker| {
            assert_eq!(entry_id, "out-1");
            assert_eq!(worker, "worker-immediate");
            Ok(Some(claimed(worker, 1)))
        },
        |entry, now, stats| {
            assert_eq!(entry.entry.id, "out-1");
            assert_eq!(now, T0);
            stats.sent += 1;
        },
    )
    .unwrap();

    assert_eq!(stats.sent, 1);
    assert_eq!(stats.retried, 0);
}

#[test]
fn immediate_dispatch_preserves_claim_failures_for_scheduled_retry() {
    let error = dispatch_one_with(
        "out-1",
        T0,
        "worker-immediate",
        |_, _| Err(SeamError::Db("host unavailable".into())),
        |_, _, _| panic!("a failed claim must not attempt provider delivery"),
    )
    .unwrap_err();

    assert_eq!(error.code(), "db_error");
}

fn legacy_row() -> Value {
    serde_json::json!({
        "id": "out-1", "userId": null, "to": "user@example.test", "subject": "Welcome",
        "htmlBody": null, "textBody": "Welcome", "status": STATUS_PENDING,
        "attempts": 0, "maxAttempts": 5, "createdAt": T0,
        "nextAttemptAt": T0, "lastError": null,
    })
}

fn claimed_row(owner: &str, attempts: u32) -> Value {
    let mut value = legacy_row();
    value["status"] = Value::String(STATUS_SENDING.into());
    value["attempts"] = Value::from(attempts);
    value["leaseOwner"] = Value::String(owner.into());
    value["leaseExpiresAt"] = Value::String(T0.into());
    value
}

fn claimed(owner: &str, attempts: u32) -> ClaimedOutbox {
    ClaimedOutbox {
        entry: serde_json::from_value(claimed_row(owner, attempts)).unwrap(),
        updated_at: T1.into(),
    }
}
