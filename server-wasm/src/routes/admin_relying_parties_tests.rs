use super::*;

const TOKEN: &str = "portal-service-token-at-least-32-bytes";
const POLICY: &str =
    r#"{"scopes":["session:introspect"],"audiences":["cedros-customer"],"orgIds":["org-1"]}"#;

fn requirement<'a>() -> VerificationRequirement<'a> {
    VerificationRequirement {
        scope: "session:introspect",
        audience: "cedros-customer",
        organization_id: "org-1",
    }
}

#[test]
fn verification_diagnostics_distinguish_every_fail_closed_state() {
    let required = requirement();
    assert_eq!(
        diagnose("unknown", None, None, TOKEN, &required),
        VerificationDiagnostic::CallerUnknown
    );
    assert_eq!(
        diagnose("cedros-portal", None, None, TOKEN, &required),
        VerificationDiagnostic::TokenAbsent
    );
    assert_eq!(
        diagnose(
            "cedros-portal",
            Some(TOKEN),
            Some(POLICY),
            "wrong-token",
            &required,
        ),
        VerificationDiagnostic::TokenMismatch
    );
    assert_eq!(
        diagnose("cedros-portal", Some(TOKEN), None, TOKEN, &required),
        VerificationDiagnostic::PolicyAbsent
    );
    assert_eq!(
        diagnose(
            "cedros-portal",
            Some(TOKEN),
            Some("not-json"),
            TOKEN,
            &required,
        ),
        VerificationDiagnostic::PolicyMalformed
    );
    assert_eq!(
        diagnose(
            "cedros-portal",
            Some(TOKEN),
            Some(r#"{"scopes":[],"audiences":["cedros-customer"],"orgIds":["org-1"]}"#),
            TOKEN,
            &required,
        ),
        VerificationDiagnostic::ScopeMissing
    );
    assert_eq!(
        diagnose(
            "cedros-portal",
            Some(TOKEN),
            Some(r#"{"scopes":["session:introspect"],"audiences":["other"],"orgIds":["org-1"]}"#),
            TOKEN,
            &required,
        ),
        VerificationDiagnostic::AudiencePolicyMismatch
    );
    assert_eq!(
        diagnose(
            "cedros-portal",
            Some(TOKEN),
            Some(
                r#"{"scopes":["session:introspect"],"audiences":["cedros-customer"],"orgIds":["org-2"]}"#
            ),
            TOKEN,
            &required,
        ),
        VerificationDiagnostic::OrganizationPolicyMismatch
    );
    assert_eq!(
        diagnose("cedros-portal", Some(TOKEN), Some(POLICY), TOKEN, &required,),
        VerificationDiagnostic::Ready
    );
}

#[test]
fn another_callers_token_does_not_authenticate() {
    let required = requirement();
    let pay_token = "pay-service-token-that-is-also-at-least-32-bytes";
    assert_eq!(
        diagnose(
            "cedros-pay",
            Some(pay_token),
            Some(POLICY),
            TOKEN,
            &required,
        ),
        VerificationDiagnostic::TokenMismatch
    );
}

#[test]
fn response_types_never_serialize_secret_fields() {
    let status = RelyingPartyStatus {
        relying_party_id: "cedros-portal".into(),
        display_name: "Cedros Portal".into(),
        token_configured: true,
        policy_configured: true,
        ready: true,
        policy_summary: Some(PolicySummary {
            allowed_scopes: vec!["session:introspect".into()],
            allowed_session_audiences: vec!["cedros-customer".into()],
            allowed_organization_ids: vec!["org-1".into()],
        }),
        validation_errors: vec![],
    };
    let encoded = serde_json::to_string(&status).unwrap();
    assert!(!encoded.contains(TOKEN));
    assert!(!encoded.contains("token\""));
    assert!(!encoded.contains("policySecret"));
    assert!(encoded.contains("tokenConfigured"));
    assert!(encoded.contains("policySummary"));

    let verified = serde_json::to_value(VerificationResponse {
        relying_party_id: "cedros-portal".into(),
        diagnostic: VerificationDiagnostic::Ready,
        ready: true,
        introspection: Some(InactiveSession { active: false }),
        identity_profile: None,
        membership: None,
    })
    .unwrap();
    assert_eq!(verified["introspection"]["active"], false);
}

#[test]
fn configuration_requires_complete_session_policy_and_strong_tokens() {
    assert!(validate_token(TOKEN).is_ok());
    assert!(validate_token("too-short").is_err());
    assert!(validate_complete_policy(
        "cedros-portal",
        &RelyingPartyPolicy {
            token_sha256: None,
            scopes: vec!["session:introspect".into()],
            audiences: vec!["cedros-customer".into()],
            org_ids: vec!["org-1".into()],
        }
    )
    .is_ok());
    assert!(validate_complete_policy(
        "cedros-portal",
        &RelyingPartyPolicy {
            token_sha256: None,
            scopes: vec!["users:read".into()],
            audiences: vec!["cedros-customer".into()],
            org_ids: vec!["org-1".into()],
        }
    )
    .is_err());
    assert!(validate_complete_policy(
        "cedros-casino",
        &RelyingPartyPolicy {
            token_sha256: None,
            scopes: vec![super::super::relying_party::SCOPE_IDENTITY_PROFILE_READ.into()],
            audiences: vec!["cedros".into()],
            org_ids: vec!["org-1".into()],
        }
    )
    .is_ok());
    assert_eq!(
        supported_display_name("cedros-casino"),
        Some("Cedros Casino")
    );
}

#[test]
fn admin_routes_fail_closed_before_touching_secrets() {
    let request = RouteRequest {
        route_id: String::new(),
        method: "GET".into(),
        path: "/admin/relying-parties".into(),
        headers: vec![],
        query: vec![],
        body: String::new(),
        context_json: "{}".into(),
    };
    let response = list(&request);
    assert_eq!(response.status, 401);
    assert!(response.body.contains("unauthenticated"));
}

#[test]
fn data_verification_probes_membership_without_introspection_or_customer_reads() {
    use crate::host::{db, key_value_test_support};
    let policy = r#"{"scopes":["memberships:read"],"audiences":["cedros"],"orgIds":["*"]}"#;
    key_value_test_support::with_values(
        move |seam, key| {
            assert_eq!(seam, "secrets");
            Ok(Some(match key {
                "rp_token:cedros-data" => TOKEN.into(),
                "rp_policy:cedros-data" => policy.into(),
                other => panic!("unexpected secret read: {other}"),
            }))
        },
        || {
            db::test_support::with_db(
                |_, _, _| panic!("readiness must not read customer records"),
                || {
                    let request = RouteRequest {
                    route_id: String::new(), method: "POST".into(),
                    path: "/admin/relying-parties/cedros-data/verify".into(),
                    headers: vec![], query: vec![],
                    body: serde_json::json!({"token":TOKEN,"sessionAudience":"cedros","organizationId":"new-org"}).to_string(),
                    context_json: r#"{"actorId":"admin","authenticated":true,"systemAdmin":true,"csrfVerified":true}"#.into(),
                };
                    let response = verify(&request);
                    assert_eq!(response.status, 200, "{}", response.body);
                    let body: serde_json::Value = serde_json::from_str(&response.body).unwrap();
                    assert_eq!(body["diagnostic"], "ready");
                    assert_eq!(body["membership"]["status"], 404);
                    assert!(body.get("introspection").is_none());
                    assert!(!response.body.contains(TOKEN));
                },
            )
        },
    );
}

#[test]
fn data_diagnostic_does_not_apply_membership_wildcard_to_profile_scope() {
    let policy = r#"{"scopes":["memberships:read","identity-profile:read"],"audiences":["cedros"],"orgIds":["*"]}"#;
    for (scope, expected) in [
        ("memberships:read", VerificationDiagnostic::Ready),
        (
            "identity-profile:read",
            VerificationDiagnostic::OrganizationPolicyMismatch,
        ),
    ] {
        assert_eq!(
            diagnose(
                "cedros-data",
                Some(TOKEN),
                Some(policy),
                TOKEN,
                &VerificationRequirement {
                    scope,
                    audience: "cedros",
                    organization_id: "new-org",
                }
            ),
            expected
        );
    }
}

#[test]
fn partial_rotation_is_not_reported_ready() {
    let mut policy: RelyingPartyPolicy = serde_json::from_str(POLICY).unwrap();
    policy.token_sha256 = Some(RelyingPartyPolicy::token_digest("replacement-token"));
    let policy = serde_json::to_string(&policy).unwrap();
    assert_eq!(
        diagnose(
            "cedros-portal",
            Some(TOKEN),
            Some(&policy),
            TOKEN,
            &requirement()
        ),
        VerificationDiagnostic::PolicyMalformed
    );
}
