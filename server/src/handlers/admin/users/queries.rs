//! Read-only admin user queries.

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use std::{collections::HashMap, sync::Arc};
use uuid::Uuid;

use super::access::validate_system_admin;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{AdminUserResponse, ListUsersQueryParams, ListUsersResponse};
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::services::EmailService;
use crate::AppState;

/// List users using capped pagination.
pub async fn list_users<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<ListUsersQueryParams>,
) -> Result<Json<ListUsersResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;
    let limit = cap_limit(params.limit);
    let offset = cap_offset(params.offset);
    let (users_result, total_result) = tokio::join!(
        state.user_repo.list_all(limit, offset),
        state.user_repo.count()
    );

    Ok(Json(ListUsersResponse {
        users: users_result?.iter().map(AdminUserResponse::from).collect(),
        total: total_result?,
        limit,
        offset,
    }))
}

/// Get a user and their referral count.
pub async fn get_user<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
) -> Result<Json<AdminUserResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;
    let referral_count = state.user_repo.count_referrals(user_id).await?;
    Ok(Json(
        AdminUserResponse::from(&user).with_referral_count(referral_count),
    ))
}

/// User statistics by authentication method.
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUserStatsResponse {
    /// Total number of users.
    pub total: u64,
    /// Count by authentication method.
    pub auth_method_counts: HashMap<String, u64>,
}

/// Get aggregate user statistics by authentication method.
pub async fn get_user_stats<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<AdminUserStatsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;
    let (total_result, counts_result) = tokio::join!(
        state.user_repo.count(),
        state.user_repo.count_by_auth_methods()
    );
    Ok(Json(AdminUserStatsResponse {
        total: total_result?,
        auth_method_counts: counts_result?,
    }))
}
