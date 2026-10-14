use super::*;

struct VerifiedAssertion {
    proof: ceremony::PendingChallenge,
    credential: credentials::VersionedCredentialEntry,
    sign_count: u32,
    backup_eligible: bool,
}

pub(super) fn run(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let request_data: VerifyAuthRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let verified = verify(request, request_data)?;
    complete(request, verified)
}

fn verify(
    request: &RouteRequest,
    request_data: VerifyAuthRequest,
) -> Result<VerifiedAssertion, RouteError> {
    let cfg = config(request)?;
    let proof = load_challenge(&request_data.challenge_id, AUTH_CHALLENGE, None, &cfg)?;
    let parsed = extract_assertion(&request_data.credential)?;
    let credential = credentials::find_by_id_versioned(&parsed.credential_id)?
        .ok_or(RouteError::Status(401, "invalid_credentials"))?;
    ceremony::verify_assertion_identity(&parsed, &proof.allowed, &credential.value.user_id)?;
    let cose = rp::b64url_decode(&credential.value.public_key)?;
    let origins: Vec<&str> = cfg.origins.iter().map(String::as_str).collect();
    let assertion = rp::verify_authentication(
        &parsed.client_data,
        &parsed.authenticator_data,
        &parsed.signature,
        &cose,
        credential.value.sign_count,
        proof.challenge(),
        &origins,
        &cfg.rp_id,
        REQUIRE_USER_VERIFICATION,
    )?;
    if credential
        .value
        .backup_eligible
        .is_some_and(|stored| stored != assertion.backup_eligible)
    {
        return Err(RouteError::Status(401, "invalid_credentials"));
    }
    Ok(VerifiedAssertion {
        proof,
        credential,
        sign_count: assertion.sign_count,
        backup_eligible: assertion.backup_eligible,
    })
}

fn complete(
    request: &RouteRequest,
    verified: VerifiedAssertion,
) -> Result<RouteResponse, RouteError> {
    let credential_key = verified.credential.entry_key.clone();
    let credential_version = verified.credential.updated_at.clone();
    let opaque_version = verified.credential.version;
    let mut credential = verified.credential.value;
    credential.sign_count = verified.sign_count;
    credential.backup_eligible = Some(verified.backup_eligible);
    credential.last_used_at = Some(clock::now_iso());
    let current_user = users::find_by_id_versioned(&credential.user_id)?
        .ok_or(RouteError::Status(401, "invalid_token"))?;
    let user_key = current_user.entry_key.clone();
    let user_version = current_user.updated_at.clone();
    let mut user = current_user.value;
    auth::ensure_email_verified_session_allowed(&user)?;
    if let Some(response) =
        super::super::invite_codes::pending_login_response(request, &user, "webauthn")?
    {
        return Ok(response);
    }
    if crate::data::totp::has_mfa(&user.id)? {
        let (response, challenge) = auth::prepare_mfa_challenge(&user, "webauthn")?;
        commit_mfa(
            &verified.proof,
            &credential_key,
            opaque_version.as_deref().unwrap_or(""),
            &credential,
            challenge,
        )?;
        return Ok(response);
    }
    let now = clock::now_iso();
    user.last_login_at = Some(now.clone());
    user.updated_at = now;
    let ip = auth::client_ip(request);
    let agent = auth::user_agent(request);
    let context = auth::default_org_context(&user)?;
    let (tokens, session) = auth::prepare_session(
        &user,
        &context,
        ip.clone(),
        agent.clone(),
        Some(clock::now_iso()),
    )?;
    commit(
        &verified.proof,
        (&credential_key, &credential_version),
        &credential,
        (&user_key, &user_version),
        &user,
        &session,
    )?;
    auth::maybe_alert_new_device_after_session(&user, ip.as_deref(), agent.as_deref(), &session.id);
    emit_authenticated();
    auth::respond(
        200,
        &user,
        tokens,
        false,
        Some("webauthn"),
        &cookies::config(),
    )
}

fn commit_mfa(
    proof: &ceremony::PendingChallenge,
    credential_key: &str,
    credential_version: &str,
    credential: &CredentialEntry,
    challenge: crate::host::db::BatchOp,
) -> Result<(), RouteError> {
    let credential_data = serde_json::to_value(credential)
        .map_err(|error| crate::host::SeamError::Encoding(error.to_string()))?;
    use crate::host::db::{self, Condition, CREDENTIALS, VERIFICATIONS};
    let pending = db::read_versioned::<crate::data::verifications::VerificationEntry>(
        VERIFICATIONS,
        &proof.entry.id,
    )?
    .filter(|current| current.value == proof.entry)
    .ok_or(RouteError::Status(401, "invalid_challenge"))?;
    let conditions = [
        pending.condition,
        Condition::version(CREDENTIALS, credential_key, credential_version)?,
        Condition::absent(VERIFICATIONS, &challenge.entry_key),
    ];
    db::compare_and_set(
        &conditions,
        &[
            db::BatchOp::delete(VERIFICATIONS, &proof.entry.id),
            db::BatchOp::write(CREDENTIALS, credential_key, credential_data),
            challenge,
        ],
    )?;
    Ok(())
}

fn commit(
    proof: &ceremony::PendingChallenge,
    credential_revision: (&str, &str),
    credential: &CredentialEntry,
    user_revision: (&str, &str),
    user: &UserEntry,
    session: &crate::data::sessions::SessionEntry,
) -> Result<(), RouteError> {
    let op = crate::host::db::ConditionalBatchOp::new(
        crate::host::db::ConditionalOperation::CompleteWebauthnAuthentication,
        serde_json::json!({
            "verification": verification_params(&proof.entry, AUTH_CHALLENGE),
            "credential": {"entryKey":credential_revision.0,
                "expectedUpdatedAt":credential_revision.1,"data":credential},
            "user": {"entryKey":user_revision.0,"expectedUpdatedAt":user_revision.1,"data":user},
            "session": {"entryKey":session.id,"data":session},
        }),
    );
    let result = crate::host::db::batch_with_results(&[op.into()])?;
    crate::data::verifications::consumed_payload(&result, &proof.entry, &[AUTH_CHALLENGE])?;
    crate::data::verifications::require_result_status(&result, "completed")?;
    Ok(())
}

fn emit_authenticated() {
    for event in ["cedros-login:authenticated", "cedros-login:user-login"] {
        let _ = telemetry::emit_event(
            event,
            "",
            &serde_json::json!({
                "method":"webauthn","routeId":"cedros-login:webauthn-auth-verify"
            }),
        );
    }
}
