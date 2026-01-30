//! PostgreSQL WebAuthn repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{WebAuthnChallenge, WebAuthnCredential, WebAuthnRepository};

/// PostgreSQL WebAuthn repository
pub struct PostgresWebAuthnRepository {
    pool: PgPool,
}

impl PostgresWebAuthnRepository {
    /// Create a new Postgres WebAuthn repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct WebAuthnCredentialRow {
    id: Uuid,
    user_id: Uuid,
    credential_id: String,
    public_key: String,
    sign_count: i32,
    transports: Option<Vec<String>>,
    aaguid: Option<String>,
    is_discoverable: bool,
    backup_eligible: bool,
    backup_state: bool,
    label: Option<String>,
    created_at: DateTime<Utc>,
    last_used_at: Option<DateTime<Utc>>,
}

impl From<WebAuthnCredentialRow> for WebAuthnCredential {
    fn from(row: WebAuthnCredentialRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            credential_id: row.credential_id,
            public_key: row.public_key,
            sign_count: row.sign_count as u32,
            transports: row.transports,
            aaguid: row.aaguid,
            is_discoverable: row.is_discoverable,
            backup_eligible: row.backup_eligible,
            backup_state: row.backup_state,
            label: row.label,
            created_at: row.created_at,
            last_used_at: row.last_used_at,
        }
    }
}

#[derive(sqlx::FromRow)]
struct WebAuthnChallengeRow {
    challenge_id: Uuid,
    user_id: Option<Uuid>,
    state: String,
    challenge_type: String,
    created_at: DateTime<Utc>,
    expires_at: DateTime<Utc>,
}

impl From<WebAuthnChallengeRow> for WebAuthnChallenge {
    fn from(row: WebAuthnChallengeRow) -> Self {
        Self {
            challenge_id: row.challenge_id,
            user_id: row.user_id,
            state: row.state,
            challenge_type: row.challenge_type,
            created_at: row.created_at,
            expires_at: row.expires_at,
        }
    }
}

#[async_trait]
impl WebAuthnRepository for PostgresWebAuthnRepository {
    async fn create_credential(
        &self,
        credential: WebAuthnCredential,
    ) -> Result<WebAuthnCredential, AppError> {
        let row: WebAuthnCredentialRow = sqlx::query_as(
            r#"
            INSERT INTO webauthn_credentials (
                id, user_id, credential_id, public_key, sign_count, transports,
                aaguid, is_discoverable, backup_eligible, backup_state, label,
                created_at, last_used_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, user_id, credential_id, public_key, sign_count, transports,
                      aaguid, is_discoverable, backup_eligible, backup_state, label,
                      created_at, last_used_at
            "#,
        )
        .bind(credential.id)
        .bind(credential.user_id)
        .bind(&credential.credential_id)
        .bind(&credential.public_key)
        .bind(credential.sign_count as i32)
        .bind(&credential.transports)
        .bind(&credential.aaguid)
        .bind(credential.is_discoverable)
        .bind(credential.backup_eligible)
        .bind(credential.backup_state)
        .bind(&credential.label)
        .bind(credential.created_at)
        .bind(credential.last_used_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| {
            // BUG-002: Use PostgreSQL error code instead of string matching
            if let sqlx::Error::Database(db_err) = &e {
                // PostgreSQL unique violation error code is 23505
                if db_err.code().map(|c| c == "23505").unwrap_or(false) {
                    return AppError::Validation("Credential already registered".into());
                }
            }
            AppError::Internal(e.into())
        })?;

        Ok(row.into())
    }

    async fn find_credential_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<WebAuthnCredential>, AppError> {
        let row: Option<WebAuthnCredentialRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, credential_id, public_key, sign_count, transports,
                   aaguid, is_discoverable, backup_eligible, backup_state, label,
                   created_at, last_used_at
            FROM webauthn_credentials
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_credential_id(
        &self,
        credential_id: &str,
    ) -> Result<Option<WebAuthnCredential>, AppError> {
        let row: Option<WebAuthnCredentialRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, credential_id, public_key, sign_count, transports,
                   aaguid, is_discoverable, backup_eligible, backup_state, label,
                   created_at, last_used_at
            FROM webauthn_credentials
            WHERE credential_id = $1
            "#,
        )
        .bind(credential_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<WebAuthnCredential>, AppError> {
        let rows: Vec<WebAuthnCredentialRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, credential_id, public_key, sign_count, transports,
                   aaguid, is_discoverable, backup_eligible, backup_state, label,
                   created_at, last_used_at
            FROM webauthn_credentials
            WHERE user_id = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_discoverable_by_user(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<WebAuthnCredential>, AppError> {
        let rows: Vec<WebAuthnCredentialRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, credential_id, public_key, sign_count, transports,
                   aaguid, is_discoverable, backup_eligible, backup_state, label,
                   created_at, last_used_at
            FROM webauthn_credentials
            WHERE user_id = $1 AND is_discoverable = TRUE
            ORDER BY created_at DESC
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn update_sign_count(&self, id: Uuid, sign_count: u32) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE webauthn_credentials
            SET sign_count = $2
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(sign_count as i32)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn update_last_used(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE webauthn_credentials
            SET last_used_at = NOW()
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn record_successful_auth(&self, id: Uuid, sign_count: u32) -> Result<(), AppError> {
        // SEC-05: Single atomic SQL statement updates both sign_count and last_used_at
        sqlx::query(
            r#"
            UPDATE webauthn_credentials
            SET sign_count = $2, last_used_at = NOW()
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(sign_count as i32)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn update_label(&self, id: Uuid, label: Option<String>) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE webauthn_credentials
            SET label = $2
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(label)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn delete_credential(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            DELETE FROM webauthn_credentials
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn delete_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let result = sqlx::query(
            r#"
            DELETE FROM webauthn_credentials
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }

    async fn store_challenge(&self, challenge: WebAuthnChallenge) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO webauthn_challenges (challenge_id, user_id, state, challenge_type, created_at, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
        )
        .bind(challenge.challenge_id)
        .bind(challenge.user_id)
        .bind(&challenge.state)
        .bind(&challenge.challenge_type)
        .bind(challenge.created_at)
        .bind(challenge.expires_at)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn find_challenge(
        &self,
        challenge_id: Uuid,
    ) -> Result<Option<WebAuthnChallenge>, AppError> {
        let row: Option<WebAuthnChallengeRow> = sqlx::query_as(
            r#"
            SELECT challenge_id, user_id, state, challenge_type, created_at, expires_at
            FROM webauthn_challenges
            WHERE challenge_id = $1 AND expires_at > NOW()
            "#,
        )
        .bind(challenge_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn consume_challenge(
        &self,
        challenge_id: Uuid,
    ) -> Result<Option<WebAuthnChallenge>, AppError> {
        // NEW-02 FIX: Use DELETE...RETURNING for atomic consume in a single query.
        // This eliminates the TOCTOU race condition where concurrent requests could
        // both SELECT the same challenge before either DELETEs it.
        let row: Option<WebAuthnChallengeRow> = sqlx::query_as(
            r#"
            DELETE FROM webauthn_challenges
            WHERE challenge_id = $1 AND expires_at > NOW()
            RETURNING challenge_id, user_id, state, challenge_type, created_at, expires_at
            "#,
        )
        .bind(challenge_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn delete_expired_challenges(&self) -> Result<u64, AppError> {
        let result = sqlx::query(
            r#"
            DELETE FROM webauthn_challenges
            WHERE expires_at < NOW()
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }
}
