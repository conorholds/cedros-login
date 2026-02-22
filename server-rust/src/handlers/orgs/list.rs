//! List organizations handler

use axum::{
    extract::{Query, State},
    http::HeaderMap,
    Json,
};
use serde::Deserialize;
use std::collections::HashMap;
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{ListOrgsResponse, OrgResponse};
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::repositories::MembershipEntity;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::utils::signup_org::resolve_org_assignment;
use crate::AppState;

/// GET /orgs - List user's organizations
pub async fn list_orgs<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<ListOrgsQueryParams>,
) -> Result<Json<ListOrgsResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    let limit = cap_limit(params.limit);
    let offset = cap_offset(params.offset);
    // P-03: Parallelize fetch + count for 30-40% latency reduction
    let (memberships_result, total_result) = tokio::join!(
        state
            .membership_repo
            .find_by_user_paged(auth.user_id, limit, offset),
        state.membership_repo.count_by_user(auth.user_id)
    );
    let mut memberships = memberships_result?;
    let mut total = total_result?;

    let mut orgs = resolve_orgs_from_memberships(&state, &memberships).await?;

    // Self-healing: if user has no *resolved* orgs (either zero memberships,
    // or all memberships point to deleted orgs), auto-assign to default org.
    if orgs.is_empty() {
        if let Ok(assignment) = resolve_org_assignment(&state, auth.user_id).await {
            let new_membership =
                MembershipEntity::new(auth.user_id, assignment.org_id, assignment.role);
            if state.membership_repo.create(new_membership).await.is_ok() {
                memberships = state
                    .membership_repo
                    .find_by_user_paged(auth.user_id, limit, offset)
                    .await?;
                total = memberships.len() as u64;
                orgs = resolve_orgs_from_memberships(&state, &memberships).await?;
            }
        }
    }

    Ok(Json(ListOrgsResponse {
        orgs,
        total,
        limit,
        offset,
    }))
}

#[derive(Debug, Deserialize)]
pub struct ListOrgsQueryParams {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    50
}

/// Join memberships with the organizations table, skipping stale entries.
async fn resolve_orgs_from_memberships<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
    memberships: &[MembershipEntity],
) -> Result<Vec<OrgResponse>, AppError> {
    let org_ids: Vec<_> = memberships.iter().map(|m| m.org_id).collect();
    let orgs = state.org_repo.find_by_ids(&org_ids).await?;
    let orgs_by_id: HashMap<_, _> = orgs.into_iter().map(|org| (org.id, org)).collect();

    let mut result = Vec::with_capacity(memberships.len());
    for membership in memberships {
        if let Some(org) = orgs_by_id.get(&membership.org_id) {
            result.push(OrgResponse::from_entity(org, membership.role));
        }
    }
    Ok(result)
}
