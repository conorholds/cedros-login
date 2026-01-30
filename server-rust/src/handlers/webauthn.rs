//! WebAuthn handlers for passkey registration and authentication
//!
//! Endpoints:
//! - POST /auth/webauthn/register/options - Start passkey registration
//! - POST /auth/webauthn/register/verify - Complete passkey registration
//! - POST /auth/webauthn/auth/options - Start passkey authentication
//! - POST /auth/webauthn/auth/verify - Complete passkey authentication

use axum::{extract::State, http::HeaderMap, response::IntoResponse, Json};
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::models::{AuthMethod, AuthResponse};
use crate::repositories::{AuditEventType, CredentialEntity, CredentialType, SessionEntity};
use crate::services::{
    webauthn_service::{VerifyAuthenticationRequest, VerifyRegistrationRequest},
    EmailService,
};
use crate::utils::{
    auth::authenticate, build_json_response_with_cookies, extract_client_ip,
    get_default_org_context, hash_refresh_token, user_entity_to_auth_user,
};
use crate::AppState;

/// Response for registration options
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterOptionsResponse {
    pub challenge_id: Uuid,
    pub options: serde_json::Value,
}

/// Response for authentication options
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthOptionsResponse {
    pub challenge_id: Uuid,
    pub options: serde_json::Value,
}

/// Request to start authentication (optional email for email-first flow)
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartAuthRequest {
    /// Email for email-first authentication flow (optional)
    pub email: Option<String>,
}

/// Request to verify registration
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyRegisterRequest {
    pub challenge_id: Uuid,
    pub credential: serde_json::Value,
    pub label: Option<String>,
}

/// Request to verify authentication
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyAuthRequest {
    pub challenge_id: Uuid,
    pub credential: serde_json::Value,
}

/// POST /auth/webauthn/register/options
///
/// Start passkey registration ceremony.
/// Requires authentication (user must already be signed in).
pub async fn register_options<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<RegisterOptionsResponse>, AppError> {
    // Verify user is authenticated
    let auth_user = authenticate(&state, &headers).await?;

    // Get user details
    let user = state
        .user_repo
        .find_by_id(auth_user.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    // Get existing WebAuthn credentials to exclude
    let existing = state
        .storage
        .webauthn_repository()
        .find_by_user(auth_user.user_id)
        .await?;

    // Start registration
    let result = state
        .webauthn_service
        .start_registration(
            auth_user.user_id,
            user.email.as_deref(),
            user.name.as_deref(),
            &existing,
            &state.storage.webauthn_repo,
        )
        .await?;

    // Convert options to JSON value for flexibility
    let options_json =
        serde_json::to_value(&result.options).map_err(|e| AppError::Internal(e.into()))?;

    Ok(Json(RegisterOptionsResponse {
        challenge_id: result.challenge_id,
        options: options_json,
    }))
}

/// POST /auth/webauthn/register/verify
///
/// Complete passkey registration ceremony.
/// Requires authentication.
pub async fn register_verify<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<VerifyRegisterRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Verify user is authenticated
    let auth_user = authenticate(&state, &headers).await?;

    // Parse the credential from JSON
    let credential: webauthn_rs::prelude::RegisterPublicKeyCredential =
        serde_json::from_value(request.credential)
            .map_err(|e| AppError::Validation(format!("Invalid credential format: {}", e)))?;

    // Complete registration
    let webauthn_cred = state
        .webauthn_service
        .finish_registration(
            VerifyRegistrationRequest {
                challenge_id: request.challenge_id,
                credential,
                label: request.label.clone(),
            },
            &state.storage.webauthn_repo,
        )
        .await?;

    // Also create a unified credential entry
    let unified_cred = CredentialEntity::new(
        auth_user.user_id,
        CredentialType::WebauthnPasskey,
        request.label,
    );
    let _ = state
        .storage
        .credential_repository()
        .create(unified_cred)
        .await;

    Ok(Json(serde_json::json!({
        "success": true,
        "credentialId": webauthn_cred.id,
        "label": webauthn_cred.label
    })))
}

/// POST /auth/webauthn/auth/options
///
/// Start passkey authentication ceremony.
/// Can be used for:
/// - S-16: Username-less authentication (no body required, uses discoverable credentials)
/// - Email-first authentication (provide email in body)
pub async fn auth_options<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Json(request): Json<StartAuthRequest>,
) -> Result<Json<AuthOptionsResponse>, AppError> {
    let result = if let Some(ref email) = request.email {
        // Email-first flow: find user by email and get their credentials
        let user = state
            .user_repo
            .find_by_email(email)
            .await?
            .ok_or_else(|| AppError::InvalidCredentials)?;

        let creds = state
            .storage
            .webauthn_repository()
            .find_by_user(user.id)
            .await?;

        if creds.is_empty() {
            return Err(AppError::NotFound(
                "No passkeys registered for this account".into(),
            ));
        }

        state
            .webauthn_service
            .start_authentication(Some(user.id), &creds, &state.storage.webauthn_repo)
            .await?
    } else {
        // S-16: Discoverable credential flow (username-less)
        // The authenticator will prompt the user to select a passkey
        state
            .webauthn_service
            .start_discoverable_authentication(&state.storage.webauthn_repo)
            .await?
    };

    // Convert options to JSON value
    let options_json =
        serde_json::to_value(&result.options).map_err(|e| AppError::Internal(e.into()))?;

    Ok(Json(AuthOptionsResponse {
        challenge_id: result.challenge_id,
        options: options_json,
    }))
}

/// POST /auth/webauthn/auth/verify
///
/// Complete passkey authentication ceremony.
/// Returns JWT tokens on success.
/// Supports both email-first and S-16 discoverable (username-less) flows.
pub async fn auth_verify<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(request): Json<VerifyAuthRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Parse the credential from JSON
    let credential: webauthn_rs::prelude::PublicKeyCredential =
        serde_json::from_value(request.credential.clone())
            .map_err(|e| AppError::Validation(format!("Invalid credential format: {}", e)))?;

    // Peek at the challenge to determine which flow to use
    // We don't consume it here - the service methods will consume it
    let challenge = state
        .storage
        .webauthn_repository()
        .find_challenge(request.challenge_id)
        .await?
        .ok_or_else(|| AppError::Validation("Challenge expired or not found".into()))?;

    // S-16: Handle discoverable vs email-first flow based on challenge type
    let verified_user_id = if challenge.challenge_type == "discoverable" {
        // Discoverable flow - user identity comes from the credential
        let (user_id, _cred) = state
            .webauthn_service
            .finish_discoverable_authentication(
                VerifyAuthenticationRequest {
                    challenge_id: request.challenge_id,
                    credential,
                },
                &state.storage.webauthn_repo,
            )
            .await?;
        user_id
    } else {
        // Email-first flow - user was identified at options step
        let user_id = challenge
            .user_id
            .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing user_id in challenge")))?;

        // Get user's credentials for verification
        let credentials = state
            .storage
            .webauthn_repository()
            .find_by_user(user_id)
            .await?;

        // Complete authentication
        let (verified_user_id, _cred) = state
            .webauthn_service
            .finish_authentication(
                VerifyAuthenticationRequest {
                    challenge_id: request.challenge_id,
                    credential,
                },
                &credentials,
                &state.storage.webauthn_repo,
            )
            .await?;
        verified_user_id
    };

    // Get the user
    let user = state
        .user_repo
        .find_by_id(verified_user_id)
        .await?
        .ok_or(AppError::Internal(anyhow::anyhow!(
            "User not found after WebAuthn auth"
        )))?;

    // Get memberships for token context
    let memberships = state.membership_repo.find_by_user(verified_user_id).await?;
    let org_ids: Vec<_> = memberships.iter().map(|m| m.org_id).collect();
    let orgs = state.org_repo.find_by_ids(&org_ids).await?;
    let orgs_by_id: std::collections::HashMap<_, _> = orgs.into_iter().map(|o| (o.id, o)).collect();

    let token_context = get_default_org_context(&memberships, &orgs_by_id, user.is_system_admin);

    // Create session
    let session_id = Uuid::new_v4();
    let token_pair = state.jwt_service.generate_token_pair_with_context(
        verified_user_id,
        session_id,
        &token_context,
    )?;
    let refresh_expiry =
        Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);

    let ip_address = extract_client_ip(&headers, state.config.server.trust_proxy);
    let user_agent = headers
        .get(axum::http::header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let mut session = SessionEntity::new_with_id(
        session_id,
        verified_user_id,
        hash_refresh_token(&token_pair.refresh_token, &state.config.jwt.secret),
        refresh_expiry,
        ip_address.clone(),
        user_agent.clone(),
    );
    session.last_strong_auth_at = Some(Utc::now());
    state.session_repo.create(session).await?;

    // Fire callback
    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::WebAuthn,
        is_new_user: false,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
    };
    let callback_data = state.callback.on_authenticated(&payload).await.ok();

    // Log audit event
    let _ = state
        .audit_service
        .log_user_event(AuditEventType::UserLogin, verified_user_id, Some(&headers))
        .await;

    let response_tokens = if state.config.cookie.enabled {
        None
    } else {
        Some(token_pair.clone())
    };

    let response = AuthResponse {
        user: auth_user,
        tokens: response_tokens,
        is_new_user: false,
        callback_data,
        api_key: None,
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}
