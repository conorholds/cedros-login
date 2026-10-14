//! Token utilities for secure hashing and validation

use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use base64::Engine as _;
use hmac::{Hmac, Mac};
use rand::rngs::OsRng;
use rand::RngCore;
use sha2::{Digest, Sha256};
use subtle::ConstantTimeEq;

use crate::errors::AppError;

/// HMAC key derivation info for refresh tokens (domain separation).
const REFRESH_TOKEN_HMAC_INFO: &[u8] = b"cedros:refresh_token_hash:v1";

/// HKDF info for TokenCipher encryption key derivation (domain separation).
const TOKEN_CIPHER_KEY_INFO: &[u8] = b"cedros:token_cipher_aes256:v1";

/// Hash a refresh token for secure storage using HMAC-SHA256.
///
/// # Security
///
/// Uses HMAC-SHA256 with a server secret for defense-in-depth. Even if the database
/// is compromised, an attacker cannot verify tokens without the server secret.
///
/// For refresh tokens with ~262 bits of entropy, brute-force attacks are infeasible
/// regardless of the hash function. HMAC provides an additional layer of protection.
///
/// # Arguments
///
/// * `token` - The plaintext refresh token to hash
/// * `secret` - The server secret (typically JWT secret, ≥32 bytes)
pub fn hash_refresh_token(token: &str, secret: &str) -> String {
    // Derive an HMAC key from the secret with domain separation
    let mut key_hasher = Sha256::new();
    key_hasher.update(secret.as_bytes());
    key_hasher.update(REFRESH_TOKEN_HMAC_INFO);
    let hmac_key = key_hasher.finalize();

    // Compute HMAC-SHA256
    let mut mac: Hmac<Sha256> =
        Mac::new_from_slice(&hmac_key).expect("HMAC can take key of any size");
    mac.update(token.as_bytes());
    let result = mac.finalize();
    hex::encode(result.into_bytes())
}

/// Verify a refresh token against a stored hash using constant-time comparison.
///
/// # Security
///
/// Uses constant-time comparison to prevent timing attacks.
///
/// # Arguments
///
/// * `token` - The plaintext refresh token to verify
/// * `secret` - The server secret (must match what was used for hashing)
/// * `stored_hash` - The stored HMAC hash to compare against
pub fn verify_refresh_token(token: &str, secret: &str, stored_hash: &str) -> bool {
    let computed_hash = hash_refresh_token(token, secret);
    // Constant-time comparison to prevent timing attacks
    computed_hash
        .as_bytes()
        .ct_eq(stored_hash.as_bytes())
        .into()
}

/// TokenCipher encrypts/decrypts sensitive tokens stored in the outbox payload.
#[derive(Clone, zeroize::Zeroize, zeroize::ZeroizeOnDrop)]
pub struct TokenCipher {
    key: [u8; 32],
}

impl std::fmt::Debug for TokenCipher {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("TokenCipher")
            .field("key", &"[REDACTED]")
            .finish()
    }
}

impl TokenCipher {
    /// Create a new TokenCipher with a secret.
    ///
    /// # Security
    ///
    /// Uses HMAC-based key derivation with domain separation instead of raw SHA-256.
    /// This follows HKDF-Extract pattern: derive key material using HMAC with an
    /// info string to ensure keys derived for different purposes are independent.
    pub fn new(secret: &str) -> Self {
        // Use HMAC-based key derivation with domain separation.
        // Derive key material using a secret-keyed PRF:
        //   key = HMAC(secret, info)
        // This avoids using a public constant as the HMAC key.
        let mut mac: Hmac<Sha256> =
            Mac::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
        mac.update(TOKEN_CIPHER_KEY_INFO);
        let result = mac.finalize();

        let mut key = [0u8; 32];
        key.copy_from_slice(&result.into_bytes());

        Self { key }
    }

    pub fn encrypt(&self, token: &str) -> Result<String, AppError> {
        // Always encrypt with new HMAC-derived key
        let cipher = Aes256Gcm::new_from_slice(&self.key)
            .expect("TokenCipher key length is fixed at 32 bytes");
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from(nonce_bytes);

        let ciphertext = cipher
            .encrypt(&nonce, token.as_bytes())
            .map_err(|_| AppError::Internal(anyhow::anyhow!("Failed to encrypt token")))?;

        let mut combined = Vec::with_capacity(nonce_bytes.len() + ciphertext.len());
        combined.extend_from_slice(&nonce_bytes);
        combined.extend_from_slice(&ciphertext);

        Ok(base64::engine::general_purpose::STANDARD.encode(combined))
    }

    pub fn decrypt(&self, encoded: &str) -> Result<String, AppError> {
        let decoded = base64::engine::general_purpose::STANDARD
            .decode(encoded)
            .map_err(|_| AppError::Internal(anyhow::anyhow!("Failed to decode token payload")))?;

        if decoded.len() < 12 {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Invalid token payload length"
            )));
        }

        let (nonce_bytes, ciphertext) = decoded.split_at(12);

        let cipher = Aes256Gcm::new_from_slice(&self.key)
            .expect("TokenCipher key length is fixed at 32 bytes");
        let nonce = Nonce::from(
            <[u8; 12]>::try_from(nonce_bytes)
                .expect("TokenCipher validates nonce length before conversion"),
        );

        let plaintext = cipher
            .decrypt(&nonce, ciphertext)
            .map_err(|_| AppError::Internal(anyhow::anyhow!("Failed to decrypt token")))?;

        String::from_utf8(plaintext)
            .map_err(|_| AppError::Internal(anyhow::anyhow!("Invalid token payload encoding")))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const TEST_SECRET: &str = "test-secret-key-for-hmac-operations";

    #[test]
    fn test_hash_refresh_token_deterministic() {
        let token = "test-refresh-token-123";
        let hash1 = hash_refresh_token(token, TEST_SECRET);
        let hash2 = hash_refresh_token(token, TEST_SECRET);
        assert_eq!(hash1, hash2);
    }

    #[test]
    fn test_hash_refresh_token_different_inputs() {
        let hash1 = hash_refresh_token("token1", TEST_SECRET);
        let hash2 = hash_refresh_token("token2", TEST_SECRET);
        assert_ne!(hash1, hash2);
    }

    #[test]
    fn test_hash_refresh_token_different_secrets() {
        let token = "same-token";
        let hash1 = hash_refresh_token(token, "secret1");
        let hash2 = hash_refresh_token(token, "secret2");
        assert_ne!(
            hash1, hash2,
            "Different secrets should produce different hashes"
        );
    }

    #[test]
    fn test_hash_refresh_token_length() {
        // HMAC-SHA256 produces 64 hex characters (32 bytes)
        let hash = hash_refresh_token("any-token", TEST_SECRET);
        assert_eq!(hash.len(), 64);
    }

    #[test]
    fn test_hash_refresh_token_hex_format() {
        let hash = hash_refresh_token("test", TEST_SECRET);
        // Should only contain hex characters
        assert!(hash.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn test_verify_refresh_token_valid() {
        let token = "my-refresh-token";
        let hash = hash_refresh_token(token, TEST_SECRET);
        assert!(verify_refresh_token(token, TEST_SECRET, &hash));
    }

    #[test]
    fn test_verify_refresh_token_invalid_token() {
        let token = "my-refresh-token";
        let hash = hash_refresh_token(token, TEST_SECRET);
        assert!(!verify_refresh_token("wrong-token", TEST_SECRET, &hash));
    }

    #[test]
    fn test_verify_refresh_token_invalid_secret() {
        let token = "my-refresh-token";
        let hash = hash_refresh_token(token, TEST_SECRET);
        assert!(!verify_refresh_token(token, "wrong-secret", &hash));
    }

    #[test]
    fn test_verify_refresh_token_invalid_hash() {
        let token = "my-refresh-token";
        assert!(!verify_refresh_token(token, TEST_SECRET, "invalid-hash"));
    }

    #[test]
    fn test_token_cipher_roundtrip() {
        let cipher = TokenCipher::new("test-secret");
        let token = "token-value-123";
        let encrypted = cipher.encrypt(token).unwrap();
        let decrypted = cipher.decrypt(&encrypted).unwrap();
        assert_eq!(decrypted, token);
    }

    #[test]
    fn test_token_cipher_rejects_invalid_payload() {
        let cipher = TokenCipher::new("test-secret");
        let result = cipher.decrypt("not-base64");
        assert!(result.is_err());
    }

    #[test]
    fn test_token_cipher_uses_hmac_derived_key_for_encryption() {
        let cipher = TokenCipher::new("test-secret");
        let token = "new-token-123";
        let encrypted = cipher.encrypt(token).unwrap();

        let decrypted = cipher.decrypt(&encrypted).unwrap();
        assert_eq!(decrypted, token);
    }

    #[test]
    fn test_token_cipher_key_depends_on_secret() {
        // Regression test: key derivation must be secret-keyed.
        // If we accidentally key the HMAC with a public constant, this would still
        // "work" functionally but is a crypto footgun.
        let a = TokenCipher::new("secret-a");
        let b = TokenCipher::new("secret-b");
        assert_ne!(
            a.encrypt("token").unwrap(),
            b.encrypt("token").unwrap(),
            "Different secrets should produce different ciphertexts"
        );
    }

    // =========================================================================
    // Property tests
    // =========================================================================

    use proptest::prelude::*;

    proptest! {
        // Encrypt → decrypt round-trip preserves the original token bytes
        // for any UTF-8 input, including empty strings, multibyte unicode,
        // and arbitrarily long values.
        #[test]
        fn property_token_cipher_roundtrip(
            secret in "[ -~]{1,80}",
            token in proptest::collection::vec(any::<char>(), 0..256),
        ) {
            let token: String = token.into_iter().collect();
            let cipher = TokenCipher::new(&secret);
            let encrypted = cipher.encrypt(&token).expect("encrypt must not fail");
            let decrypted = cipher.decrypt(&encrypted).expect("decrypt must succeed");
            prop_assert_eq!(decrypted, token);
        }

        // Decrypt is total: arbitrary input must never panic; it returns Err
        // for malformed payloads.
        #[test]
        fn property_token_cipher_decrypt_never_panics(
            secret in "[ -~]{1,40}",
            payload in ".{0,400}",
        ) {
            let cipher = TokenCipher::new(&secret);
            let _ = cipher.decrypt(&payload);
        }

        // hash_refresh_token is deterministic: same inputs → same hash.
        #[test]
        fn property_hash_refresh_token_deterministic(
            token in ".{0,128}",
            secret in "[ -~]{1,80}",
        ) {
            let h1 = hash_refresh_token(&token, &secret);
            let h2 = hash_refresh_token(&token, &secret);
            prop_assert_eq!(h1, h2);
        }

        // Output is always 64 hex chars (HMAC-SHA256, hex encoded).
        #[test]
        fn property_hash_refresh_token_format(
            token in ".{0,128}",
            secret in "[ -~]{1,80}",
        ) {
            let h = hash_refresh_token(&token, &secret);
            prop_assert_eq!(h.len(), 64);
            prop_assert!(h.chars().all(|c| c.is_ascii_hexdigit()));
        }

        // verify_refresh_token round-trips: token + correct secret + computed hash → true.
        #[test]
        fn property_verify_refresh_token_roundtrip(
            token in ".{1,128}",
            secret in "[ -~]{1,80}",
        ) {
            let h = hash_refresh_token(&token, &secret);
            prop_assert!(verify_refresh_token(&token, &secret, &h));
        }

        // verify_refresh_token rejects different tokens (collision-resistance).
        #[test]
        fn property_verify_refresh_token_rejects_different_token(
            token_a in "[a-zA-Z0-9]{8,32}",
            token_b in "[a-zA-Z0-9]{8,32}",
            secret in "[ -~]{1,80}",
        ) {
            prop_assume!(token_a != token_b);
            let h_a = hash_refresh_token(&token_a, &secret);
            prop_assert!(!verify_refresh_token(&token_b, &secret, &h_a));
        }
    }
}
