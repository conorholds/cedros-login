//! Invite data models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::repositories::InviteEntity;

/// Invite response (excludes token_hash for security)
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InviteResponse {
    pub id: Uuid,
    pub org_id: Uuid,
    /// Email address (if email-based invite)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    /// Solana wallet address (if wallet-based invite)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wallet_address: Option<String>,
    pub role: String,
    pub invited_by: Uuid,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub accepted_at: Option<DateTime<Utc>>,
}

impl InviteResponse {
    /// Create from entity
    pub fn from_entity(invite: &InviteEntity) -> Self {
        Self {
            id: invite.id,
            org_id: invite.org_id,
            email: invite.email.clone(),
            wallet_address: invite.wallet_address.clone(),
            role: invite.role.as_str().to_string(),
            invited_by: invite.invited_by,
            created_at: invite.created_at,
            expires_at: invite.expires_at,
            accepted_at: invite.accepted_at,
        }
    }
}

/// Create invite request
///
/// Either `email` or `wallet_address` must be provided (but not both).
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateInviteRequest {
    /// Email address to invite (mutually exclusive with wallet_address)
    #[serde(default)]
    pub email: Option<String>,
    /// Solana wallet address to invite (mutually exclusive with email)
    #[serde(default)]
    pub wallet_address: Option<String>,
    #[serde(default = "default_role")]
    pub role: String,
}

impl CreateInviteRequest {
    /// Validate that exactly one of email or wallet_address is provided
    pub fn validate(&self) -> Result<(), &'static str> {
        match (&self.email, &self.wallet_address) {
            (None, None) => Err("Either email or walletAddress must be provided"),
            (Some(_), Some(_)) => Err("Cannot specify both email and walletAddress"),
            _ => Ok(()),
        }
    }

    /// Check if this is a wallet-based invite
    pub fn is_wallet_invite(&self) -> bool {
        self.wallet_address.is_some()
    }
}

fn default_role() -> String {
    "member".to_string()
}

/// Accept invite request
#[derive(Debug, Clone, Deserialize)]
pub struct AcceptInviteRequest {
    pub token: String,
}

/// Accept invite response
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AcceptInviteResponse {
    pub org_id: Uuid,
    pub org_name: String,
    pub role: String,
}

/// List invites response
#[derive(Debug, Clone, Serialize)]
pub struct ListInvitesResponse {
    pub invites: Vec<InviteResponse>,
    pub total: u64,
}

/// Invite with token response (only returned on create/resend)
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InviteWithTokenResponse {
    #[serde(flatten)]
    pub invite: InviteResponse,
    /// The invite token (only shown once)
    pub token: String,
}
