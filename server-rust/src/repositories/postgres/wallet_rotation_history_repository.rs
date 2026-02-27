//! PostgreSQL implementation of wallet rotation history repository

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    CreateWalletRotationHistory, WalletRotationHistoryEntity, WalletRotationHistoryRepository,
};

pub struct PostgresWalletRotationHistoryRepository {
    pool: PgPool,
}

impl PostgresWalletRotationHistoryRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for wallet rotation history queries
#[derive(sqlx::FromRow)]
struct HistoryRow {
    id: Uuid,
    user_id: Uuid,
    old_wallet_id: Uuid,
    old_solana_pubkey: String,
    derivation_index: i32,
    label: Option<String>,
    reason: String,
    rotated_at: DateTime<Utc>,
}

impl From<HistoryRow> for WalletRotationHistoryEntity {
    fn from(row: HistoryRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            old_wallet_id: row.old_wallet_id,
            old_solana_pubkey: row.old_solana_pubkey,
            derivation_index: row.derivation_index,
            label: row.label,
            reason: row.reason,
            rotated_at: row.rotated_at,
        }
    }
}

#[async_trait]
impl WalletRotationHistoryRepository for PostgresWalletRotationHistoryRepository {
    async fn create(
        &self,
        params: CreateWalletRotationHistory,
    ) -> Result<WalletRotationHistoryEntity, AppError> {
        let row: HistoryRow = sqlx::query_as(
            r#"
            INSERT INTO wallet_rotation_history
                (user_id, old_wallet_id, old_solana_pubkey, derivation_index, label, reason)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, old_wallet_id, old_solana_pubkey,
                      derivation_index, label, reason, rotated_at
            "#,
        )
        .bind(params.user_id)
        .bind(params.old_wallet_id)
        .bind(&params.old_solana_pubkey)
        .bind(params.derivation_index)
        .bind(&params.label)
        .bind(params.reason.as_str())
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn find_by_user_id(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<WalletRotationHistoryEntity>, AppError> {
        let rows: Vec<HistoryRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, old_wallet_id, old_solana_pubkey,
                   derivation_index, label, reason, rotated_at
            FROM wallet_rotation_history
            WHERE user_id = $1
            ORDER BY rotated_at DESC
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }
}
