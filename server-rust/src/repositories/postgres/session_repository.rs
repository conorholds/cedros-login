//! PostgreSQL session repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{SessionEntity, SessionRepository};

/// PostgreSQL session repository
pub struct PostgresSessionRepository {
    pool: PgPool,
}

impl PostgresSessionRepository {
    /// Create a new Postgres session repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for session queries (ip_address stored as TEXT)
#[derive(sqlx::FromRow)]
struct SessionRow {
    id: Uuid,
    user_id: Uuid,
    refresh_token_hash: String,
    ip_address: Option<String>,
    user_agent: Option<String>,
    created_at: DateTime<Utc>,
    expires_at: DateTime<Utc>,
    revoked_at: Option<DateTime<Utc>>,
    revoked_reason: Option<String>,
    last_strong_auth_at: Option<DateTime<Utc>>,
}

impl From<SessionRow> for SessionEntity {
    fn from(row: SessionRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            refresh_token_hash: row.refresh_token_hash,
            ip_address: row.ip_address,
            user_agent: row.user_agent,
            created_at: row.created_at,
            expires_at: row.expires_at,
            revoked_at: row.revoked_at,
            revoked_reason: row.revoked_reason,
            last_strong_auth_at: row.last_strong_auth_at,
        }
    }
}

#[async_trait]
impl SessionRepository for PostgresSessionRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<SessionEntity>, AppError> {
        let row: Option<SessionRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, refresh_token_hash, ip_address, user_agent,
                   created_at, expires_at, revoked_at, revoked_reason, last_strong_auth_at
            FROM sessions WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_refresh_token(&self, hash: &str) -> Result<Option<SessionEntity>, AppError> {
        let row: Option<SessionRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, refresh_token_hash, ip_address, user_agent,
                   created_at, expires_at, revoked_at, revoked_reason, last_strong_auth_at
            FROM sessions WHERE refresh_token_hash = $1
            "#,
        )
        .bind(hash)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<SessionEntity>, AppError> {
        // Limit to 100 sessions per user to prevent memory exhaustion
        // A user with more sessions should revoke old ones
        const MAX_SESSIONS_PER_USER: i32 = 100;

        let rows: Vec<SessionRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, refresh_token_hash, ip_address, user_agent,
                   created_at, expires_at, revoked_at, revoked_reason, last_strong_auth_at
            FROM sessions WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
            "#,
        )
        .bind(user_id)
        .bind(MAX_SESSIONS_PER_USER)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_active_by_user_id(&self, user_id: Uuid) -> Result<Vec<SessionEntity>, AppError> {
        // Limit to 100 sessions per user to prevent memory exhaustion
        const MAX_SESSIONS_PER_USER: i32 = 100;

        let rows: Vec<SessionRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, refresh_token_hash, ip_address, user_agent,
                   created_at, expires_at, revoked_at, revoked_reason, last_strong_auth_at
            FROM sessions
            WHERE user_id = $1
              AND revoked_at IS NULL
              AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT $2
            "#,
        )
        .bind(user_id)
        .bind(MAX_SESSIONS_PER_USER)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_active_by_user_id_paged(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<SessionEntity>, AppError> {
        // Cap page size to prevent DoS via large limit values
        const MAX_PAGE_SIZE: u32 = 100;
        // L-01: Cap offset to prevent wasted DB resources with absurd values
        const MAX_OFFSET: u32 = 1_000_000;

        let capped_limit = limit.min(MAX_PAGE_SIZE);
        let capped_offset = offset.min(MAX_OFFSET);

        let rows: Vec<SessionRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, refresh_token_hash, ip_address, user_agent,
                   created_at, expires_at, revoked_at, revoked_reason, last_strong_auth_at
            FROM sessions
            WHERE user_id = $1
              AND revoked_at IS NULL
              AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(user_id)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_active_by_user_id(&self, user_id: Uuid) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*) FROM sessions
            WHERE user_id = $1
              AND revoked_at IS NULL
              AND expires_at > NOW()
            "#,
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    async fn find_recent_by_user_id(
        &self,
        user_id: Uuid,
        limit: u32,
    ) -> Result<Vec<SessionEntity>, AppError> {
        // BUG-004: Cap limit to prevent memory exhaustion with large values
        const MAX_PAGE_SIZE: u32 = 100;
        let capped_limit = limit.min(MAX_PAGE_SIZE);

        let rows: Vec<SessionRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, refresh_token_hash, ip_address, user_agent,
                   created_at, expires_at, revoked_at, revoked_reason, last_strong_auth_at
            FROM sessions
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
            "#,
        )
        .bind(user_id)
        .bind(capped_limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn create(&self, session: SessionEntity) -> Result<SessionEntity, AppError> {
        let row: SessionRow = sqlx::query_as(
            r#"
            INSERT INTO sessions (id, user_id, refresh_token_hash, ip_address, user_agent,
                                 created_at, expires_at, revoked_at, revoked_reason, last_strong_auth_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, user_id, refresh_token_hash, ip_address, user_agent,
                      created_at, expires_at, revoked_at, revoked_reason, last_strong_auth_at
            "#,
        )
        .bind(session.id)
        .bind(session.user_id)
        .bind(&session.refresh_token_hash)
        .bind(&session.ip_address)
        .bind(&session.user_agent)
        .bind(session.created_at)
        .bind(session.expires_at)
        .bind(session.revoked_at)
        .bind(&session.revoked_reason)
        .bind(session.last_strong_auth_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn update(&self, session: SessionEntity) -> Result<SessionEntity, AppError> {
        let row: SessionRow = sqlx::query_as(
            r#"
            UPDATE sessions SET
                refresh_token_hash = $2,
                ip_address = $3,
                user_agent = $4,
                expires_at = $5,
                revoked_at = $6,
                revoked_reason = $7,
                last_strong_auth_at = $8
            WHERE id = $1
            RETURNING id, user_id, refresh_token_hash, ip_address, user_agent,
                      created_at, expires_at, revoked_at, revoked_reason, last_strong_auth_at
            "#,
        )
        .bind(session.id)
        .bind(&session.refresh_token_hash)
        .bind(&session.ip_address)
        .bind(&session.user_agent)
        .bind(session.expires_at)
        .bind(session.revoked_at)
        .bind(&session.revoked_reason)
        .bind(session.last_strong_auth_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn revoke(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE sessions SET revoked_at = NOW(), revoked_reason = 'unspecified' WHERE id = $1",
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Session not found".into()));
        }

        Ok(())
    }

    async fn revoke_if_valid(&self, id: Uuid) -> Result<bool, AppError> {
        // Atomic revocation: only update if not already revoked
        // This prevents race conditions where two concurrent requests
        // could both see the session as valid and proceed to use it
        let result = sqlx::query(
            "UPDATE sessions SET revoked_at = NOW(), revoked_reason = 'unspecified' WHERE id = $1 AND revoked_at IS NULL",
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        // If rows_affected == 1, we successfully revoked it
        // If rows_affected == 0, it was already revoked (race condition detected)
        Ok(result.rows_affected() == 1)
    }

    async fn revoke_with_reason(&self, id: Uuid, reason: &str) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE sessions SET revoked_at = NOW(), revoked_reason = $2 WHERE id = $1",
        )
        .bind(id)
        .bind(reason)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Session not found".into()));
        }
        Ok(())
    }

    async fn revoke_if_valid_with_reason(&self, id: Uuid, reason: &str) -> Result<bool, AppError> {
        let result = sqlx::query(
            "UPDATE sessions SET revoked_at = NOW(), revoked_reason = $2 WHERE id = $1 AND revoked_at IS NULL",
        )
        .bind(id)
        .bind(reason)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected() == 1)
    }

    async fn revoke_all_except(
        &self,
        user_id: Uuid,
        keep_session_id: Uuid,
    ) -> Result<u64, AppError> {
        let result = sqlx::query(
            r#"
            UPDATE sessions
            SET revoked_at = NOW(),
                revoked_reason = 'user_revoke_other_sessions'
            WHERE user_id = $1
              AND id != $2
              AND revoked_at IS NULL
              AND expires_at > NOW()
            "#,
        )
        .bind(user_id)
        .bind(keep_session_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }

    async fn revoke_all_for_user(&self, user_id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE sessions SET revoked_at = NOW(), revoked_reason = 'unspecified' WHERE user_id = $1 AND revoked_at IS NULL",
        )
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn revoke_all_for_user_with_reason(
        &self,
        user_id: Uuid,
        reason: &str,
    ) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE sessions SET revoked_at = NOW(), revoked_reason = $2 WHERE user_id = $1 AND revoked_at IS NULL",
        )
        .bind(user_id)
        .bind(reason)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn is_revoked(&self, id: Uuid) -> Result<bool, AppError> {
        let revoked: Option<bool> =
            sqlx::query_scalar("SELECT revoked_at IS NOT NULL FROM sessions WHERE id = $1")
                .bind(id)
                .fetch_optional(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        // If session not found, treat as revoked
        Ok(revoked.unwrap_or(true))
    }

    async fn delete_expired(&self) -> Result<u64, AppError> {
        let result = sqlx::query("DELETE FROM sessions WHERE expires_at < NOW()")
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }

    async fn revoke_oldest_active_sessions(
        &self,
        user_id: Uuid,
        keep_count: u32,
    ) -> Result<u64, AppError> {
        // H-05: Revoke oldest active sessions beyond the keep_count limit.
        // This uses a CTE to identify sessions to revoke (all active sessions
        // except the N most recent), then updates them in a single query.
        let result = sqlx::query(
            r#"
            WITH sessions_to_revoke AS (
                SELECT id
                FROM sessions
                WHERE user_id = $1
                  AND revoked_at IS NULL
                  AND expires_at > NOW()
                ORDER BY created_at DESC
                OFFSET $2
            )
            UPDATE sessions
            SET revoked_at = NOW(),
                revoked_reason = 'session_limit'
            FROM sessions_to_revoke
            WHERE sessions.id = sessions_to_revoke.id
            "#,
        )
        .bind(user_id)
        .bind(keep_count as i64)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }

    async fn update_strong_auth_at(&self, id: Uuid) -> Result<(), AppError> {
        // L-01: Check rows_affected to detect stale session IDs
        let result = sqlx::query("UPDATE sessions SET last_strong_auth_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Session not found".into()));
        }

        Ok(())
    }
}
