//! Pending wallet recovery repository
//!
//! Temporary storage for wallet recovery data (Share C or full seed) until user acknowledges.

use async_trait::async_trait;
use chrono::{DateTime, Duration, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Type of recovery data stored
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RecoveryType {
    /// Share C only - hex share converted to BIP-39
    ShareC,
    /// Full seed - 12-word BIP-39 mnemonic
    FullSeed,
}

impl std::fmt::Display for RecoveryType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RecoveryType::ShareC => write!(f, "share_c"),
            RecoveryType::FullSeed => write!(f, "full_seed"),
        }
    }
}

impl TryFrom<&str> for RecoveryType {
    type Error = AppError;

    fn try_from(s: &str) -> Result<Self, Self::Error> {
        match s {
            "share_c" => Ok(RecoveryType::ShareC),
            "full_seed" => Ok(RecoveryType::FullSeed),
            _ => Err(AppError::Validation(format!(
                "Invalid recovery type: {}",
                s
            ))),
        }
    }
}

/// Pending wallet recovery entity
#[derive(Debug, Clone)]
pub struct PendingWalletRecoveryEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub recovery_type: RecoveryType,
    /// Base64-encoded recovery data (mnemonic phrase)
    pub recovery_data: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

impl PendingWalletRecoveryEntity {
    /// Create a new pending recovery entity
    /// Defaults to 24-hour expiration
    pub fn new(user_id: Uuid, recovery_type: RecoveryType, recovery_data: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            user_id,
            recovery_type,
            recovery_data,
            created_at: now,
            expires_at: now + Duration::hours(24),
        }
    }

    /// Check if recovery data has expired
    pub fn is_expired(&self) -> bool {
        self.expires_at < Utc::now()
    }
}

/// Repository trait for pending wallet recovery data
#[async_trait]
pub trait PendingWalletRecoveryRepository: Send + Sync {
    /// Store pending recovery data for a user
    /// Replaces any existing pending recovery for the user
    async fn create(
        &self,
        entity: PendingWalletRecoveryEntity,
    ) -> Result<PendingWalletRecoveryEntity, AppError>;

    /// Find pending recovery by user ID
    async fn find_by_user_id(
        &self,
        user_id: Uuid,
    ) -> Result<Option<PendingWalletRecoveryEntity>, AppError>;

    /// Delete pending recovery after user acknowledges
    async fn delete_by_user_id(&self, user_id: Uuid) -> Result<bool, AppError>;

    /// Delete all expired recovery data (cleanup job)
    async fn delete_expired(&self) -> Result<u64, AppError>;
}

/// In-memory implementation for testing
pub struct InMemoryPendingWalletRecoveryRepository {
    data: RwLock<HashMap<Uuid, PendingWalletRecoveryEntity>>,
}

impl InMemoryPendingWalletRecoveryRepository {
    pub fn new() -> Self {
        Self {
            data: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryPendingWalletRecoveryRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl PendingWalletRecoveryRepository for InMemoryPendingWalletRecoveryRepository {
    async fn create(
        &self,
        entity: PendingWalletRecoveryEntity,
    ) -> Result<PendingWalletRecoveryEntity, AppError> {
        let mut data = self.data.write().await;
        // Replace any existing entry for this user
        data.insert(entity.user_id, entity.clone());
        Ok(entity)
    }

    async fn find_by_user_id(
        &self,
        user_id: Uuid,
    ) -> Result<Option<PendingWalletRecoveryEntity>, AppError> {
        let data = self.data.read().await;
        let entity = data.get(&user_id).cloned();
        // Don't return expired entries
        Ok(entity.filter(|e| !e.is_expired()))
    }

    async fn delete_by_user_id(&self, user_id: Uuid) -> Result<bool, AppError> {
        let mut data = self.data.write().await;
        Ok(data.remove(&user_id).is_some())
    }

    async fn delete_expired(&self) -> Result<u64, AppError> {
        let mut data = self.data.write().await;
        let now = Utc::now();
        let before = data.len();
        data.retain(|_, e| e.expires_at > now);
        Ok((before - data.len()) as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_and_find() {
        let repo = InMemoryPendingWalletRecoveryRepository::new();
        let user_id = Uuid::new_v4();
        let entity = PendingWalletRecoveryEntity::new(
            user_id,
            RecoveryType::ShareC,
            "dGVzdCByZWNvdmVyeSBkYXRh".to_string(),
        );

        repo.create(entity).await.unwrap();

        let found = repo.find_by_user_id(user_id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().recovery_type, RecoveryType::ShareC);
    }

    #[tokio::test]
    async fn test_delete_by_user_id() {
        let repo = InMemoryPendingWalletRecoveryRepository::new();
        let user_id = Uuid::new_v4();
        let entity = PendingWalletRecoveryEntity::new(
            user_id,
            RecoveryType::FullSeed,
            "dGVzdCBkYXRh".to_string(),
        );

        repo.create(entity).await.unwrap();
        assert!(repo.find_by_user_id(user_id).await.unwrap().is_some());

        let deleted = repo.delete_by_user_id(user_id).await.unwrap();
        assert!(deleted);
        assert!(repo.find_by_user_id(user_id).await.unwrap().is_none());
    }

    #[tokio::test]
    async fn test_recovery_type_display() {
        assert_eq!(RecoveryType::ShareC.to_string(), "share_c");
        assert_eq!(RecoveryType::FullSeed.to_string(), "full_seed");
    }

    #[tokio::test]
    async fn test_recovery_type_try_from() {
        assert_eq!(
            RecoveryType::try_from("share_c").unwrap(),
            RecoveryType::ShareC
        );
        assert_eq!(
            RecoveryType::try_from("full_seed").unwrap(),
            RecoveryType::FullSeed
        );
        assert!(RecoveryType::try_from("invalid").is_err());
    }
}
