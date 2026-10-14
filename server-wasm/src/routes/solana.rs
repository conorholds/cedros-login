//! Solana wallet sign-in: POST /solana/challenge + POST /solana. Ported from
//! server/src/handlers/solana.rs. ed25519 verification runs in-guest (no egress).
//! The client signs the challenge message and returns { publicKey, signature,
//! message }; the nonce is embedded in the message and consumed single-use.
//!
//! POST /solana/link reuses the same challenge/proof and binds the wallet to
//! the AUTHENTICATED user instead of finding-or-creating an account.
//!
//! DEFERRED (tracked): referral persistence, API-key issuance.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::auth::{
    authenticated_user, client_ip, maybe_alert_new_device_after_session, prepare_session,
    require_step_up, resolve_default_org_id, respond, respond_invite_code_required, user_agent,
};
use super::cookies;
use super::{error_response, json, RouteError};
use crate::clock;
use crate::data::memberships::MembershipEntry;
use crate::data::nonces::{self, NonceEntry};
use crate::data::registration_account::{self, RegistrationProof};
use crate::data::users::{self, UserEntry};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::db::{self, AtomicBatchOp, ConditionalBatchOp, ConditionalOperation};
use crate::host::{from_json, settings, telemetry, to_json};
use crate::services::jwt::TokenContext;
use crate::services::jwt::TokenPair;
use crate::services::solana;

const DEFAULT_CHALLENGE_EXPIRY_SECS: i64 = 300;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChallengeRequest {
    public_key: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AuthRequest {
    public_key: String,
    signature: String,
    message: String,
    #[serde(default)]
    referral: Option<String>,
    #[serde(default, alias = "access_code")]
    access_code: Option<String>,
}

/// Body of POST /solana/link: the same signed-challenge proof as sign-in,
/// without signup-only fields (referral / access code).
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LinkRequest {
    public_key: String,
    signature: String,
    message: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ChallengeResponse {
    nonce: String,
    message: String,
    expires_at: String,
}

pub fn challenge(request: &RouteRequest) -> RouteResponse {
    match challenge_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

pub fn authenticate(request: &RouteRequest) -> RouteResponse {
    match auth_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

pub fn link(request: &RouteRequest) -> RouteResponse {
    match link_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn challenge_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let req: ChallengeRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    solana::validate_public_key(&req.public_key)?;

    let expiry = setting_i64(
        "auth_solana_challenge_expiry",
        DEFAULT_CHALLENGE_EXPIRY_SECS,
    )
    .clamp(30, 600);
    let frontend_url = super::frontend_url();
    if frontend_url.is_empty() {
        return Err(RouteError::Status(500, "frontend_url_not_configured"));
    }
    let challenge = solana::generate_challenge(&req.public_key, expiry, Some(&frontend_url));

    nonces::create(&NonceEntry {
        nonce: challenge.nonce.clone(),
        public_key: req.public_key,
        message: challenge.message.clone(),
        created_at: clock::now_iso(),
        expires_at: challenge.expires_at.clone(),
        used_at: None,
    })?;

    let body = to_json(&ChallengeResponse {
        nonce: challenge.nonce,
        message: challenge.message,
        expires_at: challenge.expires_at,
    })?;
    Ok(json(200, &body))
}

/// Verify a signed challenge proves control of `public_key` without consuming
/// it. The caller later claims the nonce with every result write in one host
/// transaction.
fn verify_wallet_proof(
    public_key: &str,
    signature: &str,
    message: &str,
) -> Result<NonceEntry, RouteError> {
    let nonce = solana::extract_nonce(message).ok_or(RouteError::Status(400, "invalid_message"))?;

    // Load first; host-owned completion rechecks liveness and consumes it.
    let entry = nonces::find(&nonce)?.ok_or(RouteError::Status(400, "challenge_expired"))?;
    if entry.used_at.is_some() || entry.expires_at <= clock::now_iso() {
        return Err(RouteError::Status(400, "challenge_expired"));
    }
    // Bind the challenge to this wallet + message, then verify the signature.
    if entry.public_key != public_key || entry.message != message {
        return Err(RouteError::Status(401, "invalid_signature"));
    }
    if !solana::verify_signature(public_key, signature, message)? {
        return Err(RouteError::Status(401, "invalid_signature"));
    }
    Ok(entry)
}

fn auth_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let req: AuthRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let proof = verify_wallet_proof(&req.public_key, &req.signature, &req.message)?;

    let ip = client_ip(request);
    let agent = user_agent(request);
    let (user, is_new, tokens) = match users::find_by_wallet(&req.public_key)? {
        Some(found) => {
            if let Some(response) =
                super::invite_codes::pending_login_response(request, &found, "solana")?
            {
                return Ok(response);
            }
            if crate::data::totp::has_mfa(&found.id)? {
                let current = users::find_by_id_versioned(&found.id)?
                    .ok_or(RouteError::Status(401, "invalid_token"))?;
                let (response, challenge) =
                    super::auth::prepare_mfa_challenge(&current.value, "solana")?;
                complete_solana_proof(
                    &proof,
                    &current.entry_key,
                    &current.updated_at,
                    &current.value,
                    None,
                    Some(challenge),
                    None,
                )?;
                return Ok(response);
            }
            complete_existing_login(found, &proof, ip.clone(), agent.clone())?
        }
        None => {
            let user = new_solana_user(&req)?;
            complete_new_login(user, &proof, ip.clone(), agent.clone())?
        }
    };
    emit_solana_login(is_new);
    let Some(tokens) = tokens else {
        let pending = super::invite_codes::issue_pending_token(&user.id)?;
        let status = super::invite_codes::pending_handoff_status(request, &user)?;
        return respond_invite_code_required(201, &user, true, Some("solana"), &pending, status);
    };
    respond(
        if is_new { 201 } else { 200 },
        &user,
        tokens,
        is_new,
        Some("solana"),
        &cookies::config(),
    )
}

fn new_solana_user(request: &AuthRequest) -> Result<UserEntry, RouteError> {
    super::signup_access::enforce(request.access_code.as_deref())?;
    let _accepted_referral = request
        .referral
        .as_deref()
        .map(str::trim)
        .filter(|v| !v.is_empty());
    let now = clock::now_iso();
    Ok(UserEntry {
        id: Uuid::new_v4().to_string(),
        email: None,
        email_verified: false,
        password_hash: None,
        name: None,
        username: None,
        picture: None,
        wallet_address: Some(request.public_key.clone()),
        evm_wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec!["solana".into()],
        suspended_at: None,
        is_system_admin: false,
        created_at: now.clone(),
        updated_at: now.clone(),
        last_login_at: Some(now),
        welcome_completed_at: None,
        avatar_content_type: None,
    })
}

fn emit_solana_login(is_new: bool) {
    let events = if is_new {
        [
            "cedros-login:registered",
            "cedros-login:registration-created",
        ]
    } else {
        ["cedros-login:authenticated", "cedros-login:user-login"]
    };
    for event in events {
        let _ = telemetry::emit_event(
            event,
            "",
            &serde_json::json!({
                "method":"solana","routeId":"cedros-login:solana-login"
            }),
        );
    }
}

/// POST /solana/link — attach a wallet to the AUTHENTICATED user. Same
/// challenge/proof as sign-in (`POST /solana/challenge` first), but binds the
/// wallet to the current account instead of finding-or-creating one. Mirrors
/// POST /link-oauth: 409 when the wallet belongs to another account, 409 when
/// the account already has a different wallet (unlink it first).
fn link_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let claims = authenticated_user(request)?;
    require_step_up(&claims)?;
    super::abuse::enforce_proof_action(request, &claims.sub)?;
    let req: LinkRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    solana::validate_public_key(&req.public_key)?;
    let proof = verify_wallet_proof(&req.public_key, &req.signature, &req.message)?;

    // The caller proved control of the wallet's key, so naming the conflict
    // (vs. this account's own state) leaks nothing about other identities.
    if let Some(other) = users::find_by_wallet(&req.public_key)? {
        if other.id != claims.sub {
            return Err(RouteError::Status(409, "already_linked_to_another_account"));
        }
    }
    let current = users::find_by_id_versioned(&claims.sub)?
        .ok_or(RouteError::Status(404, "user_not_found"))?;
    let mut user = current.value;
    if let Some(existing) = user.wallet_address.as_deref() {
        if existing != req.public_key {
            // One wallet per account: replacing silently would swap a
            // money-bearing identifier. The client unlinks first (DELETE
            // /credentials/solana), then links the new wallet.
            return Err(RouteError::Status(409, "wallet_already_linked"));
        }
    }
    user.wallet_address = Some(req.public_key.clone());
    if !user.auth_methods.iter().any(|m| m == "solana") {
        user.auth_methods.push("solana".to_string());
    }
    user.updated_at = clock::now_iso();
    complete_solana_proof(
        &proof,
        &current.entry_key,
        &current.updated_at,
        &user,
        None,
        None,
        Some(&claims.sid),
    )?;
    super::emit_identifier_linked("wallet", "cedros-login:solana-link");
    let body = to_json(&serde_json::json!({
        "linked": "solana",
        "user": super::auth::user_view(&user),
    }))?;
    Ok(json(200, &body))
}

fn require_enabled() -> Result<(), RouteError> {
    let enabled = settings::bool("auth_solana_enabled", false);
    if enabled {
        Ok(())
    } else {
        Err(RouteError::Status(404, "solana_auth_disabled"))
    }
}

fn setting_i64(key: &str, default: i64) -> i64 {
    settings::get(key)
        .ok()
        .flatten()
        .and_then(|v| v.trim().trim_matches('"').parse().ok())
        .unwrap_or(default)
}

fn complete_existing_login(
    found: UserEntry,
    proof: &NonceEntry,
    ip: Option<String>,
    user_agent: Option<String>,
) -> Result<(UserEntry, bool, Option<TokenPair>), RouteError> {
    let current =
        users::find_by_id_versioned(&found.id)?.ok_or(RouteError::Status(401, "invalid_token"))?;
    let mut user = current.value;
    let now = clock::now_iso();
    user.last_login_at = Some(now.clone());
    user.updated_at = now;
    let context = super::auth::default_org_context(&user)?;
    let (tokens, session) = prepare_session(
        &user,
        &context,
        ip.clone(),
        user_agent.clone(),
        Some(clock::now_iso()),
    )?;
    complete_solana_proof(
        proof,
        &current.entry_key,
        &current.updated_at,
        &user,
        Some(&session),
        None,
        None,
    )?;
    maybe_alert_new_device_after_session(&user, ip.as_deref(), user_agent.as_deref(), &session.id);
    Ok((user, false, Some(tokens)))
}

fn complete_new_login(
    user: UserEntry,
    proof: &NonceEntry,
    ip: Option<String>,
    user_agent: Option<String>,
) -> Result<(UserEntry, bool, Option<TokenPair>), RouteError> {
    let org_id = resolve_default_org_id()?;
    let membership = MembershipEntry {
        id: Uuid::new_v4().to_string(),
        user_id: user.id.clone(),
        org_id: org_id.clone(),
        role: "member".into(),
        joined_at: clock::now_iso(),
    };
    let context = TokenContext {
        org_id: Some(org_id),
        role: Some("member".into()),
        email_verified: Some(false),
        ..Default::default()
    };
    let gate = super::invite_codes::gate_enabled();
    let pending = gate.then(|| super::invite_codes::pending_account(&user.id));
    let prepared = (!gate)
        .then(|| {
            prepare_session(
                &user,
                &context,
                ip.clone(),
                user_agent.clone(),
                Some(clock::now_iso()),
            )
        })
        .transpose()?;
    registration_account::create(
        &user,
        None,
        &membership,
        prepared.as_ref().map(|(_, session)| session),
        pending.as_ref(),
        Some(RegistrationProof::Nonce(proof)),
    )?;
    if let Some((tokens, session)) = prepared {
        maybe_alert_new_device_after_session(
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

fn complete_solana_proof(
    proof: &NonceEntry,
    entry_key: &str,
    updated_at: &str,
    user: &UserEntry,
    session: Option<&crate::data::sessions::SessionEntry>,
    mfa_challenge: Option<crate::host::db::BatchOp>,
    revoke_except_session_id: Option<&str>,
) -> Result<(), RouteError> {
    let mut params = serde_json::json!({
        "nonce": {"entryKey": proof.nonce, "publicKey": proof.public_key, "message": proof.message},
        "user": {"entryKey": entry_key, "expectedUpdatedAt": updated_at, "data": user},
    });
    if let Some(session) = session {
        params["session"] = serde_json::json!({"entryKey": session.id, "data": session});
    }
    let op = ConditionalBatchOp::new(ConditionalOperation::CompleteSolanaProof, params);
    let mut operations: Vec<AtomicBatchOp> = vec![op.into()];
    if let Some(challenge) = mfa_challenge {
        operations.push(challenge.into());
    }
    if let Some(session_id) = revoke_except_session_id {
        operations.push(
            ConditionalBatchOp::new(
                ConditionalOperation::RevokeSessions,
                serde_json::json!({
                    "userId": user.id,
                    "reason": "wallet_credential_linked",
                    "exceptSessionId": session_id,
                }),
            )
            .into(),
        );
    }
    let result = db::batch_with_results(&operations)?;
    let output = &result
        .results
        .first()
        .ok_or(RouteError::Status(502, "db_error"))?
        .output;
    if output
        .get("walletAddress")
        .and_then(serde_json::Value::as_str)
        != user.wallet_address.as_deref()
        || output.get("status").and_then(serde_json::Value::as_str) != Some("completed")
    {
        return Err(RouteError::Status(502, "db_error"));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn link_request_parses_camel_case_proof_fields() {
        let req: LinkRequest =
            serde_json::from_str(r#"{"publicKey":"pk","signature":"sig","message":"msg"}"#)
                .unwrap();
        assert_eq!(req.public_key, "pk");
        assert_eq!(req.signature, "sig");
        assert_eq!(req.message, "msg");
    }

    #[test]
    fn auth_request_accepts_camel_and_legacy_access_code_keys() {
        let camel: AuthRequest = serde_json::from_str(
            r#"{"publicKey":"pk","signature":"sig","message":"msg","accessCode":"launch"}"#,
        )
        .unwrap();
        assert_eq!(camel.access_code.as_deref(), Some("launch"));

        let legacy: AuthRequest = serde_json::from_str(
            r#"{"publicKey":"pk","signature":"sig","message":"msg","access_code":"legacy"}"#,
        )
        .unwrap();
        assert_eq!(legacy.access_code.as_deref(), Some("legacy"));
    }
    #[test]
    fn signed_wallet_proof_rejects_expiry_replay_other_wallet_and_other_site() {
        use base64::Engine;
        use ed25519_dalek::{Signer, SigningKey};
        let key = SigningKey::from_bytes(&[7; 32]);
        let public_key = bs58::encode(key.verifying_key().to_bytes()).into_string();
        let challenge = solana::generate_challenge(&public_key, 300, Some("https://login.example"));
        let signature = base64::engine::general_purpose::STANDARD
            .encode(key.sign(challenge.message.as_bytes()).to_bytes());
        let good = serde_json::json!({"nonce":challenge.nonce,"publicKey":public_key,"message":challenge.message,
            "createdAt":"2026-01-01T00:00:00Z","expiresAt":"2099-01-01T00:00:00Z","usedAt":null});
        for (field, value, valid) in [
            ("usedAt", serde_json::Value::Null, true),
            ("usedAt", serde_json::json!("2026-01-01T00:00:00Z"), false),
            (
                "expiresAt",
                serde_json::json!("2000-01-01T00:00:00Z"),
                false,
            ),
            ("publicKey", serde_json::json!("other-wallet"), false),
            (
                "message",
                serde_json::json!(challenge.message.replace("login.example", "other.example")),
                false,
            ),
        ] {
            let mut payload = good.clone();
            payload[field] = value;
            db::test_support::with_db(
                move |operation, collection, _| {
                    assert_eq!(operation, "read");
                    assert_eq!(collection.model, db::NONCES.model);
                    Ok(
                        serde_json::json!({"entries":[{"entry_key":payload["nonce"],"payload":payload}]}),
                    )
                },
                || {
                    assert_eq!(
                        verify_wallet_proof(&public_key, &signature, &challenge.message).is_ok(),
                        valid,
                        "{field}"
                    );
                },
            );
        }
        db::test_support::with_db(
            |_, _, _| Ok(serde_json::json!({"entries":[]})),
            || {
                assert!(verify_wallet_proof(&public_key, &signature, &challenge.message).is_err());
            },
        );
    }
}
