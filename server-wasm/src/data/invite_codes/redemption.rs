//! Versioned invite-code reads and atomic redemption transaction.

use super::{
    InviteCode, InviteCodeAccount, RedemptionOutcome, VersionedInviteCode,
    VersionedInviteCodeAccount,
};
use crate::data::verifications::VersionedVerificationEntry;
use crate::host::db::{
    self, AtomicBatchOp, ConditionalBatchOp, ConditionalOperation, Query, INVITE_CODES,
    INVITE_CODE_ACCOUNTS,
};
use crate::host::{Result, SeamError};
use serde::Deserialize;

pub fn find_by_code_versioned(code: &str) -> Result<Vec<VersionedInviteCode>> {
    db::read_entries(
        INVITE_CODES,
        &Query {
            filters: vec![db::eq("code", code)],
            ..Default::default()
        },
    )?
    .into_iter()
    .map(versioned_code)
    .collect()
}

pub fn find_account_versioned(user_id: &str) -> Result<Option<VersionedInviteCodeAccount>> {
    db::read_entries(INVITE_CODE_ACCOUNTS, &Query::key(user_id))?
        .into_iter()
        .next()
        .map(versioned_account)
        .transpose()
}

pub fn redeem(
    verification: &VersionedVerificationEntry,
    code: &VersionedInviteCode,
    account: &VersionedInviteCodeAccount,
) -> Result<RedemptionOutcome> {
    if verification.value.user_id != account.value.user_id {
        return Err(SeamError::Db(
            "invite redemption proof does not match the gate account".into(),
        ));
    }
    let params = redemption_params(verification, code, account);
    let op = ConditionalBatchOp::new(ConditionalOperation::RedeemInviteCode, params);
    let result = db::batch_with_results(&[AtomicBatchOp::from(op)])?;
    let output = result
        .results
        .first()
        .map(|item| &item.output)
        .ok_or_else(invalid_response)?;
    decode_redemption_output(output, &verification.value.user_id)
}

pub(super) fn decode_redemption_output(
    output: &serde_json::Value,
    expected_user_id: &str,
) -> Result<RedemptionOutcome> {
    let user_matches =
        output.get("userId").and_then(serde_json::Value::as_str) == Some(expected_user_id);
    if !user_matches {
        return Err(invalid_response());
    }
    match output
        .get("alreadyApplied")
        .and_then(serde_json::Value::as_bool)
    {
        Some(false) => Ok(RedemptionOutcome::Applied),
        Some(true) => Ok(RedemptionOutcome::Replayed),
        None => Err(invalid_response()),
    }
}

pub(super) fn redemption_params(
    verification: &VersionedVerificationEntry,
    code: &VersionedInviteCode,
    account: &VersionedInviteCodeAccount,
) -> serde_json::Value {
    serde_json::json!({
        "redemptionId": verification.value.id,
        "verification": {
            "entryKey": verification.entry_key,
            "tokenHash": verification.value.token_hash,
            "allowedTokenTypes": ["invite_code_pending"],
        },
        "inviteCode": {
            "entryKey": code.entry_key,
            "expectedUpdatedAt": code.updated_at,
        },
        "account": {
            "entryKey": account.entry_key,
            "expectedUpdatedAt": account.updated_at,
        },
    })
}

fn versioned_code(row: db::Entry) -> Result<VersionedInviteCode> {
    let updated_at = revision(&row, "invite code")?;
    let value: InviteCode = decode(&row)?;
    if value.id != row.entry_key {
        return Err(identity_mismatch("invite code"));
    }
    Ok(VersionedInviteCode {
        value,
        entry_key: row.entry_key,
        updated_at,
    })
}

fn versioned_account(row: db::Entry) -> Result<VersionedInviteCodeAccount> {
    let updated_at = revision(&row, "invite account")?;
    let value: InviteCodeAccount = decode(&row)?;
    if value.user_id != row.entry_key {
        return Err(identity_mismatch("invite account"));
    }
    Ok(VersionedInviteCodeAccount {
        value,
        entry_key: row.entry_key,
        updated_at,
    })
}

fn revision(row: &db::Entry, kind: &str) -> Result<String> {
    row.updated_at
        .clone()
        .ok_or_else(|| SeamError::Db(format!("{kind} row is missing host revision metadata")))
}

fn decode<T: for<'de> Deserialize<'de>>(row: &db::Entry) -> Result<T> {
    serde_json::from_value(row.payload.clone())
        .map_err(|error| SeamError::Encoding(error.to_string()))
}

fn identity_mismatch(kind: &str) -> SeamError {
    SeamError::Db(format!("{kind} row identity does not match its entry key"))
}

fn invalid_response() -> SeamError {
    SeamError::Db("invite redemption returned an invalid response".to_string())
}
