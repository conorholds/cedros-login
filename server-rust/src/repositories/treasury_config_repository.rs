//! Treasury configuration repository for micro deposit batching
//!
//! Stores treasury wallet configuration per org (or global default).
//! The treasury wallet receives SOL micro deposits and batches them
//! into Jupiter swaps when the threshold is reached.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Treasury configuration entity
#[derive(Debug, Clone)]
pub struct TreasuryConfigEntity {
    pub id: Uuid,
    /// Org ID (None = global default treasury)
    pub org_id: Option<Uuid>,
    /// The admin user whose embedded wallet is used as treasury
    pub treasury_user_id: Uuid,
    /// Wallet address (derived from user's wallet_materials.solana_pubkey)
    pub wallet_address: String,
    /// Encrypted private key (base64(nonce || ciphertext) using AES-256-GCM)
    pub encrypted_private_key: String,
    /// Encryption key version
    pub encryption_key_id: String,
    /// When this treasury was authorized
    pub authorized_at: DateTime<Utc>,
    /// User who authorized this treasury
    pub authorized_by: Uuid,
}

impl TreasuryConfigEntity {
    /// Create a new treasury configuration
    pub fn new(
        org_id: Option<Uuid>,
        treasury_user_id: Uuid,
        wallet_address: String,
        encrypted_private_key: String,
        encryption_key_id: String,
        authorized_by: Uuid,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            org_id,
            treasury_user_id,
            wallet_address,
            encrypted_private_key,
            encryption_key_id,
            authorized_at: Utc::now(),
            authorized_by,
        }
    }
}

/// Treasury configuration repository trait
#[async_trait]
pub trait TreasuryConfigRepository: Send + Sync {
    /// Create a new treasury configuration
    async fn create(&self, config: TreasuryConfigEntity) -> Result<TreasuryConfigEntity, AppError>;

    /// Find treasury config by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<TreasuryConfigEntity>, AppError>;

    /// Find treasury config for a specific org
    async fn find_by_org(&self, org_id: Uuid) -> Result<Option<TreasuryConfigEntity>, AppError>;

    /// Find the global default treasury (org_id IS NULL)
    async fn find_global(&self) -> Result<Option<TreasuryConfigEntity>, AppError>;

    /// Find treasury config for an org, falling back to global default
    async fn find_for_org(
        &self,
        org_id: Option<Uuid>,
    ) -> Result<Option<TreasuryConfigEntity>, AppError>;

    /// Delete treasury config by ID
    async fn delete(&self, id: Uuid) -> Result<bool, AppError>;

    /// Delete treasury config for an org (or global if org_id is None)
    async fn delete_by_org(&self, org_id: Option<Uuid>) -> Result<bool, AppError>;
}

/// In-memory treasury config repository for development/testing
pub struct InMemoryTreasuryConfigRepository {
    configs: RwLock<HashMap<Uuid, TreasuryConfigEntity>>,
}

impl InMemoryTreasuryConfigRepository {
    pub fn new() -> Self {
        Self {
            configs: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryTreasuryConfigRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl TreasuryConfigRepository for InMemoryTreasuryConfigRepository {
    async fn create(&self, config: TreasuryConfigEntity) -> Result<TreasuryConfigEntity, AppError> {
        let mut configs = self.configs.write().await;

        // Check for duplicate org_id (including NULL for global)
        let has_duplicate = configs.values().any(|c| c.org_id == config.org_id);
        if has_duplicate {
            return Err(AppError::Validation(
                "Treasury already configured for this org".into(),
            ));
        }

        configs.insert(config.id, config.clone());
        Ok(config)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<TreasuryConfigEntity>, AppError> {
        let configs = self.configs.read().await;
        Ok(configs.get(&id).cloned())
    }

    async fn find_by_org(&self, org_id: Uuid) -> Result<Option<TreasuryConfigEntity>, AppError> {
        let configs = self.configs.read().await;
        Ok(configs.values().find(|c| c.org_id == Some(org_id)).cloned())
    }

    async fn find_global(&self) -> Result<Option<TreasuryConfigEntity>, AppError> {
        let configs = self.configs.read().await;
        Ok(configs.values().find(|c| c.org_id.is_none()).cloned())
    }

    async fn find_for_org(
        &self,
        org_id: Option<Uuid>,
    ) -> Result<Option<TreasuryConfigEntity>, AppError> {
        // First try org-specific
        if let Some(oid) = org_id {
            if let Some(config) = self.find_by_org(oid).await? {
                return Ok(Some(config));
            }
        }
        // Fall back to global
        self.find_global().await
    }

    async fn delete(&self, id: Uuid) -> Result<bool, AppError> {
        let mut configs = self.configs.write().await;
        Ok(configs.remove(&id).is_some())
    }

    async fn delete_by_org(&self, org_id: Option<Uuid>) -> Result<bool, AppError> {
        let mut configs = self.configs.write().await;
        let to_remove: Vec<Uuid> = configs
            .iter()
            .filter(|(_, c)| c.org_id == org_id)
            .map(|(id, _)| *id)
            .collect();

        let removed = !to_remove.is_empty();
        for id in to_remove {
            configs.remove(&id);
        }
        Ok(removed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_and_find() {
        let repo = InMemoryTreasuryConfigRepository::new();

        let config = TreasuryConfigEntity::new(
            None, // Global treasury
            Uuid::new_v4(),
            "Treasury1Address".to_string(),
            "encrypted_key".to_string(),
            "v1".to_string(),
            Uuid::new_v4(),
        );
        let config_id = config.id;

        let created = repo.create(config).await.unwrap();
        assert_eq!(created.id, config_id);

        let found = repo.find_by_id(config_id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().wallet_address, "Treasury1Address");
    }

    #[tokio::test]
    async fn test_find_global() {
        let repo = InMemoryTreasuryConfigRepository::new();

        let config = TreasuryConfigEntity::new(
            None,
            Uuid::new_v4(),
            "GlobalTreasury".to_string(),
            "encrypted_key".to_string(),
            "v1".to_string(),
            Uuid::new_v4(),
        );

        repo.create(config).await.unwrap();

        let global = repo.find_global().await.unwrap();
        assert!(global.is_some());
        assert_eq!(global.unwrap().wallet_address, "GlobalTreasury");
    }

    #[tokio::test]
    async fn test_find_for_org_with_fallback() {
        let repo = InMemoryTreasuryConfigRepository::new();

        // Create global treasury
        let global = TreasuryConfigEntity::new(
            None,
            Uuid::new_v4(),
            "GlobalTreasury".to_string(),
            "encrypted_key".to_string(),
            "v1".to_string(),
            Uuid::new_v4(),
        );
        repo.create(global).await.unwrap();

        // Create org-specific treasury
        let org_id = Uuid::new_v4();
        let org_config = TreasuryConfigEntity::new(
            Some(org_id),
            Uuid::new_v4(),
            "OrgTreasury".to_string(),
            "encrypted_key".to_string(),
            "v1".to_string(),
            Uuid::new_v4(),
        );
        repo.create(org_config).await.unwrap();

        // Org with config should get org treasury
        let found = repo.find_for_org(Some(org_id)).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().wallet_address, "OrgTreasury");

        // Org without config should fall back to global
        let other_org = Uuid::new_v4();
        let found = repo.find_for_org(Some(other_org)).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().wallet_address, "GlobalTreasury");

        // None should get global
        let found = repo.find_for_org(None).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().wallet_address, "GlobalTreasury");
    }

    #[tokio::test]
    async fn test_duplicate_org_rejected() {
        let repo = InMemoryTreasuryConfigRepository::new();

        let config1 = TreasuryConfigEntity::new(
            None,
            Uuid::new_v4(),
            "Treasury1".to_string(),
            "key1".to_string(),
            "v1".to_string(),
            Uuid::new_v4(),
        );
        repo.create(config1).await.unwrap();

        let config2 = TreasuryConfigEntity::new(
            None,
            Uuid::new_v4(),
            "Treasury2".to_string(),
            "key2".to_string(),
            "v1".to_string(),
            Uuid::new_v4(),
        );
        let result = repo.create(config2).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_delete_by_org() {
        let repo = InMemoryTreasuryConfigRepository::new();

        let org_id = Uuid::new_v4();
        let config = TreasuryConfigEntity::new(
            Some(org_id),
            Uuid::new_v4(),
            "OrgTreasury".to_string(),
            "key".to_string(),
            "v1".to_string(),
            Uuid::new_v4(),
        );
        repo.create(config).await.unwrap();

        let deleted = repo.delete_by_org(Some(org_id)).await.unwrap();
        assert!(deleted);

        let found = repo.find_by_org(org_id).await.unwrap();
        assert!(found.is_none());
    }
}
