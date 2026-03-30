//! Apple OAuth helpers for multi-client verification and token revocation.

use std::collections::HashSet;

use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine as _};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::config::AppleConfig;
use crate::errors::AppError;
use crate::repositories::{CredentialEntity, CredentialRepository, CredentialType};

use super::apple_service::{AppleService, AppleTokenClaims};
use super::note_encryption_service::{NoteEncryptionService, NONCE_SIZE as NOTE_NONCE_SIZE};
use super::settings_service::SettingsService;

const APPLE_AUDIENCE: &str = "https://appleid.apple.com";
const APPLE_REVOKE_URL: &str = "https://appleid.apple.com/auth/revoke";
const APPLE_TOKEN_URL: &str = "https://appleid.apple.com/auth/token";
const APPLE_TOKEN_TIMEOUT_SECS: u64 = 5;
const APPLE_REFRESH_TOKEN_KEY_ID: &str = "apple-oauth-refresh-token";

#[derive(Debug, Clone)]
pub struct VerifiedAppleToken {
    pub claims: AppleTokenClaims,
    pub client_id: String,
}

#[derive(Debug, Clone)]
struct AppleOauthCredentials {
    client_id: String,
    team_id: String,
    key_id: String,
    private_key_pem: String,
}

#[derive(Debug, Serialize)]
struct AppleClientSecretClaims<'a> {
    iss: &'a str,
    iat: i64,
    exp: i64,
    aud: &'static str,
    sub: &'a str,
}

#[derive(Debug, Deserialize)]
struct AppleTokenResponse {
    refresh_token: Option<String>,
}

#[derive(Debug, Deserialize)]
struct AppleErrorResponse {
    error: Option<String>,
    error_description: Option<String>,
}

pub async fn resolve_apple_allowed_client_ids(
    settings: &SettingsService,
    config: &AppleConfig,
) -> Result<Vec<String>, AppError> {
    let mut client_ids = Vec::new();

    if let Some(client_id) = settings.get("auth_apple_client_id").await? {
        let trimmed = client_id.trim();
        if !trimmed.is_empty() {
            client_ids.push(trimmed.to_string());
        }
    } else if let Some(client_id) = &config.client_id {
        client_ids.push(client_id.clone());
    }

    if let Some(from_settings) = settings.get("auth_apple_allowed_client_ids").await? {
        client_ids.extend(parse_client_ids(&from_settings));
    } else {
        client_ids.extend(config.allowed_client_ids.iter().cloned());
    }

    let mut seen = HashSet::new();
    client_ids.retain(|client_id| seen.insert(client_id.clone()));

    if client_ids.is_empty() {
        return Err(AppError::Config(
            "Apple client ID not configured".to_string(),
        ));
    }

    Ok(client_ids)
}

pub async fn verify_apple_id_token_for_allowed_clients(
    apple_service: &AppleService,
    settings: &SettingsService,
    config: &AppleConfig,
    id_token: &str,
) -> Result<VerifiedAppleToken, AppError> {
    let client_ids = resolve_apple_allowed_client_ids(settings, config).await?;
    let mut last_error = AppError::InvalidToken;

    for client_id in client_ids {
        match apple_service.verify_id_token(id_token, &client_id).await {
            Ok(claims) => {
                return Ok(VerifiedAppleToken { claims, client_id });
            }
            Err(error @ AppError::TokenExpired) => return Err(error),
            Err(error) => last_error = error,
        }
    }

    Err(last_error)
}

pub async fn exchange_and_encrypt_refresh_token(
    settings: &SettingsService,
    config: &AppleConfig,
    jwt_secret: &str,
    authorization_code: Option<&str>,
    client_id: &str,
) -> Result<Option<String>, AppError> {
    let Some(authorization_code) = authorization_code.filter(|value| !value.is_empty()) else {
        return Ok(None);
    };

    let Some(credentials) =
        resolve_apple_oauth_credentials(settings, config, client_id).await?
    else {
        tracing::warn!(
            "Apple authorization code received but revocation credentials are not configured"
        );
        return Ok(None);
    };

    let refresh_token =
        exchange_apple_authorization_code(&credentials, authorization_code).await?;
    refresh_token
        .map(|token| encrypt_refresh_token(jwt_secret, &token))
        .transpose()
}

pub async fn revoke_encrypted_refresh_token(
    settings: &SettingsService,
    config: &AppleConfig,
    jwt_secret: &str,
    client_id: &str,
    encrypted_refresh_token: &str,
) -> Result<(), AppError> {
    let Some(credentials) =
        resolve_apple_oauth_credentials(settings, config, client_id).await?
    else {
        tracing::warn!(
            client_id = %client_id,
            "Skipping Apple token revocation because revocation credentials are not configured"
        );
        return Ok(());
    };

    let refresh_token = decrypt_refresh_token(jwt_secret, encrypted_refresh_token)?;
    revoke_apple_refresh_token(&credentials, &refresh_token).await
}

pub fn extract_apple_refresh_token_metadata(
    metadata: &Option<serde_json::Value>,
) -> Option<(String, String)> {
    let object = metadata.as_ref()?.as_object()?;
    let refresh_token = object.get("refreshToken")?.as_str()?.to_string();
    let client_id = object.get("clientId")?.as_str()?.to_string();
    Some((refresh_token, client_id))
}

pub async fn sync_apple_credential(
    credential_repo: &(dyn CredentialRepository + Send + Sync),
    user_id: Uuid,
    encrypted_refresh_token: Option<String>,
    client_id: &str,
) -> Result<(), AppError> {
    let existing_refresh_token = credential_repo
        .find_by_user_and_type(user_id, CredentialType::OauthApple)
        .await?
        .into_iter()
        .find_map(|credential| extract_apple_refresh_token_metadata(&credential.metadata));

    credential_repo
        .delete_by_user_and_type(user_id, CredentialType::OauthApple)
        .await?;

    let mut credential = CredentialEntity::new(
        user_id,
        CredentialType::OauthApple,
        Some("Sign in with Apple".to_string()),
    );

    let refresh_token = encrypted_refresh_token.or_else(|| {
        existing_refresh_token
            .as_ref()
            .map(|(refresh_token, _)| refresh_token.clone())
    });
    let refresh_client_id = refresh_token.as_ref().map(|_| {
        existing_refresh_token
            .as_ref()
            .map(|(_, saved_client_id)| saved_client_id.clone())
            .unwrap_or_else(|| client_id.to_string())
    });

    if let (Some(refresh_token), Some(refresh_client_id)) = (refresh_token, refresh_client_id) {
        credential.metadata = Some(serde_json::json!({
            "refreshToken": refresh_token,
            "clientId": refresh_client_id,
        }));
    }

    let _ = credential_repo.create(credential).await?;
    Ok(())
}

fn parse_client_ids(input: &str) -> Vec<String> {
    input
        .split(',')
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .collect()
}

async fn resolve_apple_oauth_credentials(
    settings: &SettingsService,
    config: &AppleConfig,
    client_id: &str,
) -> Result<Option<AppleOauthCredentials>, AppError> {
    let team_id = resolve_optional_setting(settings, "auth_apple_team_id", config.team_id.clone()).await?;
    let key_id = resolve_optional_setting(settings, "auth_apple_key_id", config.key_id.clone()).await?;
    let private_key_pem = resolve_optional_setting(
        settings,
        "auth_apple_private_key_pem",
        config.private_key_pem.clone(),
    )
    .await?;

    let Some(team_id) = team_id else {
        return Ok(None);
    };
    let Some(key_id) = key_id else {
        return Ok(None);
    };
    let Some(private_key_pem) = private_key_pem else {
        return Ok(None);
    };

    Ok(Some(AppleOauthCredentials {
        client_id: client_id.to_string(),
        team_id,
        key_id,
        private_key_pem,
    }))
}

async fn resolve_optional_setting(
    settings: &SettingsService,
    key: &str,
    fallback: Option<String>,
) -> Result<Option<String>, AppError> {
    Ok(settings
        .get(key)
        .await?
        .filter(|value| !value.trim().is_empty())
        .or(fallback))
}

async fn exchange_apple_authorization_code(
    credentials: &AppleOauthCredentials,
    authorization_code: &str,
) -> Result<Option<String>, AppError> {
    let client_secret = build_client_secret(credentials)?;
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(APPLE_TOKEN_TIMEOUT_SECS))
        .build()
        .map_err(|error| AppError::Internal(anyhow::anyhow!("Failed to build Apple client: {}", error)))?;

    let response = client
        .post(APPLE_TOKEN_URL)
        .form(&[
            ("client_id", credentials.client_id.as_str()),
            ("client_secret", client_secret.as_str()),
            ("code", authorization_code),
            ("grant_type", "authorization_code"),
        ])
        .send()
        .await
        .map_err(|error| AppError::Internal(anyhow::anyhow!("Apple token exchange failed: {}", error)))?;

    if !response.status().is_success() {
        let error = response
            .json::<AppleErrorResponse>()
            .await
            .ok()
            .and_then(|payload| payload.error_description.or(payload.error))
            .unwrap_or_else(|| "Apple token exchange failed".to_string());
        return Err(AppError::Validation(error));
    }

    Ok(response
        .json::<AppleTokenResponse>()
        .await
        .map_err(|error| AppError::Internal(anyhow::anyhow!("Invalid Apple token response: {}", error)))?
        .refresh_token)
}

async fn revoke_apple_refresh_token(
    credentials: &AppleOauthCredentials,
    refresh_token: &str,
) -> Result<(), AppError> {
    let client_secret = build_client_secret(credentials)?;
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(APPLE_TOKEN_TIMEOUT_SECS))
        .build()
        .map_err(|error| AppError::Internal(anyhow::anyhow!("Failed to build Apple client: {}", error)))?;

    let response = client
        .post(APPLE_REVOKE_URL)
        .form(&[
            ("client_id", credentials.client_id.as_str()),
            ("client_secret", client_secret.as_str()),
            ("token", refresh_token),
            ("token_type_hint", "refresh_token"),
        ])
        .send()
        .await
        .map_err(|error| AppError::Internal(anyhow::anyhow!("Apple token revocation failed: {}", error)))?;

    if response.status().is_success() {
        return Ok(());
    }

    let error = response
        .json::<AppleErrorResponse>()
        .await
        .ok()
        .and_then(|payload| payload.error_description.or(payload.error))
        .unwrap_or_else(|| "Apple token revocation failed".to_string());

    Err(AppError::Validation(error))
}

fn build_client_secret(credentials: &AppleOauthCredentials) -> Result<String, AppError> {
    let mut header = Header::new(Algorithm::ES256);
    header.kid = Some(credentials.key_id.clone());

    let now = Utc::now();
    let claims = AppleClientSecretClaims {
        iss: &credentials.team_id,
        iat: now.timestamp(),
        exp: (now + Duration::minutes(5)).timestamp(),
        aud: APPLE_AUDIENCE,
        sub: &credentials.client_id,
    };

    let encoding_key =
        EncodingKey::from_ec_pem(credentials.private_key_pem.as_bytes()).map_err(|error| {
            AppError::Config(format!("Invalid APPLE_PRIVATE_KEY_PEM: {}", error))
        })?;

    encode(&header, &claims, &encoding_key)
        .map_err(|error| AppError::Internal(anyhow::anyhow!("Failed to sign Apple client secret: {}", error)))
}

fn encrypt_refresh_token(jwt_secret: &str, refresh_token: &str) -> Result<String, AppError> {
    let encryption_service =
        NoteEncryptionService::new(&derive_refresh_token_key(jwt_secret), APPLE_REFRESH_TOKEN_KEY_ID)?;
    let encrypted = encryption_service.encrypt(refresh_token.as_bytes())?;
    let mut payload = encrypted.nonce;
    payload.extend(encrypted.ciphertext);
    Ok(BASE64_STANDARD.encode(payload))
}

fn decrypt_refresh_token(jwt_secret: &str, encrypted_refresh_token: &str) -> Result<String, AppError> {
    let encryption_service =
        NoteEncryptionService::new(&derive_refresh_token_key(jwt_secret), APPLE_REFRESH_TOKEN_KEY_ID)?;
    let payload = BASE64_STANDARD
        .decode(encrypted_refresh_token)
        .map_err(|error| AppError::Validation(format!("Invalid encrypted Apple token: {}", error)))?;
    if payload.len() <= NOTE_NONCE_SIZE {
        return Err(AppError::Validation(
            "Invalid encrypted Apple token payload".to_string(),
        ));
    }
    let (nonce, ciphertext) = payload.split_at(NOTE_NONCE_SIZE);
    let plaintext = encryption_service.decrypt(ciphertext, nonce)?;
    String::from_utf8(plaintext)
        .map_err(|error| AppError::Internal(anyhow::anyhow!("Invalid Apple refresh token bytes: {}", error)))
}

fn derive_refresh_token_key(jwt_secret: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(b"cedros:apple_refresh_token:v1");
    hasher.update(jwt_secret.as_bytes());
    hasher.finalize().into()
}
