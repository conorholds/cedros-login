//! Token refresh handler
//!
//! # Security Considerations
//!
//! ## IP Address Validation
//!
//! This handler does **not** validate that the refresh request comes from the
//! same IP address as the original login. This is a deliberate trade-off:
//!
//! **Pros of IP pinning:**
//! - Prevents stolen tokens from being used from different networks
//! - Adds defense-in-depth against token theft
//!
//! **Cons of IP pinning:**
//! - Breaks for users on mobile networks (IP changes frequently)
//! - Issues with VPNs and corporate proxies
//! - May force unnecessary re-authentication
//!
//! **Current mitigation:**
//! - Token reuse detection (lines 35-58) catches the most critical attack vector
//! - Refresh tokens are single-use and rotated on each refresh
//!
//! To enable IP pinning, add session.ip_address comparison here and reject
//! mismatches with a security alert email.

/// H-05: Maximum number of active sessions per user.
/// Oldest sessions beyond this limit are automatically revoked on refresh.
const MAX_SESSIONS_PER_USER: u32 = 100;
const ROTATED_REASON: &str = "rotated";
const UNKNOWN_REASON: &str = "unspecified";

use axum::{
    extract::State,
    http::{header, HeaderMap},
    response::IntoResponse,
    Json,
};
use chrono::{Duration, Utc};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{RefreshRequest, RefreshResponse};
use crate::repositories::SessionEntity;
use crate::services::EmailService;
use crate::utils::{
    build_json_response_with_cookies, extract_client_ip_with_fallback, extract_cookie,
    get_default_org_context, hash_refresh_token, PeerIp,
};
use crate::AppState;

/// POST /auth/refresh - Refresh access token
pub async fn refresh<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    maybe_req: Option<Json<RefreshRequest>>,
) -> Result<impl IntoResponse, AppError> {
    let refresh_token = maybe_req.and_then(|Json(req)| req.refresh_token);
    let token = if let Some(token) = refresh_token {
        token
    } else if state.config.cookie.enabled {
        extract_cookie(&headers, &state.config.cookie.refresh_cookie_name)
            .ok_or(AppError::InvalidToken)?
    } else {
        return Err(AppError::InvalidToken);
    };

    // Find session by refresh token
    let token_hash = hash_refresh_token(&token, &state.config.jwt.secret);
    let session = state
        .session_repo
        .find_by_refresh_token(&token_hash)
        .await?
        .ok_or(AppError::InvalidToken)?;

    // Reject already-revoked sessions; only alert on reuse when reason indicates rotation.
    if session.revoked_at.is_some() {
        let reason = session.revoked_reason.as_deref().unwrap_or(UNKNOWN_REASON);
        if !is_token_reuse_reason(reason) {
            if !is_known_non_reuse_reason(reason) {
                tracing::warn!(reason = %reason, "Unknown revoked_reason; treating as non-reuse");
            }
            return Err(AppError::TokenExpired);
        }

        state
            .session_repo
            .revoke_all_for_user_with_reason(session.user_id, "token_reuse")
            .await?;

        // HANDLER-07/SEC-07: Token reuse notification without per-user rate limiting
        // Risk: Attacker with stolen token could trigger repeated notifications (email bombing)
        //
        // Existing mitigations:
        // 1. Global rate limiting at middleware level (reduces frequency)
        // 2. All sessions revoked on first detection (quick rejection after that)
        // 3. Notification is fire-and-forget (doesn't slow down rejection)
        //
        // SEC-07: Why per-user rate limit is deferred:
        // - Requires persistent storage (DB or Redis) to work across instances
        // - Email bombing already mitigated by email provider rate limits
        // - Attacker gains nothing useful from repeated notifications
        // - Implementation complexity not justified by marginal security benefit
        //
        // If needed: Add `last_token_reuse_notification` timestamp to users table,
        // check before sending, update after. Use 1-hour cooldown.
        let ip_address =
            extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);
        let user_agent = headers
            .get(header::USER_AGENT)
            .and_then(|v| v.to_str().ok())
            .map(|s| s.to_string());

        let _ = state
            .comms_service
            .notify_token_reuse(
                session.user_id,
                ip_address.as_deref(),
                user_agent.as_deref(),
            )
            .await;

        return Err(AppError::TokenExpired);
    }

    // Check if session is expired (not revocation check - that's done atomically below)
    if session.expires_at <= Utc::now() {
        return Err(AppError::TokenExpired);
    }

    // Atomically revoke the session. This prevents race conditions where two concurrent
    // requests could both see the session as valid and proceed to use it.
    // If revoke_if_valid returns false, the session was already revoked (token reuse).
    let was_revoked = state
        .session_repo
        .revoke_if_valid_with_reason(session.id, "rotated")
        .await?;

    if !was_revoked {
        // Token reuse detected - the token was already used and revoked by another request.
        // This may indicate token theft, so revoke ALL sessions for this user.
        state
            .session_repo
            .revoke_all_for_user_with_reason(session.user_id, "token_reuse")
            .await?;

        // HANDLER-07: Same rate limiting concern as above - see comment there
        let ip_address =
            extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);
        let user_agent = headers
            .get(header::USER_AGENT)
            .and_then(|v| v.to_str().ok())
            .map(|s| s.to_string());

        // Send critical security notification (fire-and-forget)
        let _ = state
            .comms_service
            .notify_token_reuse(
                session.user_id,
                ip_address.as_deref(),
                user_agent.as_deref(),
            )
            .await;

        return Err(AppError::TokenExpired);
    }

    // Session successfully revoked atomically - proceed with rotation

    // Fetch user for is_system_admin flag
    let user = state
        .user_repo
        .find_by_id(session.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    // Preserve org context: look up user's memberships and select default org
    let memberships = state.membership_repo.find_by_user(session.user_id).await?;

    // Select default org using shared helper
    let token_context = get_default_org_context(&memberships, user.is_system_admin, user.email_verified);

    // Generate new tokens with preserved org context
    let new_session_id = uuid::Uuid::new_v4();
    let token_pair = state.jwt_service.generate_token_pair_with_context(
        session.user_id,
        new_session_id,
        &token_context,
    )?;
    let refresh_expiry =
        Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);

    // MW-06: Capture current request's IP and user-agent for the new session
    // (instead of preserving old session values which may be stale)
    let current_ip =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);
    let current_user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    // SEC-007: Log IP changes on token refresh for security monitoring.
    // This allows detecting potential token theft without breaking legitimate use cases
    // like mobile networks where IP changes are common.
    if let (Some(old_ip), Some(ref new_ip)) = (&session.ip_address, &current_ip) {
        if old_ip != new_ip {
            tracing::info!(
                user_id = %session.user_id,
                session_id = %session.id,
                old_ip = %old_ip,
                new_ip = %new_ip,
                "SEC-007: IP address changed during token refresh"
            );
        }
    }

    // Create new session with current request context
    let new_session = SessionEntity::new_with_id(
        new_session_id,
        session.user_id,
        hash_refresh_token(&token_pair.refresh_token, &state.config.jwt.secret),
        refresh_expiry,
        current_ip,
        current_user_agent,
    );
    state.session_repo.create(new_session).await?;

    // H-05: Enforce session limit - revoke oldest sessions if user has too many.
    // This prevents session accumulation from being a DoS vector.
    //
    // NEW-11: Fire-and-forget is intentional - cleanup failures should not fail refresh.
    // Session limits are best-effort; the primary token refresh must succeed.
    // Cleanup will be retried on next refresh or handled by scheduled cleanup.
    //
    // SEC-04/REL-01: Log cleanup failures for monitoring. Silent failures could allow
    // session accumulation if cleanup consistently fails.
    if let Err(e) = state
        .session_repo
        .revoke_oldest_active_sessions(session.user_id, MAX_SESSIONS_PER_USER)
        .await
    {
        tracing::warn!(
            user_id = %session.user_id,
            error = %e,
            "Failed to enforce session limit during refresh - cleanup will be retried"
        );
    }

    let response_tokens = if state.config.cookie.enabled {
        None
    } else {
        Some(token_pair.clone())
    };

    let response = RefreshResponse {
        tokens: response_tokens,
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}

fn is_token_reuse_reason(reason: &str) -> bool {
    reason == ROTATED_REASON
}

fn is_known_non_reuse_reason(reason: &str) -> bool {
    matches!(
        reason,
        "logout"
            | "logout_all"
            | "user_revoke_other_sessions"
            | "password_reset"
            | "org_switch"
            | "org_switch_cleanup"
            | "session_limit"
            | UNKNOWN_REASON
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_token_reuse_reason() {
        assert!(is_token_reuse_reason("rotated"));
        assert!(!is_token_reuse_reason("logout"));
    }

    #[test]
    fn test_known_non_reuse_reason() {
        assert!(is_known_non_reuse_reason("logout"));
        assert!(is_known_non_reuse_reason(UNKNOWN_REASON));
        assert!(!is_known_non_reuse_reason("new_reason"));
    }
}
