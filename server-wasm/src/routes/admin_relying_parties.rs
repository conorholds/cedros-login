//! System-admin relying-party provisioning and readiness diagnostics.
//!
//! Secret values enter only through write/verification request bodies and are
//! never serialized into responses. Policies are stored as normalized JSON in
//! the secret seam; reads expose only the parsed allowlists and validation
//! status required by Login Admin.

use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use super::relying_party::{constant_time_eq, validate_relying_party_id, RelyingPartyPolicy};
use super::{error_response, json, require_system_admin, require_system_admin_write, RouteError};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, secrets, to_json};

#[path = "data_membership_relationship.rs"]
mod data_membership_relationship;
pub use data_membership_relationship::handle as data_membership_relationship;

const RP_TOKEN_PREFIX: &str = "rp_token:";
const RP_POLICY_PREFIX: &str = "rp_policy:";
const SESSION_INTROSPECT_SCOPE: &str = "session:introspect";
const SUPPORTED_RELYING_PARTIES: &[(&str, &str)] = &[
    ("cedros-portal", "Cedros Portal"),
    ("cedros-pay", "Cedros Pay"),
    ("cedros-data", "Cedros Data"),
    ("cedros-casino", "Cedros Casino"),
];

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ConfigureRequest {
    token: Option<String>,
    #[serde(default)]
    allowed_scopes: Vec<String>,
    #[serde(default)]
    allowed_session_audiences: Vec<String>,
    #[serde(default)]
    allowed_organization_ids: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VerifyRequest {
    token: String,
    #[serde(default)]
    required_scope: Option<String>,
    session_audience: String,
    organization_id: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ListResponse {
    ready: bool,
    relying_parties: Vec<RelyingPartyStatus>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RelyingPartyStatus {
    relying_party_id: String,
    display_name: String,
    token_configured: bool,
    policy_configured: bool,
    ready: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    policy_summary: Option<PolicySummary>,
    validation_errors: Vec<&'static str>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PolicySummary {
    allowed_scopes: Vec<String>,
    allowed_session_audiences: Vec<String>,
    allowed_organization_ids: Vec<String>,
}

#[derive(Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
enum VerificationDiagnostic {
    CallerUnknown,
    TokenAbsent,
    TokenMismatch,
    PolicyAbsent,
    PolicyMalformed,
    ScopeMissing,
    AudiencePolicyMismatch,
    OrganizationPolicyMismatch,
    Ready,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VerificationResponse {
    relying_party_id: String,
    diagnostic: VerificationDiagnostic,
    ready: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    introspection: Option<InactiveSession>,
    #[serde(skip_serializing_if = "Option::is_none")]
    identity_profile: Option<IdentityProfileProbe>,
    #[serde(skip_serializing_if = "Option::is_none")]
    membership: Option<IdentityProfileProbe>,
}

#[derive(Deserialize, Serialize)]
struct InactiveSession {
    active: bool,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct IdentityProfileProbe {
    status: u16,
    error: String,
}

struct VerificationRequirement<'a> {
    scope: &'a str,
    audience: &'a str,
    organization_id: &'a str,
}

pub fn list(request: &RouteRequest) -> RouteResponse {
    run(list_inner(request))
}

pub fn configure(request: &RouteRequest) -> RouteResponse {
    run(configure_inner(request))
}

pub fn verify(request: &RouteRequest) -> RouteResponse {
    run(verify_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(error) => error_response(error),
    }
}

fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let relying_parties = SUPPORTED_RELYING_PARTIES
        .iter()
        .map(|(id, name)| status(id, name))
        .collect::<Result<Vec<_>, _>>()?;
    let ready = relying_parties.iter().all(|entry| entry.ready);
    Ok(json(
        200,
        &to_json(&ListResponse {
            ready,
            relying_parties,
        })?,
    ))
}

fn configure_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let relying_party_id = relying_party_id_from_path(&request.path)?;
    let display_name = supported_display_name(&relying_party_id)
        .ok_or(RouteError::Status(404, "caller_unknown"))?;
    let body: ConfigureRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let existing_token = secrets::get(&token_key(&relying_party_id))?;
    let token = match body.token {
        Some(token) => {
            validate_token(&token)?;
            Some(token)
        }
        None if existing_token.as_deref().is_none_or(str::is_empty) => {
            return Err(RouteError::Status(422, "relying_party_token_required"));
        }
        None => None,
    };
    let policy = RelyingPartyPolicy {
        token_sha256: Some(RelyingPartyPolicy::token_digest(
            token
                .as_deref()
                .or(existing_token.as_deref())
                .ok_or(RouteError::Status(422, "relying_party_token_required"))?,
        )),
        scopes: normalize_values(body.allowed_scopes, "invalid_scope")?,
        audiences: normalize_values(body.allowed_session_audiences, "invalid_session_audience")?,
        org_ids: normalize_values(body.allowed_organization_ids, "invalid_organization_id")?,
    };
    validate_complete_policy(&relying_party_id, &policy)?;

    // Bind the policy to its intended token before rotation. These host writes
    // are not atomic, but a failed/overlapping rotation now denies service access
    // instead of applying the new policy to the old token. Retry repairs the pair.
    secrets::set(&policy_key(&relying_party_id), &to_json(&policy)?)?;
    if let Some(token) = token {
        secrets::set(&token_key(&relying_party_id), &token)?;
    }

    Ok(json(
        200,
        &to_json(&status(&relying_party_id, display_name)?)?,
    ))
}

fn verify_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let relying_party_id = relying_party_id_from_path(&request.path)?;
    let body: VerifyRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let required_scope = body
        .required_scope
        .as_deref()
        .unwrap_or_else(|| required_scope_for(&relying_party_id));
    let requirement = VerificationRequirement {
        scope: required_scope.trim(),
        audience: body.session_audience.trim(),
        organization_id: body.organization_id.trim(),
    };
    if body.token.is_empty()
        || requirement.scope.is_empty()
        || requirement.audience.is_empty()
        || requirement.organization_id.is_empty()
    {
        return Err(RouteError::Status(400, "invalid_body"));
    }

    let stored_token = secrets::get(&token_key(&relying_party_id))?;
    let stored_policy = secrets::get(&policy_key(&relying_party_id))?;
    let diagnostic = diagnose(
        &relying_party_id,
        stored_token.as_deref(),
        stored_policy.as_deref(),
        &body.token,
        &requirement,
    );
    let ready = diagnostic == VerificationDiagnostic::Ready;
    let introspection = if ready && requirement.scope == SESSION_INTROSPECT_SCOPE {
        Some(probe_inactive_session(&relying_party_id, &body.token)?)
    } else {
        None
    };
    let membership = if ready && requirement.scope == super::relying_party::SCOPE_MEMBERSHIPS_READ {
        Some(probe_membership(&relying_party_id, &body.token)?)
    } else {
        None
    };
    let identity_profile =
        if ready && requirement.scope == super::relying_party::SCOPE_IDENTITY_PROFILE_READ {
            Some(probe_identity_profile(
                &relying_party_id,
                &body.token,
                requirement.organization_id,
            )?)
        } else {
            None
        };
    Ok(json(
        200,
        &to_json(&VerificationResponse {
            relying_party_id,
            diagnostic,
            ready,
            introspection,
            identity_profile,
            membership,
        })?,
    ))
}

/// Exercise service authentication and the membership scope without reading a
/// customer record. The diagnostic above checks the exact organization policy;
/// a malformed resource path then proves the route-specific authorization gate.
fn probe_membership(id: &str, token: &str) -> Result<IdentityProfileProbe, RouteError> {
    let probe = RouteRequest {
        route_id: "cedros-login:relying-party-membership-authority-get".into(),
        method: "GET".into(),
        path: "/v1/organizations/__probe__/members".into(),
        headers: vec![
            ("authorization".into(), format!("Bearer {token}")),
            ("x-cedros-relying-party".into(), id.into()),
        ],
        query: vec![],
        body: String::new(),
        context_json: String::new(),
    };
    let response = super::relying_party::get_membership_authority(&probe);
    let value: IdentityProfileProbe = IdentityProfileProbe {
        status: response.status,
        error: from_json::<serde_json::Value>(&response.body)?
            .get("error")
            .and_then(serde_json::Value::as_str)
            .unwrap_or_default()
            .to_string(),
    };
    if value.status != 404 || value.error != "not_found" {
        return Err(RouteError::Status(502, "verification_probe_failed"));
    }
    Ok(value)
}

/// Exercise the privileged route without looking up a subject. A 404 from the
/// deliberately malformed subject path proves service authentication, the
/// dedicated scope, and the organization allowlist before any profile IO.
fn probe_identity_profile(
    relying_party_id: &str,
    service_token: &str,
    organization_id: &str,
) -> Result<IdentityProfileProbe, RouteError> {
    let probe = RouteRequest {
        route_id: "cedros-login:identity-profile-admin-get".to_string(),
        method: "GET".to_string(),
        path: "/v1/identity/users/__probe__/nested/profile".to_string(),
        headers: vec![
            (
                "authorization".to_string(),
                format!("Bearer {service_token}"),
            ),
            (
                "x-cedros-relying-party".to_string(),
                relying_party_id.to_string(),
            ),
        ],
        query: vec![("orgId".to_string(), organization_id.to_string())],
        body: String::new(),
        context_json: String::new(),
    };
    let response = super::relying_party::get_identity_profile(&probe);
    let value: serde_json::Value = from_json(&response.body)
        .map_err(|_| RouteError::Status(502, "verification_probe_failed"))?;
    let error = value
        .get("error")
        .and_then(serde_json::Value::as_str)
        .unwrap_or_default();
    if response.status != 404 || error != "not_found" {
        return Err(RouteError::Status(502, "verification_probe_failed"));
    }
    Ok(IdentityProfileProbe {
        status: response.status,
        error: error.to_string(),
    })
}

/// Exercise the real introspection handler with non-customer session material.
/// A 200 inactive response proves the stored token, policy, and required scope
/// pass the same path used by Portal and Pay without exposing customer data.
fn probe_inactive_session(
    relying_party_id: &str,
    service_token: &str,
) -> Result<InactiveSession, RouteError> {
    let probe = RouteRequest {
        route_id: "cedros-login:relying-party-session-introspect".to_string(),
        method: "POST".to_string(),
        path: "/v1/session/introspect".to_string(),
        headers: vec![
            (
                "authorization".to_string(),
                format!("Bearer {service_token}"),
            ),
            (
                "x-cedros-relying-party".to_string(),
                relying_party_id.to_string(),
            ),
        ],
        query: vec![],
        body: serde_json::json!({
            "token": "cedros-login-admin-verification-invalid-session",
            "relyingPartyId": relying_party_id,
        })
        .to_string(),
        context_json: String::new(),
    };
    let response = super::relying_party::introspect_session(&probe);
    if response.status != 200 {
        return Err(RouteError::Status(502, "verification_probe_failed"));
    }
    let inactive: InactiveSession = from_json(&response.body)
        .map_err(|_| RouteError::Status(502, "verification_probe_failed"))?;
    if inactive.active {
        return Err(RouteError::Status(502, "verification_probe_failed"));
    }
    Ok(inactive)
}

fn status(id: &str, display_name: &str) -> Result<RelyingPartyStatus, RouteError> {
    let stored_token = secrets::get(&token_key(id))?;
    let token_configured = stored_token
        .as_deref()
        .is_some_and(|token| !token.is_empty());
    let raw_policy = secrets::get(&policy_key(id))?;
    let policy_configured = raw_policy.is_some();
    let mut validation_errors = Vec::new();
    if !token_configured {
        validation_errors.push("token_absent");
    }

    let policy = match raw_policy {
        None => {
            validation_errors.push("policy_absent");
            None
        }
        Some(raw) => match from_json::<RelyingPartyPolicy>(&raw) {
            Ok(policy) if policy_values_are_well_formed(&policy) => Some(policy),
            _ => {
                validation_errors.push("policy_malformed");
                None
            }
        },
    };
    if let Some(policy) = policy.as_ref() {
        if !stored_token
            .as_deref()
            .is_some_and(|token| policy.matches_token(token))
        {
            validation_errors.push("policy_malformed");
        }
        if !contains(&policy.scopes, required_scope_for(id)) {
            validation_errors.push("scope_missing");
        }
        if policy.audiences.is_empty() {
            validation_errors.push("audience_policy_empty");
        }
        if policy.org_ids.is_empty() {
            validation_errors.push("organization_policy_empty");
        }
    }
    let policy_summary = policy.map(|policy| PolicySummary {
        allowed_scopes: policy.scopes,
        allowed_session_audiences: policy.audiences,
        allowed_organization_ids: policy.org_ids,
    });

    Ok(RelyingPartyStatus {
        relying_party_id: id.to_string(),
        display_name: display_name.to_string(),
        token_configured,
        policy_configured,
        ready: validation_errors.is_empty(),
        policy_summary,
        validation_errors,
    })
}

fn diagnose(
    id: &str,
    stored_token: Option<&str>,
    stored_policy: Option<&str>,
    provided_token: &str,
    requirement: &VerificationRequirement<'_>,
) -> VerificationDiagnostic {
    if supported_display_name(id).is_none() {
        return VerificationDiagnostic::CallerUnknown;
    }
    let Some(stored_token) = stored_token.filter(|token| !token.is_empty()) else {
        return VerificationDiagnostic::TokenAbsent;
    };
    if !constant_time_eq(provided_token.as_bytes(), stored_token.as_bytes()) {
        return VerificationDiagnostic::TokenMismatch;
    }
    let Some(stored_policy) = stored_policy else {
        return VerificationDiagnostic::PolicyAbsent;
    };
    let Ok(policy) = serde_json::from_str::<RelyingPartyPolicy>(stored_policy) else {
        return VerificationDiagnostic::PolicyMalformed;
    };
    if !policy_values_are_well_formed(&policy) {
        return VerificationDiagnostic::PolicyMalformed;
    }
    if !policy.matches_token(stored_token) {
        return VerificationDiagnostic::PolicyMalformed;
    }
    if !contains(&policy.scopes, requirement.scope) {
        return VerificationDiagnostic::ScopeMissing;
    }
    if !contains(&policy.audiences, requirement.audience) {
        return VerificationDiagnostic::AudiencePolicyMismatch;
    }
    if !policy.allows_org_for_scope(id, requirement.organization_id, requirement.scope) {
        return VerificationDiagnostic::OrganizationPolicyMismatch;
    }
    VerificationDiagnostic::Ready
}

fn validate_complete_policy(id: &str, policy: &RelyingPartyPolicy) -> Result<(), RouteError> {
    let required_scope = required_scope_for(id);
    if !contains(&policy.scopes, required_scope) {
        let error = match required_scope {
            SESSION_INTROSPECT_SCOPE => "session_introspect_scope_required",
            super::relying_party::SCOPE_MEMBERSHIPS_READ => "memberships_scope_required",
            _ => "identity_profile_scope_required",
        };
        return Err(RouteError::Status(422, error));
    }
    if policy.audiences.is_empty() {
        return Err(RouteError::Status(422, "session_audience_required"));
    }
    if policy.org_ids.is_empty() {
        return Err(RouteError::Status(422, "organization_id_required"));
    }
    Ok(())
}

fn validate_token(token: &str) -> Result<(), RouteError> {
    if token.len() < 32
        || token.len() > 4096
        || token.trim() != token
        || token.chars().any(char::is_control)
    {
        return Err(RouteError::Status(422, "invalid_relying_party_token"));
    }
    Ok(())
}

fn normalize_values(values: Vec<String>, error: &'static str) -> Result<Vec<String>, RouteError> {
    let mut seen = HashSet::new();
    let mut normalized = Vec::new();
    for raw in values {
        let value = raw.trim();
        if value.is_empty() || value.len() > 512 || value.chars().any(char::is_control) {
            return Err(RouteError::Status(422, error));
        }
        if seen.insert(value.to_string()) {
            normalized.push(value.to_string());
        }
    }
    Ok(normalized)
}

fn policy_values_are_well_formed(policy: &RelyingPartyPolicy) -> bool {
    policy
        .scopes
        .iter()
        .chain(policy.audiences.iter())
        .chain(policy.org_ids.iter())
        .all(|value| {
            !value.is_empty()
                && value.len() <= 512
                && value.trim() == value
                && !value.chars().any(char::is_control)
        })
}

fn contains(values: &[String], expected: &str) -> bool {
    values.iter().any(|value| value == expected)
}

fn supported_display_name(id: &str) -> Option<&'static str> {
    SUPPORTED_RELYING_PARTIES
        .iter()
        .find_map(|(known_id, name)| (*known_id == id).then_some(*name))
}

fn relying_party_id_from_path(path: &str) -> Result<String, RouteError> {
    let suffix = path
        .strip_prefix("/admin/relying-parties/")
        .ok_or(RouteError::Status(404, "not_found"))?;
    let id = suffix.strip_suffix("/verify").unwrap_or(suffix);
    if id.is_empty() || id.contains('/') {
        return Err(RouteError::Status(404, "not_found"));
    }
    validate_relying_party_id(id)?;
    Ok(id.to_string())
}

fn token_key(id: &str) -> String {
    format!("{RP_TOKEN_PREFIX}{id}")
}

fn policy_key(id: &str) -> String {
    format!("{RP_POLICY_PREFIX}{id}")
}

fn required_scope_for(id: &str) -> &'static str {
    match id {
        "cedros-casino" => super::relying_party::SCOPE_IDENTITY_PROFILE_READ,
        "cedros-data" => super::relying_party::SCOPE_MEMBERSHIPS_READ,
        _ => SESSION_INTROSPECT_SCOPE,
    }
}

#[cfg(test)]
#[path = "admin_relying_parties_tests.rs"]
mod tests;
