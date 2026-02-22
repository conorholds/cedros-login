//! Secret rotation and wallet replacement handlers

use axum::{extract::State, http::HeaderMap, Json};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{MessageResponse, RotateUserSecretRequest, WalletRotateRequest};
use crate::repositories::{AuditEventType, CreateWalletMaterial, RotateUserSecret};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

use super::signing::verify_unlock_credential;
use super::validation;
use super::{
    convert_auth_method, decode_base64, process_auth_method_fields, resolve_wallet,
    AuthMethodFields,
};

/// POST /wallet/rotate_user_secret - Rotate user secret (re-encrypt Share A)
///
/// Used when user changes password/PIN or switches auth method.
pub async fn rotate_user_secret<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<RotateUserSecretRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    let current = state
        .wallet_material_repo
        .find_default_by_user(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Wallet not enrolled".into()))?;

    verify_unlock_credential(&state, user_id, &current, &req.current_credential).await?;

    let share_a_ciphertext = decode_base64(&req.share_a_ciphertext, "shareACiphertext")?;
    let share_a_nonce = decode_base64(&req.share_a_nonce, "shareANonce")?;
    validation::validate_nonce(&share_a_nonce, "shareANonce")?;

    let new_auth_method = convert_auth_method(req.new_auth_method);
    let fields = AuthMethodFields {
        share_a_kdf_salt: req.share_a_kdf_salt.clone(),
        share_a_kdf_params: req.share_a_kdf_params.clone(),
        prf_salt: req.prf_salt.clone(),
        pin: req.new_pin.clone(),
    };
    let (share_a_kdf_salt, share_a_kdf_params, prf_salt, share_a_pin_hash) =
        process_auth_method_fields(&state, &req.new_auth_method, &fields).await?;

    let params = RotateUserSecret {
        new_auth_method,
        share_a_ciphertext,
        share_a_nonce,
        share_a_kdf_salt,
        share_a_kdf_params,
        prf_salt,
        share_a_pin_hash,
    };

    state
        .wallet_material_repo
        .rotate_user_secret(user_id, params)
        .await?;

    let _ = state
        .audit_service
        .log_user_event(
            AuditEventType::WalletUserSecretRotated,
            user_id,
            Some(&headers),
        )
        .await;

    Ok(Json(MessageResponse {
        message: "User secret rotated successfully".into(),
    }))
}

/// POST /wallet/rotate - Replace wallet with new key material (irreversible)
///
/// Deletes the current wallet and creates a new one with a new pubkey.
pub async fn wallet_rotate<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<WalletRotateRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // SRV-08: Require recent strong auth for session-based users (not API key).
    // Wallet rotation is irreversible; step-up auth prevents stale session abuse.
    if let Some(session_id) = auth.session_id {
        state.step_up_service.require_step_up(session_id).await?;
    }

    validation::validate_rotate_request(&req)?;

    let current = resolve_wallet(&state, &auth).await?;

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

    state
        .wallet_material_repo
        .delete_by_id(current.id, user_id)
        .await?;

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
        api_key_id: auth.api_key_id,
    };

    state.wallet_material_repo.create(create_params).await?;

    let _ = state
        .audit_service
        .log_user_event(AuditEventType::WalletRecovered, user_id, Some(&headers))
        .await;

    Ok(Json(MessageResponse {
        message: "Wallet rotated successfully. Old wallet has been deleted.".into(),
    }))
}
