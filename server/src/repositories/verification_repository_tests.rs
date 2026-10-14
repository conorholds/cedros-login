use super::*;

#[test]
fn token_type_conversion() {
    assert_eq!(TokenType::EmailVerify.as_str(), "email_verify");
    assert_eq!(TokenType::PasswordReset.as_str(), "password_reset");
    assert_eq!(
        TokenType::from_str("email_verify"),
        Some(TokenType::EmailVerify)
    );
    assert_eq!(
        TokenType::from_str("password_reset"),
        Some(TokenType::PasswordReset)
    );
    assert_eq!(TokenType::from_str("invalid"), None);
}

#[test]
fn verification_token_validity() {
    let valid_token = VerificationToken {
        id: Uuid::new_v4(),
        user_id: Uuid::new_v4(),
        token_hash: "hash".to_string(),
        token_type: TokenType::EmailVerify,
        subject_id: None,
        created_at: Utc::now(),
        expires_at: Utc::now() + Duration::hours(1),
        used_at: None,
    };
    assert!(valid_token.is_valid());
    assert!(!VerificationToken {
        expires_at: Utc::now() - Duration::hours(1),
        ..valid_token.clone()
    }
    .is_valid());
    assert!(!VerificationToken {
        used_at: Some(Utc::now()),
        ..valid_token
    }
    .is_valid());
}

#[test]
fn generated_tokens_are_unique_and_hashes_are_stable() {
    let token1 = generate_verification_token();
    let token2 = generate_verification_token();
    assert_ne!(token1, token2);
    assert!(token1.len() >= 32);
    assert_eq!(
        hash_verification_token("test-token"),
        hash_verification_token("test-token")
    );
    assert_eq!(hash_verification_token("test-token").len(), 64);
}

#[tokio::test]
async fn create_find_and_mark_used() {
    let repo = InMemoryVerificationRepository::new();
    let user_id = Uuid::new_v4();
    let token = repo
        .create(
            user_id,
            "hash",
            TokenType::EmailVerify,
            default_expiry(TokenType::EmailVerify),
        )
        .await
        .unwrap();

    assert_eq!(
        repo.find_by_hash("hash").await.unwrap().unwrap().id,
        token.id
    );
    repo.mark_used(token.id).await.unwrap();
    assert!(!repo.find_by_hash("hash").await.unwrap().unwrap().is_valid());
}

#[tokio::test]
async fn wrong_purpose_does_not_consume_token() {
    let repo = InMemoryVerificationRepository::new();
    repo.create(
        Uuid::new_v4(),
        "reset-hash",
        TokenType::PasswordReset,
        default_expiry(TokenType::PasswordReset),
    )
    .await
    .unwrap();

    assert!(repo
        .consume_if_valid("reset-hash", &[TokenType::InstantLink])
        .await
        .unwrap()
        .is_none());
    assert!(repo
        .consume_if_valid("reset-hash", &[TokenType::PasswordReset])
        .await
        .unwrap()
        .is_some());
}

#[tokio::test]
async fn live_lookup_is_purpose_bound_and_non_consuming() {
    let repo = InMemoryVerificationRepository::new();
    repo.create(
        Uuid::new_v4(),
        "mfa-hash",
        TokenType::MfaPending,
        default_expiry(TokenType::MfaPending),
    )
    .await
    .unwrap();

    assert!(repo
        .find_valid("mfa-hash", &[TokenType::PasswordReset])
        .await
        .unwrap()
        .is_none());
    assert!(repo
        .find_valid("mfa-hash", &[TokenType::MfaPending])
        .await
        .unwrap()
        .is_some());
    assert!(repo
        .consume_if_valid("mfa-hash", &[TokenType::MfaPending])
        .await
        .unwrap()
        .is_some());
}

#[tokio::test]
async fn expired_and_empty_purpose_requests_do_not_consume() {
    let repo = InMemoryVerificationRepository::new();
    repo.create(
        Uuid::new_v4(),
        "expired-hash",
        TokenType::EmailVerify,
        Utc::now() - Duration::seconds(1),
    )
    .await
    .unwrap();

    assert!(repo
        .consume_if_valid("expired-hash", &[TokenType::EmailVerify])
        .await
        .unwrap()
        .is_none());
    assert!(repo
        .consume_if_valid("expired-hash", &[])
        .await
        .unwrap()
        .is_none());
}

#[tokio::test]
async fn concurrent_consumers_have_exactly_one_winner() {
    let repo = InMemoryVerificationRepository::new();
    repo.create(
        Uuid::new_v4(),
        "one-shot",
        TokenType::MfaPending,
        default_expiry(TokenType::MfaPending),
    )
    .await
    .unwrap();

    let mut tasks = Vec::new();
    for _ in 0..16 {
        let repo = repo.clone();
        tasks.push(tokio::spawn(async move {
            repo.consume_if_valid("one-shot", &[TokenType::MfaPending])
                .await
                .unwrap()
                .is_some()
        }));
    }
    let mut winners = 0;
    for task in tasks {
        winners += usize::from(task.await.unwrap());
    }
    assert_eq!(winners, 1);
}

#[tokio::test]
async fn delete_for_user_only_removes_requested_purpose() {
    let repo = InMemoryVerificationRepository::new();
    let user_id = Uuid::new_v4();
    for (hash, token_type) in [
        ("hash1", TokenType::EmailVerify),
        ("hash2", TokenType::PasswordReset),
    ] {
        repo.create(user_id, hash, token_type, default_expiry(token_type))
            .await
            .unwrap();
    }

    repo.delete_for_user(user_id, TokenType::EmailVerify)
        .await
        .unwrap();
    assert!(repo.find_by_hash("hash1").await.unwrap().is_none());
    assert!(repo.find_by_hash("hash2").await.unwrap().is_some());
}

#[tokio::test]
async fn cleanup_removes_expired_consumed_proofs_without_enabling_replay() {
    let repo = InMemoryVerificationRepository::new();
    let proof = repo
        .create(
            Uuid::new_v4(),
            "expired-consumed",
            TokenType::PasswordReset,
            Utc::now() - Duration::seconds(1),
        )
        .await
        .unwrap();
    repo.mark_used(proof.id).await.unwrap();
    assert_eq!(repo.delete_expired().await.unwrap(), 1);
    assert!(repo
        .consume_if_valid("expired-consumed", &[TokenType::PasswordReset])
        .await
        .unwrap()
        .is_none());
}
