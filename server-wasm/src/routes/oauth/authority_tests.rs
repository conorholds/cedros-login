use super::*;
use crate::host::{db, key_value_test_support, SeamError};
use serde_json::{json as value, Value};
use std::{cell::RefCell, collections::HashMap, rc::Rc};

struct Fixture {
    rows: HashMap<&'static str, Value>,
    config: Option<Value>,
    unavailable: bool,
}

fn setup(run: impl FnOnce(Rc<RefCell<Fixture>>, RouteRequest)) {
    let now = chrono::Utc::now().timestamp();
    let mut connection = tests::connection();
    connection.status = "active".into();
    connection.scope = "cedros:site:read cedros:site:write".into();
    connection.site_id = Some("site-1".into());
    connection.runtime_site_id = Some("runtime-1".into());
    connection.identity = Some(AccessTokenClaims {
        sub: "user-1".into(),
        sid: "session-1".into(),
        org_id: Some("org-1".into()),
        role: Some("owner".into()),
        is_system_admin: Some(false),
        email_verified: Some(true),
        // Access-token age does not bound a separately consented live grant.
        exp: now - 10,
        iat: now - 1000,
        nbf: now - 1000,
        iss: "cedros-login".into(),
        aud: "cedros".into(),
    });
    let input = value!({
        "contractVersion":1,"grantId":connection.id,"oauthIssuer":connection.issuer,
        "oauthSubject":"user-1","organizationId":"org-1","clientId":connection.client_id,
        "resource":connection.resource,"siteId":"site-1","runtimeSiteId":"runtime-1",
        "grantExpiresAt":chrono::DateTime::parse_from_rfc3339(&connection.expires_at).unwrap().timestamp(),
        "scopes":["cedros:site:write","cedros:site:read"],"nonce":"fresh-request-nonce-123"
    });
    let config = value!({"issuer":connection.issuer,"consentUri":"https://login.example/portal/connect","clients":[{
        "clientId":connection.client_id,"clientName":"ChatGPT","redirectUris":[connection.redirect_uri],
        "resources":[connection.resource],"scopes":["cedros:site:read","cedros:site:write"]
    }]});
    let state = Rc::new(RefCell::new(Fixture {
        rows: HashMap::from([
            (
                "cedros-login:oauth-connections",
                serde_json::to_value(connection).unwrap(),
            ),
            (
                "cedros-login:sessions",
                value!({"id":"session-1","userId":"user-1","refreshTokenHash":"never-returned","createdAt":clock::now_iso(),"expiresAt":clock::in_secs(3600)}),
            ),
            (
                "cedros-login:users",
                value!({"id":"user-1","email":"owner@example.test","emailVerified":true,"isSystemAdmin":false,"createdAt":"now","updatedAt":"now"}),
            ),
            (
                "cedros-login:orgs",
                value!({"id":"org-1","name":"Fixture","slug":"fixture","isPersonal":false,"ownerId":"user-1","createdAt":"now","updatedAt":"now"}),
            ),
            (
                "cedros-login:memberships",
                value!({"id":"member-1","userId":"user-1","orgId":"org-1","role":"owner","joinedAt":"now"}),
            ),
        ]),
        config: Some(config),
        unavailable: false,
    }));
    let settings_state = state.clone();
    let db_state = state.clone();
    key_value_test_support::with_values(
        move |seam, key| {
            assert_ne!(
                seam, "secrets",
                "authority must not read OAuth or signing credentials"
            );
            Ok(if key == "oauth_authorization_server" {
                settings_state
                    .borrow()
                    .config
                    .as_ref()
                    .map(Value::to_string)
            } else {
                None
            })
        },
        || {
            db::test_support::with_db(
                move |op, collection, query| {
                    assert_eq!(op, "read", "authority must not mutate grant/session state");
                    let state = db_state.borrow();
                    if state.unavailable {
                        return Err(SeamError::Db("test unavailable".into()));
                    }
                    Ok(
                        value!({"entries":state.rows.get(collection.model).map(|payload| vec![value!({
            "entry_key":query.entry_keys.first().map(String::as_str).or_else(|| payload["id"].as_str()).unwrap(),"payload":payload,"version":"1"
        })]).unwrap_or_default()}),
                    )
                },
                || {
                    run(state, RouteRequest {
        route_id:"cedros-login:oauth-consent-authority".into(), method:"POST".into(),
        path:"/admin/oauth/authority".into(),headers:vec![],query:vec![],body:input.to_string(),
        context_json:value!({"authenticated":true,"authScheme":"bearer-token","actorId":"user-1","orgId":"org-1","permissionClaims":[authority::CLAIM]}).to_string(),
    })
                },
            )
        },
    );
}

fn response(request: &RouteRequest) -> Value {
    let response = authority(request);
    assert_eq!(response.status, 200, "{}", response.body);
    assert!(response
        .headers
        .iter()
        .any(|(name, value)| name == "cache-control" && value == "no-store"));
    serde_json::from_str(&response.body).unwrap()
}

#[test]
fn authority_checks_real_consent_identity_without_retaining_or_returning_credentials() {
    setup(|_, request| {
        let result = response(&request);
        assert_eq!(result["active"], true);
        assert_eq!(result["contractVersion"], 1);
        assert_eq!(result["nonce"], "fresh-request-nonce-123");
        assert!(
            (chrono::Utc::now().timestamp() - result["checkedAt"].as_i64().unwrap()).abs() <= 1
        );
        assert_eq!(result.as_object().unwrap().len(), 4);
    });
}

#[test]
fn authority_rejects_caller_claims_admin_sessions_and_mismatched_host_context() {
    for context in [
        value!({}),
        value!({"authenticated":true,"systemAdmin":true,"csrfVerified":true}),
        value!({"authenticated":true,"authScheme":"bearer-token","actorId":"user-1","orgId":"org-1"}),
        value!({"authenticated":false,"authScheme":"bearer-token","actorId":"user-1","orgId":"org-1","permissionClaims":[authority::CLAIM]}),
        value!({"authenticated":true,"authScheme":"api-key","actorId":"user-1","orgId":"org-1","permissionClaims":[authority::CLAIM]}),
        value!({"authenticated":true,"authScheme":"bearer-token","actorId":"wrong-user","orgId":"org-1","permissionClaims":[authority::CLAIM]}),
        value!({"authenticated":true,"authScheme":"bearer-token","actorId":"user-1","orgId":"wrong-org","permissionClaims":[authority::CLAIM]}),
        value!({"authenticated":true,"authScheme":"bearer-token","actorId":"user-1","orgId":"org-1","permissionClaims":["*"]}),
    ] {
        setup(|_, mut request| {
            request.context_json = context.to_string();
            request.headers = vec![
                ("authorization".into(), "Bearer caller-token".into()),
                ("x-permission-claims".into(), authority::CLAIM.into()),
                (
                    "x-cedros-context".into(),
                    value!({"permissionClaims":[authority::CLAIM]}).to_string(),
                ),
            ];
            assert_eq!(authority(&request).status, 403);
        });
    }
}

#[test]
fn authority_requires_every_persisted_binding_dimension() {
    for (field, bad) in [
        ("id", value!("b".repeat(64))),
        ("status", value!("revoked")),
        ("issuer", value!("https://other.example")),
        ("clientId", value!("other")),
        ("resource", value!("https://other.example/mcp")),
        ("siteId", value!("other")),
        ("runtimeSiteId", value!("other")),
        ("scope", value!("cedros:site:read")),
        ("expiresAt", value!(clock::in_secs(120))),
        ("expiresAt", value!(clock::ago_iso(10))),
        ("expiresAt", value!("invalid")),
        ("identity", Value::Null),
    ] {
        setup(|state, request| {
            state
                .borrow_mut()
                .rows
                .get_mut("cedros-login:oauth-connections")
                .unwrap()[field] = bad;
            assert_eq!(response(&request)["active"], false, "{field}");
        });
    }
    for (field, bad) in [("sub", "other"), ("org_id", "other")] {
        setup(|state, request| {
            state
                .borrow_mut()
                .rows
                .get_mut("cedros-login:oauth-connections")
                .unwrap()["identity"][field] = value!(bad);
            assert_eq!(response(&request)["active"], false, "{field}");
        });
    }
}

#[test]
fn authority_rechecks_registration_session_user_and_membership_without_cached_success() {
    for scenario in [
        "grant-missing",
        "client-removed",
        "resource-removed",
        "scope-removed",
        "redirect-removed",
        "issuer-changed",
        "config-missing",
        "session-missing",
        "session-revoked",
        "session-expired",
        "session-owner",
        "user-missing",
        "suspended",
        "email-unverified",
        "email-missing",
        "membership-missing",
        "role-changed",
        "member-role",
        "org-missing",
    ] {
        setup(|state, request| {
            assert_eq!(response(&request)["active"], true);
            {
                let mut state = state.borrow_mut();
                match scenario {
                    "grant-missing" => {
                        state.rows.remove("cedros-login:oauth-connections");
                    }
                    "client-removed" => {
                        state.config.as_mut().unwrap()["clients"][0]["clientId"] =
                            value!("replacement")
                    }
                    "resource-removed" => {
                        state.config.as_mut().unwrap()["clients"][0]["resources"] =
                            value!(["https://other.example/mcp"])
                    }
                    "scope-removed" => {
                        state.config.as_mut().unwrap()["clients"][0]["scopes"] =
                            value!(["cedros:site:read"])
                    }
                    "redirect-removed" => {
                        state.config.as_mut().unwrap()["clients"][0]["redirectUris"] =
                            value!(["https://other.example/callback"])
                    }
                    "issuer-changed" => {
                        state.config.as_mut().unwrap()["issuer"] =
                            value!("https://login.example/other")
                    }
                    "config-missing" => state.config = None,
                    "session-missing" => {
                        state.rows.remove("cedros-login:sessions");
                    }
                    "session-revoked" => {
                        state.rows.get_mut("cedros-login:sessions").unwrap()["revokedAt"] =
                            value!(clock::now_iso())
                    }
                    "session-expired" => {
                        state.rows.get_mut("cedros-login:sessions").unwrap()["expiresAt"] =
                            value!(clock::ago_iso(10))
                    }
                    "session-owner" => {
                        state.rows.get_mut("cedros-login:sessions").unwrap()["userId"] =
                            value!("other")
                    }
                    "user-missing" => {
                        state.rows.remove("cedros-login:users");
                    }
                    "suspended" => {
                        state.rows.get_mut("cedros-login:users").unwrap()["suspendedAt"] =
                            value!(clock::now_iso())
                    }
                    "email-unverified" => {
                        state.rows.get_mut("cedros-login:users").unwrap()["emailVerified"] =
                            value!(false)
                    }
                    "email-missing" => {
                        state.rows.get_mut("cedros-login:users").unwrap()["email"] = Value::Null
                    }
                    "membership-missing" => {
                        state.rows.remove("cedros-login:memberships");
                    }
                    "role-changed" => {
                        state.rows.get_mut("cedros-login:memberships").unwrap()["role"] =
                            value!("admin")
                    }
                    "member-role" => {
                        state.rows.get_mut("cedros-login:memberships").unwrap()["role"] =
                            value!("member");
                        state
                            .rows
                            .get_mut("cedros-login:oauth-connections")
                            .unwrap()["identity"]["role"] = value!("member");
                    }
                    "org-missing" => {
                        state.rows.remove("cedros-login:orgs");
                    }
                    _ => unreachable!(),
                }
            }
            assert_eq!(response(&request)["active"], false, "{scenario}");
        });
    }
}

#[test]
fn authority_rejects_bad_wire_data_and_unknown_credential_fields() {
    for (field, invalid) in [
        ("contractVersion", value!(2)),
        ("grantId", value!("A".repeat(64))),
        ("oauthIssuer", value!("http://login.example")),
        ("resource", value!("https://plugin.example/mcp?token=bad")),
        ("siteId", value!(" ")),
        ("nonce", value!("short")),
        ("nonce", value!("caller supplied nonce")),
        ("grantExpiresAt", value!(0)),
        ("scopes", value!([])),
        ("scopes", value!(["cedros:site:read", "cedros:site:read"])),
        ("scopes", value!(["admin:*"])),
        ("scopes", value!(["cedros:site:read cedros:site:write"])),
        ("accessToken", value!("do-not-accept")),
        ("refreshToken", value!("do-not-accept")),
        ("permissionClaims", value!([authority::CLAIM])),
    ] {
        setup(|_, mut request| {
            let mut input: Value = serde_json::from_str(&request.body).unwrap();
            input[field] = invalid;
            request.body = input.to_string();
            assert_eq!(authority(&request).status, 400, "{field}");
        });
    }
    setup(|_, mut request| {
        request.query.push(("token".into(), "bad".into()));
        assert_eq!(authority(&request).status, 400);
    });
    setup(|_, mut request| {
        request.method = "GET".into();
        assert_eq!(authority(&request).status, 400);
    });
    setup(|_, mut request| {
        request.body = " ".repeat(16_385);
        assert_eq!(authority(&request).status, 400);
    });
}

#[test]
fn authority_store_outage_never_reports_active() {
    setup(|state, request| {
        state.borrow_mut().unavailable = true;
        assert!(matches!(
            authority::check(&request),
            Err(RouteError::Seam(_))
        ));
    });
}

#[test]
fn authority_is_advertised_and_dispatches_through_the_installed_mount() {
    let route = crate::routes::list()
        .into_iter()
        .find(|route| route.route_id == "cedros-login:oauth-consent-authority")
        .unwrap();
    assert_eq!(route.method, "POST");
    assert_eq!(route.path, "/admin/oauth/authority");
    for manifest in [
        include_str!("../../../../cedros-extension.manifest.json"),
        include_str!("../../../../react-native/src/extension/manifest.json"),
        include_str!("../../../../ui/src/extension/manifest.generated.json"),
    ] {
        let manifest: Value = serde_json::from_str(manifest).unwrap();
        assert!(manifest["surfaces"]["server"]["routes"]
            .as_array()
            .unwrap()
            .contains(&value!(route.route_id)));
    }
    setup(|_, mut request| {
        request.path = "/extensions/cedros-login/admin/oauth/authority".into();
        let result = crate::routes::handle(request);
        assert_eq!(result.status, 200, "{}", result.body);
        assert_eq!(
            serde_json::from_str::<Value>(&result.body).unwrap()["active"],
            true
        );
    });
}
