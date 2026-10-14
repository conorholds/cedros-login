//! Invite-code records and per-user registration-gate state over the host DB
//! seam (`cedros-login:invite-codes` + `cedros-login:invite-code-accounts`,
//! org-db). Mirrors server/src/repositories/invite_code_repository.rs.
//!
//! Codes are keyed by id; the gate-account row is keyed by user id. Window
//! checks use lexical RFC3339 compares (the seam convention — see host::db).
//! Redemption history is not modeled separately: `uses_count` on the code is the
//! source of truth for use limits. The host's redemption transaction stamps a
//! durable receipt (`redemption_id` + `invite_code_id`) onto the account row;
//! the invite-discount lookup resolves a user's discount through that receipt.
#[path = "invite_codes/gate_release.rs"]
mod gate_release;
pub use gate_release::release_gate;
#[path = "invite_codes/redemption.rs"]
mod redemption;
#[cfg(test)]
use redemption::{decode_redemption_output, redemption_params};
pub use redemption::{find_account_versioned, find_by_code_versioned, redeem};

use crate::host::db::{self, Query, INVITE_CODES, INVITE_CODE_ACCOUNTS};
use crate::host::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct InviteCode {
    pub id: String,
    /// Normalized (uppercased) code value; unique across all codes.
    pub code: String,
    pub created_by: Option<String>,
    /// Set for user-issued one-time codes; `None` for admin codes.
    pub owner_user_id: Option<String>,
    pub max_uses: Option<i32>,
    pub uses_count: i32,
    pub starts_at: Option<String>,
    pub expires_at: Option<String>,
    pub active: bool,
    /// Reset-window bucket for user-issued codes (see routes::invite_codes).
    pub batch_key: Option<String>,
    /// Optional subscription discount granted on redemption (1-100; 100 =
    /// free). Always serialized (never skip) — the host seam rejects writes
    /// that omit fields present in existing rows.
    #[serde(default)]
    pub discount_percent: Option<i32>,
    pub discount_months: Option<i32>,
    pub created_at: String,
    pub updated_at: String,
}

impl InviteCode {
    /// Redeemable right now: active, within its start/expiry window, and under
    /// its use limit. `now` is a canonical RFC3339 timestamp (lexical compare).
    pub fn is_available_at(&self, now: &str) -> bool {
        self.active
            && self.starts_at.as_deref().map(|s| s <= now).unwrap_or(true)
            && self.expires_at.as_deref().map(|e| e > now).unwrap_or(true)
            && self
                .max_uses
                .map(|max| self.uses_count < max)
                .unwrap_or(true)
    }
}

/// Per-user invite-code gate state. A row with `activated_at == None` means the
/// user registered under the gate and has not redeemed a code yet (blocked).
///
/// Retained for the account's lifetime and intentionally NOT swept by the
/// cleanup job: a pending row is what KEEPS a never-redeemed account blocked at
/// login (`is_user_pending`). Deleting it on a timer would silently bypass the
/// gate (the user would then log in without ever redeeming). Reaping an
/// abandoned gated signup means deleting the whole orphan user (user + emails +
/// membership), not just this row — a heavier operation the standalone also
/// defers. The pending verification token (30-day TTL) IS swept independently.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct InviteCodeAccount {
    pub user_id: String,
    pub activated_at: Option<String>,
    pub created_at: String,
    #[serde(default)]
    pub redemption_id: Option<String>,
    #[serde(default)]
    pub invite_code_id: Option<String>,
}

pub struct VersionedInviteCode {
    pub value: InviteCode,
    pub entry_key: String,
    pub updated_at: String,
}

pub struct VersionedInviteCodeAccount {
    pub value: InviteCodeAccount,
    pub entry_key: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RedemptionOutcome {
    Applied,
    Replayed,
}

pub fn create(code: &InviteCode) -> Result<()> {
    db::write(INVITE_CODES, &code.id, code)
}

pub fn update(code: &InviteCode) -> Result<()> {
    db::write(INVITE_CODES, &code.id, code)
}

pub fn delete(id: &str) -> Result<bool> {
    db::delete(INVITE_CODES, id)
}

pub fn find_by_id(id: &str) -> Result<Option<InviteCode>> {
    db::find_one(INVITE_CODES, &Query::key(id))
}

/// All codes sharing a (normalized) code value. Code is unique, so at most one
/// exists; returned as a list so the caller can treat "no rows" as "unknown".
pub fn find_by_code(code: &str) -> Result<Vec<InviteCode>> {
    db::read_typed(
        INVITE_CODES,
        &Query {
            filters: vec![db::eq("code", code)],
            ..Default::default()
        },
    )
}

/// Admin listing, newest first, paged. `limit` is capped at 100.
pub fn list_admin(limit: u32, offset: u32) -> Result<Vec<InviteCode>> {
    db::read_typed(
        INVITE_CODES,
        &Query {
            order_by: Some(db::desc("createdAt")),
            limit: Some(limit.min(100)),
            offset: Some(offset),
            ..Default::default()
        },
    )
}

/// All codes owned by a user (user-issued one-time codes), newest first.
pub fn list_user_codes(user_id: &str) -> Result<Vec<InviteCode>> {
    db::read_typed(
        INVITE_CODES,
        &Query {
            filters: vec![db::eq("ownerUserId", user_id)],
            order_by: Some(db::desc("createdAt")),
            ..Default::default()
        },
    )
}

pub fn find_account(user_id: &str) -> Result<Option<InviteCodeAccount>> {
    db::find_one(INVITE_CODE_ACCOUNTS, &Query::key(user_id))
}

#[cfg(test)]
#[path = "invite_codes_tests.rs"]
mod tests;
