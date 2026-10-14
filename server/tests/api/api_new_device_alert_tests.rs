use crate::api_support::*;

const CHROME_MAC_UA: &str =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36";
const SAFARI_IPHONE_UA: &str =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/605.1.15";

async fn json_request_with_user_agent(
    app: axum::Router,
    method: Method,
    uri: &str,
    user_agent: &str,
    body: Option<Value>,
) -> (StatusCode, Value) {
    let mut req_builder = Request::builder()
        .method(method)
        .uri(with_auth_base(uri))
        .header(header::USER_AGENT, user_agent);

    let body = if let Some(json_body) = body {
        req_builder = req_builder.header(header::CONTENT_TYPE, "application/json");
        Body::from(serde_json::to_string(&json_body).unwrap())
    } else {
        Body::empty()
    };

    let response = app.oneshot(req_builder.body(body).unwrap()).await.unwrap();
    let status = response.status();
    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();

    (status, parse_response_json(&body_bytes, uri))
}

#[tokio::test]
async fn test_new_device_alert_queues_by_default() {
    let config = test_config();
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;
    let outbox_repo = storage.outbox_repo.clone();
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    let email = "new-device-alert@example.com";

    register_with_user_agent(app.clone(), email, CHROME_MAC_UA).await;
    verify_user_email(&storage, email).await;

    let (login_status, _) = json_request_with_user_agent(
        app,
        Method::POST,
        "/login",
        SAFARI_IPHONE_UA,
        Some(json!({
            "email": email,
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(login_status, StatusCode::OK);

    let events = outbox_repo.fetch_pending(100, 0).await.unwrap();
    let security_alerts: Vec<_> = events
        .iter()
        .filter(|event| {
            event.event_type == cedros_login::repositories::OutboxEventType::EmailSecurityAlert
        })
        .collect();

    assert_eq!(security_alerts.len(), 1);
    assert_eq!(security_alerts[0].payload["to"], email);
}

#[tokio::test]
async fn test_new_device_alert_respects_disabled_setting() {
    let config = test_config();
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;
    storage
        .system_settings_repo
        .upsert(SystemSetting::new(
            "auth_new_device_alert_enabled".to_string(),
            "false".to_string(),
            "security".to_string(),
        ))
        .await
        .unwrap();
    let outbox_repo = storage.outbox_repo.clone();
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    let email = "new-device-alert-disabled@example.com";

    register_with_user_agent(app.clone(), email, CHROME_MAC_UA).await;
    verify_user_email(&storage, email).await;

    let (login_status, _) = json_request_with_user_agent(
        app,
        Method::POST,
        "/login",
        SAFARI_IPHONE_UA,
        Some(json!({
            "email": email,
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(login_status, StatusCode::OK);

    let events = outbox_repo.fetch_pending(100, 0).await.unwrap();
    assert!(events.iter().all(|event| {
        event.event_type != cedros_login::repositories::OutboxEventType::EmailSecurityAlert
    }));
}

async fn register_with_user_agent(app: axum::Router, email: &str, user_agent: &str) {
    let (status, _) = json_request_with_user_agent(
        app,
        Method::POST,
        "/register",
        user_agent,
        Some(json!({
            "email": email,
            "password": "SecurePassword1!"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
}

async fn verify_user_email(storage: &Storage, email: &str) {
    let mut user = storage
        .user_repo
        .find_by_email(email)
        .await
        .unwrap()
        .unwrap();
    user.email_verified = true;
    storage.user_repo.update(user).await.unwrap();
}
