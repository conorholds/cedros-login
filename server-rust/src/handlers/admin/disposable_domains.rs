//! Admin disposable email domain blocklist management
//!
//! GET  /admin/disposable-domains — view built-in count + custom domains + enabled flag
//! PUT  /admin/disposable-domains — replace custom domain list

use axum::{extract::State, http::HeaderMap, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use super::users::validate_system_admin;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::services::EmailService;
use crate::utils::disposable_domain_count;
use crate::AppState;

/// Response for GET /admin/disposable-domains
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DisposableDomainsResponse {
    pub built_in_count: usize,
    pub custom_domains: Vec<String>,
    pub enabled: bool,
}

/// Request body for PUT /admin/disposable-domains
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDisposableDomainsRequest {
    pub domains: Vec<String>,
}

/// GET /admin/disposable-domains
///
/// Returns the number of built-in blocked domains, the custom domain list,
/// and whether disposable blocking is enabled. Requires system admin.
pub async fn get_disposable_domains<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<DisposableDomainsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let enabled = state
        .settings_service
        .get_bool("auth_email_block_disposable")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.email.block_disposable_emails);

    let custom_domains = match state
        .settings_service
        .get("custom_blocked_domains")
        .await
        .ok()
        .flatten()
    {
        Some(json_str) => serde_json::from_str::<Vec<String>>(&json_str).unwrap_or_default(),
        None => Vec::new(),
    };

    Ok(Json(DisposableDomainsResponse {
        built_in_count: disposable_domain_count(),
        custom_domains,
        enabled,
    }))
}

/// PUT /admin/disposable-domains
///
/// Replaces the custom blocked domain list. Domains are lowercased and
/// stored as JSON in the `custom_blocked_domains` setting. Refreshes
/// the settings cache so changes take effect immediately. Requires system admin.
pub async fn update_disposable_domains<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<UpdateDisposableDomainsRequest>,
) -> Result<Json<DisposableDomainsResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Normalize domains to lowercase and deduplicate
    let domains: Vec<String> = {
        let mut set = std::collections::HashSet::new();
        request
            .domains
            .into_iter()
            .map(|d| d.trim().to_lowercase())
            .filter(|d| !d.is_empty() && set.insert(d.clone()))
            .collect()
    };

    let json_value = serde_json::to_string(&domains)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to serialize domains: {}", e)))?;

    // Upsert the setting
    use crate::repositories::SystemSetting;
    use chrono::Utc;

    let setting = SystemSetting {
        key: "custom_blocked_domains".to_string(),
        value: json_value,
        category: "auth".to_string(),
        description: Some("Custom blocked email domains (JSON array)".to_string()),
        is_secret: false,
        encryption_version: None,
        updated_at: Utc::now(),
        updated_by: Some(admin_id),
    };

    state
        .system_settings_repo
        .upsert_many(vec![setting])
        .await?;

    // Refresh cache so the change is immediately visible
    state.settings_service.refresh().await?;

    tracing::info!(
        admin_id = %admin_id,
        domain_count = domains.len(),
        "Admin updated custom blocked email domains"
    );

    let enabled = state
        .settings_service
        .get_bool("auth_email_block_disposable")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.email.block_disposable_emails);

    Ok(Json(DisposableDomainsResponse {
        built_in_count: disposable_domain_count(),
        custom_domains: domains,
        enabled,
    }))
}
