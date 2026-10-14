use crate::exports::cedros::extension::routes::RouteRequest;

use super::super::handle;

fn request(method: &str, path: &str, route_id: &str) -> RouteRequest {
    RouteRequest {
        route_id: route_id.to_string(),
        method: method.to_string(),
        path: path.to_string(),
        headers: vec![],
        query: vec![],
        body: String::new(),
        context_json: r#"{"clientIp":"203.0.113.7"}"#.into(),
    }
}

fn assert_invalid_body(response: crate::exports::cedros::extension::routes::RouteResponse) {
    assert_eq!(response.status, 400);
    assert_eq!(response.body, r#"{"error":"invalid_body"}"#);
}

#[test]
fn canonical_registered_path_dispatches_to_handler_behavior() {
    let response = handle(request(
        "POST",
        "/extensions/cedros-login/login/mfa",
        "cedros-login:login-mfa",
    ));

    assert_invalid_body(response);
}

#[test]
fn public_auth_alias_path_reuses_canonical_handler_behavior() {
    let canonical = handle(request(
        "POST",
        "/extensions/cedros-login/login/mfa",
        "cedros-login:login-mfa",
    ));
    let alias = handle(request(
        "POST",
        "/extensions/cedros-login/public-auth/login/mfa",
        "cedros-login:public-auth-login-mfa",
    ));

    assert_eq!(alias.status, canonical.status);
    assert_eq!(alias.body, canonical.body);
}

#[test]
fn unknown_route_id_does_not_block_method_path_dispatch() {
    let response = handle(request(
        "POST",
        "/extensions/cedros-login/login/mfa",
        "cedros-login:does-not-exist",
    ));

    assert_invalid_body(response);
}

#[test]
fn mismatched_route_id_cannot_force_a_wrong_handler() {
    let response = handle(request(
        "POST",
        "/extensions/cedros-login/login/mfa",
        "cedros-login:refresh",
    ));

    assert_invalid_body(response);
}

#[test]
fn route_id_cannot_force_handler_for_unknown_path() {
    let response = handle(request(
        "POST",
        "/extensions/cedros-login/not-login-mfa",
        "cedros-login:login-mfa",
    ));

    assert_eq!(response.status, 404);
    assert_eq!(response.body, r#"{"error":"not_found"}"#);
}
