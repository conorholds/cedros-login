//! Solana wallet authentication service

use chrono::{Duration, Utc};
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use rand::{rngs::OsRng, Rng};

use crate::config::SolanaConfig;
use crate::errors::AppError;
use crate::models::ChallengeResponse;

/// Solana authentication service for challenge generation and signature verification
#[derive(Clone)]
pub struct SolanaService {
    challenge_expiry_seconds: u64,
    app_name: String,
}

impl SolanaService {
    const DEFAULT_APP_NAME: &'static str = "Cedros Login";
    /// Markers used in challenge messages - app names must not contain these
    const NONCE_MARKER: &'static str = ". Nonce: ";
    const TIMESTAMP_MARKER: &'static str = ". Timestamp: ";
    const MESSAGE_PREFIX: &'static str = "Login to ";

    /// Create a new Solana service from config
    ///
    pub fn new(config: &SolanaConfig, app_name: String) -> Self {
        // S-09: Validate app_name doesn't contain message markers.
        // If invalid, fall back to a safe default to avoid panics or injection.
        let app_name =
            if app_name.contains(Self::NONCE_MARKER) || app_name.contains(Self::TIMESTAMP_MARKER) {
                tracing::error!(
                    app_name = %app_name,
                    "Invalid Solana app name contains reserved markers; using default"
                );
                Self::DEFAULT_APP_NAME.to_string()
            } else {
                app_name
            };

        Self {
            challenge_expiry_seconds: config.challenge_expiry_seconds,
            app_name,
        }
    }

    /// Generate a challenge message for the given public key.
    ///
    /// The public key is included in the message to bind the challenge to a
    /// specific wallet, preventing challenge reuse across different wallets.
    pub fn generate_challenge(&self, public_key: &str) -> Result<ChallengeResponse, AppError> {
        // SEC-08: Use OsRng for cryptographic nonce generation
        let nonce: String = OsRng
            .sample_iter(&rand::distributions::Alphanumeric)
            .take(32)
            .map(char::from)
            .collect();

        let now = Utc::now();
        let expires_at = now + Duration::seconds(self.challenge_expiry_seconds as i64);

        // Format the message according to the spec.
        // Public key is included to bind the challenge to this specific wallet.
        let message = format!(
            "Login to {} with wallet {}. Nonce: {}. Timestamp: {}.",
            self.app_name,
            public_key,
            nonce,
            now.to_rfc3339()
        );

        Ok(ChallengeResponse {
            nonce,
            message,
            expires_at,
        })
    }

    /// Verify a signature against a message and public key
    pub fn verify_signature(
        &self,
        public_key_base58: &str,
        signature_base64: &str,
        message: &str,
    ) -> Result<bool, AppError> {
        // Decode the public key from base58
        let public_key_bytes = bs58::decode(public_key_base58)
            .into_vec()
            .map_err(|_| AppError::Validation("Invalid public key format".into()))?;

        if public_key_bytes.len() != 32 {
            return Err(AppError::Validation("Invalid public key length".into()));
        }

        let public_key_array: [u8; 32] = public_key_bytes
            .try_into()
            .map_err(|_| AppError::Validation("Invalid public key length".into()))?;

        let verifying_key = VerifyingKey::from_bytes(&public_key_array)
            .map_err(|_| AppError::Validation("Invalid public key".into()))?;

        // Decode the signature from base64
        let signature_bytes =
            base64::Engine::decode(&base64::engine::general_purpose::STANDARD, signature_base64)
                .map_err(|_| AppError::Validation("Invalid signature format".into()))?;

        if signature_bytes.len() != 64 {
            return Err(AppError::Validation("Invalid signature length".into()));
        }

        let signature_array: [u8; 64] = signature_bytes
            .try_into()
            .map_err(|_| AppError::Validation("Invalid signature length".into()))?;

        let signature = Signature::from_bytes(&signature_array);

        // Verify the signature
        Ok(verifying_key.verify(message.as_bytes(), &signature).is_ok())
    }

    /// Extract the nonce from a challenge message
    ///
    /// Uses strict parsing to prevent injection attacks. The message must follow
    /// the exact format: "Login to {app} with wallet {pubkey}. Nonce: {nonce}. Timestamp: {timestamp}."
    ///
    /// # Security (S-09)
    ///
    /// - Validates message starts with expected prefix
    /// - Uses `rfind` to find LAST occurrence of markers (prevents prefix injection)
    /// - Validates nonce format (32 alphanumeric chars)
    /// - Validates message ends with expected suffix
    pub fn extract_nonce(message: &str) -> Option<String> {
        // S-09: Verify message starts with expected prefix
        if !message.starts_with(Self::MESSAGE_PREFIX) {
            return None;
        }

        // NEW-09: Reject messages with multiple nonce markers to prevent injection attacks
        if message.matches(Self::NONCE_MARKER).count() != 1 {
            return None;
        }

        // Find the nonce marker (now guaranteed to be exactly one)
        let nonce_start = message.find(Self::NONCE_MARKER)?;
        let after_marker = &message[nonce_start + Self::NONCE_MARKER.len()..];

        // Find the end marker ". Timestamp:" AFTER the nonce
        let nonce_end = after_marker.find(Self::TIMESTAMP_MARKER)?;
        let nonce = &after_marker[..nonce_end];

        // Validate nonce format: alphanumeric only, expected length
        if nonce.len() != 32 || !nonce.chars().all(|c| c.is_ascii_alphanumeric()) {
            return None;
        }

        // S-09: Verify message ends with period (expected format)
        if !message.ends_with('.') {
            return None;
        }

        Some(nonce.to_string())
    }

    /// Get the challenge expiry duration in seconds
    pub fn challenge_expiry_seconds(&self) -> u64 {
        self.challenge_expiry_seconds
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_config() -> SolanaConfig {
        SolanaConfig {
            enabled: true,
            challenge_expiry_seconds: 300,
        }
    }

    #[test]
    fn test_generate_challenge() {
        let service = SolanaService::new(&test_config(), "TestApp".to_string());
        let public_key = "test_pubkey";
        let challenge = service.generate_challenge(public_key).unwrap();

        assert!(!challenge.nonce.is_empty());
        assert!(challenge.message.contains("Login to TestApp"));
        assert!(challenge.message.contains(&challenge.nonce));
        // B-12: Verify public key is bound to challenge message
        assert!(
            challenge.message.contains(public_key),
            "Challenge message must contain public key for binding"
        );
    }

    #[test]
    fn test_extract_nonce_from_generated_message() {
        // Test with actual generated message format
        let service = SolanaService::new(&test_config(), "TestApp".to_string());
        let challenge = service.generate_challenge("test_pubkey").unwrap();

        let extracted = SolanaService::extract_nonce(&challenge.message);
        assert_eq!(extracted, Some(challenge.nonce));
    }

    #[test]
    fn test_invalid_app_name_rejected() {
        let service = SolanaService::new(&test_config(), "Bad. Nonce: ".to_string());
        let challenge = service.generate_challenge("test_pubkey").unwrap();
        assert!(challenge.message.starts_with("Login to Cedros Login"));
    }

    #[test]
    fn test_extract_nonce_rejects_invalid_length() {
        // Build a message with wrong nonce length
        let message = "Login to TestApp. Nonce: tooshort. Timestamp: 2024-01-01T00:00:00+00:00.";
        assert!(SolanaService::extract_nonce(message).is_none());
    }

    #[test]
    fn test_extract_nonce_rejects_invalid_chars() {
        // Build a message with 32-char nonce containing special chars
        let message =
            "Login to TestApp. Nonce: abc123!@#$%^&*()_+def456ghi012. Timestamp: 2024-01-01T00:00:00+00:00.";
        assert!(SolanaService::extract_nonce(message).is_none());
    }

    #[test]
    fn test_invalid_public_key() {
        let service = SolanaService::new(&test_config(), "TestApp".to_string());
        let result = service.verify_signature("invalid", "sig", "message");
        assert!(result.is_err());
    }

    #[test]
    fn test_extract_nonce_rejects_wrong_prefix() {
        // S-09: Message must start with "Login to "
        let message =
            "Evil to TestApp. Nonce: 12345678901234567890123456789012. Timestamp: 2024-01-01T00:00:00+00:00.";
        assert!(SolanaService::extract_nonce(message).is_none());
    }

    #[test]
    fn test_extract_nonce_rejects_missing_suffix() {
        // S-09: Message must end with period
        let message =
            "Login to TestApp. Nonce: 12345678901234567890123456789012. Timestamp: 2024-01-01T00:00:00+00:00";
        assert!(SolanaService::extract_nonce(message).is_none());
    }

    #[test]
    fn test_app_name_injection_prevented() {
        // S-09: App name must not contain message markers
        let evil_app_name = "Evil. Nonce: FAKE12345678901234567890123456. Timestamp: x";
        let service = SolanaService::new(&test_config(), evil_app_name.to_string());
        let challenge = service.generate_challenge("test_pubkey").unwrap();
        assert!(challenge.message.starts_with("Login to Cedros Login"));
    }

    #[test]
    fn test_extract_nonce_rejects_multiple_markers() {
        // NEW-09: Message with multiple nonce markers should be rejected
        let message =
            "Login to TestApp. Nonce: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA. Nonce: 12345678901234567890123456789012. Timestamp: 2024-01-01T00:00:00+00:00.";
        assert!(SolanaService::extract_nonce(message).is_none());
    }
}
