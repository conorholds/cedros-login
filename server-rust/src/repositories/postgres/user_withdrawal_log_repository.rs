//! PostgreSQL user withdrawal log repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{UserWithdrawalLogEntry, UserWithdrawalLogRepository};

pub struct PostgresUserWithdrawalLogRepository {
    pool: PgPool,
}

impl PostgresUserWithdrawalLogRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct UserWithdrawalLogRow {
    id: Uuid,
    user_id: Uuid,
    token_type: String,
    token_mint: Option<String>,
    amount: i64,
    destination: String,
    tx_signature: String,
    fee_lamports: i64,
    created_at: DateTime<Utc>,
}

impl From<UserWithdrawalLogRow> for UserWithdrawalLogEntry {
    fn from(row: UserWithdrawalLogRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            token_type: row.token_type,
            token_mint: row.token_mint,
            amount: row.amount,
            destination: row.destination,
            tx_signature: row.tx_signature,
            fee_lamports: row.fee_lamports,
            created_at: row.created_at,
        }
    }
}

#[async_trait]
impl UserWithdrawalLogRepository for PostgresUserWithdrawalLogRepository {
    async fn create(
        &self,
        entry: UserWithdrawalLogEntry,
    ) -> Result<UserWithdrawalLogEntry, AppError> {
        let row: UserWithdrawalLogRow = sqlx::query_as(
            r#"
            INSERT INTO user_withdrawal_log (
                id, user_id, token_type, token_mint, amount,
                destination, tx_signature, fee_lamports, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, user_id, token_type, token_mint, amount,
                      destination, tx_signature, fee_lamports, created_at
            "#,
        )
        .bind(entry.id)
        .bind(entry.user_id)
        .bind(&entry.token_type)
        .bind(&entry.token_mint)
        .bind(entry.amount)
        .bind(&entry.destination)
        .bind(&entry.tx_signature)
        .bind(entry.fee_lamports)
        .bind(entry.created_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn find_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<UserWithdrawalLogEntry>, AppError> {
        let rows: Vec<UserWithdrawalLogRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, token_type, token_mint, amount,
                   destination, tx_signature, fee_lamports, created_at
            FROM user_withdrawal_log
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
            FROM user_withdrawal_log
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.0 as u64)
    }
}
