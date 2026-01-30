//! PostgreSQL invite repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{normalize_email, InviteEntity, InviteRepository, OrgRole};

/// Map sqlx::Error to AppError for invite-specific constraint violations
fn map_invite_error(e: sqlx::Error) -> AppError {
    match &e {
        sqlx::Error::Database(db_err) => {
            // PostgreSQL unique violation error code is 23505
            if db_err.code().map(|c| c == "23505").unwrap_or(false) {
                // Check constraint name to provide specific error message
                if let Some(constraint) = db_err.constraint() {
                    if constraint.contains("org_email") {
                        return AppError::Validation(
                            "An invite already exists for this email in this organization".into(),
                        );
                    } else if constraint.contains("token") {
                        return AppError::Validation(
                            "Invite token collision - please retry".into(),
                        );
                    }
                }
                return AppError::Validation("Duplicate invite".into());
            }
            AppError::Database(e.to_string())
        }
        sqlx::Error::RowNotFound => AppError::NotFound("Invite not found".into()),
        _ => AppError::Database(e.to_string()),
    }
}

/// PostgreSQL invite repository
pub struct PostgresInviteRepository {
    pool: PgPool,
}

impl PostgresInviteRepository {
    /// Create a new Postgres invite repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for invite queries
#[derive(sqlx::FromRow)]
struct InviteRow {
    id: Uuid,
    org_id: Uuid,
    email: String,
    role: String,
    token_hash: String,
    invited_by: Uuid,
    created_at: DateTime<Utc>,
    expires_at: DateTime<Utc>,
    accepted_at: Option<DateTime<Utc>>,
}

impl TryFrom<InviteRow> for InviteEntity {
    type Error = AppError;

    fn try_from(row: InviteRow) -> Result<Self, Self::Error> {
        let role = OrgRole::from_str(&row.role)
            .ok_or_else(|| AppError::Database(format!("Invalid role: {}", row.role)))?;

        Ok(Self {
            id: row.id,
            org_id: row.org_id,
            email: row.email,
            role,
            token_hash: row.token_hash,
            invited_by: row.invited_by,
            created_at: row.created_at,
            expires_at: row.expires_at,
            accepted_at: row.accepted_at,
        })
    }
}

#[async_trait]
impl InviteRepository for PostgresInviteRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<InviteEntity>, AppError> {
        let row: Option<InviteRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, email, role, token_hash, invited_by, created_at, expires_at, accepted_at
            FROM invites WHERE id = $1
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

    async fn find_by_token_hash(&self, token_hash: &str) -> Result<Option<InviteEntity>, AppError> {
        let row: Option<InviteRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, email, role, token_hash, invited_by, created_at, expires_at, accepted_at
            FROM invites WHERE token_hash = $1
            "#,
        )
        .bind(token_hash)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(r.try_into()?)),
            None => Ok(None),
        }
    }

    async fn find_by_org_and_email(
        &self,
        org_id: Uuid,
        email: &str,
    ) -> Result<Option<InviteEntity>, AppError> {
        // PERF-02: Use direct equality (not LOWER()) since emails are stored normalized.
        // This allows PostgreSQL to use the index on (org_id, email).
        let email_normalized = normalize_email(email);

        let row: Option<InviteRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, email, role, token_hash, invited_by, created_at, expires_at, accepted_at
            FROM invites WHERE org_id = $1 AND email = $2
            "#,
        )
        .bind(org_id)
        .bind(&email_normalized)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(r.try_into()?)),
            None => Ok(None),
        }
    }

    async fn find_pending_by_org(&self, org_id: Uuid) -> Result<Vec<InviteEntity>, AppError> {
        // P-11: Add safety limit to prevent memory bloat from edge cases
        const PENDING_LIMIT: usize = 1000;

        let rows: Vec<InviteRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, email, role, token_hash, invited_by, created_at, expires_at, accepted_at
            FROM invites
            WHERE org_id = $1 AND accepted_at IS NULL AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1000
            "#,
        )
        .bind(org_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        // R-05: Warn when limit is reached (results may be truncated)
        if rows.len() >= PENDING_LIMIT {
            tracing::warn!(
                org_id = %org_id,
                count = rows.len(),
                limit = PENDING_LIMIT,
                "find_pending_by_org hit limit - results may be truncated, use paged variant"
            );
        }

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn find_pending_by_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<InviteEntity>, AppError> {
        // Cap page size to prevent DoS via large limit values
        const MAX_PAGE_SIZE: u32 = 100;
        // L-01: Cap offset to prevent wasted DB resources with absurd values
        const MAX_OFFSET: u32 = 1_000_000;

        let capped_limit = limit.min(MAX_PAGE_SIZE);
        let capped_offset = offset.min(MAX_OFFSET);

        let rows: Vec<InviteRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, email, role, token_hash, invited_by, created_at, expires_at, accepted_at
            FROM invites
            WHERE org_id = $1 AND accepted_at IS NULL AND expires_at > NOW()
            ORDER BY created_at DESC
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

    async fn find_pending_by_email(&self, email: &str) -> Result<Vec<InviteEntity>, AppError> {
        // P-11: Add safety limit to prevent memory bloat from edge cases
        const PENDING_LIMIT: usize = 1000;

        // PERF-02: Use direct equality (not LOWER()) since emails are stored normalized.
        // This allows PostgreSQL to use the index on the email column.
        let email_normalized = normalize_email(email);

        let rows: Vec<InviteRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, email, role, token_hash, invited_by, created_at, expires_at, accepted_at
            FROM invites
            WHERE email = $1 AND accepted_at IS NULL AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1000
            "#,
        )
        .bind(&email_normalized)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        // R-05: Warn when limit is reached (results may be truncated)
        if rows.len() >= PENDING_LIMIT {
            tracing::warn!(
                email = %email,
                count = rows.len(),
                limit = PENDING_LIMIT,
                "find_pending_by_email hit limit - results may be truncated"
            );
        }

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn create(&self, invite: InviteEntity) -> Result<InviteEntity, AppError> {
        let row: InviteRow = sqlx::query_as(
            r#"
            INSERT INTO invites (id, org_id, email, role, token_hash, invited_by, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, org_id, email, role, token_hash, invited_by, created_at, expires_at, accepted_at
            "#,
        )
        .bind(invite.id)
        .bind(invite.org_id)
        .bind(&invite.email)
        .bind(invite.role.as_str())
        .bind(&invite.token_hash)
        .bind(invite.invited_by)
        .bind(invite.expires_at)
        .fetch_one(&self.pool)
        .await
        .map_err(map_invite_error)?;

        row.try_into()
    }

    async fn mark_accepted(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE invites SET accepted_at = NOW() WHERE id = $1 AND accepted_at IS NULL",
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(
                "Invite not found or already accepted".into(),
            ));
        }

        Ok(())
    }

    async fn mark_accepted_if_valid(&self, id: Uuid) -> Result<Option<InviteEntity>, AppError> {
        // Atomically mark as accepted and return the invite in one operation.
        // Uses UPDATE ... WHERE accepted_at IS NULL AND expires_at > NOW() RETURNING
        // to ensure only valid invites are marked.
        let row: Option<InviteRow> = sqlx::query_as(
            r#"
            UPDATE invites
            SET accepted_at = NOW()
            WHERE id = $1 AND accepted_at IS NULL AND expires_at > NOW()
            RETURNING id, org_id, email, role, token_hash, invited_by, created_at, expires_at, accepted_at
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

    async fn unmark_accepted(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query("UPDATE invites SET accepted_at = NULL WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(())
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM invites WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Invite not found".into()));
        }

        Ok(())
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let result = sqlx::query("DELETE FROM invites WHERE org_id = $1")
            .bind(org_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(result.rows_affected())
    }

    async fn delete_expired(&self) -> Result<u64, AppError> {
        let result = sqlx::query("DELETE FROM invites WHERE expires_at < NOW()")
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(result.rows_affected())
    }

    async fn count_pending_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM invites WHERE org_id = $1 AND accepted_at IS NULL AND expires_at > NOW()",
        )
        .bind(org_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(count.max(0) as u64)
    }
}
