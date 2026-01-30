//! Organization data models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::repositories::{MembershipEntity, OrgEntity, OrgRole};

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

impl OrgResponse {
    /// Create from entity with role
    pub fn from_entity(org: &OrgEntity, role: OrgRole) -> Self {
        Self {
            id: org.id,
            name: org.name.clone(),
            slug: org.slug.clone(),
            logo_url: org.logo_url.clone(),
            is_personal: org.is_personal,
            role: role.as_str().to_string(),
            created_at: org.created_at,
            updated_at: org.updated_at,
        }
    }
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

impl MemberResponse {
    /// Create from membership entity with optional user details
    pub fn from_membership(
        membership: &MembershipEntity,
        email: Option<String>,
        name: Option<String>,
    ) -> Self {
        Self {
            id: membership.id,
            user_id: membership.user_id,
            role: membership.role.as_str().to_string(),
            joined_at: membership.joined_at,
            email,
            name,
        }
    }
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
