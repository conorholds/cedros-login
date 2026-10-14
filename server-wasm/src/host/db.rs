//! Typed helpers over the host `database` seam (validated, scope-checked).
//!
//! Extension mode owns no pool — all persistence flows through here. The seam is
//! a JSONB document store with relational reads (`filters`/`orderBy`/`limit`/
//! `offset`/`entryKeys`), `count`, `delete`, atomic `batch`, and `migrate`.
//! Reads return `{ entries: [{ entry_key, payload, updated_at }] }`. Conventions:
//! timestamps are RFC3339 UTC `Z` strings (lexical `lt`/`gt` == chronological);
//! ids are strings (JSON numbers lose precision above 2^53).
//!
//! A [`Collection`] bundles a content model with its `databaseAccess` id so the
//! seam call is scoped correctly; each `batch` is per-access (the seam has no
//! cross-access transaction).
use super::{from_json, to_json, DbConflictCategory, Result, SeamError};
use crate::cedros::extension::database;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[cfg(test)]
pub(crate) mod test_support;

mod batch;
mod cas;
pub use batch::*;
pub use cas::{compare_and_set, read_versioned, Condition, Versioned};

// Manifest `databaseAccess[]` ids.
pub const OAUTH_CONSENT_DB: &str = "cedros-login:oauth-consent-db";
pub const IDENTITY_DB: &str = "cedros-login:identity-db";
pub const ORG_DB: &str = "cedros-login:org-db";
pub const REGISTRATION_DB: &str = "cedros-login:registration-db";
pub const ACCOUNT_LIFECYCLE_DB: &str = "cedros-login:account-lifecycle-db";
pub const ORGANIZATION_LIFECYCLE_DB: &str = "cedros-login:organization-lifecycle-db";
pub const SETTINGS_AUDIT_DB: &str = "cedros-login:settings-audit-db";

/// A content model plus the access grant it lives under.
#[derive(Clone, Copy)]
pub struct Collection {
    pub access: &'static str,
    pub model: &'static str,
}

const fn identity(model: &'static str) -> Collection {
    Collection {
        access: IDENTITY_DB,
        model,
    }
}
const fn registration(model: &'static str) -> Collection {
    Collection {
        access: REGISTRATION_DB,
        model,
    }
}
const fn account_lifecycle(model: &'static str) -> Collection {
    Collection {
        access: ACCOUNT_LIFECYCLE_DB,
        model,
    }
}
const fn org(model: &'static str) -> Collection {
    Collection {
        access: ORG_DB,
        model,
    }
}
const fn settings_audit(model: &'static str) -> Collection {
    Collection {
        access: SETTINGS_AUDIT_DB,
        model,
    }
}

// Dedicated content models (auto-provisioned at install; no `migrate` call).
pub const OAUTH: Collection = identity("cedros-login:oauth-connections");
pub const SESSIONS: Collection = identity("cedros-login:sessions");
pub const USERS: Collection = identity("cedros-login:users");
pub const USER_EMAILS: Collection = identity("cedros-login:user-emails");
pub const NONCES: Collection = identity("cedros-login:nonces");
pub const VERIFICATIONS: Collection = identity("cedros-login:verifications");
pub const LOGIN_ATTEMPTS: Collection = identity("cedros-login:login-attempts");
pub const TOTP: Collection = identity("cedros-login:totp");
pub const API_KEYS: Collection = identity("cedros-login:api-key-records");
pub const OUTBOX: Collection = identity("cedros-login:outbox");
pub const CREDENTIALS: Collection = identity("cedros-login:credentials");
pub const SSO_PROVIDERS: Collection = identity("cedros-login:sso-providers");
pub const SSO_IDENTITIES: Collection = identity("cedros-login:sso-identities");
pub const REGISTRATION_SSO_IDENTITIES: Collection = registration("cedros-login:sso-identities");
pub const ACCOUNT_LIFECYCLE_SSO_IDENTITIES: Collection =
    account_lifecycle("cedros-login:sso-identities");
pub const ORGS: Collection = org("cedros-login:orgs");
pub const MEMBERSHIPS: Collection = org("cedros-login:memberships");
pub const CUSTOM_ROLES: Collection = org("cedros-login:custom-roles");
pub const POLICIES: Collection = org("cedros-login:policies");
pub const AUDIT: Collection = settings_audit("cedros-login:settings-audit-records");
pub const INVITES: Collection = org("cedros-login:invite-records");
/// Admin- and user-issued registration invite codes.
pub const INVITE_CODES: Collection = org("cedros-login:invite-codes");
/// Per-user invite-code registration-gate state (pending vs. activated).
pub const INVITE_CODE_ACCOUNTS: Collection = org("cedros-login:invite-code-accounts");

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Filter {
    pub field: String,
    pub op: String,
    pub value: Value,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderBy {
    pub field: String,
    pub direction: String,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Query {
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub entry_keys: Vec<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub filters: Vec<Filter>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order_by: Option<OrderBy>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<u32>,
}

impl Query {
    /// Direct lookup by one entry key.
    pub fn key(entry_key: &str) -> Self {
        Query {
            entry_keys: vec![entry_key.to_string()],
            ..Default::default()
        }
    }
}

fn f(field: &str, op: &str, value: impl Into<Value>) -> Filter {
    Filter {
        field: field.to_string(),
        op: op.to_string(),
        value: value.into(),
    }
}
pub fn eq(field: &str, v: impl Into<Value>) -> Filter {
    f(field, "eq", v)
}
pub fn lt(field: &str, v: impl Into<Value>) -> Filter {
    f(field, "lt", v)
}
/// Core's comparison contract supports inclusive bounds (EntryFilterOp::Lte).
pub fn lte(field: &str, v: impl Into<Value>) -> Filter {
    f(field, "lte", v)
}
pub fn gt(field: &str, v: impl Into<Value>) -> Filter {
    f(field, "gt", v)
}
pub fn asc(field: &str) -> OrderBy {
    OrderBy {
        field: field.to_string(),
        direction: "asc".to_string(),
    }
}
pub fn desc(field: &str) -> OrderBy {
    OrderBy {
        field: field.to_string(),
        direction: "desc".to_string(),
    }
}

/// One row from a read: the entry key plus its stored JSON payload.
#[derive(Deserialize)]
pub struct Entry {
    pub entry_key: String,
    #[serde(default)]
    pub payload: Value,
    #[serde(default)]
    pub updated_at: Option<String>,
    #[serde(default)]
    pub version: Option<String>,
}

#[derive(Deserialize)]
struct ReadResponse {
    #[serde(default)]
    entries: Vec<Entry>,
}

/// Backward-compatible encoding for structured conflicts while the database
/// WIT exposes only `host-error.message`. This exact, PII-free format is part of
/// `cedros-data:database-concurrency-v1`; all other messages remain opaque.
const CONFLICT_MARKER_PREFIX: &str = "cedros.db.v1|";

fn db_err(e: database::HostError) -> SeamError {
    parse_conflict_marker(&e.message).unwrap_or(SeamError::Db(e.message))
}

fn parse_conflict_marker(message: &str) -> Option<SeamError> {
    let marker = message.strip_prefix(CONFLICT_MARKER_PREFIX)?;
    let (category, operation) = marker.split_once('|')?;
    if operation.is_empty()
        || operation.len() > 128
        || !operation
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || b"._:-".contains(&byte))
    {
        return None;
    }
    let category = match category {
        "unique" => DbConflictCategory::Unique,
        "precondition" => DbConflictCategory::Precondition,
        "lease" => DbConflictCategory::Lease,
        _ => return None,
    };
    Some(SeamError::DbConflict {
        category,
        operation: operation.to_string(),
    })
}

/// Read raw entries (entry key + payload + updated_at).
pub fn read_entries(collection: Collection, query: &Query) -> Result<Vec<Entry>> {
    #[cfg(test)]
    if let Some(result) = test_support::invoke("read", collection, query) {
        return serde_json::from_value::<ReadResponse>(result?)
            .map(|response| response.entries)
            .map_err(|error| SeamError::Encoding(error.to_string()));
    }
    let raw =
        database::read(collection.access, collection.model, &to_json(query)?).map_err(db_err)?;
    Ok(from_json::<ReadResponse>(&raw)?.entries)
}

/// Read and deserialize each entry payload into `T`.
pub fn read_typed<T: DeserializeOwned>(collection: Collection, query: &Query) -> Result<Vec<T>> {
    read_entries(collection, query)?
        .into_iter()
        .map(|e| {
            serde_json::from_value(e.payload).map_err(|err| SeamError::Encoding(err.to_string()))
        })
        .collect()
}

/// Bulk keyed reads use an explicit limit: Core defaults unbounded-looking
/// reads to 100 rows. Chunks of 200 stay below its 1,000-key/read limit.
/// Empty keys must never become an unrestricted collection read.
pub fn read_keyed<T: DeserializeOwned>(
    collection: Collection,
    keys: &[String],
) -> Result<std::collections::HashMap<String, T>> {
    let keys: Vec<String> = keys
        .iter()
        .cloned()
        .collect::<std::collections::BTreeSet<_>>()
        .into_iter()
        .collect();
    let mut values = std::collections::HashMap::with_capacity(keys.len());
    for chunk in keys.chunks(200) {
        for entry in read_entries(
            collection,
            &Query {
                entry_keys: chunk.to_vec(),
                limit: Some(chunk.len() as u32),
                ..Default::default()
            },
        )? {
            let value = serde_json::from_value(entry.payload)
                .map_err(|error| SeamError::Encoding(error.to_string()))?;
            values.insert(entry.entry_key, value);
        }
    }
    Ok(values)
}

/// Fetch and deserialize the first matching entry payload, if any.
pub fn find_one<T: DeserializeOwned>(collection: Collection, query: &Query) -> Result<Option<T>> {
    Ok(read_typed::<T>(collection, query)?.into_iter().next())
}

/// Count matching entries without fetching rows.
pub fn count(collection: Collection, query: &Query) -> Result<u64> {
    #[cfg(test)]
    if let Some(result) = test_support::invoke("count", collection, query) {
        return Ok(result?.get("count").and_then(Value::as_u64).unwrap_or(0));
    }
    let raw =
        database::count(collection.access, collection.model, &to_json(query)?).map_err(db_err)?;
    Ok(from_json::<Value>(&raw)?
        .get("count")
        .and_then(Value::as_u64)
        .unwrap_or(0))
}

/// Upsert one entry.
pub fn write<T: Serialize>(collection: Collection, key: &str, value: &T) -> Result<()> {
    database::write(collection.access, collection.model, key, &to_json(value)?).map_err(db_err)?;
    Ok(())
}

/// Delete one entry; returns whether a row existed (idempotent).
pub fn delete(collection: Collection, key: &str) -> Result<bool> {
    let raw = database::delete(collection.access, collection.model, key).map_err(db_err)?;
    Ok(from_json::<Value>(&raw)?
        .get("removed")
        .and_then(Value::as_bool)
        .unwrap_or(false))
}

/// Delete one page of entries whose `expiry_field` is before `now_iso`, in one
/// atomic batch. Reusable expiry sweep. Returns removed count; page until 0.
pub fn sweep_expired(
    collection: Collection,
    expiry_field: &str,
    now_iso: &str,
    page: u32,
) -> Result<u64> {
    let expired = read_entries(
        collection,
        &Query {
            filters: vec![lt(expiry_field, now_iso)],
            order_by: Some(asc(expiry_field)),
            limit: Some(page),
            ..Default::default()
        },
    )?;
    let ops: Vec<BatchOp> = expired
        .iter()
        .map(|e| BatchOp::delete(collection, &e.entry_key))
        .collect();
    batch(&ops)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn query_serializes_to_seam_shape() {
        let q = Query {
            filters: vec![
                eq("userId", "u1"),
                lt("expiresAt", "2026-01-01T00:00:00.000Z"),
            ],
            order_by: Some(asc("expiresAt")),
            limit: Some(500),
            ..Default::default()
        };
        let j = serde_json::to_value(&q).unwrap();
        assert_eq!(j["filters"][0]["op"], "eq");
        assert_eq!(j["orderBy"]["direction"], "asc");
        assert_eq!(j["limit"], 500);
        assert!(j.get("offset").is_none());
        assert!(j.get("entryKeys").is_none(), "empty arrays omitted");
    }

    #[test]
    fn key_query_uses_entry_keys() {
        let j = serde_json::to_value(Query::key("abc")).unwrap();
        assert_eq!(j["entryKeys"][0], "abc");
    }

    #[test]
    fn parses_only_the_versioned_redacted_conflict_marker() {
        let parsed = parse_conflict_marker("cedros.db.v1|unique|identity.users.normalized-email")
            .expect("valid marker");
        assert!(matches!(
            parsed,
            SeamError::DbConflict {
                category: DbConflictCategory::Unique,
                ref operation,
            } if operation == "identity.users.normalized-email"
        ));

        assert!(parse_conflict_marker("duplicate key value: user@example.com").is_none());
        assert!(parse_conflict_marker("cedros.db.v1|unknown|identity.users.email").is_none());
        assert!(parse_conflict_marker("cedros.db.v1|unique|email=user@example.com").is_none());
    }
}
