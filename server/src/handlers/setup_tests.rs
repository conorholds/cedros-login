use super::*;
use std::sync::atomic::{AtomicUsize, Ordering};
use tokio::time::{sleep, Duration};

#[test]
fn test_setup_status_serialization() {
    let status = SetupStatusResponse {
        needs_setup: true,
        has_admin: false,
        server_version: "1.0.0".to_string(),
    };
    let json = serde_json::to_string(&status).unwrap();
    assert!(json.contains("needsSetup"));
    assert!(json.contains("hasAdmin"));
}

#[test]
fn test_create_admin_request_deserialization() {
    let json = r#"{"email":"admin@example.com","password":"secret123","name":"Admin"}"#;
    let req: CreateFirstAdminRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.email, "admin@example.com");
    assert_eq!(req.password, "secret123");
    assert_eq!(req.name, Some("Admin".to_string()));
    assert_eq!(req.org_name, None);
}

#[test]
fn test_create_admin_request_with_org_name() {
    let json = r#"{"email":"admin@example.com","password":"secret123","orgName":"Acme Corp"}"#;
    let req: CreateFirstAdminRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.org_name, Some("Acme Corp".to_string()));
}

#[test]
fn test_import_admin_request_deserialization() {
    let json = r#"{"email":"admin@example.com","passwordHash":"$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$hash","passwordHashScheme":"argon2id-phc","name":"Admin"}"#;
    let req: ImportFirstAdminRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.email, "admin@example.com");
    assert_eq!(req.password_hash_scheme.as_deref(), Some("argon2id-phc"));
    assert_eq!(req.name, Some("Admin".to_string()));
}

#[test]
fn test_import_admin_hash_scheme_validation() {
    assert!(validate_password_hash_scheme(None).is_ok());
    assert!(validate_password_hash_scheme(Some("cedros-login:argon2id-phc:v1")).is_ok());
    assert!(validate_password_hash_scheme(Some("bcrypt")).is_err());
}

#[test]
fn setup_admin_requires_exact_high_entropy_operator_token() {
    let mut headers = axum::http::HeaderMap::new();
    let configured = "0123456789abcdef0123456789abcdef";

    assert!(require_setup_token(Some(configured), &headers).is_err());
    headers.insert(
        SETUP_TOKEN_HEADER,
        axum::http::HeaderValue::from_static("wrong-token-wrong-token-wrong-token"),
    );
    assert!(require_setup_token(Some(configured), &headers).is_err());
    headers.insert(
        SETUP_TOKEN_HEADER,
        axum::http::HeaderValue::from_static("0123456789abcdef0123456789abcdef"),
    );
    assert!(require_setup_token(Some(configured), &headers).is_ok());
    assert!(require_setup_token(Some("too-short"), &headers).is_err());
}

#[test]
fn test_slug_from_name() {
    assert_eq!(slug_from_name("My Organization"), "my-organization");
    assert_eq!(slug_from_name("Acme Corp!"), "acme-corp");
    assert_eq!(slug_from_name("  Hello  World  "), "hello-world");
}

#[tokio::test]
async fn test_setup_lock_serializes_concurrent_access() {
    let concurrent = Arc::new(AtomicUsize::new(0));
    let max_seen = Arc::new(AtomicUsize::new(0));

    let mut tasks = Vec::new();
    for _ in 0..8 {
        let concurrent = Arc::clone(&concurrent);
        let max_seen = Arc::clone(&max_seen);
        tasks.push(tokio::spawn(async move {
            let _guard = setup_admin_lock().lock().await;
            let now = concurrent.fetch_add(1, Ordering::SeqCst) + 1;
            max_seen.fetch_max(now, Ordering::SeqCst);
            sleep(Duration::from_millis(5)).await;
            concurrent.fetch_sub(1, Ordering::SeqCst);
        }));
    }

    for task in tasks {
        task.await.expect("task join");
    }

    assert_eq!(max_seen.load(Ordering::SeqCst), 1);
}
