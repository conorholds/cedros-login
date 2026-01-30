//! Withdrawal history repository for audit trail of partial withdrawals

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Withdrawal history entry
#[derive(Debug, Clone)]
pub struct WithdrawalHistoryEntry {
    pub id: Uuid,
    pub deposit_session_id: Uuid,
    pub user_id: Uuid,
    /// Amount withdrawn in this transaction
    pub amount_lamports: i64,
    /// Transaction signature
    pub tx_signature: String,
    /// Cumulative amount withdrawn after this transaction
    pub cumulative_withdrawn_lamports: i64,
    /// Amount remaining after this transaction
    pub remaining_lamports: i64,
    /// Whether this was the final withdrawal
    pub is_final: bool,
    /// Withdrawal percentage (30-70 for partial, 100 for full)
    pub withdrawal_percentage: Option<i16>,
    pub created_at: DateTime<Utc>,
}

impl WithdrawalHistoryEntry {
    /// Create a new withdrawal history entry
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        deposit_session_id: Uuid,
        user_id: Uuid,
        amount_lamports: i64,
        tx_signature: String,
        cumulative_withdrawn_lamports: i64,
        remaining_lamports: i64,
        is_final: bool,
        withdrawal_percentage: Option<i16>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            deposit_session_id,
            user_id,
            amount_lamports,
            tx_signature,
            cumulative_withdrawn_lamports,
            remaining_lamports,
            is_final,
            withdrawal_percentage,
            created_at: Utc::now(),
        }
    }
}

/// Withdrawal history repository trait
#[async_trait]
pub trait WithdrawalHistoryRepository: Send + Sync {
    /// Record a withdrawal
    async fn create(
        &self,
        entry: WithdrawalHistoryEntry,
    ) -> Result<WithdrawalHistoryEntry, AppError>;

    /// Get withdrawal history for a deposit session
    async fn find_by_deposit_session(
        &self,
        deposit_session_id: Uuid,
    ) -> Result<Vec<WithdrawalHistoryEntry>, AppError>;

    /// Get withdrawal history for a user with pagination
    async fn find_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<WithdrawalHistoryEntry>, AppError>;

    /// Count withdrawal entries for a user
    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError>;

    /// Get a specific entry by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<WithdrawalHistoryEntry>, AppError>;

    /// Get recent withdrawals across all users (admin)
    async fn find_recent(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<WithdrawalHistoryEntry>, AppError>;

    /// Count all withdrawal entries (admin)
    async fn count_all(&self) -> Result<u64, AppError>;
}

// ============================================================================
// In-memory implementation for development/testing
// ============================================================================

pub struct InMemoryWithdrawalHistoryRepository {
    entries: RwLock<HashMap<Uuid, WithdrawalHistoryEntry>>,
}

impl InMemoryWithdrawalHistoryRepository {
    pub fn new() -> Self {
        Self {
            entries: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryWithdrawalHistoryRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl WithdrawalHistoryRepository for InMemoryWithdrawalHistoryRepository {
    async fn create(
        &self,
        entry: WithdrawalHistoryEntry,
    ) -> Result<WithdrawalHistoryEntry, AppError> {
        let mut entries = self.entries.write().await;
        entries.insert(entry.id, entry.clone());
        Ok(entry)
    }

    async fn find_by_deposit_session(
        &self,
        deposit_session_id: Uuid,
    ) -> Result<Vec<WithdrawalHistoryEntry>, AppError> {
        let entries = self.entries.read().await;
        let mut result: Vec<_> = entries
            .values()
            .filter(|e| e.deposit_session_id == deposit_session_id)
            .cloned()
            .collect();
        result.sort_by(|a, b| a.created_at.cmp(&b.created_at));
        Ok(result)
    }

    async fn find_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<WithdrawalHistoryEntry>, AppError> {
        let entries = self.entries.read().await;
        let mut result: Vec<_> = entries
            .values()
            .filter(|e| e.user_id == user_id)
            .cloned()
            .collect();
        result.sort_by(|a, b| b.created_at.cmp(&a.created_at)); // Most recent first
        Ok(result
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let entries = self.entries.read().await;
        Ok(entries.values().filter(|e| e.user_id == user_id).count() as u64)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<WithdrawalHistoryEntry>, AppError> {
        let entries = self.entries.read().await;
        Ok(entries.get(&id).cloned())
    }

    async fn find_recent(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<WithdrawalHistoryEntry>, AppError> {
        let entries = self.entries.read().await;
        let mut result: Vec<_> = entries.values().cloned().collect();
        result.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(result
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_all(&self) -> Result<u64, AppError> {
        let entries = self.entries.read().await;
        Ok(entries.len() as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_and_find() {
        let repo = InMemoryWithdrawalHistoryRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();

        let entry = WithdrawalHistoryEntry::new(
            session_id,
            user_id,
            500_000_000, // 0.5 SOL
            "tx_sig_1".to_string(),
            500_000_000,
            500_000_000,
            false,
            Some(50),
        );

        let created = repo.create(entry.clone()).await.unwrap();
        assert_eq!(created.amount_lamports, 500_000_000);

        let found = repo.find_by_deposit_session(session_id).await.unwrap();
        assert_eq!(found.len(), 1);
        assert_eq!(found[0].tx_signature, "tx_sig_1");
    }

    #[tokio::test]
    async fn test_multiple_withdrawals() {
        let repo = InMemoryWithdrawalHistoryRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();

        // First partial withdrawal
        let entry1 = WithdrawalHistoryEntry::new(
            session_id,
            user_id,
            300_000_000,
            "tx_sig_1".to_string(),
            300_000_000,
            700_000_000,
            false,
            Some(30),
        );
        repo.create(entry1).await.unwrap();

        // Second partial withdrawal
        let entry2 = WithdrawalHistoryEntry::new(
            session_id,
            user_id,
            400_000_000,
            "tx_sig_2".to_string(),
            700_000_000,
            300_000_000,
            false,
            Some(57),
        );
        repo.create(entry2).await.unwrap();

        // Final withdrawal
        let entry3 = WithdrawalHistoryEntry::new(
            session_id,
            user_id,
            300_000_000,
            "tx_sig_3".to_string(),
            1_000_000_000,
            0,
            true,
            Some(100),
        );
        repo.create(entry3).await.unwrap();

        let history = repo.find_by_deposit_session(session_id).await.unwrap();
        assert_eq!(history.len(), 3);
        assert!(!history[0].is_final);
        assert!(!history[1].is_final);
        assert!(history[2].is_final);
    }
}
