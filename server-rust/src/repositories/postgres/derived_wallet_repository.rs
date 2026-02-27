//! PostgreSQL implementation of derived wallet repository

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{CreateDerivedWallet, DerivedWalletEntity, DerivedWalletRepository};

pub struct PostgresDerivedWalletRepository {
    pool: PgPool,
}

impl PostgresDerivedWalletRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for derived wallet queries
#[derive(sqlx::FromRow)]
struct DerivedWalletRow {
    id: Uuid,
    user_id: Uuid,
    derivation_index: i32,
    solana_pubkey: String,
    label: String,
    created_at: DateTime<Utc>,
}

impl From<DerivedWalletRow> for DerivedWalletEntity {
    fn from(row: DerivedWalletRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            derivation_index: row.derivation_index,
            solana_pubkey: row.solana_pubkey,
            label: row.label,
            created_at: row.created_at,
        }
    }
}

#[async_trait]
impl DerivedWalletRepository for PostgresDerivedWalletRepository {
    async fn create(&self, params: CreateDerivedWallet) -> Result<DerivedWalletEntity, AppError> {
        let row: DerivedWalletRow = sqlx::query_as(
            r#"
            INSERT INTO derived_wallets (user_id, derivation_index, solana_pubkey, label)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id, derivation_index, solana_pubkey, label, created_at
            "#,
        )
        .bind(params.user_id)
        .bind(params.derivation_index)
        .bind(&params.solana_pubkey)
        .bind(&params.label)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::Database(ref db_err) if db_err.is_unique_violation() => {
                AppError::Validation("Derived wallet already exists".into())
            }
            _ => AppError::Internal(e.into()),
        })?;

        Ok(row.into())
    }

    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<DerivedWalletEntity>, AppError> {
        let rows: Vec<DerivedWalletRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, derivation_index, solana_pubkey, label, created_at
            FROM derived_wallets
            WHERE user_id = $1
            ORDER BY derivation_index
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_by_id(
        &self,
        id: Uuid,
        user_id: Uuid,
    ) -> Result<Option<DerivedWalletEntity>, AppError> {
        let row: Option<DerivedWalletRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, derivation_index, solana_pubkey, label, created_at
            FROM derived_wallets
            WHERE id = $1 AND user_id = $2
            "#,
        )
        .bind(id)
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn next_index(&self, user_id: Uuid) -> Result<i32, AppError> {
        let max: Option<i32> = sqlx::query_scalar(
            "SELECT MAX(derivation_index) FROM derived_wallets WHERE user_id = $1",
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(max.unwrap_or(0) + 1)
    }

    async fn delete_by_id(&self, id: Uuid, user_id: Uuid) -> Result<bool, AppError> {
        let result = sqlx::query(
            "DELETE FROM derived_wallets WHERE id = $1 AND user_id = $2",
        )
        .bind(id)
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected() > 0)
    }

    async fn delete_by_user_id(&self, user_id: Uuid) -> Result<u64, AppError> {
        let result = sqlx::query(
            "DELETE FROM derived_wallets WHERE user_id = $1",
        )
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }
}
