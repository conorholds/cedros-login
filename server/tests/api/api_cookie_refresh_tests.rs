use crate::api_cookie_support::*;
use crate::api_support::*;

#[tokio::test]
async fn test_refresh_after_logout_does_not_queue_token_reuse() {
    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;
    let outbox_repo = storage.outbox_repo.clone();
    let app = router_with_storage(config, callback, storage);

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "refresh-logout@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    let access_token = body["tokens"]["accessToken"]
        .as_str()
        .expect("access token")
        .to_string();
    let refresh_token = body["tokens"]["refreshToken"]
        .as_str()
        .expect("refresh token")
        .to_string();

    let (logout_status, _) =
        auth_request(app.clone(), Method::POST, "/logout", &access_token, None).await;
    assert_eq!(logout_status, StatusCode::OK);

    let (refresh_status, _) = json_request(
        app,
        Method::POST,
        "/refresh",
        Some(json!({
            "refreshToken": refresh_token
        })),
    )
    .await;
    assert_eq!(refresh_status, StatusCode::UNAUTHORIZED);

    let events = outbox_repo.fetch_pending(100, 0).await.unwrap();
    let has_token_reuse = events.iter().any(|event| {
        event.event_type == cedros_login::repositories::OutboxEventType::NotifyTokenReuse
    });
    assert!(
        !has_token_reuse,
        "Token reuse alert should not be queued for revoked sessions"
    );
}

#[tokio::test]
async fn test_revoked_refresh_cookie_cannot_logout_newer_sessions() {
    let config = test_config_with_cookies();
    let jwt_secret = config.jwt.secret.clone();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;
    let session_repo = storage.session_repo.clone();
    let app = router_with_storage(config, callback, storage);
    let csrf = fetch_csrf_cookie(app.clone()).await;

    let (_, first_headers, _) = request_with_cookie(
        app.clone(),
        Method::POST,
        "/register",
        &format!("XSRF-TOKEN={csrf}"),
        Some(json!({
            "email": "stale-logout-all@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    let first_refresh = cookies_from_set_cookie(&first_headers)
        .remove("cedros_refresh")
        .expect("first refresh cookie");

    let (_, second_headers, _) = request_with_cookie(
        app.clone(),
        Method::POST,
        "/login",
        &format!("XSRF-TOKEN={csrf}"),
        Some(json!({
            "email": "stale-logout-all@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    let second_refresh = cookies_from_set_cookie(&second_headers)
        .remove("cedros_refresh")
        .expect("second refresh cookie");

    let first_session = session_repo
        .find_by_refresh_token(&cedros_login::utils::hash_refresh_token(
            &first_refresh,
            &jwt_secret,
        ))
        .await
        .unwrap()
        .expect("first session");
    let second_session = session_repo
        .find_by_refresh_token(&cedros_login::utils::hash_refresh_token(
            &second_refresh,
            &jwt_secret,
        ))
        .await
        .unwrap()
        .expect("second session");
    session_repo
        .revoke_with_reason(first_session.id, "logout")
        .await
        .unwrap();

    let (status, _, _) = request_with_cookie(
        app,
        Method::POST,
        "/logout-all",
        &format!("cedros_refresh={first_refresh}; XSRF-TOKEN={csrf}"),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    assert!(session_repo
        .find_by_id(second_session.id)
        .await
        .unwrap()
        .expect("second session remains")
        .is_valid());
}

#[tokio::test]
async fn test_refresh_with_cookies() {
    let app = create_test_app_with_cookies().await;
    let csrf_cookie = fetch_csrf_cookie(app.clone()).await;
    let cookie_header = format!("XSRF-TOKEN={csrf_cookie}");

    // Register
    let (_, headers, body) = request_with_cookie(
        app.clone(),
        Method::POST,
        "/register",
        &cookie_header,
        Some(json!({
            "email": "cookie-refresh@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    assert!(
        body.get("tokens").is_none(),
        "Tokens should be omitted when cookies are enabled"
    );

    let cookies = cookies_from_set_cookie(&headers);
    let refresh_token = cookies
        .get("cedros_refresh")
        .expect("Refresh cookie not found")
        .to_string();
    let cookie_header = format!("cedros_refresh={refresh_token}; XSRF-TOKEN={csrf_cookie}");

    // Refresh
    let (status, refresh_headers, body) = request_with_cookie(
        app,
        Method::POST,
        "/refresh",
        &cookie_header,
        Some(json!({
            "refreshToken": refresh_token
        })),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert!(
        body.get("tokens").is_none(),
        "Tokens should be omitted when cookies are enabled"
    );

    // Check new cookies are set
    let set_cookie_headers: Vec<_> = refresh_headers.get_all(header::SET_COOKIE).iter().collect();
    assert_eq!(
        set_cookie_headers.len(),
        3,
        "Should clear the legacy refresh path and set new cookies on refresh"
    );
}

#[tokio::test]
async fn test_refresh_with_cookie_only() {
    let app = create_test_app_with_cookies().await;
    let csrf_cookie = fetch_csrf_cookie(app.clone()).await;
    let cookie_header = format!("XSRF-TOKEN={csrf_cookie}");

    // Register to set cookies
    let (_, headers, _) = request_with_cookie(
        app.clone(),
        Method::POST,
        "/register",
        &cookie_header,
        Some(json!({
            "email": "cookie-only-refresh@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let cookies = cookies_from_set_cookie(&headers);
    let token_part = format!(
        "cedros_refresh={}; XSRF-TOKEN={}",
        cookies
            .get("cedros_refresh")
            .expect("Refresh cookie not found"),
        csrf_cookie
    );

    // Refresh without body, using cookie only
    let (status, refresh_headers, _) =
        request_with_cookie(app, Method::POST, "/refresh", &token_part, None).await;

    assert_eq!(status, StatusCode::OK);

    let set_cookie_headers: Vec<_> = refresh_headers.get_all(header::SET_COOKIE).iter().collect();
    assert_eq!(
        set_cookie_headers.len(),
        3,
        "Should clear the legacy refresh path and set new cookies on cookie-based refresh"
    );
}
