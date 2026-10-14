//! Refresh-token hashing, ported verbatim from
//! `server/src/utils/tokens.rs::hash_refresh_token`.
//!
//! HMAC-SHA256 with a key derived from the JWT secret plus a domain-separation
//! label, so a stored refresh hash can't be replayed in another context. Output
//! is lowercase hex. The opaque refresh token is hashed before storage; only the
//! hash lives in `session.refresh_token_hash`.
use hmac::{Hmac, Mac};
use rand::distributions::Alphanumeric;
use rand::{rngs::OsRng, Rng};
use sha2::{Digest, Sha256};

const REFRESH_TOKEN_HMAC_INFO: &[u8] = b"cedros:refresh_token_hash:v1";

/// A random single-use token (email verification, password reset, MFA-pending).
/// 32 alphanumeric chars (~190 bits). Only its hash is stored.
pub fn generate_verification_token() -> String {
    OsRng
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
}

/// A random org-invite token: 32 random bytes, hex-encoded (256 bits). Only its
/// hash is stored; the raw token is returned once (create/resend response).
pub fn generate_invite_token() -> String {
    let bytes: [u8; 32] = OsRng.gen();
    hex::encode(bytes)
}

/// A high-entropy secret-store value: 32 random bytes, hex-encoded (256 bits).
/// Used to seed the extension's own long-lived symmetric material (refresh HMAC,
/// legacy TOTP/SSO migration keys) via the guest-writable secret seam. Persisted once
/// and reused; never logged or returned to clients.
pub fn generate_secret_key() -> String {
    let bytes: [u8; 32] = OsRng.gen();
    hex::encode(bytes)
}

/// SHA-256 hex of a verification token, for storage/lookup. These are
/// high-entropy single-use values, so a plain hash (not HMAC) is sufficient.
pub fn hash_verification_token(token: &str) -> String {
    sha256_hex(token)
}

/// SHA-256 hex of an invite token (same primitive as verification tokens).
pub fn hash_invite_token(token: &str) -> String {
    sha256_hex(token)
}

/// A single-use MFA recovery code: 16 random bytes, hex (128 bits). Stored hashed.
pub fn generate_recovery_code() -> String {
    let bytes: [u8; 16] = OsRng.gen();
    let encoded = hex::encode_upper(bytes);
    format!(
        "{}-{}-{}-{}",
        &encoded[0..8],
        &encoded[8..16],
        &encoded[16..24],
        &encoded[24..32]
    )
}

/// SHA-256 hex of a recovery code (high-entropy single-use value).
pub fn hash_recovery_code(code: &str) -> String {
    sha256_hex(code)
}

fn sha256_hex(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn hash_refresh_token(token: &str, secret: &str) -> String {
    // Derive the HMAC key from the secret with domain separation.
    let mut key_hasher = Sha256::new();
    key_hasher.update(secret.as_bytes());
    key_hasher.update(REFRESH_TOKEN_HMAC_INFO);
    let hmac_key = key_hasher.finalize();

    let mut mac = <Hmac<Sha256>>::new_from_slice(&hmac_key).expect("HMAC accepts any key size");
    mac.update(token.as_bytes());
    hex::encode(mac.finalize().into_bytes())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deterministic_and_hex_64() {
        let a = hash_refresh_token("tok", "secret");
        assert_eq!(a, hash_refresh_token("tok", "secret"));
        assert_eq!(a.len(), 64); // SHA-256 hex
        assert!(a.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn secret_and_token_both_affect_output() {
        assert_ne!(
            hash_refresh_token("tok", "s1"),
            hash_refresh_token("tok", "s2")
        );
        assert_ne!(
            hash_refresh_token("t1", "secret"),
            hash_refresh_token("t2", "secret")
        );
    }

    #[test]
    fn secret_key_is_high_entropy_hex_and_unique() {
        let key = generate_secret_key();
        assert_eq!(key.len(), 64); // 32 bytes hex = 256 bits
        assert!(key.chars().all(|c| c.is_ascii_hexdigit()));
        assert_ne!(generate_secret_key(), generate_secret_key());
    }

    #[test]
    fn invite_token_is_hex_and_hashes_deterministically() {
        let token = generate_invite_token();
        assert_eq!(token.len(), 64); // 32 bytes hex
        assert!(token.chars().all(|c| c.is_ascii_hexdigit()));
        assert_ne!(generate_invite_token(), generate_invite_token());

        let hash = hash_invite_token(&token);
        assert_eq!(hash, hash_invite_token(&token));
        assert_eq!(hash.len(), 64); // SHA-256 hex
                                    // Same primitive as verification-token hashing.
        assert_eq!(hash, hash_verification_token(&token));
    }

    #[test]
    fn recovery_codes_have_128_bits_of_random_material() {
        let code = generate_recovery_code();
        assert_eq!(code.len(), 35);
        assert_eq!(code.chars().filter(|value| *value == '-').count(), 3);
        assert!(code
            .chars()
            .all(|value| value == '-' || value.is_ascii_hexdigit()));
        assert_ne!(generate_recovery_code(), generate_recovery_code());
    }
}
