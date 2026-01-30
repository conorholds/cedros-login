//! Credit service for balance, spending, and hold operations
//!
//! Provides a professional-grade credit system with:
//! - Balance queries with held amount tracking
//! - Direct spend operations with idempotency
//! - Hold/capture pattern for two-phase commits
//! - Full audit trail for all transactions

use chrono::Duration;
use std::sync::Arc;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{CreditHoldEntity, CreditHoldRepository, CreditRepository, CreditTransactionEntity};

// Re-export types for external consumers
pub use super::credit_types::{
    AdjustResult, CreditBalance, CreditHistory, CreditHistoryItem, HoldResult, SpendResult,
};

/// Default hold TTL (15 minutes)
const DEFAULT_HOLD_TTL_MINUTES: i64 = 15;

/// Credit service for balance, spending, and hold operations
pub struct CreditService {
    credit_repo: Arc<dyn CreditRepository>,
    hold_repo: Arc<dyn CreditHoldRepository>,
    /// Maximum spend per transaction in lamports (0 = no limit)
    max_spend_per_transaction_lamports: u64,
}

impl CreditService {
    /// Create a new credit service
    pub fn new(
        credit_repo: Arc<dyn CreditRepository>,
        hold_repo: Arc<dyn CreditHoldRepository>,
    ) -> Self {
        Self::with_config(credit_repo, hold_repo, 0)
    }

    /// Create a new credit service with spend limit configuration
    pub fn with_config(
        credit_repo: Arc<dyn CreditRepository>,
        hold_repo: Arc<dyn CreditHoldRepository>,
        max_spend_per_transaction_lamports: u64,
    ) -> Self {
        Self {
            credit_repo,
            hold_repo,
            max_spend_per_transaction_lamports,
        }
    }

    /// Get user's credit balance for a specific currency
    pub async fn get_balance(
        &self,
        user_id: Uuid,
        currency: &str,
    ) -> Result<CreditBalance, AppError> {
        let balance_entity = self
            .credit_repo
            .get_or_create_balance(user_id, currency)
            .await?;
        Ok(CreditBalance::from_entity(balance_entity))
    }

    /// Get user's credit balance in lamports (simple lookup)
    pub async fn get_balance_lamports(
        &self,
        user_id: Uuid,
        currency: &str,
    ) -> Result<i64, AppError> {
        self.credit_repo.get_balance(user_id, currency).await
    }

    /// Get all balances for a user (currently just SOL)
    pub async fn get_all_balances(&self, user_id: Uuid) -> Result<Vec<CreditBalance>, AppError> {
        // Currently we only support SOL
        let sol_balance = self
            .credit_repo
            .get_or_create_balance(user_id, "SOL")
            .await?;
        Ok(vec![CreditBalance::from_entity(sol_balance)])
    }

    /// Get transaction history for a user
    pub async fn get_history(
        &self,
        user_id: Uuid,
        currency: Option<&str>,
        tx_type: Option<&str>,
        limit: u32,
        offset: u32,
    ) -> Result<CreditHistory, AppError> {
        let (transactions, total) = tokio::join!(
            self.credit_repo
                .get_transactions(user_id, currency, tx_type, limit, offset),
            self.credit_repo
                .count_transactions(user_id, currency, tx_type)
        );

        let items: Vec<CreditHistoryItem> = transactions?
            .into_iter()
            .map(CreditHistoryItem::from)
            .collect();

        Ok(CreditHistory {
            items,
            total: total?,
            limit,
            offset,
        })
    }

    /// Get user credit statistics (usage analytics)
    pub async fn get_user_stats(
        &self,
        user_id: Uuid,
        currency: &str,
    ) -> Result<crate::repositories::UserCreditStats, AppError> {
        self.credit_repo.get_user_stats(user_id, currency).await
    }

    /// Check if user has sufficient available balance for a spend operation
    ///
    /// Returns true if available balance (total - held) >= amount
    pub async fn has_sufficient_balance(
        &self,
        user_id: Uuid,
        currency: &str,
        amount: i64,
    ) -> Result<bool, AppError> {
        let balance = self
            .credit_repo
            .get_or_create_balance(user_id, currency)
            .await?;
        Ok(balance.available() >= amount)
    }

    // =========================================================================
    // SPEND OPERATIONS
    // =========================================================================

    /// Spend credits immediately (direct debit)
    ///
    /// Use this for simple, idempotent spend operations.
    /// For two-phase commits, use hold() + capture().
    ///
    /// # Arguments
    /// * `user_id` - User to debit
    /// * `amount` - Amount in lamports (must be positive)
    /// * `currency` - Currency code (e.g., "SOL")
    /// * `idempotency_key` - Unique key to prevent duplicate charges
    /// * `reference_type` - What this spend is for (e.g., "order")
    /// * `reference_id` - ID of the related entity
    /// * `metadata` - Optional additional context
    #[allow(clippy::too_many_arguments)]
    pub async fn spend(
        &self,
        user_id: Uuid,
        amount: i64,
        currency: &str,
        idempotency_key: String,
        reference_type: &str,
        reference_id: Uuid,
        metadata: Option<serde_json::Value>,
    ) -> Result<SpendResult, AppError> {
        if amount <= 0 {
            return Err(AppError::Validation("Amount must be positive".into()));
        }

        // Check max spend limit (0 = no limit)
        if self.max_spend_per_transaction_lamports > 0
            && amount > self.max_spend_per_transaction_lamports as i64
        {
            tracing::warn!(
                user_id = %user_id,
                amount = amount,
                max_allowed = self.max_spend_per_transaction_lamports,
                "Spend amount exceeds maximum per-transaction limit"
            );
            return Err(AppError::Validation(format!(
                "Maximum spend per transaction is {} lamports",
                self.max_spend_per_transaction_lamports
            )));
        }

        let tx = CreditTransactionEntity::new_spend_with_reference(
            user_id,
            amount,
            currency,
            idempotency_key,
            reference_type,
            reference_id,
            metadata,
        );
        let tx_id = tx.id;

        let new_balance = self
            .credit_repo
            .deduct_credit(user_id, amount, currency, tx)
            .await?;

        Ok(SpendResult {
            transaction_id: tx_id,
            new_balance_lamports: new_balance,
            amount_lamports: amount,
        })
    }

    // =========================================================================
    // HOLD/CAPTURE OPERATIONS (Two-Phase Commit)
    // =========================================================================

    /// Create a hold to reserve credits
    ///
    /// Holds reserve credits for a future capture. If the operation fails,
    /// call release() to return the credits. Holds auto-expire after TTL.
    ///
    /// # Arguments
    /// * `user_id` - User to hold credits from
    /// * `amount` - Amount in lamports (must be positive)
    /// * `currency` - Currency code (e.g., "SOL")
    /// * `idempotency_key` - Unique key (returns existing hold if duplicate)
    /// * `ttl_minutes` - Hold duration (None = default 15 minutes)
    /// * `reference_type` - What this hold is for
    /// * `reference_id` - ID of related entity
    /// * `metadata` - Optional context
    #[allow(clippy::too_many_arguments)]
    pub async fn hold(
        &self,
        user_id: Uuid,
        amount: i64,
        currency: &str,
        idempotency_key: String,
        ttl_minutes: Option<i64>,
        reference_type: Option<&str>,
        reference_id: Option<Uuid>,
        metadata: Option<serde_json::Value>,
    ) -> Result<HoldResult, AppError> {
        if amount <= 0 {
            return Err(AppError::Validation("Amount must be positive".into()));
        }

        // Check max spend limit (holds are reservations for spending)
        if self.max_spend_per_transaction_lamports > 0
            && amount > self.max_spend_per_transaction_lamports as i64
        {
            tracing::warn!(
                user_id = %user_id,
                amount = amount,
                max_allowed = self.max_spend_per_transaction_lamports,
                "Hold amount exceeds maximum per-transaction limit"
            );
            return Err(AppError::Validation(format!(
                "Maximum hold per transaction is {} lamports",
                self.max_spend_per_transaction_lamports
            )));
        }

        // Check available balance first
        let balance = self
            .credit_repo
            .get_or_create_balance(user_id, currency)
            .await?;
        if balance.available() < amount {
            return Err(AppError::Validation(format!(
                "Insufficient available balance: have {}, need {}",
                balance.available(),
                amount
            )));
        }

        let ttl = Duration::minutes(ttl_minutes.unwrap_or(DEFAULT_HOLD_TTL_MINUTES));
        let hold = CreditHoldEntity::new(
            user_id,
            amount,
            currency,
            idempotency_key,
            ttl,
            reference_type,
            reference_id,
            metadata,
        );

        let result = self.hold_repo.create_hold(hold).await?;

        Ok(HoldResult {
            hold_id: result.hold().id,
            is_new: result.is_new(),
            amount_lamports: result.hold().amount,
            expires_at: result.hold().expires_at,
        })
    }

    /// Capture a hold, converting it to a spend
    ///
    /// This finalizes the two-phase commit, deducting the held credits.
    /// Returns an error if the hold has expired.
    pub async fn capture(&self, hold_id: Uuid) -> Result<SpendResult, AppError> {
        // Get the hold first to know the details
        let hold = self
            .hold_repo
            .get_hold(hold_id)
            .await?
            .ok_or_else(|| AppError::NotFound(format!("Hold {} not found", hold_id)))?;

        // CRITICAL: Validate hold can be captured (prevents race condition with expiry job)
        if !hold.can_capture() {
            if hold.is_expired() {
                tracing::warn!(
                    hold_id = %hold_id,
                    user_id = %hold.user_id,
                    expires_at = %hold.expires_at,
                    "Attempted to capture expired hold"
                );
                return Err(AppError::Validation(format!(
                    "Hold {} has expired at {}",
                    hold_id, hold.expires_at
                )));
            }
            tracing::warn!(
                hold_id = %hold_id,
                user_id = %hold.user_id,
                status = hold.status.as_str(),
                "Attempted to capture hold with invalid status"
            );
            return Err(AppError::Validation(format!(
                "Hold {} cannot be captured, status: {}",
                hold_id, hold.status.as_str()
            )));
        }

        // Create the transaction from the hold
        let tx = CreditTransactionEntity::from_captured_hold(
            hold.user_id,
            hold.amount,
            &hold.currency,
            hold_id,
            &hold.idempotency_key,
            hold.reference_type.as_deref(),
            hold.reference_id,
            hold.metadata.clone(),
        );
        let tx_id = tx.id;

        // Capture the hold (updates held_balance)
        self.hold_repo.capture_hold(hold_id, tx_id).await?;

        // Deduct from actual balance
        let new_balance = self
            .credit_repo
            .deduct_credit(hold.user_id, hold.amount, &hold.currency, tx)
            .await?;

        Ok(SpendResult {
            transaction_id: tx_id,
            new_balance_lamports: new_balance,
            amount_lamports: hold.amount,
        })
    }

    /// Release a hold, returning credits to available balance
    ///
    /// Use this when an operation is cancelled or fails.
    pub async fn release(&self, hold_id: Uuid) -> Result<(), AppError> {
        self.hold_repo.release_hold(hold_id).await?;
        Ok(())
    }

    /// Get pending holds for a user
    pub async fn get_pending_holds(
        &self,
        user_id: Uuid,
        currency: Option<&str>,
    ) -> Result<Vec<CreditHoldEntity>, AppError> {
        self.hold_repo.get_pending_holds(user_id, currency).await
    }

    /// Expire stale holds that have passed their TTL
    ///
    /// Returns the number of holds expired. Called by the background task.
    pub async fn expire_holds(&self) -> Result<u64, AppError> {
        self.hold_repo.expire_holds().await
    }

    // =========================================================================
    // ADMIN OPERATIONS
    // =========================================================================

    /// Adjust a user's credit balance (admin operation)
    ///
    /// Use for refunds, bonuses, promotional credits, or manual corrections.
    /// Positive amounts add credits, negative amounts remove credits.
    ///
    /// # Arguments
    /// * `admin_id` - ID of the admin performing the adjustment
    /// * `user_id` - User whose balance to adjust
    /// * `amount` - Amount in lamports (positive = credit, negative = debit)
    /// * `currency` - Currency code (e.g., "SOL")
    /// * `reason` - Human-readable reason for the adjustment
    /// * `reference_type` - Optional type (e.g., "refund", "bonus", "promo")
    /// * `reference_id` - Optional ID of related entity
    #[allow(clippy::too_many_arguments)]
    pub async fn adjust(
        &self,
        admin_id: Uuid,
        user_id: Uuid,
        amount: i64,
        currency: &str,
        reason: &str,
        reference_type: Option<&str>,
        reference_id: Option<Uuid>,
    ) -> Result<AdjustResult, AppError> {
        if amount == 0 {
            return Err(AppError::Validation("Amount cannot be zero".into()));
        }

        if reason.trim().is_empty() {
            return Err(AppError::Validation("Reason is required".into()));
        }

        let tx = CreditTransactionEntity::new_adjustment(
            user_id,
            amount,
            currency,
            admin_id,
            reason,
            reference_type,
            reference_id,
        );
        let tx_id = tx.id;

        let new_balance = if amount > 0 {
            // Adding credits
            self.credit_repo
                .add_credit(user_id, amount, currency, tx)
                .await?
        } else {
            // Removing credits (debit)
            // Check available balance first
            let balance = self
                .credit_repo
                .get_or_create_balance(user_id, currency)
                .await?;
            let debit_amount = amount.abs();
            if balance.available() < debit_amount {
                return Err(AppError::Validation(format!(
                    "Insufficient available balance: have {}, need {}",
                    balance.available(),
                    debit_amount
                )));
            }
            self.credit_repo
                .deduct_credit(user_id, debit_amount, currency, tx)
                .await?
        };

        Ok(AdjustResult {
            transaction_id: tx_id,
            new_balance_lamports: new_balance,
            amount_lamports: amount,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::{InMemoryCreditHoldRepository, InMemoryCreditRepository};

    fn create_service() -> CreditService {
        let credit_repo: Arc<dyn CreditRepository> = Arc::new(InMemoryCreditRepository::new());
        let hold_repo: Arc<dyn CreditHoldRepository> =
            Arc::new(InMemoryCreditHoldRepository::new());
        CreditService::new(credit_repo, hold_repo)
    }

    #[tokio::test]
    async fn test_get_balance_new_user() {
        let service = create_service();

        let balance = service.get_balance(Uuid::new_v4(), "SOL").await.unwrap();
        assert_eq!(balance.balance_lamports, 0);
        assert_eq!(balance.available_lamports, 0);
        assert_eq!(balance.currency, "SOL");
    }

    #[tokio::test]
    async fn test_has_sufficient_balance() {
        let service = create_service();
        let user_id = Uuid::new_v4();

        // New user has zero balance
        let has_balance = service
            .has_sufficient_balance(user_id, "SOL", 1000)
            .await
            .unwrap();
        assert!(!has_balance);
    }

    #[tokio::test]
    async fn test_spend_insufficient_balance() {
        let service = create_service();
        let user_id = Uuid::new_v4();
        let order_id = Uuid::new_v4();

        // Try to spend without balance
        let result = service
            .spend(
                user_id,
                1000,
                "SOL",
                "order-123".to_string(),
                "order",
                order_id,
                None,
            )
            .await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_hold_insufficient_balance() {
        let service = create_service();
        let user_id = Uuid::new_v4();

        // Try to hold without balance
        let result = service
            .hold(
                user_id,
                1000,
                "SOL",
                "order-123".to_string(),
                None,
                Some("order"),
                Some(Uuid::new_v4()),
                None,
            )
            .await;

        assert!(result.is_err());
    }
}
