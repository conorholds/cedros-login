//! Service-to-service relying-party contracts for Cedros Login. These routes
//! are mounted under `/extensions/cedros-login/v1/*` and use per-RP service
//! tokens stored in the extension secret seam (`rp_token:{relyingPartyId}`).
//!
//! Each relying party is additionally bound to an explicit authorization policy
//! (`rp_policy:{relyingPartyId}`, JSON with `scopes`/`audiences`/`orgIds`). A
//! valid token alone is not enough: routes fail closed unless the policy grants
//! the required scope and (for directory routes) the requested org, preventing a
//! single RP token from reading another tenant's sessions or users.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use super::auth::{authoritative_session, build_jwt};
use super::{error_response, json, RouteError};
use crate::clock;
use crate::data::{audit, memberships, orgs, users};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, secrets, to_json};

const RP_HEADER: &str = "x-cedros-relying-party";
const RP_SECRET_PREFIX: &str = "rp_token:";
const RP_POLICY_PREFIX: &str = "rp_policy:";
const SCOPE_SESSION_INTROSPECT: &str = "session:introspect";
const SCOPE_USERS_READ: &str = "users:read";
const SCOPE_USERS_EMAIL_READ: &str = "users:email:read";
const SCOPE_USERS_COUNT: &str = "users:count";
pub(crate) const SCOPE_MEMBERSHIPS_READ: &str = "memberships:read";
/// Separately granted support/admin capability for the minimal identity-profile
/// projection. `users:read` never implies this more security-sensitive scope.
pub(crate) const SCOPE_IDENTITY_PROFILE_READ: &str = "identity-profile:read";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct IntrospectionRequest {
    token: String,
    relying_party_id: Option<String>,
}

/// Canonical session-introspection response (13b): `active`, `userId`, a
/// `claims` object, and an RFC3339 `expiresAt`. `sessionId` is an extra a
/// relying party may ignore.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct IntrospectionResponse {
    active: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    user_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    session_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    expires_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    claims: Option<IntrospectionClaims>,
}

/// JWT claims surfaced under `claims` for relying parties that verify locally.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct IntrospectionClaims {
    iss: String,
    sub: String,
    aud: String,
    exp: i64,
    iat: i64,
    sid: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    email_verified: Option<bool>,
}

/// Minimal user-directory response: stable identity, current account status,
/// and creation time. `id` is kept as a non-sensitive legacy alias. Email is
/// omitted unless `includeEmail=true` and the separate `users:email:read` scope
/// is authorized. Security posture, admin status, login activity, and profile
/// metadata remain Login-private.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DirectoryUserResponse {
    user_id: String,
    id: String,
    status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    email: Option<String>,
    created_at: String,
}

/// Current organization authority for a relying party that must reauthorize a
/// delayed operation after the end-user session is no longer available.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MembershipAuthorityResponse {
    schema_version: u8,
    user_id: String,
    organization_id: String,
    role: String,
    user_status: String,
    email: Option<String>,
    email_verified: bool,
}

/// Per-RP authorization policy (`rp_policy:{relyingPartyId}` secret). All three
/// allowlists are required and non-empty; an absent or empty policy fails closed.
#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RelyingPartyPolicy {
    /// New configurations bind both secret writes. Absent only on legacy policy.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) token_sha256: Option<String>,
    #[serde(default)]
    pub(crate) scopes: Vec<String>,
    #[serde(default)]
    pub(crate) audiences: Vec<String>,
    #[serde(default)]
    pub(crate) org_ids: Vec<String>,
}

/// An authenticated relying party plus its validated policy. Carries the scope/
/// audience/org checks every route applies before returning tenant data.
struct RelyingPartyPrincipal {
    relying_party_id: String,
    policy: RelyingPartyPolicy,
}

pub fn introspect_session(request: &RouteRequest) -> RouteResponse {
    super::identity_profile::no_store(run(introspect_session_inner(request)))
}

pub fn get_user(request: &RouteRequest) -> RouteResponse {
    super::identity_profile::no_store(run(get_user_inner(request)))
}

pub fn count_users(request: &RouteRequest) -> RouteResponse {
    super::identity_profile::no_store(run(count_users_inner(request)))
}

pub fn get_membership_authority(request: &RouteRequest) -> RouteResponse {
    super::identity_profile::no_store(run(get_membership_authority_inner(request)))
}

pub fn get_identity_profile(request: &RouteRequest) -> RouteResponse {
    super::identity_profile::no_store(run(get_identity_profile_inner(request)))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn introspect_session_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let body: IntrospectionRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let principal = authorize_relying_party(request, body.relying_party_id.as_deref())?;
    principal.require_scope(SCOPE_SESSION_INTROSPECT)?;

    let (jwt, _) = build_jwt()?;
    let Ok(claims) = jwt.validate_access_token(&body.token) else {
        return Ok(json(200, &to_json(&inactive())?));
    };

    // Fail closed (report inactive, never leak claims) when the token's audience
    // or org is outside this relying party's policy — one RP cannot introspect
    // another tenant's session even with a structurally valid token.
    if !principal.allows_audience(&claims.aud) || !principal.allows_org(claims.org_id.as_deref()) {
        return Ok(json(200, &to_json(&inactive())?));
    }

    // Introspection is an authoritative session check, not a second, weaker
    // authentication path. Reuse the same mutable-state validation as Login's
    // own authenticated routes so expiry, revocation, suspension, deletion,
    // organization removal, membership removal, and role drift all become
    // inactive immediately. Preserve host seam failures instead of turning an
    // availability failure into a false authentication answer.
    let context = match authoritative_session(claims) {
        Ok(context) => context,
        Err(error) if is_inactive_identity_error(&error) => {
            return Ok(json(200, &to_json(&inactive())?));
        }
        Err(error) => return Err(error),
    };
    let claims = context.claims;

    let response = IntrospectionResponse {
        active: true,
        user_id: Some(claims.sub.clone()),
        session_id: Some(claims.sid.clone()),
        expires_at: clock::from_unix(claims.exp),
        claims: Some(IntrospectionClaims {
            iss: claims.iss,
            sub: claims.sub,
            aud: claims.aud,
            exp: claims.exp,
            iat: claims.iat,
            sid: claims.sid,
            email_verified: claims.email_verified,
        }),
    };
    Ok(json(200, &to_json(&response)?))
}

fn get_user_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let principal = authorize_relying_party(request, relying_party_from_query(request).as_deref())?;
    principal.require_scope(SCOPE_USERS_READ)?;
    let org_id = required_org_id(request)?;
    principal.require_org(&org_id, SCOPE_USERS_READ)?;
    let include_email = query_value(request, &["includeEmail", "include_email"])
        .is_some_and(|value| value == "true");
    if include_email {
        principal.require_scope(SCOPE_USERS_EMAIL_READ)?;
    }

    let user_id = user_id_from_path(&request.path)?;
    // Scope the lookup to the authorized org: a user outside it is reported as
    // not found (no cross-tenant existence oracle), same 404 as a missing user.
    if memberships::find(&user_id, &org_id)?.is_none() {
        return Err(RouteError::Status(404, "user_not_found"));
    }

    let user = users::find_by_id(&user_id)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    Ok(json(200, &to_json(&directory_user(&user, include_email))?))
}

fn count_users_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let principal = authorize_relying_party(request, relying_party_from_query(request).as_deref())?;
    principal.require_scope(SCOPE_USERS_COUNT)?;
    let org_id = required_org_id(request)?;
    principal.require_org(&org_id, SCOPE_USERS_COUNT)?;
    // Org-scoped: count members of the authorized org, never a global
    // cross-tenant total. A requested account status is evaluated from current
    // Login user state instead of treating suspended accounts as active.
    // (`?createdAfter=` remains unsupported: a global created-after count would
    // be exactly the cross-tenant leak this route avoids.)
    let count = match query_value(request, &["status"]).as_deref() {
        None => memberships::count_by_org(&org_id)?,
        Some("active") => count_members_with_status(&org_id, "active")?,
        Some("suspended") => count_members_with_status(&org_id, "suspended")?,
        Some(_) => 0,
    };
    // `count` is canonical; `total` remains for host directory callers that
    // already consume list-style totals.
    Ok(json(
        200,
        &serde_json::json!({ "count": count, "total": count }).to_string(),
    ))
}

fn get_membership_authority_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let principal = authorize_relying_party(request, relying_party_from_query(request).as_deref())?;
    principal.require_scope(SCOPE_MEMBERSHIPS_READ)?;
    let (org_id, user_id) = membership_authority_scope(&request.path)?;
    principal.require_org(&org_id, SCOPE_MEMBERSHIPS_READ)?;
    orgs::find_by_id(&org_id)?.ok_or(RouteError::Status(404, "membership_not_found"))?;
    let membership = memberships::find(&user_id, &org_id)?
        .ok_or(RouteError::Status(404, "membership_not_found"))?;
    if crate::domain::permissions::OrgRole::from_str(&membership.role).is_none() {
        return Err(RouteError::Status(403, "invalid_membership_role"));
    }

    let user =
        users::find_by_id(&user_id)?.ok_or(RouteError::Status(404, "membership_not_found"))?;
    Ok(json(
        200,
        &to_json(&MembershipAuthorityResponse {
            schema_version: 1,
            user_id,
            organization_id: org_id,
            role: membership.role,
            user_status: directory_status(&user).to_string(),
            email: user.email,
            email_verified: user.email_verified,
        })?,
    ))
}

fn get_identity_profile_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    // This route's caller identity comes only from the registered RP header;
    // unlike introspection, it has no compatibility body/query caller field.
    let principal = authorize_relying_party(request, None)?;
    principal.require_scope(SCOPE_IDENTITY_PROFILE_READ)?;
    let org_id = required_org_id(request)?;
    principal.require_org(&org_id, SCOPE_IDENTITY_PROFILE_READ)?;
    let user_id = identity_profile_user_id_from_path(&request.path)?;

    // Membership is checked before the user lookup and uses the same 404 for an
    // absent subject, preventing a cross-tenant existence oracle.
    if memberships::find(&user_id, &org_id)?.is_none() {
        return Err(RouteError::Status(404, "subject_not_found"));
    }
    let user = users::find_by_id(&user_id)?.ok_or(RouteError::Status(404, "subject_not_found"))?;

    // A successful privileged read must have a durable audit record. Audit seam
    // failure fails the read closed instead of returning unaudited profile state.
    audit::log_relying_party_access(
        audit::ADMIN_IDENTITY_PROFILE_READ,
        &principal.relying_party_id,
        &org_id,
        Some("identity_profile"),
        Some(&user_id),
    )?;
    super::identity_profile::response(&user, Some(org_id))
}

fn authorize_relying_party(
    request: &RouteRequest,
    body_id: Option<&str>,
) -> Result<RelyingPartyPrincipal, RouteError> {
    let header_id = header(request, RP_HEADER);
    if body_id
        .zip(header_id.as_deref())
        .is_some_and(|(body, header)| body != header)
    {
        return Err(RouteError::Status(400, "conflicting_relying_party"));
    }
    let relying_party_id = body_id
        .map(str::to_string)
        .or(header_id)
        .ok_or(RouteError::Status(401, "unauthorized"))?;
    validate_relying_party_id(&relying_party_id)?;
    let expected = secrets::get(&format!("{RP_SECRET_PREFIX}{relying_party_id}"))?
        .filter(|token| !token.is_empty())
        .ok_or(RouteError::Status(401, "unauthorized"))?;
    let actual = bearer(request).ok_or(RouteError::Status(401, "unauthorized"))?;
    if !constant_time_eq(actual.as_bytes(), expected.as_bytes()) {
        return Err(RouteError::Status(401, "unauthorized"));
    }

    // A valid token is authentication; the policy is authorization. Missing or
    // malformed policy fails closed (403) — never fall back to an open default.
    let policy = secrets::get(&format!("{RP_POLICY_PREFIX}{relying_party_id}"))?
        .ok_or(RouteError::Status(403, "relying_party_policy_required"))?;
    let policy: RelyingPartyPolicy =
        from_json(&policy).map_err(|_| RouteError::Status(403, "invalid_relying_party_policy"))?;
    policy.validate()?;
    if !policy.matches_token(&expected) {
        return Err(RouteError::Status(403, "invalid_relying_party_policy"));
    }
    Ok(RelyingPartyPrincipal {
        relying_party_id,
        policy,
    })
}

impl RelyingPartyPolicy {
    pub(crate) fn token_digest(token: &str) -> String {
        hex::encode(Sha256::digest(token.as_bytes()))
    }

    pub(crate) fn matches_token(&self, token: &str) -> bool {
        self.token_sha256.as_deref().is_none_or(|expected| {
            constant_time_eq(expected.as_bytes(), Self::token_digest(token).as_bytes())
        })
    }

    fn validate(&self) -> Result<(), RouteError> {
        if self.scopes.is_empty() || self.audiences.is_empty() || self.org_ids.is_empty() {
            return Err(RouteError::Status(403, "invalid_relying_party_policy"));
        }
        Ok(())
    }

    fn contains(values: &[String], value: &str) -> bool {
        values.iter().any(|allowed| allowed == value)
    }
}

impl RelyingPartyPrincipal {
    fn require_scope(&self, scope: &str) -> Result<(), RouteError> {
        if RelyingPartyPolicy::contains(&self.policy.scopes, scope) {
            Ok(())
        } else {
            Err(RouteError::Status(403, "insufficient_scope"))
        }
    }

    fn require_org(&self, org_id: &str, scope: &str) -> Result<(), RouteError> {
        self.require_scope(scope)?;
        if self
            .policy
            .allows_org_for_scope(&self.relying_party_id, org_id, scope)
        {
            Ok(())
        } else {
            Err(RouteError::Status(403, "unauthorized_org"))
        }
    }

    fn allows_audience(&self, audience: &str) -> bool {
        RelyingPartyPolicy::contains(&self.policy.audiences, audience)
    }

    fn allows_org(&self, org_id: Option<&str>) -> bool {
        org_id.is_some_and(|id| RelyingPartyPolicy::contains(&self.policy.org_ids, id))
    }
}

impl RelyingPartyPolicy {
    /// Data's dynamic-org exception belongs only to membership reauthorization.
    /// Adding another scope must never widen its directory/profile tenant grant.
    pub(crate) fn allows_org_for_scope(
        &self,
        relying_party_id: &str,
        org_id: &str,
        scope: &str,
    ) -> bool {
        Self::contains(&self.org_ids, org_id)
            || (relying_party_id == "cedros-data"
                && scope == SCOPE_MEMBERSHIPS_READ
                && Self::contains(&self.org_ids, "*"))
    }
}

fn inactive() -> IntrospectionResponse {
    IntrospectionResponse {
        active: false,
        user_id: None,
        session_id: None,
        expires_at: None,
        claims: None,
    }
}

fn is_inactive_identity_error(error: &RouteError) -> bool {
    matches!(error, RouteError::Status(401 | 403, _))
}

fn count_members_with_status(org_id: &str, expected_status: &str) -> crate::host::Result<u64> {
    const PAGE_SIZE: u32 = 500;
    let total = memberships::count_by_org(org_id)?;
    let mut offset = 0_u32;
    let mut matching = 0_u64;

    while u64::from(offset) < total {
        let page = memberships::page_by_org(org_id, PAGE_SIZE, offset)?;
        if page.is_empty() {
            return Err(crate::host::SeamError::Db(
                "membership count changed during status scan".to_string(),
            ));
        }
        let user_ids = page
            .iter()
            .map(|membership| membership.user_id.clone())
            .collect::<Vec<_>>();
        let current_users = users::find_by_ids(&user_ids)?;
        matching += page
            .iter()
            .filter_map(|membership| current_users.get(&membership.user_id))
            .filter(|user| directory_status(user) == expected_status)
            .count() as u64;
        offset = offset.checked_add(page.len() as u32).ok_or_else(|| {
            crate::host::SeamError::Db("membership status scan exceeded offset range".to_string())
        })?;
    }

    Ok(matching)
}

fn directory_status(user: &users::UserEntry) -> &'static str {
    if user.suspended_at.is_some() {
        "suspended"
    } else {
        "active"
    }
}

fn directory_user(user: &users::UserEntry, include_email: bool) -> DirectoryUserResponse {
    DirectoryUserResponse {
        user_id: user.id.clone(),
        id: user.id.clone(),
        status: directory_status(user).to_string(),
        email: include_email.then(|| user.email.clone()).flatten(),
        created_at: user.created_at.clone(),
    }
}

fn user_id_from_path(path: &str) -> Result<String, RouteError> {
    let id = path
        .strip_prefix("/v1/users/")
        .filter(|id| !id.is_empty() && !id.contains('/'))
        .ok_or(RouteError::Status(404, "not_found"))?;
    Ok(id.to_string())
}

fn identity_profile_user_id_from_path(path: &str) -> Result<String, RouteError> {
    let id = path
        .strip_prefix("/v1/identity/users/")
        .and_then(|tail| tail.strip_suffix("/profile"))
        .filter(|id| !id.is_empty() && !id.contains('/'))
        .ok_or(RouteError::Status(404, "not_found"))?;
    Ok(id.to_string())
}

fn membership_authority_scope(path: &str) -> Result<(String, String), RouteError> {
    let mut parts = path
        .strip_prefix("/v1/organizations/")
        .ok_or(RouteError::Status(404, "not_found"))?
        .split('/');
    let org_id = parts.next().filter(|value| !value.is_empty());
    let members = parts.next();
    let user_id = parts.next().filter(|value| !value.is_empty());
    if let (Some(org_id), Some("members"), Some(user_id), None) =
        (org_id, members, user_id, parts.next())
    {
        Ok((org_id.to_string(), user_id.to_string()))
    } else {
        Err(RouteError::Status(404, "not_found"))
    }
}

fn relying_party_from_query(request: &RouteRequest) -> Option<String> {
    query_value(request, &["relyingPartyId", "relying_party_id"])
}

fn required_org_id(request: &RouteRequest) -> Result<String, RouteError> {
    query_value(request, &["orgId", "org_id"])
        .filter(|value| !value.trim().is_empty())
        .ok_or(RouteError::Status(400, "org_required"))
}

fn query_value(request: &RouteRequest, names: &[&str]) -> Option<String> {
    request
        .query
        .iter()
        .find(|(key, _)| names.iter().any(|name| key == name))
        .map(|(_, value)| value.clone())
}

fn bearer(request: &RouteRequest) -> Option<String> {
    header(request, "authorization").and_then(|value| {
        value
            .strip_prefix("Bearer ")
            .or_else(|| value.strip_prefix("bearer "))
            .map(str::to_string)
    })
}

fn header(request: &RouteRequest, name: &str) -> Option<String> {
    request
        .headers
        .iter()
        .find(|(key, _)| key.eq_ignore_ascii_case(name))
        .map(|(_, value)| value.clone())
}

pub(crate) fn validate_relying_party_id(value: &str) -> Result<(), RouteError> {
    if (2..=128).contains(&value.len())
        && value
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_' | '.' | ':'))
    {
        Ok(())
    } else {
        Err(RouteError::Status(400, "invalid_relying_party"))
    }
}

pub(crate) fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    let max = a.len().max(b.len());
    let mut diff = a.len() ^ b.len();
    for index in 0..max {
        diff |= usize::from(*a.get(index).unwrap_or(&0) ^ *b.get(index).unwrap_or(&0));
    }
    diff == 0
}

#[cfg(test)]
#[path = "relying_party_tests.rs"]
mod tests;
