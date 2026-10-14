use super::{AutosaveProblem, DEFAULT_IDEMPOTENCY_TTL_SECS};
#[cfg(feature = "postgres")]
use chrono::{Duration as ChronoDuration, Utc};
#[cfg(feature = "postgres")]
use serde::{de::DeserializeOwned, Serialize};
use std::{
    collections::HashMap,
    sync::Mutex,
    time::{Duration, Instant},
};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct AutosaveIdempotencyScope {
    pub tenant_id: String,
    pub user_id: String,
    pub resource_type: String,
    pub resource_id: String,
    pub operation: String,
    pub key: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AutosaveIdempotencyDecision<ResultBody> {
    Start,
    Replay(ResultBody),
}

#[derive(Debug, Clone)]
enum AutosaveIdempotencyState<ResultBody> {
    InProgress,
    Completed(ResultBody),
}

#[derive(Debug, Clone)]
struct AutosaveIdempotencyRecord<ResultBody> {
    fingerprint: String,
    expires_at: Instant,
    state: AutosaveIdempotencyState<ResultBody>,
}

#[derive(Debug)]
pub struct AutosaveIdempotencyLedger<ResultBody> {
    ttl: Duration,
    records: Mutex<HashMap<AutosaveIdempotencyScope, AutosaveIdempotencyRecord<ResultBody>>>,
}

impl<ResultBody: Clone> AutosaveIdempotencyLedger<ResultBody> {
    pub fn new(ttl: Duration) -> Self {
        Self {
            ttl,
            records: Mutex::new(HashMap::new()),
        }
    }

    pub fn begin(
        &self,
        scope: AutosaveIdempotencyScope,
        fingerprint: String,
    ) -> Result<AutosaveIdempotencyDecision<ResultBody>, AutosaveProblem> {
        let mut records = self.records.lock().expect("idempotency ledger poisoned");
        prune_expired(&mut records);

        if let Some(record) = records.get(&scope) {
            if record.fingerprint != fingerprint {
                return Err(AutosaveProblem::invalid_patch(
                    "Idempotency key was reused with a different autosave payload.",
                ));
            }

            return match &record.state {
                AutosaveIdempotencyState::InProgress => Err(AutosaveProblem::in_progress()),
                AutosaveIdempotencyState::Completed(result) => {
                    Ok(AutosaveIdempotencyDecision::Replay(result.clone()))
                }
            };
        }

        records.insert(
            scope,
            AutosaveIdempotencyRecord {
                fingerprint,
                expires_at: Instant::now() + self.ttl,
                state: AutosaveIdempotencyState::InProgress,
            },
        );

        Ok(AutosaveIdempotencyDecision::Start)
    }

    pub fn complete(
        &self,
        scope: &AutosaveIdempotencyScope,
        fingerprint: &str,
        result: ResultBody,
    ) -> Result<(), AutosaveProblem> {
        let mut records = self.records.lock().expect("idempotency ledger poisoned");
        let record = records
            .get_mut(scope)
            .ok_or_else(|| AutosaveProblem::malformed("Unknown idempotency key."))?;

        if record.fingerprint != fingerprint {
            return Err(AutosaveProblem::invalid_patch(
                "Completed autosave fingerprint does not match the started mutation.",
            ));
        }

        record.state = AutosaveIdempotencyState::Completed(result);
        record.expires_at = Instant::now() + self.ttl;
        Ok(())
    }

    pub fn abort(
        &self,
        scope: &AutosaveIdempotencyScope,
        fingerprint: &str,
    ) -> Result<(), AutosaveProblem> {
        let mut records = self.records.lock().expect("idempotency ledger poisoned");
        let should_remove = records
            .get(scope)
            .map(|record| record.fingerprint == fingerprint)
            .unwrap_or(false);
        if should_remove {
            records.remove(scope);
        }
        Ok(())
    }
}

impl<ResultBody: Clone> Default for AutosaveIdempotencyLedger<ResultBody> {
    fn default() -> Self {
        Self::new(Duration::from_secs(DEFAULT_IDEMPOTENCY_TTL_SECS))
    }
}

fn prune_expired<ResultBody>(
    records: &mut HashMap<AutosaveIdempotencyScope, AutosaveIdempotencyRecord<ResultBody>>,
) {
    let now = Instant::now();
    records.retain(|_, record| record.expires_at > now);
}

#[cfg(feature = "postgres")]
pub async fn postgres_begin<ResultBody: Clone + DeserializeOwned>(
    pool: &sqlx::PgPool,
    scope: &AutosaveIdempotencyScope,
    fingerprint: &str,
) -> Result<AutosaveIdempotencyDecision<ResultBody>, AutosaveProblem> {
    prune_postgres_expired(pool).await?;

    let expires_at = Utc::now() + ChronoDuration::seconds(DEFAULT_IDEMPOTENCY_TTL_SECS as i64);
    let inserted: Option<i32> = sqlx::query_scalar(
        r#"
        INSERT INTO autosave_idempotency_keys (
            tenant_id,
            user_id,
            resource_type,
            resource_id,
            operation,
            idempotency_key,
            fingerprint,
            status,
            expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'in_progress', $8)
        ON CONFLICT DO NOTHING
        RETURNING 1
        "#,
    )
    .bind(&scope.tenant_id)
    .bind(&scope.user_id)
    .bind(&scope.resource_type)
    .bind(&scope.resource_id)
    .bind(&scope.operation)
    .bind(&scope.key)
    .bind(fingerprint)
    .bind(expires_at)
    .fetch_optional(pool)
    .await
    .map_err(idempotency_storage_error)?;

    if inserted.is_some() {
        return Ok(AutosaveIdempotencyDecision::Start);
    }

    let row = sqlx::query_as::<_, PostgresIdempotencyRow>(
        r#"
        SELECT fingerprint, status, response_json
        FROM autosave_idempotency_keys
        WHERE tenant_id = $1
          AND user_id = $2
          AND resource_type = $3
          AND resource_id = $4
          AND operation = $5
          AND idempotency_key = $6
        "#,
    )
    .bind(&scope.tenant_id)
    .bind(&scope.user_id)
    .bind(&scope.resource_type)
    .bind(&scope.resource_id)
    .bind(&scope.operation)
    .bind(&scope.key)
    .fetch_optional(pool)
    .await
    .map_err(idempotency_storage_error)?
    .ok_or_else(|| AutosaveProblem::server_error("Idempotency key disappeared during lookup."))?;

    if row.fingerprint != fingerprint {
        return Err(AutosaveProblem::invalid_patch(
            "Idempotency key was reused with a different autosave payload.",
        ));
    }
    if row.status == "in_progress" {
        return Err(AutosaveProblem::in_progress());
    }

    let response_json = row
        .response_json
        .ok_or_else(|| AutosaveProblem::server_error("Completed idempotency key has no result."))?;
    let result = serde_json::from_value(response_json)
        .map_err(|_| AutosaveProblem::server_error("Stored idempotency result is invalid."))?;
    Ok(AutosaveIdempotencyDecision::Replay(result))
}

#[cfg(feature = "postgres")]
pub async fn postgres_complete<ResultBody: Serialize>(
    pool: &sqlx::PgPool,
    scope: &AutosaveIdempotencyScope,
    fingerprint: &str,
    result: &ResultBody,
) -> Result<(), AutosaveProblem> {
    let response_json = serde_json::to_value(result)
        .map_err(|_| AutosaveProblem::server_error("Autosave result is not serializable."))?;
    let updated = sqlx::query(
        r#"
        UPDATE autosave_idempotency_keys
        SET status = 'completed',
            response_json = $8,
            updated_at = NOW()
        WHERE tenant_id = $1
          AND user_id = $2
          AND resource_type = $3
          AND resource_id = $4
          AND operation = $5
          AND idempotency_key = $6
          AND fingerprint = $7
        "#,
    )
    .bind(&scope.tenant_id)
    .bind(&scope.user_id)
    .bind(&scope.resource_type)
    .bind(&scope.resource_id)
    .bind(&scope.operation)
    .bind(&scope.key)
    .bind(fingerprint)
    .bind(response_json)
    .execute(pool)
    .await
    .map_err(idempotency_storage_error)?;

    if updated.rows_affected() == 0 {
        return Err(AutosaveProblem::server_error(
            "Unable to complete autosave idempotency key.",
        ));
    }
    Ok(())
}

#[cfg(feature = "postgres")]
pub async fn postgres_abort(
    pool: &sqlx::PgPool,
    scope: &AutosaveIdempotencyScope,
    fingerprint: &str,
) -> Result<(), AutosaveProblem> {
    sqlx::query(
        r#"
        DELETE FROM autosave_idempotency_keys
        WHERE tenant_id = $1
          AND user_id = $2
          AND resource_type = $3
          AND resource_id = $4
          AND operation = $5
          AND idempotency_key = $6
          AND fingerprint = $7
          AND status = 'in_progress'
        "#,
    )
    .bind(&scope.tenant_id)
    .bind(&scope.user_id)
    .bind(&scope.resource_type)
    .bind(&scope.resource_id)
    .bind(&scope.operation)
    .bind(&scope.key)
    .bind(fingerprint)
    .execute(pool)
    .await
    .map_err(idempotency_storage_error)?;
    Ok(())
}

#[cfg(feature = "postgres")]
#[derive(sqlx::FromRow)]
struct PostgresIdempotencyRow {
    fingerprint: String,
    status: String,
    response_json: Option<serde_json::Value>,
}

#[cfg(feature = "postgres")]
async fn prune_postgres_expired(pool: &sqlx::PgPool) -> Result<(), AutosaveProblem> {
    sqlx::query("DELETE FROM autosave_idempotency_keys WHERE expires_at <= NOW()")
        .execute(pool)
        .await
        .map_err(idempotency_storage_error)?;
    Ok(())
}

#[cfg(feature = "postgres")]
fn idempotency_storage_error(error: sqlx::Error) -> AutosaveProblem {
    tracing::error!(
        error = %error,
        "Autosave idempotency storage operation failed"
    );
    AutosaveProblem::server_error("Autosave idempotency storage failed.")
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::StatusCode;

    #[test]
    fn default_ttl_is_seventy_two_hours() {
        assert_eq!(DEFAULT_IDEMPOTENCY_TTL_SECS, 72 * 60 * 60);
    }

    #[test]
    fn ledger_replays_same_completed_mutation() {
        let ledger = AutosaveIdempotencyLedger::new(Duration::from_secs(60));
        let scope = scope("same-key");
        let fingerprint = "abc".to_string();

        let first = ledger.begin(scope.clone(), fingerprint.clone()).unwrap();
        assert_eq!(first, AutosaveIdempotencyDecision::Start);
        ledger
            .complete(&scope, &fingerprint, "saved-result".to_string())
            .unwrap();

        let second = ledger.begin(scope, fingerprint).unwrap();

        assert_eq!(
            second,
            AutosaveIdempotencyDecision::Replay("saved-result".to_string())
        );
    }

    #[test]
    fn ledger_rejects_same_key_different_payload() {
        let ledger: AutosaveIdempotencyLedger<String> =
            AutosaveIdempotencyLedger::new(Duration::from_secs(60));
        let scope = scope("same-key");

        ledger.begin(scope.clone(), "abc".to_string()).unwrap();
        let error = ledger.begin(scope, "different".to_string()).unwrap_err();

        assert_eq!(error.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[test]
    fn ledger_reports_same_key_in_progress() {
        let ledger: AutosaveIdempotencyLedger<String> =
            AutosaveIdempotencyLedger::new(Duration::from_secs(60));
        let scope = scope("same-key");

        ledger.begin(scope.clone(), "abc".to_string()).unwrap();
        let error = ledger.begin(scope, "abc".to_string()).unwrap_err();

        assert_eq!(error.status(), StatusCode::CONFLICT);
    }

    #[test]
    fn ledger_abort_allows_same_key_to_restart() {
        let ledger: AutosaveIdempotencyLedger<String> =
            AutosaveIdempotencyLedger::new(Duration::from_secs(60));
        let scope = scope("same-key");

        ledger.begin(scope.clone(), "abc".to_string()).unwrap();
        ledger.abort(&scope, "abc").unwrap();
        let restarted = ledger.begin(scope, "abc".to_string()).unwrap();

        assert_eq!(restarted, AutosaveIdempotencyDecision::Start);
    }

    fn scope(key: &str) -> AutosaveIdempotencyScope {
        AutosaveIdempotencyScope {
            tenant_id: "tenant".to_string(),
            user_id: "user".to_string(),
            resource_type: "settings".to_string(),
            resource_id: "global".to_string(),
            operation: "patch".to_string(),
            key: key.to_string(),
        }
    }
}
