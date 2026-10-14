//! PostgreSQL system settings repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::autosave::AutosaveIdempotencyScope;
use crate::errors::AppError;
use crate::repositories::{
    SettingsAutosaveDecision, SettingsAutosaveError, SettingsAutosaveResponseBuilder,
    SettingsRevisionUpdateError, SystemSetting, SystemSettingsRepository,
};

const SETTINGS_REVISION_RESOURCE_ID: &str = "global";

/// PostgreSQL system settings repository
pub struct PostgresSystemSettingsRepository {
    pub(super) pool: PgPool,
}

impl PostgresSystemSettingsRepository {
    /// Create a new Postgres system settings repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    async fn upsert_one_in_tx(
        tx: &mut Transaction<'_, Postgres>,
        setting: &SystemSetting,
    ) -> Result<SystemSetting, AppError> {
        let row: SystemSettingRow = sqlx::query_as(
            r#"
            INSERT INTO system_settings (key, value, category, description, is_secret, encryption_version, updated_at, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
            ON CONFLICT (key) DO UPDATE SET
                value = EXCLUDED.value,
                category = EXCLUDED.category,
                description = COALESCE(EXCLUDED.description, system_settings.description),
                is_secret = EXCLUDED.is_secret,
                encryption_version = EXCLUDED.encryption_version,
                updated_at = NOW(),
                updated_by = EXCLUDED.updated_by
            RETURNING key, value, category, description, is_secret, encryption_version, updated_at, updated_by
            "#,
        )
        .bind(&setting.key)
        .bind(&setting.value)
        .bind(&setting.category)
        .bind(&setting.description)
        .bind(setting.is_secret)
        .bind(&setting.encryption_version)
        .bind(setting.updated_by)
        .fetch_one(&mut **tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    pub(super) async fn upsert_many_in_tx(
        tx: &mut Transaction<'_, Postgres>,
        settings: Vec<SystemSetting>,
    ) -> Result<Vec<SystemSetting>, AppError> {
        let mut results = Vec::with_capacity(settings.len());
        for setting in settings {
            results.push(Self::upsert_one_in_tx(tx, &setting).await?);
        }
        Ok(results)
    }

    async fn revision_in_tx(tx: &mut Transaction<'_, Postgres>) -> Result<u64, AppError> {
        let revision: i64 = sqlx::query_scalar(
            r#"
            INSERT INTO system_settings_revision (resource_id, revision)
            VALUES ($1, 1)
            ON CONFLICT (resource_id) DO UPDATE SET resource_id = EXCLUDED.resource_id
            RETURNING revision
            "#,
        )
        .bind(SETTINGS_REVISION_RESOURCE_ID)
        .fetch_one(&mut **tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(revision.try_into().unwrap_or(1))
    }

    pub(super) async fn locked_revision_in_tx(
        tx: &mut Transaction<'_, Postgres>,
    ) -> Result<u64, AppError> {
        Self::revision_in_tx(tx).await?;
        let revision: i64 = sqlx::query_scalar(
            r#"
            SELECT revision
            FROM system_settings_revision
            WHERE resource_id = $1
            FOR UPDATE
            "#,
        )
        .bind(SETTINGS_REVISION_RESOURCE_ID)
        .fetch_one(&mut **tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(revision.try_into().unwrap_or(1))
    }

    pub(super) async fn bump_revision_in_tx(
        tx: &mut Transaction<'_, Postgres>,
    ) -> Result<u64, AppError> {
        let revision: i64 = sqlx::query_scalar(
            r#"
            INSERT INTO system_settings_revision (resource_id, revision)
            VALUES ($1, 1)
            ON CONFLICT (resource_id) DO UPDATE SET
                revision = system_settings_revision.revision + 1,
                updated_at = NOW()
            RETURNING revision
            "#,
        )
        .bind(SETTINGS_REVISION_RESOURCE_ID)
        .fetch_one(&mut **tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(revision.try_into().unwrap_or(1))
    }
}

/// Row type for system settings queries
#[derive(sqlx::FromRow)]
struct SystemSettingRow {
    key: String,
    value: String,
    category: String,
    description: Option<String>,
    is_secret: bool,
    encryption_version: Option<String>,
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
            is_secret: row.is_secret,
            encryption_version: row.encryption_version,
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
            SELECT key, value, category, description, is_secret, encryption_version, updated_at, updated_by
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
            SELECT key, value, category, description, is_secret, encryption_version, updated_at, updated_by
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
            SELECT key, value, category, description, is_secret, encryption_version, updated_at, updated_by
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

    async fn get_all_with_revision(&self) -> Result<(Vec<SystemSetting>, u64), AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        sqlx::query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY")
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        let rows: Vec<SystemSettingRow> = sqlx::query_as(
            r#"
            SELECT key, value, category, description, is_secret, encryption_version, updated_at, updated_by
            FROM system_settings
            ORDER BY category, key
            "#,
        )
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        let revision: Option<i64> = sqlx::query_scalar(
            "SELECT revision FROM system_settings_revision WHERE resource_id = $1",
        )
        .bind(SETTINGS_REVISION_RESOURCE_ID)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok((
            rows.into_iter().map(Into::into).collect(),
            revision.unwrap_or(1).try_into().unwrap_or(1),
        ))
    }

    async fn upsert(&self, setting: SystemSetting) -> Result<SystemSetting, AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        let updated = Self::upsert_one_in_tx(&mut tx, &setting).await?;
        Self::bump_revision_in_tx(&mut tx).await?;
        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(updated)
    }

    async fn upsert_many(
        &self,
        settings: Vec<SystemSetting>,
    ) -> Result<Vec<SystemSetting>, AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        let results = Self::upsert_many_in_tx(&mut tx, settings).await?;
        if !results.is_empty() {
            Self::bump_revision_in_tx(&mut tx).await?;
        }
        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(results)
    }

    async fn get_revision(&self) -> Result<u64, AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        let revision = Self::revision_in_tx(&mut tx).await?;
        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(revision)
    }

    async fn upsert_many_with_revision(
        &self,
        settings: Vec<SystemSetting>,
    ) -> Result<(Vec<SystemSetting>, u64), AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        let updated = Self::upsert_many_in_tx(&mut tx, settings).await?;
        let revision = if updated.is_empty() {
            Self::revision_in_tx(&mut tx).await?
        } else {
            Self::bump_revision_in_tx(&mut tx).await?
        };
        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok((updated, revision))
    }

    async fn upsert_many_if_revision(
        &self,
        settings: Vec<SystemSetting>,
        expected_revision: u64,
    ) -> Result<(Vec<SystemSetting>, u64), SettingsRevisionUpdateError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))
            .map_err(SettingsRevisionUpdateError::App)?;
        let current_revision = Self::locked_revision_in_tx(&mut tx)
            .await
            .map_err(SettingsRevisionUpdateError::App)?;

        if current_revision != expected_revision {
            return Err(SettingsRevisionUpdateError::Stale { current_revision });
        }

        let updated = Self::upsert_many_in_tx(&mut tx, settings)
            .await
            .map_err(SettingsRevisionUpdateError::App)?;
        let revision = if updated.is_empty() {
            current_revision
        } else {
            Self::bump_revision_in_tx(&mut tx)
                .await
                .map_err(SettingsRevisionUpdateError::App)?
        };
        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))
            .map_err(SettingsRevisionUpdateError::App)?;

        Ok((updated, revision))
    }

    async fn commit_autosave(
        &self,
        settings: Vec<SystemSetting>,
        expected_revision: u64,
        scope: &AutosaveIdempotencyScope,
        fingerprint: &str,
        response_builder: &dyn SettingsAutosaveResponseBuilder,
    ) -> Result<SettingsAutosaveDecision, SettingsAutosaveError> {
        self.commit_autosave_atomic(
            settings,
            expected_revision,
            scope,
            fingerprint,
            response_builder,
        )
        .await
    }
}
