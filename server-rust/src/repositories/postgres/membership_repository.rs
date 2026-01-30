//! PostgreSQL membership repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{MemberWithUser, MembershipEntity, MembershipRepository, OrgRole};

/// Map sqlx::Error to AppError using proper enum matching
fn map_sqlx_error(e: sqlx::Error) -> AppError {
    match &e {
        sqlx::Error::Database(db_err) => {
            // PostgreSQL unique violation error code is 23505
            if db_err.code().map(|c| c == "23505").unwrap_or(false) {
                return AppError::Validation(
                    "User is already a member of this organization".into(),
                );
            }
            AppError::Database(e.to_string())
        }
        sqlx::Error::RowNotFound => AppError::NotFound("Membership not found".into()),
        _ => AppError::Database(e.to_string()),
    }
}

/// PostgreSQL membership repository
pub struct PostgresMembershipRepository {
    pool: PgPool,
}

impl PostgresMembershipRepository {
    /// Create a new Postgres membership repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for membership queries
#[derive(sqlx::FromRow)]
struct MembershipRow {
    id: Uuid,
    user_id: Uuid,
    org_id: Uuid,
    role: String,
    joined_at: DateTime<Utc>,
}

/// Row type for membership + user JOIN queries
#[derive(sqlx::FromRow)]
struct MemberWithUserRow {
    id: Uuid,
    user_id: Uuid,
    org_id: Uuid,
    role: String,
    joined_at: DateTime<Utc>,
    email: Option<String>,
    name: Option<String>,
}

impl TryFrom<MemberWithUserRow> for MemberWithUser {
    type Error = AppError;

    fn try_from(row: MemberWithUserRow) -> Result<Self, Self::Error> {
        // R-10: Include row context in error message for easier debugging
        let role = OrgRole::from_str(&row.role).ok_or_else(|| {
            AppError::Database(format!(
                "Invalid role '{}' for membership id={}, user_id={}, org_id={}",
                row.role, row.id, row.user_id, row.org_id
            ))
        })?;

        Ok(Self {
            membership: MembershipEntity {
                id: row.id,
                user_id: row.user_id,
                org_id: row.org_id,
                role,
                joined_at: row.joined_at,
            },
            email: row.email,
            name: row.name,
        })
    }
}

impl TryFrom<MembershipRow> for MembershipEntity {
    type Error = AppError;

    fn try_from(row: MembershipRow) -> Result<Self, Self::Error> {
        // R-10: Include row context in error message for easier debugging
        let role = OrgRole::from_str(&row.role).ok_or_else(|| {
            AppError::Database(format!(
                "Invalid role '{}' for membership id={}, user_id={}, org_id={}",
                row.role, row.id, row.user_id, row.org_id
            ))
        })?;

        Ok(Self {
            id: row.id,
            user_id: row.user_id,
            org_id: row.org_id,
            role,
            joined_at: row.joined_at,
        })
    }
}

#[async_trait]
impl MembershipRepository for PostgresMembershipRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<MembershipEntity>, AppError> {
        let row: Option<MembershipRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, org_id, role, joined_at
            FROM memberships WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(r.try_into()?)),
            None => Ok(None),
        }
    }

    async fn find_by_user_and_org(
        &self,
        user_id: Uuid,
        org_id: Uuid,
    ) -> Result<Option<MembershipEntity>, AppError> {
        let row: Option<MembershipRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, org_id, role, joined_at
            FROM memberships WHERE user_id = $1 AND org_id = $2
            "#,
        )
        .bind(user_id)
        .bind(org_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(r.try_into()?)),
            None => Ok(None),
        }
    }

    async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<MembershipEntity>, AppError> {
        // PERF-003: Cap at 100 to match paged method's MAX_PAGE_SIZE
        let rows: Vec<MembershipRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, org_id, role, joined_at
            FROM memberships WHERE user_id = $1
            ORDER BY joined_at DESC
            LIMIT 100
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn find_by_user_paged(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<MembershipEntity>, AppError> {
        // Cap page size to prevent DoS via large limit values
        const MAX_PAGE_SIZE: u32 = 100;
        // L-01: Cap offset to prevent wasted DB resources with absurd values
        const MAX_OFFSET: u32 = 1_000_000;

        let capped_limit = limit.min(MAX_PAGE_SIZE);
        let capped_offset = offset.min(MAX_OFFSET);

        let rows: Vec<MembershipRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, org_id, role, joined_at
            FROM memberships WHERE user_id = $1
            ORDER BY joined_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(user_id)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn find_by_org(&self, org_id: Uuid) -> Result<Vec<MembershipEntity>, AppError> {
        // PERF-003: Cap at 100 to match paged method's MAX_PAGE_SIZE
        let rows: Vec<MembershipRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, org_id, role, joined_at
            FROM memberships WHERE org_id = $1
            ORDER BY joined_at ASC
            LIMIT 100
            "#,
        )
        .bind(org_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn find_by_org_with_users(&self, org_id: Uuid) -> Result<Vec<MemberWithUser>, AppError> {
        // PERF-003: Cap at 100 to match paged method's MAX_PAGE_SIZE
        let rows: Vec<MemberWithUserRow> = sqlx::query_as(
            r#"
            SELECT m.id, m.user_id, m.org_id, m.role, m.joined_at,
                   u.email, u.name
            FROM memberships m
            LEFT JOIN users u ON u.id = m.user_id
            WHERE m.org_id = $1
            ORDER BY m.joined_at ASC
            LIMIT 100
            "#,
        )
        .bind(org_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn find_by_org_with_users_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<MemberWithUser>, AppError> {
        // Cap page size to prevent DoS via large limit values
        const MAX_PAGE_SIZE: u32 = 100;
        // L-01: Cap offset to prevent wasted DB resources with absurd values
        const MAX_OFFSET: u32 = 1_000_000;

        let capped_limit = limit.min(MAX_PAGE_SIZE);
        let capped_offset = offset.min(MAX_OFFSET);

        let rows: Vec<MemberWithUserRow> = sqlx::query_as(
            r#"
            SELECT m.id, m.user_id, m.org_id, m.role, m.joined_at,
                   u.email, u.name
            FROM memberships m
            LEFT JOIN users u ON u.id = m.user_id
            WHERE m.org_id = $1
            ORDER BY m.joined_at ASC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(org_id)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn create(&self, membership: MembershipEntity) -> Result<MembershipEntity, AppError> {
        // H-02: Use ON CONFLICT DO UPDATE with no-op SET to always return a row atomically.
        // This prevents a TOCTOU race where a concurrent DELETE between INSERT and SELECT
        // could cause "data inconsistency" errors.
        //
        // The SET id = EXCLUDED.id is a no-op (sets id to what it would have been) which
        // triggers RETURNING without actually changing the existing row.
        let row: MembershipRow = sqlx::query_as(
            r#"
            INSERT INTO memberships (id, user_id, org_id, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, org_id) DO UPDATE SET id = memberships.id
            RETURNING id, user_id, org_id, role, joined_at
            "#,
        )
        .bind(membership.id)
        .bind(membership.user_id)
        .bind(membership.org_id)
        .bind(membership.role.as_str())
        .fetch_one(&self.pool)
        .await
        .map_err(map_sqlx_error)?;

        row.try_into()
    }

    async fn update_role(&self, id: Uuid, role: OrgRole) -> Result<MembershipEntity, AppError> {
        let row: MembershipRow = sqlx::query_as(
            r#"
            UPDATE memberships
            SET role = $2
            WHERE id = $1
            RETURNING id, user_id, org_id, role, joined_at
            "#,
        )
        .bind(id)
        .bind(role.as_str())
        .fetch_one(&self.pool)
        .await
        .map_err(map_sqlx_error)?;

        row.try_into()
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM memberships WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Membership not found".into()));
        }

        Ok(())
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let result = sqlx::query("DELETE FROM memberships WHERE org_id = $1")
            .bind(org_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(result.rows_affected())
    }

    async fn count_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM memberships WHERE org_id = $1")
            .bind(org_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(row.0.max(0) as u64)
    }

    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM memberships WHERE user_id = $1")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(row.0.max(0) as u64)
    }

    async fn count_owners(&self, org_id: Uuid) -> Result<u64, AppError> {
        let row: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM memberships WHERE org_id = $1 AND role = 'owner'")
                .bind(org_id)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(row.0.max(0) as u64)
    }

    async fn update_role_if_not_last_owner(
        &self,
        id: Uuid,
        org_id: Uuid,
        new_role: OrgRole,
    ) -> Result<Option<MembershipEntity>, AppError> {
        // TOCTOU-01: Atomic update using a single query with a subquery check.
        // The WHERE clause ensures we only update if the operation won't leave
        // the org without owners (i.e., either the membership is not an owner,
        // or the new role is still owner, or there are other owners).
        let row: Option<MembershipRow> = sqlx::query_as(
            r#"
            UPDATE memberships
            SET role = $2
            WHERE id = $1
              AND (
                -- Not currently an owner, so safe to change role
                role != 'owner'
                -- New role is still owner, so owner count unchanged
                OR $2 = 'owner'
                -- There are other owners in this org
                OR (SELECT COUNT(*) FROM memberships WHERE org_id = $3 AND role = 'owner' AND id != $1) >= 1
              )
            RETURNING id, user_id, org_id, role, joined_at
            "#,
        )
        .bind(id)
        .bind(new_role.as_str())
        .bind(org_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(map_sqlx_error)?;

        match row {
            Some(r) => Ok(Some(r.try_into()?)),
            None => {
                // Check if membership exists but update was blocked
                let exists = self.find_by_id(id).await?;
                if exists.is_some() {
                    // Membership exists but update blocked - would leave org ownerless
                    Ok(None)
                } else {
                    Err(AppError::NotFound("Membership not found".into()))
                }
            }
        }
    }

    async fn delete_if_not_last_owner(&self, id: Uuid, org_id: Uuid) -> Result<bool, AppError> {
        // TOCTOU-02: Atomic delete using a single query with a subquery check.
        // The WHERE clause ensures we only delete if the operation won't leave
        // the org without owners (i.e., either the membership is not an owner,
        // or there are other owners in the org).
        let result = sqlx::query(
            r#"
            DELETE FROM memberships
            WHERE id = $1
              AND (
                -- Not an owner, so safe to delete
                role != 'owner'
                -- There are other owners in this org
                OR (SELECT COUNT(*) FROM memberships WHERE org_id = $2 AND role = 'owner' AND id != $1) >= 1
              )
            "#,
        )
        .bind(id)
        .bind(org_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        if result.rows_affected() > 0 {
            Ok(true)
        } else {
            // Check if membership exists but delete was blocked
            let exists = self.find_by_id(id).await?;
            if exists.is_some() {
                // Membership exists but delete blocked - would leave org ownerless
                Ok(false)
            } else {
                Err(AppError::NotFound("Membership not found".into()))
            }
        }
    }
}
