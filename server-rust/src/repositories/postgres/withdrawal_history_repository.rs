//! PostgreSQL withdrawal history repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{WithdrawalHistoryEntry, WithdrawalHistoryRepository};

/// PostgreSQL withdrawal history repository
pub struct PostgresWithdrawalHistoryRepository {
    pool: PgPool,
}

impl PostgresWithdrawalHistoryRepository {
    /// Create a new Postgres withdrawal history repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for withdrawal history queries
#[derive(sqlx::FromRow)]
struct WithdrawalHistoryRow {
    id: Uuid,
    deposit_session_id: Uuid,
    user_id: Uuid,
    amount_lamports: i64,
    tx_signature: String,
    cumulative_withdrawn_lamports: i64,
    remaining_lamports: i64,
    is_final: bool,
    withdrawal_percentage: Option<i16>,
    created_at: DateTime<Utc>,
}

impl From<WithdrawalHistoryRow> for WithdrawalHistoryEntry {
    fn from(row: WithdrawalHistoryRow) -> Self {
        Self {
            id: row.id,
            deposit_session_id: row.deposit_session_id,
            user_id: row.user_id,
            amount_lamports: row.amount_lamports,
            tx_signature: row.tx_signature,
            cumulative_withdrawn_lamports: row.cumulative_withdrawn_lamports,
            remaining_lamports: row.remaining_lamports,
            is_final: row.is_final,
            withdrawal_percentage: row.withdrawal_percentage,
            created_at: row.created_at,
        }
    }
}

#[async_trait]
impl WithdrawalHistoryRepository for PostgresWithdrawalHistoryRepository {
    async fn create(
        &self,
        entry: WithdrawalHistoryEntry,
    ) -> Result<WithdrawalHistoryEntry, AppError> {
        let row: WithdrawalHistoryRow = sqlx::query_as(
            r#"
            INSERT INTO withdrawal_history (
                id, deposit_session_id, user_id, amount_lamports, tx_signature,
                cumulative_withdrawn_lamports, remaining_lamports, is_final,
                withdrawal_percentage, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, deposit_session_id, user_id, amount_lamports, tx_signature,
                      cumulative_withdrawn_lamports, remaining_lamports, is_final,
                      withdrawal_percentage, created_at
            "#,
        )
        .bind(entry.id)
        .bind(entry.deposit_session_id)
        .bind(entry.user_id)
        .bind(entry.amount_lamports)
        .bind(&entry.tx_signature)
        .bind(entry.cumulative_withdrawn_lamports)
        .bind(entry.remaining_lamports)
        .bind(entry.is_final)
        .bind(entry.withdrawal_percentage)
        .bind(entry.created_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn find_by_deposit_session(
        &self,
        deposit_session_id: Uuid,
    ) -> Result<Vec<WithdrawalHistoryEntry>, AppError> {
        let rows: Vec<WithdrawalHistoryRow> = sqlx::query_as(
            r#"
            SELECT id, deposit_session_id, user_id, amount_lamports, tx_signature,
                   cumulative_withdrawn_lamports, remaining_lamports, is_final,
                   withdrawal_percentage, created_at
            FROM withdrawal_history
            WHERE deposit_session_id = $1
            ORDER BY created_at ASC
            "#,
        )
        .bind(deposit_session_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<WithdrawalHistoryEntry>, AppError> {
        let rows: Vec<WithdrawalHistoryRow> = sqlx::query_as(
            r#"
            SELECT id, deposit_session_id, user_id, amount_lamports, tx_signature,
                   cumulative_withdrawn_lamports, remaining_lamports, is_final,
                   withdrawal_percentage, created_at
            FROM withdrawal_history
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(user_id)
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let row: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*)
            FROM withdrawal_history
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.0 as u64)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<WithdrawalHistoryEntry>, AppError> {
        let row: Option<WithdrawalHistoryRow> = sqlx::query_as(
            r#"
            SELECT id, deposit_session_id, user_id, amount_lamports, tx_signature,
                   cumulative_withdrawn_lamports, remaining_lamports, is_final,
                   withdrawal_percentage, created_at
            FROM withdrawal_history
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_recent(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<WithdrawalHistoryEntry>, AppError> {
        let rows: Vec<WithdrawalHistoryRow> = sqlx::query_as(
            r#"
            SELECT id, deposit_session_id, user_id, amount_lamports, tx_signature,
                   cumulative_withdrawn_lamports, remaining_lamports, is_final,
                   withdrawal_percentage, created_at
            FROM withdrawal_history
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
        )
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_all(&self) -> Result<u64, AppError> {
        let row: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*)
            FROM withdrawal_history
            "#,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.0 as u64)
    }
}
