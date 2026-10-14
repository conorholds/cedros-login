//! Users over the host DB seam (`cedros-login:users`), keyed by user id.
//!
//! Mirrors `server/src/repositories/user_repository.rs::UserEntity`. Production
//! activation requires `cedros-data:database-concurrency-v1`, whose host-owned
//! indexes enforce normalized email/provider/wallet/username uniqueness beneath
//! this JSONB seam. Route lookups remain useful for friendly validation but are
//! not the concurrency authority. `password_hash` is Argon2 output and is never
//! logged or returned.
use crate::host::db::{self, Query, USERS};
use crate::host::{Result, SeamError};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct UserEntry {
    pub id: String,
    pub email: Option<String>,
    pub email_verified: bool,
    pub password_hash: Option<String>,
    pub name: Option<String>,
    pub username: Option<String>,
    pub picture: Option<String>,
    pub wallet_address: Option<String>,
    /// Login-owned EVM wallet link. Older rows predate this projection and
    /// deserialize as unlinked; only proof-backed Login flows or trusted
    /// identity migration may populate it.
    #[serde(default)]
    pub evm_wallet_address: Option<String>,
    pub google_id: Option<String>,
    pub apple_id: Option<String>,
    #[serde(default)]
    pub auth_methods: Vec<String>,
    /// Administrative account suspension. Suspended accounts cannot create or
    /// use sessions; `None` is active and preserves pre-contract rows.
    #[serde(default)]
    pub suspended_at: Option<String>,
    pub is_system_admin: bool,
    pub created_at: String,
    pub updated_at: String,
    pub last_login_at: Option<String>,
    pub welcome_completed_at: Option<String>,
    /// Content type of the user's uploaded avatar (object key `avatars/{id}`);
    /// `None` means no uploaded avatar (the `picture` URL, if any, is external).
    #[serde(default)]
    pub avatar_content_type: Option<String>,
}

/// Internal database row metadata needed for host-owned compare-and-swap
/// operations. `updated_at` is the host entry revision, not the similarly named
/// domain timestamp inside [`UserEntry`], and is never serialized to clients.
pub struct VersionedUserEntry {
    pub value: UserEntry,
    pub entry_key: String,
    pub updated_at: String,
}

/// Convert an unverified, pre-registered account into an email-owned account
/// after the mailbox holder proves control. Credentials chosen before mailbox
/// verification are not evidence that they were chosen by the mailbox owner.
pub fn reset_unverified_credentials(user: &mut UserEntry) -> bool {
    if user.email_verified || user.auth_methods.iter().any(|method| method == "email") {
        return false;
    }
    user.password_hash = None;
    user.wallet_address = None;
    user.evm_wallet_address = None;
    user.google_id = None;
    user.apple_id = None;
    user.auth_methods.clear();
    user.auth_methods.push("email".to_string());
    true
}

/// Legacy internal SSO markers remain on older user rows during migration to
/// the dedicated identity index. Never expose their hashes as public
/// auth-method names.
pub fn public_auth_methods(user: &UserEntry) -> Vec<String> {
    let mut methods = Vec::new();
    for method in &user.auth_methods {
        let public = if method.starts_with("sso:") {
            "sso"
        } else {
            method.as_str()
        };
        if !methods.iter().any(|existing| existing == public) {
            methods.push(public.to_string());
        }
    }
    methods
}

/// Replace only the account snapshot that the caller read. Profile writes and
/// password rehashes must never restore credentials changed by another request.
pub fn update_if_current(expected: &UserEntry, updated: &UserEntry) -> Result<()> {
    let current = db::read_versioned::<UserEntry>(USERS, &expected.id)?
        .ok_or_else(|| SeamError::Db("account missing".into()))?;
    if current.value != *expected || expected.id != updated.id {
        return Err(SeamError::DbConflict {
            category: crate::host::DbConflictCategory::Precondition,
            operation: "update-user".into(),
        });
    }
    let data = serde_json::to_value(updated).map_err(|e| SeamError::Encoding(e.to_string()))?;
    db::compare_and_set(
        &[current.condition],
        &[db::BatchOp::write(USERS, &updated.id, data)],
    )
}

/// Update only the verified snapshot; failure leaves the caller's value intact.
pub fn touch_last_login(user: &mut UserEntry) -> Result<()> {
    let mut updated = user.clone();
    let now = crate::clock::now_iso();
    updated.last_login_at = Some(now.clone());
    updated.updated_at = now;
    update_if_current(user, &updated)?;
    *user = updated;
    Ok(())
}

pub fn find_by_ids(ids: &[String]) -> Result<std::collections::HashMap<String, UserEntry>> {
    db::read_keyed(USERS, ids)
}

pub fn find_by_id(id: &str) -> Result<Option<UserEntry>> {
    db::find_one(USERS, &Query::key(id))
}

pub fn find_by_id_versioned(id: &str) -> Result<Option<VersionedUserEntry>> {
    db::read_entries(USERS, &Query::key(id))?
        .into_iter()
        .next()
        .map(versioned)
        .transpose()
}

fn versioned(entry: db::Entry) -> Result<VersionedUserEntry> {
    let updated_at = entry
        .updated_at
        .ok_or_else(|| SeamError::Db("user row is missing host revision metadata".to_string()))?;
    let value: UserEntry = serde_json::from_value(entry.payload)
        .map_err(|error| SeamError::Encoding(error.to_string()))?;
    if value.id != entry.entry_key {
        return Err(SeamError::Db(
            "user row identity does not match its entry key".to_string(),
        ));
    }
    Ok(VersionedUserEntry {
        value,
        entry_key: entry.entry_key,
        updated_at,
    })
}

fn find_by(field: &str, value: &str) -> Result<Option<UserEntry>> {
    db::find_one(
        USERS,
        &Query {
            filters: vec![db::eq(field, value)],
            limit: Some(1),
            ..Default::default()
        },
    )
}

pub fn find_by_email(email: &str) -> Result<Option<UserEntry>> {
    find_by("email", email)
}
pub fn find_by_google_id(google_id: &str) -> Result<Option<UserEntry>> {
    find_by("googleId", google_id)
}
pub fn find_by_apple_id(apple_id: &str) -> Result<Option<UserEntry>> {
    find_by("appleId", apple_id)
}
pub fn find_by_wallet(wallet_address: &str) -> Result<Option<UserEntry>> {
    find_by("walletAddress", wallet_address)
}
pub fn find_by_username(username: &str) -> Result<Option<UserEntry>> {
    find_by("username", username)
}

/// Resolve pre-durable SSO accounts whose opaque provider/subject binding was
/// stored only in `authMethods`. The host seam cannot query array membership,
/// so this one-time compatibility path scans bounded pages and fails closed if
/// historical corruption produced duplicate owners. A successful login writes
/// the dedicated indexed identity row, making future lookups constant-time and
/// independent of the user's current email address.
pub fn find_by_legacy_sso_binding(binding: &str) -> Result<Option<UserEntry>> {
    const PAGE: u32 = 500;
    if !crate::data::sso_identities::is_valid_id(binding) {
        return Ok(None);
    }
    let total = count()?;
    let mut offset = 0_u32;
    let mut found: Option<UserEntry> = None;
    while u64::from(offset) < total {
        let page = list_all(PAGE, offset)?;
        if page.is_empty() {
            return Err(SeamError::Db(
                "user directory changed during legacy SSO identity migration".into(),
            ));
        }
        for user in &page {
            if user.auth_methods.iter().any(|method| method == binding) {
                if found.is_some() {
                    return Err(SeamError::Db(
                        "legacy SSO identity has multiple owners".into(),
                    ));
                }
                found = Some(user.clone());
            }
        }
        offset = offset
            .checked_add(page.len() as u32)
            .ok_or_else(|| SeamError::Db("user directory is too large to migrate".into()))?;
    }
    Ok(found)
}

/// Total registered users (admin stats).
pub fn count() -> Result<u64> {
    db::count(USERS, &Query::default())
}

/// Count users created strictly after `created_after` (RFC3339), or all users
/// when `None` — backs the relying-party `/v1/users/count` directory contract.
pub fn count_created_after(created_after: Option<&str>) -> Result<u64> {
    let filters = match created_after {
        Some(iso) => vec![db::gt("createdAt", iso)],
        None => Vec::new(),
    };
    db::count(
        USERS,
        &Query {
            filters,
            ..Default::default()
        },
    )
}

/// Count users with a verified email (admin stats — verified-account rate).
pub fn count_verified() -> Result<u64> {
    db::count(
        USERS,
        &Query {
            filters: vec![db::eq("emailVerified", true)],
            ..Default::default()
        },
    )
}

/// Count users holding `email` (already normalized). This is an invariant
/// diagnostic; host-owned unique indexes prevent concurrent duplicate commits.
pub fn count_by_email(email: &str) -> Result<u64> {
    db::count(
        USERS,
        &Query {
            filters: vec![db::eq("email", email)],
            ..Default::default()
        },
    )
}

/// One page of users, newest first (admin listing).
pub fn list_all(limit: u32, offset: u32) -> Result<Vec<UserEntry>> {
    db::read_typed(
        USERS,
        &Query {
            order_by: Some(db::desc("createdAt")),
            limit: Some(limit),
            offset: Some(offset),
            ..Default::default()
        },
    )
}

/// Number of system-admin users — backs the setup gate (`needsSetup`/first-admin).
pub fn count_system_admins() -> Result<u64> {
    db::count(
        USERS,
        &Query {
            filters: vec![db::eq("isSystemAdmin", true)],
            ..Default::default()
        },
    )
}

pub fn find_first_system_admin() -> Result<Option<UserEntry>> {
    db::find_one(
        USERS,
        &Query {
            filters: vec![db::eq("isSystemAdmin", true)],
            order_by: Some(db::asc("createdAt")),
            limit: Some(1),
            ..Default::default()
        },
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_all_fields_camelcase() {
        let u = UserEntry {
            id: "u1".into(),
            email: Some("u@x.test".into()),
            email_verified: true,
            password_hash: Some("$argon2id$...".into()),
            name: Some("U".into()),
            username: None,
            picture: None,
            wallet_address: None,
            evm_wallet_address: Some("0x1111111111111111111111111111111111111111".into()),
            google_id: Some("g1".into()),
            apple_id: None,
            auth_methods: vec!["password".into(), "google".into()],
            suspended_at: None,
            is_system_admin: false,
            created_at: "2026-05-31T00:00:00.000Z".into(),
            updated_at: "2026-05-31T00:00:00.000Z".into(),
            last_login_at: None,
            welcome_completed_at: None,
            avatar_content_type: None,
        };
        let j = serde_json::to_value(&u).unwrap();
        assert_eq!(j["emailVerified"], true);
        assert_eq!(j["passwordHash"], "$argon2id$...");
        assert_eq!(
            j["evmWalletAddress"],
            "0x1111111111111111111111111111111111111111"
        );
        assert_eq!(j["googleId"], "g1");
        assert_eq!(j["authMethods"][1], "google");
        assert!(j["suspendedAt"].is_null());
        assert_eq!(serde_json::from_value::<UserEntry>(j).unwrap(), u);
    }

    #[test]
    fn evm_wallet_defaults_unlinked_for_pre_projection_rows() {
        let user: UserEntry = serde_json::from_value(serde_json::json!({
            "id":"u1", "email":null, "emailVerified":false,
            "passwordHash":null, "name":null, "username":null, "picture":null,
            "walletAddress":null, "googleId":null, "appleId":null,
            "authMethods":[], "suspendedAt":null, "isSystemAdmin":false,
            "createdAt":"2026-05-31T00:00:00Z", "updatedAt":"2026-05-31T00:00:00Z",
            "lastLoginAt":null, "welcomeCompletedAt":null, "avatarContentType":null
        }))
        .unwrap();

        assert!(user.evm_wallet_address.is_none());
    }

    #[test]
    fn mailbox_claim_removes_preverified_credentials() {
        let mut user: UserEntry = serde_json::from_value(serde_json::json!({
            "id":"u1", "email":"victim@example.com", "emailVerified":false,
            "passwordHash":"attacker-hash", "name":null, "username":null, "picture":null,
            "walletAddress":"wallet", "evmWalletAddress":"0xabc", "googleId":"g1",
            "appleId":"a1", "authMethods":["password","webauthn","google"],
            "suspendedAt":null, "isSystemAdmin":false, "createdAt":"t", "updatedAt":"t",
            "lastLoginAt":null, "welcomeCompletedAt":null, "avatarContentType":null
        }))
        .unwrap();

        assert!(reset_unverified_credentials(&mut user));
        assert!(user.password_hash.is_none());
        assert!(user.wallet_address.is_none());
        assert!(user.google_id.is_none());
        assert_eq!(user.auth_methods, ["email"]);
    }

    #[test]
    fn public_methods_hide_sso_binding_material() {
        let user: UserEntry = serde_json::from_value(serde_json::json!({
            "id":"u1", "email":"user@example.com", "emailVerified":true,
            "passwordHash":null, "name":null, "username":null, "picture":null,
            "walletAddress":null, "googleId":null, "appleId":null,
            "authMethods":["sso","sso:binding-hash","sso:other-hash"],
            "suspendedAt":null, "isSystemAdmin":false, "createdAt":"t", "updatedAt":"t",
            "lastLoginAt":null, "welcomeCompletedAt":null, "avatarContentType":null
        }))
        .unwrap();

        assert_eq!(public_auth_methods(&user), ["sso"]);
    }

    #[test]
    fn prior_mailbox_claim_is_not_reset_again_at_verification() {
        let mut user: UserEntry = serde_json::from_value(serde_json::json!({
            "id":"u1", "email":"owner@example.com", "emailVerified":false,
            "passwordHash":"owner-hash", "name":null, "username":null, "picture":null,
            "walletAddress":null, "googleId":null, "appleId":null,
            "authMethods":["email","password"], "suspendedAt":null,
            "isSystemAdmin":false, "createdAt":"t", "updatedAt":"t",
            "lastLoginAt":null, "welcomeCompletedAt":null, "avatarContentType":null
        }))
        .unwrap();
        assert!(!reset_unverified_credentials(&mut user));
        assert_eq!(user.password_hash.as_deref(), Some("owner-hash"));
    }

    #[test]
    fn legacy_sso_binding_resolves_independently_of_current_email() {
        use crate::host::db::test_support::with_db;

        let binding = format!("sso:{}", "a".repeat(64));
        let expected_binding = binding.clone();
        with_db(
            move |op, collection, query| {
                assert_eq!(collection.model, USERS.model);
                match op {
                    "count" => Ok(serde_json::json!({"count": 1})),
                    "read" => {
                        assert_eq!(query.limit, Some(500));
                        assert_eq!(query.offset, Some(0));
                        Ok(serde_json::json!({"entries":[{
                            "entry_key":"legacy-user",
                            "payload": {
                                "id":"legacy-user",
                                "email":"changed@example.com",
                                "emailVerified":true,
                                "passwordHash":null,
                                "name":null,
                                "username":null,
                                "picture":null,
                                "walletAddress":null,
                                "evmWalletAddress":null,
                                "googleId":null,
                                "appleId":null,
                                "authMethods":["sso", expected_binding],
                                "suspendedAt":null,
                                "isSystemAdmin":false,
                                "createdAt":"2026-01-01T00:00:00.000Z",
                                "updatedAt":"2026-01-01T00:00:00.000Z",
                                "lastLoginAt":null,
                                "welcomeCompletedAt":null,
                                "avatarContentType":null
                            }
                        }]}))
                    }
                    _ => panic!("unexpected database operation"),
                }
            },
            || {
                let found = find_by_legacy_sso_binding(&binding).unwrap().unwrap();
                assert_eq!(found.id, "legacy-user");
                assert_eq!(found.email.as_deref(), Some("changed@example.com"));
            },
        );
    }
}
