//! Custom role management handlers

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::{AppError, ERR_ADMIN_REQUIRED, ERR_NOT_A_MEMBER};
use crate::models::MessageResponse;
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::repositories::{AuditEventType, CustomRole, OrgRole};
use crate::services::{EmailService, Permission};
use crate::utils::authenticate;
use crate::AppState;

/// Request to create a custom role
#[derive(Debug, Deserialize)]
pub struct CreateCustomRoleRequest {
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
    pub permissions: Vec<String>,
}

/// Request to update a custom role
#[derive(Debug, Deserialize)]
pub struct UpdateCustomRoleRequest {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub permissions: Option<Vec<String>>,
}

/// Response for a custom role
#[derive(Debug, Serialize)]
pub struct CustomRoleResponse {
    pub id: Uuid,
    pub org_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub permissions: Vec<String>,
    pub is_default: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl From<CustomRole> for CustomRoleResponse {
    fn from(role: CustomRole) -> Self {
        Self {
            id: role.id,
            org_id: role.org_id,
            name: role.name,
            description: role.description,
            permissions: role.permissions.into_iter().collect(),
            is_default: role.is_default,
            created_at: role.created_at.to_rfc3339(),
            updated_at: role.updated_at.to_rfc3339(),
        }
    }
}

/// Response for listing custom roles
#[derive(Debug, Serialize)]
pub struct ListCustomRolesResponse {
    pub roles: Vec<CustomRoleResponse>,
    pub total: usize,
}

#[derive(Debug, Deserialize)]
pub struct ListCustomRolesQueryParams {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    50
}

/// H-09: Validate permission strings and convert to HashSet
fn validate_permissions(permissions: Vec<String>) -> Result<HashSet<String>, AppError> {
    let perms: HashSet<String> = permissions.into_iter().collect();
    for perm in &perms {
        if Permission::from_str(perm).is_none() {
            return Err(AppError::Validation(format!(
                "Invalid permission: {}",
                perm
            )));
        }
    }
    Ok(perms)
}

/// Helper to verify user has admin access to org
async fn verify_org_admin<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
    org_id: Uuid,
) -> Result<Uuid, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(state, headers).await?;

    // Verify membership and role
    let membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(ERR_NOT_A_MEMBER.into()))?;

    // Only owners and admins can manage custom roles
    if !membership.role.has_at_least(OrgRole::Admin) {
        return Err(AppError::Forbidden(ERR_ADMIN_REQUIRED.into()));
    }

    Ok(auth.user_id)
}

/// GET /orgs/:org_id/roles - List custom roles for an organization
pub async fn list_custom_roles<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
    Query(params): Query<ListCustomRolesQueryParams>,
) -> Result<Json<ListCustomRolesResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Verify membership
    state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(ERR_NOT_A_MEMBER.into()))?;

    let limit = cap_limit(params.limit);
    let offset = cap_offset(params.offset);
    let (roles_result, total_result) = tokio::join!(
        state
            .custom_role_repo
            .find_by_org_paged(org_id, limit, offset),
        state.custom_role_repo.count_by_org(org_id)
    );
    let roles = roles_result?;
    let total = total_result?;

    Ok(Json(ListCustomRolesResponse {
        roles: roles.into_iter().map(CustomRoleResponse::from).collect(),
        total: total as usize,
    }))
}

/// POST /orgs/:org_id/roles - Create a custom role
pub async fn create_custom_role<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
    Json(req): Json<CreateCustomRoleRequest>,
) -> Result<Json<CustomRoleResponse>, AppError> {
    let user_id = verify_org_admin(&state, &headers, org_id).await?;

    // H-09: Validate permissions using shared helper
    let permissions = validate_permissions(req.permissions)?;

    let mut role = CustomRole::new(org_id, &req.name, permissions);
    role.description = req.description;

    let created = state.custom_role_repo.create(role).await?;

    // Log audit event
    let _ = state
        .audit_service
        .log_org_event(
            AuditEventType::CustomRoleCreated,
            user_id,
            org_id,
            Some(&headers),
        )
        .await;

    Ok(Json(CustomRoleResponse::from(created)))
}

/// GET /orgs/:org_id/roles/:role_id - Get a custom role
pub async fn get_custom_role<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path((org_id, role_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<CustomRoleResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Verify membership
    state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(ERR_NOT_A_MEMBER.into()))?;

    let role = state
        .custom_role_repo
        .find_by_id(role_id)
        .await?
        .ok_or(AppError::NotFound("Role not found".into()))?;

    if role.org_id != org_id {
        return Err(AppError::NotFound("Role not found".into()));
    }

    Ok(Json(CustomRoleResponse::from(role)))
}

/// PATCH /orgs/:org_id/roles/:role_id - Update a custom role
pub async fn update_custom_role<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path((org_id, role_id)): Path<(Uuid, Uuid)>,
    Json(req): Json<UpdateCustomRoleRequest>,
) -> Result<Json<CustomRoleResponse>, AppError> {
    let user_id = verify_org_admin(&state, &headers, org_id).await?;

    let mut role = state
        .custom_role_repo
        .find_by_id(role_id)
        .await?
        .ok_or(AppError::NotFound("Role not found".into()))?;

    if role.org_id != org_id {
        return Err(AppError::NotFound("Role not found".into()));
    }

    // Update fields
    if let Some(name) = req.name {
        role.name = name;
    }
    if let Some(description) = req.description {
        role.description = Some(description);
    }
    // H-09: Validate permissions using shared helper
    if let Some(permissions) = req.permissions {
        role.permissions = validate_permissions(permissions)?;
    }

    let updated = state.custom_role_repo.update(role).await?;

    // Log audit event
    let _ = state
        .audit_service
        .log_org_event(
            AuditEventType::CustomRoleUpdated,
            user_id,
            org_id,
            Some(&headers),
        )
        .await;

    Ok(Json(CustomRoleResponse::from(updated)))
}

/// DELETE /orgs/:org_id/roles/:role_id - Delete a custom role
pub async fn delete_custom_role<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path((org_id, role_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<MessageResponse>, AppError> {
    let user_id = verify_org_admin(&state, &headers, org_id).await?;

    let role = state
        .custom_role_repo
        .find_by_id(role_id)
        .await?
        .ok_or(AppError::NotFound("Role not found".into()))?;

    if role.org_id != org_id {
        return Err(AppError::NotFound("Role not found".into()));
    }

    state.custom_role_repo.delete(role_id).await?;

    // Log audit event
    let _ = state
        .audit_service
        .log_org_event(
            AuditEventType::CustomRoleDeleted,
            user_id,
            org_id,
            Some(&headers),
        )
        .await;

    Ok(Json(MessageResponse {
        message: "Role deleted successfully".into(),
    }))
}

/// POST /orgs/:org_id/roles/:role_id/default - Set a role as default
pub async fn set_default_role<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path((org_id, role_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<MessageResponse>, AppError> {
    verify_org_admin(&state, &headers, org_id).await?;

    // Verify role exists and belongs to org
    let role = state
        .custom_role_repo
        .find_by_id(role_id)
        .await?
        .ok_or(AppError::NotFound("Role not found".into()))?;

    if role.org_id != org_id {
        return Err(AppError::NotFound("Role not found".into()));
    }

    state
        .custom_role_repo
        .set_default_role(org_id, role_id)
        .await?;

    Ok(Json(MessageResponse {
        message: "Default role updated successfully".into(),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_role_request_deserialize() {
        let json = r#"{
            "name": "Developer",
            "description": "Engineering role",
            "permissions": ["member.read", "org.read"]
        }"#;
        let req: CreateCustomRoleRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "Developer");
        assert_eq!(req.description, Some("Engineering role".to_string()));
        assert_eq!(req.permissions.len(), 2);
    }

    #[test]
    fn test_update_role_request_partial() {
        let json = r#"{"name": "Senior Developer"}"#;
        let req: UpdateCustomRoleRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, Some("Senior Developer".to_string()));
        assert!(req.description.is_none());
        assert!(req.permissions.is_none());
    }

    #[test]
    fn test_list_custom_roles_query_defaults() {
        let params: ListCustomRolesQueryParams = serde_json::from_str("{}").unwrap();
        assert_eq!(params.limit, 50);
        assert_eq!(params.offset, 0);
    }
}
