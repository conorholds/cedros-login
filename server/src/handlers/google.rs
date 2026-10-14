//! Google OAuth authentication handler

use axum::{extract::State, http::HeaderMap, response::IntoResponse, Json};
use chrono::{Duration, Utc};
use std::sync::Arc;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::handlers::auth::{
    call_authenticated_callback_with_timeout, call_registered_callback_with_timeout,
    pending_invite_response,
};
use crate::models::{AuthMethod, AuthResponse, GoogleAuthRequest};
use crate::repositories::normalize_email;
use crate::repositories::{
    generate_api_key, ApiKeyEntity, AuditEventType, MembershipEntity, SessionEntity, UserEntity,
};
use crate::services::EmailService;
use crate::utils::{
    build_json_response_with_cookies, compute_authenticated_post_login, email_blocks_signup,
    enforce_signup_access_code, ensure_primary_email_row, extract_client_ip_with_fallback,
    get_default_org_context, hash_refresh_token, resolve_org_assignment, user_entity_to_auth_user,
    PeerIp,
};
use crate::AppState;

/// POST /auth/google - Authenticate with Google ID token
pub async fn google_auth<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<GoogleAuthRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Enabled check: runtime setting > static config
    let enabled = state
        .settings_service
        .get_bool("auth_google_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.google.enabled);
    if !enabled {
        return Err(AppError::NotFound("Google auth disabled".into()));
    }

    // Resolve client_id: runtime setting > static config
    let client_id = state
        .settings_service
        .get("auth_google_client_id")
        .await
        .ok()
        .flatten()
        .filter(|s| !s.is_empty())
        .or_else(|| state.config.google.client_id.clone())
        .ok_or_else(|| AppError::Config("Google client ID not configured".into()))?;

    // Verify the Google token (ID token from One Tap, or access token from popup)
    let claims = match (&req.id_token, &req.access_token) {
        (Some(id_token), _) => {
            state
                .google_service
                .verify_id_token(id_token, &client_id)
                .await?
        }
        (_, Some(access_token)) => {
            state
                .google_service
                .verify_access_token(access_token, &client_id)
                .await?
        }
        _ => {
            return Err(AppError::Validation(
                "Either idToken or accessToken is required".into(),
            ))
        }
    };

    let email_is_authoritative = claims.is_authoritative_email();
    let email = claims
        .email
        .ok_or(AppError::Validation("Email not provided by Google".into()))?;
    let normalized_email = normalize_email(&email);
    // Check if user exists by Google ID
    let existing_user = state.user_repo.find_by_google_id(&claims.sub).await?;

    let (user, is_new_user, api_key) = if let Some(user) = existing_user {
        (user, false, None)
    } else if email_is_authoritative && email_blocks_signup(&state, &normalized_email).await? {
        return Err(AppError::AccountLinkRequired {
            provider: "google".to_string(),
        });
    } else {
        enforce_signup_access_code(&state, req.access_code.as_deref()).await?;
        let mut signup_limit_permit = state.signup_limit_service.acquire().await?;
        signup_limit_permit.ensure_available().await?;

        // Create new user
        let now = Utc::now();
        let mut user = UserEntity {
            id: uuid::Uuid::new_v4(),
            email: email_is_authoritative.then_some(normalized_email),
            // Google is authoritative for Gmail and Workspace (`hd`) addresses.
            // For other hosted domains, the Google `email_verified` claim only
            // proves the address was verified at Google, not current domain control.
            email_verified: email_is_authoritative,
            password_hash: None,
            name: claims.name,
            username: None,
            picture: claims.picture,
            wallet_address: None,
            google_id: Some(claims.sub),
            apple_id: None,
            auth_methods: vec![AuthMethod::Google],
            is_system_admin: false,
            created_at: now,
            updated_at: now,
            last_login_at: Some(now),
            welcome_completed_at: None,
            referral_code: crate::repositories::generate_referral_code(),
            referred_by: None,
        };
        if let Some(code) = req
            .referral
            .as_deref()
            .map(str::trim)
            .filter(|code| !code.is_empty())
        {
            match state.user_repo.find_by_referral_code(code).await {
                Ok(Some(referrer)) => user.referred_by = Some(referrer.id),
                Ok(None) => {}
                Err(error) => {
                    tracing::warn!(error = %error, "Failed to resolve referral code, ignoring")
                }
            }
        }

        // Persist user FIRST — org resolution may auto-create a "Default" org
        // whose owner_id FK references users.id, so the user row must exist.
        let user = state.user_repo.create(user).await?;
        signup_limit_permit.record_created();
        ensure_primary_email_row(&state, &user).await?;

        // NOW resolve org assignment — user exists in DB, FK satisfied
        let org_assignment = resolve_org_assignment(&state, user.id).await?;
        let membership = MembershipEntity::new(user.id, org_assignment.org_id, org_assignment.role);
        state.membership_repo.create(membership).await?;

        if let Some(response) =
            pending_invite_response(&state, &user, AuthMethod::Google, &headers).await?
        {
            return Ok(response);
        }

        let raw_api_key = generate_api_key();
        let api_key_entity = ApiKeyEntity::new(user.id, &raw_api_key, "default");
        state.api_key_repo.create(api_key_entity).await?;

        (user, true, Some(raw_api_key))
    };
    if let Some(response) =
        super::auth::pending_invite_login_response(&state, &user, AuthMethod::Google).await?
    {
        return Ok(response);
    }
    if let Some(response) =
        super::auth::pending_mfa_response(&state, &user, AuthMethod::Google, &headers).await?
    {
        return Ok(response);
    }
    // Get user's memberships to find default org context
    let memberships = state.membership_repo.find_by_user(user.id).await?;
    let token_context =
        get_default_org_context(&memberships, user.is_system_admin, user.email_verified);

    // Create session with org context
    let session_id = uuid::Uuid::new_v4();
    let token_pair =
        state
            .jwt_service
            .generate_token_pair_with_context(user.id, session_id, &token_context)?;
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
        user.id,
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
    if !is_new_user {
        // New users get last_login_at at creation; stamp returning logins.
        super::auth::touch_last_login(&state.user_repo, user.id).await;
    }

    // Fire callback
    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::Google,
        is_new_user,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
        referral: req.referral.clone(),
    };

    let callback_data = if is_new_user {
        call_registered_callback_with_timeout(&state.callback, &payload).await
    } else {
        call_authenticated_callback_with_timeout(&state.callback, &payload).await
    };

    // Log audit event (fire-and-forget, don't fail auth on audit error)
    let audit_event = if is_new_user {
        AuditEventType::UserRegister
    } else {
        AuditEventType::UserLogin
    };
    let _ = state
        .audit_service
        .log_user_event(audit_event, user.id, Some(&headers))
        .await;

    let response_tokens = if state.config.cookie.enabled {
        None
    } else {
        Some(token_pair.clone())
    };

    let response = AuthResponse {
        user: auth_user,
        tokens: response_tokens,
        is_new_user,
        callback_data,
        api_key,
        email_queued: None,
        invite_code_required: None,
        pending_invite_token: None,
        method: Some(AuthMethod::Google),
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
