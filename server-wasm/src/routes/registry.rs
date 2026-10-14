//! Route registry exported to Cedros. Each route id maps to one method/path
//! pair, which keeps the manifest inventory aligned with the Wasm route world.

use crate::exports::cedros::extension::routes::RouteSpec;

#[derive(Clone, Copy)]
pub(crate) struct RouteDef {
    pub(crate) id: &'static str,
    pub(crate) method: &'static str,
    pub(crate) path: &'static str,
}

const ROUTES: &[RouteDef] = &[
    route(
        "cedros-login:system-email-preview",
        "POST",
        "/admin/system-email-preview",
    ),
    route(
        "cedros-login:oauth-metadata",
        "GET",
        "/.well-known/oauth-authorization-server",
    ),
    route("cedros-login:oauth-authorize", "GET", "/oauth/authorize"),
    route(
        "cedros-login:oauth-request-info",
        "GET",
        "/oauth/requests/:request_id",
    ),
    route(
        "cedros-login:oauth-decide",
        "POST",
        "/oauth/requests/:request_id",
    ),
    route("cedros-login:oauth-token", "POST", "/oauth/token"),
    route("cedros-login:oauth-introspect", "POST", "/oauth/introspect"),
    route(
        "cedros-login:oauth-consent-authority",
        "POST",
        "/admin/oauth/authority",
    ),
    route("cedros-login:oauth-revoke", "POST", "/oauth/revoke"),
    route(
        "cedros-login:oauth-disconnect",
        "DELETE",
        "/oauth/connections/:connection_id",
    ),
    route("cedros-login:admin-oauth-get", "GET", "/admin/oauth"),
    route("cedros-login:admin-oauth-put", "PUT", "/admin/oauth"),
    route("cedros-login:jwks", "GET", "/.well-known/jwks.json"),
    route("cedros-login:v1-jwks", "GET", "/v1/.well-known/jwks.json"),
    route("cedros-login:admin-jwt-rotate", "POST", "/admin/jwt/rotate"),
    route("cedros-login:discovery", "GET", "/discovery"),
    route(
        "cedros-login:ai-discovery",
        "GET",
        "/.well-known/ai-discovery.json",
    ),
    route("cedros-login:register", "POST", "/register"),
    route("cedros-login:login", "POST", "/login"),
    route("cedros-login:logout", "POST", "/logout"),
    route("cedros-login:refresh", "POST", "/refresh"),
    route("cedros-login:google-login", "POST", "/google"),
    route("cedros-login:apple-login", "POST", "/apple"),
    route("cedros-login:apple-nonce", "POST", "/apple/nonce"),
    route("cedros-login:link-oauth", "POST", "/link-oauth"),
    route("cedros-login:solana-challenge", "POST", "/solana/challenge"),
    route("cedros-login:solana-login", "POST", "/solana"),
    route("cedros-login:solana-link", "POST", "/solana/link"),
    route("cedros-login:mfa-setup", "POST", "/mfa/setup"),
    route("cedros-login:mfa-enable", "POST", "/mfa/enable"),
    route("cedros-login:mfa-disable", "POST", "/mfa/disable"),
    route("cedros-login:mfa-status", "GET", "/mfa/status"),
    route("cedros-login:login-mfa", "POST", "/login/mfa"),
    route("cedros-login:mfa-recovery", "POST", "/mfa/recovery"),
    route(
        "cedros-login:mfa-recovery-codes-regenerate",
        "POST",
        "/mfa/recovery-codes/regenerate",
    ),
    route(
        "cedros-login:webauthn-register-options",
        "POST",
        "/webauthn/register/options",
    ),
    route(
        "cedros-login:webauthn-register-verify",
        "POST",
        "/webauthn/register/verify",
    ),
    route(
        "cedros-login:webauthn-auth-options",
        "POST",
        "/webauthn/auth/options",
    ),
    route(
        "cedros-login:webauthn-auth-verify",
        "POST",
        "/webauthn/auth/verify",
    ),
    route(
        "cedros-login:webauthn-signup-options",
        "POST",
        "/webauthn/signup/options",
    ),
    route(
        "cedros-login:webauthn-signup-verify",
        "POST",
        "/webauthn/signup/verify",
    ),
    route("cedros-login:sso-start", "POST", "/sso/start"),
    route("cedros-login:sso-callback", "GET", "/sso/callback"),
    route(
        "cedros-login:send-verification",
        "POST",
        "/send-verification",
    ),
    route("cedros-login:verify-email", "POST", "/verify-email"),
    route("cedros-login:instant-link-send", "POST", "/instant-link"),
    route(
        "cedros-login:instant-link-verify",
        "POST",
        "/instant-link/verify",
    ),
    route("cedros-login:forgot-password", "POST", "/forgot-password"),
    route("cedros-login:reset-password", "POST", "/reset-password"),
    route("cedros-login:change-password", "POST", "/change-password"),
    route("cedros-login:set-password", "POST", "/set-password"),
    route(
        "cedros-login:username-available",
        "GET",
        "/username/available",
    ),
    route("cedros-login:logout-all", "POST", "/logout-all"),
    route("cedros-login:list-sessions", "GET", "/sessions"),
    route("cedros-login:revoke-session", "POST", "/sessions/revoke"),
    route("cedros-login:revoke-all-sessions", "DELETE", "/sessions"),
    route("cedros-login:get-current-user", "GET", "/user"),
    route(
        "cedros-login:identity-profile-current",
        "GET",
        "/v1/identity/profile",
    ),
    route("cedros-login:update-profile", "PATCH", "/me"),
    route("cedros-login:change-email", "POST", "/me/email"),
    route("cedros-login:account-emails-list", "GET", "/account/emails"),
    route("cedros-login:account-emails-add", "POST", "/account/emails"),
    route(
        "cedros-login:account-emails-verify",
        "POST",
        "/account/emails/verify",
    ),
    route(
        "cedros-login:account-emails-resend",
        "POST",
        "/account/emails/:email_id/resend",
    ),
    route(
        "cedros-login:account-emails-delete",
        "DELETE",
        "/account/emails/:email_id",
    ),
    route(
        "cedros-login:account-emails-primary",
        "POST",
        "/account/emails/:email_id/primary",
    ),
    route(
        "cedros-login:welcome-completed",
        "POST",
        "/welcome-completed",
    ),
    route(
        "cedros-login:request-account-deletion",
        "POST",
        "/account-deletion/request",
    ),
    route(
        "cedros-login:confirm-account-deletion",
        "POST",
        "/account-deletion/confirm",
    ),
    route(
        "cedros-login:delete-account",
        "POST",
        "/account-deletion/me",
    ),
    route("cedros-login:avatar-upload", "POST", "/me/avatar"),
    route("cedros-login:avatar-get", "GET", "/me/avatar"),
    route("cedros-login:avatar-delete", "DELETE", "/me/avatar"),
    route("cedros-login:orgs-create", "POST", "/orgs"),
    route("cedros-login:orgs-list", "GET", "/orgs"),
    route("cedros-login:orgs-get", "GET", "/orgs/:org_id"),
    route("cedros-login:orgs-update", "PATCH", "/orgs/:org_id"),
    route("cedros-login:orgs-delete", "DELETE", "/orgs/:org_id"),
    route("cedros-login:orgs-switch", "POST", "/orgs/:org_id/switch"),
    route("cedros-login:members-list", "GET", "/orgs/:org_id/members"),
    route(
        "cedros-login:members-update",
        "PATCH",
        "/orgs/:org_id/members/:user_id",
    ),
    route(
        "cedros-login:members-remove",
        "DELETE",
        "/orgs/:org_id/members/:user_id",
    ),
    route(
        "cedros-login:invites-create",
        "POST",
        "/orgs/:org_id/invites",
    ),
    route("cedros-login:invites-list", "GET", "/orgs/:org_id/invites"),
    route(
        "cedros-login:invites-cancel",
        "DELETE",
        "/orgs/:org_id/invites/:invite_id",
    ),
    route(
        "cedros-login:invites-resend",
        "POST",
        "/orgs/:org_id/invites/:invite_id/resend",
    ),
    route(
        "cedros-login:custom-roles-list",
        "GET",
        "/orgs/:org_id/roles",
    ),
    route(
        "cedros-login:custom-roles-create",
        "POST",
        "/orgs/:org_id/roles",
    ),
    route(
        "cedros-login:custom-roles-get",
        "GET",
        "/orgs/:org_id/roles/:role_id",
    ),
    route(
        "cedros-login:custom-roles-update",
        "PATCH",
        "/orgs/:org_id/roles/:role_id",
    ),
    route(
        "cedros-login:custom-roles-delete",
        "DELETE",
        "/orgs/:org_id/roles/:role_id",
    ),
    route("cedros-login:invites-accept", "POST", "/invites/accept"),
    route("cedros-login:setup-status", "GET", "/setup/status"),
    route("cedros-login:setup-admin", "POST", "/setup/admin"),
    route(
        "cedros-login:setup-admin-import",
        "POST",
        "/setup/admin/import",
    ),
    route("cedros-login:api-keys-create", "POST", "/api-keys"),
    route(
        "cedros-login:portal-agent-keys-create",
        "POST",
        "/portal-agent-keys",
    ),
    route(
        "cedros-login:portal-agent-keys-list",
        "GET",
        "/portal-agent-keys",
    ),
    route(
        "cedros-login:portal-agent-keys-revoke",
        "POST",
        "/portal-agent-keys/revoke",
    ),
    route(
        "cedros-login:portal-agent-keys-identity",
        "GET",
        "/portal-agent-keys/identity",
    ),
    route("cedros-login:api-keys-list", "GET", "/api-keys"),
    route("cedros-login:api-keys-revoke", "POST", "/api-keys/revoke"),
    route(
        "cedros-login:api-keys-validate",
        "POST",
        "/api-keys/validate",
    ),
    route("cedros-login:authorize", "POST", "/authorize"),
    route("cedros-login:permissions", "POST", "/permissions"),
    route(
        "cedros-login:policies-list",
        "GET",
        "/orgs/:org_id/policies",
    ),
    route(
        "cedros-login:policies-create",
        "POST",
        "/orgs/:org_id/policies",
    ),
    route(
        "cedros-login:policies-get",
        "GET",
        "/orgs/:org_id/policies/:policy_id",
    ),
    route(
        "cedros-login:policies-update",
        "PATCH",
        "/orgs/:org_id/policies/:policy_id",
    ),
    route(
        "cedros-login:policies-delete",
        "DELETE",
        "/orgs/:org_id/policies/:policy_id",
    ),
    route("cedros-login:admin-settings-get", "GET", "/admin/settings"),
    route(
        "cedros-login:admin-settings-update",
        "PATCH",
        "/admin/settings",
    ),
    route("cedros-login:admin-email-test", "POST", "/admin/email/test"),
    route(
        "cedros-login:admin-invite-codes-list",
        "GET",
        "/admin/invite-codes",
    ),
    route(
        "cedros-login:admin-invite-codes-create",
        "POST",
        "/admin/invite-codes",
    ),
    route(
        "cedros-login:admin-invite-codes-update",
        "PATCH",
        "/admin/invite-codes/:id",
    ),
    route(
        "cedros-login:admin-invite-codes-delete",
        "DELETE",
        "/admin/invite-codes/:id",
    ),
    route("cedros-login:admin-audit-list", "GET", "/admin/audit"),
    route("cedros-login:admin-users-list", "GET", "/admin/users"),
    route(
        "cedros-login:admin-users-get",
        "GET",
        "/admin/users/:user_id",
    ),
    route(
        "cedros-login:admin-users-update",
        "PATCH",
        "/admin/users/:user_id",
    ),
    route(
        "cedros-login:admin-users-set-system-admin",
        "POST",
        "/admin/users/:user_id/system-admin",
    ),
    route(
        "cedros-login:admin-users-delete",
        "DELETE",
        "/admin/users/:user_id",
    ),
    route(
        "cedros-login:admin-sso-providers-list",
        "GET",
        "/admin/sso-providers",
    ),
    route(
        "cedros-login:admin-sso-providers-create",
        "POST",
        "/admin/sso-providers",
    ),
    route(
        "cedros-login:admin-sso-providers-get",
        "GET",
        "/admin/sso-providers/:id",
    ),
    route(
        "cedros-login:admin-sso-providers-update",
        "PUT",
        "/admin/sso-providers/:id",
    ),
    route(
        "cedros-login:admin-sso-providers-delete",
        "DELETE",
        "/admin/sso-providers/:id",
    ),
    route(
        "cedros-login:admin-relying-parties-list",
        "GET",
        "/admin/relying-parties",
    ),
    route(
        "cedros-login:admin-data-membership-relationship",
        "POST",
        "/admin/relying-parties/data-membership",
    ),
    route(
        "cedros-login:admin-relying-parties-configure",
        "PUT",
        "/admin/relying-parties/:id",
    ),
    route(
        "cedros-login:admin-relying-parties-verify",
        "POST",
        "/admin/relying-parties/:id/verify",
    ),
    route(
        "cedros-login:relying-party-session-introspect",
        "POST",
        "/v1/session/introspect",
    ),
    route(
        "cedros-login:relying-party-user-get",
        "GET",
        "/v1/users/:user_id",
    ),
    route(
        "cedros-login:relying-party-users-count",
        "GET",
        "/v1/users/count",
    ),
    route(
        "cedros-login:relying-party-membership-authority-get",
        "GET",
        "/v1/organizations/:org_id/members/:user_id",
    ),
    route(
        "cedros-login:identity-profile-admin-get",
        "GET",
        "/v1/identity/users/:user_id/profile",
    ),
    route(
        "cedros-login:user-lookup-by-wallet",
        "GET",
        "/users/by-wallet/:wallet_address",
    ),
    route("cedros-login:org-audit-list", "GET", "/orgs/:org_id/audit"),
    route(
        "cedros-login:custom-roles-set-default",
        "POST",
        "/orgs/:org_id/roles/:role_id/default",
    ),
    route("cedros-login:admin-orgs-list", "GET", "/admin/orgs"),
    route("cedros-login:admin-orgs-get", "GET", "/admin/orgs/:org_id"),
    route(
        "cedros-login:admin-dashboard-permissions-get",
        "GET",
        "/admin/dashboard-permissions",
    ),
    route(
        "cedros-login:admin-dashboard-permissions-update",
        "PUT",
        "/admin/dashboard-permissions",
    ),
    route(
        "cedros-login:admin-disposable-domains-get",
        "GET",
        "/admin/disposable-domains",
    ),
    route(
        "cedros-login:admin-disposable-domains-update",
        "PUT",
        "/admin/disposable-domains",
    ),
    route(
        "cedros-login:admin-users-stats",
        "GET",
        "/admin/users/stats",
    ),
    route(
        "cedros-login:admin-users-force-password-reset",
        "POST",
        "/admin/users/:user_id/force-password-reset",
    ),
    route("cedros-login:features", "GET", "/features"),
    route("cedros-login:mfa-verify", "POST", "/mfa/verify"),
    route("cedros-login:credentials-list", "GET", "/credentials"),
    route(
        "cedros-login:credentials-update",
        "PATCH",
        "/credentials/:credential_id",
    ),
    route(
        "cedros-login:credentials-unlink",
        "DELETE",
        "/credentials/:credential_id",
    ),
];

const fn route(id: &'static str, method: &'static str, path: &'static str) -> RouteDef {
    RouteDef { id, method, path }
}

pub fn list() -> Vec<RouteSpec> {
    let mut specs: Vec<RouteSpec> = ROUTES
        .iter()
        .map(|def| RouteSpec {
            route_id: def.id.to_string(),
            method: def.method.to_string(),
            path: to_wit_template(def.path),
        })
        .collect();
    specs.extend(super::public_auth_registry::list());
    specs
}

#[cfg(test)]
pub(crate) fn routes() -> &'static [RouteDef] {
    ROUTES
}

/// Resolve a concrete request path against the registered route templates.
///
/// Matching is exact by segment count, treats `:param` and `{param}` as
/// non-empty single-segment wildcards, and prefers the template with the most
/// literal segments so static routes win over earlier parameterized entries.
pub(crate) fn find(method: &str, path: &str) -> Option<&'static RouteDef> {
    let mut best: Option<(&RouteDef, usize)> = None;

    for route in ROUTES.iter().filter(|route| route.method == method) {
        let Some(score) = template_match_score(route.path, path) else {
            continue;
        };
        match best {
            Some((_, best_score)) if best_score >= score => {}
            _ => best = Some((route, score)),
        }
    }

    best.map(|(route, _)| route)
}

/// Convert an internal `:param` path to the host's `{param}` template syntax.
/// The cedros:extension router (13a) treats a `{name}` segment as a wildcard
/// matching one non-empty path segment; a `:name` segment is matched literally
/// and would never bind, so every parameterized route must emit braces. The
/// guest's own dispatch works on the concrete request path, so this only
/// affects the templates the host binds from `list-routes`.
fn to_wit_template(path: &str) -> String {
    if !path.contains("/:") {
        return path.to_string();
    }
    path.split('/')
        .map(|segment| match segment.strip_prefix(':') {
            Some(name) => format!("{{{name}}}"),
            None => segment.to_string(),
        })
        .collect::<Vec<_>>()
        .join("/")
}

fn template_match_score(template: &str, path: &str) -> Option<usize> {
    let template_segments = path_segments(template);
    let path_segments = path_segments(path);
    if template_segments.len() != path_segments.len() {
        return None;
    }

    let mut literal_segments = 0;
    for (template_segment, path_segment) in template_segments.iter().zip(path_segments.iter()) {
        if is_param_segment(template_segment) {
            if path_segment.is_empty() {
                return None;
            }
        } else if template_segment == path_segment {
            literal_segments += 1;
        } else {
            return None;
        }
    }

    Some(literal_segments)
}

fn path_segments(path: &str) -> Vec<&str> {
    path.trim_start_matches('/').split('/').collect()
}

fn is_param_segment(segment: &str) -> bool {
    segment.starts_with(':') || (segment.starts_with('{') && segment.ends_with('}'))
}

#[cfg(test)]
#[path = "registry_tests.rs"]
mod tests;
