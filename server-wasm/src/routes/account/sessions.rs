use serde::{Deserialize, Serialize};

use super::{
    authenticated_user, clock, cookies, from_json, json, sessions, telemetry, to_json, RouteError,
    RouteRequest, RouteResponse,
};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RevokeSessionRequest {
    session_id: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionView {
    id: String,
    ip_address: Option<String>,
    user_agent: Option<String>,
    created_at: String,
    expires_at: String,
    is_current: bool,
}

/// POST /logout-all — revoke every session for the user, clear cookies.
pub(super) fn logout_all_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    sessions::revoke_all_for_user(&claims.sub, "logout_all", None)?;
    let cfg = cookies::config();
    let mut headers = vec![("content-type".to_string(), "application/json".to_string())];
    if cfg.enabled {
        headers.extend(cfg.logout_cookies());
    }
    let _ = telemetry::emit_event(
        "cedros-login:logout",
        "",
        &serde_json::json!({ "scope": "all-sessions", "routeId": "cedros-login:logout-all" }),
    );
    Ok(RouteResponse {
        status: 200,
        headers,
        body: r#"{"message":"Logged out of all sessions"}"#.to_string(),
    })
}

/// GET /sessions — the user's active sessions (current one flagged).
pub(super) fn list_sessions_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    let sessions = sessions::find_active_by_user(&claims.sub, &clock::now_iso())?;
    let views: Vec<SessionView> = sessions
        .into_iter()
        .map(|session| SessionView {
            is_current: session.id == claims.sid,
            id: session.id,
            ip_address: session.ip_address,
            user_agent: session.user_agent,
            created_at: session.created_at,
            expires_at: session.expires_at,
        })
        .collect();
    let body = to_json(&serde_json::json!({ "sessions": views, "total": views.len() }))?;
    Ok(json(200, &body))
}

/// POST /sessions/revoke — revoke one of the user's own sessions.
pub(super) fn revoke_session_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    let req: RevokeSessionRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    match sessions::find_by_id(&req.session_id)? {
        Some(session) if session.user_id == claims.sub => {
            sessions::revoke(&req.session_id, "user_revoked")?;
            Ok(json(200, r#"{"message":"Session revoked"}"#))
        }
        // Don't reveal whether a session id exists for another user.
        _ => Err(RouteError::Status(404, "session_not_found")),
    }
}

/// DELETE /sessions — revoke every session for the user except the current one.
pub(super) fn revoke_all_sessions_inner(
    request: &RouteRequest,
) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    let revoked = sessions::revoke_all_for_user(&claims.sub, "user_revoked", Some(&claims.sid))?;
    let body = to_json(&serde_json::json!({
        "message": "Other sessions revoked",
        "revokedCount": revoked,
    }))?;
    Ok(json(200, &body))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn session_view_uses_the_client_current_session_field() {
        for is_current in [true, false] {
            let view = SessionView {
                id: "session-1".into(),
                ip_address: None,
                user_agent: None,
                created_at: "2026-09-09T00:00:00Z".into(),
                expires_at: "2026-09-16T00:00:00Z".into(),
                is_current,
            };
            let json = serde_json::to_value(view).unwrap();
            assert_eq!(json["isCurrent"], is_current);
            assert!(json.get("current").is_none());
        }
    }
}
