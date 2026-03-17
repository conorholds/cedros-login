//! PostgreSQL access code repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{AccessCodeEntity, AccessCodeRepository};

pub struct PostgresAccessCodeRepository {
    pool: PgPool,
}

impl PostgresAccessCodeRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct AccessCodeRow {
    id: Uuid,
    code: String,
    code_type: String,
    max_uses: Option<i32>,
    current_uses: i32,
    created_by: Option<Uuid>,
    expires_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
}

impl From<AccessCodeRow> for AccessCodeEntity {
    fn from(row: AccessCodeRow) -> Self {
        Self {
            id: row.id,
            code: row.code,
            code_type: row.code_type,
            max_uses: row.max_uses,
            current_uses: row.current_uses,
            created_by: row.created_by,
            expires_at: row.expires_at,
            created_at: row.created_at,
        }
    }
}

const SELECT_COLS: &str =
    "id, code, code_type, max_uses, current_uses, created_by, expires_at, created_at";

#[async_trait]
impl AccessCodeRepository for PostgresAccessCodeRepository {
    async fn find_by_code(&self, code: &str) -> Result<Option<AccessCodeEntity>, AppError> {
        let row: Option<AccessCodeRow> = sqlx::query_as(&format!(
            "SELECT {SELECT_COLS} FROM access_codes WHERE code = $1"
        ))
        .bind(code)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn increment_uses(&self, id: Uuid) -> Result<bool, AppError> {
        // Atomically increment only when capacity remains.
        // Returns the updated row's id; absence means the code was exhausted.
        let updated: Option<(Uuid,)> = sqlx::query_as(
            r#"
            UPDATE access_codes
            SET current_uses = current_uses + 1
            WHERE id = $1
              AND (max_uses IS NULL OR current_uses < max_uses)
            RETURNING id
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(updated.is_some())
    }

    async fn create(&self, entity: AccessCodeEntity) -> Result<AccessCodeEntity, AppError> {
        let row: AccessCodeRow = sqlx::query_as(&format!(
            r#"
            INSERT INTO access_codes
                (id, code, code_type, max_uses, current_uses, created_by, expires_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING {SELECT_COLS}
            "#
        ))
        .bind(entity.id)
        .bind(&entity.code)
        .bind(&entity.code_type)
        .bind(entity.max_uses)
        .bind(entity.current_uses)
        .bind(entity.created_by)
        .bind(entity.expires_at)
        .bind(entity.created_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query("DELETE FROM access_codes WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    async fn list_all(
        &self,
        limit: u32,
        offset: u32,
        code_type: Option<&str>,
    ) -> Result<Vec<AccessCodeEntity>, AppError> {
        let rows: Vec<AccessCodeRow> = if let Some(ct) = code_type {
            sqlx::query_as(&format!(
                r#"
                SELECT {SELECT_COLS} FROM access_codes
                WHERE code_type = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
                "#
            ))
            .bind(ct)
            .bind(limit as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        } else {
            sqlx::query_as(&format!(
                r#"
                SELECT {SELECT_COLS} FROM access_codes
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
                "#
            ))
            .bind(limit as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?
        };

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_all(&self, code_type: Option<&str>) -> Result<u64, AppError> {
        let count: i64 = if let Some(ct) = code_type {
            sqlx::query_scalar("SELECT COUNT(*) FROM access_codes WHERE code_type = $1")
                .bind(ct)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?
        } else {
            sqlx::query_scalar("SELECT COUNT(*) FROM access_codes")
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?
        };
        Ok(count.max(0) as u64)
    }

    async fn count_by_creator_since(
        &self,
        user_id: Uuid,
        since: DateTime<Utc>,
    ) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM access_codes WHERE created_by = $1 AND created_at >= $2",
        )
        .bind(user_id)
        .bind(since)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(count.max(0) as u64)
    }

    async fn list_by_creator(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AccessCodeEntity>, AppError> {
        let rows: Vec<AccessCodeRow> = sqlx::query_as(&format!(
            r#"
            SELECT {SELECT_COLS} FROM access_codes
            WHERE created_by = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#
        ))
        .bind(user_id)
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }
}
