//! PostgreSQL credit repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::repositories::{
    CreditBalanceEntity, CreditRepository, CreditStats, CreditTransactionEntity, CreditTxType,
    CurrencyCreditStats, UserCreditStats,
};

/// PostgreSQL credit repository
pub struct PostgresCreditRepository {
    pool: PgPool,
}

impl PostgresCreditRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for credit balance queries
#[derive(sqlx::FromRow)]
struct CreditBalanceRow {
    id: Uuid,
    user_id: Uuid,
    balance: i64,
    held_balance: i64,
    currency: String,
    updated_at: DateTime<Utc>,
}

impl From<CreditBalanceRow> for CreditBalanceEntity {
    fn from(row: CreditBalanceRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            balance: row.balance,
            held_balance: row.held_balance,
            currency: row.currency,
            updated_at: row.updated_at,
        }
    }
}

/// Row type for credit transaction queries
#[derive(sqlx::FromRow)]
struct CreditTransactionRow {
    id: Uuid,
    user_id: Uuid,
    amount: i64,
    currency: String,
    tx_type: String,
    deposit_session_id: Option<Uuid>,
    privacy_note_id: Option<Uuid>,
    idempotency_key: Option<String>,
    reference_type: Option<String>,
    reference_id: Option<Uuid>,
    hold_id: Option<Uuid>,
    metadata: Option<serde_json::Value>,
    created_at: DateTime<Utc>,
}

impl From<CreditTransactionRow> for CreditTransactionEntity {
    fn from(row: CreditTransactionRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            amount: row.amount,
            currency: row.currency,
            tx_type: CreditTxType::from_str(&row.tx_type).unwrap_or(CreditTxType::Adjustment),
            deposit_session_id: row.deposit_session_id,
            privacy_note_id: row.privacy_note_id,
            idempotency_key: row.idempotency_key,
            reference_type: row.reference_type,
            reference_id: row.reference_id,
            hold_id: row.hold_id,
            metadata: row.metadata,
            created_at: row.created_at,
        }
    }
}

#[async_trait]
impl CreditRepository for PostgresCreditRepository {
    async fn get_balance(&self, user_id: Uuid, currency: &str) -> Result<i64, AppError> {
        let balance: Option<i64> = sqlx::query_scalar(
            "SELECT balance FROM credit_balances WHERE user_id = $1 AND currency = $2",
        )
        .bind(user_id)
        .bind(currency)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(balance.unwrap_or(0))
    }

    async fn get_or_create_balance(
        &self,
        user_id: Uuid,
        currency: &str,
    ) -> Result<CreditBalanceEntity, AppError> {
        // Use upsert to atomically get or create
        let row: CreditBalanceRow = sqlx::query_as(
            r#"
            INSERT INTO credit_balances (user_id, balance, held_balance, currency, updated_at)
            VALUES ($1, 0, 0, $2, NOW())
            ON CONFLICT (user_id, currency) DO UPDATE SET updated_at = credit_balances.updated_at
            RETURNING id, user_id, balance, held_balance, currency, updated_at
            "#,
        )
        .bind(user_id)
        .bind(currency)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn add_credit(
        &self,
        user_id: Uuid,
        amount: i64,
        currency: &str,
        tx: CreditTransactionEntity,
    ) -> Result<i64, AppError> {
        // Use a transaction to ensure atomicity
        let mut db_tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        // Upsert balance with atomic increment
        let new_balance: i64 = sqlx::query_scalar(
            r#"
            INSERT INTO credit_balances (user_id, balance, held_balance, currency, updated_at)
            VALUES ($1, $2, 0, $3, NOW())
            ON CONFLICT (user_id, currency) DO UPDATE
            SET balance = credit_balances.balance + $2,
                updated_at = NOW()
            RETURNING balance
            "#,
        )
        .bind(user_id)
        .bind(amount)
        .bind(currency)
        .fetch_one(&mut *db_tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        // Insert transaction record
        sqlx::query(
            r#"
            INSERT INTO credit_transactions (id, user_id, amount, currency, tx_type,
                deposit_session_id, privacy_note_id, idempotency_key, reference_type,
                reference_id, hold_id, metadata, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            "#,
        )
        .bind(tx.id)
        .bind(tx.user_id)
        .bind(tx.amount)
        .bind(&tx.currency)
        .bind(tx.tx_type.as_str())
        .bind(tx.deposit_session_id)
        .bind(tx.privacy_note_id)
        .bind(&tx.idempotency_key)
        .bind(&tx.reference_type)
        .bind(tx.reference_id)
        .bind(tx.hold_id)
        .bind(&tx.metadata)
        .bind(tx.created_at)
        .execute(&mut *db_tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        db_tx
            .commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(new_balance)
    }

    async fn deduct_credit(
        &self,
        user_id: Uuid,
        amount: i64,
        currency: &str,
        tx: CreditTransactionEntity,
    ) -> Result<i64, AppError> {
        let mut db_tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        // Atomic check-and-deduct checking available balance (balance - held_balance)
        // This ensures we don't spend held credits and returns the new balance
        let new_balance: Option<i64> = sqlx::query_scalar(
            r#"
            UPDATE credit_balances
            SET balance = balance - $1, updated_at = NOW()
            WHERE user_id = $2 AND currency = $3 AND (balance - held_balance) >= $1
            RETURNING balance
            "#,
        )
        .bind(amount)
        .bind(user_id)
        .bind(currency)
        .fetch_optional(&mut *db_tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let new_balance = match new_balance {
            Some(b) => b,
            None => {
                // Check current balances to give better error
                let row: Option<(i64, i64)> = sqlx::query_as(
                    "SELECT balance, held_balance FROM credit_balances WHERE user_id = $1 AND currency = $2",
                )
                .bind(user_id)
                .bind(currency)
                .fetch_optional(&mut *db_tx)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

                let (total, held) = row.unwrap_or((0, 0));
                let available = total - held;
                return Err(AppError::Validation(format!(
                    "Insufficient credit balance: available {}, need {} (total: {}, held: {})",
                    available, amount, total, held
                )));
            }
        };

        // Insert transaction record
        sqlx::query(
            r#"
            INSERT INTO credit_transactions (id, user_id, amount, currency, tx_type,
                deposit_session_id, privacy_note_id, idempotency_key, reference_type,
                reference_id, hold_id, metadata, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            "#,
        )
        .bind(tx.id)
        .bind(tx.user_id)
        .bind(tx.amount)
        .bind(&tx.currency)
        .bind(tx.tx_type.as_str())
        .bind(tx.deposit_session_id)
        .bind(tx.privacy_note_id)
        .bind(&tx.idempotency_key)
        .bind(&tx.reference_type)
        .bind(tx.reference_id)
        .bind(tx.hold_id)
        .bind(&tx.metadata)
        .bind(tx.created_at)
        .execute(&mut *db_tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        db_tx
            .commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(new_balance)
    }

    async fn get_transactions(
        &self,
        user_id: Uuid,
        currency: Option<&str>,
        tx_type: Option<&str>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<CreditTransactionEntity>, AppError> {
        let limit = cap_limit(limit);
        let offset = cap_offset(offset);

        // Build query dynamically based on filters
        let mut sql = String::from(
            r#"SELECT id, user_id, amount, currency, tx_type, deposit_session_id,
               privacy_note_id, idempotency_key, reference_type, reference_id,
               hold_id, metadata, created_at
               FROM credit_transactions
               WHERE user_id = $1"#,
        );

        let mut param_idx = 2;
        if currency.is_some() {
            sql.push_str(&format!(" AND currency = ${}", param_idx));
            param_idx += 1;
        }
        if tx_type.is_some() {
            sql.push_str(&format!(" AND tx_type = ${}", param_idx));
            param_idx += 1;
        }
        sql.push_str(&format!(
            " ORDER BY created_at DESC LIMIT ${} OFFSET ${}",
            param_idx,
            param_idx + 1
        ));

        let mut query = sqlx::query_as::<_, CreditTransactionRow>(&sql).bind(user_id);
        if let Some(c) = currency {
            query = query.bind(c);
        }
        if let Some(t) = tx_type {
            query = query.bind(t);
        }
        query = query.bind(limit as i64).bind(offset as i64);

        let rows: Vec<CreditTransactionRow> = query
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_transactions(
        &self,
        user_id: Uuid,
        currency: Option<&str>,
        tx_type: Option<&str>,
    ) -> Result<u64, AppError> {
        // Build query dynamically based on filters
        let mut sql = String::from("SELECT COUNT(*) FROM credit_transactions WHERE user_id = $1");

        let mut param_idx = 2;
        if currency.is_some() {
            sql.push_str(&format!(" AND currency = ${}", param_idx));
            param_idx += 1;
        }
        if tx_type.is_some() {
            sql.push_str(&format!(" AND tx_type = ${}", param_idx));
        }

        let mut query = sqlx::query_scalar::<_, i64>(&sql).bind(user_id);
        if let Some(c) = currency {
            query = query.bind(c);
        }
        if let Some(t) = tx_type {
            query = query.bind(t);
        }

        let count: i64 = query
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count as u64)
    }

    async fn get_stats(&self) -> Result<CreditStats, AppError> {
        // Query SOL stats
        let sol_row: (i64, i64, i64, i64, i64, i64, i64) = sqlx::query_as(
            r#"
            SELECT
                COALESCE(SUM(CASE WHEN tx_type = 'deposit' THEN amount ELSE 0 END), 0) as total_credited,
                COALESCE(SUM(CASE WHEN tx_type = 'spend' THEN ABS(amount) ELSE 0 END), 0) as total_spent,
                COALESCE(SUM(CASE WHEN tx_type = 'adjustment' AND amount > 0 THEN amount ELSE 0 END), 0) as pos_adj,
                COALESCE(SUM(CASE WHEN tx_type = 'adjustment' AND amount < 0 THEN ABS(amount) ELSE 0 END), 0) as neg_adj,
                COUNT(*) FILTER (WHERE tx_type = 'deposit') as deposit_count,
                COUNT(*) FILTER (WHERE tx_type = 'spend') as spend_count,
                COUNT(*) FILTER (WHERE tx_type = 'adjustment') as adj_count
            FROM credit_transactions WHERE UPPER(currency) = 'SOL'
            "#,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        // Query USD stats
        let usd_row: (i64, i64, i64, i64, i64, i64, i64) = sqlx::query_as(
            r#"
            SELECT
                COALESCE(SUM(CASE WHEN tx_type = 'deposit' THEN amount ELSE 0 END), 0) as total_credited,
                COALESCE(SUM(CASE WHEN tx_type = 'spend' THEN ABS(amount) ELSE 0 END), 0) as total_spent,
                COALESCE(SUM(CASE WHEN tx_type = 'adjustment' AND amount > 0 THEN amount ELSE 0 END), 0) as pos_adj,
                COALESCE(SUM(CASE WHEN tx_type = 'adjustment' AND amount < 0 THEN ABS(amount) ELSE 0 END), 0) as neg_adj,
                COUNT(*) FILTER (WHERE tx_type = 'deposit') as deposit_count,
                COUNT(*) FILTER (WHERE tx_type = 'spend') as spend_count,
                COUNT(*) FILTER (WHERE tx_type = 'adjustment') as adj_count
            FROM credit_transactions WHERE UPPER(currency) = 'USD'
            "#,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        // Query balance stats
        let balance_row: (i64, i64, i64, i64) = sqlx::query_as(
            r#"
            SELECT
                COUNT(DISTINCT user_id) as total_users,
                COALESCE(SUM(balance), 0) as total_outstanding,
                COALESCE(SUM(CASE WHEN UPPER(currency) = 'SOL' THEN balance ELSE 0 END), 0) as sol_outstanding,
                COALESCE(SUM(CASE WHEN UPPER(currency) = 'USD' THEN balance ELSE 0 END), 0) as usd_outstanding
            FROM credit_balances WHERE balance > 0
            "#,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(CreditStats {
            total_users_with_balance: balance_row.0 as u64,
            total_outstanding_lamports: balance_row.1,
            sol: CurrencyCreditStats {
                total_credited: sol_row.0,
                total_spent: sol_row.1,
                total_positive_adjustments: sol_row.2,
                total_negative_adjustments: sol_row.3,
                current_outstanding: balance_row.2,
                deposit_count: sol_row.4 as u64,
                spend_count: sol_row.5 as u64,
                adjustment_count: sol_row.6 as u64,
            },
            usd: CurrencyCreditStats {
                total_credited: usd_row.0,
                total_spent: usd_row.1,
                total_positive_adjustments: usd_row.2,
                total_negative_adjustments: usd_row.3,
                current_outstanding: balance_row.3,
                deposit_count: usd_row.4 as u64,
                spend_count: usd_row.5 as u64,
                adjustment_count: usd_row.6 as u64,
            },
        })
    }

    async fn get_user_stats(
        &self,
        user_id: Uuid,
        currency: &str,
    ) -> Result<UserCreditStats, AppError> {
        // Get current balance
        let balance: i64 = sqlx::query_scalar(
            "SELECT COALESCE(balance, 0) FROM credit_balances WHERE user_id = $1 AND UPPER(currency) = UPPER($2)",
        )
        .bind(user_id)
        .bind(currency)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?
        .unwrap_or(0);

        // Get transaction stats
        let stats_row: (i64, i64, i64, i64, i64) = sqlx::query_as(
            r#"
            SELECT
                COALESCE(SUM(CASE WHEN tx_type = 'deposit' THEN amount ELSE 0 END), 0) as total_deposited,
                COALESCE(SUM(CASE WHEN tx_type = 'spend' THEN ABS(amount) ELSE 0 END), 0) as total_spent,
                COALESCE(SUM(CASE WHEN tx_type = 'adjustment' AND amount > 0 THEN amount ELSE 0 END), 0) as total_refunds,
                COUNT(*) FILTER (WHERE tx_type = 'deposit') as deposit_count,
                COUNT(*) FILTER (WHERE tx_type = 'spend') as spend_count
            FROM credit_transactions
            WHERE user_id = $1 AND UPPER(currency) = UPPER($2)
            "#,
        )
        .bind(user_id)
        .bind(currency)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(UserCreditStats {
            total_deposited: stats_row.0,
            total_spent: stats_row.1,
            total_refunds: stats_row.2,
            current_balance: balance,
            deposit_count: stats_row.3 as u64,
            spend_count: stats_row.4 as u64,
            currency: currency.to_string(),
        })
    }

    async fn get_all_balances(&self, user_id: Uuid) -> Result<Vec<CreditBalanceEntity>, AppError> {
        let rows: Vec<CreditBalanceRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, balance, held_balance, currency, updated_at
            FROM credit_balances
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_transaction_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<CreditTransactionEntity>, AppError> {
        let row: Option<CreditTransactionRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, amount, currency, tx_type, deposit_session_id,
                   privacy_note_id, idempotency_key, reference_type, reference_id,
                   hold_id, metadata, created_at
            FROM credit_transactions
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_transaction_by_idempotency_key(
        &self,
        user_id: Uuid,
        idempotency_key: &str,
    ) -> Result<Option<CreditTransactionEntity>, AppError> {
        let row: Option<CreditTransactionRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, amount, currency, tx_type, deposit_session_id,
                   privacy_note_id, idempotency_key, reference_type, reference_id,
                   hold_id, metadata, created_at
            FROM credit_transactions
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

    async fn sum_positive_adjustments_by_reference(
        &self,
        user_id: Uuid,
        currency: &str,
        reference_type: &str,
        reference_id: Uuid,
    ) -> Result<i64, AppError> {
        let sum: i64 = sqlx::query_scalar(
            r#"
            SELECT COALESCE(SUM(amount), 0)
            FROM credit_transactions
            WHERE user_id = $1
              AND UPPER(currency) = UPPER($2)
              AND tx_type = 'adjustment'
              AND amount > 0
              AND reference_type = $3
              AND reference_id = $4
            "#,
        )
        .bind(user_id)
        .bind(currency)
        .bind(reference_type)
        .bind(reference_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(sum)
    }
}
