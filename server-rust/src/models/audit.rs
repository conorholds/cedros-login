//! Audit-related models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::repositories::{AuditEventType, AuditLogEntry};

/// Audit log entry response for API
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogResponse {
    pub id: Uuid,
    pub event_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor_user_id: Option<Uuid>,
    /// S-23: Session ID for forensic correlation
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<Uuid>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub org_id: Option<Uuid>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_id: Option<Uuid>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ip_address: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_agent: Option<String>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

impl From<&AuditLogEntry> for AuditLogResponse {
    fn from(entry: &AuditLogEntry) -> Self {
        Self {
            id: entry.id,
            event_type: entry.event_type.as_str().to_string(),
            actor_user_id: entry.actor_user_id,
            session_id: entry.session_id,
            org_id: entry.org_id,
            target_type: entry.target_type.clone(),
            target_id: entry.target_id,
            ip_address: entry.ip_address.clone(),
            user_agent: entry.user_agent.clone(),
            metadata: entry.metadata.clone(),
            created_at: entry.created_at,
        }
    }
}

/// Response for listing audit logs
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListAuditLogsResponse {
    pub logs: Vec<AuditLogResponse>,
    pub total: usize,
}

/// Query parameters for audit log listing
#[derive(Debug, Clone, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogQueryParams {
    #[serde(default)]
    pub event_type: Option<String>,
    #[serde(default)]
    pub actor_user_id: Option<Uuid>,
    /// S-23: Filter by session ID for forensic correlation
    #[serde(default)]
    pub session_id: Option<Uuid>,
    /// Filter by target type (e.g., "user", "org", "session")
    #[serde(default)]
    pub target_type: Option<String>,
    /// Filter by target ID
    #[serde(default)]
    pub target_id: Option<Uuid>,
    #[serde(default)]
    pub limit: Option<u32>,
    #[serde(default)]
    pub offset: Option<u32>,
}

impl AuditLogQueryParams {
    pub fn to_query(&self, org_id: Option<Uuid>) -> crate::repositories::AuditLogQuery {
        crate::repositories::AuditLogQuery {
            org_id,
            event_type: self
                .event_type
                .as_ref()
                .and_then(|s| AuditEventType::from_str(s)),
            actor_user_id: self.actor_user_id,
            session_id: self.session_id,
            target_type: self.target_type.clone(),
            target_id: self.target_id,
            limit: self.limit,
            offset: self.offset,
        }
    }
}
