//! PostgreSQL audit log repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde_json::Value;
use sqlx::{PgPool, Postgres, QueryBuilder};
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::pagination::{cap_limit, cap_offset};

#[cfg(test)]
use crate::repositories::pagination::{DEFAULT_MAX_OFFSET, DEFAULT_MAX_PAGE_SIZE};
use crate::repositories::{AuditEventType, AuditLogEntry, AuditLogQuery, AuditLogRepository};

/// PostgreSQL audit log repository
pub struct PostgresAuditLogRepository {
    pool: PgPool,
}

impl PostgresAuditLogRepository {
    /// Create a new Postgres audit log repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for audit log queries
#[derive(sqlx::FromRow)]
struct AuditLogRow {
    id: Uuid,
    event_type: String,
    actor_user_id: Option<Uuid>,
    /// S-23: Session ID for forensic correlation
    session_id: Option<Uuid>,
    org_id: Option<Uuid>,
    target_type: Option<String>,
    target_id: Option<Uuid>,
    ip_address: Option<String>,
    user_agent: Option<String>,
    metadata: Value,
    created_at: DateTime<Utc>,
}

impl TryFrom<AuditLogRow> for AuditLogEntry {
    type Error = AppError;

    fn try_from(row: AuditLogRow) -> Result<Self, Self::Error> {
        let event_type = AuditEventType::from_str(&row.event_type)
            .ok_or_else(|| AppError::Database(format!("Invalid event type: {}", row.event_type)))?;

        Ok(Self {
            id: row.id,
            event_type,
            actor_user_id: row.actor_user_id,
            session_id: row.session_id,
            org_id: row.org_id,
            target_type: row.target_type,
            target_id: row.target_id,
            ip_address: row.ip_address,
            user_agent: row.user_agent,
            metadata: row.metadata,
            created_at: row.created_at,
        })
    }
}

fn cap_pagination_values(query: &AuditLogQuery) -> (i64, i64) {
    let limit = cap_limit(query.limit.unwrap_or(100)) as i64;
    let offset = cap_offset(query.offset.unwrap_or(0)) as i64;
    (limit, offset)
}

/// Appends WHERE conditions to a query builder based on AuditLogQuery filters.
fn append_where_conditions<'a>(builder: &mut QueryBuilder<'a, Postgres>, query: &'a AuditLogQuery) {
    let mut has_condition = false;

    if let Some(ref org_id) = query.org_id {
        builder.push(if has_condition { " AND " } else { " WHERE " });
        builder.push("org_id = ").push_bind(*org_id);
        has_condition = true;
    }

    if let Some(ref actor_id) = query.actor_user_id {
        builder.push(if has_condition { " AND " } else { " WHERE " });
        builder.push("actor_user_id = ").push_bind(*actor_id);
        has_condition = true;
    }

    if let Some(ref event_type) = query.event_type {
        builder.push(if has_condition { " AND " } else { " WHERE " });
        builder.push("event_type = ").push_bind(event_type.as_str());
        has_condition = true;
    }

    // Target filtering leverages idx_audit_logs_target index
    if let Some(ref target_type) = query.target_type {
        builder.push(if has_condition { " AND " } else { " WHERE " });
        builder
            .push("target_type = ")
            .push_bind(target_type.clone());
        has_condition = true;
    }

    if let Some(ref target_id) = query.target_id {
        builder.push(if has_condition { " AND " } else { " WHERE " });
        builder.push("target_id = ").push_bind(*target_id);
        has_condition = true;
    }

    // S-23: Filter by session_id for forensic correlation
    if let Some(ref session_id) = query.session_id {
        builder.push(if has_condition { " AND " } else { " WHERE " });
        builder.push("session_id = ").push_bind(*session_id);
        // MAINT-01: Keep query builder state consistent; currently this is the final
        // condition, but setting this prevents future edits from accidentally
        // producing invalid SQL when new conditions are appended.
        #[allow(unused_assignments)]
        {
            has_condition = true;
        }
    }
}

#[async_trait]
impl AuditLogRepository for PostgresAuditLogRepository {
    async fn create(&self, entry: AuditLogEntry) -> Result<AuditLogEntry, AppError> {
        let row: AuditLogRow = sqlx::query_as(
            r#"
            INSERT INTO audit_logs (id, event_type, actor_user_id, session_id, org_id, target_type, target_id, ip_address, user_agent, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, event_type, actor_user_id, session_id, org_id, target_type, target_id, ip_address, user_agent, metadata, created_at
            "#,
        )
        .bind(entry.id)
        .bind(entry.event_type.as_str())
        .bind(entry.actor_user_id)
        .bind(entry.session_id)
        .bind(entry.org_id)
        .bind(&entry.target_type)
        .bind(entry.target_id)
        .bind(&entry.ip_address)
        .bind(&entry.user_agent)
        .bind(&entry.metadata)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        row.try_into()
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<AuditLogEntry>, AppError> {
        let row: Option<AuditLogRow> = sqlx::query_as(
            r#"
            SELECT id, event_type, actor_user_id, session_id, org_id, target_type, target_id, ip_address, user_agent, metadata, created_at
            FROM audit_logs WHERE id = $1
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

    async fn query(&self, query: AuditLogQuery) -> Result<Vec<AuditLogEntry>, AppError> {
        let (limit, offset) = cap_pagination_values(&query);

        let mut builder: QueryBuilder<Postgres> = QueryBuilder::new(
            "SELECT id, event_type, actor_user_id, session_id, org_id, target_type, target_id, ip_address, user_agent, metadata, created_at FROM audit_logs",
        );
        append_where_conditions(&mut builder, &query);
        builder.push(" ORDER BY created_at DESC LIMIT ");
        builder.push_bind(limit);
        builder.push(" OFFSET ");
        builder.push_bind(offset);

        let rows: Vec<AuditLogRow> = builder
            .build_query_as()
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn count(&self, query: AuditLogQuery) -> Result<u64, AppError> {
        let mut builder: QueryBuilder<Postgres> =
            QueryBuilder::new("SELECT COUNT(*) FROM audit_logs");
        append_where_conditions(&mut builder, &query);

        let count: (i64,) = builder
            .build_query_as()
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(count.0.max(0) as u64)
    }

    async fn query_with_count(
        &self,
        query: AuditLogQuery,
    ) -> Result<(Vec<AuditLogEntry>, u64), AppError> {
        // P-02: Use CTE with window function to get results + count in one query
        // This halves the database roundtrips for paginated audit log queries
        let (limit, offset) = cap_pagination_values(&query);

        let mut builder: QueryBuilder<Postgres> = QueryBuilder::new(
            r#"WITH filtered AS (
                SELECT id, event_type, actor_user_id, session_id, org_id,
                       target_type, target_id, ip_address, user_agent, metadata, created_at,
                       COUNT(*) OVER() as total_count
                FROM audit_logs"#,
        );
        append_where_conditions(&mut builder, &query);
        builder.push(
            r#"
            )
            SELECT id, event_type, actor_user_id, session_id, org_id,
                   target_type, target_id, ip_address, user_agent, metadata, created_at,
                   total_count
            FROM filtered
            ORDER BY created_at DESC
            LIMIT "#,
        );
        builder.push_bind(limit);
        builder.push(" OFFSET ");
        builder.push_bind(offset);

        #[derive(sqlx::FromRow)]
        struct AuditLogRowWithCount {
            id: Uuid,
            event_type: String,
            actor_user_id: Option<Uuid>,
            session_id: Option<Uuid>,
            org_id: Option<Uuid>,
            target_type: Option<String>,
            target_id: Option<Uuid>,
            ip_address: Option<String>,
            user_agent: Option<String>,
            metadata: Value,
            created_at: DateTime<Utc>,
            total_count: i64,
        }

        let rows: Vec<AuditLogRowWithCount> = builder
            .build_query_as()
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        // Extract total from first row (all rows have the same count)
        let total = rows
            .first()
            .map(|r| r.total_count.max(0) as u64)
            .unwrap_or(0);

        // Convert to entries
        let entries: Result<Vec<AuditLogEntry>, AppError> = rows
            .into_iter()
            .map(|row| {
                let event_type = AuditEventType::from_str(&row.event_type).ok_or_else(|| {
                    AppError::Database(format!("Invalid event type: {}", row.event_type))
                })?;
                Ok(AuditLogEntry {
                    id: row.id,
                    event_type,
                    actor_user_id: row.actor_user_id,
                    session_id: row.session_id,
                    org_id: row.org_id,
                    target_type: row.target_type,
                    target_id: row.target_id,
                    ip_address: row.ip_address,
                    user_agent: row.user_agent,
                    metadata: row.metadata,
                    created_at: row.created_at,
                })
            })
            .collect();

        Ok((entries?, total))
    }

    async fn delete_older_than(&self, date: DateTime<Utc>) -> Result<u64, AppError> {
        let result = sqlx::query("DELETE FROM audit_logs WHERE created_at < $1")
            .bind(date)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(result.rows_affected())
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let result = sqlx::query("DELETE FROM audit_logs WHERE org_id = $1")
            .bind(org_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(result.rows_affected())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cap_pagination_values_defaults() {
        let q = AuditLogQuery::default();
        let (limit, offset) = cap_pagination_values(&q);
        assert_eq!(limit, DEFAULT_MAX_PAGE_SIZE as i64);
        assert_eq!(offset, 0);
    }

    #[test]
    fn test_cap_pagination_values_caps() {
        let q = AuditLogQuery {
            limit: Some(DEFAULT_MAX_PAGE_SIZE + 1),
            offset: Some(DEFAULT_MAX_OFFSET + 1),
            ..Default::default()
        };
        let (limit, offset) = cap_pagination_values(&q);
        assert_eq!(limit, DEFAULT_MAX_PAGE_SIZE as i64);
        assert_eq!(offset, DEFAULT_MAX_OFFSET as i64);
    }
}
