//! WebAuthn standalone signup handlers (unauthenticated)
//!
//! Allows new users to create an account using only a passkey (Touch ID, Face ID, etc.)
//! without needing an existing session.
//!
//! Endpoints:
//! - POST /auth/webauthn/signup/options - Start passkey registration for new user
//! - POST /auth/webauthn/signup/verify - Complete ceremony, create user + passkey + org + API key

use axum::{extract::State, http::HeaderMap, response::IntoResponse, Json};
use chrono::{Duration, Utc};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::handlers::auth::{call_registered_callback_with_timeout, pending_invite_response};
use crate::handlers::webauthn::RegisterOptionsResponse;
use crate::models::{AuthMethod, AuthResponse};
#[cfg(feature = "postgres")]
use crate::repositories::TransactionalOps;
use crate::repositories::{
    generate_api_key, ApiKeyEntity, AuditEventType, CredentialEntity, CredentialType,
    MembershipEntity, SessionEntity, UserEntity,
};
use crate::services::{webauthn_service::VerifyRegistrationRequest, EmailService};
use crate::utils::{
    build_json_response_with_cookies, compute_authenticated_post_login, enforce_signup_access_code,
    ensure_primary_email_row, extract_client_ip_with_fallback, get_default_org_context,
    hash_refresh_token, resolve_org_assignment, user_entity_to_auth_user, PeerIp,
};
use crate::AppState;

/// Request body for completing passkey signup
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignupVerifyRequest {
    pub challenge_id: Uuid,
    pub credential: serde_json::Value,
    /// Optional email for recovery / account linking
    pub email: Option<String>,
    /// Optional display name
    pub name: Option<String>,
    /// Passkey label (e.g. "MacBook Pro")
    pub label: Option<String>,
    /// Optional referral code for signup attribution
    pub referral: Option<String>,
    /// Optional signup access code. Required when `signup_access_code_enabled` is true.
    pub access_code: Option<String>,
}

/// POST /auth/webauthn/signup/options
///
/// Start a passkey registration ceremony for a new (unauthenticated) user.
pub async fn signup_options<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Result<Json<RegisterOptionsResponse>, AppError> {
    // Enabled check: runtime setting > static config
    let enabled = state
        .settings_service
        .get_bool("auth_webauthn_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.webauthn.enabled);
    if !enabled {
        return Err(AppError::NotFound("WebAuthn auth disabled".into()));
    }

    let ephemeral_user_id = Uuid::new_v4();

    let result = state
        .webauthn_service
        .start_registration_for_signup(ephemeral_user_id, &state.storage.webauthn_repo)
        .await?;

    let options_json =
        serde_json::to_value(&result.options).map_err(|e| AppError::Internal(e.into()))?;

    Ok(Json(RegisterOptionsResponse {
        challenge_id: result.challenge_id,
        options: options_json,
    }))
}

/// POST /auth/webauthn/signup/verify
///
/// Complete passkey registration and atomically create user + passkey + org + API key.
pub async fn signup_verify<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(request): Json<SignupVerifyRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Enabled check
    let enabled = state
        .settings_service
        .get_bool("auth_webauthn_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.webauthn.enabled);
    if !enabled {
        return Err(AppError::NotFound("WebAuthn auth disabled".into()));
    }

    enforce_signup_access_code(&state, request.access_code.as_deref()).await?;

    // An unauthenticated passkey ceremony proves control of the authenticator,
    // not ownership of an email address. Link recovery email only after the
    // new passkey-backed session exists, through the verified-email flow.
    if request.email.is_some() {
        return Err(AppError::Validation(
            "Email must be linked after passkey signup".into(),
        ));
    }

    // Parse the credential from JSON
    let credential: webauthn_rs::prelude::RegisterPublicKeyCredential =
        serde_json::from_value(request.credential)
            .map_err(|e| AppError::Validation(format!("Invalid credential format: {e}")))?;

    // Verify the registration (does NOT persist the credential)
    let webauthn_cred = state
        .webauthn_service
        .finish_registration_for_signup(
            VerifyRegistrationRequest {
                challenge_id: request.challenge_id,
                credential,
                label: request.label.clone(),
            },
            &state.storage.webauthn_repo,
        )
        .await?;
    let referred_by = if let Some(code) = request
        .referral
        .as_deref()
        .map(str::trim)
        .filter(|code| !code.is_empty())
    {
        match state.user_repo.find_by_referral_code(code).await {
            Ok(Some(referrer)) => Some(referrer.id),
            Ok(None) => None,
            Err(error) => {
                tracing::warn!(error = %error, "Failed to resolve referral code, ignoring");
                None
            }
        }
    } else {
        None
    };

    // Build user entity
    let now = Utc::now();
    let user_id = Uuid::new_v4();
    let user = UserEntity {
        id: user_id,
        email: None,
        email_verified: false,
        password_hash: None,
        name: request.name,
        username: None,
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec![AuthMethod::WebAuthn],
        is_system_admin: false,
        created_at: now,
        updated_at: now,
        last_login_at: Some(now),
        welcome_completed_at: None,
        referral_code: crate::repositories::generate_referral_code(),
        referred_by,
    };

    let mut webauthn_cred = webauthn_cred;
    webauthn_cred.user_id = user_id;
    let org_assignment = resolve_org_assignment(&state, user.id).await?;
    let membership = MembershipEntity::new(user.id, org_assignment.org_id, org_assignment.role);
    let mut signup_limit_permit = state.signup_limit_service.acquire().await?;
    signup_limit_permit.ensure_available().await?;

    #[cfg(feature = "postgres")]
    {
        if let Some(pool) = state.postgres_pool.as_ref() {
            TransactionalOps::create_user_with_primary_email_membership_and_credential(
                pool,
                &user,
                &membership,
                &webauthn_cred,
            )
            .await?;
        } else {
            create_webauthn_account_non_atomic(&state, &user, membership, webauthn_cred).await?;
        }
    }
    #[cfg(not(feature = "postgres"))]
    create_webauthn_account_non_atomic(&state, &user, membership, webauthn_cred).await?;

    signup_limit_permit.record_created();
    drop(signup_limit_permit);

    if let Some(response) =
        pending_invite_response(&state, &user, AuthMethod::WebAuthn, &headers).await?
    {
        return Ok(response);
    }

    let raw_api_key = generate_api_key();
    let api_key_entity = ApiKeyEntity::new(user.id, &raw_api_key, "default");
    state.api_key_repo.create(api_key_entity).await?;

    // Best-effort unified credential entry
    let unified_cred =
        CredentialEntity::new(user_id, CredentialType::WebauthnPasskey, request.label);
    if let Err(e) = state
        .storage
        .credential_repository()
        .create(unified_cred)
        .await
    {
        tracing::warn!(
            user_id = %user_id,
            error = %e,
            "Failed to create unified credential entry for WebAuthn signup passkey"
        );
    }

    // Session + JWT
    let memberships = state.membership_repo.find_by_user(user_id).await?;
    let token_context =
        get_default_org_context(&memberships, user.is_system_admin, user.email_verified);

    let session_id = Uuid::new_v4();
    let token_pair =
        state
            .jwt_service
            .generate_token_pair_with_context(user_id, session_id, &token_context)?;
    let refresh_expiry =
        Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);

    let ip_address =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);
    let user_agent = headers
        .get(axum::http::header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let mut session = SessionEntity::new_with_id(
        session_id,
        user_id,
        hash_refresh_token(&token_pair.refresh_token, &state.config.jwt.secret),
        refresh_expiry,
        ip_address.clone(),
        user_agent.clone(),
    );
    session.last_strong_auth_at = Some(Utc::now());
    super::auth::maybe_queue_new_device_alert(
        &state,
        &user,
        ip_address.as_deref(),
        user_agent.as_deref(),
        false,
    )
    .await;
    state
        .storage
        .credential_lifecycle_repo
        .create_session_if_current(&user, session)
        .await?;

    // Fire on_registered callback
    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::WebAuthn,
        is_new_user: true,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
        referral: request.referral.clone(),
    };
    let callback_data = call_registered_callback_with_timeout(&state.callback, &payload).await;

    // Audit log
    let _ = state
        .audit_service
        .log_user_event(AuditEventType::UserRegister, user_id, Some(&headers))
        .await;

    let response_tokens = if state.config.cookie.enabled {
        None
    } else {
        Some(token_pair.clone())
    };

    let response = AuthResponse {
        user: auth_user,
        tokens: response_tokens,
        is_new_user: true,
        callback_data,
        api_key: Some(raw_api_key),
        email_queued: None,
        invite_code_required: None,
        pending_invite_token: None,
        method: Some(AuthMethod::WebAuthn),
        post_login: compute_authenticated_post_login(
            &user,
            &token_pair.access_token,
            &state.settings_service,
            &*state.totp_repo,
            &*state.credential_repo,
            &state.subscription_selection_service,
        )
        .await?,
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}

async fn create_webauthn_account_non_atomic<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    membership: MembershipEntity,
    credential: crate::repositories::WebAuthnCredential,
) -> Result<(), AppError> {
    state.user_repo.create(user.clone()).await?;
    let result: Result<(), AppError> = async {
        ensure_primary_email_row(state, user).await?;
        state.membership_repo.create(membership).await?;
        state
            .storage
            .webauthn_repository()
            .create_credential(credential)
            .await?;
        Ok(())
    }
    .await;
    if let Err(error) = result {
        if let Err(cleanup_error) = state.user_repo.delete(user.id).await {
            tracing::error!(
                user_id = %user.id,
                error = %cleanup_error,
                "Failed to roll back partially created WebAuthn signup user"
            );
        }
        return Err(error);
    }
    Ok(())
}
