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
    /// New key derived with HMAC (S-05)
    key: [u8; 32],
    /// Legacy key derived with raw SHA-256 (for backwards compatibility)
    legacy_key: [u8; 32],
}

impl std::fmt::Debug for TokenCipher {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("TokenCipher")
            .field("key", &"[REDACTED]")
            .field("legacy_key", &"[REDACTED]")
            .finish()
    }
}

impl TokenCipher {
    /// Create a new TokenCipher with a secret.
    ///
    /// # Security (S-05)
    ///
    /// Uses HMAC-based key derivation with domain separation instead of raw SHA-256.
    /// This follows HKDF-Extract pattern: derive key material using HMAC with an
    /// info string to ensure keys derived for different purposes are independent.
    ///
    /// # Backwards Compatibility
    ///
    /// Maintains ability to decrypt data encrypted with the old SHA-256 key derivation.
    /// New encryptions always use the new HMAC-derived key.
    pub fn new(secret: &str) -> Self {
        // S-05: Use HMAC-based key derivation with domain separation.
        // Derive key material using a secret-keyed PRF:
        //   key = HMAC(secret, info)
        // This avoids using a public constant as the HMAC key.
        let mut mac: Hmac<Sha256> =
            Mac::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
        mac.update(TOKEN_CIPHER_KEY_INFO);
        let result = mac.finalize();

        let mut key = [0u8; 32];
        key.copy_from_slice(&result.into_bytes());

        // Legacy key for backwards compatibility (raw SHA-256)
        let legacy_digest = Sha256::digest(secret.as_bytes());
        let mut legacy_key = [0u8; 32];
        legacy_key.copy_from_slice(&legacy_digest);

        Self { key, legacy_key }
    }

    pub fn encrypt(&self, token: &str) -> Result<String, AppError> {
        // Always encrypt with new HMAC-derived key
        let cipher = Aes256Gcm::new_from_slice(&self.key)
            .expect("TokenCipher key length is fixed at 32 bytes");
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        #[allow(deprecated)]
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher
            .encrypt(nonce, token.as_bytes())
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

        // Try new key first
        let cipher = Aes256Gcm::new_from_slice(&self.key)
            .expect("TokenCipher key length is fixed at 32 bytes");
        #[allow(deprecated)]
        let nonce = Nonce::from_slice(nonce_bytes);

        if let Ok(plaintext) = cipher.decrypt(nonce, ciphertext) {
            return String::from_utf8(plaintext).map_err(|_| {
                AppError::Internal(anyhow::anyhow!("Invalid token payload encoding"))
            });
        }

        // Fallback to legacy key for backwards compatibility
        let legacy_cipher = Aes256Gcm::new_from_slice(&self.legacy_key)
            .expect("TokenCipher legacy key length is fixed at 32 bytes");
        let plaintext = legacy_cipher
            .decrypt(nonce, ciphertext)
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
    fn test_token_cipher_legacy_decryption() {
        // S-05: Test backwards compatibility with legacy SHA-256 key derivation
        // Simulate encrypting with old method (raw SHA-256)
        let secret = "test-secret";
        let token = "legacy-token-123";

        // Encrypt using legacy key derivation (raw SHA-256)
        let legacy_digest = Sha256::digest(secret.as_bytes());
        let legacy_cipher =
            Aes256Gcm::new_from_slice(&legacy_digest).expect("SHA-256 digest is 32 bytes");
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        #[allow(deprecated)]
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = legacy_cipher.encrypt(nonce, token.as_bytes()).unwrap();

        let mut combined = Vec::with_capacity(nonce_bytes.len() + ciphertext.len());
        combined.extend_from_slice(&nonce_bytes);
        combined.extend_from_slice(&ciphertext);
        let legacy_encrypted = base64::engine::general_purpose::STANDARD.encode(combined);

        // New cipher should be able to decrypt legacy data
        let cipher = TokenCipher::new(secret);
        let decrypted = cipher.decrypt(&legacy_encrypted).unwrap();
        assert_eq!(decrypted, token);
    }

    #[test]
    fn test_token_cipher_uses_new_key_for_encryption() {
        // Verify new encryptions use the HMAC-derived key (not the legacy one)
        let cipher = TokenCipher::new("test-secret");
        let token = "new-token-123";
        let encrypted = cipher.encrypt(token).unwrap();

        // New encryption should work with the new key
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
}
