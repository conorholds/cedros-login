//! Passwordless "magic link" sign-in (`cedros-login:auth`). Opt-in via
//! `auth_instantlink_enabled`. `send` emails a one-time login token (creating
//! the account if the email is new — magic-link doubles as signup); `verify`
//! consumes it, marks the email verified, and issues a session (or an MFA
//! step-up). `send` always returns a generic response (enumeration-resistant).
use serde::Deserialize;
use uuid::Uuid;

use super::account::prepare_token;
use super::auth::{self, respond};
use super::{action_link, cookies, error_response, json, RouteError};
use crate::clock;
use crate::data::memberships::MembershipEntry;
use crate::data::outbox;
use crate::data::registration_account;
use crate::data::totp;
use crate::data::user_emails;
use crate::data::users::{self, UserEntry};
use crate::data::verifications;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::db::{
    self, AtomicBatchOp, BatchOp, ConditionalBatchOp, ConditionalOperation, CREDENTIALS, TOTP,
};
use crate::host::{log, settings, telemetry};
use crate::services::email::{is_valid_email, normalize_email};
use crate::services::email_templates;

const INSTANT_LINK: &str = "instant_link";
const AUTH_INSTANTLINK_ENABLED_KEY: &str = "auth_instantlink_enabled";
const AUTH_INSTANTLINK_EXPIRY_KEY: &str = "auth_instantlink_expiry";
const INSTANT_LINK_TTL_SECS: i64 = 15 * 60;
const INSTANT_LINK_TTL_MAX_SECS: i64 = 30 * 60;

/// Magic-link token lifetime: the admin-configured `auth_instantlink_expiry`
/// (seconds), clamped to a sane range, defaulting to 15 minutes.
fn instant_link_ttl_secs() -> i64 {
    settings::int(
        AUTH_INSTANTLINK_EXPIRY_KEY,
        INSTANT_LINK_TTL_SECS,
        INSTANT_LINK_TTL_MAX_SECS,
    )
}
const GENERIC_OK: &str = r#"{"message":"If the email is valid, a sign-in link has been sent"}"#;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EmailRequest {
    email: String,
    #[serde(default)]
    referral: Option<String>,
    #[serde(default, alias = "access_code")]
    access_code: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VerifyRequest {
    token: String,
}

pub fn send(request: &RouteRequest) -> RouteResponse {
    match send_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

pub fn verify(request: &RouteRequest) -> RouteResponse {
    match verify_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// POST /instant-link — email a one-time sign-in link (best-effort, generic).
fn send_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let req: EmailRequest = crate::host::from_json(&request.body)
        .map_err(|_| RouteError::Status(400, "invalid_body"))?;
    if !is_valid_email(&req.email) {
        return Ok(json(200, GENERIC_OK));
    }
    let normalized = normalize_email(&req.email);
    // Existing user, or provision a passwordless one (magic-link signup). A
    // provisioning failure (e.g. SetupRequired) stays generic — no leak.
    let user = match user_for_instant_link(&normalized)? {
        Some(user) if supports_email_login(&user) => user,
        Some(_) => return Ok(json(200, GENERIC_OK)),
        None => {
            if super::signup_access::enforce(req.access_code.as_deref()).is_err() {
                return Ok(json(200, GENERIC_OK));
            }
            let _accepted_referral = req
                .referral
                .as_deref()
                .map(str::trim)
                .filter(|code| !code.is_empty());
            match provision_passwordless(&normalized) {
                Ok(user) => user,
                Err(_) => return Ok(json(200, GENERIC_OK)),
            }
        }
    };

    if let Some(to) = user.email.clone() {
        // Per-user cooldown: silently skip a rapid re-request (still generic OK).
        if super::email_resend_cooldown_active(&user.id, INSTANT_LINK) {
            return Ok(json(200, GENERIC_OK));
        }
        let ttl = instant_link_ttl_secs();
        let token = prepare_token(&user.id, INSTANT_LINK, ttl, Some(to.clone()));
        let url = action_link("/magic-link", &token.raw);
        let email = super::with_subject_override(
            email_templates::instant_link(
                &crate::services::email_design::resolve("cedros-login/instant_link")?,
                user.name.as_deref(),
                &url,
                ttl / 60,
            ),
            "email_subject_instant_link",
        );
        if let Err(e) = outbox::enqueue_token_email(
            &token.entry,
            &to,
            &email.subject,
            Some(&email.html),
            Some(&email.text),
        ) {
            // A dropped enqueue means the user never receives their sign-in link.
            log::op_warn("outbox", "enqueue-instant-link", e.code());
        }
    }
    Ok(json(200, GENERIC_OK))
}

/// POST /instant-link/verify — consume the token; issue a session (or MFA step-up).
fn verify_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_enabled()?;
    let req: VerifyRequest = crate::host::from_json(&request.body)
        .map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let (token, current) = instant_link_proof(&req.token)?;
    let user_key = current.entry_key.clone();
    let user_version = current.updated_at.clone();
    let mut user = current.value;
    if !supports_email_login(&user) {
        return Err(RouteError::Status(400, "invalid_token"));
    }
    let target_email = token
        .target_email
        .as_deref()
        .ok_or(RouteError::Status(400, "invalid_token"))?;
    if !user_emails::is_live_instant_link_target(&user, target_email)? {
        return Err(RouteError::Status(400, "invalid_token"));
    }
    if let Some(response) = super::invite_codes::pending_login_response(request, &user, "email")? {
        return Ok(response);
    }
    let is_first_login = user.last_login_at.is_none();
    let newly_verified = user_emails::is_unverified_primary_target(&user, target_email);
    let resets_unverified_credentials =
        newly_verified && users::reset_unverified_credentials(&mut user);
    if newly_verified {
        user.email_verified = true;
    }
    user.last_login_at = Some(clock::now_iso());
    user.updated_at = clock::now_iso();
    let mut params =
        instant_link_params(&token, &user_key, &user_version, &user, user.email_verified)?;

    if !resets_unverified_credentials && totp::has_mfa(&user.id)? {
        // Login analytics fire at /login/mfa completion, not here.
        let (response, challenge) = auth::prepare_mfa_challenge(&user, "email")?;
        params["mfaVerification"] = serde_json::json!({
            "entryKey": challenge.entry_key,
            "data": challenge.data,
        });
        complete_instant_link(params, &token, false, None)?;
        emit_email_verified(newly_verified);
        return Ok(response);
    }
    let ip = auth::client_ip(request);
    let user_agent = auth::user_agent(request);
    let context = auth::default_org_context(&user)?;
    let (tokens, session) = auth::prepare_session(
        &user,
        &context,
        ip.clone(),
        user_agent.clone(),
        Some(clock::now_iso()),
    )?;
    params["session"] = serde_json::json!({"entryKey": session.id, "data": session});
    let old_totp = if resets_unverified_credentials {
        totp::find_by_user(&user.id)?
    } else {
        None
    };
    complete_instant_link(
        params,
        &token,
        resets_unverified_credentials,
        Some(&session.id),
    )?;
    if resets_unverified_credentials
        && super::totp_credentials::delete(&user.id, old_totp.as_ref()).is_err()
    {
        log::op_warn("auth", "mailbox-claim-totp-secret-delete", "secrets_error");
    }
    emit_email_verified(newly_verified);
    auth::maybe_alert_new_device_after_session(
        &user,
        ip.as_deref(),
        user_agent.as_deref(),
        &session.id,
    );
    emit_instant_link_login(is_first_login);
    respond(200, &user, tokens, false, Some("email"), &cookies::config())
}

fn instant_link_proof(
    raw: &str,
) -> Result<(verifications::VerificationEntry, users::VersionedUserEntry), RouteError> {
    let hash = crate::services::tokens::hash_verification_token(raw);
    let token = verifications::find_by_token_hash(&hash)?
        .filter(|token| {
            token.token_type == INSTANT_LINK
                && token.used_at.is_none()
                && token.expires_at > clock::now_iso()
        })
        .ok_or(RouteError::Status(400, "invalid_token"))?;
    let user = users::find_by_id_versioned(&token.user_id)?
        .ok_or(RouteError::Status(400, "invalid_token"))?;
    Ok((token, user))
}

fn instant_link_params(
    token: &verifications::VerificationEntry,
    user_key: &str,
    user_version: &str,
    user: &UserEntry,
    mark_primary_verified: bool,
) -> Result<serde_json::Value, RouteError> {
    let primary = user_emails::primary_write(user, mark_primary_verified)?
        .ok_or(RouteError::Status(400, "invalid_token"))?;
    let mut params = serde_json::json!({
        "verification": {"entryKey":token.id,"tokenHash":token.token_hash,
            "allowedTokenTypes":[INSTANT_LINK]},
        "user": {"entryKey":user_key,"expectedUpdatedAt":user_version,"data":user},
        "primaryEmail": {"entryKey":primary.entry_key,"data":primary.data},
    });
    if let Some(expected) = primary.expected_updated_at {
        params["primaryEmail"]["expectedUpdatedAt"] = serde_json::json!(expected);
    }
    Ok(params)
}

fn emit_email_verified(newly_verified: bool) {
    if newly_verified {
        let _ = telemetry::emit_event(
            "cedros-login:email-verified",
            "",
            &serde_json::json!({
                "context": "magic-link",
                "routeId": "cedros-login:instant-link-verify",
            }),
        );
    }
}

fn complete_instant_link(
    params: serde_json::Value,
    proof: &verifications::VerificationEntry,
    resets_unverified_credentials: bool,
    keep_session_id: Option<&str>,
) -> Result<(), RouteError> {
    let op = ConditionalBatchOp::new(ConditionalOperation::CompleteInstantLink, params);
    let mut operations: Vec<AtomicBatchOp> = vec![op.into()];
    if resets_unverified_credentials {
        operations.extend(
            crate::data::api_keys::delete_operations(&proof.user_id)?
                .into_iter()
                .map(Into::into),
        );
        operations.extend(
            user_emails::secondary_delete_operations(&proof.user_id)?
                .into_iter()
                .map(Into::into),
        );
        for credential in crate::data::credentials::find_by_user(&proof.user_id)? {
            operations.push(BatchOp::delete(CREDENTIALS, &credential.id).into());
        }
        operations.extend(
            crate::data::sso_identities::delete_operations(
                &crate::data::sso_identities::find_by_user(&proof.user_id)?,
            )
            .into_iter()
            .map(Into::into),
        );
        operations.push(BatchOp::delete(TOTP, &proof.user_id).into());
        let mut revoke = serde_json::json!({
            "userId": proof.user_id,
            "reason": "email_ownership_claim",
        });
        if let Some(session_id) = keep_session_id {
            revoke["exceptSessionId"] = serde_json::json!(session_id);
        }
        operations
            .push(ConditionalBatchOp::new(ConditionalOperation::RevokeSessions, revoke).into());
    }
    let result = db::batch_with_results(&operations)?;
    verifications::consumed_payload(&result, proof, &[INSTANT_LINK])?;
    let status = result
        .results
        .first()
        .and_then(|row| row.output.get("status"));
    if status.and_then(serde_json::Value::as_str) != Some("completed") {
        return Err(RouteError::Status(502, "db_error"));
    }
    Ok(())
}

/// Redacted magic-link login analytics: `registered` on the account's first login
/// (magic-link doubles as signup), `authenticated` otherwise. method is the
/// declared `instant-link` value.
fn emit_instant_link_login(is_first_login: bool) {
    let route_id = "cedros-login:instant-link-verify";
    if is_first_login {
        let _ = telemetry::emit_event(
            "cedros-login:registered",
            "",
            &serde_json::json!({ "method": "instant-link", "routeId": route_id }),
        );
        let _ = telemetry::emit_event(
            "cedros-login:registration-created",
            "",
            &serde_json::json!({ "method": "instant-link", "routeId": route_id }),
        );
    } else {
        let _ = telemetry::emit_event(
            "cedros-login:authenticated",
            "",
            &serde_json::json!({ "method": "instant-link", "mfaRequired": false, "routeId": route_id }),
        );
        let _ = telemetry::emit_event(
            "cedros-login:user-login",
            "",
            &serde_json::json!({ "method": "instant-link", "routeId": route_id }),
        );
    }
}

/// Provision a passwordless user for magic-link signup (fail-closed default org).
fn provision_passwordless(email: &str) -> Result<UserEntry, RouteError> {
    let now = clock::now_iso();
    let user = UserEntry {
        id: Uuid::new_v4().to_string(),
        email: Some(email.to_string()),
        email_verified: false, // confirmed when they click the link
        password_hash: None,
        name: None,
        username: None,
        picture: None,
        wallet_address: None,
        evm_wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec!["email".to_string()],
        suspended_at: None,
        is_system_admin: false,
        created_at: now.clone(),
        updated_at: now,
        last_login_at: None,
        welcome_completed_at: None,
        avatar_content_type: None,
    };
    let org_id = auth::resolve_default_org_id()?;
    let membership = MembershipEntry {
        id: Uuid::new_v4().to_string(),
        user_id: user.id.clone(),
        org_id,
        role: "member".into(),
        joined_at: clock::now_iso(),
    };
    let pending =
        super::invite_codes::gate_enabled().then(|| super::invite_codes::pending_account(&user.id));
    registration_account::create(&user, None, &membership, None, pending.as_ref(), None)?;
    super::flag_email_collision(email, "cedros-login:instant-link-send");
    Ok(user)
}

fn user_for_instant_link(email: &str) -> Result<Option<UserEntry>, RouteError> {
    if let Some(row) = user_emails::find_active_by_email(email)? {
        if row.verified_at.is_none() && !row.is_primary {
            return Ok(None);
        }
        return users::find_by_id(&row.user_id).map_err(Into::into);
    }
    users::find_by_email(email).map_err(Into::into)
}

fn supports_email_login(user: &UserEntry) -> bool {
    user.password_hash.is_some()
        || user
            .auth_methods
            .iter()
            .any(|method| method == "email" || method == "password")
}

fn require_enabled() -> Result<(), RouteError> {
    let enabled = settings::bool(AUTH_INSTANTLINK_ENABLED_KEY, false);
    if enabled {
        Ok(())
    } else {
        Err(RouteError::Status(404, "instant_link_disabled"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn instant_link_gate_uses_admin_settings_catalog_key() {
        assert_eq!(AUTH_INSTANTLINK_ENABLED_KEY, "auth_instantlink_enabled");
    }

    #[test]
    fn email_request_accepts_camel_and_legacy_access_code_keys() {
        let camel: EmailRequest =
            serde_json::from_str(r#"{"email":"a@b.com","accessCode":"launch"}"#).unwrap();
        assert_eq!(camel.access_code.as_deref(), Some("launch"));

        let legacy: EmailRequest =
            serde_json::from_str(r#"{"email":"a@b.com","access_code":"legacy"}"#).unwrap();
        assert_eq!(legacy.access_code.as_deref(), Some("legacy"));
    }

    #[test]
    fn stronger_only_accounts_do_not_gain_instant_link_login() {
        let now = clock::now_iso();
        let mut user = UserEntry {
            id: "u1".into(),
            email: Some("a@example.com".into()),
            email_verified: true,
            password_hash: None,
            name: None,
            username: None,
            picture: None,
            wallet_address: None,
            evm_wallet_address: None,
            google_id: Some("g1".into()),
            apple_id: None,
            auth_methods: vec!["google".into(), "webauthn".into()],
            suspended_at: None,
            is_system_admin: false,
            created_at: now.clone(),
            updated_at: now,
            last_login_at: None,
            welcome_completed_at: None,
            avatar_content_type: None,
        };
        assert!(!supports_email_login(&user));
        user.password_hash = Some("hash".into());
        assert!(supports_email_login(&user));
    }
}
