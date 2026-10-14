use super::ROUTES;
use std::collections::HashSet;

#[test]
fn route_ids_and_method_paths_are_unique() {
    let mut ids = HashSet::new();
    let mut pairs = HashSet::new();

    for route in ROUTES {
        assert!(ids.insert(route.id), "duplicate route id {}", route.id);
        assert!(
            pairs.insert((route.method, route.path)),
            "duplicate route pair {} {}",
            route.method,
            route.path
        );
    }
}

#[test]
fn to_wit_template_converts_each_colon_param_segment() {
    assert_eq!(
        super::to_wit_template("/orgs/:org_id/members/:user_id"),
        "/orgs/{org_id}/members/{user_id}"
    );
    assert_eq!(super::to_wit_template("/orgs"), "/orgs");
}

#[test]
fn find_matches_registered_template_params() {
    let route = super::find("PATCH", "/orgs/org_1/members/user_1").expect("members update route");
    assert_eq!(route.id, "cedros-login:members-update");

    assert!(
        super::find("PATCH", "/orgs/org_1/members/").is_none(),
        "empty wildcard segments must not match registered templates"
    );
    assert!(
        super::find("GET", "/orgs/org_1/members/user_1").is_none(),
        "method mismatches must not dispatch"
    );
}

#[test]
fn find_prefers_literal_templates_over_parameter_templates() {
    let users_count = super::find("GET", "/v1/users/count").expect("users count route");
    assert_eq!(users_count.id, "cedros-login:relying-party-users-count");

    let users_stats = super::find("GET", "/admin/users/stats").expect("users stats route");
    assert_eq!(users_stats.id, "cedros-login:admin-users-stats");
}

#[test]
fn list_emits_brace_templates_so_the_host_router_binds_params() {
    // The host's path_matches_template only treats `{name}` as a wildcard;
    // a `:name` segment would bind literally and 404 every request.
    let specs = super::list();
    for spec in &specs {
        assert!(
            !spec.path.contains("/:"),
            "{} emits a colon param the host cannot match: {}",
            spec.route_id,
            spec.path
        );
    }
    let user_get = specs
        .iter()
        .find(|s| s.route_id == "cedros-login:relying-party-user-get")
        .expect("relying-party-user-get route");
    assert_eq!(user_get.path, "/v1/users/{user_id}");
}

#[test]
fn registry_routes_match_the_published_manifest() {
    // The host binds a wasm route only when its id is declared in the
    // manifest's `surfaces.server.routes[]`, and `bind_wasm_extension_routes`
    // fails closed for the WHOLE extension if `list-routes` returns an
    // undeclared id (one mismatch => every route 404s). These two lists are
    // hand-maintained in separate crates, so guard them against drift here.
    const MANIFEST: &str = include_str!("../../../cedros-extension.manifest.json");
    let manifest: serde_json::Value =
        serde_json::from_str(MANIFEST).expect("manifest is valid JSON");
    let declared: HashSet<&str> = manifest["surfaces"]["server"]["routes"]
        .as_array()
        .expect("surfaces.server.routes is an array")
        .iter()
        .map(|v| v.as_str().expect("route id is a string"))
        .collect();
    let served: HashSet<&str> = ROUTES
        .iter()
        .map(|route| route.id)
        .chain(super::super::public_auth_registry::route_ids())
        .collect();

    let undeclared: Vec<&str> = served.difference(&declared).copied().collect();
    assert!(
        undeclared.is_empty(),
        "served routes missing from the manifest (host bind fails closed): {undeclared:?}"
    );
    let unserved: Vec<&str> = declared.difference(&served).copied().collect();
    assert!(
        unserved.is_empty(),
        "manifest declares routes the guest does not serve (runtime 404): {unserved:?}"
    );
}
