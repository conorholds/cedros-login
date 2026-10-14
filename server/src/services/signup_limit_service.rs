//! Concurrency-safe signup volume limiting.

use std::{collections::HashMap, sync::Arc};

use chrono::{DateTime, Datelike, Duration, TimeZone, Utc};
use serde::Serialize;
use tokio::sync::{Mutex, OwnedMutexGuard};

use crate::errors::AppError;
use crate::repositories::UserRepository;
use crate::services::SettingsService;

const DEFAULT_SIGNUP_LIMIT: u64 = 100;

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
pub enum SignupLimitPeriod {
    Daily,
    Weekly,
    Monthly,
}

impl SignupLimitPeriod {
    fn parse(value: Option<String>) -> Result<Self, AppError> {
        match value.as_deref() {
            Some("daily") => Ok(Self::Daily),
            Some("weekly") => Ok(Self::Weekly),
            None | Some("monthly") => Ok(Self::Monthly),
            Some(_) => Err(AppError::Config(
                "signup_limit_period must be daily, weekly, or monthly".into(),
            )),
        }
    }

    fn as_str(self) -> &'static str {
        match self {
            Self::Daily => "daily",
            Self::Weekly => "weekly",
            Self::Monthly => "monthly",
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SignupLimitAvailability {
    pub remaining: u64,
    pub limit: u64,
    pub period: &'static str,
    pub resets_at: DateTime<Utc>,
}

/// A permit remains alive until its signup path has persisted the user. This
/// makes the count-and-create sequence serial within a process and, for the
/// PostgreSQL runtime, across all processes using the same database.
pub struct SignupLimitPermit {
    local_guard: Option<OwnedMutexGuard<HashMap<SignupLimitWindow, u64>>>,
    policy: Option<SignupLimitPolicy>,
    user_repo: Arc<dyn UserRepository>,
    postgres_enforced: bool,
    reserved: bool,
}

pub struct SignupLimitService {
    user_repo: Arc<dyn UserRepository>,
    settings: Arc<SettingsService>,
    local_counts: Arc<Mutex<HashMap<SignupLimitWindow, u64>>>,
    postgres_enforced: bool,
}

impl SignupLimitService {
    pub fn new(user_repo: Arc<dyn UserRepository>, settings: Arc<SettingsService>) -> Self {
        Self {
            user_repo,
            settings,
            local_counts: Arc::new(Mutex::new(HashMap::new())),
            postgres_enforced: false,
        }
    }

    #[cfg(feature = "postgres")]
    pub fn with_postgres_pool(mut self, pool: Option<sqlx::PgPool>) -> Self {
        self.postgres_enforced = pool.is_some();
        self
    }

    /// Serialize an in-memory signup. PostgreSQL uses the database trigger from
    /// the signup-limit migration so every user insert is protected atomically.
    pub async fn acquire(&self) -> Result<SignupLimitPermit, AppError> {
        let policy = self.policy().await?;
        let should_lock = policy.enabled && !self.postgres_enforced;
        let local_guard = if should_lock {
            Some(self.local_counts.clone().lock_owned().await)
        } else {
            None
        };
        Ok(SignupLimitPermit {
            local_guard,
            policy: policy.enabled.then_some(policy),
            user_repo: self.user_repo.clone(),
            postgres_enforced: self.postgres_enforced,
            reserved: false,
        })
    }

    /// Return a public quota snapshot only when the operator explicitly opted
    /// into disclosure. Atomic account creation remains the final authority.
    pub async fn availability(&self) -> Result<Option<SignupLimitAvailability>, AppError> {
        if !self
            .strict_bool_setting("signup_limit_show_remaining", false)
            .await?
        {
            return Ok(None);
        }
        let policy = self.policy().await?;
        if !policy.enabled {
            return Ok(None);
        }

        let observed = self
            .user_repo
            .initialize_signup_limit_usage(
                policy.period.as_str(),
                policy.period_start,
                policy.resets_at,
            )
            .await?;
        let used = if self.postgres_enforced {
            observed
        } else {
            let mut counts = self.local_counts.lock().await;
            let used = counts.entry(SignupLimitWindow::from(&policy)).or_insert(0);
            *used = (*used).max(observed);
            *used
        };

        Ok(Some(SignupLimitAvailability {
            remaining: policy.limit.saturating_sub(used),
            limit: policy.limit,
            period: policy.period.as_str(),
            resets_at: policy.resets_at,
        }))
    }

    async fn strict_bool_setting(&self, key: &str, default: bool) -> Result<bool, AppError> {
        match self
            .settings
            .get_for_domain_validation(key)
            .await?
            .as_deref()
        {
            None => Ok(default),
            Some("false") => Ok(false),
            Some("true") => Ok(true),
            Some(_) => Err(AppError::Config(format!("{key} must be true or false"))),
        }
    }

    async fn policy(&self) -> Result<SignupLimitPolicy, AppError> {
        let enabled = self
            .strict_bool_setting("signup_limit_enabled", false)
            .await?;
        let period = SignupLimitPeriod::parse(
            self.settings
                .get_for_domain_validation("signup_limit_period")
                .await?,
        )?;
        let limit = self
            .settings
            .get_for_domain_validation("signup_limit_max")
            .await?
            .unwrap_or_else(|| DEFAULT_SIGNUP_LIMIT.to_string())
            .parse::<u64>()
            .map_err(|_| AppError::Config("signup_limit_max must be a positive integer".into()))?;
        if !(1..=1_000_000).contains(&limit) {
            return Err(AppError::Config(
                "signup_limit_max must be an integer from 1 through 1000000".into(),
            ));
        }
        let (period_start, resets_at) = period_bounds(period, Utc::now());
        Ok(SignupLimitPolicy {
            enabled,
            period,
            limit,
            period_start,
            resets_at,
        })
    }
}

impl SignupLimitPermit {
    /// Check immediately before inserting a new user. Existing-user paths can
    /// simply drop the permit and remain available when the cap is full.
    pub async fn ensure_available(&mut self) -> Result<(), AppError> {
        let Some(policy) = &self.policy else {
            return Ok(());
        };
        if self.postgres_enforced {
            return Ok(());
        }
        let observed = self
            .user_repo
            .count_non_admin_created_since(policy.period_start)
            .await?;
        let counts = self.local_guard.as_mut().ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "signup limit permit is missing its local guard"
            ))
        })?;
        let used = counts.entry(SignupLimitWindow::from(policy)).or_insert(0);
        *used = (*used).max(observed);
        ensure_available(*used, policy.limit, policy.resets_at)?;
        *used += 1;
        self.reserved = true;
        Ok(())
    }

    /// Keep the reserved slot after the user has been durably created. Dropping
    /// an uncommitted permit releases its slot so failed attempts do not count.
    pub fn record_created(&mut self) {
        self.reserved = false;
    }
}

impl Drop for SignupLimitPermit {
    fn drop(&mut self) {
        if !self.reserved {
            return;
        }
        let (Some(policy), Some(counts)) = (&self.policy, self.local_guard.as_mut()) else {
            return;
        };
        if let Some(used) = counts.get_mut(&SignupLimitWindow::from(policy)) {
            *used = used.saturating_sub(1);
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
struct SignupLimitWindow {
    period: SignupLimitPeriod,
    period_start: DateTime<Utc>,
}

impl From<&SignupLimitPolicy> for SignupLimitWindow {
    fn from(policy: &SignupLimitPolicy) -> Self {
        Self {
            period: policy.period,
            period_start: policy.period_start,
        }
    }
}

#[derive(Clone)]
struct SignupLimitPolicy {
    enabled: bool,
    period: SignupLimitPeriod,
    limit: u64,
    period_start: DateTime<Utc>,
    resets_at: DateTime<Utc>,
}

fn ensure_available(used: u64, limit: u64, resets_at: DateTime<Utc>) -> Result<(), AppError> {
    if used >= limit {
        return Err(AppError::SignupLimitReached { resets_at });
    }
    Ok(())
}

pub(crate) fn period_bounds(
    period: SignupLimitPeriod,
    now: DateTime<Utc>,
) -> (DateTime<Utc>, DateTime<Utc>) {
    let day = now.date_naive();
    let start_date = match period {
        SignupLimitPeriod::Daily => day,
        SignupLimitPeriod::Weekly => {
            day - Duration::days(now.weekday().num_days_from_monday() as i64)
        }
        SignupLimitPeriod::Monthly => {
            chrono::NaiveDate::from_ymd_opt(now.year(), now.month(), 1).expect("valid month")
        }
    };
    let next_date = match period {
        SignupLimitPeriod::Daily => start_date + Duration::days(1),
        SignupLimitPeriod::Weekly => start_date + Duration::days(7),
        SignupLimitPeriod::Monthly => {
            let (year, month) = if now.month() == 12 {
                (now.year() + 1, 1)
            } else {
                (now.year(), now.month() + 1)
            };
            chrono::NaiveDate::from_ymd_opt(year, month, 1).expect("valid next month")
        }
    };
    (
        Utc.from_utc_datetime(&start_date.and_hms_opt(0, 0, 0).expect("midnight")),
        Utc.from_utc_datetime(&next_date.and_hms_opt(0, 0, 0).expect("midnight")),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::{SystemSetting, UserEntity};
    use crate::storage::Storage;

    fn utc(year: i32, month: u32, day: u32, hour: u32) -> DateTime<Utc> {
        Utc.with_ymd_and_hms(year, month, day, hour, 30, 0)
            .single()
            .unwrap()
    }

    #[test]
    fn monthly_bounds_use_utc_calendar_month() {
        let (start, end) = period_bounds(SignupLimitPeriod::Monthly, utc(2026, 12, 31, 23));
        assert_eq!(start, utc(2026, 12, 1, 0) - Duration::minutes(30));
        assert_eq!(end, utc(2027, 1, 1, 0) - Duration::minutes(30));
    }

    #[test]
    fn weekly_bounds_start_on_monday() {
        let (start, end) = period_bounds(SignupLimitPeriod::Weekly, utc(2026, 9, 12, 8));
        assert_eq!(start.weekday(), chrono::Weekday::Mon);
        assert_eq!(end - start, Duration::days(7));
    }

    #[test]
    fn cap_rejects_the_next_signup_and_reports_reset() {
        let reset = utc(2026, 10, 1, 0);
        assert!(ensure_available(99, 100, reset).is_ok());
        assert!(matches!(
            ensure_available(100, 100, reset),
            Err(AppError::SignupLimitReached { resets_at }) if resets_at == reset
        ));
    }

    #[tokio::test]
    async fn concurrent_in_memory_signups_cannot_exceed_the_limit() {
        let storage = Storage::in_memory();
        storage
            .system_settings_repo
            .upsert_many(vec![
                SystemSetting::new(
                    "signup_limit_enabled".into(),
                    "true".into(),
                    "auth.signup_limits".into(),
                ),
                SystemSetting::new(
                    "signup_limit_max".into(),
                    "1".into(),
                    "auth.signup_limits".into(),
                ),
            ])
            .await
            .unwrap();
        let settings = Arc::new(SettingsService::new(storage.system_settings_repo.clone()));
        settings.refresh().await.unwrap();
        let service = Arc::new(SignupLimitService::new(storage.user_repo.clone(), settings));

        async fn attempt(
            index: u8,
            service: Arc<SignupLimitService>,
            users: Arc<dyn UserRepository>,
        ) -> Result<(), AppError> {
            let mut permit = service.acquire().await?;
            permit.ensure_available().await?;
            tokio::task::yield_now().await;
            users
                .create(UserEntity::new_email_user(
                    format!("user{index}@example.com"),
                    "hash".into(),
                    None,
                ))
                .await?;
            permit.record_created();
            Ok(())
        }

        let (first, second) = tokio::join!(
            attempt(1, service.clone(), storage.user_repo.clone()),
            attempt(2, service, storage.user_repo.clone())
        );
        assert_eq!(usize::from(first.is_ok()) + usize::from(second.is_ok()), 1);
        assert!(matches!(
            first.err().or_else(|| second.err()),
            Some(AppError::SignupLimitReached { .. })
        ));
        assert_eq!(storage.user_repo.count().await.unwrap(), 1);
    }

    #[tokio::test]
    async fn deleted_accounts_do_not_replenish_the_current_period() {
        let storage = Storage::in_memory();
        storage
            .system_settings_repo
            .upsert_many(vec![
                SystemSetting::new(
                    "signup_limit_enabled".into(),
                    "true".into(),
                    "auth.signup_limits".into(),
                ),
                SystemSetting::new(
                    "signup_limit_max".into(),
                    "1".into(),
                    "auth.signup_limits".into(),
                ),
            ])
            .await
            .unwrap();
        let settings = Arc::new(SettingsService::new(storage.system_settings_repo.clone()));
        settings.refresh().await.unwrap();
        let service = SignupLimitService::new(storage.user_repo.clone(), settings);

        let mut permit = service.acquire().await.unwrap();
        permit.ensure_available().await.unwrap();
        let user = storage
            .user_repo
            .create(UserEntity::new_email_user(
                "deleted@example.com".into(),
                "hash".into(),
                None,
            ))
            .await
            .unwrap();
        permit.record_created();
        drop(permit);
        storage.user_repo.delete(user.id).await.unwrap();

        let mut next = service.acquire().await.unwrap();
        assert!(matches!(
            next.ensure_available().await,
            Err(AppError::SignupLimitReached { .. })
        ));
    }

    #[tokio::test]
    async fn failed_accounts_release_their_reserved_slot() {
        let storage = Storage::in_memory();
        storage
            .system_settings_repo
            .upsert_many(vec![
                SystemSetting::new(
                    "signup_limit_enabled".into(),
                    "true".into(),
                    "auth.signup_limits".into(),
                ),
                SystemSetting::new(
                    "signup_limit_max".into(),
                    "1".into(),
                    "auth.signup_limits".into(),
                ),
            ])
            .await
            .unwrap();
        let settings = Arc::new(SettingsService::new(storage.system_settings_repo.clone()));
        settings.refresh().await.unwrap();
        let service = SignupLimitService::new(storage.user_repo.clone(), settings);

        let mut failed = service.acquire().await.unwrap();
        failed.ensure_available().await.unwrap();
        drop(failed);

        let mut retry = service.acquire().await.unwrap();
        assert!(retry.ensure_available().await.is_ok());
    }

    #[tokio::test]
    async fn bootstrap_admins_do_not_consume_signup_capacity() {
        let storage = Storage::in_memory();
        storage
            .system_settings_repo
            .upsert_many(vec![
                SystemSetting::new(
                    "signup_limit_enabled".into(),
                    "true".into(),
                    "auth.signup_limits".into(),
                ),
                SystemSetting::new(
                    "signup_limit_max".into(),
                    "1".into(),
                    "auth.signup_limits".into(),
                ),
            ])
            .await
            .unwrap();
        let mut admin = UserEntity::new_email_user("admin@example.com".into(), "hash".into(), None);
        admin.is_system_admin = true;
        storage.user_repo.create(admin).await.unwrap();
        let settings = Arc::new(SettingsService::new(storage.system_settings_repo.clone()));
        settings.refresh().await.unwrap();
        let service = SignupLimitService::new(storage.user_repo.clone(), settings);

        let mut permit = service.acquire().await.unwrap();
        assert!(permit.ensure_available().await.is_ok());
    }

    #[tokio::test]
    async fn availability_is_private_by_default_and_tracks_durable_usage() {
        let storage = Storage::in_memory();
        storage
            .system_settings_repo
            .upsert_many(vec![
                SystemSetting::new(
                    "signup_limit_enabled".into(),
                    "true".into(),
                    "auth.signup_limits".into(),
                ),
                SystemSetting::new(
                    "signup_limit_max".into(),
                    "2".into(),
                    "auth.signup_limits".into(),
                ),
            ])
            .await
            .unwrap();
        let settings = Arc::new(SettingsService::new(storage.system_settings_repo.clone()));
        settings.refresh().await.unwrap();
        let service = SignupLimitService::new(storage.user_repo.clone(), settings.clone());

        assert_eq!(service.availability().await.unwrap(), None);

        storage
            .system_settings_repo
            .upsert(SystemSetting::new(
                "signup_limit_show_remaining".into(),
                "true".into(),
                "auth.signup_limits".into(),
            ))
            .await
            .unwrap();
        settings.refresh().await.unwrap();

        let initial = service.availability().await.unwrap().unwrap();
        assert_eq!(initial.remaining, 2);
        assert_eq!(initial.limit, 2);
        assert_eq!(initial.period, "monthly");

        let mut permit = service.acquire().await.unwrap();
        permit.ensure_available().await.unwrap();
        let user = storage
            .user_repo
            .create(UserEntity::new_email_user(
                "visible@example.com".into(),
                "hash".into(),
                None,
            ))
            .await
            .unwrap();
        permit.record_created();
        drop(permit);

        assert_eq!(service.availability().await.unwrap().unwrap().remaining, 1);
        storage.user_repo.delete(user.id).await.unwrap();
        assert_eq!(service.availability().await.unwrap().unwrap().remaining, 1);
    }

    #[tokio::test]
    async fn availability_is_omitted_when_limit_is_disabled() {
        let storage = Storage::in_memory();
        storage
            .system_settings_repo
            .upsert(SystemSetting::new(
                "signup_limit_show_remaining".into(),
                "true".into(),
                "auth.signup_limits".into(),
            ))
            .await
            .unwrap();
        let settings = Arc::new(SettingsService::new(storage.system_settings_repo.clone()));
        settings.refresh().await.unwrap();
        let service = SignupLimitService::new(storage.user_repo.clone(), settings);

        assert_eq!(service.availability().await.unwrap(), None);
    }
}
