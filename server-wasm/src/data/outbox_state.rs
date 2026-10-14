//! Persisted outbox wire model and pure lease/retry state transitions.
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

pub const STATUS_PENDING: &str = "pending";
pub const STATUS_SENDING: &str = "sending";
pub const STATUS_FAILED: &str = "failed";

pub(super) const DEFAULT_MAX_ATTEMPTS: u32 = 5;
const BACKOFF_BASE_SECS: i64 = 60;
pub(super) const BACKOFF_CAP_SECS: i64 = 3600;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct OutboxEntry {
    pub id: String,
    /// Account owning this message, when known. Lets atomic account deletion
    /// remove queued token-bearing mail; pre-account invitations remain null.
    #[serde(default)]
    pub user_id: Option<String>,
    pub to: String,
    pub subject: String,
    pub html_body: Option<String>,
    pub text_body: Option<String>,
    pub status: String,
    pub attempts: u32,
    pub max_attempts: u32,
    pub created_at: String,
    pub next_attempt_at: String,
    pub last_error: Option<String>,
    /// Set only after the host provider returns success. Additive for old rows.
    #[serde(default)]
    pub provider_accepted_at: Option<String>,
    /// Opaque host/provider reference, when the host returns one.
    #[serde(default)]
    pub provider_message_ref: Option<String>,
    /// Host-owned worker lease. Optional/defaulted for legacy pending rows.
    #[serde(default)]
    pub lease_owner: Option<String>,
    /// Host transaction-time lease expiry. Optional/defaulted for legacy rows.
    #[serde(default)]
    pub lease_expires_at: Option<String>,
    /// Preserve additive host fields on every guest rewrite.
    #[serde(default, flatten)]
    pub host_fields: Map<String, Value>,
}

/// Aggregate, redacted outcomes from one bounded dispatch pass.
#[derive(Debug, Default, PartialEq)]
pub struct DispatchStats {
    /// More due candidates existed than this bounded dispatch could process.
    pub has_more: bool,
    pub sent: u64,
    pub failed: u64,
    pub retried: u64,
    pub duplicate_risk: u64,
    pub acknowledgement_pending: u64,
    pub acknowledgement_recovered: u64,
}

pub(super) fn select_candidates(
    mut pending: Vec<OutboxEntry>,
    mut sending: Vec<OutboxEntry>,
    now_iso: &str,
    limit: u32,
) -> Vec<OutboxEntry> {
    sending.retain(|entry| {
        entry
            .lease_expires_at
            .as_deref()
            .is_some_and(|expires_at| expires_at <= now_iso)
    });
    pending.extend(sending);
    pending.retain(|entry| entry.next_attempt_at.as_str() <= now_iso);
    pending.sort_by(|left, right| {
        (&left.next_attempt_at, &left.id).cmp(&(&right.next_attempt_at, &right.id))
    });
    pending.dedup_by(|left, right| left.id == right.id);
    pending.truncate(limit as usize);
    pending
}

/// Exponential backoff: base·2^(attempts-1), capped.
pub(super) fn backoff_secs(attempts: u32) -> i64 {
    let shift = attempts.saturating_sub(1).min(20);
    BACKOFF_BASE_SECS
        .saturating_mul(1_i64 << shift)
        .min(BACKOFF_CAP_SECS)
}
