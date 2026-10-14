//! MFA login completion with proof-before-consume ordering.

use serde::Deserialize;

use super::auth::{
    client_ip, default_org_context, enforce_mfa_attempt_limit,
    maybe_alert_new_device_after_session, prepare_session, record_mfa_failure, respond,
    touch_login_timestamp, user_agent,
};
use super::cookies;
use super::{error_response, RouteError};
use crate::clock;
use crate::data::mfa_challenges;
use crate::data::sso_identities::{self, SsoIdentityEntry};
use crate::data::totp::{self, TotpEntry};
use crate::data::users;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, telemetry};
use crate::services::tokens::{hash_recovery_code, hash_verification_token};
use crate::services::{totp as totp_svc, AuthError};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CompleteRequest {
    mfa_token: String,
    code: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RecoveryRequest {
    mfa_token: String,
    recovery_code: String,
}

pub fn complete(request: &RouteRequest) -> RouteResponse {
    wrap(complete_inner(request))
}

pub fn use_recovery(request: &RouteRequest) -> RouteResponse {
    wrap(use_recovery_inner(request))
}

fn wrap(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    result.unwrap_or_else(error_response)
}

/// Complete login with a TOTP or recovery code carried in the shared `code`
/// field. Invalid proof leaves the purpose-bound pending challenge untouched.
fn complete_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let req: CompleteRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    complete_with_factor(request, &req.mfa_token, &req.code, None)
}

/// Compatibility endpoint for clients that send a distinct recovery-code field.
fn use_recovery_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let req: RecoveryRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    complete_with_factor(
        request,
        &req.mfa_token,
        &req.recovery_code,
        Some("recovery"),
    )
}

fn complete_with_factor(
    request: &RouteRequest,
    raw_token: &str,
    code: &str,
    force_kind: Option<&str>,
) -> Result<RouteResponse, RouteError> {
    let method = mfa_auth_method(raw_token)?;
    let now = clock::now_iso();
    let pending = mfa_challenges::find_pending(&hash_verification_token(raw_token), &now)?
        .ok_or(RouteError::Status(401, "invalid_mfa_token"))?;
    super::abuse::enforce_proof_action(request, &pending.user_id)?;
    enforce_mfa_attempt_limit(&pending.user_id)?;
    let current = load_factor(&pending.user_id)?;
    let mut factor = current.value;
    let current_user = crate::host::db::read_versioned::<users::UserEntry>(
        crate::host::db::USERS,
        &pending.user_id,
    )?
    .ok_or(RouteError::Status(401, "invalid_mfa_token"))?;
    let mut user = current_user.value;
    if !mfa_challenges::token_matches_account(raw_token, &user)? {
        return Err(RouteError::Status(401, "invalid_mfa_token"));
    }
    if super::invite_codes::is_user_pending(&user.id)? {
        if super::invite_codes::gate_enabled() {
            return Err(RouteError::Status(403, "invite_code_required"));
        }
        super::invite_codes::activate_user(&user.id)?;
    }
    let valid = if force_kind == Some("recovery") || !is_totp_code(code.trim()) {
        consume_recovery_code(&mut factor, code.trim())
    } else {
        verify_totp(&mut factor, user.email.as_deref(), code.trim())?
    };
    if !valid {
        record_mfa_failure(&pending.user_id, request);
        if force_kind == Some("recovery") {
            return Err(AuthError::Unauthorized("invalid recovery code".into()).into());
        }
        return Err(AuthError::Validation(vec!["Invalid verification code".into()]).into());
    }
    let ip = client_ip(request);
    let agent = user_agent(request);
    let context = default_org_context(&user)?;
    let (tokens, session) = prepare_session(
        &user,
        &context,
        ip.clone(),
        agent.clone(),
        Some(now.clone()),
    )?;
    let sso_identity = pending_sso_identity(method, &pending, &now)?;
    if !mfa_challenges::consume_with_factor_and_session(
        &pending,
        &factor,
        current.condition,
        current_user.condition,
        &session,
        sso_identity.as_ref(),
        &now,
    )? {
        return Err(RouteError::Status(401, "invalid_mfa_token"));
    }

    touch_login_timestamp(&mut user);
    maybe_alert_new_device_after_session(&user, ip.as_deref(), agent.as_deref(), &session.id);
    emit_mfa_authenticated(
        method,
        if force_kind.is_some() {
            "cedros-login:mfa-recovery"
        } else {
            "cedros-login:login-mfa"
        },
    );
    respond(200, &user, tokens, false, Some(method), &cookies::config())
}

fn pending_sso_identity(
    method: &str,
    pending: &crate::data::verifications::VerificationEntry,
    now: &str,
) -> Result<Option<SsoIdentityEntry>, RouteError> {
    if method != "sso" {
        return Ok(None);
    }
    let Some(id) = pending.subject_id.as_deref() else {
        return Ok(None);
    };
    if !sso_identities::is_valid_id(id) {
        return Err(RouteError::Status(401, "invalid_mfa_token"));
    }
    Ok(Some(SsoIdentityEntry {
        id: id.to_string(),
        user_id: pending.user_id.clone(),
        created_at: now.to_string(),
    }))
}

fn mfa_auth_method(token: &str) -> Result<&str, RouteError> {
    let (method, opaque) = token
        .split_once('.')
        .ok_or(RouteError::Status(401, "invalid_mfa_token"))?;
    if opaque.is_empty()
        || !matches!(
            method,
            "password" | "email" | "google" | "apple" | "solana" | "webauthn" | "sso"
        )
    {
        return Err(RouteError::Status(401, "invalid_mfa_token"));
    }
    Ok(method)
}

fn load_factor(user_id: &str) -> Result<crate::host::db::Versioned<TotpEntry>, RouteError> {
    let factor =
        totp::find_versioned(user_id)?.ok_or(RouteError::Status(400, "mfa_not_configured"))?;
    if !factor.value.enabled {
        return Err(RouteError::Status(400, "mfa_not_enabled"));
    }
    Ok(factor)
}

fn verify_totp(
    factor: &mut TotpEntry,
    email: Option<&str>,
    code: &str,
) -> Result<bool, RouteError> {
    let email = email.ok_or_else(|| AuthError::Validation(vec!["Email required".into()]))?;
    let secret = super::totp_credentials::get(factor)?;
    let Some(step) = totp_svc::verify(
        &secret,
        code,
        email,
        factor.last_used_time_step,
        clock::now_unix(),
    )?
    else {
        return Ok(false);
    };
    factor.last_used_time_step = Some(step);
    Ok(true)
}

fn consume_recovery_code(factor: &mut TotpEntry, code: &str) -> bool {
    let hash = hash_recovery_code(code);
    let before = factor.recovery_codes.len();
    factor.recovery_codes.retain(|stored| stored != &hash);
    factor.recovery_codes.len() != before
}

fn is_totp_code(code: &str) -> bool {
    code.len() == 6 && code.bytes().all(|byte| byte.is_ascii_digit())
}

fn emit_mfa_authenticated(method: &str, route_id: &str) {
    let _ = telemetry::emit_event(
        "cedros-login:authenticated",
        "",
        &serde_json::json!({ "method": method, "mfaRequired": true, "routeId": route_id }),
    );
    let _ = telemetry::emit_event(
        "cedros-login:user-login",
        "",
        &serde_json::json!({ "method": method, "routeId": route_id }),
    );
}

#[cfg(test)]
mod tests {
    use super::*;

    fn factor(codes: &[&str]) -> TotpEntry {
        TotpEntry {
            user_id: "user-1".into(),
            secret: Some("ciphertext".into()),
            secret_key: None,
            enabled: true,
            created_at: "2026-07-10T00:00:00.000Z".into(),
            enabled_at: Some("2026-07-10T00:00:00.000Z".into()),
            last_used_time_step: None,
            recovery_codes: codes.iter().map(|code| hash_recovery_code(code)).collect(),
        }
    }

    #[test]
    fn wrong_recovery_then_correct_preserves_single_use_code() {
        let mut factor = factor(&["ABCD-EFGH-IJKL-MNOP"]);
        assert!(!consume_recovery_code(&mut factor, "WRONG-CODE-0000-0000"));
        assert!(consume_recovery_code(&mut factor, "ABCD-EFGH-IJKL-MNOP"));
        assert!(!consume_recovery_code(&mut factor, "ABCD-EFGH-IJKL-MNOP"));
    }

    #[test]
    fn factor_shape_selects_totp_without_misclassifying_recovery() {
        assert!(is_totp_code("123456"));
        assert!(!is_totp_code("12345"));
        assert!(!is_totp_code("ABCD-EFGH-IJKL-MNOP"));
    }

    #[test]
    fn pending_token_is_bound_to_a_known_primary_method() {
        assert_eq!(mfa_auth_method("google.opaque").unwrap(), "google");
        assert_eq!(mfa_auth_method("webauthn.opaque").unwrap(), "webauthn");
        for invalid in ["opaque", "unknown.opaque", "google.", ".opaque"] {
            assert!(mfa_auth_method(invalid).is_err(), "{invalid}");
        }
    }
}
