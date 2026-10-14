//! Admin-related models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::AuthMethod;

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
    pub username: Option<String>,
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
    /// User's referral code
    #[serde(skip_serializing_if = "Option::is_none")]
    pub referral_code: Option<String>,
    /// ID of the user who referred this user
    #[serde(skip_serializing_if = "Option::is_none")]
    pub referred_by: Option<Uuid>,
    /// Number of users this user has referred
    #[serde(skip_serializing_if = "Option::is_none")]
    pub referral_count: Option<u64>,
}

impl AdminUserResponse {
    /// Add referral count to the response
    pub fn with_referral_count(mut self, count: u64) -> Self {
        self.referral_count = Some(count);
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
