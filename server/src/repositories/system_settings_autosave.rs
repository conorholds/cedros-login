//! Atomic persistence contract for system-settings autosave.

use serde_json::Value;
use std::time::{Duration, Instant};

use super::{InMemorySystemSettingsRepository, SystemSetting};
use crate::autosave::{AutosaveIdempotencyScope, DEFAULT_IDEMPOTENCY_TTL_SECS};
use crate::errors::AppError;

/// Newly committed settings plus the exact, redacted API payload stored for replay.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SettingsAutosaveCommit {
    pub updated: Vec<SystemSetting>,
    pub revision: u64,
    pub response: Value,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SettingsAutosaveDecision {
    Committed(SettingsAutosaveCommit),
    Replay(Value),
}

/// Builds the public response only after repository timestamps and revision are known.
/// Implementations must redact secrets before returning the value; this exact
/// value is persisted in the idempotency ledger and returned on every replay.
pub trait SettingsAutosaveResponseBuilder: Send + Sync {
    fn build(&self, updated: &[SystemSetting], revision: u64) -> Result<Value, AppError>;
}

impl<F> SettingsAutosaveResponseBuilder for F
where
    F: Fn(&[SystemSetting], u64) -> Result<Value, AppError> + Send + Sync,
{
    fn build(&self, updated: &[SystemSetting], revision: u64) -> Result<Value, AppError> {
        self(updated, revision)
    }
}

#[derive(Debug)]
pub enum SettingsAutosaveError {
    Stale { current_revision: u64 },
    FingerprintMismatch,
    InProgress,
    App(AppError),
}

impl From<AppError> for SettingsAutosaveError {
    fn from(error: AppError) -> Self {
        Self::App(error)
    }
}

pub(super) struct InMemorySettingsAutosaveRecord {
    fingerprint: String,
    expires_at: Instant,
    response: Value,
}

impl InMemorySystemSettingsRepository {
    pub(super) async fn commit_autosave_atomic<F>(
        &self,
        new_settings: Vec<SystemSetting>,
        expected_revision: u64,
        scope: &AutosaveIdempotencyScope,
        fingerprint: &str,
        response_builder: &dyn SettingsAutosaveResponseBuilder,
        before_completion: F,
    ) -> Result<SettingsAutosaveDecision, SettingsAutosaveError>
    where
        F: FnOnce(&SettingsAutosaveCommit) -> Result<(), AppError>,
    {
        let mut settings = self.settings.write().await;
        let mut revision = self.revision.write().await;
        let mut records = self.autosave_records.lock().map_err(|_| {
            AppError::Internal(anyhow::anyhow!("settings autosave ledger lock poisoned"))
        })?;
        records.retain(|_, record| record.expires_at > Instant::now());

        if let Some(record) = records.get(scope) {
            return if record.fingerprint == fingerprint {
                Ok(SettingsAutosaveDecision::Replay(record.response.clone()))
            } else {
                Err(SettingsAutosaveError::FingerprintMismatch)
            };
        }
        if *revision != expected_revision {
            return Err(SettingsAutosaveError::Stale {
                current_revision: *revision,
            });
        }

        let updated = stage_settings(new_settings);
        let committed_revision = *revision + u64::from(!updated.is_empty());
        let response = response_builder.build(&updated, committed_revision)?;
        let commit = SettingsAutosaveCommit {
            updated,
            revision: committed_revision,
            response,
        };
        before_completion(&commit)?;

        records.insert(
            scope.clone(),
            InMemorySettingsAutosaveRecord {
                fingerprint: fingerprint.to_string(),
                expires_at: Instant::now() + Duration::from_secs(DEFAULT_IDEMPOTENCY_TTL_SECS),
                response: commit.response.clone(),
            },
        );
        for setting in &commit.updated {
            settings.insert(setting.key.clone(), setting.clone());
        }
        *revision = committed_revision;
        Ok(SettingsAutosaveDecision::Committed(commit))
    }
}

fn stage_settings(mut settings: Vec<SystemSetting>) -> Vec<SystemSetting> {
    let now = chrono::Utc::now();
    for setting in &mut settings {
        setting.updated_at = now;
    }
    settings
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::SystemSettingsRepository;

    fn response(updated: &[SystemSetting], revision: u64) -> Result<Value, AppError> {
        Ok(serde_json::json!({"key": updated[0].key, "revision": revision}))
    }

    fn scope(key: &str) -> AutosaveIdempotencyScope {
        AutosaveIdempotencyScope {
            tenant_id: "system".into(),
            user_id: "admin".into(),
            resource_type: "cedros.system_settings".into(),
            resource_id: "global".into(),
            operation: "autosave.patch".into(),
            key: key.into(),
        }
    }

    #[tokio::test]
    async fn completion_failure_commits_neither_settings_nor_ledger() {
        let repo = InMemorySystemSettingsRepository::new();
        let initial = repo.get_revision().await.unwrap();
        let setting = SystemSetting::new("test".into(), "new".into(), "test".into());
        let scope = scope("failure-retry");

        let failed = repo
            .commit_autosave_atomic(
                vec![setting.clone()],
                initial,
                &scope,
                "fingerprint",
                &response,
                |_| {
                    Err(AppError::Internal(anyhow::anyhow!(
                        "injected ledger failure"
                    )))
                },
            )
            .await;
        assert!(matches!(failed, Err(SettingsAutosaveError::App(_))));
        assert!(repo.get_by_key("test").await.unwrap().is_none());
        assert_eq!(repo.get_revision().await.unwrap(), initial);

        let retry = repo
            .commit_autosave(vec![setting], initial, &scope, "fingerprint", &response)
            .await
            .unwrap();
        assert!(matches!(retry, SettingsAutosaveDecision::Committed(_)));
    }
}
