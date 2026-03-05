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
use crate::handlers::auth::call_registered_callback_with_timeout;
use crate::handlers::webauthn::RegisterOptionsResponse;
use crate::models::{AuthMethod, AuthResponse};
use crate::repositories::{
    generate_api_key, normalize_email, ApiKeyEntity, AuditEventType, CredentialEntity,
    CredentialType, MembershipEntity, SessionEntity, TransactionalOps, UserEntity,
};
use crate::services::{
    webauthn_service::VerifyRegistrationRequest, EmailService,
};
use crate::utils::{
    build_json_response_with_cookies, compute_post_login, extract_client_ip_with_fallback,
    get_default_org_context, hash_refresh_token, resolve_org_assignment,
    user_entity_to_auth_user, PeerIp,
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

    // Fetch all known credential IDs so the browser can silently detect existing
    // passkeys (InvalidStateError) and fall back to authentication instead of
    // creating a duplicate account.
    let exclude_credential_ids = state
        .storage
        .webauthn_repository()
        .find_all_credential_ids(50_000)
        .await
        .unwrap_or_default();

    let result = state
        .webauthn_service
        .start_registration_for_signup(
            ephemeral_user_id,
            &exclude_credential_ids,
            &state.storage.webauthn_repo,
        )
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

    // Parse the credential from JSON
    let credential: webauthn_rs::prelude::RegisterPublicKeyCredential =
        serde_json::from_value(request.credential)
            .map_err(|e| AppError::Validation(format!("Invalid credential format: {}", e)))?;

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

    // Normalize and check email if provided
    let normalized_email = if let Some(ref email) = request.email {
        let norm = normalize_email(email);
        if state.user_repo.email_exists(&norm).await? {
            return Err(AppError::EmailExists);
        }
        Some(norm)
    } else {
        None
    };

    // Build user entity
    let now = Utc::now();
    let user_id = Uuid::new_v4();
    let user = UserEntity {
        id: user_id,
        email: normalized_email,
        email_verified: false,
        password_hash: None,
        name: request.name,
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        stripe_customer_id: None,
        auth_methods: vec![AuthMethod::WebAuthn],
        is_system_admin: false,
        created_at: now,
        updated_at: now,
        last_login_at: Some(now),
        welcome_completed_at: None,
    };

    let org_assignment = resolve_org_assignment(&state, user.id).await?;
    let membership = MembershipEntity::new(user.id, org_assignment.org_id, org_assignment.role);
    let raw_api_key = generate_api_key();
    let api_key_entity = ApiKeyEntity::new(user.id, &raw_api_key, "default");

    // Set the real user_id on the webauthn credential (was placeholder Uuid::nil())
    let mut webauthn_cred = webauthn_cred;
    webauthn_cred.user_id = user_id;

    // Atomic insert: user + membership + api_key + webauthn_credential
    #[cfg(feature = "postgres")]
    if let Some(pool) = state.postgres_pool.as_ref() {
        TransactionalOps::create_user_with_membership_apikey_and_credential(
            pool,
            &user,
            &membership,
            &api_key_entity,
            &webauthn_cred,
        )
        .await?;
    } else {
        let _ = state.user_repo.create(user.clone()).await?;
        state.membership_repo.create(membership.clone()).await?;
        state.api_key_repo.create(api_key_entity.clone()).await?;
        state
            .storage
            .webauthn_repository()
            .create_credential(webauthn_cred.clone())
            .await?;
    }

    #[cfg(not(feature = "postgres"))]
    {
        let _ = state.user_repo.create(user.clone()).await?;
        state.membership_repo.create(membership.clone()).await?;
        state.api_key_repo.create(api_key_entity.clone()).await?;
        state
            .storage
            .webauthn_repository()
            .create_credential(webauthn_cred.clone())
            .await?;
    }

    // Best-effort unified credential entry
    let unified_cred = CredentialEntity::new(
        user_id,
        CredentialType::WebauthnPasskey,
        request.label,
    );
    if let Err(e) = state.storage.credential_repository().create(unified_cred).await {
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
    let token_pair = state
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
    state.session_repo.create(session).await?;

    // Fire on_registered callback
    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::WebAuthn,
        is_new_user: true,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
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
        post_login: compute_post_login(&user, &state.settings_service, &*state.totp_repo, &*state.credential_repo).await,
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}
