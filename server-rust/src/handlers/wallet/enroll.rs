//! POST /wallet/enroll - Create wallet material for authenticated user (v2)

use axum::{extract::State, http::HeaderMap, Json};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::config::WalletRecoveryMode;
use crate::errors::AppError;
use crate::models::{MessageResponse, WalletEnrollRequest};
use crate::repositories::{
    AuditEventType, CreateWalletMaterial, PendingWalletRecoveryEntity, RecoveryType,
};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

use super::validation;
use super::{convert_auth_method, decode_base64, process_auth_method_fields, AuthMethodFields};

/// POST /wallet/enroll - Create wallet material for authenticated user (v2)
///
/// The client performs:
/// 1. Generates 32-byte seed
/// 2. Splits seed into 3 Shamir shares (threshold 2)
/// 3. Encrypts Share A with password/PIN/passkey-derived key
/// 4. Sends Share B as plaintext (SSS math protects it)
/// 5. Shows Share C as BIP-39 mnemonic to user (never sent to server)
pub async fn wallet_enroll<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<WalletEnrollRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // Check if user logged in with their own Solana wallet
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    if user.wallet_address.is_some() {
        return Err(AppError::Validation(
            "Users who sign in with Solana wallet cannot enroll in embedded wallet. \
             Use your connected wallet for signing."
                .into(),
        ));
    }

    // Validate inputs
    validation::validate_enroll_request(&req)?;

    // Check user doesn't already have wallet material
    if state.wallet_material_repo.exists_for_user(user_id).await? {
        return Err(AppError::Validation("Wallet already enrolled".into()));
    }

    // Decode base64 fields
    let share_a_ciphertext = decode_base64(&req.share_a_ciphertext, "shareACiphertext")?;
    let share_a_nonce = decode_base64(&req.share_a_nonce, "shareANonce")?;
    let share_b = decode_base64(&req.share_b, "shareB")?;

    validation::validate_nonce(&share_a_nonce, "shareANonce")?;

    // Process auth-method-specific fields
    let fields = AuthMethodFields {
        share_a_kdf_salt: req.share_a_kdf_salt.clone(),
        share_a_kdf_params: req.share_a_kdf_params.clone(),
        prf_salt: req.prf_salt.clone(),
        pin: req.pin.clone(),
    };
    let (share_a_kdf_salt, share_a_kdf_params, prf_salt, share_a_pin_hash) =
        process_auth_method_fields(&state, &req.share_a_auth_method, &fields).await?;

    // Create wallet material
    let material = CreateWalletMaterial {
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

    state.wallet_material_repo.create(material).await?;

    // Store recovery data if recovery mode is enabled and data was provided
    let recovery_mode = &state.config.wallet.recovery_mode;
    if *recovery_mode != WalletRecoveryMode::None {
        if let Some(recovery_data) = &req.recovery_data {
            let recovery_type = match recovery_mode {
                WalletRecoveryMode::ShareCOnly => RecoveryType::ShareC,
                WalletRecoveryMode::FullSeed => RecoveryType::FullSeed,
                WalletRecoveryMode::None => unreachable!(),
            };

            // F-17: Encrypt recovery data at rest to protect sensitive seed/share material
            let encrypted_data = state.encryption_service.encrypt(recovery_data)?;
            let pending_recovery =
                PendingWalletRecoveryEntity::new(user_id, recovery_type, encrypted_data);

            if let Err(e) = state
                .storage
                .pending_wallet_recovery_repo
                .create(pending_recovery)
                .await
            {
                tracing::warn!(
                    user_id = %user_id,
                    error = %e,
                    "Failed to store pending wallet recovery data"
                );
            }
        }
    }

    // Log audit event
    let _ = state
        .audit_service
        .log_user_event(AuditEventType::WalletEnrolled, user_id, Some(&headers))
        .await;

    Ok(Json(MessageResponse {
        message: "Wallet enrolled successfully".into(),
    }))
}
