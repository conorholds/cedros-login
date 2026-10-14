use crate::api_cookie_support::*;
use crate::api_hybrid_support::request_with_hybrid_auth;
use crate::api_support::*;

#[tokio::test]
async fn test_hybrid_auth_requires_csrf() {
    let app = create_test_app_with_cookies().await;
    let csrf_cookie = fetch_csrf_cookie(app.clone()).await;
    let cookie_header = format!("XSRF-TOKEN={csrf_cookie}");

    // Register and get both tokens and cookies
    let (status, headers, body) = request_with_cookie(
        app.clone(),
        Method::POST,
        "/register",
        &cookie_header,
        Some(json!({
            "email": "hybrid-csrf@example.com",
            "password": "SecurePassword1!",
            "name": "Hybrid CSRF Test"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);

    // Get cookies from response
    let cookies = cookies_from_set_cookie(&headers);
    let access_cookie = cookies
        .get("cedros_access")
        .expect("Access cookie not found");

    // Get access token from response body or use the cookie value as token
    let access_token = body["tokens"]["accessToken"]
        .as_str()
        .map(|s| s.to_string())
        .unwrap_or_else(|| access_cookie.clone());

    // Build cookie string with access cookie but NO CSRF token
    let cookie_without_csrf = format!("cedros_access={access_cookie}");

    // Hybrid auth request WITHOUT CSRF token should be BLOCKED
    // Note: GET is a safe method and doesn't require CSRF, so use POST /logout
    let (status, _, body) = request_with_hybrid_auth(
        app.clone(),
        Method::POST,
        "/logout",
        &access_token,
        &cookie_without_csrf,
        false, // No CSRF
        None,
    )
    .await;

    assert_eq!(
        status,
        StatusCode::FORBIDDEN,
        "Hybrid auth POST without CSRF should be blocked"
    );
    // Error message can be in "error" or "message" field
    let error_msg = body["error"]
        .as_str()
        .or_else(|| body["message"].as_str())
        .unwrap_or("");
    assert!(
        error_msg.contains("CSRF"),
        "Error should mention CSRF: {body:?}"
    );
}

/// Test that hybrid auth succeeds with valid CSRF token
#[tokio::test]
async fn test_hybrid_auth_succeeds_with_csrf() {
    let app = create_test_app_with_cookies().await;
    let csrf_cookie = fetch_csrf_cookie(app.clone()).await;
    let cookie_header = format!("XSRF-TOKEN={csrf_cookie}");

    // Register user
    let (status, headers, body) = request_with_cookie(
        app.clone(),
        Method::POST,
        "/register",
        &cookie_header,
        Some(json!({
            "email": "hybrid-success@example.com",
            "password": "SecurePassword1!",
            "name": "Hybrid Success"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);

    // Get cookies from response
    let cookies = cookies_from_set_cookie(&headers);
    let access_cookie = cookies
        .get("cedros_access")
        .expect("Access cookie not found");

    // Get access token from response body or use the cookie value
    let access_token = body["tokens"]["accessToken"]
        .as_str()
        .map(|s| s.to_string())
        .unwrap_or_else(|| access_cookie.clone());

    // Build cookie string WITH CSRF token
    let cookie_with_csrf = format!("cedros_access={access_cookie}; XSRF-TOKEN={csrf_cookie}");

    // Hybrid auth request WITH valid CSRF token should SUCCEED
    // Use POST /logout to test unsafe method with CSRF
    let (status, _, _body) = request_with_hybrid_auth(
        app,
        Method::POST,
        "/logout",
        &access_token,
        &cookie_with_csrf,
        true, // Include CSRF
        None,
    )
    .await;

    assert_eq!(
        status,
        StatusCode::OK,
        "Hybrid auth POST with valid CSRF should succeed"
    );
}

/// Test that pure token auth (no cookies) does NOT require CSRF
#[tokio::test]
async fn test_pure_token_auth_no_csrf_required() {
    let app = create_test_app_with_cookies().await;
    let csrf_cookie = fetch_csrf_cookie(app.clone()).await;
    let cookie_header = format!("XSRF-TOKEN={csrf_cookie}");

    // Register user to get a token
    let (status, headers, body) = request_with_cookie(
        app.clone(),
        Method::POST,
        "/register",
        &cookie_header,
        Some(json!({
            "email": "pure-token@example.com",
            "password": "SecurePassword1!",
            "name": "Pure Token"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);

    // Get cookies from response
    let cookies = cookies_from_set_cookie(&headers);
    let access_cookie = cookies
        .get("cedros_access")
        .expect("Access cookie not found");

    // Get access token from response body or use the cookie value
    let access_token = body["tokens"]["accessToken"]
        .as_str()
        .map(|s| s.to_string())
        .unwrap_or_else(|| access_cookie.clone());

    // Pure token auth: Authorization header ONLY, no cookies at all
    // Should succeed without CSRF even for POST (unsafe method)
    let (status, body) = auth_request(app, Method::POST, "/logout", &access_token, None).await;

    assert_eq!(
        status,
        StatusCode::OK,
        "Pure token auth POST should succeed without CSRF"
    );
    // Logout returns a simple message
    assert!(body["message"].as_str().is_some() || body["success"].as_bool() == Some(true));
}

// ============================================================================
// Router with Storage Tests
// ============================================================================

/// Test that router_with_storage works with custom in-memory storage
#[tokio::test]
async fn test_router_with_storage_custom_storage() {
    use cedros_login::{router_with_storage, Storage};

    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;

    let app = router_with_storage(config, callback, storage);

    // Should be able to register a user
    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "custom-storage@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert!(body["user"]["id"].is_string());
}

/// Test that router_with_storage shares state correctly across requests
#[tokio::test]
async fn test_router_with_storage_state_persistence() {
    use cedros_login::{router_with_storage, Storage};

    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;

    let app = router_with_storage(config, callback, storage);

    // Register user
    let (status, _) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "state-test@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);

    // Try to login - should work because state persists
    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/login",
        Some(json!({
            "email": "state-test@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert!(body["tokens"]["accessToken"].is_string());
}

/// Test that router_with_storage supports shared storage between instances
#[tokio::test]
async fn test_router_with_storage_shared_storage() {
    use cedros_login::{router_with_storage, Storage};

    let config1 = test_config();
    let config2 = test_config();
    let callback1 = Arc::new(NoopCallback);
    let callback2 = Arc::new(NoopCallback);

    // Create shared storage
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config1).await;
    let storage_clone = storage.clone();

    let app1 = router_with_storage(config1, callback1, storage);
    let app2 = router_with_storage(config2, callback2, storage_clone);

    // Register on app1
    let (status, _) = json_request(
        app1,
        Method::POST,
        "/register",
        Some(json!({
            "email": "shared-storage@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);

    // Should be able to login on app2 (shared storage)
    let (status, body) = json_request(
        app2,
        Method::POST,
        "/login",
        Some(json!({
            "email": "shared-storage@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert!(body["tokens"]["accessToken"].is_string());
}
