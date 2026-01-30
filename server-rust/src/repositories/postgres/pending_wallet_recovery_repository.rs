//! PostgreSQL pending wallet recovery repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    PendingWalletRecoveryEntity, PendingWalletRecoveryRepository, RecoveryType,
};

/// PostgreSQL pending wallet recovery repository
pub struct PostgresPendingWalletRecoveryRepository {
    pool: PgPool,
}

impl PostgresPendingWalletRecoveryRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for database queries
#[derive(sqlx::FromRow)]
struct PendingRecoveryRow {
    id: Uuid,
    user_id: Uuid,
    recovery_type: String,
    recovery_data: String,
    created_at: DateTime<Utc>,
    expires_at: DateTime<Utc>,
}

impl TryFrom<PendingRecoveryRow> for PendingWalletRecoveryEntity {
    type Error = AppError;

    fn try_from(row: PendingRecoveryRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: row.id,
            user_id: row.user_id,
            recovery_type: RecoveryType::try_from(row.recovery_type.as_str())?,
            recovery_data: row.recovery_data,
            created_at: row.created_at,
            expires_at: row.expires_at,
        })
    }
}

#[async_trait]
impl PendingWalletRecoveryRepository for PostgresPendingWalletRecoveryRepository {
    async fn create(
        &self,
        entity: PendingWalletRecoveryEntity,
    ) -> Result<PendingWalletRecoveryEntity, AppError> {
        // Use INSERT ... ON CONFLICT to replace any existing entry
        let row: PendingRecoveryRow = sqlx::query_as(
            r#"
            INSERT INTO pending_wallet_recovery (id, user_id, recovery_type, recovery_data, created_at, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id) DO UPDATE SET
                id = EXCLUDED.id,
                recovery_type = EXCLUDED.recovery_type,
                recovery_data = EXCLUDED.recovery_data,
                created_at = EXCLUDED.created_at,
                expires_at = EXCLUDED.expires_at
            RETURNING id, user_id, recovery_type, recovery_data, created_at, expires_at
            "#,
        )
        .bind(entity.id)
        .bind(entity.user_id)
        .bind(entity.recovery_type.to_string())
        .bind(&entity.recovery_data)
        .bind(entity.created_at)
        .bind(entity.expires_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.try_into()
    }

    async fn find_by_user_id(
        &self,
        user_id: Uuid,
    ) -> Result<Option<PendingWalletRecoveryEntity>, AppError> {
        let row: Option<PendingRecoveryRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, recovery_type, recovery_data, created_at, expires_at
            FROM pending_wallet_recovery
            WHERE user_id = $1 AND expires_at > NOW()
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(TryInto::try_into).transpose()
    }

    async fn delete_by_user_id(&self, user_id: Uuid) -> Result<bool, AppError> {
        let result = sqlx::query("DELETE FROM pending_wallet_recovery WHERE user_id = $1")
            .bind(user_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected() > 0)
    }

    async fn delete_expired(&self) -> Result<u64, AppError> {
        let result = sqlx::query("DELETE FROM pending_wallet_recovery WHERE expires_at < NOW()")
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }
}
