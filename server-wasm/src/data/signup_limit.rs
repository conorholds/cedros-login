//! Signup-limit policy passed to the host registration transaction.

use chrono::{DateTime, Datelike, Duration, SecondsFormat, TimeZone, Utc};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::host::db::{self, ConditionalBatchOp, ConditionalOperation};
use crate::host::{settings, Result, SeamError};

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SignupLimitPolicy {
    pub enabled: bool,
    pub period: &'static str,
    pub limit: u64,
    pub period_start: String,
    pub resets_at: String,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SignupLimitAvailability {
    pub remaining: u64,
    pub limit: u64,
    pub period: String,
    pub resets_at: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SignupLimitStatus {
    status: String,
    used: u64,
    remaining: u64,
    limit: u64,
    period: String,
    resets_at: String,
}

pub fn current() -> Result<SignupLimitPolicy> {
    let enabled = match settings::get("signup_limit_enabled")?.as_deref() {
        None | Some("false") => false,
        Some("true") => true,
        Some(_) => return Err(invalid("signup_limit_enabled")),
    };
    let period = match settings::get("signup_limit_period")?.as_deref() {
        None | Some("monthly") => "monthly",
        Some("daily") => "daily",
        Some("weekly") => "weekly",
        Some(_) => return Err(invalid("signup_limit_period")),
    };
    let limit = settings::get("signup_limit_max")?
        .unwrap_or_else(|| "100".into())
        .parse::<u64>()
        .ok()
        .filter(|value| (1..=1_000_000).contains(value))
        .ok_or_else(|| invalid("signup_limit_max"))?;
    let (period_start, resets_at) = bounds(period, Utc::now());
    Ok(SignupLimitPolicy {
        enabled,
        period,
        limit,
        period_start: timestamp(period_start),
        resets_at: timestamp(resets_at),
    })
}

/// Public quota snapshot, available only after an explicit operator opt-in.
/// The host-owned ledger is authoritative and survives account deletion.
pub fn public_availability() -> Result<Option<SignupLimitAvailability>> {
    if !bool_setting("signup_limit_show_remaining", false)? {
        return Ok(None);
    }
    let policy = current()?;
    if !policy.enabled {
        return Ok(None);
    }

    let operation = ConditionalBatchOp::new(
        ConditionalOperation::GetSignupLimitStatus,
        json!({ "signupLimit": &policy }),
    );
    let result = db::batch_with_results(&[operation.into()])?;
    let output = result
        .results
        .first()
        .ok_or_else(invalid_status_response)?
        .output
        .clone();
    let status: SignupLimitStatus =
        serde_json::from_value(output).map_err(|_| invalid_status_response())?;
    if !valid_status(&status, &policy) {
        return Err(invalid_status_response());
    }

    Ok(Some(SignupLimitAvailability {
        remaining: status.remaining,
        limit: status.limit,
        period: status.period,
        resets_at: status.resets_at,
    }))
}

fn valid_status(status: &SignupLimitStatus, policy: &SignupLimitPolicy) -> bool {
    status.status == "available"
        && status.limit == policy.limit
        && status.period == policy.period
        && status.resets_at == policy.resets_at
        && status.remaining == status.limit.saturating_sub(status.used)
}

fn bool_setting(key: &str, default: bool) -> Result<bool> {
    match settings::get(key)?.as_deref() {
        None => Ok(default),
        Some("false") => Ok(false),
        Some("true") => Ok(true),
        Some(_) => Err(invalid(key)),
    }
}

fn invalid_status_response() -> SeamError {
    SeamError::Db("signup limit status returned an invalid response".into())
}

fn invalid(key: &str) -> SeamError {
    SeamError::Settings(format!("invalid persisted setting: {key}"))
}

fn timestamp(value: DateTime<Utc>) -> String {
    value.to_rfc3339_opts(SecondsFormat::Millis, true)
}

fn bounds(period: &str, now: DateTime<Utc>) -> (DateTime<Utc>, DateTime<Utc>) {
    let today = now.date_naive();
    let start = match period {
        "daily" => today,
        "weekly" => today - Duration::days(now.weekday().num_days_from_monday() as i64),
        _ => chrono::NaiveDate::from_ymd_opt(now.year(), now.month(), 1).expect("valid month"),
    };
    let next = match period {
        "daily" => start + Duration::days(1),
        "weekly" => start + Duration::days(7),
        _ if now.month() == 12 => {
            chrono::NaiveDate::from_ymd_opt(now.year() + 1, 1, 1).expect("valid year")
        }
        _ => chrono::NaiveDate::from_ymd_opt(now.year(), now.month() + 1, 1).expect("valid month"),
    };
    (
        Utc.from_utc_datetime(&start.and_hms_opt(0, 0, 0).expect("midnight")),
        Utc.from_utc_datetime(&next.and_hms_opt(0, 0, 0).expect("midnight")),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn monthly_bounds_cross_year_in_utc() {
        let now = Utc.with_ymd_and_hms(2026, 12, 31, 23, 59, 0).unwrap();
        let (start, reset) = bounds("monthly", now);
        assert_eq!(timestamp(start), "2026-12-01T00:00:00.000Z");
        assert_eq!(timestamp(reset), "2027-01-01T00:00:00.000Z");
    }

    #[test]
    fn daily_and_weekly_bounds_use_utc_calendar_boundaries() {
        let now = Utc.with_ymd_and_hms(2026, 9, 12, 23, 59, 0).unwrap();
        let (daily_start, daily_reset) = bounds("daily", now);
        assert_eq!(timestamp(daily_start), "2026-09-12T00:00:00.000Z");
        assert_eq!(timestamp(daily_reset), "2026-09-13T00:00:00.000Z");

        let (weekly_start, weekly_reset) = bounds("weekly", now);
        assert_eq!(timestamp(weekly_start), "2026-09-07T00:00:00.000Z");
        assert_eq!(timestamp(weekly_reset), "2026-09-14T00:00:00.000Z");
    }

    #[test]
    fn status_must_match_policy_and_saturates_after_limit_reduction() {
        let policy = SignupLimitPolicy {
            enabled: true,
            period: "monthly",
            limit: 100,
            period_start: "2026-07-01T00:00:00.000Z".into(),
            resets_at: "2026-08-01T00:00:00.000Z".into(),
        };
        let mut status = SignupLimitStatus {
            status: "available".into(),
            used: 88,
            remaining: 12,
            limit: 100,
            period: "monthly".into(),
            resets_at: policy.resets_at.clone(),
        };
        assert!(valid_status(&status, &policy));

        status.remaining = 11;
        assert!(!valid_status(&status, &policy));
        status.remaining = 12;
        status.resets_at = "2026-09-01T00:00:00.000Z".into();
        assert!(!valid_status(&status, &policy));

        status.resets_at = policy.resets_at.clone();
        status.used = 120;
        status.remaining = 0;
        assert!(valid_status(&status, &policy));
    }
}
