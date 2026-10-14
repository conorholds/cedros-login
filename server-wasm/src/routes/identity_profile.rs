//! Versioned, minimal identity/profile projections.
//!
//! The current-user route derives its subject exclusively from the validated
//! Login access token. The separately permissioned relying-party lookup lives
//! in `relying_party` so it reuses that module's service-token, scope, and
//! organization allowlist checks.

use serde::Serialize;

use super::{auth, error_response, json, RouteError};
use crate::data::users::UserEntry;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::to_json;

pub(crate) const CONTRACT_VERSION: &str = "cedros-login:identity-profile:v1";
pub(crate) const CACHE_CONTROL: &str = "private, no-store";

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct IdentityProfileResponse {
    contract_version: &'static str,
    subject_id: String,
    tenant_id: Option<String>,
    state: IdentityProfileState,
    updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct IdentityProfileState {
    email_linked: bool,
    email_verified: bool,
    password_configured: bool,
    solana_wallet_linked: bool,
    evm_wallet_linked: bool,
}

pub fn current(request: &RouteRequest) -> RouteResponse {
    no_store(run(current_inner(request)))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(error) => error_response(error),
    }
}

fn current_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let context = auth::authenticated_context(request)?;
    response(&context.user, context.claims.org_id)
}

pub(crate) fn response(
    user: &UserEntry,
    tenant_id: Option<String>,
) -> Result<RouteResponse, RouteError> {
    Ok(json(200, &to_json(&projection(user, tenant_id))?))
}

fn projection(user: &UserEntry, tenant_id: Option<String>) -> IdentityProfileResponse {
    let email_linked = linked(user.email.as_deref());
    IdentityProfileResponse {
        contract_version: CONTRACT_VERSION,
        subject_id: user.id.clone(),
        tenant_id,
        state: IdentityProfileState {
            email_linked,
            // A stale true bit without an address is not a verified linked email.
            email_verified: email_linked && user.email_verified,
            password_configured: linked(user.password_hash.as_deref()),
            solana_wallet_linked: linked(user.wallet_address.as_deref()),
            evm_wallet_linked: linked(user.evm_wallet_address.as_deref()),
        },
        updated_at: user.updated_at.clone(),
    }
}

fn linked(value: Option<&str>) -> bool {
    value.is_some_and(|value| !value.trim().is_empty())
}

pub(crate) fn no_store(mut response: RouteResponse) -> RouteResponse {
    response
        .headers
        .push(("cache-control".to_string(), CACHE_CONTROL.to_string()));
    response
}

#[cfg(test)]
mod tests {
    use super::*;

    fn user() -> UserEntry {
        UserEntry {
            id: "login-subject-1".into(),
            email: Some("user@example.com".into()),
            email_verified: true,
            password_hash: Some("$argon2id$hash".into()),
            name: Some("Private Name".into()),
            username: Some("private_username".into()),
            picture: Some("https://example.com/private.png".into()),
            wallet_address: Some("11111111111111111111111111111111".into()),
            evm_wallet_address: Some("0x1111111111111111111111111111111111111111".into()),
            google_id: Some("private-google-id".into()),
            apple_id: Some("private-apple-id".into()),
            auth_methods: vec!["password".into(), "solana".into()],
            suspended_at: None,
            is_system_admin: false,
            created_at: "2026-08-18T00:00:00Z".into(),
            updated_at: "2026-08-18T01:00:00Z".into(),
            last_login_at: None,
            welcome_completed_at: None,
            avatar_content_type: None,
        }
    }

    #[test]
    fn complete_projection_has_exact_minimal_shape() {
        let value = serde_json::to_value(projection(&user(), Some("org-1".into()))).unwrap();
        assert_eq!(value["contractVersion"], CONTRACT_VERSION);
        assert_eq!(value["subjectId"], "login-subject-1");
        assert_eq!(value["tenantId"], "org-1");
        assert_eq!(value["state"]["emailLinked"], true);
        assert_eq!(value["state"]["emailVerified"], true);
        assert_eq!(value["state"]["passwordConfigured"], true);
        assert_eq!(value["state"]["solanaWalletLinked"], true);
        assert_eq!(value["state"]["evmWalletLinked"], true);
        assert_eq!(value["updatedAt"], "2026-08-18T01:00:00Z");
        let encoded = value.to_string();
        for forbidden in [
            "user@example.com",
            "$argon2id$hash",
            "11111111111111111111111111111111",
            "0x1111111111111111111111111111111111111111",
            "private-google-id",
            "private-apple-id",
            "Private Name",
            "private_username",
        ] {
            assert!(
                !encoded.contains(forbidden),
                "projection leaked {forbidden}"
            );
        }
    }

    #[test]
    fn incomplete_or_inconsistent_state_fails_closed_to_false() {
        let mut incomplete = user();
        incomplete.email = Some("  ".into());
        incomplete.password_hash = Some(String::new());
        incomplete.wallet_address = None;
        incomplete.evm_wallet_address = None;
        let value = serde_json::to_value(projection(&incomplete, None)).unwrap();
        assert_eq!(value["tenantId"], serde_json::Value::Null);
        assert_eq!(value["state"]["emailLinked"], false);
        assert_eq!(value["state"]["emailVerified"], false);
        assert_eq!(value["state"]["passwordConfigured"], false);
        assert_eq!(value["state"]["solanaWalletLinked"], false);
        assert_eq!(value["state"]["evmWalletLinked"], false);
    }

    #[test]
    fn projection_errors_are_not_cacheable() {
        let response = no_store(error_response(RouteError::Status(401, "unauthenticated")));
        assert_eq!(response.status, 401);
        assert_eq!(response.body, r#"{"error":"unauthenticated"}"#);
        assert!(response
            .headers
            .iter()
            .any(|(name, value)| name == "cache-control" && value == CACHE_CONTROL));
    }
}
