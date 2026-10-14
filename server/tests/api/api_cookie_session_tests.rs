use crate::api_cookie_support::*;
use crate::api_support::*;

#[tokio::test]
async fn test_invite_rollback_on_queue_failure() {
    use cedros_login::repositories::{
        MembershipEntity, OrgEntity, OrgRole, SessionEntity, UserEntity,
    };
    use cedros_login::services::{JwtService, TokenContext};

    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let mut storage = Storage::in_memory();
    seed_default_org(&storage).await;
    storage.outbox_repo = Arc::new(FailingOutboxRepository::new());
    let invite_repo = storage.invite_repo.clone();

    let mut user = UserEntity::new_email_user(
        "inviter@example.com".to_string(),
        "hashed-password".to_string(),
        None,
    );
    user.email_verified = true;
    let user = storage.user_repo.create(user).await.unwrap();

    let org = OrgEntity::new(
        "Test Org".to_string(),
        "test-org".to_string(),
        user.id,
        false,
    );
    let org = storage.org_repo.create(org).await.unwrap();

    let membership = MembershipEntity::new(user.id, org.id, OrgRole::Admin);
    storage.membership_repo.create(membership).await.unwrap();

    let jwt_service = JwtService::new(&config.jwt);
    let session_id = uuid::Uuid::new_v4();
    let token_context = TokenContext {
        org_id: Some(org.id),
        role: Some(OrgRole::Admin.as_str().to_string()),
        is_system_admin: None,
        email_verified: None,
    };
    let token_pair = jwt_service
        .generate_token_pair_with_context(user.id, session_id, &token_context)
        .unwrap();
    let refresh_expiry =
        chrono::Utc::now() + chrono::Duration::seconds(jwt_service.refresh_expiry_secs() as i64);
    let session = SessionEntity::new_with_id(
        session_id,
        user.id,
        cedros_login::utils::hash_refresh_token(&token_pair.refresh_token, &config.jwt.secret),
        refresh_expiry,
        None,
        None,
    );
    storage.session_repo.create(session).await.unwrap();

    let app = router_with_storage(config, callback, storage);
    let invite_email = "invitee@example.com";
    let (status, _) = auth_request(
        app,
        Method::POST,
        &format!("/orgs/{}/invites", org.id),
        &token_pair.access_token,
        Some(json!({
            "email": invite_email,
            "role": "member"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
    let invite = invite_repo
        .find_by_org_and_email(org.id, invite_email)
        .await
        .unwrap();
    assert!(
        invite.is_none(),
        "Invite should be rolled back on queue failure"
    );
}

#[tokio::test]
async fn test_list_sessions_pagination() {
    use cedros_login::repositories::{SessionEntity, UserEntity};
    use cedros_login::services::{JwtService, TokenContext};

    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;

    let mut user = UserEntity::new_email_user(
        "sessions@example.com".to_string(),
        "hashed-password".to_string(),
        None,
    );
    user.email_verified = true;
    let user = storage.user_repo.create(user).await.unwrap();

    let jwt_service = JwtService::new(&config.jwt);
    let session_id = uuid::Uuid::new_v4();
    let token_pair = jwt_service
        .generate_token_pair_with_context(user.id, session_id, &TokenContext::default())
        .unwrap();
    let refresh_expiry =
        chrono::Utc::now() + chrono::Duration::seconds(jwt_service.refresh_expiry_secs() as i64);

    let mut current_session = SessionEntity::new_with_id(
        session_id,
        user.id,
        cedros_login::utils::hash_refresh_token(&token_pair.refresh_token, &config.jwt.secret),
        refresh_expiry,
        None,
        None,
    );
    current_session.created_at = chrono::Utc::now() - chrono::Duration::minutes(3);
    storage
        .session_repo
        .create(current_session.clone())
        .await
        .unwrap();

    let mut session2 = SessionEntity::new(
        user.id,
        "hash2".to_string(),
        chrono::Utc::now() + chrono::Duration::minutes(10),
        None,
        None,
    );
    session2.created_at = chrono::Utc::now() - chrono::Duration::minutes(2);
    storage.session_repo.create(session2).await.unwrap();

    let mut session3 = SessionEntity::new(
        user.id,
        "hash3".to_string(),
        chrono::Utc::now() + chrono::Duration::minutes(10),
        None,
        None,
    );
    session3.created_at = chrono::Utc::now() - chrono::Duration::minutes(1);
    storage.session_repo.create(session3).await.unwrap();

    let app = router_with_storage(config, callback, storage);
    let (status, body) = auth_request(
        app,
        Method::GET,
        "/sessions?limit=1&offset=1",
        &token_pair.access_token,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["total"], 3);
    assert_eq!(body["limit"], 1);
    assert_eq!(body["offset"], 1);
    assert_eq!(body["sessions"].as_array().unwrap().len(), 1);
}

#[tokio::test]
async fn test_login_sets_cookies() {
    let app = create_test_app_with_cookies().await;
    let csrf_cookie = fetch_csrf_cookie(app.clone()).await;
    let cookie_header = format!("XSRF-TOKEN={csrf_cookie}");

    // Register first
    let (_, _register_headers, _) = request_with_cookie(
        app.clone(),
        Method::POST,
        "/register",
        &cookie_header,
        Some(json!({
            "email": "cookie-login@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let login_cookie_header = format!("XSRF-TOKEN={csrf_cookie}");

    // Login
    let (status, headers, _) = request_with_cookie(
        app,
        Method::POST,
        "/login",
        &login_cookie_header,
        Some(json!({
            "email": "cookie-login@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::OK);

    // Check cookies are set
    let set_cookie_headers: Vec<_> = headers.get_all(header::SET_COOKIE).iter().collect();
    assert!(
        set_cookie_headers.len() >= 2,
        "Expected access and refresh cookies on login"
    );
}

#[tokio::test]
async fn test_get_user_with_cookie() {
    let app = create_test_app_with_cookies().await;
    let csrf_cookie = fetch_csrf_cookie(app.clone()).await;
    let cookie_header = format!("XSRF-TOKEN={csrf_cookie}");

    // Register and get cookies
    let (_, headers, _) = request_with_cookie(
        app.clone(),
        Method::POST,
        "/register",
        &cookie_header,
        Some(json!({
            "email": "cookie-user@example.com",
            "password": "SecurePassword1!",
            "name": "Cookie User"
        })),
    )
    .await;

    let cookies = cookies_from_set_cookie(&headers);
    let token_part = format!(
        "cedros_access={}; XSRF-TOKEN={}",
        cookies
            .get("cedros_access")
            .expect("Access cookie not found"),
        csrf_cookie
    );

    // Make request with cookie
    let (status, _, body) = request_with_cookie(app, Method::GET, "/user", &token_part, None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["user"]["email"], "cookie-user@example.com");
    assert_eq!(body["user"]["name"], "Cookie User");
}

#[tokio::test]
async fn test_logout_clears_cookies() {
    let app = create_test_app_with_cookies().await;
    let csrf_cookie = fetch_csrf_cookie(app.clone()).await;
    let cookie_header = format!("XSRF-TOKEN={csrf_cookie}");

    // Register and get cookies
    let (_, headers, _) = request_with_cookie(
        app.clone(),
        Method::POST,
        "/register",
        &cookie_header,
        Some(json!({
            "email": "cookie-logout@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let cookies = cookies_from_set_cookie(&headers);
    let token_part = format!(
        "cedros_access={}; XSRF-TOKEN={}",
        cookies
            .get("cedros_access")
            .expect("Access cookie not found"),
        csrf_cookie
    );

    // Logout with cookie
    let (status, logout_headers, _) =
        request_with_cookie(app, Method::POST, "/logout", &token_part, None).await;

    assert_eq!(status, StatusCode::OK);

    // Check that cookies are cleared (Max-Age=0)
    let clear_cookies: Vec<_> = logout_headers.get_all(header::SET_COOKIE).iter().collect();

    assert!(
        !clear_cookies.is_empty(),
        "Should set cookies to clear them"
    );

    let cookies_str: String = clear_cookies
        .iter()
        .map(|h| h.to_str().unwrap())
        .collect::<Vec<_>>()
        .join("; ");

    assert!(
        cookies_str.contains("Max-Age=0"),
        "Cookies should be expired"
    );
}

#[tokio::test]
async fn test_logout_invalid_token_still_clears_cookies() {
    let app = create_test_app_with_cookies().await;

    let (status, logout_headers, _) = request_with_cookie(
        app,
        Method::POST,
        "/logout",
        "cedros_access=invalid-token; XSRF-TOKEN=csrf-test",
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);

    let clear_cookies: Vec<_> = logout_headers.get_all(header::SET_COOKIE).iter().collect();

    assert!(
        !clear_cookies.is_empty(),
        "Should set cookies to clear them"
    );

    let cookies_str: String = clear_cookies
        .iter()
        .map(|h| h.to_str().unwrap())
        .collect::<Vec<_>>()
        .join("; ");

    assert!(
        cookies_str.contains("Max-Age=0"),
        "Cookies should be expired"
    );
}

#[tokio::test]
async fn test_logout_revokes_session_with_refresh_cookie() {
    let app = create_test_app_with_cookies().await;

    let (_, health_headers, _) =
        json_request_with_headers(app.clone(), Method::GET, "/health", None).await;
    let health_cookies = cookies_from_set_cookie(&health_headers);
    let csrf_token = health_cookies
        .get("XSRF-TOKEN")
        .expect("Expected CSRF cookie")
        .to_string();

    let register_cookie = format!("XSRF-TOKEN={csrf_token}");
    let (_, register_headers, _) = request_with_cookie(
        app.clone(),
        Method::POST,
        "/register",
        &register_cookie,
        Some(json!({
            "email": "refresh-logout@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let register_cookies = cookies_from_set_cookie(&register_headers);
    let refresh_token = register_cookies
        .get("cedros_refresh")
        .expect("Expected refresh cookie")
        .to_string();
    let csrf_token = register_cookies
        .get("XSRF-TOKEN")
        .unwrap_or(&csrf_token)
        .to_string();

    let logout_cookie =
        format!("cedros_access=invalid; cedros_refresh={refresh_token}; XSRF-TOKEN={csrf_token}");
    let (logout_status, _, _) =
        request_with_cookie(app.clone(), Method::POST, "/logout", &logout_cookie, None).await;
    assert_eq!(logout_status, StatusCode::OK);

    let refresh_cookie = format!("cedros_refresh={refresh_token}; XSRF-TOKEN={csrf_token}");
    let (refresh_status, _, _) =
        request_with_cookie(app, Method::POST, "/refresh", &refresh_cookie, None).await;
    assert_eq!(refresh_status, StatusCode::UNAUTHORIZED);
}
