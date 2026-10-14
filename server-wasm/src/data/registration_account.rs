//! Cross-access account creation through the host registration transaction.

use crate::data::credentials::CredentialEntry;
use crate::data::invite_codes::InviteCodeAccount;
use crate::data::memberships::MembershipEntry;
use crate::data::nonces::NonceEntry;
use crate::data::outbox::OutboxEntry;
use crate::data::sessions::SessionEntry;
use crate::data::signup_limit::{self, SignupLimitPolicy};
use crate::data::sso_identities::{self, SsoIdentityEntry};
use crate::data::user_emails::UserEmailEntry;
use crate::data::users::UserEntry;
use crate::data::verifications::VerificationEntry;
use crate::host::db::{self, ConditionalBatchOp, ConditionalOperation};
use crate::host::{Result, SeamError};
use serde_json::{json, Value};

#[derive(Clone, Copy)]
pub enum RegistrationProof<'a> {
    Verification(&'a VerificationEntry, &'a [&'a str]),
    Nonce(&'a NonceEntry),
}

pub struct RegistrationEmail<'a> {
    pub verification: &'a VerificationEntry,
    pub outbox: &'a OutboxEntry,
}

/// Atomically create identity rows and the default-org membership, consuming
/// the validated proof in the same host transaction.
pub fn create(
    user: &UserEntry,
    credential: Option<&CredentialEntry>,
    membership: &MembershipEntry,
    session: Option<&SessionEntry>,
    invite_code_account: Option<&InviteCodeAccount>,
    proof: Option<RegistrationProof<'_>>,
) -> Result<()> {
    let signup_limit = signup_limit::current()?;
    create_with(
        RegistrationParams {
            user,
            credential,
            membership,
            session,
            invite_code_account,
            proof,
            email: None,
            sso_identity: None,
            signup_limit: &signup_limit,
        },
        db::batch_with_results,
    )
}

/// Create an SSO account and its immutable provider-subject binding in the
/// same registration transaction.
pub fn create_with_sso_identity(
    user: &UserEntry,
    identity: &SsoIdentityEntry,
    membership: &MembershipEntry,
    session: Option<&SessionEntry>,
    invite_code_account: Option<&InviteCodeAccount>,
    proof: Option<RegistrationProof<'_>>,
) -> Result<()> {
    if identity.user_id != user.id {
        return Err(SeamError::Db(
            "SSO identity does not match registration user".into(),
        ));
    }
    let signup_limit = signup_limit::current()?;
    create_with(
        RegistrationParams {
            user,
            credential: None,
            membership,
            session,
            invite_code_account,
            proof,
            email: None,
            sso_identity: Some(identity),
            signup_limit: &signup_limit,
        },
        db::batch_with_results,
    )
}

/// Complete registration with its required verification token and email work in
/// the same documented host transaction.
pub fn complete(
    user: &UserEntry,
    credential: Option<&CredentialEntry>,
    membership: &MembershipEntry,
    session: Option<&SessionEntry>,
    invite_code_account: Option<&InviteCodeAccount>,
    proof: Option<RegistrationProof<'_>>,
    email: RegistrationEmail<'_>,
) -> Result<()> {
    let signup_limit = signup_limit::current()?;
    create_with(
        RegistrationParams {
            user,
            credential,
            membership,
            session,
            invite_code_account,
            proof,
            email: Some(&email),
            sso_identity: None,
            signup_limit: &signup_limit,
        },
        db::batch_with_results,
    )
}

fn create_with<F>(input: RegistrationParams<'_>, execute: F) -> Result<()>
where
    F: FnOnce(&[db::AtomicBatchOp]) -> Result<db::AtomicBatchResult>,
{
    let user = input.user;
    let proof = input.proof;
    let operation = if input.email.is_some() {
        ConditionalOperation::CompleteRegistrationAccount
    } else {
        ConditionalOperation::CreateRegistrationAccount
    };
    let sso_identity = input.sso_identity;
    let op = ConditionalBatchOp::new(operation, params(input)?);
    let mut operations = vec![op.into()];
    if let Some(identity) = sso_identity {
        operations.push(sso_identities::registration_write_operation(identity)?.into());
    }
    let result = execute(&operations)?;
    let output = &result.results.first().ok_or_else(invalid_response)?.output;
    validate_output(output, user, proof)?;
    Ok(())
}

fn validate_output(
    output: &Value,
    user: &UserEntry,
    proof: Option<RegistrationProof<'_>>,
) -> Result<()> {
    let status = output.get("status").and_then(Value::as_str);
    if status == Some("limit-reached") {
        let resets_at = output
            .get("resetsAt")
            .and_then(Value::as_str)
            .ok_or_else(invalid_response)?;
        return Err(SeamError::SignupLimitReached {
            resets_at: resets_at.to_string(),
        });
    }
    let valid = output.get("userId").and_then(Value::as_str) == Some(user.id.as_str())
        && matches!(status, Some("created" | "already-created"))
        && proof_matches(output.get("proofPayload"), proof);
    if !valid {
        return Err(invalid_response());
    }
    Ok(())
}

fn proof_matches(payload: Option<&Value>, proof: Option<RegistrationProof<'_>>) -> bool {
    match proof {
        Some(RegistrationProof::Verification(expected, allowed)) => payload
            .and_then(|value| serde_json::from_value::<VerificationEntry>(value.clone()).ok())
            .is_some_and(|claimed| {
                claimed.id == expected.id
                    && claimed.token_hash == expected.token_hash
                    && claimed.used_at.is_none()
                    && allowed.iter().any(|kind| claimed.token_type == **kind)
            }),
        Some(RegistrationProof::Nonce(expected)) => payload
            .and_then(|value| serde_json::from_value::<NonceEntry>(value.clone()).ok())
            .is_some_and(|claimed| claimed == *expected),
        None => payload.is_some_and(Value::is_null),
    }
}

struct RegistrationParams<'a> {
    user: &'a UserEntry,
    credential: Option<&'a CredentialEntry>,
    membership: &'a MembershipEntry,
    session: Option<&'a SessionEntry>,
    invite_code_account: Option<&'a InviteCodeAccount>,
    proof: Option<RegistrationProof<'a>>,
    email: Option<&'a RegistrationEmail<'a>>,
    sso_identity: Option<&'a SsoIdentityEntry>,
    signup_limit: &'a SignupLimitPolicy,
}

fn params(input: RegistrationParams<'_>) -> Result<Value> {
    let RegistrationParams {
        user,
        credential,
        membership,
        session,
        invite_code_account,
        proof,
        email,
        sso_identity: _,
        signup_limit,
    } = input;
    let mut value = json!({
        "user": row(&user.id, user)?,
        "membership": row(&membership.id, membership)?,
        "signupLimit": signup_limit,
    });
    if let Some(email) = user.email.clone() {
        let primary = UserEmailEntry::new(&user.id, email, user.email_verified, true);
        value["primaryEmail"] = row(&primary.id, &primary)?;
    }
    if let Some(credential) = credential {
        value["credential"] = row(&credential.id, credential)?;
    }
    if let Some(session) = session {
        value["session"] = row(&session.id, session)?;
    }
    if let Some(account) = invite_code_account {
        value["inviteCodeAccount"] = row(&account.user_id, account)?;
    }
    match proof {
        Some(RegistrationProof::Verification(entry, allowed)) => {
            value["verification"] = json!({
                "entryKey": entry.id,
                "tokenHash": entry.token_hash,
                "allowedTokenTypes": allowed,
            });
        }
        Some(RegistrationProof::Nonce(entry)) => {
            value["nonce"] = json!({
                "entryKey": entry.nonce,
                "publicKey": entry.public_key,
                "message": entry.message,
            });
        }
        None => {}
    }
    if let Some(email) = email {
        value["emailVerification"] = row(&email.verification.id, email.verification)?;
        value["emailOutbox"] = row(&email.outbox.id, email.outbox)?;
    }
    Ok(value)
}

fn row(key: &str, value: &impl serde::Serialize) -> Result<Value> {
    Ok(json!({
        "entryKey": key,
        "data": serde_json::to_value(value)
            .map_err(|error| SeamError::Encoding(error.to_string()))?,
    }))
}

fn invalid_response() -> SeamError {
    SeamError::Db("registration transaction returned an invalid response".into())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn rows() -> (UserEntry, MembershipEntry, InviteCodeAccount) {
        let now = "2026-07-10T00:00:00Z".to_string();
        let user = UserEntry {
            id: "u1".into(),
            email: Some("u@example.com".into()),
            email_verified: true,
            password_hash: None,
            name: None,
            username: None,
            picture: None,
            wallet_address: None,
            evm_wallet_address: None,
            google_id: None,
            apple_id: None,
            auth_methods: vec!["sso".into()],
            suspended_at: None,
            is_system_admin: false,
            created_at: now.clone(),
            updated_at: now.clone(),
            last_login_at: Some(now.clone()),
            welcome_completed_at: None,
            avatar_content_type: None,
        };
        let membership = MembershipEntry {
            id: "m1".into(),
            user_id: "u1".into(),
            org_id: "o1".into(),
            role: "member".into(),
            joined_at: now.clone(),
        };
        let account = InviteCodeAccount {
            user_id: "u1".into(),
            activated_at: None,
            created_at: now,
            redemption_id: None,
            invite_code_id: None,
        };
        (user, membership, account)
    }

    fn signup_limit() -> SignupLimitPolicy {
        SignupLimitPolicy {
            enabled: true,
            period: "monthly",
            limit: 100,
            period_start: "2026-07-01T00:00:00.000Z".into(),
            resets_at: "2026-08-01T00:00:00.000Z".into(),
        }
    }

    #[test]
    fn registration_params_bind_verification_and_all_result_rows() {
        let now = "2026-07-10T00:00:00Z".to_string();
        let (user, membership, account) = rows();
        let proof = VerificationEntry {
            id: "v1".into(),
            user_id: "".into(),
            token_hash: "state".into(),
            token_type: "sso_state".into(),
            target_email: None,
            subject_id: None,
            created_at: now.clone(),
            expires_at: now,
            used_at: None,
        };
        let value = params(RegistrationParams {
            user: &user,
            credential: None,
            membership: &membership,
            session: None,
            invite_code_account: Some(&account),
            proof: Some(RegistrationProof::Verification(&proof, &["sso_state"])),
            email: None,
            sso_identity: None,
            signup_limit: &signup_limit(),
        })
        .unwrap();
        assert_eq!(value["user"]["entryKey"], "u1");
        assert_eq!(value["primaryEmail"]["data"]["email"], "u@example.com");
        assert_eq!(value["membership"]["entryKey"], "m1");
        assert_eq!(value["inviteCodeAccount"]["entryKey"], "u1");
        assert_eq!(value["verification"]["entryKey"], "v1");
        assert_eq!(value["signupLimit"]["period"], "monthly");
        assert_eq!(value["signupLimit"]["limit"], 100);
        assert!(proof_matches(
            Some(&serde_json::to_value(&proof).unwrap()),
            Some(RegistrationProof::Verification(&proof, &["sso_state"])),
        ));
        let mut wrong = serde_json::to_value(&proof).unwrap();
        wrong["tokenHash"] = json!("wrong");
        assert!(!proof_matches(
            Some(&wrong),
            Some(RegistrationProof::Verification(&proof, &["sso_state"])),
        ));
    }

    #[test]
    fn proofless_registration_accepts_exact_idempotent_receipt() {
        let (user, membership, account) = rows();
        create_with(
            RegistrationParams {
                user: &user,
                credential: None,
                membership: &membership,
                session: None,
                invite_code_account: Some(&account),
                proof: None,
                email: None,
                sso_identity: None,
                signup_limit: &signup_limit(),
            },
            |_| {
                Ok(db::AtomicBatchResult {
                    applied: 1,
                    results: vec![db::ConditionalBatchResult {
                        operation_id: ConditionalOperation::CreateRegistrationAccount.id().into(),
                        output: json!({
                            "userId": "u1", "status": "already-created", "proofPayload": null
                        }),
                    }],
                })
            },
        )
        .unwrap();
    }

    #[test]
    fn sso_registration_commits_the_subject_binding_with_the_account() {
        let (user, membership, _) = rows();
        let identity = SsoIdentityEntry {
            id: format!("sso:{}", "a".repeat(64)),
            user_id: user.id.clone(),
            created_at: user.created_at.clone(),
        };
        create_with(
            RegistrationParams {
                user: &user,
                credential: None,
                membership: &membership,
                session: None,
                invite_code_account: None,
                proof: None,
                email: None,
                sso_identity: Some(&identity),
                signup_limit: &signup_limit(),
            },
            |ops| {
                let wire = serde_json::to_value(ops).unwrap();
                assert_eq!(ops.len(), 2);
                assert_eq!(wire[1]["contentModelId"], "cedros-login:sso-identities");
                assert_eq!(wire[1]["entryKey"], identity.id);
                Ok(db::AtomicBatchResult {
                    applied: 2,
                    results: vec![db::ConditionalBatchResult {
                        operation_id: ConditionalOperation::CreateRegistrationAccount.id().into(),
                        output: json!({
                            "userId": "u1", "status": "created", "proofPayload": null
                        }),
                    }],
                })
            },
        )
        .unwrap();
    }

    #[test]
    fn signup_limit_rejection_is_returned_without_accepting_a_created_user() {
        let (user, membership, _) = rows();
        let result = create_with(
            RegistrationParams {
                user: &user,
                credential: None,
                membership: &membership,
                session: None,
                invite_code_account: None,
                proof: None,
                email: None,
                sso_identity: None,
                signup_limit: &signup_limit(),
            },
            |_| {
                Ok(db::AtomicBatchResult {
                    applied: 1,
                    results: vec![db::ConditionalBatchResult {
                        operation_id: ConditionalOperation::CreateRegistrationAccount.id().into(),
                        output: json!({
                            "userId": "u1",
                            "status": "limit-reached",
                            "proofPayload": null,
                            "resetsAt": "2026-08-01T00:00:00.000Z"
                        }),
                    }],
                })
            },
        );
        assert!(matches!(
            result,
            Err(SeamError::SignupLimitReached { resets_at })
                if resets_at == "2026-08-01T00:00:00.000Z"
        ));
    }

    #[test]
    fn failed_registration_keeps_membership_and_gate_row_in_one_attempt() {
        let (user, membership, account) = rows();
        let result = create_with(
            RegistrationParams {
                user: &user,
                credential: None,
                membership: &membership,
                session: None,
                invite_code_account: Some(&account),
                proof: None,
                email: None,
                sso_identity: None,
                signup_limit: &signup_limit(),
            },
            |ops| {
                let wire = serde_json::to_value(ops).unwrap();
                assert_eq!(wire[0]["params"]["membership"]["entryKey"], "m1");
                assert_eq!(wire[0]["params"]["inviteCodeAccount"]["entryKey"], "u1");
                Err(SeamError::Db("injected registration failure".into()))
            },
        );
        assert!(matches!(result, Err(SeamError::Db(message)) if message.contains("injected")));
    }

    #[test]
    fn completion_couples_verification_and_outbox_rows() {
        let (user, membership, account) = rows();
        let verification = VerificationEntry {
            id: "email-v1".into(),
            user_id: user.id.clone(),
            token_hash: "hash".into(),
            token_type: "email_verification".into(),
            target_email: user.email.clone(),
            subject_id: None,
            created_at: user.created_at.clone(),
            expires_at: user.created_at.clone(),
            used_at: None,
        };
        let outbox = OutboxEntry {
            id: "mail-1".into(),
            user_id: Some(user.id.clone()),
            to: user.email.clone().unwrap(),
            subject: "Verify".into(),
            html_body: Some("body".into()),
            text_body: Some("body".into()),
            status: "pending".into(),
            attempts: 0,
            max_attempts: 5,
            created_at: user.created_at.clone(),
            next_attempt_at: user.created_at.clone(),
            last_error: None,
            provider_accepted_at: None,
            provider_message_ref: None,
            lease_owner: None,
            lease_expires_at: None,
            host_fields: Default::default(),
        };
        create_with(
            RegistrationParams {
                user: &user,
                credential: None,
                membership: &membership,
                session: None,
                invite_code_account: Some(&account),
                proof: None,
                email: Some(&RegistrationEmail {
                    verification: &verification,
                    outbox: &outbox,
                }),
                sso_identity: None,
                signup_limit: &signup_limit(),
            },
            |ops| {
                let wire = serde_json::to_value(ops).unwrap();
                assert_eq!(
                    wire[0]["operationId"],
                    ConditionalOperation::CompleteRegistrationAccount.id()
                );
                assert_eq!(
                    wire[0]["params"]["emailVerification"]["entryKey"],
                    "email-v1"
                );
                assert_eq!(wire[0]["params"]["emailOutbox"]["entryKey"], "mail-1");
                Ok(db::AtomicBatchResult {
                    applied: 1,
                    results: vec![db::ConditionalBatchResult {
                        operation_id: ConditionalOperation::CompleteRegistrationAccount
                            .id()
                            .into(),
                        output: json!({
                            "userId": "u1", "status": "created", "proofPayload": null
                        }),
                    }],
                })
            },
        )
        .unwrap();
    }

    #[test]
    fn completion_failure_has_one_host_attempt_and_no_fallback_create() {
        let (user, membership, _) = rows();
        let verification = VerificationEntry {
            id: "email-v1".into(),
            user_id: user.id.clone(),
            token_hash: "hash".into(),
            token_type: "email_verification".into(),
            target_email: user.email.clone(),
            subject_id: None,
            created_at: user.created_at.clone(),
            expires_at: user.created_at.clone(),
            used_at: None,
        };
        let outbox = OutboxEntry {
            id: "mail-1".into(),
            user_id: Some(user.id.clone()),
            to: user.email.clone().unwrap(),
            subject: "Verify".into(),
            html_body: None,
            text_body: Some("body".into()),
            status: "pending".into(),
            attempts: 0,
            max_attempts: 5,
            created_at: user.created_at.clone(),
            next_attempt_at: user.created_at.clone(),
            last_error: None,
            provider_accepted_at: None,
            provider_message_ref: None,
            lease_owner: None,
            lease_expires_at: None,
            host_fields: Default::default(),
        };
        let result = create_with(
            RegistrationParams {
                user: &user,
                credential: None,
                membership: &membership,
                session: None,
                invite_code_account: None,
                proof: None,
                email: Some(&RegistrationEmail {
                    verification: &verification,
                    outbox: &outbox,
                }),
                sso_identity: None,
                signup_limit: &signup_limit(),
            },
            |ops| {
                assert_eq!(ops.len(), 1);
                let wire = serde_json::to_value(ops).unwrap();
                assert_eq!(wire[0]["operationId"], "registration.account.complete");
                Err(SeamError::Db("injected atomic completion failure".into()))
            },
        );
        assert!(
            matches!(result, Err(SeamError::Db(message)) if message.contains("injected atomic"))
        );
    }

    #[test]
    fn every_new_account_flow_uses_the_registration_transaction() {
        let sources = [
            include_str!("../routes/auth/registration.rs"),
            include_str!("../routes/social/registration.rs"),
            include_str!("../routes/instant_link.rs"),
            include_str!("../routes/sso/completion.rs"),
            include_str!("../routes/webauthn/signup_completion.rs"),
            include_str!("../routes/solana.rs"),
        ];
        for source in sources {
            assert!(source.contains("registration_account::create"));
            for stale in [
                "users::create(",
                "signup::create_user_with_primary_email(",
                "assign_default_org(",
                "mark_user_pending(",
            ] {
                assert!(
                    !source.contains(stale),
                    "stale sequential signup call: {stale}"
                );
            }
        }
    }
}
