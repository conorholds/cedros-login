//! Solana wallet authentication handlers

use axum::{extract::State, http::HeaderMap, response::IntoResponse, Json};
use chrono::{Duration, Utc};
use std::sync::Arc;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::handlers::auth::{
    call_authenticated_callback_with_timeout, call_registered_callback_with_timeout,
    pending_invite_response,
};
use crate::models::{
    AuthMethod, AuthResponse, SolanaAuthRequest, SolanaChallengeRequest, SolanaLinkRequest,
};
use crate::repositories::{
    generate_api_key, ApiKeyEntity, AuditEventType, MembershipEntity, NonceEntity, SessionEntity,
    UserEntity,
};
use crate::services::{EmailService, SolanaService};
use crate::utils::{
    authenticate, build_json_response_with_cookies, compute_authenticated_post_login,
    enforce_signup_access_code, extract_client_ip_with_fallback, get_default_org_context,
    hash_refresh_token, resolve_org_assignment, user_entity_to_auth_user, PeerIp,
};
use crate::AppState;

/// Check whether Solana auth is enabled via runtime setting or static config.
async fn check_solana_enabled<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
) -> Result<(), AppError> {
    let enabled = state
        .settings_service
        .get_bool("auth_solana_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.solana.enabled);
    if !enabled {
        return Err(AppError::NotFound("Solana auth disabled".into()));
    }
    Ok(())
}

/// POST /auth/solana/challenge - Generate a challenge for Solana wallet sign-in
pub async fn solana_challenge<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Json(req): Json<SolanaChallengeRequest>,
) -> Result<impl IntoResponse, AppError> {
    check_solana_enabled(&state).await?;

    // Validate public key by attempting to decode it
    // A valid Solana public key is exactly 32 bytes when decoded from base58
    let public_key_bytes = bs58::decode(&req.public_key)
        .into_vec()
        .map_err(|_| AppError::Validation("Invalid public key format".into()))?;

    if public_key_bytes.len() != 32 {
        return Err(AppError::Validation("Invalid public key length".into()));
    }

    // Resolve challenge expiry from runtime settings, falling back to static config
    let challenge_expiry = state
        .settings_service
        .get_u64("auth_solana_challenge_expiry")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.solana.challenge_expiry_seconds)
        .clamp(30, 600);

    // Generate challenge with domain binding to prevent cross-site phishing
    let domain = state
        .config
        .server
        .frontend_url
        .as_deref()
        .ok_or_else(|| AppError::Config("Frontend URL is required for Solana auth".into()))?;
    let challenge =
        state
            .solana_service
            .generate_challenge(&req.public_key, challenge_expiry, Some(domain))?;

    // Store nonce for replay protection
    let nonce_entity = NonceEntity::new(
        challenge.nonce.clone(),
        req.public_key.clone(),
        challenge.message.clone(),
        challenge.expires_at,
    );
    state.nonce_repo.create(nonce_entity).await?;

    Ok(Json(challenge))
}

/// POST /auth/solana - Verify signature and authenticate
pub async fn solana_auth<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<SolanaAuthRequest>,
) -> Result<impl IntoResponse, AppError> {
    check_solana_enabled(&state).await?;

    // Extract nonce from message
    let nonce = SolanaService::extract_nonce(&req.message)
        .ok_or(AppError::Validation("Invalid message format".into()))?;

    // Atomically consume nonce to prevent TOCTOU race conditions.
    // This combines find + validity check + mark_used into a single atomic operation.
    let nonce_entity = state
        .nonce_repo
        .consume_if_valid(&nonce)
        .await?
        .ok_or(AppError::ChallengeExpired)?;

    // Verify the public key matches the challenge
    if nonce_entity.public_key != req.public_key {
        return Err(AppError::InvalidSignature);
    }

    // Verify the message matches
    if nonce_entity.message != req.message {
        return Err(AppError::InvalidSignature);
    }

    // Verify signature
    if !state
        .solana_service
        .verify_signature(&req.public_key, &req.signature, &req.message)?
    {
        return Err(AppError::InvalidSignature);
    }

    // Check if user exists by wallet address
    let existing_user = state.user_repo.find_by_wallet(&req.public_key).await?;

    let (user, is_new_user, api_key) = if let Some(user) = existing_user {
        (user, false, None)
    } else {
        enforce_signup_access_code(&state, req.access_code.as_deref()).await?;
        let mut signup_limit_permit = state.signup_limit_service.acquire().await?;
        signup_limit_permit.ensure_available().await?;

        // Check if wallet already exists (shouldn't happen, but safety check)
        if state.user_repo.wallet_exists(&req.public_key).await? {
            return Err(AppError::WalletExists);
        }

        // Create new user
        let now = Utc::now();
        let mut user = UserEntity {
            id: uuid::Uuid::new_v4(),
            email: None,
            email_verified: false,
            password_hash: None,
            name: None,
            username: None,
            picture: None,
            wallet_address: Some(req.public_key.clone()),
            google_id: None,
            apple_id: None,
            auth_methods: vec![AuthMethod::Solana],
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

        // NOW resolve org assignment — user exists in DB, FK satisfied
        let org_assignment = resolve_org_assignment(&state, user.id).await?;
        let membership = MembershipEntity::new(user.id, org_assignment.org_id, org_assignment.role);
        state.membership_repo.create(membership).await?;

        if let Some(response) =
            pending_invite_response(&state, &user, AuthMethod::Solana, &headers).await?
        {
            return Ok(response);
        }

        let raw_api_key = generate_api_key();
        let api_key_entity = ApiKeyEntity::new(user.id, &raw_api_key, "default");
        state.api_key_repo.create(api_key_entity).await?;

        (user, true, Some(raw_api_key))
    };
    if let Some(response) =
        super::auth::pending_invite_login_response(&state, &user, AuthMethod::Solana).await?
    {
        return Ok(response);
    }
    if let Some(response) =
        super::auth::pending_mfa_response(&state, &user, AuthMethod::Solana, &headers).await?
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
        method: AuthMethod::Solana,
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
        method: Some(AuthMethod::Solana),
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

/// POST /solana/link - Attach a Solana wallet to the AUTHENTICATED user.
///
/// Same challenge/proof as sign-in (`POST /solana/challenge` first), but binds
/// the wallet to the current account instead of finding-or-creating one.
/// Mirrors /link-oauth: rejects a wallet already on another account
/// (`WalletExists`) and rejects replacing this account's existing wallet
/// (unlink it first) — a silent swap would replace a money-bearing identifier.
pub async fn solana_link<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<SolanaLinkRequest>,
) -> Result<impl IntoResponse, AppError> {
    check_solana_enabled(&state).await?;
    let auth = authenticate(&state, &headers).await?;
    let session_id = auth.session_id.ok_or(AppError::StepUpRequired)?;

    // Linking a wallet adds a primary authentication method, so require the
    // same recent strong-auth gate used for MFA enrollment. API keys and
    // bearer tokens without a live session cannot satisfy this step-up.
    state.step_up_service.require_step_up(session_id).await?;

    // Verify the signed challenge proves control of the wallet (same
    // atomic nonce consumption as sign-in).
    let nonce = SolanaService::extract_nonce(&req.message)
        .ok_or(AppError::Validation("Invalid message format".into()))?;
    let nonce_entity = state
        .nonce_repo
        .consume_if_valid(&nonce)
        .await?
        .ok_or(AppError::ChallengeExpired)?;
    if nonce_entity.public_key != req.public_key || nonce_entity.message != req.message {
        return Err(AppError::InvalidSignature);
    }
    if !state
        .solana_service
        .verify_signature(&req.public_key, &req.signature, &req.message)?
    {
        return Err(AppError::InvalidSignature);
    }

    // Reject if the wallet is already bound to a different account.
    if let Some(other) = state.user_repo.find_by_wallet(&req.public_key).await? {
        if other.id != auth.user_id {
            return Err(AppError::WalletExists);
        }
    }
    let user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;
    if let Some(existing) = user.wallet_address.as_deref() {
        if existing != req.public_key {
            return Err(AppError::Validation(
                "Account already has a linked wallet; unlink it first".into(),
            ));
        }
    }

    let mut updated = user.clone();
    updated.wallet_address = Some(req.public_key.clone());
    if !updated.auth_methods.contains(&AuthMethod::Solana) {
        updated.auth_methods.push(AuthMethod::Solana);
    }
    updated.updated_at = Utc::now();
    let user = state
        .user_repo
        .update_if_current(updated, user.updated_at)
        .await?;
    state
        .session_repo
        .revoke_all_except(user.id, session_id)
        .await?;

    let _ = state
        .audit_service
        .log_user_event(AuditEventType::UserProfileUpdated, user.id, Some(&headers))
        .await;

    // Shape matches the wasm extension's /solana/link response.
    Ok(Json(serde_json::json!({
        "linked": "solana",
        "user": user_entity_to_auth_user(&user),
    })))
}
