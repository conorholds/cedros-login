//! PostgreSQL organization repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::repositories::{OrgEntity, OrgRepository};

/// Map sqlx::Error to AppError using proper enum matching
fn map_sqlx_error(e: sqlx::Error, unique_violation_msg: &str) -> AppError {
    match &e {
        sqlx::Error::Database(db_err) => {
            // PostgreSQL unique violation error code is 23505
            if db_err.code().map(|c| c == "23505").unwrap_or(false) {
                return AppError::Validation(unique_violation_msg.into());
            }
            AppError::Database(e.to_string())
        }
        sqlx::Error::RowNotFound => AppError::NotFound("Organization not found".into()),
        _ => AppError::Database(e.to_string()),
    }
}

/// PostgreSQL organization repository
pub struct PostgresOrgRepository {
    pool: PgPool,
}

impl PostgresOrgRepository {
    /// Create a new Postgres organization repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for organization queries
#[derive(sqlx::FromRow)]
struct OrgRow {
    id: Uuid,
    name: String,
    slug: String,
    logo_url: Option<String>,
    is_personal: bool,
    owner_id: Uuid,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<OrgRow> for OrgEntity {
    fn from(row: OrgRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            slug: row.slug,
            logo_url: row.logo_url,
            is_personal: row.is_personal,
            owner_id: row.owner_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[async_trait]
impl OrgRepository for PostgresOrgRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<OrgEntity>, AppError> {
        let row: Option<OrgRow> = sqlx::query_as(
            r#"
            SELECT id, name, slug, logo_url, is_personal, owner_id, created_at, updated_at
            FROM organizations WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_ids(&self, ids: &[Uuid]) -> Result<Vec<OrgEntity>, AppError> {
        if ids.is_empty() {
            return Ok(vec![]);
        }

        let rows: Vec<OrgRow> = sqlx::query_as(
            r#"
            SELECT id, name, slug, logo_url, is_personal, owner_id, created_at, updated_at
            FROM organizations WHERE id = ANY($1)
            "#,
        )
        .bind(ids)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_by_slug(&self, slug: &str) -> Result<Option<OrgEntity>, AppError> {
        let row: Option<OrgRow> = sqlx::query_as(
            r#"
            SELECT id, name, slug, logo_url, is_personal, owner_id, created_at, updated_at
            FROM organizations WHERE slug = $1
            "#,
        )
        .bind(slug)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(row.map(Into::into))
    }

    /// Find all organizations a user belongs to (max 100).
    ///
    /// # PERF-03/PERF-04: Query Performance Notes
    ///
    /// The JOIN order (organizations -> memberships) is chosen to leverage:
    /// - `memberships.user_id` index for filtering (most selective)
    /// - `memberships.org_id` foreign key for the join
    ///
    /// PERF-04: Results are capped at 100 to prevent unbounded memory usage.
    /// For users with more memberships, use pagination APIs.
    ///
    /// For users with many memberships (>100), consider adding a covering index:
    /// `CREATE INDEX idx_memberships_user_org ON memberships(user_id, org_id)`
    async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<OrgEntity>, AppError> {
        let rows: Vec<OrgRow> = sqlx::query_as(
            r#"
            SELECT o.id, o.name, o.slug, o.logo_url, o.is_personal, o.owner_id, o.created_at, o.updated_at
            FROM organizations o
            JOIN memberships m ON o.id = m.org_id
            WHERE m.user_id = $1
            ORDER BY o.created_at DESC
            LIMIT 100
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn create(&self, org: OrgEntity) -> Result<OrgEntity, AppError> {
        let row: OrgRow = sqlx::query_as(
            r#"
            INSERT INTO organizations (id, name, slug, logo_url, is_personal, owner_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, slug, logo_url, is_personal, owner_id, created_at, updated_at
            "#,
        )
        .bind(org.id)
        .bind(&org.name)
        .bind(&org.slug)
        .bind(&org.logo_url)
        .bind(org.is_personal)
        .bind(org.owner_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| map_sqlx_error(e, "Organization slug already exists"))?;

        Ok(row.into())
    }

    async fn update(&self, org: OrgEntity) -> Result<OrgEntity, AppError> {
        let row: OrgRow = sqlx::query_as(
            r#"
            UPDATE organizations
            SET name = $2, slug = $3, logo_url = $4, updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, slug, logo_url, is_personal, owner_id, created_at, updated_at
            "#,
        )
        .bind(org.id)
        .bind(&org.name)
        .bind(&org.slug)
        .bind(&org.logo_url)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| map_sqlx_error(e, "Organization slug already exists"))?;

        Ok(row.into())
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM organizations WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Organization not found".into()));
        }

        Ok(())
    }

    async fn slug_exists(&self, slug: &str) -> Result<bool, AppError> {
        let row: (bool,) =
            sqlx::query_as("SELECT EXISTS(SELECT 1 FROM organizations WHERE slug = $1)")
                .bind(slug)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(row.0)
    }

    async fn list_all(&self, limit: u32, offset: u32) -> Result<Vec<OrgEntity>, AppError> {
        // R-08: Use shared pagination constants
        let capped_limit = cap_limit(limit);
        let capped_offset = cap_offset(offset);

        let rows: Vec<OrgRow> = sqlx::query_as(
            r#"
            SELECT id, name, slug, logo_url, is_personal, owner_id, created_at, updated_at
            FROM organizations
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
        )
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count(&self) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM organizations")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(count.max(0) as u64)
    }
}
