//! PostgreSQL custom role repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::repositories::{CustomRole, CustomRoleRepository};

/// PostgreSQL custom role repository
pub struct PostgresCustomRoleRepository {
    pool: PgPool,
}

impl PostgresCustomRoleRepository {
    /// Create a new Postgres custom role repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct CustomRoleRow {
    id: Uuid,
    org_id: Uuid,
    name: String,
    description: Option<String>,
    permissions: Vec<String>,
    is_default: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<CustomRoleRow> for CustomRole {
    fn from(row: CustomRoleRow) -> Self {
        Self {
            id: row.id,
            org_id: row.org_id,
            name: row.name,
            description: row.description,
            permissions: row.permissions.into_iter().collect(),
            is_default: row.is_default,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

fn map_unique_violation(err: sqlx::Error) -> AppError {
    if let sqlx::Error::Database(db_err) = &err {
        if db_err.is_unique_violation() {
            return AppError::Validation("Role name already exists in this organization".into());
        }
    }
    AppError::Internal(err.into())
}

#[async_trait]
impl CustomRoleRepository for PostgresCustomRoleRepository {
    async fn create(&self, role: CustomRole) -> Result<CustomRole, AppError> {
        let permissions: Vec<String> = role.permissions.iter().cloned().collect();
        let row: CustomRoleRow = sqlx::query_as(
            r#"
            INSERT INTO custom_roles (
                id, org_id, name, description, permissions, is_default, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, org_id, name, description, permissions, is_default, created_at, updated_at
            "#,
        )
        .bind(role.id)
        .bind(role.org_id)
        .bind(&role.name)
        .bind(&role.description)
        .bind(&permissions)
        .bind(role.is_default)
        .bind(role.created_at)
        .bind(role.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(map_unique_violation)?;

        Ok(row.into())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<CustomRole>, AppError> {
        let row: Option<CustomRoleRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, description, permissions, is_default, created_at, updated_at
            FROM custom_roles
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_org(&self, org_id: Uuid) -> Result<Vec<CustomRole>, AppError> {
        let rows: Vec<CustomRoleRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, description, permissions, is_default, created_at, updated_at
            FROM custom_roles
            WHERE org_id = $1
            ORDER BY created_at ASC
            "#,
        )
        .bind(org_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_by_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<CustomRole>, AppError> {
        let capped_limit = cap_limit(limit);
        let capped_offset = cap_offset(offset);

        let rows: Vec<CustomRoleRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, description, permissions, is_default, created_at, updated_at
            FROM custom_roles
            WHERE org_id = $1
            ORDER BY created_at ASC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(org_id)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM custom_roles WHERE org_id = $1")
            .bind(org_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    async fn find_by_org_and_name(
        &self,
        org_id: Uuid,
        name: &str,
    ) -> Result<Option<CustomRole>, AppError> {
        let row: Option<CustomRoleRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, description, permissions, is_default, created_at, updated_at
            FROM custom_roles
            WHERE org_id = $1 AND lower(name) = lower($2)
            "#,
        )
        .bind(org_id)
        .bind(name)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn update(&self, role: CustomRole) -> Result<CustomRole, AppError> {
        let permissions: Vec<String> = role.permissions.iter().cloned().collect();
        let row: Option<CustomRoleRow> = sqlx::query_as(
            r#"
            UPDATE custom_roles
            SET name = $2,
                description = $3,
                permissions = $4,
                is_default = $5,
                updated_at = $6
            WHERE id = $1
            RETURNING id, org_id, name, description, permissions, is_default, created_at, updated_at
            "#,
        )
        .bind(role.id)
        .bind(&role.name)
        .bind(&role.description)
        .bind(&permissions)
        .bind(role.is_default)
        .bind(Utc::now())
        .fetch_optional(&self.pool)
        .await
        .map_err(map_unique_violation)?;

        let Some(row) = row else {
            return Err(AppError::NotFound("Role not found".into()));
        };

        Ok(row.into())
    }

    async fn delete(&self, id: Uuid) -> Result<bool, AppError> {
        let result = sqlx::query(
            r#"
            DELETE FROM custom_roles
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected() > 0)
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let result = sqlx::query(
            r#"
            DELETE FROM custom_roles
            WHERE org_id = $1
            "#,
        )
        .bind(org_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }

    async fn get_default_role(&self, org_id: Uuid) -> Result<Option<CustomRole>, AppError> {
        let row: Option<CustomRoleRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, description, permissions, is_default, created_at, updated_at
            FROM custom_roles
            WHERE org_id = $1 AND is_default = TRUE
            "#,
        )
        .bind(org_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn set_default_role(&self, org_id: Uuid, role_id: Uuid) -> Result<(), AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        let row: Option<(Uuid,)> = sqlx::query_as(
            r#"
            SELECT id FROM custom_roles
            WHERE id = $1 AND org_id = $2
            "#,
        )
        .bind(role_id)
        .bind(org_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if row.is_none() {
            return Err(AppError::NotFound("Role not found".into()));
        }

        sqlx::query(
            r#"
            UPDATE custom_roles
            SET is_default = FALSE,
                updated_at = NOW()
            WHERE org_id = $1
            "#,
        )
        .bind(org_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        sqlx::query(
            r#"
            UPDATE custom_roles
            SET is_default = TRUE,
                updated_at = NOW()
            WHERE id = $1
            "#,
        )
        .bind(role_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }
}
