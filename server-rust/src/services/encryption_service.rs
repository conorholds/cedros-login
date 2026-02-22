//! Simple encryption service for sensitive data like SSO client secrets
//!
//! Uses AES-256-GCM for encryption with a key derived from a secret.
//!
//! ## Key Versioning (S-21)
//!
//! Ciphertext format: `v{version}:{base64(nonce + ciphertext)}`
//!
//! Key versioning enables safe key rotation:
//! 1. Add new key version to config
//! 2. Re-encrypt data with new version (reads old, writes new)
//! 3. Remove old key version after migration

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use rand::{rngs::OsRng, RngCore};
use zeroize::Zeroize;

use crate::errors::AppError;

/// Encryption service for sensitive data
#[derive(Clone)]
pub struct EncryptionService {
    cipher: Aes256Gcm,
    /// S-21: Key version for rotation support
    key_version: u8,
}

impl EncryptionService {
    /// Create a new encryption service from a secret key.
    /// The key should be at least 32 bytes (256 bits).
    ///
    /// Uses key version 1 by default.
    pub fn new(secret: &[u8]) -> Self {
        Self::with_version(secret, 1)
    }

    /// S-21: Create with explicit key version for rotation support.
    ///
    /// When rotating keys:
    /// - Create a new service with version N+1
    /// - Keep old service for decryption during migration
    /// - All new encryptions use the new key
    pub fn with_version(secret: &[u8], key_version: u8) -> Self {
        // S-06: Warn when key is shorter than 32 bytes (zero-padded, weakens security)
        if secret.len() < 32 {
            tracing::warn!(
                key_len = secret.len(),
                "Encryption key is shorter than 32 bytes; zero-padded (weakened security)"
            );
        }
        // Use the first 32 bytes of the secret as the key
        let mut key = [0u8; 32];
        let len = secret.len().min(32);
        key[..len].copy_from_slice(&secret[..len]);

        let cipher = Aes256Gcm::new_from_slice(&key).expect("Key length should be 32 bytes");

        // SEC-06: Zeroize the temporary key array after use
        key.zeroize();

        Self {
            cipher,
            key_version,
        }
    }

    /// Create from a string secret (uses SHA-256 to derive key)
    pub fn from_secret(secret: &str) -> Self {
        Self::from_secret_with_version(secret, 1)
    }

    /// S-21: Create from string secret with explicit key version
    ///
    /// # Security Warning (H-04, NEW-08)
    ///
    /// **CRITICAL:** This function uses SHA-256 for key derivation, which has NO work
    /// factor. If the input secret is weak or low-entropy, an attacker can brute-force
    /// it at billions of hashes per second.
    ///
    /// **Requirements for safe use:**
    /// - The input secret MUST be cryptographically random (e.g., 32+ random bytes)
    /// - Generate secrets with: `openssl rand -base64 32`
    /// - NEVER use passwords, passphrases, or predictable values
    ///
    /// **Why this is acceptable for JWT_SECRET/encryption keys:**
    /// - These are expected to be generated once and stored securely
    /// - They should never be human-memorable
    ///
    /// **Migration note:** For user-provided secrets (which this is NOT designed for),
    /// use Argon2id or HKDF-SHA256 with a salt.
    pub fn from_secret_with_version(secret: &str, key_version: u8) -> Self {
        // SVC-KDF: Runtime entropy warning for obviously weak secrets
        // A proper secret should be at least 32 bytes (256 bits) of random data.
        // Base64-encoded 32 random bytes = 44 chars. Warn if significantly shorter.
        const MIN_RECOMMENDED_SECRET_LEN: usize = 32;
        if secret.len() < MIN_RECOMMENDED_SECRET_LEN {
            tracing::warn!(
                secret_len = secret.len(),
                min_recommended = MIN_RECOMMENDED_SECRET_LEN,
                "SVC-KDF: Encryption secret appears too short. \
                 Use `openssl rand -base64 32` to generate a cryptographically secure secret."
            );
        }

        use sha2::{Digest, Sha256};
        let mut hasher = Sha256::new();
        hasher.update(secret.as_bytes());
        let key = hasher.finalize();
        Self::with_version(&key, key_version)
    }

    /// SRV-09: Create from string secret using HKDF-SHA256 (preferred for new key versions).
    ///
    /// Uses HKDF with a domain-specific info string to derive a proper 256-bit key.
    /// Recommended over `from_secret` for new deployments/key versions.
    pub fn from_secret_hkdf(secret: &str, key_version: u8) -> Self {
        use hmac::{Hmac, Mac};
        use sha2::Sha256;
        type HmacSha256 = Hmac<Sha256>;

        // HKDF Extract (salt = empty for simplicity; secret is expected to be high-entropy)
        let extract: HmacSha256 = Mac::new_from_slice(b"cedros-encryption-service")
            .expect("HMAC key length is valid");
        let mut extract = extract;
        extract.update(secret.as_bytes());
        let prk = extract.finalize().into_bytes();

        // HKDF Expand
        let mut expand: HmacSha256 =
            Mac::new_from_slice(&prk).expect("HMAC key length is valid");
        expand.update(b"cedros-encryption-aes256gcm");
        expand.update(&[1u8]);
        let okm = expand.finalize().into_bytes();

        let mut key = [0u8; 32];
        key.copy_from_slice(&okm);

        let cipher = Aes256Gcm::new_from_slice(&key).expect("Key length should be 32 bytes");
        key.zeroize();

        Self {
            cipher,
            key_version,
        }
    }

    /// Get the key version used by this service
    pub fn key_version(&self) -> u8 {
        self.key_version
    }

    /// Encrypt plaintext data
    ///
    /// S-21: Returns versioned ciphertext: `v{version}:{base64(nonce + ciphertext)}`
    pub fn encrypt(&self, plaintext: &str) -> Result<String, AppError> {
        let mut nonce_bytes = [0u8; 12];
        // SEC-08: Use OsRng for cryptographic nonce generation
        OsRng.fill_bytes(&mut nonce_bytes);
        #[allow(deprecated)]
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = self
            .cipher
            .encrypt(nonce, plaintext.as_bytes())
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Encryption failed: {}", e)))?;

        // Prepend nonce to ciphertext
        let mut result = nonce_bytes.to_vec();
        result.extend(ciphertext);

        // S-21: Prefix with version for key rotation support
        Ok(format!("v{}:{}", self.key_version, BASE64.encode(result)))
    }

    /// Decrypt ciphertext data
    ///
    /// S-21: Supports versioned format `v{version}:{base64}` and legacy format (plain base64).
    /// Returns `(key_version, plaintext)` for the versioned format.
    pub fn decrypt(&self, ciphertext: &str) -> Result<String, AppError> {
        let (version, encoded) = Self::parse_versioned_ciphertext(ciphertext);

        // Log if using a different version than expected (for migration monitoring)
        if let Some(v) = version {
            if v != self.key_version {
                tracing::debug!(
                    expected_version = self.key_version,
                    actual_version = v,
                    "Decrypting with different key version"
                );
            }
        }

        let data = BASE64
            .decode(encoded)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Base64 decode failed: {}", e)))?;

        if data.len() < 12 {
            return Err(AppError::Internal(anyhow::anyhow!("Ciphertext too short")));
        }

        let (nonce_bytes, ciphertext_bytes) = data.split_at(12);

        #[allow(deprecated)]
        let nonce = Nonce::from_slice(nonce_bytes);

        let plaintext = self.cipher.decrypt(nonce, ciphertext_bytes).map_err(|_e| {
            // NEW-12/L-03: AES-GCM decryption failures are typically authentication failures
            // (wrong key, tampered ciphertext, or wrong nonce).
            // L-03: Don't log raw error to avoid potential information leakage.
            // The error type is always aes_gcm::Error which just indicates auth failure,
            // but we use a generic message for defense in depth.
            tracing::warn!(
                "AES-GCM decryption failed - likely AEAD authentication failure (wrong key or tampered data)"
            );
            AppError::Internal(anyhow::anyhow!("Decryption failed: AEAD authentication error"))
        })?;

        String::from_utf8(plaintext)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid UTF-8: {}", e)))
    }

    /// S-21: Extract key version from ciphertext if present
    pub fn extract_version(ciphertext: &str) -> Option<u8> {
        Self::parse_versioned_ciphertext(ciphertext).0
    }

    /// Parse versioned ciphertext format
    fn parse_versioned_ciphertext(ciphertext: &str) -> (Option<u8>, &str) {
        if ciphertext.starts_with('v') {
            if let Some(colon_pos) = ciphertext.find(':') {
                if let Ok(version) = ciphertext[1..colon_pos].parse::<u8>() {
                    return (Some(version), &ciphertext[colon_pos + 1..]);
                }
            }
        }
        // Legacy format (no version prefix)
        (None, ciphertext)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        let service = EncryptionService::from_secret("test-secret-key");
        let plaintext = "my-client-secret";

        let encrypted = service.encrypt(plaintext).unwrap();
        let decrypted = service.decrypt(&encrypted).unwrap();

        assert_eq!(plaintext, decrypted);
        assert_ne!(plaintext, encrypted); // Should be different
    }

    #[test]
    fn test_different_ciphertext_each_time() {
        let service = EncryptionService::from_secret("test-secret-key");
        let plaintext = "same-data";

        let encrypted1 = service.encrypt(plaintext).unwrap();
        let encrypted2 = service.encrypt(plaintext).unwrap();

        // Different nonce should produce different ciphertext
        assert_ne!(encrypted1, encrypted2);

        // Both should decrypt to same plaintext
        assert_eq!(service.decrypt(&encrypted1).unwrap(), plaintext);
        assert_eq!(service.decrypt(&encrypted2).unwrap(), plaintext);
    }

    #[test]
    fn test_encrypted_output_has_version_prefix() {
        let service = EncryptionService::from_secret("test-secret-key");
        let encrypted = service.encrypt("test-data").unwrap();

        // Should have version prefix "v1:"
        assert!(
            encrypted.starts_with("v1:"),
            "Expected v1: prefix, got: {}",
            encrypted
        );
    }

    #[test]
    fn test_version_extraction() {
        let service = EncryptionService::from_secret("test-secret-key");
        let encrypted = service.encrypt("test-data").unwrap();

        let version = EncryptionService::extract_version(&encrypted);
        assert_eq!(version, Some(1));
    }

    #[test]
    fn test_key_version_custom() {
        let service = EncryptionService::from_secret_with_version("test-secret-key", 2);
        assert_eq!(service.key_version(), 2);

        let encrypted = service.encrypt("test-data").unwrap();
        assert!(
            encrypted.starts_with("v2:"),
            "Expected v2: prefix, got: {}",
            encrypted
        );

        let version = EncryptionService::extract_version(&encrypted);
        assert_eq!(version, Some(2));
    }

    #[test]
    fn test_legacy_format_decryption() {
        // Simulate legacy format (no version prefix) - just base64(nonce + ciphertext)
        let service = EncryptionService::from_secret("test-secret-key");

        // Encrypt with current service, then strip version prefix to simulate legacy
        let encrypted = service.encrypt("legacy-data").unwrap();
        let legacy_format = encrypted.strip_prefix("v1:").unwrap();

        // Should still decrypt correctly
        let decrypted = service.decrypt(legacy_format).unwrap();
        assert_eq!(decrypted, "legacy-data");
    }

    #[test]
    fn test_extract_version_legacy_format() {
        // No version prefix
        let version = EncryptionService::extract_version("SGVsbG8gV29ybGQ=");
        assert_eq!(version, None);
    }

    #[test]
    fn test_key_rotation_scenario() {
        // Old key version 1
        let old_service = EncryptionService::from_secret_with_version("old-secret", 1);
        let encrypted_v1 = old_service.encrypt("sensitive-data").unwrap();

        // New key version 2 (same secret for test - in practice would be different)
        let new_service = EncryptionService::from_secret_with_version("old-secret", 2);

        // Old service can decrypt old data
        assert_eq!(
            old_service.decrypt(&encrypted_v1).unwrap(),
            "sensitive-data"
        );

        // New service can also decrypt old data (same key)
        assert_eq!(
            new_service.decrypt(&encrypted_v1).unwrap(),
            "sensitive-data"
        );

        // New encryptions use version 2
        let encrypted_v2 = new_service.encrypt("new-data").unwrap();
        assert!(encrypted_v2.starts_with("v2:"));
    }

    #[test]
    fn test_hkdf_roundtrip() {
        let service = EncryptionService::from_secret_hkdf("test-hkdf-secret", 2);
        let plaintext = "hkdf-protected-data";

        let encrypted = service.encrypt(plaintext).unwrap();
        assert!(encrypted.starts_with("v2:"));

        let decrypted = service.decrypt(&encrypted).unwrap();
        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn test_hkdf_differs_from_sha256() {
        // HKDF and SHA-256 derivation produce different keys from same secret
        let sha_service = EncryptionService::from_secret_with_version("same-secret", 1);
        let hkdf_service = EncryptionService::from_secret_hkdf("same-secret", 2);

        let encrypted_sha = sha_service.encrypt("test").unwrap();
        // HKDF service should NOT be able to decrypt SHA-derived ciphertext
        assert!(hkdf_service.decrypt(&encrypted_sha).is_err());
    }
}
