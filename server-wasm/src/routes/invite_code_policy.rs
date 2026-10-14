use uuid::Uuid;

use super::invite_code_utils::generate_invite_code;
use super::RouteError;
use crate::clock;
use crate::data::invite_codes::{self, InviteCode};
use crate::host::settings;

const ENABLED_KEY: &str = "invite_codes_enabled";
const USERS_CAN_ISSUE_KEY: &str = "invite_codes_users_can_issue";
const PER_USER_KEY: &str = "invite_codes_per_user";
const RESET_DAYS_KEY: &str = "invite_codes_reset_interval_days";

struct InviteCodeConfig {
    enabled: bool,
    users_can_issue: bool,
    per_user: u32,
    reset_interval_days: u32,
}

pub(super) fn gate_enabled() -> bool {
    settings::bool(ENABLED_KEY, false)
}

pub(super) fn list_or_create_user_codes(user_id: &str) -> Result<Vec<InviteCode>, RouteError> {
    let cfg = config();
    if !cfg.enabled || !cfg.users_can_issue || cfg.per_user == 0 {
        return Ok(Vec::new());
    }
    let batch_key = current_batch_key(cfg.reset_interval_days);
    deactivate_stale_user_codes(user_id, &batch_key)?;

    let mut codes = invite_codes::list_user_codes(user_id)?;
    let active_current = codes
        .iter()
        .filter(|c| {
            c.active && c.uses_count == 0 && c.batch_key.as_deref() == Some(batch_key.as_str())
        })
        .count() as u32;

    for _ in active_current..cfg.per_user {
        let now = clock::now_iso();
        let entity = InviteCode {
            id: Uuid::new_v4().to_string(),
            code: generate_invite_code(),
            created_by: Some(user_id.to_string()),
            owner_user_id: Some(user_id.to_string()),
            max_uses: Some(1),
            uses_count: 0,
            starts_at: None,
            expires_at: user_code_expires_at(cfg.reset_interval_days),
            active: true,
            batch_key: Some(batch_key.clone()),
            discount_percent: None,
            discount_months: None,
            created_at: now.clone(),
            updated_at: now,
        };
        invite_codes::create(&entity)?;
        codes.push(entity);
    }
    codes.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(codes)
}

fn config() -> InviteCodeConfig {
    InviteCodeConfig {
        enabled: settings::bool(ENABLED_KEY, false),
        users_can_issue: settings::bool(USERS_CAN_ISSUE_KEY, false),
        per_user: u32_setting(PER_USER_KEY, 0, 100),
        reset_interval_days: u32_setting(RESET_DAYS_KEY, 30, 3650),
    }
}

fn u32_setting(key: &str, default: u32, max: u32) -> u32 {
    settings::get(key)
        .ok()
        .flatten()
        .and_then(|v| v.trim().trim_matches('"').parse::<u32>().ok())
        .map(|n| n.min(max))
        .unwrap_or(default)
}

fn deactivate_stale_user_codes(user_id: &str, current_batch_key: &str) -> Result<(), RouteError> {
    for mut code in invite_codes::list_user_codes(user_id)? {
        if code.active
            && code.uses_count == 0
            && code.batch_key.as_deref() != Some(current_batch_key)
        {
            code.active = false;
            code.updated_at = clock::now_iso();
            invite_codes::update(&code)?;
        }
    }
    Ok(())
}

fn current_batch_key(reset_interval_days: u32) -> String {
    if reset_interval_days == 0 {
        return "never".to_string();
    }
    let seconds = i64::from(reset_interval_days) * 86_400;
    let bucket = (clock::now_unix() as i64) / seconds;
    format!("{reset_interval_days}d:{bucket}")
}

fn user_code_expires_at(reset_interval_days: u32) -> Option<String> {
    if reset_interval_days == 0 {
        None
    } else {
        Some(clock::in_secs(i64::from(reset_interval_days) * 86_400))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn batch_key_never_when_no_reset() {
        assert_eq!(current_batch_key(0), "never");
        assert!(current_batch_key(30).starts_with("30d:"));
    }
}
