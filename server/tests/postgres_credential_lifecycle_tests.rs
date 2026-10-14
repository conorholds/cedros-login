//! PostgreSQL contract tests for authoritative credential lifecycle mutations.

#![cfg(feature = "postgres")]

#[path = "support/postgres.rs"]
mod postgres_support;

use cedros_login::config::DatabaseConfig;
use cedros_login::models::AuthMethod;
use cedros_login::repositories::{
    synthetic_credential_id, CredentialType, CredentialUnlinkOutcome, SessionEntity, UserEntity,
    WebAuthnCredential,
};
use cedros_login::Storage;
use chrono::{Duration, Utc};
use std::env;
use std::sync::Once;
use uuid::Uuid;

async fn storage() -> Option<Storage> {
    let url = postgres_support::database_url()?;
    static SECRET: Once = Once::new();
    SECRET.call_once(|| {
        if env::var("TOTP_ENCRYPTION_SECRET")
            .ok()
            .filter(|value| !value.trim().is_empty())
            .is_none()
        {
            env::set_var(
                "TOTP_ENCRYPTION_SECRET",
                "credential-lifecycle-test-secret-32-bytes",
            );
        }
    });
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

async fn user_with_password_and_google(storage: &Storage) -> UserEntity {
    let mut user = UserEntity::new_email_user(
        format!("credential-{}@example.com", Uuid::new_v4()),
        "test-password-hash".into(),
        None,
    );
    user.email_verified = true;
    user.google_id = Some(format!("google-{}", Uuid::new_v4()));
    user.auth_methods.push(AuthMethod::Google);
    storage.user_repo.create(user).await.unwrap()
}

#[tokio::test]
async fn authoritative_unlink_updates_real_store_and_revokes_other_sessions() {
    let Some(storage) = storage().await else {
        return;
    };
    let mut user = user_with_password_and_google(&storage).await;
    user.auth_methods.push(AuthMethod::WebAuthn);
    let user = storage.user_repo.update(user).await.unwrap();
    let passkey = storage
        .webauthn_repo
        .create_credential(WebAuthnCredential::new(
            user.id,
            format!("credential-{}", Uuid::new_v4()),
            "public-key".into(),
            0,
            true,
        ))
        .await
        .unwrap();
    let current_session = storage
        .session_repo
        .create(SessionEntity::new(
            user.id,
            format!("current-{}", Uuid::new_v4()),
            Utc::now() + Duration::hours(1),
            None,
            None,
        ))
        .await
        .unwrap();
    let other_session = storage
        .session_repo
        .create(SessionEntity::new(
            user.id,
            format!("other-{}", Uuid::new_v4()),
            Utc::now() + Duration::hours(1),
            None,
            None,
        ))
        .await
        .unwrap();

    let inventory = storage
        .credential_lifecycle_repo
        .list(user.id)
        .await
        .unwrap();
    assert_eq!(inventory.len(), 3);
    assert!(inventory
        .iter()
        .any(|credential| credential.id == passkey.id));
    let google_id = synthetic_credential_id(user.id, CredentialType::OauthGoogle);
    assert!(matches!(
        storage
            .credential_lifecycle_repo
            .unlink(user.id, google_id, current_session.id)
            .await
            .unwrap(),
        CredentialUnlinkOutcome::Removed(_)
    ));

    let updated = storage
        .user_repo
        .find_by_id(user.id)
        .await
        .unwrap()
        .unwrap();
    assert!(updated.google_id.is_none());
    assert!(!updated.auth_methods.contains(&AuthMethod::Google));
    let revoked = storage
        .session_repo
        .find_by_id(other_session.id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(
        revoked.revoked_reason.as_deref(),
        Some("credential_unlinked")
    );
}

#[tokio::test]
async fn concurrent_primary_removals_preserve_one_postgres_login_method() {
    let Some(storage) = storage().await else {
        return;
    };
    let user = user_with_password_and_google(&storage).await;
    let password = synthetic_credential_id(user.id, CredentialType::Password);
    let google = synthetic_credential_id(user.id, CredentialType::OauthGoogle);
    let first = storage.credential_lifecycle_repo.clone();
    let second = storage.credential_lifecycle_repo.clone();

    let (password_result, google_result) = tokio::join!(
        first.unlink(user.id, password, Uuid::new_v4()),
        second.unlink(user.id, google, Uuid::new_v4()),
    );
    let outcomes = [password_result.unwrap(), google_result.unwrap()];
    assert_eq!(
        outcomes
            .iter()
            .filter(|outcome| matches!(outcome, CredentialUnlinkOutcome::Removed(_)))
            .count(),
        1
    );
    assert_eq!(
        outcomes
            .iter()
            .filter(|outcome| matches!(outcome, CredentialUnlinkOutcome::LastPrimary))
            .count(),
        1
    );

    let inventory = storage
        .credential_lifecycle_repo
        .list(user.id)
        .await
        .unwrap();
    assert_eq!(
        inventory
            .iter()
            .filter(|credential| credential.credential_type.is_primary())
            .count(),
        1
    );
}

#[tokio::test]
async fn enrollment_and_api_keys_reject_stale_accounts_and_revoked_sessions() {
    let Some(storage) = storage().await else {
        return;
    };

    let mut user = UserEntity::new_email_user(
        format!("enroll-{}@example.com", Uuid::new_v4()),
        "hash".into(),
        None,
    );
    user.email_verified = true;
    let user = storage.user_repo.create(user).await.unwrap();
    let session = storage
        .session_repo
        .create(SessionEntity::new(
            user.id,
            format!("refresh-{}", Uuid::new_v4()),
            Utc::now() + Duration::hours(1),
            None,
            None,
        ))
        .await
        .unwrap();
    let other = storage
        .session_repo
        .create(SessionEntity::new(
            user.id,
            format!("other-{}", Uuid::new_v4()),
            Utc::now() + Duration::hours(1),
            None,
            None,
        ))
        .await
        .unwrap();
    let credential = WebAuthnCredential::new(
        user.id,
        format!("credential-{}", Uuid::new_v4()),
        "public-key".into(),
        0,
        true,
    );
    let saved = storage
        .credential_lifecycle_repo
        .enroll_passkey_if_current(&user, session.id, credential)
        .await
        .unwrap();
    assert!(storage
        .webauthn_repo
        .find_credential_by_id(saved.id)
        .await
        .unwrap()
        .is_some());
    assert!(storage
        .session_repo
        .find_by_id(other.id)
        .await
        .unwrap()
        .unwrap()
        .is_revoked());
    let current = storage
        .user_repo
        .find_by_id(user.id)
        .await
        .unwrap()
        .unwrap();
    assert!(current.auth_methods.contains(&AuthMethod::WebAuthn));
    let stale = WebAuthnCredential::new(
        user.id,
        format!("stale-{}", Uuid::new_v4()),
        "key".into(),
        0,
        true,
    );
    assert!(storage
        .credential_lifecycle_repo
        .enroll_passkey_if_current(&user, session.id, stale)
        .await
        .is_err());
    let key = cedros_login::repositories::ApiKeyEntity::new(
        user.id,
        &format!("ck_{}", Uuid::new_v4()),
        "conditional",
    );
    assert!(storage
        .credential_lifecycle_repo
        .create_api_key_if_current(&user, session.id, key.clone())
        .await
        .is_err());
    storage
        .credential_lifecycle_repo
        .create_api_key_if_current(&current, session.id, key.clone())
        .await
        .unwrap();
    storage.session_repo.revoke(session.id).await.unwrap();
    let revoked = WebAuthnCredential::new(
        user.id,
        format!("revoked-{}", Uuid::new_v4()),
        "key".into(),
        0,
        true,
    );
    assert!(storage
        .credential_lifecycle_repo
        .enroll_passkey_if_current(&current, session.id, revoked)
        .await
        .is_err());
    assert!(storage
        .credential_lifecycle_repo
        .create_api_key_if_current(&current, session.id, key)
        .await
        .is_err());
    assert_eq!(
        storage
            .webauthn_repo
            .find_by_user(user.id)
            .await
            .unwrap()
            .len(),
        1
    );
}

#[tokio::test]
async fn concurrent_admin_removals_and_stale_profile_updates_preserve_authority_invariants() {
    use cedros_login::repositories::{PostgresUserRepository, UserRepository};
    let Some(storage) = storage().await else {
        return;
    };
    let root_pool = storage.pg_pool.as_ref().unwrap();
    // Isolate the global last-admin invariant from other test fixtures.
    let schema = format!("admin_race_{}", Uuid::new_v4().simple());
    sqlx::query(&format!("CREATE SCHEMA {schema}"))
        .execute(root_pool)
        .await
        .unwrap();
    sqlx::query(&format!(
        "CREATE TABLE {schema}.users (LIKE public.users INCLUDING ALL)"
    ))
    .execute(root_pool)
    .await
    .unwrap();
    let search_path = format!("SET search_path TO {schema}, public");
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(2)
        .after_connect(move |connection, _| {
            let query = search_path.clone();
            Box::pin(async move {
                sqlx::query(&query).execute(connection).await?;
                Ok(())
            })
        })
        .connect(&postgres_support::database_url().unwrap())
        .await
        .unwrap();
    let repo = PostgresUserRepository::new(pool.clone());
    let mut a = UserEntity::new_email_user("admin-a@example.com".into(), "hash".into(), None);
    let mut b = UserEntity::new_email_user("admin-b@example.com".into(), "hash".into(), None);
    a.is_system_admin = true;
    b.is_system_admin = true;
    let a = repo.create(a).await.unwrap();
    let b = repo.create(b).await.unwrap();
    let (left, right) = tokio::join!(
        repo.set_system_admin(a.id, false),
        repo.set_system_admin(b.id, false)
    );
    assert_eq!(usize::from(left.is_ok()) + usize::from(right.is_ok()), 1);
    assert_eq!(repo.count_system_admins().await.unwrap(), 1);
    let mut stale = if left.is_ok() { a.clone() } else { b.clone() };
    stale.name = Some("Updated profile".into());
    assert!(
        !repo.update(stale).await.unwrap().is_system_admin,
        "stale snapshots cannot restore revoked privilege"
    );
    let remaining = if left.is_ok() { b.id } else { a.id };
    assert!(repo.delete(remaining).await.is_err());
    assert!(repo
        .anonymize_for_deletion(remaining, "deleted-admin")
        .await
        .is_err());
    assert_eq!(repo.count_system_admins().await.unwrap(), 1);
    pool.close().await;
    sqlx::query(&format!("DROP SCHEMA {schema} CASCADE"))
        .execute(root_pool)
        .await
        .unwrap();
}
