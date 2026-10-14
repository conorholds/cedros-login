//! WebAuthn/passkey credentials over the host DB seam (`cedros-login:credentials`,
//! identity-db). Keyed by the credential id (base64url). Stores the COSE public
//! key (base64url) and the sign counter for clone detection — no secret material.
//! Mirrors server/src/repositories/credential_repository.rs::CredentialEntity.
use crate::host::db::{self, Query, CREDENTIALS};
use crate::host::{Result, SeamError};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CredentialEntry {
    pub id: String,
    pub user_id: String,
    pub public_key: String,
    pub sign_count: u32,
    #[serde(default)]
    pub backup_eligible: Option<bool>,
    pub label: Option<String>,
    pub created_at: String,
    pub last_used_at: Option<String>,
}

pub struct VersionedCredentialEntry {
    pub value: CredentialEntry,
    pub entry_key: String,
    pub updated_at: String,
    pub version: Option<String>,
}

pub fn update_label(id: &str, user_id: &str, label: Option<String>) -> Result<()> {
    let current = db::read_versioned::<CredentialEntry>(CREDENTIALS, id)?
        .ok_or_else(|| SeamError::Db("credential not found".into()))?;
    if current.value.user_id != user_id {
        return Err(SeamError::Db("credential owner mismatch".into()));
    }
    let mut credential = current.value;
    credential.label = label;
    db::compare_and_set(
        &[current.condition],
        &[db::BatchOp::write(
            CREDENTIALS,
            id,
            serde_json::to_value(credential).map_err(|e| SeamError::Encoding(e.to_string()))?,
        )],
    )
}

pub fn find_by_id(id: &str) -> Result<Option<CredentialEntry>> {
    db::find_one(CREDENTIALS, &Query::key(id))
}

pub fn find_by_id_versioned(id: &str) -> Result<Option<VersionedCredentialEntry>> {
    let Some(entry) = db::read_entries(CREDENTIALS, &Query::key(id))?
        .into_iter()
        .next()
    else {
        return Ok(None);
    };
    let updated_at = entry
        .updated_at
        .ok_or_else(|| SeamError::Db("credential row is missing host revision metadata".into()))?;
    let value: CredentialEntry = serde_json::from_value(entry.payload)
        .map_err(|error| SeamError::Encoding(error.to_string()))?;
    if value.id != entry.entry_key {
        return Err(SeamError::Db(
            "credential row identity does not match its entry key".into(),
        ));
    }
    Ok(Some(VersionedCredentialEntry {
        value,
        entry_key: entry.entry_key,
        updated_at,
        version: entry.version,
    }))
}

/// A user's registered passkeys, oldest first.
pub fn find_by_user(user_id: &str) -> Result<Vec<CredentialEntry>> {
    db::read_typed(
        CREDENTIALS,
        &Query {
            filters: vec![db::eq("userId", user_id)],
            order_by: Some(db::asc("createdAt")),
            ..Default::default()
        },
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_camelcase() {
        let c = CredentialEntry {
            id: "Y3JlZA".into(),
            user_id: "u1".into(),
            public_key: "pQECAyY".into(),
            sign_count: 5,
            backup_eligible: Some(false),
            label: Some("Pixel".into()),
            created_at: "2026-06-01T00:00:00.000Z".into(),
            last_used_at: None,
        };
        let j = serde_json::to_value(&c).unwrap();
        assert_eq!(j["userId"], "u1");
        assert_eq!(j["publicKey"], "pQECAyY");
        assert_eq!(j["signCount"], 5);
        assert_eq!(serde_json::from_value::<CredentialEntry>(j).unwrap(), c);
    }
}

#[cfg(test)]
mod lifecycle_tests {
    use super::*;
    use serde_json::json;
    #[test]
    fn labels_preserve_current_counter_and_never_recreate_removed_passkeys() {
        for exists in [false, true] {
            db::test_support::with_db(
                move |op, _, query| {
                    if op == "read" {
                        return Ok(if exists {
                            json!({"entries":[{"entry_key":"c","version":"counter-version","payload":{
                                "id":"c","userId":"u","publicKey":"key","signCount":43,"createdAt":"t"
                            }}]})
                        } else {
                            json!({"entries":[]})
                        });
                    }
                    assert!(exists);
                    assert_eq!(op, "compare-and-set");
                    let request = &query.filters[0].value;
                    assert_eq!(
                        request["conditions"][0]["expectedVersion"],
                        "counter-version"
                    );
                    assert_eq!(request["ops"][0]["data"]["signCount"], 43);
                    assert_eq!(request["ops"][0]["data"]["label"], "new label");
                    Ok(
                        json!({"outcome":"applied","applied":1,"replayed":false,"entries":[],"results":[]}),
                    )
                },
                || {
                    assert_eq!(
                        update_label("c", "u", Some("new label".into())).is_ok(),
                        exists
                    )
                },
            );
        }
    }
}
