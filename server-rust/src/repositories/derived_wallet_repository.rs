//! Derived wallet repository for multi-wallet support
//!
//! Stores wallets derived from the master seed at index > 0.
//! Index 0 (default wallet) lives in `solana_wallet_material`.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Derived wallet entity
#[derive(Debug, Clone)]
pub struct DerivedWalletEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub derivation_index: i32,
    pub solana_pubkey: String,
    pub label: String,
    pub created_at: DateTime<Utc>,
}

/// Parameters for creating a derived wallet
pub struct CreateDerivedWallet {
    pub user_id: Uuid,
    pub derivation_index: i32,
    pub solana_pubkey: String,
    pub label: String,
}

/// Repository trait for derived wallets
#[async_trait]
pub trait DerivedWalletRepository: Send + Sync {
    /// Create a new derived wallet
    async fn create(&self, params: CreateDerivedWallet) -> Result<DerivedWalletEntity, AppError>;

    /// Find all derived wallets for a user
    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<DerivedWalletEntity>, AppError>;

    /// Find a derived wallet by ID and user
    async fn find_by_id(
        &self,
        id: Uuid,
        user_id: Uuid,
    ) -> Result<Option<DerivedWalletEntity>, AppError>;

    /// Find the next available derivation index for a user
    async fn next_index(&self, user_id: Uuid) -> Result<i32, AppError>;

    /// Delete a derived wallet by ID and user
    async fn delete_by_id(&self, id: Uuid, user_id: Uuid) -> Result<bool, AppError>;

    /// Delete all derived wallets for a user
    async fn delete_by_user_id(&self, user_id: Uuid) -> Result<u64, AppError>;
}

/// In-memory implementation for testing
pub struct InMemoryDerivedWalletRepository {
    wallets: RwLock<HashMap<Uuid, DerivedWalletEntity>>,
}

impl Default for InMemoryDerivedWalletRepository {
    fn default() -> Self {
        Self {
            wallets: RwLock::new(HashMap::new()),
        }
    }
}

impl InMemoryDerivedWalletRepository {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl DerivedWalletRepository for InMemoryDerivedWalletRepository {
    async fn create(&self, params: CreateDerivedWallet) -> Result<DerivedWalletEntity, AppError> {
        let mut wallets = self.wallets.write().await;

        // Check unique constraints
        let dup_index = wallets.values().any(|w| {
            w.user_id == params.user_id && w.derivation_index == params.derivation_index
        });
        if dup_index {
            return Err(AppError::Validation(
                "Derivation index already in use".into(),
            ));
        }
        let dup_pubkey = wallets
            .values()
            .any(|w| w.solana_pubkey == params.solana_pubkey);
        if dup_pubkey {
            return Err(AppError::Validation("Public key already in use".into()));
        }

        let entity = DerivedWalletEntity {
            id: Uuid::new_v4(),
            user_id: params.user_id,
            derivation_index: params.derivation_index,
            solana_pubkey: params.solana_pubkey,
            label: params.label,
            created_at: Utc::now(),
        };
        wallets.insert(entity.id, entity.clone());
        Ok(entity)
    }

    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<DerivedWalletEntity>, AppError> {
        let wallets = self.wallets.read().await;
        let mut result: Vec<_> = wallets
            .values()
            .filter(|w| w.user_id == user_id)
            .cloned()
            .collect();
        result.sort_by_key(|w| w.derivation_index);
        Ok(result)
    }

    async fn find_by_id(
        &self,
        id: Uuid,
        user_id: Uuid,
    ) -> Result<Option<DerivedWalletEntity>, AppError> {
        let wallets = self.wallets.read().await;
        Ok(wallets
            .get(&id)
            .filter(|w| w.user_id == user_id)
            .cloned())
    }

    async fn next_index(&self, user_id: Uuid) -> Result<i32, AppError> {
        let wallets = self.wallets.read().await;
        let max = wallets
            .values()
            .filter(|w| w.user_id == user_id)
            .map(|w| w.derivation_index)
            .max()
            .unwrap_or(0);
        Ok(max + 1)
    }

    async fn delete_by_id(&self, id: Uuid, user_id: Uuid) -> Result<bool, AppError> {
        let mut wallets = self.wallets.write().await;
        if wallets
            .get(&id)
            .map(|w| w.user_id == user_id)
            .unwrap_or(false)
        {
            wallets.remove(&id);
            Ok(true)
        } else {
            Ok(false)
        }
    }

    async fn delete_by_user_id(&self, user_id: Uuid) -> Result<u64, AppError> {
        let mut wallets = self.wallets.write().await;
        let ids: Vec<_> = wallets
            .values()
            .filter(|w| w.user_id == user_id)
            .map(|w| w.id)
            .collect();
        let count = ids.len() as u64;
        for id in ids {
            wallets.remove(&id);
        }
        Ok(count)
    }
}
