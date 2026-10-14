//! Account email management routes for the Wasm public-auth surface.
//!
//! Rows are globally unique while verified or pending. Login lookup only uses
//! verified rows. Primary changes require recent step-up and keep `users.email`
//! denormalized for the published auth-response user body.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::account::verify_email_token;
use super::auth::{authenticated_user, require_step_up};
use super::{action_link, error_response, json, validation, RouteError};
use crate::clock;
use crate::data::canonical_email;
use crate::data::outbox;
use crate::data::user_emails::{self, UserEmailEntry};
use crate::data::users::{self, UserEntry};
use crate::data::verifications::VerificationEntry;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, to_json};
use crate::services::email::{is_valid_email, normalize_email, validate_ascii_local};
use crate::services::email_templates;
use crate::services::tokens::{generate_verification_token, hash_verification_token};

const ACCOUNT_EMAIL_VERIFY: &str = "account_email_verify";
const VERIFY_TTL_SECS: i64 = 24 * 60 * 60;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AddEmailRequest {
    email: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VerifyEmailRequest {
    token: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AccountEmailView {
    id: String,
    email: String,
    verified: bool,
    primary: bool,
    created_at: String,
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

route!(list, list_inner);
route!(add, add_inner);
route!(resend, resend_inner);
route!(delete, delete_inner);
route!(set_primary, set_primary_inner);
route!(verify, verify_inner);

fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    email_list(&claims.sub)
}

fn add_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    require_step_up(&claims)?;
    super::abuse::enforce_email_action(request, &claims.sub)?;
    let req: AddEmailRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let email = validate_new_email(&req.email)?;
    super::abuse::enforce_email_action(request, &email)?;
    let row = UserEmailEntry::new(&user.id, email, false, false);
    queue_email_verification(&user, &row, vec![user_emails::create_op(&row)?])?;
    email_list(&user.id)
}

fn resend_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    super::abuse::enforce_email_action(request, &claims.sub)?;
    let id = email_id(&request.path, "/resend")?;
    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let row = owned_email(&user.id, id)?;
    if row.is_verified() {
        return Ok(json(200, r#"{"message":"Email is already verified"}"#));
    }
    super::abuse::enforce_email_action(request, &row.email)?;
    queue_email_verification(&user, &row, Vec::new())?;
    Ok(json(200, r#"{"message":"Verification email sent"}"#))
}

fn delete_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    require_step_up(&claims)?;
    let id = email_id(&request.path, "")?;
    let row = owned_email(&claims.sub, id)?;
    if row.is_primary {
        return Err(validation("Primary email cannot be removed"));
    }
    let operations = [
        crate::host::db::BatchOp::delete(crate::host::db::USER_EMAILS, &row.id).into(),
        crate::host::db::ConditionalBatchOp::new(
            crate::host::db::ConditionalOperation::RevokeSessions,
            serde_json::json!({
                "userId": claims.sub,
                "reason": "email_credential_removed",
                "exceptSessionId": claims.sid,
            }),
        )
        .into(),
    ];
    crate::host::db::batch_with_results(&operations)?;
    super::emit_identifier_unlinked("email", "cedros-login:account-emails-delete");
    email_list(&claims.sub)
}

fn set_primary_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    require_step_up(&claims)?;
    let id = email_id(&request.path, "/primary")?;
    let row = owned_email(&claims.sub, id)?;
    if !row.is_verified() {
        return Err(validation("Primary email must be verified"));
    }
    canonical_email::promote(&claims.sub, &row.id, &claims.sid)?
        .ok_or(RouteError::Status(404, "email_not_found"))?;
    email_list(&claims.sub)
}

fn verify_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let req: VerifyEmailRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    verify_email_token(&req.token, &[ACCOUNT_EMAIL_VERIFY])?;
    super::emit_identifier_linked("email", "cedros-login:account-emails-verify");
    Ok(json(200, r#"{"message":"Email verified successfully"}"#))
}

fn validate_new_email(raw: &str) -> Result<String, RouteError> {
    if !is_valid_email(raw) {
        return Err(validation("Invalid email format"));
    }
    validate_ascii_local(raw)?;
    let normalized = normalize_email(raw);
    if user_emails::email_blocks_signup(&normalized)?
        || users::find_by_email(&normalized)?.is_some()
    {
        return Err(RouteError::Status(409, "email_exists"));
    }
    Ok(normalized)
}

fn queue_email_verification(
    user: &UserEntry,
    row: &UserEmailEntry,
    companion_ops: Vec<crate::host::db::BatchOp>,
) -> Result<(), RouteError> {
    let token = generate_verification_token();
    let verification = VerificationEntry {
        id: Uuid::new_v4().to_string(),
        user_id: user.id.clone(),
        token_hash: hash_verification_token(&token),
        token_type: ACCOUNT_EMAIL_VERIFY.to_string(),
        target_email: Some(row.email.clone()),
        subject_id: Some(row.id.clone()),
        created_at: clock::now_iso(),
        expires_at: clock::in_secs(VERIFY_TTL_SECS),
        used_at: None,
    };
    let url = action_link("/verify-email", &token);
    let email = super::with_subject_override(
        email_templates::verification(
            &crate::services::email_design::resolve("cedros-login/account_email_verify")?,
            user.name.as_deref(),
            &url,
            VERIFY_TTL_SECS / 3600,
        ),
        "email_subject_verification",
    );
    outbox::enqueue_token_email_with_ops(
        &verification,
        &row.email,
        &email.subject,
        Some(&email.html),
        Some(&email.text),
        companion_ops,
    )
    .map_err(Into::into)
}

fn email_list(user_id: &str) -> Result<RouteResponse, RouteError> {
    let emails: Vec<_> = user_emails::list_by_user(user_id)?
        .into_iter()
        .map(email_view)
        .collect();
    Ok(json(
        200,
        &to_json(&serde_json::json!({ "emails": emails }))?,
    ))
}

fn owned_email(user_id: &str, id: &str) -> Result<UserEmailEntry, RouteError> {
    user_emails::find_by_id(id)?
        .filter(|row| row.user_id == user_id)
        .ok_or(RouteError::Status(404, "email_not_found"))
}

fn email_id<'a>(path: &'a str, suffix: &str) -> Result<&'a str, RouteError> {
    path.strip_prefix("/account/emails/")
        .and_then(|tail| tail.strip_suffix(suffix))
        .map(str::trim)
        .filter(|id| !id.is_empty() && !id.contains('/'))
        .ok_or(RouteError::Status(404, "email_not_found"))
}

fn email_view(row: UserEmailEntry) -> AccountEmailView {
    let verified = row.is_verified();
    AccountEmailView {
        id: row.id,
        email: row.email,
        verified,
        primary: row.is_primary,
        created_at: row.created_at,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn email_id_extracts_nested_route_id() {
        assert_eq!(
            email_id("/account/emails/email-1/resend", "/resend").unwrap(),
            "email-1"
        );
        assert!(matches!(
            email_id("/account/emails/email-1/bad", "/resend"),
            Err(RouteError::Status(404, "email_not_found"))
        ));
    }
}
