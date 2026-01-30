//! Credit system types and DTOs
//!
//! Contains data transfer objects for the credit service, including:
//! - Balance representations
//! - Transaction history items
//! - Operation results (spend, hold, adjust)

use uuid::Uuid;

use crate::repositories::{CreditBalanceEntity, CreditTransactionEntity};

/// Credit balance with formatted display
#[derive(Debug)]
pub struct CreditBalance {
    /// Total balance in lamports
    pub balance_lamports: i64,
    /// Credits reserved by pending holds
    pub held_lamports: i64,
    /// Available balance (total - held)
    pub available_lamports: i64,
    /// Currency (e.g., "SOL")
    pub currency: String,
    /// User-friendly display (e.g., "0.5 SOL")
    pub display: String,
}

impl CreditBalance {
    pub(crate) fn from_entity(entity: CreditBalanceEntity) -> Self {
        let available = entity.available();
        let sol_amount = available as f64 / 1_000_000_000.0;
        Self {
            balance_lamports: entity.balance,
            held_lamports: entity.held_balance,
            available_lamports: available,
            currency: entity.currency,
            display: format!("{:.4} SOL", sol_amount),
        }
    }
}

/// Credit transaction history item
#[derive(Debug)]
pub struct CreditHistoryItem {
    pub id: Uuid,
    pub amount_lamports: i64,
    pub currency: String,
    pub tx_type: String,
    pub deposit_session_id: Option<Uuid>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

impl From<CreditTransactionEntity> for CreditHistoryItem {
    fn from(entity: CreditTransactionEntity) -> Self {
        Self {
            id: entity.id,
            amount_lamports: entity.amount,
            currency: entity.currency,
            tx_type: entity.tx_type.as_str().to_string(),
            deposit_session_id: entity.deposit_session_id,
            created_at: entity.created_at,
        }
    }
}

/// Paginated transaction history
pub struct CreditHistory {
    pub items: Vec<CreditHistoryItem>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

/// Result of a spend operation
#[derive(Debug)]
pub struct SpendResult {
    /// Transaction ID
    pub transaction_id: Uuid,
    /// New balance after spend
    pub new_balance_lamports: i64,
    /// Amount spent
    pub amount_lamports: i64,
}

/// Result of a hold operation
#[derive(Debug)]
pub struct HoldResult {
    /// Hold ID
    pub hold_id: Uuid,
    /// Whether this was a new hold or existing (idempotent)
    pub is_new: bool,
    /// Amount held
    pub amount_lamports: i64,
    /// When the hold expires
    pub expires_at: chrono::DateTime<chrono::Utc>,
}

/// Result of an adjustment operation
#[derive(Debug)]
pub struct AdjustResult {
    /// Transaction ID
    pub transaction_id: Uuid,
    /// New balance after adjustment
    pub new_balance_lamports: i64,
    /// Amount adjusted (positive = credit, negative = debit)
    pub amount_lamports: i64,
}
