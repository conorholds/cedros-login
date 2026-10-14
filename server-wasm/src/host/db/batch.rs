use super::db_err;
use crate::cedros::extension::database;
use crate::host::{Result, SeamError};
use serde::Serialize;
use serde_json::Value;

mod operation;
mod output_contract;
mod protocol;

pub use operation::ConditionalOperation;
#[cfg(test)]
pub use protocol::ConditionalBatchResult;
pub use protocol::{AtomicBatchOp, AtomicBatchResult, BatchOp, ConditionalBatchOp};

/// Apply write/delete operations atomically within one access grant.
pub fn batch(ops: &[BatchOp]) -> Result<u64> {
    let access = match ops.first() {
        Some(op) => op.access(),
        None => return Ok(0),
    };
    ensure_one_access(access, ops.iter().map(BatchOp::access))?;
    let raw = call_host_batch(access, ops)?;
    Ok(serde_json::from_str::<Value>(&raw)
        .map_err(|error| SeamError::Encoding(error.to_string()))?
        .get("applied")
        .and_then(Value::as_u64)
        .unwrap_or(0))
}

/// Apply ordinary and conditional operations in one host transaction.
pub fn batch_with_results(ops: &[AtomicBatchOp]) -> Result<AtomicBatchResult> {
    let access = match ops.first() {
        Some(op) => op.access(),
        None => return Ok(AtomicBatchResult::empty()),
    };
    ensure_one_access(access, ops.iter().map(AtomicBatchOp::access))?;
    let raw = call_host_batch(access, ops)?;
    decode_atomic_batch_response(&raw, ops)
}

fn ensure_one_access(access: &str, accesses: impl Iterator<Item = &'static str>) -> Result<()> {
    if accesses.into_iter().any(|candidate| candidate != access) {
        return Err(SeamError::Db(
            "atomic batch cannot span database access grants".into(),
        ));
    }
    Ok(())
}

fn call_host_batch(access: &str, ops: &(impl Serialize + ?Sized)) -> Result<String> {
    let body = serde_json::json!({ "ops": ops });
    database::batch(access, &body.to_string()).map_err(db_err)
}

fn decode_atomic_batch_response(raw: &str, ops: &[AtomicBatchOp]) -> Result<AtomicBatchResult> {
    const INVALID_RESPONSE: &str = "database batch returned an invalid response";
    let response = serde_json::from_str::<AtomicBatchResult>(raw)
        .map_err(|_| SeamError::Db(INVALID_RESPONSE.into()))?;
    let expected: Vec<ConditionalOperation> = ops
        .iter()
        .filter_map(AtomicBatchOp::conditional_operation)
        .collect();
    let invalid = response.applied != ops.len() as u64
        || response.results.len() != expected.len()
        || response
            .results
            .iter()
            .zip(expected)
            .any(|(result, operation)| {
                result.operation_id != operation.id()
                    || !output_contract::is_valid(operation, &result.output)
            });
    if invalid {
        return Err(SeamError::Db(INVALID_RESPONSE.into()));
    }
    Ok(response)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::host::db::{ORGS, SESSIONS, USERS};

    #[test]
    fn data_ops_use_camelcase_and_omit_access() {
        let write = BatchOp::write(SESSIONS, "s1", serde_json::json!({"id":"s1"}));
        let delete = BatchOp::delete(ORGS, "o2");
        let write_json = serde_json::to_value(&write).unwrap();
        let delete_json = serde_json::to_value(&delete).unwrap();
        assert_eq!(write_json["contentModelId"], SESSIONS.model);
        assert!(write_json.get("access").is_none());
        assert_eq!(delete_json["op"], "delete");
        assert!(delete_json.get("data").is_none());
    }

    #[test]
    fn conditional_ops_include_the_host_batch_decoder_model_field() {
        let op = ConditionalBatchOp::new(
            ConditionalOperation::ClaimFirstAdmin,
            serde_json::json!({"user": {}, "email": {}}),
        );

        let json = serde_json::to_value(op).unwrap();
        assert_eq!(json["op"], "conditional");
        assert_eq!(json["contentModelId"], "");
        assert_eq!(json["operationId"], "identity.setup.claim-first-admin");
        assert!(json.get("access").is_none());
    }

    #[test]
    fn rejects_cross_access_batch_before_host_call() {
        let ops = [
            BatchOp::write(USERS, "u1", serde_json::json!({"id":"u1"})),
            BatchOp::delete(ORGS, "o1"),
        ];
        assert!(
            matches!(batch(&ops), Err(SeamError::Db(message)) if message.contains("cannot span"))
        );
    }

    #[test]
    fn validates_ordered_conditional_results() {
        let ops = vec![
            ConditionalBatchOp::new(
                ConditionalOperation::ClaimOutboxDelivery,
                serde_json::json!({"entryKey": "o1", "leaseOwner": "w1"}),
            )
            .into(),
            BatchOp::write(SESSIONS, "s1", serde_json::json!({"id": "s1"})).into(),
        ];
        let raw = r#"{"applied":2,"results":[{"operationId":"identity.outbox.claim-delivery","output":{"payload":{"status":"sending"},"updatedAt":"2026-07-10T00:00:00Z"}}]}"#;
        let response = decode_atomic_batch_response(raw, &ops).unwrap();
        assert_eq!(response.results[0].output["payload"]["status"], "sending");
    }

    #[test]
    fn rejects_malformed_responses_without_echoing_host_payload() {
        let ops = vec![ConditionalBatchOp::new(
            ConditionalOperation::ClaimFirstAdmin,
            serde_json::json!({}),
        )
        .into()];
        for raw in [
            r#"{"applied":0,"results":[]}"#,
            r#"{"applied":1,"results":[]}"#,
            r#"{"applied":1,"results":[{"operationId":"private@example.com"}]}"#,
            r#"{"applied":"private@example.com"}"#,
        ] {
            assert!(matches!(
                decode_atomic_batch_response(raw, &ops),
                Err(SeamError::Db(message)) if message == "database batch returned an invalid response"
            ));
        }
    }
}
