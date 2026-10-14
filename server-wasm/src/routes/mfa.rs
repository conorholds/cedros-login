//! MFA (TOTP) management. Login completion lives in the sibling mfa_login module.
//!
//! Management routes (`/mfa/*`) require the END-USER session (access token).
//! `/login/mfa` is public but requires the short-lived MFA-pending token issued
//! by the login step-up. The TOTP secret is stored in the host secret seam.
//!
//! Starting MFA setup mints single-use recovery codes (returned once, stored
//! hashed); after enablement they can complete a step-up via /mfa/recovery and
//! be regenerated.
//!
use serde::{Deserialize, Serialize};

use super::auth::{
    authenticated_user, enforce_mfa_attempt_limit, record_mfa_failure, require_step_up,
};
use super::mfa_disable::{disable_mfa, DisableRequest};
use super::{error_response, json, RouteError};
use crate::clock;
use crate::data::totp::{self, TotpEntry};
use crate::data::users;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, telemetry, to_json};
use crate::services::tokens::{generate_recovery_code, hash_recovery_code};
use crate::services::{totp as totp_svc, AuthError};

const RECOVERY_CODE_COUNT: usize = 10;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CodeRequest {
    code: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SetupResponse {
    secret: String,
    otpauth_uri: String,
    recovery_codes: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RecoveryCodesResponse {
    recovery_codes: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct StatusResponse {
    enabled: bool,
    recovery_codes_remaining: usize,
    disable_methods: Vec<&'static str>,
}

pub fn setup(request: &RouteRequest) -> RouteResponse {
    super::identity_profile::no_store(wrap(setup_inner(request)))
}
pub fn enable(request: &RouteRequest) -> RouteResponse {
    wrap(enable_inner(request))
}
pub fn disable(request: &RouteRequest) -> RouteResponse {
    wrap(disable_inner(request))
}
pub fn status(request: &RouteRequest) -> RouteResponse {
    wrap(status_inner(request))
}
pub fn regenerate_recovery(request: &RouteRequest) -> RouteResponse {
    super::identity_profile::no_store(wrap(regenerate_recovery_inner(request)))
}
pub fn verify(request: &RouteRequest) -> RouteResponse {
    wrap(verify_inner(request))
}

fn wrap(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// POST /mfa/setup — generate + store (disabled) a host-managed secret and hashed
/// recovery codes; return the one-time plaintext material for QR display/save.
fn setup_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    super::abuse::enforce_proof_action(request, &claims.sub)?;
    require_step_up(&claims)?;
    enforce_mfa_attempt_limit(&claims.sub)?;
    let previous = totp::find_versioned(&claims.sub)?;
    if previous.as_ref().is_some_and(|row| row.value.enabled) {
        return Err(RouteError::Status(409, "mfa_already_enabled"));
    }
    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let email = user
        .email
        .ok_or_else(|| AuthError::Validation(vec!["Email required for MFA setup".to_string()]))?;

    let secret = totp_svc::generate_secret();
    let otpauth_uri = totp_svc::otpauth_uri(&secret, &email)?;
    let recovery_codes = new_recovery_codes();
    let mut entry = TotpEntry {
        user_id: claims.sub.clone(),
        secret: None,
        secret_key: None,
        enabled: false,
        created_at: clock::now_iso(),
        enabled_at: None,
        last_used_time_step: None,
        recovery_codes: recovery_codes
            .iter()
            .map(|code| hash_recovery_code(code))
            .collect(),
    };
    entry.secret_key = Some(super::totp_credentials::create(&claims.sub, &secret)?);
    let condition = previous
        .as_ref()
        .map(|row| row.condition.clone())
        .unwrap_or_else(|| crate::host::db::Condition::absent(crate::host::db::TOTP, &claims.sub));
    // Leave an unreachable encrypted seed on ambiguous host failure; deleting
    // could destroy a committed enrollment after a lost acknowledgement.
    crate::host::db::compare_and_set(&[condition], &[totp::write_op(&entry)?])?;
    if let Some(old) = previous {
        if super::totp_credentials::delete_enrollment(&old.value).is_err() {
            crate::host::log::op_warn("auth", "superseded-totp-secret-delete", "secrets_error");
        }
    }
    let body = to_json(&SetupResponse {
        secret,
        otpauth_uri,
        recovery_codes,
    })?;
    Ok(json(200, &body))
}

/// POST /mfa/enable — verify a code against the pending secret, then enable.
fn enable_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    super::abuse::enforce_proof_action(request, &claims.sub)?;
    require_step_up(&claims)?;
    enforce_mfa_attempt_limit(&claims.sub)?;
    let req: CodeRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let current = totp::find_versioned(&claims.sub)?
        .ok_or(RouteError::Status(400, "mfa_setup_not_started"))?;
    let mut entry = current.value;
    if entry.enabled {
        return Err(RouteError::Status(409, "mfa_already_enabled"));
    }
    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let email = user
        .email
        .ok_or_else(|| AuthError::Validation(vec!["Email required for MFA".to_string()]))?;

    let secret = super::totp_credentials::get(&mut entry)?;
    let step = match totp_svc::verify(
        &secret,
        &req.code,
        &email,
        entry.last_used_time_step,
        clock::now_unix(),
    )? {
        Some(step) => step,
        None => {
            record_mfa_failure(&claims.sub, request);
            return Err(
                AuthError::Validation(vec!["Invalid verification code".to_string()]).into(),
            );
        }
    };
    entry.enabled = true;
    entry.enabled_at = Some(clock::now_iso());
    entry.last_used_time_step = Some(step);
    write_factor_and_revoke_others(&entry, current.condition, &claims.sid, "mfa_enabled")?;
    // Security-posture signal: account turned MFA on (no identifiers).
    let _ = telemetry::emit_event(
        "cedros-login:mfa-enabled",
        "",
        &serde_json::json!({
            "method": "totp",
            "recoveryCodesGenerated": true,
            "routeId": "cedros-login:mfa-enable",
        }),
    );
    Ok(json(200, r#"{"message":"MFA enabled"}"#))
}

/// POST /mfa/verify — step-up verification: verify a TOTP code for the already
/// authenticated session (MFA must be enabled). Replay-protected, no new session.
fn verify_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    super::abuse::enforce_proof_action(request, &claims.sub)?;
    enforce_mfa_attempt_limit(&claims.sub)?;
    let req: CodeRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let current =
        totp::find_versioned(&claims.sub)?.ok_or(RouteError::Status(400, "mfa_not_configured"))?;
    let mut entry = current.value;
    if !entry.enabled {
        return Err(RouteError::Status(400, "mfa_not_enabled"));
    }
    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let email = user
        .email
        .ok_or_else(|| AuthError::Validation(vec!["Email required for MFA".to_string()]))?;
    let secret = super::totp_credentials::get(&mut entry)?;
    let step = match totp_svc::verify(
        &secret,
        &req.code,
        &email,
        entry.last_used_time_step,
        clock::now_unix(),
    )? {
        Some(step) => step,
        None => {
            record_mfa_failure(&claims.sub, request);
            return Err(
                AuthError::Validation(vec!["Invalid verification code".to_string()]).into(),
            );
        }
    };
    entry.last_used_time_step = Some(step);
    let current_session = crate::host::db::read_versioned::<crate::data::sessions::SessionEntry>(
        crate::host::db::SESSIONS,
        &claims.sid,
    )?
    .filter(|row| row.value.user_id == claims.sub && row.value.revoked_at.is_none())
    .ok_or(RouteError::Status(401, "invalid_token"))?;
    let mut session = current_session.value;
    session.last_strong_auth_at = Some(clock::now_iso());
    crate::host::db::compare_and_set(
        &[current.condition, current_session.condition],
        &[
            totp::write_op(&entry)?,
            crate::host::db::BatchOp::write(
                crate::host::db::SESSIONS,
                &session.id,
                serde_json::to_value(&session)
                    .map_err(|e| crate::host::SeamError::Encoding(e.to_string()))?,
            ),
        ],
    )?;
    Ok(json(200, r#"{"message":"MFA verified"}"#))
}

/// POST /mfa/disable — verify an account factor, then remove the TOTP secret.
fn disable_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    super::abuse::enforce_proof_action(request, &claims.sub)?;
    require_step_up(&claims)?;
    enforce_mfa_attempt_limit(&claims.sub)?;
    let req: DisableRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let current =
        totp::find_versioned(&claims.sub)?.ok_or(RouteError::Status(401, "invalid_credentials"))?;
    let mut entry = current.value;
    let secret = super::totp_credentials::get(&mut entry)?;
    if let Err(error) = disable_mfa(
        &entry,
        user.email.as_deref(),
        &req,
        &secret,
        clock::now_unix(),
        |user_id| delete_factor(user_id, current.condition, &claims.sid),
    ) {
        record_mfa_failure(&claims.sub, request);
        return Err(error);
    }
    if super::totp_credentials::delete_enrollment(&entry).is_err() {
        crate::host::log::op_warn("auth", "totp-secret-delete", "secrets_error");
    }
    // Durable, redacted security record: MFA (TOTP) was disabled on an account.
    // Only the event kind is stored — never the user id, email, or session
    // (site-brain-record:security). Identifying detail stays in the audit log.
    let _ = telemetry::emit_record(
        "security",
        "Account MFA disabled",
        "An account disabled MFA (TOTP) through the Login MFA route.",
        &serde_json::json!({ "securityEvent": "mfa-disabled" }),
    );
    // Security-posture signal: account turned MFA off (no identifiers).
    let _ = telemetry::emit_event(
        "cedros-login:mfa-disabled",
        "",
        &serde_json::json!({ "method": "totp", "routeId": "cedros-login:mfa-disable" }),
    );
    Ok(json(200, r#"{"message":"MFA disabled"}"#))
}

fn revoke_other_sessions(user_id: &str, session_id: &str, reason: &str) -> Result<(), RouteError> {
    let op = crate::host::db::ConditionalBatchOp::new(
        crate::host::db::ConditionalOperation::RevokeSessions,
        serde_json::json!({"userId":user_id,"exceptSessionId":session_id,"reason":reason}),
    );
    crate::host::db::batch_with_results(&[op.into()])?;
    Ok(())
}
fn delete_factor(
    user_id: &str,
    condition: crate::host::db::Condition,
    current_session_id: &str,
) -> Result<(), RouteError> {
    revoke_other_sessions(user_id, current_session_id, "mfa_disabled")?;
    crate::host::db::compare_and_set(
        &[condition],
        &[crate::host::db::BatchOp::delete(
            crate::host::db::TOTP,
            user_id,
        )],
    )?;
    Ok(())
}

/// GET /mfa/status — whether MFA is enabled for the authenticated user.
fn status_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    let entry = totp::find_by_user(&claims.sub)?;
    let response = StatusResponse {
        enabled: entry.as_ref().is_some_and(|value| value.enabled),
        recovery_codes_remaining: entry
            .as_ref()
            .map(|value| value.recovery_codes.len())
            .unwrap_or(0),
        disable_methods: disable_methods(),
    };
    Ok(json(200, &to_json(&response)?))
}

fn disable_methods() -> Vec<&'static str> {
    vec!["code", "recoveryCode"]
}

/// POST /mfa/recovery-codes/regenerate — replace the authenticated user's codes.
fn regenerate_recovery_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    super::abuse::enforce_proof_action(request, &claims.sub)?;
    require_step_up(&claims)?;
    enforce_mfa_attempt_limit(&claims.sub)?;
    let req: CodeRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let current =
        totp::find_versioned(&claims.sub)?.ok_or(RouteError::Status(400, "mfa_not_configured"))?;
    let mut entry = current.value;
    if !entry.enabled {
        return Err(RouteError::Status(400, "mfa_not_enabled"));
    }
    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let email = user
        .email
        .ok_or_else(|| AuthError::Validation(vec!["Email required for MFA".to_string()]))?;
    let secret = super::totp_credentials::get(&mut entry)?;
    let step = match totp_svc::verify(
        &secret,
        &req.code,
        &email,
        entry.last_used_time_step,
        clock::now_unix(),
    )? {
        Some(step) => step,
        None => {
            record_mfa_failure(&claims.sub, request);
            return Err(
                AuthError::Validation(vec!["Invalid verification code".to_string()]).into(),
            );
        }
    };
    entry.last_used_time_step = Some(step);
    let codes = new_recovery_codes();
    entry.recovery_codes = codes.iter().map(|c| hash_recovery_code(c)).collect();
    write_factor_and_revoke_others(
        &entry,
        current.condition,
        &claims.sid,
        "mfa_recovery_codes_regenerated",
    )?;
    Ok(json(
        200,
        &to_json(&RecoveryCodesResponse {
            recovery_codes: codes,
        })?,
    ))
}

fn write_factor_and_revoke_others(
    entry: &TotpEntry,
    condition: crate::host::db::Condition,
    current_session_id: &str,
    reason: &str,
) -> Result<(), RouteError> {
    revoke_other_sessions(&entry.user_id, current_session_id, reason)?;
    write_factor_and_account_revision(entry, condition)?;
    revoke_other_sessions(&entry.user_id, current_session_id, reason)?;
    Ok(())
}

// Coupled account/factor write prevents primary-only authentication from
// committing against a snapshot that predates the new MFA policy.
fn write_factor_and_account_revision(
    entry: &TotpEntry,
    condition: crate::host::db::Condition,
) -> Result<(), RouteError> {
    let current_user = crate::host::db::read_versioned::<users::UserEntry>(
        crate::host::db::USERS,
        &entry.user_id,
    )?
    .ok_or(RouteError::Status(401, "invalid_token"))?;
    let mut user = current_user.value;
    // Advance the account snapshot with the factor mutation. Authentication
    // that observed the old MFA policy cannot commit after the final revoke.
    let previous = chrono::DateTime::parse_from_rfc3339(&user.updated_at)
        .map_err(|_| RouteError::Status(502, "db_error"))?;
    user.updated_at = std::cmp::max(
        chrono::Utc::now(),
        previous.with_timezone(&chrono::Utc) + chrono::Duration::milliseconds(1),
    )
    .to_rfc3339_opts(chrono::SecondsFormat::Millis, true);
    let data =
        serde_json::to_value(&user).map_err(|e| crate::host::SeamError::Encoding(e.to_string()))?;
    crate::host::db::compare_and_set(
        &[condition, current_user.condition],
        &[
            totp::write_op(entry)?,
            crate::host::db::BatchOp::write(crate::host::db::USERS, &entry.user_id, data),
        ],
    )?;
    Ok(())
}

/// A fresh batch of plaintext recovery codes (returned once; stored hashed).
fn new_recovery_codes() -> Vec<String> {
    (0..RECOVERY_CODE_COUNT)
        .map(|_| generate_recovery_code())
        .collect()
}

#[cfg(test)]
#[path = "mfa_tests.rs"]
mod mfa_tests;
