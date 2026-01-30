//! Nonce repository for Solana challenge replay protection

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;

use crate::errors::AppError;

/// Nonce entity for storage
#[derive(Debug, Clone)]
pub struct NonceEntity {
    pub nonce: String,
    pub public_key: String,
    pub message: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub used_at: Option<DateTime<Utc>>,
}

impl NonceEntity {
    /// Create a new nonce entity
    pub fn new(
        nonce: String,
        public_key: String,
        message: String,
        expires_at: DateTime<Utc>,
    ) -> Self {
        Self {
            nonce,
            public_key,
            message,
            created_at: Utc::now(),
            expires_at,
            used_at: None,
        }
    }

    /// Check if nonce is valid (not used and not expired)
    pub fn is_valid(&self) -> bool {
        self.used_at.is_none() && self.expires_at > Utc::now()
    }
}

/// Nonce repository trait for Solana challenge management
#[async_trait]
pub trait NonceRepository: Send + Sync {
    /// Store a new nonce
    async fn create(&self, nonce: NonceEntity) -> Result<NonceEntity, AppError>;

    /// Find a nonce by its value
    async fn find_by_nonce(&self, nonce: &str) -> Result<Option<NonceEntity>, AppError>;

    /// Mark a nonce as used
    async fn mark_used(&self, nonce: &str) -> Result<(), AppError>;

    /// Check if a nonce exists and is valid
    async fn is_valid(&self, nonce: &str) -> Result<bool, AppError>;

    /// Atomically consume a nonce if it's valid (not expired, not used).
    /// Returns the nonce entity if successfully consumed, None if already used/expired.
    /// This prevents TOCTOU race conditions in nonce verification.
    async fn consume_if_valid(&self, nonce: &str) -> Result<Option<NonceEntity>, AppError>;

    /// Delete expired nonces (cleanup)
    async fn delete_expired(&self) -> Result<u64, AppError>;
}

/// In-memory nonce repository for development/testing
pub struct InMemoryNonceRepository {
    nonces: RwLock<HashMap<String, NonceEntity>>,
}

impl InMemoryNonceRepository {
    pub fn new() -> Self {
        Self {
            nonces: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryNonceRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl NonceRepository for InMemoryNonceRepository {
    async fn create(&self, nonce: NonceEntity) -> Result<NonceEntity, AppError> {
        let mut nonces = self.nonces.write().await;
        nonces.insert(nonce.nonce.clone(), nonce.clone());
        Ok(nonce)
    }

    async fn find_by_nonce(&self, nonce: &str) -> Result<Option<NonceEntity>, AppError> {
        let nonces = self.nonces.read().await;
        Ok(nonces.get(nonce).cloned())
    }

    async fn mark_used(&self, nonce: &str) -> Result<(), AppError> {
        let mut nonces = self.nonces.write().await;
        if let Some(entity) = nonces.get_mut(nonce) {
            entity.used_at = Some(Utc::now());
        }
        Ok(())
    }

    async fn is_valid(&self, nonce: &str) -> Result<bool, AppError> {
        let nonces = self.nonces.read().await;
        Ok(nonces.get(nonce).map(|n| n.is_valid()).unwrap_or(false))
    }

    async fn consume_if_valid(&self, nonce: &str) -> Result<Option<NonceEntity>, AppError> {
        let mut nonces = self.nonces.write().await;
        let now = Utc::now();

        if let Some(entity) = nonces.get_mut(nonce) {
            // Check validity: not expired and not used
            if entity.used_at.is_none() && entity.expires_at > now {
                // Atomically mark as used and return
                entity.used_at = Some(now);
                return Ok(Some(entity.clone()));
            }
        }
        Ok(None)
    }

    async fn delete_expired(&self) -> Result<u64, AppError> {
        let mut nonces = self.nonces.write().await;
        let now = Utc::now();
        let before = nonces.len();
        nonces.retain(|_, n| n.expires_at > now);
        Ok((before - nonces.len()) as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;

    #[tokio::test]
    async fn test_create_and_find_nonce() {
        let repo = InMemoryNonceRepository::new();
        let nonce = NonceEntity::new(
            "test_nonce".to_string(),
            "pubkey123".to_string(),
            "Login message".to_string(),
            Utc::now() + Duration::minutes(5),
        );

        repo.create(nonce).await.unwrap();

        let found = repo.find_by_nonce("test_nonce").await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().public_key, "pubkey123");
    }

    #[tokio::test]
    async fn test_mark_used() {
        let repo = InMemoryNonceRepository::new();
        let nonce = NonceEntity::new(
            "test_nonce".to_string(),
            "pubkey123".to_string(),
            "message".to_string(),
            Utc::now() + Duration::minutes(5),
        );

        repo.create(nonce).await.unwrap();
        assert!(repo.is_valid("test_nonce").await.unwrap());

        repo.mark_used("test_nonce").await.unwrap();
        assert!(!repo.is_valid("test_nonce").await.unwrap());
    }

    #[tokio::test]
    async fn test_nonce_validity() {
        let valid_nonce = NonceEntity::new(
            "valid".to_string(),
            "key".to_string(),
            "msg".to_string(),
            Utc::now() + Duration::minutes(5),
        );
        assert!(valid_nonce.is_valid());

        let expired_nonce = NonceEntity::new(
            "expired".to_string(),
            "key".to_string(),
            "msg".to_string(),
            Utc::now() - Duration::minutes(1),
        );
        assert!(!expired_nonce.is_valid());
    }

    #[tokio::test]
    async fn test_consume_if_valid_success() {
        let repo = InMemoryNonceRepository::new();
        let nonce = NonceEntity::new(
            "test_nonce".to_string(),
            "pubkey123".to_string(),
            "message".to_string(),
            Utc::now() + Duration::minutes(5),
        );

        repo.create(nonce).await.unwrap();

        // First consume should succeed
        let result = repo.consume_if_valid("test_nonce").await.unwrap();
        assert!(result.is_some());
        assert_eq!(result.unwrap().public_key, "pubkey123");

        // Second consume should fail (already used)
        let result2 = repo.consume_if_valid("test_nonce").await.unwrap();
        assert!(result2.is_none());
    }

    #[tokio::test]
    async fn test_consume_if_valid_expired() {
        let repo = InMemoryNonceRepository::new();
        let nonce = NonceEntity::new(
            "expired_nonce".to_string(),
            "pubkey123".to_string(),
            "message".to_string(),
            Utc::now() - Duration::minutes(1), // Already expired
        );

        repo.create(nonce).await.unwrap();

        // Consume should fail (expired)
        let result = repo.consume_if_valid("expired_nonce").await.unwrap();
        assert!(result.is_none());
    }
}
