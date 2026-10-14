//! Real-PostgreSQL atomic email-verification transaction tests.

#![cfg(feature = "postgres")]

#[path = "support/postgres.rs"]
mod postgres_support;

use cedros_login::config::DatabaseConfig;
use cedros_login::repositories::{default_expiry, TokenType, UserEmailEntity, UserEntity};
use cedros_login::Storage;
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
                "email-verification-test-secret-32-bytes",
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

async fn unverified_user(storage: &Storage) -> (UserEntity, UserEmailEntity) {
    let email = format!("atomic-verify-{}@example.com", Uuid::new_v4());
    let user = storage
        .user_repo
        .create(UserEntity::new_email_user(
            email.clone(),
            "hash".into(),
            None,
        ))
        .await
        .unwrap();
    let primary = storage
        .user_email_repo
        .create(UserEmailEntity::new(user.id, email, false, true))
        .await
        .unwrap();
    (user, primary)
}

#[tokio::test]
async fn database_failure_rolls_back_token_and_email_then_retry_succeeds() {
    let Some(storage) = storage().await else {
        return;
    };
    let (user, primary) = unverified_user(&storage).await;
    let secondary = storage
        .user_email_repo
        .create(UserEmailEntity::new(
            user.id,
            format!("attacker-recovery-{}@example.com", Uuid::new_v4()),
            true,
            false,
        ))
        .await
        .unwrap();
    let token_hash = format!("atomic-email-verify-{}", Uuid::new_v4());
    storage
        .verification_repo
        .create_for_subject(
            user.id,
            primary.id,
            &token_hash,
            TokenType::EmailVerify,
            default_expiry(TokenType::EmailVerify),
        )
        .await
        .unwrap();
    let pool = storage.pg_pool.as_ref().unwrap();
    let suffix = Uuid::new_v4().simple().to_string();
    let function = format!("fail_email_verification_{suffix}");
    let trigger = format!("fail_email_verification_trigger_{suffix}");
    install_failure_trigger(pool, &function, &trigger, user.id).await;

    assert!(storage
        .email_verification_repo
        .verify_email_token(&token_hash, &[TokenType::EmailVerify])
        .await
        .is_err());
    assert_unchanged(&storage, user.id, primary.id, &token_hash).await;
    assert!(storage
        .user_email_repo
        .find_by_id(secondary.id)
        .await
        .unwrap()
        .is_some());
    remove_failure_trigger(pool, &function, &trigger).await;

    assert!(storage
        .email_verification_repo
        .verify_email_token(&token_hash, &[TokenType::EmailVerify])
        .await
        .unwrap()
        .is_some());
    assert!(
        storage
            .user_repo
            .find_by_id(user.id)
            .await
            .unwrap()
            .unwrap()
            .email_verified
    );
    assert!(storage
        .user_email_repo
        .find_by_id(primary.id)
        .await
        .unwrap()
        .unwrap()
        .is_verified());
    assert!(storage
        .user_email_repo
        .find_by_id(secondary.id)
        .await
        .unwrap()
        .is_none());
}

#[tokio::test]
async fn concurrent_database_verification_has_one_winner() {
    let Some(storage) = storage().await else {
        return;
    };
    let (user, primary) = unverified_user(&storage).await;
    let token_hash = format!("concurrent-email-verify-{}", Uuid::new_v4());
    storage
        .verification_repo
        .create_for_subject(
            user.id,
            primary.id,
            &token_hash,
            TokenType::EmailVerify,
            default_expiry(TokenType::EmailVerify),
        )
        .await
        .unwrap();
    let first = storage.email_verification_repo.clone();
    let second = storage.email_verification_repo.clone();
    let (one, two) = tokio::join!(
        first.verify_email_token(&token_hash, &[TokenType::EmailVerify]),
        second.verify_email_token(&token_hash, &[TokenType::EmailVerify]),
    );
    let winners = [one.unwrap(), two.unwrap()]
        .into_iter()
        .filter(Option::is_some)
        .count();
    assert_eq!(winners, 1);
}

async fn assert_unchanged(storage: &Storage, user_id: Uuid, email_id: Uuid, token_hash: &str) {
    assert!(
        !storage
            .user_repo
            .find_by_id(user_id)
            .await
            .unwrap()
            .unwrap()
            .email_verified
    );
    assert!(!storage
        .user_email_repo
        .find_by_id(email_id)
        .await
        .unwrap()
        .unwrap()
        .is_verified());
    assert!(storage
        .verification_repo
        .find_valid(token_hash, &[TokenType::EmailVerify])
        .await
        .unwrap()
        .is_some());
}

async fn install_failure_trigger(
    pool: &sqlx::PgPool,
    function: &str,
    trigger: &str,
    user_id: Uuid,
) {
    let sql = format!(
        r#"CREATE FUNCTION {function}() RETURNS trigger AS $$
           BEGIN RAISE EXCEPTION 'injected email verification failure'; END;
           $$ LANGUAGE plpgsql;
           CREATE TRIGGER {trigger} BEFORE UPDATE ON users
           FOR EACH ROW WHEN (OLD.id = '{user_id}'::uuid)
           EXECUTE FUNCTION {function}();"#
    );
    sqlx::raw_sql(&sql).execute(pool).await.unwrap();
}

async fn remove_failure_trigger(pool: &sqlx::PgPool, function: &str, trigger: &str) {
    let sql =
        format!("DROP TRIGGER IF EXISTS {trigger} ON users; DROP FUNCTION IF EXISTS {function}();");
    sqlx::raw_sql(&sql).execute(pool).await.unwrap();
}

#[tokio::test]
async fn mailbox_claim_rejects_stale_proof_and_atomically_evicts_prior_authority() {
    use cedros_login::repositories::{ApiKeyEntity, SessionEntity, WebAuthnCredential};
    for password in [None, Some("new-password-hash")] {
        let Some(storage) = storage().await else {
            return;
        };
        let (user, primary) = unverified_user(&storage).await;
        let raw = format!("ck_{}", Uuid::new_v4());
        storage
            .api_key_repo
            .create(ApiKeyEntity::new(user.id, &raw, "preclaim"))
            .await
            .unwrap();
        let session = storage
            .session_repo
            .create(SessionEntity::new(
                user.id,
                format!("session-{}", Uuid::new_v4()),
                chrono::Utc::now() + chrono::Duration::hours(1),
                None,
                None,
            ))
            .await
            .unwrap();
        storage
            .webauthn_repo
            .create_credential(WebAuthnCredential::new(
                user.id,
                format!("passkey-{}", Uuid::new_v4()),
                "key".into(),
                0,
                true,
            ))
            .await
            .unwrap();
        assert!(storage
            .email_verification_repo
            .claim_unverified_primary(&user, Uuid::new_v4(), password)
            .await
            .is_err());
        let mut changed = user.clone();
        changed.name = Some("changed".into());
        let changed = storage
            .user_repo
            .update_if_current(changed, user.updated_at)
            .await
            .unwrap();
        assert!(storage
            .email_verification_repo
            .claim_unverified_primary(&user, primary.id, password)
            .await
            .is_err());
        assert!(storage
            .api_key_repo
            .find_by_key(&raw)
            .await
            .unwrap()
            .is_some());
        let claimed = storage
            .email_verification_repo
            .claim_unverified_primary(&changed, primary.id, password)
            .await
            .unwrap();
        assert!(claimed.email_verified);
        assert_eq!(claimed.password_hash.as_deref(), password);
        assert!(storage
            .api_key_repo
            .find_by_key(&raw)
            .await
            .unwrap()
            .is_none());
        assert!(storage
            .webauthn_repo
            .find_by_user(user.id)
            .await
            .unwrap()
            .is_empty());
        assert!(storage
            .session_repo
            .find_by_id(session.id)
            .await
            .unwrap()
            .unwrap()
            .is_revoked());
        assert!(storage
            .email_verification_repo
            .claim_unverified_primary(&claimed, primary.id, password)
            .await
            .is_err());
        assert!(storage
            .credential_lifecycle_repo
            .delete_identity_if_current(&user, "stale-deletion")
            .await
            .is_err());
        assert!(sqlx::query("UPDATE users SET email=NULL, password_hash=NULL, auth_methods='{}', name='Not a deleted account' WHERE id=$1")
            .bind(user.id).execute(storage.pg_pool.as_ref().unwrap()).await.is_err());
        storage
            .credential_lifecycle_repo
            .delete_identity_if_current(&claimed, &format!("del{}", Uuid::new_v4().simple()))
            .await
            .unwrap();
        let mut deleted = storage
            .user_repo
            .find_by_id(user.id)
            .await
            .unwrap()
            .unwrap();
        let revision = deleted.updated_at;
        deleted.google_id = Some("resurrection".into());
        assert!(storage
            .user_repo
            .update_if_current(deleted, revision)
            .await
            .is_err());
        assert!(storage
            .user_email_repo
            .find_active_by_email(&primary.email)
            .await
            .unwrap()
            .is_none());
    }
}

#[tokio::test]
async fn failed_identity_deletion_preserves_login_authority_then_retry_commits() {
    use cedros_login::repositories::{ApiKeyEntity, SessionEntity, WebAuthnCredential};
    let Some(storage) = storage().await else {
        return;
    };
    let (user, primary) = unverified_user(&storage).await;
    let org = storage
        .org_repo
        .create(cedros_login::repositories::OrgEntity::new_personal(
            user.id, None,
        ))
        .await
        .unwrap();
    storage
        .membership_repo
        .create(cedros_login::repositories::MembershipEntity::new_owner(
            user.id, org.id,
        ))
        .await
        .unwrap();
    let raw = format!("ck_{}", Uuid::new_v4());
    storage
        .api_key_repo
        .create(ApiKeyEntity::new(user.id, &raw, "deletion-test"))
        .await
        .unwrap();
    let session = storage
        .session_repo
        .create(SessionEntity::new(
            user.id,
            format!("session-{}", Uuid::new_v4()),
            chrono::Utc::now() + chrono::Duration::hours(1),
            None,
            None,
        ))
        .await
        .unwrap();
    storage
        .webauthn_repo
        .create_credential(WebAuthnCredential::new(
            user.id,
            format!("passkey-{}", Uuid::new_v4()),
            "key".into(),
            0,
            true,
        ))
        .await
        .unwrap();
    let pool = storage.pg_pool.as_ref().unwrap();
    let suffix = Uuid::new_v4().simple().to_string();
    let function = format!("fail_delete_{suffix}");
    let trigger = format!("fail_delete_trigger_{suffix}");
    install_failure_trigger(pool, &function, &trigger, user.id).await;
    let result = storage
        .credential_lifecycle_repo
        .delete_identity_if_current(&user, &format!("del{suffix}"))
        .await;
    remove_failure_trigger(pool, &function, &trigger).await;
    assert!(result.is_err());
    assert!(storage.org_repo.find_by_id(org.id).await.unwrap().is_some());
    assert_eq!(
        storage
            .membership_repo
            .find_by_org(org.id)
            .await
            .unwrap()
            .len(),
        1
    );
    assert!(!storage
        .user_repo
        .find_by_id(user.id)
        .await
        .unwrap()
        .unwrap()
        .is_deleted());
    assert!(storage
        .api_key_repo
        .find_by_key(&raw)
        .await
        .unwrap()
        .is_some());
    assert!(!storage
        .session_repo
        .find_by_id(session.id)
        .await
        .unwrap()
        .unwrap()
        .is_revoked());
    assert_eq!(
        storage
            .webauthn_repo
            .find_by_user(user.id)
            .await
            .unwrap()
            .len(),
        1
    );
    assert!(storage
        .user_email_repo
        .find_active_by_email(&primary.email)
        .await
        .unwrap()
        .is_some());
    storage
        .credential_lifecycle_repo
        .delete_identity_if_current(&user, &format!("del{suffix}"))
        .await
        .unwrap();
    assert!(storage.org_repo.find_by_id(org.id).await.unwrap().is_none());
    assert!(storage
        .membership_repo
        .find_by_org(org.id)
        .await
        .unwrap()
        .is_empty());
    assert!(storage
        .user_repo
        .find_by_id(user.id)
        .await
        .unwrap()
        .unwrap()
        .is_deleted());
    assert!(storage
        .api_key_repo
        .find_by_key(&raw)
        .await
        .unwrap()
        .is_none());
    assert!(storage
        .session_repo
        .find_by_id(session.id)
        .await
        .unwrap()
        .unwrap()
        .is_revoked());
    assert!(storage
        .webauthn_repo
        .find_by_user(user.id)
        .await
        .unwrap()
        .is_empty());
    assert!(storage
        .user_email_repo
        .find_active_by_email(&primary.email)
        .await
        .unwrap()
        .is_none());
    assert!(storage
        .credential_lifecycle_repo
        .delete_identity_if_current(&user, &format!("del{suffix}"))
        .await
        .is_err());
}
