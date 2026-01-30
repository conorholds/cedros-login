//! Wallet handlers for server-side signing Solana wallet feature (v2)
//!
//! SECURITY MODEL:
//! - Share A: Encrypted ciphertext stored on server, decrypted server-side with user credential
//! - Share B: Plaintext stored on server (SSS math protects it - 1 share reveals nothing)
//! - Server combines shares JIT for signing, wipes immediately after
//! - Server NEVER stores seed or private key at rest

use axum::{extract::State, http::HeaderMap, Json};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::config::WalletRecoveryMode;
use crate::errors::AppError;
use crate::models::{
    AcknowledgeRecoveryRequest, KdfParamsDto, MessageResponse, PendingWalletRecoveryResponse,
    RotateUserSecretRequest, ShareAAuthMethod, ShareCRecoveryRequest, ShareCRecoveryResponse,
    SignTransactionRequest, SignTransactionResponse, WalletEnrollRequest, WalletMaterialResponse,
    WalletRecoverRequest, WalletStatusResponse, WalletUnlockRequest, WalletUnlockResponse,
};
use crate::repositories::{
    AuditEventType, CreateWalletMaterial, KdfParams, PendingWalletRecoveryEntity, RecoveryType,
    RotateUserSecret,
};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

// Validation constants
const MIN_SOLANA_PUBKEY_LEN: usize = 32;
const MAX_SOLANA_PUBKEY_LEN: usize = 50;
const NONCE_LEN: usize = 12;
const MIN_KDF_SALT_LEN: usize = 16;
const PRF_SALT_LEN: usize = 32;
const MIN_PIN_LEN: usize = 6;
const MAX_PIN_LEN: usize = 20;

/// HDL-1: Base58 alphabet (excludes 0, O, I, l to avoid confusion)
const BASE58_ALPHABET: &[u8] = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/// Validate that a string contains only valid base58 characters
fn is_valid_base58(s: &str) -> bool {
    s.bytes().all(|b| BASE58_ALPHABET.contains(&b))
}

// KDF parameter bounds (OWASP minimums + DoS protection)
const MIN_M_COST: u32 = 19456; // 19 MiB minimum
const MAX_M_COST: u32 = 1048576; // 1 GiB maximum
const MIN_T_COST: u32 = 2;
const MAX_T_COST: u32 = 10;
const MIN_P_COST: u32 = 1;
const MAX_P_COST: u32 = 4;

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
    // Authenticate user
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // Check if user logged in with their own Solana wallet
    // Users with external wallets don't need (and shouldn't use) SSS embedded wallet
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
    validate_enroll_request(&req)?;

    // Check user doesn't already have wallet material
    if state.wallet_material_repo.exists_for_user(user_id).await? {
        return Err(AppError::Validation("Wallet already enrolled".into()));
    }

    // Decode base64 fields
    let share_a_ciphertext = decode_base64(&req.share_a_ciphertext, "shareACiphertext")?;
    let share_a_nonce = decode_base64(&req.share_a_nonce, "shareANonce")?;
    let share_b = decode_base64(&req.share_b, "shareB")?;

    // Validate nonce
    validate_nonce(&share_a_nonce, "shareANonce")?;

    // Process auth-method-specific fields
    let (share_a_kdf_salt, share_a_kdf_params, prf_salt, share_a_pin_hash) =
        match req.share_a_auth_method {
            ShareAAuthMethod::Password => {
                // Password method uses Argon2id KDF
                let kdf_salt = req.share_a_kdf_salt.as_ref().ok_or_else(|| {
                    AppError::Validation("shareAKdfSalt required for password method".into())
                })?;
                let kdf_params = req.share_a_kdf_params.as_ref().ok_or_else(|| {
                    AppError::Validation("shareAKdfParams required for password method".into())
                })?;

                let salt = decode_base64(kdf_salt, "shareAKdfSalt")?;
                validate_kdf_salt(&salt)?;
                validate_kdf_params(kdf_params)?;

                (
                    Some(salt),
                    Some(KdfParams {
                        m_cost: kdf_params.m_cost,
                        t_cost: kdf_params.t_cost,
                        p_cost: kdf_params.p_cost,
                    }),
                    None,
                    None,
                )
            }
            ShareAAuthMethod::Pin => {
                // PIN method uses Argon2id KDF + stores PIN hash
                let kdf_salt = req.share_a_kdf_salt.as_ref().ok_or_else(|| {
                    AppError::Validation("shareAKdfSalt required for PIN method".into())
                })?;
                let kdf_params = req.share_a_kdf_params.as_ref().ok_or_else(|| {
                    AppError::Validation("shareAKdfParams required for PIN method".into())
                })?;
                let pin = req
                    .pin
                    .as_ref()
                    .ok_or_else(|| AppError::Validation("pin required for PIN method".into()))?;

                let salt = decode_base64(kdf_salt, "shareAKdfSalt")?;
                validate_kdf_salt(&salt)?;
                validate_kdf_params(kdf_params)?;
                validate_pin(pin)?;

                // Hash the PIN with Argon2id (reuse password service)
                let pin_hash = state.password_service.hash(pin.to_string()).await?;

                (
                    Some(salt),
                    Some(KdfParams {
                        m_cost: kdf_params.m_cost,
                        t_cost: kdf_params.t_cost,
                        p_cost: kdf_params.p_cost,
                    }),
                    None,
                    Some(pin_hash),
                )
            }
            ShareAAuthMethod::Passkey => {
                // Passkey method uses PRF extension
                let prf = req.prf_salt.as_ref().ok_or_else(|| {
                    AppError::Validation("prfSalt required for passkey method".into())
                })?;

                let salt = decode_base64(prf, "prfSalt")?;
                validate_prf_salt(&salt)?;

                (None, None, Some(salt), None)
            }
        };

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

            let pending_recovery =
                PendingWalletRecoveryEntity::new(user_id, recovery_type, recovery_data.clone());

            // Store for later acknowledgment - failure shouldn't block enrollment
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
        .find_by_user(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Wallet not enrolled".into()))?;

    // Convert repository auth method to model auth method
    let auth_method = match material.share_a_auth_method {
        crate::repositories::ShareAAuthMethod::Password => ShareAAuthMethod::Password,
        crate::repositories::ShareAAuthMethod::Pin => ShareAAuthMethod::Pin,
        crate::repositories::ShareAAuthMethod::Passkey => ShareAAuthMethod::Passkey,
    };

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
/// Subsequent sign requests won't require credential until TTL expires.
pub async fn wallet_unlock<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<WalletUnlockRequest>,
) -> Result<Json<WalletUnlockResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // Session ID is required for unlock
    let session_id = auth
        .session_id
        .ok_or_else(|| AppError::Unauthorized("Session required for wallet unlock".into()))?;

    // Get wallet material
    let material = state
        .wallet_material_repo
        .find_by_user(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Wallet not enrolled".into()))?;

    // Convert credential to service format
    let credential = convert_credential(&req.credential)?;

    // Verify credential and get derived key
    let key = state
        .wallet_signing_service
        .verify_and_derive_key(&material, &credential)
        .await?;

    // Cache the key for the session
    state.wallet_unlock_cache.store(session_id, key).await;

    // Log audit event
    let _ = state
        .audit_service
        .log_user_event(AuditEventType::WalletUnlocked, user_id, Some(&headers))
        .await;

    // Default TTL is 15 minutes (900 seconds)
    Ok(Json(WalletUnlockResponse {
        unlocked: true,
        ttl_seconds: 15 * 60,
    }))
}

/// POST /wallet/lock - Lock wallet (clear cached key)
///
/// Clears the cached encryption key, requiring credential for next sign.
pub async fn wallet_lock<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // Session ID is required for lock
    let session_id = auth
        .session_id
        .ok_or_else(|| AppError::Unauthorized("Session required for wallet lock".into()))?;

    // Clear the cached key
    state.wallet_unlock_cache.remove(session_id).await;

    // Log audit event
    let _ = state
        .audit_service
        .log_user_event(AuditEventType::WalletLocked, user_id, Some(&headers))
        .await;

    Ok(Json(MessageResponse {
        message: "Wallet locked".into(),
    }))
}

/// GET /wallet/status - Get wallet status
///
/// Returns wallet status including:
/// - SSS embedded wallet enrollment/unlock state
/// - Whether user has external Solana wallet (signed in via wallet adapter)
pub async fn wallet_status<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<WalletStatusResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // Get user to check for external wallet
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    let has_external_wallet = user.wallet_address.is_some();

    // Check if SSS wallet is enrolled
    let material = state.wallet_material_repo.find_by_user(user_id).await?;

    // Check if wallet is unlocked (requires session)
    let unlocked = if let Some(session_id) = auth.session_id {
        state.wallet_unlock_cache.is_unlocked(session_id).await
    } else {
        false
    };

    match material {
        Some(m) => {
            let auth_method = match m.share_a_auth_method {
                crate::repositories::ShareAAuthMethod::Password => ShareAAuthMethod::Password,
                crate::repositories::ShareAAuthMethod::Pin => ShareAAuthMethod::Pin,
                crate::repositories::ShareAAuthMethod::Passkey => ShareAAuthMethod::Passkey,
            };
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
            // If user has external wallet, return their pubkey
            solana_pubkey: user.wallet_address,
            auth_method: None,
            has_external_wallet,
        })),
    }
}

/// POST /wallet/recover - Recover wallet with recovery phrase
///
/// Recovery flow:
/// 1. User enters recovery phrase (24 words) on client
/// 2. Client decodes to seed, re-derives pubkey
/// 3. Client re-splits seed, re-encrypts with new credential
/// 4. Server verifies pubkey matches existing wallet, then replaces material
///
/// SECURITY: Pubkey match proves ownership (only holder of recovery phrase can derive it)
pub async fn wallet_recover<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<WalletRecoverRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // Validate request format (reuse enroll validation)
    validate_recover_request(&req)?;

    // Get existing wallet material
    let existing = state
        .wallet_material_repo
        .find_by_user(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("No wallet enrolled to recover".into()))?;

    // SECURITY: Verify pubkey matches - proves ownership via recovery phrase
    if existing.solana_pubkey != req.solana_pubkey {
        return Err(AppError::Validation(
            "Pubkey does not match. Recovery phrase may be incorrect.".into(),
        ));
    }

    // Decode base64 fields
    let share_a_ciphertext = decode_base64(&req.share_a_ciphertext, "shareACiphertext")?;
    let share_a_nonce = decode_base64(&req.share_a_nonce, "shareANonce")?;
    let share_b = decode_base64(&req.share_b, "shareB")?;

    validate_nonce(&share_a_nonce, "shareANonce")?;

    // Process auth-method-specific fields
    let (share_a_kdf_salt, share_a_kdf_params, prf_salt, share_a_pin_hash) =
        match req.share_a_auth_method {
            ShareAAuthMethod::Password => {
                let kdf_salt = req.share_a_kdf_salt.as_ref().ok_or_else(|| {
                    AppError::Validation("shareAKdfSalt required for password method".into())
                })?;
                let kdf_params = req.share_a_kdf_params.as_ref().ok_or_else(|| {
                    AppError::Validation("shareAKdfParams required for password method".into())
                })?;

                let salt = decode_base64(kdf_salt, "shareAKdfSalt")?;
                validate_kdf_salt(&salt)?;
                validate_kdf_params(kdf_params)?;

                (
                    Some(salt),
                    Some(KdfParams {
                        m_cost: kdf_params.m_cost,
                        t_cost: kdf_params.t_cost,
                        p_cost: kdf_params.p_cost,
                    }),
                    None,
                    None,
                )
            }
            ShareAAuthMethod::Pin => {
                let kdf_salt = req.share_a_kdf_salt.as_ref().ok_or_else(|| {
                    AppError::Validation("shareAKdfSalt required for PIN method".into())
                })?;
                let kdf_params = req.share_a_kdf_params.as_ref().ok_or_else(|| {
                    AppError::Validation("shareAKdfParams required for PIN method".into())
                })?;
                let pin = req
                    .pin
                    .as_ref()
                    .ok_or_else(|| AppError::Validation("pin required for PIN method".into()))?;

                let salt = decode_base64(kdf_salt, "shareAKdfSalt")?;
                validate_kdf_salt(&salt)?;
                validate_kdf_params(kdf_params)?;
                validate_pin(pin)?;

                let pin_hash = state.password_service.hash(pin.to_string()).await?;

                (
                    Some(salt),
                    Some(KdfParams {
                        m_cost: kdf_params.m_cost,
                        t_cost: kdf_params.t_cost,
                        p_cost: kdf_params.p_cost,
                    }),
                    None,
                    Some(pin_hash),
                )
            }
            ShareAAuthMethod::Passkey => {
                let prf_salt_str = req.prf_salt.as_ref().ok_or_else(|| {
                    AppError::Validation("prfSalt required for passkey method".into())
                })?;

                let salt = decode_base64(prf_salt_str, "prfSalt")?;
                validate_prf_salt(&salt)?;

                (None, None, Some(salt), None)
            }
        };

    // Delete existing and create new (atomic replacement)
    state.wallet_material_repo.delete_by_user(user_id).await?;

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
    };

    state.wallet_material_repo.create(create_params).await?;

    // Log audit event
    let _ = state
        .audit_service
        .log_user_event(AuditEventType::WalletRecovered, user_id, Some(&headers))
        .await;

    Ok(Json(MessageResponse {
        message: "Wallet recovered successfully".into(),
    }))
}

fn validate_recover_request(req: &WalletRecoverRequest) -> Result<(), AppError> {
    if req.solana_pubkey.len() < MIN_SOLANA_PUBKEY_LEN
        || req.solana_pubkey.len() > MAX_SOLANA_PUBKEY_LEN
    {
        return Err(AppError::Validation(
            "Invalid Solana pubkey length (expected 32-50 characters)".into(),
        ));
    }

    if !is_valid_base58(&req.solana_pubkey) {
        return Err(AppError::Validation(
            "Invalid Solana pubkey: contains invalid base58 characters".into(),
        ));
    }

    Ok(())
}

/// POST /wallet/share-b - Get Share B for Share C recovery mode
///
/// This endpoint enables the "share_c_only" recovery mode where:
/// 1. User only received Share C during enrollment (not the full seed)
/// 2. To recover, user enters Share C
/// 3. Server verifies Share C ownership by combining B+C → seed → pubkey
/// 4. If pubkey matches, server returns Share B
/// 5. Client combines B+C → seed, re-splits, and calls /wallet/recover
///
/// SECURITY: Share C ownership is verified by deriving pubkey from combined shares.
/// Only the holder of the correct Share C can derive the matching pubkey.
pub async fn get_share_b_for_recovery<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<ShareCRecoveryRequest>,
) -> Result<Json<ShareCRecoveryResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // Check recovery mode - this endpoint only works in share_c_only mode
    if state.config.wallet.recovery_mode != crate::config::WalletRecoveryMode::ShareCOnly {
        return Err(AppError::Validation(
            "Share C recovery is not enabled. Use full seed recovery instead.".into(),
        ));
    }

    // Get wallet material
    let material = state
        .wallet_material_repo
        .find_by_user(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("No wallet enrolled".into()))?;

    // Decode Share C from base64
    let share_c = decode_base64(&req.share_c, "shareC")?;

    // Validate Share C length (should be 32 bytes from mnemonic entropy)
    if share_c.len() != 32 {
        return Err(AppError::Validation(format!(
            "Invalid Share C length: expected 32 bytes, got {}",
            share_c.len()
        )));
    }

    // Verify Share C ownership
    let is_valid = state
        .wallet_signing_service
        .verify_share_c(&material, &share_c)?;

    if !is_valid {
        return Err(AppError::Validation(
            "Invalid Share C: derived pubkey does not match wallet".into(),
        ));
    }

    // Share C verified - return Share B
    Ok(Json(ShareCRecoveryResponse {
        share_b: BASE64.encode(&material.share_b),
        solana_pubkey: material.solana_pubkey,
    }))
}

/// POST /wallet/sign - Sign a transaction
///
/// Server-side signing flow:
/// 1. If credential provided: verify and use it
/// 2. If no credential: use cached key from session (if unlocked)
/// 3. Server decrypts Share A, combines A + B → seed
/// 4. Server signs transaction
/// 5. Server wipes seed from memory
/// 6. Returns signature
///
/// SEC-008: All failure modes return the same generic error to prevent
/// wallet enrollment enumeration attacks.
pub async fn sign_transaction<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<SignTransactionRequest>,
) -> Result<Json<SignTransactionResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // SEC-008: Use inner function to unify all error responses
    match sign_transaction_inner(&state, &auth, &req, &headers).await {
        Ok(response) => Ok(response),
        Err(e) => {
            // Log actual error for debugging but return generic error
            tracing::warn!(
                user_id = %user_id,
                error = %e,
                "Wallet sign failed"
            );
            Err(AppError::Unauthorized(
                "Unable to sign transaction. Ensure wallet is enrolled and credentials are correct.".into()
            ))
        }
    }
}

/// Inner sign function that returns detailed errors (not exposed to client)
async fn sign_transaction_inner<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    auth: &crate::utils::AuthenticatedUser,
    req: &SignTransactionRequest,
    headers: &HeaderMap,
) -> Result<Json<SignTransactionResponse>, AppError> {
    let user_id = auth.user_id;

    // Get wallet material
    let material = state
        .wallet_material_repo
        .find_by_user(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Wallet not enrolled".into()))?;

    // Decode transaction from base64
    let transaction = decode_base64(&req.transaction, "transaction")?;

    // Sign using credential or cached key
    let signature = match &req.credential {
        Some(cred) => {
            // Credential provided - use it directly
            let credential = convert_credential(cred)?;
            state
                .wallet_signing_service
                .sign_transaction(&material, &credential, &transaction)
                .await?
        }
        None => {
            // No credential - try cached key
            let session_id = auth.session_id.ok_or_else(|| {
                AppError::Unauthorized("Session required when no credential provided".into())
            })?;

            let cached_key = state
                .wallet_unlock_cache
                .get(session_id)
                .await
                .ok_or_else(|| AppError::Unauthorized("Wallet not unlocked".into()))?;

            state
                .wallet_signing_service
                .sign_transaction_with_cached_key(&material, &cached_key, &transaction)?
        }
    };

    // Log audit event
    let _ = state
        .audit_service
        .log_user_event(
            AuditEventType::WalletTransactionSigned,
            user_id,
            Some(headers),
        )
        .await;

    Ok(Json(SignTransactionResponse {
        signature: BASE64.encode(&signature),
        pubkey: material.solana_pubkey,
    }))
}

/// Convert model credential to service credential
fn convert_credential(
    credential: &crate::models::UnlockCredential,
) -> Result<crate::services::WalletUnlockCredential, AppError> {
    use crate::models::UnlockCredential as ModelCred;
    use crate::services::WalletUnlockCredential as ServiceCred;

    match credential {
        ModelCred::Password(p) => Ok(ServiceCred::Password(p.clone())),
        ModelCred::Pin(p) => Ok(ServiceCred::Pin(p.clone())),
        ModelCred::PrfOutput(p) => {
            let bytes = decode_base64(p, "prfOutput")?;
            Ok(ServiceCred::PrfOutput(bytes))
        }
    }
}

// Note: rotate_device_share removed in v2 - Share B is plaintext, no rotation needed

/// POST /wallet/rotate_user_secret - Rotate user secret (re-encrypt Share A)
///
/// Used when user changes password/PIN or switches auth method.
/// Requires current credential for verification.
pub async fn rotate_user_secret<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<RotateUserSecretRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let user_id = auth.user_id;

    // Get current wallet material
    let current = state
        .wallet_material_repo
        .find_by_user(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Wallet not enrolled".into()))?;

    // Verify current credential
    verify_unlock_credential(&state, user_id, &current, &req.current_credential).await?;

    // Decode base64 fields
    let share_a_ciphertext = decode_base64(&req.share_a_ciphertext, "shareACiphertext")?;
    let share_a_nonce = decode_base64(&req.share_a_nonce, "shareANonce")?;

    // Validate nonce
    validate_nonce(&share_a_nonce, "shareANonce")?;

    // Process auth-method-specific fields for new method
    let new_auth_method = convert_auth_method(req.new_auth_method);
    let (share_a_kdf_salt, share_a_kdf_params, prf_salt, share_a_pin_hash) =
        match req.new_auth_method {
            ShareAAuthMethod::Password => {
                let kdf_salt = req
                    .share_a_kdf_salt
                    .as_ref()
                    .ok_or_else(|| AppError::Validation("shareAKdfSalt required".into()))?;
                let kdf_params = req
                    .share_a_kdf_params
                    .as_ref()
                    .ok_or_else(|| AppError::Validation("shareAKdfParams required".into()))?;

                let salt = decode_base64(kdf_salt, "shareAKdfSalt")?;
                validate_kdf_salt(&salt)?;
                validate_kdf_params(kdf_params)?;

                (
                    Some(salt),
                    Some(KdfParams {
                        m_cost: kdf_params.m_cost,
                        t_cost: kdf_params.t_cost,
                        p_cost: kdf_params.p_cost,
                    }),
                    None,
                    None,
                )
            }
            ShareAAuthMethod::Pin => {
                let kdf_salt = req
                    .share_a_kdf_salt
                    .as_ref()
                    .ok_or_else(|| AppError::Validation("shareAKdfSalt required".into()))?;
                let kdf_params = req
                    .share_a_kdf_params
                    .as_ref()
                    .ok_or_else(|| AppError::Validation("shareAKdfParams required".into()))?;
                let pin = req
                    .new_pin
                    .as_ref()
                    .ok_or_else(|| AppError::Validation("newPin required for PIN method".into()))?;

                let salt = decode_base64(kdf_salt, "shareAKdfSalt")?;
                validate_kdf_salt(&salt)?;
                validate_kdf_params(kdf_params)?;
                validate_pin(pin)?;

                let pin_hash = state.password_service.hash(pin.to_string()).await?;

                (
                    Some(salt),
                    Some(KdfParams {
                        m_cost: kdf_params.m_cost,
                        t_cost: kdf_params.t_cost,
                        p_cost: kdf_params.p_cost,
                    }),
                    None,
                    Some(pin_hash),
                )
            }
            ShareAAuthMethod::Passkey => {
                let prf = req.prf_salt.as_ref().ok_or_else(|| {
                    AppError::Validation("prfSalt required for passkey method".into())
                })?;

                let salt = decode_base64(prf, "prfSalt")?;
                validate_prf_salt(&salt)?;

                (None, None, Some(salt), None)
            }
        };

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

    // Log audit event
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

// --- Credential verification ---

/// Verify unlock credential matches the wallet's auth method
///
/// ## TYPE-08: Runtime Validation Approach
///
/// This function performs runtime validation that the credential type matches
/// the wallet's configured auth method. This validation couldn't be done at
/// compile time because:
/// 1. The `UnlockCredential` enum comes from deserialized JSON (client choice)
/// 2. The `ShareAAuthMethod` is stored in the database (server state)
///
/// Validation rules:
/// - `Password` wallet requires `UnlockCredential::Password` → verifies against user's login password
/// - `Pin` wallet requires `UnlockCredential::Pin` → verifies against stored PIN hash
/// - `Passkey` wallet requires `UnlockCredential::PrfOutput` → decryption will fail if wrong
///
/// Any mismatch returns `AppError::Validation` with expected auth method.
async fn verify_unlock_credential<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: uuid::Uuid,
    material: &crate::repositories::WalletMaterialEntity,
    credential: &crate::models::UnlockCredential,
) -> Result<(), AppError> {
    use crate::models::UnlockCredential;
    use crate::repositories::ShareAAuthMethod as RepoAuthMethod;

    match (&material.share_a_auth_method, credential) {
        (RepoAuthMethod::Password, UnlockCredential::Password(password)) => {
            // Verify against user's login password
            let user = state
                .user_repo
                .find_by_id(user_id)
                .await?
                .ok_or(AppError::NotFound("User not found".into()))?;

            let password_hash = user
                .password_hash
                .as_ref()
                .ok_or(AppError::Validation("User has no password set".into()))?;

            if !state
                .password_service
                .verify(password.to_string(), password_hash.clone())
                .await?
            {
                return Err(AppError::InvalidCredentials);
            }
        }
        (RepoAuthMethod::Pin, UnlockCredential::Pin(pin)) => {
            // Verify against stored PIN hash
            let pin_hash = material
                .share_a_pin_hash
                .as_ref()
                .ok_or(AppError::Internal(anyhow::anyhow!("PIN hash not stored")))?;

            if !state
                .password_service
                .verify(pin.to_string(), pin_hash.clone())
                .await?
            {
                return Err(AppError::InvalidCredentials);
            }
        }
        (RepoAuthMethod::Passkey, UnlockCredential::PrfOutput(_prf_output)) => {
            // For passkey method, the PRF output is used to decrypt Share A
            // We can't verify the PRF output directly - decryption will fail if wrong
            // This is handled by the signing service
        }
        _ => {
            return Err(AppError::Validation(format!(
                "Credential type doesn't match wallet auth method (expected {:?})",
                material.share_a_auth_method
            )));
        }
    }

    Ok(())
}

// --- Helper functions ---

fn convert_auth_method(m: ShareAAuthMethod) -> crate::repositories::ShareAAuthMethod {
    match m {
        ShareAAuthMethod::Password => crate::repositories::ShareAAuthMethod::Password,
        ShareAAuthMethod::Pin => crate::repositories::ShareAAuthMethod::Pin,
        ShareAAuthMethod::Passkey => crate::repositories::ShareAAuthMethod::Passkey,
    }
}

fn decode_base64(input: &str, field_name: &str) -> Result<Vec<u8>, AppError> {
    BASE64
        .decode(input)
        .map_err(|_| AppError::Validation(format!("Invalid base64 in {}", field_name)))
}

fn validate_enroll_request(req: &WalletEnrollRequest) -> Result<(), AppError> {
    // Pubkey length
    if req.solana_pubkey.len() < MIN_SOLANA_PUBKEY_LEN
        || req.solana_pubkey.len() > MAX_SOLANA_PUBKEY_LEN
    {
        return Err(AppError::Validation(
            "Invalid Solana pubkey length (expected 32-50 characters)".into(),
        ));
    }

    // HDL-1: Validate base58 characters
    if !is_valid_base58(&req.solana_pubkey) {
        return Err(AppError::Validation(
            "Invalid Solana pubkey: contains invalid base58 characters".into(),
        ));
    }

    Ok(())
}

fn validate_kdf_params(params: &KdfParamsDto) -> Result<(), AppError> {
    if params.m_cost < MIN_M_COST {
        return Err(AppError::Validation(format!(
            "KDF mCost too low (minimum {} KiB)",
            MIN_M_COST
        )));
    }
    if params.m_cost > MAX_M_COST {
        return Err(AppError::Validation(format!(
            "KDF mCost too high (maximum {} KiB)",
            MAX_M_COST
        )));
    }
    if params.t_cost < MIN_T_COST {
        return Err(AppError::Validation(format!(
            "KDF tCost too low (minimum {})",
            MIN_T_COST
        )));
    }
    if params.t_cost > MAX_T_COST {
        return Err(AppError::Validation(format!(
            "KDF tCost too high (maximum {})",
            MAX_T_COST
        )));
    }
    if params.p_cost < MIN_P_COST {
        return Err(AppError::Validation(format!(
            "KDF pCost too low (minimum {})",
            MIN_P_COST
        )));
    }
    if params.p_cost > MAX_P_COST {
        return Err(AppError::Validation(format!(
            "KDF pCost too high (maximum {})",
            MAX_P_COST
        )));
    }
    Ok(())
}

fn validate_nonce(nonce: &[u8], field_name: &str) -> Result<(), AppError> {
    if nonce.len() != NONCE_LEN {
        return Err(AppError::Validation(format!(
            "{} must be {} bytes (AES-GCM nonce)",
            field_name, NONCE_LEN
        )));
    }
    Ok(())
}

fn validate_kdf_salt(salt: &[u8]) -> Result<(), AppError> {
    if salt.len() < MIN_KDF_SALT_LEN {
        return Err(AppError::Validation(format!(
            "shareAKdfSalt must be at least {} bytes",
            MIN_KDF_SALT_LEN
        )));
    }
    Ok(())
}

fn validate_prf_salt(salt: &[u8]) -> Result<(), AppError> {
    if salt.len() != PRF_SALT_LEN {
        return Err(AppError::Validation(format!(
            "prfSalt must be {} bytes",
            PRF_SALT_LEN
        )));
    }
    Ok(())
}

fn validate_pin(pin: &str) -> Result<(), AppError> {
    if pin.len() < MIN_PIN_LEN {
        return Err(AppError::Validation(format!(
            "PIN must be at least {} characters",
            MIN_PIN_LEN
        )));
    }
    if pin.len() > MAX_PIN_LEN {
        return Err(AppError::Validation(format!(
            "PIN must be at most {} characters",
            MAX_PIN_LEN
        )));
    }
    // PIN should only contain digits
    if !pin.chars().all(|c| c.is_ascii_digit()) {
        return Err(AppError::Validation("PIN must contain only digits".into()));
    }
    Ok(())
}

/// GET /wallet/pending-recovery - Check for pending recovery data
///
/// Returns the recovery phrase if the user has pending recovery data to acknowledge.
/// This is used after wallet enrollment to show the user their recovery phrase.
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
        Some(entity) => Ok(Json(PendingWalletRecoveryResponse {
            has_pending_recovery: true,
            recovery_type: Some(entity.recovery_type.to_string()),
            recovery_phrase: Some(entity.recovery_data),
            expires_at: Some(entity.expires_at),
        })),
        None => Ok(Json(PendingWalletRecoveryResponse {
            has_pending_recovery: false,
            recovery_type: None,
            recovery_phrase: None,
            expires_at: None,
        })),
    }
}

/// POST /wallet/acknowledge-recovery - Acknowledge receipt of recovery phrase
///
/// Deletes the pending recovery data after user confirms they have saved it.
/// This should be called after showing the recovery phrase to the user.
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
        // Log audit event
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_kdf_params_valid() {
        let params = KdfParamsDto {
            m_cost: 19456,
            t_cost: 2,
            p_cost: 1,
        };
        assert!(validate_kdf_params(&params).is_ok());
    }

    #[test]
    fn test_validate_kdf_params_m_cost_too_low() {
        let params = KdfParamsDto {
            m_cost: 1000, // Below minimum
            t_cost: 2,
            p_cost: 1,
        };
        assert!(validate_kdf_params(&params).is_err());
    }

    #[test]
    fn test_validate_kdf_params_m_cost_too_high() {
        let params = KdfParamsDto {
            m_cost: 2000000, // Above maximum
            t_cost: 2,
            p_cost: 1,
        };
        assert!(validate_kdf_params(&params).is_err());
    }

    #[test]
    fn test_validate_nonce_valid() {
        let nonce = vec![0u8; 12];
        assert!(validate_nonce(&nonce, "test").is_ok());
    }

    #[test]
    fn test_validate_nonce_invalid_length() {
        let nonce = vec![0u8; 16]; // Wrong length
        assert!(validate_nonce(&nonce, "test").is_err());
    }

    #[test]
    fn test_validate_prf_salt_valid() {
        let salt = vec![0u8; 32];
        assert!(validate_prf_salt(&salt).is_ok());
    }

    #[test]
    fn test_validate_prf_salt_invalid_length() {
        let salt = vec![0u8; 16]; // Wrong length
        assert!(validate_prf_salt(&salt).is_err());
    }

    #[test]
    fn test_decode_base64_valid() {
        let encoded = BASE64.encode(b"hello");
        let decoded = decode_base64(&encoded, "test").unwrap();
        assert_eq!(decoded, b"hello");
    }

    #[test]
    fn test_decode_base64_invalid() {
        let result = decode_base64("not-valid-base64!!!", "test");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_pin_valid() {
        assert!(validate_pin("123456").is_ok());
        assert!(validate_pin("12345678").is_ok());
    }

    #[test]
    fn test_validate_pin_too_short() {
        assert!(validate_pin("12345").is_err());
    }

    #[test]
    fn test_validate_pin_too_long() {
        // MAX_PIN_LEN is 20
        assert!(validate_pin("123456789012345678901").is_err()); // 21 digits
    }

    #[test]
    fn test_validate_pin_non_digits() {
        assert!(validate_pin("12345a").is_err());
        assert!(validate_pin("abcdef").is_err());
    }
}
