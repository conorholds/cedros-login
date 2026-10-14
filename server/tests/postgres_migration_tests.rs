//! Positive PostgreSQL migration-boundary tests.

#![cfg(feature = "postgres")]

#[path = "support/postgres.rs"]
mod postgres_support;

use cedros_login::config::DatabaseConfig;
use cedros_login::Storage;

const LATEST_MIGRATION: i64 = 20_260_922_000_002;

#[tokio::test]
async fn applies_all_embedded_migrations_through_latest_version() {
    let Some(url) = postgres_support::database_url() else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };
    let storage = Storage::from_config(&DatabaseConfig {
        url: Some(url),
        max_connections: 2,
        min_connections: 1,
        connect_timeout_secs: 10,
        idle_timeout_secs: 60,
    })
    .await
    .expect("configured PostgreSQL must connect and apply every embedded migration");
    let pool = storage.pg_pool.as_ref().expect("PostgreSQL pool");

    let applied: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM _sqlx_migrations WHERE version = $1 AND success)",
    )
    .bind(LATEST_MIGRATION)
    .fetch_one(pool)
    .await
    .expect("read SQLx migration ledger");
    assert!(applied, "latest embedded migration was not applied");

    let receipt_column: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM information_schema.columns \
         WHERE table_schema = 'public' AND table_name = 'outbox_events' \
         AND column_name = 'provider_message_id')",
    )
    .fetch_one(pool)
    .await
    .expect("inspect migrated outbox schema");
    assert!(receipt_column, "latest outbox schema is incomplete");

    let live_token_index: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' \
         AND indexname = 'verification_tokens_one_live_purpose_subject')",
    )
    .fetch_one(pool)
    .await
    .expect("inspect live verification-token uniqueness index");
    assert!(
        live_token_index,
        "latest verification-token schema is incomplete"
    );
}
