//! Real-PostgreSQL atomicity and concurrency tests for canonical email changes.

#![cfg(feature = "postgres")]

#[path = "support/postgres.rs"]
mod postgres_support;

use std::env;
use std::sync::Once;

use cedros_login::config::DatabaseConfig;
use cedros_login::repositories::{AdminCanonicalEmailUpdate, UserEmailEntity, UserEntity};
use cedros_login::Storage;
use uuid::Uuid;

async fn storage() -> Option<Storage> {
    let url = postgres_support::database_url()?;
    static SECRET: Once = Once::new();
    SECRET.call_once(|| {
        env::set_var(
            "TOTP_ENCRYPTION_SECRET",
            "canonical-email-test-secret-at-least-32-bytes",
        );
    });
    let config = DatabaseConfig {
        url: Some(url),
        max_connections: 4,
        min_connections: 1,
        connect_timeout_secs: 10,
        idle_timeout_secs: 60,
    };
    Some(Storage::from_config(&config).await.unwrap_or_else(|error| {
        panic!("TEST_DATABASE_URL is set but PostgreSQL initialization failed: {error:?}")
    }))
}

async fn seeded_user(storage: &Storage, email: String) -> UserEntity {
    let mut user = UserEntity::new_email_user(email.clone(), "hash".into(), None);
    user.email_verified = true;
    let user = storage.user_repo.create(user).await.unwrap();
    storage
        .user_email_repo
        .create(UserEmailEntity::new(user.id, email, true, true))
        .await
        .unwrap();
    user
}

fn unique_email(label: &str) -> String {
    format!("canonical-{label}-{}@example.com", Uuid::new_v4())
}

#[tokio::test]
async fn admin_transition_commits_user_and_email_rows_together() {
    let Some(storage) = storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };
    let old = unique_email("old");
    let new = unique_email("new");
    let user = seeded_user(&storage, old.clone()).await;
    let updated = storage
        .canonical_email_repo
        .admin_update(AdminCanonicalEmailUpdate {
            user_id: user.id,
            email: Some(new.clone()),
            ..Default::default()
        })
        .await
        .unwrap();
    assert_eq!(updated.email.as_deref(), Some(new.as_str()));
    assert!(!updated.email_verified);
    let rows = storage.user_email_repo.list_by_user(user.id).await.unwrap();
    assert_eq!(rows.iter().filter(|row| row.is_primary).count(), 1);
    assert!(rows
        .iter()
        .any(|row| row.email == old && row.is_verified() && !row.is_primary));
    assert!(rows
        .iter()
        .any(|row| row.email == new && !row.is_verified() && row.is_primary));
}

#[tokio::test]
async fn concurrent_duplicate_target_rolls_back_loser_completely() {
    let Some(storage) = storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };
    let first = seeded_user(&storage, unique_email("first")).await;
    let second = seeded_user(&storage, unique_email("second")).await;
    let target = unique_email("race-target");
    let update = |user_id| AdminCanonicalEmailUpdate {
        user_id,
        email: Some(target.clone()),
        ..Default::default()
    };
    let (one, two) = tokio::join!(
        storage.canonical_email_repo.admin_update(update(first.id)),
        storage.canonical_email_repo.admin_update(update(second.id)),
    );
    assert_ne!(one.is_ok(), two.is_ok(), "exactly one transition must win");
    let loser = if one.is_err() { first } else { second };
    let stored = storage
        .user_repo
        .find_by_id(loser.id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(stored.email, loser.email);
    assert_eq!(stored.email_verified, loser.email_verified);
    let rows = storage
        .user_email_repo
        .list_by_user(loser.id)
        .await
        .unwrap();
    assert_eq!(rows.iter().filter(|row| row.is_primary).count(), 1);
    let primary = rows.iter().find(|row| row.is_primary).unwrap();
    assert_eq!(stored.email.as_deref(), Some(primary.email.as_str()));
    assert_eq!(stored.email_verified, primary.is_verified());
    assert!(!rows.iter().any(|row| row.email == target));
}

#[tokio::test]
async fn expiry_cleanup_never_deletes_primary_identity_row() {
    let Some(storage) = storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };
    let user = seeded_user(&storage, unique_email("cleanup-primary")).await;
    let pool = storage.pg_pool.as_ref().unwrap();
    sqlx::query(
        "UPDATE user_emails SET verified_at = NULL, created_at = NOW() - INTERVAL '72 hours' WHERE user_id = $1",
    )
    .bind(user.id)
    .execute(pool)
    .await
    .unwrap();
    storage
        .user_email_repo
        .delete_expired_unverified()
        .await
        .unwrap();
    let rows = storage.user_email_repo.list_by_user(user.id).await.unwrap();
    assert_eq!(rows.len(), 1);
    assert!(rows[0].is_primary);
}
