use super::*;

fn setup_request(path: &str, body: &str, context_json: &str) -> RouteRequest {
    RouteRequest {
        route_id: String::new(),
        method: "POST".to_string(),
        path: path.to_string(),
        headers: vec![],
        query: vec![],
        body: body.to_string(),
        context_json: context_json.to_string(),
    }
}

#[test]
fn status_response_uses_camelcase() {
    let json = serde_json::to_string(&SetupStatusResponse {
        needs_setup: true,
        has_admin: false,
        server_version: "0.0.0".to_string(),
    })
    .unwrap();
    assert!(json.contains("needsSetup"));
    assert!(json.contains("hasAdmin"));
    assert!(json.contains("serverVersion"));
}

#[test]
fn create_admin_fails_closed_without_host_admin_context() {
    let response = create_first_admin(&setup_request(
        "/setup/admin",
        r#"{"email":"admin@example.com","password":"secret123"}"#,
        "{}",
    ));

    assert_eq!(response.status, 401);
    assert!(response.body.contains("unauthenticated"));
}

#[test]
fn import_admin_fails_closed_without_host_admin_context() {
    let response = import_first_admin(&setup_request(
        "/setup/admin/import",
        r#"{"email":"admin@example.com","passwordHash":"$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$hash"}"#,
        "{}",
    ));

    assert_eq!(response.status, 401);
    assert!(response.body.contains("unauthenticated"));
}

#[test]
fn setup_admin_routes_reject_authenticated_non_admins() {
    let ctx = r#"{"actorId":"u_1","authenticated":true,"csrfVerified":true}"#;
    let create = create_first_admin(&setup_request(
        "/setup/admin",
        r#"{"email":"admin@example.com","password":"secret123"}"#,
        ctx,
    ));
    let import = import_first_admin(&setup_request(
        "/setup/admin/import",
        r#"{"email":"admin@example.com","passwordHash":"$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$hash"}"#,
        ctx,
    ));

    assert_eq!(create.status, 403);
    assert_eq!(import.status, 403);
    assert!(create.body.contains("admin_required"));
    assert!(import.body.contains("admin_required"));
}

#[test]
fn create_admin_enforces_normal_password_policy_before_storage() {
    let ctx = r#"{"actorId":"adm_1","authenticated":true,"systemAdmin":true,"csrfVerified":true}"#;
    let invalid_passwords = ["Short1!", "Password123!"];

    for password in invalid_passwords {
        let body = serde_json::json!({
            "email": "admin@example.com",
            "password": password,
        })
        .to_string();
        let response = create_first_admin(&setup_request("/setup/admin", &body, ctx));

        assert_eq!(response.status, 422, "password: {password}");
        assert!(response.body.contains("validation_failed"));
    }
}

#[test]
fn create_admin_request_parses_org_name() {
    let req: CreateFirstAdminRequest = serde_json::from_str(
        r#"{"email":"a@b.test","password":"secret123","orgName":"Acme Corp"}"#,
    )
    .unwrap();
    assert_eq!(req.email, "a@b.test");
    assert_eq!(req.org_name.as_deref(), Some("Acme Corp"));
    assert_eq!(req.name, None);
}

#[test]
fn import_admin_request_parses_hash_scheme() {
    let req: ImportFirstAdminRequest = serde_json::from_str(
        r#"{"email":"a@b.test","passwordHash":"$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$hash","passwordHashScheme":"argon2id-phc"}"#,
    )
    .unwrap();
    assert_eq!(req.email, "a@b.test");
    assert_eq!(req.password_hash_scheme.as_deref(), Some("argon2id-phc"));
}

#[test]
fn import_admin_hash_scheme_validation() {
    assert!(validate_password_hash_scheme(None).is_ok());
    assert!(validate_password_hash_scheme(Some("cedros-login:argon2id-phc:v1")).is_ok());
    assert!(validate_password_hash_scheme(Some("bcrypt")).is_err());
}

#[test]
fn first_admin_claim_batches_user_and_primary_email_conditionally() {
    let user: UserEntry = serde_json::from_value(serde_json::json!({
        "id":"admin-1", "email":"admin@example.com", "emailVerified":true,
        "passwordHash":"$argon2id$redacted", "name":null, "username":null,
        "picture":null, "walletAddress":null, "googleId":null, "appleId":null,
        "authMethods":["password"], "isSystemAdmin":true,
        "createdAt":"2026-07-10T00:00:00Z", "updatedAt":"2026-07-10T00:00:00Z",
        "lastLoginAt":"2026-07-10T00:00:00Z", "welcomeCompletedAt":null,
        "avatarContentType":null
    }))
    .unwrap();
    let json = serde_json::to_value(claim_first_admin_operation(&user).unwrap()).unwrap();
    assert_eq!(json["operationId"], "identity.setup.claim-first-admin");
    assert_eq!(json["params"]["user"]["entryKey"], "admin-1");
    assert_eq!(json["params"]["user"]["data"]["isSystemAdmin"], true);
    assert_eq!(
        json["params"]["email"]["data"]["email"],
        "admin@example.com"
    );
    assert_eq!(json["params"]["email"]["data"]["isPrimary"], true);
    assert!(json["params"]["email"]["data"]["verifiedAt"].is_string());
}

#[test]
fn already_configured_response_is_stable_for_host_retries() {
    let response = already_configured_response();
    assert_eq!(response.status, 200);
    assert!(response
        .body
        .contains(r#""code":"setup_already_configured""#));
    assert!(response.body.contains(r#""alreadyConfigured":true"#));
    assert!(response.body.contains(r#""success":true"#));
}

#[test]
fn already_configured_response_requires_org_repair() {
    let response = already_configured_after_org_repair(Ok("org-1".to_string())).unwrap();
    assert_eq!(response.status, 200);

    let failed = already_configured_after_org_repair(Err(SeamError::Settings(
        "default org missing".to_string(),
    )));
    assert!(matches!(
        failed,
        Err(RouteError::Seam(SeamError::Settings(_)))
    ));
}
