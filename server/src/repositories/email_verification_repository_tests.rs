use super::*;
use crate::repositories::{
    default_expiry, hash_verification_token, CanonicalEmailRepository,
    InMemoryCanonicalEmailRepository, UserEmailRepository, UserEntity, UserRepository,
    VerificationRepository,
};

struct Fixture {
    users: Arc<InMemoryUserRepository>,
    emails: Arc<InMemoryUserEmailRepository>,
    tokens: Arc<InMemoryVerificationRepository>,
    repository: Arc<InMemoryEmailVerificationRepository>,
    user: UserEntity,
    primary: UserEmailEntity,
}

async fn fixture() -> Fixture {
    let users = Arc::new(InMemoryUserRepository::new());
    let emails = Arc::new(InMemoryUserEmailRepository::new());
    let tokens = Arc::new(InMemoryVerificationRepository::new());
    let user = users
        .create(UserEntity::new_email_user(
            "verify@example.com".into(),
            "hash".into(),
            None,
        ))
        .await
        .unwrap();
    let primary = emails
        .create(UserEmailEntity::new(
            user.id,
            "verify@example.com".into(),
            false,
            true,
        ))
        .await
        .unwrap();
    let repository = Arc::new(InMemoryEmailVerificationRepository::new(
        users.clone(),
        emails.clone(),
        tokens.clone(),
        Arc::new(super::super::InMemoryCredentialLifecycleRepository::new(
            tokens.clone(),
            users.clone(),
            Arc::new(super::super::InMemorySessionRepository::new()),
            emails.clone(),
            super::super::InMemoryCredentialStores {
                credentials: Arc::new(super::super::InMemoryCredentialRepository::new()),
                webauthn: Arc::new(super::super::InMemoryWebAuthnRepository::new()),
                totp: Arc::new(super::super::InMemoryTotpRepository::new()),
                api_keys: Arc::new(super::super::InMemoryApiKeyRepository::new()),
            },
        )),
    ));
    Fixture {
        users,
        emails,
        tokens,
        repository,
        user,
        primary,
    }
}

async fn token(f: &Fixture, raw: &str, kind: TokenType, subject: Option<uuid::Uuid>) {
    let hash = hash_verification_token(raw);
    match subject {
        Some(subject) => f
            .tokens
            .create_for_subject(f.user.id, subject, &hash, kind, default_expiry(kind))
            .await
            .unwrap(),
        None => f
            .tokens
            .create(f.user.id, &hash, kind, default_expiry(kind))
            .await
            .unwrap(),
    };
}

#[tokio::test]
async fn verifies_primary_and_consumes_token_atomically() {
    let f = fixture().await;
    let secondary = f
        .emails
        .create(UserEmailEntity::new(
            f.user.id,
            "attacker-recovery@example.com".into(),
            true,
            false,
        ))
        .await
        .unwrap();
    token(&f, "good", TokenType::EmailVerify, Some(f.primary.id)).await;
    let hash = hash_verification_token("good");
    let row = f
        .repository
        .verify_email_token(&hash, &[TokenType::EmailVerify])
        .await
        .unwrap()
        .unwrap();
    assert_eq!(row.email.id, f.primary.id);
    assert!(row.email.is_verified());
    assert!(row.credentials_reset);
    let claimed = f.users.find_by_id(f.user.id).await.unwrap().unwrap();
    assert!(claimed.email_verified);
    assert!(claimed.password_hash.is_none());
    assert!(claimed.google_id.is_none());
    assert!(f.emails.find_by_id(secondary.id).await.unwrap().is_none());
    assert!(f
        .tokens
        .find_by_hash(&hash)
        .await
        .unwrap()
        .unwrap()
        .used_at
        .is_some());
}

#[tokio::test]
async fn wrong_purpose_does_not_consume_or_mutate() {
    let f = fixture().await;
    token(&f, "wrong", TokenType::PasswordReset, None).await;
    let hash = hash_verification_token("wrong");
    assert!(f
        .repository
        .verify_email_token(&hash, &[TokenType::EmailVerify])
        .await
        .unwrap()
        .is_none());
    assert!(f
        .tokens
        .find_by_hash(&hash)
        .await
        .unwrap()
        .unwrap()
        .used_at
        .is_none());
    assert!(!f
        .emails
        .find_by_id(f.primary.id)
        .await
        .unwrap()
        .unwrap()
        .is_verified());
}

#[tokio::test]
async fn missing_or_foreign_subject_rolls_back() {
    let f = fixture().await;
    token(&f, "missing", TokenType::AccountEmailVerify, None).await;
    token(
        &f,
        "foreign",
        TokenType::AccountEmailVerify,
        Some(uuid::Uuid::new_v4()),
    )
    .await;
    for raw in ["missing", "foreign"] {
        let hash = hash_verification_token(raw);
        assert!(matches!(
            f.repository
                .verify_email_token(&hash, &[TokenType::AccountEmailVerify])
                .await,
            Err(AppError::Validation(_))
        ));
        assert!(f
            .tokens
            .find_by_hash(&hash)
            .await
            .unwrap()
            .unwrap()
            .used_at
            .is_none());
    }
}

#[tokio::test]
async fn stale_primary_token_cannot_verify_a_replacement_address() {
    let f = fixture().await;
    token(
        &f,
        "stale-primary",
        TokenType::EmailVerify,
        Some(f.primary.id),
    )
    .await;
    let replacement = f
        .emails
        .create(UserEmailEntity::new(
            f.user.id,
            "replacement@example.com".into(),
            true,
            false,
        ))
        .await
        .unwrap();
    InMemoryCanonicalEmailRepository::new(f.users.clone(), f.emails.clone())
        .promote(f.user.id, replacement.id)
        .await
        .unwrap();

    let hash = hash_verification_token("stale-primary");
    assert!(matches!(
        f.repository
            .verify_email_token(&hash, &[TokenType::EmailVerify])
            .await,
        Err(AppError::Validation(_))
    ));
    assert!(f
        .tokens
        .find_by_hash(&hash)
        .await
        .unwrap()
        .unwrap()
        .used_at
        .is_none());
}

#[tokio::test]
async fn injected_failure_rolls_back_and_retry_succeeds() {
    let f = fixture().await;
    token(&f, "retry", TokenType::EmailVerify, Some(f.primary.id)).await;
    let hash = hash_verification_token("retry");
    f.repository
        .fail_before_commit
        .store(true, std::sync::atomic::Ordering::SeqCst);
    assert!(f
        .repository
        .verify_email_token(&hash, &[TokenType::EmailVerify])
        .await
        .is_err());
    assert!(f
        .tokens
        .find_by_hash(&hash)
        .await
        .unwrap()
        .unwrap()
        .used_at
        .is_none());
    assert!(!f
        .emails
        .find_by_id(f.primary.id)
        .await
        .unwrap()
        .unwrap()
        .is_verified());
    assert!(f
        .repository
        .verify_email_token(&hash, &[TokenType::EmailVerify])
        .await
        .unwrap()
        .is_some());
}

#[tokio::test]
async fn concurrent_requests_have_one_winner() {
    let f = fixture().await;
    token(&f, "race", TokenType::EmailVerify, Some(f.primary.id)).await;
    let hash = hash_verification_token("race");
    let (one, two) = tokio::join!(
        f.repository
            .verify_email_token(&hash, &[TokenType::EmailVerify]),
        f.repository
            .verify_email_token(&hash, &[TokenType::EmailVerify])
    );
    assert_eq!(
        usize::from(one.unwrap().is_some()) + usize::from(two.unwrap().is_some()),
        1
    );
}
