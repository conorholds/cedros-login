//! The host route-context envelope (see 13a "host context envelope").
//!
//! Populated by cedros-data per request and passed as `context-json`. It
//! describes the cedros-data ADMIN session and host installation. Admin session
//! fields gate admin-management routes. Public IdP routes run in their own auth
//! domain; they may read non-authoritative site/installation context for trusted
//! host handoffs, but never use this envelope to authorize the Login user.
//! The internal consent-authority route additionally requires a host-only claim;
//! even there, current Login records remain the user and membership authority.
use serde::Deserialize;

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct RouteContext {
    pub actor_id: Option<String>,
    /// Exact host-verified claims from the published extension-context envelope.
    /// Never parsed from raw request headers or request bodies.
    pub permission_claims: Vec<String>,
    pub org_id: Option<String>,
    pub auth_scheme: Option<String>,
    /// Exact route authorization delegated by the host MCP executor.
    pub capability_claims: Vec<String>,
    pub actor_email: Option<String>,
    pub authenticated: bool,
    /// True only when the host has authorized the actor as a system administrator
    /// for admin-management routes. Missing or malformed claims fail closed so
    /// authentication is never mistaken for authorization.
    #[serde(alias = "isSystemAdmin", alias = "is_system_admin")]
    pub system_admin: bool,
    /// True only for CSRF-immune bearer (Authorization-header) auth. Fail closed
    /// on state-changing admin routes when false.
    pub csrf_verified: bool,
    pub request_id: Option<String>,
    /// Authoritative, proxy-sanitized end-user IP supplied by the host.
    pub client_ip: Option<String>,
    pub site_id: Option<String>,
    pub installation_id: Option<String>,
    pub environment: Option<String>,
}

impl RouteContext {
    /// Parse the host envelope. Fails closed (unauthenticated, unverified) on
    /// missing or malformed JSON rather than erroring the request.
    pub fn parse(context_json: &str) -> Self {
        serde_json::from_str(context_json).unwrap_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::RouteContext;

    #[test]
    fn malformed_context_fails_closed() {
        let ctx = RouteContext::parse("not json");
        assert!(!ctx.authenticated);
        assert!(!ctx.system_admin);
        assert!(!ctx.csrf_verified);
    }

    #[test]
    fn parses_admin_session_fields() {
        let ctx = RouteContext::parse(
            r#"{"actorId":"adm_1","actorEmail":"owner@example.test","authenticated":true,"systemAdmin":true,"csrfVerified":true,"clientIp":"203.0.113.7","siteId":"s1","installationId":"i1","environment":"staging"}"#,
        );
        assert!(ctx.authenticated);
        assert!(ctx.system_admin);
        assert!(ctx.csrf_verified);
        assert_eq!(ctx.actor_id.as_deref(), Some("adm_1"));
        assert_eq!(ctx.actor_email.as_deref(), Some("owner@example.test"));
        assert_eq!(ctx.client_ip.as_deref(), Some("203.0.113.7"));
        assert_eq!(ctx.installation_id.as_deref(), Some("i1"));
        assert_eq!(ctx.environment.as_deref(), Some("staging"));
    }

    #[test]
    fn parses_legacy_system_admin_aliases() {
        assert!(RouteContext::parse(r#"{"isSystemAdmin":true}"#).system_admin);
        assert!(RouteContext::parse(r#"{"is_system_admin":true}"#).system_admin);
    }

    #[test]
    fn system_admin_defaults_closed_when_absent() {
        let ctx = RouteContext::parse(r#"{"actorId":"u_1","authenticated":true}"#);
        assert!(ctx.authenticated);
        assert!(!ctx.system_admin);
    }
}
