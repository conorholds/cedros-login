//! Admin SSO provider management handlers
//!
//! CRUD endpoints for managing SSO (OIDC) providers per organization.
//! All endpoints require system admin privileges.

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use url::Url;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::{AppError, ERR_SYSTEM_ADMIN_REQUIRED};
use crate::models::sso::SsoProvider;
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// Validate system admin access
async fn validate_system_admin<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
) -> Result<Uuid, AppError> {
    let auth_user = authenticate(state, headers).await?;

    let user = state
        .user_repo
        .find_by_id(auth_user.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    if !user.is_system_admin {
        return Err(AppError::Forbidden(ERR_SYSTEM_ADMIN_REQUIRED.into()));
    }

    Ok(auth_user.user_id)
}

/// Query params for listing SSO providers
#[derive(Debug, Deserialize)]
pub struct ListSsoProvidersQuery {
    /// Filter by organization ID
    pub org_id: Option<Uuid>,
    /// Pagination limit
    #[serde(default = "default_limit")]
    pub limit: u32,
    /// Pagination offset
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    50
}

/// Response for listing SSO providers
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListSsoProvidersResponse {
    pub providers: Vec<SsoProviderResponse>,
    pub total: usize,
    pub limit: u32,
    pub offset: u32,
}

/// SSO provider response (excludes encrypted secrets)
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SsoProviderResponse {
    pub id: Uuid,
    pub org_id: Uuid,
    pub name: String,
    pub issuer_url: String,
    pub client_id: String,
    pub scopes: Vec<String>,
    pub enabled: bool,
    pub allow_registration: bool,
    pub email_domain: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl From<&SsoProvider> for SsoProviderResponse {
    fn from(p: &SsoProvider) -> Self {
        Self {
            id: p.id,
            org_id: p.org_id,
            name: p.name.clone(),
            issuer_url: p.issuer_url.clone(),
            client_id: p.client_id.clone(),
            scopes: p.scopes.clone(),
            enabled: p.enabled,
            allow_registration: p.allow_registration,
            email_domain: p.email_domain.clone(),
            created_at: p.created_at,
            updated_at: p.updated_at,
        }
    }
}

/// Request to create an SSO provider
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSsoProviderRequest {
    pub org_id: Uuid,
    pub name: String,
    pub issuer_url: String,
    pub client_id: String,
    pub client_secret: String,
    #[serde(default = "default_scopes")]
    pub scopes: Vec<String>,
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default = "default_true")]
    pub allow_registration: bool,
    pub email_domain: Option<String>,
}

fn default_scopes() -> Vec<String> {
    vec!["openid".into(), "email".into(), "profile".into()]
}

fn default_true() -> bool {
    true
}

fn is_production_env(environment: &str) -> bool {
    environment.eq_ignore_ascii_case("production") || environment.eq_ignore_ascii_case("prod")
}

fn validate_sso_provider_settings(
    issuer_url: &str,
    scopes: &[String],
    environment: &str,
) -> Result<(), AppError> {
    let issuer =
        Url::parse(issuer_url).map_err(|_| AppError::Validation("Invalid issuer URL".into()))?;

    if is_production_env(environment) && issuer.scheme() != "https" {
        return Err(AppError::Validation(
            "OIDC issuer URL must use https in production".into(),
        ));
    }

    let required_scopes = ["openid", "email"];
    for required in required_scopes {
        if !scopes.iter().any(|s| s.eq_ignore_ascii_case(required)) {
            return Err(AppError::Validation(format!(
                "OIDC scope '{}' is required",
                required
            )));
        }
    }

    Ok(())
}

/// Request to update an SSO provider
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSsoProviderRequest {
    pub name: Option<String>,
    pub issuer_url: Option<String>,
    pub client_id: Option<String>,
    pub client_secret: Option<String>,
    pub scopes: Option<Vec<String>>,
    pub enabled: Option<bool>,
    pub allow_registration: Option<bool>,
    pub email_domain: Option<String>,
}

/// GET /admin/sso-providers - List all SSO providers
pub async fn list_sso_providers<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<ListSsoProvidersQuery>,
) -> Result<Json<ListSsoProvidersResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let limit = cap_limit(params.limit);
    let offset = cap_offset(params.offset);

    let (providers_result, total_result) = if let Some(org_id) = params.org_id {
        tokio::join!(
            state
                .storage
                .sso_repository()
                .list_providers_for_org_paged(org_id, limit, offset),
            state
                .storage
                .sso_repository()
                .count_providers_for_org(org_id)
        )
    } else {
        tokio::join!(
            state
                .storage
                .sso_repository()
                .list_all_providers_paged(limit, offset),
            state.storage.sso_repository().count_all_providers()
        )
    };

    let providers = providers_result?;
    let total = total_result?;
    let providers: Vec<SsoProviderResponse> =
        providers.iter().map(SsoProviderResponse::from).collect();

    Ok(Json(ListSsoProvidersResponse {
        providers,
        total: total as usize,
        limit,
        offset,
    }))
}

/// GET /admin/sso-providers/:id - Get a specific SSO provider
pub async fn get_sso_provider<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<SsoProviderResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let provider = state
        .storage
        .sso_repository()
        .find_provider_by_id(id)
        .await?
        .ok_or_else(|| AppError::NotFound("SSO provider not found".into()))?;

    Ok(Json(SsoProviderResponse::from(&provider)))
}

/// POST /admin/sso-providers - Create an SSO provider
pub async fn create_sso_provider<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<CreateSsoProviderRequest>,
) -> Result<Json<SsoProviderResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Validate organization exists
    let _org = state
        .org_repo
        .find_by_id(request.org_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Organization not found".into()))?;

    validate_sso_provider_settings(
        &request.issuer_url,
        &request.scopes,
        &state.config.notification.environment,
    )?;

    // Encrypt the client secret
    let encrypted_secret = state.encryption_service.encrypt(&request.client_secret)?;

    let now = chrono::Utc::now();
    let provider = SsoProvider {
        id: Uuid::new_v4(),
        org_id: request.org_id,
        name: request.name,
        issuer_url: request.issuer_url,
        client_id: request.client_id,
        client_secret_encrypted: encrypted_secret,
        scopes: request.scopes,
        enabled: request.enabled,
        allow_registration: request.allow_registration,
        email_domain: request.email_domain,
        created_at: now,
        updated_at: now,
    };

    let created = state
        .storage
        .sso_repository()
        .create_provider(provider)
        .await?;

    tracing::info!(
        admin_id = %admin_id,
        provider_id = %created.id,
        org_id = %created.org_id,
        provider_name = %created.name,
        issuer_url = %created.issuer_url,
        "Admin created SSO provider"
    );

    Ok(Json(SsoProviderResponse::from(&created)))
}

/// PUT /admin/sso-providers/:id - Update an SSO provider
///
/// ## HANDLER-10: No Reachability Validation
///
/// This endpoint validates URL format and scopes but doesn't verify the issuer_url
/// is actually reachable. Trade-offs considered:
///
/// - **With reachability check**: Slower updates, can fail due to transient network issues,
///   provider might be intentionally unreachable during setup
/// - **Without reachability check** (current): Fast updates, works for staged configurations
///
/// Recommendation: If reachability validation is needed, implement as async background job
/// that warns admins via notification if discovery document can't be fetched.
pub async fn update_sso_provider<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateSsoProviderRequest>,
) -> Result<Json<SsoProviderResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    let mut provider = state
        .storage
        .sso_repository()
        .find_provider_by_id(id)
        .await?
        .ok_or_else(|| AppError::NotFound("SSO provider not found".into()))?;

    // Apply updates
    if let Some(name) = request.name {
        provider.name = name;
    }
    if let Some(issuer_url) = request.issuer_url {
        provider.issuer_url = issuer_url;
    }
    if let Some(client_id) = request.client_id {
        provider.client_id = client_id;
    }
    if let Some(client_secret) = request.client_secret {
        provider.client_secret_encrypted = state.encryption_service.encrypt(&client_secret)?;
    }
    if let Some(scopes) = request.scopes {
        provider.scopes = scopes;
    }
    if let Some(enabled) = request.enabled {
        provider.enabled = enabled;
    }
    if let Some(allow_registration) = request.allow_registration {
        provider.allow_registration = allow_registration;
    }
    if request.email_domain.is_some() {
        provider.email_domain = request.email_domain;
    }

    provider.updated_at = chrono::Utc::now();

    validate_sso_provider_settings(
        &provider.issuer_url,
        &provider.scopes,
        &state.config.notification.environment,
    )?;

    let updated = state
        .storage
        .sso_repository()
        .update_provider(provider)
        .await?;

    tracing::info!(
        admin_id = %admin_id,
        provider_id = %updated.id,
        provider_name = %updated.name,
        "Admin updated SSO provider"
    );

    Ok(Json(SsoProviderResponse::from(&updated)))
}

/// DELETE /admin/sso-providers/:id - Delete an SSO provider
pub async fn delete_sso_provider<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<DeleteResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Check provider exists
    let provider = state
        .storage
        .sso_repository()
        .find_provider_by_id(id)
        .await?
        .ok_or_else(|| AppError::NotFound("SSO provider not found".into()))?;

    state.storage.sso_repository().delete_provider(id).await?;

    tracing::info!(
        admin_id = %admin_id,
        provider_id = %id,
        provider_name = %provider.name,
        org_id = %provider.org_id,
        "Admin deleted SSO provider"
    );

    Ok(Json(DeleteResponse { success: true }))
}

/// Response for delete operations
#[derive(Debug, Serialize)]
pub struct DeleteResponse {
    pub success: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_sso_provider_settings_requires_scopes() {
        let scopes = vec!["openid".to_string()];
        let result =
            validate_sso_provider_settings("https://issuer.example.com", &scopes, "production");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_sso_provider_settings_requires_https_in_production() {
        let scopes = vec!["openid".to_string(), "email".to_string()];
        let result =
            validate_sso_provider_settings("http://issuer.example.com", &scopes, "production");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_sso_provider_settings_allows_http_in_development() {
        let scopes = vec!["openid".to_string(), "email".to_string()];
        let result =
            validate_sso_provider_settings("http://issuer.example.com", &scopes, "development");
        assert!(result.is_ok());
    }
}
