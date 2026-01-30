//! PostgreSQL policy repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde_json::Value;
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::repositories::{AbacPolicy, PolicyConditions, PolicyEffect, PolicyRepository};

/// PostgreSQL policy repository
pub struct PostgresPolicyRepository {
    pool: PgPool,
}

impl PostgresPolicyRepository {
    /// Create a new Postgres policy repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct PolicyRow {
    id: Uuid,
    org_id: Uuid,
    name: String,
    description: Option<String>,
    permission: String,
    conditions: Value,
    effect: String,
    priority: i32,
    enabled: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl TryFrom<PolicyRow> for AbacPolicy {
    type Error = AppError;

    fn try_from(row: PolicyRow) -> Result<Self, Self::Error> {
        let conditions: PolicyConditions = serde_json::from_value(row.conditions).map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse policy conditions: {}", e))
        })?;

        let effect = match row.effect.as_str() {
            "allow" => PolicyEffect::Allow,
            "deny" => PolicyEffect::Deny,
            other => {
                return Err(AppError::Internal(anyhow::anyhow!(
                    "Invalid policy effect: {}",
                    other
                )))
            }
        };

        Ok(Self {
            id: row.id,
            org_id: row.org_id,
            name: row.name,
            description: row.description,
            permission: row.permission,
            conditions,
            effect,
            priority: row.priority,
            enabled: row.enabled,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}

#[async_trait]
impl PolicyRepository for PostgresPolicyRepository {
    async fn create(&self, policy: AbacPolicy) -> Result<AbacPolicy, AppError> {
        let conditions =
            serde_json::to_value(&policy.conditions).map_err(|e| AppError::Internal(e.into()))?;
        let effect = policy.effect.as_str();

        let row: PolicyRow = sqlx::query_as(
            r#"
            INSERT INTO abac_policies (
                id, org_id, name, description, permission, conditions,
                effect, priority, enabled, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, org_id, name, description, permission, conditions,
                      effect, priority, enabled, created_at, updated_at
            "#,
        )
        .bind(policy.id)
        .bind(policy.org_id)
        .bind(&policy.name)
        .bind(&policy.description)
        .bind(&policy.permission)
        .bind(conditions)
        .bind(effect)
        .bind(policy.priority)
        .bind(policy.enabled)
        .bind(policy.created_at)
        .bind(policy.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.try_into()
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<AbacPolicy>, AppError> {
        let row: Option<PolicyRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, description, permission, conditions,
                   effect, priority, enabled, created_at, updated_at
            FROM abac_policies
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(TryInto::try_into).transpose()
    }

    async fn find_by_org(&self, org_id: Uuid) -> Result<Vec<AbacPolicy>, AppError> {
        let rows: Vec<PolicyRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, description, permission, conditions,
                   effect, priority, enabled, created_at, updated_at
            FROM abac_policies
            WHERE org_id = $1
            ORDER BY priority DESC
            "#,
        )
        .bind(org_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn find_by_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AbacPolicy>, AppError> {
        let capped_limit = cap_limit(limit);
        let capped_offset = cap_offset(offset);

        let rows: Vec<PolicyRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, description, permission, conditions,
                   effect, priority, enabled, created_at, updated_at
            FROM abac_policies
            WHERE org_id = $1
            ORDER BY priority DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(org_id)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn count_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM abac_policies WHERE org_id = $1")
            .bind(org_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    async fn find_by_org_and_permission(
        &self,
        org_id: Uuid,
        permission: &str,
    ) -> Result<Vec<AbacPolicy>, AppError> {
        let rows: Vec<PolicyRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, description, permission, conditions,
                   effect, priority, enabled, created_at, updated_at
            FROM abac_policies
            WHERE org_id = $1 AND permission = $2 AND enabled = TRUE
            ORDER BY priority DESC
            "#,
        )
        .bind(org_id)
        .bind(permission)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn update(&self, policy: AbacPolicy) -> Result<AbacPolicy, AppError> {
        let conditions =
            serde_json::to_value(&policy.conditions).map_err(|e| AppError::Internal(e.into()))?;
        let effect = policy.effect.as_str();

        let row: Option<PolicyRow> = sqlx::query_as(
            r#"
            UPDATE abac_policies
            SET name = $2,
                description = $3,
                permission = $4,
                conditions = $5,
                effect = $6,
                priority = $7,
                enabled = $8,
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, org_id, name, description, permission, conditions,
                      effect, priority, enabled, created_at, updated_at
            "#,
        )
        .bind(policy.id)
        .bind(&policy.name)
        .bind(&policy.description)
        .bind(&policy.permission)
        .bind(conditions)
        .bind(effect)
        .bind(policy.priority)
        .bind(policy.enabled)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let Some(row) = row else {
            return Err(AppError::NotFound("Policy not found".into()));
        };

        row.try_into()
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            DELETE FROM abac_policies
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let result = sqlx::query(
            r#"
            DELETE FROM abac_policies
            WHERE org_id = $1
            "#,
        )
        .bind(org_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }
}
