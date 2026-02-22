//! Credit balance and transaction repository trait and implementations

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::pagination::{cap_limit, cap_offset};

/// Credit transaction type
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CreditTxType {
    /// Credit from deposit
    Deposit,
    /// Debit from spending
    Spend,
    /// Manual adjustment
    Adjustment,
}

impl CreditTxType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Deposit => "deposit",
            Self::Spend => "spend",
            Self::Adjustment => "adjustment",
        }
    }

    #[allow(clippy::should_implement_trait)]
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "deposit" => Some(Self::Deposit),
            "spend" => Some(Self::Spend),
            "adjustment" => Some(Self::Adjustment),
            _ => None,
        }
    }
}

/// Credit balance entity
#[derive(Debug, Clone)]
pub struct CreditBalanceEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub balance: i64,
    /// Credits reserved by pending holds (not available for spending)
    pub held_balance: i64,
    pub currency: String,
    pub updated_at: DateTime<Utc>,
}

impl CreditBalanceEntity {
    /// Returns the available balance (total minus held)
    pub fn available(&self) -> i64 {
        self.balance - self.held_balance
    }
}

/// Credit transaction entity (immutable audit log)
#[derive(Debug, Clone)]
pub struct CreditTransactionEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub amount: i64,
    pub currency: String,
    pub tx_type: CreditTxType,
    pub deposit_session_id: Option<Uuid>,
    pub privacy_note_id: Option<Uuid>,
    /// Client-provided idempotency key to prevent duplicate charges
    pub idempotency_key: Option<String>,
    /// Type of reference (e.g., "order", "subscription", "refund")
    pub reference_type: Option<String>,
    /// ID of the related entity
    pub reference_id: Option<Uuid>,
    /// Link to original hold if this was a captured hold
    pub hold_id: Option<Uuid>,
    pub metadata: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
}

impl CreditTransactionEntity {
    /// Create a new privacy deposit credit transaction (SSS wallet)
    ///
    /// Used for Privacy Cash deposits where the deposit goes to user's
    /// Privacy Cash account and is later withdrawn to company wallet.
    pub fn new_privacy_deposit(
        user_id: Uuid,
        amount: i64,
        currency: &str,
        deposit_session_id: Uuid,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            amount,
            currency: currency.to_string(),
            tx_type: CreditTxType::Deposit,
            deposit_session_id: Some(deposit_session_id),
            privacy_note_id: None,
            idempotency_key: None,
            reference_type: None,
            reference_id: None,
            hold_id: None,
            metadata: None,
            created_at: Utc::now(),
        }
    }

    /// Create a new deposit credit transaction (legacy)
    #[allow(dead_code)]
    pub fn new_deposit(
        user_id: Uuid,
        amount: i64,
        currency: &str,
        deposit_session_id: Uuid,
        privacy_note_id: Uuid,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            amount,
            currency: currency.to_string(),
            tx_type: CreditTxType::Deposit,
            deposit_session_id: Some(deposit_session_id),
            privacy_note_id: Some(privacy_note_id),
            idempotency_key: None,
            reference_type: None,
            reference_id: None,
            hold_id: None,
            metadata: None,
            created_at: Utc::now(),
        }
    }

    /// Create a new spend debit transaction (simple)
    pub fn new_spend(
        user_id: Uuid,
        amount: i64,
        currency: &str,
        metadata: Option<serde_json::Value>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            amount: -amount.abs(), // Always negative for spend
            currency: currency.to_string(),
            tx_type: CreditTxType::Spend,
            deposit_session_id: None,
            privacy_note_id: None,
            idempotency_key: None,
            reference_type: None,
            reference_id: None,
            hold_id: None,
            metadata,
            created_at: Utc::now(),
        }
    }

    /// Create a new spend transaction with full reference tracking
    ///
    /// Use this for production spends to ensure idempotency and audit trail.
    pub fn new_spend_with_reference(
        user_id: Uuid,
        amount: i64,
        currency: &str,
        idempotency_key: String,
        reference_type: &str,
        reference_id: Uuid,
        metadata: Option<serde_json::Value>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            amount: -amount.abs(),
            currency: currency.to_string(),
            tx_type: CreditTxType::Spend,
            deposit_session_id: None,
            privacy_note_id: None,
            idempotency_key: Some(idempotency_key),
            reference_type: Some(reference_type.to_string()),
            reference_id: Some(reference_id),
            hold_id: None,
            metadata,
            created_at: Utc::now(),
        }
    }

    /// Create a spend transaction from a captured hold
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn from_captured_hold(
        user_id: Uuid,
        amount: i64,
        currency: &str,
        hold_id: Uuid,
        idempotency_key: &str,
        reference_type: Option<&str>,
        reference_id: Option<Uuid>,
        metadata: Option<serde_json::Value>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            amount: -amount.abs(),
            currency: currency.to_string(),
            tx_type: CreditTxType::Spend,
            deposit_session_id: None,
            privacy_note_id: None,
            idempotency_key: Some(idempotency_key.to_string()),
            reference_type: reference_type.map(String::from),
            reference_id,
            hold_id: Some(hold_id),
            metadata,
            created_at: Utc::now(),
        }
    }

    /// Create an adjustment transaction (admin operation)
    ///
    /// Use for refunds, bonuses, promotional credits, or manual corrections.
    /// Amount can be positive (credit) or negative (debit).
    pub fn new_adjustment(
        user_id: Uuid,
        amount: i64,
        currency: &str,
        admin_id: Uuid,
        reason: &str,
        reference_type: Option<&str>,
        reference_id: Option<Uuid>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            amount,
            currency: currency.to_string(),
            tx_type: CreditTxType::Adjustment,
            deposit_session_id: None,
            privacy_note_id: None,
            idempotency_key: None,
            reference_type: reference_type.map(String::from),
            reference_id,
            hold_id: None,
            metadata: Some(serde_json::json!({
                "admin_id": admin_id.to_string(),
                "reason": reason
            })),
            created_at: Utc::now(),
        }
    }

    /// Create an idempotent refund adjustment transaction.
    ///
    /// Uses `idempotency_key` to ensure at-most-once issuance if the admin retries.
    pub fn new_refund_adjustment(
        user_id: Uuid,
        amount: i64,
        currency: &str,
        admin_id: Uuid,
        refund_request_id: Uuid,
        original_transaction_id: Uuid,
        reason: &str,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            amount,
            currency: currency.to_string(),
            tx_type: CreditTxType::Adjustment,
            deposit_session_id: None,
            privacy_note_id: None,
            idempotency_key: Some(format!("refund_request:{}", refund_request_id)),
            reference_type: Some("refund".to_string()),
            reference_id: Some(original_transaction_id),
            hold_id: None,
            metadata: Some(serde_json::json!({
                "admin_id": admin_id.to_string(),
                "refund_request_id": refund_request_id.to_string(),
                "reason": reason
            })),
            created_at: Utc::now(),
        }
    }
}

/// Aggregate credit statistics (admin view)
#[derive(Debug, Clone, Default)]
pub struct CreditStats {
    // ============= By Currency =============
    /// Stats for SOL credits
    pub sol: CurrencyCreditStats,
    /// Stats for USD credits (from USDC/USDT deposits)
    pub usd: CurrencyCreditStats,

    // ============= Totals =============
    /// Total number of unique users with any credit balance
    pub total_users_with_balance: u64,
    /// Total outstanding credit value (sum of all balances)
    pub total_outstanding_lamports: i64,
}

/// Credit statistics for a single currency
#[derive(Debug, Clone, Default)]
pub struct CurrencyCreditStats {
    /// Total credited (positive transactions: deposits + positive adjustments)
    pub total_credited: i64,
    /// Total spent (absolute value of spend transactions)
    pub total_spent: i64,
    /// Total positive adjustments (refunds, bonuses)
    pub total_positive_adjustments: i64,
    /// Total negative adjustments (corrections, chargebacks)
    pub total_negative_adjustments: i64,
    /// Current outstanding balance (total_credited - total_spent + net_adjustments)
    pub current_outstanding: i64,
    /// Number of deposit transactions
    pub deposit_count: u64,
    /// Number of spend transactions
    pub spend_count: u64,
    /// Number of adjustment transactions
    pub adjustment_count: u64,
}

/// User credit statistics (user-facing analytics)
#[derive(Debug, Clone, Default)]
pub struct UserCreditStats {
    /// Total deposited in lamports
    pub total_deposited: i64,
    /// Total spent in lamports
    pub total_spent: i64,
    /// Total positive adjustments (refunds, bonuses)
    pub total_refunds: i64,
    /// Current balance in lamports
    pub current_balance: i64,
    /// Number of deposit transactions
    pub deposit_count: u64,
    /// Number of spend transactions
    pub spend_count: u64,
    /// Currency
    pub currency: String,
}

/// Credit repository trait
#[async_trait]
pub trait CreditRepository: Send + Sync {
    /// Get balance for a user and currency
    async fn get_balance(&self, user_id: Uuid, currency: &str) -> Result<i64, AppError>;

    /// Get balances for many users in one call (missing users default to 0 by caller).
    async fn get_balances(
        &self,
        user_ids: &[Uuid],
        currency: &str,
    ) -> Result<HashMap<Uuid, i64>, AppError>;

    /// Get or create balance entity for a user and currency
    async fn get_or_create_balance(
        &self,
        user_id: Uuid,
        currency: &str,
    ) -> Result<CreditBalanceEntity, AppError>;

    /// Add credit to a user's balance (atomic operation)
    /// Returns the new balance
    async fn add_credit(
        &self,
        user_id: Uuid,
        amount: i64,
        currency: &str,
        tx: CreditTransactionEntity,
    ) -> Result<i64, AppError>;

    /// Deduct credit from a user's balance (atomic operation)
    /// Returns the new balance or error if insufficient funds
    async fn deduct_credit(
        &self,
        user_id: Uuid,
        amount: i64,
        currency: &str,
        tx: CreditTransactionEntity,
    ) -> Result<i64, AppError>;

    /// Get transaction history for a user
    async fn get_transactions(
        &self,
        user_id: Uuid,
        currency: Option<&str>,
        tx_type: Option<&str>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<CreditTransactionEntity>, AppError>;

    /// Get total transaction count for a user
    async fn count_transactions(
        &self,
        user_id: Uuid,
        currency: Option<&str>,
        tx_type: Option<&str>,
    ) -> Result<u64, AppError>;

    /// Get aggregate credit statistics (admin)
    async fn get_stats(&self) -> Result<CreditStats, AppError>;

    /// Get user credit statistics (user-facing analytics)
    async fn get_user_stats(
        &self,
        user_id: Uuid,
        currency: &str,
    ) -> Result<UserCreditStats, AppError>;

    /// Get all balances for a user (all currencies)
    async fn get_all_balances(&self, user_id: Uuid) -> Result<Vec<CreditBalanceEntity>, AppError>;

    /// Find a transaction by ID
    async fn find_transaction_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<CreditTransactionEntity>, AppError>;

    /// Find a transaction by idempotency key (user-scoped)
    async fn find_transaction_by_idempotency_key(
        &self,
        user_id: Uuid,
        idempotency_key: &str,
    ) -> Result<Option<CreditTransactionEntity>, AppError>;

    /// Sum positive adjustment amounts for a specific reference
    async fn sum_positive_adjustments_by_reference(
        &self,
        user_id: Uuid,
        currency: &str,
        reference_type: &str,
        reference_id: Uuid,
    ) -> Result<i64, AppError>;
}

/// In-memory credit repository for development/testing
pub struct InMemoryCreditRepository {
    balances: RwLock<HashMap<(Uuid, String), CreditBalanceEntity>>,
    transactions: RwLock<Vec<CreditTransactionEntity>>,
}

impl InMemoryCreditRepository {
    pub fn new() -> Self {
        Self {
            balances: RwLock::new(HashMap::new()),
            transactions: RwLock::new(Vec::new()),
        }
    }
}

impl Default for InMemoryCreditRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CreditRepository for InMemoryCreditRepository {
    async fn get_balance(&self, user_id: Uuid, currency: &str) -> Result<i64, AppError> {
        let balances = self.balances.read().await;
        Ok(balances
            .get(&(user_id, currency.to_string()))
            .map(|b| b.balance)
            .unwrap_or(0))
    }

    async fn get_balances(
        &self,
        user_ids: &[Uuid],
        currency: &str,
    ) -> Result<HashMap<Uuid, i64>, AppError> {
        let balances = self.balances.read().await;
        let mut out = HashMap::with_capacity(user_ids.len());
        let currency = currency.to_string();

        for user_id in user_ids {
            if let Some(balance) = balances.get(&(*user_id, currency.clone())) {
                out.insert(*user_id, balance.balance);
            }
        }

        Ok(out)
    }

    async fn get_or_create_balance(
        &self,
        user_id: Uuid,
        currency: &str,
    ) -> Result<CreditBalanceEntity, AppError> {
        let mut balances = self.balances.write().await;
        let key = (user_id, currency.to_string());

        if let Some(balance) = balances.get(&key) {
            return Ok(balance.clone());
        }

        let balance = CreditBalanceEntity {
            id: Uuid::new_v4(),
            user_id,
            balance: 0,
            held_balance: 0,
            currency: currency.to_string(),
            updated_at: Utc::now(),
        };

        balances.insert(key, balance.clone());
        Ok(balance)
    }

    async fn add_credit(
        &self,
        user_id: Uuid,
        amount: i64,
        currency: &str,
        tx: CreditTransactionEntity,
    ) -> Result<i64, AppError> {
        let mut balances = self.balances.write().await;
        let mut transactions = self.transactions.write().await;

        let key = (user_id, currency.to_string());

        let balance = balances.entry(key).or_insert_with(|| CreditBalanceEntity {
            id: Uuid::new_v4(),
            user_id,
            balance: 0,
            held_balance: 0,
            currency: currency.to_string(),
            updated_at: Utc::now(),
        });

        balance.balance += amount;
        balance.updated_at = Utc::now();

        transactions.push(tx);

        Ok(balance.balance)
    }

    async fn deduct_credit(
        &self,
        user_id: Uuid,
        amount: i64,
        currency: &str,
        tx: CreditTransactionEntity,
    ) -> Result<i64, AppError> {
        let mut balances = self.balances.write().await;
        let mut transactions = self.transactions.write().await;

        let key = (user_id, currency.to_string());

        let balance = balances
            .get_mut(&key)
            .ok_or_else(|| AppError::Validation("Insufficient credit balance".into()))?;

        // Check available balance (total - held)
        let available = balance.available();
        if available < amount {
            return Err(AppError::Validation(format!(
                "Insufficient credit balance: available {}, need {} (total: {}, held: {})",
                available, amount, balance.balance, balance.held_balance
            )));
        }

        balance.balance -= amount;
        balance.updated_at = Utc::now();

        transactions.push(tx);

        Ok(balance.balance)
    }

    async fn get_transactions(
        &self,
        user_id: Uuid,
        currency: Option<&str>,
        tx_type: Option<&str>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<CreditTransactionEntity>, AppError> {
        let limit = cap_limit(limit);
        let offset = cap_offset(offset);

        let transactions = self.transactions.read().await;
        let mut filtered: Vec<_> = transactions
            .iter()
            .filter(|t| {
                t.user_id == user_id
                    && currency.map_or(true, |c| t.currency == c)
                    && tx_type.map_or(true, |tt| t.tx_type.as_str() == tt)
            })
            .cloned()
            .collect();

        // Sort by created_at descending (newest first)
        filtered.sort_by(|a, b| b.created_at.cmp(&a.created_at));

        Ok(filtered
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_transactions(
        &self,
        user_id: Uuid,
        currency: Option<&str>,
        tx_type: Option<&str>,
    ) -> Result<u64, AppError> {
        let transactions = self.transactions.read().await;
        Ok(transactions
            .iter()
            .filter(|t| {
                t.user_id == user_id
                    && currency.map_or(true, |c| t.currency == c)
                    && tx_type.map_or(true, |tt| t.tx_type.as_str() == tt)
            })
            .count() as u64)
    }

    async fn get_stats(&self) -> Result<CreditStats, AppError> {
        let balances = self.balances.read().await;
        let transactions = self.transactions.read().await;

        let mut stats = CreditStats::default();

        // Count unique users with balance
        let users: std::collections::HashSet<_> = balances.keys().map(|(uid, _)| *uid).collect();
        stats.total_users_with_balance = users.len() as u64;

        // Sum all balances
        stats.total_outstanding_lamports = balances.values().map(|b| b.balance).sum();

        // Process transactions by currency
        for tx in transactions.iter() {
            let currency_stats = match tx.currency.to_uppercase().as_str() {
                "SOL" => &mut stats.sol,
                "USD" => &mut stats.usd,
                _ => continue, // Skip unknown currencies
            };

            match tx.tx_type {
                CreditTxType::Deposit => {
                    currency_stats.deposit_count += 1;
                    currency_stats.total_credited += tx.amount;
                }
                CreditTxType::Spend => {
                    currency_stats.spend_count += 1;
                    currency_stats.total_spent += tx.amount.abs();
                }
                CreditTxType::Adjustment => {
                    currency_stats.adjustment_count += 1;
                    if tx.amount >= 0 {
                        currency_stats.total_positive_adjustments += tx.amount;
                    } else {
                        currency_stats.total_negative_adjustments += tx.amount.abs();
                    }
                }
            }
        }

        // Calculate current outstanding for each currency
        for ((_user_id, currency), balance) in balances.iter() {
            let currency_stats = match currency.to_uppercase().as_str() {
                "SOL" => &mut stats.sol,
                "USD" => &mut stats.usd,
                _ => continue,
            };
            currency_stats.current_outstanding += balance.balance;
        }

        Ok(stats)
    }

    async fn get_user_stats(
        &self,
        user_id: Uuid,
        currency: &str,
    ) -> Result<UserCreditStats, AppError> {
        let balances = self.balances.read().await;
        let transactions = self.transactions.read().await;

        let mut stats = UserCreditStats {
            currency: currency.to_string(),
            ..Default::default()
        };

        // Get current balance
        if let Some(balance) = balances.get(&(user_id, currency.to_string())) {
            stats.current_balance = balance.balance;
        }

        // Process user's transactions for this currency
        for tx in transactions.iter() {
            if tx.user_id != user_id || tx.currency.to_uppercase() != currency.to_uppercase() {
                continue;
            }

            match tx.tx_type {
                CreditTxType::Deposit => {
                    stats.deposit_count += 1;
                    stats.total_deposited += tx.amount;
                }
                CreditTxType::Spend => {
                    stats.spend_count += 1;
                    stats.total_spent += tx.amount.abs();
                }
                CreditTxType::Adjustment => {
                    if tx.amount > 0 {
                        stats.total_refunds += tx.amount;
                    }
                }
            }
        }

        Ok(stats)
    }

    async fn get_all_balances(&self, user_id: Uuid) -> Result<Vec<CreditBalanceEntity>, AppError> {
        let balances = self.balances.read().await;
        Ok(balances
            .iter()
            .filter(|((uid, _), _)| *uid == user_id)
            .map(|(_, b)| b.clone())
            .collect())
    }

    async fn find_transaction_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<CreditTransactionEntity>, AppError> {
        let transactions = self.transactions.read().await;
        Ok(transactions.iter().find(|t| t.id == id).cloned())
    }

    async fn find_transaction_by_idempotency_key(
        &self,
        user_id: Uuid,
        idempotency_key: &str,
    ) -> Result<Option<CreditTransactionEntity>, AppError> {
        let transactions = self.transactions.read().await;
        Ok(transactions
            .iter()
            .find(|t| {
                t.user_id == user_id
                    && t.idempotency_key
                        .as_deref()
                        .map(|k| k == idempotency_key)
                        .unwrap_or(false)
            })
            .cloned())
    }

    async fn sum_positive_adjustments_by_reference(
        &self,
        user_id: Uuid,
        currency: &str,
        reference_type: &str,
        reference_id: Uuid,
    ) -> Result<i64, AppError> {
        let transactions = self.transactions.read().await;
        let sum = transactions
            .iter()
            .filter(|t| {
                t.user_id == user_id
                    && t.tx_type == CreditTxType::Adjustment
                    && t.amount > 0
                    && t.currency.eq_ignore_ascii_case(currency)
                    && t.reference_type
                        .as_deref()
                        .map(|rt| rt == reference_type)
                        .unwrap_or(false)
                    && t.reference_id == Some(reference_id)
            })
            .map(|t| t.amount)
            .sum();
        Ok(sum)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_balance_empty() {
        let repo = InMemoryCreditRepository::new();
        let user_id = Uuid::new_v4();

        let balance = repo.get_balance(user_id, "SOL").await.unwrap();
        assert_eq!(balance, 0);
    }

    #[tokio::test]
    async fn test_add_credit() {
        let repo = InMemoryCreditRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let note_id = Uuid::new_v4();

        let tx = CreditTransactionEntity::new_deposit(user_id, 1000000, "SOL", session_id, note_id);
        let new_balance = repo.add_credit(user_id, 1000000, "SOL", tx).await.unwrap();

        assert_eq!(new_balance, 1000000);

        let balance = repo.get_balance(user_id, "SOL").await.unwrap();
        assert_eq!(balance, 1000000);
    }

    #[tokio::test]
    async fn test_get_balances_returns_existing_users() {
        let repo = InMemoryCreditRepository::new();
        let user_a = Uuid::new_v4();
        let user_b = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let note_id = Uuid::new_v4();

        let tx = CreditTransactionEntity::new_deposit(user_a, 500, "SOL", session_id, note_id);
        repo.add_credit(user_a, 500, "SOL", tx).await.unwrap();

        let balances = repo.get_balances(&[user_a, user_b], "SOL").await.unwrap();
        assert_eq!(balances.get(&user_a), Some(&500));
        assert!(!balances.contains_key(&user_b));
    }

    #[tokio::test]
    async fn test_get_balances_empty_input() {
        let repo = InMemoryCreditRepository::new();
        let balances = repo.get_balances(&[], "SOL").await.unwrap();
        assert!(balances.is_empty());
    }

    #[tokio::test]
    async fn test_deduct_credit() {
        let repo = InMemoryCreditRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let note_id = Uuid::new_v4();

        // Add credit first
        let add_tx =
            CreditTransactionEntity::new_deposit(user_id, 1000000, "SOL", session_id, note_id);
        repo.add_credit(user_id, 1000000, "SOL", add_tx)
            .await
            .unwrap();

        // Deduct credit
        let spend_tx = CreditTransactionEntity::new_spend(user_id, 300000, "SOL", None);
        let new_balance = repo
            .deduct_credit(user_id, 300000, "SOL", spend_tx)
            .await
            .unwrap();

        assert_eq!(new_balance, 700000);
    }

    #[tokio::test]
    async fn test_deduct_insufficient_balance() {
        let repo = InMemoryCreditRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let note_id = Uuid::new_v4();

        // Add credit first
        let add_tx =
            CreditTransactionEntity::new_deposit(user_id, 1000000, "SOL", session_id, note_id);
        repo.add_credit(user_id, 1000000, "SOL", add_tx)
            .await
            .unwrap();

        // Try to deduct more than balance
        let spend_tx = CreditTransactionEntity::new_spend(user_id, 2000000, "SOL", None);
        let result = repo.deduct_credit(user_id, 2000000, "SOL", spend_tx).await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_transaction_history() {
        let repo = InMemoryCreditRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let note_id = Uuid::new_v4();

        // Add multiple transactions
        let tx1 =
            CreditTransactionEntity::new_deposit(user_id, 1000000, "SOL", session_id, note_id);
        repo.add_credit(user_id, 1000000, "SOL", tx1).await.unwrap();

        let tx2 = CreditTransactionEntity::new_spend(user_id, 100000, "SOL", None);
        repo.deduct_credit(user_id, 100000, "SOL", tx2)
            .await
            .unwrap();

        let transactions = repo
            .get_transactions(user_id, Some("SOL"), None, 10, 0)
            .await
            .unwrap();
        assert_eq!(transactions.len(), 2);

        let count = repo
            .count_transactions(user_id, Some("SOL"), None)
            .await
            .unwrap();
        assert_eq!(count, 2);
    }

    #[tokio::test]
    async fn test_transaction_history_caps_limit() {
        use crate::repositories::pagination::DEFAULT_MAX_PAGE_SIZE;

        let repo = InMemoryCreditRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let note_id = Uuid::new_v4();

        for _ in 0..(DEFAULT_MAX_PAGE_SIZE + 10) {
            let tx = CreditTransactionEntity::new_deposit(user_id, 1, "SOL", session_id, note_id);
            repo.add_credit(user_id, 1, "SOL", tx).await.unwrap();
        }

        let transactions = repo
            .get_transactions(user_id, Some("SOL"), None, 10_000, 0)
            .await
            .unwrap();
        assert_eq!(transactions.len() as u32, DEFAULT_MAX_PAGE_SIZE);
    }
}
