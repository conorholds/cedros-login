//! Host-leased candidate selection and conditional outbox claim.
use super::state::{select_candidates, OutboxEntry, STATUS_PENDING, STATUS_SENDING};
use crate::host::db::{self, ConditionalBatchOp, ConditionalOperation, Query, OUTBOX};
use crate::host::{DbConflictCategory, Result, SeamError};
use serde_json::Value;

pub(super) const DELIVERY_LEASE_SECS: u32 = 300;

pub(super) struct ClaimedOutbox {
    pub entry: OutboxEntry,
    pub updated_at: String,
}

pub(super) fn find_candidates(now_iso: &str, limit: u32) -> Result<Vec<OutboxEntry>> {
    Ok(select_candidates(
        read_due(STATUS_PENDING, now_iso, limit)?,
        read_due(STATUS_SENDING, now_iso, limit)?,
        now_iso,
        limit,
    ))
}

fn read_due(status: &str, now_iso: &str, limit: u32) -> Result<Vec<OutboxEntry>> {
    let mut filters = vec![db::eq("status", status), db::lte("nextAttemptAt", now_iso)];
    if status == STATUS_SENDING {
        // Filter leases BEFORE limit; active first-page leases cannot hide due work.
        filters.push(db::lte("leaseExpiresAt", now_iso));
    }
    db::read_typed::<OutboxEntry>(
        OUTBOX,
        &Query {
            filters,
            order_by: Some(db::asc("nextAttemptAt")),
            limit: Some(limit),
            ..Default::default()
        },
    )
}

pub(super) fn claim(entry_key: &str, lease_owner: &str) -> Result<Option<ClaimedOutbox>> {
    let response = match db::batch_with_results(&[claim_op(entry_key, lease_owner).into()]) {
        Ok(response) => response,
        Err(error) if is_claim_contention(&error) => return Ok(None),
        Err(error) => return Err(error),
    };
    let output = &response
        .results
        .first()
        .ok_or_else(invalid_claim_response)?
        .output;
    decode_claim_output(output, entry_key, lease_owner).map(Some)
}

pub(super) fn decode_claim_output(
    output: &Value,
    entry_key: &str,
    lease_owner: &str,
) -> Result<ClaimedOutbox> {
    let payload = output.get("payload").ok_or_else(invalid_claim_response)?;
    let updated_at = output
        .get("updatedAt")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .ok_or_else(invalid_claim_response)?;
    decode_claimed_entry(payload, entry_key, lease_owner).map(|entry| ClaimedOutbox {
        entry,
        updated_at: updated_at.to_string(),
    })
}

pub(super) fn decode_claimed_entry(
    payload: &Value,
    entry_key: &str,
    lease_owner: &str,
) -> Result<OutboxEntry> {
    let entry: OutboxEntry =
        serde_json::from_value(payload.clone()).map_err(|_| invalid_claim_response())?;
    if entry.id != entry_key
        || entry.status != STATUS_SENDING
        || entry.lease_owner.as_deref() != Some(lease_owner)
        || entry.attempts == 0
    {
        return Err(invalid_claim_response());
    }
    Ok(entry)
}

pub(super) fn is_claim_contention(error: &SeamError) -> bool {
    matches!(
        error,
        SeamError::DbConflict {
            category: DbConflictCategory::Lease,
            operation,
        } if operation == ConditionalOperation::ClaimOutboxDelivery.id()
    )
}

pub(super) fn claim_op(entry_key: &str, lease_owner: &str) -> ConditionalBatchOp {
    ConditionalBatchOp::new(
        ConditionalOperation::ClaimOutboxDelivery,
        serde_json::json!({
            "entryKey": entry_key,
            "leaseOwner": lease_owner,
            "leaseSeconds": DELIVERY_LEASE_SECS,
        }),
    )
}

fn invalid_claim_response() -> SeamError {
    SeamError::Db("outbox claim returned an invalid response".into())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn sending_candidates_filter_expired_leases_before_paging() {
        crate::host::db::test_support::with_db(
            |op, _, query| {
                assert_eq!(op, "read");
                let query = serde_json::to_value(query).unwrap();
                assert_eq!(query["limit"], 50);
                assert_eq!(
                    query["filters"],
                    serde_json::json!([
                        {"field":"status", "op":"eq", "value":"sending"},
                        {"field":"nextAttemptAt", "op":"lte", "value":"now"},
                        {"field":"leaseExpiresAt", "op":"lte", "value":"now"}
                    ])
                );
                Ok(serde_json::json!({"entries": []}))
            },
            || {
                assert!(read_due(STATUS_SENDING, "now", 50).unwrap().is_empty());
            },
        );
    }
}
