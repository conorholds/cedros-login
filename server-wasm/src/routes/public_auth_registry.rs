//! Public-auth route aliases bound under `/extensions/cedros-login/public-auth`.
//!
//! Cedros Data's public site proxy only forwards public login runtime requests
//! through this allowlisted prefix. The main route dispatcher strips the prefix
//! and reuses the existing auth handlers.

use crate::exports::cedros::extension::routes::RouteSpec;

#[derive(Clone, Copy)]
struct PublicAuthRoute {
    id: &'static str,
    method: &'static str,
    path: &'static str,
}

const PUBLIC_AUTH_PREFIX: &str = "/public-auth";

const PUBLIC_AUTH_ROUTES: &[PublicAuthRoute] = &[
    route("cedros-login:public-auth-features", "GET", "/features"),
    route("cedros-login:public-auth-register", "POST", "/register"),
    route(
        "cedros-login:public-auth-invite-codes-redeem",
        "POST",
        "/invite-codes/redeem",
    ),
    route("cedros-login:public-auth-login", "POST", "/login"),
    route("cedros-login:public-auth-login-mfa", "POST", "/login/mfa"),
    route("cedros-login:public-auth-logout", "POST", "/logout"),
    route("cedros-login:public-auth-refresh", "POST", "/refresh"),
    route("cedros-login:public-auth-current-user", "GET", "/user"),
    route("cedros-login:public-auth-google-login", "POST", "/google"),
    route("cedros-login:public-auth-apple-login", "POST", "/apple"),
    route(
        "cedros-login:public-auth-apple-nonce",
        "POST",
        "/apple/nonce",
    ),
    route(
        "cedros-login:public-auth-solana-challenge",
        "POST",
        "/solana/challenge",
    ),
    route("cedros-login:public-auth-solana-login", "POST", "/solana"),
    route(
        "cedros-login:public-auth-webauthn-auth-options",
        "POST",
        "/webauthn/auth/options",
    ),
    route(
        "cedros-login:public-auth-webauthn-auth-verify",
        "POST",
        "/webauthn/auth/verify",
    ),
    route(
        "cedros-login:public-auth-webauthn-signup-options",
        "POST",
        "/webauthn/signup/options",
    ),
    route(
        "cedros-login:public-auth-webauthn-signup-verify",
        "POST",
        "/webauthn/signup/verify",
    ),
    route(
        "cedros-login:public-auth-instant-link-send",
        "POST",
        "/instant-link",
    ),
    route(
        "cedros-login:public-auth-instant-link-verify",
        "POST",
        "/instant-link/verify",
    ),
    route(
        "cedros-login:public-auth-forgot-password",
        "POST",
        "/forgot-password",
    ),
    route(
        "cedros-login:public-auth-reset-password",
        "POST",
        "/reset-password",
    ),
    route(
        "cedros-login:public-auth-send-verification",
        "POST",
        "/send-verification",
    ),
    route(
        "cedros-login:public-auth-verify-email",
        "POST",
        "/verify-email",
    ),
    // Account-management aliases for the public account workspace page. Every
    // handler behind these requires an authenticated session and fails closed;
    // the aliases only make the routes reachable through the host's public
    // proxy, which forwards solely this prefix.
    route("cedros-login:public-auth-update-profile", "PATCH", "/me"),
    route("cedros-login:public-auth-change-email", "POST", "/me/email"),
    route(
        "cedros-login:public-auth-account-emails-list",
        "GET",
        "/account/emails",
    ),
    route(
        "cedros-login:public-auth-account-emails-add",
        "POST",
        "/account/emails",
    ),
    route(
        "cedros-login:public-auth-account-emails-verify",
        "POST",
        "/account/emails/verify",
    ),
    route(
        "cedros-login:public-auth-account-emails-resend",
        "POST",
        "/account/emails/{email_id}/resend",
    ),
    route(
        "cedros-login:public-auth-account-emails-delete",
        "DELETE",
        "/account/emails/{email_id}",
    ),
    route(
        "cedros-login:public-auth-account-emails-primary",
        "POST",
        "/account/emails/{email_id}/primary",
    ),
    route(
        "cedros-login:public-auth-account-invite-codes-list",
        "GET",
        "/account/invite-codes",
    ),
    route(
        "cedros-login:public-auth-account-invite-discount",
        "GET",
        "/account/invite-discount",
    ),
    route(
        "cedros-login:public-auth-change-password",
        "POST",
        "/change-password",
    ),
    route(
        "cedros-login:public-auth-set-password",
        "POST",
        "/set-password",
    ),
    route(
        "cedros-login:public-auth-credentials-list",
        "GET",
        "/credentials",
    ),
    route(
        "cedros-login:public-auth-credentials-unlink",
        "DELETE",
        "/credentials/{credential_id}",
    ),
    route("cedros-login:public-auth-sessions-list", "GET", "/sessions"),
    route(
        "cedros-login:public-auth-sessions-revoke-all",
        "DELETE",
        "/sessions",
    ),
    route("cedros-login:public-auth-mfa-status", "GET", "/mfa/status"),
    route("cedros-login:public-auth-mfa-setup", "POST", "/mfa/setup"),
    route("cedros-login:public-auth-mfa-enable", "POST", "/mfa/enable"),
    route(
        "cedros-login:public-auth-mfa-disable",
        "POST",
        "/mfa/disable",
    ),
    route(
        "cedros-login:public-auth-mfa-recovery-codes-regenerate",
        "POST",
        "/mfa/recovery-codes/regenerate",
    ),
    route(
        "cedros-login:public-auth-webauthn-register-options",
        "POST",
        "/webauthn/register/options",
    ),
    route(
        "cedros-login:public-auth-webauthn-register-verify",
        "POST",
        "/webauthn/register/verify",
    ),
    route(
        "cedros-login:public-auth-solana-link",
        "POST",
        "/solana/link",
    ),
    route("cedros-login:public-auth-link-oauth", "POST", "/link-oauth"),
    route(
        "cedros-login:public-auth-account-deletion-request",
        "POST",
        "/account-deletion/request",
    ),
    route(
        "cedros-login:public-auth-account-deletion-me",
        "POST",
        "/account-deletion/me",
    ),
];

const fn route(id: &'static str, method: &'static str, path: &'static str) -> PublicAuthRoute {
    PublicAuthRoute { id, method, path }
}

pub fn list() -> Vec<RouteSpec> {
    PUBLIC_AUTH_ROUTES
        .iter()
        .map(|def| RouteSpec {
            route_id: def.id.to_string(),
            method: def.method.to_string(),
            path: format!("{PUBLIC_AUTH_PREFIX}{}", def.path),
        })
        .collect()
}

#[cfg(test)]
pub fn route_ids() -> impl Iterator<Item = &'static str> {
    PUBLIC_AUTH_ROUTES.iter().map(|route| route.id)
}

#[cfg(test)]
mod tests {
    #[test]
    fn list_exposes_solana_challenge_under_public_auth_prefix() {
        let specs = super::list();
        let challenge = specs
            .iter()
            .find(|spec| spec.route_id == "cedros-login:public-auth-solana-challenge")
            .expect("public auth solana challenge alias");
        assert_eq!(challenge.method, "POST");
        assert_eq!(challenge.path, "/public-auth/solana/challenge");
    }

    #[test]
    fn list_exposes_verification_resend_under_public_auth_prefix() {
        let specs = super::list();
        let resend = specs
            .iter()
            .find(|spec| spec.route_id == "cedros-login:public-auth-send-verification")
            .expect("public auth verification resend alias");
        assert_eq!(resend.method, "POST");
        assert_eq!(resend.path, "/public-auth/send-verification");
    }

    #[test]
    fn list_exposes_email_verification_under_public_auth_prefix() {
        let specs = super::list();
        let verification = specs
            .iter()
            .find(|spec| spec.route_id == "cedros-login:public-auth-verify-email")
            .expect("public auth email verification alias");
        assert_eq!(verification.method, "POST");
        assert_eq!(verification.path, "/public-auth/verify-email");
    }
}
