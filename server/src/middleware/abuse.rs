//! Layered budgets before identity handlers perform crypto, allocation, or IO.
//! Uses the configured shared backend; keys never contain raw identifiers.
use super::rate_limit::{RateLimitBackend, RateLimitConfig, RateLimitError};
use crate::{callback::AuthCallback, services::EmailService, AppState};
use axum::{
    body::{to_bytes, Body},
    extract::{Request, State},
    middleware::Next,
    response::{IntoResponse, Response},
};
use sha2::{Digest, Sha256};
use std::sync::Arc;

const MAX_BODY: usize = 64 * 1024;

#[derive(Clone, Copy)]
struct Policy {
    family: &'static str,
    system: u32,
    ip: u32,
    identity: u32,
    window: u64,
    authenticated: bool,
}
fn policy(path: &str, method: &str) -> Option<Policy> {
    let (family, system, ip, identity, window, authenticated) = match (method, path) {
        ("POST", "/login") => ("password", 300, 30, 100, 3600, false),
        ("POST", "/register" | "/setup/admin" | "/setup/admin/import") => {
            ("signup", 60, 10, 5, 3600, false)
        }
        (
            "POST",
            "/forgot-password"
            | "/send-verification"
            | "/instant-link"
            | "/account-deletion/request",
        ) => ("email", 120, 20, 3, 600, false),
        ("POST", "/change-password" | "/set-password") => ("password", 300, 30, 20, 600, true),
        ("POST", "/link-oauth") => ("provider", 120, 20, 10, 300, true),
        ("POST", "/google" | "/apple") | ("GET", "/sso/callback") => {
            ("provider", 120, 20, 20, 300, false)
        }
        (
            "POST",
            "/apple/nonce"
            | "/solana/challenge"
            | "/webauthn/auth/options"
            | "/webauthn/signup/options"
            | "/sso/start",
        ) => ("challenge", 600, 60, 20, 300, false),
        ("POST", "/webauthn/register/options") => ("challenge", 600, 60, 20, 300, true),
        (
            "POST",
            "/mfa/setup"
            | "/mfa/enable"
            | "/mfa/disable"
            | "/mfa/verify"
            | "/mfa/recovery"
            | "/mfa/recovery-codes/regenerate"
            | "/webauthn/register/verify"
            | "/solana/link",
        ) => ("proof", 600, 60, 20, 300, true),
        (
            "POST",
            "/reset-password"
            | "/verify-email"
            | "/instant-link/verify"
            | "/account/emails/verify"
            | "/account-deletion/confirm"
            | "/login/mfa"
            | "/solana"
            | "/webauthn/auth/verify"
            | "/webauthn/signup/verify"
            | "/invite-codes/redeem",
        ) => ("proof", 600, 60, 20, 300, false),
        ("POST", "/api-key/validate") => ("api-key", 2000, 120, 60, 60, false),
        ("POST", "/user/api-keys") => ("key-create", 120, 20, 10, 600, true),
        ("POST", "/refresh") => ("session", 2000, 120, 60, 60, false),
        ("POST", "/account/emails") => ("email", 120, 20, 3, 600, true),
        ("POST", p) if p.starts_with("/account/emails/") && p.ends_with("/resend") => {
            ("email", 120, 20, 3, 600, true)
        }
        ("POST", p)
            if p.starts_with("/orgs/") && (p.ends_with("/invites") || p.ends_with("/resend")) =>
        {
            ("email", 120, 20, 20, 3600, true)
        }
        _ => return None,
    };
    Some(Policy {
        family,
        system,
        ip,
        identity,
        window,
        authenticated,
    })
}

fn key(scope: &str, value: &str) -> String {
    let mut hash = Sha256::new();
    hash.update(scope);
    hash.update([0]);
    hash.update(value);
    format!("abuse:{scope}:{:x}", hash.finalize())
}

pub(crate) fn password_attempt_key(identity: &str, ip: Option<&str>) -> String {
    key(
        "password-attempt",
        &format!("{identity}\0{}", ip.unwrap_or("unknown")),
    )
}

async fn consume(
    backend: &RateLimitBackend,
    key: &str,
    limit: u32,
    window_secs: u64,
) -> Result<(), Response> {
    let result = backend
        .check_and_record(key, &RateLimitConfig { limit, window_secs })
        .await;
    if result.unavailable {
        return Err((
            axum::http::StatusCode::SERVICE_UNAVAILABLE,
            [("Retry-After", "1")],
            axum::Json(serde_json::json!({"code":"ABUSE_CONTROL_UNAVAILABLE"})),
        )
            .into_response());
    }
    if !result.allowed {
        return Err(RateLimitError {
            code: "RATE_LIMITED",
            message: "Too many requests. Please try again later.".into(),
            retry_after: result.reset_secs.max(1),
        }
        .into_response());
    }
    Ok(())
}

pub(crate) async fn enforce<C: AuthCallback + 'static, E: EmailService + 'static>(
    State((state, backend)): State<(Arc<AppState<C, E>>, RateLimitBackend)>,
    request: Request,
    next: Next,
) -> Response {
    let started = tokio::time::Instant::now();
    let email_send = request.method() == axum::http::Method::POST
        && [
            "/forgot-password",
            "/send-verification",
            "/instant-link",
            "/account-deletion/request",
        ]
        .iter()
        .any(|path| request.uri().path().ends_with(path));
    let response = match check(&state, &backend, request).await {
        Ok(request) => next.run(request).await,
        Err(response) => response,
    };
    if email_send {
        tokio::time::sleep_until(started + std::time::Duration::from_millis(200)).await;
    }
    response
}

async fn check<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    backend: &RateLimitBackend,
    request: Request,
) -> Result<Request, Response> {
    let path = request
        .uri()
        .path()
        .strip_prefix(state.config.server.auth_base_path.trim_end_matches('/'))
        .filter(|path| path.is_empty() || path.starts_with('/'))
        .unwrap_or(request.uri().path())
        .to_string();
    let Some(policy) = policy(&path, request.method().as_str()) else {
        return Ok(request);
    };
    let ip = super::rate_limit::resolve_client_ip(&request, state.config.server.trust_proxy)
        .unwrap_or_else(|| "unknown".into());
    // Source pressure is charged first: a blocked source cannot exhaust every
    // other identity's budget or allocate attacker-selected keys indefinitely.
    consume(backend, &key("source", &ip), 120, 60).await?;
    consume(backend, &key("system", "identity"), 2000, 60).await?;
    consume(backend, &key("family", policy.family), policy.system, 60).await?;
    consume(
        backend,
        &key("family-source", &format!("{}:{ip}", policy.family)),
        policy.ip,
        300,
    )
    .await?;
    let (parts, body) = request.into_parts();
    let bytes = tokio::time::timeout(std::time::Duration::from_secs(10), to_bytes(body, MAX_BODY))
        .await
        .map_err(|_| axum::http::StatusCode::REQUEST_TIMEOUT.into_response())?
        .map_err(|_| axum::http::StatusCode::PAYLOAD_TOO_LARGE.into_response())?;
    let value: serde_json::Value = serde_json::from_slice(&bytes).unwrap_or_default();
    let email = value
        .get("email")
        .and_then(|v| v.as_str())
        .map(crate::repositories::normalize_email);
    let mut identity = email.clone().or_else(|| {
        [
            "publicKey",
            "mfaToken",
            "token",
            "challengeId",
            "apiKey",
            "refreshToken",
            "pendingInviteToken",
        ]
        .iter()
        .find_map(|field| value.get(field).and_then(|v| v.as_str()).map(str::to_owned))
    });
    if policy.authenticated {
        let auth = crate::utils::authenticate_session(state, &parts.headers)
            .await
            .map_err(IntoResponse::into_response)?;
        consume(
            backend,
            &key("actor", &format!("{}:{}", policy.family, auth.user_id)),
            policy.identity,
            policy.window,
        )
        .await?;
    }
    if path == "/login/mfa" {
        if let Some(token) = value.get("mfaToken").and_then(|v| v.as_str()) {
            let pending = state
                .verification_repo
                .find_valid(
                    &crate::repositories::hash_verification_token(token),
                    &[crate::repositories::TokenType::MfaPending],
                )
                .await
                .map_err(|_| axum::http::StatusCode::SERVICE_UNAVAILABLE.into_response())?;
            if let Some(pending) = pending {
                consume(
                    backend,
                    &key("actor", &format!("proof:{}", pending.user_id)),
                    20,
                    300,
                )
                .await?;
            }
        }
    }
    if let Some(email) = email.as_deref() {
        // Cross-endpoint recipient budgets include registration and invitations.
        if policy.family == "email" || policy.family == "signup" {
            consume(backend, &key("recipient", email), 3, 600).await?;
            consume(backend, &key("recipient-cooldown", email), 1, 60).await?;
        }
        if policy.family == "password" {
            let user = crate::utils::find_user_by_password_email(state, email, false)
                .await
                .map_err(IntoResponse::into_response)?;
            if let Some(user) = user {
                identity = Some(user.id.to_string());
            }
        }
    }
    if let Some(identity) = identity.filter(|v| !v.is_empty()) {
        consume(
            backend,
            &key("identity", &format!("{}:{identity}", policy.family)),
            policy.identity,
            policy.window,
        )
        .await?;
    }
    Ok(Request::from_parts(parts, Body::from(bytes)))
}

#[cfg(test)]
mod tests {
    use super::super::rate_limit::RateLimitStore;
    use super::*;

    #[tokio::test]
    async fn concurrent_sources_share_one_recipient_budget_without_blocking_others() {
        let backend = RateLimitBackend::Memory(RateLimitStore::new());
        let mut jobs = Vec::new();
        for _ in 0..12 {
            let backend = backend.clone();
            jobs.push(tokio::spawn(async move {
                consume(&backend, &key("recipient", "owner@example.com"), 3, 600)
                    .await
                    .is_ok()
            }));
        }
        let mut allowed = 0;
        for job in jobs {
            allowed += usize::from(job.await.unwrap());
        }
        assert_eq!(allowed, 3);
        assert!(
            consume(&backend, &key("recipient", "another@example.com"), 3, 600)
                .await
                .is_ok()
        );
    }

    #[test]
    fn public_and_management_cost_centers_are_guarded() {
        for path in [
            "/register",
            "/login",
            "/forgot-password",
            "/send-verification",
            "/instant-link",
            "/google",
            "/apple/nonce",
            "/solana/challenge",
            "/webauthn/auth/options",
            "/webauthn/signup/options",
            "/webauthn/register/options",
            "/login/mfa",
            "/mfa/setup",
            "/mfa/recovery-codes/regenerate",
            "/orgs/o/invites",
            "/orgs/o/invites/i/resend",
            "/account/emails/e/resend",
            "/user/api-keys",
            "/api-key/validate",
            "/setup/admin",
        ] {
            assert!(policy(path, "POST").is_some(), "{path}");
        }
        assert!(policy("/health", "GET").is_none());
        assert!(policy("/sessions", "DELETE").is_none());
        assert_eq!(
            policy("/forgot-password", "POST").unwrap().family,
            policy("/instant-link", "POST").unwrap().family
        );
    }

    #[test]
    fn short_password_lockouts_are_source_bound_and_keys_are_opaque() {
        let a = password_attempt_key("account", Some("192.0.2.1"));
        assert_ne!(a, password_attempt_key("account", Some("192.0.2.2")));
        assert_ne!(a, password_attempt_key("another", Some("192.0.2.1")));
        assert!(!a.contains("account"));
        assert!(!a.contains("192.0.2.1"));
    }
}
