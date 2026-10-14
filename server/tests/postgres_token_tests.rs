//! PostgreSQL contract tests for purpose-bound atomic verification-token use.

#![cfg(feature = "postgres")]

#[path = "support/postgres.rs"]
mod postgres_support;

use cedros_login::config::DatabaseConfig;
use cedros_login::models::AuthMethod;
use cedros_login::repositories::{
    InviteCodeEntity, MfaFactorClaim, MfaFactorClaimOutcome, PendingInviteRedemptionOutcome,
    SessionEntity, TokenType, UserEntity,
};
use cedros_login::services::TotpService;
use cedros_login::Storage;
use chrono::{Duration, Utc};
use uuid::Uuid;

async fn storage() -> Option<Storage> {
    let url = postgres_support::database_url()?;
    Some(
        Storage::from_config(&DatabaseConfig {
            url: Some(url),
            max_connections: 4,
            min_connections: 1,
            connect_timeout_secs: 10,
            idle_timeout_secs: 60,
        })
        .await
        .expect("TEST_DATABASE_URL is set but storage initialization failed"),
    )
}

async fn create_user(storage: &Storage) -> UserEntity {
    storage
        .user_repo
        .create(UserEntity {
            id: Uuid::new_v4(),
            email: Some(format!("token-{}@example.com", Uuid::new_v4())),
            email_verified: true,
            password_hash: Some("test-hash".into()),
            name: None,
            picture: None,
            wallet_address: None,
            google_id: None,
            apple_id: None,
            auth_methods: vec![AuthMethod::Email],
            is_system_admin: false,
            last_login_at: None,
            welcome_completed_at: None,
            referral_code: Uuid::new_v4().simple().to_string()[..8].to_uppercase(),
            referred_by: None,
            username: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        })
        .await
        .unwrap()
}

#[tokio::test]
async fn purpose_is_part_of_atomic_consume_predicate() {
    let Some(storage) = storage().await else {
        return;
    };
    let user = create_user(&storage).await;
    let hash = format!("purpose-{}", Uuid::new_v4());
    storage
        .verification_repo
        .create(
            user.id,
            &hash,
            TokenType::PasswordReset,
            Utc::now() + Duration::minutes(5),
        )
        .await
        .unwrap();

    assert!(storage
        .verification_repo
        .consume_if_valid(&hash, &[TokenType::InstantLink])
        .await
        .unwrap()
        .is_none());
    assert!(storage
        .verification_repo
        .consume_if_valid(&hash, &[TokenType::PasswordReset])
        .await
        .unwrap()
        .is_some());
}

#[tokio::test]
async fn concurrent_atomic_consumers_have_one_winner() {
    let Some(storage) = storage().await else {
        return;
    };
    let user = create_user(&storage).await;
    let hash = format!("concurrent-{}", Uuid::new_v4());
    storage
        .verification_repo
        .create(
            user.id,
            &hash,
            TokenType::MfaPending,
            Utc::now() + Duration::minutes(5),
        )
        .await
        .unwrap();

    let first_repo = storage.verification_repo.clone();
    let second_repo = storage.verification_repo.clone();
    let (first, second) = tokio::join!(
        first_repo.consume_if_valid(&hash, &[TokenType::MfaPending]),
        second_repo.consume_if_valid(&hash, &[TokenType::MfaPending]),
    );
    let winners = [first.unwrap(), second.unwrap()]
        .into_iter()
        .filter(Option::is_some)
        .count();
    assert_eq!(winners, 1);
}

#[tokio::test]
async fn concurrent_token_issuers_leave_exactly_one_live_token() {
    let Some(storage) = storage().await else {
        return;
    };
    let user = create_user(&storage).await;
    let first_hash = format!("issue-first-{}", Uuid::new_v4());
    let second_hash = format!("issue-second-{}", Uuid::new_v4());
    let first_repo = storage.verification_repo.clone();
    let second_repo = storage.verification_repo.clone();
    let expiry = Utc::now() + Duration::minutes(5);
    let (first, second) = tokio::join!(
        first_repo.create(user.id, &first_hash, TokenType::PasswordReset, expiry),
        second_repo.create(user.id, &second_hash, TokenType::PasswordReset, expiry),
    );
    first.unwrap();
    second.unwrap();

    let first_live = storage
        .verification_repo
        .find_valid(&first_hash, &[TokenType::PasswordReset])
        .await
        .unwrap()
        .is_some();
    let second_live = storage
        .verification_repo
        .find_valid(&second_hash, &[TokenType::PasswordReset])
        .await
        .unwrap()
        .is_some();
    let live = usize::from(first_live) + usize::from(second_live);
    assert_eq!(live, 1);
}

#[tokio::test]
async fn concurrent_pending_invite_redemptions_commit_once() {
    let Some(storage) = storage().await else {
        return;
    };
    let user = create_user(&storage).await;
    storage
        .invite_code_repo
        .mark_user_pending(user.id)
        .await
        .unwrap();
    let code = format!("RACE{}", &Uuid::new_v4().simple().to_string()[..8]).to_uppercase();
    let invite = storage
        .invite_code_repo
        .create(InviteCodeEntity::new(
            code.clone(),
            None,
            None,
            Some(2),
            None,
            None,
            None,
        ))
        .await
        .unwrap();
    let token_hash = format!("invite-race-{}", Uuid::new_v4());
    storage
        .verification_repo
        .create(
            user.id,
            &token_hash,
            TokenType::InviteCodePending,
            Utc::now() + Duration::minutes(5),
        )
        .await
        .unwrap();

    let first_repo = storage.pending_invite_redemption_repo.clone();
    let second_repo = storage.pending_invite_redemption_repo.clone();
    let (first, second) = tokio::join!(
        first_repo.redeem(&token_hash, &code),
        second_repo.redeem(&token_hash, &code),
    );
    let outcomes = [first.unwrap(), second.unwrap()];
    assert_eq!(
        outcomes
            .iter()
            .filter(|outcome| matches!(outcome, PendingInviteRedemptionOutcome::Redeemed { .. }))
            .count(),
        1
    );
    assert_eq!(
        outcomes
            .iter()
            .filter(|outcome| matches!(outcome, PendingInviteRedemptionOutcome::InvalidToken))
            .count(),
        1
    );
    assert_eq!(
        storage
            .invite_code_repo
            .find_by_id(invite.id)
            .await
            .unwrap()
            .unwrap()
            .uses_count,
        1
    );
    assert!(!storage
        .invite_code_repo
        .is_user_pending(user.id)
        .await
        .unwrap());
}

#[tokio::test]
async fn expired_token_cannot_be_consumed() {
    let Some(storage) = storage().await else {
        return;
    };
    let user = create_user(&storage).await;
    let hash = format!("expired-{}", Uuid::new_v4());
    storage
        .verification_repo
        .create(
            user.id,
            &hash,
            TokenType::PasswordReset,
            Utc::now() - Duration::seconds(1),
        )
        .await
        .unwrap();
    assert!(storage
        .verification_repo
        .consume_if_valid(&hash, &[TokenType::PasswordReset])
        .await
        .unwrap()
        .is_none());
}

#[tokio::test]
async fn concurrent_mfa_claims_preserve_the_losing_recovery_code() {
    let Some(storage) = storage().await else {
        return;
    };
    let user = create_user(&storage).await;
    let hash = format!("mfa-atomic-{}", Uuid::new_v4());
    storage
        .verification_repo
        .create(
            user.id,
            &hash,
            TokenType::MfaPending,
            Utc::now() + Duration::minutes(5),
        )
        .await
        .unwrap();
    storage
        .totp_repo
        .upsert_secret(user.id, "JBSWY3DPEHPK3PXP")
        .await
        .unwrap();
    storage.totp_repo.enable_mfa(user.id).await.unwrap();
    storage
        .totp_repo
        .store_recovery_codes(
            user.id,
            vec![
                TotpService::hash_recovery_code("AAAA-1111").unwrap(),
                TotpService::hash_recovery_code("BBBB-2222").unwrap(),
            ],
        )
        .await
        .unwrap();
    let ids: Vec<_> = storage
        .totp_repo
        .get_recovery_codes(user.id)
        .await
        .unwrap()
        .into_iter()
        .map(|code| code.id)
        .collect();
    let first = storage.atomic_mfa_repo.claim_with_session(
        &hash,
        user.id,
        MfaFactorClaim::RecoveryCode(ids[0]),
        test_session(user.id, "first"),
    );
    let second = storage.atomic_mfa_repo.claim_with_session(
        &hash,
        user.id,
        MfaFactorClaim::RecoveryCode(ids[1]),
        test_session(user.id, "second"),
    );
    let (first, second) = tokio::join!(first, second);
    let outcomes = [first.unwrap(), second.unwrap()];
    assert_eq!(
        outcomes
            .iter()
            .filter(|outcome| **outcome == MfaFactorClaimOutcome::Claimed)
            .count(),
        1
    );
    assert_eq!(
        storage
            .totp_repo
            .get_recovery_codes(user.id)
            .await
            .unwrap()
            .len(),
        1
    );
    assert_eq!(
        storage
            .session_repo
            .find_by_user_id(user.id)
            .await
            .unwrap()
            .len(),
        1
    );
}

#[tokio::test]
async fn session_insert_failure_rolls_back_postgres_challenge_and_factor() {
    let Some(storage) = storage().await else {
        return;
    };
    let user = create_user(&storage).await;
    let hash = format!("mfa-rollback-{}", Uuid::new_v4());
    storage
        .verification_repo
        .create(
            user.id,
            &hash,
            TokenType::MfaPending,
            Utc::now() + Duration::minutes(5),
        )
        .await
        .unwrap();
    storage
        .totp_repo
        .upsert_secret(user.id, "JBSWY3DPEHPK3PXP")
        .await
        .unwrap();
    storage.totp_repo.enable_mfa(user.id).await.unwrap();
    storage
        .totp_repo
        .store_recovery_codes(
            user.id,
            vec![TotpService::hash_recovery_code("AAAA-1111").unwrap()],
        )
        .await
        .unwrap();
    let code_id = storage.totp_repo.get_recovery_codes(user.id).await.unwrap()[0].id;
    let collision = test_session(user.id, "collision");
    storage
        .session_repo
        .create(collision.clone())
        .await
        .unwrap();
    let mut duplicate = test_session(user.id, "collision");
    duplicate.id = Uuid::new_v4();

    assert!(storage
        .atomic_mfa_repo
        .claim_with_session(
            &hash,
            user.id,
            MfaFactorClaim::RecoveryCode(code_id),
            duplicate,
        )
        .await
        .is_err());
    assert!(storage
        .verification_repo
        .find_valid(&hash, &[TokenType::MfaPending])
        .await
        .unwrap()
        .is_some());
    assert_eq!(
        storage
            .totp_repo
            .get_recovery_codes(user.id)
            .await
            .unwrap()
            .len(),
        1
    );
    assert_eq!(
        storage
            .atomic_mfa_repo
            .claim_with_session(
                &hash,
                user.id,
                MfaFactorClaim::RecoveryCode(code_id),
                test_session(user.id, "retry"),
            )
            .await
            .unwrap(),
        MfaFactorClaimOutcome::Claimed
    );
}

fn test_session(user_id: Uuid, suffix: &str) -> SessionEntity {
    let mut session = SessionEntity::new(
        user_id,
        format!("mfa-refresh-{user_id}-{suffix}"),
        Utc::now() + Duration::hours(1),
        None,
        None,
    );
    session.last_strong_auth_at = Some(Utc::now());
    session
}
