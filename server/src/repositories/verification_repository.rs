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
    AccountEmailVerify,
    PasswordReset,
    InstantLink,
    /// Pending MFA verification during login (short-lived, 5 minutes)
    MfaPending,
    /// Email confirmation for external account deletion requests.
    AccountDeletion,
    /// Pending invite-code gate completion for a pre-created account.
    InviteCodePending,
}

impl TokenType {
    pub fn as_str(&self) -> &'static str {
        match self {
            TokenType::EmailVerify => "email_verify",
            TokenType::AccountEmailVerify => "account_email_verify",
            TokenType::PasswordReset => "password_reset",
            TokenType::InstantLink => "instant_link",
            TokenType::MfaPending => "mfa_pending",
            TokenType::AccountDeletion => "account_deletion",
            TokenType::InviteCodePending => "invite_code_pending",
        }
    }

    /// Parse token type from string (returns None for invalid values)
    #[allow(clippy::should_implement_trait)]
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "email_verify" => Some(TokenType::EmailVerify),
            "account_email_verify" => Some(TokenType::AccountEmailVerify),
            "password_reset" => Some(TokenType::PasswordReset),
            "instant_link" => Some(TokenType::InstantLink),
            "mfa_pending" => Some(TokenType::MfaPending),
            "account_deletion" => Some(TokenType::AccountDeletion),
            "invite_code_pending" => Some(TokenType::InviteCodePending),
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
    pub subject_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub used_at: Option<DateTime<Utc>>,
}

impl VerificationToken {
    /// Prepare a token for an atomic token-and-outbox write; this does not persist it.
    pub fn new(
        user_id: Uuid,
        subject_id: Option<Uuid>,
        token_hash: String,
        token_type: TokenType,
        expires_at: DateTime<Utc>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            subject_id,
            token_hash,
            token_type,
            created_at: Utc::now(),
            expires_at,
            used_at: None,
        }
    }

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

    async fn create_for_subject(
        &self,
        user_id: Uuid,
        subject_id: Uuid,
        token_hash: &str,
        token_type: TokenType,
        expires_at: DateTime<Utc>,
    ) -> Result<VerificationToken, RepositoryError>;

    /// Find a token by its hash, regardless of purpose or validity.
    ///
    /// Prefer [`Self::find_valid`] in authentication flows. This unrestricted
    /// lookup exists for diagnostics and repository maintenance.
    async fn find_by_hash(
        &self,
        token_hash: &str,
    ) -> Result<Option<VerificationToken>, RepositoryError>;

    /// Find a live, unused token whose purpose is explicitly allowed.
    ///
    /// This does not consume the token. Callers may validate an additional
    /// proof (for example an MFA factor), then call [`Self::consume_if_valid`].
    /// `Ok(None)` covers unknown, wrong-purpose, expired, and used tokens so
    /// boundary handlers can preserve enumeration-resistant error behavior.
    async fn find_valid(
        &self,
        token_hash: &str,
        expected_types: &[TokenType],
    ) -> Result<Option<VerificationToken>, RepositoryError>;

    /// Mark a token as used by id without validating purpose or liveness.
    /// Authentication flows must not use this; use [`Self::consume_if_valid`].
    async fn mark_used(&self, id: Uuid) -> Result<(), RepositoryError>;

    /// Atomically consume a live, unused token of an explicitly allowed purpose.
    ///
    /// Inputs are the stored token hash and a non-empty purpose allowlist.
    /// Returns the consumed row on success. `Ok(None)` means the token was
    /// unknown, wrong-purpose, expired, already used, or lost a concurrent
    /// consume race. Implementations must check purpose, expiry, and use state
    /// in the same atomic mutation that records consumption.
    async fn consume_if_valid(
        &self,
        token_hash: &str,
        expected_types: &[TokenType],
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
    pub(crate) tokens: Arc<RwLock<HashMap<Uuid, VerificationToken>>>,
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
            subject_id: None,
            created_at: Utc::now(),
            expires_at,
            used_at: None,
        };

        let mut tokens = self.tokens.write().await;
        // Delete old unused tokens of same type for same user
        tokens.retain(|_, t| {
            !(t.user_id == user_id && t.token_type == token_type && t.used_at.is_none())
        });
        tokens.insert(token.id, token.clone());
        Ok(token)
    }

    async fn create_for_subject(
        &self,
        user_id: Uuid,
        subject_id: Uuid,
        token_hash: &str,
        token_type: TokenType,
        expires_at: DateTime<Utc>,
    ) -> Result<VerificationToken, RepositoryError> {
        let token = VerificationToken {
            id: Uuid::new_v4(),
            user_id,
            token_hash: token_hash.to_string(),
            token_type,
            subject_id: Some(subject_id),
            created_at: Utc::now(),
            expires_at,
            used_at: None,
        };

        let mut tokens = self.tokens.write().await;
        tokens.retain(|_, t| {
            !(t.user_id == user_id
                && t.token_type == token_type
                && t.subject_id == Some(subject_id)
                && t.used_at.is_none())
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

    async fn find_valid(
        &self,
        token_hash: &str,
        expected_types: &[TokenType],
    ) -> Result<Option<VerificationToken>, RepositoryError> {
        if expected_types.is_empty() {
            return Ok(None);
        }
        let tokens = self.tokens.read().await;
        let now = Utc::now();
        Ok(tokens
            .values()
            .find(|token| {
                token.token_hash == token_hash
                    && expected_types.contains(&token.token_type)
                    && token.used_at.is_none()
                    && token.expires_at > now
            })
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
        expected_types: &[TokenType],
    ) -> Result<Option<VerificationToken>, RepositoryError> {
        if expected_types.is_empty() {
            return Ok(None);
        }
        let mut tokens = self.tokens.write().await;
        let now = Utc::now();

        let token_id = tokens
            .values()
            .find(|token| {
                token.token_hash == token_hash
                    && expected_types.contains(&token.token_type)
                    && token.used_at.is_none()
                    && token.expires_at > now
            })
            .map(|t| t.id);

        if let Some(id) = token_id {
            if let Some(token) = tokens.get_mut(&id) {
                token.used_at = Some(now);
                return Ok(Some(token.clone()));
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
        // Consumption checks expiry atomically; expired replay markers confer no authority.
        tokens.retain(|_, t| t.expires_at > now);
        Ok((before - tokens.len()) as u64)
    }
}

/// Helper to generate verification tokens
pub fn generate_verification_token() -> String {
    use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
    use rand::{rngs::OsRng, RngCore};

    let mut bytes = [0u8; 32];
    // Use OsRng for cryptographic random generation
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
        TokenType::AccountEmailVerify => Utc::now() + Duration::hours(24),
        TokenType::PasswordReset => Utc::now() + Duration::hours(1),
        TokenType::InstantLink => Utc::now() + Duration::minutes(15),
        TokenType::MfaPending => Utc::now() + Duration::minutes(5),
        TokenType::AccountDeletion => Utc::now() + Duration::hours(24),
        TokenType::InviteCodePending => Utc::now() + Duration::days(30),
    }
}

#[cfg(test)]
#[path = "verification_repository_tests.rs"]
mod tests;
