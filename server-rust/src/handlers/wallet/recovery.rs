//! Wallet recovery handlers

use axum::{extract::State, http::HeaderMap, Json};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{
    AcknowledgeRecoveryRequest, MessageResponse, PendingWalletRecoveryResponse,
    ShareCRecoveryRequest, ShareCRecoveryResponse, WalletRecoverRequest,
};
use crate::repositories::{AuditEventType, CreateWalletMaterial};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

use super::validation;
use super::{
    convert_auth_method, decode_base64, process_auth_method_fields, AuthMethodFields,
};

/// POST /wallet/recover - Recover wallet with recovery phrase
///
/// SECURITY: Pubkey match proves ownership (only holder of recovery phrase can derive it)
pub async fn wallet_recover<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<WalletRecoverRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    validation::validate_recover_request(&req)?;

    let existing = state
        .wallet_material_repo
        .find_default_by_user(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("No wallet enrolled to recover".into()))?;

    // SECURITY: Verify pubkey matches - proves ownership via recovery phrase
    if existing.solana_pubkey != req.solana_pubkey {
        return Err(AppError::Validation(
            "Pubkey does not match. Recovery phrase may be incorrect.".into(),
        ));
    }

    let share_a_ciphertext = decode_base64(&req.share_a_ciphertext, "shareACiphertext")?;
    let share_a_nonce = decode_base64(&req.share_a_nonce, "shareANonce")?;
    let share_b = decode_base64(&req.share_b, "shareB")?;
    validation::validate_nonce(&share_a_nonce, "shareANonce")?;

    let fields = AuthMethodFields {
        share_a_kdf_salt: req.share_a_kdf_salt.clone(),
        share_a_kdf_params: req.share_a_kdf_params.clone(),
        prf_salt: req.prf_salt.clone(),
        pin: req.pin.clone(),
    };
    let (share_a_kdf_salt, share_a_kdf_params, prf_salt, share_a_pin_hash) =
        process_auth_method_fields(&state, &req.share_a_auth_method, &fields).await?;

    // F-12: Delete existing and create new atomically
    let create_params = CreateWalletMaterial {
        user_id,
        solana_pubkey: req.solana_pubkey,
        share_a_auth_method: convert_auth_method(req.share_a_auth_method),
        share_a_ciphertext,
        share_a_nonce,
        share_a_kdf_salt,
        share_a_kdf_params,
        prf_salt,
        share_a_pin_hash,
        share_b,
        api_key_id: None,
    };

    #[cfg(feature = "postgres")]
    if let Some(pool) = state.postgres_pool.as_ref() {
        crate::repositories::TransactionalOps::recover_wallet_atomic(pool, create_params).await?;
    } else {
        state.wallet_material_repo.delete_by_user(user_id).await?;
        state.wallet_material_repo.create(create_params).await?;
    }

    #[cfg(not(feature = "postgres"))]
    {
        state.wallet_material_repo.delete_by_user(user_id).await?;
        state.wallet_material_repo.create(create_params).await?;
    }

    let _ = state
        .audit_service
        .log_user_event(AuditEventType::WalletRecovered, user_id, Some(&headers))
        .await;

    Ok(Json(MessageResponse {
        message: "Wallet recovered successfully".into(),
    }))
}

/// POST /wallet/share-b - Get Share B for Share C recovery mode
///
/// SECURITY: Share C ownership is verified by deriving pubkey from combined shares.
pub async fn get_share_b_for_recovery<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<ShareCRecoveryRequest>,
) -> Result<Json<ShareCRecoveryResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    if state.config.wallet.recovery_mode != crate::config::WalletRecoveryMode::ShareCOnly {
        return Err(AppError::Validation(
            "Share C recovery is not enabled. Use full seed recovery instead.".into(),
        ));
    }

    let material = state
        .wallet_material_repo
        .find_default_by_user(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("No wallet enrolled".into()))?;

    let share_c = decode_base64(&req.share_c, "shareC")?;

    if share_c.len() != 32 {
        return Err(AppError::Validation(format!(
            "Invalid Share C length: expected 32 bytes, got {}",
            share_c.len()
        )));
    }

    let is_valid = state
        .wallet_signing_service
        .verify_share_c(&material, &share_c)?;

    if !is_valid {
        return Err(AppError::Validation(
            "Invalid Share C: derived pubkey does not match wallet".into(),
        ));
    }

    Ok(Json(ShareCRecoveryResponse {
        share_b: BASE64.encode(&material.share_b),
        solana_pubkey: material.solana_pubkey,
    }))
}

/// GET /wallet/pending-recovery - Check for pending recovery data
pub async fn get_pending_recovery<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<PendingWalletRecoveryResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    let pending = state
        .storage
        .pending_wallet_recovery_repo
        .find_by_user_id(user_id)
        .await?;

    match pending {
        Some(entity) => {
            // F-17: Decrypt recovery data (encrypted at rest since F-17)
            let recovery_data = state.encryption_service.decrypt(&entity.recovery_data)?;
            Ok(Json(PendingWalletRecoveryResponse {
                has_pending_recovery: true,
                recovery_type: Some(entity.recovery_type.to_string()),
                recovery_phrase: Some(recovery_data),
                expires_at: Some(entity.expires_at),
            }))
        }
        None => Ok(Json(PendingWalletRecoveryResponse {
            has_pending_recovery: false,
            recovery_type: None,
            recovery_phrase: None,
            expires_at: None,
        })),
    }
}

/// POST /wallet/acknowledge-recovery - Acknowledge receipt of recovery phrase
pub async fn acknowledge_recovery<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<AcknowledgeRecoveryRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    if !req.confirmed {
        return Err(AppError::Validation(
            "You must confirm that you have saved your recovery phrase".into(),
        ));
    }

    let deleted = state
        .storage
        .pending_wallet_recovery_repo
        .delete_by_user_id(user_id)
        .await?;

    if deleted {
        let _ = state
            .audit_service
            .log_user_event(
                AuditEventType::WalletRecoveryAcknowledged,
                user_id,
                Some(&headers),
            )
            .await;

        Ok(Json(MessageResponse {
            message: "Recovery phrase acknowledged and deleted from server".into(),
        }))
    } else {
        Ok(Json(MessageResponse {
            message: "No pending recovery data to acknowledge".into(),
        }))
    }
}
