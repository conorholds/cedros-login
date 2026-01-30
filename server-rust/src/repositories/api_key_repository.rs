//! API key repository for user API key management

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use rand::{distributions::Alphanumeric, rngs::OsRng, Rng};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use subtle::ConstantTimeEq;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// API key prefix for identification
pub const API_KEY_PREFIX: &str = "ck_";

/// API key entity for storage
#[derive(Debug, Clone)]
pub struct ApiKeyEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub key_hash: String,
    pub key_prefix: String,
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
}

impl ApiKeyEntity {
    /// Create a new API key entity from a raw key
    pub fn new(user_id: Uuid, raw_key: &str) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            user_id,
            key_hash: hash_api_key(raw_key),
            key_prefix: raw_key.chars().take(16).collect(),
            created_at: now,
            last_used_at: None,
        }
    }
}

/// Generate a new API key (prefix + 43 alphanumeric chars)
pub fn generate_api_key() -> String {
    // SEC-08: Use OsRng for cryptographic random generation
    let suffix: String = OsRng
        .sample_iter(&Alphanumeric)
        .take(43)
        .map(char::from)
        .collect();
    format!("{}{}", API_KEY_PREFIX, suffix)
}

/// Hash an API key for storage (SHA256 hex)
pub fn hash_api_key(key: &str) -> String {
    let hash = Sha256::digest(key.as_bytes());
    hex::encode(hash)
}

/// API key repository trait
#[async_trait]
pub trait ApiKeyRepository: Send + Sync {
    /// Create a new API key
    async fn create(&self, entity: ApiKeyEntity) -> Result<ApiKeyEntity, AppError>;

    /// Find API key by user ID
    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Option<ApiKeyEntity>, AppError>;

    /// Find API key by raw key (validates using constant-time hash comparison)
    ///
    /// R-02: This method prevents timing attacks by:
    /// 1. Querying by key prefix (first 16 chars) for efficient lookup
    /// 2. Using constant-time comparison for the full hash verification
    async fn find_by_key(&self, raw_key: &str) -> Result<Option<ApiKeyEntity>, AppError>;

    /// Delete API key for user (for regeneration)
    async fn delete_for_user(&self, user_id: Uuid) -> Result<(), AppError>;

    /// Update last_used_at timestamp
    async fn update_last_used(&self, id: Uuid) -> Result<(), AppError>;
}

/// In-memory API key repository for development/testing
pub struct InMemoryApiKeyRepository {
    keys: RwLock<HashMap<Uuid, ApiKeyEntity>>,
}

impl InMemoryApiKeyRepository {
    pub fn new() -> Self {
        Self {
            keys: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryApiKeyRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl ApiKeyRepository for InMemoryApiKeyRepository {
    async fn create(&self, entity: ApiKeyEntity) -> Result<ApiKeyEntity, AppError> {
        let mut keys = self.keys.write().await;
        keys.insert(entity.id, entity.clone());
        Ok(entity)
    }

    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Option<ApiKeyEntity>, AppError> {
        let keys = self.keys.read().await;
        Ok(keys.values().find(|k| k.user_id == user_id).cloned())
    }

    async fn find_by_key(&self, raw_key: &str) -> Result<Option<ApiKeyEntity>, AppError> {
        let keys = self.keys.read().await;
        let key_hash = hash_api_key(raw_key);
        // R-02: Use constant-time comparison to prevent timing attacks.
        // An attacker could otherwise measure response times to incrementally
        // discover valid API key hashes.
        Ok(keys
            .values()
            .find(|k| k.key_hash.as_bytes().ct_eq(key_hash.as_bytes()).into())
            .cloned())
    }

    async fn delete_for_user(&self, user_id: Uuid) -> Result<(), AppError> {
        let mut keys = self.keys.write().await;
        keys.retain(|_, k| k.user_id != user_id);
        Ok(())
    }

    async fn update_last_used(&self, id: Uuid) -> Result<(), AppError> {
        let mut keys = self.keys.write().await;
        if let Some(entity) = keys.get_mut(&id) {
            entity.last_used_at = Some(Utc::now());
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_api_key() {
        let key = generate_api_key();
        assert!(key.starts_with(API_KEY_PREFIX));
        assert_eq!(key.len(), API_KEY_PREFIX.len() + 43);
    }

    #[test]
    fn test_hash_api_key() {
        let key = "ck_abc123";
        let hash1 = hash_api_key(key);
        let hash2 = hash_api_key(key);
        assert_eq!(hash1, hash2);
        assert_eq!(hash1.len(), 64); // SHA256 hex
    }

    #[tokio::test]
    async fn test_create_and_find_by_user() {
        let repo = InMemoryApiKeyRepository::new();
        let user_id = Uuid::new_v4();
        let raw_key = generate_api_key();
        let entity = ApiKeyEntity::new(user_id, &raw_key);

        repo.create(entity).await.unwrap();

        let found = repo.find_by_user_id(user_id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().user_id, user_id);
    }

    #[tokio::test]
    async fn test_find_by_key() {
        let repo = InMemoryApiKeyRepository::new();
        let user_id = Uuid::new_v4();
        let raw_key = generate_api_key();
        let entity = ApiKeyEntity::new(user_id, &raw_key);

        repo.create(entity).await.unwrap();

        // R-02: find_by_key takes raw key and uses constant-time comparison
        let found = repo.find_by_key(&raw_key).await.unwrap();
        assert!(found.is_some());

        // Invalid key should not be found
        let invalid = repo.find_by_key("ck_invalid_key_123").await.unwrap();
        assert!(invalid.is_none());
    }

    #[tokio::test]
    async fn test_delete_for_user() {
        let repo = InMemoryApiKeyRepository::new();
        let user_id = Uuid::new_v4();
        let raw_key = generate_api_key();
        let entity = ApiKeyEntity::new(user_id, &raw_key);

        repo.create(entity).await.unwrap();
        assert!(repo.find_by_user_id(user_id).await.unwrap().is_some());

        repo.delete_for_user(user_id).await.unwrap();
        assert!(repo.find_by_user_id(user_id).await.unwrap().is_none());
    }

    #[tokio::test]
    async fn test_update_last_used() {
        let repo = InMemoryApiKeyRepository::new();
        let user_id = Uuid::new_v4();
        let raw_key = generate_api_key();
        let entity = ApiKeyEntity::new(user_id, &raw_key);
        let id = entity.id;

        repo.create(entity).await.unwrap();

        let before = repo.find_by_user_id(user_id).await.unwrap().unwrap();
        assert!(before.last_used_at.is_none());

        repo.update_last_used(id).await.unwrap();

        let after = repo.find_by_user_id(user_id).await.unwrap().unwrap();
        assert!(after.last_used_at.is_some());
    }
}
