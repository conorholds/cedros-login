//! PostgreSQL outbox repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde_json::Value;
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{OutboxEvent, OutboxEventType, OutboxRepository, OutboxStatus};

/// PostgreSQL outbox repository
pub struct PostgresOutboxRepository {
    pool: PgPool,
}

impl PostgresOutboxRepository {
    /// Create a new Postgres outbox repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for outbox queries
#[derive(sqlx::FromRow)]
struct OutboxEventRow {
    id: Uuid,
    event_type: String,
    payload: Value,
    status: String,
    attempts: i32,
    max_attempts: i32,
    next_attempt_at: DateTime<Utc>,
    locked_at: Option<DateTime<Utc>>,
    completed_at: Option<DateTime<Utc>>,
    delivered_at: Option<DateTime<Utc>>,
    last_error: Option<String>,
    correlation_id: Option<String>,
    org_id: Option<Uuid>,
    user_id: Option<Uuid>,
    created_at: DateTime<Utc>,
}

impl TryFrom<OutboxEventRow> for OutboxEvent {
    type Error = AppError;

    fn try_from(row: OutboxEventRow) -> Result<Self, Self::Error> {
        let event_type = parse_event_type(&row.event_type)?;
        let status = parse_status(&row.status)?;

        Ok(Self {
            id: row.id,
            event_type,
            payload: row.payload,
            status,
            attempts: row.attempts as u32,
            max_attempts: row.max_attempts as u32,
            next_attempt_at: row.next_attempt_at,
            locked_at: row.locked_at,
            completed_at: row.completed_at,
            delivered_at: row.delivered_at,
            last_error: row.last_error,
            correlation_id: row.correlation_id,
            org_id: row.org_id,
            user_id: row.user_id,
            created_at: row.created_at,
        })
    }
}

/// Parse event type string from database
fn parse_event_type(s: &str) -> Result<OutboxEventType, AppError> {
    match s {
        "email.verification" => Ok(OutboxEventType::EmailVerification),
        "email.password_reset" => Ok(OutboxEventType::EmailPasswordReset),
        "email.invite" => Ok(OutboxEventType::EmailInvite),
        "email.instant_link" => Ok(OutboxEventType::EmailInstantLink),
        "email.security_alert" => Ok(OutboxEventType::EmailSecurityAlert),
        "email.account_deletion" => Ok(OutboxEventType::EmailAccountDeletion),
        "notify.login_threshold" => Ok(OutboxEventType::NotifyLoginThreshold),
        "notify.token_reuse" => Ok(OutboxEventType::NotifyTokenReuse),
        "notify.role_change" => Ok(OutboxEventType::NotifyRoleChange),
        "notify.owner_transfer" => Ok(OutboxEventType::NotifyOwnerTransfer),
        "notify.admin_action" => Ok(OutboxEventType::NotifyAdminAction),
        _ => Err(AppError::Internal(anyhow::anyhow!(
            "Unknown event type: {s}"
        ))),
    }
}

/// Parse status string from database
fn parse_status(s: &str) -> Result<OutboxStatus, AppError> {
    match s {
        "pending" => Ok(OutboxStatus::Pending),
        "processing" => Ok(OutboxStatus::Processing),
        "done" => Ok(OutboxStatus::Done),
        "failed" => Ok(OutboxStatus::Failed),
        _ => Err(AppError::Internal(anyhow::anyhow!("Unknown status: {s}"))),
    }
}

#[async_trait]
impl OutboxRepository for PostgresOutboxRepository {
    async fn create(&self, event: OutboxEvent) -> Result<OutboxEvent, AppError> {
        let row: OutboxEventRow = sqlx::query_as(
            r#"
            INSERT INTO outbox_events (
                id, event_type, payload, status, attempts, max_attempts,
                next_attempt_at, locked_at, completed_at, delivered_at, last_error,
                correlation_id, org_id, user_id, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id, event_type, payload, status, attempts, max_attempts,
                      next_attempt_at, locked_at, completed_at, delivered_at, last_error,
                      correlation_id, org_id, user_id, created_at
            "#,
        )
        .bind(event.id)
        .bind(event.event_type.as_str())
        .bind(&event.payload)
        .bind(event.status.as_str())
        .bind(event.attempts as i32)
        .bind(event.max_attempts as i32)
        .bind(event.next_attempt_at)
        .bind(event.locked_at)
        .bind(event.completed_at)
        .bind(event.delivered_at)
        .bind(&event.last_error)
        .bind(&event.correlation_id)
        .bind(event.org_id)
        .bind(event.user_id)
        .bind(event.created_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.try_into()
    }

    async fn create_with_tokens(
        &self,
        event: OutboxEvent,
        tokens: &[crate::repositories::VerificationToken],
    ) -> Result<OutboxEvent, AppError> {
        crate::repositories::outbox_repository::validate_token_email(&event, tokens)?;
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        // Serialize issuers for an account, including multi-proof reset emails.
        // This also orders issuance against account deletion/credential changes.
        let user_id = event
            .user_id
            .ok_or_else(|| AppError::Validation("Token email requires a user".into()))?;
        let exists: Option<Uuid> = sqlx::query_scalar(
            "SELECT id FROM users WHERE id = $1 AND cardinality(auth_methods) > 0 FOR UPDATE",
        )
        .bind(user_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        if exists.is_none()
            || tokens.is_empty()
            || tokens.iter().any(|t| t.user_id != user_id || !t.is_valid())
        {
            return Err(AppError::Validation("Invalid token email".into()));
        }
        for token in tokens {
            let subject: Option<Uuid> = sqlx::query_scalar(
                "SELECT id FROM user_emails WHERE id = $1 AND user_id = $2 FOR UPDATE",
            )
            .bind(token.subject_id)
            .bind(user_id)
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
            if subject.is_none() {
                return Err(AppError::Validation(
                    "Token email identity unavailable".into(),
                ));
            }
            sqlx::query(r#"
                INSERT INTO verification_tokens (id, user_id, subject_id, token_hash, token_type, created_at, expires_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (user_id, token_type, (COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::uuid)))
                WHERE used_at IS NULL
                DO UPDATE SET id = EXCLUDED.id, token_hash = EXCLUDED.token_hash,
                    created_at = EXCLUDED.created_at, expires_at = EXCLUDED.expires_at
            "#).bind(token.id).bind(token.user_id).bind(token.subject_id).bind(&token.token_hash)
                .bind(token.token_type.as_str()).bind(token.created_at).bind(token.expires_at)
                .execute(&mut *tx).await.map_err(|e| AppError::Internal(e.into()))?;
        }
        sqlx::query(r#"
            INSERT INTO outbox_events (id, event_type, payload, max_attempts, correlation_id, org_id, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#).bind(event.id).bind(event.event_type.as_str()).bind(&event.payload)
            .bind(event.max_attempts as i32).bind(&event.correlation_id).bind(event.org_id).bind(event.user_id)
            .execute(&mut *tx).await.map_err(|e| AppError::Internal(e.into()))?;
        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(event)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<OutboxEvent>, AppError> {
        let row: Option<OutboxEventRow> = sqlx::query_as(
            r#"
            SELECT id, event_type, payload, status, attempts, max_attempts,
                   next_attempt_at, locked_at, completed_at, delivered_at, last_error,
                   correlation_id, org_id, user_id, created_at
            FROM outbox_events WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(TryInto::try_into).transpose()
    }

    async fn fetch_pending(
        &self,
        limit: u32,
        lock_timeout_secs: u64,
    ) -> Result<Vec<OutboxEvent>, AppError> {
        // Use CTE with FOR UPDATE SKIP LOCKED + UPDATE RETURNING to atomically claim rows.
        // Include stale processing locks to prevent stuck events.
        let rows: Vec<OutboxEventRow> = sqlx::query_as(
            r#"
            WITH claimable AS (
                SELECT id
                FROM outbox_events
                WHERE (
                        status = 'pending'
                        AND next_attempt_at <= NOW()
                        AND (locked_at IS NULL OR locked_at < NOW() - ($2 * INTERVAL '1 second'))
                      )
                   OR (
                        status = 'processing'
                        AND locked_at < NOW() - ($2 * INTERVAL '1 second')
                      )
                ORDER BY next_attempt_at ASC
                LIMIT $1
                FOR UPDATE SKIP LOCKED
            )
            UPDATE outbox_events e
            SET locked_at = NOW()
            FROM claimable c
            WHERE e.id = c.id
            RETURNING e.id, e.event_type, e.payload, e.status, e.attempts, e.max_attempts,
                      e.next_attempt_at, e.locked_at, e.completed_at, e.delivered_at, e.last_error,
                      e.correlation_id, e.org_id, e.user_id, e.created_at
            "#,
        )
        .bind(limit as i32)
        .bind(lock_timeout_secs as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn mark_processing(&self, event: &OutboxEvent) -> Result<bool, AppError> {
        let result = sqlx::query(
            r#"
            UPDATE outbox_events SET status = 'processing', attempts = attempts + 1
            WHERE id = $1 AND locked_at IS NOT DISTINCT FROM $2 AND attempts = $3
                AND status IN ('pending', 'processing') AND delivered_at IS NULL
        "#,
        )
        .bind(event.id)
        .bind(event.locked_at)
        .bind(event.attempts as i32)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(result.rows_affected() == 1)
    }

    async fn mark_done(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE outbox_events
            SET status = 'done',
                locked_at = NULL,
                completed_at = NOW()
            WHERE id = $1 AND delivered_at IS NOT NULL
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn mark_delivered(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE outbox_events
            SET delivered_at = NOW()
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn mark_delivered_with_receipt(
        &self,
        id: Uuid,
        provider_message_id: Option<&str>,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE outbox_events
            SET delivered_at = NOW(),
                provider_message_id = $2
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(provider_message_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn mark_retry(&self, event: &OutboxEvent, error: &str) -> Result<(), AppError> {
        // Calculate next_attempt directly in SQL to avoid extra SELECT query
        // Backoff schedule: 30s, 2m, 10m, 30m, 1h, 2h, 4h, 8h, 16h, 24h
        // Auto-fail events that have exceeded max_attempts
        sqlx::query(
            r#"
            UPDATE outbox_events
            SET status = CASE
                    WHEN attempts >= max_attempts THEN 'failed'
                    ELSE 'pending'
                END,
                locked_at = NULL,
                last_error = $2,
                completed_at = CASE
                    WHEN attempts >= max_attempts THEN NOW()
                    ELSE completed_at
                END,
                next_attempt_at = CASE
                    WHEN attempts >= max_attempts THEN next_attempt_at
                    ELSE NOW() + INTERVAL '1 second' *
                        CASE GREATEST(attempts - 1, 0)
                            WHEN 0 THEN 30
                            WHEN 1 THEN 120
                            WHEN 2 THEN 600
                            WHEN 3 THEN 1800
                            WHEN 4 THEN 3600
                            WHEN 5 THEN 7200
                            WHEN 6 THEN 14400
                            WHEN 7 THEN 28800
                            WHEN 8 THEN 57600
                            ELSE 86400
                        END
                END
            WHERE id = $1 AND status = 'processing' AND delivered_at IS NULL
                AND locked_at IS NOT DISTINCT FROM $3 AND attempts = $4
            "#,
        )
        .bind(event.id)
        .bind(error)
        .bind(event.locked_at)
        .bind(event.attempts.saturating_add(1) as i32)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn mark_failed(&self, event: &OutboxEvent, error: &str) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE outbox_events
            SET status = 'failed',
                locked_at = NULL,
                last_error = $2,
                completed_at = NOW()
            WHERE id = $1 AND status = 'processing' AND delivered_at IS NULL
                AND locked_at IS NOT DISTINCT FROM $3 AND attempts = $4
            "#,
        )
        .bind(event.id)
        .bind(error)
        .bind(event.locked_at)
        .bind(event.attempts.saturating_add(1) as i32)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn cleanup_old(&self, older_than: DateTime<Utc>) -> Result<u64, AppError> {
        let result = sqlx::query(
            r#"
            DELETE FROM outbox_events
            WHERE status IN ('done', 'failed') AND created_at < $1
            "#,
        )
        .bind(older_than)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }

    async fn count_pending(&self) -> Result<u64, AppError> {
        let count: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM outbox_events WHERE status = 'pending'")
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.0.max(0) as u64)
    }

    async fn count_failed(&self) -> Result<u64, AppError> {
        let count: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM outbox_events WHERE status = 'failed'")
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.0.max(0) as u64)
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let result = sqlx::query("DELETE FROM outbox_events WHERE org_id = $1")
            .bind(org_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }
}
