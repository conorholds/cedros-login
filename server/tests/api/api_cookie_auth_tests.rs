use crate::api_cookie_support::*;
use crate::api_support::*;

#[tokio::test]
async fn test_register_sets_cookies() {
    let app = create_test_app_with_cookies().await;
    let csrf_cookie = fetch_csrf_cookie(app.clone()).await;
    let cookie_header = format!("XSRF-TOKEN={csrf_cookie}");

    let (status, headers, body) = request_with_cookie(
        app,
        Method::POST,
        "/register",
        &cookie_header,
        Some(json!({
            "email": "cookie-test@example.com",
            "password": "SecureCookiePass1!",
            "name": "Cookie Test"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert!(body["user"]["id"].is_string());

    // Check that Set-Cookie headers are present
    let set_cookie_headers: Vec<_> = headers.get_all(header::SET_COOKIE).iter().collect();
    assert!(
        set_cookie_headers.len() >= 2,
        "Expected Set-Cookie headers for access and refresh"
    );

    // Check access token cookie
    let cookies_str: String = set_cookie_headers
        .iter()
        .map(|h| h.to_str().unwrap())
        .collect::<Vec<_>>()
        .join("; ");

    assert!(
        cookies_str.contains("cedros_access="),
        "Access cookie should be set"
    );
    assert!(
        cookies_str.contains("cedros_refresh="),
        "Refresh cookie should be set"
    );
    assert!(
        cookies_str.contains("XSRF-TOKEN=") || !csrf_cookie.is_empty(),
        "CSRF cookie should be set or provided"
    );
    assert!(
        cookies_str.contains("HttpOnly"),
        "Cookies should be HttpOnly"
    );
    assert!(
        cookies_str.contains("SameSite=Lax"),
        "Cookies should have SameSite=Lax"
    );
}

#[tokio::test]
async fn test_register_requires_verification_blocks_login() {
    let mut config = test_config();
    config.email.require_verification = true;
    let app = create_test_app_with_config(config).await;

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "verify-required@example.com",
            "password": "SecureCookiePass1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert!(
        body.get("tokens").is_none() || body.get("tokens").unwrap().is_null(),
        "Tokens should be omitted when email verification is required"
    );
    assert!(
        body.get("apiKey").is_none() || body.get("apiKey").unwrap().is_null(),
        "API key should be omitted when email verification is required"
    );

    let (login_status, login_body) = json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({
            "email": "verify-required@example.com",
            "password": "SecureCookiePass1!"
        })),
    )
    .await;

    // Security hardening: login returns generic InvalidCredentials to avoid
    // revealing whether the password was correct for an unverified email.
    assert_eq!(login_status, StatusCode::UNAUTHORIZED);
    assert_eq!(login_body["message"], "Invalid credentials");
}

#[tokio::test]
async fn test_register_succeeds_when_verification_queue_fails() {
    let mut config = test_config();
    config.email.require_verification = true;
    let callback = Arc::new(NoopCallback);
    let mut storage = Storage::in_memory();
    seed_default_org(&storage).await;
    storage.outbox_repo = Arc::new(FailingOutboxRepository::new());
    let app = router_with_storage(config, callback, storage);

    let (status, body) = json_request(
        app,
        Method::POST,
        "/register",
        Some(json!({
            "email": "verify-queue-failure@example.com",
            "password": "SecureCookiePass1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert!(
        body.get("tokens").is_none() || body.get("tokens").unwrap().is_null(),
        "Tokens should be omitted when email verification is required"
    );
}

#[tokio::test]
async fn test_api_key_blocked_until_email_verified() {
    use cedros_login::repositories::{ApiKeyEntity, UserEntity};

    let mut config = test_config();
    config.email.require_verification = true;
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;

    let user = UserEntity::new_email_user(
        "unverified@example.com".to_string(),
        "hashed-password".to_string(),
        None,
    );
    let user_id = user.id;
    storage.user_repo.create(user).await.unwrap();

    let raw_key = cedros_login::repositories::generate_api_key();
    let api_key = ApiKeyEntity::new(user_id, &raw_key, "default");
    storage.api_key_repo.create(api_key).await.unwrap();

    let app = router_with_storage(config, callback, storage);
    let (status, body) = auth_request(app, Method::GET, "/user", &raw_key, None).await;

    assert_eq!(status, StatusCode::FORBIDDEN);
    assert_eq!(body["message"], "Email not verified");
}

#[tokio::test]
async fn test_password_change_rejects_api_key_and_preserves_sessions() {
    use cedros_login::repositories::{ApiKeyEntity, SessionEntity, UserEntity};
    use cedros_login::services::PasswordService;

    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    let storage_check = storage.clone();

    let password_service = PasswordService::default();
    let current_password = "OldPassword1!".to_string();
    let password_hash = password_service
        .hash(current_password.clone())
        .await
        .unwrap();

    let mut user = UserEntity::new_email_user(
        "api-key-password-change@example.com".to_string(),
        password_hash,
        None,
    );
    user.email_verified = true;
    let user_id = user.id;
    storage.user_repo.create(user).await.unwrap();

    let raw_key = cedros_login::repositories::generate_api_key();
    let api_key = ApiKeyEntity::new(user_id, &raw_key, "default");
    storage.api_key_repo.create(api_key).await.unwrap();

    let refresh_expiry = chrono::Utc::now() + chrono::Duration::hours(1);
    let session1 = SessionEntity::new(
        user_id,
        cedros_login::utils::hash_refresh_token("token1", &config.jwt.secret),
        refresh_expiry,
        None,
        None,
    );
    let session2 = SessionEntity::new(
        user_id,
        cedros_login::utils::hash_refresh_token("token2", &config.jwt.secret),
        refresh_expiry,
        None,
        None,
    );
    let session1_id = session1.id;
    let session2_id = session2.id;
    storage.session_repo.create(session1).await.unwrap();
    storage.session_repo.create(session2).await.unwrap();

    let app = router_with_storage(config, callback, storage);
    let (status, body) = auth_request(
        app,
        Method::POST,
        "/change-password",
        &raw_key,
        Some(json!({
            "currentPassword": "OldPassword1!",
            "newPassword": "NewPassword1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::FORBIDDEN, "response: {body:?}");
    assert_eq!(body["code"], "FORBIDDEN");
    assert_eq!(body["message"], "Interactive session required");
    assert!(!storage_check
        .session_repo
        .is_revoked(session1_id)
        .await
        .unwrap());
    assert!(!storage_check
        .session_repo
        .is_revoked(session2_id)
        .await
        .unwrap());
}

#[tokio::test]
async fn test_passkey_enrollment_rejects_api_key() {
    use cedros_login::repositories::{ApiKeyEntity, UserEntity};

    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;

    let mut user = UserEntity::new_email_user(
        "api-key-passkey-enrollment@example.com".to_string(),
        "hashed-password".to_string(),
        None,
    );
    user.email_verified = true;
    let user_id = user.id;
    storage.user_repo.create(user).await.unwrap();

    let raw_key = cedros_login::repositories::generate_api_key();
    storage
        .api_key_repo
        .create(ApiKeyEntity::new(user_id, &raw_key, "default"))
        .await
        .unwrap();

    let app = router_with_storage(config, callback, storage);
    let (status, body) = auth_request(
        app,
        Method::POST,
        "/webauthn/register/options",
        &raw_key,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::FORBIDDEN, "response: {body:?}");
    assert_eq!(body["code"], "FORBIDDEN");
    assert_eq!(body["message"], "Interactive session required");
}
