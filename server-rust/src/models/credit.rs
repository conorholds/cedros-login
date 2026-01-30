//! Credit balance and transaction models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::services::{CreditBalance, CreditHistory, CreditHistoryItem, HoldResult, SpendResult};

fn default_currency() -> String {
    "SOL".to_string()
}

// ============================================================================
// Spend Operations
// ============================================================================

/// Request to spend credits (requires API key with system admin)
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpendCreditsRequest {
    /// Amount in lamports (must be positive)
    pub amount_lamports: i64,
    /// Currency (default: "SOL")
    #[serde(default = "default_currency")]
    pub currency: String,
    /// Idempotency key to prevent duplicate charges
    pub idempotency_key: String,
    /// Type of reference (e.g., "order", "subscription")
    pub reference_type: String,
    /// ID of the referenced entity
    pub reference_id: Uuid,
    /// Optional metadata (items, SKUs, etc.)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<serde_json::Value>,
}

/// Response from spend operation
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpendCreditsResponse {
    /// Transaction ID
    pub transaction_id: Uuid,
    /// New balance after spend
    pub new_balance_lamports: i64,
    /// Amount spent
    pub amount_lamports: i64,
    /// Currency
    pub currency: String,
    /// Human-readable display
    pub display: String,
}

impl SpendCreditsResponse {
    pub fn from_result(result: SpendResult, currency: &str) -> Self {
        let display = format_balance(result.new_balance_lamports, currency);
        Self {
            transaction_id: result.transaction_id,
            new_balance_lamports: result.new_balance_lamports,
            amount_lamports: result.amount_lamports,
            currency: currency.to_string(),
            display,
        }
    }
}

// ============================================================================
// Hold Operations
// ============================================================================

/// Request to create a credit hold
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateHoldRequest {
    /// Amount in lamports (must be positive)
    pub amount_lamports: i64,
    /// Currency (default: "SOL")
    #[serde(default = "default_currency")]
    pub currency: String,
    /// Idempotency key (returns existing hold if duplicate)
    pub idempotency_key: String,
    /// Hold duration in minutes (default: 15, max: 60)
    #[serde(default = "default_ttl")]
    pub ttl_minutes: i64,
    /// Type of reference (e.g., "order")
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference_type: Option<String>,
    /// ID of the referenced entity
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference_id: Option<Uuid>,
    /// Optional metadata
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<serde_json::Value>,
}

fn default_ttl() -> i64 {
    15
}

/// Response from creating a hold
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateHoldResponse {
    /// Hold ID (use this to capture or release)
    pub hold_id: Uuid,
    /// Whether this is a new hold (false = idempotent return of existing)
    pub is_new: bool,
    /// Amount held
    pub amount_lamports: i64,
    /// When the hold expires
    pub expires_at: DateTime<Utc>,
    /// Currency
    pub currency: String,
}

impl CreateHoldResponse {
    pub fn from_result(result: HoldResult, currency: &str) -> Self {
        Self {
            hold_id: result.hold_id,
            is_new: result.is_new,
            amount_lamports: result.amount_lamports,
            expires_at: result.expires_at,
            currency: currency.to_string(),
        }
    }
}

/// Response from capturing or releasing a hold
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CaptureHoldResponse {
    /// Transaction ID from the captured spend
    pub transaction_id: Uuid,
    /// New balance after capture
    pub new_balance_lamports: i64,
    /// Amount captured
    pub amount_lamports: i64,
    /// Currency
    pub currency: String,
    /// Human-readable display
    pub display: String,
}

impl CaptureHoldResponse {
    pub fn from_result(result: SpendResult, currency: &str) -> Self {
        let display = format_balance(result.new_balance_lamports, currency);
        Self {
            transaction_id: result.transaction_id,
            new_balance_lamports: result.new_balance_lamports,
            amount_lamports: result.amount_lamports,
            currency: currency.to_string(),
            display,
        }
    }
}

/// Response from releasing a hold
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReleaseHoldResponse {
    /// Indicates the hold was released
    pub released: bool,
    /// Message
    pub message: String,
}

// ============================================================================
// Refund Request Operations
// ============================================================================

/// Request to submit a refund request (user-facing)
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RefundRequestInput {
    /// Amount to refund in lamports
    pub amount_lamports: i64,
    /// Original credit transaction ID to refund
    pub transaction_id: Uuid,
    /// Reason for the refund request
    pub reason: String,
}

/// Response after submitting a refund request
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RefundRequestResponse {
    /// Whether the request was submitted successfully
    pub submitted: bool,
    /// Message to user
    pub message: String,
    /// Refund request ID
    pub request_id: Uuid,
}

// ============================================================================
// Usage Analytics
// ============================================================================

use crate::repositories::UserCreditStats;

/// User credit usage analytics response
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreditUsageResponse {
    /// Total deposited in lamports
    pub total_deposited_lamports: i64,
    /// Total spent in lamports
    pub total_spent_lamports: i64,
    /// Total refunds/bonuses received
    pub total_refunds_lamports: i64,
    /// Current balance in lamports
    pub current_balance_lamports: i64,
    /// Number of deposit transactions
    pub deposit_count: u64,
    /// Number of spend transactions
    pub spend_count: u64,
    /// Currency (e.g., "SOL")
    pub currency: String,
    /// Human-readable displays
    pub total_deposited_display: String,
    pub total_spent_display: String,
    pub current_balance_display: String,
}

impl From<UserCreditStats> for CreditUsageResponse {
    fn from(stats: UserCreditStats) -> Self {
        let display = |lamports: i64, currency: &str| -> String {
            match currency {
                "SOL" => {
                    let sol = lamports as f64 / 1_000_000_000.0;
                    format!("{:.4} SOL", sol)
                }
                _ => format!("{} {}", lamports, currency),
            }
        };

        Self {
            total_deposited_lamports: stats.total_deposited,
            total_spent_lamports: stats.total_spent,
            total_refunds_lamports: stats.total_refunds,
            current_balance_lamports: stats.current_balance,
            deposit_count: stats.deposit_count,
            spend_count: stats.spend_count,
            total_deposited_display: display(stats.total_deposited, &stats.currency),
            total_spent_display: display(stats.total_spent, &stats.currency),
            current_balance_display: display(stats.current_balance, &stats.currency),
            currency: stats.currency,
        }
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

fn format_balance(lamports: i64, currency: &str) -> String {
    match currency {
        "SOL" => {
            let sol = lamports as f64 / 1_000_000_000.0;
            format!("{:.4} SOL", sol)
        }
        "USD" => {
            let usd = lamports as f64 / 1_000_000.0;
            format!("${:.2}", usd)
        }
        _ => format!("{} {}", lamports, currency),
    }
}

// ============================================================================
// Balance and History Models
// ============================================================================

/// Credit balance response
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreditBalanceResponse {
    /// Balance in lamports
    pub balance_lamports: i64,
    /// Currency (e.g., "SOL")
    pub currency: String,
    /// Human-readable balance (e.g., "0.5000 SOL")
    pub display: String,
}

impl From<CreditBalance> for CreditBalanceResponse {
    fn from(balance: CreditBalance) -> Self {
        Self {
            balance_lamports: balance.balance_lamports,
            currency: balance.currency,
            display: balance.display,
        }
    }
}

/// Multiple balances response
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BalancesResponse {
    pub balances: Vec<CreditBalanceResponse>,
}

/// Credit transaction history item
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreditTransactionResponse {
    pub id: Uuid,
    /// Amount in lamports (positive = credit, negative = debit)
    pub amount_lamports: i64,
    pub currency: String,
    /// Transaction type: "deposit", "spend", "adjustment"
    pub tx_type: String,
    /// Human-readable description
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deposit_session_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

impl From<CreditHistoryItem> for CreditTransactionResponse {
    fn from(item: CreditHistoryItem) -> Self {
        let description = match item.tx_type.as_str() {
            "deposit" => "Privacy Cash deposit".to_string(),
            "spend" => "Service usage".to_string(),
            "adjustment" => "Manual adjustment".to_string(),
            _ => format!("Unknown ({})", item.tx_type),
        };

        Self {
            id: item.id,
            amount_lamports: item.amount_lamports,
            currency: item.currency,
            tx_type: item.tx_type,
            description,
            deposit_session_id: item.deposit_session_id,
            created_at: item.created_at,
        }
    }
}

/// Credit history response with pagination
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreditHistoryResponse {
    pub transactions: Vec<CreditTransactionResponse>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

impl From<CreditHistory> for CreditHistoryResponse {
    fn from(history: CreditHistory) -> Self {
        Self {
            transactions: history.items.into_iter().map(Into::into).collect(),
            total: history.total,
            limit: history.limit,
            offset: history.offset,
        }
    }
}

// ============================================================================
// Pending Holds Models
// ============================================================================

use crate::repositories::CreditHoldEntity;

/// A pending credit hold visible to the user
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingHoldResponse {
    pub hold_id: Uuid,
    /// Amount held in lamports
    pub amount_lamports: i64,
    pub currency: String,
    /// When the hold expires
    pub expires_at: DateTime<Utc>,
    /// Type of reference (e.g., "order")
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference_type: Option<String>,
    /// ID of the referenced entity
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

impl From<CreditHoldEntity> for PendingHoldResponse {
    fn from(hold: CreditHoldEntity) -> Self {
        Self {
            hold_id: hold.id,
            amount_lamports: hold.amount,
            currency: hold.currency,
            expires_at: hold.expires_at,
            reference_type: hold.reference_type,
            reference_id: hold.reference_id,
            created_at: hold.created_at,
        }
    }
}

/// Response containing list of pending holds
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingHoldsResponse {
    pub holds: Vec<PendingHoldResponse>,
    /// Total amount held in lamports
    pub total_held_lamports: i64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_balance_response_serialization() {
        let response = CreditBalanceResponse {
            balance_lamports: 1_000_000_000,
            currency: "SOL".to_string(),
            display: "1.0000 SOL".to_string(),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"balanceLamports\":1000000000"));
        assert!(json.contains("\"currency\":\"SOL\""));
        assert!(json.contains("\"display\":\"1.0000 SOL\""));
    }

    #[test]
    fn test_transaction_response_serialization() {
        let response = CreditTransactionResponse {
            id: Uuid::nil(),
            amount_lamports: 500_000_000,
            currency: "SOL".to_string(),
            tx_type: "deposit".to_string(),
            description: "Privacy Cash deposit".to_string(),
            deposit_session_id: Some(Uuid::nil()),
            created_at: Utc::now(),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"txType\":\"deposit\""));
        assert!(json.contains("\"description\":\"Privacy Cash deposit\""));
    }
}
