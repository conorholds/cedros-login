//! PostgreSQL authoritative credential lifecycle transaction.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    synthetic_credential_id, CredentialEntity, CredentialLifecycleRepository, CredentialType,
    CredentialUnlinkOutcome,
};

pub struct PostgresCredentialLifecycleRepository {
    pool: PgPool,
}

impl PostgresCredentialLifecycleRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct UserCredentialState {
    id: Uuid,
    password_hash: Option<String>,
    email: Option<String>,
    google_id: Option<String>,
    apple_id: Option<String>,
    wallet_address: Option<String>,
    auth_methods: Vec<String>,
    created_at: DateTime<Utc>,
}

#[derive(sqlx::FromRow)]
struct PasskeyState {
    id: Uuid,
    label: Option<String>,
    created_at: DateTime<Utc>,
    last_used_at: Option<DateTime<Utc>>,
}

#[derive(sqlx::FromRow)]
struct TotpState {
    id: Uuid,
    created_at: DateTime<Utc>,
}

#[derive(sqlx::FromRow)]
struct TrackedCredentialState {
    id: Uuid,
    credential_type: String,
    label: Option<String>,
    created_at: DateTime<Utc>,
    last_used_at: Option<DateTime<Utc>>,
    disabled_at: Option<DateTime<Utc>>,
    metadata: Option<serde_json::Value>,
}

struct CredentialInventory {
    user: UserCredentialState,
    credentials: Vec<CredentialEntity>,
}

async fn load_inventory(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
    lock_for_update: bool,
) -> Result<CredentialInventory, AppError> {
    let user_sql = if lock_for_update {
        r#"SELECT id, email, password_hash, google_id, apple_id, wallet_address,
                  auth_methods, created_at
           FROM users WHERE id = $1 FOR UPDATE"#
    } else {
        r#"SELECT id, email, password_hash, google_id, apple_id, wallet_address,
                  auth_methods, created_at
           FROM users WHERE id = $1"#
    };
    let user: UserCredentialState = sqlx::query_as(user_sql)
        .bind(user_id)
        .fetch_optional(&mut **tx)
        .await
        .map_err(db)?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    let passkeys_sql = if lock_for_update {
        "SELECT id, label, created_at, last_used_at FROM webauthn_credentials WHERE user_id = $1 FOR UPDATE"
    } else {
        "SELECT id, label, created_at, last_used_at FROM webauthn_credentials WHERE user_id = $1"
    };
    let passkeys: Vec<PasskeyState> = sqlx::query_as(passkeys_sql)
        .bind(user_id)
        .fetch_all(&mut **tx)
        .await
        .map_err(db)?;
    let totp_sql = if lock_for_update {
        "SELECT id, created_at FROM totp_secrets WHERE user_id = $1 AND enabled = true FOR UPDATE"
    } else {
        "SELECT id, created_at FROM totp_secrets WHERE user_id = $1 AND enabled = true"
    };
    let totp: Option<TotpState> = sqlx::query_as(totp_sql)
        .bind(user_id)
        .fetch_optional(&mut **tx)
        .await
        .map_err(db)?;
    let tracked_sql = if lock_for_update {
        r#"SELECT id, credential_type, label, created_at, last_used_at, disabled_at, metadata
           FROM user_credentials WHERE user_id = $1 AND disabled_at IS NULL FOR UPDATE"#
    } else {
        r#"SELECT id, credential_type, label, created_at, last_used_at, disabled_at, metadata
           FROM user_credentials WHERE user_id = $1 AND disabled_at IS NULL"#
    };
    let tracked: Vec<TrackedCredentialState> = sqlx::query_as(tracked_sql)
        .bind(user_id)
        .fetch_all(&mut **tx)
        .await
        .map_err(db)?;

    let mut credentials = Vec::new();
    for (kind, present, label) in [
        (
            CredentialType::Password,
            user.password_hash.is_some(),
            Some("Email & Password"),
        ),
        (
            CredentialType::OauthGoogle,
            user.google_id.is_some(),
            Some("Google"),
        ),
        (
            CredentialType::OauthApple,
            user.apple_id.is_some(),
            Some("Sign in with Apple"),
        ),
        (
            CredentialType::Solana,
            user.wallet_address.is_some(),
            Some("Solana Wallet"),
        ),
    ] {
        if present {
            let mut entry = CredentialEntity::new(user.id, kind, label.map(ToString::to_string));
            entry.id = synthetic_credential_id(user.id, kind);
            entry.created_at = user.created_at;
            entry.metadata = tracked
                .iter()
                .find(|row| row.credential_type == kind.as_str())
                .and_then(|row| row.metadata.clone());
            credentials.push(entry);
        }
    }
    credentials.extend(passkeys.into_iter().map(|passkey| CredentialEntity {
        id: passkey.id,
        user_id,
        credential_type: CredentialType::WebauthnPasskey,
        label: passkey.label,
        created_at: passkey.created_at,
        last_used_at: passkey.last_used_at,
        disabled_at: None,
        metadata: None,
    }));
    if let Some(totp) = totp {
        credentials.push(CredentialEntity {
            id: totp.id,
            user_id,
            credential_type: CredentialType::Totp,
            label: Some("Authenticator App (2FA)".into()),
            created_at: totp.created_at,
            last_used_at: None,
            disabled_at: None,
            metadata: None,
        });
    }
    for row in tracked {
        let Ok(kind) = row.credential_type.parse::<CredentialType>() else {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Unknown credential type: {}",
                row.credential_type
            )));
        };
        if kind == CredentialType::SsoOidc {
            credentials.push(CredentialEntity {
                id: row.id,
                user_id,
                credential_type: kind,
                label: row.label,
                created_at: row.created_at,
                last_used_at: row.last_used_at,
                disabled_at: row.disabled_at,
                metadata: row.metadata,
            });
        }
    }
    credentials.sort_by_key(|entry| std::cmp::Reverse(entry.created_at));
    Ok(CredentialInventory { user, credentials })
}

#[async_trait]
impl CredentialLifecycleRepository for PostgresCredentialLifecycleRepository {
    async fn delete_identity_if_current(
        &self,
        expected: &crate::repositories::UserEntity,
        replacement_referral_code: &str,
    ) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await.map_err(db)?;
        super::user_repository::guard_admin_removal(&mut tx, expected.id).await?;
        let revision: Option<DateTime<Utc>> =
            sqlx::query_scalar("SELECT updated_at FROM users WHERE id=$1 FOR UPDATE")
                .bind(expected.id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(db)?;
        if revision != Some(expected.updated_at) || expected.is_deleted() {
            return Err(AppError::InvalidToken);
        }
        remove_account_organizations(&mut tx, expected.id).await?;
        for query in [
            "DELETE FROM user_emails WHERE user_id=$1",
            "DELETE FROM verification_tokens WHERE user_id=$1",
            "DELETE FROM api_keys WHERE user_id=$1",
            "DELETE FROM webauthn_credentials WHERE user_id=$1",
            "DELETE FROM user_credentials WHERE user_id=$1",
            "DELETE FROM totp_recovery_codes WHERE user_id=$1",
            "DELETE FROM totp_secrets WHERE user_id=$1",
            "UPDATE sessions SET revoked_at=NOW(), revoked_reason='account_deleted' WHERE user_id=$1 AND revoked_at IS NULL",
        ] {
            sqlx::query(query).bind(expected.id).execute(&mut *tx).await.map_err(db)?;
        }
        sqlx::query(
            r#"UPDATE users SET email=NULL, email_verified=false,
            password_hash=NULL, name='Deleted Account', username=NULL, picture=NULL,
            wallet_address=NULL, google_id=NULL, apple_id=NULL, auth_methods='{}',
            is_system_admin=false, updated_at=NOW(), last_login_at=NULL,
            welcome_completed_at=NULL, referral_code=$2, referred_by=NULL WHERE id=$1"#,
        )
        .bind(expected.id)
        .bind(replacement_referral_code)
        .execute(&mut *tx)
        .await
        .map_err(db)?;
        tx.commit().await.map_err(db)?;
        Ok(())
    }

    async fn create_session_if_current(
        &self,
        expected: &crate::repositories::UserEntity,
        session: crate::repositories::SessionEntity,
    ) -> Result<(), AppError> {
        if session.user_id != expected.id || expected.is_deleted() {
            return Err(AppError::InvalidToken);
        }
        let mut tx = self.pool.begin().await.map_err(db)?;
        let revision: Option<DateTime<Utc>> =
            sqlx::query_scalar("SELECT updated_at FROM users WHERE id=$1 FOR UPDATE")
                .bind(expected.id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(db)?;
        if revision != Some(expected.updated_at) {
            return Err(AppError::InvalidToken);
        }
        // MFA enablement's revocation acquires this same account lock. It
        // either precedes this read or revokes this session after commit.
        let mfa_enabled: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM totp_secrets WHERE user_id=$1 AND enabled=true)",
        )
        .bind(expected.id)
        .fetch_one(&mut *tx)
        .await
        .map_err(db)?;
        if mfa_enabled {
            return Err(AppError::InvalidToken);
        }
        super::session_repository::insert_session(&mut tx, &session).await?;
        tx.commit().await.map_err(db)?;
        Ok(())
    }

    async fn create_mfa_challenge_if_current(
        &self,
        expected: &crate::repositories::UserEntity,
        token_hash: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await.map_err(db)?;
        let revision: Option<DateTime<Utc>> =
            sqlx::query_scalar("SELECT updated_at FROM users WHERE id=$1 FOR UPDATE")
                .bind(expected.id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(db)?;
        if revision != Some(expected.updated_at) || expected.is_deleted() {
            return Err(AppError::InvalidToken);
        }
        sqlx::query(
            "DELETE FROM verification_tokens WHERE user_id=$1 AND token_type='mfa_pending'",
        )
        .bind(expected.id)
        .execute(&mut *tx)
        .await
        .map_err(db)?;
        sqlx::query("INSERT INTO verification_tokens (id, user_id, token_hash, token_type, created_at, expires_at) VALUES ($1,$2,$3,'mfa_pending',NOW(),$4)")
            .bind(Uuid::new_v4()).bind(expected.id).bind(token_hash).bind(expires_at)
            .execute(&mut *tx).await.map_err(db)?;
        tx.commit().await.map_err(db)?;
        Ok(())
    }

    async fn change_password(
        &self,
        user_id: Uuid,
        expected_hash: Option<&str>,
        new_hash: &str,
        keep_session: Option<Uuid>,
    ) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await.map_err(db)?;
        let current: Option<(Option<String>,)> =
            sqlx::query_as("SELECT password_hash FROM users WHERE id = $1 FOR UPDATE")
                .bind(user_id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(db)?;
        if current
            .as_ref()
            .is_none_or(|row| row.0.as_deref() != expected_hash)
        {
            return Err(AppError::InvalidCredentials);
        }
        if let Some(id) = keep_session {
            let active: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM sessions WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at > NOW())")
                .bind(id).bind(user_id).fetch_one(&mut *tx).await.map_err(db)?;
            if !active {
                return Err(AppError::InvalidToken);
            }
        }
        sqlx::query("UPDATE users SET password_hash=$2, auth_methods=CASE WHEN 'email'=ANY(auth_methods) THEN auth_methods ELSE array_append(auth_methods, 'email') END, updated_at=NOW() WHERE id=$1")
            .bind(user_id).bind(new_hash).execute(&mut *tx).await.map_err(db)?;
        sqlx::query(
            "DELETE FROM verification_tokens WHERE user_id=$1 AND token_type='mfa_pending'",
        )
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(db)?;
        sqlx::query("UPDATE sessions SET revoked_at=NOW(), revoked_reason='password_change' WHERE user_id=$1 AND ($2::uuid IS NULL OR id <> $2)")
            .bind(user_id).bind(keep_session).execute(&mut *tx).await.map_err(db)?;
        tx.commit().await.map_err(db)?;
        Ok(())
    }

    async fn enroll_passkey_if_current(
        &self,
        expected: &crate::repositories::UserEntity,
        session_id: Uuid,
        credential: crate::repositories::WebAuthnCredential,
    ) -> Result<crate::repositories::WebAuthnCredential, AppError> {
        let mut tx = self.pool.begin().await.map_err(db)?;
        let revision: Option<DateTime<Utc>> =
            sqlx::query_scalar("SELECT updated_at FROM users WHERE id=$1 FOR UPDATE")
                .bind(expected.id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(db)?;
        if revision != Some(expected.updated_at)
            || expected.is_deleted()
            || credential.user_id != expected.id
        {
            return Err(AppError::InvalidToken);
        }
        let live: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM sessions WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at > NOW())")
            .bind(session_id).bind(expected.id).fetch_one(&mut *tx).await.map_err(db)?;
        if !live {
            return Err(AppError::InvalidToken);
        }
        sqlx::query("INSERT INTO webauthn_credentials (id,user_id,credential_id,public_key,sign_count,transports,aaguid,is_discoverable,backup_eligible,backup_state,label,created_at,last_used_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)")
            .bind(credential.id).bind(credential.user_id).bind(&credential.credential_id).bind(&credential.public_key)
            .bind(credential.sign_count as i32).bind(&credential.transports).bind(&credential.aaguid)
            .bind(credential.is_discoverable).bind(credential.backup_eligible).bind(credential.backup_state)
            .bind(&credential.label).bind(credential.created_at).bind(credential.last_used_at)
            .execute(&mut *tx).await.map_err(|error| {
                if error.as_database_error().is_some_and(|e| e.is_unique_violation()) {
                    AppError::Validation("Credential already registered".into())
                } else { db(error) }
            })?;
        sqlx::query("UPDATE users SET auth_methods=CASE WHEN 'webauthn'=ANY(auth_methods) THEN auth_methods ELSE array_append(auth_methods, 'webauthn') END, updated_at=NOW() WHERE id=$1")
            .bind(expected.id).execute(&mut *tx).await.map_err(db)?;
        sqlx::query(
            "DELETE FROM verification_tokens WHERE user_id=$1 AND token_type='mfa_pending'",
        )
        .bind(expected.id)
        .execute(&mut *tx)
        .await
        .map_err(db)?;
        sqlx::query("UPDATE sessions SET revoked_at=NOW(), revoked_reason='passkey_credential_linked' WHERE user_id=$1 AND id <> $2 AND revoked_at IS NULL")
            .bind(expected.id).bind(session_id).execute(&mut *tx).await.map_err(db)?;
        tx.commit().await.map_err(db)?;
        Ok(credential)
    }

    async fn create_api_key_if_current(
        &self,
        expected: &crate::repositories::UserEntity,
        session_id: Uuid,
        key: crate::repositories::ApiKeyEntity,
    ) -> Result<crate::repositories::ApiKeyEntity, AppError> {
        let mut tx = self.pool.begin().await.map_err(db)?;
        let revision: Option<DateTime<Utc>> =
            sqlx::query_scalar("SELECT updated_at FROM users WHERE id=$1 FOR UPDATE")
                .bind(expected.id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(db)?;
        if revision != Some(expected.updated_at)
            || expected.is_deleted()
            || key.user_id != expected.id
        {
            return Err(AppError::InvalidToken);
        }
        let live: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM sessions WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at > NOW())")
            .bind(session_id).bind(expected.id).fetch_one(&mut *tx).await.map_err(db)?;
        if !live {
            return Err(AppError::InvalidToken);
        }
        sqlx::query("INSERT INTO api_keys (id,user_id,key_hash,key_prefix,label,created_at,last_used_at) VALUES ($1,$2,$3,$4,$5,$6,$7)")
            .bind(key.id).bind(key.user_id).bind(&key.key_hash).bind(&key.key_prefix).bind(&key.label).bind(key.created_at).bind(key.last_used_at)
            .execute(&mut *tx).await.map_err(db)?;
        tx.commit().await.map_err(db)?;
        Ok(key)
    }

    async fn list(&self, user_id: Uuid) -> Result<Vec<CredentialEntity>, AppError> {
        let mut tx = self.pool.begin().await.map_err(db)?;
        let inventory = load_inventory(&mut tx, user_id, false).await?;
        tx.commit().await.map_err(db)?;
        Ok(inventory.credentials)
    }

    async fn update_label(
        &self,
        user_id: Uuid,
        credential_id: Uuid,
        label: Option<String>,
    ) -> Result<bool, AppError> {
        let passkey = sqlx::query(
            "UPDATE webauthn_credentials SET label = $3 WHERE id = $1 AND user_id = $2",
        )
        .bind(credential_id)
        .bind(user_id)
        .bind(&label)
        .execute(&self.pool)
        .await
        .map_err(db)?;
        if passkey.rows_affected() == 1 {
            return Ok(true);
        }
        let sso = sqlx::query(
            r#"UPDATE user_credentials SET label = $3
               WHERE id = $1 AND user_id = $2 AND credential_type = 'sso_oidc'
                 AND disabled_at IS NULL"#,
        )
        .bind(credential_id)
        .bind(user_id)
        .bind(label)
        .execute(&self.pool)
        .await
        .map_err(db)?;
        Ok(sso.rows_affected() == 1)
    }

    async fn unlink(
        &self,
        user_id: Uuid,
        credential_id: Uuid,
        current_session_id: Uuid,
    ) -> Result<CredentialUnlinkOutcome, AppError> {
        let mut tx = self.pool.begin().await.map_err(db)?;
        let inventory = load_inventory(&mut tx, user_id, true).await?;
        let Some(target) = inventory
            .credentials
            .iter()
            .find(|entry| entry.id == credential_id)
            .cloned()
        else {
            tx.rollback().await.map_err(db)?;
            return Ok(CredentialUnlinkOutcome::NotFound);
        };
        if target.credential_type == CredentialType::Totp {
            tx.rollback().await.map_err(db)?;
            return Ok(CredentialUnlinkOutcome::RequiresDedicatedMfaFlow);
        }
        if target.credential_type.is_primary()
            && !inventory.credentials.iter().any(|entry| {
                entry.id != target.id
                    && entry.credential_type.is_primary()
                    && (entry.credential_type != CredentialType::Password
                        || inventory
                            .user
                            .email
                            .as_deref()
                            .is_some_and(|email| !email.is_empty()))
            })
        {
            tx.rollback().await.map_err(db)?;
            return Ok(CredentialUnlinkOutcome::LastPrimary);
        }

        let mut auth_methods = inventory.user.auth_methods;
        match target.credential_type {
            CredentialType::Password => {
                auth_methods.retain(|method| method != "email");
                sqlx::query(
                    r#"UPDATE users SET password_hash = NULL, auth_methods = $2,
                                      updated_at = NOW() WHERE id = $1"#,
                )
                .bind(user_id)
                .bind(&auth_methods)
                .execute(&mut *tx)
                .await
                .map_err(db)?;
            }
            CredentialType::OauthGoogle => {
                auth_methods.retain(|method| method != "google");
                update_direct_method(&mut tx, user_id, "google_id", &auth_methods).await?;
            }
            CredentialType::OauthApple => {
                auth_methods.retain(|method| method != "apple");
                update_direct_method(&mut tx, user_id, "apple_id", &auth_methods).await?;
            }
            CredentialType::Solana => {
                auth_methods.retain(|method| method != "solana");
                update_direct_method(&mut tx, user_id, "wallet_address", &auth_methods).await?;
            }
            CredentialType::WebauthnPasskey | CredentialType::WebauthnSecurityKey => {
                let deleted =
                    sqlx::query("DELETE FROM webauthn_credentials WHERE id = $1 AND user_id = $2")
                        .bind(target.id)
                        .bind(user_id)
                        .execute(&mut *tx)
                        .await
                        .map_err(db)?;
                if deleted.rows_affected() != 1 {
                    return Err(AppError::NotFound("Credential not found".into()));
                }
                let remaining: i64 = sqlx::query_scalar(
                    "SELECT COUNT(*) FROM webauthn_credentials WHERE user_id = $1",
                )
                .bind(user_id)
                .fetch_one(&mut *tx)
                .await
                .map_err(db)?;
                if remaining == 0 {
                    auth_methods.retain(|method| method != "webauthn");
                    update_auth_methods(&mut tx, user_id, &auth_methods).await?;
                }
            }
            CredentialType::SsoOidc => {
                let disabled = sqlx::query(
                    r#"UPDATE user_credentials SET disabled_at = NOW()
                       WHERE id = $1 AND user_id = $2 AND credential_type = 'sso_oidc'
                         AND disabled_at IS NULL"#,
                )
                .bind(target.id)
                .bind(user_id)
                .execute(&mut *tx)
                .await
                .map_err(db)?;
                if disabled.rows_affected() != 1 {
                    return Err(AppError::NotFound("Credential not found".into()));
                }
                let remaining: i64 = sqlx::query_scalar(
                    r#"SELECT COUNT(*) FROM user_credentials
                       WHERE user_id = $1 AND credential_type = 'sso_oidc'
                         AND disabled_at IS NULL"#,
                )
                .bind(user_id)
                .fetch_one(&mut *tx)
                .await
                .map_err(db)?;
                if remaining == 0 {
                    auth_methods.retain(|method| method != "sso");
                    update_auth_methods(&mut tx, user_id, &auth_methods).await?;
                }
            }
            CredentialType::Totp => unreachable!("handled above"),
        }

        if matches!(
            target.credential_type,
            CredentialType::Password
                | CredentialType::OauthGoogle
                | CredentialType::OauthApple
                | CredentialType::Solana
        ) {
            sqlx::query("DELETE FROM user_credentials WHERE user_id = $1 AND credential_type = $2")
                .bind(user_id)
                .bind(target.credential_type.as_str())
                .execute(&mut *tx)
                .await
                .map_err(db)?;
        }
        // All removals advance the account revision, including one of several passkeys.
        sqlx::query("UPDATE users SET updated_at=NOW() WHERE id=$1")
            .bind(user_id)
            .execute(&mut *tx)
            .await
            .map_err(db)?;
        sqlx::query(
            "DELETE FROM verification_tokens WHERE user_id=$1 AND token_type='mfa_pending'",
        )
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(db)?;
        sqlx::query(
            r#"UPDATE sessions SET revoked_at = NOW(), revoked_reason = 'credential_unlinked'
               WHERE user_id = $1 AND id <> $2 AND revoked_at IS NULL"#,
        )
        .bind(user_id)
        .bind(current_session_id)
        .execute(&mut *tx)
        .await
        .map_err(db)?;
        tx.commit().await.map_err(db)?;
        Ok(CredentialUnlinkOutcome::Removed(target))
    }
}

async fn update_direct_method(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
    column: &str,
    auth_methods: &[String],
) -> Result<(), AppError> {
    let sql = match column {
        "google_id" => {
            "UPDATE users SET google_id = NULL, auth_methods = $2, updated_at = NOW() WHERE id = $1"
        }
        "apple_id" => {
            "UPDATE users SET apple_id = NULL, auth_methods = $2, updated_at = NOW() WHERE id = $1"
        }
        "wallet_address" => {
            "UPDATE users SET wallet_address = NULL, auth_methods = $2, updated_at = NOW() WHERE id = $1"
        }
        _ => return Err(AppError::Internal(anyhow::anyhow!("invalid credential column"))),
    };
    sqlx::query(sql)
        .bind(user_id)
        .bind(auth_methods)
        .execute(&mut **tx)
        .await
        .map_err(db)?;
    Ok(())
}

async fn update_auth_methods(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
    auth_methods: &[String],
) -> Result<(), AppError> {
    sqlx::query("UPDATE users SET auth_methods = $2, updated_at = NOW() WHERE id = $1")
        .bind(user_id)
        .bind(auth_methods)
        .execute(&mut **tx)
        .await
        .map_err(db)?;
    Ok(())
}

fn db(error: sqlx::Error) -> AppError {
    AppError::Database(error.to_string())
}

/// Re-evaluate ownership under locks; all changes roll back with identity deletion.
async fn remove_account_organizations(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
) -> Result<(), AppError> {
    let orgs: Vec<(Uuid, Uuid)> = sqlx::query_as("SELECT id, owner_id FROM organizations WHERE owner_id=$1 OR id IN (SELECT org_id FROM memberships WHERE user_id=$1) ORDER BY id FOR UPDATE")
        .bind(user_id).fetch_all(&mut **tx).await.map_err(db)?;
    for (org_id, owner_id) in orgs {
        let members: Vec<(Uuid, String)> = sqlx::query_as(
            "SELECT user_id, role FROM memberships WHERE org_id=$1 ORDER BY user_id FOR UPDATE",
        )
        .bind(org_id)
        .fetch_all(&mut **tx)
        .await
        .map_err(db)?;
        if owner_id == user_id && members.len() == 1 && members[0].0 == user_id {
            // Foreign keys cascade dependent authority and retain audit/outbox references.
            sqlx::query("DELETE FROM organizations WHERE id=$1")
                .bind(org_id)
                .execute(&mut **tx)
                .await
                .map_err(db)?;
            continue;
        }
        let replacement = members
            .iter()
            .find(|(id, role)| *id != user_id && role == "owner");
        let removing_owner = members
            .iter()
            .any(|(id, role)| *id == user_id && role == "owner");
        if (owner_id == user_id || removing_owner) && replacement.is_none() {
            return Err(AppError::Validation(
                "Assign another organization owner before deleting this account".into(),
            ));
        }
        if owner_id == user_id {
            sqlx::query("UPDATE organizations SET owner_id=$2 WHERE id=$1")
                .bind(org_id)
                .bind(replacement.map(|(id, _)| *id))
                .execute(&mut **tx)
                .await
                .map_err(db)?;
        }
        sqlx::query("DELETE FROM memberships WHERE org_id=$1 AND user_id=$2")
            .bind(org_id)
            .bind(user_id)
            .execute(&mut **tx)
            .await
            .map_err(db)?;
    }
    Ok(())
}
