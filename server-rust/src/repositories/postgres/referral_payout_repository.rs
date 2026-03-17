//! PostgreSQL referral payout repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    ReferralPayoutEntity, ReferralPayoutRepository, ReferrerPayoutSummary,
};

/// PostgreSQL referral payout repository
pub struct PostgresReferralPayoutRepository {
    pool: PgPool,
}

impl PostgresReferralPayoutRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct ReferralPayoutRow {
    id: Uuid,
    referrer_id: Uuid,
    referred_user_id: Uuid,
    trigger_type: String,
    amount: i64,
    currency: String,
    status: String,
    tx_signature: Option<String>,
    error_message: Option<String>,
    spend_transaction_id: Option<Uuid>,
    created_at: DateTime<Utc>,
    completed_at: Option<DateTime<Utc>>,
}

impl From<ReferralPayoutRow> for ReferralPayoutEntity {
    fn from(row: ReferralPayoutRow) -> Self {
        Self {
            id: row.id,
            referrer_id: row.referrer_id,
            referred_user_id: row.referred_user_id,
            trigger_type: row.trigger_type,
            amount: row.amount,
            currency: row.currency,
            status: row.status,
            tx_signature: row.tx_signature,
            error_message: row.error_message,
            spend_transaction_id: row.spend_transaction_id,
            created_at: row.created_at,
            completed_at: row.completed_at,
        }
    }
}

#[derive(sqlx::FromRow)]
struct ReferrerPayoutSummaryRow {
    referrer_id: Uuid,
    payout_wallet_address: Option<String>,
    total_pending_amount: i64,
    pending_count: i64,
    currency: String,
}

#[async_trait]
impl ReferralPayoutRepository for PostgresReferralPayoutRepository {
    async fn create(
        &self,
        payout: ReferralPayoutEntity,
    ) -> Result<ReferralPayoutEntity, AppError> {
        let row: ReferralPayoutRow = sqlx::query_as(
            r#"
            INSERT INTO referral_payouts (
                id, referrer_id, referred_user_id, trigger_type,
                amount, currency, status, tx_signature, error_message,
                spend_transaction_id, created_at, completed_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id, referrer_id, referred_user_id, trigger_type,
                      amount, currency, status, tx_signature, error_message,
                      created_at, completed_at
            "#,
        )
        .bind(payout.id)
        .bind(payout.referrer_id)
        .bind(payout.referred_user_id)
        .bind(&payout.trigger_type)
        .bind(payout.amount)
        .bind(&payout.currency)
        .bind(&payout.status)
        .bind(&payout.tx_signature)
        .bind(&payout.error_message)
        .bind(payout.spend_transaction_id)
        .bind(payout.created_at)
        .bind(payout.completed_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn list_pending(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<ReferralPayoutEntity>, AppError> {
        let rows: Vec<ReferralPayoutRow> = sqlx::query_as(
            r#"
            SELECT id, referrer_id, referred_user_id, trigger_type,
                   amount, currency, status, tx_signature, error_message,
                   created_at, completed_at
            FROM referral_payouts
            WHERE status = 'pending'
            ORDER BY created_at ASC
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

    async fn count_pending(&self) -> Result<u64, AppError> {
        let count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM referral_payouts WHERE status = 'pending'")
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;
        Ok(count.max(0) as u64)
    }

    async fn mark_completed(&self, id: Uuid, tx_signature: &str) -> Result<bool, AppError> {
        let result = sqlx::query(
            r#"
            UPDATE referral_payouts
            SET status = 'completed', tx_signature = $2, completed_at = NOW()
            WHERE id = $1 AND status IN ('pending', 'processing')
            "#,
        )
        .bind(id)
        .bind(tx_signature)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(result.rows_affected() > 0)
    }

    async fn mark_failed(&self, id: Uuid, error: &str) -> Result<bool, AppError> {
        let result = sqlx::query(
            r#"
            UPDATE referral_payouts
            SET status = 'failed', error_message = $2
            WHERE id = $1 AND status IN ('pending', 'processing')
            "#,
        )
        .bind(id)
        .bind(error)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(result.rows_affected() > 0)
    }

    async fn claim_for_processing(&self, ids: &[Uuid]) -> Result<Vec<Uuid>, AppError> {
        if ids.is_empty() {
            return Ok(Vec::new());
        }
        let claimed: Vec<(Uuid,)> = sqlx::query_as(
            r#"
            UPDATE referral_payouts
            SET status = 'processing'
            WHERE id = ANY($1) AND status = 'pending'
            RETURNING id
            "#,
        )
        .bind(ids)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(claimed.into_iter().map(|(id,)| id).collect())
    }

    async fn pending_by_referrer(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<ReferrerPayoutSummary>, AppError> {
        let rows: Vec<ReferrerPayoutSummaryRow> = sqlx::query_as(
            r#"
            SELECT rp.referrer_id,
                   u.payout_wallet_address,
                   SUM(rp.amount) AS total_pending_amount,
                   COUNT(*) AS pending_count,
                   rp.currency
            FROM referral_payouts rp
            JOIN users u ON u.id = rp.referrer_id
            WHERE rp.status = 'pending'
            GROUP BY rp.referrer_id, u.payout_wallet_address, rp.currency
            ORDER BY total_pending_amount DESC
            LIMIT $1 OFFSET $2
            "#,
        )
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows
            .into_iter()
            .map(|r| ReferrerPayoutSummary {
                referrer_id: r.referrer_id,
                payout_wallet_address: r.payout_wallet_address,
                total_pending_amount: r.total_pending_amount,
                pending_count: r.pending_count.max(0) as u64,
                currency: r.currency,
            })
            .collect())
    }

    async fn count_pending_referrers(&self) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar(
            "SELECT COUNT(DISTINCT referrer_id) FROM referral_payouts WHERE status = 'pending'",
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(count.max(0) as u64)
    }

    async fn sum_for_referrer(&self, referrer_id: Uuid) -> Result<i64, AppError> {
        let sum: Option<i64> = sqlx::query_scalar(
            "SELECT COALESCE(SUM(amount), 0) FROM referral_payouts WHERE referrer_id = $1 AND status != 'failed'",
        )
        .bind(referrer_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(sum.unwrap_or(0))
    }

    async fn reset_failed(&self) -> Result<u64, AppError> {
        let result = sqlx::query(
            "UPDATE referral_payouts SET status = 'pending', error_message = NULL WHERE status = 'failed'",
        )
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(result.rows_affected())
    }

    async fn exists_for_spend_transaction(
        &self,
        referrer_id: Uuid,
        spend_transaction_id: Uuid,
    ) -> Result<bool, AppError> {
        let exists: bool = sqlx::query_scalar(
            r#"
            SELECT EXISTS(
                SELECT 1 FROM referral_payouts
                WHERE referrer_id = $1
                  AND spend_transaction_id = $2
            )
            "#,
        )
        .bind(referrer_id)
        .bind(spend_transaction_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(exists)
    }

    async fn exists_for_pair(
        &self,
        referrer_id: Uuid,
        referred_user_id: Uuid,
        trigger_type: &str,
    ) -> Result<bool, AppError> {
        let exists: bool = sqlx::query_scalar(
            r#"
            SELECT EXISTS(
                SELECT 1 FROM referral_payouts
                WHERE referrer_id = $1
                  AND referred_user_id = $2
                  AND trigger_type = $3
            )
            "#,
        )
        .bind(referrer_id)
        .bind(referred_user_id)
        .bind(trigger_type)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(exists)
    }

    async fn sum_by_status(&self, status: &str) -> Result<i64, AppError> {
        let sum: Option<i64> = sqlx::query_scalar(
            "SELECT COALESCE(SUM(amount), 0) FROM referral_payouts WHERE status = $1",
        )
        .bind(status)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(sum.unwrap_or(0))
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<ReferralPayoutEntity>, AppError> {
        let row: Option<ReferralPayoutRow> = sqlx::query_as(
            r#"
            SELECT id, referrer_id, referred_user_id, trigger_type,
                   amount, currency, status, tx_signature, error_message,
                   spend_transaction_id, created_at, completed_at
            FROM referral_payouts
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(row.map(Into::into))
    }

    async fn cancel(&self, id: Uuid) -> Result<bool, AppError> {
        let result = sqlx::query(
            "UPDATE referral_payouts SET status = 'cancelled' WHERE id = $1 AND status = 'pending'",
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(result.rows_affected() > 0)
    }

    async fn list_all(
        &self,
        status_filter: Option<&str>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<ReferralPayoutEntity>, AppError> {
        let rows: Vec<ReferralPayoutRow> = if let Some(status) = status_filter {
            sqlx::query_as(
                r#"
                SELECT id, referrer_id, referred_user_id, trigger_type,
                       amount, currency, status, tx_signature, error_message,
                       spend_transaction_id, created_at, completed_at
                FROM referral_payouts
                WHERE status = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
                "#,
            )
            .bind(status)
            .bind(limit as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        } else {
            sqlx::query_as(
                r#"
                SELECT id, referrer_id, referred_user_id, trigger_type,
                       amount, currency, status, tx_signature, error_message,
                       spend_transaction_id, created_at, completed_at
                FROM referral_payouts
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
                "#,
            )
            .bind(limit as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        };
        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_all(&self, status_filter: Option<&str>) -> Result<u64, AppError> {
        let count: i64 = if let Some(status) = status_filter {
            sqlx::query_scalar(
                "SELECT COUNT(*) FROM referral_payouts WHERE status = $1",
            )
            .bind(status)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        } else {
            sqlx::query_scalar("SELECT COUNT(*) FROM referral_payouts")
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?
        };
        Ok(count.max(0) as u64)
    }

    async fn list_by_referrer(
        &self,
        referrer_id: Uuid,
        status_filter: Option<&str>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<ReferralPayoutEntity>, AppError> {
        let rows: Vec<ReferralPayoutRow> = if let Some(status) = status_filter {
            sqlx::query_as(
                r#"
                SELECT id, referrer_id, referred_user_id, trigger_type,
                       amount, currency, status, tx_signature, error_message,
                       spend_transaction_id, created_at, completed_at
                FROM referral_payouts
                WHERE referrer_id = $1 AND status = $2
                ORDER BY created_at DESC
                LIMIT $3 OFFSET $4
                "#,
            )
            .bind(referrer_id)
            .bind(status)
            .bind(limit as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        } else {
            sqlx::query_as(
                r#"
                SELECT id, referrer_id, referred_user_id, trigger_type,
                       amount, currency, status, tx_signature, error_message,
                       spend_transaction_id, created_at, completed_at
                FROM referral_payouts
                WHERE referrer_id = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
                "#,
            )
            .bind(referrer_id)
            .bind(limit as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        };
        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_by_referrer(
        &self,
        referrer_id: Uuid,
        status_filter: Option<&str>,
    ) -> Result<u64, AppError> {
        let count: i64 = if let Some(status) = status_filter {
            sqlx::query_scalar(
                "SELECT COUNT(*) FROM referral_payouts WHERE referrer_id = $1 AND status = $2",
            )
            .bind(referrer_id)
            .bind(status)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        } else {
            sqlx::query_scalar(
                "SELECT COUNT(*) FROM referral_payouts WHERE referrer_id = $1",
            )
            .bind(referrer_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        };
        Ok(count.max(0) as u64)
    }

    async fn sum_by_status_for_referrer(
        &self,
        referrer_id: Uuid,
        status: &str,
    ) -> Result<i64, AppError> {
        let sum: Option<i64> = sqlx::query_scalar(
            "SELECT COALESCE(SUM(amount), 0) FROM referral_payouts WHERE referrer_id = $1 AND status = $2",
        )
        .bind(referrer_id)
        .bind(status)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(sum.unwrap_or(0))
    }
}
