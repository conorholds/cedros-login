//! Wallet handlers for server-side signing Solana wallet feature (v2)
//!
//! SECURITY MODEL:
//! - Share A: Encrypted ciphertext stored on server, decrypted server-side with user credential
//! - Share B: Plaintext stored on server (SSS math protects it - 1 share reveals nothing)
//! - Server combines shares JIT for signing, wipes immediately after
//! - Server NEVER stores seed or private key at rest

mod derived;
mod enroll;
mod info;
mod recovery;
mod rotation;
mod signing;
mod validation;

// Re-export all public handlers
pub use derived::{create_derived_wallet, delete_derived_wallet, list_all_wallets};
pub use enroll::wallet_enroll;
pub use info::{get_wallet_material, list_wallets, wallet_lock, wallet_status, wallet_unlock};
pub use recovery::{
    acknowledge_recovery, get_pending_recovery, get_share_b_for_recovery, wallet_recover,
};
pub use rotation::{rotate_user_secret, wallet_rotate};
pub use signing::sign_transaction;

use base64::{engine::general_purpose::STANDARD as BASE64, Engine};

use crate::errors::AppError;
use crate::models::ShareAAuthMethod;
use crate::repositories::KdfParams;

// Validation constants
pub(super) const MIN_SOLANA_PUBKEY_LEN: usize = 32;
pub(super) const MAX_SOLANA_PUBKEY_LEN: usize = 50;

/// HDL-1: Base58 alphabet (excludes 0, O, I, l to avoid confusion)
const BASE58_ALPHABET: &[u8] = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/// Validate that a string contains only valid base58 characters
pub(super) fn is_valid_base58(s: &str) -> bool {
    s.bytes().all(|b| BASE58_ALPHABET.contains(&b))
}

pub(super) fn decode_base64(input: &str, field_name: &str) -> Result<Vec<u8>, AppError> {
    BASE64
        .decode(input)
        .map_err(|_| AppError::Validation(format!("Invalid base64 in {}", field_name)))
}

pub(super) fn convert_auth_method(
    m: ShareAAuthMethod,
) -> crate::repositories::ShareAAuthMethod {
    match m {
        ShareAAuthMethod::Password => crate::repositories::ShareAAuthMethod::Password,
        ShareAAuthMethod::Pin => crate::repositories::ShareAAuthMethod::Pin,
        ShareAAuthMethod::Passkey => crate::repositories::ShareAAuthMethod::Passkey,
        ShareAAuthMethod::ApiKey => crate::repositories::ShareAAuthMethod::ApiKey,
    }
}

/// Convert repository auth method to model auth method
pub(super) fn repo_to_model_auth_method(
    m: &crate::repositories::ShareAAuthMethod,
) -> ShareAAuthMethod {
    match m {
        crate::repositories::ShareAAuthMethod::Password => ShareAAuthMethod::Password,
        crate::repositories::ShareAAuthMethod::Pin => ShareAAuthMethod::Pin,
        crate::repositories::ShareAAuthMethod::Passkey => ShareAAuthMethod::Passkey,
        crate::repositories::ShareAAuthMethod::ApiKey => ShareAAuthMethod::ApiKey,
    }
}

/// Extract and validate KDF/PRF/PIN fields for a given auth method.
///
/// Shared by enroll, recover, and rotate handlers.
pub(super) struct AuthMethodFields {
    pub share_a_kdf_salt: Option<String>,
    pub share_a_kdf_params: Option<crate::models::KdfParamsDto>,
    pub prf_salt: Option<String>,
    pub pin: Option<String>,
}

pub(super) async fn process_auth_method_fields<
    C: crate::callback::AuthCallback,
    E: crate::services::EmailService,
>(
    state: &std::sync::Arc<crate::AppState<C, E>>,
    auth_method: &ShareAAuthMethod,
    fields: &AuthMethodFields,
) -> Result<(Option<Vec<u8>>, Option<KdfParams>, Option<Vec<u8>>, Option<String>), AppError> {
    match auth_method {
        ShareAAuthMethod::Password | ShareAAuthMethod::ApiKey => {
            let kdf_salt_str = fields.share_a_kdf_salt.as_ref().ok_or_else(|| {
                AppError::Validation("shareAKdfSalt required for this auth method".into())
            })?;
            let kdf_params = fields.share_a_kdf_params.as_ref().ok_or_else(|| {
                AppError::Validation("shareAKdfParams required for this auth method".into())
            })?;

            let salt = decode_base64(kdf_salt_str, "shareAKdfSalt")?;
            validation::validate_kdf_salt(&salt)?;
            validation::validate_kdf_params(kdf_params)?;

            Ok((
                Some(salt),
                Some(KdfParams {
                    m_cost: kdf_params.m_cost,
                    t_cost: kdf_params.t_cost,
                    p_cost: kdf_params.p_cost,
                }),
                None,
                None,
            ))
        }
        ShareAAuthMethod::Pin => {
            let kdf_salt_str = fields.share_a_kdf_salt.as_ref().ok_or_else(|| {
                AppError::Validation("shareAKdfSalt required for PIN method".into())
            })?;
            let kdf_params = fields.share_a_kdf_params.as_ref().ok_or_else(|| {
                AppError::Validation("shareAKdfParams required for PIN method".into())
            })?;
            let pin = fields
                .pin
                .as_ref()
                .ok_or_else(|| AppError::Validation("pin required for PIN method".into()))?;

            let salt = decode_base64(kdf_salt_str, "shareAKdfSalt")?;
            validation::validate_kdf_salt(&salt)?;
            validation::validate_kdf_params(kdf_params)?;
            validation::validate_pin(pin)?;

            let pin_hash = state.password_service.hash(pin.to_string()).await?;

            Ok((
                Some(salt),
                Some(KdfParams {
                    m_cost: kdf_params.m_cost,
                    t_cost: kdf_params.t_cost,
                    p_cost: kdf_params.p_cost,
                }),
                None,
                Some(pin_hash),
            ))
        }
        ShareAAuthMethod::Passkey => {
            let prf_str = fields.prf_salt.as_ref().ok_or_else(|| {
                AppError::Validation("prfSalt required for passkey method".into())
            })?;

            let salt = decode_base64(prf_str, "prfSalt")?;
            validation::validate_prf_salt(&salt)?;

            Ok((None, None, Some(salt), None))
        }
    }
}

/// Resolve wallet material by auth context.
///
/// API key auth → look up wallet linked to this key.
/// JWT auth → default wallet (api_key_id IS NULL).
pub(super) async fn resolve_wallet<
    C: crate::callback::AuthCallback,
    E: crate::services::EmailService,
>(
    state: &std::sync::Arc<crate::AppState<C, E>>,
    auth: &crate::utils::AuthenticatedUser,
) -> Result<crate::repositories::WalletMaterialEntity, AppError> {
    if let Some(api_key_id) = auth.api_key_id {
        state
            .wallet_material_repo
            .find_by_api_key_id(api_key_id)
            .await?
            .ok_or_else(|| AppError::NotFound("No wallet for this API key".into()))
    } else {
        state
            .wallet_material_repo
            .find_default_by_user(auth.user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Wallet not enrolled".into()))
    }
}
