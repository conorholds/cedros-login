//! PostgreSQL credit hold repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    CreateHoldResult, CreditHoldEntity, CreditHoldRepository, CreditTransactionEntity, HoldStatus,
};

/// PostgreSQL credit hold repository
pub struct PostgresCreditHoldRepository {
    pool: PgPool,
}

impl PostgresCreditHoldRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for credit hold queries
#[derive(sqlx::FromRow)]
struct CreditHoldRow {
    id: Uuid,
    user_id: Uuid,
    amount: i64,
    currency: String,
    idempotency_key: String,
    reference_type: Option<String>,
    reference_id: Option<Uuid>,
    status: String,
    expires_at: DateTime<Utc>,
    metadata: Option<serde_json::Value>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    captured_transaction_id: Option<Uuid>,
}

impl From<CreditHoldRow> for CreditHoldEntity {
    fn from(row: CreditHoldRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            amount: row.amount,
            currency: row.currency,
            idempotency_key: row.idempotency_key,
            reference_type: row.reference_type,
            reference_id: row.reference_id,
            status: HoldStatus::from_str(&row.status).unwrap_or(HoldStatus::Pending),
            expires_at: row.expires_at,
            metadata: row.metadata,
            created_at: row.created_at,
            updated_at: row.updated_at,
            captured_transaction_id: row.captured_transaction_id,
        }
    }
}

#[async_trait]
impl CreditHoldRepository for PostgresCreditHoldRepository {
    async fn create_hold(&self, hold: CreditHoldEntity) -> Result<CreateHoldResult, AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        // Try to insert, on conflict return existing
        // Use ON CONFLICT to handle idempotency
        let row: CreditHoldRow = sqlx::query_as(
            r#"
            INSERT INTO credit_holds (
                id, user_id, amount, currency, idempotency_key,
                reference_type, reference_id, status, expires_at,
                metadata, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (user_id, idempotency_key) DO UPDATE
            SET updated_at = credit_holds.updated_at
            RETURNING id, user_id, amount, currency, idempotency_key,
                      reference_type, reference_id, status, expires_at,
                      metadata, created_at, updated_at, captured_transaction_id
            "#,
        )
        .bind(hold.id)
        .bind(hold.user_id)
        .bind(hold.amount)
        .bind(&hold.currency)
        .bind(&hold.idempotency_key)
        .bind(&hold.reference_type)
        .bind(hold.reference_id)
        .bind(hold.status.as_str())
        .bind(hold.expires_at)
        .bind(&hold.metadata)
        .bind(hold.created_at)
        .bind(hold.updated_at)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let is_new = row.id == hold.id;

        if is_new {
            // SRV-01: Atomic balance check + held_balance update.
            // Uses conditional UPDATE to prevent TOCTOU race where two
            // concurrent holds both pass the service-level balance check.
            let result = sqlx::query(
                r#"
                UPDATE credit_balances
                SET held_balance = held_balance + $2,
                    updated_at = NOW()
                WHERE user_id = $1 AND currency = $3
                  AND (balance - held_balance) >= $2
                "#,
            )
            .bind(hold.user_id)
            .bind(hold.amount)
            .bind(&hold.currency)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

            if result.rows_affected() == 0 {
                // Transaction rolls back on drop — no explicit rollback needed.
                return Err(AppError::Validation(
                    "Insufficient available balance".into(),
                ));
            }
        }

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        let entity: CreditHoldEntity = row.into();
        if is_new {
            Ok(CreateHoldResult::Created(entity))
        } else {
            Ok(CreateHoldResult::Existing(entity))
        }
    }

    async fn get_hold(&self, hold_id: Uuid) -> Result<Option<CreditHoldEntity>, AppError> {
        let row: Option<CreditHoldRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, amount, currency, idempotency_key,
                   reference_type, reference_id, status, expires_at,
                   metadata, created_at, updated_at, captured_transaction_id
            FROM credit_holds
            WHERE id = $1
            "#,
        )
        .bind(hold_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn get_hold_by_idempotency_key(
        &self,
        user_id: Uuid,
        idempotency_key: &str,
    ) -> Result<Option<CreditHoldEntity>, AppError> {
        let row: Option<CreditHoldRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, amount, currency, idempotency_key,
                   reference_type, reference_id, status, expires_at,
                   metadata, created_at, updated_at, captured_transaction_id
            FROM credit_holds
            WHERE user_id = $1 AND idempotency_key = $2
            "#,
        )
        .bind(user_id)
        .bind(idempotency_key)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn capture_hold(
        &self,
        hold_id: Uuid,
        transaction_id: Uuid,
        credit_tx: CreditTransactionEntity,
    ) -> Result<(CreditHoldEntity, i64), AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        // Update hold status atomically, only if pending and not expired
        let row: Option<CreditHoldRow> = sqlx::query_as(
            r#"
            UPDATE credit_holds
            SET status = 'captured',
                captured_transaction_id = $2,
                updated_at = NOW()
            WHERE id = $1 AND status = 'pending' AND expires_at > NOW()
            RETURNING id, user_id, amount, currency, idempotency_key,
                      reference_type, reference_id, status, expires_at,
                      metadata, created_at, updated_at, captured_transaction_id
            "#,
        )
        .bind(hold_id)
        .bind(transaction_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let row = match row {
            Some(r) => r,
            None => {
                // Check why it failed
                let existing: Option<CreditHoldRow> = sqlx::query_as(
                    r#"
                    SELECT id, user_id, amount, currency, idempotency_key,
                           reference_type, reference_id, status, expires_at,
                           metadata, created_at, updated_at, captured_transaction_id
                    FROM credit_holds WHERE id = $1
                    "#,
                )
                .bind(hold_id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

                match existing {
                    None => return Err(AppError::NotFound(format!("Hold {} not found", hold_id))),
                    Some(h) if h.status != "pending" => {
                        return Err(AppError::Validation(format!(
                            "Hold cannot be captured, status: {}",
                            h.status
                        )))
                    }
                    Some(_) => return Err(AppError::Validation("Hold has expired".into())),
                }
            }
        };

        // SRV-02: Reduce held_balance AND deduct actual balance in one transaction.
        // Previously these were separate transactions, risking inconsistency on crash.
        sqlx::query(
            r#"
            UPDATE credit_balances
            SET held_balance = GREATEST(0, held_balance - $1),
                balance = balance - $1,
                updated_at = NOW()
            WHERE user_id = $2 AND currency = $3
            "#,
        )
        .bind(row.amount)
        .bind(row.user_id)
        .bind(&row.currency)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        // Insert credit transaction record (was previously in deduct_credit)
        sqlx::query(
            r#"
            INSERT INTO credit_transactions (id, user_id, amount, currency, tx_type,
                deposit_session_id, privacy_note_id, idempotency_key, reference_type,
                reference_id, hold_id, metadata, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            "#,
        )
        .bind(credit_tx.id)
        .bind(credit_tx.user_id)
        .bind(credit_tx.amount)
        .bind(&credit_tx.currency)
        .bind(credit_tx.tx_type.as_str())
        .bind(credit_tx.deposit_session_id)
        .bind(credit_tx.privacy_note_id)
        .bind(&credit_tx.idempotency_key)
        .bind(&credit_tx.reference_type)
        .bind(credit_tx.reference_id)
        .bind(credit_tx.hold_id)
        .bind(&credit_tx.metadata)
        .bind(credit_tx.created_at)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        // Read back the new balance
        let new_balance: i64 = sqlx::query_scalar(
            "SELECT balance FROM credit_balances WHERE user_id = $1 AND currency = $2",
        )
        .bind(row.user_id)
        .bind(&row.currency)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok((row.into(), new_balance))
    }

    async fn release_hold(&self, hold_id: Uuid) -> Result<CreditHoldEntity, AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        // Update hold status atomically, only if pending
        let row: Option<CreditHoldRow> = sqlx::query_as(
            r#"
            UPDATE credit_holds
            SET status = 'released',
                updated_at = NOW()
            WHERE id = $1 AND status = 'pending'
            RETURNING id, user_id, amount, currency, idempotency_key,
                      reference_type, reference_id, status, expires_at,
                      metadata, created_at, updated_at, captured_transaction_id
            "#,
        )
        .bind(hold_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let row = match row {
            Some(r) => r,
            None => {
                // Check why it failed
                let existing: Option<CreditHoldRow> = sqlx::query_as(
                    r#"
                    SELECT id, user_id, amount, currency, idempotency_key,
                           reference_type, reference_id, status, expires_at,
                           metadata, created_at, updated_at, captured_transaction_id
                    FROM credit_holds WHERE id = $1
                    "#,
                )
                .bind(hold_id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

                match existing {
                    None => return Err(AppError::NotFound(format!("Hold {} not found", hold_id))),
                    Some(h) => {
                        return Err(AppError::Validation(format!(
                            "Hold cannot be released, status: {}",
                            h.status
                        )))
                    }
                }
            }
        };

        // Reduce held_balance
        sqlx::query(
            r#"
            UPDATE credit_balances
            SET held_balance = GREATEST(0, held_balance - $1),
                updated_at = NOW()
            WHERE user_id = $2 AND currency = $3
            "#,
        )
        .bind(row.amount)
        .bind(row.user_id)
        .bind(&row.currency)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn get_pending_holds(
        &self,
        user_id: Uuid,
        currency: Option<&str>,
    ) -> Result<Vec<CreditHoldEntity>, AppError> {
        let rows: Vec<CreditHoldRow> = if let Some(currency) = currency {
            sqlx::query_as(
                r#"
                SELECT id, user_id, amount, currency, idempotency_key,
                       reference_type, reference_id, status, expires_at,
                       metadata, created_at, updated_at, captured_transaction_id
                FROM credit_holds
                WHERE user_id = $1 AND currency = $2 AND status = 'pending'
                ORDER BY created_at DESC
                "#,
            )
            .bind(user_id)
            .bind(currency)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        } else {
            sqlx::query_as(
                r#"
                SELECT id, user_id, amount, currency, idempotency_key,
                       reference_type, reference_id, status, expires_at,
                       metadata, created_at, updated_at, captured_transaction_id
                FROM credit_holds
                WHERE user_id = $1 AND status = 'pending'
                ORDER BY created_at DESC
                "#,
            )
            .bind(user_id)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        };

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn expire_holds(&self) -> Result<u64, AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        // Get holds to expire for balance adjustment
        let expired: Vec<CreditHoldRow> = sqlx::query_as(
            r#"
            UPDATE credit_holds
            SET status = 'expired',
                updated_at = NOW()
            WHERE status = 'pending' AND expires_at <= NOW()
            RETURNING id, user_id, amount, currency, idempotency_key,
                      reference_type, reference_id, status, expires_at,
                      metadata, created_at, updated_at, captured_transaction_id
            "#,
        )
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let count = expired.len() as u64;

        // Log each expired hold for audit trail
        for hold in &expired {
            tracing::info!(
                hold_id = %hold.id,
                user_id = %hold.user_id,
                amount_lamports = hold.amount,
                currency = %hold.currency,
                reference_type = ?hold.reference_type,
                reference_id = ?hold.reference_id,
                expires_at = %hold.expires_at,
                created_at = %hold.created_at,
                "Credit hold expired - funds released back to available balance"
            );
        }

        // R-07: Batch update held_balances in a single query using aggregated amounts
        if !expired.is_empty() {
            sqlx::query(
                r#"
                WITH expired_totals AS (
                    SELECT user_id, currency, SUM(amount) AS total_amount
                    FROM credit_holds
                    WHERE status = 'expired' AND id = ANY($1)
                    GROUP BY user_id, currency
                )
                UPDATE credit_balances cb
                SET held_balance = GREATEST(0, cb.held_balance - et.total_amount),
                    updated_at = NOW()
                FROM expired_totals et
                WHERE cb.user_id = et.user_id AND cb.currency = et.currency
                "#,
            )
            .bind(
                expired
                    .iter()
                    .map(|h| h.id)
                    .collect::<Vec<uuid::Uuid>>(),
            )
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        }

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count)
    }
}
