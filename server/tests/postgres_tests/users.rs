use super::*;

#[tokio::test]
async fn test_postgres_user_create_and_find() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let email = test_email();
    let user = UserEntity {
        id: Uuid::new_v4(),
        email: Some(email.clone()),
        email_verified: false,
        password_hash: Some("hash123".to_string()),
        name: Some("Test User".to_string()),
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec![AuthMethod::Email],
        is_system_admin: false,
        last_login_at: None,
        welcome_completed_at: None,
        referral_code: test_referral_code(),
        referred_by: None,
        username: None,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    // Create user
    let created = storage.user_repo.create(user.clone()).await.unwrap();
    assert_eq!(created.email, Some(email.clone()));

    // Find by ID
    let found = storage.user_repo.find_by_id(created.id).await.unwrap();
    assert!(found.is_some());
    assert_eq!(found.unwrap().email, Some(email.clone()));

    // Find by email
    let found = storage.user_repo.find_by_email(&email).await.unwrap();
    assert!(found.is_some());
}

#[tokio::test]
async fn test_postgres_user_find_by_wallet() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let wallet = test_wallet();
    let user = UserEntity {
        id: Uuid::new_v4(),
        email: None,
        email_verified: false,
        password_hash: None,
        name: None,
        picture: None,
        wallet_address: Some(wallet.clone()),
        google_id: None,
        apple_id: None,
        auth_methods: vec![AuthMethod::Solana],
        is_system_admin: false,
        last_login_at: None,
        welcome_completed_at: None,
        referral_code: test_referral_code(),
        referred_by: None,
        username: None,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let created = storage.user_repo.create(user).await.unwrap();
    let found = storage.user_repo.find_by_wallet(&wallet).await.unwrap();
    assert!(found.is_some());
    assert_eq!(found.unwrap().id, created.id);
}

#[tokio::test]
async fn test_postgres_user_update() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let email = test_email();
    let user = UserEntity {
        id: Uuid::new_v4(),
        email: Some(email.clone()),
        email_verified: false,
        password_hash: Some("hash123".to_string()),
        name: Some("Test User".to_string()),
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec![AuthMethod::Email],
        is_system_admin: false,
        last_login_at: None,
        welcome_completed_at: None,
        referral_code: test_referral_code(),
        referred_by: None,
        username: None,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let created = storage.user_repo.create(user).await.unwrap();

    // Update user
    let mut updated_user = created.clone();
    updated_user.name = Some("Updated Name".to_string());
    updated_user.email_verified = true;

    let updated = storage.user_repo.update(updated_user).await.unwrap();
    assert_eq!(updated.name, Some("Updated Name".to_string()));
    assert!(updated.email_verified);
}

#[tokio::test]
async fn test_postgres_user_email_exists() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let email = test_email();
    let user = UserEntity {
        id: Uuid::new_v4(),
        email: Some(email.clone()),
        email_verified: false,
        password_hash: Some("hash123".to_string()),
        name: None,
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec![AuthMethod::Email],
        is_system_admin: false,
        last_login_at: None,
        welcome_completed_at: None,
        referral_code: test_referral_code(),
        referred_by: None,
        username: None,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    assert!(!storage.user_repo.email_exists(&email).await.unwrap());
    storage.user_repo.create(user).await.unwrap();
    assert!(storage.user_repo.email_exists(&email).await.unwrap());
}
