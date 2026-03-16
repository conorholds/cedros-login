//! Referral code history repository trait and in-memory implementation.
//!
//! When a user changes or regenerates their referral code, the old code is archived
//! here. Lookups via `find_by_referral_code` fall back to this table so that links
//! printed on physical media or shared before the code change still work.

use async_trait::async_trait;
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Repository for preserving retired referral codes.
///
/// # Inputs/Outputs
/// - `add(code, user_id)` — archives `code` as a historical code owned by `user_id`.
///   Silently succeeds on duplicate (idempotent).
/// - `find_user_by_code(code)` — returns the `user_id` that once held `code`, if any.
///
/// # Errors
/// Both methods return `AppError::Internal` only on storage-layer failures.
#[async_trait]
pub trait ReferralCodeHistoryRepository: Send + Sync {
    /// Archive an old referral code for `user_id`.
    async fn add(&self, code: &str, user_id: Uuid) -> Result<(), AppError>;

    /// Resolve a retired code back to its original owner.
    async fn find_user_by_code(&self, code: &str) -> Result<Option<Uuid>, AppError>;
}

/// In-memory implementation for development and testing.
pub struct InMemoryReferralCodeHistoryRepository {
    /// Maps retired code -> user_id
    history: RwLock<HashMap<String, Uuid>>,
}

impl InMemoryReferralCodeHistoryRepository {
    pub fn new() -> Self {
        Self {
            history: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryReferralCodeHistoryRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl ReferralCodeHistoryRepository for InMemoryReferralCodeHistoryRepository {
    async fn add(&self, code: &str, user_id: Uuid) -> Result<(), AppError> {
        let mut map = self.history.write().await;
        map.entry(code.to_string()).or_insert(user_id);
        Ok(())
    }

    async fn find_user_by_code(&self, code: &str) -> Result<Option<Uuid>, AppError> {
        let map = self.history.read().await;
        Ok(map.get(code).copied())
    }
}
