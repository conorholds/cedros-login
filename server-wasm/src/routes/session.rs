//! Session lifecycle: logout (revoke the current session) + refresh (single-use
//! rotation). Ported from `server/src/handlers/auth/{session.rs,refresh.rs}`.
//!
//! On detected reuse of an already-rotated refresh token after the grace window
//! (a theft signal), we revoke ALL the user's sessions and queue a security-alert
//! email. The host atomically consumes the old session and writes its
//! replacement under the same lock used by revocation.
use chrono::{DateTime, Duration};
use serde::Deserialize;

use super::auth::{
    access_token, build_jwt, client_ip, default_org_context, ensure_email_verified_session_allowed,
    hmac_secret, prepare_session, respond_rotated, user_agent,
};
use super::cookies::{self, CookieSettings};
use super::{error_response, RouteError};
use crate::clock;
use crate::data::{audit, outbox, sessions, users};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, log, telemetry};
use crate::services::email_templates;
use crate::services::tokens::hash_refresh_token;

/// Revoked-session reason set when a refresh token is rotated; reuse of such a
/// token afterwards is the theft signal.
const ROTATED_REASON: &str = "rotated";
const REUSE_GRACE_SECS: i64 = 60;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RefreshRequest {
    #[serde(default)]
    refresh_token: Option<String>,
}

pub fn logout(request: &RouteRequest) -> RouteResponse {
    match logout_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

pub fn refresh(request: &RouteRequest) -> RouteResponse {
    match refresh_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// Idempotent: revoke the identified session if present, always clear cookies.
fn logout_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let cfg = cookies::config();
    let mut access_subject = None;
    let mut revoked = false;
    if let Some(token) = access_token(request) {
        let (jwt, _) = build_jwt()?;
        if let Ok(claims) = jwt.validate_access_token(&token) {
            access_subject = Some(claims.sub.clone());
            if let Some(session) = sessions::find_by_id(&claims.sid)? {
                if logout_session_matches_subject(&session, &claims.sub) {
                    sessions::revoke(&claims.sid, "logout")?;
                    revoked = true;
                }
            }
        }
    }
    if !revoked {
        if let Some(refresh) = refresh_token(request, &cfg) {
            let hmac = hmac_secret()?;
            if let Some(session) =
                sessions::find_by_refresh_token_hash(&hash_refresh_token(&refresh, &hmac))?
            {
                if access_subject
                    .as_deref()
                    .is_none_or(|subject| subject == session.user_id)
                {
                    sessions::revoke(&session.id, "logout")?;
                }
            }
        }
    }
    let mut headers = vec![("content-type".to_string(), "application/json".to_string())];
    if cfg.enabled {
        headers.extend(cfg.logout_cookies());
    }
    let _ = telemetry::emit_event(
        "cedros-login:logout",
        "",
        &serde_json::json!({ "scope": "current-session", "routeId": "cedros-login:logout" }),
    );
    Ok(RouteResponse {
        status: 200,
        headers,
        body: r#"{"message":"Logged out successfully"}"#.to_string(),
    })
}

fn logout_session_matches_subject(session: &sessions::SessionEntry, subject: &str) -> bool {
    // A rotated ancestor still identifies the family that logout must revoke.
    // This is deliberately weaker than normal API authentication, not a grant.
    session.user_id == subject
}

fn refresh_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let cfg = cookies::config();
    let token = refresh_token(request, &cfg).ok_or(RouteError::Status(401, "invalid_token"))?;
    let hmac = hmac_secret()?;
    let session = sessions::find_by_refresh_token_hash(&hash_refresh_token(&token, &hmac))?
        .ok_or(RouteError::Status(401, "invalid_token"))?;

    reject_revoked_session(&session)?;
    if session.expires_at <= clock::now_iso() {
        return Err(RouteError::Status(401, "token_expired"));
    }

    let user =
        users::find_by_id(&session.user_id)?.ok_or(RouteError::Status(401, "invalid_token"))?;
    ensure_email_verified_session_allowed(&user)?;

    // Prepare tokens first; publish them only after the atomic rotation commits.
    let context = default_org_context(&user)?;
    let (tokens, mut replacement) = prepare_session(
        &user,
        &context,
        client_ip(request),
        user_agent(request),
        session.last_strong_auth_at.clone(),
    )?;
    replacement.expires_at = replacement.expires_at.min(session.expires_at.clone());
    sessions::rotate(&session, &replacement, ROTATED_REASON).map_err(|err| {
        if err.is_db_conflict() {
            RouteError::Status(401, "token_revoked")
        } else {
            err.into()
        }
    })?;
    // Refresh rotates a session rather than logging in: no `method`, no
    // lastLoginAt stamp, and no post-login gate re-evaluation (MFA/subscription).
    respond_rotated(200, &user, tokens, false, None, &cfg)
}

fn reject_revoked_session(session: &sessions::SessionEntry) -> Result<(), RouteError> {
    if session.revoked_at.is_none() {
        return Ok(());
    }
    if session.revoked_reason.as_deref() != Some(ROTATED_REASON) {
        return Err(RouteError::Status(401, "token_revoked"));
    }
    let now = clock::now_iso();
    if reuse_is_within_grace(session.revoked_at.as_deref(), &now) {
        log::op_info(
            "session",
            "token-reuse-within-grace",
            "rotated-token-replayed",
        );
        return Err(RouteError::Status(401, "token_revoked"));
    }
    if let Err(error) =
        sessions::revoke_all_for_user(&session.user_id, "token_reuse_detected", None)
    {
        log::op_error("session", "token-reuse-revoke-all", error.code());
    }
    alert_token_reuse(&session.user_id);
    let _ = telemetry::emit_event(
        "cedros-login:token-reuse-detected",
        "",
        &serde_json::json!({
            "reason":"rotated-token-replayed","alertEmailQueued":true,
            "routeId":"cedros-login:refresh",
        }),
    );
    Err(RouteError::Status(401, "token_revoked"))
}

/// Audit + email the user that token reuse was detected (best-effort).
fn alert_token_reuse(user_id: &str) {
    // Losing the security audit record for a token-theft event is itself
    // operator-relevant (the alert still proceeds — warn, not fatal).
    if let Err(e) = audit::log(
        audit::SECURITY_TOKEN_REUSE,
        Some(user_id),
        Some("user"),
        Some(user_id),
    ) {
        log::op_warn("session", "audit-token-reuse", e.code());
    }
    if let Ok(Some(user)) = users::find_by_id(user_id) {
        if let Some(to) = user.email {
            let design =
                match crate::services::email_design::resolve("cedros-login/email_verification") {
                    Ok(design) => design,
                    Err(error) => {
                        crate::host::log::op_warn("email", "resolve-security-design", error.code());
                        return;
                    }
                };
            let email = super::with_subject_override(
                email_templates::security_alert(&design,
                    user.name.as_deref(),
                    "The site detected reuse of a sign-in token that had already been replaced. This can happen when a device uses an old session, or if someone else has obtained the token.",
                ),
                "email_subject_security_alert",
            );
            if let Err(e) = outbox::enqueue_user_email(
                &user.id,
                &to,
                &email.subject,
                Some(&email.html),
                Some(&email.text),
            ) {
                log::op_warn("outbox", "enqueue-security-alert", e.code());
            }
        }
    }
}

/// Refresh token from the request body, else the refresh cookie.
fn refresh_token(request: &RouteRequest, cfg: &CookieSettings) -> Option<String> {
    from_json::<RefreshRequest>(&request.body)
        .ok()
        .and_then(|r| r.refresh_token)
        .or_else(|| cookies::extract(request, &cfg.refresh_name))
}

fn reuse_is_within_grace(revoked_at: Option<&str>, now_iso: &str) -> bool {
    let Some(revoked_at) = revoked_at else {
        return false;
    };
    let Ok(revoked_at) = DateTime::parse_from_rfc3339(revoked_at) else {
        return false;
    };
    let Ok(now) = DateTime::parse_from_rfc3339(now_iso) else {
        return false;
    };

    let age = now.signed_duration_since(revoked_at);
    age >= Duration::zero() && age <= Duration::seconds(REUSE_GRACE_SECS)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn session() -> sessions::SessionEntry {
        sessions::SessionEntry {
            id: "session-1".into(),
            user_id: "user-1".into(),
            refresh_token_hash: "hash".into(),
            ip_address: None,
            user_agent: None,
            created_at: "2026-06-01T00:00:00.000Z".into(),
            expires_at: "2026-06-02T00:00:00.000Z".into(),
            revoked_at: None,
            revoked_reason: None,
            last_strong_auth_at: None,
        }
    }

    #[test]
    fn logout_accepts_same_owner_rotated_ancestors_but_not_other_subjects() {
        let now = "2026-06-01T12:00:00.000Z";
        let mut session = session();
        assert!(logout_session_matches_subject(&session, "user-1"));
        assert!(!logout_session_matches_subject(&session, "user-2"));

        session.revoked_at = Some("2026-06-01T11:00:00.000Z".into());
        assert!(logout_session_matches_subject(&session, "user-1"));

        session.revoked_at = None;
        session.expires_at = now.into();
        assert!(logout_session_matches_subject(&session, "user-1"));
    }

    #[test]
    fn reuse_grace_accepts_inside_window() {
        assert!(reuse_is_within_grace(
            Some("2026-06-01T00:00:00.000Z"),
            "2026-06-01T00:00:00.000Z"
        ));
        assert!(reuse_is_within_grace(
            Some("2026-06-01T00:00:00.000Z"),
            "2026-06-01T00:00:01.000Z"
        ));
        assert!(reuse_is_within_grace(
            Some("2026-06-01T00:00:00.000Z"),
            "2026-06-01T00:01:00.000Z"
        ));
    }

    #[test]
    fn reuse_grace_rejects_outside_window() {
        assert!(!reuse_is_within_grace(
            Some("2026-06-01T00:00:00.000Z"),
            "2026-06-01T00:01:01.000Z"
        ));
    }

    #[test]
    fn reuse_grace_rejects_future_rotation() {
        assert!(!reuse_is_within_grace(
            Some("2026-06-01T00:00:01.000Z"),
            "2026-06-01T00:00:00.000Z"
        ));
    }

    #[test]
    fn reuse_grace_rejects_none_or_malformed_timestamps() {
        assert!(!reuse_is_within_grace(None, "2026-06-01T00:00:01.000Z"));
        assert!(!reuse_is_within_grace(
            Some("not-a-timestamp"),
            "2026-06-01T00:00:01.000Z"
        ));
        assert!(!reuse_is_within_grace(
            Some("2026-06-01T00:00:00.000Z"),
            "not-a-timestamp"
        ));
    }
}
