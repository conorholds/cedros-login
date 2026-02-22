//! User withdrawal log repository
//!
//! Tracks user-initiated withdrawals (SOL/SPL to external addresses).
//! Distinct from `withdrawal_history` which tracks privacy-cash partial withdrawals.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// A single user withdrawal log entry
#[derive(Debug, Clone)]
pub struct UserWithdrawalLogEntry {
    pub id: Uuid,
    pub user_id: Uuid,
    /// "sol" or "spl"
    pub token_type: String,
    /// NULL for SOL, mint address for SPL
    pub token_mint: Option<String>,
    /// Amount in smallest unit (lamports for SOL, base units for SPL)
    pub amount: i64,
    /// Destination Solana address
    pub destination: String,
    /// On-chain transaction signature
    pub tx_signature: String,
    /// Transaction fee in lamports
    pub fee_lamports: i64,
    pub created_at: DateTime<Utc>,
}

impl UserWithdrawalLogEntry {
    /// Create a new log entry with auto-generated id and timestamp
    pub fn new(
        user_id: Uuid,
        token_type: &str,
        token_mint: Option<&str>,
        amount: i64,
        destination: &str,
        tx_signature: &str,
        fee_lamports: i64,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            token_type: token_type.to_string(),
            token_mint: token_mint.map(|s| s.to_string()),
            amount,
            destination: destination.to_string(),
            tx_signature: tx_signature.to_string(),
            fee_lamports,
            created_at: Utc::now(),
        }
    }
}

/// Repository trait for user withdrawal log
#[async_trait]
pub trait UserWithdrawalLogRepository: Send + Sync {
    /// Record a withdrawal
    async fn create(
        &self,
        entry: UserWithdrawalLogEntry,
    ) -> Result<UserWithdrawalLogEntry, AppError>;

    /// Get withdrawal history for a user with pagination (most recent first)
    async fn find_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<UserWithdrawalLogEntry>, AppError>;

    /// Count withdrawal entries for a user
    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError>;
}

// ============================================================================
// In-memory implementation for development/testing
// ============================================================================

pub struct InMemoryUserWithdrawalLogRepository {
    entries: RwLock<HashMap<Uuid, UserWithdrawalLogEntry>>,
}

impl InMemoryUserWithdrawalLogRepository {
    pub fn new() -> Self {
        Self {
            entries: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryUserWithdrawalLogRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl UserWithdrawalLogRepository for InMemoryUserWithdrawalLogRepository {
    async fn create(
        &self,
        entry: UserWithdrawalLogEntry,
    ) -> Result<UserWithdrawalLogEntry, AppError> {
        let mut entries = self.entries.write().await;
        entries.insert(entry.id, entry.clone());
        Ok(entry)
    }

    async fn find_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<UserWithdrawalLogEntry>, AppError> {
        let entries = self.entries.read().await;
        let mut result: Vec<_> = entries
            .values()
            .filter(|e| e.user_id == user_id)
            .cloned()
            .collect();
        result.sort_by(|a, b| b.created_at.cmp(&a.created_at));
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
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_and_find() {
        let repo = InMemoryUserWithdrawalLogRepository::new();
        let user_id = Uuid::new_v4();

        let entry = UserWithdrawalLogEntry::new(
            user_id,
            "sol",
            None,
            1_000_000_000,
            "dest_addr",
            "tx_sig_1",
            5000,
        );
        repo.create(entry).await.unwrap();

        let history = repo.find_by_user(user_id, 10, 0).await.unwrap();
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].token_type, "sol");
        assert_eq!(history[0].tx_signature, "tx_sig_1");
    }

    #[tokio::test]
    async fn test_pagination() {
        let repo = InMemoryUserWithdrawalLogRepository::new();
        let user_id = Uuid::new_v4();

        for i in 0..5 {
            let entry = UserWithdrawalLogEntry::new(
                user_id,
                "sol",
                None,
                (i + 1) * 1000,
                "dest",
                &format!("sig_{}", i),
                5000,
            );
            repo.create(entry).await.unwrap();
        }

        assert_eq!(repo.count_by_user(user_id).await.unwrap(), 5);

        let page1 = repo.find_by_user(user_id, 2, 0).await.unwrap();
        assert_eq!(page1.len(), 2);

        let page2 = repo.find_by_user(user_id, 2, 2).await.unwrap();
        assert_eq!(page2.len(), 2);

        let page3 = repo.find_by_user(user_id, 2, 4).await.unwrap();
        assert_eq!(page3.len(), 1);
    }
}
