//! PostgreSQL transaction for pending invite-code redemption.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    normalize_invite_code, InviteCodeEntity, PendingInviteRedemptionOutcome,
    PendingInviteRedemptionRepository,
};

pub struct PostgresPendingInviteRedemptionRepository {
    pool: PgPool,
}

impl PostgresPendingInviteRedemptionRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct InviteCodeRow {
    id: Uuid,
    code: String,
    created_by: Option<Uuid>,
    owner_user_id: Option<Uuid>,
    max_uses: Option<i32>,
    uses_count: i32,
    starts_at: Option<DateTime<Utc>>,
    expires_at: Option<DateTime<Utc>>,
    active: bool,
    batch_key: Option<String>,
    discount_percent: Option<i32>,
    discount_months: Option<i32>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<InviteCodeRow> for InviteCodeEntity {
    fn from(row: InviteCodeRow) -> Self {
        Self {
            id: row.id,
            code: row.code,
            created_by: row.created_by,
            owner_user_id: row.owner_user_id,
            max_uses: row.max_uses,
            uses_count: row.uses_count,
            starts_at: row.starts_at,
            expires_at: row.expires_at,
            active: row.active,
            batch_key: row.batch_key,
            discount_percent: row.discount_percent,
            discount_months: row.discount_months,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[async_trait]
impl PendingInviteRedemptionRepository for PostgresPendingInviteRedemptionRepository {
    async fn redeem(
        &self,
        token_hash: &str,
        code: &str,
    ) -> Result<PendingInviteRedemptionOutcome, AppError> {
        let normalized = normalize_invite_code(code)?;
        let mut tx = self.pool.begin().await.map_err(db)?;

        // Lock the gate row as the per-account serialization point. Requiring
        // activated_at IS NULL also rejects stale duplicate tokens after one
        // successful redemption.
        let user_id: Option<Uuid> = sqlx::query_scalar(
            r#"
            SELECT token.user_id
            FROM verification_tokens AS token
            JOIN invite_code_accounts AS account ON account.user_id = token.user_id
            JOIN users AS app_user ON app_user.id = token.user_id
            WHERE token.token_hash = $1
              AND token.token_type = 'invite_code_pending'
              AND token.used_at IS NULL
              AND token.expires_at > NOW()
              AND account.activated_at IS NULL
              AND NOT (
                cardinality(app_user.auth_methods) = 0
                AND app_user.email IS NULL
                AND app_user.password_hash IS NULL
                AND app_user.wallet_address IS NULL
                AND app_user.google_id IS NULL
                AND app_user.apple_id IS NULL
                AND app_user.name = 'Deleted Account'
              )
            FOR UPDATE OF token, account, app_user
            "#,
        )
        .bind(token_hash)
        .fetch_optional(&mut *tx)
        .await
        .map_err(db)?;
        let Some(user_id) = user_id else {
            tx.rollback().await.map_err(db)?;
            return Ok(PendingInviteRedemptionOutcome::InvalidToken);
        };

        let row: Option<InviteCodeRow> = sqlx::query_as(
            r#"
            UPDATE invite_codes
            SET uses_count = uses_count + 1, updated_at = NOW()
            WHERE id = (
                SELECT id
                FROM invite_codes
                WHERE code = $1
                  AND active = TRUE
                  AND (starts_at IS NULL OR starts_at <= NOW())
                  AND (expires_at IS NULL OR expires_at > NOW())
                  AND (max_uses IS NULL OR uses_count < max_uses)
                LIMIT 1
                FOR UPDATE
            )
            RETURNING id, code, created_by, owner_user_id, max_uses, uses_count,
                      starts_at, expires_at, active, batch_key, discount_percent, discount_months,
                      created_at, updated_at
            "#,
        )
        .bind(&normalized)
        .fetch_optional(&mut *tx)
        .await
        .map_err(db)?;
        let Some(row) = row else {
            tx.rollback().await.map_err(db)?;
            return Ok(PendingInviteRedemptionOutcome::InvalidCode);
        };

        sqlx::query(
            "INSERT INTO invite_code_redemptions (invite_code_id, user_id) VALUES ($1, $2)",
        )
        .bind(row.id)
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(db)?;
        let activated = sqlx::query(
            "UPDATE invite_code_accounts SET activated_at = NOW() WHERE user_id = $1 AND activated_at IS NULL",
        )
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(db)?;
        if activated.rows_affected() != 1 {
            return Err(AppError::Internal(anyhow::anyhow!(
                "pending invite account changed during redemption"
            )));
        }
        let consumed = sqlx::query(
            "UPDATE verification_tokens SET used_at = NOW() WHERE token_hash = $1 AND used_at IS NULL",
        )
        .bind(token_hash)
        .execute(&mut *tx)
        .await
        .map_err(db)?;
        if consumed.rows_affected() != 1 {
            return Err(AppError::Internal(anyhow::anyhow!(
                "pending invite token changed during redemption"
            )));
        }

        tx.commit().await.map_err(db)?;
        Ok(PendingInviteRedemptionOutcome::Redeemed {
            user_id,
            invite_code: row.into(),
        })
    }
}

fn db(error: sqlx::Error) -> AppError {
    AppError::Internal(error.into())
}
