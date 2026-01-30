//! Treasury wallet administration handlers
//!
//! POST /admin/treasury/authorize - Authorize admin's wallet as treasury
//! GET /admin/treasury - Get current treasury configuration
//! DELETE /admin/treasury - Revoke treasury authorization

use axum::{extract::State, http::HeaderMap, Json};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use super::users::validate_system_admin;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::TreasuryConfigEntity;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// Request to authorize admin's wallet as treasury
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthorizeTreasuryRequest {
    /// Org ID for org-specific treasury (None = global default)
    pub org_id: Option<Uuid>,
}

/// Response with treasury configuration
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TreasuryConfigResponse {
    pub id: Uuid,
    pub org_id: Option<Uuid>,
    pub treasury_user_id: Uuid,
    pub wallet_address: String,
    pub authorized_at: DateTime<Utc>,
    pub authorized_by: Uuid,
}

impl From<TreasuryConfigEntity> for TreasuryConfigResponse {
    fn from(e: TreasuryConfigEntity) -> Self {
        Self {
            id: e.id,
            org_id: e.org_id,
            treasury_user_id: e.treasury_user_id,
            wallet_address: e.wallet_address,
            authorized_at: e.authorized_at,
            authorized_by: e.authorized_by,
        }
    }
}

/// Query params for GET /admin/treasury
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetTreasuryQuery {
    /// Org ID (None = global default)
    pub org_id: Option<Uuid>,
}

/// POST /admin/treasury/authorize - Authorize admin's wallet as treasury
///
/// The admin must have their wallet unlocked. The server reconstructs the
/// private key and stores it encrypted for batch swap signing.
///
/// Requires system admin privileges.
pub async fn authorize_treasury<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<AuthorizeTreasuryRequest>,
) -> Result<Json<TreasuryConfigResponse>, AppError> {
    // Validate system admin
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Get authenticated user (needed for session ID for wallet cache)
    let auth_user = authenticate(&state, &headers).await?;

    // Get wallet material
    let wallet_material = state
        .wallet_material_repo
        .find_by_user(admin_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Admin does not have an SSS wallet enrolled".into()))?;

    // Get session ID for wallet unlock cache
    let session_id = auth_user
        .session_id
        .ok_or_else(|| AppError::Unauthorized("Session required for wallet operations".into()))?;

    // Get cached encryption key (wallet must be unlocked)
    let cached_key = state
        .wallet_unlock_cache
        .get(session_id)
        .await
        .ok_or_else(|| {
            AppError::Unauthorized("Wallet is locked. Call POST /wallet/unlock first.".into())
        })?;

    // Reconstruct the private key
    let private_key = state
        .wallet_signing_service
        .reconstruct_private_key(&wallet_material, &cached_key)
        .map_err(|e| {
            tracing::error!(error = %e, "Failed to reconstruct private key for treasury");
            AppError::Internal(anyhow::anyhow!("Failed to reconstruct wallet key"))
        })?;

    // Encrypt private key for storage
    let note_encryption = state
        .note_encryption_service
        .as_ref()
        .ok_or_else(|| AppError::Config("Note encryption not configured".into()))?;

    let encrypted = note_encryption.encrypt(private_key.as_bytes())?;

    // Store as: nonce (12 bytes) + ciphertext, all base64 encoded
    let mut combined = encrypted.nonce;
    combined.extend(&encrypted.ciphertext);
    let encrypted_private_key = BASE64.encode(&combined);

    // Create treasury config
    let config = TreasuryConfigEntity::new(
        request.org_id,
        admin_id,
        wallet_material.solana_pubkey.clone(),
        encrypted_private_key,
        note_encryption.key_id().to_string(),
        admin_id,
    );

    // Store in repository (will fail if treasury already exists for this org)
    let created = state.treasury_config_repo.create(config).await?;

    tracing::info!(
        treasury_id = %created.id,
        org_id = ?created.org_id,
        wallet = %created.wallet_address,
        "Treasury wallet authorized"
    );

    Ok(Json(TreasuryConfigResponse::from(created)))
}

/// GET /admin/treasury - Get current treasury configuration
///
/// Returns the treasury config for the specified org, or the global default
/// if no org_id is provided. Returns 404 if no treasury is configured.
///
/// Requires system admin privileges.
pub async fn get_treasury<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    axum::extract::Query(query): axum::extract::Query<GetTreasuryQuery>,
) -> Result<Json<TreasuryConfigResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let config = if let Some(org_id) = query.org_id {
        state.treasury_config_repo.find_by_org(org_id).await?
    } else {
        state.treasury_config_repo.find_global().await?
    };

    let config =
        config.ok_or_else(|| AppError::NotFound("No treasury configured for this org".into()))?;

    Ok(Json(TreasuryConfigResponse::from(config)))
}

/// DELETE /admin/treasury - Revoke treasury authorization
///
/// Removes the treasury configuration for the specified org (or global).
/// After revocation, micro deposits will fall back to the next available
/// treasury (org-specific or global).
///
/// Requires system admin privileges.
pub async fn revoke_treasury<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    axum::extract::Query(query): axum::extract::Query<GetTreasuryQuery>,
) -> Result<Json<MessageResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let deleted = state
        .treasury_config_repo
        .delete_by_org(query.org_id)
        .await?;

    if deleted {
        tracing::info!(org_id = ?query.org_id, "Treasury authorization revoked");
        Ok(Json(MessageResponse {
            message: "Treasury authorization revoked".to_string(),
        }))
    } else {
        Err(AppError::NotFound(
            "No treasury configured for this org".into(),
        ))
    }
}
