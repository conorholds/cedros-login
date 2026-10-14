//! Account email rows over the host DB seam (`cedros-login:user-emails`).
//!
//! Email uniqueness is enforced by route-level checks in Wasm mode. Pending
//! unverified rows block signups until they expire after 48 hours; verified rows
//! block permanently.
use crate::clock;
use crate::data::users::UserEntry;
use crate::host::db::{self, BatchOp, Query, USER_EMAILS};
use crate::host::{Result, SeamError};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub const PENDING_EMAIL_EXPIRY_SECS: i64 = 48 * 60 * 60;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct UserEmailEntry {
    pub id: String,
    pub user_id: String,
    pub email: String,
    // Always serialize (emit `null` when unverified) — never omit. The host's
    // content-model schema is fixed by the first row written; if a *verified*
    // row (verifiedAt present) lands first, later rows that OMIT the field are
    // rejected at the seam (`db_error`), silently breaking every unverified
    // signup. Emitting `null` matches every other model (sessions/users/
    // memberships keep their Options un-skipped) and the host accepts it.
    #[serde(default)]
    pub verified_at: Option<String>,
    pub is_primary: bool,
    pub created_at: String,
}

/// Internal host row revision used by canonical-email conditional writes.
/// This metadata is deliberately separate from the public/domain payload.
pub struct VersionedUserEmailEntry {
    pub value: UserEmailEntry,
    pub entry_key: String,
    pub updated_at: String,
}

impl UserEmailEntry {
    pub fn new(user_id: &str, email: String, verified: bool, is_primary: bool) -> Self {
        let now = clock::now_iso();
        Self {
            id: Uuid::new_v4().to_string(),
            user_id: user_id.to_string(),
            email,
            verified_at: verified.then_some(now.clone()),
            is_primary,
            created_at: now,
        }
    }

    pub fn is_verified(&self) -> bool {
        self.verified_at.is_some()
    }

    pub fn blocks_signup(&self) -> bool {
        self.is_primary
            || self.is_verified()
            || self.created_at >= clock::ago_iso(PENDING_EMAIL_EXPIRY_SECS)
    }
}

pub fn create(row: &UserEmailEntry) -> Result<()> {
    delete_expired_unverified()?;
    db::write(USER_EMAILS, &row.id, row)
}

pub(crate) fn create_op(row: &UserEmailEntry) -> Result<BatchOp> {
    Ok(BatchOp::write(USER_EMAILS, &row.id, value(row)?))
}

pub fn list_by_user(user_id: &str) -> Result<Vec<UserEmailEntry>> {
    delete_expired_unverified()?;
    let mut rows = db::read_typed(
        USER_EMAILS,
        &Query {
            filters: vec![db::eq("userId", user_id)],
            order_by: Some(db::asc("createdAt")),
            ..Default::default()
        },
    )?;
    rows.sort_by_key(|row: &UserEmailEntry| (!row.is_primary, row.created_at.clone()));
    Ok(rows)
}

/// Delete every non-primary mailbox alias for an account. Initial ownership
/// claims use this to remove recovery addresses added during pre-registration.
pub fn secondary_delete_operations(user_id: &str) -> Result<Vec<BatchOp>> {
    let rows: Vec<UserEmailEntry> = db::read_typed(
        USER_EMAILS,
        &Query {
            filters: vec![db::eq("userId", user_id)],
            ..Default::default()
        },
    )?;
    Ok(rows
        .into_iter()
        .filter(|row| !row.is_primary)
        .map(|row| BatchOp::delete(USER_EMAILS, &row.id))
        .collect())
}

pub fn list_by_user_versioned(user_id: &str) -> Result<Vec<VersionedUserEmailEntry>> {
    delete_expired_unverified()?;
    let mut rows = db::read_entries(
        USER_EMAILS,
        &Query {
            filters: vec![db::eq("userId", user_id)],
            order_by: Some(db::asc("createdAt")),
            ..Default::default()
        },
    )?
    .into_iter()
    .map(versioned)
    .collect::<Result<Vec<_>>>()?;
    rows.sort_by_key(|row| (!row.value.is_primary, row.value.created_at.clone()));
    Ok(rows)
}

fn versioned(entry: db::Entry) -> Result<VersionedUserEmailEntry> {
    let updated_at = entry.updated_at.ok_or_else(|| {
        SeamError::Db("user email row is missing host revision metadata".to_string())
    })?;
    let value: UserEmailEntry = serde_json::from_value(entry.payload)
        .map_err(|error| SeamError::Encoding(error.to_string()))?;
    if value.id != entry.entry_key {
        return Err(SeamError::Db(
            "user email row identity does not match its entry key".to_string(),
        ));
    }
    Ok(VersionedUserEmailEntry {
        value,
        entry_key: entry.entry_key,
        updated_at,
    })
}

pub fn find_by_id(id: &str) -> Result<Option<UserEmailEntry>> {
    delete_expired_unverified()?;
    db::find_one(USER_EMAILS, &Query::key(id))
}

pub fn find_active_by_email(email: &str) -> Result<Option<UserEmailEntry>> {
    match find_by_email(email)? {
        Some(row) if row.blocks_signup() => Ok(Some(row)),
        Some(row) => {
            let _ = db::delete(USER_EMAILS, &row.id);
            Ok(None)
        }
        None => Ok(None),
    }
}

pub fn find_verified_by_email(email: &str) -> Result<Option<UserEmailEntry>> {
    Ok(find_by_email(email)?
        .into_iter()
        .find(UserEmailEntry::is_verified))
}

pub fn email_blocks_signup(email: &str) -> Result<bool> {
    Ok(find_active_by_email(email)?.is_some())
}

/// Whether `email` is still a verified login/recovery identifier for `user`.
/// Tokens sent to an address cease to authorize changes once that address is
/// removed from the account.
pub fn is_verified_for_user(user: &UserEntry, email: &str) -> Result<bool> {
    let email = crate::services::email::normalize_email(email);
    if user.email_verified
        && user
            .email
            .as_deref()
            .map(crate::services::email::normalize_email)
            .as_deref()
            == Some(email.as_str())
    {
        return Ok(true);
    }
    Ok(find_verified_by_email(&email)?.is_some_and(|row| row.user_id == user.id))
}

/// Instant-link signup starts with an unverified primary address. Existing
/// accounts require the target to remain a verified identifier.
pub fn is_live_instant_link_target(user: &UserEntry, email: &str) -> Result<bool> {
    let email = crate::services::email::normalize_email(email);
    if is_unverified_primary_target(user, &email) {
        return Ok(true);
    }
    is_verified_for_user(user, &email)
}

/// Whether a proof for `email` is allowed to establish ownership of the
/// account's currently unverified canonical mailbox.
pub fn is_unverified_primary_target(user: &UserEntry, email: &str) -> bool {
    let email = crate::services::email::normalize_email(email);
    !user.email_verified
        && user
            .email
            .as_deref()
            .map(crate::services::email::normalize_email)
            .as_deref()
            == Some(email.as_str())
}

pub fn ensure_primary(user: &UserEntry) -> Result<()> {
    let Some(email) = user.email.clone() else {
        return Ok(());
    };
    if list_by_user(&user.id)?.iter().any(|row| row.email == email) {
        return Ok(());
    }
    create(&UserEmailEntry::new(
        &user.id,
        email,
        user.email_verified,
        true,
    ))
}

pub struct VerifiedPrimaryWrite {
    pub entry_key: String,
    pub expected_updated_at: Option<String>,
    pub data: serde_json::Value,
}

/// Prepare a version-bound primary-email write after an email proof succeeds.
pub fn verified_primary_write(user: &UserEntry) -> Result<Option<VerifiedPrimaryWrite>> {
    primary_write(user, true)
}

/// Prepare a version-bound canonical-email row write, optionally marking it
/// verified. Keeping the existing verification state is required when a
/// verified secondary email authorizes login but not ownership of an
/// unrelated unverified primary address.
pub fn primary_write(
    user: &UserEntry,
    mark_verified: bool,
) -> Result<Option<VerifiedPrimaryWrite>> {
    let Some(email) = user.email.as_deref() else {
        return Ok(None);
    };
    let rows = db::read_entries(
        USER_EMAILS,
        &Query {
            filters: vec![db::eq("userId", user.id.as_str())],
            order_by: Some(db::asc("createdAt")),
            ..Default::default()
        },
    )?;
    let versioned = rows
        .into_iter()
        .map(versioned)
        .collect::<Result<Vec<_>>>()?;
    if let Some(versioned) = versioned.into_iter().find(|row| row.value.email == email) {
        let mut row = versioned.value;
        row.is_primary = true;
        if mark_verified {
            row.verified_at.get_or_insert_with(clock::now_iso);
        }
        return Ok(Some(VerifiedPrimaryWrite {
            entry_key: versioned.entry_key,
            expected_updated_at: Some(versioned.updated_at),
            data: value(&row)?,
        }));
    }
    let row = UserEmailEntry::new(&user.id, email.to_string(), mark_verified, true);
    Ok(Some(VerifiedPrimaryWrite {
        entry_key: row.id.clone(),
        expected_updated_at: None,
        data: value(&row)?,
    }))
}

pub fn sweep_expired(cutoff_iso: &str, page: u32) -> Result<u64> {
    let rows: Vec<UserEmailEntry> = db::read_typed(
        USER_EMAILS,
        &Query {
            filters: vec![db::lt("createdAt", cutoff_iso)],
            order_by: Some(db::asc("createdAt")),
            limit: Some(page),
            ..Default::default()
        },
    )?;
    let ops: Vec<_> = rows
        .iter()
        .filter(|row| !row.is_primary && !row.is_verified())
        .map(|row| BatchOp::delete(USER_EMAILS, &row.id))
        .collect();
    db::batch(&ops)
}

pub(crate) fn find_by_email(email: &str) -> Result<Option<UserEmailEntry>> {
    db::find_one(
        USER_EMAILS,
        &Query {
            filters: vec![db::eq("email", email)],
            limit: Some(1),
            ..Default::default()
        },
    )
}

fn delete_expired_unverified() -> Result<u64> {
    sweep_expired(&clock::ago_iso(PENDING_EMAIL_EXPIRY_SECS), 500)
}

fn value(row: &UserEmailEntry) -> Result<serde_json::Value> {
    serde_json::to_value(row).map_err(|err| SeamError::Encoding(err.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn user(email: &str, verified: bool) -> UserEntry {
        serde_json::from_value(serde_json::json!({
            "id":"u1", "email":email, "emailVerified":verified,
            "passwordHash":"hash", "name":null, "username":null, "picture":null,
            "walletAddress":null, "googleId":null, "appleId":null,
            "authMethods":["password"], "suspendedAt":null, "isSystemAdmin":false,
            "createdAt":"t", "updatedAt":"t", "lastLoginAt":null,
            "welcomeCompletedAt":null, "avatarContentType":null
        }))
        .unwrap()
    }

    #[test]
    fn pending_rows_stop_blocking_after_expiry() {
        let mut row = UserEmailEntry::new("u1", "user@example.com".into(), false, false);
        row.created_at = clock::ago_iso(PENDING_EMAIL_EXPIRY_SECS + 1);
        assert!(!row.blocks_signup());
    }

    #[test]
    fn primary_rows_never_expire_from_identity_ownership() {
        let mut row = UserEmailEntry::new("u1", "user@example.com".into(), false, true);
        row.created_at = clock::ago_iso(PENDING_EMAIL_EXPIRY_SECS + 1);
        assert!(row.blocks_signup());
    }

    #[test]
    fn serializes_camelcase_shape() {
        let row = UserEmailEntry::new("u1", "user@example.com".into(), true, true);
        let json = serde_json::to_value(row).unwrap();
        assert_eq!(json["userId"], "u1");
        assert_eq!(json["isPrimary"], true);
        assert!(json["verifiedAt"].is_string());
    }

    #[test]
    fn recovery_target_must_still_belong_to_the_user() {
        assert!(
            is_verified_for_user(&user("current@example.com", true), "CURRENT@example.com")
                .unwrap()
        );
        db::test_support::with_db(
            |op, collection, _| {
                assert_eq!(op, "read");
                assert_eq!(collection.model, USER_EMAILS.model);
                Ok(serde_json::json!({"entries": []}))
            },
            || {
                assert!(!is_verified_for_user(
                    &user("current@example.com", true),
                    "removed@example.com"
                )
                .unwrap());
            },
        );
    }

    #[test]
    fn initial_instant_link_can_verify_its_unverified_primary() {
        assert!(
            is_live_instant_link_target(&user("new@example.com", false), "new@example.com")
                .unwrap()
        );
        assert!(is_unverified_primary_target(
            &user("new@example.com", false),
            "NEW@example.com"
        ));
        assert!(!is_unverified_primary_target(
            &user("victim@example.com", false),
            "attacker@example.com"
        ));
    }
}
