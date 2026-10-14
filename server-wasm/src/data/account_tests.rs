use super::*;
use crate::data::users::UserEntry;
use crate::data::verifications::VerificationEntry;

#[test]
fn email_confirmation_operation_binds_exact_user_revision_and_proof() {
    let value = serde_json::to_value(deletion_operation(&user(), Some(&proof()))).unwrap();
    assert_eq!(value["operationId"], "identity.account.delete");
    assert_eq!(value["params"]["userId"], "u1");
    assert_eq!(value["params"]["expectedUpdatedAt"], "user-revision");
    assert_eq!(value["params"]["verification"]["entryKey"], "v1");
    assert_eq!(value["params"]["verification"]["tokenHash"], "hash");
    assert!(value["params"]["verification"]
        .get("expectedUpdatedAt")
        .is_none());
}

#[test]
fn authenticated_operation_omits_verification_and_mismatched_proof_fails() {
    let user = user();
    let value = serde_json::to_value(deletion_operation(&user, None)).unwrap();
    assert!(value["params"].get("verification").is_none());
    let mut proof = proof();
    proof.value.user_id = "other".into();
    assert!(validate_proof(&user, Some(&proof)).is_err());
}

#[test]
fn deletion_response_requires_durable_tombstone_generation() {
    let complete = serde_json::json!({
        "status": "deleted", "detachedMemberships": 1,
        "transferredOrganizations": 0, "deletedOrganizations": 0,
        "tombstoneGeneration": "generation-1",
    });
    let outcome: AccountDeletionOutcome = serde_json::from_value(complete).unwrap();
    assert_eq!(outcome.tombstone_generation, "generation-1");

    let missing = serde_json::json!({
        "status": "deleted", "detachedMemberships": 1,
        "transferredOrganizations": 0, "deletedOrganizations": 0,
    });
    assert!(serde_json::from_value::<AccountDeletionOutcome>(missing).is_err());
}

fn user() -> VersionedUserEntry {
    VersionedUserEntry {
        value: UserEntry {
            id: "u1".into(),
            email: None,
            email_verified: false,
            password_hash: None,
            name: None,
            username: None,
            picture: None,
            wallet_address: None,
            evm_wallet_address: None,
            google_id: None,
            apple_id: None,
            auth_methods: vec![],
            suspended_at: None,
            is_system_admin: false,
            created_at: "created".into(),
            updated_at: "payload-revision".into(),
            last_login_at: None,
            welcome_completed_at: None,
            avatar_content_type: None,
        },
        entry_key: "u1".into(),
        updated_at: "user-revision".into(),
    }
}

fn proof() -> VersionedVerificationEntry {
    VersionedVerificationEntry {
        value: VerificationEntry {
            id: "v1".into(),
            user_id: "u1".into(),
            token_hash: "hash".into(),
            token_type: "account_deletion".into(),
            target_email: None,
            subject_id: None,
            created_at: "created".into(),
            expires_at: "expires".into(),
            used_at: None,
        },
        entry_key: "v1".into(),
    }
}
