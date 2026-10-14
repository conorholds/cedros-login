//! Authorization endpoint handler

use axum::{extract::State, http::HeaderMap, Json};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{
    AuthorizeRequest, AuthorizeResponse, GetPermissionsRequest, GetPermissionsResponse,
};
use crate::services::{EmailService, PolicyService};
use crate::utils::authenticate;
use crate::AppState;

/// POST /authorize - Check if user has permission
///
/// Requires authentication. Checks if the authenticated user has the specified
/// permission in the given organization. Supports both RBAC and ABAC policies.
///
/// Public callers cannot assert resource or environment attributes. Trusted
/// integrations must supply those attributes within their server-side boundary.
pub async fn authorize<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<AuthorizeRequest>,
) -> Result<Json<AuthorizeResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    reject_untrusted_context(req.resource.as_ref(), req.environment.as_ref())?;

    // Create policy service and evaluate
    let policy_service = PolicyService::new(
        state.policy_repo.clone(),
        state.user_repo.clone(),
        state.org_repo.clone(),
        state.membership_repo.clone(),
    );

    let result = policy_service
        .evaluate(
            auth.user_id,
            req.org_id,
            &req.permission,
            None,
            !auth.is_api_key_auth,
        )
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

/// Fail closed when an untrusted HTTP caller tries to assert ABAC attributes.
fn reject_untrusted_context<T, U>(
    resource: Option<&T>,
    environment: Option<&U>,
) -> Result<(), AppError> {
    if resource.is_some() || environment.is_some() {
        return Err(AppError::Validation(
            "Resource and environment attributes require a trusted server integration".into(),
        ));
    }
    Ok(())
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

    // Get user's role in the org - return 403 for non-members
    // instead of empty permissions to clearly indicate lack of access
    let membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, req.org_id)
        .await?
        .ok_or_else(|| AppError::Forbidden("Not a member of this organization".into()))?;

    let policy_service = PolicyService::new(
        state.policy_repo.clone(),
        state.user_repo.clone(),
        state.org_repo.clone(),
        state.membership_repo.clone(),
    );
    let permissions = policy_service
        .effective_permissions(auth.user_id, req.org_id, !auth.is_api_key_auth)
        .await?;

    Ok(Json(GetPermissionsResponse {
        permissions: permissions.iter().map(|p| p.as_str().to_string()).collect(),
        role: Some(membership.role.as_str().to_string()),
        user_id: auth.user_id,
    }))
}

#[cfg(test)]
mod tests {
    use super::reject_untrusted_context;

    #[test]
    fn public_authorize_rejects_caller_asserted_context() {
        assert!(reject_untrusted_context(Some(&()), None::<&()>).is_err());
        assert!(reject_untrusted_context(None::<&()>, Some(&())).is_err());
        assert!(reject_untrusted_context(None::<&()>, None::<&()>).is_ok());
    }
}
