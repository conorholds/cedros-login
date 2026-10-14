use uuid::Uuid;

use super::super::{auth, invite_code_policy, RouteError};
use super::{PENDING_TOKEN_TTL_SECS, PENDING_TOKEN_TYPE};
use crate::clock;
use crate::data::invite_codes::{
    self, InviteCodeAccount, RedemptionOutcome, VersionedInviteCode, VersionedInviteCodeAccount,
};
use crate::data::users::UserEntry;
use crate::data::verifications::{self, VerificationEntry};
use crate::exports::cedros::extension::routes::RouteRequest;
use crate::exports::cedros::extension::routes::RouteResponse;
use crate::routes::invite_gate_handoff::{self, InviteGateHandoffStatus};
use crate::services::tokens::{generate_verification_token, hash_verification_token};

pub(crate) fn gate_enabled() -> bool {
    invite_code_policy::gate_enabled()
}

pub(crate) fn pending_account(user_id: &str) -> InviteCodeAccount {
    InviteCodeAccount {
        user_id: user_id.to_string(),
        activated_at: None,
        created_at: clock::now_iso(),
        redemption_id: None,
        invite_code_id: None,
    }
}

pub(crate) fn is_user_pending(user_id: &str) -> Result<bool, RouteError> {
    Ok(matches!(invite_codes::find_account(user_id)?, Some(a) if a.activated_at.is_none()))
}

pub(crate) fn pending_login_response(
    request: &RouteRequest,
    user: &UserEntry,
    method: &str,
) -> Result<Option<RouteResponse>, RouteError> {
    if gate_enabled() && is_user_pending(&user.id)? {
        let token = issue_pending_token(&user.id)?;
        let status = pending_handoff_status(request, user)?;
        return auth::respond_invite_code_required(200, user, false, Some(method), &token, status)
            .map(Some);
    }
    if !gate_enabled() && is_user_pending(&user.id)? {
        activate_user(&user.id)?;
    }
    Ok(None)
}

pub(crate) fn pending_handoff_status(
    request: &RouteRequest,
    user: &UserEntry,
) -> Result<InviteGateHandoffStatus, RouteError> {
    let org_id = auth::default_org_context(user)?.org_id;
    Ok(match org_id.as_deref() {
        Some(org_id) => invite_gate_handoff::submit_pending(request, &user.id, org_id),
        None => InviteGateHandoffStatus::Unavailable,
    })
}

/// Release a gate only through the host CAS; a conflict is benign solely when
/// an authoritative reread proves another worker activated the account.
pub(crate) fn activate_user(user_id: &str) -> Result<(), RouteError> {
    let Some(account) = invite_codes::find_account_versioned(user_id)? else {
        return Err(crate::host::SeamError::Db(
            "invite gate account disappeared during release".into(),
        )
        .into());
    };
    match invite_codes::release_gate(&account) {
        Ok(_) => Ok(()),
        Err(error) if error.is_db_conflict() => {
            let current = invite_codes::find_account_versioned(user_id)?;
            if activation_conflict_is_benign(&account, current.as_ref()) {
                Ok(())
            } else {
                Err(error.into())
            }
        }
        Err(error) => Err(error.into()),
    }
}

fn activation_conflict_is_benign(
    expected: &VersionedInviteCodeAccount,
    current: Option<&VersionedInviteCodeAccount>,
) -> bool {
    let Some(current) = current else {
        return false;
    };
    let identities_match = expected.entry_key == expected.value.user_id
        && current.entry_key == current.value.user_id
        && current.entry_key == expected.entry_key;
    let activation_is_valid = current
        .value
        .activated_at
        .as_deref()
        .is_some_and(|value| chrono::DateTime::parse_from_rfc3339(value).is_ok())
        && expected
            .value
            .activated_at
            .as_ref()
            .is_none_or(|value| current.value.activated_at.as_ref() == Some(value));
    identities_match
        && current.updated_at != expected.updated_at
        && current.value.created_at == expected.value.created_at
        && activation_is_valid
        && receipts_are_benign(&expected.value, &current.value)
}

fn receipts_are_benign(expected: &InviteCodeAccount, current: &InviteCodeAccount) -> bool {
    match (&expected.redemption_id, &expected.invite_code_id) {
        (None, None) => coherent_receipt(current),
        (Some(redemption), Some(invite)) if !redemption.is_empty() && !invite.is_empty() => {
            current.redemption_id.as_ref() == Some(redemption)
                && current.invite_code_id.as_ref() == Some(invite)
        }
        _ => false,
    }
}

fn coherent_receipt(account: &InviteCodeAccount) -> bool {
    match (&account.redemption_id, &account.invite_code_id) {
        (None, None) => true,
        (Some(redemption), Some(invite)) => !redemption.is_empty() && !invite.is_empty(),
        _ => false,
    }
}

pub(crate) fn issue_pending_token(user_id: &str) -> Result<String, RouteError> {
    let (token, entry) = prepare_pending_token(user_id);
    verifications::create(&entry)?;
    Ok(token)
}

pub(crate) fn prepare_pending_token(user_id: &str) -> (String, VerificationEntry) {
    let token = generate_verification_token();
    let entry = VerificationEntry {
        id: Uuid::new_v4().to_string(),
        user_id: user_id.to_string(),
        token_hash: hash_verification_token(&token),
        token_type: PENDING_TOKEN_TYPE.to_string(),
        target_email: None,
        subject_id: None,
        created_at: clock::now_iso(),
        expires_at: clock::in_secs(PENDING_TOKEN_TTL_SECS),
        used_at: None,
    };
    (token, entry)
}

pub(crate) fn redeem_for_user(code: &str, user_id: &str) -> Result<(), RouteError> {
    if invite_codes::find_account(user_id)?.is_some_and(|account| account.activated_at.is_some()) {
        return Ok(());
    }
    let found = prepare_redemption(code)?;
    let token_hash = hash_verification_token(&issue_pending_token(user_id)?);
    let token = verifications::find_by_token_hash_versioned(&token_hash)?
        .ok_or(RouteError::Status(502, "db_error"))?;
    let account = redemption_account(user_id)?;
    invite_codes::redeem(&token, &found, &account)?;
    Ok(())
}

pub(super) fn redemption_account(user_id: &str) -> Result<VersionedInviteCodeAccount, RouteError> {
    invite_codes::find_account_versioned(user_id)?.ok_or(RouteError::Status(400, "invalid_token"))
}

pub(super) fn prepare_redemption(code: &str) -> Result<VersionedInviteCode, RouteError> {
    let normalized = super::normalize_code(code)?;
    let now = clock::now_iso();
    invite_codes::find_by_code_versioned(&normalized)?
        .into_iter()
        .find(|code| code.value.is_available_at(&now))
        .ok_or(RouteError::Status(403, "invalid_invite_code"))
}

pub(super) fn redemption_response_policy(
    outcome: RedemptionOutcome,
    email_verified: bool,
    require_verified_email: bool,
) -> Result<(bool, bool), RouteError> {
    if outcome == RedemptionOutcome::Replayed {
        return Err(RouteError::Status(400, "invalid_token"));
    }
    Ok((true, !require_verified_email || email_verified))
}

#[cfg(test)]
#[path = "gate_tests.rs"]
mod tests;
