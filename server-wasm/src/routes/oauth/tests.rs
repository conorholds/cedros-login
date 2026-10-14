use super::*;
pub(super) fn connection() -> Connection {
    Connection {
        id: "a".repeat(64),
        client_id: "chatgpt".into(),
        issuer: "https://login.example/extensions/cedros-login".into(),
        redirect_uri: "https://chatgpt.com/callback".into(),
        resource: "https://plugin.example/mcp".into(),
        scope: "cedros:sites:read".into(),
        state: "opaque-state".into(),
        code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM".into(),
        created_at: clock::now_iso(),
        expires_at: clock::in_secs(600),
        status: "pending".into(),
        identity: None,
        csrf_hash: None,
        code_hash: None,
        code_expires_at: None,
        site_id: None,
        runtime_site_id: None,
        site_name: None,
        refresh_generation: 0,
        cleanup_protocol_version: Some(1),
        cleanup_state: None,
        cleanup_check_at: None,
    }
}
#[test]
fn callback_only_adds_code_and_state_to_registered_https_destination() {
    let c = connection();
    let url = Url::parse(&redirect(&c, "code", "opaque.code").unwrap()).unwrap();
    assert_eq!(url.host_str(), Some("chatgpt.com"));
    let pairs: Vec<_> = url.query_pairs().collect();
    assert_eq!(pairs.len(), 3);
    assert_eq!(pairs[0].0, "code");
    assert_eq!(pairs[1].0, "state");
}
#[test]
fn static_client_config_rejects_unknown_scope_and_foreign_consent() {
    let mut c = config::Config {
        issuer: "https://login.example/extensions/cedros-login".into(),
        consent_uri: "https://login.example/portal/connect".into(),
        clients: vec![config::Client {
            client_id: "chatgpt".into(),
            client_name: "ChatGPT".into(),
            redirect_uris: vec!["https://chatgpt.com/callback".into()],
            resources: vec!["https://plugin.example/mcp".into()],
            scopes: vec!["cedros:sites:read".into()],
        }],
    };
    assert!(c.validate().is_ok());
    c.clients[0].client_id = "client with spaces".into();
    assert!(c.validate().is_err());
    c.clients[0].client_id = "chatgpt".into();
    c.issuer.insert(0, ' ');
    assert!(c.validate().is_err());
    c.issuer.remove(0);
    c.clients[0].scopes.push("admin:*".into());
    assert!(c.validate().is_err());
    c.clients[0].scopes.pop();
    c.consent_uri = "https://evil.example/consent".into();
    assert!(c.validate().is_err());
}
#[test]
fn account_scopes_do_not_require_existing_site_but_site_scopes_do() {
    assert!(!site_required("cedros:sites:create cedros:sites:read"));
    assert!(site_required("cedros:sites:read cedros:site:write"));
}

use crate::host::{db, key_value_test_support, DbConflictCategory, SeamError};
use crate::services::jwt::{JwtService, TokenContext};
use serde_json::{json as value, Value};
use std::{cell::RefCell, collections::HashMap, rc::Rc, sync::OnceLock};

fn pem() -> &'static str {
    static KEY: OnceLock<String> = OnceLock::new();
    KEY.get_or_init(|| crate::services::jwt::generate_private_key_pem().unwrap())
}
fn config_value() -> Value {
    value!({"issuer":"https://login.example/extensions/cedros-login","consentUri":"https://login.example/portal/connect","clients":[{"clientId":"chatgpt","clientName":"ChatGPT","redirectUris":["https://chatgpt.com/callback"],"resources":["https://plugin.example/mcp"],"scopes":["cedros:sites:read","cedros:sites:create","cedros:site:read"]}]})
}
#[derive(Default)]
struct Database {
    rows: HashMap<String, (Value, u64)>,
    revoked: bool,
    role_changed: bool,
    second_membership_removed: bool,
    second_role_changed: bool,
    revoke_second_on_approve: bool,
    suspended: bool,
    fail_cas: bool,
    compete_next_oauth_cas: bool,
    compete_next_revoke_cas: bool,
    fail_accepted_cas_once: bool,
}
fn fixture(run: impl FnOnce(Rc<RefCell<Database>>, String)) {
    fixture_with_config(config_value(), run);
}
fn fixture_with_config(config: Value, run: impl FnOnce(Rc<RefCell<Database>>, String)) {
    cleanup::TEST_REQUESTS.with_borrow_mut(Vec::clear);
    cleanup::TEST_RESPONSE.with_borrow_mut(|response| *response = None);
    let state = Rc::new(RefCell::new(Database::default()));
    let db_state = state.clone();
    key_value_test_support::with_values(
        move |seam, key| {
            Ok(match (seam, key) {
                ("secrets", "jwt-rsa-private-key:version:test") => Some(pem().into()),
                ("secrets", "jwt-secret:version:test") => Some("test-only-hmac-key".into()),
                ("settings", "oauth_authorization_server") => Some(config.to_string()),
                _ => None,
            })
        },
        || {
            db::test_support::with_db(
                move |op, collection, query| {
                    let mut db = db_state.borrow_mut();
                    if op == "compare-and-set" {
                        let body = &query.filters[0].value;
                        let ops = body["ops"].as_array().unwrap();
                        if db.compete_next_oauth_cas
                            && ops.iter().any(|op| op["data"]["status"] == "active")
                        {
                            db.compete_next_oauth_cas = false;
                            let winner = ops
                                .iter()
                                .find(|op| op["data"]["status"] == "active")
                                .unwrap();
                            let id = winner["entryKey"].as_str().unwrap();
                            let revision = db.rows.get(id).unwrap().1 + 1;
                            db.rows
                                .insert(id.into(), (winner["data"].clone(), revision));
                            return Err(SeamError::DbConflict {
                                category: DbConflictCategory::Precondition,
                                operation: "compare-and-set".into(),
                            });
                        }
                        if db.compete_next_revoke_cas
                            && ops.iter().any(|op| op["data"]["status"] == "revoked")
                        {
                            db.compete_next_revoke_cas = false;
                            let attempt = ops
                                .iter()
                                .find(|op| op["data"]["status"] == "revoked")
                                .unwrap();
                            let id = attempt["entryKey"].as_str().unwrap();
                            let (payload, revision) = db.rows.get_mut(id).unwrap();
                            payload["refreshGeneration"] =
                                value!(payload["refreshGeneration"].as_u64().unwrap() + 1);
                            *revision += 1;
                            return Err(SeamError::DbConflict {
                                category: DbConflictCategory::Precondition,
                                operation: "compare-and-set".into(),
                            });
                        }
                        if db.fail_accepted_cas_once
                            && ops
                                .iter()
                                .any(|op| op["data"]["cleanupState"] == "accepted")
                        {
                            db.fail_accepted_cas_once = false;
                            return Err(SeamError::Db("acknowledgement unavailable".into()));
                        }
                        for condition in body["conditions"].as_array().unwrap() {
                            let id = condition["entryKey"].as_str().unwrap();
                            let valid = if id == "member-2" {
                                condition["expectedVersion"] == "1"
                                    && !db.second_membership_removed
                                    && !db.revoke_second_on_approve
                            } else if id == "user-1" || id == "session-1" || id == "member-1" {
                                condition["expectedVersion"] == "1"
                            } else {
                                match db.rows.get(id) {
                                    None => condition["predicate"] == "absent",
                                    Some((_, v)) => condition["expectedVersion"]
                                        .as_str()
                                        .is_some_and(|expected| expected == v.to_string()),
                                }
                            };
                            if db.fail_cas || !valid {
                                return Err(SeamError::DbConflict {
                                    category: DbConflictCategory::Precondition,
                                    operation: "compare-and-set".into(),
                                });
                            }
                        }
                        let ops = body["ops"].as_array().unwrap();
                        for op in ops {
                            let id = op["entryKey"].as_str().unwrap();
                            if op["op"] == "delete" {
                                db.rows.remove(id);
                                continue;
                            }
                            let revision = db.rows.get(id).map_or(1, |(_, v)| v + 1);
                            db.rows.insert(id.into(), (op["data"].clone(), revision));
                        }
                        return Ok(
                            value!({"outcome":"applied","applied":ops.len(),"entries":[],"results":[],"replayed":false}),
                        );
                    }
                    assert_eq!(op, "read");
                    let id = query
                        .entry_keys
                        .first()
                        .map(String::as_str)
                        .unwrap_or("fixture");
                    if collection.model == "cedros-login:oauth-connections" {
                        let mut rows: Vec<_> = db
                            .rows
                            .iter()
                            .filter(|(key, (value, _))| {
                                value.get("status").is_some()
                                    && (query.entry_keys.is_empty()
                                        || query.entry_keys.contains(key))
                                    && query.filters.iter().all(|filter| match filter.op.as_str() {
                                        "eq" => value[&filter.field] == filter.value,
                                        "lt" => value[&filter.field]
                                            .as_str()
                                            .zip(filter.value.as_str())
                                            .is_some_and(|(a, b)| a < b),
                                        "lte" => value[&filter.field]
                                            .as_str()
                                            .zip(filter.value.as_str())
                                            .is_some_and(|(a, b)| a <= b),
                                        _ => panic!("unsupported fixture filter"),
                                    })
                            })
                            .collect();
                        if let Some(order) = query.order_by.as_ref() {
                            rows.sort_by_key(|(_, (v, _))| v[&order.field].as_str().unwrap_or(""));
                        }
                        rows.truncate(query.limit.unwrap_or(100) as usize);
                        return Ok(
                            value!({"entries":rows.into_iter().map(|(id,(v,r))|value!({"entry_key":id,"payload":v,"version":r.to_string()})).collect::<Vec<_>>()}),
                        );
                    }
                    if collection.model == "cedros-login:sessions" && id != "session-1" {
                        return Ok(value!({"entries":db.rows.get(id).map(|(v,r)|{
                let mut payload=v.clone();if db.revoked{payload["revokedAt"]=value!(clock::now_iso());}
                vec![value!({"entry_key":id,"payload":payload,"version":r.to_string()})]
            }).unwrap_or_default()}));
                    }
                    if collection.model == "cedros-login:memberships" {
                        let org = query
                            .filters
                            .iter()
                            .find(|f| f.field == "orgId")
                            .and_then(|f| f.value.as_str())
                            .unwrap_or("org-1");
                        if !matches!(org, "org-1" | "org-2")
                            || (org == "org-2" && db.second_membership_removed)
                        {
                            return Ok(value!({"entries":[]}));
                        }
                        let id = if org == "org-2" {
                            "member-2"
                        } else {
                            "member-1"
                        };
                        let role = if org == "org-2" {
                            if db.second_role_changed {
                                "member"
                            } else {
                                "owner"
                            }
                        } else if db.role_changed {
                            "admin"
                        } else {
                            "member"
                        };
                        return Ok(
                            value!({"entries":[{"entry_key":id,"payload":{"id":id,"userId":"user-1","orgId":org,"role":role,"joinedAt":"now"},"version":"1","updated_at":clock::now_iso()}]}),
                        );
                    }
                    let payload = match collection.model {
                        "cedros-login:identity-records" => {
                            value!({"secretKey":format!("{}:version:test",id.strip_prefix("secret:").unwrap())})
                        }
                        "cedros-login:sessions" => {
                            value!({"id":"session-1","userId":"user-1","refreshTokenHash":"hash","createdAt":clock::now_iso(),"expiresAt":clock::in_secs(3600),"revokedAt":if db.revoked{Some(clock::now_iso())}else{None},"ipAddress":null,"userAgent":null,"revokedReason":null,"lastStrongAuthAt":null})
                        }
                        "cedros-login:users" => {
                            value!({"id":"user-1","emailVerified":true,"isSystemAdmin":false,"createdAt":"now","updatedAt":"now","suspendedAt":if db.suspended{Some(clock::now_iso())}else{None}})
                        }
                        "cedros-login:orgs" => {
                            value!({"id":id,"name":"Fixture","slug":"fixture","isPersonal":false,"ownerId":"user-1","createdAt":"now","updatedAt":"now"})
                        }
                        "cedros-login:memberships" => {
                            value!({"id":"member-1","userId":"user-1","orgId":"org-1","role":if db.role_changed{"admin"}else{"member"},"joinedAt":"now"})
                        }
                        other => panic!("unexpected collection {other}"),
                    };
                    Ok(value!({"entries":[{"entry_key":id,"payload":payload,"version":"1"}]}))
                },
                || {
                    let jwt =
                        JwtService::from_pem(pem(), "cedros-login".into(), "cedros".into(), 900)
                            .unwrap();
                    let access = jwt
                        .generate_access_token(
                            "user-1",
                            "session-1",
                            &TokenContext {
                                org_id: Some("org-1".into()),
                                role: Some("member".into()),
                                email_verified: Some(true),
                                is_system_admin: None,
                            },
                        )
                        .unwrap();
                    run(state, access);
                },
            )
        },
    );
}
fn request(method: &str, path: &str, body: &str, bearer: Option<&str>) -> RouteRequest {
    let mut headers = vec![(
        "content-type".into(),
        "application/x-www-form-urlencoded".into(),
    )];
    if let Some(token) = bearer {
        headers.push(("authorization".into(), format!("Bearer {token}")));
    }
    let query = if method == "GET" && path.starts_with("/oauth/requests/") {
        vec![("organizationId".into(), "org-1".into())]
    } else {
        vec![]
    };
    let body = if method == "POST" && path.starts_with("/oauth/requests/") {
        serde_json::from_str::<Value>(body)
            .ok()
            .and_then(|mut value| {
                value
                    .as_object_mut()?
                    .entry("organizationId")
                    .or_insert(value!("org-1"));
                Some(value.to_string())
            })
            .unwrap_or_else(|| body.into())
    } else {
        body.into()
    };
    RouteRequest {
        route_id: String::new(),
        method: method.into(),
        path: path.into(),
        headers,
        query,
        body,
        context_json: "{}".into(),
    }
}
fn authorization() -> RouteRequest {
    let mut r = request("GET", "/oauth/authorize", "", None);
    r.query = vec![
        ("client_id", "chatgpt"),
        ("redirect_uri", "https://chatgpt.com/callback"),
        ("response_type", "code"),
        ("resource", "https://plugin.example/mcp"),
        ("scope", "cedros:sites:read"),
        ("state", "test-state"),
        ("code_challenge_method", "S256"),
        (
            "code_challenge",
            "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
        ),
    ]
    .into_iter()
    .map(|(k, v)| (k.into(), v.into()))
    .collect();
    r
}
fn consent(login: &str) -> (String, String) {
    consent_for(login, &authorization())
}
fn consent_for(login: &str, authorization: &RouteRequest) -> (String, String) {
    let r = authorize(authorization);
    assert_eq!(r.status, 302, "{}", r.body);
    let destination =
        Url::parse(&r.headers.iter().find(|(k, _)| k == "location").unwrap().1).unwrap();
    let id = destination
        .query_pairs()
        .find(|(k, _)| k == "request_id")
        .unwrap()
        .1
        .into_owned();
    let path = format!("/oauth/requests/{id}");
    let info = request_info(&request("GET", &path, "", Some(login)));
    assert_eq!(info.status, 200, "{}", info.body);
    let info: Value = serde_json::from_str(&info.body).unwrap();
    let repeated = request_info(&request("GET", &path, "", Some(login)));
    assert_eq!(
        serde_json::from_str::<Value>(&repeated.body).unwrap()["csrfToken"],
        info["csrfToken"]
    );
    let body = value!({"decision":"approve","csrfToken":info["csrfToken"]}).to_string();
    let result = match decide_inner(&request("POST", &path, &body, Some(login))) {
        Ok(response) => response,
        Err(RouteError::Seam(e)) => panic!("consent seam error: {e:?}"),
        Err(_) => panic!("consent failed"),
    };
    assert_eq!(result.status, 200, "{}", result.body);
    let response: Value = serde_json::from_str(&result.body).unwrap();
    assert_eq!(response["grantId"], id);
    let url = Url::parse(response["redirectUri"].as_str().unwrap()).unwrap();
    let registered = &authorization
        .query
        .iter()
        .find(|(k, _)| k == "redirect_uri")
        .unwrap()
        .1;
    assert!(response["redirectUri"]
        .as_str()
        .unwrap()
        .starts_with(&format!("{registered}?")));
    let code = url
        .query_pairs()
        .find(|(k, _)| k == "code")
        .unwrap()
        .1
        .into_owned();
    (id, code)
}

#[test]
fn native_callback_configuration_is_narrow_and_other_urls_remain_https() {
    let base = config_value();
    for port in [1, 80, 45459, 65535] {
        let callback = format!("http://localhost:{port}/callback");
        let mut value = base.clone();
        value["clients"][0]["redirectUris"] = value!([callback]);
        let config: config::Config = serde_json::from_value(value.clone()).unwrap();
        assert!(config.validate().is_ok(), "{callback}");
        let mut c = connection();
        c.redirect_uri = callback.clone();
        assert!(redirect(&c, "code", "test-code")
            .unwrap()
            .starts_with(&format!("{callback}?")));
        for field in ["issuer", "consentUri"] {
            let mut invalid = value.clone();
            invalid[field] = value!(callback);
            assert!(serde_json::from_value::<config::Config>(invalid)
                .unwrap()
                .validate()
                .is_err());
        }
        value["clients"][0]["resources"] = value!([callback]);
        assert!(serde_json::from_value::<config::Config>(value)
            .unwrap()
            .validate()
            .is_err());
    }
    for callback in [
        "http://localhost/callback",
        "http://localhost:0/callback",
        "http://localhost:65536/callback",
        "http://localhost:045459/callback",
        "http://localhost:*/callback",
        "http://[::1]:45459/callback",
        "http://LOCALHOST:45459/callback",
        "http://localhost.:45459/callback",
        "http://localhost.evil.example:45459/callback",
        "http://user@localhost:45459/callback",
        "http://localhost:45459/other",
        "http://localhost:45459/call%62ack",
        "http://localhost:45459/a/../callback",
        "http://localhost:45459/callback/",
        "http://localhost:45459/callback?",
        "http://localhost:45459/callback#",
        "http://localhost:45459/callback\n",
    ] {
        let mut invalid = base.clone();
        invalid["clients"][0]["redirectUris"] = value!([callback]);
        assert!(
            serde_json::from_value::<config::Config>(invalid)
                .unwrap()
                .validate()
                .is_err(),
            "{callback}"
        );
        let mut c = connection();
        c.redirect_uri = callback.into();
        assert!(redirect(&c, "code", "test-code").is_err(), "{callback}");
    }
}

#[test]
fn ipv4_loopback_registration_only_relaxes_the_port_when_explicitly_requested() {
    let registered = vec!["http://127.0.0.1/callback".into()];
    for callback in [
        "http://127.0.0.1/callback",
        "http://127.0.0.1:1/callback",
        "http://127.0.0.1:80/callback",
        "http://127.0.0.1:45459/callback",
        "http://127.0.0.1:65535/callback",
    ] {
        let mut value = config_value();
        value["clients"][0]["redirectUris"] = value!([callback]);
        assert!(
            serde_json::from_value::<config::Config>(value)
                .unwrap()
                .validate()
                .is_ok(),
            "{callback}"
        );
        assert!(
            config::redirect_matches(&registered, callback),
            "{callback}"
        );
        let mut c = connection();
        c.redirect_uri = callback.into();
        assert!(redirect(&c, "code", "test-code")
            .unwrap()
            .starts_with(&format!("{callback}?")));
        let exact = vec![callback.into()];
        if callback != "http://127.0.0.1/callback" {
            assert!(!config::redirect_matches(
                &exact,
                "http://127.0.0.1:45460/callback"
            ));
        }
        let mut config: config::Config = serde_json::from_value(config_value()).unwrap();
        config.issuer = callback.into();
        assert!(config.validate().is_err());
        config = serde_json::from_value(config_value()).unwrap();
        config.consent_uri = callback.into();
        assert!(config.validate().is_err());
        config = serde_json::from_value(config_value()).unwrap();
        config.clients[0].resources = vec![callback.into()];
        assert!(config.validate().is_err());
    }
    for callback in [
        "http://127.0.0.1:0/callback",
        "http://127.0.0.1:65536/callback",
        "http://127.0.0.1:045459/callback",
        "http://127.0.0.1:*/callback",
        "http://127.0.0.1:/callback",
        "http://localhost:45459/callback",
        "http://127.1:45459/callback",
        "http://2130706433:45459/callback",
        "http://0x7f000001:45459/callback",
        "http://127.0.0.2:45459/callback",
        "http://[::1]:45459/callback",
        "http://127.0.0.1.evil.example:45459/callback",
        "http://127.0.0.1.:45459/callback",
        "http://user@127.0.0.1:45459/callback",
        "http://127.0.0.1:45459/other",
        "http://127.0.0.1:45459/call%62ack",
        "http://127.0.0.1:45459/a/../callback",
        "http://127.0.0.1:45459/callback/",
        "http://127.0.0.1:45459/callback?",
        "http://127.0.0.1:45459/callback#",
        "http://127.0.0.1:45459/callback\n",
        "https://127.0.0.1:45459/callback",
        "http://10.0.0.1:45459/callback",
    ] {
        assert!(
            !config::redirect_matches(&registered, callback),
            "{callback}"
        );
    }
}

#[test]
fn ipv4_native_authorization_keeps_exchange_bound_to_the_actual_listener() {
    for port in [80, 45459, 45460, 65535] {
        for path in ["/callback", "/callback/fcz5mDROkENC"] {
            let callback = format!("http://127.0.0.1:{port}{path}");
            let mut config = config_value();
            config["clients"][0]["redirectUris"] = value!([format!("http://127.0.0.1{path}")]);
            fixture_with_config(config, |db, login| {
                let mut auth = authorization();
                auth.query
                    .iter_mut()
                    .find(|(k, _)| k == "redirect_uri")
                    .unwrap()
                    .1 = callback.clone();
                for wrong in [
                    "http://localhost:45459/callback",
                    "http://127.0.0.1:0/callback",
                    "http://127.0.0.1:45459/other",
                ] {
                    let mut invalid = auth.clone();
                    invalid
                        .query
                        .iter_mut()
                        .find(|(k, _)| k == "redirect_uri")
                        .unwrap()
                        .1 = wrong.into();
                    assert_eq!(authorize(&invalid).status, 400);
                }
                assert!(db.borrow().rows.is_empty());
                let (id, code) = consent_for(&login, &auth);
                assert_eq!(db.borrow().rows[&id].0["redirectUri"], callback);
                let exchange = |redirect: &str, verifier: &str| {
                    let body = url::form_urlencoded::Serializer::new(String::new())
                        .extend_pairs([
                            ("grant_type", "authorization_code"),
                            ("client_id", "chatgpt"),
                            ("code", code.as_str()),
                            ("redirect_uri", redirect),
                            ("resource", "https://plugin.example/mcp"),
                            ("code_verifier", verifier),
                        ])
                        .finish();
                    token(&request("POST", "/oauth/token", &body, None))
                };
                let verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
                assert_eq!(exchange("http://127.0.0.1/callback", verifier).status, 400);
                assert_eq!(
                    exchange("http://127.0.0.1:45461/callback", verifier).status,
                    400
                );
                assert_eq!(exchange(&callback, &"a".repeat(43)).status, 400);
                let response = exchange(&callback, verifier);
                assert_eq!(response.status, 200, "{}", response.body);
                let result: Value = serde_json::from_str(&response.body).unwrap();
                assert!(active(result["access_token"].as_str().unwrap()));
                assert_eq!(exchange(&callback, verifier).status, 400);
            });
        }
    }
}

#[test]
fn native_callback_ids_are_exact_registered_paths_not_wildcards() {
    let registered = vec!["http://127.0.0.1/callback/fcz5mDROkENC".into()];
    for callback in [
        "http://127.0.0.1/callback/fcz5mDROkENC",
        "http://127.0.0.1:58608/callback/fcz5mDROkENC",
    ] {
        assert!(config::redirect_matches(&registered, callback));
    }
    for callback in [
        "http://127.0.0.1:58608/callback",
        "http://127.0.0.1:58608/callback/another-id",
        "http://localhost:58608/callback/fcz5mDROkENC",
        "http://127.0.0.1:58608/callback/fcz5mDROkENC/next",
        "http://127.0.0.1:58608/callback/fcz5mDROkENC?x=1",
        "http://127.0.0.1:58608/callback/fcz5mDROkENC#x",
        "http://127.0.0.1:58608/callback/fcz5mDROkENC%2f",
        "http://127.0.0.1:58608/callback/../callback",
        "http://127.0.0.1:0/callback/fcz5mDROkENC",
    ] {
        assert!(
            !config::redirect_matches(&registered, callback),
            "{callback}"
        );
    }
    assert!(!config::redirect_matches(
        &vec!["http://127.0.0.1/callback".into()],
        "http://127.0.0.1:58608/callback/fcz5mDROkENC"
    ));
}

#[test]
fn native_grants_fail_when_their_callback_registration_is_removed() {
    let mut config: config::Config = serde_json::from_value(config_value()).unwrap();
    let mut c = connection();
    c.redirect_uri = "http://127.0.0.1:45459/callback".into();
    config.clients[0].redirect_uris = vec!["http://127.0.0.1/callback".into()];
    assert!(tokens::validate_registration(&config, &c).is_ok());
    config.clients[0].redirect_uris = vec!["http://127.0.0.1:45460/callback".into()];
    assert!(tokens::validate_registration(&config, &c).is_err());
    config.clients[0].redirect_uris = vec!["https://chatgpt.com/callback".into()];
    assert!(tokens::validate_registration(&config, &c).is_err());
}

#[test]
fn native_authorization_and_exchange_keep_exact_bindings_pkce_and_one_use_codes() {
    let callback = "http://localhost:45459/callback";
    let mut config = config_value();
    config["clients"][0]["redirectUris"] = value!([callback]);
    fixture_with_config(config, |db, login| {
        let mut auth = authorization();
        auth.query
            .iter_mut()
            .find(|(k, _)| k == "redirect_uri")
            .unwrap()
            .1 = callback.into();
        for (key, wrong, status) in [
            ("redirect_uri", "http://localhost:45460/callback", 400),
            ("redirect_uri", "http://127.0.0.1:45459/callback", 400),
            ("redirect_uri", "http://localhost:45459/other", 400),
            ("resource", "https://other.example/mcp", 400),
            ("code_challenge_method", "plain", 400),
        ] {
            let mut invalid = auth.clone();
            invalid.query.iter_mut().find(|(k, _)| k == key).unwrap().1 = wrong.into();
            assert_eq!(authorize(&invalid).status, status, "{key}: {wrong}");
        }
        assert!(db.borrow().rows.is_empty());
        let (_, code) = consent_for(&login, &auth);
        let exchange = |redirect: &str, resource: &str, verifier: &str| {
            let body = url::form_urlencoded::Serializer::new(String::new())
                .extend_pairs([
                    ("grant_type", "authorization_code"),
                    ("client_id", "chatgpt"),
                    ("code", code.as_str()),
                    ("redirect_uri", redirect),
                    ("resource", resource),
                    ("code_verifier", verifier),
                ])
                .finish();
            token(&request("POST", "/oauth/token", &body, None))
        };
        let resource = "https://plugin.example/mcp";
        let verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
        for wrong in [
            "http://localhost:45460/callback",
            "http://127.0.0.1:45459/callback",
            "http://localhost:45459/other",
        ] {
            assert_eq!(exchange(wrong, resource, verifier).status, 400);
        }
        assert_eq!(
            exchange(callback, "https://other.example/mcp", verifier).status,
            400
        );
        assert_eq!(exchange(callback, resource, &"a".repeat(43)).status, 400);
        let response = exchange(callback, resource, verifier);
        assert_eq!(response.status, 200, "{}", response.body);
        let result: Value = serde_json::from_str(&response.body).unwrap();
        assert!(active(result["access_token"].as_str().unwrap()));
        assert_eq!(exchange(callback, resource, verifier).status, 400);
    });
}
fn exchange_code(code: &str) -> RouteResponse {
    let body = url::form_urlencoded::Serializer::new(String::new())
        .extend_pairs([
            ("grant_type", "authorization_code"),
            ("client_id", "chatgpt"),
            ("code", code),
            (
                "code_verifier",
                "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
            ),
            ("redirect_uri", "https://chatgpt.com/callback"),
            ("resource", "https://plugin.example/mcp"),
        ])
        .finish();
    token(&request("POST", "/oauth/token", &body, None))
}
fn refresh(raw: &str) -> RouteResponse {
    let body = url::form_urlencoded::Serializer::new(String::new())
        .extend_pairs([
            ("grant_type", "refresh_token"),
            ("client_id", "chatgpt"),
            ("refresh_token", raw),
            ("resource", "https://plugin.example/mcp"),
        ])
        .finish();
    token(&request("POST", "/oauth/token", &body, None))
}
fn active(token: &str) -> bool {
    let r = introspect(&request("POST", "/oauth/introspect", "", Some(token)));
    assert_eq!(r.status, 200, "{}", r.body);
    serde_json::from_str::<Value>(&r.body).unwrap()["active"] == true
}
#[test]
fn full_authorization_code_refresh_introspection_and_revocation() {
    fixture(|_db, login| {
        let (_id, code) = consent(&login);
        let response = exchange_code(&code);
        assert_eq!(response.status, 200, "{}", response.body);
        let first: Value = serde_json::from_str(&response.body).unwrap();
        let access = first["access_token"].as_str().unwrap();
        assert!(active(access));
        let rotated = refresh(first["refresh_token"].as_str().unwrap());
        assert_eq!(rotated.status, 200, "{}", rotated.body);
        let second: Value = serde_json::from_str(&rotated.body).unwrap();
        assert_ne!(first["refresh_token"], second["refresh_token"]);
        let jwt = JwtService::from_pem(pem(), "cedros-login".into(), "cedros".into(), 900).unwrap();
        let first_claims = jwt
            .validate_oauth(
                access,
                "https://login.example/extensions/cedros-login",
                &["https://plugin.example/mcp"],
            )
            .unwrap();
        let second_claims = jwt
            .validate_oauth(
                second["access_token"].as_str().unwrap(),
                "https://login.example/extensions/cedros-login",
                &["https://plugin.example/mcp"],
            )
            .unwrap();
        assert!(uuid::Uuid::parse_str(&first_claims.jti).is_ok());
        assert_ne!(first_claims.jti, second_claims.jti);
        let body = url::form_urlencoded::Serializer::new(String::new())
            .extend_pairs([
                ("client_id", "chatgpt"),
                ("token", second["refresh_token"].as_str().unwrap()),
            ])
            .finish();
        assert_eq!(
            revoke(&request("POST", "/oauth/revoke", &body, None)).status,
            200
        );
        assert!(!active(access));
        assert!(!active(second["access_token"].as_str().unwrap()));
    });
}
#[test]
fn old_refresh_replay_revokes_family_and_cannot_reissue() {
    fixture(|_, login| {
        let (_, code) = consent(&login);
        let first: Value = serde_json::from_str(&exchange_code(&code).body).unwrap();
        let old = first["refresh_token"].as_str().unwrap();
        let second: Value = serde_json::from_str(&refresh(old).body).unwrap();
        assert_eq!(refresh(old).status, 400);
        assert!(!active(second["access_token"].as_str().unwrap()));
        assert_eq!(
            refresh(second["refresh_token"].as_str().unwrap()).status,
            400
        );
    });
}
#[test]
fn code_replay_revokes_issued_token() {
    fixture(|_, login| {
        let (_, code) = consent(&login);
        let first: Value = serde_json::from_str(&exchange_code(&code).body).unwrap();
        assert_eq!(exchange_code(&code).status, 400);
        assert!(!active(first["access_token"].as_str().unwrap()));
    });
}
#[test]
fn current_session_role_and_user_state_are_checked_every_time() {
    fixture(|db, login| {
        let (_, code) = consent(&login);
        let tokens: Value = serde_json::from_str(&exchange_code(&code).body).unwrap();
        let access = tokens["access_token"].as_str().unwrap();
        assert!(active(access));
        db.borrow_mut().revoked = true;
        assert!(!active(access));
        db.borrow_mut().revoked = false;
        db.borrow_mut().role_changed = true;
        assert!(!active(access));
        db.borrow_mut().role_changed = false;
        db.borrow_mut().suspended = true;
        assert!(!active(access));
    });
}
#[test]
fn stale_cas_never_publishes_tokens() {
    fixture(|db, login| {
        let (_, code) = consent(&login);
        db.borrow_mut().fail_cas = true;
        let r = exchange_code(&code);
        assert_eq!(r.status, 400);
        assert!(!r.body.contains("access_token"));
    });
}
#[test]
fn authorization_rejects_resource_redirect_and_plain_pkce_before_write() {
    fixture(|db, _| {
        for (key, bad) in [
            ("resource", "https://evil.example/mcp"),
            ("redirect_uri", "https://chatgpt.com.evil/callback"),
            ("code_challenge_method", "plain"),
            ("scope", "admin:all"),
        ] {
            let mut r = authorization();
            r.query.iter_mut().find(|(k, _)| k == key).unwrap().1 = bad.into();
            assert_eq!(authorize(&r).status, 400);
            assert!(db.borrow().rows.is_empty());
        }
    });
}

#[test]
fn consent_creates_independent_session_and_revocation_updates_both_rows() {
    fixture(|db, login| {
        let (id, code) = consent(&login);
        let row = db.borrow().rows[&id].0.clone();
        let sid = row["identity"]["sid"].as_str().unwrap().to_owned();
        assert_ne!(sid, "session-1");
        assert!(db.borrow().rows.contains_key(&sid));
        // The parent browser proof may expire or rotate. OAuth uses only its
        // independently consented, current Login session from this point.
        let first: Value = serde_json::from_str(&exchange_code(&code).body).unwrap();
        let jwt = crate::services::jwt::JwtService::from_pem(
            pem(),
            "cedros-login".into(),
            "cedros".into(),
            900,
        )
        .unwrap();
        let claims = jwt
            .validate_oauth(
                first["access_token"].as_str().unwrap(),
                "https://login.example/extensions/cedros-login",
                &["https://plugin.example/mcp"],
            )
            .unwrap();
        assert_eq!(claims.identity.sid, sid);
        assert!(claims.grant_exp >= claims.identity.exp);
        // OAuth credentials cannot authenticate to Login's own broad API.
        assert!(jwt
            .validate_access_token(first["access_token"].as_str().unwrap())
            .is_err());
        assert!(jwt
            .validate_oauth(
                &login,
                "https://login.example/extensions/cedros-login",
                &["https://plugin.example/mcp"]
            )
            .is_err());
        let response = disconnect(&request(
            "DELETE",
            &format!("/oauth/connections/{id}"),
            "",
            Some(&login),
        ));
        assert_eq!(response.status, 200, "{}", response.body);
        assert_eq!(db.borrow().rows[&id].0["status"], "revoked");
        assert!(db.borrow().rows[&sid].0["revokedAt"].is_string());
    });
}

#[test]
fn wrong_verifier_resource_redirect_and_expired_code_never_issue() {
    fixture(|db, login| {
        let (id, code) = consent(&login);
        let base = [
            ("grant_type", "authorization_code"),
            ("client_id", "chatgpt"),
            ("code", code.as_str()),
            (
                "code_verifier",
                "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
            ),
            ("redirect_uri", "https://chatgpt.com/callback"),
            ("resource", "https://plugin.example/mcp"),
        ];
        for (key, wrong) in [
            (
                "code_verifier",
                "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXz",
            ),
            ("resource", "https://other.example/mcp"),
            ("redirect_uri", "https://evil.example/callback"),
        ] {
            let mut pairs = base.to_vec();
            pairs.iter_mut().find(|(k, _)| *k == key).unwrap().1 = wrong;
            let body = url::form_urlencoded::Serializer::new(String::new())
                .extend_pairs(pairs)
                .finish();
            let response = token(&request("POST", "/oauth/token", &body, None));
            assert_eq!(response.status, 400);
            assert!(!response.body.contains("access_token"));
            assert_eq!(db.borrow().rows[&id].0["status"], "code");
        }
        db.borrow_mut().rows.get_mut(&id).unwrap().0["codeExpiresAt"] = value!(clock::ago_iso(1));
        assert_eq!(exchange_code(&code).status, 400);
    });
}

#[test]
fn forged_csrf_or_missing_site_cannot_consent_and_denial_issues_no_session() {
    fixture(|db, login| {
        let mut start = authorization();
        start
            .query
            .iter_mut()
            .find(|(k, _)| k == "scope")
            .unwrap()
            .1 = "cedros:site:read".into();
        let response = authorize(&start);
        assert_eq!(response.status, 302);
        let destination = Url::parse(
            &response
                .headers
                .iter()
                .find(|(k, _)| k == "location")
                .unwrap()
                .1,
        )
        .unwrap();
        let id = destination
            .query_pairs()
            .find(|(k, _)| k == "request_id")
            .unwrap()
            .1
            .into_owned();
        let path = format!("/oauth/requests/{id}");
        let info: Value =
            serde_json::from_str(&request_info(&request("GET", &path, "", Some(&login))).body)
                .unwrap();
        assert_eq!(info["siteRequired"], true);
        assert_eq!(
            decide(&request(
                "POST",
                &path,
                r#"{"decision":"approve","csrfToken":"forged"}"#,
                Some(&login)
            ))
            .status,
            403
        );
        let approve = value!({"decision":"approve","csrfToken":info["csrfToken"]}).to_string();
        assert_eq!(
            decide(&request("POST", &path, &approve, Some(&login))).status,
            400
        );
        let deny = value!({"decision":"deny","csrfToken":info["csrfToken"]}).to_string();
        let response = decide(&request("POST", &path, &deny, Some(&login)));
        assert_eq!(response.status, 200);
        assert!(response.body.contains("access_denied"));
        assert!(!response.body.contains("code="));
        assert_eq!(db.borrow().rows.len(), 1);
        assert_eq!(db.borrow().rows[&id].0["status"], "denied");
    });
}

#[test]
fn mixed_scope_request_can_explicitly_connect_account_without_site() {
    fixture(|db, login| {
        let mut start = authorization();
        start
            .query
            .iter_mut()
            .find(|(key, _)| key == "scope")
            .unwrap()
            .1 = "cedros:sites:read cedros:sites:create cedros:site:read".into();
        let response = authorize(&start);
        assert_eq!(response.status, 302);
        let destination = Url::parse(
            &response
                .headers
                .iter()
                .find(|(k, _)| k == "location")
                .unwrap()
                .1,
        )
        .unwrap();
        let id = destination
            .query_pairs()
            .find(|(k, _)| k == "request_id")
            .unwrap()
            .1
            .into_owned();
        let path = format!("/oauth/requests/{id}");
        let info: Value =
            serde_json::from_str(&request_info(&request("GET", &path, "", Some(&login))).body)
                .unwrap();
        let body=value!({"decision":"approve","csrfToken":info["csrfToken"],"scopes":["cedros:sites:create","cedros:sites:read"]}).to_string();
        let response = decide(&request("POST", &path, &body, Some(&login)));
        assert_eq!(response.status, 200, "{}", response.body);
        let result: Value = serde_json::from_str(&response.body).unwrap();
        let callback = Url::parse(result["redirectUri"].as_str().unwrap()).unwrap();
        let code = callback
            .query_pairs()
            .find(|(k, _)| k == "code")
            .unwrap()
            .1
            .into_owned();
        let response = exchange_code(&code);
        assert_eq!(response.status, 200);
        let result: Value = serde_json::from_str(&response.body).unwrap();
        assert_eq!(result["scope"], "cedros:sites:create cedros:sites:read");
        assert!(db.borrow().rows[&id].0["siteId"].is_null());
        assert!(active(result["access_token"].as_str().unwrap()));
    });
}

#[test]
fn downscope_never_adds_an_unrequested_scope_or_accepts_empty_consent() {
    fixture(|db, login| {
        let response = authorize(&authorization());
        let destination = Url::parse(
            &response
                .headers
                .iter()
                .find(|(k, _)| k == "location")
                .unwrap()
                .1,
        )
        .unwrap();
        let id = destination
            .query_pairs()
            .find(|(k, _)| k == "request_id")
            .unwrap()
            .1
            .into_owned();
        let path = format!("/oauth/requests/{id}");
        let info: Value =
            serde_json::from_str(&request_info(&request("GET", &path, "", Some(&login))).body)
                .unwrap();
        for scopes in [
            value!([]),
            value!(["cedros:sites:create"]),
            value!(["admin:*"]),
            value!(["cedros:sites:read cedros:sites:create"]),
        ] {
            let body = value!({"decision":"approve","csrfToken":info["csrfToken"],"scopes":scopes})
                .to_string();
            let response = decide(&request("POST", &path, &body, Some(&login)));
            assert_eq!(response.status, 400, "{}", response.body);
            assert_eq!(db.borrow().rows[&id].0["status"], "pending");
        }
    });
}

#[test]
fn disconnecting_pending_consent_does_not_revoke_browser_session() {
    fixture(|db, login| {
        let response = authorize(&authorization());
        let destination = Url::parse(
            &response
                .headers
                .iter()
                .find(|(k, _)| k == "location")
                .unwrap()
                .1,
        )
        .unwrap();
        let id = destination
            .query_pairs()
            .find(|(k, _)| k == "request_id")
            .unwrap()
            .1
            .into_owned();
        let path = format!("/oauth/requests/{id}");
        assert_eq!(
            request_info(&request("GET", &path, "", Some(&login))).status,
            200
        );
        let response = disconnect(&request(
            "DELETE",
            &format!("/oauth/connections/{id}"),
            "",
            Some(&login),
        ));
        assert_eq!(response.status, 400);
        assert_eq!(db.borrow().rows[&id].0["status"], "pending");
        assert!(!db.borrow().rows.contains_key("session-1"));
    });
}

#[test]
fn strict_consent_credentials_reject_ambiguous_or_malformed_fallback() {
    fixture(|db, login| {
        let response = authorize(&authorization());
        let url = Url::parse(
            &response
                .headers
                .iter()
                .find(|(k, _)| k == "location")
                .unwrap()
                .1,
        )
        .unwrap();
        let id = url
            .query_pairs()
            .find(|(k, _)| k == "request_id")
            .unwrap()
            .1
            .into_owned();
        let path = format!("/oauth/requests/{id}");
        for headers in [
            vec![
                ("authorization", "Basic bad".into()),
                ("cookie", format!("cedros_access={login}")),
            ],
            vec![
                ("authorization", format!("Bearer {login}")),
                ("Authorization", format!("Bearer {login}")),
            ],
            vec![(
                "cookie",
                format!("cedros_access={login}; cedros_access={login}"),
            )],
            vec![
                ("cookie", format!("cedros_access={login}")),
                ("Cookie", format!("cedros_access={login}")),
            ],
            vec![
                ("authorization", format!("Bearer {login}")),
                ("cookie", "cedros_access=different".into()),
            ],
            vec![("authorization", format!("Bearer  {login}"))],
        ] {
            let mut r = request("GET", &path, "", None);
            r.headers = headers
                .into_iter()
                .map(|(key, value)| (key.into(), value))
                .collect();
            assert_eq!(request_info(&r).status, 401);
            assert!(db.borrow().rows[&id].0["identity"].is_null());
            r.method = "POST".into();
            r.query.clear();
            r.body = value!({"decision":"deny","csrfToken":"guess","organizationId":"org-1"})
                .to_string();
            assert_eq!(decide(&r).status, 401);
        }
        let mut good = request("GET", &path, "", None);
        good.headers
            .push(("cookie".into(), format!("cedros_access={login}")));
        assert_eq!(request_info(&good).status, 200);
    });
}

#[test]
fn competing_authenticated_code_and_refresh_cas_winners_are_revoked() {
    for is_refresh in [false, true] {
        fixture(|db, login| {
            let (id, code) = consent(&login);
            let first: Value = if is_refresh {
                serde_json::from_str(&exchange_code(&code).body).unwrap()
            } else {
                Value::Null
            };
            db.borrow_mut().compete_next_oauth_cas = true;
            let response = if is_refresh {
                refresh(first["refresh_token"].as_str().unwrap())
            } else {
                exchange_code(&code)
            };
            assert_eq!(response.status, 400, "{}", response.body);
            assert!(!response.body.contains("access_token"));
            let db = db.borrow();
            let grant = &db.rows[&id].0;
            assert_eq!(grant["status"], "revoked");
            assert_eq!(grant["cleanupState"], "pending");
            assert!(db.rows[grant["identity"]["sid"].as_str().unwrap()].0["revokedAt"].is_string());
        });
    }
}

fn accept_cleanup() {
    cleanup::TEST_RESPONSE.with_borrow_mut(|response| {
        *response = Some(Ok(
            crate::cedros::extension::extension_services::ServiceResponse {
                status: 200,
                headers: vec![],
                body: r#"{"contractVersion":1,"accepted":true}"#.into(),
            },
        ))
    });
}
fn due(db: &Rc<RefCell<Database>>, id: &str) {
    db.borrow_mut().rows.get_mut(id).unwrap().0["cleanupCheckAt"] = value!(clock::ago_iso(1));
}
#[test]
fn disconnect_cleanup_is_durable_secret_free_and_retried_after_restart() {
    fixture(|db, login| {
        let (id, code) = consent(&login);
        let tokens: Value = serde_json::from_str(&exchange_code(&code).body).unwrap();
        assert_eq!(
            disconnect(&request(
                "DELETE",
                &format!("/oauth/connections/{id}"),
                "",
                Some(&login)
            ))
            .status,
            200
        );
        assert!(!active(tokens["access_token"].as_str().unwrap()));
        assert_eq!(db.borrow().rows[&id].0["cleanupState"], "pending");
        assert_eq!(db.borrow().rows[&id].0["cleanupProtocolVersion"], 1);
        let sent = cleanup::TEST_REQUESTS.with_borrow(|requests| {
            assert_eq!(requests.len(), 1);
            let r = &requests[0];
            assert_eq!(r.target_extension_id, "cedros-data");
            assert_eq!(r.capability_id, "cedros-data:mcp-connection-revoke-v1");
            assert_eq!(r.route_id, r.capability_id);
            assert_eq!(r.path, "/runtime/mcp-connections/revoke-v1");
            assert_eq!(r.method, "POST");
            assert!(r.query.is_empty());
            r.body_json.clone()
        });
        let payload: Value = serde_json::from_str(&sent).unwrap();
        assert_eq!(payload.as_object().unwrap().len(), 8);
        assert_eq!(payload["oauthSubject"], "user-1");
        assert_eq!(payload["organizationId"], "org-1");
        assert_eq!(payload["oauthGrantId"], id);
        assert!(!sent.contains(&login));
        assert!(!sent.contains(tokens["refresh_token"].as_str().unwrap()));
        // A retry requires only persisted grant facts, even after user/session
        // invalidation and with no original browser or OAuth credential.
        db.borrow_mut().suspended = true;
        due(&db, &id);
        accept_cleanup();
        let report = cleanup::run().unwrap();
        assert_eq!(report.accepted, 1);
        assert_eq!(db.borrow().rows[&id].0["cleanupState"], "accepted");
        assert!(db.borrow().rows[&id].0["cleanupCheckAt"].is_null());
        cleanup::TEST_REQUESTS.with_borrow(|requests| assert_eq!(requests[1].body_json, sent));
        assert_eq!(cleanup::run().unwrap().checked, 0);
    });
}
#[test]
fn cleanup_acknowledgement_loss_and_bad_response_never_erase_pending_work() {
    fixture(|db, login| {
        let (id, _) = consent(&login);
        accept_cleanup();
        db.borrow_mut().fail_accepted_cas_once = true;
        assert_eq!(
            disconnect(&request(
                "DELETE",
                &format!("/oauth/connections/{id}"),
                "",
                Some(&login)
            ))
            .status,
            200
        );
        assert_eq!(db.borrow().rows[&id].0["cleanupState"], "pending");
        due(&db, &id);
        cleanup::TEST_RESPONSE.with_borrow_mut(|response| {
            *response = Some(Ok(
                crate::cedros::extension::extension_services::ServiceResponse {
                    status: 200,
                    headers: vec![],
                    body: r#"{"accepted":true}"#.into(),
                },
            ))
        });
        assert_eq!(cleanup::run().unwrap().failed, 1);
        assert_eq!(db.borrow().rows[&id].0["cleanupState"], "pending");
        assert!(
            db.borrow().rows[&id].0["cleanupCheckAt"].as_str().unwrap() > clock::now_iso().as_str()
        );
        due(&db, &id);
        accept_cleanup();
        assert_eq!(cleanup::run().unwrap().accepted, 1);
    });
}
#[test]
fn scheduled_cleanup_detects_admin_session_suspension_role_and_expiry_changes() {
    for mode in 0..4 {
        fixture(|db, login| {
            let (id, code) = consent(&login);
            assert_eq!(exchange_code(&code).status, 200);
            match mode {
                0 => db.borrow_mut().revoked = true,
                1 => db.borrow_mut().suspended = true,
                2 => db.borrow_mut().role_changed = true,
                3 => {
                    db.borrow_mut().rows.get_mut(&id).unwrap().0["expiresAt"] =
                        value!(clock::ago_iso(1))
                }
                _ => unreachable!(),
            }
            due(&db, &id);
            accept_cleanup();
            assert_eq!(cleanup::run().unwrap().accepted, 1);
            assert_eq!(db.borrow().rows[&id].0["status"], "revoked");
        });
    }
}
#[test]
fn expired_cleanup_is_retained_until_durable_host_acceptance() {
    fixture(|db, login| {
        let (id, _) = consent(&login);
        assert_eq!(
            disconnect(&request(
                "DELETE",
                &format!("/oauth/connections/{id}"),
                "",
                Some(&login)
            ))
            .status,
            200
        );
        db.borrow_mut().rows.get_mut(&id).unwrap().0["expiresAt"] = value!(clock::ago_iso(1));
        assert_eq!(store::sweep_expired(&clock::now_iso(), 50).unwrap(), 0);
        assert!(db.borrow().rows.contains_key(&id));
        due(&db, &id);
        accept_cleanup();
        assert_eq!(cleanup::run().unwrap().accepted, 1);
        assert_eq!(store::sweep_expired(&clock::now_iso(), 50).unwrap(), 1);
        assert!(!db.borrow().rows.contains_key(&id));
    });
}

#[test]
fn live_connection_maintenance_only_reschedules_and_retains_original_binding() {
    fixture(|db, login| {
        let (id, code) = consent(&login);
        assert_eq!(exchange_code(&code).status, 200);
        let before = db.borrow().rows[&id].0.clone();
        due(&db, &id);
        let report = cleanup::run().unwrap();
        assert_eq!(report.checked, 1);
        assert_eq!(report.accepted, 0);
        assert_eq!(report.failed, 0);
        let after = db.borrow().rows[&id].0.clone();
        for key in [
            "identity",
            "issuer",
            "clientId",
            "resource",
            "expiresAt",
            "siteId",
            "runtimeSiteId",
            "cleanupProtocolVersion",
        ] {
            assert_eq!(after[key], before[key]);
        }
        assert_eq!(after["status"], "active");
        assert!(after["cleanupCheckAt"].as_str().unwrap() > clock::now_iso().as_str());
        cleanup::TEST_REQUESTS.with_borrow(|requests| assert!(requests.is_empty()));
    });
}

#[test]
fn proven_old_refresh_reconciles_rotation_racing_its_revocation() {
    fixture(|db, login| {
        let (id, code) = consent(&login);
        let first: Value = serde_json::from_str(&exchange_code(&code).body).unwrap();
        let old = first["refresh_token"].as_str().unwrap();
        assert_eq!(refresh(old).status, 200);
        db.borrow_mut().compete_next_revoke_cas = true;
        assert_eq!(refresh(old).status, 400);
        assert_eq!(db.borrow().rows[&id].0["status"], "revoked");
        assert_eq!(db.borrow().rows[&id].0["cleanupState"], "pending");
    });
}

#[test]
fn explicit_second_organization_binds_grant_instead_of_jwt_first_membership() {
    fixture(|db, token| {
        let c = connection();
        store::create(&c).unwrap();
        let path = format!("/oauth/requests/{}", c.id);
        let mut get = request("GET", &path, "", Some(&token));
        get.query = vec![("organizationId".into(), "org-2".into())];
        let info = request_info(&get);
        assert_eq!(info.status, 200, "{}", info.body);
        let info: Value = serde_json::from_str(&info.body).unwrap();
        assert_eq!(info["organizationId"], "org-2");
        let body =
            value!({"decision":"approve","csrfToken":info["csrfToken"],"organizationId":"org-2"});
        let result = decide(&request("POST", &path, &body.to_string(), Some(&token)));
        assert_eq!(result.status, 200, "{}", result.body);
        let saved = &db.borrow().rows[&c.id].0;
        assert_eq!(saved["identity"]["org_id"], "org-2");
        assert_eq!(saved["identity"]["role"], "owner");
    });
}

#[test]
fn consent_selection_cannot_switch_disappear_change_role_or_race_approval() {
    for scenario in ["switch", "removed", "role", "race"] {
        fixture(|db, token| {
            let c = connection();
            store::create(&c).unwrap();
            let path = format!("/oauth/requests/{}", c.id);
            let mut get = request("GET", &path, "", Some(&token));
            get.query = vec![("organizationId".into(), "org-2".into())];
            let info = request_info(&get);
            assert_eq!(info.status, 200, "{}", info.body);
            let info: Value = serde_json::from_str(&info.body).unwrap();
            match scenario {
                "removed" => db.borrow_mut().second_membership_removed = true,
                "role" => db.borrow_mut().second_role_changed = true,
                "race" => db.borrow_mut().revoke_second_on_approve = true,
                _ => {}
            }
            let body = value!({"decision":"approve","csrfToken":info["csrfToken"],"organizationId":if scenario == "switch" { "org-1" } else { "org-2" }});
            let result = decide_inner(&request("POST", &path, &body.to_string(), Some(&token)));
            assert!(result.is_err(), "{scenario}: stale consent succeeded");
            assert_eq!(db.borrow().rows[&c.id].0["status"], "pending");
        });
    }
}

#[test]
fn consent_requires_one_explicit_current_organization() {
    fixture(|_, token| {
        let c = connection();
        store::create(&c).unwrap();
        let path = format!("/oauth/requests/{}", c.id);
        for query in [
            vec![],
            vec![("organizationId".into(), "removed".into())],
            vec![
                ("organizationId".into(), "org-2".into()),
                ("organizationId".into(), "org-1".into()),
            ],
        ] {
            let mut get = request("GET", &path, "", Some(&token));
            get.query = query;
            assert!(request_info(&get).status >= 400);
        }
    });
}

#[test]
fn approval_transaction_has_exact_declared_composite_model_authority() {
    let manifest: Value =
        serde_json::from_str(include_str!("../../../../cedros-extension.manifest.json")).unwrap();
    let access = manifest["databaseAccess"]
        .as_array()
        .unwrap()
        .iter()
        .find(|access| access["id"] == db::OAUTH_CONSENT_DB)
        .unwrap();
    assert_eq!(
        access["contentModels"],
        value!([
            "cedros-login:oauth-connections",
            "cedros-login:users",
            "cedros-login:sessions",
            "cedros-login:memberships"
        ])
    );
    assert!(access["migrations"].as_array().unwrap().is_empty());
}

#[test]
fn config_read_reports_missing_configuration_without_hiding_admin_denial() {
    key_value_test_support::with_values(
        |_, _| Ok(None),
        || {
            let mut r = request("GET", "/admin/oauth", "", None);
            r.context_json =
                value!({"actorId":"admin-1","authenticated":true,"systemAdmin":true}).to_string();
            let response = config_get(&r);
            assert_eq!(response.status, 503);
            let body: Value = serde_json::from_str(&response.body).unwrap();
            assert_eq!(body["error"], "oauth_not_configured");
            assert_eq!(body["code"], "oauth_not_configured");
            r.context_json = value!({"actorId":"user-1","authenticated":true}).to_string();
            assert_eq!(config_get(&r).status, 403);
        },
    );
}
