//! Host-only, read-only live authority proof for an already journaled managed
//! site grant. This is not token issuance and accepts no OAuth credential.
use super::*;
use std::collections::BTreeSet;

pub(super) const CLAIM: &str = "cedros-login:oauth-consent-authority:read";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct AuthorityRequest {
    contract_version: u8,
    grant_id: String,
    oauth_issuer: String,
    oauth_subject: String,
    organization_id: String,
    client_id: String,
    resource: String,
    site_id: String,
    runtime_site_id: String,
    grant_expires_at: i64,
    scopes: Vec<String>,
    nonce: String,
}

pub(super) fn check(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    if request.method != "POST" || request.body.len() > 16_384 || !request.query.is_empty() {
        return Err(invalid());
    }
    let input: AuthorityRequest = serde_json::from_str(&request.body).map_err(|_| invalid())?;
    let context = crate::context::RouteContext::parse(&request.context_json);
    // This claim is reserved for the host's internal dispatch, after checking
    // the installed Login extension and exact managed-site registration. The
    // host must strip it from ordinary user/session/API-key/token claims.
    // Neither an admin session nor raw caller headers can grant this authority.
    if !context.authenticated
        || context.auth_scheme.as_deref() != Some("bearer-token")
        || !context.permission_claims.iter().any(|claim| claim == CLAIM)
        || context.actor_id.as_deref() != Some(input.oauth_subject.as_str())
        || context.org_id.as_deref() != Some(input.organization_id.as_str())
    {
        return Err(RouteError::Status(403, "host_consent_authority_required"));
    }
    validate(&input)?;
    let active = live(&input)?;
    Ok(json(
        200,
        &serde_json::json!({
            "contractVersion": 1, "active": active, "nonce": input.nonce,
            "checkedAt": chrono::Utc::now().timestamp()
        })
        .to_string(),
    ))
}

fn invalid() -> RouteError {
    RouteError::Status(400, "invalid_request")
}

fn validate(input: &AuthorityRequest) -> Result<(), RouteError> {
    let strings = [
        &input.oauth_subject,
        &input.organization_id,
        &input.client_id,
        &input.site_id,
        &input.runtime_site_id,
    ];
    let unique: BTreeSet<_> = input.scopes.iter().collect();
    if input.contract_version != 1
        || input.grant_id.len() != 64
        || !input
            .grant_id
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
        || strings
            .iter()
            .any(|s| s.trim().is_empty() || s.len() > 256 || s.chars().any(char::is_control))
        || input.scopes.is_empty()
        || input.scopes.len() > 8
        || unique.len() != input.scopes.len()
        || input.scopes.iter().any(|scope| {
            !config::scope_token(scope)
                || (!ACCOUNT_SCOPES.contains(&scope.as_str())
                    && !SITE_SCOPES.contains(&scope.as_str()))
        })
        || input.nonce.len() < 16
        || input.nonce.len() > 80
        || !input
            .nonce
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'-')
        || input.grant_expires_at <= 0
    {
        return Err(invalid());
    }
    config::https(&input.oauth_issuer).map_err(|_| invalid())?;
    config::https(&input.resource).map_err(|_| invalid())?;
    Ok(())
}

fn matches_binding(connection: &Connection, input: &AuthorityRequest) -> bool {
    let expected: BTreeSet<&str> = input.scopes.iter().map(String::as_str).collect();
    let actual: BTreeSet<&str> = connection.scope.split_whitespace().collect();
    connection.status == "active"
        && connection.id == input.grant_id
        && connection.issuer == input.oauth_issuer
        && connection.client_id == input.client_id
        && connection.resource == input.resource
        && connection.site_id.as_deref() == Some(input.site_id.as_str())
        && connection.runtime_site_id.as_deref() == Some(input.runtime_site_id.as_str())
        && actual == expected
        && chrono::DateTime::parse_from_rfc3339(&connection.expires_at).is_ok_and(|expiry|
            expiry.timestamp() == input.grant_expires_at && expiry.timestamp() > chrono::Utc::now().timestamp())
        // Persisted identity is the consent's Login identity, with Login iss/aud.
        // OAuth iss/resource are bound by the connection and registration below;
        // only minted OAuth tokens have those values in their identity claims.
        && connection.identity.as_ref().is_some_and(|identity|
            identity.sub == input.oauth_subject && identity.org_id.as_deref() == Some(input.organization_id.as_str()))
}

fn live(input: &AuthorityRequest) -> Result<bool, RouteError> {
    let Some(row) = store::read(&input.grant_id)? else {
        return Ok(false);
    };
    if !matches_binding(&row.value, input) {
        return Ok(false);
    }
    let config = match Config::load() {
        Ok(value) => value,
        Err(RouteError::Status(_, _)) => return Ok(false),
        Err(error) => return Err(error),
    };
    if tokens::validate_registration(&config, &row.value).is_err() {
        return Ok(false);
    }
    let identity = row
        .value
        .identity
        .ok_or(RouteError::Status(403, "invalid_grant"))?;
    let current = match auth::authoritative_session(identity) {
        Ok(current) => current,
        Err(RouteError::Status(401 | 403, _)) | Err(RouteError::Auth(_)) => return Ok(false),
        Err(error) => return Err(error),
    };
    // Reuse the current Login session/user/membership checks, rather than
    // inferring user authority from the host envelope or an old access token.
    Ok(current.user.email_verified
        && current
            .user
            .email
            .as_deref()
            .is_some_and(|email| !email.trim().is_empty())
        && current
            .organization
            .as_ref()
            .is_some_and(|org| matches!(org.membership.role.as_str(), "owner" | "admin")))
}
