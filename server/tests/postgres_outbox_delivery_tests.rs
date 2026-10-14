//! PostgreSQL contract test for provider acceptance correlation.

#![cfg(feature = "postgres")]

#[path = "support/postgres.rs"]
mod postgres_support;

use cedros_login::config::DatabaseConfig;
use cedros_login::repositories::{OutboxEvent, OutboxEventType};
use cedros_login::Storage;

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

#[tokio::test]
async fn delivery_acknowledgement_persists_provider_message_id_atomically() {
    let Some(storage) = storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };
    let event = OutboxEvent::new(
        OutboxEventType::EmailVerification,
        serde_json::json!({"to": "outbox-test@example.com"}),
    );
    let event = storage.outbox_repo.create(event).await.unwrap();

    storage
        .outbox_repo
        .mark_delivered_with_receipt(event.id, Some("provider-message-123"))
        .await
        .unwrap();

    let acknowledged = storage
        .outbox_repo
        .find_by_id(event.id)
        .await
        .unwrap()
        .unwrap();
    assert!(acknowledged.delivered_at.is_some());
    let provider_message_id: Option<String> =
        sqlx::query_scalar("SELECT provider_message_id FROM outbox_events WHERE id = $1")
            .bind(event.id)
            .fetch_one(storage.pg_pool.as_ref().unwrap())
            .await
            .unwrap();
    assert_eq!(provider_message_id.as_deref(), Some("provider-message-123"));
}

use cedros_login::repositories::{
    default_expiry, OutboxStatus, TokenType, UserEmailEntity, UserEntity, VerificationToken,
};
use uuid::Uuid;

async fn token_email(storage: &Storage) -> (OutboxEvent, Vec<VerificationToken>) {
    let email = format!("outbox-atomic-{}@example.com", Uuid::new_v4());
    let user = storage
        .user_repo
        .create(UserEntity::new_email_user(
            email.clone(),
            "hash".into(),
            None,
        ))
        .await
        .unwrap();
    let address = storage
        .user_email_repo
        .create(UserEmailEntity::new(user.id, email, true, true))
        .await
        .unwrap();
    let proofs = [TokenType::PasswordReset, TokenType::InstantLink]
        .into_iter()
        .map(|kind| {
            VerificationToken::new(
                user.id,
                Some(address.id),
                Uuid::new_v4().to_string(),
                kind,
                default_expiry(kind),
            )
        })
        .collect();
    (
        OutboxEvent::new(
            OutboxEventType::EmailPasswordReset,
            serde_json::json!({"token_enc":"test-ciphertext"}),
        )
        .with_user_id(user.id),
        proofs,
    )
}

#[tokio::test]
async fn token_replacement_rolls_back_when_enqueue_fails_and_retry_survives_reconnection() {
    let Some(storage) = storage().await else {
        return;
    };
    let (event, proofs) = token_email(&storage).await;
    let old = storage
        .verification_repo
        .create_for_subject(
            proofs[0].user_id,
            proofs[0].subject_id.unwrap(),
            &Uuid::new_v4().to_string(),
            TokenType::PasswordReset,
            default_expiry(TokenType::PasswordReset),
        )
        .await
        .unwrap();
    // A real outbox constraint failure occurs after both proof replacements.
    storage.outbox_repo.create(event.clone()).await.unwrap();
    assert!(storage
        .outbox_repo
        .create_with_tokens(event.clone(), &proofs)
        .await
        .is_err());
    assert!(storage
        .verification_repo
        .find_valid(&old.token_hash, &[TokenType::PasswordReset])
        .await
        .unwrap()
        .is_some());
    for proof in &proofs {
        assert!(storage
            .verification_repo
            .find_by_hash(&proof.token_hash)
            .await
            .unwrap()
            .is_none());
    }
    let mut retry = event.clone();
    retry.id = Uuid::new_v4();
    storage
        .outbox_repo
        .create_with_tokens(retry.clone(), &proofs)
        .await
        .unwrap();
    assert!(storage
        .verification_repo
        .find_by_hash(&old.token_hash)
        .await
        .unwrap()
        .is_none());
    let url = postgres_support::database_url().unwrap();
    drop(storage);
    let reopened = Storage::from_config(&DatabaseConfig {
        url: Some(url),
        max_connections: 4,
        min_connections: 1,
        connect_timeout_secs: 10,
        idle_timeout_secs: 60,
    })
    .await
    .unwrap();
    assert!(reopened
        .outbox_repo
        .find_by_id(retry.id)
        .await
        .unwrap()
        .is_some());
    for proof in proofs {
        assert!(reopened
            .verification_repo
            .consume_if_valid(&proof.token_hash, &[proof.token_type])
            .await
            .unwrap()
            .is_some());
        assert!(reopened
            .verification_repo
            .consume_if_valid(&proof.token_hash, &[proof.token_type])
            .await
            .unwrap()
            .is_none());
    }
}

#[tokio::test]
async fn concurrent_email_issuers_leave_one_coherent_pair_and_one_time_consumption() {
    let Some(storage) = storage().await else {
        return;
    };
    let (first, proofs) = token_email(&storage).await;
    let mut second = first.clone();
    second.id = Uuid::new_v4();
    let other: Vec<_> = proofs
        .iter()
        .map(|p| {
            VerificationToken::new(
                p.user_id,
                p.subject_id,
                Uuid::new_v4().to_string(),
                p.token_type,
                p.expires_at,
            )
        })
        .collect();
    let (a, b) = tokio::join!(
        storage.outbox_repo.create_with_tokens(first, &proofs),
        storage.outbox_repo.create_with_tokens(second, &other)
    );
    assert!(a.is_ok() && b.is_ok());
    let mut winners = Vec::new();
    for group in [&proofs, &other] {
        let reset = storage
            .verification_repo
            .find_valid(&group[0].token_hash, &[TokenType::PasswordReset])
            .await
            .unwrap();
        let instant = storage
            .verification_repo
            .find_valid(&group[1].token_hash, &[TokenType::InstantLink])
            .await
            .unwrap();
        assert_eq!(
            reset.is_some(),
            instant.is_some(),
            "never mix proofs from two emails"
        );
        if let Some(reset) = reset {
            winners.push(reset);
        }
    }
    assert_eq!(winners.len(), 1);
    let hash = &winners[0].token_hash;
    let (a, b) = tokio::join!(
        storage
            .verification_repo
            .consume_if_valid(hash, &[TokenType::PasswordReset]),
        storage
            .verification_repo
            .consume_if_valid(hash, &[TokenType::PasswordReset])
    );
    assert_eq!(
        usize::from(a.unwrap().is_some()) + usize::from(b.unwrap().is_some()),
        1
    );
}

#[tokio::test]
async fn stale_workers_cannot_start_or_release_newer_claims_or_retry_accepted_mail() {
    let Some(storage) = storage().await else {
        return;
    };
    let event = storage
        .outbox_repo
        .create(OutboxEvent::new(
            OutboxEventType::EmailInvite,
            serde_json::json!({}),
        ))
        .await
        .unwrap();
    let pool = storage.pg_pool.as_ref().unwrap();
    sqlx::query("UPDATE outbox_events SET locked_at=NOW() WHERE id=$1")
        .bind(event.id)
        .execute(pool)
        .await
        .unwrap();
    assert!(
        !storage.outbox_repo.mark_processing(&event).await.unwrap(),
        "unclaimed stale snapshot must not send"
    );
    let claim = storage
        .outbox_repo
        .find_by_id(event.id)
        .await
        .unwrap()
        .unwrap();
    assert!(storage.outbox_repo.mark_processing(&claim).await.unwrap());
    assert!(
        !storage.outbox_repo.mark_processing(&claim).await.unwrap(),
        "one claim, one attempt"
    );
    // A different worker reclaims a lease after a pause/crash.
    sqlx::query("UPDATE outbox_events SET locked_at=locked_at + INTERVAL '1 second' WHERE id=$1")
        .bind(event.id)
        .execute(pool)
        .await
        .unwrap();
    storage
        .outbox_repo
        .mark_retry(&claim, "old worker failure")
        .await
        .unwrap();
    let newer = storage
        .outbox_repo
        .find_by_id(event.id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(newer.status, OutboxStatus::Processing);
    assert!(newer.locked_at.is_some());
    assert!(storage.outbox_repo.mark_processing(&newer).await.unwrap());
    storage
        .outbox_repo
        .mark_delivered_with_receipt(event.id, Some("acceptance"))
        .await
        .unwrap();
    storage
        .outbox_repo
        .mark_retry(&newer, "late failure")
        .await
        .unwrap();
    storage
        .outbox_repo
        .mark_failed(&newer, "late failure")
        .await
        .unwrap();
    storage.outbox_repo.mark_done(event.id).await.unwrap();
    assert!(!storage.outbox_repo.mark_processing(&newer).await.unwrap());
    assert_eq!(
        storage
            .outbox_repo
            .find_by_id(event.id)
            .await
            .unwrap()
            .unwrap()
            .status,
        OutboxStatus::Done
    );
}

#[tokio::test]
async fn invitation_replacement_rolls_back_on_delivery_failure_and_serializes_retries() {
    use cedros_login::repositories::{
        default_invite_expiry, InviteEntity, MembershipEntity, OrgEntity, OrgRole, TransactionalOps,
    };
    let Some(storage) = storage().await else {
        return;
    };
    let (envelope, proofs) = token_email(&storage).await;
    let user_id = proofs[0].user_id;
    let org = storage
        .org_repo
        .create(OrgEntity::new_personal(user_id, None))
        .await
        .unwrap();
    storage
        .membership_repo
        .create(MembershipEntity::new_owner(user_id, org.id))
        .await
        .unwrap();
    let old = storage
        .invite_repo
        .create(InviteEntity {
            id: Uuid::new_v4(),
            org_id: org.id,
            email: Some(format!("invite-{}@example.com", Uuid::new_v4())),
            wallet_address: None,
            role: OrgRole::Member,
            token_hash: Uuid::new_v4().to_string(),
            invited_by: user_id,
            created_at: chrono::Utc::now(),
            expires_at: default_invite_expiry(),
            accepted_at: None,
        })
        .await
        .unwrap();
    let mut replacement = old.clone();
    replacement.id = Uuid::new_v4();
    replacement.token_hash = Uuid::new_v4().to_string();
    let mut mail = envelope;
    mail.event_type = OutboxEventType::EmailInvite;
    mail.org_id = Some(org.id);
    storage.outbox_repo.create(mail.clone()).await.unwrap();
    let pool = storage.pg_pool.as_ref().unwrap();
    assert!(TransactionalOps::issue_invite_atomic(
        pool,
        &replacement,
        Some(&old),
        Some(&mail),
        None
    )
    .await
    .is_err());
    assert!(storage
        .invite_repo
        .find_by_id(old.id)
        .await
        .unwrap()
        .is_some());
    assert!(storage
        .invite_repo
        .find_by_id(replacement.id)
        .await
        .unwrap()
        .is_none());
    mail.id = Uuid::new_v4();
    assert!(TransactionalOps::issue_invite_atomic(
        pool,
        &replacement,
        Some(&old),
        Some(&mail),
        Some(("single", 1))
    )
    .await
    .is_err());
    assert!(storage
        .invite_repo
        .find_by_id(old.id)
        .await
        .unwrap()
        .is_some());
    let mut rival = replacement.clone();
    rival.id = Uuid::new_v4();
    rival.token_hash = Uuid::new_v4().to_string();
    let mut rival_mail = mail.clone();
    rival_mail.id = Uuid::new_v4();
    let (a, b) = tokio::join!(
        TransactionalOps::issue_invite_atomic(
            pool,
            &replacement,
            Some(&old),
            Some(&mail),
            Some(("team", 2))
        ),
        TransactionalOps::issue_invite_atomic(
            pool,
            &rival,
            Some(&old),
            Some(&rival_mail),
            Some(("team", 2))
        )
    );
    assert_eq!(usize::from(a.is_ok()) + usize::from(b.is_ok()), 1);
    assert!(storage
        .invite_repo
        .find_by_id(old.id)
        .await
        .unwrap()
        .is_none());
    assert_eq!(
        usize::from(
            storage
                .outbox_repo
                .find_by_id(mail.id)
                .await
                .unwrap()
                .is_some()
        ) + usize::from(
            storage
                .outbox_repo
                .find_by_id(rival_mail.id)
                .await
                .unwrap()
                .is_some()
        ),
        1
    );
    let winner = if a.is_ok() { replacement } else { rival };
    storage.invite_repo.mark_accepted(winner.id).await.unwrap();
    let mut invalid = winner.clone();
    invalid.id = Uuid::new_v4();
    assert!(TransactionalOps::issue_invite_atomic(
        pool,
        &invalid,
        Some(&winner),
        Some(&mail),
        None
    )
    .await
    .is_err());
    assert!(storage
        .invite_repo
        .find_by_id(winner.id)
        .await
        .unwrap()
        .unwrap()
        .accepted_at
        .is_some());
}
