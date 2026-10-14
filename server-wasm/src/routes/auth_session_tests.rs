use super::*;
use std::cell::Cell;

fn claims() -> AccessTokenClaims {
    AccessTokenClaims {
        sub: "user-1".into(),
        sid: "session-1".into(),
        org_id: Some("org-1".into()),
        role: Some("member".into()),
        is_system_admin: None,
        email_verified: Some(true),
        iat: 1,
        nbf: 1,
        exp: 3,
        iss: ACCESS_TOKEN_ISSUER.into(),
        aud: ACCESS_TOKEN_AUDIENCE.into(),
    }
}

fn session() -> SessionEntry {
    SessionEntry {
        id: "session-1".into(),
        user_id: "user-1".into(),
        refresh_token_hash: "hash".into(),
        ip_address: None,
        user_agent: None,
        created_at: "2026-08-08T00:00:00.000Z".into(),
        expires_at: "2026-08-09T00:00:00.000Z".into(),
        revoked_at: None,
        revoked_reason: None,
        last_strong_auth_at: None,
    }
}

#[test]
fn authoritative_session_rejects_revocation_expiry_and_wrong_owner() {
    let claims = claims();
    let mut session = session();
    assert!(session_matches_claims(
        &session,
        &claims,
        "2026-08-08T12:00:00.000Z"
    ));

    session.revoked_at = Some("2026-08-08T13:00:00.000Z".into());
    assert!(!session_matches_claims(
        &session,
        &claims,
        "2026-08-08T14:00:00.000Z"
    ));
    session.revoked_at = None;
    assert!(!session_matches_claims(
        &session,
        &claims,
        "2026-08-09T00:00:00.000Z"
    ));
    session.user_id = "other-user".into();
    assert!(!session_matches_claims(
        &session,
        &claims,
        "2026-08-08T12:00:00.000Z"
    ));
}

#[test]
fn authoritative_membership_rejects_removal_and_role_change() {
    let claims = claims();
    let membership = crate::data::memberships::MembershipEntry {
        id: "membership-1".into(),
        user_id: claims.sub.clone(),
        org_id: claims.org_id.clone().unwrap(),
        role: "member".into(),
        joined_at: "2026-08-08T00:00:00.000Z".into(),
    };
    assert!(current_membership_matches_claims(&claims, Some(&membership)).is_ok());
    assert!(matches!(
        current_membership_matches_claims(&claims, None),
        Err(RouteError::Status(403, "organization_membership_removed"))
    ));
    let changed = crate::data::memberships::MembershipEntry {
        role: "admin".into(),
        ..membership
    };
    assert!(matches!(
        current_membership_matches_claims(&claims, Some(&changed)),
        Err(RouteError::Status(401, "organization_role_changed"))
    ));
}

#[test]
fn authoritative_user_state_rejects_suspension_and_admin_change() {
    let claims = claims();
    let mut user: UserEntry = serde_json::from_value(serde_json::json!({
        "id":"user-1", "email":null, "emailVerified":true, "passwordHash":null,
        "name":null, "username":null, "picture":null, "walletAddress":null,
        "googleId":null, "appleId":null, "authMethods":[], "suspendedAt":null,
        "isSystemAdmin":false, "createdAt":"t", "updatedAt":"t",
        "lastLoginAt":null, "welcomeCompletedAt":null, "avatarContentType":null
    }))
    .unwrap();
    assert!(require_current_user_state(&user, &claims).is_ok());

    user.suspended_at = Some("2026-08-08T00:00:00.000Z".into());
    assert!(matches!(
        require_current_user_state(&user, &claims),
        Err(RouteError::Status(403, "account_suspended"))
    ));
    user.suspended_at = None;
    user.is_system_admin = true;
    assert!(matches!(
        require_current_user_state(&user, &claims),
        Err(RouteError::Status(401, "stale_user_context"))
    ));
}

#[test]
fn authoritative_email_state_rejects_stale_or_unverified_sessions() {
    let mut claims = claims();
    let mut user: UserEntry = serde_json::from_value(serde_json::json!({
        "id":"user-1", "email":"user@example.test", "emailVerified":true,
        "passwordHash":"hash", "name":null, "username":null, "picture":null,
        "walletAddress":null, "googleId":null, "appleId":null, "authMethods":["password"],
        "suspendedAt":null, "isSystemAdmin":false, "createdAt":"t", "updatedAt":"t",
        "lastLoginAt":null, "welcomeCompletedAt":null, "avatarContentType":null
    }))
    .unwrap();
    assert!(require_verified_access_claims_for_policy(&claims, &user, true).is_ok());

    user.email_verified = false;
    assert!(matches!(
        require_verified_access_claims_for_policy(&claims, &user, true),
        Err(RouteError::Status(401, "stale_user_context"))
    ));

    claims.email_verified = Some(false);
    assert!(matches!(
        require_verified_access_claims_for_policy(&claims, &user, true),
        Err(RouteError::Status(403, "email_not_verified"))
    ));
    assert!(require_verified_access_claims_for_policy(&claims, &user, false).is_ok());
}

#[test]
fn signing_key_ring_reads_legacy_pem_and_rejects_invalid_state() {
    let legacy = "-----BEGIN RSA PRIVATE KEY-----\nlegacy\n-----END RSA PRIVATE KEY-----";
    let ring = decode_signing_key_ring(legacy).unwrap();
    assert_eq!(ring.active_private_key_pem, legacy);
    assert!(ring.previous.is_none());

    assert!(decode_signing_key_ring("not a pem or key ring").is_err());
}

#[test]
fn signing_key_rotation_is_blocked_only_during_overlap() {
    let ring = SigningKeyRing {
        active_private_key_pem: "active".into(),
        previous: Some(PreviousSigningKey {
            private_key_pem: "previous".into(),
            valid_until: 200,
        }),
    };
    assert!(rotation_in_progress(&ring, 199));
    assert!(!rotation_in_progress(&ring, 200));
}

#[test]
fn live_default_is_returned_without_repair() {
    let repairs = Cell::new(0);
    let resolved = resolve_default_org_with(
        || Ok(Some("live-org".to_string())),
        || {
            repairs.set(repairs.get() + 1);
            Ok("unused".to_string())
        },
    )
    .unwrap();

    assert_eq!(resolved, "live-org");
    assert_eq!(repairs.get(), 0);
}

#[test]
fn stale_default_repairs_then_reresolves_before_signup() {
    let reads = Cell::new(0);
    let repairs = Cell::new(0);
    let resolved = resolve_default_org_with(
        || {
            reads.set(reads.get() + 1);
            Ok((reads.get() == 2).then(|| "replacement-org".to_string()))
        },
        || {
            repairs.set(repairs.get() + 1);
            Ok("replacement-org".to_string())
        },
    )
    .unwrap();

    assert_eq!(resolved, "replacement-org");
    assert_eq!(reads.get(), 2);
    assert_eq!(repairs.get(), 1);
}

#[test]
fn repair_result_is_not_trusted_when_root_remains_tombstoned() {
    let resolved = resolve_default_org_with(
        || Ok(None),
        || Ok("tombstoned-or-uncommitted-org".to_string()),
    );

    assert!(matches!(
        resolved,
        Err(RouteError::Status(503, "setup_required"))
    ));
}

#[test]
fn stale_default_repair_failure_remains_retryable() {
    let resolved = resolve_default_org_with(
        || Ok(None),
        || Err(SeamError::Settings("temporarily unavailable".into())),
    );

    assert!(matches!(
        resolved,
        Err(RouteError::Status(503, "setup_required"))
    ));
}

#[test]
fn authoritative_context_reuses_exactly_one_read_per_entity() {
    use crate::host::db;
    use serde_json::json;
    use std::rc::Rc;
    let calls = Rc::new(Cell::new(0));
    let counter = calls.clone();
    db::test_support::with_db(
        move |op, collection, _query| {
            counter.set(counter.get() + 1);
            assert_eq!(op, "read");
            let payload = match collection.model {
                "cedros-login:sessions" => {
                    let mut value = serde_json::to_value(session()).unwrap();
                    value["expiresAt"] = json!("9999-01-01T00:00:00Z");
                    value
                }
                "cedros-login:users" => {
                    json!({"id":"user-1", "emailVerified":true, "isSystemAdmin":false, "createdAt":"now", "updatedAt":"now"})
                }
                "cedros-login:orgs" => {
                    json!({"id":"org-1", "name":"Fixture", "slug":"fixture", "isPersonal":false, "ownerId":"user-1", "createdAt":"now", "updatedAt":"now"})
                }
                "cedros-login:memberships" => {
                    json!({"id":"member-1", "userId":"user-1", "orgId":"org-1", "role":"member", "joinedAt":"now"})
                }
                other => panic!("unexpected collection: {other}"),
            };
            Ok(json!({"entries":[{"entry_key":"fixture", "payload":payload}]}))
        },
        || {
            let context = crate::host::key_value_test_support::with_values(
                |seam, key| {
                    assert_eq!((seam, key), ("settings", "auth_email_require_verification"));
                    Ok(None)
                },
                || authoritative_session(claims()).unwrap(),
            );
            assert_eq!(calls.get(), 4);
            let org = context.organization.unwrap();
            assert_eq!(org.org.name, "Fixture");
            assert_eq!(org.membership.role, "member");
            assert_eq!(context.user.id, "user-1");
            assert_eq!(
                calls.get(),
                4,
                "view consumes the validated context without IO"
            );
        },
    );
}

#[test]
fn login_timestamp_cannot_restore_a_stale_credential_snapshot() {
    use crate::host::db;
    use serde_json::json;
    let original: UserEntry = serde_json::from_value(json!({
        "id":"user-1", "passwordHash":"old", "createdAt":"t", "updatedAt":"t", "emailVerified":true, "isSystemAdmin":false
    })).unwrap();
    let mut current = original.clone();
    current.password_hash = Some("new-password-hash".into());
    let mut caller = original.clone();
    db::test_support::with_db(
        move |op, _, _| {
            assert_eq!(op, "read", "stale snapshot must never be written");
            Ok(
                json!({"entries":[{"entry_key":"user-1", "payload":current, "updated_at":"db", "version":"new-version"}]}),
            )
        },
        || assert!(users::touch_last_login(&mut caller).is_err()),
    );
    assert_eq!(caller, original);
}

#[test]
fn account_update_and_mfa_binding_reject_changed_credentials() {
    use crate::{data::mfa_challenges, host::db};
    use serde_json::json;
    let original: UserEntry = serde_json::from_value(json!({
        "id":"user-1", "passwordHash":"old", "createdAt":"t", "updatedAt":"t", "emailVerified":true, "isSystemAdmin":false
    })).unwrap();
    let raw = format!(
        "password.random.{}",
        mfa_challenges::account_binding(&original).unwrap()
    );
    assert!(mfa_challenges::token_matches_account(&raw, &original).unwrap());
    for invalid in [
        "password.random",
        "password.random.invalid",
        "password..invalid",
        "password.random.invalid.extra",
    ] {
        assert!(!mfa_challenges::token_matches_account(invalid, &original).unwrap());
    }
    let mut changed = original.clone();
    changed.password_hash = Some("new".into());
    assert!(!mfa_challenges::token_matches_account(&raw, &changed).unwrap());
    let snapshot = original.clone();
    db::test_support::with_db(
        move |op, _, query| {
            if op == "read" {
                return Ok(
                    json!({"entries":[{"entry_key":"user-1", "payload":snapshot, "version":"opaque-v1"}]}),
                );
            }
            assert_eq!(op, "compare-and-set");
            let body = &query.filters[0].value;
            assert_eq!(body["conditions"][0]["expectedVersion"], "opaque-v1");
            assert_eq!(body["ops"][0]["data"]["passwordHash"], "new");
            Ok(
                json!({"outcome":"applied", "applied":1, "replayed":false, "entries":[], "results":[]}),
            )
        },
        || users::update_if_current(&original, &changed).unwrap(),
    );
}
