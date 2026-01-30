//! PostgreSQL verification token repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::repositories::verification_repository::{
    RepositoryError, TokenType, VerificationRepository, VerificationToken,
};

/// PostgreSQL verification repository
pub struct PostgresVerificationRepository {
    pool: PgPool,
}

impl PostgresVerificationRepository {
    /// Create a new Postgres verification repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for verification token queries
#[derive(sqlx::FromRow)]
struct VerificationTokenRow {
    id: Uuid,
    user_id: Uuid,
    token_hash: String,
    token_type: String,
    created_at: DateTime<Utc>,
    expires_at: DateTime<Utc>,
    used_at: Option<DateTime<Utc>>,
}

impl TryFrom<VerificationTokenRow> for VerificationToken {
    type Error = RepositoryError;

    fn try_from(row: VerificationTokenRow) -> Result<Self, Self::Error> {
        let token_type = TokenType::from_str(&row.token_type).ok_or_else(|| {
            RepositoryError::Database(format!("Invalid token type: {}", row.token_type))
        })?;

        Ok(Self {
            id: row.id,
            user_id: row.user_id,
            token_hash: row.token_hash,
            token_type,
            created_at: row.created_at,
            expires_at: row.expires_at,
            used_at: row.used_at,
        })
    }
}

#[async_trait]
impl VerificationRepository for PostgresVerificationRepository {
    async fn create(
        &self,
        user_id: Uuid,
        token_hash: &str,
        token_type: TokenType,
        expires_at: DateTime<Utc>,
    ) -> Result<VerificationToken, RepositoryError> {
        // D-13: Use CTE to atomically delete old unused tokens before creating new one.
        // This prevents accumulation of unused tokens from multiple reset requests.
        let row: VerificationTokenRow = sqlx::query_as(
            r#"
            WITH deleted AS (
                DELETE FROM verification_tokens
                WHERE user_id = $1 AND token_type = $3 AND used_at IS NULL
            )
            INSERT INTO verification_tokens (user_id, token_hash, token_type, expires_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id, token_hash, token_type, created_at, expires_at, used_at
            "#,
        )
        .bind(user_id)
        .bind(token_hash)
        .bind(token_type.as_str())
        .bind(expires_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        row.try_into()
    }

    async fn find_by_hash(
        &self,
        token_hash: &str,
    ) -> Result<Option<VerificationToken>, RepositoryError> {
        let row: Option<VerificationTokenRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, token_hash, token_type, created_at, expires_at, used_at
            FROM verification_tokens WHERE token_hash = $1
            "#,
        )
        .bind(token_hash)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(r.try_into()?)),
            None => Ok(None),
        }
    }

    async fn mark_used(&self, id: Uuid) -> Result<(), RepositoryError> {
        let result = sqlx::query("UPDATE verification_tokens SET used_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| RepositoryError::Database(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(RepositoryError::Database("Token not found".into()));
        }

        Ok(())
    }

    async fn consume_if_valid(
        &self,
        token_hash: &str,
    ) -> Result<Option<VerificationToken>, RepositoryError> {
        // Atomically mark as used and return the token in one query.
        // This prevents TOCTOU race conditions where two concurrent requests
        // could both see the token as valid and proceed to use it.
        let row: Option<VerificationTokenRow> = sqlx::query_as(
            r#"
            UPDATE verification_tokens
            SET used_at = NOW()
            WHERE token_hash = $1
              AND used_at IS NULL
              AND expires_at > NOW()
            RETURNING id, user_id, token_hash, token_type, created_at, expires_at, used_at
            "#,
        )
        .bind(token_hash)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(r.try_into()?)),
            None => Ok(None),
        }
    }

    async fn delete_for_user(
        &self,
        user_id: Uuid,
        token_type: TokenType,
    ) -> Result<(), RepositoryError> {
        sqlx::query("DELETE FROM verification_tokens WHERE user_id = $1 AND token_type = $2")
            .bind(user_id)
            .bind(token_type.as_str())
            .execute(&self.pool)
            .await
            .map_err(|e| RepositoryError::Database(e.to_string()))?;

        Ok(())
    }

    async fn delete_expired(&self) -> Result<u64, RepositoryError> {
        // Only delete expired tokens that haven't been used yet
        // This prevents race condition where cleanup deletes a token
        // that is currently being verified (between lookup and mark_used)
        let result = sqlx::query(
            "DELETE FROM verification_tokens WHERE expires_at < NOW() AND used_at IS NULL",
        )
        .execute(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        Ok(result.rows_affected())
    }
}
