//! PostgreSQL deposit session repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{DepositRepository, DepositSessionEntity, DepositStatus};

const MAX_PAGE_SIZE: u32 = 100;
const MAX_OFFSET: u32 = 1_000_000;

fn cap_pagination(limit: u32, offset: u32) -> (u32, u32) {
    (limit.min(MAX_PAGE_SIZE), offset.min(MAX_OFFSET))
}

/// PostgreSQL deposit repository
pub struct PostgresDepositRepository {
    pool: PgPool,
}

impl PostgresDepositRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for deposit session queries
#[derive(sqlx::FromRow)]
struct DepositSessionRow {
    id: Uuid,
    user_id: Uuid,
    session_id: Uuid,
    wallet_address: String,
    wallet_type: String,
    deposit_type: String,
    currency: String,
    unlock_expires_at: Option<DateTime<Utc>>,
    status: String,
    detected_amount_lamports: Option<i64>,
    detected_tx_signature: Option<String>,
    detected_at: Option<DateTime<Utc>>,
    completed_at: Option<DateTime<Utc>>,
    error_message: Option<String>,
    expected_message_hash: Option<String>,
    expected_message_bytes: Option<Vec<u8>>,
    privacy_deposit_tx_signature: Option<String>,
    deposit_amount_lamports: Option<i64>,
    fee_buffer_lamports: Option<i64>,
    tx_expires_at: Option<DateTime<Utc>>,
    processing_attempts: i32,
    last_processing_error: Option<String>,
    last_processing_attempt_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    stored_share_b: Option<String>,
    withdrawal_available_at: Option<DateTime<Utc>>,
    withdrawal_tx_signature: Option<String>,
    input_token_mint: Option<String>,
    input_token_amount: Option<i64>,
    withdrawn_amount_lamports: i64,
    batch_id: Option<Uuid>,
    batched_at: Option<DateTime<Utc>>,
}

impl TryFrom<DepositSessionRow> for DepositSessionEntity {
    type Error = AppError;

    fn try_from(row: DepositSessionRow) -> Result<Self, Self::Error> {
        let DepositSessionRow {
            id,
            user_id,
            session_id,
            wallet_address,
            wallet_type,
            deposit_type,
            currency,
            unlock_expires_at,
            status,
            detected_amount_lamports,
            detected_tx_signature,
            detected_at,
            completed_at,
            error_message,
            expected_message_hash,
            expected_message_bytes,
            privacy_deposit_tx_signature,
            deposit_amount_lamports,
            fee_buffer_lamports,
            tx_expires_at,
            processing_attempts,
            last_processing_error,
            last_processing_attempt_at,
            created_at,
            stored_share_b,
            withdrawal_available_at,
            withdrawal_tx_signature,
            input_token_mint,
            input_token_amount,
            withdrawn_amount_lamports,
            batch_id,
            batched_at,
        } = row;

        let wallet_type = wallet_type.parse().map_err(|_| {
            AppError::Database(format!("Invalid deposit wallet_type: {}", wallet_type))
        })?;
        let deposit_type = deposit_type.parse().map_err(|_| {
            AppError::Database(format!("Invalid deposit deposit_type: {}", deposit_type))
        })?;
        let status = status
            .parse()
            .map_err(|_| AppError::Database(format!("Invalid deposit status: {}", status)))?;

        Ok(Self {
            id,
            user_id,
            session_id,
            wallet_address,
            wallet_type,
            deposit_type,
            currency,
            unlock_expires_at,
            status,
            detected_amount_lamports,
            detected_tx_signature,
            detected_at,
            completed_at,
            error_message,
            expected_message_hash,
            expected_message_bytes,
            privacy_deposit_tx_signature,
            deposit_amount_lamports,
            fee_buffer_lamports,
            tx_expires_at,
            processing_attempts,
            last_processing_error,
            last_processing_attempt_at,
            created_at,
            privacy_note_id: None, // Not stored in DB; set via join if needed
            stored_share_b,
            withdrawal_available_at,
            withdrawal_tx_signature,
            input_token_mint,
            input_token_amount,
            withdrawn_amount_lamports,
            batch_id,
            batched_at,
        })
    }
}

const SELECT_COLS: &str = r#"
    id, user_id, session_id, wallet_address, wallet_type, deposit_type, currency,
    unlock_expires_at, status, detected_amount_lamports, detected_tx_signature,
    detected_at, completed_at, error_message, expected_message_hash,
    expected_message_bytes, privacy_deposit_tx_signature, deposit_amount_lamports,
    fee_buffer_lamports, tx_expires_at, processing_attempts, last_processing_error,
    last_processing_attempt_at, created_at, stored_share_b, withdrawal_available_at,
    withdrawal_tx_signature, input_token_mint, input_token_amount, withdrawn_amount_lamports,
    batch_id, batched_at
"#;

#[async_trait]
impl DepositRepository for PostgresDepositRepository {
    async fn create(
        &self,
        session: DepositSessionEntity,
    ) -> Result<DepositSessionEntity, AppError> {
        let row: DepositSessionRow = sqlx::query_as(&format!(
            r#"
            INSERT INTO deposit_sessions (
                id, user_id, session_id, wallet_address, wallet_type, deposit_type, currency,
                unlock_expires_at, status, created_at, completed_at,
                privacy_deposit_tx_signature, deposit_amount_lamports,
                stored_share_b, withdrawal_available_at,
                input_token_mint, input_token_amount
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING {}
            "#,
            SELECT_COLS
        ))
        .bind(session.id)
        .bind(session.user_id)
        .bind(session.session_id)
        .bind(&session.wallet_address)
        .bind(session.wallet_type.as_str())
        .bind(session.deposit_type.as_str())
        .bind(&session.currency)
        .bind(session.unlock_expires_at)
        .bind(session.status.as_str())
        .bind(session.created_at)
        .bind(session.completed_at)
        .bind(&session.privacy_deposit_tx_signature)
        .bind(session.deposit_amount_lamports)
        .bind(&session.stored_share_b)
        .bind(session.withdrawal_available_at)
        .bind(&session.input_token_mint)
        .bind(session.input_token_amount)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.try_into()?)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<DepositSessionEntity>, AppError> {
        let row: Option<DepositSessionRow> = sqlx::query_as(&format!(
            "SELECT {} FROM deposit_sessions WHERE id = $1",
            SELECT_COLS
        ))
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(DepositSessionEntity::try_from).transpose()?)
    }

    async fn find_by_user_pending(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        // Defensive cap: callers should prefer `list_by_user` (paginated).
        // This method is intentionally bounded to avoid unbounded memory usage.
        const MAX_PENDING_PER_USER: i64 = 200;
        let rows: Vec<DepositSessionRow> = sqlx::query_as(&format!(
            "SELECT {} FROM deposit_sessions WHERE user_id = $1 AND status = 'pending' ORDER BY created_at DESC LIMIT $2",
            SELECT_COLS
        ))
        .bind(user_id)
        .bind(MAX_PENDING_PER_USER)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows
            .into_iter()
            .map(DepositSessionEntity::try_from)
            .collect::<Result<Vec<_>, AppError>>()?)
    }

    async fn find_pending_by_wallet(
        &self,
        wallet_address: &str,
    ) -> Result<Option<DepositSessionEntity>, AppError> {
        let row: Option<DepositSessionRow> = sqlx::query_as(&format!(
            "SELECT {} FROM deposit_sessions WHERE wallet_address = $1 AND status = 'pending' LIMIT 1",
            SELECT_COLS
        ))
        .bind(wallet_address)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(DepositSessionEntity::try_from).transpose()?)
    }

    async fn find_micro_by_tx_signature(
        &self,
        tx_signature: &str,
    ) -> Result<Option<DepositSessionEntity>, AppError> {
        let row: Option<DepositSessionRow> = sqlx::query_as(&format!(
            "SELECT {} FROM deposit_sessions WHERE deposit_type = 'sol_micro' AND detected_tx_signature = $1 LIMIT 1",
            SELECT_COLS
        ))
        .bind(tx_signature)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(DepositSessionEntity::try_from).transpose()?)
    }

    async fn update_status(
        &self,
        id: Uuid,
        status: DepositStatus,
        error_message: Option<String>,
    ) -> Result<(), AppError> {
        let completed_at = if status == DepositStatus::Completed {
            Some(Utc::now())
        } else {
            None
        };

        let result = sqlx::query(
            r#"
            UPDATE deposit_sessions
            SET status = $1, error_message = $2, completed_at = COALESCE($3, completed_at)
            WHERE id = $4
            "#,
        )
        .bind(status.as_str())
        .bind(error_message)
        .bind(completed_at)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Deposit session not found".into()));
        }

        Ok(())
    }

    async fn update_detected(
        &self,
        id: Uuid,
        amount_lamports: i64,
        tx_signature: &str,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE deposit_sessions
            SET detected_amount_lamports = $1, detected_tx_signature = $2,
                detected_at = NOW(), status = 'detected'
            WHERE id = $3
            "#,
        )
        .bind(amount_lamports)
        .bind(tx_signature)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Deposit session not found".into()));
        }

        Ok(())
    }

    async fn set_message_hash(
        &self,
        id: Uuid,
        hash: &str,
        message_bytes: Option<&[u8]>,
        tx_expires_at: Option<DateTime<Utc>>,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE deposit_sessions
            SET expected_message_hash = $1, expected_message_bytes = $2, tx_expires_at = $3
            WHERE id = $4
            "#,
        )
        .bind(hash)
        .bind(message_bytes)
        .bind(tx_expires_at)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Deposit session not found".into()));
        }

        Ok(())
    }

    async fn set_privacy_note_id(&self, id: Uuid, note_id: Uuid) -> Result<(), AppError> {
        // Note: The deposit_sessions table doesn't have a privacy_note_id column.
        // The relationship is stored in credit_transactions via FKs.
        // This is a no-op for Postgres; the InMemory impl tracks it for convenience.
        let _ = (id, note_id);
        Ok(())
    }

    async fn set_deposit_amount(&self, id: Uuid, amount_lamports: i64) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE deposit_sessions
            SET deposit_amount_lamports = $1
            WHERE id = $2
            "#,
        )
        .bind(amount_lamports)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Deposit session not found".into()));
        }

        Ok(())
    }

    async fn complete(
        &self,
        id: Uuid,
        tx_signature: &str,
        deposit_amount_lamports: i64,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE deposit_sessions
            SET status = 'completed', privacy_deposit_tx_signature = $1,
                deposit_amount_lamports = $2, completed_at = NOW()
            WHERE id = $3
            "#,
        )
        .bind(tx_signature)
        .bind(deposit_amount_lamports)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Deposit session not found".into()));
        }

        Ok(())
    }

    async fn record_processing_attempt(
        &self,
        id: Uuid,
        error: Option<&str>,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE deposit_sessions
            SET processing_attempts = processing_attempts + 1,
                last_processing_attempt_at = NOW(),
                last_processing_error = $1
            WHERE id = $2
            "#,
        )
        .bind(error)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Deposit session not found".into()));
        }

        Ok(())
    }

    async fn list_by_user(
        &self,
        user_id: Uuid,
        statuses: Option<&[DepositStatus]>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let (capped_limit, capped_offset) = cap_pagination(limit, offset);
        let rows: Vec<DepositSessionRow> = if let Some(statuses) = statuses {
            let status_strings: Vec<&str> = statuses.iter().map(|s| s.as_str()).collect();
            sqlx::query_as(&format!(
                r#"
                SELECT {} FROM deposit_sessions
                WHERE user_id = $1 AND status = ANY($2)
                ORDER BY created_at DESC
                LIMIT $3 OFFSET $4
                "#,
                SELECT_COLS
            ))
            .bind(user_id)
            .bind(&status_strings)
            .bind(capped_limit as i64)
            .bind(capped_offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        } else {
            sqlx::query_as(&format!(
                r#"
                SELECT {} FROM deposit_sessions
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
                "#,
                SELECT_COLS
            ))
            .bind(user_id)
            .bind(capped_limit as i64)
            .bind(capped_offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        };

        Ok(rows
            .into_iter()
            .map(DepositSessionEntity::try_from)
            .collect::<Result<Vec<_>, AppError>>()?)
    }

    async fn count_by_user(
        &self,
        user_id: Uuid,
        statuses: Option<&[DepositStatus]>,
    ) -> Result<u64, AppError> {
        let count: i64 = if let Some(statuses) = statuses {
            let status_strings: Vec<&str> = statuses.iter().map(|s| s.as_str()).collect();
            sqlx::query_scalar(
                r#"
                SELECT COUNT(*) FROM deposit_sessions
                WHERE user_id = $1 AND status = ANY($2)
                "#,
            )
            .bind(user_id)
            .bind(&status_strings)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        } else {
            sqlx::query_scalar(
                r#"
                SELECT COUNT(*) FROM deposit_sessions
                WHERE user_id = $1
                "#,
            )
            .bind(user_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        };

        Ok(count as u64)
    }

    async fn delete_pending(&self, id: Uuid, user_id: Uuid) -> Result<(), AppError> {
        // Atomic check-and-delete to prevent TOCTOU race
        let result = sqlx::query(
            r#"
            DELETE FROM deposit_sessions
            WHERE id = $1
              AND user_id = $2
              AND status = 'pending'
              AND detected_amount_lamports IS NULL
            "#,
        )
        .bind(id)
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            // Could be: not found, wrong user, not pending, or already has detected amount
            return Err(AppError::Validation(
                "Cannot delete: session not found, not pending, or SOL already detected".into(),
            ));
        }

        Ok(())
    }

    async fn find_ready_for_withdrawal(
        &self,
        now: DateTime<Utc>,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let rows: Vec<DepositSessionRow> = sqlx::query_as(&format!(
            r#"
            SELECT {} FROM deposit_sessions
            WHERE status IN ('completed', 'partially_withdrawn', 'pending_retry')
              AND stored_share_b IS NOT NULL
              AND withdrawal_available_at <= $1
              AND withdrawn_amount_lamports < COALESCE(deposit_amount_lamports, 0)
            ORDER BY withdrawal_available_at ASC
            "#,
            SELECT_COLS
        ))
        .bind(now)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows
            .into_iter()
            .map(DepositSessionEntity::try_from)
            .collect::<Result<Vec<_>, AppError>>()?)
    }

    async fn list_ready_for_withdrawal(
        &self,
        now: DateTime<Utc>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let (capped_limit, capped_offset) = cap_pagination(limit, offset);
        let rows: Vec<DepositSessionRow> = sqlx::query_as(&format!(
            r#"
            SELECT {} FROM deposit_sessions
            WHERE status IN ('completed', 'partially_withdrawn', 'pending_retry')
              AND stored_share_b IS NOT NULL
              AND withdrawal_available_at <= $1
              AND withdrawn_amount_lamports < COALESCE(deposit_amount_lamports, 0)
            ORDER BY withdrawal_available_at ASC
            LIMIT $2 OFFSET $3
            "#,
            SELECT_COLS
        ))
        .bind(now)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows
            .into_iter()
            .map(DepositSessionEntity::try_from)
            .collect::<Result<Vec<_>, AppError>>()?)
    }

    async fn count_ready_for_withdrawal(&self, now: DateTime<Utc>) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*) FROM deposit_sessions
            WHERE status IN ('completed', 'partially_withdrawn', 'pending_retry')
              AND stored_share_b IS NOT NULL
              AND withdrawal_available_at <= $1
              AND withdrawn_amount_lamports < COALESCE(deposit_amount_lamports, 0)
            "#,
        )
        .bind(now)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count as u64)
    }

    async fn claim_ready_for_withdrawal(
        &self,
        now: DateTime<Utc>,
        limit: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let rows: Vec<DepositSessionRow> = sqlx::query_as(&format!(
            r#"
            WITH claim AS (
                SELECT id
                FROM deposit_sessions
                WHERE status IN ('completed', 'partially_withdrawn', 'pending_retry')
                  AND stored_share_b IS NOT NULL
                  AND withdrawal_available_at <= $1
                  AND withdrawn_amount_lamports < COALESCE(deposit_amount_lamports, 0)
                ORDER BY withdrawal_available_at ASC
                LIMIT $2
                FOR UPDATE SKIP LOCKED
            )
            UPDATE deposit_sessions
            SET status = 'processing'
            FROM claim
            WHERE deposit_sessions.id = claim.id
            RETURNING {}
            "#,
            SELECT_COLS
        ))
        .bind(now)
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows
            .into_iter()
            .map(DepositSessionEntity::try_from)
            .collect::<Result<Vec<_>, AppError>>()?)
    }

    async fn mark_withdrawn(
        &self,
        id: Uuid,
        withdrawal_tx_signature: &str,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE deposit_sessions
            SET status = 'withdrawn',
                withdrawal_tx_signature = $1,
                withdrawn_amount_lamports = COALESCE(deposit_amount_lamports, 0),
                stored_share_b = NULL
            WHERE id = $2
            "#,
        )
        .bind(withdrawal_tx_signature)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Deposit session not found".into()));
        }

        Ok(())
    }

    async fn record_partial_withdrawal(
        &self,
        id: Uuid,
        amount_withdrawn: i64,
        tx_signature: &str,
    ) -> Result<bool, AppError> {
        // Atomically increment withdrawn amount and check if fully withdrawn
        let row: (bool,) = sqlx::query_as(
            r#"
            UPDATE deposit_sessions
            SET withdrawn_amount_lamports = withdrawn_amount_lamports + $1,
                withdrawal_tx_signature = $2,
                status = CASE
                    WHEN withdrawn_amount_lamports + $1 >= COALESCE(deposit_amount_lamports, 0)
                    THEN 'withdrawn'
                    ELSE 'partially_withdrawn'
                END,
                stored_share_b = CASE
                    WHEN withdrawn_amount_lamports + $1 >= COALESCE(deposit_amount_lamports, 0)
                    THEN NULL
                    ELSE stored_share_b
                END
            WHERE id = $3
            RETURNING (withdrawn_amount_lamports >= COALESCE(deposit_amount_lamports, 0))
            "#,
        )
        .bind(amount_withdrawn)
        .bind(tx_signature)
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.0)
    }

    async fn list_all(
        &self,
        statuses: Option<&[DepositStatus]>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let (capped_limit, capped_offset) = cap_pagination(limit, offset);
        let rows: Vec<DepositSessionRow> = if let Some(statuses) = statuses {
            let status_strings: Vec<&str> = statuses.iter().map(|s| s.as_str()).collect();
            sqlx::query_as(&format!(
                r#"
                SELECT {} FROM deposit_sessions
                WHERE status = ANY($1)
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
                "#,
                SELECT_COLS
            ))
            .bind(&status_strings)
            .bind(capped_limit as i64)
            .bind(capped_offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        } else {
            sqlx::query_as(&format!(
                r#"
                SELECT {} FROM deposit_sessions
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
                "#,
                SELECT_COLS
            ))
            .bind(capped_limit as i64)
            .bind(capped_offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        };

        Ok(rows
            .into_iter()
            .map(DepositSessionEntity::try_from)
            .collect::<Result<Vec<_>, AppError>>()?)
    }

    async fn count_all(&self, statuses: Option<&[DepositStatus]>) -> Result<u64, AppError> {
        let count: i64 = if let Some(statuses) = statuses {
            let status_strings: Vec<&str> = statuses.iter().map(|s| s.as_str()).collect();
            sqlx::query_scalar(
                r#"
                SELECT COUNT(*) FROM deposit_sessions
                WHERE status = ANY($1)
                "#,
            )
            .bind(&status_strings)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        } else {
            sqlx::query_scalar("SELECT COUNT(*) FROM deposit_sessions")
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?
        };

        Ok(count as u64)
    }

    async fn get_stats(&self) -> Result<crate::repositories::DepositStats, AppError> {
        // Well-known stablecoin mints
        const USDC_MINT: &str = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
        const USDT_MINT: &str = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

        // Query basic stats
        let basic: (i64, Option<i64>, i64, Option<i64>, i64, Option<i64>, i64) = sqlx::query_as(
            r#"
            SELECT
                COUNT(*) as total_deposits,
                COALESCE(SUM(CASE WHEN status IN ('completed', 'withdrawn') THEN deposit_amount_lamports ELSE 0 END)::BIGINT, 0) as total_deposited,
                COUNT(*) FILTER (WHERE status IN ('completed', 'pending_retry')) as pending_withdrawal_count,
                COALESCE(SUM(CASE WHEN status IN ('completed', 'pending_retry') THEN deposit_amount_lamports ELSE 0 END)::BIGINT, 0) as pending_withdrawal_lamports,
                COUNT(*) FILTER (WHERE status = 'withdrawn') as total_withdrawn_count,
                COALESCE(SUM(CASE WHEN status = 'withdrawn' THEN deposit_amount_lamports ELSE 0 END)::BIGINT, 0) as total_withdrawn_lamports,
                COUNT(*) FILTER (WHERE status = 'failed') as failed_count
            FROM deposit_sessions
            "#,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        // Query ready vs in-privacy-period breakdown
        let ready: (i64, Option<i64>, i64, Option<i64>) = sqlx::query_as(
            r#"
            SELECT
                COUNT(*) FILTER (WHERE status IN ('completed', 'pending_retry') AND withdrawal_available_at <= NOW()) as ready_count,
                COALESCE(SUM(CASE WHEN status IN ('completed', 'pending_retry') AND withdrawal_available_at <= NOW() THEN deposit_amount_lamports ELSE 0 END)::BIGINT, 0) as ready_lamports,
                COUNT(*) FILTER (WHERE status IN ('completed', 'pending_retry') AND withdrawal_available_at > NOW()) as in_period_count,
                COALESCE(SUM(CASE WHEN status IN ('completed', 'pending_retry') AND withdrawal_available_at > NOW() THEN deposit_amount_lamports ELSE 0 END)::BIGINT, 0) as in_period_lamports
            FROM deposit_sessions
            "#,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        // Query token type breakdown
        let tokens: (i64, Option<i64>, i64, Option<i64>, i64, Option<i64>) = sqlx::query_as(
            r#"
            SELECT
                COUNT(*) FILTER (WHERE input_token_mint = $1) as usdc_count,
                COALESCE(SUM(CASE WHEN input_token_mint = $1 THEN input_token_amount ELSE 0 END)::BIGINT, 0) as usdc_input,
                COUNT(*) FILTER (WHERE input_token_mint = $2) as usdt_count,
                COALESCE(SUM(CASE WHEN input_token_mint = $2 THEN input_token_amount ELSE 0 END)::BIGINT, 0) as usdt_input,
                COUNT(*) FILTER (WHERE input_token_mint IS NULL AND status IN ('completed', 'withdrawn')) as native_count,
                COALESCE(SUM(CASE WHEN input_token_mint IS NULL AND status IN ('completed', 'withdrawn') THEN deposit_amount_lamports ELSE 0 END)::BIGINT, 0) as native_input
            FROM deposit_sessions
            "#,
        )
        .bind(USDC_MINT)
        .bind(USDT_MINT)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(crate::repositories::DepositStats {
            total_deposits: basic.0 as u64,
            total_deposited_lamports: basic.1.unwrap_or(0),
            pending_withdrawal_count: basic.2 as u64,
            pending_withdrawal_lamports: basic.3.unwrap_or(0),
            total_withdrawn_count: basic.4 as u64,
            total_withdrawn_lamports: basic.5.unwrap_or(0),
            failed_count: basic.6 as u64,
            ready_for_withdrawal_count: ready.0 as u64,
            ready_for_withdrawal_lamports: ready.1.unwrap_or(0),
            in_privacy_period_count: ready.2 as u64,
            in_privacy_period_lamports: ready.3.unwrap_or(0),
            usdc_deposit_count: tokens.0 as u64,
            total_usdc_input: tokens.1.unwrap_or(0),
            usdt_deposit_count: tokens.2 as u64,
            total_usdt_input: tokens.3.unwrap_or(0),
            native_sol_deposit_count: tokens.4 as u64,
            total_native_sol_input: tokens.5.unwrap_or(0),
        })
    }

    async fn find_in_privacy_period(
        &self,
        now: DateTime<Utc>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let (capped_limit, capped_offset) = cap_pagination(limit, offset);
        let rows: Vec<DepositSessionRow> = sqlx::query_as(&format!(
            r#"
            SELECT {} FROM deposit_sessions
            WHERE status IN ('completed', 'pending_retry')
              AND withdrawal_available_at > $1
            ORDER BY withdrawal_available_at ASC, created_at DESC
            LIMIT $2 OFFSET $3
            "#,
            SELECT_COLS
        ))
        .bind(now)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows
            .into_iter()
            .map(DepositSessionEntity::try_from)
            .collect::<Result<Vec<_>, AppError>>()?)
    }

    async fn count_in_privacy_period(&self, now: DateTime<Utc>) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*) FROM deposit_sessions
            WHERE status IN ('completed', 'pending_retry')
              AND withdrawal_available_at > $1
            "#,
        )
        .bind(now)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count as u64)
    }

    async fn get_pending_batch_deposits(&self, limit: i64) -> Result<Vec<DepositSessionEntity>, AppError> {
        let rows: Vec<DepositSessionRow> = sqlx::query_as(&format!(
            r#"
            SELECT {} FROM deposit_sessions
            WHERE status = 'pending_batch' AND deposit_type = 'sol_micro'
            ORDER BY created_at ASC
            LIMIT $1
            "#,
            SELECT_COLS
        ))
        .bind(limit)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows
            .into_iter()
            .map(DepositSessionEntity::try_from)
            .collect::<Result<Vec<_>, AppError>>()?)
    }

    async fn sum_pending_batch_lamports(&self) -> Result<i64, AppError> {
        let sum: Option<i64> = sqlx::query_scalar(
            r#"
            SELECT COALESCE(SUM(deposit_amount_lamports)::BIGINT, 0)
            FROM deposit_sessions
            WHERE status = 'pending_batch' AND deposit_type = 'sol_micro'
            "#,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(sum.unwrap_or(0))
    }

    async fn mark_batch_complete(
        &self,
        deposit_ids: &[Uuid],
        batch_id: Uuid,
        swap_tx_signature: &str,
    ) -> Result<(), AppError> {
        let now = Utc::now();
        sqlx::query(
            r#"
            UPDATE deposit_sessions
            SET status = 'batched',
                batch_id = $1,
                batched_at = $2,
                withdrawal_tx_signature = $3
            WHERE id = ANY($4)
            "#,
        )
        .bind(batch_id)
        .bind(now)
        .bind(swap_tx_signature)
        .bind(deposit_ids)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn base_row() -> DepositSessionRow {
        DepositSessionRow {
            id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            session_id: Uuid::new_v4(),
            wallet_address: "wallet".to_string(),
            wallet_type: "external".to_string(),
            deposit_type: "private".to_string(),
            currency: "SOL".to_string(),
            unlock_expires_at: None,
            status: "pending".to_string(),
            detected_amount_lamports: None,
            detected_tx_signature: None,
            detected_at: None,
            completed_at: None,
            error_message: None,
            expected_message_hash: None,
            expected_message_bytes: None,
            privacy_deposit_tx_signature: None,
            deposit_amount_lamports: None,
            fee_buffer_lamports: None,
            tx_expires_at: None,
            processing_attempts: 0,
            last_processing_error: None,
            last_processing_attempt_at: None,
            created_at: Utc::now(),
            stored_share_b: None,
            withdrawal_available_at: None,
            withdrawal_tx_signature: None,
            input_token_mint: None,
            input_token_amount: None,
            withdrawn_amount_lamports: 0,
            batch_id: None,
            batched_at: None,
        }
    }

    #[test]
    fn test_cap_pagination() {
        let (limit, offset) = cap_pagination(1000, 2_000_000);
        assert_eq!(limit, MAX_PAGE_SIZE);
        assert_eq!(offset, MAX_OFFSET);
    }

    #[test]
    fn test_deposit_session_row_rejects_unknown_enums() {
        let mut row = base_row();
        row.wallet_type = "bogus".to_string();
        let err = DepositSessionEntity::try_from(row).unwrap_err();
        match err {
            AppError::Database(msg) => assert!(msg.contains("Invalid deposit wallet_type")),
            other => panic!("Unexpected error: {other:?}"),
        }

        let mut row = base_row();
        row.deposit_type = "bogus".to_string();
        let err = DepositSessionEntity::try_from(row).unwrap_err();
        match err {
            AppError::Database(msg) => assert!(msg.contains("Invalid deposit deposit_type")),
            other => panic!("Unexpected error: {other:?}"),
        }

        let mut row = base_row();
        row.status = "bogus".to_string();
        let err = DepositSessionEntity::try_from(row).unwrap_err();
        match err {
            AppError::Database(msg) => assert!(msg.contains("Invalid deposit status")),
            other => panic!("Unexpected error: {other:?}"),
        }
    }
}
