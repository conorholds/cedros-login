//! PostgreSQL API key repository implementation
//!
//! # Security Design (R-02/SEC-09)
//!
//! API key lookup uses a two-phase approach to mitigate timing attacks:
//!
//! 1. **Prefix query**: Lookup by first 16 characters (efficient database index)
//! 2. **Constant-time hash comparison**: Use `subtle::ct_eq` for full verification
//!
//! ## Accepted Risk: Database Query Timing
//!
//! The database query itself has inherent timing variability based on:
//! - Whether the prefix exists (affects row count)
//! - Database load and cache state
//!
//! This is accepted because:
//! - Rate limiting constrains enumeration attempts
//! - API keys are high-entropy (56 chars), making enumeration infeasible
//! - Network latency masks small timing differences
//! - Prefix-based lookup reveals no useful information (prefix alone is useless)
//!
//! For environments requiring stricter guarantees, implement dummy queries on
//! cache misses to normalize response timing.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use subtle::ConstantTimeEq;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{hash_api_key, ApiKeyEntity, ApiKeyRepository};

/// PostgreSQL API key repository
pub struct PostgresApiKeyRepository {
    pool: PgPool,
}

impl PostgresApiKeyRepository {
    /// Create a new Postgres API key repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for API key queries
#[derive(sqlx::FromRow)]
struct ApiKeyRow {
    id: Uuid,
    user_id: Uuid,
    key_hash: String,
    key_prefix: String,
    label: String,
    created_at: DateTime<Utc>,
    last_used_at: Option<DateTime<Utc>>,
}

impl From<ApiKeyRow> for ApiKeyEntity {
    fn from(row: ApiKeyRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            key_hash: row.key_hash,
            key_prefix: row.key_prefix,
            label: row.label,
            created_at: row.created_at,
            last_used_at: row.last_used_at,
        }
    }
}

#[async_trait]
impl ApiKeyRepository for PostgresApiKeyRepository {
    async fn create(&self, entity: ApiKeyEntity) -> Result<ApiKeyEntity, AppError> {
        let row: ApiKeyRow = sqlx::query_as(
            r#"
            INSERT INTO api_keys (id, user_id, key_hash, key_prefix, label, created_at, last_used_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, user_id, key_hash, key_prefix, label, created_at, last_used_at
            "#,
        )
        .bind(entity.id)
        .bind(entity.user_id)
        .bind(&entity.key_hash)
        .bind(&entity.key_prefix)
        .bind(&entity.label)
        .bind(entity.created_at)
        .bind(entity.last_used_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| {
            if let sqlx::Error::Database(ref db_err) = e {
                if let Some(constraint) = db_err.constraint() {
                    if constraint == "idx_api_keys_user_label" {
                        return AppError::Validation(format!(
                            "API key with label '{}' already exists",
                            entity.label
                        ));
                    }
                }
            }
            AppError::Internal(e.into())
        })?;

        Ok(row.into())
    }

    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<ApiKeyEntity>, AppError> {
        let rows: Vec<ApiKeyRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, key_hash, key_prefix, label, created_at, last_used_at
            FROM api_keys WHERE user_id = $1
            ORDER BY created_at
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_one_by_user_id(&self, user_id: Uuid) -> Result<Option<ApiKeyEntity>, AppError> {
        let row: Option<ApiKeyRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, key_hash, key_prefix, label, created_at, last_used_at
            FROM api_keys WHERE user_id = $1
            ORDER BY created_at
            LIMIT 1
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_key(&self, raw_key: &str) -> Result<Option<ApiKeyEntity>, AppError> {
        // R-02/SEC-09: Prevent timing attacks by:
        // 1. Query by prefix (first 16 chars) for efficient database lookup
        // 2. Use constant-time comparison for full hash verification in application
        let key_prefix: String = raw_key.chars().take(16).collect();
        let key_hash = hash_api_key(raw_key);

        let rows: Vec<ApiKeyRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, key_hash, key_prefix, label, created_at, last_used_at
            FROM api_keys WHERE key_prefix = $1
            "#,
        )
        .bind(&key_prefix)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        for row in rows {
            if row.key_hash.as_bytes().ct_eq(key_hash.as_bytes()).into() {
                return Ok(Some(row.into()));
            }
        }

        // SRV-07: Always run one constant-time comparison to prevent timing
        // side-channel from revealing whether the prefix exists in the DB.
        let _dummy: bool = key_hash
            .as_bytes()
            .ct_eq(b"$argon2id$v=19$m=0,t=0,p=0$AAAA$AAAA")
            .into();

        Ok(None)
    }

    async fn delete_for_user(&self, user_id: Uuid) -> Result<(), AppError> {
        sqlx::query("DELETE FROM api_keys WHERE user_id = $1")
            .bind(user_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn delete_by_id(&self, id: Uuid, user_id: Uuid) -> Result<bool, AppError> {
        let result = sqlx::query("DELETE FROM api_keys WHERE id = $1 AND user_id = $2")
            .bind(id)
            .bind(user_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected() > 0)
    }

    async fn update_last_used(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query("UPDATE api_keys SET last_used_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }
}
