//! API key generation + hashing. Ported from server api_key_repository.rs:
//! a `ck_`-prefixed key with 43 alphanumeric chars; stored as a SHA-256 hex hash
//! plus a 16-char display prefix (the raw key is shown to the user only once).
use rand::distributions::Alphanumeric;
use rand::{rngs::OsRng, Rng};
use sha2::{Digest, Sha256};

const PREFIX: &str = "ck_";

pub fn generate() -> String {
    let suffix: String = OsRng
        .sample_iter(&Alphanumeric)
        .take(43)
        .map(char::from)
        .collect();
    format!("{PREFIX}{suffix}")
}

pub fn hash(key: &str) -> String {
    hex::encode(Sha256::digest(key.as_bytes()))
}

/// First 16 chars, stored for display only (never the full key).
pub fn display_prefix(key: &str) -> String {
    key.chars().take(16).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generate_is_prefixed_and_unique() {
        let key = generate();
        assert!(key.starts_with(PREFIX));
        assert_eq!(key.len(), PREFIX.len() + 43);
        assert_ne!(key, generate());
    }

    #[test]
    fn hash_is_sha256_hex_and_deterministic() {
        let key = generate();
        assert_eq!(hash(&key), hash(&key));
        assert_eq!(hash(&key).len(), 64);
        assert_eq!(display_prefix("ck_abcdefghijklmnopqrstuvwxyz").len(), 16);
    }
}
