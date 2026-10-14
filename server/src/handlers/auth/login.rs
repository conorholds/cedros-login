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
//! temporary MFA token and a TOTP or recovery code to complete authentication.
//!
//! # Audit Events
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
use std::sync::Arc;

use super::login_session::complete_login_flow;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{AuthMethod, AuthResponse, LoginRequest};
use crate::repositories::{normalize_email, AuditEventType};
use crate::services::EmailService;
use crate::utils::{
    build_json_response_with_cookies, compute_authenticated_post_login, compute_post_login,
    extract_client_ip_with_fallback, find_user_by_password_email, PeerIp,
};
use crate::AppState;

/// POST /auth/login - Login with email/password
pub async fn login<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Enabled check: runtime setting > static config
    let email_enabled = state
        .settings_service
        .get_bool("auth_email_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.email.enabled);
    if !email_enabled {
        return Err(AppError::NotFound("Email auth disabled".into()));
    }
    let verification_required = state
        .settings_service
        .email_verification_required(state.config.email.require_verification)
        .await?;

    // Normalize email (NFKC + lowercase) to prevent Unicode homograph bypasses
    let email = normalize_email(&req.email);

    let ip_address =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);

    let candidate = find_user_by_password_email(&state, &email, verification_required).await?;
    let identity = candidate
        .as_ref()
        .map(|user| user.id.to_string())
        .unwrap_or_else(|| email.clone());
    let attempt_key =
        crate::middleware::abuse::password_attempt_key(&identity, ip_address.as_deref());

    // Check if account is locked out
    let lockout_status = match state
        .login_attempt_repo
        .get_lockout_status(&attempt_key, &state.login_attempt_config)
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
    let mut user = match candidate {
        Some(u) => u,
        None => {
            // Run dummy password verification to prevent timing-based email enumeration.
            // Without this, an attacker could distinguish unknown emails (fast response)
            // from known emails (slow response due to argon2 verification).
            state
                .password_service
                .verify_dummy(req.password.clone())
                .await?;

            // Record failed attempt atomically (prevents race condition bypass)
            let _ = state
                .login_attempt_repo
                .record_failed_attempt_atomic(
                    None,
                    &attempt_key,
                    ip_address.as_deref(),
                    &state.login_attempt_config,
                )
                .await;
            return Err(AppError::InvalidCredentials);
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
                .await?;

            // Record failed attempt atomically (prevents race condition bypass)
            let _ = state
                .login_attempt_repo
                .record_failed_attempt_atomic(
                    Some(user.id),
                    &attempt_key,
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
                &attempt_key,
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

    // Email verification is checked AFTER password verification intentionally.
    // This prevents email enumeration - we don't reveal "email not verified" until
    // the password is confirmed correct. Trade-off: MFA challenge may be shown before
    // email verification error, but this is acceptable UX for better security.
    //
    // We return a GENERIC error to avoid revealing password correctness.
    // Previously returned "Email not verified" which confirmed correct password.
    // Now we return the same error as invalid credentials to prevent this leak.
    // Do NOT clear failed attempts here — password is correct but auth is not
    // complete. Clearing the counter would let an attacker with the correct password
    // reset the lockout indefinitely without ever completing login.
    if verification_required && !user.email_verified {
        return Err(AppError::InvalidCredentials);
    }

    if state.password_service.needs_rehash(password_hash) {
        let upgraded_hash = state.password_service.hash(req.password.clone()).await?;
        let user_revision = user.updated_at;
        user.password_hash = Some(upgraded_hash);
        user = state
            .user_repo
            .update_if_current(user, user_revision)
            .await?;
    }

    if let Some(response) =
        super::pending_invite_login_response(&state, &user, AuthMethod::Email).await?
    {
        return Ok(response);
    }

    // Successful login - clear failed attempts
    let _ = state
        .login_attempt_repo
        .clear_failed_attempts(&attempt_key)
        .await;

    if let Some(response) =
        super::pending_mfa_response(&state, &user, AuthMethod::Email, &headers).await?
    {
        return Ok(response);
    }

    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let pre_auth_post_login_action = compute_post_login(
        &user,
        &state.settings_service,
        &*state.totp_repo,
        &*state.credential_repo,
    )
    .await?;
    if matches!(
        pre_auth_post_login_action.as_ref(),
        Some(action) if action.action == "setup_mfa"
    ) {
        return Err(AppError::Forbidden(
            "MFA setup is required before completing login".into(),
        ));
    }

    let (token_pair, auth_user, callback_data) =
        complete_login_flow(&state, &user, ip_address, user_agent, true).await?;
    let post_login_action = compute_authenticated_post_login(
        &user,
        &token_pair.access_token,
        &state.settings_service,
        &*state.totp_repo,
        &*state.credential_repo,
        &state.subscription_selection_service,
    )
    .await?;

    // Log audit event with warning on failure (security-critical event)
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
        invite_code_required: None,
        pending_invite_token: None,
        post_login: post_login_action,
        method: Some(AuthMethod::Email),
    };

    // Build response with optional cookies
    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}
