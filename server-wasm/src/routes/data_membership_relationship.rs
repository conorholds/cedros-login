//! A fixed, token-free operator setup seam for Data's membership reauthorization.
use super::*;
use crate::context::RouteContext;
use rand::RngCore;

const ROUTE: &str = "cedros-login:admin-data-membership-relationship";
const PATH: &str = "/admin/relying-parties/data-membership";
const DATA: &str = "cedros-data";

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Request {
    action: Action,
}
#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
enum Action {
    Read,
    Ensure,
}

pub fn handle(request: &RouteRequest) -> RouteResponse {
    super::super::identity_profile::no_store(run(handle_inner(request)))
}

fn authorize(request: &RouteRequest) -> Result<(), RouteError> {
    let context = RouteContext::parse(&request.context_json);
    if !context.authenticated {
        return Err(RouteError::Status(401, "unauthenticated"));
    }
    // This permission never applies to other Login admin routes. Ambient
    // browser claims and generic MCP/settings permissions cannot provision it.
    if context.auth_scheme.as_deref() == Some("bearer-token")
        && context.capability_claims.iter().any(|claim| claim == ROUTE)
    {
        return Ok(());
    }
    require_system_admin_write(request)
}

fn handle_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    authorize(request)?;
    if request.route_id != ROUTE
        || request.method != "POST"
        || request.path != PATH
        || !request.query.is_empty()
    {
        return Err(RouteError::Status(400, "invalid_request"));
    }
    let body: Request =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    if matches!(body.action, Action::Ensure) {
        ensure()?;
    }
    let relationship = status(DATA, "Cedros Data")?;
    let mut result = serde_json::json!({"relationship":relationship});
    if relationship.ready {
        let token = secrets::get(&token_key(DATA))?
            .ok_or(RouteError::Status(503, "relationship_unavailable"))?;
        result["membershipProbe"] = serde_json::json!(probe_membership(DATA, &token)?);
    }
    Ok(json(200, &to_json(&result)?))
}

fn fixed_policy(token: &str) -> RelyingPartyPolicy {
    RelyingPartyPolicy {
        token_sha256: Some(RelyingPartyPolicy::token_digest(token)),
        scopes: vec![super::super::relying_party::SCOPE_MEMBERSHIPS_READ.into()],
        audiences: vec![DATA.into()],
        // Login's existing dynamic-org exception is confined to this caller
        // and this scope. It grants no directory/profile or session access.
        org_ids: vec!["*".into()],
    }
}

fn ensure() -> Result<(), RouteError> {
    let key = token_key(DATA);
    let existing_token = secrets::get(&key)?;
    let raw_policy = secrets::get(&policy_key(DATA))?;
    if let Some(raw) = raw_policy.as_ref() {
        let policy: RelyingPartyPolicy = from_json(raw)
            .map_err(|_| RouteError::Status(409, "relationship_configuration_conflict"))?;
        let token_missing = existing_token.is_none();
        let token = match existing_token {
            Some(token) => token,
            None => bootstrap_token()?,
        };
        let fixed = fixed_policy(&token);
        if policy.scopes != fixed.scopes
            || policy.audiences != fixed.audiences
            || policy.org_ids != fixed.org_ids
            || !policy.matches_token(&token)
            || (token_missing && policy.token_sha256.is_none())
        {
            return Err(RouteError::Status(
                409,
                "relationship_configuration_conflict",
            ));
        }
        // Preserve an existing operator relationship, including its token.
        validate_token(&token)?;
        if token_missing {
            // Resume a policy-first write only with its exact immutable token.
            secrets::set(&key, &token)?;
        }
        return Ok(());
    }
    let token = match existing_token {
        Some(token) => token,
        None => bootstrap_token()?,
    };
    validate_token(&token)?;
    let policy = fixed_policy(&token);
    validate_complete_policy(DATA, &policy)?;
    // Match the existing admin setup's fail-closed token-bound publication.
    // Atomic secret initialization makes simultaneous first-use tokens agree.
    // Publishing the policy first leaves partial writes denied and retryable.
    secrets::set(&policy_key(DATA), &to_json(&policy)?)?;
    secrets::set(&key, &token)?;
    Ok(())
}

fn bootstrap_token() -> Result<String, RouteError> {
    Ok(secrets::get_or_create(&token_key(DATA), || {
        let mut bytes = [0u8; 32];
        rand::rngs::OsRng.try_fill_bytes(&mut bytes).map_err(|_| {
            crate::host::SeamError::Secrets("service token generation failed".into())
        })?;
        Ok(hex::encode(bytes))
    })?)
}

#[cfg(test)]
#[path = "data_membership_relationship_tests.rs"]
mod tests;
