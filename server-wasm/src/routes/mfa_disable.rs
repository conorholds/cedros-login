//! MFA disable request validation helpers.

use serde::Deserialize;

use super::RouteError;
use crate::data::totp::TotpEntry;
use crate::services::tokens::hash_recovery_code;
use crate::services::{totp as totp_svc, AuthError};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct DisableRequest {
    #[serde(default, rename = "password")]
    _password: Option<String>,
    code: Option<String>,
    recovery_code: Option<String>,
}

pub(super) fn disable_mfa<F>(
    entry: &TotpEntry,
    email: Option<&str>,
    req: &DisableRequest,
    plaintext_secret: &str,
    now_unix: u64,
    delete_mfa: F,
) -> Result<(), RouteError>
where
    F: FnOnce(&str) -> Result<(), RouteError>,
{
    verify_passwordless_factor(entry, email, req, plaintext_secret, now_unix)?;
    delete_mfa(&entry.user_id)
}

fn verify_passwordless_factor(
    entry: &TotpEntry,
    email: Option<&str>,
    req: &DisableRequest,
    plaintext_secret: &str,
    now_unix: u64,
) -> Result<(), RouteError> {
    if !entry.enabled {
        return Err(AuthError::Unauthorized("invalid mfa factor".to_string()).into());
    }
    match (
        non_empty(req.code.as_ref()),
        non_empty(req.recovery_code.as_ref()),
    ) {
        (Some(code), None) => verify_passwordless_totp(
            plaintext_secret,
            email,
            entry.last_used_time_step,
            code,
            now_unix,
        ),
        (None, Some(recovery_code)) => verify_passwordless_recovery(entry, recovery_code),
        _ => Err(AuthError::Unauthorized("invalid mfa factor".to_string()).into()),
    }
}

fn verify_passwordless_totp(
    plaintext_secret: &str,
    email: Option<&str>,
    last_used_time_step: Option<i64>,
    code: &str,
    now_unix: u64,
) -> Result<(), RouteError> {
    let email = email.ok_or_else(|| AuthError::Unauthorized("invalid mfa factor".to_string()))?;
    totp_svc::verify(plaintext_secret, code, email, last_used_time_step, now_unix)?
        .ok_or_else(|| AuthError::Unauthorized("invalid mfa factor".to_string()))?;
    Ok(())
}

fn verify_passwordless_recovery(entry: &TotpEntry, recovery_code: &str) -> Result<(), RouteError> {
    let hash = hash_recovery_code(recovery_code.trim());
    if entry.recovery_codes.iter().any(|stored| stored == &hash) {
        Ok(())
    } else {
        Err(AuthError::Unauthorized("invalid mfa factor".to_string()).into())
    }
}

fn non_empty(value: Option<&String>) -> Option<&str> {
    value
        .map(String::as_str)
        .map(str::trim)
        .filter(|s| !s.is_empty())
}
