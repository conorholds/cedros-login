use super::*;

fn versioned(account: InviteCodeAccount, revision: &str) -> VersionedInviteCodeAccount {
    VersionedInviteCodeAccount {
        entry_key: account.user_id.clone(),
        value: account,
        updated_at: revision.into(),
    }
}

fn activated_from(expected: &VersionedInviteCodeAccount) -> VersionedInviteCodeAccount {
    let mut current = versioned(expected.value.clone(), "revision-2");
    current.value.activated_at = Some("2026-07-10T00:00:00Z".into());
    current
}

#[test]
fn preexisting_receipt_survives_conflict_reconciliation() {
    let mut account = pending_account("user-1");
    account.redemption_id = Some("redemption-1".into());
    account.invite_code_id = Some("invite-1".into());
    let expected = versioned(account, "revision-1");
    let current = activated_from(&expected);
    assert!(activation_conflict_is_benign(&expected, Some(&current)));
}

#[test]
fn erased_or_mismatched_receipt_is_rejected() {
    let mut account = pending_account("user-1");
    account.redemption_id = Some("redemption-1".into());
    account.invite_code_id = Some("invite-1".into());
    let expected = versioned(account, "revision-1");
    let current = activated_from(&expected);
    let mut erased = clone_versioned(&current);
    erased.value.redemption_id = None;
    erased.value.invite_code_id = None;
    assert!(!activation_conflict_is_benign(&expected, Some(&erased)));

    let mut changed = clone_versioned(&current);
    changed.value.redemption_id = Some("other-redemption".into());
    assert!(!activation_conflict_is_benign(&expected, Some(&changed)));
}

#[test]
fn receiptless_pending_accepts_concurrent_release() {
    let expected = versioned(pending_account("user-1"), "revision-1");
    let released = activated_from(&expected);
    assert!(activation_conflict_is_benign(&expected, Some(&released)));
}

#[test]
fn receiptless_pending_accepts_coherent_concurrent_redemption() {
    let expected = versioned(pending_account("user-1"), "revision-1");
    let released = activated_from(&expected);
    let mut redeemed = clone_versioned(&released);
    redeemed.value.redemption_id = Some("redemption-1".into());
    redeemed.value.invite_code_id = Some("invite-1".into());
    assert!(activation_conflict_is_benign(&expected, Some(&redeemed)));

    redeemed.value.invite_code_id = None;
    assert!(!activation_conflict_is_benign(&expected, Some(&redeemed)));
}

#[test]
fn conflict_reconciliation_rejects_identity_time_and_revision_mismatches() {
    let expected = versioned(pending_account("user-1"), "revision-1");
    assert!(!activation_conflict_is_benign(&expected, None));

    let mut current = activated_from(&expected);
    current.updated_at = expected.updated_at.clone();
    assert!(!activation_conflict_is_benign(&expected, Some(&current)));
    current.updated_at = "revision-2".into();
    current.value.created_at = "changed".into();
    assert!(!activation_conflict_is_benign(&expected, Some(&current)));
    current.value.created_at = expected.value.created_at.clone();
    current.entry_key = "other-user".into();
    assert!(!activation_conflict_is_benign(&expected, Some(&current)));
}

fn clone_versioned(value: &VersionedInviteCodeAccount) -> VersionedInviteCodeAccount {
    VersionedInviteCodeAccount {
        value: value.value.clone(),
        entry_key: value.entry_key.clone(),
        updated_at: value.updated_at.clone(),
    }
}
