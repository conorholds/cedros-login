use super::*;
use crate::data::user_emails::VersionedUserEmailEntry;
use crate::data::users::VersionedUserEntry;

fn user() -> UserEntry {
    serde_json::from_value(serde_json::json!({
        "id":"u1", "email":"old@example.com", "emailVerified":true,
        "passwordHash":null, "name":null, "username":null, "picture":null,
        "walletAddress":null, "evmWalletAddress":null, "googleId":null, "appleId":null,
        "authMethods":["email"], "isSystemAdmin":false,
        "createdAt":"2026-01-01T00:00:00Z", "updatedAt":"2026-01-01T00:00:00Z",
        "lastLoginAt":null, "welcomeCompletedAt":null, "avatarContentType":null
    }))
    .unwrap()
}

fn snapshot_for(user: UserEntry, rows: Vec<UserEmailEntry>) -> Snapshot {
    Snapshot {
        user: VersionedUserEntry {
            entry_key: user.id.clone(),
            value: user,
            updated_at: "2026-07-10T00:00:00Z".to_string(),
        },
        rows: rows
            .into_iter()
            .map(|value| VersionedUserEmailEntry {
                entry_key: value.id.clone(),
                value,
                updated_at: "2026-07-10T00:00:01Z".to_string(),
            })
            .collect(),
    }
}

fn verification(target_email: Option<&str>) -> VerificationEntry {
    VerificationEntry {
        id: "v1".into(),
        user_id: "u1".into(),
        token_hash: "hash".into(),
        token_type: EMAIL_VERIFICATION.into(),
        target_email: target_email.map(str::to_string),
        subject_id: None,
        created_at: "2026-06-01T00:00:00.000Z".into(),
        expires_at: "2026-06-02T00:00:00.000Z".into(),
        used_at: None,
    }
}

fn account_verification(subject_id: Option<&str>) -> VerificationEntry {
    let mut token = verification(None);
    token.token_type = ACCOUNT_EMAIL_VERIFY.into();
    token.subject_id = subject_id.map(str::to_string);
    token
}

#[test]
fn transition_operation_contains_exact_host_revisions_and_new_row_marker() {
    let source = user();
    let old = UserEmailEntry::new(&source.id, "old@example.com".into(), true, true);
    let state = snapshot_for(source.clone(), vec![old.clone()]);
    let (updated, rows) =
        plan_transition(source, vec![old.clone()], "new@example.com", false, None);
    let plan = planned(
        VerificationOutcome::AccountEmail,
        updated,
        rows,
        state,
        "new@example.com".to_string(),
        false,
        false,
    );
    let json = serde_json::to_value(plan.operation().unwrap()).unwrap();
    assert_eq!(json["operationId"], "identity.canonical-email.transition");
    assert_eq!(
        json["params"]["user"]["expectedUpdatedAt"],
        "2026-07-10T00:00:00Z"
    );
    assert_eq!(
        json["params"]["emails"][0]["expectedUpdatedAt"],
        "2026-07-10T00:00:01Z"
    );
    assert!(json["params"]["emails"][1]
        .get("expectedUpdatedAt")
        .is_none());
    assert_eq!(json["params"]["claimedEmail"], "new@example.com");
}

#[test]
fn initial_mailbox_claim_atomically_removes_pre_registered_factors_and_sessions() {
    let mut source = user();
    source.email_verified = false;
    source.password_hash = Some("attacker-hash".into());
    source.auth_methods = vec!["password".into(), "webauthn".into()];
    let old = UserEmailEntry::new(&source.id, "old@example.com".into(), false, true);
    let state = snapshot_for(source.clone(), vec![old.clone()]);
    let mut claimed = source;
    assert!(crate::data::users::reset_unverified_credentials(
        &mut claimed
    ));
    let (claimed, rows) = plan_transition(claimed, vec![old], "old@example.com", true, None);
    let plan = planned(
        VerificationOutcome::Canonical {
            user_id: "u1".into(),
            email_changed: false,
            credentials_reset: true,
            completed_initial_verification: true,
        },
        claimed,
        rows,
        state,
        "old@example.com".into(),
        true,
        true,
    );
    let token = verification(Some("old@example.com"));
    let operations = verification_operations(
        &token,
        &[EMAIL_VERIFICATION],
        &plan,
        &["attacker-passkey".into()],
        &[crate::data::sso_identities::SsoIdentityEntry {
            id: format!("sso:{}", "a".repeat(64)),
            user_id: "u1".into(),
            created_at: "2026-07-10T00:00:00Z".into(),
        }],
        &["attacker-recovery-email".into()],
    )
    .unwrap();
    let json = serde_json::to_value(operations).unwrap();
    assert_eq!(
        json[0]["operationId"],
        "identity.verifications.consume-live-purpose-bound"
    );
    assert_eq!(
        json[1]["operationId"],
        "identity.canonical-email.transition"
    );
    assert_eq!(json[2]["entryKey"], "attacker-passkey");
    assert_eq!(json[3]["contentModelId"], "cedros-login:sso-identities");
    assert_eq!(json[4]["contentModelId"], "cedros-login:user-emails");
    assert_eq!(json[4]["entryKey"], "attacker-recovery-email");
    assert_eq!(json[5]["contentModelId"], "cedros-login:totp");
    assert_eq!(json[6]["operationId"], "identity.sessions.revoke");
    assert_eq!(json[6]["params"]["reason"], "email_ownership_claim");
}

#[test]
fn missing_multiple_and_duplicate_email_invariants_fail_closed() {
    let user = user();
    assert!(checked_primary(&user, &[]).is_err());
    let one = UserEmailEntry::new(&user.id, "old@example.com".into(), true, true);
    let two = UserEmailEntry::new(&user.id, "other@example.com".into(), true, true);
    assert!(checked_primary(&user, &[one.clone(), two]).is_err());
    let duplicate = UserEmailEntry::new(&user.id, "old@example.com".into(), true, false);
    assert!(ensure_target_unique(&[one, duplicate], "old@example.com").is_err());
}

#[test]
fn canonical_token_requires_and_normalizes_bound_target() {
    assert!(matches!(
        canonical_target(&verification(None)),
        Err(VerificationError::Invalid)
    ));
    assert_eq!(
        canonical_target(&verification(Some("New@Example.COM"))).unwrap(),
        "new@example.com"
    );
}

#[test]
fn wrong_purpose_used_and_expired_tokens_fail_before_planning() {
    let mut token = verification(Some("old@example.com"));
    token.token_type = "password_reset".into();
    assert!(matches!(
        verify_token(token, &[EMAIL_VERIFICATION], "2026-06-01T01:00:00.000Z"),
        Err(VerificationError::Invalid)
    ));
    let mut used = verification(Some("old@example.com"));
    used.used_at = Some("2026-06-01T00:30:00.000Z".into());
    assert!(matches!(
        verify_token(used, &[EMAIL_VERIFICATION], "2026-06-01T01:00:00.000Z"),
        Err(VerificationError::Invalid)
    ));
    assert!(matches!(
        verify_token(
            verification(Some("old@example.com")),
            &[EMAIL_VERIFICATION],
            "2026-06-02T00:00:00.000Z"
        ),
        Err(VerificationError::Invalid)
    ));
}

#[test]
fn missing_and_mismatched_account_subjects_are_invalid() {
    assert!(matches!(
        verify_account_email(&account_verification(None)),
        Err(VerificationError::Invalid)
    ));
    let user = user();
    let primary = UserEmailEntry::new(&user.id, "old@example.com".into(), true, true);
    let state = snapshot_for(user, vec![primary]);
    let token = account_verification(Some("foreign-row"));
    assert!(matches!(
        plan_account_verification(&token, "foreign-row", state),
        Err(VerificationError::Invalid)
    ));
}
