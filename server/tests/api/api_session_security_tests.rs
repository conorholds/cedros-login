use crate::api_support::*;

// =============================================================================
// Get User Tests
// =============================================================================

#[tokio::test]
async fn test_get_user_success() {
    let app = create_test_app().await;

    // Register and get token
    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "getuser@example.com",
            "password": "SecurePassword1!",
            "name": "Get User Test"
        })),
    )
    .await;

    let access_token = register_body["tokens"]["accessToken"].as_str().unwrap();

    // Get user
    let (status, body) = auth_request(app, Method::GET, "/user", access_token, None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["user"]["email"], "getuser@example.com");
    assert_eq!(body["user"]["name"], "Get User Test");
}

#[tokio::test]
async fn test_get_user_invalid_token() {
    let app = create_test_app().await;

    let (status, body) = auth_request(app, Method::GET, "/user", "invalid-token", None).await;

    assert_eq!(status, StatusCode::UNAUTHORIZED);
    assert_eq!(body["code"], "INVALID_TOKEN");
}

#[tokio::test]
async fn test_get_user_no_token() {
    let app = create_test_app().await;

    let (status, body) = json_request(app, Method::GET, "/user", None).await;

    assert_eq!(status, StatusCode::UNAUTHORIZED);
    assert_eq!(body["code"], "INVALID_TOKEN");
}

#[tokio::test]
async fn test_access_token_loses_authority_after_role_downgrade_and_membership_removal() {
    use cedros_login::repositories::OrgRole;

    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;
    let membership_repo = storage.membership_repo.clone();
    let app = router_with_storage(config, callback, storage);

    let (status, registered) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "role-change@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(
        status,
        StatusCode::CREATED,
        "registration failed: {registered}"
    );
    let user_id = uuid::Uuid::parse_str(registered["user"]["id"].as_str().unwrap()).unwrap();
    let initial_refresh = registered["tokens"]["refreshToken"].as_str().unwrap();
    let membership = membership_repo
        .find_by_user(user_id)
        .await
        .unwrap()
        .remove(0);

    membership_repo
        .update_role(membership.id, OrgRole::Admin)
        .await
        .unwrap();
    let (status, admin_tokens) = json_request(
        app.clone(),
        Method::POST,
        "/refresh",
        Some(json!({ "refreshToken": initial_refresh })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    membership_repo
        .update_role(membership.id, OrgRole::Member)
        .await
        .unwrap();
    let admin_access = admin_tokens["tokens"]["accessToken"].as_str().unwrap();
    let (status, _) = auth_request(app.clone(), Method::GET, "/user", admin_access, None).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);

    let admin_refresh = admin_tokens["tokens"]["refreshToken"].as_str().unwrap();
    let (status, member_tokens) = json_request(
        app.clone(),
        Method::POST,
        "/refresh",
        Some(json!({ "refreshToken": admin_refresh })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let member_access = member_tokens["tokens"]["accessToken"].as_str().unwrap();
    let (status, _) = auth_request(app.clone(), Method::GET, "/user", member_access, None).await;
    assert_eq!(status, StatusCode::OK);

    membership_repo.delete(membership.id).await.unwrap();
    let (status, _) = auth_request(app, Method::GET, "/user", member_access, None).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_access_token_loses_system_admin_authority_after_demotion() {
    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;
    let user_repo = storage.user_repo.clone();
    let app = router_with_storage(config, callback, storage);

    let (status, registered) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "admin-demotion@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(
        status,
        StatusCode::CREATED,
        "registration failed: {registered}"
    );
    let user_id = uuid::Uuid::parse_str(registered["user"]["id"].as_str().unwrap()).unwrap();
    user_repo.set_system_admin(user_id, true).await.unwrap();

    let (status, admin_tokens) = json_request(
        app.clone(),
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": registered["tokens"]["refreshToken"]
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    // A valid demotion leaves another administrator able to manage the system.
    let mut remaining_admin = cedros_login::repositories::UserEntity::new_email_user(
        "remaining-admin@example.com".into(),
        "unused-hash".into(),
        None,
    );
    remaining_admin.is_system_admin = true;
    user_repo.create(remaining_admin).await.unwrap();
    user_repo.set_system_admin(user_id, false).await.unwrap();
    let admin_access = admin_tokens["tokens"]["accessToken"].as_str().unwrap();
    let (status, _) = auth_request(app, Method::GET, "/user", admin_access, None).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

// =============================================================================
// Token Refresh Tests
// =============================================================================

#[tokio::test]
async fn test_refresh_token_success() {
    let app = create_test_app().await;

    // Register and get tokens
    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "refresh@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let refresh_token = register_body["tokens"]["refreshToken"].as_str().unwrap();

    // Refresh
    let (status, body) = json_request(
        app,
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": refresh_token
        })),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert!(body["tokens"]["accessToken"].is_string());
    assert!(body["tokens"]["refreshToken"].is_string());
    // New refresh token should be different (rotation)
    assert_ne!(body["tokens"]["refreshToken"], refresh_token);
}

#[tokio::test]
async fn test_refresh_token_invalid() {
    let app = create_test_app().await;

    let (status, body) = json_request(
        app,
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": "invalid-refresh-token"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::UNAUTHORIZED);
    assert_eq!(body["code"], "INVALID_TOKEN");
}

#[tokio::test]
async fn test_refresh_token_reuse_prevented() {
    let app = create_test_app().await;

    // Register
    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "reuse@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let refresh_token = register_body["tokens"]["refreshToken"].as_str().unwrap();

    // First refresh should work
    let (status, _) = json_request(
        app.clone(),
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": refresh_token
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    // Second refresh with same token should fail (rotation)
    let (status, body) = json_request(
        app,
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": refresh_token
        })),
    )
    .await;

    assert_eq!(status, StatusCode::UNAUTHORIZED);
    assert!(body["code"] == "INVALID_TOKEN" || body["code"] == "TOKEN_EXPIRED");
}

#[tokio::test]
async fn test_refresh_token_reuse_within_grace_does_not_queue_notification() {
    let config = test_config();
    let jwt_secret = config.jwt.secret.clone();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;
    let outbox_repo = storage.outbox_repo.clone();
    let session_repo = storage.session_repo.clone();
    let app = router_with_storage(config, callback, storage);

    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "reuse-notify@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let refresh_token = register_body["tokens"]["refreshToken"].as_str().unwrap();

    let (status, _) = json_request(
        app.clone(),
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": refresh_token
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let (status, _) = json_request(
        app,
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": refresh_token
        })),
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);

    let events = outbox_repo.fetch_pending(100, 0).await.unwrap();
    let has_token_reuse = events.iter().any(|event| {
        event.event_type == cedros_login::repositories::OutboxEventType::NotifyTokenReuse
    });
    assert!(
        !has_token_reuse,
        "Token reuse alert should not be queued within rotation grace"
    );

    let rotated_session = session_repo
        .find_by_refresh_token(&cedros_login::utils::hash_refresh_token(
            refresh_token,
            &jwt_secret,
        ))
        .await
        .unwrap()
        .expect("rotated session");
    let active_sessions = session_repo
        .find_active_by_user_id(rotated_session.user_id)
        .await
        .unwrap();
    assert_eq!(
        active_sessions.len(),
        1,
        "The replacement session should remain active within grace"
    );
}

#[tokio::test]
async fn test_refresh_token_reuse_after_grace_queues_notification() {
    let config = test_config();
    let jwt_secret = config.jwt.secret.clone();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;
    let outbox_repo = storage.outbox_repo.clone();
    let session_repo = storage.session_repo.clone();
    let app = router_with_storage(config, callback, storage);

    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "reuse-notify-after-grace@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let refresh_token = register_body["tokens"]["refreshToken"].as_str().unwrap();

    let (status, _) = json_request(
        app.clone(),
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": refresh_token
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let mut rotated_session = session_repo
        .find_by_refresh_token(&cedros_login::utils::hash_refresh_token(
            refresh_token,
            &jwt_secret,
        ))
        .await
        .unwrap()
        .expect("rotated session");
    rotated_session.revoked_at = Some(chrono::Utc::now() - chrono::Duration::seconds(61));
    rotated_session.revoked_reason = Some("rotated".to_string());
    session_repo.update(rotated_session.clone()).await.unwrap();

    let (status, _) = json_request(
        app,
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": refresh_token
        })),
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);

    let events = outbox_repo.fetch_pending(100, 0).await.unwrap();
    let has_token_reuse = events.iter().any(|event| {
        event.event_type == cedros_login::repositories::OutboxEventType::NotifyTokenReuse
    });
    assert!(
        has_token_reuse,
        "Token reuse alert should be queued after rotation grace"
    );

    let active_sessions = session_repo
        .find_active_by_user_id(rotated_session.user_id)
        .await
        .unwrap();
    assert!(
        active_sessions.is_empty(),
        "Late token reuse should revoke all active sessions"
    );
}

#[tokio::test]
async fn test_mfa_setup_requires_step_up_after_refresh() {
    let app = create_test_app().await;

    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "mfa-stepup-refresh@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let refresh_token = register_body["tokens"]["refreshToken"].as_str().unwrap();

    let (refresh_status, refresh_body) = json_request(
        app.clone(),
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": refresh_token
        })),
    )
    .await;
    assert_eq!(refresh_status, StatusCode::OK);

    let refreshed_access = refresh_body["tokens"]["accessToken"].as_str().unwrap();
    let (user_status, _) =
        auth_request(app.clone(), Method::GET, "/user", refreshed_access, None).await;
    assert_eq!(user_status, StatusCode::OK);
    let (status, body) =
        auth_request(app, Method::POST, "/mfa/setup", refreshed_access, None).await;

    assert_eq!(status, StatusCode::FORBIDDEN);
    assert_eq!(body["code"], "STEP_UP_REQUIRED");
}

#[tokio::test]
async fn test_mfa_setup_succeeds_with_recent_login() {
    let app = create_test_app().await;

    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "mfa-stepup-login@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let access_token = register_body["tokens"]["accessToken"].as_str().unwrap();
    let (status, body) = auth_request(app, Method::POST, "/mfa/setup", access_token, None).await;

    assert_eq!(status, StatusCode::OK);
    assert!(body["secret"].is_string());
    assert!(body["recoveryCodes"].is_array());
}

#[tokio::test]
async fn test_credential_removal_requires_recent_strong_auth_after_refresh() {
    let app = create_test_app().await;
    let (_, registered) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "credential-step-up@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    let (status, refreshed) = json_request(
        app.clone(),
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": registered["tokens"]["refreshToken"]
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let access = refreshed["tokens"]["accessToken"].as_str().unwrap();
    let (status, body) = auth_request(
        app,
        Method::DELETE,
        &format!("/credentials/{}", uuid::Uuid::new_v4()),
        access,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::FORBIDDEN);
    assert_eq!(body["code"], "STEP_UP_REQUIRED");
}

// =============================================================================
// Logout Tests
// =============================================================================

#[tokio::test]
async fn test_logout_success() {
    let app = create_test_app().await;

    // Register and get token
    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "logout@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let access_token = register_body["tokens"]["accessToken"].as_str().unwrap();

    // Logout
    let (status, body) = auth_request(app, Method::POST, "/logout", access_token, None).await;

    assert_eq!(status, StatusCode::OK);
    assert!(body["message"].as_str().unwrap().contains("success"));
}

#[tokio::test]
async fn test_logout_invalidates_session() {
    let app = create_test_app().await;

    // Register
    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "invalidate@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let access_token = register_body["tokens"]["accessToken"].as_str().unwrap();

    // Logout
    auth_request(app.clone(), Method::POST, "/logout", access_token, None).await;

    // Try to get user with same token - should fail because session is revoked
    let (status, body) = auth_request(app, Method::GET, "/user", access_token, None).await;

    assert_eq!(status, StatusCode::UNAUTHORIZED);
    assert_eq!(body["code"], "INVALID_TOKEN");
}

#[tokio::test]
async fn logout_with_old_access_or_refresh_revokes_rotated_family() {
    let app = create_test_app().await;
    let (_, registered) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email":"logout-family@example.com", "password":"SecurePassword1!"
        })),
    )
    .await;
    let old = &registered["tokens"];
    let (status, refreshed) = json_request(
        app.clone(),
        Method::POST,
        "/refresh",
        Some(json!({"refreshToken":old["refreshToken"]})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{refreshed}");
    let (status, _) = auth_request(
        app.clone(),
        Method::POST,
        "/logout",
        old["accessToken"].as_str().unwrap(),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let (status, _) = auth_request(
        app.clone(),
        Method::GET,
        "/user",
        refreshed["tokens"]["accessToken"].as_str().unwrap(),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
    let (status, _) = json_request(
        app,
        Method::POST,
        "/refresh",
        Some(json!({"refreshToken":refreshed["tokens"]["refreshToken"]})),
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn logout_accepts_refresh_credential_without_access_token() {
    let app = create_test_app().await;
    let (_, registered) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email":"logout-refresh@example.com", "password":"SecurePassword1!"
        })),
    )
    .await;
    let (status, _) = json_request(
        app.clone(),
        Method::POST,
        "/logout",
        Some(json!({"refreshToken":registered["tokens"]["refreshToken"]})),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let (status, _) = auth_request(
        app,
        Method::GET,
        "/user",
        registered["tokens"]["accessToken"].as_str().unwrap(),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn password_reset_revokes_access_and_refresh_on_multiple_devices() {
    use cedros_login::repositories::{
        default_expiry, hash_verification_token, TokenType, UserEmailEntity, UserEntity,
    };
    use cedros_login::services::PasswordService;
    let config = test_config();
    let storage = create_seeded_storage().await;
    let hash = PasswordService::default()
        .hash("SecurePassword1!".into())
        .await
        .unwrap();
    let mut user = UserEntity::new_email_user("reset-sessions@example.com".into(), hash, None);
    user.email_verified = true;
    let user = storage.user_repo.create(user).await.unwrap();
    let email = storage
        .user_email_repo
        .create(UserEmailEntity::new(
            user.id,
            "reset-sessions@example.com".into(),
            true,
            true,
        ))
        .await
        .unwrap();
    let reset = "session-reset-proof";
    storage
        .verification_repo
        .create_for_subject(
            user.id,
            email.id,
            &hash_verification_token(reset),
            TokenType::PasswordReset,
            default_expiry(TokenType::PasswordReset),
        )
        .await
        .unwrap();
    let app = router_with_storage(config, Arc::new(NoopCallback), storage);
    let mut devices = Vec::new();
    for _ in 0..2 {
        let (status, response) = json_request(
            app.clone(),
            Method::POST,
            "/login",
            Some(json!({"email":"reset-sessions@example.com", "password":"SecurePassword1!"})),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{response}");
        devices.push(response["tokens"].clone());
    }
    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/reset-password",
        Some(json!({"token":reset, "newPassword":"DifferentPassword2!"})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{body}");
    for tokens in devices {
        let (status, _) = auth_request(
            app.clone(),
            Method::GET,
            "/user",
            tokens["accessToken"].as_str().unwrap(),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::UNAUTHORIZED);
        let (status, _) = json_request(
            app.clone(),
            Method::POST,
            "/refresh",
            Some(json!({"refreshToken":tokens["refreshToken"]})),
        )
        .await;
        assert_eq!(status, StatusCode::UNAUTHORIZED);
    }
    let (status, _) = json_request(
        app.clone(),
        Method::POST,
        "/login",
        Some(json!({"email":"reset-sessions@example.com", "password":"DifferentPassword2!"})),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let (status, _) = json_request(
        app,
        Method::POST,
        "/reset-password",
        Some(json!({"token":reset, "newPassword":"YetAnotherPassword3!"})),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
}
