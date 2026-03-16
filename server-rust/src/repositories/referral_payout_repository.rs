//! Referral payout repository trait and in-memory implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// A pending/completed referral payout record
#[derive(Debug, Clone)]
pub struct ReferralPayoutEntity {
    pub id: Uuid,
    pub referrer_id: Uuid,
    pub referred_user_id: Uuid,
    /// "signup", "first_spend", or "spend"
    pub trigger_type: String,
    pub amount: i64,
    pub currency: String,
    /// "pending", "processing", "completed", or "failed"
    pub status: String,
    pub tx_signature: Option<String>,
    pub error_message: Option<String>,
    /// The spend transaction ID that triggered this payout (for on_every_spend dedup)
    pub spend_transaction_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

/// Per-referrer summary of pending payouts
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReferrerPayoutSummary {
    pub referrer_id: Uuid,
    pub payout_wallet_address: Option<String>,
    pub total_pending_amount: i64,
    pub pending_count: u64,
    pub currency: String,
}

/// Repository for tracking direct referral payouts
#[async_trait]
pub trait ReferralPayoutRepository: Send + Sync {
    /// Create a new payout record
    async fn create(
        &self,
        payout: ReferralPayoutEntity,
    ) -> Result<ReferralPayoutEntity, AppError>;

    /// List pending payouts (for admin review or retry)
    async fn list_pending(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<ReferralPayoutEntity>, AppError>;

    /// Count total pending payouts
    async fn count_pending(&self) -> Result<u64, AppError>;

    /// Mark a payout as completed with the on-chain tx signature.
    /// Only transitions from 'pending' or 'processing' status.
    /// Returns true if the status was updated, false if already completed/cancelled.
    async fn mark_completed(&self, id: Uuid, tx_signature: &str) -> Result<bool, AppError>;

    /// Mark a payout as failed with an error description.
    /// Only transitions from 'pending' or 'processing' status.
    /// Returns true if the status was updated, false if already completed/cancelled.
    async fn mark_failed(&self, id: Uuid, error: &str) -> Result<bool, AppError>;

    /// Atomically claim pending payouts by setting status to 'processing'.
    /// Returns only the IDs that were successfully claimed (status was 'pending').
    /// This prevents two processes from processing the same payout concurrently.
    async fn claim_for_processing(&self, ids: &[Uuid]) -> Result<Vec<Uuid>, AppError>;

    /// Summarise pending payouts grouped by referrer (for batch processing).
    ///
    /// Returns one entry per referrer/currency pair, ordered by total pending
    /// amount descending.
    async fn pending_by_referrer(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<ReferrerPayoutSummary>, AppError>;

    /// Count distinct referrers with at least one pending payout
    async fn count_pending_referrers(&self) -> Result<u64, AppError>;

    /// Sum total amount of all non-failed payouts for a referrer (pending + completed).
    /// Used for cap enforcement.
    async fn sum_for_referrer(&self, referrer_id: Uuid) -> Result<i64, AppError>;

    /// Reset all failed payouts to pending so they can be retried.
    /// Returns the number of payouts reset.
    async fn reset_failed(&self) -> Result<u64, AppError>;

    /// Check if a payout already exists for a specific spend transaction.
    /// Used to prevent duplicate on_every_spend payouts from race conditions.
    async fn exists_for_spend_transaction(
        &self,
        referrer_id: Uuid,
        spend_transaction_id: Uuid,
    ) -> Result<bool, AppError>;

    /// Check if a payout already exists for a referrer+referred pair with a given trigger type.
    /// Used to enforce one-time rewards (e.g., on_first_spend).
    async fn exists_for_pair(
        &self,
        referrer_id: Uuid,
        referred_user_id: Uuid,
        trigger_type: &str,
    ) -> Result<bool, AppError>;

    /// Sum the total `amount` of all payouts with the given status string
    /// (e.g. `"pending"` or `"completed"`).
    ///
    /// Returns 0 when no matching rows exist.
    async fn sum_by_status(&self, status: &str) -> Result<i64, AppError>;

    /// Find a single payout by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<ReferralPayoutEntity>, AppError>;

    /// Cancel a payout (set status to "cancelled").
    /// Only pending payouts can be cancelled.
    /// Returns true if cancelled, false if status was not 'pending'.
    async fn cancel(&self, id: Uuid) -> Result<bool, AppError>;

    /// List all payouts with optional status filter and pagination.
    /// Returns payouts ordered by created_at descending.
    async fn list_all(
        &self,
        status_filter: Option<&str>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<ReferralPayoutEntity>, AppError>;

    /// Count all payouts with optional status filter
    async fn count_all(&self, status_filter: Option<&str>) -> Result<u64, AppError>;
}

/// In-memory implementation for development and testing
pub struct InMemoryReferralPayoutRepository {
    payouts: RwLock<HashMap<Uuid, ReferralPayoutEntity>>,
}

impl InMemoryReferralPayoutRepository {
    pub fn new() -> Self {
        Self {
            payouts: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryReferralPayoutRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl ReferralPayoutRepository for InMemoryReferralPayoutRepository {
    async fn create(
        &self,
        payout: ReferralPayoutEntity,
    ) -> Result<ReferralPayoutEntity, AppError> {
        let mut payouts = self.payouts.write().await;
        payouts.insert(payout.id, payout.clone());
        Ok(payout)
    }

    async fn list_pending(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<ReferralPayoutEntity>, AppError> {
        let payouts = self.payouts.read().await;
        let mut pending: Vec<_> = payouts
            .values()
            .filter(|p| p.status == "pending")
            .cloned()
            .collect();
        pending.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(pending
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_pending(&self) -> Result<u64, AppError> {
        let payouts = self.payouts.read().await;
        Ok(payouts.values().filter(|p| p.status == "pending").count() as u64)
    }

    async fn mark_completed(&self, id: Uuid, tx_signature: &str) -> Result<bool, AppError> {
        let mut payouts = self.payouts.write().await;
        if let Some(p) = payouts.get_mut(&id) {
            if p.status == "pending" || p.status == "processing" {
                p.status = "completed".to_string();
                p.tx_signature = Some(tx_signature.to_string());
                p.completed_at = Some(Utc::now());
                return Ok(true);
            }
        }
        Ok(false)
    }

    async fn mark_failed(&self, id: Uuid, error: &str) -> Result<bool, AppError> {
        let mut payouts = self.payouts.write().await;
        if let Some(p) = payouts.get_mut(&id) {
            if p.status == "pending" || p.status == "processing" {
                p.status = "failed".to_string();
                p.error_message = Some(error.to_string());
                return Ok(true);
            }
        }
        Ok(false)
    }

    async fn claim_for_processing(&self, ids: &[Uuid]) -> Result<Vec<Uuid>, AppError> {
        let mut payouts = self.payouts.write().await;
        let mut claimed = Vec::new();
        for id in ids {
            if let Some(p) = payouts.get_mut(id) {
                if p.status == "pending" {
                    p.status = "processing".to_string();
                    claimed.push(*id);
                }
            }
        }
        Ok(claimed)
    }

    async fn pending_by_referrer(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<ReferrerPayoutSummary>, AppError> {
        let payouts = self.payouts.read().await;

        // Group by (referrer_id, currency)
        let mut groups: HashMap<(Uuid, String), (i64, u64)> = HashMap::new();
        for p in payouts.values().filter(|p| p.status == "pending") {
            let entry = groups
                .entry((p.referrer_id, p.currency.clone()))
                .or_insert((0, 0));
            entry.0 += p.amount;
            entry.1 += 1;
        }

        let mut summaries: Vec<ReferrerPayoutSummary> = groups
            .into_iter()
            .map(|((referrer_id, currency), (total, count))| ReferrerPayoutSummary {
                referrer_id,
                payout_wallet_address: None, // not available in-memory without user lookup
                total_pending_amount: total,
                pending_count: count,
                currency,
            })
            .collect();

        summaries.sort_by(|a, b| b.total_pending_amount.cmp(&a.total_pending_amount));

        Ok(summaries
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_pending_referrers(&self) -> Result<u64, AppError> {
        let payouts = self.payouts.read().await;
        let referrers: std::collections::HashSet<Uuid> = payouts
            .values()
            .filter(|p| p.status == "pending")
            .map(|p| p.referrer_id)
            .collect();
        Ok(referrers.len() as u64)
    }

    async fn sum_for_referrer(&self, referrer_id: Uuid) -> Result<i64, AppError> {
        let payouts = self.payouts.read().await;
        let sum: i64 = payouts
            .values()
            .filter(|p| p.referrer_id == referrer_id && p.status != "failed")
            .map(|p| p.amount)
            .sum();
        Ok(sum)
    }

    async fn reset_failed(&self) -> Result<u64, AppError> {
        let mut payouts = self.payouts.write().await;
        let mut count = 0u64;
        for p in payouts.values_mut() {
            if p.status == "failed" {
                p.status = "pending".to_string();
                p.error_message = None;
                count += 1;
            }
        }
        Ok(count)
    }

    async fn exists_for_spend_transaction(
        &self,
        referrer_id: Uuid,
        spend_transaction_id: Uuid,
    ) -> Result<bool, AppError> {
        let payouts = self.payouts.read().await;
        Ok(payouts.values().any(|p| {
            p.referrer_id == referrer_id
                && p.spend_transaction_id == Some(spend_transaction_id)
        }))
    }

    async fn exists_for_pair(
        &self,
        referrer_id: Uuid,
        referred_user_id: Uuid,
        trigger_type: &str,
    ) -> Result<bool, AppError> {
        let payouts = self.payouts.read().await;
        Ok(payouts.values().any(|p| {
            p.referrer_id == referrer_id
                && p.referred_user_id == referred_user_id
                && p.trigger_type == trigger_type
        }))
    }

    async fn sum_by_status(&self, status: &str) -> Result<i64, AppError> {
        let payouts = self.payouts.read().await;
        Ok(payouts
            .values()
            .filter(|p| p.status == status)
            .map(|p| p.amount)
            .sum())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<ReferralPayoutEntity>, AppError> {
        let payouts = self.payouts.read().await;
        Ok(payouts.get(&id).cloned())
    }

    async fn cancel(&self, id: Uuid) -> Result<bool, AppError> {
        let mut payouts = self.payouts.write().await;
        if let Some(p) = payouts.get_mut(&id) {
            if p.status == "pending" {
                p.status = "cancelled".to_string();
                return Ok(true);
            }
        }
        Ok(false)
    }

    async fn list_all(
        &self,
        status_filter: Option<&str>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<ReferralPayoutEntity>, AppError> {
        let payouts = self.payouts.read().await;
        let mut items: Vec<_> = payouts
            .values()
            .filter(|p| status_filter.map_or(true, |s| p.status == s))
            .cloned()
            .collect();
        items.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(items
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_all(&self, status_filter: Option<&str>) -> Result<u64, AppError> {
        let payouts = self.payouts.read().await;
        Ok(payouts
            .values()
            .filter(|p| status_filter.map_or(true, |s| p.status == s))
            .count() as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_payout(referrer_id: Uuid, referred_user_id: Uuid, trigger: &str) -> ReferralPayoutEntity {
        ReferralPayoutEntity {
            id: Uuid::new_v4(),
            referrer_id,
            referred_user_id,
            trigger_type: trigger.to_string(),
            amount: 1000,
            currency: "SOL".to_string(),
            status: "pending".to_string(),
            tx_signature: None,
            error_message: None,
            spend_transaction_id: None,
            created_at: Utc::now(),
            completed_at: None,
        }
    }

    #[tokio::test]
    async fn test_claim_for_processing_claims_pending() {
        let repo = InMemoryReferralPayoutRepository::new();
        let p = make_payout(Uuid::new_v4(), Uuid::new_v4(), "signup");
        let id = p.id;
        repo.create(p).await.unwrap();

        let claimed = repo.claim_for_processing(&[id]).await.unwrap();
        assert_eq!(claimed, vec![id]);

        let found = repo.find_by_id(id).await.unwrap().unwrap();
        assert_eq!(found.status, "processing");
    }

    #[tokio::test]
    async fn test_claim_for_processing_prevents_double_claim() {
        let repo = InMemoryReferralPayoutRepository::new();
        let p = make_payout(Uuid::new_v4(), Uuid::new_v4(), "signup");
        let id = p.id;
        repo.create(p).await.unwrap();

        // First claim succeeds
        let claimed1 = repo.claim_for_processing(&[id]).await.unwrap();
        assert_eq!(claimed1.len(), 1);

        // Second claim returns empty — already processing
        let claimed2 = repo.claim_for_processing(&[id]).await.unwrap();
        assert!(claimed2.is_empty());
    }

    #[tokio::test]
    async fn test_mark_completed_only_from_pending_or_processing() {
        let repo = InMemoryReferralPayoutRepository::new();
        let p = make_payout(Uuid::new_v4(), Uuid::new_v4(), "signup");
        let id = p.id;
        repo.create(p).await.unwrap();

        // Mark completed from pending — succeeds
        assert!(repo.mark_completed(id, "tx_123").await.unwrap());

        // Mark completed again — fails (already completed)
        assert!(!repo.mark_completed(id, "tx_456").await.unwrap());

        // Verify the first signature is preserved
        let found = repo.find_by_id(id).await.unwrap().unwrap();
        assert_eq!(found.tx_signature.as_deref(), Some("tx_123"));
    }

    #[tokio::test]
    async fn test_mark_failed_only_from_pending_or_processing() {
        let repo = InMemoryReferralPayoutRepository::new();
        let p = make_payout(Uuid::new_v4(), Uuid::new_v4(), "signup");
        let id = p.id;
        repo.create(p).await.unwrap();

        // Complete the payout first
        repo.mark_completed(id, "tx_123").await.unwrap();

        // mark_failed on completed payout — no-op
        assert!(!repo.mark_failed(id, "some error").await.unwrap());

        let found = repo.find_by_id(id).await.unwrap().unwrap();
        assert_eq!(found.status, "completed"); // Still completed
    }

    #[tokio::test]
    async fn test_cancel_only_from_pending() {
        let repo = InMemoryReferralPayoutRepository::new();
        let p = make_payout(Uuid::new_v4(), Uuid::new_v4(), "signup");
        let id = p.id;
        repo.create(p).await.unwrap();

        // Claim it (status → processing)
        repo.claim_for_processing(&[id]).await.unwrap();

        // Cancel from processing — fails
        assert!(!repo.cancel(id).await.unwrap());

        let found = repo.find_by_id(id).await.unwrap().unwrap();
        assert_eq!(found.status, "processing");
    }

    #[tokio::test]
    async fn test_cancel_from_pending_succeeds() {
        let repo = InMemoryReferralPayoutRepository::new();
        let p = make_payout(Uuid::new_v4(), Uuid::new_v4(), "signup");
        let id = p.id;
        repo.create(p).await.unwrap();

        assert!(repo.cancel(id).await.unwrap());

        let found = repo.find_by_id(id).await.unwrap().unwrap();
        assert_eq!(found.status, "cancelled");
    }

    #[tokio::test]
    async fn test_list_all_with_status_filter() {
        let repo = InMemoryReferralPayoutRepository::new();
        let referrer = Uuid::new_v4();

        let p1 = make_payout(referrer, Uuid::new_v4(), "signup");
        let p2 = make_payout(referrer, Uuid::new_v4(), "signup");
        let id2 = p2.id;
        repo.create(p1).await.unwrap();
        repo.create(p2).await.unwrap();

        // Complete one
        repo.mark_completed(id2, "tx").await.unwrap();

        assert_eq!(repo.count_all(None).await.unwrap(), 2);
        assert_eq!(repo.count_all(Some("pending")).await.unwrap(), 1);
        assert_eq!(repo.count_all(Some("completed")).await.unwrap(), 1);

        let pending = repo.list_all(Some("pending"), 10, 0).await.unwrap();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].status, "pending");
    }

    #[tokio::test]
    async fn test_find_by_id_not_found() {
        let repo = InMemoryReferralPayoutRepository::new();
        assert!(repo.find_by_id(Uuid::new_v4()).await.unwrap().is_none());
    }
}
