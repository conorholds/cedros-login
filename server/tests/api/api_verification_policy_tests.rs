use crate::api_support::*;
use cedros_login::repositories::{
    default_expiry, hash_verification_token, CredentialEntity, CredentialType,
    InMemorySystemSettingsRepository, OutboxEventType, SessionEntity, TokenType, UserEmailEntity,
    UserEntity,
};
use cedros_login::services::{JwtService, TokenContext};
use cedros_login::utils::TokenCipher;

const VERIFICATION_SETTING: &str = "auth_email_require_verification";

async fn create_policy_app(config: Config, initial_policy: Option<bool>) -> (axum::Router, String) {
    let mut storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;
    if initial_policy.is_none() {
        storage.system_settings_repo = Arc::new(InMemorySystemSettingsRepository::new());
        seed_default_org(&storage).await;
    }
    if let Some(required) = initial_policy {
        storage
            .system_settings_repo
            .upsert(SystemSetting::new(
                VERIFICATION_SETTING.to_string(),
                required.to_string(),
                "auth.email".to_string(),
            ))
            .await
            .unwrap();
    }

    let mut admin = UserEntity::new_email_user(
        "verification-admin@example.com".to_string(),
        "unused-password-hash".to_string(),
        Some("Verification Admin".to_string()),
    );
    admin.email_verified = true;
    admin.is_system_admin = true;
    let admin = storage.user_repo.create(admin).await.unwrap();

    let jwt_service = JwtService::new(&config.jwt);
    let session_id = uuid::Uuid::new_v4();
    let tokens = jwt_service
        .generate_token_pair_with_context(
            admin.id,
            session_id,
            &TokenContext {
                is_system_admin: Some(true),
                email_verified: Some(true),
                ..TokenContext::default()
            },
        )
        .unwrap();
    let refresh_expiry =
        chrono::Utc::now() + chrono::Duration::seconds(jwt_service.refresh_expiry_secs() as i64);
    storage
        .session_repo
        .create(SessionEntity::new_with_id(
            session_id,
            admin.id,
            cedros_login::utils::hash_refresh_token(&tokens.refresh_token, &config.jwt.secret),
            refresh_expiry,
            None,
            None,
        ))
        .await
        .unwrap();

    let app = router_with_storage(config, Arc::new(NoopCallback), storage);
    (app, tokens.access_token)
}

async fn save_policy(app: axum::Router, admin_token: &str, value: &str) -> (StatusCode, Value) {
    auth_request(
        app,
        Method::PATCH,
        "/admin/settings",
        admin_token,
        Some(json!({
            "settings": [{
                "key": VERIFICATION_SETTING,
                "value": value
            }]
        })),
    )
    .await
}

async fn register_user(app: axum::Router, email: &str) -> (StatusCode, Value) {
    json_request(
        app,
        Method::POST,
        "/register",
        Some(json!({
            "email": email,
            "password": "SecurePassword1!"
        })),
    )
    .await
}

async fn login_user(app: axum::Router, email: &str) -> (StatusCode, Value) {
    json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({
            "email": email,
            "password": "SecurePassword1!"
        })),
    )
    .await
}

#[tokio::test]
async fn saved_policy_can_require_verification_after_router_creation() {
    let (app, admin_token) = create_policy_app(test_config(), Some(false)).await;
    let (status, body) = save_policy(app.clone(), &admin_token, "true").await;
    assert_eq!(status, StatusCode::OK, "settings update failed: {body}");

    let email = "runtime-require-verification@example.com";
    let (status, body) = register_user(app.clone(), email).await;
    assert_eq!(status, StatusCode::CREATED, "registration failed: {body}");
    assert!(body["tokens"].is_null());
    assert!(body["apiKey"].is_null());
    assert_eq!(body["user"]["emailVerified"], false);

    let (status, body) = login_user(app, email).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED, "response: {body}");
    assert_eq!(body["code"], "INVALID_CREDENTIALS");
}

#[tokio::test]
async fn saved_policy_can_disable_verification_after_router_creation() {
    let mut config = test_config();
    config.email.require_verification = true;
    let (app, admin_token) = create_policy_app(config, Some(true)).await;
    let (status, body) = save_policy(app.clone(), &admin_token, "false").await;
    assert_eq!(status, StatusCode::OK, "settings update failed: {body}");

    let email = "runtime-disable-verification@example.com";
    let (status, body) = register_user(app.clone(), email).await;
    assert_eq!(status, StatusCode::CREATED, "registration failed: {body}");
    assert!(body["tokens"]["accessToken"].is_string());
    assert!(body["apiKey"].is_string());
    assert_eq!(body["user"]["emailVerified"], false);

    let (status, body) = login_user(app, email).await;
    assert_eq!(status, StatusCode::OK, "login failed: {body}");
    assert!(body["tokens"]["accessToken"].is_string());
}

#[tokio::test]
async fn missing_policy_row_falls_back_to_static_config() {
    let mut config = test_config();
    config.email.require_verification = true;
    let (app, _) = create_policy_app(config, None).await;

    let email = "verification-config-fallback@example.com";
    let (status, body) = register_user(app.clone(), email).await;
    assert_eq!(status, StatusCode::CREATED, "registration failed: {body}");
    assert!(body["tokens"].is_null());
    assert_eq!(body["user"]["emailVerified"], false);

    let (status, body) = login_user(app, email).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED, "response: {body}");
}

#[tokio::test]
async fn settings_update_rejects_non_boolean_verification_policy() {
    let (app, admin_token) = create_policy_app(test_config(), Some(true)).await;

    let (status, body) = save_policy(app, &admin_token, "sometimes").await;

    assert_eq!(status, StatusCode::BAD_REQUEST, "response: {body}");
    assert_eq!(body["code"], "VALIDATION_ERROR");
}

#[tokio::test]
async fn mailbox_verification_evicts_pre_registered_password_and_preserves_recovery() {
    let config = test_config();
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;
    storage
        .system_settings_repo
        .upsert(SystemSetting::new(
            VERIFICATION_SETTING.to_string(),
            "true".to_string(),
            "auth.email".to_string(),
        ))
        .await
        .unwrap();
    let app = router_with_storage(config.clone(), Arc::new(NoopCallback), storage.clone());
    let email = "mailbox-claim@example.com";

    let (status, _) = register_user(app.clone(), email).await;
    assert_eq!(status, StatusCode::CREATED);
    let mut pre_registered = storage
        .user_repo
        .find_by_email(email)
        .await
        .unwrap()
        .unwrap();
    pre_registered.google_id = Some("attacker-google-subject".into());
    pre_registered
        .auth_methods
        .push(cedros_login::models::AuthMethod::Google);
    let pre_registered = storage.user_repo.update(pre_registered).await.unwrap();
    let mut attacker_sso = CredentialEntity::new(
        pre_registered.id,
        CredentialType::SsoOidc,
        Some("Attacker SSO".into()),
    );
    attacker_sso.metadata = Some(json!({
        "providerId": uuid::Uuid::new_v4(),
        "subject": "attacker-sso-subject",
    }));
    storage.credential_repo.create(attacker_sso).await.unwrap();
    storage
        .user_email_repo
        .create(UserEmailEntity::new(
            pre_registered.id,
            "attacker-recovery@example.com".into(),
            true,
            false,
        ))
        .await
        .unwrap();
    storage
        .session_repo
        .create(SessionEntity::new(
            pre_registered.id,
            "attacker-refresh-hash".into(),
            chrono::Utc::now() + chrono::Duration::hours(1),
            None,
            None,
        ))
        .await
        .unwrap();
    let events = storage.outbox_repo.fetch_pending(100, 0).await.unwrap();
    let encrypted = events
        .iter()
        .rev()
        .find(|event| event.event_type == OutboxEventType::EmailVerification)
        .unwrap()
        .payload["token_enc"]
        .as_str()
        .unwrap();
    let verification = TokenCipher::new(&config.jwt.secret)
        .decrypt(encrypted)
        .unwrap();
    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/verify-email",
        Some(json!({"token": verification})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "verification failed: {body}");
    let claimed = storage
        .user_repo
        .find_by_id(pre_registered.id)
        .await
        .unwrap()
        .unwrap();
    assert!(claimed.password_hash.is_none());
    assert!(claimed.google_id.is_none());
    assert!(storage
        .credential_repo
        .find_by_user(pre_registered.id)
        .await
        .unwrap()
        .is_empty());
    let remaining_emails = storage
        .user_email_repo
        .list_by_user(pre_registered.id)
        .await
        .unwrap();
    assert_eq!(remaining_emails.len(), 1);
    assert!(remaining_emails[0].is_primary);
    assert_eq!(remaining_emails[0].email, email);
    assert!(storage
        .session_repo
        .find_active_by_user_id(pre_registered.id)
        .await
        .unwrap()
        .is_empty());
    let revoked = storage
        .session_repo
        .find_by_user_id(pre_registered.id)
        .await
        .unwrap();
    assert!(!revoked.is_empty());
    assert!(revoked
        .iter()
        .all(|session| { session.revoked_reason.as_deref() == Some("email_ownership_claim") }));

    let (status, _) = login_user(app.clone(), email).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/forgot-password",
        Some(json!({"email": email})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "forgot password failed: {body}");
    let events = storage.outbox_repo.fetch_pending(100, 0).await.unwrap();
    let encrypted = events
        .iter()
        .rev()
        .find(|event| event.event_type == OutboxEventType::EmailPasswordReset)
        .unwrap()
        .payload["token_enc"]
        .as_str()
        .unwrap();
    let reset = TokenCipher::new(&config.jwt.secret)
        .decrypt(encrypted)
        .unwrap();
    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/reset-password",
        Some(json!({"token": reset, "newPassword": "NewSecurePass2!"})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "reset failed: {body}");
    let (status, body) = json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({"email": email, "password": "NewSecurePass2!"})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "recovered login failed: {body}");
}

#[tokio::test]
async fn verified_secondary_instant_link_does_not_claim_unverified_primary_mailbox() {
    let config = test_config();
    let storage = create_seeded_storage().await;
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    let primary = "instant-primary-victim@example.com";
    let (status, body) = register_user(app.clone(), primary).await;
    assert_eq!(status, StatusCode::CREATED, "registration failed: {body}");
    let mut user = storage
        .user_repo
        .find_by_email(primary)
        .await
        .unwrap()
        .unwrap();
    user.google_id = Some("pre-registered-google".into());
    user.auth_methods
        .push(cedros_login::models::AuthMethod::Google);
    let user = storage.user_repo.update(user).await.unwrap();
    let secondary = storage
        .user_email_repo
        .create(UserEmailEntity::new(
            user.id,
            "verified-secondary@example.com".into(),
            true,
            false,
        ))
        .await
        .unwrap();
    let raw = "secondary-instant-link-token";
    storage
        .verification_repo
        .create_for_subject(
            user.id,
            secondary.id,
            &hash_verification_token(raw),
            TokenType::InstantLink,
            default_expiry(TokenType::InstantLink),
        )
        .await
        .unwrap();

    let (status, response) = json_request(
        app,
        Method::POST,
        "/instant-link/verify",
        Some(json!({"token": raw})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "instant link failed: {response}");
    let current = storage
        .user_repo
        .find_by_id(user.id)
        .await
        .unwrap()
        .unwrap();
    assert!(!current.email_verified);
    assert_eq!(current.google_id.as_deref(), Some("pre-registered-google"));
    let primary_row = storage
        .user_email_repo
        .find_active_by_email(primary)
        .await
        .unwrap()
        .unwrap();
    assert!(primary_row.verified_at.is_none());
    assert!(storage
        .user_email_repo
        .find_by_id(secondary.id)
        .await
        .unwrap()
        .is_some());
}

#[tokio::test]
async fn primary_instant_link_claim_removes_pre_registered_secondary_mailboxes() {
    let storage = create_seeded_storage().await;
    let app = router_with_storage(test_config(), Arc::new(NoopCallback), storage.clone());
    let primary = "instant-claim-primary@example.com";
    let (status, body) = register_user(app.clone(), primary).await;
    assert_eq!(status, StatusCode::CREATED, "registration failed: {body}");
    let user = storage
        .user_repo
        .find_by_email(primary)
        .await
        .unwrap()
        .unwrap();
    let primary_row = storage
        .user_email_repo
        .find_active_by_email(primary)
        .await
        .unwrap()
        .unwrap();
    storage
        .user_email_repo
        .create(UserEmailEntity::new(
            user.id,
            "instant-attacker-recovery@example.com".into(),
            true,
            false,
        ))
        .await
        .unwrap();
    let raw = "primary-instant-claim-token";
    storage
        .verification_repo
        .create_for_subject(
            user.id,
            primary_row.id,
            &hash_verification_token(raw),
            TokenType::InstantLink,
            default_expiry(TokenType::InstantLink),
        )
        .await
        .unwrap();

    let (status, response) = json_request(
        app,
        Method::POST,
        "/instant-link/verify",
        Some(json!({"token": raw})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "instant link failed: {response}");
    let emails = storage.user_email_repo.list_by_user(user.id).await.unwrap();
    assert_eq!(emails.len(), 1);
    assert!(emails[0].is_primary);
    assert_eq!(emails[0].email, primary);
}

#[tokio::test]
async fn verified_secondary_password_reset_does_not_claim_unverified_primary_mailbox() {
    let config = test_config();
    let storage = create_seeded_storage().await;
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    let primary = "reset-primary-victim@example.com";
    let (status, body) = register_user(app.clone(), primary).await;
    assert_eq!(status, StatusCode::CREATED, "registration failed: {body}");
    let mut user = storage
        .user_repo
        .find_by_email(primary)
        .await
        .unwrap()
        .unwrap();
    user.google_id = Some("pre-registered-google".into());
    user.auth_methods
        .push(cedros_login::models::AuthMethod::Google);
    let user = storage.user_repo.update(user).await.unwrap();
    let secondary = storage
        .user_email_repo
        .create(UserEmailEntity::new(
            user.id,
            "verified-reset-secondary@example.com".into(),
            true,
            false,
        ))
        .await
        .unwrap();
    let raw = "secondary-password-reset-token";
    storage
        .verification_repo
        .create_for_subject(
            user.id,
            secondary.id,
            &hash_verification_token(raw),
            TokenType::PasswordReset,
            default_expiry(TokenType::PasswordReset),
        )
        .await
        .unwrap();

    let (status, response) = json_request(
        app,
        Method::POST,
        "/reset-password",
        Some(json!({"token": raw, "newPassword": "NewSecurePassword2!"})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "password reset failed: {response}");
    let current = storage
        .user_repo
        .find_by_id(user.id)
        .await
        .unwrap()
        .unwrap();
    assert!(!current.email_verified);
    assert_eq!(current.google_id.as_deref(), Some("pre-registered-google"));
    let primary_row = storage
        .user_email_repo
        .find_active_by_email(primary)
        .await
        .unwrap()
        .unwrap();
    assert!(primary_row.verified_at.is_none());
    assert!(storage
        .user_email_repo
        .find_by_id(secondary.id)
        .await
        .unwrap()
        .is_some());
}

#[tokio::test]
async fn primary_password_reset_claim_removes_pre_registered_secondary_mailboxes() {
    let storage = create_seeded_storage().await;
    let app = router_with_storage(test_config(), Arc::new(NoopCallback), storage.clone());
    let primary = "reset-claim-primary@example.com";
    let (status, body) = register_user(app.clone(), primary).await;
    assert_eq!(status, StatusCode::CREATED, "registration failed: {body}");
    let user = storage
        .user_repo
        .find_by_email(primary)
        .await
        .unwrap()
        .unwrap();
    let primary_row = storage
        .user_email_repo
        .find_active_by_email(primary)
        .await
        .unwrap()
        .unwrap();
    storage
        .user_email_repo
        .create(UserEmailEntity::new(
            user.id,
            "reset-attacker-recovery@example.com".into(),
            true,
            false,
        ))
        .await
        .unwrap();
    let raw = "primary-password-reset-claim-token";
    storage
        .verification_repo
        .create_for_subject(
            user.id,
            primary_row.id,
            &hash_verification_token(raw),
            TokenType::PasswordReset,
            default_expiry(TokenType::PasswordReset),
        )
        .await
        .unwrap();

    let (status, response) = json_request(
        app,
        Method::POST,
        "/reset-password",
        Some(json!({"token": raw, "newPassword": "NewSecurePassword2!"})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "password reset failed: {response}");
    let emails = storage.user_email_repo.list_by_user(user.id).await.unwrap();
    assert_eq!(emails.len(), 1);
    assert!(emails[0].is_primary);
    assert_eq!(emails[0].email, primary);
}
