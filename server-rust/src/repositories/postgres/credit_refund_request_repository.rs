//! PostgreSQL credit refund request repository

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    CreditRefundRequestEntity, CreditRefundRequestRepository, CreditRefundRequestStatus,
};

pub struct PostgresCreditRefundRequestRepository {
    pool: PgPool,
}

impl PostgresCreditRefundRequestRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct RefundRequestRow {
    id: Uuid,
    user_id: Uuid,
    original_transaction_id: Uuid,
    amount_lamports: i64,
    currency: String,
    reason: String,
    status: String,
    created_at: DateTime<Utc>,
    processed_at: Option<DateTime<Utc>>,
    processed_by: Option<Uuid>,
    processed_amount_lamports: Option<i64>,
    processed_transaction_id: Option<Uuid>,
    processed_reason: Option<String>,
    rejected_at: Option<DateTime<Utc>>,
    rejected_by: Option<Uuid>,
    rejected_reason: Option<String>,
}

impl TryFrom<RefundRequestRow> for CreditRefundRequestEntity {
    type Error = AppError;

    fn try_from(row: RefundRequestRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: row.id,
            user_id: row.user_id,
            original_transaction_id: row.original_transaction_id,
            amount_lamports: row.amount_lamports,
            currency: row.currency,
            reason: row.reason,
            status: CreditRefundRequestStatus::try_from(row.status.as_str())?,
            created_at: row.created_at,
            processed_at: row.processed_at,
            processed_by: row.processed_by,
            processed_amount_lamports: row.processed_amount_lamports,
            processed_transaction_id: row.processed_transaction_id,
            processed_reason: row.processed_reason,
            rejected_at: row.rejected_at,
            rejected_by: row.rejected_by,
            rejected_reason: row.rejected_reason,
        })
    }
}

#[async_trait]
impl CreditRefundRequestRepository for PostgresCreditRefundRequestRepository {
    async fn create(
        &self,
        entity: CreditRefundRequestEntity,
    ) -> Result<CreditRefundRequestEntity, AppError> {
        let row: RefundRequestRow = sqlx::query_as(
            r#"
            INSERT INTO credit_refund_requests (
              id, user_id, original_transaction_id, amount_lamports, currency, reason,
              status, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
              id, user_id, original_transaction_id, amount_lamports, currency, reason,
              status, created_at, processed_at, processed_by, processed_amount_lamports,
              processed_transaction_id, processed_reason, rejected_at, rejected_by, rejected_reason
            "#,
        )
        .bind(entity.id)
        .bind(entity.user_id)
        .bind(entity.original_transaction_id)
        .bind(entity.amount_lamports)
        .bind(&entity.currency)
        .bind(&entity.reason)
        .bind(entity.status.as_str())
        .bind(entity.created_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.try_into()
    }

    async fn find_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<CreditRefundRequestEntity>, AppError> {
        let row: Option<RefundRequestRow> = sqlx::query_as(
            r#"
            SELECT
              id, user_id, original_transaction_id, amount_lamports, currency, reason,
              status, created_at, processed_at, processed_by, processed_amount_lamports,
              processed_transaction_id, processed_reason, rejected_at, rejected_by, rejected_reason
            FROM credit_refund_requests
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(TryInto::try_into).transpose()
    }

    async fn list(
        &self,
        status: Option<CreditRefundRequestStatus>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<CreditRefundRequestEntity>, AppError> {
        let limit = crate::repositories::pagination::cap_limit(limit);
        let offset = crate::repositories::pagination::cap_offset(offset);

        let rows: Vec<RefundRequestRow> = match status {
            Some(s) => {
                sqlx::query_as(
                    r#"
                    SELECT
                      id, user_id, original_transaction_id, amount_lamports, currency, reason,
                      status, created_at, processed_at, processed_by, processed_amount_lamports,
                      processed_transaction_id, processed_reason, rejected_at, rejected_by, rejected_reason
                    FROM credit_refund_requests
                    WHERE status = $1
                    ORDER BY created_at DESC
                    LIMIT $2 OFFSET $3
                    "#,
                )
                .bind(s.as_str())
                .bind(limit as i64)
                .bind(offset as i64)
                .fetch_all(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?
            }
            None => {
                sqlx::query_as(
                    r#"
                    SELECT
                      id, user_id, original_transaction_id, amount_lamports, currency, reason,
                      status, created_at, processed_at, processed_by, processed_amount_lamports,
                      processed_transaction_id, processed_reason, rejected_at, rejected_by, rejected_reason
                    FROM credit_refund_requests
                    ORDER BY created_at DESC
                    LIMIT $1 OFFSET $2
                    "#,
                )
                .bind(limit as i64)
                .bind(offset as i64)
                .fetch_all(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?
            }
        };

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn count(&self, status: Option<CreditRefundRequestStatus>) -> Result<u64, AppError> {
        let count: i64 = match status {
            Some(s) => {
                sqlx::query_scalar(
                    "SELECT COUNT(*) FROM credit_refund_requests WHERE status = $1",
                )
                .bind(s.as_str())
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?
            }
            None => {
                sqlx::query_scalar("SELECT COUNT(*) FROM credit_refund_requests")
                    .fetch_one(&self.pool)
                    .await
                    .map_err(|e| AppError::Internal(e.into()))?
            }
        };

        Ok(count as u64)
    }

    async fn mark_processed(
        &self,
        id: Uuid,
        admin_id: Uuid,
        processed_amount_lamports: i64,
        processed_transaction_id: Uuid,
        processed_reason: String,
    ) -> Result<CreditRefundRequestEntity, AppError> {
        let row: Option<RefundRequestRow> = sqlx::query_as(
            r#"
            UPDATE credit_refund_requests
            SET
              status = 'processed',
              processed_at = NOW(),
              processed_by = $2,
              processed_amount_lamports = $3,
              processed_transaction_id = $4,
              processed_reason = $5
            WHERE id = $1 AND status = 'pending'
            RETURNING
              id, user_id, original_transaction_id, amount_lamports, currency, reason,
              status, created_at, processed_at, processed_by, processed_amount_lamports,
              processed_transaction_id, processed_reason, rejected_at, rejected_by, rejected_reason
            "#,
        )
        .bind(id)
        .bind(admin_id)
        .bind(processed_amount_lamports)
        .bind(processed_transaction_id)
        .bind(processed_reason)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if let Some(row) = row {
            return row.try_into();
        }

        // If it was already processed/rejected, return the current row.
        self.find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound("Refund request not found".into()))
    }

    async fn mark_rejected(
        &self,
        id: Uuid,
        admin_id: Uuid,
        rejected_reason: String,
    ) -> Result<CreditRefundRequestEntity, AppError> {
        let row: Option<RefundRequestRow> = sqlx::query_as(
            r#"
            UPDATE credit_refund_requests
            SET
              status = 'rejected',
              rejected_at = NOW(),
              rejected_by = $2,
              rejected_reason = $3
            WHERE id = $1 AND status = 'pending'
            RETURNING
              id, user_id, original_transaction_id, amount_lamports, currency, reason,
              status, created_at, processed_at, processed_by, processed_amount_lamports,
              processed_transaction_id, processed_reason, rejected_at, rejected_by, rejected_reason
            "#,
        )
        .bind(id)
        .bind(admin_id)
        .bind(rejected_reason)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if let Some(row) = row {
            return row.try_into();
        }

        self.find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound("Refund request not found".into()))
    }
}
