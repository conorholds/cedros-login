//! Wallet info, lock/unlock, and list handlers

use axum::{extract::State, http::HeaderMap, Json};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{
    MessageResponse, WalletListResponse, WalletMaterialResponse, WalletStatusResponse,
    WalletSummary, WalletUnlockRequest, WalletUnlockResponse,
};
use crate::repositories::AuditEventType;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

use super::repo_to_model_auth_method;
use super::signing::convert_credential;

/// GET /wallet/material - Get wallet info for authenticated user (v2)
///
/// Returns wallet pubkey, auth method, and PRF salt (if passkey method).
/// Does NOT return shares - shares never leave the server in v2.
pub async fn get_wallet_material<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<WalletMaterialResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    let material = state
        .wallet_material_repo
        .find_default_by_user(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Wallet not enrolled".into()))?;

    let auth_method = repo_to_model_auth_method(&material.share_a_auth_method);

    Ok(Json(WalletMaterialResponse {
        solana_pubkey: material.solana_pubkey,
        scheme_version: material.scheme_version,
        share_a_auth_method: auth_method,
        prf_salt: material.prf_salt.map(|s| BASE64.encode(&s)),
        created_at: material.created_at,
        updated_at: material.updated_at,
    }))
}

/// POST /wallet/unlock - Unlock wallet for session-based signing
///
/// Verifies credential and caches the derived encryption key for the session.
pub async fn wallet_unlock<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<WalletUnlockRequest>,
) -> Result<Json<WalletUnlockResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    let session_id = auth
        .session_id
        .ok_or_else(|| AppError::Unauthorized("Session required for wallet unlock".into()))?;

    let material = state
        .wallet_material_repo
        .find_default_by_user(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Wallet not enrolled".into()))?;

    let credential = convert_credential(&req.credential)?;

    let key = state
        .wallet_signing_service
        .verify_and_derive_key(&material, &credential)
        .await?;

    state.wallet_unlock_cache.store(session_id, key).await;

    let _ = state
        .audit_service
        .log_user_event(AuditEventType::WalletUnlocked, user_id, Some(&headers))
        .await;

    Ok(Json(WalletUnlockResponse {
        unlocked: true,
        ttl_seconds: 15 * 60,
    }))
}

/// POST /wallet/lock - Lock wallet (clear cached key)
pub async fn wallet_lock<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    let session_id = auth
        .session_id
        .ok_or_else(|| AppError::Unauthorized("Session required for wallet lock".into()))?;

    state.wallet_unlock_cache.remove(session_id).await;

    let _ = state
        .audit_service
        .log_user_event(AuditEventType::WalletLocked, user_id, Some(&headers))
        .await;

    Ok(Json(MessageResponse {
        message: "Wallet locked".into(),
    }))
}

/// GET /wallet/status - Get wallet status
pub async fn wallet_status<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<WalletStatusResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    let has_external_wallet = user.wallet_address.is_some();

    let material = state
        .wallet_material_repo
        .find_default_by_user(user_id)
        .await?;

    let unlocked = if let Some(session_id) = auth.session_id {
        state.wallet_unlock_cache.is_unlocked(session_id).await
    } else {
        false
    };

    match material {
        Some(m) => {
            let auth_method = repo_to_model_auth_method(&m.share_a_auth_method);
            Ok(Json(WalletStatusResponse {
                enrolled: true,
                unlocked,
                solana_pubkey: Some(m.solana_pubkey),
                auth_method: Some(auth_method),
                has_external_wallet,
            }))
        }
        None => Ok(Json(WalletStatusResponse {
            enrolled: false,
            unlocked: false,
            solana_pubkey: user.wallet_address,
            auth_method: None,
            has_external_wallet,
        })),
    }
}

/// GET /wallet/list - List all wallets for the authenticated user
pub async fn list_wallets<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<WalletListResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;

    let materials = state
        .wallet_material_repo
        .find_all_by_user(auth.user_id)
        .await?;

    let api_keys = state.api_key_repo.find_by_user_id(auth.user_id).await?;

    let wallets: Vec<WalletSummary> = materials
        .into_iter()
        .map(|m| {
            let api_key_label = m.api_key_id.and_then(|kid| {
                api_keys
                    .iter()
                    .find(|k| k.id == kid)
                    .map(|k| k.label.clone())
            });

            let auth_method = repo_to_model_auth_method(&m.share_a_auth_method);

            WalletSummary {
                id: m.id,
                solana_pubkey: m.solana_pubkey,
                share_a_auth_method: auth_method,
                api_key_label,
                created_at: m.created_at,
            }
        })
        .collect();

    Ok(Json(WalletListResponse { wallets }))
}
