//! Organization routes (`cedros-login:organizations`): create, list, get,
//! update, delete, switch. Faithful port of `server/src/handlers/orgs/*`.
//!
//! Auth is the acting end user via [`auth::principal`] — an RS256 access token
//! (dashboard) or a `ck_` API key (programmatic), matching the standalone. Switch
//! rotates the session, so it requires full JWT claims ([`auth::authenticated_user`]).
//!
//! Org + membership creation shares the org-db access. Deletion uses the host
//! organization-lifecycle transaction so all organization dependents across
//! the org and identity domains are removed without insertion races.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::org_access::{as_value, require_membership, role_of};
use super::{auth, cookies, error_response, json, pagination, validation, RouteError};
use crate::clock;
use crate::data::memberships::{self, MembershipEntry};
use crate::data::organization_lifecycle;
use crate::data::orgs::{self, OrgEntry};
use crate::data::sessions::{self, SessionEntry};
use crate::data::users;
use crate::domain::permissions::OrgRole;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::db::{self, BatchOp, MEMBERSHIPS, ORGS};
use crate::host::to_json;
use crate::services::jwt::{TokenContext, TokenPair};

const DEFAULT_PAGE_SIZE: u32 = 50;
const MAX_PAGE_SIZE: u32 = 100;
const MAX_OFFSET: u32 = 1_000_000;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateOrgRequest {
    name: String,
    #[serde(default)]
    slug: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateOrgRequest {
    /// The name displayed when a collaborative rename form was opened.
    #[serde(default)]
    expected_name: Option<String>,
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    slug: Option<String>,
    #[serde(default)]
    logo_url: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OrgView {
    id: String,
    name: String,
    slug: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    logo_url: Option<String>,
    is_personal: bool,
    role: String,
    created_at: String,
    updated_at: String,
}

impl OrgView {
    fn from_entry(org: &OrgEntry, role: &str) -> Self {
        OrgView {
            id: org.id.clone(),
            name: org.name.clone(),
            slug: org.slug.clone(),
            logo_url: org.logo_url.clone(),
            is_personal: org.is_personal,
            role: role.to_string(),
            created_at: org.created_at.clone(),
            updated_at: org.updated_at.clone(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ListOrgsResponse {
    orgs: Vec<OrgView>,
    total: u64,
    limit: u32,
    offset: u32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SwitchOrgResponse {
    org_id: String,
    role: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    tokens: Option<TokenPair>,
}

#[derive(Serialize)]
struct MessageResponse {
    message: String,
}

pub fn create(request: &RouteRequest) -> RouteResponse {
    run(create_inner(request))
}
pub fn list(request: &RouteRequest) -> RouteResponse {
    run(list_inner(request))
}
pub fn get(request: &RouteRequest) -> RouteResponse {
    run(get_inner(request))
}
pub fn update(request: &RouteRequest) -> RouteResponse {
    run(update_inner(request))
}
pub fn delete(request: &RouteRequest) -> RouteResponse {
    run(delete_inner(request))
}
pub fn switch(request: &RouteRequest) -> RouteResponse {
    run(switch_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// POST /orgs — create an org; the caller becomes its owner.
fn create_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let req: CreateOrgRequest = crate::host::from_json(&request.body)
        .map_err(|_| RouteError::Status(400, "invalid_body"))?;

    let name = validate_name(&req.name)?;
    let slug = match req.slug.as_deref() {
        Some(s) => validate_slug(s)?,
        None => orgs::generate_slug(&name),
    };
    if slug.is_empty() || slug.len() > 100 {
        return Err(validation("Slug must be 1-100 characters"));
    }
    if orgs::slug_exists(&slug)? {
        return Err(validation("Organization slug already exists"));
    }

    let org = OrgEntry::new(name, slug, user_id.clone(), false);
    let membership = MembershipEntry {
        id: Uuid::new_v4().to_string(),
        user_id: user_id.clone(),
        org_id: org.id.clone(),
        role: OrgRole::Owner.as_str().to_string(),
        joined_at: clock::now_iso(),
    };
    // Atomic: org + owner membership share the org-db access.
    db::batch(&[
        BatchOp::write(ORGS, &org.id, as_value(&org)?),
        BatchOp::write(MEMBERSHIPS, &membership.id, as_value(&membership)?),
    ])?;

    Ok(json(
        200,
        &to_json(&OrgView::from_entry(&org, OrgRole::Owner.as_str()))?,
    ))
}

/// GET /orgs — the caller's organizations, paged, each with their role.
fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let (limit, offset) =
        pagination::paged(&request.query, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MAX_OFFSET);

    let memberships = memberships::page_by_user(&user_id, limit, offset)?;
    let total = memberships::count_by_user(&user_id)?;
    let orgs = orgs::find_by_ids(
        &memberships
            .iter()
            .map(|m| m.org_id.clone())
            .collect::<Vec<_>>(),
    )?;
    let orgs_out = memberships
        .iter()
        .filter_map(|m| {
            orgs.get(&m.org_id)
                .map(|org| OrgView::from_entry(org, &m.role))
        })
        .collect();
    Ok(json(
        200,
        &to_json(&ListOrgsResponse {
            orgs: orgs_out,
            total,
            limit,
            offset,
        })?,
    ))
}

/// GET /orgs/:id — org details; caller must be a member.
fn get_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let org_id =
        super::org_access::org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    super::org_access::require_permission(
        &user_id,
        org_id,
        crate::domain::permissions::Permission::OrgRead,
    )?;

    let membership = require_membership(&user_id, org_id)?;
    let org = orgs::find_by_id(org_id)?.ok_or(RouteError::Status(404, "not_found"))?;
    Ok(json(
        200,
        &to_json(&OrgView::from_entry(&org, &membership.role))?,
    ))
}

/// PATCH /orgs/:id — update name/slug/logo; owner or admin only.
fn update_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let org_id =
        super::org_access::org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    super::org_access::require_permission(
        &user_id,
        org_id,
        crate::domain::permissions::Permission::OrgUpdate,
    )?;
    let req: UpdateOrgRequest = crate::host::from_json(&request.body)
        .map_err(|_| RouteError::Status(400, "invalid_body"))?;

    let membership = memberships::find_versioned(&user_id, org_id)?
        .ok_or(RouteError::Status(403, "forbidden"))?;
    let current = db::read_versioned::<OrgEntry>(ORGS, org_id)?
        .ok_or(RouteError::Status(404, "not_found"))?;
    if current.value.id != org_id {
        return Err(RouteError::Status(409, "organization_changed"));
    }
    let org = update_organization(&membership, current, req)?;
    Ok(json(
        200,
        &to_json(&OrgView::from_entry(&org, &membership.value.role))?,
    ))
}

fn update_organization(
    membership: &memberships::VersionedMembership,
    current: db::Versioned<OrgEntry>,
    req: UpdateOrgRequest,
) -> Result<OrgEntry, RouteError> {
    if !role_of(&membership.value)?.has_at_least(OrgRole::Admin) {
        return Err(RouteError::Status(403, "forbidden"));
    }
    let org_id = current.value.id.clone();
    if membership.value.org_id != org_id {
        return Err(RouteError::Status(403, "forbidden"));
    }
    let mut org = current.value;
    if let Some(expected) = req.expected_name.as_deref() {
        if expected.len() > 255 {
            return Err(RouteError::Status(400, "invalid_body"));
        }
        if org.name != expected {
            return Err(RouteError::Status(409, "organization_changed"));
        }
    }

    if let Some(name) = req.name {
        org.name = validate_name(&name)?;
    }
    if let Some(slug) = req.slug {
        let slug = validate_slug(&slug)?;
        if slug != org.slug && orgs::slug_exists(&slug)? {
            return Err(validation("Organization slug already exists"));
        }
        org.slug = slug;
    }
    if let Some(logo_url) = req.logo_url {
        org.logo_url = if logo_url.is_empty() {
            None
        } else {
            Some(logo_url)
        };
    }
    org.updated_at = clock::now_iso();
    // Preserve all unrelated fields and commit only while both the account and
    // the acting membership retain their observed revisions.
    db::compare_and_set(
        &[membership.condition.clone(), current.condition],
        &[BatchOp::write(
            ORGS,
            &org_id,
            serde_json::to_value(&org).map_err(|_| RouteError::Status(500, "internal_error"))?,
        )],
    )?;

    Ok(org)
}

/// DELETE /orgs/:id — delete a non-personal org; only its creator (owner) may.
/// The host transaction revalidates ownership and cascades every dependent row.
fn delete_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let org_id =
        super::org_access::org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    super::org_access::require_permission(
        &user_id,
        org_id,
        crate::domain::permissions::Permission::OrgDelete,
    )?;

    let membership = memberships::find_versioned(&user_id, org_id)?
        .ok_or(RouteError::Status(403, "forbidden"))?;
    if role_of(&membership.value)? != OrgRole::Owner {
        return Err(RouteError::Status(403, "forbidden"));
    }
    let org = orgs::find_by_id_versioned(org_id)?.ok_or(RouteError::Status(404, "not_found"))?;
    validate_deletion_organization(&user_id, &org.value)?;
    validate_not_configured_default(
        org_id,
        super::setup::configured_default_org_id()?.as_deref(),
    )?;
    let provider_ids = crate::data::sso_providers::ids_by_org(org_id)?;
    organization_lifecycle::delete(&org, &membership)?;
    for provider_id in provider_ids {
        if super::sso_credentials::delete(&provider_id).is_err() {
            crate::host::log::op_warn("sso", "org-client-secret-delete", "secrets_error");
        }
    }

    Ok(json(
        200,
        &to_json(&MessageResponse {
            message: "Organization deleted successfully".to_string(),
        })?,
    ))
}

fn validate_not_configured_default(
    org_id: &str,
    configured_default: Option<&str>,
) -> Result<(), RouteError> {
    if configured_default == Some(org_id) {
        return Err(validation("Cannot delete the active default organization"));
    }
    Ok(())
}

fn validate_deletion_organization(
    user_id: &str,
    organization: &OrgEntry,
) -> Result<(), RouteError> {
    if organization.owner_id != user_id {
        return Err(RouteError::Status(403, "forbidden"));
    }
    if organization.is_personal {
        return Err(validation("Cannot delete personal organization"));
    }
    Ok(())
}

/// POST /orgs/:id/switch — rotate the session into the target org's context.
/// The host commits replacement creation and old-session consumption together.
fn switch_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    // Switch rotates the session, so it needs full session claims (JWT only) —
    // not the API-key principal the other org routes accept.
    let session_claims = auth::authenticated_user(request)?;
    let org_id =
        super::org_access::org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;

    let session = sessions::find_by_id(&session_claims.sid)?
        .ok_or(RouteError::Status(401, "invalid_token"))?;
    if session.user_id != session_claims.sub || !session_active(&session) {
        return Err(RouteError::Status(401, "invalid_token"));
    }
    orgs::find_by_id(org_id)?.ok_or(RouteError::Status(403, "organization_unavailable"))?;
    let membership = require_membership(&session_claims.sub, org_id)?;
    let user =
        users::find_by_id(&session_claims.sub)?.ok_or(RouteError::Status(401, "invalid_token"))?;

    let context = TokenContext {
        org_id: Some(org_id.to_string()),
        role: Some(membership.role.clone()),
        is_system_admin: if user.is_system_admin {
            Some(true)
        } else {
            None
        },
        email_verified: Some(user.email_verified),
    };
    let (tokens, replacement) = auth::prepare_session(
        &user,
        &context,
        auth::client_ip(request),
        auth::user_agent(request),
        session.last_strong_auth_at.clone(),
    )?;

    sessions::rotate(&session, &replacement, "org_switch")?;
    switch_response(org_id, &membership.role, tokens)
}

fn switch_response(
    org_id: &str,
    role: &str,
    tokens: TokenPair,
) -> Result<RouteResponse, RouteError> {
    let cfg = cookies::config();
    let mut headers = vec![("content-type".to_string(), "application/json".to_string())];
    let body_tokens = if cfg.enabled {
        headers.extend(cfg.auth_cookies(&tokens, auth::refresh_ttl_secs()));
        None
    } else {
        Some(tokens)
    };
    let body = to_json(&SwitchOrgResponse {
        org_id: org_id.to_string(),
        role: role.to_string(),
        tokens: body_tokens,
    })?;
    Ok(RouteResponse {
        status: 200,
        headers,
        body,
    })
}

fn session_active(session: &SessionEntry) -> bool {
    session.revoked_at.is_none() && session.expires_at.as_str() > clock::now_iso().as_str()
}

fn validate_name(name: &str) -> Result<String, RouteError> {
    let trimmed = name.trim();
    if trimmed.is_empty() || trimmed.len() > 255 {
        return Err(validation("Organization name must be 1-255 characters"));
    }
    Ok(trimmed.to_string())
}

fn validate_slug(slug: &str) -> Result<String, RouteError> {
    let normalized = slug.trim().to_lowercase();
    if normalized.is_empty() || normalized.len() > 100 {
        return Err(validation("Slug must be 1-100 characters"));
    }
    if !normalized.chars().all(|c| c.is_alphanumeric() || c == '-') {
        return Err(validation(
            "Slug can only contain letters, numbers, and hyphens",
        ));
    }
    Ok(normalized)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn collaborative_rename_guards_original_name_account_and_acting_membership() {
        use crate::host::db::{test_support::with_db, Condition, Versioned};
        use serde_json::json;
        use std::{cell::Cell, rc::Rc};
        for (name, role, actor_org, conflict, expected_status, writes) in [
            ("Original", "admin", "org", false, 200, 1),
            ("Teammate rename", "admin", "org", false, 409, 0),
            ("Original", "member", "org", false, 403, 0),
            ("Original", "admin", "another-org", false, 403, 0),
            ("Original", "admin", "org", true, 409, 1),
        ] {
            let actor = memberships::VersionedMembership {
                value: MembershipEntry {
                    id: "actor-membership".into(),
                    user_id: "actor".into(),
                    org_id: actor_org.into(),
                    role: role.into(),
                    joined_at: "now".into(),
                },
                entry_key: "actor-membership".into(),
                condition: Condition::version(MEMBERSHIPS, "actor-membership", "actor-version")
                    .unwrap(),
                host_updated_at: "now".into(),
            };
            let mut org = OrgEntry::new(name.into(), "original-slug".into(), "owner".into(), false);
            org.id = "org".into();
            org.logo_url = Some("https://fixture.test/logo".into());
            let current = Versioned {
                value: org,
                condition: Condition::version(ORGS, "org", "org-version").unwrap(),
            };
            let req: UpdateOrgRequest =
                serde_json::from_value(json!({"name":"My rename","expectedName":"Original"}))
                    .unwrap();
            let count = Rc::new(Cell::new(0));
            let captured = count.clone();
            with_db(
                move |op, _, query| {
                    assert_eq!(op, "compare-and-set");
                    captured.set(captured.get() + 1);
                    let request = &query.filters[0].value;
                    assert_eq!(request["conditions"][0]["expectedVersion"], "actor-version");
                    assert_eq!(request["conditions"][1]["expectedVersion"], "org-version");
                    assert_eq!(request["ops"][0]["data"]["name"], "My rename");
                    assert_eq!(request["ops"][0]["data"]["slug"], "original-slug");
                    assert_eq!(
                        request["ops"][0]["data"]["logoUrl"],
                        "https://fixture.test/logo"
                    );
                    if conflict {
                        return Err(crate::host::SeamError::DbConflict {
                            category: crate::host::DbConflictCategory::Precondition,
                            operation: "compare-and-set".into(),
                        });
                    }
                    Ok(
                        json!({"outcome":"applied","applied":1,"entries":[],"results":[],"replayed":false}),
                    )
                },
                || {
                    let response = match update_organization(&actor, current, req) {
                        Ok(org) => {
                            assert_eq!(org.name, "My rename");
                            json(200, "{}")
                        }
                        Err(RouteError::Seam(error)) => {
                            assert!(error.is_db_conflict());
                            // Native tests have no Wasm logging import; exercise
                            // the actual public error mapping without that seam.
                            super::super::seam_error_response(&error)
                        }
                        Err(error) => error_response(error),
                    };
                    assert_eq!(response.status, expected_status, "{}", response.body);
                },
            );
            assert_eq!(count.get(), writes);
        }
    }

    #[test]
    fn slug_validation_rejects_bad_chars() {
        assert!(validate_slug("good-slug").is_ok());
        assert!(matches!(
            validate_slug("bad slug!"),
            Err(RouteError::Auth(_))
        ));
        assert!(matches!(validate_slug("  "), Err(RouteError::Auth(_))));
    }

    #[test]
    fn deletion_requires_payload_owner_and_rejects_personal_orgs() {
        let mut membership = MembershipEntry {
            id: "m1".into(),
            user_id: "u1".into(),
            org_id: "o1".into(),
            role: "owner".into(),
            joined_at: "joined".into(),
        };
        let mut org = OrgEntry::new("Acme".into(), "acme".into(), "u1".into(), false);
        assert!(validate_deletion_organization("u1", &org).is_ok());

        membership.role = "admin".into();
        assert!(matches!(role_of(&membership), Ok(OrgRole::Admin)));
        membership.role = "owner".into();
        org.owner_id = "other".into();
        assert!(matches!(
            validate_deletion_organization("u1", &org),
            Err(RouteError::Status(403, "forbidden"))
        ));
        org.owner_id = "u1".into();
        org.is_personal = true;
        assert!(matches!(
            validate_deletion_organization("u1", &org),
            Err(RouteError::Auth(_))
        ));
    }

    #[test]
    fn deletion_rejects_the_configured_default_org() {
        assert!(matches!(
            validate_not_configured_default("default-org", Some("default-org")),
            Err(RouteError::Auth(_))
        ));
        assert!(validate_not_configured_default("other-org", Some("default-org")).is_ok());
        assert!(validate_not_configured_default("other-org", None).is_ok());
    }
}
