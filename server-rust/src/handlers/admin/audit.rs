//! Audit log handlers
//!
//! ## HANDLER-11: Access Control Model
//!
//! The handlers fetch membership once and check role from the same object,
//! so there's no TOCTOU race. The membership could be deleted between
//! authentication and the membership lookup, but that results in a clean
//! 403 (not a security issue).

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{AuditLogQueryParams, AuditLogResponse, ListAuditLogsResponse};
use crate::repositories::OrgRole;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

const MAX_LIMIT: u32 = 200;

/// GET /orgs/:org_id/audit - Get audit logs for an organization
///
/// Requires admin+ role in the organization.
pub async fn get_org_audit_logs<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
    Query(params): Query<AuditLogQueryParams>,
) -> Result<Json<ListAuditLogsResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Check membership - must be admin+ to view audit logs
    let membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    if !membership.role.has_at_least(OrgRole::Admin) {
        return Err(AppError::Forbidden(
            "Only admins and owners can view audit logs".into(),
        ));
    }

    // P-02: Query audit logs and count in single database operation
    let mut query = params.to_query(Some(org_id));
    query.limit = clamp_limit(query.limit);
    let (logs, total) = state.audit_repo.query_with_count(query).await?;

    let log_responses: Vec<AuditLogResponse> = logs.iter().map(AuditLogResponse::from).collect();

    Ok(Json(ListAuditLogsResponse {
        logs: log_responses,
        total: total as usize,
    }))
}

/// GET /admin/audit - Get system-wide audit logs
///
/// Requires system admin privileges.
pub async fn get_system_audit_logs<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<AuditLogQueryParams>,
) -> Result<Json<ListAuditLogsResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Check if user is system admin
    let user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    if !user.is_system_admin {
        return Err(AppError::Forbidden(
            "Only system administrators can view system audit logs".into(),
        ));
    }

    // P-02: Query audit logs and count in single database operation
    let mut query = params.to_query(None);
    query.limit = clamp_limit(query.limit);
    let (logs, total) = state.audit_repo.query_with_count(query).await?;

    let log_responses: Vec<AuditLogResponse> = logs.iter().map(AuditLogResponse::from).collect();

    Ok(Json(ListAuditLogsResponse {
        logs: log_responses,
        total: total as usize,
    }))
}

fn clamp_limit(limit: Option<u32>) -> Option<u32> {
    limit.map(|value| value.min(MAX_LIMIT))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clamp_limit() {
        assert_eq!(clamp_limit(Some(10)), Some(10));
        assert_eq!(clamp_limit(Some(500)), Some(MAX_LIMIT));
        assert_eq!(clamp_limit(None), None);
    }
}
