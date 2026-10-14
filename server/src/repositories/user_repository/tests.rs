use super::*;

#[tokio::test]
async fn test_create_and_find_user() {
    let repo = InMemoryUserRepository::new();
    let user = UserEntity::new_email_user(
        "test@example.com".to_string(),
        "hash123".to_string(),
        Some("Test User".to_string()),
    );
    let user_id = user.id;

    repo.create(user).await.unwrap();

    let found = repo.find_by_id(user_id).await.unwrap();
    assert!(found.is_some());
    assert_eq!(found.unwrap().email, Some("test@example.com".to_string()));
}

#[test]
fn test_new_email_user_normalizes_email() {
    let user =
        UserEntity::new_email_user("Test@Example.com".to_string(), "hash123".to_string(), None);
    assert_eq!(user.email.as_deref(), Some("test@example.com"));
}

#[tokio::test]
async fn test_find_by_email_case_insensitive() {
    let repo = InMemoryUserRepository::new();
    let user =
        UserEntity::new_email_user("Test@Example.com".to_string(), "hash123".to_string(), None);

    repo.create(user).await.unwrap();

    let found = repo.find_by_email("test@example.com").await.unwrap();
    assert!(found.is_some());

    let found = repo.find_by_email("TEST@EXAMPLE.COM").await.unwrap();
    assert!(found.is_some());
}

/// Test Unicode NFKC normalization.
#[tokio::test]
async fn test_find_by_email_unicode_normalized() {
    let repo = InMemoryUserRepository::new();
    let user =
        UserEntity::new_email_user("user@example.com".to_string(), "hash123".to_string(), None);

    repo.create(user).await.unwrap();

    let fullwidth_email = "\u{FF55}\u{FF53}\u{FF45}\u{FF52}@example.com";
    let found = repo.find_by_email(fullwidth_email).await.unwrap();
    assert!(
        found.is_some(),
        "Should find user with fullwidth local part"
    );
}

#[test]
fn test_normalize_email_function() {
    assert_eq!(normalize_email("Test@Example.COM"), "test@example.com");

    let fullwidth_a = "\u{FF21}";
    assert_eq!(
        normalize_email(&format!("{fullwidth_a}bc@test.com")),
        "abc@test.com"
    );

    let fullwidth_user = "\u{FF55}\u{FF53}\u{FF45}\u{FF52}";
    assert_eq!(
        normalize_email(&format!("{fullwidth_user}@test.com")),
        "user@test.com"
    );

    assert_eq!(normalize_email("user+tag@gmail.com"), "user+tag@gmail.com");
}

#[tokio::test]
async fn test_email_exists() {
    let repo = InMemoryUserRepository::new();
    let user = UserEntity::new_email_user(
        "exists@example.com".to_string(),
        "hash123".to_string(),
        None,
    );

    repo.create(user).await.unwrap();

    assert!(repo.email_exists("exists@example.com").await.unwrap());
    assert!(!repo.email_exists("notexists@example.com").await.unwrap());
}

#[tokio::test]
async fn test_email_index_updated_on_email_change() {
    let repo = InMemoryUserRepository::new();
    let mut user =
        UserEntity::new_email_user("old@example.com".to_string(), "hash123".to_string(), None);
    let user_id = user.id;

    repo.create(user.clone()).await.unwrap();
    assert!(repo
        .find_by_email("old@example.com")
        .await
        .unwrap()
        .is_some());

    user.email = Some("new@example.com".to_string());
    repo.update(user).await.unwrap();

    assert!(repo
        .find_by_email("old@example.com")
        .await
        .unwrap()
        .is_none());
    let found = repo.find_by_email("new@example.com").await.unwrap();
    assert!(found.is_some());
    assert_eq!(found.unwrap().id, user_id);
}

#[tokio::test]
async fn concurrent_identity_claims_have_exactly_one_owner() {
    let repo = InMemoryUserRepository::new();
    let mut first = UserEntity::new_email_user("First@Example.com".into(), "h".into(), None);
    first.google_id = Some("shared-google".into());
    first.apple_id = Some("shared-apple".into());
    first.wallet_address = Some("shared-wallet".into());
    let mut second = UserEntity::new_email_user("second@example.com".into(), "h".into(), None);
    second.google_id = first.google_id.clone();
    let (a, b) = tokio::join!(repo.create(first.clone()), repo.create(second.clone()));
    assert_ne!(a.is_ok(), b.is_ok());
    let (owner, mut rejected) = match a {
        Ok(owner) => (owner, second),
        Err(_) => (b.unwrap(), first),
    };
    rejected.google_id = None;
    rejected.apple_id = None;
    rejected.wallet_address = None;
    let rejected = repo.create(rejected).await.unwrap();
    for method in ["email", "google", "apple", "wallet"] {
        let mut owner = owner.clone();
        owner.apple_id = Some("apple".into());
        owner.wallet_address = Some("wallet".into());
        let owner = repo.update(owner).await.unwrap();
        let mut collision = rejected.clone();
        match method {
            "email" => collision.email = owner.email.as_ref().map(|email| email.to_uppercase()),
            "google" => collision.google_id = owner.google_id.clone(),
            "apple" => collision.apple_id = owner.apple_id.clone(),
            _ => collision.wallet_address = owner.wallet_address.clone(),
        }
        assert!(
            repo.update(collision).await.is_err(),
            "{method} collision accepted"
        );
    }
}
