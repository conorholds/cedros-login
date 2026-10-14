//! Synthetic previews use the production renderer; no tokens or outbox work.
use super::{error_response, json, require_system_admin_write, RouteError};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::services::{
    email_design::{Design, Presentation},
    email_templates,
};
use serde::Deserialize;
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Preview {
    contract_version: u32,
    template_id: String,
    design: Presentation,
}
pub fn preview(request: &RouteRequest) -> RouteResponse {
    match render(request) {
        Ok(response) => response,
        Err(error) => error_response(error),
    }
}
fn render(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let body: Preview = crate::host::from_json(&request.body)
        .map_err(|_| RouteError::Status(400, "invalid_body"))?;
    if body.contract_version != 1 {
        return Err(RouteError::Status(400, "unsupported_contract"));
    }
    let design = Design::from_presentation(body.design)
        .map_err(|_| RouteError::Status(400, "invalid_design"))?;
    let url = "https://example.test/preview-action";
    let email = match body.template_id.as_str() {
        "cedros-login/email_verification" | "cedros-login/account_email_verify" => {
            email_templates::verification(&design, Some("Alex"), url, 24)
        }
        "cedros-login/password_reset" => {
            email_templates::password_reset(&design, Some("Alex"), url, 60)
        }
        "cedros-login/instant_link" => {
            email_templates::instant_link(&design, Some("Alex"), url, 15)
        }
        "cedros-login/account_deletion" => {
            email_templates::account_deletion(&design, Some("Alex"), url, 1)
        }
        "cedros-login/team_invitation" => {
            email_templates::invite(&design, "Example team", Some("Morgan"), "member", url, 7)
        }
        _ => return Err(RouteError::Status(400, "unknown_template")),
    };
    Ok(json(200, &crate::host::to_json(&email)?))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn preview_requires_a_system_admin_even_for_synthetic_data() {
        let r = RouteRequest {
            route_id: "cedros-login:system-email-preview".into(),
            method: "POST".into(),
            path: "/admin/system-email-preview".into(),
            headers: vec![],
            query: vec![],
            body: "{}".into(),
            context_json: "{}".into(),
        };
        assert_eq!(preview(&r).status, 401);
        let r=RouteRequest{context_json:r#"{"authenticated":true,"csrfVerified":true,"actorId":"member","systemAdmin":false}"#.into(),..r};
        assert_eq!(preview(&r).status, 403);
    }
    #[test]
    fn synthetic_preview_matches_production_and_rejects_contract_drift() {
        let presentation = crate::services::email_design::fixture();
        let design =
            Design::from_presentation(serde_json::from_value(presentation.clone()).unwrap())
                .unwrap();
        let body = serde_json::json!({"contractVersion":1,"templateId":"cedros-login/email_verification","design":presentation});
        let request = RouteRequest {
            route_id: "cedros-login:system-email-preview".into(),
            method: "POST".into(),
            path: "/admin/system-email-preview".into(),
            headers: vec![],
            query: vec![],
            body: body.to_string(),
            context_json:
                r#"{"authenticated":true,"csrfVerified":true,"actorId":"admin","systemAdmin":true}"#
                    .into(),
        };
        let response = preview(&request);
        assert_eq!(response.status, 200);
        assert_eq!(
            serde_json::from_str::<serde_json::Value>(&response.body).unwrap(),
            serde_json::to_value(email_templates::verification(
                &design,
                Some("Alex"),
                "https://example.test/preview-action",
                24
            ))
            .unwrap()
        );
        for (key, value) in [
            ("contractVersion", serde_json::json!(2)),
            ("templateId", serde_json::json!("host/team_invitation")),
        ] {
            let mut invalid = body.clone();
            invalid[key] = value;
            assert_eq!(
                preview(&RouteRequest {
                    body: invalid.to_string(),
                    route_id: request.route_id.clone(),
                    method: request.method.clone(),
                    path: request.path.clone(),
                    headers: vec![],
                    query: vec![],
                    context_json: request.context_json.clone()
                })
                .status,
                400
            );
        }
    }
}
