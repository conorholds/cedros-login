use super::*;

#[test]
fn validates_relying_party_ids_and_paths() {
    assert!(validate_relying_party_id("cedros-compliance").is_ok());
    assert!(validate_relying_party_id("cedros:crm_1").is_ok());
    assert!(validate_relying_party_id("../bad").is_err());
    assert_eq!(user_id_from_path("/v1/users/user-1").unwrap(), "user-1");
    assert!(user_id_from_path("/v1/users/a/b").is_err());
    assert_eq!(
        membership_authority_scope("/v1/organizations/org-1/members/user-1").unwrap(),
        ("org-1".to_string(), "user-1".to_string())
    );
    assert!(membership_authority_scope("/v1/organizations/org-1/members").is_err());
    assert_eq!(
        identity_profile_user_id_from_path("/v1/identity/users/user-1/profile").unwrap(),
        "user-1"
    );
    assert!(identity_profile_user_id_from_path("/v1/identity/users/a/b/profile").is_err());
}

#[test]
fn token_compare_requires_equal_bytes() {
    assert!(constant_time_eq(b"same", b"same"));
    assert!(!constant_time_eq(b"same", b"diff"));
    assert!(!constant_time_eq(b"same", b"same-but-longer"));
}

#[test]
fn caller_contract_rejects_conflicting_header_and_body_ids_before_secret_lookup() {
    let request = RouteRequest {
        route_id: "cedros-login:relying-party-session-introspect".into(),
        method: "POST".into(),
        path: "/v1/session/introspect".into(),
        headers: vec![("x-cedros-relying-party".into(), "cedros-pay".into())],
        query: vec![],
        body: String::new(),
        context_json: String::new(),
    };
    let error = authorize_relying_party(&request, Some("cedros-portal"))
        .err()
        .expect("conflicting ids must fail");
    assert!(matches!(
        error,
        RouteError::Status(400, "conflicting_relying_party")
    ));
}

#[test]
fn directory_response_uses_canonical_shape_without_pii() {
    let mut dto = DirectoryUserResponse {
        user_id: "user-1".into(),
        id: "user-1".into(),
        status: "active".into(),
        email: None,
        created_at: "2026-05-31T00:00:00.000Z".into(),
    };
    let value = serde_json::to_value(&dto).unwrap();
    assert_eq!(value["userId"], "user-1");
    assert_eq!(value["status"], "active");
    assert!(value.get("email").is_none());
    for private_field in [
        "emailVerified",
        "authMethods",
        "isSystemAdmin",
        "updatedAt",
        "lastLoginAt",
        "profile",
    ] {
        assert!(value.get(private_field).is_none(), "leaked {private_field}");
    }
    dto.email = Some("pending@example.com".into());
    let scoped = serde_json::to_value(dto).unwrap();
    assert_eq!(scoped["email"], "pending@example.com");
}

#[test]
fn membership_authority_shape_is_explicit_and_versioned() {
    let dto = MembershipAuthorityResponse {
        schema_version: 1,
        user_id: "user-1".into(),
        organization_id: "org-1".into(),
        role: "admin".into(),
        user_status: "active".into(),
        email: Some("admin@example.com".into()),
        email_verified: true,
    };
    let value = serde_json::to_value(dto).unwrap();
    assert_eq!(value["schemaVersion"], 1);
    assert_eq!(value["organizationId"], "org-1");
    assert_eq!(value["role"], "admin");
    assert_eq!(value["emailVerified"], true);
}

#[test]
fn directory_status_reflects_current_suspension_state() {
    let mut user: users::UserEntry = serde_json::from_value(serde_json::json!({
        "id":"user-1", "email":null, "emailVerified":true, "passwordHash":null,
        "name":null, "username":null, "picture":null, "walletAddress":null,
        "googleId":null, "appleId":null, "authMethods":[], "suspendedAt":null,
        "isSystemAdmin":false, "createdAt":"t", "updatedAt":"t",
        "lastLoginAt":null, "welcomeCompletedAt":null, "avatarContentType":null
    }))
    .unwrap();

    assert_eq!(directory_status(&user), "active");
    assert_eq!(directory_user(&user, false).status, "active");
    user.suspended_at = Some("2026-09-15T00:00:00Z".into());
    assert_eq!(directory_status(&user), "suspended");
    assert_eq!(directory_user(&user, false).status, "suspended");
}

#[test]
fn introspection_maps_identity_denials_to_inactive_but_preserves_host_failures() {
    assert!(is_inactive_identity_error(&RouteError::Status(
        401,
        "invalid_session"
    )));
    assert!(is_inactive_identity_error(&RouteError::Status(
        403,
        "account_suspended"
    )));
    assert!(!is_inactive_identity_error(&RouteError::Seam(
        crate::host::SeamError::Db("unavailable".into())
    )));
}

#[test]
fn introspection_shapes_are_canonical() {
    let active = IntrospectionResponse {
        active: true,
        user_id: Some("user-1".into()),
        session_id: Some("sess-1".into()),
        expires_at: crate::clock::from_unix(1_609_459_200),
        claims: Some(IntrospectionClaims {
            iss: "https://idp.example".into(),
            sub: "user-1".into(),
            aud: "rp".into(),
            exp: 1_609_459_200,
            iat: 1_609_455_600,
            sid: "sess-1".into(),
            email_verified: Some(true),
        }),
    };
    let value = serde_json::to_value(active).unwrap();
    assert_eq!(value["expiresAt"], "2021-01-01T00:00:00Z");
    let inactive = serde_json::to_value(super::inactive()).unwrap();
    assert_eq!(inactive["active"], false);
    assert!(inactive.get("userId").is_none());
}

#[test]
fn policy_requires_and_enforces_all_allowlists() {
    let empty = RelyingPartyPolicy {
        token_sha256: None,
        scopes: vec![],
        audiences: vec!["cedros".into()],
        org_ids: vec!["org-1".into()],
    };
    assert!(empty.validate().is_err());
    let principal = RelyingPartyPrincipal {
        relying_party_id: "cedros-casino".into(),
        policy: RelyingPartyPolicy {
            token_sha256: None,
            scopes: vec!["users:read".into(), SCOPE_IDENTITY_PROFILE_READ.into()],
            audiences: vec!["cedros".into()],
            org_ids: vec!["org-1".into()],
        },
    };
    assert!(principal.require_scope("users:read").is_ok());
    assert!(principal.require_scope(SCOPE_IDENTITY_PROFILE_READ).is_ok());
    assert!(principal.require_scope("users:email:read").is_err());
    assert!(principal.require_scope("users:count").is_err());
    assert!(principal.require_org("org-1", SCOPE_USERS_READ).is_ok());
    assert!(principal.require_org("org-2", SCOPE_USERS_READ).is_err());
    assert!(principal.allows_audience("cedros"));
    assert!(!principal.allows_org(None));
}

#[test]
fn explicit_wildcard_policy_authorizes_dynamic_customer_organizations() {
    let principal = RelyingPartyPrincipal {
        relying_party_id: "cedros-data".into(),
        policy: RelyingPartyPolicy {
            token_sha256: None,
            scopes: vec![SCOPE_MEMBERSHIPS_READ.into()],
            audiences: vec!["cedros".into()],
            org_ids: vec!["*".into()],
        },
    };
    assert!(principal
        .require_org("customer-org", SCOPE_MEMBERSHIPS_READ)
        .is_ok());
    assert!(!principal.allows_org(Some("customer-org")));
}

#[test]
fn ordinary_directory_scope_does_not_grant_privileged_profile_access() {
    let principal = RelyingPartyPrincipal {
        relying_party_id: "cedros-casino".into(),
        policy: RelyingPartyPolicy {
            token_sha256: None,
            scopes: vec!["users:read".into()],
            audiences: vec!["cedros".into()],
            org_ids: vec!["org-1".into()],
        },
    };
    assert!(matches!(
        principal.require_scope(SCOPE_IDENTITY_PROFILE_READ),
        Err(RouteError::Status(403, "insufficient_scope"))
    ));
    assert!(matches!(
        principal.require_org("org-2", SCOPE_USERS_READ),
        Err(RouteError::Status(403, "unauthorized_org"))
    ));
}

const SERVICE_TOKEN: &str = "fixture-service-token-at-least-32-bytes";

fn service_request(path: &str) -> RouteRequest {
    RouteRequest {
        route_id: String::new(),
        method: "GET".into(),
        path: path.into(),
        headers: vec![
            ("authorization".into(), format!("Bearer {SERVICE_TOKEN}")),
            (RP_HEADER.into(), "cedros-data".into()),
        ],
        query: vec![("orgId".into(), "customer-org".into())],
        body: String::new(),
        context_json: "{}".into(),
    }
}

#[test]
fn membership_wildcard_cannot_widen_other_route_scopes() {
    use crate::host::{db, key_value_test_support};
    key_value_test_support::with_values(
        |seam, key| {
            assert_eq!(seam, "secrets");
            Ok(Some(match key {
                "rp_token:cedros-data" => SERVICE_TOKEN.into(),
                "rp_policy:cedros-data" => serde_json::json!({
                    "scopes":["memberships:read", "users:read", "users:count", "identity-profile:read"],
                    "audiences":["cedros"], "orgIds":["*"]
                }).to_string(),
                other => panic!("unexpected secret: {other}"),
            }))
        },
        || {
            db::test_support::with_db(
                |_, _, _| panic!("denied tenant access must not read private state"),
                || {
                    for response in [
                        get_user(&service_request("/v1/users/user-1")),
                        count_users(&service_request("/v1/users/count")),
                        get_identity_profile(&service_request("/v1/identity/users/user-1/profile")),
                    ] {
                        assert_eq!(response.status, 403);
                        assert_eq!(response.body, r#"{"error":"unauthorized_org"}"#);
                        assert!(response.headers.iter().any(
                            |(key, value)| key == "cache-control" && value.contains("no-store")
                        ));
                    }
                },
            )
        },
    );
}

#[test]
fn membership_wildcard_is_exclusive_to_data_and_membership_scope() {
    let mut principal = RelyingPartyPrincipal {
        relying_party_id: "cedros-data".into(),
        policy: RelyingPartyPolicy {
            token_sha256: None,
            scopes: vec![SCOPE_MEMBERSHIPS_READ.into(), SCOPE_USERS_READ.into()],
            audiences: vec!["cedros".into()],
            org_ids: vec!["*".into(), "explicit-org".into()],
        },
    };
    assert!(principal
        .require_org("new-org", SCOPE_MEMBERSHIPS_READ)
        .is_ok());
    assert!(principal.require_org("new-org", SCOPE_USERS_READ).is_err());
    assert!(principal
        .require_org("explicit-org", SCOPE_USERS_READ)
        .is_ok());
    principal.relying_party_id = "cedros-pay".into();
    assert!(principal
        .require_org("new-org", SCOPE_MEMBERSHIPS_READ)
        .is_err());
    assert!(principal
        .require_org("explicit-org", SCOPE_MEMBERSHIPS_READ)
        .is_ok());
}

#[test]
fn introspection_observes_current_email_policy_and_session_state() {
    use crate::host::{db, key_value_test_support};
    use crate::services::jwt::{generate_private_key_pem, JwtService, TokenContext};
    use serde_json::json;

    let pem = generate_private_key_pem().unwrap();
    let jwt = JwtService::from_pem(&pem, "cedros-login".into(), "cedros".into(), 900).unwrap();
    for (verified, claim_verified, required, revoked, active) in [
        (true, true, true, false, true),
        (false, true, false, false, false), // stale verified claim, even with gate off
        (false, false, true, false, false), // current policy requires verification
        (false, false, false, false, true),
        (true, true, true, true, false),
    ] {
        let token = jwt
            .generate_access_token(
                "user-1",
                "session-1",
                &TokenContext {
                    org_id: Some("customer-org".into()),
                    role: Some("member".into()),
                    email_verified: Some(claim_verified),
                    ..TokenContext::default()
                },
            )
            .unwrap();
        let pem = pem.clone();
        let settings_unavailable = std::rc::Rc::new(std::cell::Cell::new(false));
        let unavailable_setting = settings_unavailable.clone();
        key_value_test_support::with_values(
            move |seam, key| {
                if (seam, key) == ("settings", "subscription_selection_required")
                    && unavailable_setting.get()
                {
                    return Err(crate::host::SeamError::Settings("unavailable".into()));
                }
                Ok(match (seam, key) {
                ("secrets", "rp_token:cedros-data") => Some(SERVICE_TOKEN.into()),
                ("secrets", "rp_policy:cedros-data") => Some(json!({
                    "scopes":["session:introspect"], "audiences":["cedros"], "orgIds":["customer-org"]
                }).to_string()),
                ("secrets", "jwt-rsa-private-key:version:fixture") => Some(pem.clone()),
                ("settings", "auth_email_require_verification") => Some(required.to_string()),
                ("settings", "jwt_access_ttl_secs") => None,
                ("settings", "subscription_selection_required") => Some("false".into()),
                ("settings", key) if key.starts_with("cookie_") => None,
                other => panic!("unexpected host read: {other:?}"),
            })
            },
            || {
                db::test_support::with_db(
                    move |op, collection, _| {
                        assert_eq!(op, "read");
                        let payload = match collection.model {
                            "cedros-login:identity-records" => {
                                return Ok(json!({"entries":[{
                                    "entry_key":"secret:jwt-rsa-private-key", "payload":{"secretKey":"jwt-rsa-private-key:version:fixture"},
                                    "updated_at":"now", "version":"1"
                                }]}))
                            }
                            "cedros-login:sessions" => json!({
                                "id":"session-1", "userId":"user-1", "refreshTokenHash":"hash",
                                "createdAt":"2026-01-01T00:00:00Z", "expiresAt":"9999-01-01T00:00:00Z",
                                "revokedAt": if revoked { Some("2026-01-02T00:00:00Z") } else { None }
                            }),
                            "cedros-login:user-emails" => return Ok(json!({"entries":[]})),
                            "cedros-login:users" => json!({
                                "id":"user-1", "email":"fixture@example.test", "emailVerified":verified,
                                "isSystemAdmin":false, "createdAt":"now", "updatedAt":"now"
                            }),
                            "cedros-login:orgs" => json!({
                                "id":"customer-org", "name":"Fixture", "slug":"fixture", "isPersonal":false,
                                "ownerId":"user-1", "createdAt":"now", "updatedAt":"now"
                            }),
                            "cedros-login:memberships" => json!({
                                "id":"member-1", "userId":"user-1", "orgId":"customer-org", "role":"member", "joinedAt":"now"
                            }),
                            other => panic!("unexpected collection: {other}"),
                        };
                        Ok(json!({"entries":[{"entry_key":"fixture", "payload":payload}]}))
                    },
                    || {
                        let mut request = service_request("/v1/session/introspect");
                        request.method = "POST".into();
                        request.body = json!({"token":token}).to_string();
                        let response = introspect_session(&request);
                        assert_eq!(response.status, 200, "{}", response.body);
                        let body: serde_json::Value = serde_json::from_str(&response.body).unwrap();
                        assert_eq!(body["active"], active);
                        if !active {
                            assert_eq!(body, json!({"active":false}));
                        }
                        assert!(response.headers.iter().any(
                            |(key, value)| key == "cache-control" && value.contains("no-store")
                        ));
                        // The host/admin envelope and caller-supplied subject
                        // never replace the end-user identity on /user.
                        request.path = "/user".into();
                        request.method = "GET".into();
                        request.headers[0].1 = format!("Bearer {token}");
                        request.context_json =
                            r#"{"authenticated":true,"systemAdmin":true,"actorId":"other-user"}"#
                                .into();
                        request.query = vec![("userId".into(), "other-user".into())];
                        let current = super::super::profile::get_user(&request);
                        let body: serde_json::Value = serde_json::from_str(&current.body).unwrap();
                        if active {
                            assert_eq!(current.status, 200);
                            assert_eq!(body["user"]["id"], "user-1");
                            assert!(body.get("signupResume").is_none());
                        } else {
                            assert!(matches!(current.status, 401 | 403));
                            assert!(body.get("user").is_none());
                        }
                        assert!(current.headers.iter().any(
                            |(key, value)| key == "cache-control" && value.contains("no-store")
                        ));
                        // Explicit recovery authenticates the HttpOnly cookie,
                        // ignores the caller's userId, and fails closed if gate
                        // settings are unavailable. Ordinary /user is unchanged.
                        request.headers[0] = ("cookie".into(), format!("cedros_access={token}"));
                        request.query.push(("resumeSignup".into(), "true".into()));
                        for unavailable in [false, true] {
                            settings_unavailable.set(unavailable);
                            let resumed = super::super::profile::get_user(&request);
                            let body: serde_json::Value =
                                serde_json::from_str(&resumed.body).unwrap();
                            if active {
                                assert_eq!(resumed.status, 200, "{}", resumed.body);
                                assert_eq!(body["user"]["id"], "user-1");
                                if unavailable {
                                    assert_eq!(
                                        body["signupResume"]["postLogin"],
                                        json!({
                                            "action":"choose_subscription", "redirectUrl":"/subscribe"
                                        })
                                    );
                                } else {
                                    assert_eq!(body["signupResume"], json!({"postLogin":null}));
                                }
                                assert!(!resumed.body.contains(&token));
                            } else {
                                assert!(matches!(resumed.status, 401 | 403));
                                assert!(body.get("signupResume").is_none());
                            }
                        }
                    },
                )
            },
        );
    }
}

#[test]
fn empty_stored_service_token_never_authenticates_an_empty_bearer() {
    crate::host::key_value_test_support::with_values(
        |seam, key| {
            assert_eq!((seam, key), ("secrets", "rp_token:cedros-data"));
            Ok(Some(String::new()))
        },
        || {
            let mut request = service_request("/v1/users/user-1");
            request.headers[0].1 = "Bearer ".into();
            let response = get_user(&request);
            assert_eq!(response.status, 401);
            assert_eq!(response.body, r#"{"error":"unauthorized"}"#);
        },
    );
}

#[test]
fn partial_token_rotation_cannot_grant_old_token_the_new_policy() {
    use crate::host::key_value_test_support;
    let replacement = "replacement-service-token-at-least-32-bytes";
    for (bound, stored, supplied, expected_status) in [
        (false, SERVICE_TOKEN, SERVICE_TOKEN, 404), // legacy policy still works
        (true, SERVICE_TOKEN, SERVICE_TOKEN, 403),  // policy committed, token failed
        (true, replacement, SERVICE_TOKEN, 401),    // old token after rotation
        (true, replacement, replacement, 404),      // complete pair passes authorization
    ] {
        key_value_test_support::with_values(
            move |seam, key| {
                assert_eq!(seam, "secrets");
                Ok(Some(match key {
                    "rp_token:cedros-data" => stored.into(),
                    "rp_policy:cedros-data" => serde_json::to_string(&RelyingPartyPolicy {
                        token_sha256: bound.then(|| RelyingPartyPolicy::token_digest(replacement)),
                        scopes: vec![SCOPE_USERS_READ.into()],
                        audiences: vec!["cedros".into()],
                        org_ids: vec!["customer-org".into()],
                    })
                    .unwrap(),
                    other => panic!("unexpected secret read: {other}"),
                }))
            },
            || {
                // A malformed resource path stops after real authorization;
                // successful authorization must never require customer data.
                let mut request = service_request("/v1/users/__probe__/nested");
                request.headers[0].1 = format!("Bearer {supplied}");
                assert_eq!(get_user(&request).status, expected_status);
            },
        );
    }
}

#[test]
fn membership_authority_requires_live_org_membership_and_recognized_role() {
    use crate::host::{db, key_value_test_support};
    use serde_json::json;
    for (org_exists, member_exists, role, status) in [
        (true, true, "admin", 200),
        (false, true, "owner", 404),
        (true, false, "owner", 404),
        (true, true, "system-admin", 403),
    ] {
        key_value_test_support::with_values(
            |seam, key| {
                assert_eq!(seam, "secrets");
                Ok(Some(match key {
                "rp_token:cedros-data" => SERVICE_TOKEN.into(),
                "rp_policy:cedros-data" => json!({"scopes":["memberships:read"],"audiences":["cedros"],"orgIds":["customer-org"]}).to_string(),
                _ => panic!("unexpected secret"),
            }))
            },
            || {
                db::test_support::with_db(
                    move |op, collection, _| {
                        assert_eq!(op, "read");
                        let payload = match collection.model {
                            "cedros-login:orgs" if org_exists => {
                                json!({"id":"customer-org","name":"Org","slug":"org","isPersonal":false,"ownerId":"owner","createdAt":"now","updatedAt":"now"})
                            }
                            "cedros-login:memberships" if member_exists => {
                                json!({"id":"membership","userId":"user-1","orgId":"customer-org","role":role,"joinedAt":"now"})
                            }
                            "cedros-login:orgs" | "cedros-login:memberships" => {
                                return Ok(json!({"entries":[]}))
                            }
                            "cedros-login:users" => {
                                json!({"id":"user-1","emailVerified":true,"isSystemAdmin":false,"createdAt":"now","updatedAt":"now"})
                            }
                            _ => panic!("unexpected collection"),
                        };
                        Ok(json!({"entries":[{"entry_key":"fixture","payload":payload}]}))
                    },
                    || {
                        let response = get_membership_authority(&service_request(
                            "/v1/organizations/customer-org/members/user-1",
                        ));
                        assert_eq!(response.status, status, "{}", response.body);
                    },
                )
            },
        );
    }
}
