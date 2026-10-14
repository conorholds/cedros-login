//! Solana sign-in nonces over the host DB seam (`cedros-login:nonces`), keyed by
//! the nonce value itself.
use crate::host::db::{self, Query, NONCES};
use crate::host::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct NonceEntry {
    pub nonce: String,
    pub public_key: String,
    pub message: String,
    pub created_at: String,
    pub expires_at: String,
    pub used_at: Option<String>,
}

pub fn create(nonce: &NonceEntry) -> Result<()> {
    db::write(NONCES, &nonce.nonce, nonce)
}

pub fn find(nonce: &str) -> Result<Option<NonceEntry>> {
    db::find_one(NONCES, &Query::key(nonce))
}

pub fn sweep_expired(now_iso: &str, page: u32) -> Result<u64> {
    db::sweep_expired(NONCES, "expiresAt", now_iso, page)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unused_nonce_serializes_used_at_as_null_for_existing_contracts() {
        let nonce = NonceEntry {
            nonce: "nonce-1".into(),
            public_key: "11111111111111111111111111111111".into(),
            message: "Sign in to Cedros\n\nNonce: nonce-1".into(),
            created_at: "2026-06-07T00:00:00.000Z".into(),
            expires_at: "2026-06-07T00:05:00.000Z".into(),
            used_at: None,
        };

        let value = serde_json::to_value(nonce).unwrap();

        assert!(value.get("usedAt").unwrap().is_null());
    }

    #[test]
    fn nonce_entry_accepts_missing_or_used_markers() {
        let missing_used_at = serde_json::json!({
            "nonce": "nonce-1",
            "publicKey": "11111111111111111111111111111111",
            "message": "Sign in to Cedros\n\nNonce: nonce-1",
            "createdAt": "2026-06-07T00:00:00.000Z",
            "expiresAt": "2026-06-07T00:05:00.000Z"
        });
        let used = serde_json::json!({
            "nonce": "nonce-2",
            "publicKey": "11111111111111111111111111111111",
            "message": "Sign in to Cedros\n\nNonce: nonce-2",
            "createdAt": "2026-06-07T00:00:00.000Z",
            "expiresAt": "2026-06-07T00:05:00.000Z",
            "usedAt": "2026-06-07T00:01:00.000Z"
        });

        let missing: NonceEntry = serde_json::from_value(missing_used_at).unwrap();
        let used: NonceEntry = serde_json::from_value(used).unwrap();

        assert_eq!(missing.used_at, None);
        assert_eq!(used.used_at, Some("2026-06-07T00:01:00.000Z".into()));
    }
}
