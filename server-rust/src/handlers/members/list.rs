//! List members handler

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{ListMembersResponse, MemberResponse};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

const MAX_LIMIT: u32 = 200;

/// GET /orgs/:org_id/members - List organization members
pub async fn list_members<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
    Query(params): Query<ListMembersQueryParams>,
) -> Result<Json<ListMembersResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Check membership - user must be a member to view members
    let _caller_membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    // Get all memberships with user data in a single query (avoids N+1)
    let limit = clamp_limit(params.limit);
    let members_with_users = state
        .membership_repo
        .find_by_org_with_users_paged(org_id, limit, params.offset)
        .await?;
    let total = state.membership_repo.count_by_org(org_id).await?;

    // Build response
    let members: Vec<MemberResponse> = members_with_users
        .into_iter()
        .map(|m| MemberResponse::from_membership(&m.membership, m.email, m.name))
        .collect();

    Ok(Json(ListMembersResponse { members, total }))
}

#[derive(Debug, Deserialize)]
pub struct ListMembersQueryParams {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    50
}

fn clamp_limit(limit: u32) -> u32 {
    limit.min(MAX_LIMIT)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clamp_limit() {
        assert_eq!(clamp_limit(10), 10);
        assert_eq!(clamp_limit(500), MAX_LIMIT);
    }
}
