//! PostgreSQL login attempt repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    normalize_email, LockoutStatus, LoginAttemptConfig, LoginAttemptRepository,
};

/// PostgreSQL login attempt repository
pub struct PostgresLoginAttemptRepository {
    pool: PgPool,
}

impl PostgresLoginAttemptRepository {
    /// Create a new Postgres login attempt repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl LoginAttemptRepository for PostgresLoginAttemptRepository {
    async fn record_attempt(
        &self,
        user_id: Option<Uuid>,
        email: &str,
        ip_address: Option<&str>,
        successful: bool,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO login_attempts (id, user_id, email, ip_address, successful, attempted_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(user_id)
        .bind(normalize_email(email))
        .bind(ip_address)
        .bind(successful)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn get_lockout_status(
        &self,
        email: &str,
        config: &LoginAttemptConfig,
    ) -> Result<LockoutStatus, AppError> {
        let now = Utc::now();
        let window_start = now - Duration::minutes(config.window_minutes as i64);

        // R-03: Use lower(email) to match idx_login_attempts_lockout index
        let row: Option<(i64, Option<DateTime<Utc>>)> = sqlx::query_as(
            r#"
            SELECT COUNT(*) as failed_count, MAX(attempted_at) as last_failed
            FROM login_attempts
            WHERE lower(email) = $1
              AND successful = FALSE
              AND attempted_at > $2
            "#,
        )
        .bind(normalize_email(email))
        .bind(window_start)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let (failed_attempts, last_failed) = row.unwrap_or((0, None));
        let failed_attempts = failed_attempts as u32;

        if failed_attempts >= config.max_attempts {
            if let Some(last_failed) = last_failed {
                let lockout_expires_at =
                    last_failed + Duration::minutes(config.lockout_minutes as i64);
                if lockout_expires_at > now {
                    let remaining = (lockout_expires_at - now).num_seconds();
                    return Ok(LockoutStatus {
                        is_locked: true,
                        failed_attempts,
                        lockout_expires_at: Some(lockout_expires_at),
                        lockout_remaining_secs: Some(remaining),
                    });
                }
            }
        }

        Ok(LockoutStatus {
            is_locked: false,
            failed_attempts,
            lockout_expires_at: None,
            lockout_remaining_secs: None,
        })
    }

    async fn clear_failed_attempts(&self, email: &str) -> Result<(), AppError> {
        // R-03: Use lower(email) to match idx_login_attempts_lockout index
        sqlx::query(
            r#"
            DELETE FROM login_attempts
            WHERE lower(email) = $1 AND successful = FALSE
            "#,
        )
        .bind(normalize_email(email))
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn cleanup_old_records(&self, older_than: DateTime<Utc>) -> Result<u64, AppError> {
        let result = sqlx::query(
            r#"
            DELETE FROM login_attempts
            WHERE attempted_at < $1
            "#,
        )
        .bind(older_than)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }

    async fn record_failed_attempt_atomic(
        &self,
        user_id: Option<Uuid>,
        email: &str,
        ip_address: Option<&str>,
        config: &LoginAttemptConfig,
    ) -> Result<LockoutStatus, AppError> {
        let now = Utc::now();
        let window_start = now - Duration::minutes(config.window_minutes as i64);
        let email_normalized = normalize_email(email);

        // Use a CTE to insert and count atomically in one query
        // This prevents race conditions by doing INSERT + SELECT in single statement
        // R-03: Use lower(email) to match idx_login_attempts_lockout index
        let row: (i64, Option<DateTime<Utc>>) = sqlx::query_as(
            r#"
            WITH inserted AS (
                INSERT INTO login_attempts (id, user_id, email, ip_address, successful, attempted_at)
                VALUES ($1, $2, $3, $4, FALSE, NOW())
            )
            SELECT COUNT(*) as failed_count, MAX(attempted_at) as last_failed
            FROM login_attempts
            WHERE lower(email) = $3
              AND successful = FALSE
              AND attempted_at > $5
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(user_id)
        .bind(&email_normalized)
        .bind(ip_address)
        .bind(window_start)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let (failed_count, last_failed) = row;
        let failed_attempts = failed_count as u32;

        if failed_attempts >= config.max_attempts {
            if let Some(last_failed) = last_failed {
                let lockout_expires_at =
                    last_failed + Duration::minutes(config.lockout_minutes as i64);
                if lockout_expires_at > now {
                    let remaining = (lockout_expires_at - now).num_seconds();
                    return Ok(LockoutStatus {
                        is_locked: true,
                        failed_attempts,
                        lockout_expires_at: Some(lockout_expires_at),
                        lockout_remaining_secs: Some(remaining),
                    });
                }
            }
        }

        Ok(LockoutStatus {
            is_locked: false,
            failed_attempts,
            lockout_expires_at: None,
            lockout_remaining_secs: None,
        })
    }
}
