use super::*;

#[tokio::test]
async fn test_postgres_nonce_create_and_find() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let nonce_value = format!("nonce_{}", Uuid::new_v4());
    let nonce = NonceEntity {
        nonce: nonce_value.clone(),
        public_key: "TestPubKey123".to_string(),
        message: "Sign this message".to_string(),
        created_at: Utc::now(),
        expires_at: Utc::now() + Duration::minutes(5),
        used_at: None,
    };

    let created = storage.nonce_repo.create(nonce).await.unwrap();
    assert_eq!(created.nonce, nonce_value);

    let found = storage
        .nonce_repo
        .find_by_nonce(&nonce_value)
        .await
        .unwrap();
    assert!(found.is_some());
    assert_eq!(found.unwrap().public_key, "TestPubKey123");
}

#[tokio::test]
async fn test_postgres_nonce_validity() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let nonce_value = format!("nonce_{}", Uuid::new_v4());
    let nonce = NonceEntity {
        nonce: nonce_value.clone(),
        public_key: "TestPubKey".to_string(),
        message: "Sign this".to_string(),
        created_at: Utc::now(),
        expires_at: Utc::now() + Duration::minutes(5),
        used_at: None,
    };

    storage.nonce_repo.create(nonce).await.unwrap();

    // Should be valid initially
    assert!(storage.nonce_repo.is_valid(&nonce_value).await.unwrap());

    // Mark as used
    storage.nonce_repo.mark_used(&nonce_value).await.unwrap();

    // Should no longer be valid
    assert!(!storage.nonce_repo.is_valid(&nonce_value).await.unwrap());
}

#[tokio::test]
async fn test_postgres_nonce_expired_not_valid() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let nonce_value = format!("nonce_{}", Uuid::new_v4());
    let nonce = NonceEntity {
        nonce: nonce_value.clone(),
        public_key: "TestPubKey".to_string(),
        message: "Sign this".to_string(),
        created_at: Utc::now() - Duration::minutes(10),
        expires_at: Utc::now() - Duration::minutes(5), // Already expired
        used_at: None,
    };

    storage.nonce_repo.create(nonce).await.unwrap();

    // Expired nonce should not be valid
    assert!(!storage.nonce_repo.is_valid(&nonce_value).await.unwrap());
}

// ============================================================================
// Login Attempt Repository Tests
// ============================================================================

#[tokio::test]
async fn test_postgres_login_attempt_lockout() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let config = LoginAttemptConfig {
        max_attempts: 2,
        window_minutes: 15,
        lockout_minutes: 30,
    };

    storage
        .login_attempt_repo
        .record_attempt(None, "test@example.com", None, false)
        .await
        .unwrap();
    storage
        .login_attempt_repo
        .record_attempt(None, "test@example.com", None, false)
        .await
        .unwrap();

    let status = storage
        .login_attempt_repo
        .get_lockout_status("test@example.com", &config)
        .await
        .unwrap();
    assert!(status.is_locked);
    assert_eq!(status.failed_attempts, 2);

    storage
        .login_attempt_repo
        .clear_failed_attempts("test@example.com")
        .await
        .unwrap();

    let status = storage
        .login_attempt_repo
        .get_lockout_status("test@example.com", &config)
        .await
        .unwrap();
    assert!(!status.is_locked);
    assert_eq!(status.failed_attempts, 0);
}
