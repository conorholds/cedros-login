//! PostgreSQL treasury configuration repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{TreasuryConfigEntity, TreasuryConfigRepository};

/// PostgreSQL treasury config repository
pub struct PostgresTreasuryConfigRepository {
    pool: PgPool,
}

impl PostgresTreasuryConfigRepository {
    /// Create a new Postgres treasury config repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for treasury config queries
#[derive(sqlx::FromRow)]
struct TreasuryConfigRow {
    id: Uuid,
    org_id: Option<Uuid>,
    treasury_user_id: Uuid,
    wallet_address: String,
    encrypted_private_key: String,
    encryption_key_id: String,
    authorized_at: DateTime<Utc>,
    authorized_by: Uuid,
}

impl From<TreasuryConfigRow> for TreasuryConfigEntity {
    fn from(row: TreasuryConfigRow) -> Self {
        Self {
            id: row.id,
            org_id: row.org_id,
            treasury_user_id: row.treasury_user_id,
            wallet_address: row.wallet_address,
            encrypted_private_key: row.encrypted_private_key,
            encryption_key_id: row.encryption_key_id,
            authorized_at: row.authorized_at,
            authorized_by: row.authorized_by,
        }
    }
}

const SELECT_COLS: &str = r#"
    id, org_id, treasury_user_id, wallet_address,
    encrypted_private_key, encryption_key_id,
    authorized_at, authorized_by
"#;

#[async_trait]
impl TreasuryConfigRepository for PostgresTreasuryConfigRepository {
    async fn create(&self, config: TreasuryConfigEntity) -> Result<TreasuryConfigEntity, AppError> {
        let row: TreasuryConfigRow = sqlx::query_as(&format!(
            r#"
            INSERT INTO treasury_config (
                id, org_id, treasury_user_id, wallet_address,
                encrypted_private_key, encryption_key_id,
                authorized_at, authorized_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING {SELECT_COLS}
            "#
        ))
        .bind(config.id)
        .bind(config.org_id)
        .bind(config.treasury_user_id)
        .bind(&config.wallet_address)
        .bind(&config.encrypted_private_key)
        .bind(&config.encryption_key_id)
        .bind(config.authorized_at)
        .bind(config.authorized_by)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::Database(db_err) if db_err.is_unique_violation() => {
                AppError::Validation("Treasury already configured for this org".into())
            }
            _ => AppError::Internal(e.into()),
        })?;

        Ok(row.into())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<TreasuryConfigEntity>, AppError> {
        let row: Option<TreasuryConfigRow> = sqlx::query_as(&format!(
            r#"SELECT {SELECT_COLS} FROM treasury_config WHERE id = $1"#
        ))
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_org(&self, org_id: Uuid) -> Result<Option<TreasuryConfigEntity>, AppError> {
        let row: Option<TreasuryConfigRow> = sqlx::query_as(&format!(
            r#"SELECT {SELECT_COLS} FROM treasury_config WHERE org_id = $1"#
        ))
        .bind(org_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_global(&self) -> Result<Option<TreasuryConfigEntity>, AppError> {
        let row: Option<TreasuryConfigRow> = sqlx::query_as(&format!(
            r#"SELECT {SELECT_COLS} FROM treasury_config WHERE org_id IS NULL"#
        ))
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_for_org(
        &self,
        org_id: Option<Uuid>,
    ) -> Result<Option<TreasuryConfigEntity>, AppError> {
        // Use COALESCE to prefer org-specific, fall back to global
        let row: Option<TreasuryConfigRow> = sqlx::query_as(&format!(
            r#"
            SELECT {SELECT_COLS}
            FROM treasury_config
            WHERE org_id = $1 OR org_id IS NULL
            ORDER BY org_id NULLS LAST
            LIMIT 1
            "#
        ))
        .bind(org_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn delete(&self, id: Uuid) -> Result<bool, AppError> {
        let result = sqlx::query("DELETE FROM treasury_config WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected() > 0)
    }

    async fn delete_by_org(&self, org_id: Option<Uuid>) -> Result<bool, AppError> {
        let result = if org_id.is_some() {
            sqlx::query("DELETE FROM treasury_config WHERE org_id = $1")
                .bind(org_id)
                .execute(&self.pool)
                .await
        } else {
            sqlx::query("DELETE FROM treasury_config WHERE org_id IS NULL")
                .execute(&self.pool)
                .await
        }
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected() > 0)
    }
}
