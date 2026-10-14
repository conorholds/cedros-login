//! Adversarial HTTP tests with real middleware, storage and outbox behavior.
use crate::api_support::*;
use cedros_login::repositories::{OutboxEventType, UserEmailEntity, UserEntity};
use cedros_login::utils::TokenCipher;

async fn request(app: axum::Router, path: &str, body: Value, ip: u8) -> (StatusCode, Value) {
    let mut request = Request::builder()
        .method(Method::POST)
        .uri(format!("/auth{path}"))
        .header(header::CONTENT_TYPE, "application/json")
        .header("x-forwarded-for", format!("198.51.100.{ip}"))
        .body(Body::from(body.to_string()))
        .unwrap();
    request
        .extensions_mut()
        .insert(axum::extract::ConnectInfo(std::net::SocketAddr::from((
            [192, 0, 2, ip],
            1234,
        ))));
    let response = app.oneshot(request).await.unwrap();
    let status = response.status();
    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    (
        status,
        serde_json::from_slice(&bytes).unwrap_or(Value::Null),
    )
}

async fn fixture() -> (Config, Storage, axum::Router) {
    let mut config = test_config();
    config.rate_limit.enabled = true;
    let storage = create_seeded_storage().await;
    seed_runtime_auth_settings(&storage, &config).await;
    let app = router_with_storage(config.clone(), Arc::new(NoopCallback), storage.clone());
    (config, storage, app)
}

#[tokio::test]
async fn rotating_sensitive_endpoints_cannot_multiply_a_sources_allowance() {
    let (_, _, app) = fixture().await;
    let paths = [
        "/apple/nonce",
        "/solana/challenge",
        "/webauthn/auth/options",
        "/webauthn/signup/options",
        "/google",
    ];
    for i in 0..cedros_login::config::default_auth_limit() {
        let (status, _) = request(app.clone(), paths[i as usize % paths.len()], json!({}), 1).await;
        assert_ne!(status, StatusCode::TOO_MANY_REQUESTS, "request {i}");
    }
    let (status, body) = request(app.clone(), "/apple/nonce", json!({}), 1).await;
    assert_eq!(status, StatusCode::TOO_MANY_REQUESTS, "{body}");
    let (other, _) = request(app.clone(), "/apple/nonce", json!({}), 2).await;
    assert_ne!(other, StatusCode::TOO_MANY_REQUESTS);
    let (status, _) = json_request(app, Method::GET, "/discovery", None).await;
    assert_eq!(status, StatusCode::OK);
}

#[tokio::test]
async fn distributed_email_floods_share_a_budget_and_do_not_replace_the_delivered_proof() {
    let (config, storage, app) = fixture().await;
    let user = storage
        .user_repo
        .create(UserEntity::new_email_user(
            "owner@example.com".into(),
            "hash".into(),
            None,
        ))
        .await
        .unwrap();
    storage
        .user_email_repo
        .create(UserEmailEntity::new(
            user.id,
            "owner@example.com".into(),
            false,
            true,
        ))
        .await
        .unwrap();
    let (sent, known_response) = request(
        app.clone(),
        "/send-verification",
        json!({"email":"owner@example.com"}),
        1,
    )
    .await;
    assert_eq!(sent, StatusCode::OK);
    let mail = storage
        .outbox_repo
        .fetch_pending(100, 0)
        .await
        .unwrap()
        .into_iter()
        .find(|entry| entry.event_type == OutboxEventType::EmailVerification)
        .unwrap();
    let token = TokenCipher::new(&config.jwt.secret)
        .decrypt(mail.payload["token_enc"].as_str().unwrap())
        .unwrap();
    let mut jobs = Vec::new();
    for ip in 2..14 {
        let app = app.clone();
        jobs.push(tokio::spawn(async move {
            let endpoint =
                ["/forgot-password", "/send-verification", "/instant-link"][usize::from(ip) % 3];
            request(app, endpoint, json!({"email":"ＯＷＮＥＲ@EXAMPLE.COM"}), ip)
                .await
                .0
        }));
    }
    for job in jobs {
        assert_eq!(job.await.unwrap(), StatusCode::TOO_MANY_REQUESTS);
    }
    let mails = storage.outbox_repo.fetch_pending(100, 0).await.unwrap();
    assert_eq!(
        mails
            .iter()
            .filter(|entry| matches!(
                entry.event_type,
                OutboxEventType::EmailVerification
                    | OutboxEventType::EmailPasswordReset
                    | OutboxEventType::EmailInstantLink
            ))
            .count(),
        1
    );
    let (unknown, unknown_response) = request(
        app.clone(),
        "/send-verification",
        json!({"email":"absent@example.com"}),
        30,
    )
    .await;
    assert_eq!(unknown, sent);
    assert_eq!(unknown_response, known_response);
    let (status, body) = request(app, "/verify-email", json!({"token":token}), 31).await;
    assert_eq!(status, StatusCode::OK, "{body}");
}

#[tokio::test]
async fn password_spraying_cannot_switch_aliases_or_lock_out_another_source() {
    let (_, storage, app) = fixture().await;
    let (status, registered) = request(
        app.clone(),
        "/register",
        json!({"email":"primary@example.com","password":"SecurePassword1!"}),
        1,
    )
    .await;
    assert_eq!(status, StatusCode::CREATED, "{registered}");
    let user_id = uuid::Uuid::parse_str(registered["user"]["id"].as_str().unwrap()).unwrap();
    storage
        .user_email_repo
        .create(UserEmailEntity::new(
            user_id,
            "alias@example.com".into(),
            true,
            false,
        ))
        .await
        .unwrap();
    for _ in 0..5 {
        let (status, _) = request(
            app.clone(),
            "/login",
            json!({"email":"primary@example.com","password":"wrong"}),
            1,
        )
        .await;
        assert_ne!(status, StatusCode::OK);
    }
    let (status, _) = request(
        app.clone(),
        "/login",
        json!({"email":"alias@example.com","password":"SecurePassword1!"}),
        1,
    )
    .await;
    assert_ne!(
        status,
        StatusCode::OK,
        "alias must not reset the source lockout"
    );
    let (status, body) = request(
        app,
        "/login",
        json!({"email":"alias@example.com","password":"SecurePassword1!"}),
        2,
    )
    .await;
    assert_eq!(
        status,
        StatusCode::OK,
        "another device remains usable: {body}"
    );
}

#[tokio::test]
async fn oversized_authentication_bodies_are_rejected_before_the_handler() {
    let (_, _, app) = fixture().await;
    let (status, _) = request(
        app,
        "/login",
        json!({"email":"absent@example.com", "password":"x".repeat(65536)}),
        1,
    )
    .await;
    assert_eq!(status, StatusCode::PAYLOAD_TOO_LARGE);
}

#[tokio::test]
async fn distributed_password_attempts_share_the_account_budget_across_verified_aliases() {
    let (_, storage, app) = fixture().await;
    let user = storage
        .user_repo
        .create(UserEntity::new_email_user(
            "primary@example.com".into(),
            "hash".into(),
            None,
        ))
        .await
        .unwrap();
    storage
        .user_email_repo
        .create(UserEmailEntity::new(
            user.id,
            "alias@example.com".into(),
            true,
            false,
        ))
        .await
        .unwrap();
    // Invalid-length passwords exercise admission without spending Argon2 CPU.
    let password = "x".repeat(1025);
    for ip in 1..=100 {
        let email = if ip % 2 == 0 {
            "alias@example.com"
        } else {
            "primary@example.com"
        };
        let (status, _) = request(
            app.clone(),
            "/login",
            json!({"email":email,"password":password}),
            ip,
        )
        .await;
        assert_ne!(status, StatusCode::TOO_MANY_REQUESTS, "attempt {ip}");
    }
    let (status, _) = request(
        app.clone(),
        "/login",
        json!({"email":"alias@example.com","password":password}),
        101,
    )
    .await;
    assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
    let (other, _) = request(
        app,
        "/login",
        json!({"email":"another@example.com","password":password}),
        102,
    )
    .await;
    assert_ne!(other, StatusCode::TOO_MANY_REQUESTS);
}

#[cfg(feature = "redis-rate-limit")]
#[tokio::test]
async fn stalled_distributed_budget_returns_unavailable_without_queueing_email() {
    let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
    let mut config = test_config();
    config.rate_limit.enabled = true;
    config.rate_limit.store = "redis".into();
    config.rate_limit.redis_url = Some(format!("redis://{}/", listener.local_addr().unwrap()));
    let storage = create_seeded_storage().await;
    seed_runtime_auth_settings(&storage, &config).await;
    let user = storage
        .user_repo
        .create(UserEntity::new_email_user(
            "owner@example.com".into(),
            "hash".into(),
            None,
        ))
        .await
        .unwrap();
    storage
        .user_email_repo
        .create(UserEmailEntity::new(
            user.id,
            "owner@example.com".into(),
            false,
            true,
        ))
        .await
        .unwrap();
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    let (status, body) = tokio::time::timeout(
        std::time::Duration::from_secs(3),
        request(
            app,
            "/send-verification",
            json!({"email":"owner@example.com"}),
            1,
        ),
    )
    .await
    .unwrap();
    assert_eq!(status, StatusCode::SERVICE_UNAVAILABLE, "{body}");
    assert!(storage
        .outbox_repo
        .fetch_pending(100, 0)
        .await
        .unwrap()
        .is_empty());
    drop(listener);
}
