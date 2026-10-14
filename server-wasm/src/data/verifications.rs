//! Email-verification / password-reset / instant-link tokens over the host DB
//! seam (`cedros-login:verifications`), keyed by token id. Verification flows
//! present the token hash, so a secondary lookup by `tokenHash` is provided.
use crate::host::db::{
    self, AtomicBatchResult, BatchOp, ConditionalBatchOp, ConditionalOperation, Query,
    VERIFICATIONS,
};
use crate::host::{Result, SeamError};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct VerificationEntry {
    pub id: String,
    pub user_id: String,
    pub token_hash: String,
    /// email_verification | password_reset | instant_link (mirrors server TokenType).
    pub token_type: String,
    /// Email address this token proves control of for email-verification flows.
    /// ALWAYS serialized (emit `null` when absent): email_verification rows set
    /// it, fixing the host content-model schema, so MFA/invite-pending tokens
    /// that omit it are rejected at the seam (`db_error`). Never skip a field
    /// that any flow populates.
    #[serde(default)]
    pub target_email: Option<String>,
    /// Optional row/resource id this token is bound to.
    /// ALWAYS serialized (emit `null` when absent): the account-email flow sets
    /// this to the user-email row id. The host seam follows a
    /// schema-on-first-write rule; once any row has `subjectId`, later token
    /// writes that omit it are rejected. Optional persistence fields stay
    /// present as `null`, never skipped.
    #[serde(default)]
    pub subject_id: Option<String>,
    pub created_at: String,
    pub expires_at: String,
    pub used_at: Option<String>,
}

/// Verification payload plus the host row revision required by composite
/// account-lifecycle transactions.
pub struct VersionedVerificationEntry {
    pub value: VerificationEntry,
    pub entry_key: String,
}

pub fn create(token: &VerificationEntry) -> Result<()> {
    db::write(VERIFICATIONS, &token.id, token)
}

pub fn write_operation(token: &VerificationEntry) -> Result<BatchOp> {
    Ok(BatchOp::write(
        VERIFICATIONS,
        &token.id,
        serde_json::to_value(token).map_err(|error| SeamError::Encoding(error.to_string()))?,
    ))
}

pub fn find_by_id(id: &str) -> Result<Option<VerificationEntry>> {
    db::find_one(VERIFICATIONS, &Query::key(id))
}

pub fn find_by_token_hash(token_hash: &str) -> Result<Option<VerificationEntry>> {
    db::find_one(
        VERIFICATIONS,
        &Query {
            filters: vec![db::eq("tokenHash", token_hash)],
            limit: Some(1),
            ..Default::default()
        },
    )
}

pub fn find_by_token_hash_versioned(
    token_hash: &str,
) -> Result<Option<VersionedVerificationEntry>> {
    db::read_entries(
        VERIFICATIONS,
        &Query {
            filters: vec![db::eq("tokenHash", token_hash)],
            limit: Some(1),
            ..Default::default()
        },
    )?
    .into_iter()
    .next()
    .map(versioned)
    .transpose()
}

fn versioned(entry: db::Entry) -> Result<VersionedVerificationEntry> {
    entry.updated_at.ok_or_else(|| {
        SeamError::Db("verification row is missing host revision metadata".into())
    })?;
    let value: VerificationEntry = serde_json::from_value(entry.payload)
        .map_err(|error| SeamError::Encoding(error.to_string()))?;
    if value.id != entry.entry_key {
        return Err(SeamError::Db(
            "verification row identity does not match its entry key".into(),
        ));
    }
    Ok(VersionedVerificationEntry {
        value,
        entry_key: entry.entry_key,
    })
}

/// Build the host-owned, purpose-bound single-use claim for `token`.
///
/// Callers may compose this operation with related identity writes in one
/// [`db::batch_with_results`] transaction. The host re-checks hash, purpose,
/// expiry, and unused state under a row lock; guest-side reads are never the
/// authority for consumption.
pub fn consume_operation(
    token: &VerificationEntry,
    allowed_token_types: &[&str],
) -> ConditionalBatchOp {
    ConditionalBatchOp::new(
        ConditionalOperation::ConsumeLivePurposeBoundVerification,
        consume_params(token, allowed_token_types),
    )
}

pub fn consumed_payload(
    result: &AtomicBatchResult,
    expected: &VerificationEntry,
    allowed_token_types: &[&str],
) -> Result<VerificationEntry> {
    let payload = result
        .results
        .first()
        .and_then(|item| item.output.get("payload"))
        .cloned()
        .ok_or_else(invalid_claim_response)?;
    let claimed: VerificationEntry =
        serde_json::from_value(payload).map_err(|_| invalid_claim_response())?;
    let valid = claimed.id == expected.id
        && claimed.token_hash == expected.token_hash
        && claimed.used_at.is_none()
        && allowed_token_types
            .iter()
            .any(|allowed| claimed.token_type == *allowed);
    if !valid {
        return Err(invalid_claim_response());
    }
    Ok(claimed)
}

/// Validate a required constant status in the first conditional result.
pub fn require_result_status(result: &AtomicBatchResult, expected: &str) -> Result<()> {
    let status = result
        .results
        .first()
        .and_then(|item| item.output.get("status"))
        .and_then(serde_json::Value::as_str);
    if status == Some(expected) {
        Ok(())
    } else {
        Err(invalid_claim_response())
    }
}

/// Read a required boolean from the first conditional result.
pub fn require_result_bool(result: &AtomicBatchResult, field: &str) -> Result<bool> {
    result
        .results
        .first()
        .and_then(|item| item.output.get(field))
        .and_then(serde_json::Value::as_bool)
        .ok_or_else(invalid_claim_response)
}

fn consume_params(token: &VerificationEntry, allowed_token_types: &[&str]) -> serde_json::Value {
    serde_json::json!({
        "entryKey": token.id,
        "tokenHash": token.token_hash,
        "allowedTokenTypes": allowed_token_types,
        "consume": "delete",
    })
}

fn invalid_claim_response() -> SeamError {
    SeamError::Db("verification claim returned an invalid response".to_string())
}

pub fn sweep_expired(now_iso: &str, page: u32) -> Result<u64> {
    db::sweep_expired(VERIFICATIONS, "expiresAt", now_iso, page)
}

/// Whether a token of `token_type` was issued for `user_id` at/after `since_iso`.
/// Backs a per-user email-send cooldown (anti-abuse + provider-cost control on
/// /forgot-password, /send-verification, /instant-link).
pub fn issued_since(user_id: &str, token_type: &str, since_iso: &str) -> Result<bool> {
    let count = db::count(
        VERIFICATIONS,
        &Query {
            filters: vec![
                db::eq("userId", user_id),
                db::eq("tokenType", token_type),
                db::gt("createdAt", since_iso),
            ],
            ..Default::default()
        },
    )?;
    Ok(count > 0)
}

#[cfg(test)]
#[path = "verifications_tests.rs"]
mod tests;
