//! Audit-related models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Audit log entry response for API
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogResponse {
    pub id: Uuid,
    pub event_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor_user_id: Option<Uuid>,
    /// Session ID for forensic correlation
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
    /// Filter by session ID for forensic correlation
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
