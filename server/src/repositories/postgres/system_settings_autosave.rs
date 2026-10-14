//! PostgreSQL atomic system-settings autosave transaction.

use chrono::{Duration as ChronoDuration, Utc};
use sqlx::{Postgres, Transaction};

use super::PostgresSystemSettingsRepository;
use crate::autosave::{AutosaveIdempotencyScope, DEFAULT_IDEMPOTENCY_TTL_SECS};
use crate::errors::AppError;
use crate::repositories::{
    SettingsAutosaveCommit, SettingsAutosaveDecision, SettingsAutosaveError,
    SettingsAutosaveResponseBuilder, SystemSetting,
};

#[derive(sqlx::FromRow)]
struct IdempotencyRow {
    fingerprint: String,
    status: String,
    response_json: Option<serde_json::Value>,
}

impl PostgresSystemSettingsRepository {
    pub(super) async fn commit_autosave_atomic(
        &self,
        settings: Vec<SystemSetting>,
        expected_revision: u64,
        scope: &AutosaveIdempotencyScope,
        fingerprint: &str,
        response_builder: &dyn SettingsAutosaveResponseBuilder,
    ) -> Result<SettingsAutosaveDecision, SettingsAutosaveError> {
        let mut tx = self.pool.begin().await.map_err(storage_error)?;
        prune_expired(&mut tx).await?;
        let inserted = insert_key(&mut tx, scope, fingerprint).await?;
        if !inserted {
            let decision = resolve_existing(&mut tx, scope, fingerprint).await?;
            tx.commit().await.map_err(storage_error)?;
            return Ok(decision);
        }

        let current = Self::locked_revision_in_tx(&mut tx).await?;
        if current != expected_revision {
            return Err(SettingsAutosaveError::Stale {
                current_revision: current,
            });
        }
        let updated = Self::upsert_many_in_tx(&mut tx, settings).await?;
        let revision = if updated.is_empty() {
            current
        } else {
            Self::bump_revision_in_tx(&mut tx).await?
        };
        let response = response_builder.build(&updated, revision)?;
        let commit = SettingsAutosaveCommit {
            updated,
            revision,
            response,
        };
        complete_key(&mut tx, scope, fingerprint, &commit.response).await?;
        tx.commit().await.map_err(storage_error)?;
        Ok(SettingsAutosaveDecision::Committed(commit))
    }
}

async fn prune_expired(tx: &mut Transaction<'_, Postgres>) -> Result<(), SettingsAutosaveError> {
    sqlx::query("DELETE FROM autosave_idempotency_keys WHERE expires_at <= NOW()")
        .execute(&mut **tx)
        .await
        .map_err(storage_error)?;
    Ok(())
}

async fn insert_key(
    tx: &mut Transaction<'_, Postgres>,
    scope: &AutosaveIdempotencyScope,
    fingerprint: &str,
) -> Result<bool, SettingsAutosaveError> {
    let expires_at = Utc::now() + ChronoDuration::seconds(DEFAULT_IDEMPOTENCY_TTL_SECS as i64);
    let inserted: Option<i32> = sqlx::query_scalar(
        r#"INSERT INTO autosave_idempotency_keys (
               tenant_id, user_id, resource_type, resource_id, operation,
               idempotency_key, fingerprint, status, expires_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'in_progress', $8)
           ON CONFLICT DO NOTHING RETURNING 1"#,
    )
    .bind(&scope.tenant_id)
    .bind(&scope.user_id)
    .bind(&scope.resource_type)
    .bind(&scope.resource_id)
    .bind(&scope.operation)
    .bind(&scope.key)
    .bind(fingerprint)
    .bind(expires_at)
    .fetch_optional(&mut **tx)
    .await
    .map_err(storage_error)?;
    Ok(inserted.is_some())
}

async fn resolve_existing(
    tx: &mut Transaction<'_, Postgres>,
    scope: &AutosaveIdempotencyScope,
    fingerprint: &str,
) -> Result<SettingsAutosaveDecision, SettingsAutosaveError> {
    let row: IdempotencyRow = sqlx::query_as(
        r#"SELECT fingerprint, status, response_json
           FROM autosave_idempotency_keys
           WHERE tenant_id = $1 AND user_id = $2 AND resource_type = $3
             AND resource_id = $4 AND operation = $5 AND idempotency_key = $6
           FOR UPDATE"#,
    )
    .bind(&scope.tenant_id)
    .bind(&scope.user_id)
    .bind(&scope.resource_type)
    .bind(&scope.resource_id)
    .bind(&scope.operation)
    .bind(&scope.key)
    .fetch_one(&mut **tx)
    .await
    .map_err(storage_error)?;

    if row.fingerprint != fingerprint {
        return Err(SettingsAutosaveError::FingerprintMismatch);
    }
    if row.status == "in_progress" {
        return Err(SettingsAutosaveError::InProgress);
    }
    let response = row
        .response_json
        .ok_or_else(|| storage_error(anyhow::anyhow!("completed autosave key has no response")))?;
    Ok(SettingsAutosaveDecision::Replay(response))
}

async fn complete_key(
    tx: &mut Transaction<'_, Postgres>,
    scope: &AutosaveIdempotencyScope,
    fingerprint: &str,
    response: &serde_json::Value,
) -> Result<(), SettingsAutosaveError> {
    let result = sqlx::query(
        r#"UPDATE autosave_idempotency_keys
           SET status = 'completed', response_json = $8, updated_at = NOW()
           WHERE tenant_id = $1 AND user_id = $2 AND resource_type = $3
             AND resource_id = $4 AND operation = $5 AND idempotency_key = $6
             AND fingerprint = $7 AND status = 'in_progress'"#,
    )
    .bind(&scope.tenant_id)
    .bind(&scope.user_id)
    .bind(&scope.resource_type)
    .bind(&scope.resource_id)
    .bind(&scope.operation)
    .bind(&scope.key)
    .bind(fingerprint)
    .bind(response)
    .execute(&mut **tx)
    .await
    .map_err(storage_error)?;
    if result.rows_affected() != 1 {
        return Err(storage_error(anyhow::anyhow!(
            "autosave idempotency completion affected {} rows",
            result.rows_affected()
        )));
    }
    Ok(())
}

fn storage_error(error: impl Into<anyhow::Error>) -> SettingsAutosaveError {
    let error = error.into();
    tracing::error!(error = %error, "Atomic settings autosave storage operation failed");
    SettingsAutosaveError::App(AppError::Internal(error))
}
