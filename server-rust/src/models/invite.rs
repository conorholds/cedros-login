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
    pub email: String,
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
            role: invite.role.as_str().to_string(),
            invited_by: invite.invited_by,
            created_at: invite.created_at,
            expires_at: invite.expires_at,
            accepted_at: invite.accepted_at,
        }
    }
}

/// Create invite request
#[derive(Debug, Clone, Deserialize)]
pub struct CreateInviteRequest {
    pub email: String,
    #[serde(default = "default_role")]
    pub role: String,
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
