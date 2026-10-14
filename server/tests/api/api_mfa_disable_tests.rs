use crate::api_support::*;
use cedros_login::{
    repositories::{SessionEntity, UserEntity},
    services::{JwtService, TokenContext, TotpService},
};
use chrono::{Duration, Utc};
use totp_rs::{Algorithm, Secret, TOTP};
use uuid::Uuid;

#[tokio::test]
async fn test_passwordless_mfa_disable_accepts_valid_totp() {
    let config = test_config();
    let storage = create_seeded_storage().await;
    let (token, user, secret) =
        create_mfa_user(&storage, &config, "mfa-passwordless-totp@example.com", None).await;
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    let code = current_totp_code(&secret, user.email.as_deref().unwrap());

    let (status, body) = auth_request(
        app,
        Method::POST,
        "/mfa/disable",
        &token,
        Some(json!({ "code": code })),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["message"], "MFA disabled successfully");
    assert!(!storage.totp_repo.has_mfa_enabled(user.id).await.unwrap());
}

#[tokio::test]
async fn test_passwordless_mfa_disable_accepts_valid_recovery_code() {
    let config = test_config();
    let storage = create_seeded_storage().await;
    let (token, user, _) = create_mfa_user(
        &storage,
        &config,
        "mfa-passwordless-recovery@example.com",
        None,
    )
    .await;
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());

    let (status, body) = auth_request(
        app,
        Method::POST,
        "/mfa/disable",
        &token,
        Some(json!({ "recoveryCode": "RECOVERY-CODE-1" })),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["message"], "MFA disabled successfully");
    assert!(!storage.totp_repo.has_mfa_enabled(user.id).await.unwrap());
}

#[tokio::test]
async fn test_passwordless_mfa_disable_rejects_bad_or_missing_factor() {
    let config = test_config();
    let storage = create_seeded_storage().await;
    let (token, user, _) =
        create_mfa_user(&storage, &config, "mfa-passwordless-bad@example.com", None).await;
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());

    let (bad_status, bad_body) = auth_request(
        app.clone(),
        Method::POST,
        "/mfa/disable",
        &token,
        Some(json!({ "code": "000000" })),
    )
    .await;
    let (missing_status, missing_body) =
        auth_request(app, Method::POST, "/mfa/disable", &token, Some(json!({}))).await;

    assert_eq!(bad_status, StatusCode::UNAUTHORIZED);
    assert_eq!(bad_body["code"], "INVALID_CREDENTIALS");
    assert_eq!(missing_status, StatusCode::UNAUTHORIZED);
    assert_eq!(missing_body["code"], "INVALID_CREDENTIALS");
    assert!(storage.totp_repo.has_mfa_enabled(user.id).await.unwrap());
}

#[tokio::test]
async fn test_password_account_mfa_disable_accepts_current_totp() {
    let config = test_config();
    let storage = create_seeded_storage().await;
    let password_hash = Some("$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$hash".to_string());
    let (token, user, secret) = create_mfa_user(
        &storage,
        &config,
        "mfa-password-code-only@example.com",
        password_hash,
    )
    .await;
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    let code = current_totp_code(&secret, user.email.as_deref().unwrap());

    let (status, body) = auth_request(
        app,
        Method::POST,
        "/mfa/disable",
        &token,
        Some(json!({ "code": code })),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["message"], "MFA disabled successfully");
    assert!(!storage.totp_repo.has_mfa_enabled(user.id).await.unwrap());
}

async fn create_mfa_user(
    storage: &Storage,
    config: &Config,
    email: &str,
    password_hash: Option<String>,
) -> (String, UserEntity, String) {
    let user = storage
        .user_repo
        .create(test_user(email, password_hash))
        .await
        .unwrap();
    let session_id = Uuid::new_v4();
    let session = SessionEntity::new_with_id(
        session_id,
        user.id,
        format!("refresh-{}", user.id),
        Utc::now() + Duration::hours(1),
        None,
        None,
    );
    storage.session_repo.create(session).await.unwrap();

    let access_token = JwtService::new(&config.jwt)
        .generate_access_token_with_context(
            user.id,
            session_id,
            &TokenContext {
                email_verified: Some(true),
                ..Default::default()
            },
        )
        .unwrap();

    let totp = TotpService::new("Cedros");
    let secret = totp.generate_secret();
    storage
        .totp_repo
        .upsert_secret(user.id, &secret)
        .await
        .unwrap();
    storage.totp_repo.enable_mfa(user.id).await.unwrap();
    storage
        .totp_repo
        .store_recovery_codes(
            user.id,
            vec![TotpService::hash_recovery_code("RECOVERY-CODE-1").unwrap()],
        )
        .await
        .unwrap();

    (access_token, user, secret)
}

fn test_user(email: &str, password_hash: Option<String>) -> UserEntity {
    let mut user = UserEntity::new_email_user(
        email.to_string(),
        password_hash.clone().unwrap_or_default(),
        None,
    );
    user.email_verified = true;
    user.password_hash = password_hash;
    user
}

fn current_totp_code(secret: &str, email: &str) -> String {
    let bytes = Secret::Encoded(secret.to_string()).to_bytes().unwrap();
    TOTP::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        bytes,
        Some("Cedros".to_string()),
        email.to_string(),
    )
    .unwrap()
    .generate_current()
    .unwrap()
}
