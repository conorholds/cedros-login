//! Verification token repository for email verification and password reset

use async_trait::async_trait;
use chrono::{DateTime, Duration, Utc};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Token type for verification tokens
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TokenType {
    EmailVerify,
    PasswordReset,
    InstantLink,
    /// Pending MFA verification during login (short-lived, 5 minutes)
    MfaPending,
}

impl TokenType {
    pub fn as_str(&self) -> &'static str {
        match self {
            TokenType::EmailVerify => "email_verify",
            TokenType::PasswordReset => "password_reset",
            TokenType::InstantLink => "instant_link",
            TokenType::MfaPending => "mfa_pending",
        }
    }

    /// Parse token type from string (returns None for invalid values)
    #[allow(clippy::should_implement_trait)]
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "email_verify" => Some(TokenType::EmailVerify),
            "password_reset" => Some(TokenType::PasswordReset),
            "instant_link" => Some(TokenType::InstantLink),
            "mfa_pending" => Some(TokenType::MfaPending),
            _ => None,
        }
    }
}

/// Verification token entity
#[derive(Debug, Clone)]
pub struct VerificationToken {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token_hash: String,
    pub token_type: TokenType,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub used_at: Option<DateTime<Utc>>,
}

impl VerificationToken {
    /// Check if the token is still valid (not expired and not used)
    pub fn is_valid(&self) -> bool {
        self.used_at.is_none() && self.expires_at > Utc::now()
    }
}

/// Repository trait for verification tokens
#[async_trait]
pub trait VerificationRepository: Send + Sync {
    /// Create a new verification token
    async fn create(
        &self,
        user_id: Uuid,
        token_hash: &str,
        token_type: TokenType,
        expires_at: DateTime<Utc>,
    ) -> Result<VerificationToken, RepositoryError>;

    /// Find a token by its hash
    async fn find_by_hash(
        &self,
        token_hash: &str,
    ) -> Result<Option<VerificationToken>, RepositoryError>;

    /// Mark a token as used
    async fn mark_used(&self, id: Uuid) -> Result<(), RepositoryError>;

    /// Atomically consume a token if it's valid (not expired, not used).
    /// Returns the token if successfully consumed, None if token was already used/expired.
    /// This prevents TOCTOU race conditions in token verification.
    async fn consume_if_valid(
        &self,
        token_hash: &str,
    ) -> Result<Option<VerificationToken>, RepositoryError>;

    /// Delete all tokens for a user of a specific type
    async fn delete_for_user(
        &self,
        user_id: Uuid,
        token_type: TokenType,
    ) -> Result<(), RepositoryError>;

    /// Delete expired tokens (cleanup)
    async fn delete_expired(&self) -> Result<u64, RepositoryError>;
}

/// Repository error type
#[derive(Debug, thiserror::Error)]
pub enum RepositoryError {
    #[error("Database error: {0}")]
    Database(String),
}

/// In-memory implementation for testing
#[derive(Debug, Clone, Default)]
pub struct InMemoryVerificationRepository {
    tokens: Arc<RwLock<HashMap<Uuid, VerificationToken>>>,
}

impl InMemoryVerificationRepository {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl VerificationRepository for InMemoryVerificationRepository {
    async fn create(
        &self,
        user_id: Uuid,
        token_hash: &str,
        token_type: TokenType,
        expires_at: DateTime<Utc>,
    ) -> Result<VerificationToken, RepositoryError> {
        let token = VerificationToken {
            id: Uuid::new_v4(),
            user_id,
            token_hash: token_hash.to_string(),
            token_type,
            created_at: Utc::now(),
            expires_at,
            used_at: None,
        };

        let mut tokens = self.tokens.write().await;
        // D-13: Delete old unused tokens of same type for same user
        tokens.retain(|_, t| {
            !(t.user_id == user_id && t.token_type == token_type && t.used_at.is_none())
        });
        tokens.insert(token.id, token.clone());
        Ok(token)
    }

    async fn find_by_hash(
        &self,
        token_hash: &str,
    ) -> Result<Option<VerificationToken>, RepositoryError> {
        let tokens = self.tokens.read().await;
        Ok(tokens
            .values()
            .find(|t| t.token_hash == token_hash)
            .cloned())
    }

    async fn mark_used(&self, id: Uuid) -> Result<(), RepositoryError> {
        let mut tokens = self.tokens.write().await;
        if let Some(token) = tokens.get_mut(&id) {
            token.used_at = Some(Utc::now());
        }
        Ok(())
    }

    async fn consume_if_valid(
        &self,
        token_hash: &str,
    ) -> Result<Option<VerificationToken>, RepositoryError> {
        let mut tokens = self.tokens.write().await;
        let now = Utc::now();

        // Find token by hash
        let token_id = tokens
            .values()
            .find(|t| t.token_hash == token_hash)
            .map(|t| t.id);

        if let Some(id) = token_id {
            if let Some(token) = tokens.get_mut(&id) {
                // Check validity: not expired and not used
                if token.used_at.is_none() && token.expires_at > now {
                    // Atomically mark as used and return
                    token.used_at = Some(now);
                    return Ok(Some(token.clone()));
                }
            }
        }
        Ok(None)
    }

    async fn delete_for_user(
        &self,
        user_id: Uuid,
        token_type: TokenType,
    ) -> Result<(), RepositoryError> {
        let mut tokens = self.tokens.write().await;
        tokens.retain(|_, t| !(t.user_id == user_id && t.token_type == token_type));
        Ok(())
    }

    async fn delete_expired(&self) -> Result<u64, RepositoryError> {
        let mut tokens = self.tokens.write().await;
        let now = Utc::now();
        let before = tokens.len();
        // Only delete expired tokens that haven't been used yet
        // This prevents race condition where cleanup deletes a token
        // that is currently being verified (between lookup and mark_used)
        tokens.retain(|_, t| t.expires_at > now || t.used_at.is_some());
        Ok((before - tokens.len()) as u64)
    }
}

/// Helper to generate verification tokens
pub fn generate_verification_token() -> String {
    use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
    use rand::{rngs::OsRng, RngCore};

    let mut bytes = [0u8; 32];
    // SEC-08: Use OsRng for cryptographic random generation
    OsRng.fill_bytes(&mut bytes);
    URL_SAFE_NO_PAD.encode(bytes)
}

/// Hash a verification token for storage
pub fn hash_verification_token(token: &str) -> String {
    use sha2::{Digest, Sha256};
    let hash = Sha256::digest(token.as_bytes());
    hex::encode(hash)
}

/// Get default expiry for token type
pub fn default_expiry(token_type: TokenType) -> DateTime<Utc> {
    match token_type {
        TokenType::EmailVerify => Utc::now() + Duration::hours(24),
        TokenType::PasswordReset => Utc::now() + Duration::hours(1),
        TokenType::InstantLink => Utc::now() + Duration::minutes(15),
        TokenType::MfaPending => Utc::now() + Duration::minutes(5),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_token_type_conversion() {
        assert_eq!(TokenType::EmailVerify.as_str(), "email_verify");
        assert_eq!(TokenType::PasswordReset.as_str(), "password_reset");

        assert_eq!(
            TokenType::from_str("email_verify"),
            Some(TokenType::EmailVerify)
        );
        assert_eq!(
            TokenType::from_str("password_reset"),
            Some(TokenType::PasswordReset)
        );
        assert_eq!(TokenType::from_str("invalid"), None);
    }

    #[test]
    fn test_verification_token_validity() {
        let valid_token = VerificationToken {
            id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            token_hash: "hash".to_string(),
            token_type: TokenType::EmailVerify,
            created_at: Utc::now(),
            expires_at: Utc::now() + Duration::hours(1),
            used_at: None,
        };
        assert!(valid_token.is_valid());

        let expired_token = VerificationToken {
            expires_at: Utc::now() - Duration::hours(1),
            ..valid_token.clone()
        };
        assert!(!expired_token.is_valid());

        let used_token = VerificationToken {
            used_at: Some(Utc::now()),
            ..valid_token
        };
        assert!(!used_token.is_valid());
    }

    #[test]
    fn test_generate_verification_token() {
        let token1 = generate_verification_token();
        let token2 = generate_verification_token();

        assert_ne!(token1, token2);
        assert!(token1.len() >= 32);
    }

    #[test]
    fn test_hash_verification_token() {
        let token = "test-token";
        let hash1 = hash_verification_token(token);
        let hash2 = hash_verification_token(token);

        assert_eq!(hash1, hash2);
        assert_eq!(hash1.len(), 64); // SHA256 hex
    }

    #[tokio::test]
    async fn test_in_memory_create_and_find() {
        let repo = InMemoryVerificationRepository::new();
        let user_id = Uuid::new_v4();
        let token_hash = "test-hash";

        let token = repo
            .create(
                user_id,
                token_hash,
                TokenType::EmailVerify,
                default_expiry(TokenType::EmailVerify),
            )
            .await
            .unwrap();

        assert_eq!(token.user_id, user_id);
        assert_eq!(token.token_hash, token_hash);
        assert!(token.is_valid());

        let found = repo.find_by_hash(token_hash).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().id, token.id);
    }

    #[tokio::test]
    async fn test_in_memory_mark_used() {
        let repo = InMemoryVerificationRepository::new();
        let user_id = Uuid::new_v4();

        let token = repo
            .create(
                user_id,
                "hash",
                TokenType::EmailVerify,
                default_expiry(TokenType::EmailVerify),
            )
            .await
            .unwrap();

        assert!(token.is_valid());

        repo.mark_used(token.id).await.unwrap();

        let found = repo.find_by_hash("hash").await.unwrap().unwrap();
        assert!(!found.is_valid());
        assert!(found.used_at.is_some());
    }

    #[tokio::test]
    async fn test_in_memory_delete_for_user() {
        let repo = InMemoryVerificationRepository::new();
        let user_id = Uuid::new_v4();

        repo.create(
            user_id,
            "hash1",
            TokenType::EmailVerify,
            default_expiry(TokenType::EmailVerify),
        )
        .await
        .unwrap();
        repo.create(
            user_id,
            "hash2",
            TokenType::PasswordReset,
            default_expiry(TokenType::PasswordReset),
        )
        .await
        .unwrap();

        repo.delete_for_user(user_id, TokenType::EmailVerify)
            .await
            .unwrap();

        assert!(repo.find_by_hash("hash1").await.unwrap().is_none());
        assert!(repo.find_by_hash("hash2").await.unwrap().is_some());
    }
}
