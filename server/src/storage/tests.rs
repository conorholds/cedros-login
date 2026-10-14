use std::sync::Arc;
use std::time::Duration;

use chrono::{Duration as ChronoDuration, Utc};
use uuid::Uuid;

use crate::config::DatabaseConfig;
use crate::models::sso::SsoAuthState;
use crate::repositories::{NonceEntity, SessionEntity, UserEntity, WebAuthnChallenge};
#[cfg(feature = "postgres")]
use crate::test_env::{lock_env, set_env};

#[cfg(feature = "postgres")]
use super::constructors::select_totp_encryption_secret;
use super::Storage;

fn test_user(email: &str) -> UserEntity {
    UserEntity {
        id: Uuid::new_v4(),
        email: Some(email.to_string()),
        email_verified: false,
        password_hash: Some("hash".to_string()),
        name: Some("Test".to_string()),
        username: None,
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec![crate::models::AuthMethod::Email],
        is_system_admin: false,
        created_at: Utc::now(),
        updated_at: Utc::now(),
        last_login_at: None,
        welcome_completed_at: None,
        referral_code: "TESTCODE".to_string(),
        referred_by: None,
    }
}

#[test]
fn in_memory_storage_creation() {
    let storage = Storage::in_memory();
    assert!(Arc::strong_count(&storage.user_repo) >= 1);
    assert!(Arc::strong_count(&storage.session_repo) >= 1);
    assert!(Arc::strong_count(&storage.nonce_repo) >= 1);
    assert!(Arc::strong_count(&storage.verification_repo) >= 1);
    assert!(Arc::strong_count(&storage.org_repo) >= 1);
    assert!(Arc::strong_count(&storage.membership_repo) >= 1);
    assert!(Arc::strong_count(&storage.invite_repo) >= 1);
    assert!(Arc::strong_count(&storage.audit_repo) >= 1);
    assert!(Arc::strong_count(&storage.totp_repo) >= 1);
    assert!(Arc::strong_count(&storage.api_key_repo) >= 1);
}

#[test]
fn storage_clone_shares_repositories() {
    let first = Storage::in_memory();
    let second = first.clone();
    assert!(Arc::ptr_eq(&first.user_repo, &second.user_repo));
    assert!(Arc::ptr_eq(&first.session_repo, &second.session_repo));
    assert!(Arc::ptr_eq(&first.nonce_repo, &second.nonce_repo));
    assert!(Arc::ptr_eq(
        &first.verification_repo,
        &second.verification_repo
    ));
    assert!(Arc::ptr_eq(&first.org_repo, &second.org_repo));
    assert!(Arc::ptr_eq(&first.membership_repo, &second.membership_repo));
    assert!(Arc::ptr_eq(&first.invite_repo, &second.invite_repo));
    assert!(Arc::ptr_eq(&first.audit_repo, &second.audit_repo));
    assert!(Arc::ptr_eq(&first.totp_repo, &second.totp_repo));
    assert!(Arc::ptr_eq(&first.api_key_repo, &second.api_key_repo));
}

#[tokio::test]
async fn no_database_url_returns_in_memory_storage() {
    let config = DatabaseConfig {
        url: None,
        max_connections: 5,
        min_connections: 1,
        connect_timeout_secs: 10,
        idle_timeout_secs: 60,
    };
    let storage = Storage::from_config(&config).await.unwrap();
    assert!(Arc::strong_count(&storage.user_repo) >= 1);
}

#[tokio::test]
async fn in_memory_user_operations() {
    let storage = Storage::in_memory();
    let created = storage
        .user_repo
        .create(test_user("test@example.com"))
        .await
        .unwrap();
    assert_eq!(created.email.as_deref(), Some("test@example.com"));
    assert!(storage
        .user_repo
        .find_by_id(created.id)
        .await
        .unwrap()
        .is_some());
}

#[tokio::test]
async fn in_memory_session_operations() {
    let storage = Storage::in_memory();
    let user = storage
        .user_repo
        .create(test_user("session_test@example.com"))
        .await
        .unwrap();
    let session = SessionEntity {
        family_id: Uuid::new_v4(),
        id: Uuid::new_v4(),
        user_id: user.id,
        refresh_token_hash: "token_hash".to_string(),
        ip_address: Some("127.0.0.1".to_string()),
        user_agent: None,
        created_at: Utc::now(),
        expires_at: Utc::now() + ChronoDuration::days(30),
        revoked_at: None,
        revoked_reason: None,
        last_strong_auth_at: None,
    };
    let created = storage.session_repo.create(session).await.unwrap();
    assert_eq!(created.user_id, user.id);
    assert!(storage
        .session_repo
        .find_by_id(created.id)
        .await
        .unwrap()
        .is_some());
}

#[tokio::test]
async fn in_memory_nonce_operations() {
    let storage = Storage::in_memory();
    let nonce = NonceEntity {
        nonce: "test_nonce_123".to_string(),
        public_key: "pubkey123".to_string(),
        message: "Sign this message".to_string(),
        created_at: Utc::now(),
        expires_at: Utc::now() + ChronoDuration::minutes(5),
        used_at: None,
    };
    let created = storage.nonce_repo.create(nonce).await.unwrap();
    assert_eq!(created.nonce, "test_nonce_123");
    assert!(storage.nonce_repo.is_valid("test_nonce_123").await.unwrap());
}

#[tokio::test]
async fn cleanup_task_removes_expired_sso_states() {
    let storage = Storage::in_memory();
    let state = SsoAuthState::new(
        Uuid::new_v4(),
        Uuid::new_v4(),
        "verifier".into(),
        "nonce".into(),
        None,
        -10,
    );
    storage.sso_repo.store_auth_state(state).await.unwrap();
    run_one_cleanup(&storage).await;
    assert_eq!(storage.sso_repo.delete_expired_states().await.unwrap(), 0);
}

#[tokio::test]
async fn cleanup_task_removes_expired_webauthn_challenges() {
    let storage = Storage::in_memory();
    let challenge = WebAuthnChallenge {
        challenge_id: Uuid::new_v4(),
        user_id: None,
        state: "challenge".into(),
        challenge_type: "register".into(),
        created_at: Utc::now() - ChronoDuration::minutes(10),
        expires_at: Utc::now() - ChronoDuration::minutes(5),
    };
    storage
        .webauthn_repo
        .store_challenge(challenge)
        .await
        .unwrap();
    run_one_cleanup(&storage).await;
    assert_eq!(
        storage
            .webauthn_repo
            .delete_expired_challenges()
            .await
            .unwrap(),
        0
    );
}

async fn run_one_cleanup(storage: &Storage) {
    let (shutdown_tx, shutdown_rx) = tokio::sync::watch::channel(false);
    let handle = storage.start_cleanup_task(1, shutdown_rx);
    tokio::time::sleep(Duration::from_millis(50)).await;
    shutdown_tx.send(true).unwrap();
    handle.await.unwrap();
}

#[test]
#[cfg(feature = "postgres")]
fn totp_secret_is_required_in_staging() {
    let _lock = lock_env();
    let _environment = set_env("ENVIRONMENT", Some("staging"));
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", None);
    let _jwt = set_env("JWT_SECRET", Some(&"s".repeat(32)));
    let error = select_totp_encryption_secret().unwrap_err().to_string();
    assert!(error.contains("TOTP_ENCRYPTION_SECRET is required in production-like environments"));
}

#[test]
#[cfg(feature = "postgres")]
fn jwt_secret_is_allowed_for_totp_in_development() {
    let _lock = lock_env();
    let _environment = set_env("ENVIRONMENT", Some("development"));
    let _totp = set_env("TOTP_ENCRYPTION_SECRET", None);
    let _jwt = set_env("JWT_SECRET", Some(&"s".repeat(32)));
    assert_eq!(select_totp_encryption_secret().unwrap().len(), 32);
}
