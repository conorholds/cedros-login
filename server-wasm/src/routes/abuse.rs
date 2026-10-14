//! Host-atomic abuse budgets for public identity routes.
//!
//! Every guarded request submits all applicable dimensions in one capability-
//! gated call. Cedros platform applies the decision atomically and stores only
//! host-hashed, expiring budget keys.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use super::auth::client_ip;
use super::RouteError;
use crate::cedros::extension::extension_services::{ServiceRequest, ServiceResponse};
use crate::context::RouteContext;
use crate::exports::cedros::extension::routes::RouteRequest;

const MAX_SENSITIVE_BODY_BYTES: usize = 64 * 1024;
const TARGET_EXTENSION_ID: &str = "cedros-data";
const CAPABILITY_ID: &str = "cedros-data:abuse-budget-consume-v1";
const PATH: &str = "/runtime/abuse-budget/consume-v1";
const CONTRACT_ID: &str = "cedros-data:abuse-budget-v1";
const CONTRACT_VERSION: &str = "1.0.0";
const UNAVAILABLE_RETRY_AFTER_SECS: u64 = 1;
const MAX_RETRY_AFTER_SECS: u64 = 7 * 24 * 60 * 60;
const SYSTEM_LIMIT: Limit = Limit::new(2_000, 60);

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct Limit {
    max: u32,
    window_secs: u64,
}

impl Limit {
    const fn new(max: u32, window_secs: u64) -> Self {
        Self { max, window_secs }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct Policy {
    family: &'static str,
    family_limit: Limit,
    ip_limit: Limit,
    identity_limit: Limit,
    pair_limit: Limit,
}

const PASSWORD: Policy = policy("password", (300, 60), (30, 300), (100, 3_600), (10, 900));
const SIGNUP: Policy = policy("signup", (60, 60), (10, 600), (5, 3_600), (3, 600));
const EMAIL_SEND: Policy = policy("email-send", (120, 60), (20, 600), (3, 600), (3, 600));
const CHALLENGE: Policy = policy("challenge", (600, 60), (60, 300), (20, 300), (10, 300));
const PROOF: Policy = policy("proof", (600, 60), (60, 300), (20, 300), (10, 300));
const PROVIDER: Policy = policy("provider", (120, 60), (20, 300), (10, 300), (5, 300));
const API_KEY: Policy = policy("api-key", (5_000, 60), (300, 60), (60, 60), (30, 60));
const SESSION: Policy = policy("session", (5_000, 60), (120, 60), (30, 60), (20, 60));
const INVITE_SEND: Policy = policy(
    "invite-send",
    (500, 60),
    (60, 600),
    (30, 3_600),
    (20, 3_600),
);

const fn policy(
    family: &'static str,
    family_budget: (u32, u64),
    ip: (u32, u64),
    identity: (u32, u64),
    pair: (u32, u64),
) -> Policy {
    Policy {
        family,
        family_limit: Limit::new(family_budget.0, family_budget.1),
        ip_limit: Limit::new(ip.0, ip.1),
        identity_limit: Limit::new(identity.0, identity.1),
        pair_limit: Limit::new(pair.0, pair.1),
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ConsumeRequest {
    contract_id: &'static str,
    contract_version: &'static str,
    dimensions: Vec<Dimension>,
}

#[derive(Debug, Serialize)]
struct Dimension {
    name: &'static str,
    value: String,
    windows: Vec<Window>,
}

#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct Window {
    window_seconds: u64,
    limit: u32,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ConsumeResponse {
    contract_id: String,
    contract_version: String,
    allowed: bool,
    retry_after_seconds: Option<u64>,
    code: Option<String>,
}

/// Apply the budget for a canonical route before its handler performs lookups,
/// network calls, token allocation, email enqueue, or password crypto.
pub(super) fn enforce(request: &RouteRequest) -> Result<(), RouteError> {
    let Some(policy) = policy_for(request.method.as_str(), request.path.as_str()) else {
        return Ok(());
    };
    if request.body.len() > MAX_SENSITIVE_BODY_BYTES {
        return Err(RouteError::Status(413, "request_too_large"));
    }
    let identity = identity_for(request);
    enforce_policy(request, policy, identity.as_deref())?;
    if policy == SIGNUP {
        if let Some(email) = identity.as_deref() {
            enforce_email_action(request, email)?;
        }
    }
    Ok(())
}

pub(super) fn enforce_password_action(
    request: &RouteRequest,
    user_id: &str,
) -> Result<(), RouteError> {
    enforce_policy(request, PASSWORD, Some(user_id))
}

pub(super) fn enforce_email_action(
    request: &RouteRequest,
    user_id: &str,
) -> Result<(), RouteError> {
    enforce_policy(request, EMAIL_SEND, Some(user_id))
}

pub(super) fn enforce_invite_action(
    request: &RouteRequest,
    user_id: &str,
) -> Result<(), RouteError> {
    enforce_policy(request, INVITE_SEND, Some(user_id))
}

pub(super) fn enforce_challenge_action(
    request: &RouteRequest,
    user_id: &str,
) -> Result<(), RouteError> {
    enforce_policy(request, CHALLENGE, Some(user_id))
}

pub(super) fn enforce_proof_action(
    request: &RouteRequest,
    user_id: &str,
) -> Result<(), RouteError> {
    enforce_policy(request, PROOF, Some(user_id))
}

pub(super) fn enforce_provider_action(
    request: &RouteRequest,
    user_id: &str,
) -> Result<(), RouteError> {
    enforce_policy(request, PROVIDER, Some(user_id))
}

fn enforce_policy(
    request: &RouteRequest,
    policy: Policy,
    identity: Option<&str>,
) -> Result<(), RouteError> {
    if request.body.len() > MAX_SENSITIVE_BODY_BYTES {
        return Err(RouteError::Status(413, "request_too_large"));
    }

    let context = RouteContext::parse(&request.context_json);
    let ip = client_ip(request).ok_or_else(unavailable)?;
    let ip_key = opaque_key("ip", &ip);
    let identity_key = identity.map(|value| {
        opaque_key(
            policy.family,
            &format!(
                "{}\0{}\0{value}",
                context.installation_id.as_deref().unwrap_or(""),
                context.site_id.as_deref().unwrap_or("")
            ),
        )
    });

    let mut dimensions = vec![
        dimension("system", opaque_key("system", "cedros-login"), SYSTEM_LIMIT),
        dimension(
            "endpoint-family",
            opaque_key("endpoint-family", policy.family),
            policy.family_limit,
        ),
        dimension("client-ip", ip_key.clone(), policy.ip_limit),
    ];
    if let Some(installation_id) = context
        .installation_id
        .as_deref()
        .or(context.site_id.as_deref())
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        dimensions.insert(
            1,
            dimension(
                "installation",
                opaque_key("installation", installation_id),
                SYSTEM_LIMIT,
            ),
        );
    }
    if let Some(identity_key) = identity_key {
        dimensions.push(dimension(
            "identity",
            identity_key.clone(),
            policy.identity_limit,
        ));
        dimensions.push(dimension(
            "ip-identity",
            opaque_key("ip-identity", &format!("{ip_key}\0{identity_key}")),
            policy.pair_limit,
        ));
    }

    let body_json = serde_json::to_string(&ConsumeRequest {
        contract_id: CONTRACT_ID,
        contract_version: CONTRACT_VERSION,
        dimensions,
    })
    .map_err(|_| unavailable())?;
    let response = invoke_budget(&ServiceRequest {
        target_extension_id: TARGET_EXTENSION_ID.into(),
        route_id: CAPABILITY_ID.into(),
        capability_id: CAPABILITY_ID.into(),
        method: "POST".into(),
        path: PATH.into(),
        query: Vec::new(),
        body_json,
    })
    .map_err(|_| unavailable())?;
    apply_response(response)
}

fn dimension(name: &'static str, value: String, limit: Limit) -> Dimension {
    Dimension {
        name,
        value,
        windows: vec![Window {
            window_seconds: limit.window_secs,
            limit: limit.max,
        }],
    }
}

fn apply_response(response: ServiceResponse) -> Result<(), RouteError> {
    let body =
        serde_json::from_str::<ConsumeResponse>(&response.body).map_err(|_| unavailable())?;
    if body.contract_id != CONTRACT_ID || body.contract_version != CONTRACT_VERSION {
        return Err(unavailable());
    }

    match (response.status, body.allowed, body.code.as_deref()) {
        (200, true, None) if body.retry_after_seconds.is_none() => Ok(()),
        (429, false, Some("rate_limited")) => {
            let retry_after = response_retry_after(&response, &body).ok_or_else(unavailable)?;
            Err(RouteError::RetryAfter(
                429,
                "too_many_attempts",
                retry_after,
            ))
        }
        (503, false, Some("datastore_unavailable")) => {
            let retry_after =
                response_retry_after(&response, &body).unwrap_or(UNAVAILABLE_RETRY_AFTER_SECS);
            Err(RouteError::RetryAfter(
                503,
                "abuse_control_unavailable",
                retry_after,
            ))
        }
        _ => Err(unavailable()),
    }
}

fn response_retry_after(response: &ServiceResponse, body: &ConsumeResponse) -> Option<u64> {
    let header = response
        .headers
        .iter()
        .find(|(name, _)| name.eq_ignore_ascii_case("retry-after"))
        .and_then(|(_, value)| value.parse::<u64>().ok());
    let body = body.retry_after_seconds?;
    let header = header?;
    (body == header && (1..=MAX_RETRY_AFTER_SECS).contains(&body)).then_some(body)
}

fn unavailable() -> RouteError {
    RouteError::RetryAfter(
        503,
        "abuse_control_unavailable",
        UNAVAILABLE_RETRY_AFTER_SECS,
    )
}

fn opaque_key(scope: &str, value: &str) -> String {
    let mut digest = Sha256::new();
    digest.update(scope.as_bytes());
    digest.update([0]);
    digest.update(value.trim().as_bytes());
    format!("abuse:{scope}:{}", hex::encode(digest.finalize()))
}

fn policy_for(method: &str, path: &str) -> Option<Policy> {
    match (method, path) {
        ("POST", "/login") => Some(PASSWORD),
        ("POST", "/register") => Some(SIGNUP),
        (
            "POST",
            "/forgot-password"
            | "/send-verification"
            | "/instant-link"
            | "/account-deletion/request",
        ) => Some(EMAIL_SEND),
        (
            "POST",
            "/reset-password"
            | "/verify-email"
            | "/instant-link/verify"
            | "/account/emails/verify"
            | "/account-deletion/confirm"
            | "/login/mfa"
            | "/mfa/recovery"
            | "/solana"
            | "/webauthn/auth/verify"
            | "/webauthn/signup/verify"
            | "/invite-codes/redeem",
        ) => Some(PROOF),
        ("POST", "/google" | "/apple") | ("GET", "/sso/callback") => Some(PROVIDER),
        (
            "POST",
            "/apple/nonce"
            | "/solana/challenge"
            | "/webauthn/auth/options"
            | "/webauthn/signup/options"
            | "/sso/start",
        ) => Some(CHALLENGE),
        ("POST", "/api-keys/validate") => Some(API_KEY),
        ("POST", "/refresh" | "/oauth/token" | "/oauth/revoke") => Some(SESSION),
        ("GET", "/oauth/authorize") => Some(CHALLENGE),
        _ => None,
    }
}

fn identity_for(request: &RouteRequest) -> Option<String> {
    let path = request.path.as_str();
    let method = request.method.as_str();
    let body = || serde_json::from_str::<serde_json::Value>(&request.body).ok();
    let fields = |names: &[&str]| body().and_then(|value| first_string(&value, names));
    let email = || fields(&["email"]).map(|value| crate::services::email::normalize_email(&value));

    match (method, path) {
        ("POST", "/login" | "/register") => email(),
        (
            "POST",
            "/forgot-password"
            | "/send-verification"
            | "/instant-link"
            | "/account-deletion/request",
        ) => email(),
        (
            "POST",
            "/reset-password"
            | "/verify-email"
            | "/instant-link/verify"
            | "/account/emails/verify"
            | "/account-deletion/confirm",
        ) => fields(&["token"]),
        ("POST", "/login/mfa" | "/mfa/recovery") => fields(&["mfaToken", "mfa_token"]),
        ("POST", "/google" | "/apple") => fields(&[
            "nonce",
            "idToken",
            "id_token",
            "accessToken",
            "access_token",
        ]),
        ("POST", "/apple/nonce") => None,
        ("POST", "/solana/challenge" | "/solana") => fields(&["publicKey"]),
        ("POST", "/webauthn/auth/options" | "/webauthn/signup/options") => email(),
        ("POST", "/webauthn/auth/verify" | "/webauthn/signup/verify") => {
            fields(&["challengeId", "challenge_id"])
        }
        ("POST", "/sso/start") => fields(&["orgId", "org_id"]),
        ("GET", "/sso/callback") => query(request, "state"),
        ("POST", "/invite-codes/redeem") => fields(&["pendingInviteToken", "pending_invite_token"]),
        ("POST", "/api-keys/validate") => fields(&["apiKey", "api_key"]),
        ("POST", "/refresh") => fields(&["refreshToken", "refresh_token"]),
        _ => None,
    }
}

#[cfg(test)]
fn classify(request: &RouteRequest) -> Option<(Policy, Option<String>)> {
    policy_for(request.method.as_str(), request.path.as_str())
        .map(|policy| (policy, identity_for(request)))
}

fn first_string(value: &serde_json::Value, names: &[&str]) -> Option<String> {
    names.iter().find_map(|name| {
        value
            .get(*name)
            .and_then(serde_json::Value::as_str)
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_string)
    })
}

fn query(request: &RouteRequest, key: &str) -> Option<String> {
    request
        .query
        .iter()
        .find(|(name, _)| name == key)
        .map(|(_, value)| value.trim())
        .filter(|value| !value.is_empty())
        .map(str::to_string)
}

#[cfg(not(test))]
fn invoke_budget(request: &ServiceRequest) -> crate::host::Result<ServiceResponse> {
    crate::host::extension_services::invoke(request)
}

// Native unit tests have no imported host. Capture the exact service request
// and return a deterministic response so contract behavior remains testable.
#[cfg(test)]
thread_local! {
    static TEST_RESPONSE: std::cell::RefCell<Option<crate::host::Result<ServiceResponse>>> = const { std::cell::RefCell::new(None) };
    static TEST_REQUESTS: std::cell::RefCell<Vec<ServiceRequest>> = const { std::cell::RefCell::new(Vec::new()) };
}

#[cfg(test)]
fn invoke_budget(request: &ServiceRequest) -> crate::host::Result<ServiceResponse> {
    TEST_REQUESTS.with_borrow_mut(|requests| {
        requests.push(ServiceRequest {
            target_extension_id: request.target_extension_id.clone(),
            route_id: request.route_id.clone(),
            capability_id: request.capability_id.clone(),
            method: request.method.clone(),
            path: request.path.clone(),
            query: request.query.clone(),
            body_json: request.body_json.clone(),
        })
    });
    TEST_RESPONSE
        .with_borrow_mut(Option::take)
        .unwrap_or_else(|| {
            Ok(ServiceResponse {
                status: 200,
                headers: Vec::new(),
                body: serde_json::json!({
                    "contractId": CONTRACT_ID,
                    "contractVersion": CONTRACT_VERSION,
                    "allowed": true,
                    "retryAfterSeconds": null,
                    "code": null,
                })
                .to_string(),
            })
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request(path: &str, body: &str) -> RouteRequest {
        RouteRequest {
            route_id: String::new(),
            method: "POST".into(),
            path: path.into(),
            headers: vec![("x-forwarded-for".into(), "198.51.100.99".into())],
            query: vec![],
            body: body.into(),
            context_json: r#"{"clientIp":"203.0.113.7","installationId":"installation-1"}"#.into(),
        }
    }

    fn response(
        status: u16,
        allowed: bool,
        retry_after: Option<u64>,
        code: Option<&str>,
    ) -> ServiceResponse {
        ServiceResponse {
            status,
            headers: retry_after
                .map(|seconds| vec![("Retry-After".into(), seconds.to_string())])
                .unwrap_or_default(),
            body: serde_json::json!({
                "contractId": CONTRACT_ID,
                "contractVersion": CONTRACT_VERSION,
                "allowed": allowed,
                "retryAfterSeconds": retry_after,
                "code": code,
            })
            .to_string(),
        }
    }

    fn with_response(response: ServiceResponse, run: impl FnOnce()) {
        TEST_RESPONSE.with_borrow_mut(|slot| *slot = Some(Ok(response)));
        TEST_REQUESTS.with_borrow_mut(Vec::clear);
        run();
        TEST_RESPONSE.with_borrow_mut(|slot| *slot = None);
    }

    fn with_invocation_error(run: impl FnOnce()) {
        TEST_RESPONSE.with_borrow_mut(|slot| {
            *slot = Some(Err(crate::host::SeamError::ExtensionService(
                "host unavailable".into(),
            )))
        });
        TEST_REQUESTS.with_borrow_mut(Vec::clear);
        run();
        TEST_RESPONSE.with_borrow_mut(|slot| *slot = None);
    }

    #[test]
    fn canonical_account_budgets_are_source_independent_and_tenant_bound() {
        let mut first = request("/login", "{}");
        let mut other_source = request("/login", "{}");
        other_source.context_json =
            r#"{"clientIp":"203.0.113.8","installationId":"installation-1"}"#.into();
        let mut identities = Vec::new();
        for request in [&first, &other_source] {
            with_response(response(200, true, None, None), || {
                enforce_password_action(request, "canonical-user").unwrap();
                TEST_REQUESTS.with_borrow(|calls| {
                    let body: serde_json::Value =
                        serde_json::from_str(&calls[0].body_json).unwrap();
                    identities.push(
                        body["dimensions"]
                            .as_array()
                            .unwrap()
                            .iter()
                            .find(|d| d["name"] == "identity")
                            .unwrap()["value"]
                            .clone(),
                    );
                });
            });
        }
        assert_eq!(identities[0], identities[1]);
        first.context_json =
            r#"{"clientIp":"203.0.113.7","installationId":"installation-2"}"#.into();
        with_response(response(200, true, None, None), || {
            enforce_password_action(&first, "canonical-user").unwrap();
            TEST_REQUESTS.with_borrow(|calls| {
                let body: serde_json::Value = serde_json::from_str(&calls[0].body_json).unwrap();
                let identity = body["dimensions"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .find(|d| d["name"] == "identity")
                    .unwrap()["value"]
                    .clone();
                assert_ne!(identity, identities[0]);
                assert!(!calls[0].body_json.contains("canonical-user"));
            });
        });
    }

    #[test]
    fn shared_email_budget_cannot_be_bypassed_with_an_alternate_endpoint() {
        let forgot = request("/forgot-password", r#"{"email":"Victim@Example.com"}"#);
        let instant = request("/instant-link", r#"{"email":"victim@example.com"}"#);
        let (_, forgot_identity) = classify(&forgot).unwrap();
        let (_, instant_identity) = classify(&instant).unwrap();
        assert_eq!(forgot_identity, instant_identity);
        assert_eq!(
            opaque_key(EMAIL_SEND.family, forgot_identity.as_deref().unwrap()),
            opaque_key(EMAIL_SEND.family, instant_identity.as_deref().unwrap())
        );
    }

    #[test]
    fn denial_honors_the_host_retry_after() {
        with_response(response(429, false, Some(17), Some("rate_limited")), || {
            let result = enforce(&request(
                "/verify-email",
                r#"{"token":"attacker-controlled-token"}"#,
            ));
            assert!(matches!(
                result,
                Err(RouteError::RetryAfter(429, "too_many_attempts", 17))
            ));
        });
    }

    #[test]
    fn allowed_request_submits_every_dimension_atomically_with_opaque_values() {
        with_response(response(200, true, None, None), || {
            enforce(&request(
                "/forgot-password",
                r#"{"email":"person@example.com"}"#,
            ))
            .unwrap();
            TEST_REQUESTS.with_borrow(|requests| {
                assert_eq!(requests.len(), 1);
                let call = &requests[0];
                assert_eq!(call.target_extension_id, TARGET_EXTENSION_ID);
                assert_eq!(call.route_id, CAPABILITY_ID);
                assert_eq!(call.capability_id, CAPABILITY_ID);
                assert_eq!(call.method, "POST");
                assert_eq!(call.path, PATH);
                assert!(call.query.is_empty());

                let body: serde_json::Value = serde_json::from_str(&call.body_json).unwrap();
                let dimensions = body["dimensions"].as_array().unwrap();
                let names = dimensions
                    .iter()
                    .map(|dimension| dimension["name"].as_str().unwrap())
                    .collect::<Vec<_>>();
                assert_eq!(
                    names,
                    vec![
                        "system",
                        "installation",
                        "endpoint-family",
                        "client-ip",
                        "identity",
                        "ip-identity"
                    ]
                );
                assert!(!call.body_json.contains("person@example.com"));
                assert!(!call.body_json.contains("203.0.113.7"));
                assert!(!call.body_json.contains("installation-1"));
                assert_eq!(body["contractId"], CONTRACT_ID);
                assert_eq!(body["contractVersion"], CONTRACT_VERSION);
            });
        });
    }

    #[test]
    fn oversized_sensitive_body_is_rejected_without_counter_io() {
        let mut request = request("/login", "");
        request.body = "x".repeat(MAX_SENSITIVE_BODY_BYTES + 1);
        TEST_REQUESTS.with_borrow_mut(Vec::clear);
        assert!(matches!(
            enforce(&request),
            Err(RouteError::Status(413, "request_too_large"))
        ));
        TEST_REQUESTS.with_borrow(|requests| assert!(requests.is_empty()));
    }

    #[test]
    fn missing_authoritative_ip_fails_closed_without_invocation() {
        let mut request = request("/login", r#"{"email":"person@example.com"}"#);
        request.context_json = "{}".into();
        TEST_REQUESTS.with_borrow_mut(Vec::clear);
        assert!(matches!(
            enforce(&request),
            Err(RouteError::RetryAfter(503, "abuse_control_unavailable", 1))
        ));
        TEST_REQUESTS.with_borrow(|requests| assert!(requests.is_empty()));
    }

    #[test]
    fn invalid_host_response_fails_closed() {
        with_response(
            ServiceResponse {
                status: 200,
                headers: vec![],
                body: r#"{"allowed":true}"#.into(),
            },
            || {
                assert!(matches!(
                    enforce(&request("/login", r#"{"email":"person@example.com"}"#)),
                    Err(RouteError::RetryAfter(503, "abuse_control_unavailable", 1))
                ));
            },
        );
    }

    #[test]
    fn inconsistent_denial_retry_after_fails_closed() {
        let mut denial = response(429, false, Some(17), Some("rate_limited"));
        denial.headers = vec![("retry-after".into(), "18".into())];
        with_response(denial, || {
            assert!(matches!(
                enforce(&request("/login", r#"{"email":"person@example.com"}"#)),
                Err(RouteError::RetryAfter(503, "abuse_control_unavailable", 1))
            ));
        });
    }

    #[test]
    fn invocation_error_fails_closed() {
        with_invocation_error(|| {
            assert!(matches!(
                enforce(&request("/login", r#"{"email":"person@example.com"}"#)),
                Err(RouteError::RetryAfter(503, "abuse_control_unavailable", 1))
            ));
        });
    }

    #[test]
    fn password_policy_resists_spraying_without_a_five_try_victim_lockout() {
        assert_eq!(PASSWORD.pair_limit, Limit::new(10, 900));
        assert_eq!(PASSWORD.ip_limit, Limit::new(30, 300));
        assert_eq!(PASSWORD.identity_limit, Limit::new(100, 3_600));
        const {
            assert!(PASSWORD.identity_limit.max > PASSWORD.pair_limit.max);
        }
    }

    #[test]
    fn every_costly_public_identity_route_has_a_policy() {
        let routes = [
            ("POST", "/register"),
            ("POST", "/login"),
            ("POST", "/login/mfa"),
            ("POST", "/mfa/recovery"),
            ("POST", "/google"),
            ("POST", "/apple"),
            ("POST", "/apple/nonce"),
            ("POST", "/solana/challenge"),
            ("POST", "/solana"),
            ("POST", "/webauthn/auth/options"),
            ("POST", "/webauthn/auth/verify"),
            ("POST", "/webauthn/signup/options"),
            ("POST", "/webauthn/signup/verify"),
            ("POST", "/sso/start"),
            ("GET", "/sso/callback"),
            ("POST", "/instant-link"),
            ("POST", "/instant-link/verify"),
            ("POST", "/forgot-password"),
            ("POST", "/reset-password"),
            ("POST", "/send-verification"),
            ("POST", "/verify-email"),
            ("POST", "/account/emails/verify"),
            ("POST", "/account-deletion/request"),
            ("POST", "/account-deletion/confirm"),
            ("POST", "/invite-codes/redeem"),
            ("POST", "/api-keys/validate"),
            ("POST", "/refresh"),
        ];
        for (method, path) in routes {
            assert!(
                policy_for(method, path).is_some(),
                "missing {method} {path}"
            );
        }
    }
}

