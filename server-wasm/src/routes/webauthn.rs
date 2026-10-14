//! WebAuthn/passkey ceremony routes (`cedros-login:webauthn`). Port of
//! server/src/handlers/webauthn.rs, verifying with the pure-Rust RP
//! ([`crate::services::webauthn`]) instead of webauthn-rs.
//!
//! Three flows: an authenticated user **registers** a passkey, a user
//! **authenticates** (logs in) with one, and a new user **signs up**
//! passwordlessly. The per-request fresh instance means challenge state is
//! persisted between begin and finish in the `verifications` store keyed by a
//! `challengeId`; the signup ceremony's email/name are supplied at verify time.
use serde::Deserialize;
use serde_json::{json, Value};
use uuid::Uuid;

#[path = "webauthn/authentication.rs"]
mod authentication;
#[path = "webauthn/ceremony.rs"]
mod ceremony;
#[path = "webauthn/signup_completion.rs"]
mod signup_completion;

use ceremony::{extract_assertion, extract_registration, load_challenge, new_challenge};

use super::auth::{self, authenticated_user, require_step_up};
use super::webauthn_support::{
    config, creation_options, request_options, require_enabled, REQUIRE_USER_VERIFICATION,
};
use super::{cookies, error_response, json, RouteError};
use crate::clock;
use crate::data::credentials::{self, CredentialEntry};
use crate::data::users::{self, UserEntry};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, telemetry, to_json};
use crate::services::{email, webauthn as rp, AuthError};

const CHALLENGE_TTL_SECS: i64 = 5 * 60;
const REGISTER_CHALLENGE: &str = "webauthn_register";
const AUTH_CHALLENGE: &str = "webauthn_auth";
const SIGNUP_CHALLENGE: &str = "webauthn_signup";
const MIN_AUTH_CREDENTIAL_HINTS: usize = 16;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VerifyRegisterRequest {
    challenge_id: String,
    credential: Value,
    #[serde(default)]
    label: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct StartAuthRequest {
    #[serde(default)]
    email: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VerifyAuthRequest {
    challenge_id: String,
    credential: Value,
}

pub fn register_options(request: &RouteRequest) -> RouteResponse {
    run(register_options_inner(request))
}
pub fn register_verify(request: &RouteRequest) -> RouteResponse {
    run(register_verify_inner(request))
}
pub fn auth_options(request: &RouteRequest) -> RouteResponse {
    run(auth_options_inner(request))
}
pub fn auth_verify(request: &RouteRequest) -> RouteResponse {
    run(auth_verify_inner(request))
}
pub fn signup_options(request: &RouteRequest) -> RouteResponse {
    run(signup_options_inner(request))
}
pub fn signup_verify(request: &RouteRequest) -> RouteResponse {
    run(signup_verify_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// POST /webauthn/register/options — begin adding a passkey (authenticated).
fn register_options_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let claims = authenticated_user(request)?;
    require_step_up(&claims)?;
    super::abuse::enforce_challenge_action(request, &claims.sub)?;
    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(401, "invalid_token"))?;
    let cfg = config(request)?;

    let (challenge_id, challenge) = new_challenge(
        &claims.sub,
        REGISTER_CHALLENGE,
        &cfg,
        &[],
        Some(&claims.sid),
    )?;
    let exclude: Vec<String> = credentials::find_by_user(&claims.sub)?
        .into_iter()
        .map(|c| c.id)
        .collect();
    let name = user
        .email
        .clone()
        .or_else(|| user.username.clone())
        .unwrap_or_else(|| user.id.clone());
    let options = creation_options(
        &cfg,
        &user.id,
        &name,
        user.name.as_deref().unwrap_or(""),
        &challenge,
        &exclude,
    );
    Ok(json(
        200,
        &to_json(&json!({ "challengeId": challenge_id, "options": options }))?,
    ))
}

/// POST /webauthn/register/verify — finish adding a passkey (authenticated).
fn register_verify_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let claims = authenticated_user(request)?;
    require_step_up(&claims)?;
    super::abuse::enforce_proof_action(request, &claims.sub)?;
    let req: VerifyRegisterRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let cfg = config(request)?;

    let proof = load_challenge(
        &req.challenge_id,
        REGISTER_CHALLENGE,
        Some(&claims.sub),
        &cfg,
    )?;
    proof.require_session(&claims.sid)?;
    let (client_data, attestation_object) = extract_registration(&req.credential)?;
    let origins: Vec<&str> = cfg.origins.iter().map(String::as_str).collect();
    let reg = rp::verify_registration(
        &client_data,
        &attestation_object,
        proof.challenge(),
        &origins,
        &cfg.rp_id,
        REQUIRE_USER_VERIFICATION,
    )?;

    ceremony::verify_registration_id(&req.credential, &reg.credential_id_b64)?;

    // Fetch the account before persisting so a vanished user fails closed
    // without leaving an orphaned credential row.
    let mut current = users::find_by_id_versioned(&claims.sub)?
        .ok_or(RouteError::Status(401, "invalid_token"))?;
    if !current
        .value
        .auth_methods
        .iter()
        .any(|method| method == "webauthn")
    {
        current.value.auth_methods.push("webauthn".into());
    }
    current.value.updated_at = clock::now_iso();
    let user = &current.value;
    let credential = CredentialEntry {
        id: reg.credential_id_b64.clone(),
        user_id: claims.sub.clone(),
        public_key: reg.cose_public_key_b64,
        sign_count: reg.sign_count,
        backup_eligible: Some(reg.backup_eligible),
        label: req.label,
        created_at: clock::now_iso(),
        last_used_at: None,
    };
    let op = crate::host::db::ConditionalBatchOp::new(
        crate::host::db::ConditionalOperation::CompleteWebauthnRegistration,
        serde_json::json!({
            "verification": verification_params(&proof.entry, REGISTER_CHALLENGE),
            "credential": {"entryKey": credential.id, "data": credential},
            "expectedUserId": claims.sub,
        }),
    );
    let revoke = crate::host::db::ConditionalBatchOp::new(
        crate::host::db::ConditionalOperation::RevokeSessions,
        serde_json::json!({
            "userId": claims.sub,
            "reason": "passkey_credential_linked",
            "exceptSessionId": claims.sid,
            "user": {"entryKey": current.entry_key, "expectedUpdatedAt": current.updated_at, "data": user},
        }),
    );
    let result = crate::host::db::batch_with_results(&[op.into(), revoke.into()])?;
    crate::data::verifications::consumed_payload(&result, &proof.entry, &[REGISTER_CHALLENGE])?;
    crate::data::verifications::require_result_status(&result, "registered")?;
    crate::data::verifications::require_result_bool(&result, "alreadyApplied")?;
    super::emit_identifier_linked("webauthn", "cedros-login:webauthn-register-verify");
    // `linked` + `user` preserve the published auth-response compatibility
    // contract for callers that need the updated account summary.
    Ok(json(
        200,
        &to_json(&json!({
            "verified": true,
            "credentialId": reg.credential_id_b64,
            "linked": "webauthn",
            "user": auth::user_view(user),
        }))?,
    ))
}

/// POST /webauthn/auth/options — begin passkey login. Email-first flows retain
/// non-resident security-key support, but the credential list is padded with
/// random valid IDs so response shape does not disclose account existence.
fn auth_options_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let req: StartAuthRequest =
        from_json(&request.body).unwrap_or(StartAuthRequest { email: None });
    let cfg = config(request)?;
    let allow = auth_credential_hints(req.email)?;
    let challenge_user = String::new();
    let (challenge_id, challenge) =
        new_challenge(&challenge_user, AUTH_CHALLENGE, &cfg, &allow, None)?;
    let options = request_options(&cfg, &challenge, &allow);
    Ok(json(
        200,
        &to_json(&json!({ "challengeId": challenge_id, "options": options }))?,
    ))
}

fn auth_credential_hints(email_hint: Option<String>) -> Result<Vec<String>, RouteError> {
    let lookup_user_id = match email_hint {
        Some(email) => auth::find_user_by_verified_email(&email::normalize_email(&email))?
            .map(|user| user.id)
            .unwrap_or_else(|| Uuid::new_v4().to_string()),
        None => return Ok(Vec::new()),
    };
    let ids = credentials::find_by_user(&lookup_user_id)?
        .into_iter()
        .map(|credential| credential.id)
        .collect();
    Ok(pad_credential_hints(ids))
}

fn pad_credential_hints(mut ids: Vec<String>) -> Vec<String> {
    while ids.len() < MIN_AUTH_CREDENTIAL_HINTS {
        ids.push(crate::services::tokens::generate_verification_token());
    }
    ids
}

/// POST /webauthn/auth/verify — finish passkey login; issues a session.
fn auth_verify_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    authentication::run(request)
}

fn verification_params(
    proof: &crate::data::verifications::VerificationEntry,
    kind: &str,
) -> serde_json::Value {
    serde_json::json!({
        "entryKey": proof.id,
        "tokenHash": proof.token_hash,
        "allowedTokenTypes": [kind],
    })
}

/// Optional hints for the signup ceremony. The unified passkey flow posts an
/// empty body (`{}`); an email, when supplied, only labels the authenticator UI.
/// The account's real email/name are captured at verify time.
#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct SignupOptionsRequest {
    #[serde(default)]
    email: Option<String>,
    #[serde(default)]
    name: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SignupVerifyRequest {
    challenge_id: String,
    credential: Value,
    #[serde(default)]
    email: Option<String>,
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    label: Option<String>,
    #[serde(default)]
    referral: Option<String>,
    #[serde(default, alias = "access_code")]
    access_code: Option<String>,
}

/// POST /webauthn/signup/options — begin passwordless signup.
///
/// Mirrors the native handler + the UI contract: **no email is required at
/// options time** (the unified `continueWithPasskey` flow posts `{}`). A fresh
/// ephemeral user id anchors the ceremony; the email/name (if any) are captured
/// at verify time, so only the raw challenge is persisted here.
fn signup_options_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let req: SignupOptionsRequest = from_json(&request.body).unwrap_or_default();
    let cfg = config(request)?;

    let pending_user_id = Uuid::new_v4().to_string();
    let (challenge_id, challenge) =
        new_challenge(&pending_user_id, SIGNUP_CHALLENGE, &cfg, &[], None)?;

    // Authenticator-UI label only (cosmetic); the real identity is set at verify.
    let name = req
        .email
        .as_deref()
        .map(str::trim)
        .filter(|e| !e.is_empty())
        .unwrap_or(&pending_user_id);
    let options = creation_options(
        &cfg,
        &pending_user_id,
        name,
        req.name.as_deref().unwrap_or(""),
        &challenge,
        &[],
    );
    Ok(json(
        200,
        &to_json(&json!({ "challengeId": challenge_id, "options": options }))?,
    ))
}

/// POST /webauthn/signup/verify — finish signup: create the user + credential.
/// Email/name are optional here. Email ownership is linked only from an
/// authenticated account session; accepting an unverified address alongside a
/// new passkey would let an attacker pre-register someone else's address.
fn signup_verify_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let req: SignupVerifyRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    super::signup_access::enforce(req.access_code.as_deref())?;
    let _accepted_referral = req
        .referral
        .as_deref()
        .map(str::trim)
        .filter(|code| !code.is_empty());
    let cfg = config(request)?;
    let proof = load_challenge(&req.challenge_id, SIGNUP_CHALLENGE, None, &cfg)?;
    let pending_user_id = proof.user_id().to_string();
    let (client_data, attestation_object) = extract_registration(&req.credential)?;
    let origins: Vec<&str> = cfg.origins.iter().map(String::as_str).collect();
    let reg = rp::verify_registration(
        &client_data,
        &attestation_object,
        proof.challenge(),
        &origins,
        &cfg.rp_id,
        REQUIRE_USER_VERIFICATION,
    )?;

    ceremony::verify_registration_id(&req.credential, &reg.credential_id_b64)?;
    let email = signup_email(&req)?;
    let (user, credential) = build_signup_rows(req, pending_user_id, email, reg);
    signup_completion::persist(request, user, credential, &proof.entry)
}

fn signup_email(request: &SignupVerifyRequest) -> Result<Option<String>, RouteError> {
    let Some(raw) = request
        .email
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
    else {
        return Ok(None);
    };
    if !email::is_valid_email(raw) {
        return Err(AuthError::Validation(vec!["Invalid email format".into()]).into());
    }
    Err(RouteError::Status(409, "email_requires_authenticated_link"))
}

fn build_signup_rows(
    request: SignupVerifyRequest,
    user_id: String,
    email: Option<String>,
    registration: rp::RegisteredCredential,
) -> (UserEntry, CredentialEntry) {
    let now = clock::now_iso();
    let user = UserEntry {
        id: user_id,
        email,
        email_verified: false, // a passkey does not verify the email address
        password_hash: None,
        name: request.name,
        username: None,
        picture: None,
        wallet_address: None,
        evm_wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec!["webauthn".to_string()],
        suspended_at: None,
        is_system_admin: false,
        created_at: now.clone(),
        updated_at: now.clone(),
        last_login_at: Some(now),
        welcome_completed_at: None,
        avatar_content_type: None,
    };
    let credential = CredentialEntry {
        id: registration.credential_id_b64,
        user_id: user.id.clone(),
        public_key: registration.cose_public_key_b64,
        sign_count: registration.sign_count,
        backup_eligible: Some(registration.backup_eligible),
        label: request.label,
        created_at: clock::now_iso(),
        last_used_at: None,
    };
    (user, credential)
}

#[cfg(test)]
#[path = "webauthn_tests.rs"]
mod tests;
