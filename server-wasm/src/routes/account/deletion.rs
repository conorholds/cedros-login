use serde::Deserialize;

use super::{
    action_link, authenticated_user, clock, email_templates, from_json, json, normalize_email,
    prepare_token, telemetry, user_emails, users, validation, verifications, RouteError,
    RouteRequest, RouteResponse, RESET_TTL_SECS,
};
use crate::data::{account as account_data, audit, outbox};
use crate::services::tokens::hash_verification_token;

const ACCOUNT_DELETION: &str = "account_deletion";
const DELETE_CONFIRM_TEXT: &str = "DELETE";
const GENERIC_DELETION_OK: &str =
    r#"{"message":"If an account exists, a deletion confirmation email has been sent"}"#;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EmailRequest {
    email: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VerifyRequest {
    token: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct DeleteAccountRequest {
    confirm_text: String,
}

/// POST /account-deletion/request — email a deletion-confirm link; generic response.
pub(super) fn request_deletion_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let req: EmailRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let normalized = normalize_email(&req.email);
    if let Some(user) = users::find_by_email(&normalized)? {
        if !email_deletion_allowed(&user) {
            return Ok(json(200, GENERIC_DELETION_OK));
        }
        if let Some(to) = user.email.clone() {
            let token = prepare_token(&user.id, ACCOUNT_DELETION, RESET_TTL_SECS, Some(to.clone()));
            let url = action_link("/confirm-account-deletion", &token.raw);
            let email = email_templates::account_deletion(
                &crate::services::email_design::resolve("cedros-login/account_deletion")?,
                user.name.as_deref(),
                &url,
                RESET_TTL_SECS / 3600,
            );
            if let Err(error) = outbox::enqueue_token_email(
                &token.entry,
                &to,
                &email.subject,
                Some(&email.html),
                Some(&email.text),
            ) {
                crate::host::log::op_warn("auth", "account-deletion-email", error.code());
            }
        }
    }
    Ok(json(200, GENERIC_DELETION_OK))
}

/// POST /account-deletion/confirm — atomically validate/consume the proof and
/// purge the complete account graph in the host lifecycle transaction.
pub(super) fn confirm_deletion_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let req: VerifyRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let token_hash = hash_verification_token(&req.token);
    let proof = verifications::find_by_token_hash_versioned(&token_hash)?
        .ok_or(RouteError::Status(400, "invalid_token"))?;
    if proof.value.token_type != ACCOUNT_DELETION
        || proof.value.used_at.is_some()
        || proof.value.expires_at <= clock::now_iso()
    {
        return Err(RouteError::Status(400, "invalid_token"));
    }
    let user =
        users::find_by_id(&proof.value.user_id)?.ok_or(RouteError::Status(400, "invalid_token"))?;
    let target = proof
        .value
        .target_email
        .as_deref()
        .ok_or(RouteError::Status(400, "invalid_token"))?;
    if !user_emails::is_verified_for_user(&user, target)? {
        return Err(RouteError::Status(400, "invalid_token"));
    }
    if !email_deletion_allowed(&user) || crate::data::totp::has_mfa(&user.id)? {
        return Err(RouteError::Status(403, "step_up_required"));
    }
    purge_user(&proof.value.user_id, Some(&proof))?;
    emit_account_deleted(
        &proof.value.user_id,
        "email-link",
        "confirm-account-deletion",
    );
    Ok(json(200, r#"{"message":"Account deleted successfully"}"#))
}

/// DELETE /account-deletion/me — authenticated immediate deletion (typed confirm).
pub(super) fn delete_account_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    super::super::auth::require_step_up(&claims)?;
    let req: DeleteAccountRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    if req.confirm_text.trim() != DELETE_CONFIRM_TEXT {
        return Err(validation("Type DELETE to confirm account deletion"));
    }
    purge_user(&claims.sub, None)?;
    emit_account_deleted(&claims.sub, "typed-confirm", "delete-account");
    Ok(json(200, r#"{"message":"Account deleted successfully"}"#))
}

fn purge_user(
    user_id: &str,
    proof: Option<&crate::data::verifications::VersionedVerificationEntry>,
) -> Result<account_data::AccountDeletionOutcome, RouteError> {
    let old_totp = crate::data::totp::find_by_user(user_id)?;
    let sso_provider_ids = sso_provider_ids_for_user_orgs(user_id)?;
    let outcome = account_data::purge_user(user_id, proof)?;
    if super::super::totp_credentials::delete(user_id, old_totp.as_ref()).is_err() {
        crate::host::log::op_warn("auth", "account-totp-secret-delete", "secrets_error");
    }
    for provider_id in sso_provider_ids {
        match crate::data::sso_providers::find_by_id(&provider_id) {
            Ok(None) => {
                if super::super::sso_credentials::delete(&provider_id).is_err() {
                    crate::host::log::op_warn(
                        "sso",
                        "account-client-secret-delete",
                        "secrets_error",
                    );
                }
            }
            Ok(Some(_)) => {}
            Err(_) => crate::host::log::op_warn("sso", "account-client-secret-delete", "db_error"),
        }
    }
    Ok(outcome)
}

fn sso_provider_ids_for_user_orgs(user_id: &str) -> Result<Vec<String>, RouteError> {
    const PAGE_SIZE: u32 = 100;
    let total = crate::data::memberships::count_by_user(user_id)?;
    let mut offset = 0_u32;
    let mut provider_ids = Vec::new();
    while u64::from(offset) < total {
        let memberships = crate::data::memberships::page_by_user(user_id, PAGE_SIZE, offset)?;
        if memberships.is_empty() {
            return Err(crate::host::SeamError::Db(
                "membership count changed during account credential scan".into(),
            )
            .into());
        }
        for membership in &memberships {
            provider_ids.extend(crate::data::sso_providers::ids_by_org(&membership.org_id)?);
        }
        offset = offset
            .checked_add(memberships.len() as u32)
            .ok_or_else(|| {
                crate::host::SeamError::Db("too many memberships for account deletion".into())
            })?;
    }
    provider_ids.sort_unstable();
    provider_ids.dedup();
    Ok(provider_ids)
}

fn emit_account_deleted(user_id: &str, method: &str, route: &str) {
    let _ = audit::log(
        audit::ACCOUNT_DELETED,
        Some(user_id),
        Some("user"),
        Some(user_id),
    );
    let _ = telemetry::emit_event(
        "cedros-login:account-deleted",
        "",
        &serde_json::json!({
            "confirmationMethod": method,
            "routeId": format!("cedros-login:{route}"),
        }),
    );
}

fn email_deletion_allowed(user: &users::UserEntry) -> bool {
    user.email_verified
        && user.email.is_some()
        && (user.password_hash.is_some()
            || user.auth_methods.iter().any(|method| method == "email"))
}

#[cfg(test)]
mod lifecycle_tests {
    use super::*;
    #[test]
    fn email_deletion_requires_an_enrolled_email_credential() {
        let mut user: users::UserEntry = serde_json::from_value(serde_json::json!({"id":"u","email":"owner@example.com","emailVerified":true,"passwordHash":"hash","authMethods":["password"],"isSystemAdmin":false,"createdAt":"t","updatedAt":"t"})).unwrap();
        user.email_verified = true;
        assert!(email_deletion_allowed(&user));
        user.email_verified = false;
        assert!(!email_deletion_allowed(&user));
        user.email_verified = true;
        user.password_hash = None;
        user.auth_methods.clear();
        user.google_id = Some("google".into());
        assert!(!email_deletion_allowed(&user));
    }
}
