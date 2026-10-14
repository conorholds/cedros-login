//! Inbound route surface: declares the routes this extension serves and
//! dispatches each request to a handler. Public IdP routes (register/login) run
//! in their own auth domain; admin routes gate on the host admin session.
mod abuse;
pub mod account;
pub mod account_emails;
pub mod admin;
pub mod admin_audit;
pub mod admin_config;
pub mod admin_email;
pub mod admin_orgs;
pub mod admin_relying_parties;
pub mod admin_sso;
pub mod admin_users;
pub mod api_keys;
pub mod auth;
pub mod authorize;
pub mod avatar;
pub mod cookies;
pub mod credentials;
pub mod custom_roles;
pub mod discovery;
mod dispatch;
pub mod identity_profile;
pub mod instant_link;
mod invite_code_policy;
mod invite_code_utils;
pub mod invite_codes;
mod invite_gate_handoff;
pub mod invites;
pub mod members;
pub mod mfa;
mod mfa_disable;
mod mfa_login;
pub mod oauth;
pub mod org_access;
pub mod orgs;
pub mod pagination;
pub mod policies;
pub mod portal_agent_keys;
pub mod profile;
pub mod public_auth_registry;
pub mod registry;
pub mod relying_party;
pub mod session;
pub mod setup;
pub mod signup_access;
pub mod social;
pub mod solana;
pub mod sso;
mod sso_credentials;
pub(crate) mod subscription_selection;
pub mod system_email_preview;
mod totp_credentials;
pub mod user_lookup;
pub mod webauthn;
mod webauthn_support;

use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse, RouteSpec};
use crate::host::{log, telemetry, SeamError};
use crate::services::AuthError;

/// Routes registered with the host router (mounted under /extensions/{id}).
pub fn list() -> Vec<RouteSpec> {
    registry::list()
}

/// The host mounts this extension at `/extensions/{id}` and delivers the FULL
/// host path (e.g. `/extensions/cedros-login/admin/settings`) to `handle-route`
/// — it never strips the mount prefix (see docs `13a` and the cedros-data
/// dispatcher, which sets `route-request.path = uri.path()`). Our dispatch arms
/// and the per-handler path-param extractors are all written against the
/// namespace-relative path, so we normalize once at the boundary.
const MOUNT_PREFIX: &str = "/extensions/cedros-login";
const PUBLIC_AUTH_PREFIX: &str = "/public-auth";
const SERVER_FRONTEND_URL_KEY: &str = "server_frontend_url";
const LEGACY_FRONTEND_URL_KEY: &str = "frontend_url";

/// Strip the host mount prefix, yielding the namespace-relative path
/// (`/admin/settings`). The bare mount root maps to `/`; a path that is already
/// relative (direct handler unit tests) passes through unchanged.
fn mounted_path(path: &str) -> &str {
    match path.strip_prefix(MOUNT_PREFIX) {
        Some("") => "/",
        Some(rest) if rest.starts_with('/') => rest,
        _ => path,
    }
}

/// Strip the host mount prefix and public-auth allowlist prefix so handlers and
/// path-param extractors see the canonical namespace-relative path.
fn relative_path(path: &str) -> &str {
    let relative = mounted_path(path);
    match relative.strip_prefix(PUBLIC_AUTH_PREFIX) {
        Some("") => "/",
        Some(rest) if rest.starts_with('/') => rest,
        _ => relative,
    }
}

/// Dispatch one inbound request to its handler.
pub fn handle(mut request: RouteRequest) -> RouteResponse {
    let mounted = mounted_path(&request.path).to_string();
    let handler = dispatch::resolve(request.method.as_str(), &mounted, request.route_id.as_str());

    // Normalize the host's full mount path to the namespace-relative path that
    // the per-handler param extractors expect.
    request.path = relative_path(&mounted).to_string();

    // End-user auth is a separate trust domain from host admin CSRF context.
    if !request.path.starts_with("/admin/") && request.path != "/admin" {
        if let Err(error) = auth::require_browser_auth_origin(&request) {
            return error_response(error);
        }
    }

    match handler {
        Some(handler) => match abuse::enforce(&request) {
            Ok(()) => handler(&request),
            Err(error) => error_response(error),
        },
        None => json(404, r#"{"error":"not_found"}"#),
    }
}

/// A 422 validation error carrying a single client-safe message.
pub(crate) fn validation(message: &str) -> RouteError {
    RouteError::Auth(AuthError::Validation(vec![message.to_string()]))
}

/// Emit the `cedros-login:identifier-linked` analytics event after an auth
/// method is attached to an existing account. Redacted by analytics policy;
/// the response carries identity details only to the authenticated caller.
/// `identifier_type` is one of
/// `password`, `google`, `apple`, `wallet`, `webauthn`, `email`.
pub(crate) fn emit_identifier_linked(identifier_type: &str, route_id: &str) {
    let _ = telemetry::emit_event(
        "cedros-login:identifier-linked",
        "",
        &serde_json::json!({ "identifierType": identifier_type, "routeId": route_id }),
    );
}

pub(crate) fn emit_identifier_unlinked(identifier_type: &str, route_id: &str) {
    let _ = telemetry::emit_event(
        "cedros-login:identifier-unlinked",
        "",
        &serde_json::json!({ "identifierType": identifier_type, "routeId": route_id }),
    );
}

/// Per-user transactional-email cooldown window (anti-abuse + provider-cost
/// control on /forgot-password, /send-verification, /instant-link).
pub(crate) const EMAIL_RESEND_COOLDOWN_SECS: i64 = 60;

/// Whether a token of `token_type` was issued for `user_id` within the cooldown
/// window. Callers skip re-sending the email (and still return the generic
/// response, preserving enumeration resistance). Fail-open on a seam error — a
/// throttle must never block a legitimate first send.
pub(crate) fn email_resend_cooldown_active(user_id: &str, token_type: &str) -> bool {
    let since = crate::clock::ago_iso(EMAIL_RESEND_COOLDOWN_SECS);
    crate::data::verifications::issued_since(user_id, token_type, &since).unwrap_or(false)
}

/// Detect — but cannot prevent — the find-before-write uniqueness race after a
/// new account is created by email. The host JSONB seam can't enforce email
/// uniqueness atomically (`write` is an upsert, no insert-if-absent), so two
/// concurrent signups can both persist the same address. A post-commit count >1
/// surfaces that to operators (redacted: count + originating route only, never
/// the email) instead of letting it corrupt silently. Real fix is host-side —
/// see `docs/cedros-database-concurrency-contract.md`.
pub(crate) fn flag_email_collision(email: &str, route_id: &str) {
    if matches!(crate::data::users::count_by_email(email), Ok(n) if n > 1) {
        log::op_error("db", "email-uniqueness-collision", route_id);
    }
}

/// Apply an admin-configured `email_subject_*` override to a rendered email when
/// the setting is set to a non-empty value; otherwise keep the template default.
/// Closes the dead `email_subject_*` toggles (a standalone-parity regression).
pub(crate) fn with_subject_override(
    mut email: crate::services::email_templates::RenderedEmail,
    key: &str,
) -> crate::services::email_templates::RenderedEmail {
    if email.subject_customized {
        return email;
    }
    if let Some(custom) = crate::host::settings::get(key).ok().flatten() {
        let custom = custom.trim().trim_matches('"').trim();
        if !custom.is_empty() {
            email.subject = custom.to_string();
        }
    }
    email
}

/// The host admin actor id from the route context (audit attribution).
pub(crate) fn admin_actor(request: &RouteRequest) -> Option<String> {
    crate::context::RouteContext::parse(&request.context_json).actor_id
}

/// Gate a state-changing admin route: authenticated AND CSRF-immune (bearer)
/// auth (403 otherwise).
pub(crate) fn require_admin_write(request: &RouteRequest) -> Result<(), RouteError> {
    let ctx = crate::context::RouteContext::parse(&request.context_json);
    if !ctx.authenticated {
        return Err(RouteError::Status(401, "unauthenticated"));
    }
    if !ctx.csrf_verified {
        return Err(RouteError::Status(403, "csrf_required"));
    }
    Ok(())
}

/// Gate an admin-management route on a *system-admin* host actor, not merely an
/// authenticated one. The host envelope distinguishes "authenticated" from the
/// "system admin" authorization tier; routes touching sensitive system state
/// (e.g. settings) must fail closed (403 `admin_required`) for an authenticated
/// non-admin actor — and for a system-admin claim with no actor id. Returns 401
/// when the actor is not authenticated at all. Compose with `require_admin_write`
/// when the route also needs CSRF-immune (bearer) auth.
pub(crate) fn require_system_admin(request: &RouteRequest) -> Result<(), RouteError> {
    let ctx = crate::context::RouteContext::parse(&request.context_json);
    if !ctx.authenticated {
        return Err(RouteError::Status(401, "unauthenticated"));
    }
    if ctx.actor_id.as_deref().unwrap_or("").is_empty() || !ctx.system_admin {
        return Err(RouteError::Status(403, "admin_required"));
    }
    Ok(())
}

/// Gate a state-changing admin-management route: system-admin AND CSRF-immune
/// (bearer) auth. The combination every `/admin/*` write must use — `require_admin_write`
/// alone only proves authentication, not the system-admin tier.
pub(crate) fn require_system_admin_write(request: &RouteRequest) -> Result<(), RouteError> {
    require_admin_write(request)?;
    require_system_admin(request)
}

/// The site frontend base URL (no trailing slash) from settings; empty if unset.
/// Email action links are rooted here.
pub(crate) fn frontend_url() -> String {
    frontend_url_setting(SERVER_FRONTEND_URL_KEY)
        .or_else(|| frontend_url_setting(LEGACY_FRONTEND_URL_KEY))
        .unwrap_or_default()
}

fn frontend_url_setting(key: &str) -> Option<String> {
    crate::host::settings::get(key)
        .ok()
        .flatten()
        .map(|v| v.trim().trim_matches('"').trim_end_matches('/').to_string())
        .filter(|s| !s.is_empty())
}

/// A tokenized email action link `{frontend_url}{path}?token={token}`.
pub(crate) fn action_link(path: &str, token: &str) -> String {
    action_link_with_return_to(path, token, None)
}

/// A tokenized action link that carries a validated same-origin continuation.
pub(crate) fn action_link_with_return_to(
    path: &str,
    token: &str,
    return_to: Option<&str>,
) -> String {
    format!(
        "{}{}?{}",
        frontend_url(),
        path,
        action_link_query(token, return_to)
    )
}

fn action_link_query(token: &str, return_to: Option<&str>) -> String {
    let mut query = url::form_urlencoded::Serializer::new(String::new());
    query.append_pair("token", token);
    if let Some(return_to) = safe_return_to_path(return_to) {
        query.append_pair("returnTo", &return_to);
    }
    query.finish()
}

fn safe_return_to_path(value: Option<&str>) -> Option<String> {
    const MAX_RETURN_TO_LENGTH: usize = 2_048;

    let path = value?.trim();
    if !path.starts_with('/') || path.starts_with("//") || path.len() > MAX_RETURN_TO_LENGTH {
        return None;
    }

    let base = url::Url::parse("https://cedros.invalid/").ok()?;
    let destination = base.join(path).ok()?;
    if destination.origin() != base.origin() {
        return None;
    }
    Some(destination[url::Position::BeforePath..].to_string())
}

/// Build a JSON response with the standard content-type header.
pub fn json(status: u16, body: &str) -> RouteResponse {
    RouteResponse {
        status,
        headers: vec![("content-type".to_string(), "application/json".to_string())],
        body: body.to_string(),
    }
}

/// Unified handler error → client-safe response (internal detail is logged only).
#[derive(Debug)]
pub enum RouteError {
    Auth(AuthError),
    Seam(SeamError),
    Status(u16, &'static str),
    RetryAfter(u16, &'static str, u64),
}

impl From<AuthError> for RouteError {
    fn from(e: AuthError) -> Self {
        RouteError::Auth(e)
    }
}
impl From<SeamError> for RouteError {
    fn from(e: SeamError) -> Self {
        RouteError::Seam(e)
    }
}

pub fn error_response(err: RouteError) -> RouteResponse {
    match err {
        // Validation messages are safe to return (no credential/existence leak).
        RouteError::Auth(AuthError::Validation(errors)) => {
            let body =
                serde_json::json!({ "error": "validation_failed", "details": errors }).to_string();
            json(422, &body)
        }
        // Generic — never reveal whether the email exists or the password was close.
        RouteError::Auth(AuthError::Unauthorized(_)) => {
            json(401, r#"{"error":"invalid_credentials"}"#)
        }
        RouteError::Auth(crypto) => {
            log::op_error("route", "handle", crypto.code());
            json(500, r#"{"error":"internal_error"}"#)
        }
        RouteError::Seam(e) => {
            log::op_error("route", "handle", e.code());
            seam_error_response(&e)
        }
        RouteError::Status(status, code) => json(status, &format!(r#"{{"error":"{code}"}}"#)),
        RouteError::RetryAfter(status, code, retry_after) => RouteResponse {
            status,
            headers: vec![
                ("content-type".into(), "application/json".into()),
                ("Retry-After".into(), retry_after.to_string()),
            ],
            body: format!(r#"{{"error":"{code}","retryAfterSeconds":{retry_after}}}"#),
        },
    }
}

fn seam_error_response(error: &SeamError) -> RouteResponse {
    if let SeamError::SignupLimitReached { resets_at } = error {
        json(
            429,
            &serde_json::json!({
                "error": "signup_limit_reached",
                "message": "Registration is temporarily closed",
                "resetsAt": resets_at,
                "details": { "resetsAt": resets_at },
            })
            .to_string(),
        )
    } else if error.is_db_conflict() {
        json(409, r#"{"error":"resource_conflict"}"#)
    } else {
        json(502, &format!(r#"{{"error":"{}"}}"#, error.code()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::exports::cedros::extension::routes::RouteRequest;

    fn request(method: &str, path: &str) -> RouteRequest {
        RouteRequest {
            route_id: String::new(),
            method: method.to_string(),
            path: path.to_string(),
            headers: vec![],
            query: vec![],
            body: String::new(),
            // Empty envelope → fails closed (unauthenticated) without host seams.
            context_json: String::new(),
        }
    }

    fn request_ctx(method: &str, path: &str, context_json: &str) -> RouteRequest {
        RouteRequest {
            context_json: context_json.to_string(),
            ..request(method, path)
        }
    }

    #[test]
    fn host_database_conflicts_are_redacted_and_mapped_to_409() {
        let response = seam_error_response(&SeamError::DbConflict {
            category: crate::host::DbConflictCategory::Precondition,
            operation: "verification.consume".into(),
        });
        assert_eq!(response.status, 409);
        assert_eq!(response.body, r#"{"error":"resource_conflict"}"#);
        assert!(!response.body.contains("verification.consume"));
    }

    #[test]
    fn signup_limit_rejection_is_mapped_to_429_with_reset_time() {
        let response = seam_error_response(&SeamError::SignupLimitReached {
            resets_at: "2026-10-01T00:00:00.000Z".into(),
        });
        assert_eq!(response.status, 429);
        let body: serde_json::Value = serde_json::from_str(&response.body).unwrap();
        assert_eq!(body["error"], "signup_limit_reached");
        assert_eq!(body["message"], "Registration is temporarily closed");
        assert_eq!(body["resetsAt"], "2026-10-01T00:00:00.000Z");
        assert_eq!(body["details"]["resetsAt"], "2026-10-01T00:00:00.000Z");
    }

    #[test]
    fn retry_after_errors_include_header_and_json_seconds() {
        let response = error_response(RouteError::RetryAfter(429, "too_many_attempts", 17));
        assert_eq!(response.status, 429);
        assert!(response
            .headers
            .iter()
            .any(|(name, value)| name.eq_ignore_ascii_case("retry-after") && value == "17"));
        assert_eq!(
            serde_json::from_str::<serde_json::Value>(&response.body).unwrap(),
            serde_json::json!({"error":"too_many_attempts","retryAfterSeconds":17})
        );
    }

    #[test]
    fn relative_path_strips_the_host_mount_prefix() {
        assert_eq!(
            relative_path("/extensions/cedros-login/admin/settings"),
            "/admin/settings"
        );
        for path in [
            "/extensions/cedros-login/public-auth/solana/challenge",
            "/public-auth/solana/challenge",
        ] {
            assert_eq!(relative_path(path), "/solana/challenge");
        }
        assert_eq!(relative_path("/extensions/cedros-login/login"), "/login");
        assert_eq!(relative_path("/extensions/cedros-login"), "/");
        // Already-relative paths (direct handler unit tests) pass through.
        assert_eq!(relative_path("/admin/settings"), "/admin/settings");
        // A different extension's namespace is never routed here, but a partial
        // prefix match must not be mangled into a bogus relative path.
        assert_eq!(
            relative_path("/extensions/cedros-login-other/x"),
            "/extensions/cedros-login-other/x"
        );
    }

    #[test]
    fn frontend_url_prefers_admin_settings_catalog_key() {
        assert_eq!(SERVER_FRONTEND_URL_KEY, "server_frontend_url");
        assert_eq!(LEGACY_FRONTEND_URL_KEY, "frontend_url");
    }

    #[test]
    fn verification_action_link_preserves_safe_return_path() {
        let query = action_link_query(
            "secret-token",
            Some("/extensions/cedros-portal/meet-your-assistant?step=claim#ready"),
        );
        assert_eq!(
            query,
            "token=secret-token&returnTo=%2Fextensions%2Fcedros-portal%2Fmeet-your-assistant%3Fstep%3Dclaim%23ready"
        );
    }

    #[test]
    fn verification_action_link_rejects_external_return_paths() {
        for return_to in [
            "https://evil.example/steal",
            "//evil.example/steal",
            "/\\evil.example/steal",
            "relative/path",
        ] {
            let query = action_link_query("secret-token", Some(return_to));
            assert_eq!(query, "token=secret-token");
        }

        let oversized = format!("/{}", "x".repeat(2_048));
        assert_eq!(
            action_link_query("secret-token", Some(&oversized)),
            "token=secret-token"
        );
    }

    #[test]
    fn dispatch_reaches_handler_on_full_host_path() {
        // Regression: the host delivers the full mounted path. This previously
        // fell through to the catch-all 404; it must now reach get_settings,
        // which fails closed at 401 for an unauthenticated context (proving the
        // route is dispatched, not 404'd).
        let resp = handle(request("GET", "/extensions/cedros-login/admin/settings"));
        assert_eq!(resp.status, 401);
    }

    #[test]
    fn unknown_path_still_404s() {
        let resp = handle(request("GET", "/extensions/cedros-login/does-not-exist"));
        assert_eq!(resp.status, 404);
    }

    #[test]
    fn require_system_admin_allows_system_admin_actor() {
        let req = request_ctx(
            "GET",
            "/admin/settings",
            r#"{"actorId":"adm_1","authenticated":true,"systemAdmin":true}"#,
        );
        assert!(require_system_admin(&req).is_ok());
    }

    #[test]
    fn require_system_admin_forbids_authenticated_non_admin() {
        let req = request_ctx(
            "GET",
            "/admin/settings",
            r#"{"actorId":"u_1","authenticated":true}"#,
        );
        assert!(matches!(
            require_system_admin(&req),
            Err(RouteError::Status(403, "admin_required"))
        ));
    }

    #[test]
    fn require_system_admin_forbids_admin_claim_without_actor() {
        let req = request_ctx(
            "GET",
            "/admin/settings",
            r#"{"authenticated":true,"systemAdmin":true}"#,
        );
        assert!(matches!(
            require_system_admin(&req),
            Err(RouteError::Status(403, "admin_required"))
        ));
    }

    #[test]
    fn require_system_admin_rejects_unauthenticated() {
        let req = request_ctx("GET", "/admin/settings", "");
        assert!(matches!(
            require_system_admin(&req),
            Err(RouteError::Status(401, "unauthenticated"))
        ));
    }

    #[test]
    fn require_system_admin_write_needs_admin_and_csrf() {
        // authenticated non-admin (even with csrf) -> 403 admin_required
        let non_admin = request_ctx(
            "POST",
            "/admin/x",
            r#"{"actorId":"u_1","authenticated":true,"csrfVerified":true}"#,
        );
        assert!(matches!(
            require_system_admin_write(&non_admin),
            Err(RouteError::Status(403, "admin_required"))
        ));
        // admin without csrf -> 403 csrf_required
        let no_csrf = request_ctx(
            "POST",
            "/admin/x",
            r#"{"actorId":"adm_1","authenticated":true,"systemAdmin":true}"#,
        );
        assert!(matches!(
            require_system_admin_write(&no_csrf),
            Err(RouteError::Status(403, "csrf_required"))
        ));
        // admin + csrf -> ok
        let ok = request_ctx(
            "POST",
            "/admin/x",
            r#"{"actorId":"adm_1","authenticated":true,"systemAdmin":true,"csrfVerified":true}"#,
        );
        assert!(require_system_admin_write(&ok).is_ok());
    }

    #[test]
    fn admin_management_routes_forbid_authenticated_non_admin() {
        // Privilege-escalation regression: admin-management routes must fail closed
        // at the gate (403) for an authenticated NON-system-admin — never reach the
        // handler. (These previously gated on `authenticated` only.)
        let ctx = r#"{"actorId":"u_1","authenticated":true,"csrfVerified":true}"#;
        let cases = [
            ("GET", "/extensions/cedros-login/admin/users"),
            (
                "POST",
                "/extensions/cedros-login/admin/users/u_2/system-admin",
            ),
            ("GET", "/extensions/cedros-login/admin/sso-providers"),
            ("GET", "/extensions/cedros-login/admin/audit"),
            ("GET", "/extensions/cedros-login/admin/oauth"),
            ("PUT", "/extensions/cedros-login/admin/oauth"),
            (
                "GET",
                "/extensions/cedros-login/users/by-wallet/So11111111111111111111111111111111111111111",
            ),
        ];
        for (method, path) in cases {
            let resp = handle(request_ctx(method, path, ctx));
            assert_eq!(resp.status, 403, "{method} {path} must 403 for non-admin");
        }
    }

    #[test]
    fn admin_oauth_write_requires_verified_csrf_for_system_admin() {
        let ctx = r#"{"actorId":"adm_1","authenticated":true,"systemAdmin":true}"#;
        let response = handle(request_ctx(
            "PUT",
            "/extensions/cedros-login/admin/oauth",
            ctx,
        ));
        assert_eq!(response.status, 403);
        assert!(response.body.contains("csrf_required"));
    }
}
