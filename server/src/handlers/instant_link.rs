//! Instant link (passwordless) authentication handlers

use axum::{
    extract::State,
    http::{header, HeaderMap},
    response::IntoResponse,
    Json,
};
use chrono::{Duration, Utc};
use serde::Deserialize;
use std::sync::Arc;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::handlers::auth::{
    call_authenticated_callback_with_timeout, call_registered_callback_with_timeout,
    maybe_queue_new_device_alert, pending_invite_response,
};
use crate::models::{AuthMethod, AuthResponse, MessageResponse};
use crate::repositories::{
    generate_api_key, generate_verification_token, hash_verification_token, normalize_email,
    ApiKeyEntity, AuditEventType, MembershipEntity, SessionEntity, TokenType, UserEntity,
};
use crate::services::EmailService;
use crate::utils::{
    build_json_response_with_cookies, compute_authenticated_post_login, enforce_signup_access_code,
    ensure_primary_email_row, extract_client_ip_with_fallback, get_default_org_context,
    hash_refresh_token, resolve_org_assignment, user_entity_to_auth_user, PeerIp,
};
use crate::AppState;
use tokio::time::{Duration as TokioDuration, Instant as TokioInstant};
use uuid::Uuid;

#[cfg(test)]
mod tests;

const DEFAULT_INSTANT_LINK_EXPIRY_SECS: u64 = 15 * 60;

/// Request to send instant link email
#[derive(Debug, Deserialize)]
pub struct InstantLinkRequest {
    pub email: String,
    /// Optional referral code for new user signup attribution.
    /// Stored on the provisional user at send time; applied at verify time.
    pub referral: Option<String>,
    /// Optional signup access code. Required when `signup_access_code_enabled` is true.
    pub access_code: Option<String>,
}

/// Request to verify instant link and login
#[derive(Debug, Deserialize)]
pub struct VerifyInstantLinkRequest {
    pub token: String,
}

fn should_complete_instant_link_signup(
    memberships_are_empty: bool,
    claimed_unverified_primary: bool,
) -> bool {
    memberships_are_empty && claimed_unverified_primary
}

fn supports_email_login(password_hash: Option<&str>, auth_methods: &[AuthMethod]) -> bool {
    password_hash.is_some() || auth_methods.contains(&AuthMethod::Email)
}

/// POST /auth/instant-link - Send instant link email
pub async fn send_instant_link<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<InstantLinkRequest>,
) -> Result<(axum::http::StatusCode, Json<MessageResponse>), AppError> {
    // Reduce timing-based account enumeration.
    //
    // The "user exists" path does extra DB/outbox work, which can make responses
    // measurably slower than the "user missing" path. We enforce a small minimum
    // handler duration for non-error responses.
    let started_at = TokioInstant::now();
    const MIN_DURATION: TokioDuration = TokioDuration::from_millis(150);

    // Enabled check: runtime setting > static email config
    let enabled = state
        .settings_service
        .get_bool("auth_instantlink_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.email.enabled);
    if !enabled {
        return Err(AppError::NotFound("Instant link auth disabled".into()));
    }

    let response = (
        axum::http::StatusCode::OK,
        Json(MessageResponse {
            message: "A sign-in link has been sent to your email".to_string(),
        }),
    );

    // Normalize email (NFKC + lowercase) to prevent Unicode homograph bypasses
    let email = normalize_email(&req.email);

    // Rate limit instant link requests per email
    // Uses login_attempt_repo for rate limiting despite "failed_attempt" naming.
    // Rationale: instant link requests are security-sensitive and should be rate
    // limited regardless of success/failure to prevent email enumeration via timing.
    let throttle_key = format!("instant_link:{email}");
    let throttle_status = state
        .login_attempt_repo
        .record_failed_attempt_atomic(None, &throttle_key, None, &state.login_attempt_config)
        .await?;
    if throttle_status.is_locked {
        if let Some(remaining) = throttle_status.lockout_remaining_secs {
            return Err(AppError::TooManyRequests(format!(
                "Too many instant link requests. Try again in {remaining} seconds"
            )));
        }
        return Err(AppError::RateLimited);
    }

    // Find or create user by email. Verified secondary emails may sign in; pending
    // secondary rows block account creation but do not become login identifiers.
    let user = if let Some(row) = state.user_email_repo.find_active_by_email(&email).await? {
        if row.verified_at.is_none() && !row.is_primary {
            return Ok(response);
        }
        state
            .user_repo
            .find_by_id(row.user_id)
            .await?
            .ok_or(AppError::InvalidToken)?
    } else {
        match state.user_repo.find_by_email(&email).await? {
            Some(u) => u,
            None => {
                enforce_signup_access_code(&state, req.access_code.as_deref()).await?;
                let mut signup_limit_permit = state.signup_limit_service.acquire().await?;
                signup_limit_permit.ensure_available().await?;

                let referred_by = if let Some(code) = req
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

                // Create provisional user for instant link signup.
                // The user must exist for verification_tokens.user_id FK.
                // Membership + API key are created later in verify_instant_link.
                let now = Utc::now();
                let new_user = UserEntity {
                    id: Uuid::new_v4(),
                    email: Some(email.clone()),
                    email_verified: false,
                    password_hash: None,
                    name: None,
                    username: None,
                    picture: None,
                    wallet_address: None,
                    google_id: None,
                    apple_id: None,
                    auth_methods: vec![AuthMethod::Email],
                    is_system_admin: false,
                    created_at: now,
                    updated_at: now,
                    last_login_at: None,
                    welcome_completed_at: None,
                    referral_code: crate::repositories::generate_referral_code(),
                    referred_by,
                };
                let created_user = match state.user_repo.create(new_user).await {
                    Ok(created) => {
                        signup_limit_permit.record_created();
                        created
                    }
                    Err(AppError::EmailExists) => {
                        // Race: user created between find and create
                        state
                            .user_repo
                            .find_by_email(&email)
                            .await?
                            .ok_or_else(|| {
                                AppError::Internal(anyhow::anyhow!(
                                    "User vanished after EmailExists"
                                ))
                            })?
                    }
                    Err(e) => return Err(e),
                };
                ensure_primary_email_row(&state, &created_user).await?;

                created_user
            }
        }
    };
    // Possession of an email address must not silently add passwordless login
    // to an account established only through OAuth, a wallet, or WebAuthn.
    if !supports_email_login(user.password_hash.as_deref(), &user.auth_methods) {
        let elapsed = started_at.elapsed();
        if elapsed < MIN_DURATION {
            tokio::time::sleep(MIN_DURATION - elapsed).await;
        }
        return Ok(response);
    }
    ensure_primary_email_row(&state, &user).await?;
    let target_email = state
        .user_email_repo
        .find_active_by_email(&email)
        .await?
        .filter(|row| {
            row.user_id == user.id
                && (row.is_verified() || (row.is_primary && !user.email_verified))
        });
    let Some(target_email) = target_email else {
        return Ok(response);
    };

    // Generate and store token
    let token = generate_verification_token();
    let token_hash = hash_verification_token(&token);
    let expires_at = Utc::now()
        + Duration::seconds(
            resolve_instant_link_expiry_secs(&state.settings_service).await? as i64,
        );

    let proof = crate::repositories::VerificationToken::new(
        user.id,
        Some(target_email.id),
        token_hash,
        TokenType::InstantLink,
        expires_at,
    );

    // Queue instant link email via outbox for async delivery
    state
        .comms_service
        .queue_instant_link_email(
            &email,
            user.name.as_deref(),
            &token,
            Some(user.id),
            &[proof],
        )
        .await?;

    // Log audit event (fire-and-forget)
    let _ = state
        .audit_service
        .log_user_event(
            AuditEventType::InstantLinkRequested,
            user.id,
            Some(&headers),
        )
        .await;

    let elapsed = started_at.elapsed();
    if elapsed < MIN_DURATION {
        tokio::time::sleep(MIN_DURATION - elapsed).await;
    }
    Ok(response)
}

async fn resolve_instant_link_expiry_secs(
    settings: &crate::services::SettingsService,
) -> Result<u64, AppError> {
    Ok(settings
        .get_u64("auth_instantlink_expiry")
        .await?
        .unwrap_or(DEFAULT_INSTANT_LINK_EXPIRY_SECS)
        .clamp(60, 1_800))
}

/// POST /auth/instant-link/verify - Verify instant link and login
pub async fn verify_instant_link<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<VerifyInstantLinkRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Enabled check: runtime setting > static email config
    let enabled = state
        .settings_service
        .get_bool("auth_instantlink_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.email.enabled);
    if !enabled {
        return Err(AppError::NotFound("Instant link auth disabled".into()));
    }

    // Always hash and lookup to prevent timing attacks.
    // Don't do early format validation - just hash whatever we got.
    // Invalid/malformed tokens will simply not be found in the DB.
    let token_hash = hash_verification_token(&req.token);

    let pending = state
        .verification_repo
        .find_valid(&token_hash, &[TokenType::InstantLink])
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to load token: {e}")))?
        .ok_or_else(|| AppError::Validation("Invalid or expired link".to_string()))?;
    let mut user = state
        .user_repo
        .find_by_id(pending.user_id)
        .await?
        .ok_or_else(|| AppError::Validation("Invalid or expired link".to_string()))?;
    let target_email = match pending.subject_id {
        Some(email_id) => state
            .user_email_repo
            .find_by_id(email_id)
            .await?
            .filter(|row| {
                row.user_id == user.id
                    && (row.is_verified() || (row.is_primary && !user.email_verified))
            }),
        None => None,
    };
    let Some(target_email) = target_email else {
        return Err(AppError::Validation("Invalid or expired link".into()));
    };
    if !supports_email_login(user.password_hash.as_deref(), &user.auth_methods) {
        return Err(AppError::Validation("Invalid or expired link".into()));
    }

    // Atomically consume the purpose-bound token. Only one concurrent
    // request can succeed.
    let token = state
        .verification_repo
        .consume_if_valid(&token_hash, &[TokenType::InstantLink])
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to consume token: {e}")))?
        .ok_or_else(|| AppError::Validation("Invalid or expired link".to_string()))?;

    if token.id != pending.id {
        return Err(AppError::Validation("Invalid or expired link".into()));
    }

    let claimed_unverified = target_claims_unverified_primary(&user, &target_email);
    if claimed_unverified {
        user = state
            .storage
            .email_verification_repo
            .claim_unverified_primary(&user, target_email.id, None)
            .await?;
    }

    if let Some(response) =
        super::auth::pending_invite_login_response(&state, &user, AuthMethod::Email).await?
    {
        return Ok(response);
    }
    if !claimed_unverified {
        if let Some(response) =
            super::auth::pending_mfa_response(&state, &user, AuthMethod::Email, &headers).await?
        {
            return Ok(response);
        }
    }

    let memberships = state.membership_repo.find_by_user(user.id).await?;

    let should_complete_signup =
        should_complete_instant_link_signup(memberships.is_empty(), claimed_unverified);
    let (is_new_user, raw_api_key) = if should_complete_signup {
        let org_assignment = resolve_org_assignment(&state, user.id).await?;
        let membership = MembershipEntity::new(user.id, org_assignment.org_id, org_assignment.role);
        state.membership_repo.create(membership).await?;

        if let Some(response) =
            pending_invite_response(&state, &user, AuthMethod::Email, &headers).await?
        {
            return Ok(response);
        }

        let raw = generate_api_key();
        let api_key_entity = ApiKeyEntity::new(user.id, &raw, "default");
        state.api_key_repo.create(api_key_entity).await?;

        (true, Some(raw))
    } else {
        (false, None)
    };

    // Re-fetch memberships if new user (needed for token context)
    let memberships = if is_new_user {
        state.membership_repo.find_by_user(user.id).await?
    } else {
        memberships
    };
    let token_context =
        get_default_org_context(&memberships, user.is_system_admin, user.email_verified);

    // Create session
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
        .get(header::USER_AGENT)
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
    maybe_queue_new_device_alert(
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
    // Every verify is a login (instant-link signups create the user at send
    // time with no last_login_at), so stamp unconditionally.
    super::auth::touch_last_login(&state.user_repo, user.id).await;

    // Fire callback (registered for new users, authenticated for existing)
    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::Email, // Instant link is email-based
        is_new_user,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
        referral: None, // referral code not available at verify step (was captured at send step)
    };
    let callback_data = if is_new_user {
        call_registered_callback_with_timeout(&state.callback, &payload).await
    } else {
        call_authenticated_callback_with_timeout(&state.callback, &payload).await
    };

    // Log audit event (fire-and-forget)
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
        api_key: raw_api_key,
        email_queued: None,
        invite_code_required: None,
        pending_invite_token: None,
        method: Some(AuthMethod::Email),
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

fn target_claims_unverified_primary(
    user: &crate::repositories::UserEntity,
    target: &crate::repositories::UserEmailEntity,
) -> bool {
    !user.email_verified
        && target.is_primary
        && user.email.as_deref().map(normalize_email) == Some(normalize_email(&target.email))
}
