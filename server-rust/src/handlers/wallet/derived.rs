//! Derived wallet handlers (create, list, delete)

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{
    AllWalletsListResponse, CreateDerivedWalletRequest, DerivedWalletResponse,
    DerivedWalletSummary, MessageResponse,
};
use crate::repositories::{CreateDerivedWallet, CreateWalletRotationHistory, WalletRemovalReason};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

use super::resolve_wallet;

/// POST /wallet/derived - Create a derived wallet
///
/// Requires the default wallet to be enrolled and unlocked (to derive pubkey).
/// Server reconstructs the master seed from shares to derive the child pubkey.
pub async fn create_derived_wallet<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<CreateDerivedWalletRequest>,
) -> Result<Json<DerivedWalletResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // Validate label
    let label = req.label.trim().to_string();
    if label.is_empty() || label.len() > 100 {
        return Err(AppError::Validation(
            "Label must be 1-100 characters".into(),
        ));
    }

    // Must have a default wallet enrolled
    let material = resolve_wallet(&state, &auth).await?;

    // Must be unlocked to derive the pubkey (need to reconstruct master seed)
    let session_id = auth
        .session_id
        .ok_or_else(|| AppError::Unauthorized("Session required to create derived wallet".into()))?;

    let cached_key = state
        .wallet_unlock_cache
        .get(session_id)
        .await
        .ok_or_else(|| {
            AppError::Unauthorized("Wallet must be unlocked to create derived wallet".into())
        })?;

    // Get next available derivation index
    let next_index = state.derived_wallet_repo.next_index(user_id).await?;

    // Derive the child pubkey using the signing service
    let solana_pubkey = state.wallet_signing_service.derive_pubkey_for_index(
        &material,
        &cached_key,
        next_index as u32,
    )?;

    // Store in database
    let entity = state
        .derived_wallet_repo
        .create(CreateDerivedWallet {
            user_id,
            derivation_index: next_index,
            solana_pubkey: solana_pubkey.clone(),
            label: label.clone(),
        })
        .await?;

    Ok(Json(DerivedWalletResponse {
        id: entity.id,
        derivation_index: entity.derivation_index,
        solana_pubkey: entity.solana_pubkey,
        label: entity.label,
        created_at: entity.created_at,
    }))
}

/// GET /wallet/derived - List all wallets (default + derived)
pub async fn list_all_wallets<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<AllWalletsListResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    let mut wallets = Vec::new();

    // Add default wallet (index 0) if enrolled
    if let Some(material) = state
        .wallet_material_repo
        .find_default_by_user(user_id)
        .await?
    {
        wallets.push(DerivedWalletSummary {
            id: material.id,
            derivation_index: 0,
            solana_pubkey: material.solana_pubkey,
            label: "Default".to_string(),
            is_default: true,
            created_at: material.created_at,
        });
    }

    // Add derived wallets (index > 0)
    let derived = state.derived_wallet_repo.find_by_user_id(user_id).await?;
    for dw in derived {
        wallets.push(DerivedWalletSummary {
            id: dw.id,
            derivation_index: dw.derivation_index,
            solana_pubkey: dw.solana_pubkey,
            label: dw.label,
            is_default: false,
            created_at: dw.created_at,
        });
    }

    Ok(Json(AllWalletsListResponse { wallets }))
}

/// DELETE /wallet/derived/:id - Delete a derived wallet
pub async fn delete_derived_wallet<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(wallet_id): Path<uuid::Uuid>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // Look up the wallet before deleting so we can record history
    let wallet = state
        .derived_wallet_repo
        .find_by_id(wallet_id, user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Derived wallet not found".into()))?;

    // Record history before deletion
    state
        .wallet_rotation_history_repo
        .create(CreateWalletRotationHistory {
            user_id,
            old_wallet_id: wallet.id,
            old_solana_pubkey: wallet.solana_pubkey,
            derivation_index: wallet.derivation_index,
            label: Some(wallet.label),
            reason: WalletRemovalReason::Deleted,
        })
        .await?;

    state
        .derived_wallet_repo
        .delete_by_id(wallet_id, user_id)
        .await?;

    Ok(Json(MessageResponse {
        message: "Derived wallet deleted".into(),
    }))
}
