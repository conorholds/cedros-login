use std::sync::atomic::{AtomicBool, AtomicU64, AtomicUsize, Ordering};

use async_trait::async_trait;
use tokio::sync::{Notify, RwLock};

use crate::errors::AppError;
use crate::repositories::{SystemSetting, SystemSettingsRepository};

use super::EMAIL_VERIFICATION_REQUIRED_KEY;

pub(super) fn setting(value: &str) -> SystemSetting {
    SystemSetting::new(
        EMAIL_VERIFICATION_REQUIRED_KEY.to_string(),
        value.to_string(),
        "auth.email".to_string(),
    )
}

pub(super) struct ControlledSettingsRepository {
    current: RwLock<SystemSetting>,
    get_all_calls: AtomicUsize,
    revision: AtomicU64,
    first_snapshot_ready: Notify,
    release_first: Notify,
    fail_next: AtomicBool,
}

impl ControlledSettingsRepository {
    pub(super) fn new(value: &str) -> Self {
        Self {
            current: RwLock::new(setting(value)),
            get_all_calls: AtomicUsize::new(0),
            revision: AtomicU64::new(1),
            first_snapshot_ready: Notify::new(),
            release_first: Notify::new(),
            fail_next: AtomicBool::new(false),
        }
    }

    pub(super) async fn wait_for_first_snapshot(&self) {
        self.first_snapshot_ready.notified().await;
    }

    pub(super) fn release_first_snapshot(&self) {
        self.release_first.notify_one();
    }

    pub(super) fn get_all_call_count(&self) -> usize {
        self.get_all_calls.load(Ordering::SeqCst)
    }

    pub(super) fn fail_next_read(&self) {
        self.fail_next.store(true, Ordering::SeqCst);
    }
}

#[async_trait]
impl SystemSettingsRepository for ControlledSettingsRepository {
    async fn get_all(&self) -> Result<Vec<SystemSetting>, AppError> {
        let snapshot = self.current.read().await.clone();
        if self.get_all_calls.fetch_add(1, Ordering::SeqCst) == 0 {
            self.first_snapshot_ready.notify_one();
            self.release_first.notified().await;
        }
        if self.fail_next.swap(false, Ordering::SeqCst) {
            return Err(AppError::ServiceUnavailable(
                "injected settings read failure".into(),
            ));
        }
        Ok(vec![snapshot])
    }

    async fn get_by_key(&self, key: &str) -> Result<Option<SystemSetting>, AppError> {
        let current = self.current.read().await;
        Ok((current.key == key).then(|| current.clone()))
    }

    async fn get_all_with_revision(&self) -> Result<(Vec<SystemSetting>, u64), AppError> {
        let settings = self.get_all().await?;
        Ok((settings, self.revision.load(Ordering::SeqCst)))
    }

    async fn get_by_category(&self, category: &str) -> Result<Vec<SystemSetting>, AppError> {
        let current = self.current.read().await;
        if current.category == category {
            Ok(vec![current.clone()])
        } else {
            Ok(Vec::new())
        }
    }

    async fn upsert(&self, setting: SystemSetting) -> Result<SystemSetting, AppError> {
        *self.current.write().await = setting.clone();
        self.revision.fetch_add(1, Ordering::SeqCst);
        Ok(setting)
    }

    async fn upsert_many(
        &self,
        settings: Vec<SystemSetting>,
    ) -> Result<Vec<SystemSetting>, AppError> {
        let setting = settings
            .last()
            .cloned()
            .ok_or_else(|| AppError::Validation("settings must not be empty".into()))?;
        *self.current.write().await = setting;
        self.revision.fetch_add(1, Ordering::SeqCst);
        Ok(settings)
    }

    async fn get_revision(&self) -> Result<u64, AppError> {
        Ok(self.revision.load(Ordering::SeqCst))
    }
}
