//! Transaction signing and credential conversion

use axum::{extract::State, http::HeaderMap, Json};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{SignTransactionRequest, SignTransactionResponse};
use crate::repositories::AuditEventType;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

use super::{decode_base64, resolve_wallet};

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
            tracing::warn!(
                user_id = %user_id,
                error = %e,
                "Wallet sign failed"
            );
            Err(AppError::Unauthorized(
                "Unable to sign transaction. Ensure wallet is enrolled and credentials are correct."
                    .into(),
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

    let material = resolve_wallet(state, auth).await?;

    let transaction = decode_base64(&req.transaction, "transaction")?;

    // Resolve derivation index and pubkey from wallet_id
    let (derivation_index, signing_pubkey) = if let Some(wallet_id) = req.wallet_id {
        let derived = state
            .derived_wallet_repo
            .find_by_id(wallet_id, user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Derived wallet not found".into()))?;
        (derived.derivation_index, derived.solana_pubkey)
    } else {
        (0, material.solana_pubkey.clone())
    };

    // For API key auth with api_key auth method, auto-use the raw key as credential
    let effective_credential =
        if material.share_a_auth_method == crate::repositories::ShareAAuthMethod::ApiKey {
            if let Some(raw_key) = &auth.raw_api_key {
                Some(crate::services::WalletUnlockCredential::ApiKey(
                    raw_key.clone(),
                ))
            } else {
                return Err(AppError::Unauthorized("API key required".into()));
            }
        } else {
            req.credential
                .as_ref()
                .map(convert_credential)
                .transpose()?
        };

    let signature = match effective_credential {
        Some(credential) => {
            if derivation_index > 0 {
                state
                    .wallet_signing_service
                    .sign_transaction_with_derived(
                        &material,
                        &credential,
                        &transaction,
                        derivation_index,
                    )
                    .await?
            } else {
                state
                    .wallet_signing_service
                    .sign_transaction(&material, &credential, &transaction)
                    .await?
            }
        }
        None => {
            let session_id = auth.session_id.ok_or_else(|| {
                AppError::Unauthorized("Session required when no credential provided".into())
            })?;

            let cached_key = state
                .wallet_unlock_cache
                .get(session_id)
                .await
                .ok_or_else(|| AppError::Unauthorized("Wallet not unlocked".into()))?;

            if derivation_index > 0 {
                state
                    .wallet_signing_service
                    .sign_transaction_with_derived_index(
                        &material,
                        &cached_key,
                        &transaction,
                        derivation_index,
                    )?
            } else {
                state
                    .wallet_signing_service
                    .sign_transaction_with_cached_key(&material, &cached_key, &transaction)?
            }
        }
    };

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
        pubkey: signing_pubkey,
    }))
}

/// Convert model credential to service credential
pub(super) fn convert_credential(
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
        ModelCred::ApiKey(k) => Ok(ServiceCred::ApiKey(k.clone())),
    }
}

/// Verify unlock credential matches the wallet's auth method
pub(super) async fn verify_unlock_credential<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: uuid::Uuid,
    material: &crate::repositories::WalletMaterialEntity,
    credential: &crate::models::UnlockCredential,
) -> Result<(), AppError> {
    use crate::models::UnlockCredential;
    use crate::repositories::ShareAAuthMethod as RepoAuthMethod;

    match (&material.share_a_auth_method, credential) {
        (RepoAuthMethod::Password, UnlockCredential::Password(password)) => {
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
        (RepoAuthMethod::Passkey, UnlockCredential::PrfOutput(_)) => {
            // PRF output used to decrypt Share A — decryption failure = wrong key
        }
        (RepoAuthMethod::ApiKey, UnlockCredential::ApiKey(_)) => {
            // API key already authenticated by middleware
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
