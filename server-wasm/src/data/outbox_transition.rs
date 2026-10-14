//! Lease-owner and host-revision checked terminal outbox transitions.
use super::claim::ClaimedOutbox;
use super::state::{OutboxEntry, STATUS_FAILED, STATUS_PENDING};
use crate::host::db::{self, ConditionalBatchOp, ConditionalOperation};
use crate::host::providers::EmailAcceptance;
use crate::host::{Result, SeamError};
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CompletionOutcome {
    status: String,
    #[serde(default)]
    already_applied: bool,
}

pub(super) fn complete(
    claimed: &ClaimedOutbox,
    accepted_at: &str,
    acceptance: &EmailAcceptance,
) -> Result<bool> {
    lease_owner(&claimed.entry)?;
    let response = db::batch_with_results(&[complete_op(
        claimed,
        accepted_at,
        acceptance.provider_message_ref.as_deref(),
    )
    .into()])?;
    let outcome: CompletionOutcome = decode_output(&response)?;
    if outcome.status != "completed" {
        return Err(invalid_transition_response());
    }
    Ok(outcome.already_applied)
}

pub(super) fn complete_op(
    claimed: &ClaimedOutbox,
    accepted_at: &str,
    provider_message_ref: Option<&str>,
) -> ConditionalBatchOp {
    let entry = &claimed.entry;
    ConditionalBatchOp::new(
        ConditionalOperation::CompleteOutboxDelivery,
        serde_json::json!({
            "entryKey": entry.id,
            "leaseOwner": claimed.entry.lease_owner,
            "expectedUpdatedAt": claimed.updated_at,
            "deliveryId": delivery_id(&entry.id),
            "providerAcceptedAt": accepted_at,
            "providerMessageRef": provider_message_ref,
        }),
    )
}

pub(super) fn release(
    claimed: &ClaimedOutbox,
    status: &str,
    next_attempt_at: &str,
    last_error_code: &str,
) -> Result<OutboxEntry> {
    if !matches!(status, STATUS_PENDING | STATUS_FAILED) {
        return Err(invalid_transition_response());
    }
    let entry = &claimed.entry;
    lease_owner(entry)?;
    let response =
        db::batch_with_results(&[
            release_op(claimed, status, next_attempt_at, last_error_code).into(),
        ])?;
    let output = response
        .results
        .first()
        .map(|result| &result.output)
        .ok_or_else(invalid_transition_response)?;
    let payload = output
        .get("payload")
        .ok_or_else(invalid_transition_response)?;
    let released: OutboxEntry =
        serde_json::from_value(payload.clone()).map_err(|_| invalid_transition_response())?;
    if released.id != entry.id
        || released.status != status
        || released.lease_owner.is_some()
        || released.lease_expires_at.is_some()
    {
        return Err(invalid_transition_response());
    }
    Ok(released)
}

pub(super) fn release_op(
    claimed: &ClaimedOutbox,
    status: &str,
    next_attempt_at: &str,
    last_error_code: &str,
) -> ConditionalBatchOp {
    ConditionalBatchOp::new(
        ConditionalOperation::ReleaseOutboxDelivery,
        serde_json::json!({
            "entryKey": claimed.entry.id,
            "leaseOwner": claimed.entry.lease_owner,
            "expectedUpdatedAt": claimed.updated_at,
            "status": status,
            "nextAttemptAt": next_attempt_at,
            "lastErrorCode": last_error_code,
        }),
    )
}

fn lease_owner(entry: &OutboxEntry) -> Result<&str> {
    entry
        .lease_owner
        .as_deref()
        .filter(|value| !value.is_empty())
        .ok_or_else(invalid_transition_response)
}

fn decode_output<T: for<'de> Deserialize<'de>>(response: &db::AtomicBatchResult) -> Result<T> {
    let output = response
        .results
        .first()
        .map(|result| result.output.clone())
        .ok_or_else(invalid_transition_response)?;
    serde_json::from_value(output).map_err(|_| invalid_transition_response())
}

fn delivery_id(entry_key: &str) -> String {
    format!("cedros-login-outbox-{entry_key}")
}

fn invalid_transition_response() -> SeamError {
    SeamError::Db("outbox transition returned an invalid response".into())
}
