//! User login handler
//!
//! # Security Considerations: Timing Attacks
//!
//! This handler prevents timing-based email enumeration by running a dummy
//! argon2 verification when the email is not found or the user has no password.
//! This ensures consistent response times regardless of email validity.
//!
//! **Defenses in place:**
//! 1. Dummy hash verification for unknown emails (constant-time)
//! 2. Rate limiting on auth endpoints
//! 3. Account lockout after N failed attempts
//!
//! # MFA Enforcement
//!
//! When a user has MFA enabled, the login handler returns an `MfaRequiredResponse`
//! instead of full tokens. The client must then call `/auth/login/mfa` with the
//! temporary MFA token and a TOTP code to complete authentication.
//!
//! # Audit Events (REL-001/SEC-11)
//!
//! Security-critical events (login, MFA challenge, MFA completion) are logged via
//! the audit service. These are fire-and-forget with warnings on failure because:
//!
//! - **Availability**: Audit service failures should not block authentication
//! - **Monitoring**: Failures are logged at WARN level for alerting
//! - **Resilience**: Transient failures are acceptable; patterns indicate issues
//!
//! Making audit synchronous would create an availability vs security trade-off.
//! Current approach prioritizes availability while maintaining visibility via logs.

use axum::{
    extract::State,
    http::{header, HeaderMap},
    response::IntoResponse,
    Json,
};
use chrono::{Duration, Utc};
use serde_json::json;
use std::sync::Arc;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::models::{AuthMethod, AuthResponse, LoginRequest, MfaLoginRequest};
use crate::repositories::{
    default_expiry, generate_verification_token, hash_verification_token, normalize_email,
    AuditEventType, SessionEntity, TokenType, UserEntity,
};
use crate::services::EmailService;
use crate::utils::{
    build_json_response_with_cookies, extract_client_ip_with_fallback, get_default_org_context,
    hash_refresh_token, is_new_device, user_entity_to_auth_user, DeviceInfo, PeerIp,
};
use crate::AppState;

/// POST /auth/login - Login with email/password
pub async fn login<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    if !state.config.email.enabled {
        return Err(AppError::NotFound("Email auth disabled".into()));
    }

    // F-34: Normalize email (NFKC + lowercase) to prevent Unicode homograph bypasses
    let email = normalize_email(&req.email);

    let ip_address =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);

    // Check if account is locked out
    let lockout_status = match state
        .login_attempt_repo
        .get_lockout_status(&email, &state.login_attempt_config)
        .await
    {
        Ok(status) => status,
        Err(err) => {
            tracing::debug!(error = %err, step = "login_lockout_status");
            return Err(err);
        }
    };

    if lockout_status.is_locked {
        let remaining_mins = lockout_status
            .lockout_remaining_secs
            .map(|s| (s + 59) / 60) // Round up to nearest minute
            .unwrap_or(0);
        return Err(AppError::AccountLocked(format!(
            "Too many failed attempts. Try again in {} minute{}",
            remaining_mins,
            if remaining_mins == 1 { "" } else { "s" }
        )));
    }

    // Find user by email
    let user = match state.user_repo.find_by_email(&email).await {
        Ok(Some(u)) => u,
        Ok(None) => {
            // Run dummy password verification to prevent timing-based email enumeration.
            // Without this, an attacker could distinguish unknown emails (fast response)
            // from known emails (slow response due to argon2 verification).
            state
                .password_service
                .verify_dummy(req.password.clone())
                .await;

            // Record failed attempt atomically (prevents race condition bypass)
            let _ = state
                .login_attempt_repo
                .record_failed_attempt_atomic(
                    None,
                    &email,
                    ip_address.as_deref(),
                    &state.login_attempt_config,
                )
                .await;
            return Err(AppError::InvalidCredentials);
        }
        Err(err) => {
            tracing::debug!(error = %err, step = "login_find_user");
            return Err(err);
        }
    };

    // Get password hash
    let password_hash = match user.password_hash.as_ref() {
        Some(h) => h,
        None => {
            // User exists but has no password (OAuth-only account).
            // Run dummy verification to normalize timing.
            state
                .password_service
                .verify_dummy(req.password.clone())
                .await;

            // Record failed attempt atomically (prevents race condition bypass)
            let _ = state
                .login_attempt_repo
                .record_failed_attempt_atomic(
                    Some(user.id),
                    &email,
                    ip_address.as_deref(),
                    &state.login_attempt_config,
                )
                .await;
            return Err(AppError::InvalidCredentials);
        }
    };

    // Verify password (timing-safe)
    if !state
        .password_service
        .verify(req.password.clone(), password_hash.clone())
        .await?
    {
        // Record failed attempt atomically and get updated status
        // This prevents race conditions where concurrent requests bypass lockout
        let updated_status = state
            .login_attempt_repo
            .record_failed_attempt_atomic(
                Some(user.id),
                &email,
                ip_address.as_deref(),
                &state.login_attempt_config,
            )
            .await?;

        // Check if we've just crossed the threshold - notify admins
        if updated_status.failed_attempts == state.login_attempt_config.max_attempts {
            // Fire-and-forget notification
            let _ = state
                .comms_service
                .notify_login_threshold(
                    &email,
                    updated_status.failed_attempts,
                    ip_address.as_deref(),
                )
                .await;
        }

        return Err(AppError::InvalidCredentials);
    }

    // HDL-3: Email verification is checked AFTER password verification intentionally.
    // This prevents email enumeration - we don't reveal "email not verified" until
    // the password is confirmed correct. Trade-off: MFA challenge may be shown before
    // email verification error, but this is acceptable UX for better security.
    //
    // HANDLER-03: We return a GENERIC error to avoid revealing password correctness.
    // Previously returned "Email not verified" which confirmed correct password.
    // Now we return the same error as invalid credentials to prevent this leak.
    // S-01: Do NOT clear failed attempts here — password is correct but auth is not
    // complete. Clearing the counter would let an attacker with the correct password
    // reset the lockout indefinitely without ever completing login.
    if state.config.email.require_verification && !user.email_verified {
        return Err(AppError::InvalidCredentials);
    }

    // Successful login - clear failed attempts
    let _ = state
        .login_attempt_repo
        .clear_failed_attempts(&email)
        .await;

    // Check if MFA is enabled - if so, return MFA required response
    let has_mfa = state.totp_repo.has_mfa_enabled(user.id).await?;
    if has_mfa {
        // Create a short-lived MFA pending token
        let mfa_token = generate_verification_token();
        let mfa_token_hash = hash_verification_token(&mfa_token);

        // Delete any existing MFA pending tokens for this user
        let _ = state
            .verification_repo
            .delete_for_user(user.id, TokenType::MfaPending)
            .await;

        // Store the MFA pending token (5 minute expiry)
        state
            .verification_repo
            .create(
                user.id,
                &mfa_token_hash,
                TokenType::MfaPending,
                default_expiry(TokenType::MfaPending),
            )
            .await
            .map_err(|e| {
                AppError::Internal(anyhow::anyhow!("Failed to create MFA token: {}", e))
            })?;

        // REL-001: Log audit event with warning on failure (security-critical event)
        if let Err(e) = state
            .audit_service
            .log_user_event(AuditEventType::MfaChallengeIssued, user.id, Some(&headers))
            .await
        {
            tracing::warn!(error = %e, user_id = %user.id, "Failed to log MFA challenge audit event");
            // SRV-15: Track audit log failures for alerting
            metrics::counter!("security.audit_log.failure").increment(1);
        }

        return Ok(Json(json!({
            "mfaRequired": true,
            "mfaToken": mfa_token,
            "userId": user.id
        }))
        .into_response());
    }

    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let (token_pair, auth_user, callback_data) =
        complete_login_flow(&state, &user, ip_address, user_agent, true).await?;

    // REL-001: Log audit event with warning on failure (security-critical event)
    if let Err(e) = state
        .audit_service
        .log_user_event(AuditEventType::UserLogin, user.id, Some(&headers))
        .await
    {
        tracing::warn!(error = %e, user_id = %user.id, "Failed to log login audit event");
    }

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
        email_queued: None,
    };

    // Build response with optional cookies
    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}

/// POST /auth/login/mfa - Complete MFA login
///
/// After successful password verification, if the user has MFA enabled,
/// they receive an `mfa_token`. This endpoint completes the login by
/// verifying the TOTP code.
pub async fn complete_mfa_login<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<MfaLoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    if !state.config.email.enabled {
        return Err(AppError::NotFound("Email auth disabled".into()));
    }

    // Hash the provided MFA token to look it up
    let mfa_token_hash = hash_verification_token(&req.mfa_token);

    // Allow multiple code entry attempts while preventing brute-force.
    // We validate the MFA token without consuming it first, then consume it on success.
    let verification_token = state
        .verification_repo
        .find_by_hash(&mfa_token_hash)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to lookup MFA token: {}", e)))?
        .ok_or_else(|| AppError::Validation("Invalid or expired MFA token".into()))?;

    if !verification_token.is_valid() {
        return Err(AppError::Validation("Invalid or expired MFA token".into()));
    }

    // Check token type
    if verification_token.token_type != TokenType::MfaPending {
        return Err(AppError::Validation("Invalid or expired MFA token".into()));
    }

    let user_id = verification_token.user_id;

    // SEC-04: Per-user MFA attempt tracking to prevent brute-force.
    if let Err(remaining) = state.mfa_attempt_service.check_allowed(user_id).await {
        return Err(AppError::TooManyRequests(format!(
            "Too many verification attempts. Try again in {} seconds",
            remaining.as_secs()
        )));
    }

    // Get user's TOTP secret
    let totp_secret = state
        .totp_repo
        .find_by_user(user_id)
        .await?
        .ok_or(AppError::Validation("MFA not configured".into()))?;

    if !totp_secret.enabled {
        return Err(AppError::Validation("MFA not enabled".into()));
    }

    // Get user for email (required for TOTP verification)
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    let email = user
        .email
        .clone()
        .ok_or(AppError::Internal(anyhow::anyhow!(
            "User has MFA but no email"
        )))?;

    // S-14: Verify the TOTP code with replay protection
    let time_step = match state.totp_service.verify_with_replay_check(
        &totp_secret.secret,
        &req.code,
        &email,
        totp_secret.last_used_time_step,
    )? {
        Some(ts) => ts,
        None => {
            // SRV-10: Audit log failed MFA attempt
            let _ = state
                .audit_service
                .log_user_event(AuditEventType::MfaVerificationFailed, user_id, Some(&headers))
                .await;

            // Record failed attempt and enforce lockout.
            if let Err(lockout) = state.mfa_attempt_service.record_failed(user_id).await {
                return Err(AppError::TooManyRequests(format!(
                    "Too many verification attempts. Try again in {} seconds",
                    lockout.as_secs()
                )));
            }
            return Err(AppError::Validation("Invalid verification code".into()));
        }
    };

    // S-14: Record the used time step to prevent replay
    if !state
        .totp_repo
        .record_used_time_step_if_newer(user_id, time_step)
        .await?
    {
        if let Err(lockout) = state.mfa_attempt_service.record_failed(user_id).await {
            return Err(AppError::TooManyRequests(format!(
                "Too many verification attempts. Try again in {} seconds",
                lockout.as_secs()
            )));
        }
        return Err(AppError::Validation("Invalid verification code".into()));
    }

    // Atomically consume the MFA token on success (prevents replay/TOCTOU).
    // If another request already consumed it, treat it as invalid.
    let consumed = state
        .verification_repo
        .consume_if_valid(&mfa_token_hash)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to consume MFA token: {}", e)))?
        .ok_or_else(|| AppError::Validation("Invalid or expired MFA token".into()))?;

    if consumed.token_type != TokenType::MfaPending {
        return Err(AppError::Validation("Invalid or expired MFA token".into()));
    }

    state.mfa_attempt_service.record_success(user_id).await;

    // MFA verified - now complete the login flow (same as regular login)
    let ip_address =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);

    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let (token_pair, auth_user, callback_data) =
        complete_login_flow(&state, &user, ip_address, user_agent, false).await?;

    // REL-001: Log audit event with warning on failure (security-critical event)
    if let Err(e) = state
        .audit_service
        .log_user_event(AuditEventType::MfaLoginCompleted, user.id, Some(&headers))
        .await
    {
        tracing::warn!(error = %e, user_id = %user.id, "Failed to log MFA login audit event");
    }

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
        email_queued: None,
    };

    // Build response with optional cookies
    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}

async fn complete_login_flow<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    ip_address: Option<String>,
    user_agent: Option<String>,
    require_verified_email_for_alert: bool,
) -> Result<
    (
        crate::models::TokenPair,
        crate::models::AuthUser,
        Option<serde_json::Value>,
    ),
    AppError,
> {
    let memberships = state.membership_repo.find_by_user(user.id).await?;
    let token_context = get_default_org_context(&memberships, user.is_system_admin);

    let session_id = uuid::Uuid::new_v4();
    let token_pair =
        state
            .jwt_service
            .generate_token_pair_with_context(user.id, session_id, &token_context)?;
    let refresh_expiry =
        Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);

    let mut session = SessionEntity::new_with_id(
        session_id,
        user.id,
        hash_refresh_token(&token_pair.refresh_token, &state.config.jwt.secret),
        refresh_expiry,
        ip_address.clone(),
        user_agent.clone(),
    );
    session.last_strong_auth_at = Some(Utc::now());
    state.session_repo.create(session).await?;

    let should_send_alert = if require_verified_email_for_alert {
        user.email_verified
    } else {
        true
    };

    if should_send_alert {
        if let Some(email_addr) = &user.email {
            let previous_sessions = state
                .session_repo
                .find_recent_by_user_id(user.id, 10)
                .await?;
            let previous_user_agents: Vec<Option<String>> = previous_sessions
                .iter()
                .filter(|s| s.id != session_id)
                .map(|s| s.user_agent.clone())
                .collect();

            let device_info = DeviceInfo::from_user_agent(user_agent.as_deref());

            if !previous_user_agents.is_empty()
                && is_new_device(&device_info.fingerprint, &previous_user_agents)
            {
                let login_time = Utc::now().format("%B %d, %Y at %H:%M UTC").to_string();
                let _ = state
                    .comms_service
                    .queue_security_alert_email(
                        email_addr,
                        user.name.as_deref(),
                        user.id,
                        &login_time,
                        ip_address.as_deref(),
                        Some(&device_info.device_type),
                        Some(&device_info.browser),
                    )
                    .await;
            }
        }
    }

    let auth_user = user_entity_to_auth_user(user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::Email,
        is_new_user: false,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
    };
    let callback_data =
        super::call_authenticated_callback_with_timeout(&state.callback, &payload).await;

    Ok((token_pair, auth_user, callback_data))
}
