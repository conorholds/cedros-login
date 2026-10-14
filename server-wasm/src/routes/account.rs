//! Account lifecycle + recovery: email verification, password reset, change
//! password, and session management. Ported from server/src/handlers/
//! {email_verification,password_reset,password_change,sessions,auth/session}.rs.
//!
//! Public routes (verification/reset) return a generic response regardless of
//! whether the account exists (enumeration resistance). Authenticated routes use
//! the end-user access token (`authenticated_user`). Emails are rendered
//! ([`email_templates`]) and queued to the outbox (the dispatch job delivers
//! them with retry) — a queue failure never changes the generic response.
//!
//! Per-email send throttle (reset/verification/instant-link), instant-link tokens,
//! and the account-deletion confirmation flow are implemented.
use serde::{Deserialize, Serialize};

#[path = "account/deletion.rs"]
mod deletion;
#[path = "account/password.rs"]
mod password_routes;
#[path = "account/sessions.rs"]
mod session_routes;
#[path = "account/tokens.rs"]
mod tokens;

use deletion::{confirm_deletion_inner, delete_account_inner, request_deletion_inner};
pub(crate) use password_routes::issue_password_reset;
use password_routes::{
    change_password_inner, forgot_password_inner, reset_password_inner, set_password_inner,
};
use session_routes::{
    list_sessions_inner, logout_all_inner, revoke_all_sessions_inner, revoke_session_inner,
};
use tokens::prepare_email_token;
pub(crate) use tokens::prepare_token;

use super::auth::{
    authenticated_user, client_ip, issue_session, require_step_up, respond, touch_login_timestamp,
    user_agent, user_view,
};
use super::cookies;
use super::{
    action_link, action_link_with_return_to, error_response, json, validation, RouteError,
};
use crate::clock;
use crate::data::verifications;
use crate::data::{audit, canonical_email, outbox, sessions, user_emails, users};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, log, settings, telemetry, to_json};
use crate::services::email::{is_valid_email, normalize_email, validate_ascii_local};
use crate::services::email_templates;
use crate::services::password::PasswordService;
use crate::services::tokens::hash_verification_token;
use crate::services::AuthError;

const EMAIL_VERIFICATION: &str = "email_verification";
const ACCOUNT_EMAIL_VERIFY: &str = "account_email_verify";
const VERIFICATION_TTL_SECS: i64 = 24 * 60 * 60;
const RESET_TTL_SECS: i64 = 60 * 60;

pub(crate) struct PreparedVerificationEmail {
    pub verification: verifications::VerificationEntry,
    pub outbox: outbox::OutboxEntry,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EmailRequest {
    email: String,
    #[serde(default)]
    return_to: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VerifyRequest {
    token: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChangeEmailRequest {
    new_email: String,
    #[serde(default)]
    current_password: Option<String>,
}

macro_rules! route {
    ($name:ident, $inner:ident) => {
        pub fn $name(request: &RouteRequest) -> RouteResponse {
            match $inner(request) {
                Ok(response) => response,
                Err(err) => error_response(err),
            }
        }
    };
}
route!(send_verification, send_verification_inner);
route!(verify_email, verify_email_inner);
route!(forgot_password, forgot_password_inner);
route!(reset_password, reset_password_inner);
route!(change_password, change_password_inner);
route!(set_password, set_password_inner);
route!(change_email, change_email_inner);
route!(logout_all, logout_all_inner);
route!(list_sessions, list_sessions_inner);
route!(revoke_session, revoke_session_inner);
route!(revoke_all_sessions, revoke_all_sessions_inner);
route!(request_deletion, request_deletion_inner);
route!(confirm_deletion, confirm_deletion_inner);
route!(delete_account, delete_account_inner);

const GENERIC_OK: &str = r#"{"message":"If an account exists, an email has been sent"}"#;
const VERIFIED_EMAIL_OK: &str = r#"{"message":"Email verified successfully"}"#;

/// POST /send-verification — best-effort send; always a generic response.
fn send_verification_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_email_enabled()?;
    send_verification_inner_with(request, users::find_by_email, |user, return_to| {
        enqueue_verification_email(user, return_to);
    })
}

fn send_verification_inner_with(
    request: &RouteRequest,
    find_user: impl FnOnce(&str) -> crate::host::Result<Option<users::UserEntry>>,
    enqueue_email: impl FnOnce(&users::UserEntry, Option<&str>),
) -> Result<RouteResponse, RouteError> {
    let req: EmailRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let normalized = normalize_email(&req.email);
    if let Some(user) = find_user(&normalized)? {
        if !user.email_verified {
            // Keep provider delivery off this unauthenticated request path so
            // response latency does not reveal whether the account exists.
            enqueue_email(&user, req.return_to.as_deref());
        }
    }
    Ok(json(200, GENERIC_OK))
}

/// Queue and immediately dispatch a verification email for signup flows
/// (best-effort, never fails the caller).
pub(crate) fn send_verification_email(user: &users::UserEntry, return_to: Option<&str>) -> bool {
    let Some(prepared) = enqueue_verification_email(user, return_to) else {
        return false;
    };
    dispatch_verification_email(&prepared);
    true
}

/// Persist a verification email for scheduled outbox delivery.
fn enqueue_verification_email(
    user: &users::UserEntry,
    return_to: Option<&str>,
) -> Option<PreparedVerificationEmail> {
    let prepared = prepare_verification_email(user, return_to)?;
    if let Err(error) =
        outbox::enqueue_prepared_token_email(&prepared.verification, &prepared.outbox)
    {
        log::op_warn("auth", "verification-email", error.code());
        return None;
    }
    Some(prepared)
}

/// Best-effort fast path after the verification token and outbox row are
/// durable. The scheduled outbox job remains the retry/failure-recovery owner.
pub(crate) fn dispatch_verification_email(prepared: &PreparedVerificationEmail) {
    if let Err(error) = outbox::dispatch_one(&prepared.outbox.id) {
        log::op_warn("auth", "verification-email-immediate", error.code());
    }
}

/// Prepare the coupled verification and outbox rows without writing either.
/// Password registration passes both to the host's atomic completion operation;
/// resend and account-change flows persist the same rows through `database.batch`.
pub(crate) fn prepare_verification_email(
    user: &users::UserEntry,
    return_to: Option<&str>,
) -> Option<PreparedVerificationEmail> {
    let to = user.email.as_deref()?;
    if super::email_resend_cooldown_active(&user.id, EMAIL_VERIFICATION) {
        return None;
    }
    let design = match crate::services::email_design::resolve("cedros-login/email_verification") {
        Ok(design) => design,
        Err(error) => {
            log::op_warn("email", "resolve-design", error.code());
            return None;
        }
    };
    let token = prepare_email_token(&user.id, to);
    let url = action_link_with_return_to("/verify-email", &token.raw, return_to);
    let email = super::with_subject_override(
        email_templates::verification(
            &design,
            user.name.as_deref(),
            &url,
            VERIFICATION_TTL_SECS / 3600,
        ),
        "email_subject_verification",
    );
    let email = outbox::prepare_user_email(
        &user.id,
        to,
        &email.subject,
        Some(&email.html),
        Some(&email.text),
    );
    Some(PreparedVerificationEmail {
        verification: token.entry,
        outbox: email,
    })
}

/// POST /verify-email — consume the token, mark the user verified.
fn verify_email_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_email_enabled()?;
    let req: VerifyRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let outcome = verify_email_token(&req.token, &[EMAIL_VERIFICATION, ACCOUNT_EMAIL_VERIFY])?;
    if matches!(outcome, canonical_email::VerificationOutcome::AccountEmail) {
        emit_email_verified("additional-email", "cedros-login:account-emails-verify");
        return Ok(json(200, VERIFIED_EMAIL_OK));
    }
    let canonical_email::VerificationOutcome::Canonical {
        user_id,
        email_changed,
        credentials_reset: _,
        completed_initial_verification,
    } = outcome
    else {
        unreachable!("account email outcome returned above")
    };
    if email_changed {
        let _ = audit::log(
            audit::EMAIL_CHANGED,
            Some(&user_id),
            Some("user"),
            Some(&user_id),
        );
    }
    emit_email_verified(
        if email_changed {
            "email-change"
        } else {
            "signup-verify"
        },
        "cedros-login:verify-email",
    );
    if !verification_completes_login(email_changed, completed_initial_verification) {
        return Ok(json(200, VERIFIED_EMAIL_OK));
    }

    // The one-time signup token is proof of mailbox control. Complete the
    // registration by issuing the same session response as a normal login so
    // the browser can continue its preserved returnTo journey immediately.
    // Email-change and additional-email tokens intentionally remain
    // message-only and can never become magic sign-in links.
    let mut user = users::find_by_id(&user_id)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    if let Some(response) = super::invite_codes::pending_login_response(request, &user, "email")? {
        return Ok(response);
    }
    touch_login_timestamp(&mut user);
    let tokens = issue_session(&user, client_ip(request), user_agent(request))?;
    respond(200, &user, tokens, true, Some("email"), &cookies::config())
}

fn verification_completes_login(email_changed: bool, completed_initial_verification: bool) -> bool {
    !email_changed && completed_initial_verification
}

fn emit_email_verified(context: &str, route_id: &str) {
    super::emit_identifier_linked("email", route_id);
    let _ = telemetry::emit_event(
        "cedros-login:email-verified",
        "",
        &serde_json::json!({
            "context": context,
            "routeId": route_id,
        }),
    );
}

/// POST /me/email — change the account email. Re-authenticates with the current
/// password when the account has one (blocks session-only takeover), validates +
/// de-duplicates the new address, and queues a target-bound verification email.
/// The canonical email changes only after /verify-email proves mailbox control.
fn change_email_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_email_enabled()?;
    let claims = authenticated_user(request)?;
    super::abuse::enforce_password_action(request, &claims.sub)?;
    let req: ChangeEmailRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;

    if !is_valid_email(&req.new_email) {
        return Err(validation("Invalid email format"));
    }
    validate_ascii_local(&req.new_email)?;
    let normalized = normalize_email(&req.new_email);

    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;

    // Re-authenticate with the password when one exists.
    if let Some(hash) = user.password_hash.clone() {
        let provided = req
            .current_password
            .as_deref()
            .ok_or_else(|| validation("Current password is required"))?;
        if !PasswordService::default().verify(provided, &hash) {
            return Err(AuthError::Unauthorized("invalid credentials".to_string()).into());
        }
    } else {
        require_step_up(&claims)?;
    }

    if user.email.as_deref().map(normalize_email).as_deref() == Some(normalized.as_str()) {
        return Err(validation("That is already your email address"));
    }
    // Uniqueness is route-enforced (no DB constraint): reject another account's address.
    if user_emails::email_blocks_signup(&normalized)? {
        return Err(RouteError::Status(409, "email_exists"));
    }
    if let Some(existing) = users::find_by_email(&normalized)? {
        if existing.id != user.id {
            return Err(RouteError::Status(409, "email_exists"));
        }
    }

    let token = prepare_email_token(&user.id, &normalized);
    let url = action_link("/verify-email", &token.raw);
    let message = super::with_subject_override(
        email_templates::verification(
            &crate::services::email_design::resolve("cedros-login/account_email_verify")?,
            user.name.as_deref(),
            &url,
            VERIFICATION_TTL_SECS / 3600,
        ),
        "email_subject_verification",
    );
    outbox::enqueue_token_email(
        &token.entry,
        &normalized,
        &message.subject,
        Some(&message.html),
        Some(&message.text),
    )?;

    // The new address is stored unverified until /verify-email proves inbox
    // control, so this pending response must not carry the authoritative
    // `linked` compatibility marker used only after inbox ownership is proven.
    let body = pending_email_change_body(&user)?;
    Ok(json(200, &body))
}

fn pending_email_change_body(user: &users::UserEntry) -> Result<String, RouteError> {
    pending_email_change_body_for_user(user_view(user))
}

fn pending_email_change_body_for_user<S: Serialize>(user: S) -> Result<String, RouteError> {
    to_json(&serde_json::json!({
        "message": "Verification email sent to your new address",
        "emailQueued": true,
        "emailChangePending": true,
        "user": user,
    }))
    .map_err(Into::into)
}

fn require_email_enabled() -> Result<(), RouteError> {
    if settings::bool("auth_email_enabled", true) {
        Ok(())
    } else {
        Err(RouteError::Status(404, "email_auth_disabled"))
    }
}

pub(crate) fn verify_email_token(
    raw: &str,
    expected_types: &[&str],
) -> Result<canonical_email::VerificationOutcome, RouteError> {
    let token = verifications::find_by_token_hash(&hash_verification_token(raw))?
        .ok_or(RouteError::Status(400, "invalid_token"))?;
    let old_totp = crate::data::totp::find_by_user(&token.user_id)?;
    let outcome = canonical_email::verify_token(token, expected_types, &clock::now_iso()).map_err(
        |error| match error {
            canonical_email::VerificationError::Invalid => RouteError::Status(400, "invalid_token"),
            canonical_email::VerificationError::Storage(error) => error.into(),
        },
    )?;
    if let canonical_email::VerificationOutcome::Canonical {
        user_id,
        credentials_reset: true,
        ..
    } = &outcome
    {
        if super::totp_credentials::delete(user_id, old_totp.as_ref()).is_err() {
            log::op_warn("auth", "mailbox-claim-totp-secret-delete", "secrets_error");
        }
    }
    Ok(outcome)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::{json as json_value, Value};
    use std::cell::Cell;

    fn user_value(email_verified: bool) -> Value {
        json_value!({
            "email": "new@example.com",
            "emailVerified": email_verified,
        })
    }

    #[test]
    fn pending_email_change_response_has_no_linked_marker() {
        let body: Value =
            serde_json::from_str(&pending_email_change_body_for_user(user_value(false)).unwrap())
                .expect("pending change body should be valid JSON");

        assert!(body.get("linked").is_none());
        assert_eq!(body["emailQueued"], true);
        assert_eq!(body["emailChangePending"], true);
        assert_eq!(body["user"]["email"], "new@example.com");
        assert_eq!(body["user"]["emailVerified"], false);
    }

    #[test]
    fn non_signup_verification_response_is_message_only() {
        let body: Value = serde_json::from_str(VERIFIED_EMAIL_OK)
            .expect("verified email body should be valid JSON");

        assert_eq!(body["message"], "Email verified successfully");
        assert!(body.get("linked").is_none());
        assert!(body.get("user").is_none());
    }

    #[test]
    fn only_initial_canonical_verification_completes_login() {
        assert!(verification_completes_login(false, true));
        assert!(!verification_completes_login(true, false));
        assert!(!verification_completes_login(false, false));
    }

    #[test]
    fn public_verification_resend_only_queues_for_an_unverified_account() {
        let request = RouteRequest {
            route_id: "cedros-login:send-verification".into(),
            method: "POST".into(),
            path: "/send-verification".into(),
            headers: vec![],
            query: vec![],
            body: r#"{"email":"User@Example.com","returnTo":"/profile"}"#.into(),
            context_json: "{}".into(),
        };
        let user: users::UserEntry = serde_json::from_value(json_value!({
            "id": "user-1",
            "email": "user@example.com",
            "emailVerified": false,
            "passwordHash": null,
            "name": null,
            "username": null,
            "picture": null,
            "walletAddress": null,
            "evmWalletAddress": null,
            "googleId": null,
            "appleId": null,
            "authMethods": ["email"],
            "suspendedAt": null,
            "isSystemAdmin": false,
            "createdAt": "2026-09-21T00:00:00Z",
            "updatedAt": "2026-09-21T00:00:00Z",
            "lastLoginAt": null,
            "welcomeCompletedAt": null,
            "avatarContentType": null
        }))
        .unwrap();
        let queued = Cell::new(0);

        let known = send_verification_inner_with(
            &request,
            |email| {
                assert_eq!(email, "user@example.com");
                Ok(Some(user))
            },
            |user, return_to| {
                assert_eq!(user.id, "user-1");
                assert_eq!(return_to, Some("/profile"));
                queued.set(queued.get() + 1);
            },
        )
        .unwrap();
        let unknown = send_verification_inner_with(
            &request,
            |_| Ok(None),
            |_, _| panic!("unknown accounts must not queue email"),
        )
        .unwrap();

        assert_eq!(queued.get(), 1);
        assert_eq!(known.status, 200);
        assert_eq!(known.body, GENERIC_OK);
        assert_eq!(unknown.status, known.status);
        assert_eq!(unknown.body, known.body);
    }
}
