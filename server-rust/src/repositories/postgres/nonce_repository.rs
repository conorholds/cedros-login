//! PostgreSQL nonce repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;

use crate::errors::AppError;
use crate::repositories::{NonceEntity, NonceRepository};

/// PostgreSQL nonce repository
pub struct PostgresNonceRepository {
    pool: PgPool,
}

impl PostgresNonceRepository {
    /// Create a new Postgres nonce repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for nonce queries
#[derive(sqlx::FromRow)]
struct NonceRow {
    nonce: String,
    public_key: String,
    message: String,
    created_at: DateTime<Utc>,
    expires_at: DateTime<Utc>,
    used_at: Option<DateTime<Utc>>,
}

impl From<NonceRow> for NonceEntity {
    fn from(row: NonceRow) -> Self {
        Self {
            nonce: row.nonce,
            public_key: row.public_key,
            message: row.message,
            created_at: row.created_at,
            expires_at: row.expires_at,
            used_at: row.used_at,
        }
    }
}

#[async_trait]
impl NonceRepository for PostgresNonceRepository {
    async fn create(&self, nonce: NonceEntity) -> Result<NonceEntity, AppError> {
        let row: NonceRow = sqlx::query_as(
            r#"
            INSERT INTO solana_nonces (nonce, public_key, message, created_at, expires_at, used_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING nonce, public_key, message, created_at, expires_at, used_at
            "#,
        )
        .bind(&nonce.nonce)
        .bind(&nonce.public_key)
        .bind(&nonce.message)
        .bind(nonce.created_at)
        .bind(nonce.expires_at)
        .bind(nonce.used_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn find_by_nonce(&self, nonce: &str) -> Result<Option<NonceEntity>, AppError> {
        let row: Option<NonceRow> = sqlx::query_as(
            r#"
            SELECT nonce, public_key, message, created_at, expires_at, used_at
            FROM solana_nonces WHERE nonce = $1
            "#,
        )
        .bind(nonce)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn mark_used(&self, nonce: &str) -> Result<(), AppError> {
        let result = sqlx::query("UPDATE solana_nonces SET used_at = NOW() WHERE nonce = $1")
            .bind(nonce)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Nonce not found".into()));
        }

        Ok(())
    }

    async fn is_valid(&self, nonce: &str) -> Result<bool, AppError> {
        let valid: Option<bool> = sqlx::query_scalar(
            r#"
            SELECT used_at IS NULL AND expires_at > NOW()
            FROM solana_nonces WHERE nonce = $1
            "#,
        )
        .bind(nonce)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(valid.unwrap_or(false))
    }

    async fn consume_if_valid(&self, nonce: &str) -> Result<Option<NonceEntity>, AppError> {
        // S-10: Atomically mark as used and return the nonce in one query.
        // This prevents TOCTOU race conditions where two concurrent requests
        // could both see the nonce as valid and proceed to use it.
        let row: Option<NonceRow> = sqlx::query_as(
            r#"
            UPDATE solana_nonces
            SET used_at = NOW()
            WHERE nonce = $1
              AND used_at IS NULL
              AND expires_at > NOW()
            RETURNING nonce, public_key, message, created_at, expires_at, used_at
            "#,
        )
        .bind(nonce)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn delete_expired(&self) -> Result<u64, AppError> {
        let result = sqlx::query("DELETE FROM solana_nonces WHERE expires_at < NOW()")
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }
}
