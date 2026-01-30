//! Note encryption service for Privacy Cash notes
//!
//! Uses AES-256-GCM for encrypting privacy notes. Unlike the general encryption
//! service, this one:
//! - Works with raw bytes (notes are binary data)
//! - Returns nonce separately (stored in a dedicated DB column)
//! - Is specifically designed for privacy-critical note storage

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use rand::{rngs::OsRng, RngCore};
use zeroize::Zeroize;

use crate::errors::AppError;

/// AES-GCM nonce size
pub const NONCE_SIZE: usize = 12;

/// Result of encrypting a note
#[derive(Debug)]
pub struct EncryptedNote {
    /// The encrypted note data
    pub ciphertext: Vec<u8>,
    /// The 12-byte nonce used for encryption
    pub nonce: Vec<u8>,
}

/// Service for encrypting and decrypting Privacy Cash notes
///
/// Notes contain secrets for withdrawing funds, so they must be:
/// - Encrypted at rest with a server-side key
/// - Never exposed to clients
/// - Zeroized from memory after use
#[derive(Clone)]
pub struct NoteEncryptionService {
    cipher: Aes256Gcm,
    /// Key ID for rotation support (stored with each encrypted note)
    key_id: String,
}

impl NoteEncryptionService {
    /// Create a new note encryption service from a 32-byte key
    ///
    /// # Arguments
    /// * `key` - Exactly 32 bytes (256 bits) of key material
    /// * `key_id` - Identifier for this key version (e.g., "v1", "v2")
    ///
    /// # Errors
    /// Returns an error if the key is not exactly 32 bytes
    pub fn new(key: &[u8], key_id: &str) -> Result<Self, AppError> {
        if key.len() != 32 {
            return Err(AppError::Config(format!(
                "Note encryption key must be exactly 32 bytes (got {} bytes)",
                key.len()
            )));
        }

        let cipher = Aes256Gcm::new_from_slice(key)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create cipher: {}", e)))?;

        Ok(Self {
            cipher,
            key_id: key_id.to_string(),
        })
    }

    /// Create from a base64-encoded key
    ///
    /// # Arguments
    /// * `key_base64` - Base64-encoded 32-byte key
    /// * `key_id` - Identifier for this key version
    pub fn from_base64(key_base64: &str, key_id: &str) -> Result<Self, AppError> {
        use base64::{engine::general_purpose::STANDARD, Engine as _};

        let mut key = STANDARD
            .decode(key_base64)
            .map_err(|e| AppError::Config(format!("Invalid base64 note encryption key: {}", e)))?;

        let result = Self::new(&key, key_id);

        // Zeroize the key after creating the cipher
        key.zeroize();

        result
    }

    /// Get the key ID for this service
    pub fn key_id(&self) -> &str {
        &self.key_id
    }

    /// Encrypt a note
    ///
    /// # Arguments
    /// * `plaintext` - The raw note bytes to encrypt
    ///
    /// # Returns
    /// The encrypted note with its nonce
    pub fn encrypt(&self, plaintext: &[u8]) -> Result<EncryptedNote, AppError> {
        let mut nonce_bytes = [0u8; NONCE_SIZE];
        OsRng.fill_bytes(&mut nonce_bytes);

        #[allow(deprecated)]
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = self
            .cipher
            .encrypt(nonce, plaintext)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Note encryption failed: {}", e)))?;

        Ok(EncryptedNote {
            ciphertext,
            nonce: nonce_bytes.to_vec(),
        })
    }

    /// Decrypt a note
    ///
    /// # Arguments
    /// * `ciphertext` - The encrypted note bytes
    /// * `nonce` - The 12-byte nonce used during encryption
    ///
    /// # Returns
    /// The decrypted note bytes
    ///
    /// # Errors
    /// Returns an error if decryption fails (wrong key, tampered data, or wrong nonce)
    pub fn decrypt(&self, ciphertext: &[u8], nonce: &[u8]) -> Result<Vec<u8>, AppError> {
        if nonce.len() != NONCE_SIZE {
            return Err(AppError::Validation(format!(
                "Invalid nonce size: expected {} bytes, got {}",
                NONCE_SIZE,
                nonce.len()
            )));
        }

        #[allow(deprecated)]
        let nonce = Nonce::from_slice(nonce);

        self.cipher.decrypt(nonce, ciphertext).map_err(|_e| {
            // Don't log the actual error to avoid information leakage
            tracing::warn!(
                key_id = %self.key_id,
                "Note decryption failed - AEAD authentication error"
            );
            AppError::Internal(anyhow::anyhow!(
                "Note decryption failed: authentication error (wrong key or tampered data)"
            ))
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_key() -> [u8; 32] {
        // Static test key - DO NOT use in production
        [
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d,
            0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b,
            0x1c, 0x1d, 0x1e, 0x1f,
        ]
    }

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        let service = NoteEncryptionService::new(&test_key(), "v1").unwrap();
        let note = b"secret-note-data-with-nullifier";

        let encrypted = service.encrypt(note).unwrap();
        let decrypted = service
            .decrypt(&encrypted.ciphertext, &encrypted.nonce)
            .unwrap();

        assert_eq!(note.to_vec(), decrypted);
    }

    #[test]
    fn test_different_ciphertext_each_time() {
        let service = NoteEncryptionService::new(&test_key(), "v1").unwrap();
        let note = b"same-note";

        let encrypted1 = service.encrypt(note).unwrap();
        let encrypted2 = service.encrypt(note).unwrap();

        // Different nonce should produce different ciphertext
        assert_ne!(encrypted1.ciphertext, encrypted2.ciphertext);
        assert_ne!(encrypted1.nonce, encrypted2.nonce);

        // Both should decrypt to same plaintext
        assert_eq!(
            service
                .decrypt(&encrypted1.ciphertext, &encrypted1.nonce)
                .unwrap(),
            note.to_vec()
        );
        assert_eq!(
            service
                .decrypt(&encrypted2.ciphertext, &encrypted2.nonce)
                .unwrap(),
            note.to_vec()
        );
    }

    #[test]
    fn test_nonce_size() {
        let service = NoteEncryptionService::new(&test_key(), "v1").unwrap();
        let encrypted = service.encrypt(b"test").unwrap();

        assert_eq!(encrypted.nonce.len(), NONCE_SIZE);
    }

    #[test]
    fn test_wrong_key_fails() {
        let service1 = NoteEncryptionService::new(&test_key(), "v1").unwrap();
        let mut different_key = test_key();
        different_key[0] = 0xff; // Change one byte
        let service2 = NoteEncryptionService::new(&different_key, "v1").unwrap();

        let encrypted = service1.encrypt(b"secret").unwrap();

        // Decryption with wrong key should fail
        let result = service2.decrypt(&encrypted.ciphertext, &encrypted.nonce);
        assert!(result.is_err());
    }

    #[test]
    fn test_wrong_nonce_fails() {
        let service = NoteEncryptionService::new(&test_key(), "v1").unwrap();
        let encrypted = service.encrypt(b"secret").unwrap();

        let mut wrong_nonce = encrypted.nonce.clone();
        wrong_nonce[0] ^= 0xff; // Flip some bits

        let result = service.decrypt(&encrypted.ciphertext, &wrong_nonce);
        assert!(result.is_err());
    }

    #[test]
    fn test_tampered_ciphertext_fails() {
        let service = NoteEncryptionService::new(&test_key(), "v1").unwrap();
        let encrypted = service.encrypt(b"secret").unwrap();

        let mut tampered = encrypted.ciphertext.clone();
        tampered[0] ^= 0xff; // Flip some bits

        let result = service.decrypt(&tampered, &encrypted.nonce);
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_key_size() {
        let result = NoteEncryptionService::new(&[0u8; 16], "v1"); // 16 bytes instead of 32
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_nonce_size() {
        let service = NoteEncryptionService::new(&test_key(), "v1").unwrap();
        let encrypted = service.encrypt(b"test").unwrap();

        let result = service.decrypt(&encrypted.ciphertext, &[0u8; 8]); // 8 bytes instead of 12
        assert!(result.is_err());
    }

    #[test]
    fn test_from_base64() {
        use base64::{engine::general_purpose::STANDARD, Engine as _};

        let key = test_key();
        let key_base64 = STANDARD.encode(key);

        let service = NoteEncryptionService::from_base64(&key_base64, "v1").unwrap();
        assert_eq!(service.key_id(), "v1");

        // Should work for encryption/decryption
        let encrypted = service.encrypt(b"test").unwrap();
        let decrypted = service
            .decrypt(&encrypted.ciphertext, &encrypted.nonce)
            .unwrap();
        assert_eq!(decrypted, b"test".to_vec());
    }

    #[test]
    fn test_key_id() {
        let service = NoteEncryptionService::new(&test_key(), "v2").unwrap();
        assert_eq!(service.key_id(), "v2");
    }
}
