//! Authorization endpoint handler

use axum::{extract::State, http::HeaderMap, Json};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{
    AuthorizeRequest, AuthorizeResponse, GetPermissionsRequest, GetPermissionsResponse,
};
use crate::services::{AuthorizationService, EmailService, PolicyContext, PolicyService};
use crate::utils::authenticate;
use crate::AppState;

/// POST /authorize - Check if user has permission
///
/// Requires authentication. Checks if the authenticated user has the specified
/// permission in the given organization. Supports both RBAC and ABAC policies.
///
/// If resource or environment attributes are provided, ABAC policies are evaluated first.
/// If no ABAC policy matches, falls back to RBAC role-based checks.
pub async fn authorize<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<AuthorizeRequest>,
) -> Result<Json<AuthorizeResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // P-03: Build policy context, taking ownership to avoid clones
    let context = build_policy_context(req.resource, req.environment);

    // Create policy service and evaluate
    let policy_service = PolicyService::new(
        state.policy_repo.clone(),
        state.user_repo.clone(),
        state.org_repo.clone(),
        state.membership_repo.clone(),
    );

    let result = policy_service
        .evaluate(auth.user_id, req.org_id, &req.permission, context)
        .await?;

    Ok(Json(AuthorizeResponse {
        allowed: result.allowed,
        reason: result.reason,
        permissions: None,
        matched_policy_id: result.matched_policy_id,
        matched_policy_name: result.matched_policy_name,
        used_rbac_fallback: Some(result.used_rbac_fallback),
    }))
}

/// P-03: Build a PolicyContext taking ownership of attributes to avoid clones
fn build_policy_context(
    resource: Option<std::collections::HashMap<String, serde_json::Value>>,
    environment: Option<std::collections::HashMap<String, serde_json::Value>>,
) -> Option<PolicyContext> {
    // Only create context if attributes are provided
    if resource.is_none() && environment.is_none() {
        return None;
    }

    let mut context = PolicyContext::new();

    if let Some(resource_map) = resource {
        for (key, value) in resource_map {
            context.resource.insert(key, value);
        }
    }

    if let Some(environment_map) = environment {
        for (key, value) in environment_map {
            context.environment.insert(key, value);
        }
    }

    Some(context)
}

/// POST /permissions - Get all permissions for user in org
///
/// Requires authentication. Returns all permissions the authenticated user
/// has in the specified organization.
pub async fn get_permissions<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<GetPermissionsRequest>,
) -> Result<Json<GetPermissionsResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Create authorization service and get permissions
    let auth_service = AuthorizationService::new(
        state.user_repo.clone(),
        state.org_repo.clone(),
        state.membership_repo.clone(),
    );

    let permissions = auth_service
        .get_user_permissions(auth.user_id, req.org_id)
        .await?;

    // HANDLER-01: Get user's role in the org - return 403 for non-members
    // instead of empty permissions to clearly indicate lack of access
    let membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, req.org_id)
        .await?
        .ok_or_else(|| AppError::Forbidden("Not a member of this organization".into()))?;

    Ok(Json(GetPermissionsResponse {
        permissions: permissions.iter().map(|p| p.as_str().to_string()).collect(),
        role: Some(membership.role.as_str().to_string()),
    }))
}
