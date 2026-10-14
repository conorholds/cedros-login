//! Integration tests for account email management and verified-email lookup.

use crate::api_support::*;
use cedros_login::repositories::{OutboxEventType, PENDING_EMAIL_EXPIRY_HOURS};
use cedros_login::utils::TokenCipher;

async fn app_with_storage() -> (axum::Router, Storage) {
    let config = test_config();
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    (app, storage)
}

async fn register(app: axum::Router, email: &str) -> Value {
    let (status, body) = json_request(
        app,
        Method::POST,
        "/register",
        Some(json!({ "email": email, "password": "SecurePassword1!" })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED, "register failed: {body}");
    body
}

async fn add_email(app: axum::Router, token: &str, email: &str) -> Value {
    let (status, body) = auth_request(
        app,
        Method::POST,
        "/account/emails",
        token,
        Some(json!({ "email": email })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "add email failed: {body}");
    body
}

async fn latest_verification_token(storage: &Storage) -> String {
    let events = storage.outbox_repo.fetch_pending(100, 0).await.unwrap();
    let event = events
        .iter()
        .rev()
        .find(|event| event.event_type == OutboxEventType::EmailVerification)
        .expect("verification email event should be queued");
    let encrypted = event.payload["token_enc"]
        .as_str()
        .expect("verification token should be encrypted");
    TokenCipher::new(&test_config().jwt.secret)
        .decrypt(encrypted)
        .unwrap()
}

async fn list_emails(app: axum::Router, token: &str) -> Value {
    let (status, body) = auth_request(app, Method::GET, "/account/emails", token, None).await;
    assert_eq!(status, StatusCode::OK, "list emails failed: {body}");
    body
}

#[tokio::test]
async fn verified_secondary_email_can_login_to_existing_account() {
    let (app, storage) = app_with_storage().await;
    let primary = "primary-login@example.com";
    let secondary = "secondary-login@example.com";
    let register_body = register(app.clone(), primary).await;
    let token = register_body["tokens"]["accessToken"].as_str().unwrap();
    let user_id = register_body["user"]["id"].clone();

    let add_body = add_email(app.clone(), token, secondary).await;
    let pending = add_body["emails"]
        .as_array()
        .unwrap()
        .iter()
        .find(|email| email["email"] == secondary)
        .expect("secondary email should be listed");
    assert_eq!(pending["verified"], false);
    assert_eq!(pending["primary"], false);

    let verification_token = latest_verification_token(&storage).await;
    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/account/emails/verify",
        Some(json!({ "token": verification_token })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "verify failed: {body}");

    let (status, login_body) = json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({ "email": secondary, "password": "SecurePassword1!" })),
    )
    .await;
    assert_eq!(
        status,
        StatusCode::OK,
        "secondary login failed: {login_body}"
    );
    assert_eq!(login_body["user"]["id"], user_id);
    assert_eq!(login_body["user"]["email"], primary);
}

#[tokio::test]
async fn add_email_rejects_api_key_without_interactive_session() {
    use cedros_login::repositories::{ApiKeyEntity, UserEntity};
    use cedros_login::services::PasswordService;

    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;

    let password_hash = PasswordService::default()
        .hash("SecurePassword1!".to_string())
        .await
        .unwrap();
    let mut user = UserEntity::new_email_user(
        "email-add-api-key@example.com".to_string(),
        password_hash,
        None,
    );
    user.email_verified = true;
    let user_id = user.id;
    storage.user_repo.create(user).await.unwrap();

    let raw_key = cedros_login::repositories::generate_api_key();
    let api_key = ApiKeyEntity::new(user_id, &raw_key, "default");
    storage.api_key_repo.create(api_key).await.unwrap();

    let app = router_with_storage(config, callback, storage);
    let (status, body) = auth_request(
        app,
        Method::POST,
        "/account/emails",
        &raw_key,
        Some(json!({ "email": "attacker-controlled@example.com" })),
    )
    .await;

    assert_eq!(status, StatusCode::FORBIDDEN);
    assert_eq!(body["code"], "FORBIDDEN");
    assert_eq!(body["message"], "Interactive session required");
}

#[tokio::test]
async fn add_email_requires_recent_step_up_after_refresh() {
    let (app, _) = app_with_storage().await;
    let register_body = register(app.clone(), "email-add-refresh@example.com").await;
    let refresh_token = register_body["tokens"]["refreshToken"].as_str().unwrap();

    let (refresh_status, refresh_body) = json_request(
        app.clone(),
        Method::POST,
        "/refresh",
        Some(json!({ "refreshToken": refresh_token })),
    )
    .await;
    assert_eq!(refresh_status, StatusCode::OK);

    let refreshed_access = refresh_body["tokens"]["accessToken"].as_str().unwrap();
    let (status, body) = auth_request(
        app,
        Method::POST,
        "/account/emails",
        refreshed_access,
        Some(json!({ "email": "email-add-refresh-secondary@example.com" })),
    )
    .await;

    assert_eq!(status, StatusCode::FORBIDDEN);
    assert_eq!(body["code"], "STEP_UP_REQUIRED");
}

#[tokio::test]
async fn pending_email_blocks_duplicates_but_cannot_login() {
    let (app, _) = app_with_storage().await;
    let register_body = register(app.clone(), "pending-owner@example.com").await;
    let token = register_body["tokens"]["accessToken"].as_str().unwrap();
    let pending = "pending-duplicate@example.com";
    add_email(app.clone(), token, pending).await;

    let (status, login_body) = json_request(
        app.clone(),
        Method::POST,
        "/login",
        Some(json!({ "email": pending, "password": "SecurePassword1!" })),
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
    assert_eq!(login_body["code"], "INVALID_CREDENTIALS");

    let (status, register_body) = json_request(
        app,
        Method::POST,
        "/register",
        Some(json!({ "email": pending, "password": "SecurePassword1!" })),
    )
    .await;
    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(register_body["code"], "EMAIL_EXISTS");
}

#[tokio::test]
async fn primary_email_cannot_be_removed() {
    let (app, _) = app_with_storage().await;
    let register_body = register(app.clone(), "primary-remove@example.com").await;
    let token = register_body["tokens"]["accessToken"].as_str().unwrap();
    let list_body = list_emails(app.clone(), token).await;
    let primary_id = list_body["emails"][0]["id"].as_str().unwrap();

    let (status, body) = auth_request(
        app,
        Method::DELETE,
        &format!("/account/emails/{primary_id}"),
        token,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "VALIDATION_ERROR");
}

#[tokio::test]
async fn expired_pending_email_frees_address_for_signup() {
    use cedros_login::repositories::UserEmailEntity;

    let (app, storage) = app_with_storage().await;
    let mut expired = UserEmailEntity::new(
        uuid::Uuid::new_v4(),
        "expired-pending@example.com".to_string(),
        false,
        false,
    );
    expired.created_at =
        chrono::Utc::now() - chrono::Duration::hours(PENDING_EMAIL_EXPIRY_HOURS + 1);
    storage.user_email_repo.create(expired).await.unwrap();

    let body = register(app, "expired-pending@example.com").await;
    assert_eq!(body["user"]["email"], "expired-pending@example.com");
}

#[tokio::test]
async fn verified_primary_promotion_updates_both_records_atomically() {
    let (app, storage) = app_with_storage().await;
    let register_body = register(app.clone(), "promotion-old@example.com").await;
    let token = register_body["tokens"]["accessToken"].as_str().unwrap();
    let user_id = uuid::Uuid::parse_str(register_body["user"]["id"].as_str().unwrap()).unwrap();
    let add_body = add_email(app.clone(), token, "promotion-new@example.com").await;
    let new_id = add_body["emails"]
        .as_array()
        .unwrap()
        .iter()
        .find(|row| row["email"] == "promotion-new@example.com")
        .unwrap()["id"]
        .as_str()
        .unwrap()
        .to_string();
    let verification_token = latest_verification_token(&storage).await;
    let (verify_status, _) = json_request(
        app.clone(),
        Method::POST,
        "/account/emails/verify",
        Some(json!({"token":verification_token})),
    )
    .await;
    assert_eq!(verify_status, StatusCode::OK);

    let (old_session_status, _) =
        auth_request(app.clone(), Method::GET, "/account/emails", token, None).await;
    assert_eq!(old_session_status, StatusCode::UNAUTHORIZED);
    let (login_status, login_body) = json_request(
        app.clone(),
        Method::POST,
        "/login",
        Some(json!({
            "email": "promotion-old@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(login_status, StatusCode::OK, "{login_body}");
    let promoted_session = login_body["tokens"]["accessToken"].as_str().unwrap();

    let (status, body) = auth_request(
        app,
        Method::POST,
        &format!("/account/emails/{new_id}/primary"),
        promoted_session,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{body}");
    let user = storage
        .user_repo
        .find_by_id(user_id)
        .await
        .unwrap()
        .unwrap();
    let rows = storage.user_email_repo.list_by_user(user_id).await.unwrap();
    let primary = rows.iter().find(|row| row.is_primary).unwrap();
    assert_eq!(user.email.as_deref(), Some("promotion-new@example.com"));
    assert_eq!(primary.email, "promotion-new@example.com");
    assert!(user.email_verified && primary.is_verified());
    assert!(rows
        .iter()
        .any(|row| { row.email == "promotion-old@example.com" && !row.is_primary }));
}
