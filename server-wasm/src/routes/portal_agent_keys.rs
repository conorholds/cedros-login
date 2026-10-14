//! Organization-bound Portal credentials. These cannot authenticate Login
//! account mutations or operator/admin routes. Only their hash is persisted.
use super::{auth, error_response, json as response, RouteError};
use crate::{
    clock,
    data::{
        api_keys::{self, ApiKeyEntry, PortalAgentBinding},
        memberships, orgs, users,
    },
    exports::cedros::extension::routes::{RouteRequest, RouteResponse},
    services::{api_key, tokens::generate_invite_token},
};
use serde::Deserialize;
use serde_json::json;

pub(crate) const PREFIX: &str = "cedros_portal_mcp_";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Create {
    label: String,
    organization_id: String,
    ttl_days: u32,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Revoke {
    id: String,
    organization_id: String,
}

fn wrap(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    let mut result = result.unwrap_or_else(error_response);
    result.headers.extend([
        ("cache-control".into(), "private, no-store".into()),
        ("pragma".into(), "no-cache".into()),
    ]);
    result
}
pub fn create(r: &RouteRequest) -> RouteResponse {
    wrap(create_inner(r))
}
pub fn list(r: &RouteRequest) -> RouteResponse {
    wrap(list_inner(r))
}
pub fn revoke(r: &RouteRequest) -> RouteResponse {
    wrap(revoke_inner(r))
}
pub fn identity(r: &RouteRequest) -> RouteResponse {
    wrap(profile(r))
}

fn validate_create(input: &Create) -> Result<(), RouteError> {
    if input.label.trim().is_empty()
        || input.label.chars().count() > 100
        || input.label.chars().any(char::is_control)
        || !(1..=90).contains(&input.ttl_days)
        || input.organization_id.is_empty()
        || input.organization_id.len() > 160
    {
        return Err(RouteError::Status(400, "invalid_agent_connection"));
    }
    Ok(())
}
fn create_inner(r: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let actor = auth::authenticated_context(r)?;
    auth::require_step_up(&actor.claims)?;
    super::abuse::enforce_proof_action(r, &actor.claims.sub)?;
    let input: Create =
        serde_json::from_str(&r.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    validate_create(&input)?;
    if !actor.user.email_verified {
        return Err(RouteError::Status(403, "email_not_verified"));
    }
    let membership = memberships::find_versioned(&actor.user.id, &input.organization_id)?
        .ok_or(RouteError::Status(403, "forbidden"))?;
    if !matches!(membership.value.role.as_str(), "owner" | "admin")
        || orgs::find_by_id(&input.organization_id)?.is_none()
    {
        return Err(RouteError::Status(403, "forbidden"));
    }
    if api_keys::count_by_user(&actor.user.id)? >= 10 {
        return Err(RouteError::Status(409, "api_key_limit_reached"));
    }
    let raw = format!("{PREFIX}{}", generate_invite_token());
    let entry = ApiKeyEntry {
        id: uuid::Uuid::new_v4().to_string(),
        user_id: actor.user.id,
        key_hash: api_key::hash(&raw),
        key_prefix: api_key::display_prefix(&raw),
        label: input.label.trim().into(),
        created_at: clock::now_iso(),
        last_used_at: None,
        portal_agent: Some(PortalAgentBinding {
            organization_id: input.organization_id,
            membership_revision: membership
                .condition
                .observed_version()
                .ok_or(RouteError::Status(503, "membership_unavailable"))?
                .to_string(),
            expires_at: clock::in_secs(i64::from(input.ttl_days) * 86400),
        }),
    };
    api_keys::create(&entry, &actor.claims.sid)?;
    Ok(response(
        201,
        &json!({"credential":raw,"connection":view(&entry)}).to_string(),
    ))
}
fn organization_query(r: &RouteRequest) -> Result<&str, RouteError> {
    if r.query.len() != 1
        || r.query[0].0 != "organizationId"
        || r.query[0].1.is_empty()
        || r.query[0].1.len() > 160
    {
        return Err(RouteError::Status(400, "invalid_organization"));
    }
    Ok(&r.query[0].1)
}
fn list_inner(r: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let actor = auth::authenticated_user(r)?;
    let org = organization_query(r)?;
    let connections: Vec<_> = api_keys::find_by_user(&actor.sub)?
        .iter()
        .filter(|k| {
            k.portal_agent
                .as_ref()
                .is_some_and(|b| b.organization_id == org)
        })
        .map(view)
        .collect();
    Ok(response(
        200,
        &json!({"connections":connections}).to_string(),
    ))
}
fn revoke_inner(r: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let actor = auth::authenticated_user(r)?;
    let input: Revoke =
        serde_json::from_str(&r.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let entry = api_keys::find_by_id(&input.id)?
        .filter(|k| {
            k.user_id == actor.sub
                && k.portal_agent
                    .as_ref()
                    .is_some_and(|b| b.organization_id == input.organization_id)
        })
        .ok_or(RouteError::Status(404, "agent_connection_not_found"))?;
    api_keys::delete(&entry.id)?;
    Ok(response(
        200,
        &json!({"revoked":true,"id":entry.id}).to_string(),
    ))
}
fn view(entry: &ApiKeyEntry) -> serde_json::Value {
    json!({"id":entry.id,"label":entry.label,"createdAt":entry.created_at,"lastUsedAt":entry.last_used_at,"organizationId":entry.portal_agent.as_ref().map(|b|&b.organization_id),"expiresAt":entry.portal_agent.as_ref().map(|b|&b.expires_at)})
}
pub(crate) fn token(r: &RouteRequest) -> Option<String> {
    auth::access_token(r).filter(|t| t.starts_with(PREFIX))
}
pub(crate) fn verify(
    raw: &str,
) -> Result<
    (
        ApiKeyEntry,
        users::UserEntry,
        orgs::OrgEntry,
        memberships::MembershipEntry,
    ),
    RouteError,
> {
    let suffix = raw
        .strip_prefix(PREFIX)
        .filter(|s| s.len() == 64 && s.bytes().all(|b| b.is_ascii_hexdigit()))
        .ok_or(RouteError::Status(401, "invalid_agent_connection"))?;
    let _ = suffix;
    let entry = api_keys::find_by_hash(&api_key::hash(raw))?
        .ok_or(RouteError::Status(401, "invalid_agent_connection"))?;
    let binding = entry
        .portal_agent
        .as_ref()
        .ok_or(RouteError::Status(401, "invalid_agent_connection"))?;
    if chrono::DateTime::parse_from_rfc3339(&binding.expires_at)
        .map_or(true, |expiry| expiry <= chrono::Utc::now())
    {
        return Err(RouteError::Status(401, "agent_connection_expired"));
    }
    let user = users::find_by_id(&entry.user_id)?
        .filter(|u| u.suspended_at.is_none() && u.email_verified)
        .ok_or(RouteError::Status(401, "invalid_agent_connection"))?;
    let membership = memberships::find_versioned(&entry.user_id, &binding.organization_id)?
        .ok_or(RouteError::Status(401, "invalid_agent_connection"))?;
    if membership.condition.observed_version() != Some(binding.membership_revision.as_str())
        || !matches!(membership.value.role.as_str(), "owner" | "admin")
    {
        return Err(RouteError::Status(401, "agent_authority_changed"));
    }
    let org = orgs::find_by_id(&binding.organization_id)?
        .ok_or(RouteError::Status(401, "invalid_agent_connection"))?;
    Ok((entry, user, org, membership.value))
}
pub(crate) fn profile(r: &RouteRequest) -> Result<RouteResponse, RouteError> {
    if !r.query.is_empty() {
        return Err(RouteError::Status(400, "invalid_request"));
    }
    let raw = token(r).ok_or(RouteError::Status(401, "invalid_agent_connection"))?;
    let (entry, user, org, membership) = verify(&raw)?;
    let body = json!({"authenticated":true,"user":auth::user_view(&user),"organization":{"id":org.id,"name":org.name,"role":membership.role},"agentCredential":{"valid":true,"id":entry.id,"organizationId":org.id,"role":membership.role,"expiresAt":entry.portal_agent.as_ref().map(|b|&b.expires_at)}});
    api_keys::touch_last_used(entry, &clock::now_iso())?;
    Ok(response(200, &body.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn creation_bounds_lifetime_and_rejects_hidden_grants() {
        let mut value = json!({"label":"Conductor","organizationId":"org-1","ttlDays":90});
        assert!(validate_create(&serde_json::from_value(value.clone()).unwrap()).is_ok());
        for days in [0, 91] {
            value["ttlDays"] = json!(days);
            assert!(validate_create(&serde_json::from_value(value.clone()).unwrap()).is_err());
        }
        value["ttlDays"] = json!(30);
        value["userId"] = json!("other");
        assert!(serde_json::from_value::<Create>(value).is_err());
    }
}

#[cfg(test)]
mod verification_tests {
    use super::*;
    use crate::host::db;
    #[test]
    fn verified_keys_are_current_scoped_and_revocable() {
        for scenario in [
            "valid",
            "revoked",
            "expired",
            "malformed-expiry",
            "suspended",
            "unverified",
            "removed",
            "role-changed",
            "revision-changed",
            "wrong-user",
            "wrong-org",
            "legacy",
        ] {
            let raw = format!("{PREFIX}{}", "a".repeat(64));
            db::test_support::with_db(
                move |op, collection, _| {
                    assert_eq!(op, "read");
                    let payload = if collection.model == db::API_KEYS.model {
                        if scenario == "revoked" {
                            return Ok(json!({"entries":[]}));
                        }
                        json!({"id":"key","userId":"user","keyHash":api_key::hash(&format!("{PREFIX}{}","a".repeat(64))),"keyPrefix":PREFIX,"label":"Conductor","createdAt":"2026-01-01T00:00:00.000Z","lastUsedAt":null,
                        "portalAgent":if scenario=="legacy" {json!(null)} else {json!({"organizationId":"org","membershipRevision":"version","expiresAt":match scenario {"expired"=>"2000-01-01T00:00:00Z","malformed-expiry"=>"invalid",_=>"2099-01-01T00:00:00Z"}})}})
                    } else if collection.model == db::USERS.model {
                        json!({"id":"user","email":"owner@example.test","emailVerified":scenario!="unverified","authMethods":["email"],"isSystemAdmin":false,"createdAt":"t","updatedAt":"t","suspendedAt":if scenario=="suspended" {Some("t")} else {None}})
                    } else if collection.model == db::MEMBERSHIPS.model {
                        if scenario == "removed" {
                            return Ok(json!({"entries":[]}));
                        }
                        return Ok(
                            json!({"entries":[{"entry_key":"membership","version":if scenario=="revision-changed" {"new"} else {"version"},"updated_at":"revision","payload":{"id":"membership","userId":if scenario=="wrong-user" {"other"} else {"user"},"orgId":if scenario=="wrong-org" {"other"} else {"org"},"role":if scenario=="role-changed" {"member"} else {"owner"},"joinedAt":"t"}}]}),
                        );
                    } else if collection.model == db::ORGS.model {
                        json!({"id":"org","name":"Account","slug":"account","isPersonal":false,"ownerId":"user","createdAt":"t","updatedAt":"t"})
                    } else {
                        panic!("unexpected collection")
                    };
                    Ok(json!({"entries":[{"entry_key":payload["id"],"payload":payload}]}))
                },
                || {
                    let result = verify(&raw);
                    assert_eq!(result.is_ok(), scenario == "valid", "{scenario}");
                    if let Ok((entry, user, org, membership)) = result {
                        assert_eq!(user.id, "user");
                        assert_eq!(org.id, "org");
                        assert_eq!(membership.role, "owner");
                        let public = view(&entry);
                        assert!(public.get("keyHash").is_none());
                        assert!(public.get("credential").is_none());
                    }
                },
            );
        }
    }
    #[test]
    fn invalid_shape_never_reaches_storage() {
        db::test_support::with_db(
            |_, _, _| panic!("invalid keys must not query storage"),
            || {
                for raw in [
                    "cedros_portal_mcp_short",
                    "ck_ordinary",
                    "cedros_portal_mcp_zzzz",
                ] {
                    assert!(verify(raw).is_err());
                }
            },
        );
    }
}
