//! Versioned host transaction for disabling the invite-code gate.

use super::VersionedInviteCodeAccount;
use crate::host::db::{self, AtomicBatchOp, ConditionalBatchOp, ConditionalOperation};
use crate::host::{Result, SeamError};
use serde::Deserialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(super) enum GateReleaseOutcome {
    Released,
    AlreadyActivated,
}

/// Release an existing invite-gate account through the host CAS transaction.
/// The host must preserve any durable redemption receipt already on the row.
pub fn release_gate(account: &VersionedInviteCodeAccount) -> Result<()> {
    release_gate_with(account, db::batch_with_results).map(|_| ())
}

pub(super) fn release_gate_with<F>(
    account: &VersionedInviteCodeAccount,
    execute: F,
) -> Result<GateReleaseOutcome>
where
    F: FnOnce(&[AtomicBatchOp]) -> Result<db::AtomicBatchResult>,
{
    let params = serde_json::json!({
        "account": {
            "entryKey": account.entry_key,
            "expectedUpdatedAt": account.updated_at,
        },
    });
    let operation = ConditionalOperation::ReleaseInviteGate;
    let result = execute(&[ConditionalBatchOp::new(operation, params).into()])?;
    let output = result
        .results
        .first()
        .map(|item| &item.output)
        .ok_or_else(invalid_response)?;
    decode_gate_release_output(output, account)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct GateReleaseOutput {
    user_id: String,
    status: GateReleaseStatus,
    activated_at: String,
    redemption_id: Option<String>,
    invite_code_id: Option<String>,
}

#[derive(Clone, Copy, Deserialize)]
#[serde(rename_all = "kebab-case")]
enum GateReleaseStatus {
    Released,
    AlreadyActivated,
}

pub(super) fn decode_gate_release_output(
    output: &serde_json::Value,
    expected: &VersionedInviteCodeAccount,
) -> Result<GateReleaseOutcome> {
    require_exact_fields(output)?;
    let output: GateReleaseOutput =
        serde_json::from_value(output.clone()).map_err(|_| invalid_response())?;
    let receipt_matches = output.redemption_id == expected.value.redemption_id
        && output.invite_code_id == expected.value.invite_code_id;
    let status_matches = match output.status {
        GateReleaseStatus::Released => expected.value.activated_at.is_none(),
        GateReleaseStatus::AlreadyActivated => {
            expected.value.activated_at.as_deref() == Some(output.activated_at.as_str())
        }
    };
    let valid = status_matches
        && output.user_id == expected.value.user_id
        && receipt_matches
        && chrono::DateTime::parse_from_rfc3339(&output.activated_at).is_ok();
    if !valid {
        return Err(invalid_response());
    }
    Ok(match output.status {
        GateReleaseStatus::Released => GateReleaseOutcome::Released,
        GateReleaseStatus::AlreadyActivated => GateReleaseOutcome::AlreadyActivated,
    })
}

fn require_exact_fields(output: &serde_json::Value) -> Result<()> {
    let required = [
        "userId",
        "status",
        "activatedAt",
        "redemptionId",
        "inviteCodeId",
    ];
    let Some(fields) = output.as_object() else {
        return Err(invalid_response());
    };
    if fields.len() != required.len() || required.iter().any(|key| !fields.contains_key(*key)) {
        return Err(invalid_response());
    }
    Ok(())
}

fn invalid_response() -> SeamError {
    SeamError::Db("invite gate release returned an invalid response".to_string())
}

#[cfg(test)]
#[path = "gate_release_tests.rs"]
mod tests;
