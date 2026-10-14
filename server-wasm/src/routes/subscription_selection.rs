//! Required subscription-selection gate backed by Cedros Pay. Wasm port of
//! `server/src/services/subscription_selection_service.rs`.
//!
//! When `subscription_selection_required` is on, a fresh login must redirect to
//! the chooser route unless Cedros Pay confirms the user already selected a plan.
//! Fail-closed: an unconfigured Pay base URL, a non-2xx response, an egress/
//! allowlist failure, or an unparseable body all redirect to the chooser. The
//! Same-site Pay calls use the host-authenticated extension service contract;
//! only explicitly configured external Pay locations require allowlisted HTTP.
use super::auth::PostLoginAction;
use crate::cedros::extension::extension_services::{ServiceRequest, ServiceResponse};
use crate::domain::plan_seat_policy::SeatLimit;
use crate::host::http::{self, HttpRequest};
use crate::host::{log, settings};
use serde::Deserialize;

const REQUIRED_KEY: &str = "subscription_selection_required";
const ROUTE_KEY: &str = "subscription_selection_route";
const PAY_BASE_URL_KEY: &str = "subscription_selection_pay_base_url";
const DEFAULT_REDIRECT_URL: &str = "/subscribe";
const PAY_SELECTION_STATUS_PATH: &str = "paywall/v1/subscription/selection-status";

/// A `choose_subscription` post-login action when selection is required and Pay
/// does not confirm completion; `None` when the gate is off or Pay confirms a
/// durable selection. `user_id` is the verified `UserEntry.id`; same-site reads
/// use Login's host-authenticated principal. External Pay reads reuse the freshly
/// issued `access_token`. Never errors — every failure falls closed to the chooser.
pub(crate) fn post_login_action(user_id: &str, access_token: &str) -> Option<PostLoginAction> {
    match selection_required() {
        Ok(false) => return None,
        Ok(true) => {}
        Err(_) => return Some(choose(DEFAULT_REDIRECT_URL.to_string())),
    }
    let redirect_url = normalize_route(settings::get(ROUTE_KEY).ok().flatten());
    let Some(base) = pay_base_url() else {
        log::op_warn("subscription", "post-login", "pay_base_url_unconfigured");
        return Some(choose(redirect_url));
    };
    match selection_status(&base, user_id, access_token) {
        Ok(status) if status.complete => None,
        Ok(_) => Some(choose(redirect_url)),
        Err(code) => {
            log::op_warn("subscription", "post-login", code);
            Some(choose(redirect_url))
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct ResolvedPlanSeatLimit {
    pub plan_id: String,
    pub limit: SeatLimit,
}

/// Resolve the authenticated caller's configured team-seat limit. The policy is
/// inactive unless subscription selection is required; configured resolution
/// failures fail closed at the invitation route.
pub(crate) fn team_seat_limit(
    user_id: &str,
    access_token: Option<&str>,
) -> Result<Option<ResolvedPlanSeatLimit>, &'static str> {
    if !selection_required()? {
        return Ok(None);
    }
    let access_token = access_token.ok_or("access_token_missing")?;
    let base = pay_base_url().ok_or("pay_base_url_unconfigured")?;
    let status = selection_status(&base, user_id, access_token)?;
    let configured = status
        .team_seat_policy_configured
        .ok_or("seat_policy_unavailable")?;
    let limit = SeatLimit::from_pay(
        status
            .team_seat_limit
            .as_ref()
            .ok_or("seat_policy_unavailable")?,
    )?;
    if !configured {
        if limit.is_some() {
            return Err("seat_policy_invalid");
        }
        return Ok(None);
    }
    if !status.complete {
        return Err("subscription_inactive");
    }
    let plan_id = status.plan_id.ok_or("subscription_plan_missing")?;
    if plan_id.trim().is_empty() {
        return Err("subscription_plan_missing");
    }
    Ok(limit.map(|limit| ResolvedPlanSeatLimit { plan_id, limit }))
}

fn selection_required() -> Result<bool, &'static str> {
    let configured = settings::get(REQUIRED_KEY).map_err(|_| "seat_policy_unavailable")?;
    Ok(configured
        .as_deref()
        .is_some_and(|value| settings::parse_bool(Some(value), true)))
}

/// Where Cedros Pay is mounted on this site (`/extensions/cedros-pay`).
const SAME_SITE_PAY_PATH: &str = "/extensions/cedros-pay";

/// The configured override, else this site's own Cedros Pay mount rooted at the
/// frontend URL. Hosted sites therefore need no Pay location configured at all.
fn pay_base_url() -> Option<String> {
    settings::get(PAY_BASE_URL_KEY)
        .ok()
        .flatten()
        .map(|v| v.trim().trim_matches('"').trim_end_matches('/').to_string())
        .filter(|v| !v.is_empty())
        .or_else(same_site_pay_base_url)
}

fn same_site_pay_base_url() -> Option<String> {
    let site = super::frontend_url();
    (!site.is_empty()).then(|| format!("{site}{SAME_SITE_PAY_PATH}"))
}

/// Query same-site Pay through its host-authenticated subscription-read service.
/// Explicit external Pay bases retain the buyer-bearer HTTP contract.
/// Normalize `selection == "complete"` into the returned `complete` field.
fn selection_status(
    base: &str,
    user_id: &str,
    token: &str,
) -> Result<PaySelectionStatusResponse, &'static str> {
    // The host supplies Login's exact subscription-read principal. No visitor
    // credential leaves the site and no public HTTP loopback/egress is needed.
    if same_site_pay_base_url().as_deref() == Some(base) {
        let response = invoke(&ServiceRequest {
            target_extension_id: "cedros-pay".into(),
            capability_id: "cedros-pay:subscription-read".into(),
            route_id: "cedros-pay:subscription-selection-status".into(),
            method: "GET".into(),
            path: format!("{SAME_SITE_PAY_PATH}/{PAY_SELECTION_STATUS_PATH}"),
            query: vec![("userId".into(), user_id.into())],
            body_json: "null".into(),
        })
        .map_err(|_| "request_failed")?;
        return parse_selection_status(response.status, &response.body);
    }
    let url = format!("{base}/{PAY_SELECTION_STATUS_PATH}?userId={user_id}");
    let resp = http::fetch(&HttpRequest {
        method: "GET",
        url: &url,
        headers: vec![("authorization".to_string(), format!("Bearer {token}"))],
        body: None,
    })
    .map_err(|_| "request_failed")?;
    parse_selection_status(resp.status, &resp.body)
}

fn parse_selection_status(
    status: u16,
    response: &str,
) -> Result<PaySelectionStatusResponse, &'static str> {
    if !(200..300).contains(&status) {
        return Err("http_status");
    }
    let mut body: PaySelectionStatusResponse =
        serde_json::from_str(response).map_err(|_| "decode_error")?;
    body.complete = body.complete || body.selection.as_deref() == Some("complete");
    Ok(body)
}

#[cfg(not(test))]
fn invoke(request: &ServiceRequest) -> crate::host::Result<ServiceResponse> {
    crate::host::extension_services::invoke(request)
}

#[cfg(test)]
thread_local! {
    static TEST_SERVICE: std::cell::RefCell<Option<Box<dyn FnMut(&ServiceRequest) -> crate::host::Result<ServiceResponse>>>> = const { std::cell::RefCell::new(None) };
}

#[cfg(test)]
fn invoke(request: &ServiceRequest) -> crate::host::Result<ServiceResponse> {
    TEST_SERVICE
        .with_borrow_mut(|service| service.as_mut().expect("subscription service fixture")(request))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PaySelectionStatusResponse {
    #[serde(default)]
    complete: bool,
    #[serde(default)]
    selection: Option<String>,
    #[serde(default)]
    plan_id: Option<String>,
    #[serde(default)]
    team_seat_policy_configured: Option<bool>,
    #[serde(
        default,
        deserialize_with = "crate::domain::plan_seat_policy::deserialize_present_limit"
    )]
    team_seat_limit: Option<serde_json::Value>,
}

fn choose(redirect_url: String) -> PostLoginAction {
    PostLoginAction {
        action: "choose_subscription",
        redirect_url: Some(redirect_url),
    }
}

/// Normalize the chooser route to an app-relative path (faithful port of the
/// standalone `normalize_redirect_url`): default `/subscribe`; trim + strip
/// surrounding quotes; empty or protocol-relative (`//`) → default; ensure a
/// single leading `/`.
pub(super) fn normalize_route(value: Option<String>) -> String {
    let Some(value) = value else {
        return DEFAULT_REDIRECT_URL.to_string();
    };
    let trimmed = value.trim().trim_matches('"').trim();
    if trimmed.is_empty() || trimmed.starts_with("//") {
        return DEFAULT_REDIRECT_URL.to_string();
    }
    if trimmed.starts_with('/') {
        trimmed.to_string()
    } else {
        format!("/{trimmed}")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn with_service<T>(
        service: impl FnMut(&ServiceRequest) -> crate::host::Result<ServiceResponse> + 'static,
        run: impl FnOnce() -> T,
    ) -> T {
        struct Reset;
        impl Drop for Reset {
            fn drop(&mut self) {
                TEST_SERVICE.with_borrow_mut(|slot| *slot = None);
            }
        }
        TEST_SERVICE.with_borrow_mut(|slot| {
            assert!(slot.is_none());
            *slot = Some(Box::new(service));
        });
        let _reset = Reset;
        crate::host::key_value_test_support::with_values(
            |seam, key| {
                assert_eq!(seam, "settings");
                Ok(match key {
                    REQUIRED_KEY => Some("true".into()),
                    ROUTE_KEY => Some("/pricing".into()),
                    "server_frontend_url" => Some("https://site.example".into()),
                    _ => None,
                })
            },
            run,
        )
    }

    #[test]
    fn active_paid_and_fully_discounted_subscriptions_skip_the_chooser() {
        for body in [
            r#"{"complete":true,"planId":"developer","priceCents":2900}"#,
            r#"{"complete":true,"planId":"developer","priceCents":0}"#,
            r#"{"selection":"complete","planId":"developer"}"#,
        ] {
            with_service(
                move |request| {
                    assert_eq!(request.target_extension_id, "cedros-pay");
                    assert_eq!(request.capability_id, "cedros-pay:subscription-read");
                    assert_eq!(request.route_id, "cedros-pay:subscription-selection-status");
                    assert_eq!(request.method, "GET");
                    assert_eq!(
                        request.path,
                        "/extensions/cedros-pay/paywall/v1/subscription/selection-status"
                    );
                    assert_eq!(request.query, [("userId".into(), "user-1".into())]);
                    assert_eq!(request.body_json, "null");
                    Ok(ServiceResponse {
                        status: 200,
                        headers: vec![],
                        body: body.into(),
                    })
                },
                || assert!(post_login_action("user-1", "token-never-forwarded").is_none()),
            );
        }
    }

    #[test]
    fn incomplete_subscriptions_preserve_the_chooser() {
        with_service(
            |_| {
                Ok(ServiceResponse {
                    status: 200,
                    headers: vec![],
                    body: r#"{"complete":false}"#.into(),
                })
            },
            || {
                let action = post_login_action("user-1", "token").unwrap();
                assert_eq!(action.action, "choose_subscription");
                assert_eq!(action.redirect_url.as_deref(), Some("/pricing"));
            },
        );
    }

    #[test]
    fn unavailable_or_malformed_pay_status_is_an_error() {
        for (status, body, expected) in
            [(503, "{}", "http_status"), (200, "invalid", "decode_error")]
        {
            with_service(
                move |_| {
                    Ok(ServiceResponse {
                        status,
                        headers: vec![],
                        body: body.into(),
                    })
                },
                || {
                    assert_eq!(
                        selection_status(
                            "https://site.example/extensions/cedros-pay",
                            "user-1",
                            "token"
                        )
                        .err(),
                        Some(expected)
                    )
                },
            );
        }
        with_service(
            |_| {
                Err(crate::host::SeamError::ExtensionService(
                    "Pay unavailable".into(),
                ))
            },
            || {
                assert_eq!(
                    selection_status(
                        "https://site.example/extensions/cedros-pay",
                        "user-1",
                        "token"
                    )
                    .err(),
                    Some("request_failed")
                )
            },
        );
    }

    #[test]
    fn plan_limited_invitations_use_the_same_authenticated_subscription_read() {
        for (body, expected) in [
            (
                r#"{"complete":true,"planId":"developer","teamSeatPolicyConfigured":true,"teamSeatLimit":5}"#,
                Ok(Some(ResolvedPlanSeatLimit {
                    plan_id: "developer".into(),
                    limit: SeatLimit::Limited(5),
                })),
            ),
            (
                r#"{"complete":false,"teamSeatPolicyConfigured":true,"teamSeatLimit":null}"#,
                Err("subscription_inactive"),
            ),
            (
                r#"{"complete":true,"planId":"developer"}"#,
                Err("seat_policy_unavailable"),
            ),
            (
                r#"{"complete":true,"planId":"developer","teamSeatPolicyConfigured":true}"#,
                Err("seat_policy_unavailable"),
            ),
            (
                r#"{"complete":true,"planId":"developer","teamSeatPolicyConfigured":true,"teamSeatLimit":0}"#,
                Err("seat_policy_invalid"),
            ),
            (
                r#"{"complete":false,"teamSeatPolicyConfigured":false,"teamSeatLimit":null}"#,
                Ok(None),
            ),
            (
                r#"{"complete":true,"planId":"other","teamSeatPolicyConfigured":true,"teamSeatLimit":null}"#,
                Ok(None),
            ),
            (
                r#"{"complete":true,"planId":"business","teamSeatPolicyConfigured":true,"teamSeatLimit":"unlimited"}"#,
                Ok(Some(ResolvedPlanSeatLimit {
                    plan_id: "business".into(),
                    limit: SeatLimit::Unlimited,
                })),
            ),
        ] {
            with_service(
                move |_| {
                    Ok(ServiceResponse {
                        status: 200,
                        headers: vec![],
                        body: body.into(),
                    })
                },
                || assert_eq!(team_seat_limit("user-1", Some("token")), expected),
            );
        }
        with_service(
            |_| panic!("missing credentials must not invoke Pay"),
            || assert_eq!(team_seat_limit("user-1", None), Err("access_token_missing")),
        );
    }

    #[test]
    fn settings_outage_preserves_subscription_and_seat_gates() {
        crate::host::key_value_test_support::with_values(
            |seam, key| {
                assert_eq!((seam, key), ("settings", REQUIRED_KEY));
                Err(crate::host::SeamError::Settings("unavailable".into()))
            },
            || {
                let action = post_login_action("user-1", "token").unwrap();
                assert_eq!(action.action, "choose_subscription");
                assert_eq!(
                    team_seat_limit("user-1", Some("token")),
                    Err("seat_policy_unavailable")
                );
            },
        );
    }

    #[test]
    fn absent_optional_subscription_setting_keeps_login_independent_of_pay() {
        crate::host::key_value_test_support::with_values(
            |seam, key| {
                assert_eq!((seam, key), ("settings", REQUIRED_KEY));
                Ok(None)
            },
            || {
                assert!(post_login_action("user-1", "token").is_none());
                assert_eq!(team_seat_limit("user-1", None), Ok(None));
            },
        );
    }

    #[test]
    fn pay_location_defaults_to_this_sites_extension_mount() {
        crate::host::key_value_test_support::with_values(
            |seam, key| {
                assert_eq!(seam, "settings");
                Ok(match key {
                    "server_frontend_url" => Some("https://site.example/".to_string()),
                    _ => None,
                })
            },
            || {
                assert_eq!(
                    pay_base_url().as_deref(),
                    Some("https://site.example/extensions/cedros-pay")
                );
            },
        );
    }

    #[test]
    fn configured_pay_location_overrides_the_same_site_default() {
        crate::host::key_value_test_support::with_values(
            |seam, key| {
                assert_eq!(seam, "settings");
                Ok(match key {
                    PAY_BASE_URL_KEY => Some("\"https://pay.example/\"".to_string()),
                    "server_frontend_url" => Some("https://site.example".to_string()),
                    _ => None,
                })
            },
            || assert_eq!(pay_base_url().as_deref(), Some("https://pay.example")),
        );
    }

    #[test]
    fn route_normalization_matches_standalone() {
        assert_eq!(normalize_route(None), "/subscribe");
        assert_eq!(normalize_route(Some("".into())), "/subscribe");
        assert_eq!(normalize_route(Some("  ".into())), "/subscribe");
        assert_eq!(normalize_route(Some("//evil.example".into())), "/subscribe");
        assert_eq!(normalize_route(Some("subscribe".into())), "/subscribe");
        assert_eq!(normalize_route(Some("/plans".into())), "/plans");
        assert_eq!(normalize_route(Some("\"/plans\"".into())), "/plans");
    }

    #[test]
    fn pay_status_parsing() {
        let complete: PaySelectionStatusResponse =
            serde_json::from_str(r#"{"complete":true,"planId":"business"}"#).unwrap();
        assert!(complete.complete);
        assert_eq!(complete.plan_id.as_deref(), Some("business"));
        let by_selection: PaySelectionStatusResponse =
            serde_json::from_str(r#"{"complete":false,"selection":"complete"}"#).unwrap();
        assert!(!by_selection.complete && by_selection.selection.as_deref() == Some("complete"));
        let incomplete: PaySelectionStatusResponse =
            serde_json::from_str(r#"{"complete":false}"#).unwrap();
        assert!(!incomplete.complete && incomplete.selection.is_none());
    }
}
