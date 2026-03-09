//! Server-side wallet auto-enrollment during registration
//!
//! Generates and stores wallet material for email users who have a password.
//! Non-fatal: logs warnings on failure, never breaks registration.

use axum::http::HeaderMap;
use std::sync::Arc;
use uuid::Uuid;
use zeroize::Zeroize;

use rand::rngs::OsRng;
use rand::RngCore;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::{
    AuditEventType, CreateWalletMaterial, KdfParams, ShareAAuthMethod,
};
use crate::services::derive_pubkey_from_seed;
use crate::services::EmailService;
use crate::AppState;

/// Auto-enroll an embedded wallet for a newly registered user.
///
/// Skips silently if:
/// - `feature_wallet_signing` is not enabled
/// - `postlogin_wallet_enroll_enabled` is not enabled
/// - User already has a wallet (idempotent)
///
/// # Security
///
/// - Seed and shares are zeroized immediately after use
/// - Share A is encrypted with the user's registration password (Argon2id)
/// - Server never stores seed or private key at rest
pub async fn auto_enroll_wallet<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: Uuid,
    password: &str,
    headers: &HeaderMap,
) -> Result<(), AppError> {
    // Check feature flags
    let wallet_signing = state
        .settings_service
        .get_bool("feature_wallet_signing")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);
    let wallet_enroll = state
        .settings_service
        .get_bool("postlogin_wallet_enroll_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);

    if !wallet_signing || !wallet_enroll {
        return Ok(());
    }

    // Idempotent: skip if user already has a wallet
    if state
        .wallet_material_repo
        .exists_for_user(user_id)
        .await?
    {
        return Ok(());
    }

    // 1. Generate 32-byte seed
    let mut seed = [0u8; 32];
    OsRng.fill_bytes(&mut seed);

    // 2. Split into 3 Shamir shares (threshold 2)
    let (mut share_a, share_b, _share_c) =
        state.wallet_signing_service.split_secret(&seed)?;

    // 3. Derive Solana pubkey from seed
    let solana_pubkey = derive_pubkey_from_seed(&seed)?;

    // Seed no longer needed — wipe immediately
    seed.zeroize();

    // 4. Derive encryption key from password via Argon2id
    let kdf_params = KdfParams::default();
    let mut salt = [0u8; 16];
    OsRng.fill_bytes(&mut salt);

    let mut key = state
        .wallet_signing_service
        .derive_key_argon2(
            password.as_bytes().to_vec(),
            salt.to_vec(),
            kdf_params.clone(),
        )
        .await?;

    // 5. Encrypt Share A with derived key
    let (ciphertext, nonce) = state
        .wallet_signing_service
        .encrypt_aes_gcm(&key, &share_a)?;

    // Wipe sensitive intermediates
    key.zeroize();
    share_a.zeroize();

    // 6. Store wallet material
    let material = CreateWalletMaterial {
        user_id,
        solana_pubkey,
        share_a_auth_method: ShareAAuthMethod::Password,
        share_a_ciphertext: ciphertext,
        share_a_nonce: nonce.to_vec(),
        share_a_kdf_salt: Some(salt.to_vec()),
        share_a_kdf_params: Some(kdf_params),
        prf_salt: None,
        share_a_pin_hash: None,
        share_b,
        api_key_id: None,
    };

    state.wallet_material_repo.create(material).await?;

    // 7. Audit log
    let _ = state
        .audit_service
        .log_user_event(AuditEventType::WalletEnrolled, user_id, Some(headers))
        .await;

    Ok(())
}
