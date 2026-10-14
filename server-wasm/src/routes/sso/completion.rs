use uuid::Uuid;

use super::super::{auth, RouteError};
use crate::clock;
use crate::data::memberships::MembershipEntry;
use crate::data::registration_account::{self, RegistrationProof};
use crate::data::sso_identities::{self, SsoIdentityEntry};
use crate::data::users::{self, UserEntry};
use crate::data::verifications::{self, VerificationEntry};
use crate::host::db::{self, AtomicBatchOp, ConditionalBatchOp, ConditionalOperation};
use crate::services::jwt::{TokenContext, TokenPair};

const SSO_STATE_TYPE: &str = "sso_state";

pub(super) fn mfa(
    user: &UserEntry,
    pending_identity: Option<&SsoIdentityEntry>,
    proof: &VerificationEntry,
) -> Result<crate::exports::cedros::extension::routes::RouteResponse, RouteError> {
    let (response, challenge) = auth::prepare_mfa_challenge_bound(
        user,
        "sso",
        pending_identity.map(|identity| identity.id.clone()),
    )?;
    let mut operations = vec![verifications::consume_operation(proof, &[SSO_STATE_TYPE]).into()];
    operations.push(challenge.into());
    let result = db::batch_with_results(&operations)?;
    verifications::consumed_payload(&result, proof, &[SSO_STATE_TYPE])?;
    Ok(response)
}

/// Consume the provider callback proof while issuing the invite-gate handoff.
/// Keeping these writes in one transaction prevents the same OIDC state from
/// minting multiple pending tokens and ensures a migrated identity is durable
/// before the browser leaves the callback.
pub(super) fn pending_invite(
    user: &UserEntry,
    pending_identity: Option<&SsoIdentityEntry>,
    proof: &VerificationEntry,
) -> Result<String, RouteError> {
    let (token, pending) = super::super::invite_codes::prepare_pending_token(&user.id);
    let operations = pending_invite_operations(proof, &pending, pending_identity)?;
    let result = db::batch_with_results(&operations)?;
    verifications::consumed_payload(&result, proof, &[SSO_STATE_TYPE])?;
    Ok(token)
}

fn pending_invite_operations(
    proof: &VerificationEntry,
    pending: &VerificationEntry,
    pending_identity: Option<&SsoIdentityEntry>,
) -> crate::host::Result<Vec<AtomicBatchOp>> {
    let mut operations = vec![verifications::consume_operation(proof, &[SSO_STATE_TYPE]).into()];
    operations.push(verifications::write_operation(pending)?.into());
    if let Some(identity) = pending_identity {
        if identity.user_id != pending.user_id {
            return Err(crate::host::SeamError::Db(
                "pending SSO identity belongs to another user".into(),
            ));
        }
        operations.push(sso_identities::write_operation(identity)?.into());
    }
    Ok(operations)
}

pub(super) fn existing(
    found: UserEntry,
    pending_identity: Option<&SsoIdentityEntry>,
    proof: &VerificationEntry,
    ip: Option<String>,
    user_agent: Option<String>,
) -> Result<(UserEntry, bool, Option<TokenPair>), RouteError> {
    let current =
        users::find_by_id_versioned(&found.id)?.ok_or(RouteError::Status(400, "invalid_state"))?;
    let mut user = current.value;
    let now = clock::now_iso();
    user.last_login_at = Some(now.clone());
    user.updated_at = now;
    let context = auth::default_org_context(&user)?;
    let (tokens, session) = auth::prepare_session(
        &user,
        &context,
        ip.clone(),
        user_agent.clone(),
        Some(clock::now_iso()),
    )?;
    let op = ConditionalBatchOp::new(
        ConditionalOperation::CompleteSsoAuthentication,
        serde_json::json!({
            "verification": verification_params(proof),
            "user": {"entryKey": current.entry_key, "expectedUpdatedAt": current.updated_at, "data": user},
            "session": {"entryKey": session.id, "data": session},
        }),
    );
    let mut operations = vec![op.into()];
    if let Some(identity) = pending_identity {
        if identity.user_id != user.id {
            return Err(RouteError::Status(400, "invalid_state"));
        }
        operations.push(sso_identities::write_operation(identity)?.into());
    }
    let result = db::batch_with_results(&operations)?;
    verifications::consumed_payload(&result, proof, &[SSO_STATE_TYPE])?;
    verifications::require_result_status(&result, "completed")?;
    auth::maybe_alert_new_device_after_session(
        &user,
        ip.as_deref(),
        user_agent.as_deref(),
        &session.id,
    );
    Ok((user, false, Some(tokens)))
}

pub(super) fn new(
    user: UserEntry,
    identity: &SsoIdentityEntry,
    org_id: &str,
    proof: &VerificationEntry,
    ip: Option<String>,
    user_agent: Option<String>,
) -> Result<(UserEntry, bool, Option<TokenPair>), RouteError> {
    let membership = MembershipEntry {
        id: Uuid::new_v4().to_string(),
        user_id: user.id.clone(),
        org_id: org_id.to_string(),
        role: "member".into(),
        joined_at: clock::now_iso(),
    };
    let context = TokenContext {
        org_id: Some(org_id.to_string()),
        role: Some("member".into()),
        email_verified: Some(user.email_verified),
        ..Default::default()
    };
    let gate = super::super::invite_codes::gate_enabled();
    let pending = gate.then(|| super::super::invite_codes::pending_account(&user.id));
    let prepared = (!gate)
        .then(|| {
            auth::prepare_session(
                &user,
                &context,
                ip.clone(),
                user_agent.clone(),
                Some(clock::now_iso()),
            )
        })
        .transpose()?;
    registration_account::create_with_sso_identity(
        &user,
        identity,
        &membership,
        prepared.as_ref().map(|(_, session)| session),
        pending.as_ref(),
        Some(RegistrationProof::Verification(proof, &[SSO_STATE_TYPE])),
    )?;
    super::super::flag_email_collision(
        user.email.as_deref().unwrap_or(""),
        "cedros-login:sso-callback",
    );
    if let Some((tokens, session)) = prepared {
        auth::maybe_alert_new_device_after_session(
            &user,
            ip.as_deref(),
            user_agent.as_deref(),
            &session.id,
        );
        Ok((user, true, Some(tokens)))
    } else {
        Ok((user, true, None))
    }
}

fn verification_params(proof: &VerificationEntry) -> serde_json::Value {
    serde_json::json!({
        "entryKey": proof.id,
        "tokenHash": proof.token_hash,
        "allowedTokenTypes": [SSO_STATE_TYPE],
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn verification(id: &str, user_id: &str, token_type: &str) -> VerificationEntry {
        VerificationEntry {
            id: id.into(),
            user_id: user_id.into(),
            token_hash: format!("hash-{id}"),
            token_type: token_type.into(),
            target_email: None,
            subject_id: None,
            created_at: "2026-09-16T00:00:00Z".into(),
            expires_at: "2026-09-16T00:05:00Z".into(),
            used_at: None,
        }
    }

    #[test]
    fn invite_handoff_atomically_consumes_state_and_persists_identity() {
        let proof = verification("state-1", "", SSO_STATE_TYPE);
        let pending = verification("pending-1", "user-1", "invite_code_pending");
        let identity = SsoIdentityEntry {
            id: format!("sso:{}", "a".repeat(64)),
            user_id: "user-1".into(),
            created_at: "2026-09-16T00:00:00Z".into(),
        };

        let operations = pending_invite_operations(&proof, &pending, Some(&identity)).unwrap();
        let value = serde_json::to_value(&operations).unwrap();
        let ops = value.as_array().unwrap();
        assert_eq!(ops.len(), 3);
        assert_eq!(
            ops[0]["operationId"],
            "identity.verifications.consume-live-purpose-bound"
        );
        assert_eq!(ops[1]["contentModelId"], "cedros-login:verifications");
        assert_eq!(ops[1]["data"]["tokenType"], "invite_code_pending");
        assert_eq!(ops[2]["contentModelId"], "cedros-login:sso-identities");
        assert_eq!(ops[2]["data"]["userId"], "user-1");
    }

    #[test]
    fn invite_handoff_rejects_cross_user_identity() {
        let proof = verification("state-1", "", SSO_STATE_TYPE);
        let pending = verification("pending-1", "user-1", "invite_code_pending");
        let identity = SsoIdentityEntry {
            id: format!("sso:{}", "a".repeat(64)),
            user_id: "user-2".into(),
            created_at: "2026-09-16T00:00:00Z".into(),
        };
        assert!(pending_invite_operations(&proof, &pending, Some(&identity)).is_err());
    }
}
