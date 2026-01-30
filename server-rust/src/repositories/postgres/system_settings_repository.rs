//! PostgreSQL system settings repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{SystemSetting, SystemSettingsRepository};

/// PostgreSQL system settings repository
pub struct PostgresSystemSettingsRepository {
    pool: PgPool,
}

impl PostgresSystemSettingsRepository {
    /// Create a new Postgres system settings repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for system settings queries
#[derive(sqlx::FromRow)]
struct SystemSettingRow {
    key: String,
    value: String,
    category: String,
    description: Option<String>,
    updated_at: DateTime<Utc>,
    updated_by: Option<Uuid>,
}

impl From<SystemSettingRow> for SystemSetting {
    fn from(row: SystemSettingRow) -> Self {
        Self {
            key: row.key,
            value: row.value,
            category: row.category,
            description: row.description,
            updated_at: row.updated_at,
            updated_by: row.updated_by,
        }
    }
}

#[async_trait]
impl SystemSettingsRepository for PostgresSystemSettingsRepository {
    async fn get_all(&self) -> Result<Vec<SystemSetting>, AppError> {
        let rows: Vec<SystemSettingRow> = sqlx::query_as(
            r#"
            SELECT key, value, category, description, updated_at, updated_by
            FROM system_settings
            ORDER BY category, key
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn get_by_key(&self, key: &str) -> Result<Option<SystemSetting>, AppError> {
        let row: Option<SystemSettingRow> = sqlx::query_as(
            r#"
            SELECT key, value, category, description, updated_at, updated_by
            FROM system_settings
            WHERE key = $1
            "#,
        )
        .bind(key)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn get_by_category(&self, category: &str) -> Result<Vec<SystemSetting>, AppError> {
        let rows: Vec<SystemSettingRow> = sqlx::query_as(
            r#"
            SELECT key, value, category, description, updated_at, updated_by
            FROM system_settings
            WHERE category = $1
            ORDER BY key
            "#,
        )
        .bind(category)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn upsert(&self, setting: SystemSetting) -> Result<SystemSetting, AppError> {
        let row: SystemSettingRow = sqlx::query_as(
            r#"
            INSERT INTO system_settings (key, value, category, description, updated_at, updated_by)
            VALUES ($1, $2, $3, $4, NOW(), $5)
            ON CONFLICT (key) DO UPDATE SET
                value = EXCLUDED.value,
                category = EXCLUDED.category,
                description = COALESCE(EXCLUDED.description, system_settings.description),
                updated_at = NOW(),
                updated_by = EXCLUDED.updated_by
            RETURNING key, value, category, description, updated_at, updated_by
            "#,
        )
        .bind(&setting.key)
        .bind(&setting.value)
        .bind(&setting.category)
        .bind(&setting.description)
        .bind(setting.updated_by)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn upsert_many(
        &self,
        settings: Vec<SystemSetting>,
    ) -> Result<Vec<SystemSetting>, AppError> {
        // Use a transaction for atomic batch update
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        let mut results = Vec::with_capacity(settings.len());

        for setting in settings {
            let row: SystemSettingRow = sqlx::query_as(
                r#"
                INSERT INTO system_settings (key, value, category, description, updated_at, updated_by)
                VALUES ($1, $2, $3, $4, NOW(), $5)
                ON CONFLICT (key) DO UPDATE SET
                    value = EXCLUDED.value,
                    category = EXCLUDED.category,
                    description = COALESCE(EXCLUDED.description, system_settings.description),
                    updated_at = NOW(),
                    updated_by = EXCLUDED.updated_by
                RETURNING key, value, category, description, updated_at, updated_by
                "#,
            )
            .bind(&setting.key)
            .bind(&setting.value)
            .bind(&setting.category)
            .bind(&setting.description)
            .bind(setting.updated_by)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

            results.push(row.into());
        }

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(results)
    }
}
