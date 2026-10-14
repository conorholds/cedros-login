//! Admin-only delivery verification for the site-owned email provider.

use crate::context::RouteContext;
use crate::data::users;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{providers, to_json};

use super::{error_response, json, require_system_admin_write, RouteError};

const SUBJECT: &str = "Cedros Login email delivery test";
const TEXT_BODY: &str = "Your site's configured email provider accepted this Cedros Login test message. Return to Login settings and confirm that it reached this inbox.";

pub fn send_test(request: &RouteRequest) -> RouteResponse {
    match send_test_inner(request) {
        Ok(response) => response,
        Err(error) => error_response(error),
    }
}

fn send_test_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let context = RouteContext::parse(&request.context_json);
    let actor_id = context
        .actor_id
        .as_deref()
        .ok_or(RouteError::Status(403, "admin_required"))?;
    let recipient = admin_recipient(&context, actor_id)?;
    let request_id = context
        .request_id
        .as_deref()
        .filter(|value| !value.trim().is_empty())
        .ok_or(RouteError::Status(503, "request_context_unavailable"))?;
    let idempotency_key = format!("cedros-login-email-test-{request_id}");

    providers::send_email(&providers::EmailMessage {
        to: &recipient,
        subject: SUBJECT,
        html_body: None,
        text_body: Some(TEXT_BODY),
        contract_version: Some(providers::EMAIL_MESSAGE_CONTRACT_VERSION),
        idempotency_key: Some(&idempotency_key),
        attempt: Some(1),
        duplicate_risk: Some(false),
        essential_email_evidence: None,
    })?;

    Ok(json(
        200,
        &to_json(&serde_json::json!({ "message": "Test email accepted for delivery" }))?,
    ))
}

fn admin_recipient(context: &RouteContext, actor_id: &str) -> Result<String, RouteError> {
    match context.actor_email.clone() {
        Some(email) => Some(email),
        None => users::find_by_id(actor_id)?.and_then(|user| user.email),
    }
    .filter(|email| !email.trim().is_empty())
    .ok_or(RouteError::Status(409, "admin_email_unavailable"))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request(context_json: &str) -> RouteRequest {
        RouteRequest {
            route_id: "cedros-login:admin-email-test".into(),
            method: "POST".into(),
            path: "/admin/email/test".into(),
            query: Vec::new(),
            headers: Vec::new(),
            body: "{}".into(),
            context_json: context_json.into(),
        }
    }

    #[test]
    fn test_send_fails_closed_before_provider_access_without_admin_context() {
        let response = send_test(&request(r#"{"authenticated":false}"#));
        assert_eq!(response.status, 401);

        let response = send_test(&request(
            r#"{"actorId":"user-1","authenticated":true,"systemAdmin":false,"csrfVerified":true}"#,
        ));
        assert_eq!(response.status, 403);
    }

    #[test]
    fn trusted_host_email_does_not_require_a_matching_login_user_id() {
        let context = RouteContext::parse(
            r#"{"actorId":"local-owner","actorEmail":"owner@example.test","authenticated":true,"systemAdmin":true,"csrfVerified":true}"#,
        );

        assert_eq!(
            admin_recipient(&context, "local-owner").unwrap(),
            "owner@example.test"
        );
    }
}
