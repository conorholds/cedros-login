//! Admin-related models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::AuthMethod;
use crate::repositories::{OrgEntity, UserEntity};

/// Query parameters for listing users
#[derive(Debug, Clone, Deserialize)]
pub struct ListUsersQueryParams {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default)]
    pub offset: u32,
}

/// Query parameters for listing orgs
#[derive(Debug, Clone, Deserialize)]
pub struct ListOrgsQueryParams {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    50
}

/// Admin user response (includes more details than regular user)
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUserResponse {
    pub id: Uuid,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    pub email_verified: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub picture: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wallet_address: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub google_id: Option<String>,
    pub auth_methods: Vec<AuthMethod>,
    pub is_system_admin: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_login_at: Option<DateTime<Utc>>,
    /// Credit balance in lamports (only present if credit system is enabled)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub balance_lamports: Option<i64>,
}

impl From<&UserEntity> for AdminUserResponse {
    fn from(entity: &UserEntity) -> Self {
        Self {
            id: entity.id,
            email: entity.email.clone(),
            email_verified: entity.email_verified,
            name: entity.name.clone(),
            picture: entity.picture.clone(),
            wallet_address: entity.wallet_address.clone(),
            google_id: entity.google_id.clone(),
            auth_methods: entity.auth_methods.clone(),
            is_system_admin: entity.is_system_admin,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
            last_login_at: entity.last_login_at,
            balance_lamports: None, // Set separately via with_balance()
        }
    }
}

impl AdminUserResponse {
    /// Add balance information to the response
    pub fn with_balance(mut self, balance: i64) -> Self {
        self.balance_lamports = Some(balance);
        self
    }
}

/// Response for listing users (admin)
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListUsersResponse {
    pub users: Vec<AdminUserResponse>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

/// Admin org response
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminOrgResponse {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logo_url: Option<String>,
    pub is_personal: bool,
    pub owner_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<&OrgEntity> for AdminOrgResponse {
    fn from(entity: &OrgEntity) -> Self {
        Self {
            id: entity.id,
            name: entity.name.clone(),
            slug: entity.slug.clone(),
            logo_url: entity.logo_url.clone(),
            is_personal: entity.is_personal,
            owner_id: entity.owner_id,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        }
    }
}

/// Response for listing orgs (admin)
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListAdminOrgsResponse {
    pub orgs: Vec<AdminOrgResponse>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

/// Request to set system admin status
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetSystemAdminRequest {
    pub is_admin: bool,
}

/// Request to adjust a user's credit balance
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdjustCreditsRequest {
    /// Amount in lamports (positive = credit, negative = debit)
    pub amount_lamports: i64,
    /// Currency (default: "SOL")
    #[serde(default = "default_currency")]
    pub currency: String,
    /// Human-readable reason for the adjustment (required)
    pub reason: String,
    /// Optional reference type (e.g., "refund", "bonus", "promo", "correction")
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference_type: Option<String>,
    /// Optional reference ID for linking to external entity
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference_id: Option<Uuid>,
}

fn default_currency() -> String {
    "SOL".to_string()
}

/// Response for credit adjustment
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdjustCreditsResponse {
    /// Transaction ID for the adjustment
    pub transaction_id: Uuid,
    /// New balance after adjustment
    pub new_balance_lamports: i64,
    /// Amount adjusted (positive = credit, negative = debit)
    pub amount_lamports: i64,
    /// Currency
    pub currency: String,
    /// Human-readable new balance (e.g., "1.5000 SOL")
    pub display: String,
}

// =========================================================================
// Credit Refund Requests (Admin)
// =========================================================================

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListCreditRefundRequestsQueryParams {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default)]
    pub offset: u32,
    /// Optional status filter: "pending", "processed", "rejected"
    pub status: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminCreditRefundRequestResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub original_transaction_id: Uuid,
    pub amount_lamports: i64,
    pub currency: String,
    pub reason: String,
    pub status: String,
    pub created_at: DateTime<Utc>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub processed_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub processed_by: Option<Uuid>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub processed_amount_lamports: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub processed_transaction_id: Option<Uuid>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub processed_reason: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub rejected_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rejected_by: Option<Uuid>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rejected_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListCreditRefundRequestsResponse {
    pub refund_requests: Vec<AdminCreditRefundRequestResponse>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessCreditRefundRequestInput {
    /// Amount to refund in smallest unit (lamports for SOL, micros for USD)
    pub amount_lamports: i64,
    /// Admin reason for processing the refund
    pub reason: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessCreditRefundRequestResponse {
    pub processed: bool,
    pub refund_request_id: Uuid,
    pub processed_transaction_id: Uuid,
    pub processed_amount_lamports: i64,
    pub currency: String,
    pub new_balance_lamports: i64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RejectCreditRefundRequestInput {
    pub reason: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RejectCreditRefundRequestResponse {
    pub rejected: bool,
    pub refund_request_id: Uuid,
}

/// Request to update a user's profile (admin)
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUpdateUserRequest {
    /// New name (optional, omit to keep current)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// New email (optional, omit to keep current)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    /// Whether email is verified (optional, omit to keep current)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email_verified: Option<bool>,
}
