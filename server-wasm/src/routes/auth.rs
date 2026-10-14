//! Public email/password auth: register + login. Faithful port of the
//! security-critical path from `server/src/handlers/auth/{register,login}.rs`.
//!
//! Auth domain: these are PUBLIC — the host `authenticated` flag is false here
//! (normal); the session is issued in the response (Set-Cookie when cookies are
//! enabled, else tokens in the body — matching the standalone).
//!
//! Org/role token context IS wired: [`issue_session`] stamps the user's default
//! membership (org_id + role) into the access token via [`default_org_context`].
//!
//! Implemented: email-verification gate + verification email, the new-device
//! security-alert, the `setup_mfa` post-login action (security_require_mfa).
//! DEFERRED (tracked, not silently dropped): AuthCallback, referral persistence,
//! API key issuance, disposable-email blocking, and host-driven trust-proxy IP
//! extraction.
use serde::Deserialize;
use uuid::Uuid;

#[path = "auth/login.rs"]
mod login_flow;
#[path = "auth/registration.rs"]
mod registration;
#[path = "auth_request.rs"]
mod request_helpers;
pub(crate) use request_helpers::require_browser_auth_origin;
#[path = "auth_response.rs"]
mod response;
pub(crate) use response::{
    respond, respond_invite_code_required, respond_redeemed, respond_rotated,
    respond_without_session, respond_without_session_redeemed, user_view, AuthUserView,
    InviteDiscountView, PostLoginAction,
};
#[path = "auth_session.rs"]
mod session_helpers;
#[cfg(test)]
pub(crate) use request_helpers::default_org_id_from_setting;
pub(crate) use request_helpers::{client_ip, default_org_id_from_optional_setting, user_agent};
#[cfg(test)]
pub(crate) use session_helpers::user_blocks_session_when_verification_required;
pub(crate) use session_helpers::{
    access_token, authenticated_context, authenticated_user, authoritative_session,
    authorization_principal, build_jwt, default_org_context, email_blocks_signup,
    email_verification_blocks_session, ensure_email_verified_session_allowed,
    find_user_by_password_email, find_user_by_verified_email, hmac_secret, issue_session,
    maybe_alert_new_device_after_session, prepare_session, principal, refresh_ttl_secs,
    register_should_issue_session, require_step_up, resolve_default_org_id, rotate_signing_key,
    touch_login_timestamp, AuthenticatedContext, JWKS_CACHE_MAX_AGE_SECS,
};

use super::cookies;
use super::{error_response, json, RouteError};
use crate::clock;
use crate::data::login_attempts::{self, LoginAttemptEntry};
use crate::data::memberships::MembershipEntry;
use crate::data::registration_account;
use crate::data::totp;
use crate::data::users::UserEntry;
use crate::data::verifications::VerificationEntry;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::db::{BatchOp, VERIFICATIONS};
use crate::host::{from_json, settings, telemetry};
use crate::services::email;

use crate::services::jwt::TokenContext;
use crate::services::password::PasswordService;
use crate::services::tokens::{generate_verification_token, hash_verification_token};
use crate::services::AuthError;

/// Token type for the short-lived MFA step-up token.
const MFA_PENDING_TOKEN_TYPE: &str = "mfa_pending";
const MFA_PENDING_TTL_SECS: i64 = 5 * 60;

pub(crate) const LOCKOUT_MAX_FAILURES: u64 = 5;
pub(crate) const LOCKOUT_WINDOW_SECS: i64 = 15 * 60;
pub(crate) const MFA_MAX_FAILURES: u64 = 5;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RegisterRequest {
    email: String,
    password: String,
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    referral: Option<String>,
    #[serde(default, alias = "access_code")]
    access_code: Option<String>,
    /// Optional inline invite code: when the invite-code gate is on, supplying a
    /// valid code here completes registration immediately instead of returning an
    /// invite-code-required response.
    #[serde(default)]
    invite_code: Option<String>,
    /// Optional same-origin continuation carried through email verification.
    #[serde(default)]
    return_to: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoginRequest {
    email: String,
    password: String,
}

pub fn register(request: &RouteRequest) -> RouteResponse {
    match register_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

pub fn login(request: &RouteRequest) -> RouteResponse {
    match login_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn register_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    registration::run(request)
}

fn login_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    login_flow::run(request)
}

/// Issue a short-lived MFA-pending token (stored hashed) and tell the client to
/// complete login via POST /login/mfa with a TOTP code.
pub(crate) fn mfa_challenge(user: &UserEntry, method: &str) -> Result<RouteResponse, RouteError> {
    let (response, op) = prepare_mfa_challenge(user, method)?;
    let current = crate::host::db::read_versioned::<UserEntry>(crate::host::db::USERS, &user.id)?
        .filter(|row| row.value == *user)
        .ok_or(RouteError::Status(401, "stale_authentication"))?;
    crate::host::db::compare_and_set(&[current.condition], &[op])?;
    Ok(response)
}

/// Prepare an MFA challenge response and persistence operation without writing.
/// Proof-based login flows compose this operation into their claim transaction.
pub(crate) fn prepare_mfa_challenge(
    user: &UserEntry,
    method: &str,
) -> Result<(RouteResponse, BatchOp), RouteError> {
    prepare_mfa_challenge_bound(user, method, None)
}

/// Prepare an MFA challenge bound to a pending resource mutation. The binding
/// is server-generated and persisted with the challenge so the mutation can be
/// committed only after the second factor succeeds.
pub(crate) fn prepare_mfa_challenge_bound(
    user: &UserEntry,
    method: &str,
    subject_id: Option<String>,
) -> Result<(RouteResponse, BatchOp), RouteError> {
    if !matches!(
        method,
        "password" | "email" | "google" | "apple" | "solana" | "webauthn" | "sso"
    ) {
        return Err(RouteError::Status(500, "invalid_auth_method"));
    }
    let token = format!(
        "{method}.{}.{}",
        generate_verification_token(),
        crate::data::mfa_challenges::account_binding(user)?
    );
    let now = clock::now_iso();
    let entry = VerificationEntry {
        id: Uuid::new_v4().to_string(),
        user_id: user.id.clone(),
        token_hash: hash_verification_token(&token),
        token_type: MFA_PENDING_TOKEN_TYPE.to_string(),
        target_email: None,
        subject_id,
        created_at: now,
        expires_at: clock::in_secs(MFA_PENDING_TTL_SECS),
        used_at: None,
    };
    let body = serde_json::json!({ "mfaRequired": true, "mfaToken": token, "userId": user.id })
        .to_string();
    let data = serde_json::to_value(&entry)
        .map_err(|error| crate::host::SeamError::Encoding(error.to_string()))?;
    Ok((
        json(200, &body),
        BatchOp::write(VERIFICATIONS, &entry.id, data),
    ))
}

fn record_failure() {
    // Redacted failure signal: a single generic `invalid-credentials` reason for
    // every failure shape (unknown email / no password / wrong password) so the
    // analytics event cannot be used for account enumeration.
    let _ = telemetry::emit_event(
        "cedros-login:login-failed",
        "",
        &serde_json::json!({
            "method": "password",
            "reason": "invalid-credentials",
            "routeId": "cedros-login:login",
        }),
    );
}

pub(crate) fn enforce_mfa_attempt_limit(user_id: &str) -> Result<(), RouteError> {
    let since = clock::ago_iso(LOCKOUT_WINDOW_SECS);
    if login_attempts::count_recent_failures(&format!("mfa:{user_id}"), &since)? >= MFA_MAX_FAILURES
    {
        return Err(RouteError::Status(429, "too_many_mfa_attempts"));
    }
    Ok(())
}

pub(crate) fn record_mfa_failure(user_id: &str, request: &RouteRequest) {
    let _ = login_attempts::record(&LoginAttemptEntry {
        id: Uuid::new_v4().to_string(),
        user_id: Some(user_id.to_string()),
        email: format!("mfa:{user_id}"),
        ip_address: client_ip(request),
        successful: false,
        attempted_at: clock::now_iso(),
    });
}

fn require_email_enabled() -> Result<(), RouteError> {
    if settings::bool("auth_email_enabled", true) {
        Ok(())
    } else {
        Err(RouteError::Status(404, "email_auth_disabled"))
    }
}

#[cfg(test)]
#[path = "auth_tests.rs"]
mod tests;
