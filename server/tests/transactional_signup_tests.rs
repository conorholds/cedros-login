//! PostgreSQL transaction tests for email/password signup persistence.

#![cfg(feature = "postgres")]

#[path = "support/postgres.rs"]
mod postgres_support;

use std::env;
use std::sync::Once;

use cedros_login::config::DatabaseConfig;
use cedros_login::repositories::{
    MembershipEntity, OrgEntity, OrgRole, TransactionalOps, UserEntity,
};
use cedros_login::Storage;
use sqlx::query_scalar;
use uuid::Uuid;

fn get_test_db_url() -> Option<String> {
    postgres_support::database_url()
}

fn ensure_test_encryption_secret() {
    static SET_TEST_SECRET: Once = Once::new();
    SET_TEST_SECRET.call_once(|| {
        if env::var("TOTP_ENCRYPTION_SECRET")
            .ok()
            .filter(|value| !value.trim().is_empty())
            .is_none()
        {
            env::set_var(
                "TOTP_ENCRYPTION_SECRET",
                "test-totp-encryption-secret-32-bytes-min",
            );
        }
    });
}

async fn create_test_storage() -> Option<Storage> {
    let url = get_test_db_url()?;
    ensure_test_encryption_secret();

    let config = DatabaseConfig {
        url: Some(url),
        max_connections: 2,
        min_connections: 1,
        connect_timeout_secs: 10,
        idle_timeout_secs: 60,
    };
    Some(Storage::from_config(&config).await.unwrap_or_else(|error| {
        panic!(
            "TEST_DATABASE_URL is set but PostgreSQL test storage failed to initialize: {error:?}"
        )
    }))
}

fn test_email() -> String {
    format!("transactional_{}@example.com", Uuid::new_v4())
}

async fn create_user(storage: &Storage) -> UserEntity {
    let user = UserEntity::new_email_user(
        test_email(),
        "hashed-password".to_string(),
        Some("Owner User".to_string()),
    );
    storage.user_repo.create(user).await.unwrap()
}

async fn create_org(storage: &Storage, owner_id: Uuid) -> OrgEntity {
    let org = OrgEntity::new(
        "Transactional Test Org".to_string(),
        format!("transactional-{}", Uuid::new_v4()),
        owner_id,
        false,
    );
    storage.org_repo.create(org).await.unwrap()
}

#[tokio::test]
async fn creates_user_primary_email_and_membership_atomically() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };
    let pool = storage.pg_pool.as_ref().expect("postgres pool");
    let owner = create_user(&storage).await;
    let org = create_org(&storage, owner.id).await;
    let mut user = UserEntity::new_email_user(
        test_email(),
        "hashed-password".to_string(),
        Some("Transactional User".to_string()),
    );
    user.email_verified = true;
    let email = user.email.clone().expect("email user");
    let membership = MembershipEntity::new(user.id, org.id, OrgRole::Member);

    TransactionalOps::create_user_with_primary_email_and_membership(pool, &user, &membership)
        .await
        .unwrap();

    let stored = storage.user_repo.find_by_id(user.id).await.unwrap();
    assert_eq!(stored.expect("created user").email, Some(email.clone()));
    assert!(storage
        .membership_repo
        .find_by_user_and_org(user.id, org.id)
        .await
        .unwrap()
        .is_some());

    let primary_email_count: i64 = query_scalar(
        r#"
        SELECT COUNT(*)
        FROM user_emails
        WHERE user_id = $1 AND email = $2 AND is_primary = true AND verified_at IS NOT NULL
        "#,
    )
    .bind(user.id)
    .bind(&email)
    .fetch_one(pool)
    .await
    .unwrap();
    assert_eq!(primary_email_count, 1);
}

#[tokio::test]
async fn rolls_back_user_when_membership_insert_fails() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };
    let pool = storage.pg_pool.as_ref().expect("postgres pool");
    let user = UserEntity::new_email_user(
        test_email(),
        "hashed-password".to_string(),
        Some("Rollback User".to_string()),
    );
    let email = user.email.clone().expect("email user");
    let membership = MembershipEntity::new(user.id, Uuid::new_v4(), OrgRole::Member);

    let result =
        TransactionalOps::create_user_with_primary_email_and_membership(pool, &user, &membership)
            .await;

    assert!(result.is_err());

    let user_count: i64 = query_scalar("SELECT COUNT(*) FROM users WHERE id = $1")
        .bind(user.id)
        .fetch_one(pool)
        .await
        .unwrap();
    let email_count: i64 =
        query_scalar("SELECT COUNT(*) FROM user_emails WHERE user_id = $1 OR email = $2")
            .bind(user.id)
            .bind(&email)
            .fetch_one(pool)
            .await
            .unwrap();
    let membership_count: i64 = query_scalar("SELECT COUNT(*) FROM memberships WHERE user_id = $1")
        .bind(user.id)
        .fetch_one(pool)
        .await
        .unwrap();

    assert_eq!(user_count, 0);
    assert_eq!(email_count, 0);
    assert_eq!(membership_count, 0);
}
