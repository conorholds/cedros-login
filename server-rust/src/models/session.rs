//! Session-related models

use chrono::{DateTime, Utc};
use serde::Serialize;
use uuid::Uuid;

use crate::repositories::SessionEntity;

/// Session response for API
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionResponse {
    pub id: Uuid,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub is_current: bool,
}

impl SessionResponse {
    pub fn from_entity(entity: &SessionEntity, current_session_id: Uuid) -> Self {
        Self {
            id: entity.id,
            ip_address: entity.ip_address.clone(),
            user_agent: entity.user_agent.clone(),
            created_at: entity.created_at,
            expires_at: entity.expires_at,
            is_current: entity.id == current_session_id,
        }
    }
}

/// Response for listing sessions
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListSessionsResponse {
    pub sessions: Vec<SessionResponse>,
    pub total: usize,
    pub limit: u32,
    pub offset: u32,
}

/// Response for revoking all sessions
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RevokeAllSessionsResponse {
    pub revoked_count: usize,
    pub message: String,
}
