use serde::Deserialize;

use super::{
    action_link, authenticated_user, clock, email_templates, from_json, json, normalize_email,
    prepare_token, require_email_enabled, sessions, telemetry, to_json, user_view, users,
    validation, RouteError, RouteRequest, RouteResponse, RESET_TTL_SECS,
};
use crate::data::{outbox, user_emails};
use crate::services::password::PasswordService;
use crate::services::tokens::hash_verification_token;
use crate::services::AuthError;
use crate::{data::verifications, host::db};

const PASSWORD_RESET: &str = "password_reset";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EmailRequest {
    email: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ResetRequest {
    token: String,
    new_password: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChangePasswordRequest {
    current_password: String,
    new_password: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetPasswordRequest {
    password: String,
}

/// POST /forgot-password — best-effort reset email; always a generic response.
pub(super) fn forgot_password_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_email_enabled()?;
    let req: EmailRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let normalized = normalize_email(&req.email);
    if let Some(user) = users::find_by_email(&normalized)? {
        if !password_recovery_allowed(&user) {
            return Ok(json(200, super::GENERIC_OK));
        }
        if super::super::email_resend_cooldown_active(&user.id, PASSWORD_RESET) {
            return Ok(json(200, super::GENERIC_OK));
        }
        match issue_password_reset(&user, user.email.as_deref().unwrap_or(&normalized)) {
            Ok(()) => {
                let _ = telemetry::emit_event(
                    "cedros-login:password-reset-requested",
                    "",
                    &serde_json::json!({
                        "channel": "email",
                        "routeId": "cedros-login:forgot-password"
                    }),
                );
            }
            Err(_) => crate::host::log::op_warn("auth", "password-reset-email", "queue_failed"),
        }
    }
    Ok(json(200, super::GENERIC_OK))
}

/// Issue a password-reset token and queue the reset email for `user`.
pub(crate) fn issue_password_reset(
    user: &crate::data::users::UserEntry,
    email: &str,
) -> Result<(), RouteError> {
    if !password_recovery_allowed(user) {
        return Err(validation("Account does not use password authentication"));
    }
    let token = prepare_token(
        &user.id,
        PASSWORD_RESET,
        RESET_TTL_SECS,
        Some(email.to_string()),
    );
    let url = action_link("/reset-password", &token.raw);
    let message = super::super::with_subject_override(
        email_templates::password_reset(
            &crate::services::email_design::resolve("cedros-login/password_reset")?,
            user.name.as_deref(),
            &url,
            RESET_TTL_SECS / 60,
        ),
        "email_subject_password_reset",
    );
    outbox::enqueue_token_email(
        &token.entry,
        email,
        &message.subject,
        Some(&message.html),
        Some(&message.text),
    )?;
    Ok(())
}

/// POST /reset-password — validate the opaque proof before entering Argon2,
/// then consume it, set the password, and revoke all the user's sessions.
pub(super) fn reset_password_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_email_enabled()?;
    let req: ResetRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let token = verifications::find_by_token_hash(&hash_verification_token(&req.token))?
        .filter(|row| {
            row.token_type == PASSWORD_RESET
                && row.used_at.is_none()
                && row.expires_at > clock::now_iso()
        })
        .ok_or(RouteError::Status(400, "invalid_token"))?;
    let current = users::find_by_id_versioned(&token.user_id)?
        .ok_or(RouteError::Status(400, "invalid_token"))?;
    let mut user = current.value;
    let target = token
        .target_email
        .as_deref()
        .ok_or(RouteError::Status(400, "invalid_token"))?;
    if !password_recovery_allowed(&user)
        || !user_emails::is_live_instant_link_target(&user, target)?
    {
        return Err(RouteError::Status(400, "invalid_token"));
    }
    let password = PasswordService::default();
    password.validate(&req.new_password)?;
    let hash = password.hash(&req.new_password)?;
    let claims_unverified_primary = user_emails::is_unverified_primary_target(&user, target);
    let claims_unverified_account =
        claims_unverified_primary && users::reset_unverified_credentials(&mut user);
    user.password_hash = Some(hash);
    if claims_unverified_primary {
        user.email_verified = true;
    }
    if !user.auth_methods.iter().any(|method| method == "password") {
        user.auth_methods.push("password".to_string());
    }
    user.updated_at = clock::now_iso();
    let verified_primary = if claims_unverified_primary {
        user_emails::verified_primary_write(&user)?
    } else {
        None
    };
    let operation = db::ConditionalBatchOp::new(
        db::ConditionalOperation::CompletePasswordReset,
        serde_json::json!({
            "verification": {
                "entryKey": token.id,
                "tokenHash": token.token_hash,
                "allowedTokenTypes": [PASSWORD_RESET],
            },
            "user": {
                "entryKey": current.entry_key,
                "expectedUpdatedAt": current.updated_at,
                "data": user,
            },
        }),
    );
    let mut operations: Vec<db::AtomicBatchOp> = vec![operation.into()];
    if let Some(primary) = verified_primary {
        operations
            .push(db::BatchOp::write(db::USER_EMAILS, &primary.entry_key, primary.data).into());
    }
    if claims_unverified_account {
        operations.extend(
            crate::data::api_keys::delete_operations(&user.id)?
                .into_iter()
                .map(Into::into),
        );
        operations.extend(
            user_emails::secondary_delete_operations(&user.id)?
                .into_iter()
                .map(Into::into),
        );
        for credential in crate::data::credentials::find_by_user(&user.id)? {
            operations.push(db::BatchOp::delete(db::CREDENTIALS, &credential.id).into());
        }
        operations.extend(
            crate::data::sso_identities::delete_operations(
                &crate::data::sso_identities::find_by_user(&user.id)?,
            )
            .into_iter()
            .map(Into::into),
        );
        operations.push(db::BatchOp::delete(db::TOTP, &user.id).into());
    }
    let old_totp = if claims_unverified_account {
        crate::data::totp::find_by_user(&user.id)?
    } else {
        None
    };
    let result = db::batch_with_results(&operations)?;
    verifications::consumed_payload(&result, &token, &[PASSWORD_RESET])?;
    validate_password_reset_output(&result)?;
    if claims_unverified_account
        && super::super::totp_credentials::delete(&user.id, old_totp.as_ref()).is_err()
    {
        crate::host::log::op_warn("auth", "mailbox-claim-totp-secret-delete", "secrets_error");
    }
    let _ = telemetry::emit_event(
        "cedros-login:password-reset-completed",
        "",
        &serde_json::json!({ "scope": "all-sessions", "routeId": "cedros-login:reset-password" }),
    );
    Ok(json(200, r#"{"message":"Password reset successfully"}"#))
}

fn validate_password_reset_output(result: &db::AtomicBatchResult) -> Result<u64, RouteError> {
    result
        .results
        .first()
        .and_then(|row| row.output.get("revokedSessions"))
        .and_then(serde_json::Value::as_u64)
        .ok_or(RouteError::Status(502, "db_error"))
}

/// POST /set-password — set a password for a passwordless account.
pub(super) fn set_password_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    super::super::auth::require_step_up(&claims)?;
    super::super::abuse::enforce_password_action(request, &claims.sub)?;
    let req: SetPasswordRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let mut versioned = users::find_by_id_versioned(&claims.sub)?
        .ok_or(RouteError::Status(404, "user_not_found"))?;
    if versioned.value.password_hash.is_some() {
        return Err(validation(
            "Account already has a password; use change-password instead",
        ));
    }
    let password = PasswordService::default();
    password.validate(&req.password)?;
    versioned.value.password_hash = Some(password.hash(&req.password)?);
    if !versioned
        .value
        .auth_methods
        .iter()
        .any(|method| method == "password")
    {
        versioned.value.auth_methods.push("password".to_string());
    }
    versioned.value.updated_at = clock::now_iso();
    sessions::change_password_and_revoke_others(&versioned, &claims.sid)?;
    super::super::emit_identifier_linked("password", "cedros-login:set-password");
    let body = to_json(&serde_json::json!({
        "message": "Password set successfully",
        "linked": "password",
        "user": user_view(&versioned.value),
    }))?;
    Ok(json(200, &body))
}

fn password_recovery_allowed(user: &crate::data::users::UserEntry) -> bool {
    user.password_hash.is_some()
        || (user.email_verified && user.auth_methods.iter().any(|method| method == "email"))
}

/// POST /change-password — verify current, set new, revoke other sessions.
pub(super) fn change_password_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    super::super::abuse::enforce_password_action(request, &claims.sub)?;
    let req: ChangePasswordRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let mut versioned = users::find_by_id_versioned(&claims.sub)?
        .ok_or(RouteError::Status(404, "user_not_found"))?;
    let user = &mut versioned.value;
    let current = user
        .password_hash
        .clone()
        .ok_or(RouteError::Status(400, "no_password_set"))?;
    let password = PasswordService::default();
    if !password.verify(&req.current_password, &current) {
        return Err(AuthError::Unauthorized("invalid credentials".to_string()).into());
    }
    password.validate(&req.new_password)?;
    user.password_hash = Some(password.hash(&req.new_password)?);
    user.updated_at = clock::now_iso();
    sessions::change_password_and_revoke_others(&versioned, &claims.sid)?;
    Ok(json(200, r#"{"message":"Password changed"}"#))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn result(revoked_sessions: serde_json::Value) -> db::AtomicBatchResult {
        db::AtomicBatchResult {
            applied: 1,
            results: vec![db::ConditionalBatchResult {
                operation_id: db::ConditionalOperation::CompletePasswordReset
                    .id()
                    .to_string(),
                output: serde_json::json!({"revokedSessions": revoked_sessions}),
            }],
        }
    }

    #[test]
    fn password_reset_accepts_non_negative_revocation_count() {
        assert_eq!(
            validate_password_reset_output(&result(serde_json::json!(0))).unwrap(),
            0
        );
        assert_eq!(
            validate_password_reset_output(&result(serde_json::json!(7))).unwrap(),
            7
        );
    }

    #[test]
    fn password_reset_rejects_missing_or_non_integer_revocation_count() {
        for value in [
            serde_json::Value::Null,
            serde_json::json!(-1),
            serde_json::json!(1.5),
            serde_json::json!("7"),
        ] {
            assert!(matches!(
                validate_password_reset_output(&result(value)),
                Err(RouteError::Status(502, "db_error"))
            ));
        }
    }

    #[test]
    fn mailbox_claim_account_retains_a_password_recovery_path() {
        let user: crate::data::users::UserEntry = serde_json::from_value(serde_json::json!({
            "id":"u1", "email":"owner@example.com", "emailVerified":true,
            "passwordHash":null, "name":null, "username":null, "picture":null,
            "walletAddress":null, "googleId":null, "appleId":null,
            "authMethods":["email"], "suspendedAt":null, "isSystemAdmin":false,
            "createdAt":"t", "updatedAt":"t", "lastLoginAt":null,
            "welcomeCompletedAt":null, "avatarContentType":null
        }))
        .unwrap();
        assert!(password_recovery_allowed(&user));
    }
}
