//! Repository for wallet rotation/deletion history
//!
//! Records old wallet pubkeys when wallets are rotated or deleted,
//! providing an audit trail of which pubkeys belonged to which user.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Reason a wallet was removed
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WalletRemovalReason {
    /// Main wallet replaced with new seed via POST /wallet/rotate
    Rotated,
    /// Derived wallet deleted individually via DELETE /wallet/derived/:id
    Deleted,
    /// Derived wallet removed as part of main wallet rotation
    RotatedParent,
}

impl WalletRemovalReason {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Rotated => "rotated",
            Self::Deleted => "deleted",
            Self::RotatedParent => "rotated_parent",
        }
    }
}

/// History entry for a removed wallet
#[derive(Debug, Clone)]
pub struct WalletRotationHistoryEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub old_wallet_id: Uuid,
    pub old_solana_pubkey: String,
    pub derivation_index: i32,
    pub label: Option<String>,
    pub reason: String,
    pub rotated_at: DateTime<Utc>,
}

/// Parameters for creating a history entry
pub struct CreateWalletRotationHistory {
    pub user_id: Uuid,
    pub old_wallet_id: Uuid,
    pub old_solana_pubkey: String,
    pub derivation_index: i32,
    pub label: Option<String>,
    pub reason: WalletRemovalReason,
}

/// Repository trait for wallet rotation history
#[async_trait]
pub trait WalletRotationHistoryRepository: Send + Sync {
    /// Record a wallet removal
    async fn create(
        &self,
        params: CreateWalletRotationHistory,
    ) -> Result<WalletRotationHistoryEntity, AppError>;

    /// Record multiple wallet removals (bulk, e.g. derived wallets during rotation)
    async fn create_batch(
        &self,
        entries: Vec<CreateWalletRotationHistory>,
    ) -> Result<Vec<WalletRotationHistoryEntity>, AppError> {
        let mut results = Vec::with_capacity(entries.len());
        for entry in entries {
            results.push(self.create(entry).await?);
        }
        Ok(results)
    }

    /// Find history for a user (most recent first)
    async fn find_by_user_id(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<WalletRotationHistoryEntity>, AppError>;
}

/// In-memory implementation for testing
pub struct InMemoryWalletRotationHistoryRepository {
    entries: RwLock<HashMap<Uuid, WalletRotationHistoryEntity>>,
}

impl Default for InMemoryWalletRotationHistoryRepository {
    fn default() -> Self {
        Self {
            entries: RwLock::new(HashMap::new()),
        }
    }
}

impl InMemoryWalletRotationHistoryRepository {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl WalletRotationHistoryRepository for InMemoryWalletRotationHistoryRepository {
    async fn create(
        &self,
        params: CreateWalletRotationHistory,
    ) -> Result<WalletRotationHistoryEntity, AppError> {
        let entity = WalletRotationHistoryEntity {
            id: Uuid::new_v4(),
            user_id: params.user_id,
            old_wallet_id: params.old_wallet_id,
            old_solana_pubkey: params.old_solana_pubkey,
            derivation_index: params.derivation_index,
            label: params.label,
            reason: params.reason.as_str().to_string(),
            rotated_at: Utc::now(),
        };
        let mut entries = self.entries.write().await;
        entries.insert(entity.id, entity.clone());
        Ok(entity)
    }

    async fn find_by_user_id(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<WalletRotationHistoryEntity>, AppError> {
        let entries = self.entries.read().await;
        let mut result: Vec<_> = entries
            .values()
            .filter(|e| e.user_id == user_id)
            .cloned()
            .collect();
        result.sort_by(|a, b| b.rotated_at.cmp(&a.rotated_at));
        Ok(result)
    }
}
