//! PostgreSQL credential repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{CredentialEntity, CredentialRepository, CredentialType};

/// PostgreSQL credential repository
pub struct PostgresCredentialRepository {
    pool: PgPool,
}

impl PostgresCredentialRepository {
    /// Create a new Postgres credential repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct CredentialRow {
    id: Uuid,
    user_id: Uuid,
    credential_type: String,
    label: Option<String>,
    created_at: DateTime<Utc>,
    last_used_at: Option<DateTime<Utc>>,
    disabled_at: Option<DateTime<Utc>>,
    metadata: Option<serde_json::Value>,
}

impl TryFrom<CredentialRow> for CredentialEntity {
    type Error = AppError;

    fn try_from(row: CredentialRow) -> Result<Self, Self::Error> {
        let credential_type = row.credential_type.parse::<CredentialType>().map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Unknown credential type: {}",
                row.credential_type
            ))
        })?;

        Ok(Self {
            id: row.id,
            user_id: row.user_id,
            credential_type,
            label: row.label,
            created_at: row.created_at,
            last_used_at: row.last_used_at,
            disabled_at: row.disabled_at,
            metadata: row.metadata,
        })
    }
}

#[async_trait]
impl CredentialRepository for PostgresCredentialRepository {
    async fn create(&self, credential: CredentialEntity) -> Result<CredentialEntity, AppError> {
        let row: CredentialRow = sqlx::query_as(
            r#"
            INSERT INTO user_credentials (id, user_id, credential_type, label, created_at, last_used_at, disabled_at, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, user_id, credential_type, label, created_at, last_used_at, disabled_at, metadata
            "#,
        )
        .bind(credential.id)
        .bind(credential.user_id)
        .bind(credential.credential_type.as_str())
        .bind(&credential.label)
        .bind(credential.created_at)
        .bind(credential.last_used_at)
        .bind(credential.disabled_at)
        .bind(&credential.metadata)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.try_into()
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<CredentialEntity>, AppError> {
        let row: Option<CredentialRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, credential_type, label, created_at, last_used_at, disabled_at, metadata
            FROM user_credentials
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(TryInto::try_into).transpose()
    }

    async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<CredentialEntity>, AppError> {
        let rows: Vec<CredentialRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, credential_type, label, created_at, last_used_at, disabled_at, metadata
            FROM user_credentials
            WHERE user_id = $1 AND disabled_at IS NULL
            ORDER BY created_at DESC
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn find_by_user_and_type(
        &self,
        user_id: Uuid,
        credential_type: CredentialType,
    ) -> Result<Vec<CredentialEntity>, AppError> {
        let rows: Vec<CredentialRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, credential_type, label, created_at, last_used_at, disabled_at, metadata
            FROM user_credentials
            WHERE user_id = $1 AND credential_type = $2 AND disabled_at IS NULL
            ORDER BY created_at DESC
            "#,
        )
        .bind(user_id)
        .bind(credential_type.as_str())
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn find_sso_identity(
        &self,
        provider_id: Uuid,
        subject: &str,
    ) -> Result<Option<CredentialEntity>, AppError> {
        let row: Option<CredentialRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, credential_type, label, created_at, last_used_at, disabled_at, metadata
            FROM user_credentials
            WHERE credential_type = 'sso_oidc'
              AND disabled_at IS NULL
              AND metadata ->> 'providerId' = $1
              AND metadata ->> 'subject' = $2
            LIMIT 1
            "#,
        )
        .bind(provider_id.to_string())
        .bind(subject)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(TryInto::try_into).transpose()
    }

    async fn update_last_used(&self, id: Uuid) -> Result<(), AppError> {
        // Check rows_affected to detect missing credential
        let result = sqlx::query(
            r#"
            UPDATE user_credentials
            SET last_used_at = NOW()
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Credential not found".into()));
        }

        Ok(())
    }

    async fn update_label(&self, id: Uuid, label: Option<String>) -> Result<(), AppError> {
        // Check rows_affected to detect missing credential
        let result = sqlx::query(
            r#"
            UPDATE user_credentials
            SET label = $2
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(label)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Credential not found".into()));
        }

        Ok(())
    }

    async fn disable(&self, id: Uuid) -> Result<(), AppError> {
        // Check rows_affected to detect missing credential
        let result = sqlx::query(
            r#"
            UPDATE user_credentials
            SET disabled_at = NOW()
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Credential not found".into()));
        }

        Ok(())
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            DELETE FROM user_credentials
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn delete_by_user_and_type(
        &self,
        user_id: Uuid,
        credential_type: CredentialType,
    ) -> Result<u64, AppError> {
        let result = sqlx::query(
            r#"
            DELETE FROM user_credentials
            WHERE user_id = $1 AND credential_type = $2
            "#,
        )
        .bind(user_id)
        .bind(credential_type.as_str())
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }

    async fn has_credential_type(
        &self,
        user_id: Uuid,
        credential_type: CredentialType,
    ) -> Result<bool, AppError> {
        let row: Option<(i64,)> = sqlx::query_as(
            r#"
            SELECT 1
            FROM user_credentials
            WHERE user_id = $1 AND credential_type = $2 AND disabled_at IS NULL
            LIMIT 1
            "#,
        )
        .bind(user_id)
        .bind(credential_type.as_str())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.is_some())
    }
}
