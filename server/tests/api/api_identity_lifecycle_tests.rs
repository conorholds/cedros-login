//! Full HTTP lifecycle regressions for ownership recovery and enrollment.
use crate::api_support::*;
use cedros_login::repositories::{ApiKeyEntity, OutboxEventType};
use cedros_login::utils::TokenCipher;

const PASSWORD: &str = "SecurePassword1!";

async fn register(app: axum::Router, email: &str) -> Value {
    let (status, body) = json_request(
        app,
        Method::POST,
        "/register",
        Some(json!({"email":email,"password":PASSWORD})),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED, "{body}");
    body
}

#[tokio::test]
async fn every_mailbox_claim_evicts_pre_registration_api_keys_and_old_sessions() {
    for (send, finish, event) in [
        (
            "/send-verification",
            "/verify-email",
            OutboxEventType::EmailVerification,
        ),
        (
            "/forgot-password",
            "/reset-password",
            OutboxEventType::EmailPasswordReset,
        ),
        (
            "/instant-link",
            "/instant-link/verify",
            OutboxEventType::EmailInstantLink,
        ),
    ] {
        let config = test_config();
        let storage = create_seeded_storage().await;
        seed_runtime_auth_settings(&storage, &config).await;
        let app = router_with_storage(config.clone(), Arc::new(NoopCallback), storage.clone());
        let email = "mailbox-owner@example.com";
        let registered = register(app.clone(), email).await;
        let user_id = uuid::Uuid::parse_str(registered["user"]["id"].as_str().unwrap()).unwrap();
        let old_access = registered["tokens"]["accessToken"].as_str().unwrap();
        let mut preclaim = storage
            .user_repo
            .find_by_id(user_id)
            .await
            .unwrap()
            .unwrap();
        preclaim.google_id = Some("attacker-google".into());
        preclaim.apple_id = Some("attacker-apple".into());
        preclaim.wallet_address = Some("attacker-wallet".into());
        storage.user_repo.update(preclaim).await.unwrap();
        let attacker_key = "ck_preregistered_attacker_key";
        storage
            .api_key_repo
            .create(ApiKeyEntity::new(user_id, attacker_key, "attacker"))
            .await
            .unwrap();
        let (status, before) = json_request(
            app.clone(),
            Method::POST,
            "/api-key/validate",
            Some(json!({"apiKey":attacker_key})),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(before["valid"], true);
        let (status, body) = json_request(
            app.clone(),
            Method::POST,
            send,
            Some(json!({"email":email})),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{send}: {body}");
        let events = storage.outbox_repo.fetch_pending(100, 0).await.unwrap();
        let mail = events
            .iter()
            .rev()
            .find(|row| row.event_type == event)
            .unwrap();
        let token = TokenCipher::new(&config.jwt.secret)
            .decrypt(mail.payload["token_enc"].as_str().unwrap())
            .unwrap();
        let request = json!({"token":token,"newPassword":"RecoveredPassword2!"});
        let (status, body) =
            json_request(app.clone(), Method::POST, finish, Some(request.clone())).await;
        assert_eq!(status, StatusCode::OK, "{finish}: {body}");
        assert!(storage
            .user_repo
            .find_by_google_id("attacker-google")
            .await
            .unwrap()
            .is_none());
        assert!(storage
            .user_repo
            .find_by_apple_id("attacker-apple")
            .await
            .unwrap()
            .is_none());
        assert!(storage
            .user_repo
            .find_by_wallet("attacker-wallet")
            .await
            .unwrap()
            .is_none());
        let (_, after) = json_request(
            app.clone(),
            Method::POST,
            "/api-key/validate",
            Some(json!({"apiKey":attacker_key})),
        )
        .await;
        assert_eq!(
            after["valid"], false,
            "persistent attacker authority survived {finish}"
        );
        let (status, _) = auth_request(app.clone(), Method::GET, "/user", old_access, None).await;
        assert_eq!(status, StatusCode::UNAUTHORIZED);
        let (status, _) = json_request(app, Method::POST, finish, Some(request)).await;
        assert_eq!(
            status,
            StatusCode::BAD_REQUEST,
            "replay accepted by {finish}"
        );
    }
}

#[tokio::test]
async fn persistent_api_key_creation_requires_recent_authentication() {
    let config = test_config();
    let storage = create_seeded_storage().await;
    seed_runtime_auth_settings(&storage, &config).await;
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    let registered = register(app.clone(), "stolen-session@example.com").await;
    let access = registered["tokens"]["accessToken"].as_str().unwrap();
    let user_id = uuid::Uuid::parse_str(registered["user"]["id"].as_str().unwrap()).unwrap();
    let mut session = storage
        .session_repo
        .find_active_by_user_id(user_id)
        .await
        .unwrap()
        .remove(0);
    session.last_strong_auth_at = Some(chrono::Utc::now() - chrono::Duration::minutes(10));
    let session = storage.session_repo.update(session).await.unwrap();
    let (status, body) = auth_request(
        app.clone(),
        Method::POST,
        "/user/api-keys",
        access,
        Some(json!({"label":"stolen"})),
    )
    .await;
    assert_eq!(status, StatusCode::FORBIDDEN, "{body}");
    assert_eq!(body["code"], "STEP_UP_REQUIRED");
    storage
        .session_repo
        .update_strong_auth_at(session.id)
        .await
        .unwrap();
    let (status, body) = auth_request(
        app,
        Method::POST,
        "/user/api-keys",
        access,
        Some(json!({"label":"legitimate"})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{body}");
    assert!(body["apiKey"].as_str().unwrap().starts_with("ck_"));
}

#[tokio::test]
async fn enrollment_challenge_cannot_move_between_accounts_or_sessions() {
    let mut config = test_config();
    config.webauthn.enabled = true;
    config.webauthn.rp_id = Some("example.com".into());
    config.webauthn.rp_origin = Some("https://login.example.com".into());
    let storage = create_seeded_storage().await;
    seed_runtime_auth_settings(&storage, &config).await;
    storage
        .system_settings_repo
        .upsert(SystemSetting::new(
            "auth_webauthn_enabled".into(),
            "true".into(),
            "auth.webauthn".into(),
        ))
        .await
        .unwrap();
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    let first = register(app.clone(), "enrollment-owner@example.com").await;
    let other = register(app.clone(), "enrollment-other@example.com").await;
    let owner_access = first["tokens"]["accessToken"].as_str().unwrap();
    let (_, another_session) = json_request(
        app.clone(),
        Method::POST,
        "/login",
        Some(json!({"email":"enrollment-owner@example.com","password":PASSWORD})),
    )
    .await;
    for access in [
        other["tokens"]["accessToken"].as_str().unwrap(),
        another_session["tokens"]["accessToken"].as_str().unwrap(),
        owner_access,
    ] {
        let (status, options) = auth_request(
            app.clone(),
            Method::POST,
            "/webauthn/register/options",
            owner_access,
            Some(json!({})),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{options}");
        let request = json!({"challengeId":options["challengeId"],"credential":{"id":"AAAA","rawId":"AAAA","type":"public-key","response":{"attestationObject":"AAAA","clientDataJSON":"AAAA"}}});
        let (status, body) = auth_request(
            app.clone(),
            Method::POST,
            "/webauthn/register/verify",
            access,
            Some(request.clone()),
        )
        .await;
        assert_eq!(status, StatusCode::BAD_REQUEST, "{body}");
        let message = body["message"].as_str().unwrap();
        if access == owner_access {
            assert!(
                message.contains("Registration verification failed"),
                "valid context did not reach cryptographic verification: {body}"
            );
        } else {
            assert!(message.contains("Invalid enrollment context"), "{body}");
        }
        let (status, body) = auth_request(
            app.clone(),
            Method::POST,
            "/webauthn/register/verify",
            owner_access,
            Some(request),
        )
        .await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert!(body["message"]
            .as_str()
            .unwrap()
            .contains("Challenge expired or not found"));
    }
}

#[tokio::test]
async fn deleting_an_account_releases_its_emails_without_transferring_old_authority() {
    let config = test_config();
    let storage = create_seeded_storage().await;
    seed_runtime_auth_settings(&storage, &config).await;
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    let email = "delete-and-register@example.com";
    let before = register(app.clone(), email).await;
    let old_id = uuid::Uuid::parse_str(before["user"]["id"].as_str().unwrap()).unwrap();
    let access = before["tokens"]["accessToken"].as_str().unwrap();
    let (status, body) = auth_request(
        app.clone(),
        Method::POST,
        "/account-deletion/me",
        access,
        Some(json!({"confirmText":"DELETE"})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{body}");
    let mut deleted = storage.user_repo.find_by_id(old_id).await.unwrap().unwrap();
    let revision = deleted.updated_at;
    deleted.google_id = Some("resurrected-google".into());
    assert!(storage
        .user_repo
        .update_if_current(deleted, revision)
        .await
        .is_err());
    assert!(storage
        .user_email_repo
        .list_by_user(old_id)
        .await
        .unwrap()
        .is_empty());
    let replacement = register(app.clone(), email).await;
    assert_ne!(before["user"]["id"], replacement["user"]["id"]);
    let (status, _) = auth_request(app, Method::GET, "/user", access, None).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
}
