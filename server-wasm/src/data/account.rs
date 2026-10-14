//! Atomic account deletion through the host's cross-collection lifecycle seam.
//! The host serializes the full identity/org graph, preserves owner/admin
//! invariants, and either commits the whole purge or changes nothing.
use crate::data::users::{self, VersionedUserEntry};
use crate::data::verifications::VersionedVerificationEntry;
use crate::host::db::{self, ConditionalBatchOp, ConditionalOperation};
use crate::host::{Result, SeamError};
use serde::Deserialize;

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AccountDeletionOutcome {
    pub status: String,
    pub detached_memberships: u64,
    pub transferred_organizations: u64,
    pub deleted_organizations: u64,
    pub tombstone_generation: String,
}

/// Delete an account in one host transaction. Email-link confirmation supplies
/// its live proof; authenticated/admin deletion omits it.
pub fn purge_user(
    user_id: &str,
    verification: Option<&VersionedVerificationEntry>,
) -> Result<AccountDeletionOutcome> {
    let user = users::find_by_id_versioned(user_id)?
        .ok_or_else(|| SeamError::Db("account deletion target does not exist".into()))?;
    validate_proof(&user, verification)?;
    let operation = deletion_operation(&user, verification);
    let identities = crate::data::sso_identities::find_by_user(user_id)?;
    let mut operations = vec![operation.into()];
    operations.extend(
        crate::data::sso_identities::account_deletion_operations(&identities)
            .into_iter()
            .map(Into::into),
    );
    let response = db::batch_with_results(&operations)?;
    let output = response
        .results
        .first()
        .map(|result| result.output.clone())
        .ok_or_else(invalid_deletion_response)?;
    let outcome: AccountDeletionOutcome =
        serde_json::from_value(output).map_err(|_| invalid_deletion_response())?;
    if outcome.status != "deleted" || outcome.tombstone_generation.is_empty() {
        return Err(invalid_deletion_response());
    }
    Ok(outcome)
}

fn validate_proof(
    user: &VersionedUserEntry,
    verification: Option<&VersionedVerificationEntry>,
) -> Result<()> {
    if verification.is_some_and(|proof| {
        proof.value.user_id != user.value.id || proof.value.token_type != "account_deletion"
    }) {
        return Err(SeamError::Db(
            "account deletion proof does not match the target".into(),
        ));
    }
    Ok(())
}

fn deletion_operation(
    user: &VersionedUserEntry,
    verification: Option<&VersionedVerificationEntry>,
) -> ConditionalBatchOp {
    let mut params = serde_json::json!({
        "userId": user.entry_key,
        "expectedUpdatedAt": user.updated_at,
    });
    if let Some(proof) = verification {
        params["verification"] = serde_json::json!({
            "entryKey": proof.entry_key,
            "tokenHash": proof.value.token_hash,
        });
    }
    ConditionalBatchOp::new(ConditionalOperation::DeleteAccount, params)
}

fn invalid_deletion_response() -> SeamError {
    SeamError::Db("account deletion returned an invalid response".into())
}

#[cfg(test)]
#[path = "account_tests.rs"]
mod tests;
