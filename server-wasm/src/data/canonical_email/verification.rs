use super::invariants::{checked_primary, ensure_available, ensure_target_unique};
use super::transition::{plan_transition, planned, snapshot, PlannedVerification, Snapshot};
use super::{VerificationError, VerificationOutcome, ACCOUNT_EMAIL_VERIFY};
use crate::clock;
use crate::data::verifications::VerificationEntry;
use crate::services::email::normalize_email;

pub(super) fn verify_canonical(
    token: &VerificationEntry,
) -> std::result::Result<PlannedVerification, VerificationError> {
    if token.subject_id.is_some() {
        return Err(VerificationError::Invalid);
    }
    let target = canonical_target(token)?;
    let state = snapshot(&token.user_id)?.ok_or(VerificationError::Invalid)?;
    let user = &state.user.value;
    let rows: Vec<_> = state.rows.iter().map(|row| row.value.clone()).collect();
    checked_primary(user, &rows)?;
    ensure_available(user, &target)?;
    ensure_target_unique(&rows, &target)?;
    let changed = user.email.as_deref().map(normalize_email).as_deref() != Some(target.as_str());
    let completed_initial_verification = !changed && !user.email_verified;
    let mut user = state.user.value.clone();
    let resets_unverified_credentials =
        !changed && crate::data::users::reset_unverified_credentials(&mut user);
    let (user, rows) = plan_transition(user, rows, &target, true, None);
    Ok(planned(
        VerificationOutcome::Canonical {
            user_id: user.id.clone(),
            email_changed: changed,
            credentials_reset: resets_unverified_credentials,
            completed_initial_verification,
        },
        user,
        rows,
        state,
        target,
        resets_unverified_credentials,
        changed || completed_initial_verification,
    ))
}

pub(super) fn canonical_target(
    token: &VerificationEntry,
) -> std::result::Result<String, VerificationError> {
    token
        .target_email
        .as_deref()
        .map(normalize_email)
        .ok_or(VerificationError::Invalid)
}

pub(super) fn verify_account_email(
    token: &VerificationEntry,
) -> std::result::Result<PlannedVerification, VerificationError> {
    if token.token_type != ACCOUNT_EMAIL_VERIFY {
        return Err(VerificationError::Invalid);
    }
    let subject = token
        .subject_id
        .as_deref()
        .ok_or(VerificationError::Invalid)?;
    let state = snapshot(&token.user_id)?.ok_or(VerificationError::Invalid)?;
    plan_account_verification(token, subject, state)
}

pub(super) fn plan_account_verification(
    token: &VerificationEntry,
    subject: &str,
    state: Snapshot,
) -> std::result::Result<PlannedVerification, VerificationError> {
    let mut user = state.user.value.clone();
    let mut rows: Vec<_> = state.rows.iter().map(|row| row.value.clone()).collect();
    checked_primary(&user, &rows)?;
    let row = rows
        .iter_mut()
        .find(|row| row.id == subject && row.user_id == token.user_id)
        .ok_or(VerificationError::Invalid)?;
    row.verified_at.get_or_insert_with(clock::now_iso);
    if row.is_primary {
        user.email_verified = true;
        user.updated_at = clock::now_iso();
    }
    let claimed_email = row.email.clone();
    Ok(planned(
        VerificationOutcome::AccountEmail,
        user,
        rows,
        state,
        claimed_email,
        false,
        true,
    ))
}
