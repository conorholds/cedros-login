//! Integration tests for PostgreSQL repositories
//!
//! These tests require a running PostgreSQL database.
//! Set TEST_DATABASE_URL environment variable to run these tests:
//!
//! ```bash
//! TEST_DATABASE_URL=postgres://user:pass@localhost/cedros_test cargo test --features postgres
//! ```

#![cfg(feature = "postgres")]

#[path = "support/postgres.rs"]
mod postgres_support;

use axum::http::StatusCode;
use chrono::{Duration, Utc};
use sqlx::{query, query_scalar};
use std::env;
use std::sync::Once;
use uuid::Uuid;

use cedros_login::autosave::{
    postgres_begin_idempotency, postgres_complete_idempotency, AutosaveIdempotencyDecision,
    AutosaveIdempotencyScope,
};
use cedros_login::errors::AppError;
use cedros_login::repositories::{
    AbacPolicy, AttributeMatcher, CustomRole, LoginAttemptConfig, NonceEntity, OrgEntity,
    OutboxEvent, OutboxEventType, PolicyConditions, PolicyEffect, SessionEntity,
    SettingsAutosaveDecision, SettingsAutosaveError, UserEntity,
};
use cedros_login::services::TotpService;
use cedros_login::Storage;
use cedros_login::{config::DatabaseConfig, models::AuthMethod};

static SETTINGS_AUTOSAVE_TEST_LOCK: tokio::sync::Mutex<()> = tokio::sync::Mutex::const_new(());

/// Get test database URL or skip tests
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

/// Create test storage with Postgres backend
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

/// Helper to create unique test email
fn test_email() -> String {
    format!("test_{}@example.com", Uuid::new_v4())
}

/// Helper to create unique wallet address
fn test_wallet() -> String {
    let uuid_str = Uuid::new_v4().to_string().replace('-', "");
    format!("Test{uuid_str}")
}

/// Helper to create unique referral codes for DB-constraint-safe fixtures.
fn test_referral_code() -> String {
    let uuid_str = Uuid::new_v4().simple().to_string();
    format!("T{}", &uuid_str[..7]).to_uppercase()
}

async fn create_user(storage: &Storage) -> UserEntity {
    let user = UserEntity {
        id: Uuid::new_v4(),
        email: Some(test_email()),
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
    storage.user_repo.create(user).await.unwrap()
}

async fn create_org(storage: &Storage, owner_id: Uuid) -> OrgEntity {
    let org = OrgEntity::new(
        "Test Org".to_string(),
        format!("org-{}", Uuid::new_v4()),
        owner_id,
        false,
    );
    storage.org_repo.create(org).await.unwrap()
}

// ============================================================================
// User Repository Tests
// ============================================================================

#[path = "postgres_tests/autosave.rs"]
mod autosave;
#[path = "postgres_tests/nonce_and_lockout.rs"]
mod nonce_and_lockout;
#[path = "postgres_tests/roles_and_outbox.rs"]
mod roles_and_outbox;
#[path = "postgres_tests/sessions.rs"]
mod sessions;
#[path = "postgres_tests/totp.rs"]
mod totp;
#[path = "postgres_tests/users.rs"]
mod users;

#[path = "postgres_tests/performance.rs"]
mod performance;

#[path = "postgres_tests/invite_codes.rs"]
mod invite_codes;
