//! TOTP MFA metadata over the host DB seam (`cedros-login:totp`), keyed by user
//! id. New TOTP seeds live in the host secret seam. `secret` supports
//! legacy encrypted rows. `last_used_time_step` drives replay protection.
use crate::host::db::{self, Query, TOTP};
use crate::host::Result;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TotpEntry {
    pub user_id: String,
    /// Legacy AES-GCM ciphertext; new enrollments persist `null`.
    #[serde(default)]
    pub secret: Option<String>,
    /// Immutable encrypted host-secret reference for this enrollment.
    #[serde(default)]
    pub secret_key: Option<String>,
    pub enabled: bool,
    pub created_at: String,
    pub enabled_at: Option<String>,
    pub last_used_time_step: Option<i64>,
    /// SHA-256 hashes of the user's unused single-use recovery codes.
    #[serde(default)]
    pub recovery_codes: Vec<String>,
}

pub fn find_by_user(user_id: &str) -> Result<Option<TotpEntry>> {
    db::find_one(TOTP, &Query::key(user_id))
}

pub fn find_versioned(user_id: &str) -> Result<Option<db::Versioned<TotpEntry>>> {
    let entry = db::read_versioned::<TotpEntry>(TOTP, user_id)?;
    if entry
        .as_ref()
        .is_some_and(|row| row.value.user_id != user_id)
    {
        return Err(crate::host::SeamError::Db("factor owner mismatch".into()));
    }
    Ok(entry)
}
pub fn write_op(entry: &TotpEntry) -> Result<db::BatchOp> {
    Ok(db::BatchOp::write(
        TOTP,
        &entry.user_id,
        serde_json::to_value(entry).map_err(|e| crate::host::SeamError::Encoding(e.to_string()))?,
    ))
}

/// Whether the user has MFA enabled (an enrolled + enabled secret).
pub fn has_mfa(user_id: &str) -> Result<bool> {
    Ok(find_by_user(user_id)?.map(|t| t.enabled).unwrap_or(false))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_camelcase() {
        let t = TotpEntry {
            user_id: "u1".into(),
            secret: Some("v1:ciphertext".into()),
            secret_key: None,
            enabled: true,
            created_at: "2026-06-01T00:00:00.000Z".into(),
            enabled_at: Some("2026-06-01T00:01:00.000Z".into()),
            last_used_time_step: Some(63_000_000),
            recovery_codes: vec!["abc123".into()],
        };
        let j = serde_json::to_value(&t).unwrap();
        assert_eq!(j["userId"], "u1");
        assert_eq!(j["lastUsedTimeStep"], 63_000_000);
        assert_eq!(j["recoveryCodes"][0], "abc123");
        assert_eq!(serde_json::from_value::<TotpEntry>(j).unwrap(), t);
    }
}
