//! Legacy AES-256-GCM decryption for migrating TOTP seeds and SSO client secrets
//! from database rows into the host secret seam. Ported from
//! `server/src/services/encryption_service.rs`: HKDF-SHA256 key derivation from a
//! host secret and the versioned `v{v}:{base64(nonce || ciphertext)}` wire format.
use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use hmac::{Hmac, Mac};
#[cfg(test)]
use rand::rngs::OsRng;
#[cfg(test)]
use rand::RngCore;
use zeroize::Zeroize;

use super::AuthError;

type HmacSha256 = Hmac<sha2::Sha256>;

pub struct EncryptionService {
    cipher: Aes256Gcm,
    key_version: u8,
}

impl EncryptionService {
    /// Derive the AES-256 key from `secret` via HKDF-SHA256 (matches the server's
    /// `from_secret_hkdf`).
    pub fn from_secret(secret: &str) -> Self {
        let mut key = derive_key(secret);
        let cipher = Aes256Gcm::new_from_slice(&key).expect("derived key is 32 bytes");
        key.zeroize();
        Self {
            cipher,
            key_version: 1,
        }
    }

    /// Encrypt to `v{version}:{base64(nonce || ciphertext)}`.
    #[cfg(test)]
    pub fn encrypt(&self, plaintext: &str) -> Result<String, AuthError> {
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let ciphertext = self
            .cipher
            .encrypt(&Nonce::from(nonce_bytes), plaintext.as_bytes())
            .map_err(|_| AuthError::Crypto("encryption failed".to_string()))?;
        let mut out = nonce_bytes.to_vec();
        out.extend(ciphertext);
        Ok(format!("v{}:{}", self.key_version, BASE64.encode(out)))
    }

    /// Decrypt the `v{version}:{base64(nonce || ciphertext)}` format. The version
    /// is honored, not discarded: a ciphertext written under a different key
    /// version than this service holds is rejected with a DISTINCT error (callers
    /// can map it to a re-enroll/re-enter prompt) rather than producing an opaque
    /// "decryption failed" when the at-rest key has changed. An unversioned tag
    /// (legacy) is accepted.
    pub fn decrypt(&self, ciphertext: &str) -> Result<String, AuthError> {
        let encoded = match ciphertext.split_once(':') {
            Some((tag, rest)) => {
                if let Some(version) = tag.strip_prefix('v').and_then(|n| n.parse::<u8>().ok()) {
                    if version != self.key_version {
                        return Err(AuthError::Crypto(format!(
                            "key version mismatch: ciphertext v{version} != active v{}",
                            self.key_version
                        )));
                    }
                }
                rest
            }
            None => ciphertext,
        };
        let data = BASE64
            .decode(encoded)
            .map_err(|_| AuthError::Crypto("base64 decode".to_string()))?;
        if data.len() < 12 {
            return Err(AuthError::Crypto("ciphertext too short".to_string()));
        }
        let (nonce, ct) = data.split_at(12);
        let nonce: [u8; 12] = nonce
            .try_into()
            .map_err(|_| AuthError::Crypto("nonce length".to_string()))?;
        let plaintext = self
            .cipher
            .decrypt(&Nonce::from(nonce), ct)
            .map_err(|_| AuthError::Crypto("decryption failed (auth)".to_string()))?;
        String::from_utf8(plaintext).map_err(|_| AuthError::Crypto("invalid utf8".to_string()))
    }
}

fn derive_key(secret: &str) -> [u8; 32] {
    // HKDF-Extract (fixed info as the HMAC key, matching the server).
    let mut extract =
        <HmacSha256 as Mac>::new_from_slice(b"cedros-encryption-service").expect("hmac key");
    extract.update(secret.as_bytes());
    let prk = extract.finalize().into_bytes();
    // HKDF-Expand.
    let mut expand = <HmacSha256 as Mac>::new_from_slice(&prk).expect("hmac key");
    expand.update(b"cedros-encryption-aes256gcm");
    expand.update(&[1u8]);
    let okm = expand.finalize().into_bytes();
    let mut key = [0u8; 32];
    key.copy_from_slice(&okm);
    key
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_and_format() {
        let svc = EncryptionService::from_secret("a-high-entropy-secret");
        let ct = svc.encrypt("my-totp-secret").unwrap();
        assert!(ct.starts_with("v1:"));
        assert_eq!(svc.decrypt(&ct).unwrap(), "my-totp-secret");
        // Distinct nonces => distinct ciphertexts for the same plaintext.
        assert_ne!(svc.encrypt("x").unwrap(), svc.encrypt("x").unwrap());
    }

    #[test]
    fn wrong_key_fails_to_decrypt() {
        let ct = EncryptionService::from_secret("key-one")
            .encrypt("secret")
            .unwrap();
        assert!(EncryptionService::from_secret("key-two")
            .decrypt(&ct)
            .is_err());
    }

    #[test]
    fn tampered_ciphertext_fails() {
        let svc = EncryptionService::from_secret("k");
        let mut ct = svc.encrypt("secret").unwrap();
        ct.push('A'); // corrupt the base64 tail
        assert!(svc.decrypt(&ct).is_err());
    }

    #[test]
    fn version_mismatch_is_a_distinct_error() {
        let svc = EncryptionService::from_secret("k");
        let ct = svc.encrypt("secret").unwrap(); // "v1:..."
                                                 // A future/other key version is rejected distinctly, not opaquely.
        let bumped = ct.replacen("v1:", "v2:", 1);
        let err = svc.decrypt(&bumped).unwrap_err();
        assert!(format!("{err}").contains("key version mismatch"));
        // Unversioned (legacy) tag still decrypts.
        assert_eq!(svc.decrypt(&ct).unwrap(), "secret");
    }
}
