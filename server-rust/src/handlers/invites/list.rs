//! List invites handler

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
use crate::models::{InviteResponse, ListInvitesResponse};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

const MAX_LIMIT: u32 = 200;

/// GET /orgs/:org_id/invites - List pending invites
pub async fn list_invites<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(org_id): Path<Uuid>,
    Query(params): Query<ListInvitesQueryParams>,
) -> Result<Json<ListInvitesResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Check caller's membership - any member can view invites
    let _caller_membership = state
        .membership_repo
        .find_by_user_and_org(auth.user_id, org_id)
        .await?
        .ok_or(AppError::Forbidden(
            "Not a member of this organization".into(),
        ))?;

    // Get pending invites
    let limit = clamp_limit(params.limit);
    let invites = state
        .invite_repo
        .find_pending_by_org_paged(org_id, limit, params.offset)
        .await?;
    let total = state.invite_repo.count_pending_by_org(org_id).await?;

    let invite_responses: Vec<InviteResponse> =
        invites.iter().map(InviteResponse::from_entity).collect();

    Ok(Json(ListInvitesResponse {
        invites: invite_responses,
        total,
    }))
}

#[derive(Debug, Deserialize)]
pub struct ListInvitesQueryParams {
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
