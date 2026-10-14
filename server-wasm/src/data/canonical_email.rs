//! Atomic canonical-email transitions over the shared identity access grant.

use crate::clock;
use crate::data::user_emails::UserEmailEntry;
use crate::data::users::{self, UserEntry};
use crate::data::verifications::{self, VerificationEntry};
use crate::host::db::{
    self, AtomicBatchOp, BatchOp, ConditionalBatchOp, ConditionalOperation, CREDENTIALS, TOTP,
};
use crate::host::{Result, SeamError};
use crate::services::email::normalize_email;

#[path = "canonical_email/invariants.rs"]
mod invariants;
#[path = "canonical_email/transition.rs"]
mod transition;
#[path = "canonical_email/verification.rs"]
mod verification;

use invariants::{checked_primary, ensure_available, ensure_target_unique};
#[cfg(test)]
use transition::Snapshot;
use transition::{plan_transition, planned, snapshot, write_transition};
#[cfg(test)]
use verification::{canonical_target, plan_account_verification};
use verification::{verify_account_email, verify_canonical};

const EMAIL_VERIFICATION: &str = "email_verification";
const ACCOUNT_EMAIL_VERIFY: &str = "account_email_verify";

pub enum VerificationOutcome {
    Canonical {
        user_id: String,
        email_changed: bool,
        credentials_reset: bool,
        completed_initial_verification: bool,
    },
    AccountEmail,
}

#[derive(Debug)]
pub enum VerificationError {
    Invalid,
    Storage(SeamError),
}

impl From<SeamError> for VerificationError {
    fn from(error: SeamError) -> Self {
        Self::Storage(error)
    }
}

/// Atomically claims the purpose-bound token and applies an exact-version
/// canonical-email transition in one host transaction.
pub fn verify_token(
    token: VerificationEntry,
    expected_types: &[&str],
    now: &str,
) -> std::result::Result<VerificationOutcome, VerificationError> {
    if token.used_at.is_some()
        || token.expires_at.as_str() <= now
        || !expected_types.iter().any(|kind| token.token_type == *kind)
    {
        return Err(VerificationError::Invalid);
    }
    let outcome = match token.token_type.as_str() {
        EMAIL_VERIFICATION => verify_canonical(&token)?,
        ACCOUNT_EMAIL_VERIFY => verify_account_email(&token)?,
        _ => return Err(VerificationError::Invalid),
    };
    let credential_ids = if outcome.resets_unverified_credentials() {
        crate::data::credentials::find_by_user(&token.user_id)?
            .into_iter()
            .map(|credential| credential.id)
            .collect()
    } else {
        Vec::new()
    };
    let sso_identities = if outcome.resets_unverified_credentials() {
        crate::data::sso_identities::find_by_user(&token.user_id)?
    } else {
        Vec::new()
    };
    let secondary_email_ids = if outcome.resets_unverified_credentials() {
        outcome.secondary_email_ids()
    } else {
        Vec::new()
    };
    let mut ops = verification_operations(
        &token,
        expected_types,
        &outcome,
        &credential_ids,
        &sso_identities,
        &secondary_email_ids,
    )?;
    if outcome.resets_unverified_credentials() {
        ops.extend(
            crate::data::api_keys::delete_operations(&token.user_id)?
                .into_iter()
                .map(Into::into),
        );
    }
    let result = db::batch_with_results(&ops)?;
    verifications::consumed_payload(&result, &token, expected_types)?;
    Ok(outcome.public)
}

fn verification_operations(
    token: &VerificationEntry,
    expected_types: &[&str],
    outcome: &transition::PlannedVerification,
    credential_ids: &[String],
    sso_identities: &[crate::data::sso_identities::SsoIdentityEntry],
    secondary_email_ids: &[String],
) -> Result<Vec<AtomicBatchOp>> {
    let mut ops = vec![
        AtomicBatchOp::from(verifications::consume_operation(token, expected_types)),
        AtomicBatchOp::from(outcome.operation()?),
    ];
    if outcome.resets_unverified_credentials() {
        for credential_id in credential_ids {
            ops.push(BatchOp::delete(CREDENTIALS, credential_id).into());
        }
        ops.extend(
            crate::data::sso_identities::delete_operations(sso_identities)
                .into_iter()
                .map(Into::into),
        );
        for email_id in secondary_email_ids {
            ops.push(BatchOp::delete(db::USER_EMAILS, email_id).into());
        }
        ops.push(BatchOp::delete(TOTP, &token.user_id).into());
    }
    if outcome.revokes_sessions() {
        ops.push(
            ConditionalBatchOp::new(
                ConditionalOperation::RevokeSessions,
                serde_json::json!({
                    "userId": token.user_id,
                    "reason": if outcome.resets_unverified_credentials() {
                        "email_ownership_claim"
                    } else {
                        "email_credential_change"
                    },
                }),
            )
            .into(),
        );
    }
    Ok(ops)
}

pub fn admin_update(
    user_id: &str,
    name: Option<Option<String>>,
    email: Option<String>,
    email_verified: Option<bool>,
) -> Result<Option<UserEntry>> {
    let Some(state) = snapshot(user_id)? else {
        return Ok(None);
    };
    let mut user = state.user.value.clone();
    if email.is_none() && email_verified.is_none() {
        if let Some(name) = name {
            user.name = name;
            user.updated_at = clock::now_iso();
            users::update_if_current(&state.user.value, &user)?;
        }
        return Ok(Some(user));
    }

    let rows: Vec<_> = state.rows.iter().map(|row| row.value.clone()).collect();
    checked_primary(&user, &rows)?;
    let target = email
        .or_else(|| user.email.clone())
        .ok_or_else(|| SeamError::Db("canonical email is missing".into()))?;
    ensure_target_unique(&rows, &target)?;
    ensure_available(&user, &target)?;
    let verified = email_verified.unwrap_or_else(|| {
        rows.iter()
            .find(|row| row.email == target)
            .is_some_and(UserEmailEntry::is_verified)
    });
    if let Some(name) = name {
        user.name = name;
    }
    let (user, rows) = plan_transition(user, rows, &target, verified, None);
    let transition = planned(
        VerificationOutcome::AccountEmail,
        user,
        rows,
        state,
        normalize_email(&target),
        false,
        false,
    );
    write_transition(&transition)?;
    let user = transition.user.value;
    Ok(Some(user))
}

pub fn promote(
    user_id: &str,
    email_id: &str,
    current_session_id: &str,
) -> Result<Option<UserEntry>> {
    let Some(state) = snapshot(user_id)? else {
        return Ok(None);
    };
    let user = state.user.value.clone();
    let rows: Vec<_> = state.rows.iter().map(|row| row.value.clone()).collect();
    checked_primary(&user, &rows)?;
    let Some(target) = rows.iter().find(|row| row.id == email_id) else {
        return Ok(None);
    };
    if !target.is_verified() {
        return Err(SeamError::Db("primary email must be verified".into()));
    }
    ensure_target_unique(&rows, &target.email)?;
    let target_email = target.email.clone();
    let (user, rows) = plan_transition(user, rows, &target_email, true, Some(email_id));
    let transition = planned(
        VerificationOutcome::AccountEmail,
        user,
        rows,
        state,
        normalize_email(&target_email),
        false,
        false,
    );
    let operations = [
        AtomicBatchOp::from(transition.operation()?),
        ConditionalBatchOp::new(
            ConditionalOperation::RevokeSessions,
            serde_json::json!({
                "userId": user_id,
                "reason": "primary_email_change",
                "exceptSessionId": current_session_id,
            }),
        )
        .into(),
    ];
    db::batch_with_results(&operations)?;
    let user = transition.user.value;
    Ok(Some(user))
}

#[cfg(test)]
#[path = "canonical_email_tests.rs"]
mod tests;
