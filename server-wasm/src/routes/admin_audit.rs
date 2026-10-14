//! Admin audit-log read (part of `cedros-login:admin-users-settings-audit`).
//! Host-admin-gated; paged, newest first, optional eventType/targetId filters.
use serde::Serialize;

use super::org_access::{org_id, require_membership, role_of};
use super::{auth, error_response, json, pagination, require_system_admin, RouteError};
use crate::data::audit::{self, AuditLogEntry};
use crate::domain::permissions::OrgRole;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::to_json;

const DEFAULT_LIMIT: u32 = 50;
const MAX_LIMIT: u32 = 200;
const MAX_OFFSET: u32 = 1_000_000;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ListAuditResponse {
    logs: Vec<AuditLogEntry>,
    total: u64,
    limit: u32,
    offset: u32,
}

pub fn list(request: &RouteRequest) -> RouteResponse {
    match list_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let (limit, offset) = pagination::paged(&request.query, DEFAULT_LIMIT, MAX_LIMIT, MAX_OFFSET);
    let event_type = query_param(request, "eventType");
    let target_id = query_param(request, "targetId");
    let logs = audit::query(event_type.as_deref(), target_id.as_deref(), limit, offset)?;
    let total = audit::count(event_type.as_deref(), target_id.as_deref())?;
    Ok(json(
        200,
        &to_json(&ListAuditResponse {
            logs,
            total,
            limit,
            offset,
        })?,
    ))
}

/// GET /orgs/:org_id/audit — audit records targeting one org. Org admin+ gated.
pub fn org_list(request: &RouteRequest) -> RouteResponse {
    match org_list_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn org_list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let org = org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    super::org_access::require_permission(
        &user_id,
        org,
        crate::domain::permissions::Permission::AuditRead,
    )?;
    let membership = require_membership(&user_id, org)?;
    if !role_of(&membership)?.has_at_least(OrgRole::Admin) {
        return Err(RouteError::Status(403, "forbidden"));
    }
    let (limit, offset) = pagination::paged(&request.query, DEFAULT_LIMIT, MAX_LIMIT, MAX_OFFSET);
    let logs = audit::query(None, Some(org), limit, offset)?;
    let total = audit::count(None, Some(org))?;
    Ok(json(
        200,
        &to_json(&ListAuditResponse {
            logs,
            total,
            limit,
            offset,
        })?,
    ))
}

fn query_param(request: &RouteRequest, key: &str) -> Option<String> {
    request
        .query
        .iter()
        .find(|(k, _)| k == key)
        .map(|(_, v)| v.clone())
}
