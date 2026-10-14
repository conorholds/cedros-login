use crate::api_support::*;

#[tokio::test]
async fn test_health_check() {
    let app = create_test_app().await;

    let (status, body) = json_request(app, Method::GET, "/health", None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["status"], "degraded");
    assert_eq!(body["emailDelivery"], "unavailable");
}

#[tokio::test]
async fn compatibility_router_readiness_fails_closed_without_host_delivery_claim() {
    let mut config = test_config();
    config.notification.environment = "production".to_string();
    let app = router_with_storage(
        config,
        Arc::new(NoopCallback),
        create_seeded_storage().await,
    );

    let (status, body) = json_request(app, Method::GET, "/ready", None).await;

    assert_eq!(status, StatusCode::SERVICE_UNAVAILABLE);
    assert_eq!(body["status"], "degraded");
    assert_eq!(body["emailDelivery"], "unavailable");
}

#[tokio::test]
async fn explicit_provider_delivery_enables_readiness() {
    let mut config = test_config();
    config.notification.environment = "production".to_string();
    let app = router_with_storage_and_email_delivery(
        config,
        Arc::new(NoopCallback),
        create_seeded_storage().await,
        EmailDeliveryCapability::Delivering,
    );

    let (status, body) = json_request(app, Method::GET, "/ready", None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["status"], "healthy");
    assert_eq!(body["emailDelivery"], "provider");
}

// =============================================================================
// Auth Method Flags
// =============================================================================

#[tokio::test]
async fn test_email_disabled_returns_not_found() {
    let mut config = test_config();
    config.email.enabled = false;
    let app = create_test_app_with_config(config).await;

    let (status, _) = json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({
            "email": "disabled@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_google_disabled_returns_not_found() {
    let mut config = test_config();
    config.google.enabled = false;
    let app = create_test_app_with_config(config).await;

    let (status, _) = json_request(
        app,
        Method::POST,
        "/google",
        Some(json!({
            "idToken": "test-token"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_solana_disabled_returns_not_found() {
    let mut config = test_config();
    config.solana.enabled = false;
    let app = create_test_app_with_config(config).await;

    let (status, _) = json_request(
        app,
        Method::POST,
        "/solana/challenge",
        Some(json!({
            "publicKey": "invalid"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_forgot_password_per_email_rate_limit() {
    let app = create_test_app().await;
    let max_attempts = LoginAttemptConfig::default().max_attempts;
    let body = json!({"email": "ratelimit@example.com"});

    for _ in 0..max_attempts.saturating_sub(1) {
        let (status, _) = json_request(
            app.clone(),
            Method::POST,
            "/forgot-password",
            Some(body.clone()),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
    }

    let (status, _) = json_request(app, Method::POST, "/forgot-password", Some(body)).await;
    // Forgot-password keeps a generic success response shape even when throttled
    // so lockout state cannot be used to enumerate real accounts.
    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn test_forgot_password_nonexistent_email_behavior() {
    let app = create_test_app().await;
    let max_attempts = LoginAttemptConfig::default().max_attempts;
    let body = json!({"email": "does-not-exist@example.com"});

    for _ in 0..=max_attempts {
        let (status, response) = json_request(
            app.clone(),
            Method::POST,
            "/forgot-password",
            Some(body.clone()),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(
            response["message"],
            "If an account exists, a reset email has been sent"
        );
    }
}

#[tokio::test]
async fn test_instant_link_per_email_rate_limit() {
    let app = create_test_app().await;
    let max_attempts = LoginAttemptConfig::default().max_attempts;
    let body = json!({"email": "ratelimit@example.com"});

    for _ in 0..max_attempts.saturating_sub(1) {
        let (status, _) = json_request(
            app.clone(),
            Method::POST,
            "/instant-link",
            Some(body.clone()),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
    }

    let (status, _) = json_request(app, Method::POST, "/instant-link", Some(body)).await;
    assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
}

// =============================================================================
// Registration Tests
// =============================================================================

#[tokio::test]
async fn test_register_success() {
    let app = create_test_app().await;

    let (status, body) = json_request(
        app,
        Method::POST,
        "/register",
        Some(json!({
            "email": "test@example.com",
            "password": "SecurePassword1!",
            "name": "Test User"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert!(body["user"]["id"].is_string());
    assert_eq!(body["user"]["email"], "test@example.com");
    assert_eq!(body["user"]["name"], "Test User");
    assert_eq!(body["isNewUser"], true);
    assert!(body["tokens"]["accessToken"].is_string());
    assert!(body["tokens"]["refreshToken"].is_string());
}

#[tokio::test]
async fn test_register_weak_password() {
    let app = create_test_app().await;

    let (status, body) = json_request(
        app,
        Method::POST,
        "/register",
        Some(json!({
            "email": "test@example.com",
            "password": "weak"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "VALIDATION_ERROR");
}

#[tokio::test]
async fn test_register_invalid_email() {
    let app = create_test_app().await;

    let (status, body) = json_request(
        app,
        Method::POST,
        "/register",
        Some(json!({
            "email": "invalid-email",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "VALIDATION_ERROR");
}

#[tokio::test]
async fn test_register_duplicate_email() {
    let app = create_test_app().await;

    // Register first user
    let (status, _) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "duplicate@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);

    // Try to register with same email
    let (status, body) = json_request(
        app,
        Method::POST,
        "/register",
        Some(json!({
            "email": "duplicate@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(body["code"], "EMAIL_EXISTS");
}

// =============================================================================
// Login Tests
// =============================================================================

#[tokio::test]
async fn test_login_success() {
    let app = create_test_app().await;

    // Register first
    json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "login@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    // Login
    let (status, body) = json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({
            "email": "login@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["user"]["email"], "login@example.com");
    assert_eq!(body["isNewUser"], false);
    assert!(body["tokens"]["accessToken"].is_string());
}

#[tokio::test]
async fn test_native_admin_hash_import_requires_host_activation() {
    let app = router_with_storage(test_config(), Arc::new(NoopCallback), Storage::in_memory());

    let import_body = json!({
        "email": "owner@example.com",
        "passwordHash": "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$nhb9JHf9knLxhw2tOV70EvJ6zp/9VkvBAzCldwZS3r0",
        "passwordHashScheme": "cedros-login:argon2id-phc:v1",
        "name": "Site Owner",
        "orgName": "Cedros Data Site"
    });
    let (import_status, import_response) = json_request(
        app.clone(),
        Method::POST,
        "/setup/admin/import",
        Some(import_body.clone()),
    )
    .await;
    assert_eq!(import_status, StatusCode::FORBIDDEN);
    assert_eq!(import_response["code"], "FORBIDDEN");

    let (status, body) = json_request(app.clone(), Method::GET, "/setup/status", None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["needsSetup"], true);

    let (setup_status, setup_response) = json_request(
        app.clone(),
        Method::POST,
        "/setup/admin",
        Some(json!({
            "email": "owner@example.com",
            "password": "NativeSetupPassword1!",
            "name": "Site Owner",
            "orgName": "Cedros Data Site"
        })),
    )
    .await;
    assert_eq!(setup_status, StatusCode::CREATED);
    assert_eq!(setup_response["success"], true);

    let (retry_status, retry_response) =
        json_request(app, Method::POST, "/setup/admin/import", Some(import_body)).await;
    assert_eq!(retry_status, StatusCode::FORBIDDEN);
    assert_eq!(retry_response["code"], "FORBIDDEN");
}

#[tokio::test]
async fn test_setup_admin_enforces_normal_password_policy() {
    let app = router_with_storage(test_config(), Arc::new(NoopCallback), Storage::in_memory());
    let invalid_passwords = [
        "Short1!",      // below the normal minimum length
        "lowercase1!",  // missing uppercase
        "UPPERCASE1!",  // missing lowercase
        "NoNumber!!",   // missing number
        "NoSpecial12",  // missing special character
        "Password123!", // common base password
    ];

    for password in invalid_passwords {
        let (status, body) = json_request(
            app.clone(),
            Method::POST,
            "/setup/admin",
            Some(json!({
                "email": "owner@example.com",
                "password": password
            })),
        )
        .await;

        assert_eq!(status, StatusCode::BAD_REQUEST, "password: {password}");
        assert_eq!(body["code"], "VALIDATION_ERROR", "password: {password}");
    }

    let (status, body) = json_request(app, Method::GET, "/setup/status", None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["needsSetup"], true);
}

#[tokio::test]
async fn test_login_wrong_password() {
    let app = create_test_app().await;

    // Register first
    json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "wrongpass@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    // Login with wrong password
    let (status, body) = json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({
            "email": "wrongpass@example.com",
            "password": "WrongPassword1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::UNAUTHORIZED);
    assert_eq!(body["code"], "INVALID_CREDENTIALS");
}

#[tokio::test]
async fn test_login_nonexistent_user() {
    let app = create_test_app().await;

    let (status, body) = json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({
            "email": "nonexistent@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::UNAUTHORIZED);
    assert_eq!(body["code"], "INVALID_CREDENTIALS");
}

#[tokio::test]
async fn test_send_verification_response_is_generic() {
    let app = create_test_app().await;

    let (status_unknown, body_unknown) = json_request(
        app.clone(),
        Method::POST,
        "/send-verification",
        Some(json!({ "email": "unknown@example.com" })),
    )
    .await;
    assert_eq!(status_unknown, StatusCode::OK);

    let (register_status, _register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "known@example.com",
            "password": "SecurePassword1!",
            "name": "Known User"
        })),
    )
    .await;
    assert_eq!(register_status, StatusCode::CREATED);

    let (status_known, body_known) = json_request(
        app,
        Method::POST,
        "/send-verification",
        Some(json!({ "email": "known@example.com" })),
    )
    .await;
    assert_eq!(status_known, StatusCode::OK);
    assert_eq!(body_unknown, body_known);
}
