//! PostgreSQL KYC session repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{KycRepository, KycSessionEntity};

/// PostgreSQL KYC session repository
pub struct PostgresKycRepository {
    pool: PgPool,
}

impl PostgresKycRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct KycSessionRow {
    id: Uuid,
    user_id: Uuid,
    provider: String,
    provider_session_id: String,
    status: String,
    redirect_url: Option<String>,
    error_code: Option<String>,
    error_reason: Option<String>,
    provider_data: serde_json::Value,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    completed_at: Option<DateTime<Utc>>,
}

impl From<KycSessionRow> for KycSessionEntity {
    fn from(row: KycSessionRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            provider: row.provider,
            provider_session_id: row.provider_session_id,
            status: row.status,
            redirect_url: row.redirect_url,
            error_code: row.error_code,
            error_reason: row.error_reason,
            provider_data: row.provider_data,
            created_at: row.created_at,
            updated_at: row.updated_at,
            completed_at: row.completed_at,
        }
    }
}

const SELECT_COLS: &str = "id, user_id, provider, provider_session_id, status, \
    redirect_url, error_code, error_reason, provider_data, \
    created_at, updated_at, completed_at";

#[async_trait]
impl KycRepository for PostgresKycRepository {
    async fn create_session(
        &self,
        session: KycSessionEntity,
    ) -> Result<KycSessionEntity, AppError> {
        let row: KycSessionRow = sqlx::query_as(&format!(
            r#"
            INSERT INTO kyc_sessions (
                id, user_id, provider, provider_session_id, status,
                redirect_url, error_code, error_reason, provider_data,
                created_at, updated_at, completed_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING {SELECT_COLS}
            "#
        ))
        .bind(session.id)
        .bind(session.user_id)
        .bind(&session.provider)
        .bind(&session.provider_session_id)
        .bind(&session.status)
        .bind(&session.redirect_url)
        .bind(&session.error_code)
        .bind(&session.error_reason)
        .bind(&session.provider_data)
        .bind(session.created_at)
        .bind(session.updated_at)
        .bind(session.completed_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn find_session_by_id(&self, id: Uuid) -> Result<Option<KycSessionEntity>, AppError> {
        let row: Option<KycSessionRow> = sqlx::query_as(&format!(
            "SELECT {SELECT_COLS} FROM kyc_sessions WHERE id = $1"
        ))
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_provider_session_id(
        &self,
        provider: &str,
        session_id: &str,
    ) -> Result<Option<KycSessionEntity>, AppError> {
        let row: Option<KycSessionRow> = sqlx::query_as(&format!(
            "SELECT {SELECT_COLS} FROM kyc_sessions WHERE provider = $1 AND provider_session_id = $2"
        ))
        .bind(provider)
        .bind(session_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn update_session_status(
        &self,
        id: Uuid,
        status: &str,
        error_code: Option<&str>,
        error_reason: Option<&str>,
        provider_data: serde_json::Value,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE kyc_sessions
            SET status        = $2,
                error_code    = $3,
                error_reason  = $4,
                provider_data = $5,
                updated_at    = NOW(),
                completed_at  = CASE
                    WHEN $2 IN ('verified', 'failed', 'canceled') THEN NOW()
                    ELSE completed_at
                END
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(status)
        .bind(error_code)
        .bind(error_reason)
        .bind(&provider_data)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn list_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<KycSessionEntity>, AppError> {
        let rows: Vec<KycSessionRow> = sqlx::query_as(&format!(
            r#"
            SELECT {SELECT_COLS}
            FROM kyc_sessions
            WHERE user_id = $1
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

    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM kyc_sessions WHERE user_id = $1")
                .bind(user_id)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }
}
