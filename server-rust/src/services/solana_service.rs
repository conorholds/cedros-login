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
}

impl SolanaService {
    /// Markers used in challenge messages
    const NONCE_MARKER: &'static str = ". Nonce: ";
    const MESSAGE_PREFIX: &'static str = "Sign in with wallet ";

    /// Create a new Solana service from config
    pub fn new(config: &SolanaConfig) -> Self {
        Self {
            challenge_expiry_seconds: config.challenge_expiry_seconds,
        }
    }

    /// Generate a challenge message for the given public key.
    ///
    /// The public key and domain are included in the message to bind the
    /// challenge to a specific wallet and origin, preventing challenge reuse
    /// across different wallets or phishing sites.
    ///
    /// `challenge_expiry_seconds` controls how long the challenge is valid.
    /// Callers should resolve this from SettingsService at request time.
    ///
    /// `domain` is the frontend URL (e.g. "https://example.com") included in
    /// the message to prevent cross-site reuse. If `None`, falls back to a
    /// generic message without domain binding.
    pub fn generate_challenge(
        &self,
        public_key: &str,
        challenge_expiry_seconds: u64,
        domain: Option<&str>,
    ) -> Result<ChallengeResponse, AppError> {
        // SEC-08: Use OsRng for cryptographic nonce generation
        let nonce: String = OsRng
            .sample_iter(&rand::distributions::Alphanumeric)
            .take(32)
            .map(char::from)
            .collect();

        let now = Utc::now();
        let expires_at = now + Duration::seconds(challenge_expiry_seconds as i64);

        // Truncate pubkey to first6...last6 for readability in wallet popup
        let pk_display = if public_key.len() > 12 {
            format!(
                "{}...{}",
                &public_key[..6],
                &public_key[public_key.len() - 6..]
            )
        } else {
            public_key.to_string()
        };

        // Format the message for wallet popup — friendly, non-technical.
        // Domain binding prevents phishing sites from tricking users into
        // signing a message that could be replayed on the real site.
        let domain_clause = domain.map(|d| format!(" on {d}")).unwrap_or_default();

        let message = format!(
            "Sign in with wallet {pk_display}{domain_clause}. This message confirms ownership of your wallet and costs nothing to sign. Expires: {}. Nonce: {nonce}.",
            expires_at.to_rfc3339(),
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
    /// the exact format: "Sign in with wallet {pk}. ... Expires: {ts}. Nonce: {nonce}."
    ///
    /// # Security (S-09)
    ///
    /// - Validates message starts with expected prefix
    /// - Rejects messages with multiple nonce markers (prevents injection)
    /// - Validates nonce format (32 alphanumeric chars)
    /// - Validates message ends with expected suffix
    pub fn extract_nonce(message: &str) -> Option<String> {
        // S-09: Verify message starts with expected prefix
        if !message.starts_with(Self::MESSAGE_PREFIX) {
            return None;
        }

        // S-09: Verify message ends with period
        if !message.ends_with('.') {
            return None;
        }

        // Reject messages with multiple nonce markers to prevent injection
        if message.matches(Self::NONCE_MARKER).count() != 1 {
            return None;
        }

        // Nonce is now at end: "... Nonce: {nonce}."
        let nonce_start = message.find(Self::NONCE_MARKER)?;
        let after_marker = &message[nonce_start + Self::NONCE_MARKER.len()..];

        // Strip trailing period to get the nonce
        let nonce = after_marker.strip_suffix('.')?;

        // Validate nonce format: alphanumeric only, expected length
        if nonce.len() != 32 || !nonce.chars().all(|c| c.is_ascii_alphanumeric()) {
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
    fn test_generate_challenge_without_domain() {
        let service = SolanaService::new(&test_config());
        let public_key = "ABCDEFghijklmnopqrstuvwxyz123456789abcdef1234";
        let challenge = service.generate_challenge(public_key, 300, None).unwrap();

        assert!(!challenge.nonce.is_empty());
        assert!(challenge.message.starts_with("Sign in with wallet "));
        assert!(challenge.message.contains(&challenge.nonce));
        assert!(challenge.message.contains("ABCDEF...ef1234"));
        assert!(challenge.message.contains("costs nothing to sign"));
        assert!(!challenge.message.contains(" on "));
    }

    #[test]
    fn test_generate_challenge_with_domain() {
        let service = SolanaService::new(&test_config());
        let public_key = "ABCDEFghijklmnopqrstuvwxyz123456789abcdef1234";
        let challenge = service
            .generate_challenge(public_key, 300, Some("https://example.com"))
            .unwrap();

        assert!(challenge.message.contains("on https://example.com"));
        assert!(challenge.message.starts_with("Sign in with wallet "));
        assert!(challenge.message.contains(&challenge.nonce));
    }

    #[test]
    fn test_extract_nonce_from_generated_message() {
        let service = SolanaService::new(&test_config());
        // Without domain
        let challenge = service
            .generate_challenge("test_pubkey", 300, None)
            .unwrap();
        let extracted = SolanaService::extract_nonce(&challenge.message);
        assert_eq!(extracted, Some(challenge.nonce));

        // With domain
        let challenge = service
            .generate_challenge("test_pubkey", 300, Some("https://example.com"))
            .unwrap();
        let extracted = SolanaService::extract_nonce(&challenge.message);
        assert_eq!(extracted, Some(challenge.nonce));
    }

    #[test]
    fn test_extract_nonce_rejects_invalid_length() {
        let message = "Sign in with wallet ABCDEF...f1234. This message confirms ownership of your wallet and costs nothing to sign. Expires: 2024-01-01T00:05:00+00:00. Nonce: tooshort.";
        assert!(SolanaService::extract_nonce(message).is_none());
    }

    #[test]
    fn test_extract_nonce_rejects_invalid_chars() {
        let message = "Sign in with wallet ABCDEF...f1234. This message confirms ownership of your wallet and costs nothing to sign. Expires: 2024-01-01T00:05:00+00:00. Nonce: abc123!@#$%^&*()_+def456ghi012.";
        assert!(SolanaService::extract_nonce(message).is_none());
    }

    #[test]
    fn test_invalid_public_key() {
        let service = SolanaService::new(&test_config());
        let result = service.verify_signature("invalid", "sig", "message");
        assert!(result.is_err());
    }

    #[test]
    fn test_extract_nonce_rejects_wrong_prefix() {
        let message = "Evil with wallet ABCDEF...f1234. This message confirms ownership of your wallet and costs nothing to sign. Expires: 2024-01-01T00:05:00+00:00. Nonce: 12345678901234567890123456789012.";
        assert!(SolanaService::extract_nonce(message).is_none());
    }

    #[test]
    fn test_extract_nonce_rejects_missing_suffix() {
        let message = "Sign in with wallet ABCDEF...f1234. This message confirms ownership of your wallet and costs nothing to sign. Expires: 2024-01-01T00:05:00+00:00. Nonce: 12345678901234567890123456789012";
        assert!(SolanaService::extract_nonce(message).is_none());
    }

    #[test]
    fn test_extract_nonce_rejects_multiple_markers() {
        let message = "Sign in with wallet ABCDEF...f1234. This message confirms ownership of your wallet and costs nothing to sign. Nonce: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA. Expires: 2024-01-01T00:05:00+00:00. Nonce: 12345678901234567890123456789012.";
        assert!(SolanaService::extract_nonce(message).is_none());
    }
}
