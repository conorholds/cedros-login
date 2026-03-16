//! Admin sanctions endpoints
//!
//! GET  /admin/sanctions/stats   — Return cache statistics (address count, age).
//! POST /admin/sanctions/refresh — Force an immediate cache refresh.

use axum::{extract::State, http::HeaderMap, Json};
use serde::Serialize;
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::handlers::admin::validate_system_admin;
use crate::services::EmailService;
use crate::AppState;

/// Response body for `GET /admin/sanctions/stats`.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SanctionsStatsResponse {
    /// Number of sanctioned wallet addresses currently cached.
    pub address_count: usize,
    /// Number of blocked country codes currently cached.
    pub country_count: usize,
    /// Seconds since the cache was last refreshed, or null if never refreshed.
    pub cache_age_secs: Option<u64>,
}

/// GET /admin/sanctions/stats
///
/// Returns the current state of the sanctions cache: address/country counts and
/// cache age. Requires system admin.
pub async fn get_sanctions_stats<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<SanctionsStatsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let stats = state.sanctions_service.stats().await;

    Ok(Json(SanctionsStatsResponse {
        address_count: stats.address_count,
        country_count: stats.country_count,
        cache_age_secs: stats.cache_age_secs,
    }))
}

/// POST /admin/sanctions/refresh
///
/// Force an immediate refresh of the sanctions list from the configured API.
/// Returns the updated stats after the refresh. Requires system admin.
pub async fn refresh_sanctions<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<SanctionsStatsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    state.sanctions_service.refresh().await?;

    let stats = state.sanctions_service.stats().await;

    Ok(Json(SanctionsStatsResponse {
        address_count: stats.address_count,
        country_count: stats.country_count,
        cache_age_secs: stats.cache_age_secs,
    }))
}
