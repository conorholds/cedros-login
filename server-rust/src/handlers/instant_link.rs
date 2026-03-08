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
};
use crate::models::{AuthMethod, AuthResponse, MessageResponse};
use crate::repositories::{
    default_expiry, generate_api_key, generate_verification_token, hash_verification_token,
    normalize_email, ApiKeyEntity, AuditEventType, MembershipEntity, SessionEntity, TokenType,
    UserEntity,
};
use crate::services::EmailService;
use crate::utils::{
    build_json_response_with_cookies, compute_post_login, extract_client_ip_with_fallback,
    get_default_org_context, hash_refresh_token, is_new_device, resolve_org_assignment,
    user_entity_to_auth_user, DeviceInfo, PeerIp,
};
use crate::AppState;
use uuid::Uuid;
use serde_json::json;
use tokio::time::{Duration as TokioDuration, Instant as TokioInstant};

/// Request to send instant link email
#[derive(Debug, Deserialize)]
pub struct InstantLinkRequest {
    pub email: String,
}

/// Request to verify instant link and login
#[derive(Debug, Deserialize)]
pub struct VerifyInstantLinkRequest {
    pub token: String,
}

/// POST /auth/instant-link - Send instant link email
pub async fn send_instant_link<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<InstantLinkRequest>,
) -> Result<(axum::http::StatusCode, Json<MessageResponse>), AppError> {
    // IL-01: Reduce timing-based account enumeration.
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

    // F-34: Normalize email (NFKC + lowercase) to prevent Unicode homograph bypasses
    let email = normalize_email(&req.email);

    // HANDLER-02: Rate limit instant link requests per email
    // Uses login_attempt_repo for rate limiting despite "failed_attempt" naming.
    // Rationale: instant link requests are security-sensitive and should be rate
    // limited regardless of success/failure to prevent email enumeration via timing.
    let throttle_key = format!("instant_link:{}", email);
    let throttle_status = state
        .login_attempt_repo
        .record_failed_attempt_atomic(None, &throttle_key, None, &state.login_attempt_config)
        .await?;
    if throttle_status.is_locked {
        if let Some(remaining) = throttle_status.lockout_remaining_secs {
            return Err(AppError::TooManyRequests(format!(
                "Too many instant link requests. Try again in {} seconds",
                remaining
            )));
        }
        return Err(AppError::RateLimited);
    }

    // Find or create user by email
    let user = match state.user_repo.find_by_email(&email).await? {
        Some(u) => u,
        None => {
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
                stripe_customer_id: None,
                auth_methods: vec![AuthMethod::Email],
                is_system_admin: false,
                created_at: now,
                updated_at: now,
                last_login_at: None,
                welcome_completed_at: None,
            };
            match state.user_repo.create(new_user).await {
                Ok(created) => created,
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
            }
        }
    };

    // Delete any existing instant link tokens for this user
    state
        .verification_repo
        .delete_for_user(user.id, TokenType::InstantLink)
        .await?;

    // Generate and store token
    let token = generate_verification_token();
    let token_hash = hash_verification_token(&token);

    state
        .verification_repo
        .create(
            user.id,
            &token_hash,
            TokenType::InstantLink,
            default_expiry(TokenType::InstantLink),
        )
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create token: {}", e)))?;

    // Queue instant link email via outbox for async delivery
    state
        .comms_service
        .queue_instant_link_email(&email, user.name.as_deref(), &token, Some(user.id))
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

    // H-08: Always hash and lookup to prevent timing attacks.
    // Don't do early format validation - just hash whatever we got.
    // Invalid/malformed tokens will simply not be found in the DB.
    let token_hash = hash_verification_token(&req.token);

    // SEC-04: Atomically consume the token (prevents TOCTOU race conditions)
    // The underlying SQL uses UPDATE ... WHERE used_at IS NULL ... RETURNING
    // which ensures only one concurrent request can succeed. Any subsequent
    // requests with the same token will find used_at already set and fail.
    let token = state
        .verification_repo
        .consume_if_valid(&token_hash)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to consume token: {}", e)))?
        .ok_or_else(|| AppError::Validation("Invalid or expired link".to_string()))?;

    if token.token_type != TokenType::InstantLink {
        // Use generic error to avoid revealing token type differences
        return Err(AppError::Validation("Invalid or expired link".to_string()));
    }

    // Get user
    let mut user = state
        .user_repo
        .find_by_id(token.user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    // If user's email wasn't verified, verify it now (instant link proves email ownership)
    if !user.email_verified {
        state.user_repo.set_email_verified(user.id, true).await?;
        user.email_verified = true;
    }

    // SEC-01: Check if MFA is enabled - if so, return MFA required response
    // Instant link proves email ownership but not authenticator possession.
    // Users with MFA must complete the second factor before getting a session.
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

        // Log audit event for MFA challenge
        let _ = state
            .audit_service
            .log_user_event(AuditEventType::MfaChallengeIssued, user.id, Some(&headers))
            .await;

        return Ok(Json(json!({
            "mfaRequired": true,
            "mfaToken": mfa_token,
            "userId": user.id
        }))
        .into_response());
    }

    // Get user's memberships to find default org and detect new users
    let memberships = state.membership_repo.find_by_user(user.id).await?;

    // New-user detection: if no memberships, this user was created by send_instant_link
    // and needs signup completion (membership + API key).
    let (is_new_user, raw_api_key) = if memberships.is_empty() {
        let org_assignment = resolve_org_assignment(&state, user.id).await?;
        let membership = MembershipEntity::new(user.id, org_assignment.org_id, org_assignment.role);
        state.membership_repo.create(membership).await?;
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
    let token_context = get_default_org_context(&memberships, user.is_system_admin, user.email_verified);

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
    state.session_repo.create(session).await?;

    // Check if this is a new device and send security alert email
    // Instant link already verifies email ownership, so we check for new device
    if let Some(email) = &user.email {
        // Get previous sessions to check for new device
        let previous_sessions = state
            .session_repo
            .find_recent_by_user_id(user.id, 10)
            .await?;
        let previous_user_agents: Vec<Option<String>> = previous_sessions
            .iter()
            .filter(|s| s.id != session_id) // Exclude the session we just created
            .map(|s| s.user_agent.clone())
            .collect();

        let device_info = DeviceInfo::from_user_agent(user_agent.as_deref());

        // Send security alert if this is a new device (and user has previous sessions)
        if !previous_user_agents.is_empty()
            && is_new_device(&device_info.fingerprint, &previous_user_agents)
        {
            let login_time = Utc::now().format("%B %d, %Y at %H:%M UTC").to_string();
            let _ = state
                .comms_service
                .queue_security_alert_email(
                    email,
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

    // Fire callback (registered for new users, authenticated for existing)
    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::Email, // Instant link is email-based
        is_new_user,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
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
        post_login: compute_post_login(&user, &state.settings_service, &*state.totp_repo, &*state.credential_repo).await,
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_instant_link_request_deserialize() {
        let json = r#"{"email": "test@example.com"}"#;
        let req: InstantLinkRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "test@example.com");
    }

    #[test]
    fn test_verify_instant_link_request_deserialize() {
        let json = r#"{"token": "abc123xyz"}"#;
        let req: VerifyInstantLinkRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.token, "abc123xyz");
    }
}
