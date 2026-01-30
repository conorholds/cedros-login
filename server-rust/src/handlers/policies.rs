//! ABAC Policy management handlers

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::{AppError, ERR_ADMIN_REQUIRED};
use crate::models::MessageResponse;
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::repositories::{AbacPolicy, OrgRole, PolicyConditions, PolicyEffect};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// Request to create an ABAC policy
#[derive(Debug, Deserialize)]
pub struct CreatePolicyRequest {
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
    pub permission: String,
    pub conditions: PolicyConditions,
    pub effect: PolicyEffect,
    #[serde(default)]
    pub priority: i32,
}

/// Request to update an ABAC policy
#[derive(Debug, Deserialize)]
pub struct UpdatePolicyRequest {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub permission: Option<String>,
    #[serde(default)]
    pub conditions: Option<PolicyConditions>,
    #[serde(default)]
    pub effect: Option<PolicyEffect>,
    #[serde(default)]
    pub priority: Option<i32>,
    #[serde(default)]
    pub enabled: Option<bool>,
}

/// Response for a policy
#[derive(Debug, Serialize)]
pub struct PolicyResponse {
    pub id: Uuid,
    pub org_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub permission: String,
    pub conditions: PolicyConditions,
    pub effect: PolicyEffect,
    pub priority: i32,
    pub enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl From<AbacPolicy> for PolicyResponse {
    fn from(policy: AbacPolicy) -> Self {
        Self {
            id: policy.id,
            org_id: policy.org_id,
            name: policy.name,
            description: policy.description,
            permission: policy.permission,
            conditions: policy.conditions,
            effect: policy.effect,
            priority: policy.priority,
            enabled: policy.enabled,
            created_at: policy.created_at.to_rfc3339(),
            updated_at: policy.updated_at.to_rfc3339(),
        }
    }
}

/// Response for listing policies
#[derive(Debug, Serialize)]
pub struct ListPoliciesResponse {
    pub policies: Vec<PolicyResponse>,
    pub total: usize,
}

#[derive(Debug, Deserialize)]
pub struct ListPoliciesQueryParams {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    50
}

/// Helper to verify user has admin access to org
async fn verify_org_admin<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
    org_id: Uuid,
) -> Result<Uuid, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(state, headers).await?;

    // M-02: Check membership first (common case) to avoid user fetch
    if let Some(membership) = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
    {
        if membership.role.has_at_least(OrgRole::Admin) {
            return Ok(auth.user_id);
        }
    }

    // Fall back to system admin check (only fetch user if membership didn't pass)
    if let Some(user) = state.user_repo.find_by_id(auth.user_id).await? {
        if user.is_system_admin {
            return Ok(auth.user_id);
        }
    }

    Err(AppError::Forbidden(ERR_ADMIN_REQUIRED.into()))
}

/// GET /orgs/:org_id/policies - List ABAC policies for an organization
pub async fn list_policies<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
    Query(params): Query<ListPoliciesQueryParams>,
) -> Result<Json<ListPoliciesResponse>, AppError> {
    verify_org_admin(&state, &headers, org_id).await?;

    let limit = cap_limit(params.limit);
    let offset = cap_offset(params.offset);
    let (policies_result, total_result) = tokio::join!(
        state.policy_repo.find_by_org_paged(org_id, limit, offset),
        state.policy_repo.count_by_org(org_id)
    );
    let policies = policies_result?;
    let total = total_result?;

    Ok(Json(ListPoliciesResponse {
        policies: policies.into_iter().map(PolicyResponse::from).collect(),
        total: total as usize,
    }))
}

/// POST /orgs/:org_id/policies - Create an ABAC policy
pub async fn create_policy<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
    Json(req): Json<CreatePolicyRequest>,
) -> Result<Json<PolicyResponse>, AppError> {
    verify_org_admin(&state, &headers, org_id).await?;

    let policy = AbacPolicy::new(org_id, &req.name, &req.permission, req.effect)
        .with_conditions(req.conditions)
        .with_priority(req.priority);

    let mut policy = policy;
    policy.description = req.description;

    let created = state.policy_repo.create(policy).await?;

    Ok(Json(PolicyResponse::from(created)))
}

/// GET /orgs/:org_id/policies/:policy_id - Get a specific policy
pub async fn get_policy<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path((org_id, policy_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<PolicyResponse>, AppError> {
    verify_org_admin(&state, &headers, org_id).await?;

    let policy = state
        .policy_repo
        .find_by_id(policy_id)
        .await?
        .ok_or(AppError::NotFound("Policy not found".into()))?;

    if policy.org_id != org_id {
        return Err(AppError::NotFound("Policy not found".into()));
    }

    Ok(Json(PolicyResponse::from(policy)))
}

/// PATCH /orgs/:org_id/policies/:policy_id - Update a policy
pub async fn update_policy<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path((org_id, policy_id)): Path<(Uuid, Uuid)>,
    Json(req): Json<UpdatePolicyRequest>,
) -> Result<Json<PolicyResponse>, AppError> {
    verify_org_admin(&state, &headers, org_id).await?;

    let mut policy = state
        .policy_repo
        .find_by_id(policy_id)
        .await?
        .ok_or(AppError::NotFound("Policy not found".into()))?;

    if policy.org_id != org_id {
        return Err(AppError::NotFound("Policy not found".into()));
    }

    // Update fields
    if let Some(name) = req.name {
        policy.name = name;
    }
    if let Some(description) = req.description {
        policy.description = Some(description);
    }
    if let Some(permission) = req.permission {
        policy.permission = permission;
    }
    if let Some(conditions) = req.conditions {
        policy.conditions = conditions;
    }
    if let Some(effect) = req.effect {
        policy.effect = effect;
    }
    if let Some(priority) = req.priority {
        policy.priority = priority;
    }
    if let Some(enabled) = req.enabled {
        policy.enabled = enabled;
    }

    let updated = state.policy_repo.update(policy).await?;

    Ok(Json(PolicyResponse::from(updated)))
}

/// DELETE /orgs/:org_id/policies/:policy_id - Delete a policy
pub async fn delete_policy<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path((org_id, policy_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<MessageResponse>, AppError> {
    verify_org_admin(&state, &headers, org_id).await?;

    let policy = state
        .policy_repo
        .find_by_id(policy_id)
        .await?
        .ok_or(AppError::NotFound("Policy not found".into()))?;

    if policy.org_id != org_id {
        return Err(AppError::NotFound("Policy not found".into()));
    }

    state.policy_repo.delete(policy_id).await?;

    Ok(Json(MessageResponse {
        message: "Policy deleted successfully".into(),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_policy_request_deserialize() {
        let json = r#"{
            "name": "Owner Delete",
            "description": "Allow owners to delete their resources",
            "permission": "project:delete",
            "conditions": {
                "resource": {
                    "owner_id": {"type": "equals", "value": "${subject.user_id}"}
                }
            },
            "effect": "allow",
            "priority": 10
        }"#;
        let req: CreatePolicyRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "Owner Delete");
        assert_eq!(req.effect, PolicyEffect::Allow);
        assert_eq!(req.priority, 10);
    }

    #[test]
    fn test_update_policy_request_partial() {
        let json = r#"{"name": "Updated Name", "enabled": false}"#;
        let req: UpdatePolicyRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, Some("Updated Name".to_string()));
        assert_eq!(req.enabled, Some(false));
        assert!(req.permission.is_none());
    }

    #[test]
    fn test_policy_response_serialization() {
        let org_id = Uuid::new_v4();
        let policy = AbacPolicy::new(org_id, "Test", "project:read", PolicyEffect::Allow);
        let response = PolicyResponse::from(policy);

        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"name\":\"Test\""));
        assert!(json.contains("\"permission\":\"project:read\""));
        assert!(json.contains("\"effect\":\"allow\""));
    }

    #[test]
    fn test_list_policies_query_defaults() {
        let params: ListPoliciesQueryParams = serde_json::from_str("{}").unwrap();
        assert_eq!(params.limit, 50);
        assert_eq!(params.offset, 0);
    }
}
