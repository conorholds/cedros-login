use super::*;
use crate::host::{db, key_value_test_support, DbConflictCategory, SeamError};
use serde_json::{json, Value};
use std::{
    cell::{Cell, RefCell},
    collections::HashMap,
    rc::Rc,
};

const TOKEN: &str = "data-service-fixture-token-at-least-32-bytes";

fn request(action: &str) -> RouteRequest {
    RouteRequest {
        route_id: ROUTE.into(),
        method: "POST".into(),
        path: PATH.into(),
        headers: vec![],
        query: vec![],
        body: json!({"action":action}).to_string(),
        context_json:
            json!({"authenticated":true,"authScheme":"bearer-token","capabilityClaims":[ROUTE]})
                .to_string(),
    }
}

fn fixture(
    initial: HashMap<String, String>,
    fail_token_once: bool,
    run: impl FnOnce(Rc<RefCell<HashMap<String, String>>>, Rc<Cell<usize>>),
) {
    let secrets_map = Rc::new(RefCell::new(initial));
    let reads = secrets_map.clone();
    let writes = secrets_map.clone();
    let count = Rc::new(Cell::new(0));
    let write_count = count.clone();
    let mut fail_token = fail_token_once;
    let mut pointers = HashMap::<String, Value>::new();
    key_value_test_support::with_values(
        move |seam, key| {
            assert_eq!(seam, "secrets");
            Ok(reads.borrow().get(key).cloned())
        },
        || {
            key_value_test_support::with_writes(
                move |key, value| {
                    write_count.set(write_count.get() + 1);
                    if key == token_key(DATA) && fail_token {
                        fail_token = false;
                        return Err(SeamError::Secrets("fixture write unavailable".into()));
                    }
                    writes.borrow_mut().insert(key.into(), value.into());
                    Ok(())
                },
                || {
                    db::test_support::with_db(
                        move |op, collection, query| {
                            assert_eq!(collection.model, "cedros-login:identity-records");
                            match op {
                                "read" => {
                                    let key = &query.entry_keys[0];
                                    Ok(
                                        json!({"entries":pointers.get(key).map(|payload|vec![json!({"entry_key":key,"payload":payload,"updated_at":"now","version":"1"})]).unwrap_or_default()}),
                                    )
                                }
                                "compare-and-set" => {
                                    let body = &query.filters[0].value;
                                    let key = body["conditions"][0]["entryKey"].as_str().unwrap();
                                    if pointers.contains_key(key) {
                                        return Err(SeamError::DbConflict {
                                            category: DbConflictCategory::Precondition,
                                            operation: "compare-and-set".into(),
                                        });
                                    }
                                    let data = body["ops"][0]["data"].clone();
                                    assert_eq!(data.as_object().unwrap().len(), 1);
                                    assert!(data["secretKey"]
                                        .as_str()
                                        .unwrap()
                                        .starts_with("rp_token:cedros-data:version:"));
                                    pointers.insert(key.into(), data);
                                    Ok(
                                        json!({"outcome":"applied","applied":1,"entries":[],"results":[],"replayed":false}),
                                    )
                                }
                                _ => panic!("unexpected relationship DB operation"),
                            }
                        },
                        || run(secrets_map, count),
                    )
                },
            )
        },
    );
}

#[test]
fn exact_bearer_capability_and_system_admin_write_are_the_only_authority() {
    let mut req = request("read");
    assert!(authorize(&req).is_ok());
    for context in [
        json!({}),
        json!({"authenticated":true,"permissionClaims":["*"],"csrfVerified":true}),
        json!({"authenticated":true,"authScheme":"cookie","capabilityClaims":[ROUTE]}),
        json!({"authenticated":true,"authScheme":"bearer-token","capabilityClaims":["cedros-login:admin-relying-parties-configure"]}),
        json!({"authenticated":true,"actorId":"operator","systemAdmin":true,"csrfVerified":false}),
    ] {
        req.context_json = context.to_string();
        assert!(authorize(&req).is_err());
    }
    req.context_json =
        json!({"authenticated":true,"actorId":"operator","systemAdmin":true,"csrfVerified":true})
            .to_string();
    assert!(authorize(&req).is_ok());
}

#[test]
fn first_use_provisions_only_membership_authority_and_retry_preserves_token() {
    fixture(HashMap::new(), false, |values, writes| {
        let before = handle(&request("read"));
        assert_eq!(before.status, 200);
        assert_eq!(
            from_json::<Value>(&before.body).unwrap()["relationship"]["ready"],
            false
        );
        assert_eq!(writes.get(), 0);
        let response = handle(&request("ensure"));
        assert_eq!(response.status, 200, "{}", response.body);
        let value: Value = from_json(&response.body).unwrap();
        assert_eq!(value["relationship"]["ready"], true);
        assert_eq!(value["membershipProbe"]["status"], 404);
        assert_eq!(value["membershipProbe"]["error"], "not_found");
        assert!(response
            .headers
            .iter()
            .any(|(k, v)| k == "cache-control" && v == "private, no-store"));
        let token = values.borrow()[&token_key(DATA)].clone();
        assert_eq!(token.len(), 64);
        assert!(!response.body.contains(&token));
        let policy: RelyingPartyPolicy = from_json(&values.borrow()[&policy_key(DATA)]).unwrap();
        assert_eq!(
            policy.scopes,
            vec![super::super::super::relying_party::SCOPE_MEMBERSHIPS_READ]
        );
        assert_eq!(policy.audiences, vec![DATA]);
        assert_eq!(policy.org_ids, vec!["*"]);
        assert!(policy.matches_token(&token));
        let count = writes.get();
        assert_eq!(handle(&request("ensure")).status, 200);
        assert_eq!(writes.get(), count);
        assert_eq!(values.borrow()[&token_key(DATA)], token);
    });
}

#[test]
fn policy_first_write_failure_is_denied_and_recovers_the_same_bootstrap_token() {
    fixture(HashMap::new(), true, |values, _| {
        assert!(matches!(
            handle_inner(&request("ensure")),
            Err(RouteError::Seam(_))
        ));
        assert!(!values.borrow().contains_key(&token_key(DATA)));
        let pending: RelyingPartyPolicy = from_json(&values.borrow()[&policy_key(DATA)]).unwrap();
        assert_eq!(handle(&request("read")).status, 200);
        let response = handle(&request("ensure"));
        assert_eq!(response.status, 200, "{}", response.body);
        let token = values.borrow()[&token_key(DATA)].clone();
        assert!(pending.matches_token(&token));
        assert!(!response.body.contains(&token));
    });
}

#[test]
fn incompatible_operator_policy_is_preserved_and_unknown_inputs_are_rejected() {
    let policy = to_json(&RelyingPartyPolicy {
        token_sha256: Some(RelyingPartyPolicy::token_digest(TOKEN)),
        scopes: vec!["users:read".into()],
        audiences: vec![DATA.into()],
        org_ids: vec!["org-1".into()],
    })
    .unwrap();
    fixture(
        HashMap::from([
            (token_key(DATA), TOKEN.into()),
            (policy_key(DATA), policy.clone()),
        ]),
        false,
        move |values, writes| {
            assert_eq!(handle(&request("ensure")).status, 409);
            assert_eq!(values.borrow()[&policy_key(DATA)], policy);
            assert_eq!(writes.get(), 0);
            for field in ["token", "organizationId", "scopes", "relyingPartyId"] {
                let mut req = request("ensure");
                let mut body = json!({"action":"ensure"});
                body[field] = json!("untrusted");
                req.body = body.to_string();
                assert_eq!(handle(&req).status, 400);
            }
            assert_eq!(writes.get(), 0);
        },
    );
}

#[test]
fn capability_claim_cannot_be_reused_for_another_route_or_query() {
    for invalid in [0, 1, 2] {
        let mut req = request("ensure");
        match invalid {
            0 => req.route_id = "cedros-login:admin-relying-parties-configure".into(),
            1 => req.path = "/admin/relying-parties/other".into(),
            _ => req.query.push(("action".into(), "ensure".into())),
        }
        assert_eq!(handle(&req).status, 400);
    }
}
