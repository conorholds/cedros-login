//! Organization data models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Organization response
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrgResponse {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logo_url: Option<String>,
    pub is_personal: bool,
    pub role: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create organization request
#[derive(Debug, Clone, Deserialize)]
pub struct CreateOrgRequest {
    pub name: String,
    #[serde(default)]
    pub slug: Option<String>,
}

/// Update organization request
#[derive(Debug, Clone, Deserialize)]
pub struct UpdateOrgRequest {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub slug: Option<String>,
    #[serde(default, rename = "logoUrl")]
    pub logo_url: Option<String>,
}

/// List organizations response
#[derive(Debug, Clone, Serialize)]
pub struct ListOrgsResponse {
    pub orgs: Vec<OrgResponse>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

/// Member response
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MemberResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub role: String,
    pub joined_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

/// Update member role request
#[derive(Debug, Clone, Deserialize)]
pub struct UpdateMemberRoleRequest {
    pub role: String,
}

/// List members response
#[derive(Debug, Clone, Serialize)]
pub struct ListMembersResponse {
    pub members: Vec<MemberResponse>,
    pub total: u64,
}
