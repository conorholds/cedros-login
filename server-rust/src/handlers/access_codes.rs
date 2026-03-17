//! Access code handlers
//!
//! User-facing:
//! - POST /access-codes/generate — JWT auth, generate a personal invite code
//! - GET  /access-codes/mine    — JWT auth, list user's own codes
//!
//! Admin:
//! - GET    /admin/access-codes       — list all codes (paginated, optional type filter)
//! - POST   /admin/access-codes       — create a limited-use code
//! - DELETE /admin/access-codes/{id}  — delete a code
//! - GET    /admin/signup-stats       — registrations vs limit for current period

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::handlers::admin::validate_system_admin;
use crate::repositories::AccessCodeEntity;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccessCodeResponse {
    pub id: String,
    pub code: String,
    pub code_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_uses: Option<i32>,
    pub current_uses: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_by: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccessCodeListResponse {
    pub items: Vec<AccessCodeResponse>,
    pub total: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SignupStatsResponse {
    /// Users registered in the current period.
    pub count: u64,
    /// Maximum registrations allowed per period (`None` = unlimited).
    pub limit: Option<u64>,
    /// The current period label: `"day"`, `"week"`, or `"month"`.
    pub period: String,
    /// Start of the current period (ISO 8601).
    pub period_start: String,
}

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListCodesQuery {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default)]
    pub offset: u32,
    pub code_type: Option<String>,
}

fn default_limit() -> u32 {
    20
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateAccessCodeRequest {
    pub code: String,
    pub max_uses: Option<i32>,
    pub expires_at: Option<String>,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn entity_to_response(e: AccessCodeEntity) -> AccessCodeResponse {
    AccessCodeResponse {
        id: e.id.to_string(),
        code: e.code,
        code_type: e.code_type,
        max_uses: e.max_uses,
        current_uses: e.current_uses,
        created_by: e.created_by.map(|id| id.to_string()),
        expires_at: e.expires_at.map(|dt| dt.to_rfc3339()),
        created_at: e.created_at.to_rfc3339(),
    }
}

// ---------------------------------------------------------------------------
// User-facing handlers
// ---------------------------------------------------------------------------

/// POST /access-codes/generate
///
/// Generates a single-use invite code for the authenticated user.
pub async fn generate_user_code<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<AccessCodeResponse>, AppError> {
    let auth_user = authenticate(&state, &headers).await?;

    let entity = state
        .signup_gating_service
        .generate_user_code(auth_user.user_id)
        .await?;

    tracing::info!(
        user_id = %auth_user.user_id,
        code_id = %entity.id,
        "User generated invite code"
    );

    Ok(Json(entity_to_response(entity)))
}

/// GET /access-codes/mine
///
/// Lists the authenticated user's own access codes.
pub async fn list_my_codes<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<ListCodesQuery>,
) -> Result<Json<AccessCodeListResponse>, AppError> {
    let auth_user = authenticate(&state, &headers).await?;
    let limit = query.limit.min(100);

    let items = state
        .storage
        .access_code_repo
        .list_by_creator(auth_user.user_id, limit, query.offset)
        .await?;

    let total = state
        .storage
        .access_code_repo
        .count_by_creator_since(auth_user.user_id, DateTime::<Utc>::from_timestamp(0, 0).unwrap())
        .await?;

    Ok(Json(AccessCodeListResponse {
        items: items.into_iter().map(entity_to_response).collect(),
        total,
    }))
}

// ---------------------------------------------------------------------------
// Admin handlers
// ---------------------------------------------------------------------------

/// GET /admin/access-codes
///
/// Lists all access codes with optional type filter.
pub async fn admin_list_codes<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<ListCodesQuery>,
) -> Result<Json<AccessCodeListResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;
    let limit = query.limit.min(100);
    let code_type = query.code_type.as_deref();

    let items = state
        .storage
        .access_code_repo
        .list_all(limit, query.offset, code_type)
        .await?;

    let total = state
        .storage
        .access_code_repo
        .count_all(code_type)
        .await?;

    Ok(Json(AccessCodeListResponse {
        items: items.into_iter().map(entity_to_response).collect(),
        total,
    }))
}

/// POST /admin/access-codes
///
/// Creates a new admin-managed limited-use code.
pub async fn admin_create_code<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<CreateAccessCodeRequest>,
) -> Result<Json<AccessCodeResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    if req.code.trim().is_empty() {
        return Err(AppError::Validation("code must not be empty".into()));
    }

    let expires_at: Option<DateTime<Utc>> = match req.expires_at.as_deref() {
        None | Some("") => None,
        Some(s) => {
            let dt = DateTime::parse_from_rfc3339(s)
                .map_err(|_| AppError::Validation(format!("Invalid expires_at: '{}'", s)))?
                .with_timezone(&Utc);
            Some(dt)
        }
    };

    let now = Utc::now();
    let entity = AccessCodeEntity {
        id: Uuid::new_v4(),
        code: req.code.trim().to_string(),
        code_type: "limited".to_string(),
        max_uses: req.max_uses,
        current_uses: 0,
        created_by: None,
        expires_at,
        created_at: now,
    };

    let created = state.storage.access_code_repo.create(entity).await?;

    tracing::info!(
        admin_id = %admin_id,
        code_id = %created.id,
        code = %created.code,
        "Admin created access code"
    );

    Ok(Json(entity_to_response(created)))
}

/// DELETE /admin/access-codes/{id}
///
/// Deletes an access code by ID.
pub async fn admin_delete_code<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    state.storage.access_code_repo.delete(id).await?;

    tracing::info!(admin_id = %admin_id, code_id = %id, "Admin deleted access code");

    Ok(Json(serde_json::json!({ "ok": true })))
}

/// GET /admin/signup-stats
///
/// Returns the number of users registered in the current period vs the
/// configured limit.
pub async fn admin_signup_stats<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<SignupStatsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let period = state
        .settings_service
        .get("signup_limit_period")
        .await?
        .unwrap_or_else(|| "day".to_string());

    let start = crate::services::period_start(&period);
    let count = state.user_repo.count_created_since(start).await?;

    let limit_enabled = state
        .settings_service
        .get_bool("signup_limit_enabled")
        .await?
        .unwrap_or(false);

    let limit = if limit_enabled {
        state
            .settings_service
            .get("signup_limit_max")
            .await?
            .and_then(|s| s.parse::<u64>().ok())
            .or(Some(100))
    } else {
        None
    };

    Ok(Json(SignupStatsResponse {
        count,
        limit,
        period,
        period_start: start.to_rfc3339(),
    }))
}
