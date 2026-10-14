//! PostgreSQL invite-code repository implementation.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    normalize_invite_code, InviteCodeEntity, InviteCodeRepository, InviteCodeUpdate,
    InviteDiscountGrant,
};

pub struct PostgresInviteCodeRepository {
    pool: PgPool,
}

impl PostgresInviteCodeRepository {
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

const SELECT_COLUMNS: &str = r#"
    id, code, created_by, owner_user_id, max_uses, uses_count, starts_at,
    expires_at, active, batch_key, discount_percent, discount_months, created_at, updated_at
"#;

fn map_create_error(error: sqlx::Error) -> AppError {
    let text = error.to_string();
    if text.contains("unique") || text.contains("duplicate") {
        return AppError::Validation("Invite code already exists".into());
    }
    AppError::Internal(error.into())
}

#[async_trait]
impl InviteCodeRepository for PostgresInviteCodeRepository {
    async fn create(&self, code: InviteCodeEntity) -> Result<InviteCodeEntity, AppError> {
        let row: InviteCodeRow = sqlx::query_as(&format!(
            r#"
            INSERT INTO invite_codes (
                id, code, created_by, owner_user_id, max_uses, uses_count,
                starts_at, expires_at, active, batch_key, discount_percent, discount_months,
                created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING {SELECT_COLUMNS}
            "#
        ))
        .bind(code.id)
        .bind(&code.code)
        .bind(code.created_by)
        .bind(code.owner_user_id)
        .bind(code.max_uses)
        .bind(code.uses_count)
        .bind(code.starts_at)
        .bind(code.expires_at)
        .bind(code.active)
        .bind(&code.batch_key)
        .bind(code.discount_percent)
        .bind(code.discount_months)
        .bind(code.created_at)
        .bind(code.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(map_create_error)?;

        Ok(row.into())
    }

    async fn list_admin(&self, limit: u32, offset: u32) -> Result<Vec<InviteCodeEntity>, AppError> {
        let rows: Vec<InviteCodeRow> = sqlx::query_as(&format!(
            r#"
            SELECT {SELECT_COLUMNS}
            FROM invite_codes
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#
        ))
        .bind(limit.min(100) as i64)
        .bind(offset.min(1_000_000) as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<InviteCodeEntity>, AppError> {
        let row: Option<InviteCodeRow> = sqlx::query_as(&format!(
            r#"
            SELECT {SELECT_COLUMNS}
            FROM invite_codes
            WHERE id = $1
            "#
        ))
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn update(
        &self,
        id: Uuid,
        update: InviteCodeUpdate,
    ) -> Result<InviteCodeEntity, AppError> {
        let row: Option<InviteCodeRow> = sqlx::query_as(&format!(
            r#"
            UPDATE invite_codes
            SET
              code = COALESCE($2, code),
              max_uses = CASE WHEN $3 THEN $4::integer ELSE max_uses END,
              starts_at = CASE WHEN $5 THEN $6::timestamptz ELSE starts_at END,
              expires_at = CASE WHEN $7 THEN $8::timestamptz ELSE expires_at END,
              active = COALESCE($9, active),
              discount_percent = CASE WHEN $10 THEN $11::integer ELSE discount_percent END,
              discount_months = CASE WHEN $12 THEN $13::integer ELSE discount_months END,
              updated_at = NOW()
            WHERE id = $1
            RETURNING {SELECT_COLUMNS}
            "#
        ))
        .bind(id)
        .bind(update.code)
        .bind(update.max_uses.is_set())
        .bind(update.max_uses.value())
        .bind(update.starts_at.is_set())
        .bind(update.starts_at.value())
        .bind(update.expires_at.is_set())
        .bind(update.expires_at.value())
        .bind(update.active)
        .bind(update.discount_percent.is_set())
        .bind(update.discount_percent.value())
        .bind(update.discount_months.is_set())
        .bind(update.discount_months.value())
        .fetch_optional(&self.pool)
        .await
        .map_err(map_create_error)?;

        row.map(Into::into)
            .ok_or_else(|| AppError::NotFound("Invite code not found".into()))
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM invite_codes WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Invite code not found".into()));
        }
        Ok(())
    }

    async fn redeem(
        &self,
        code: &str,
        user_id: Uuid,
    ) -> Result<Option<InviteCodeEntity>, AppError> {
        let normalized = normalize_invite_code(code)?;
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        let pending_user: Option<Uuid> = sqlx::query_scalar(
            "SELECT user_id FROM invite_code_accounts WHERE user_id = $1 AND activated_at IS NULL FOR UPDATE",
        )
        .bind(user_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        if pending_user.is_none() {
            tx.rollback()
                .await
                .map_err(|e| AppError::Internal(e.into()))?;
            return Ok(None);
        }

        let row: Option<InviteCodeRow> = sqlx::query_as(&format!(
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
            RETURNING {SELECT_COLUMNS}
            "#
        ))
        .bind(&normalized)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let Some(row) = row else {
            tx.commit()
                .await
                .map_err(|e| AppError::Internal(e.into()))?;
            return Ok(None);
        };

        sqlx::query(
            r#"
            INSERT INTO invite_code_redemptions (invite_code_id, user_id)
            VALUES ($1, $2)
            "#,
        )
        .bind(row.id)
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        sqlx::query(
            r#"
            INSERT INTO invite_code_accounts (user_id, activated_at)
            VALUES ($1, NOW())
            ON CONFLICT (user_id) DO UPDATE SET activated_at = NOW()
            "#,
        )
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(Some(row.into()))
    }

    async fn mark_user_pending(&self, user_id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO invite_code_accounts (user_id, activated_at)
            VALUES ($1, NULL)
            ON CONFLICT (user_id) DO NOTHING
            "#,
        )
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    async fn activate_user(&self, user_id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO invite_code_accounts (user_id, activated_at)
            VALUES ($1, NOW())
            ON CONFLICT (user_id) DO UPDATE SET activated_at = NOW()
            "#,
        )
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    async fn is_user_pending(&self, user_id: Uuid) -> Result<bool, AppError> {
        let pending: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM invite_code_accounts WHERE user_id = $1 AND activated_at IS NULL)",
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(pending)
    }

    async fn list_user_codes(&self, user_id: Uuid) -> Result<Vec<InviteCodeEntity>, AppError> {
        let rows: Vec<InviteCodeRow> = sqlx::query_as(&format!(
            r#"
            SELECT {SELECT_COLUMNS}
            FROM invite_codes
            WHERE owner_user_id = $1
            ORDER BY created_at DESC
            "#
        ))
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn deactivate_stale_user_codes(
        &self,
        user_id: Uuid,
        current_batch_key: &str,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE invite_codes
            SET active = FALSE, updated_at = NOW()
            WHERE owner_user_id = $1
              AND active = TRUE
              AND uses_count = 0
              AND COALESCE(batch_key, '') <> $2
            "#,
        )
        .bind(user_id)
        .bind(current_batch_key)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    async fn find_redeemed_discount(
        &self,
        user_id: Uuid,
    ) -> Result<Option<InviteDiscountGrant>, AppError> {
        let row: Option<(i32, Option<i32>, String, DateTime<Utc>)> = sqlx::query_as(
            r#"
            SELECT c.discount_percent, c.discount_months, c.code, r.redeemed_at
            FROM invite_code_redemptions r
            JOIN invite_codes c ON c.id = r.invite_code_id
            WHERE r.user_id = $1 AND c.discount_percent IS NOT NULL
            ORDER BY r.redeemed_at DESC
            LIMIT 1
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(
            |(percent_off, duration_months, code, redeemed_at)| InviteDiscountGrant {
                percent_off,
                duration_months,
                code,
                redeemed_at,
            },
        ))
    }
}
