//! Signup gating service
//!
//! Controls who may register by combining three mechanisms:
//!
//! 1. **Access code required** (`signup_access_code_enabled` = true):
//!    Every signup must present a valid code.  The `signup_access_code`
//!    setting holds the "global" code that never expires and has unlimited
//!    uses; the `access_codes` table holds limited / user-invite codes.
//!
//! 2. **Volume limit** (`signup_limit_enabled` = true):
//!    Total registrations in the current period must not exceed
//!    `signup_limit_max`.  Valid access-code signups bypass this check.
//!
//! 3. **User-generated invite codes** (`signup_user_codes_enabled` = true):
//!    Authenticated users may generate single-use invite codes, subject to a
//!    per-period budget (`signup_user_codes_per_period`, default 5).
//!
//! # Settings keys consumed
//! - `signup_access_code_enabled` (bool)
//! - `signup_access_code` (string) — the global / master code
//! - `signup_limit_enabled` (bool)
//! - `signup_limit_max` (integer string, default 100)
//! - `signup_limit_period` (string) — `"day"`, `"week"`, or `"month"`
//! - `signup_user_codes_enabled` (bool)
//! - `signup_user_codes_per_period` (integer string, default 5)

use std::sync::Arc;

use chrono::{DateTime, Datelike, TimeZone, Utc};
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{AccessCodeEntity, AccessCodeRepository, UserRepository};
use crate::services::settings_service::SettingsService;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/// Returned by [`SignupGatingService::check_signup`] on success.
///
/// If an access code from the `access_codes` table was validated, its ID is
/// returned so the caller can mark it as used after a successful registration.
pub struct SignupGateResult {
    /// ID of the validated access-code record, if any.
    /// `None` when the global code was accepted or when gating is disabled.
    pub access_code_id: Option<Uuid>,
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/// Orchestrates signup-gating checks.
pub struct SignupGatingService {
    access_code_repo: Arc<dyn AccessCodeRepository>,
    user_repo: Arc<dyn UserRepository>,
    settings_service: Arc<SettingsService>,
}

impl SignupGatingService {
    /// Create a new `SignupGatingService`.
    pub fn new(
        access_code_repo: Arc<dyn AccessCodeRepository>,
        user_repo: Arc<dyn UserRepository>,
        settings_service: Arc<SettingsService>,
    ) -> Self {
        Self {
            access_code_repo,
            user_repo,
            settings_service,
        }
    }

    /// Gate a signup attempt.
    ///
    /// Call this before creating the user.  On success, store the returned
    /// `SignupGateResult` and call [`mark_code_used`] after the user has been
    /// durably persisted.
    ///
    /// # Errors
    /// - `Forbidden` when access-code gating is enabled but no code was
    ///   provided, the code is unknown, exhausted, or expired.
    /// - `Forbidden` when the volume limit is reached and no code bypass
    ///   applies.
    /// - `Internal` / `Config` on storage or settings failures.
    pub async fn check_signup(
        &self,
        access_code: Option<&str>,
    ) -> Result<SignupGateResult, AppError> {
        let code_required = self
            .settings_service
            .get_bool("signup_access_code_enabled")
            .await?
            .unwrap_or(false);

        let mut code_id: Option<Uuid> = None;
        let mut code_bypasses_limit = false;

        if code_required {
            let provided = access_code
                .ok_or_else(|| AppError::Forbidden("Access code required to sign up".into()))?;

            // Check global / master code first (stored in system_settings)
            let global_code = self
                .settings_service
                .get("signup_access_code")
                .await?
                .unwrap_or_default();

            if !global_code.is_empty() && provided == global_code {
                // Global code accepted — no use counter, bypasses limit
                code_bypasses_limit = true;
            } else {
                // Look up in the access_codes table
                let entity = self
                    .access_code_repo
                    .find_by_code(provided)
                    .await?
                    .ok_or_else(|| AppError::Forbidden("Invalid or expired access code".into()))?;

                validate_code_usable(&entity)?;

                code_id = Some(entity.id);
                code_bypasses_limit = true;
            }
        }

        // Volume limit check (skipped when a valid code bypasses it)
        if !code_bypasses_limit {
            let limit_enabled = self
                .settings_service
                .get_bool("signup_limit_enabled")
                .await?
                .unwrap_or(false);

            if limit_enabled {
                let max: u64 = self
                    .settings_service
                    .get("signup_limit_max")
                    .await?
                    .and_then(|s| s.parse().ok())
                    .unwrap_or(100);

                let period = self
                    .settings_service
                    .get("signup_limit_period")
                    .await?
                    .unwrap_or_else(|| "day".to_string());

                let start = period_start(&period);
                let count = self.user_repo.count_created_since(start).await?;

                if count >= max {
                    return Err(AppError::Forbidden(
                        "Registration is temporarily closed. Please try again later.".into(),
                    ));
                }
            }
        }

        Ok(SignupGateResult {
            access_code_id: code_id,
        })
    }

    /// Increment the use counter on an access code after a successful signup.
    ///
    /// Failures are logged as warnings; they must NOT cause the registration
    /// to roll back (the user already exists at this point).
    pub async fn mark_code_used(&self, id: Uuid) -> Result<(), AppError> {
        let incremented = self.access_code_repo.increment_uses(id).await?;
        if !incremented {
            tracing::warn!(
                code_id = %id,
                "Access code increment_uses returned false — code may have reached capacity"
            );
        }
        Ok(())
    }

    /// Generate a new single-use invite code for `user_id`.
    ///
    /// Respects `signup_user_codes_enabled` and per-period budget.
    ///
    /// # Errors
    /// - `Forbidden` when user invite codes are disabled.
    /// - `Forbidden` when the per-period budget is exhausted.
    pub async fn generate_user_code(&self, user_id: Uuid) -> Result<AccessCodeEntity, AppError> {
        let enabled = self
            .settings_service
            .get_bool("signup_user_codes_enabled")
            .await?
            .unwrap_or(false);

        if !enabled {
            return Err(AppError::Forbidden(
                "User invite codes are not enabled".into(),
            ));
        }

        let per_period: u64 = self
            .settings_service
            .get("signup_user_codes_per_period")
            .await?
            .and_then(|s| s.parse().ok())
            .unwrap_or(5);

        let period = self
            .settings_service
            .get("signup_limit_period")
            .await?
            .unwrap_or_else(|| "day".to_string());

        let start = period_start(&period);
        let used = self
            .access_code_repo
            .count_by_creator_since(user_id, start)
            .await?;

        if used >= per_period {
            return Err(AppError::Forbidden(
                "Invite code budget exhausted for this period".into(),
            ));
        }

        let code = crate::repositories::generate_referral_code(); // 8-char uppercase alphanumeric
        let now = Utc::now();
        let entity = AccessCodeEntity {
            id: Uuid::new_v4(),
            code,
            code_type: "user_invite".to_string(),
            max_uses: Some(1),
            current_uses: 0,
            created_by: Some(user_id),
            expires_at: None,
            created_at: now,
        };

        self.access_code_repo.create(entity).await
    }
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/// Validate that a code entity is currently usable (not expired, not exhausted).
fn validate_code_usable(entity: &AccessCodeEntity) -> Result<(), AppError> {
    // Expiry check
    if let Some(exp) = entity.expires_at {
        if exp <= Utc::now() {
            return Err(AppError::Forbidden("Invalid or expired access code".into()));
        }
    }
    // Use-count check
    if let Some(max) = entity.max_uses {
        if entity.current_uses >= max {
            return Err(AppError::Forbidden("Invalid or expired access code".into()));
        }
    }
    Ok(())
}

/// Compute the start of the current period.
///
/// - `"day"`   — midnight UTC today
/// - `"week"`  — Monday midnight UTC of the current ISO week
/// - `"month"` — first of the current month at midnight UTC
///
/// Any unrecognised value falls back to `"day"`.
pub(crate) fn period_start(period: &str) -> DateTime<Utc> {
    let now = Utc::now();
    match period {
        "week" => {
            // ISO week starts on Monday
            let days_since_monday = now.weekday().num_days_from_monday();
            let monday = now.date_naive() - chrono::Duration::days(days_since_monday as i64);
            Utc.from_utc_datetime(&monday.and_hms_opt(0, 0, 0).unwrap())
        }
        "month" => {
            let first = chrono::NaiveDate::from_ymd_opt(now.year(), now.month(), 1).unwrap();
            Utc.from_utc_datetime(&first.and_hms_opt(0, 0, 0).unwrap())
        }
        _ => {
            // Default: current UTC day
            Utc.from_utc_datetime(&now.date_naive().and_hms_opt(0, 0, 0).unwrap())
        }
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{Duration, Timelike, Weekday};

    #[test]
    fn period_start_day_is_midnight() {
        let start = period_start("day");
        let now = Utc::now();
        assert_eq!(start.date_naive(), now.date_naive());
        assert_eq!(start.time().hour(), 0);
        assert_eq!(start.time().minute(), 0);
        assert_eq!(start.time().second(), 0);
    }

    #[test]
    fn period_start_day_is_lte_now() {
        let start = period_start("day");
        assert!(start <= Utc::now());
    }

    #[test]
    fn period_start_week_is_monday() {
        let start = period_start("week");
        assert_eq!(start.weekday(), Weekday::Mon);
        assert!(start <= Utc::now());
    }

    #[test]
    fn period_start_month_is_first() {
        let start = period_start("month");
        assert_eq!(start.day(), 1);
        assert!(start <= Utc::now());
    }

    #[test]
    fn period_start_unknown_falls_back_to_day() {
        let day = period_start("day");
        let unknown = period_start("fortnight");
        assert_eq!(day, unknown);
    }

    #[test]
    fn validate_code_usable_passes_unlimited() {
        let entity = AccessCodeEntity {
            id: Uuid::new_v4(),
            code: "X".to_string(),
            code_type: "limited".to_string(),
            max_uses: None,
            current_uses: 9999,
            created_by: None,
            expires_at: None,
            created_at: Utc::now(),
        };
        assert!(validate_code_usable(&entity).is_ok());
    }

    #[test]
    fn validate_code_usable_rejects_exhausted() {
        let entity = AccessCodeEntity {
            id: Uuid::new_v4(),
            code: "X".to_string(),
            code_type: "limited".to_string(),
            max_uses: Some(5),
            current_uses: 5,
            created_by: None,
            expires_at: None,
            created_at: Utc::now(),
        };
        assert!(validate_code_usable(&entity).is_err());
    }

    #[test]
    fn validate_code_usable_rejects_expired() {
        let entity = AccessCodeEntity {
            id: Uuid::new_v4(),
            code: "X".to_string(),
            code_type: "limited".to_string(),
            max_uses: None,
            current_uses: 0,
            created_by: None,
            expires_at: Some(Utc::now() - Duration::seconds(1)),
            created_at: Utc::now(),
        };
        assert!(validate_code_usable(&entity).is_err());
    }

    #[test]
    fn validate_code_usable_accepts_future_expiry() {
        let entity = AccessCodeEntity {
            id: Uuid::new_v4(),
            code: "X".to_string(),
            code_type: "limited".to_string(),
            max_uses: None,
            current_uses: 0,
            created_by: None,
            expires_at: Some(Utc::now() + Duration::days(1)),
            created_at: Utc::now(),
        };
        assert!(validate_code_usable(&entity).is_ok());
    }
}
