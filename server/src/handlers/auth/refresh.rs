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
//! - Token reuse detection catches the most critical attack vector
//! - Refresh tokens are single-use and rotated on each refresh
//! - Reuse of a rotated token within 60 seconds is treated as a benign retry or
//!   concurrent refresh: the request is rejected, but other sessions are not
//!   revoked and no theft notification is queued. Later reuse keeps the full
//!   theft response.
//!
//! To enable IP pinning, add session.ip_address comparison here and reject
//! mismatches with a security alert email.

/// Maximum number of active sessions per user.
/// Oldest sessions beyond this limit are automatically revoked on refresh.
const MAX_SESSIONS_PER_USER: u32 = 100;
const REUSE_GRACE_SECS: i64 = 60;
const ROTATED_REASON: &str = "rotated";
const UNKNOWN_REASON: &str = "unspecified";

use axum::{
    extract::State,
    http::{header, HeaderMap},
    response::IntoResponse,
    Json,
};
use chrono::{DateTime, Duration, Utc};
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

        if reuse_is_within_grace(session.revoked_at, Utc::now()) {
            tracing::info!(
                user_id = %session.user_id,
                session_id = %session.id,
                "Refresh token reuse within rotation grace; rejecting without theft response"
            );
            return Err(AppError::TokenExpired);
        }

        state
            .session_repo
            .revoke_all_for_user_with_reason(session.user_id, "token_reuse")
            .await?;

        // Token reuse notification without per-user rate limiting
        // Risk: Attacker with stolen token could trigger repeated notifications (email bombing)
        //
        // Existing mitigations:
        // 1. Global rate limiting at middleware level (reduces frequency)
        // 2. All sessions revoked on first detection (quick rejection after that)
        // 3. Notification is fire-and-forget (doesn't slow down rejection)
        //
        // Why per-user rate limit is deferred:
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

    // Fetch user for is_system_admin flag
    let user = state
        .user_repo
        .find_by_id(session.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;
    if user.is_deleted() {
        return Err(AppError::InvalidToken);
    }

    // Preserve org context: look up user's memberships and select default org
    let memberships = state.membership_repo.find_by_user(session.user_id).await?;

    // Select default org using shared helper
    let token_context =
        get_default_org_context(&memberships, user.is_system_admin, user.email_verified);

    // Generate new tokens with preserved org context
    let new_session_id = uuid::Uuid::new_v4();
    let token_pair = state.jwt_service.generate_token_pair_with_context(
        session.user_id,
        new_session_id,
        &token_context,
    )?;
    let refresh_expiry =
        Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);

    // Capture current request's IP and user-agent for the new session
    // (instead of preserving old session values which may be stale)
    let current_ip =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);
    let current_user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    // Log IP changes on token refresh for security monitoring.
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
    if !state
        .session_repo
        .rotate(&session, new_session, "rotated")
        .await?
    {
        // A concurrent refresh or revocation won. A lost CAS does not itself
        // prove theft and must not terminate independent device sessions.
        return Err(AppError::TokenExpired);
    }

    // Enforce session limit - revoke oldest sessions if user has too many.
    // This prevents session accumulation from being a DoS vector.
    //
    // Fire-and-forget is intentional - cleanup failures should not fail refresh.
    // Session limits are best-effort; the primary token refresh must succeed.
    // Cleanup will be retried on next refresh or handled by scheduled cleanup.
    //
    // Log cleanup failures for monitoring. Silent failures could allow
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

fn reuse_is_within_grace(revoked_at: Option<DateTime<Utc>>, now: DateTime<Utc>) -> bool {
    revoked_at
        .map(|revoked_at| now.signed_duration_since(revoked_at))
        .is_some_and(|age| age >= Duration::zero() && age <= Duration::seconds(REUSE_GRACE_SECS))
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

    #[test]
    fn test_reuse_grace_accepts_recent_rotation() {
        let now = Utc::now();
        assert!(reuse_is_within_grace(Some(now), now));
        assert!(reuse_is_within_grace(Some(now - Duration::seconds(1)), now));
        assert!(reuse_is_within_grace(
            Some(now - Duration::seconds(REUSE_GRACE_SECS)),
            now
        ));
    }

    #[test]
    fn test_reuse_grace_rejects_missing_or_late_rotation() {
        let now = Utc::now();
        assert!(!reuse_is_within_grace(None, now));
        assert!(!reuse_is_within_grace(
            Some(now - Duration::seconds(REUSE_GRACE_SECS + 1)),
            now
        ));
    }

    #[test]
    fn test_reuse_grace_rejects_future_rotation() {
        let now = Utc::now();
        assert!(!reuse_is_within_grace(
            Some(now + Duration::seconds(1)),
            now
        ));
    }
}
