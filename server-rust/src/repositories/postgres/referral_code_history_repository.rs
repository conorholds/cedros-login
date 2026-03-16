//! PostgreSQL referral code history repository implementation.

use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::ReferralCodeHistoryRepository;

/// PostgreSQL referral code history repository.
pub struct PostgresReferralCodeHistoryRepository {
    pool: PgPool,
}

impl PostgresReferralCodeHistoryRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl ReferralCodeHistoryRepository for PostgresReferralCodeHistoryRepository {
    async fn add(&self, code: &str, user_id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO referral_code_history (code, user_id)
            VALUES ($1, $2)
            ON CONFLICT (code) DO NOTHING
            "#,
        )
        .bind(code)
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn find_user_by_code(&self, code: &str) -> Result<Option<Uuid>, AppError> {
        let row: Option<(Uuid,)> =
            sqlx::query_as("SELECT user_id FROM referral_code_history WHERE code = $1")
                .bind(code)
                .fetch_optional(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(|(id,)| id))
    }
}
