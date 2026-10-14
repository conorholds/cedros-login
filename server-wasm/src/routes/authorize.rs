//! Authorization checks: `POST /authorize` (RBAC + ABAC permission evaluation)
//! and `POST /permissions` (the caller's effective permissions in an org).
//! Authenticated as the acting end-user principal; the org comes from the body.
//! Port of `server/src/handlers/authorize.rs`.
use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

use super::{auth, error_response, json, validation, RouteError};
use crate::data::{memberships, users};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, to_json};
use crate::services::abac;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AuthorizeRequest {
    permission: String,
    org_id: String,
    #[serde(default)]
    resource: Option<HashMap<String, Value>>,
    #[serde(default)]
    environment: Option<HashMap<String, Value>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AuthorizeResponse {
    allowed: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    reason: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    matched_policy_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    matched_policy_name: Option<String>,
    used_rbac_fallback: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PermissionsRequest {
    org_id: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PermissionsResponse {
    permissions: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    role: Option<String>,
    user_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    user_email: Option<String>,
}

pub fn authorize(request: &RouteRequest) -> RouteResponse {
    match authorize_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

pub fn permissions(request: &RouteRequest) -> RouteResponse {
    match permissions_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn authorize_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let principal = auth::authorization_principal(request)?;
    let req: AuthorizeRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    reject_untrusted_context(req.resource.as_ref(), req.environment.as_ref())?;
    let result = abac::evaluate(
        &principal.user_id,
        &req.org_id,
        &req.permission,
        None,
        principal.allow_system_admin,
    )?;
    Ok(json(
        200,
        &to_json(&AuthorizeResponse {
            allowed: result.allowed,
            reason: result.reason,
            matched_policy_id: result.matched_policy_id,
            matched_policy_name: result.matched_policy_name,
            used_rbac_fallback: result.used_rbac_fallback,
        })?,
    ))
}

fn permissions_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let principal = auth::authorization_principal(request)?;
    let user_id = principal.user_id;
    let req: PermissionsRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    // Non-members get 403 (clearer than an empty permission set), mirroring the
    // standalone authorization behavior.
    let membership =
        memberships::find(&user_id, &req.org_id)?.ok_or(RouteError::Status(403, "forbidden"))?;
    let permissions =
        abac::effective_permissions(&user_id, &req.org_id, principal.allow_system_admin)?
            .iter()
            .map(|permission| permission.as_str().to_string())
            .collect();
    let user_email = users::find_by_id(&user_id)?.and_then(|user| user.email);
    Ok(json(
        200,
        &to_json(&PermissionsResponse {
            permissions,
            role: Some(membership.role),
            user_id,
            user_email,
        })?,
    ))
}

fn reject_untrusted_context<T, U>(
    resource: Option<&T>,
    environment: Option<&U>,
) -> Result<(), RouteError> {
    if resource.is_some() || environment.is_some() {
        return Err(validation(
            "Resource and environment attributes require a trusted server integration",
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::reject_untrusted_context;

    #[test]
    fn public_authorize_rejects_caller_asserted_context() {
        assert!(reject_untrusted_context(Some(&()), None::<&()>).is_err());
        assert!(reject_untrusted_context(None::<&()>, Some(&())).is_err());
        assert!(reject_untrusted_context(None::<&()>, None::<&()>).is_ok());
    }
}
