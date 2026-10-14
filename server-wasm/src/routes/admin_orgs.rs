//! System-admin organization reads: `GET /admin/orgs` (paged) and
//! `GET /admin/orgs/{org_id}`. Host-admin gated. Port of
//! `server/src/handlers/admin/orgs.rs`.
use serde::Serialize;

use super::{error_response, json, pagination, require_system_admin, RouteError};
use crate::data::orgs::{self, OrgEntry};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::to_json;

const DEFAULT_LIMIT: u32 = 50;
const MAX_LIMIT: u32 = 100;
const MAX_OFFSET: u32 = 1_000_000;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OrgView {
    id: String,
    name: String,
    slug: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    logo_url: Option<String>,
    is_personal: bool,
    owner_id: String,
    created_at: String,
    updated_at: String,
}

impl OrgView {
    fn from_entry(org: &OrgEntry) -> Self {
        OrgView {
            id: org.id.clone(),
            name: org.name.clone(),
            slug: org.slug.clone(),
            logo_url: org.logo_url.clone(),
            is_personal: org.is_personal,
            owner_id: org.owner_id.clone(),
            created_at: org.created_at.clone(),
            updated_at: org.updated_at.clone(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ListResponse {
    orgs: Vec<OrgView>,
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

pub fn get(request: &RouteRequest) -> RouteResponse {
    match get_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let (limit, offset) = pagination::paged(&request.query, DEFAULT_LIMIT, MAX_LIMIT, MAX_OFFSET);
    let total = orgs::count()?;
    let orgs_out = orgs::list_all(limit, offset)?
        .iter()
        .map(OrgView::from_entry)
        .collect();
    Ok(json(
        200,
        &to_json(&ListResponse {
            orgs: orgs_out,
            total,
            limit,
            offset,
        })?,
    ))
}

fn get_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let org_id = request.path.rsplit('/').next().unwrap_or("");
    let org = orgs::find_by_id(org_id)?.ok_or(RouteError::Status(404, "org_not_found"))?;
    Ok(json(200, &to_json(&OrgView::from_entry(&org))?))
}
