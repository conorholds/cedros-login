//! Credit hold repository for two-phase commit spending
//!
//! Holds allow reserving credits before finalizing a purchase.
//! Flow: create_hold -> capture (converts to spend) OR release (cancels)

use async_trait::async_trait;
use chrono::{DateTime, Duration, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Hold status
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HoldStatus {
    /// Hold is active, credits reserved
    Pending,
    /// Hold was converted to a spend
    Captured,
    /// Hold was cancelled, credits released
    Released,
    /// Hold expired without being captured
    Expired,
}

impl HoldStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Captured => "captured",
            Self::Released => "released",
            Self::Expired => "expired",
        }
    }

    #[allow(clippy::should_implement_trait)]
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "pending" => Some(Self::Pending),
            "captured" => Some(Self::Captured),
            "released" => Some(Self::Released),
            "expired" => Some(Self::Expired),
            _ => None,
        }
    }
}

/// Credit hold entity
#[derive(Debug, Clone)]
pub struct CreditHoldEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub amount: i64,
    pub currency: String,
    pub idempotency_key: String,
    pub reference_type: Option<String>,
    pub reference_id: Option<Uuid>,
    pub status: HoldStatus,
    pub expires_at: DateTime<Utc>,
    pub metadata: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    /// Transaction ID if captured
    pub captured_transaction_id: Option<Uuid>,
}

impl CreditHoldEntity {
    /// Create a new pending hold
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        user_id: Uuid,
        amount: i64,
        currency: &str,
        idempotency_key: String,
        ttl: Duration,
        reference_type: Option<&str>,
        reference_id: Option<Uuid>,
        metadata: Option<serde_json::Value>,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            user_id,
            amount,
            currency: currency.to_string(),
            idempotency_key,
            reference_type: reference_type.map(String::from),
            reference_id,
            status: HoldStatus::Pending,
            expires_at: now + ttl,
            metadata,
            created_at: now,
            updated_at: now,
            captured_transaction_id: None,
        }
    }

    /// Check if hold is expired
    pub fn is_expired(&self) -> bool {
        self.status == HoldStatus::Pending && Utc::now() > self.expires_at
    }

    /// Check if hold can be captured
    pub fn can_capture(&self) -> bool {
        self.status == HoldStatus::Pending && !self.is_expired()
    }

    /// Check if hold can be released
    pub fn can_release(&self) -> bool {
        self.status == HoldStatus::Pending
    }
}

/// Result of creating a hold
#[derive(Debug)]
pub enum CreateHoldResult {
    /// New hold created
    Created(CreditHoldEntity),
    /// Existing hold found with same idempotency key
    Existing(CreditHoldEntity),
}

impl CreateHoldResult {
    pub fn hold(&self) -> &CreditHoldEntity {
        match self {
            Self::Created(h) | Self::Existing(h) => h,
        }
    }

    pub fn is_new(&self) -> bool {
        matches!(self, Self::Created(_))
    }
}

/// Credit hold repository trait
#[async_trait]
pub trait CreditHoldRepository: Send + Sync {
    /// Create a new hold, reserving credits
    ///
    /// Returns existing hold if idempotency key matches.
    /// Updates held_balance atomically.
    async fn create_hold(&self, hold: CreditHoldEntity) -> Result<CreateHoldResult, AppError>;

    /// Get a hold by ID
    async fn get_hold(&self, hold_id: Uuid) -> Result<Option<CreditHoldEntity>, AppError>;

    /// Get a hold by idempotency key
    async fn get_hold_by_idempotency_key(
        &self,
        user_id: Uuid,
        idempotency_key: &str,
    ) -> Result<Option<CreditHoldEntity>, AppError>;

    /// Capture a hold, converting it to a spend transaction
    ///
    /// Returns the captured transaction ID.
    /// Updates balance and held_balance atomically.
    async fn capture_hold(
        &self,
        hold_id: Uuid,
        transaction_id: Uuid,
    ) -> Result<CreditHoldEntity, AppError>;

    /// Release a hold, returning credits to available balance
    ///
    /// Updates held_balance atomically.
    async fn release_hold(&self, hold_id: Uuid) -> Result<CreditHoldEntity, AppError>;

    /// Get all pending holds for a user
    async fn get_pending_holds(
        &self,
        user_id: Uuid,
        currency: Option<&str>,
    ) -> Result<Vec<CreditHoldEntity>, AppError>;

    /// Expire holds past their expiration time
    ///
    /// Returns number of holds expired.
    async fn expire_holds(&self) -> Result<u64, AppError>;
}

/// In-memory credit hold repository for development/testing
pub struct InMemoryCreditHoldRepository {
    holds: RwLock<HashMap<Uuid, CreditHoldEntity>>,
    /// Reference to balances for updating held_balance
    /// In real impl, this is done atomically in DB
    balances_held: RwLock<HashMap<(Uuid, String), i64>>,
}

impl InMemoryCreditHoldRepository {
    pub fn new() -> Self {
        Self {
            holds: RwLock::new(HashMap::new()),
            balances_held: RwLock::new(HashMap::new()),
        }
    }

    /// Get total held balance for a user (for testing)
    #[allow(dead_code)]
    pub async fn get_held_balance(&self, user_id: Uuid, currency: &str) -> i64 {
        let held = self.balances_held.read().await;
        *held.get(&(user_id, currency.to_string())).unwrap_or(&0)
    }
}

impl Default for InMemoryCreditHoldRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CreditHoldRepository for InMemoryCreditHoldRepository {
    async fn create_hold(&self, hold: CreditHoldEntity) -> Result<CreateHoldResult, AppError> {
        let mut holds = self.holds.write().await;
        let mut balances_held = self.balances_held.write().await;

        // Check for existing hold with same idempotency key
        for existing in holds.values() {
            if existing.user_id == hold.user_id && existing.idempotency_key == hold.idempotency_key
            {
                return Ok(CreateHoldResult::Existing(existing.clone()));
            }
        }

        // Update held balance
        let key = (hold.user_id, hold.currency.clone());
        *balances_held.entry(key).or_insert(0) += hold.amount;

        holds.insert(hold.id, hold.clone());
        Ok(CreateHoldResult::Created(hold))
    }

    async fn get_hold(&self, hold_id: Uuid) -> Result<Option<CreditHoldEntity>, AppError> {
        let holds = self.holds.read().await;
        Ok(holds.get(&hold_id).cloned())
    }

    async fn get_hold_by_idempotency_key(
        &self,
        user_id: Uuid,
        idempotency_key: &str,
    ) -> Result<Option<CreditHoldEntity>, AppError> {
        let holds = self.holds.read().await;
        Ok(holds
            .values()
            .find(|h| h.user_id == user_id && h.idempotency_key == idempotency_key)
            .cloned())
    }

    async fn capture_hold(
        &self,
        hold_id: Uuid,
        transaction_id: Uuid,
    ) -> Result<CreditHoldEntity, AppError> {
        let mut holds = self.holds.write().await;
        let mut balances_held = self.balances_held.write().await;

        let hold = holds
            .get_mut(&hold_id)
            .ok_or_else(|| AppError::NotFound(format!("Hold {} not found", hold_id)))?;

        if !hold.can_capture() {
            if hold.is_expired() {
                return Err(AppError::Validation("Hold has expired".into()));
            }
            return Err(AppError::Validation(format!(
                "Hold cannot be captured, status: {}",
                hold.status.as_str()
            )));
        }

        // Update hold status
        hold.status = HoldStatus::Captured;
        hold.captured_transaction_id = Some(transaction_id);
        hold.updated_at = Utc::now();

        // Release held balance (actual debit happens in credit_repository)
        let key = (hold.user_id, hold.currency.clone());
        if let Some(held) = balances_held.get_mut(&key) {
            *held = (*held - hold.amount).max(0);
        }

        Ok(hold.clone())
    }

    async fn release_hold(&self, hold_id: Uuid) -> Result<CreditHoldEntity, AppError> {
        let mut holds = self.holds.write().await;
        let mut balances_held = self.balances_held.write().await;

        let hold = holds
            .get_mut(&hold_id)
            .ok_or_else(|| AppError::NotFound(format!("Hold {} not found", hold_id)))?;

        if !hold.can_release() {
            return Err(AppError::Validation(format!(
                "Hold cannot be released, status: {}",
                hold.status.as_str()
            )));
        }

        // Update hold status
        hold.status = HoldStatus::Released;
        hold.updated_at = Utc::now();

        // Release held balance
        let key = (hold.user_id, hold.currency.clone());
        if let Some(held) = balances_held.get_mut(&key) {
            *held = (*held - hold.amount).max(0);
        }

        Ok(hold.clone())
    }

    async fn get_pending_holds(
        &self,
        user_id: Uuid,
        currency: Option<&str>,
    ) -> Result<Vec<CreditHoldEntity>, AppError> {
        let holds = self.holds.read().await;
        Ok(holds
            .values()
            .filter(|h| {
                h.user_id == user_id
                    && h.status == HoldStatus::Pending
                    && currency.map_or(true, |c| h.currency == c)
            })
            .cloned()
            .collect())
    }

    async fn expire_holds(&self) -> Result<u64, AppError> {
        let mut holds = self.holds.write().await;
        let mut balances_held = self.balances_held.write().await;
        let now = Utc::now();
        let mut count = 0u64;

        for hold in holds.values_mut() {
            if hold.status == HoldStatus::Pending && now > hold.expires_at {
                // Log for audit trail before updating
                tracing::info!(
                    hold_id = %hold.id,
                    user_id = %hold.user_id,
                    amount_lamports = hold.amount,
                    currency = %hold.currency,
                    reference_type = ?hold.reference_type,
                    reference_id = ?hold.reference_id,
                    expires_at = %hold.expires_at,
                    created_at = %hold.created_at,
                    "Credit hold expired - funds released back to available balance"
                );

                hold.status = HoldStatus::Expired;
                hold.updated_at = now;

                // Release held balance
                let key = (hold.user_id, hold.currency.clone());
                if let Some(held) = balances_held.get_mut(&key) {
                    *held = (*held - hold.amount).max(0);
                }

                count += 1;
            }
        }

        Ok(count)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_hold() {
        let repo = InMemoryCreditHoldRepository::new();
        let user_id = Uuid::new_v4();

        let hold = CreditHoldEntity::new(
            user_id,
            100_000,
            "SOL",
            "order-123".to_string(),
            Duration::minutes(15),
            Some("order"),
            Some(Uuid::new_v4()),
            None,
        );

        let result = repo.create_hold(hold).await.unwrap();
        assert!(result.is_new());
        assert_eq!(result.hold().amount, 100_000);
        assert_eq!(result.hold().status, HoldStatus::Pending);
    }

    #[tokio::test]
    async fn test_idempotent_hold() {
        let repo = InMemoryCreditHoldRepository::new();
        let user_id = Uuid::new_v4();

        let hold1 = CreditHoldEntity::new(
            user_id,
            100_000,
            "SOL",
            "order-123".to_string(),
            Duration::minutes(15),
            None,
            None,
            None,
        );

        let hold2 = CreditHoldEntity::new(
            user_id,
            100_000,
            "SOL",
            "order-123".to_string(), // Same idempotency key
            Duration::minutes(15),
            None,
            None,
            None,
        );

        let result1 = repo.create_hold(hold1).await.unwrap();
        assert!(result1.is_new());

        let result2 = repo.create_hold(hold2).await.unwrap();
        assert!(!result2.is_new()); // Should return existing
        assert_eq!(result1.hold().id, result2.hold().id);
    }

    #[tokio::test]
    async fn test_capture_hold() {
        let repo = InMemoryCreditHoldRepository::new();
        let user_id = Uuid::new_v4();

        let hold = CreditHoldEntity::new(
            user_id,
            100_000,
            "SOL",
            "order-123".to_string(),
            Duration::minutes(15),
            None,
            None,
            None,
        );

        let result = repo.create_hold(hold).await.unwrap();
        let hold_id = result.hold().id;
        let tx_id = Uuid::new_v4();

        let captured = repo.capture_hold(hold_id, tx_id).await.unwrap();
        assert_eq!(captured.status, HoldStatus::Captured);
        assert_eq!(captured.captured_transaction_id, Some(tx_id));
    }

    #[tokio::test]
    async fn test_release_hold() {
        let repo = InMemoryCreditHoldRepository::new();
        let user_id = Uuid::new_v4();

        let hold = CreditHoldEntity::new(
            user_id,
            100_000,
            "SOL",
            "order-123".to_string(),
            Duration::minutes(15),
            None,
            None,
            None,
        );

        let result = repo.create_hold(hold).await.unwrap();
        let hold_id = result.hold().id;

        let released = repo.release_hold(hold_id).await.unwrap();
        assert_eq!(released.status, HoldStatus::Released);
    }

    #[tokio::test]
    async fn test_cannot_capture_released_hold() {
        let repo = InMemoryCreditHoldRepository::new();
        let user_id = Uuid::new_v4();

        let hold = CreditHoldEntity::new(
            user_id,
            100_000,
            "SOL",
            "order-123".to_string(),
            Duration::minutes(15),
            None,
            None,
            None,
        );

        let result = repo.create_hold(hold).await.unwrap();
        let hold_id = result.hold().id;

        // Release the hold
        repo.release_hold(hold_id).await.unwrap();

        // Try to capture - should fail
        let capture_result = repo.capture_hold(hold_id, Uuid::new_v4()).await;
        assert!(capture_result.is_err());
    }
}
