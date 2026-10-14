//! Durable, privacy-preserving binding between an OIDC provider subject and a
//! Cedros user. The entry key is a SHA-256-derived opaque binding identifier;
//! the raw provider subject is never persisted.

use crate::host::db::{
    self, BatchOp, Query, ACCOUNT_LIFECYCLE_SSO_IDENTITIES, REGISTRATION_SSO_IDENTITIES,
    SSO_IDENTITIES,
};
use crate::host::{Result, SeamError};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SsoIdentityEntry {
    pub id: String,
    pub user_id: String,
    pub created_at: String,
}

pub fn find_by_id(id: &str) -> Result<Option<SsoIdentityEntry>> {
    if !is_valid_id(id) {
        return Err(SeamError::Db("invalid SSO identity key".into()));
    }
    db::read_entries(SSO_IDENTITIES, &Query::key(id))?
        .into_iter()
        .next()
        .map(|entry| decode(entry, Some(id), None))
        .transpose()
}

pub fn find_by_user(user_id: &str) -> Result<Vec<SsoIdentityEntry>> {
    db::read_entries(
        SSO_IDENTITIES,
        &Query {
            filters: vec![db::eq("userId", user_id)],
            ..Default::default()
        },
    )?
    .into_iter()
    .map(|entry| decode(entry, None, Some(user_id)))
    .collect()
}

pub fn is_valid_id(id: &str) -> bool {
    let Some(digest) = id.strip_prefix("sso:") else {
        return false;
    };
    digest.len() == 64 && digest.bytes().all(|byte| byte.is_ascii_hexdigit())
}

pub fn write_operation(identity: &SsoIdentityEntry) -> Result<BatchOp> {
    validate(identity, &identity.id, &identity.user_id)?;
    Ok(BatchOp::write(
        SSO_IDENTITIES,
        &identity.id,
        serde_json::to_value(identity).map_err(|error| SeamError::Encoding(error.to_string()))?,
    ))
}

pub fn registration_write_operation(identity: &SsoIdentityEntry) -> Result<BatchOp> {
    validate(identity, &identity.id, &identity.user_id)?;
    Ok(BatchOp::write(
        REGISTRATION_SSO_IDENTITIES,
        &identity.id,
        serde_json::to_value(identity).map_err(|error| SeamError::Encoding(error.to_string()))?,
    ))
}

fn decode(
    entry: db::Entry,
    expected_id: Option<&str>,
    expected_user_id: Option<&str>,
) -> Result<SsoIdentityEntry> {
    let identity: SsoIdentityEntry = serde_json::from_value(entry.payload)
        .map_err(|error| SeamError::Encoding(error.to_string()))?;
    validate(
        &identity,
        expected_id.unwrap_or(&entry.entry_key),
        expected_user_id.unwrap_or(&identity.user_id),
    )?;
    if entry.entry_key != identity.id {
        return Err(SeamError::Db(
            "SSO identity row key does not match its payload".into(),
        ));
    }
    Ok(identity)
}

fn validate(identity: &SsoIdentityEntry, expected_id: &str, expected_user_id: &str) -> Result<()> {
    if !is_valid_id(&identity.id)
        || identity.id != expected_id
        || identity.user_id.is_empty()
        || identity.user_id != expected_user_id
    {
        return Err(SeamError::Db("invalid SSO identity binding".into()));
    }
    Ok(())
}

pub fn account_deletion_operations(identities: &[SsoIdentityEntry]) -> Vec<BatchOp> {
    identities
        .iter()
        .map(|identity| BatchOp::delete(ACCOUNT_LIFECYCLE_SSO_IDENTITIES, &identity.id))
        .collect()
}

/// Delete identity bindings through the ordinary identity transaction grant.
/// Used when a verified mailbox owner claims an unverified pre-registration.
pub fn delete_operations(identities: &[SsoIdentityEntry]) -> Vec<BatchOp> {
    identities
        .iter()
        .map(|identity| BatchOp::delete(SSO_IDENTITIES, &identity.id))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn entry_never_contains_the_raw_provider_subject() {
        let entry = SsoIdentityEntry {
            id: "sso:opaque-digest".into(),
            user_id: "user-1".into(),
            created_at: "2026-09-16T00:00:00.000Z".into(),
        };
        let json = serde_json::to_value(&entry).unwrap();
        assert_eq!(json["id"], "sso:opaque-digest");
        assert_eq!(json["userId"], "user-1");
        assert!(json.get("providerSubject").is_none());
        assert!(is_valid_id(&format!("sso:{}", "a".repeat(64))));
        assert!(!is_valid_id("sso:raw-subject"));
    }

    #[test]
    fn persistence_rejects_malformed_or_unowned_bindings() {
        let mut entry = SsoIdentityEntry {
            id: format!("sso:{}", "a".repeat(64)),
            user_id: "user-1".into(),
            created_at: "2026-09-16T00:00:00.000Z".into(),
        };
        assert!(write_operation(&entry).is_ok());
        entry.id = "sso:raw-subject".into();
        assert!(write_operation(&entry).is_err());
        entry.id = format!("sso:{}", "a".repeat(64));
        assert!(validate(&entry, &entry.id, "user-2").is_err());
    }
}
