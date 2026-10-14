use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};

type Handler = fn(&RouteRequest) -> RouteResponse;

const HANDLERS: &[(&str, Handler)] = &[
    (
        "cedros-login:system-email-preview",
        super::system_email_preview::preview,
    ),
    ("cedros-login:oauth-metadata", super::oauth::metadata),
    ("cedros-login:oauth-authorize", super::oauth::authorize),
    (
        "cedros-login:oauth-request-info",
        super::oauth::request_info,
    ),
    ("cedros-login:oauth-decide", super::oauth::decide),
    ("cedros-login:oauth-token", super::oauth::token),
    ("cedros-login:oauth-introspect", super::oauth::introspect),
    (
        "cedros-login:oauth-consent-authority",
        super::oauth::authority,
    ),
    ("cedros-login:oauth-revoke", super::oauth::revoke),
    ("cedros-login:oauth-disconnect", super::oauth::disconnect),
    ("cedros-login:admin-oauth-get", super::oauth::config_get),
    ("cedros-login:admin-oauth-put", super::oauth::config_put),
    ("cedros-login:jwks", super::discovery::jwks),
    ("cedros-login:v1-jwks", super::discovery::jwks),
    (
        "cedros-login:admin-jwt-rotate",
        super::discovery::rotate_jwt,
    ),
    ("cedros-login:discovery", super::discovery::auth_config),
    ("cedros-login:ai-discovery", super::discovery::ai_discovery),
    ("cedros-login:register", super::auth::register),
    ("cedros-login:login", super::auth::login),
    ("cedros-login:logout", super::session::logout),
    ("cedros-login:refresh", super::session::refresh),
    ("cedros-login:google-login", super::social::google),
    ("cedros-login:apple-login", super::social::apple),
    ("cedros-login:apple-nonce", super::social::apple_nonce),
    ("cedros-login:link-oauth", super::social::link),
    ("cedros-login:solana-challenge", super::solana::challenge),
    ("cedros-login:solana-login", super::solana::authenticate),
    ("cedros-login:solana-link", super::solana::link),
    ("cedros-login:mfa-setup", super::mfa::setup),
    ("cedros-login:mfa-enable", super::mfa::enable),
    ("cedros-login:mfa-disable", super::mfa::disable),
    ("cedros-login:mfa-status", super::mfa::status),
    ("cedros-login:login-mfa", super::mfa_login::complete),
    ("cedros-login:mfa-recovery", super::mfa_login::use_recovery),
    (
        "cedros-login:mfa-recovery-codes-regenerate",
        super::mfa::regenerate_recovery,
    ),
    (
        "cedros-login:webauthn-register-options",
        super::webauthn::register_options,
    ),
    (
        "cedros-login:webauthn-register-verify",
        super::webauthn::register_verify,
    ),
    (
        "cedros-login:webauthn-auth-options",
        super::webauthn::auth_options,
    ),
    (
        "cedros-login:webauthn-auth-verify",
        super::webauthn::auth_verify,
    ),
    (
        "cedros-login:webauthn-signup-options",
        super::webauthn::signup_options,
    ),
    (
        "cedros-login:webauthn-signup-verify",
        super::webauthn::signup_verify,
    ),
    ("cedros-login:sso-start", super::sso::start),
    ("cedros-login:sso-callback", super::sso::callback),
    (
        "cedros-login:send-verification",
        super::account::send_verification,
    ),
    ("cedros-login:verify-email", super::account::verify_email),
    ("cedros-login:instant-link-send", super::instant_link::send),
    (
        "cedros-login:instant-link-verify",
        super::instant_link::verify,
    ),
    (
        "cedros-login:forgot-password",
        super::account::forgot_password,
    ),
    (
        "cedros-login:reset-password",
        super::account::reset_password,
    ),
    (
        "cedros-login:change-password",
        super::account::change_password,
    ),
    ("cedros-login:set-password", super::account::set_password),
    (
        "cedros-login:username-available",
        super::profile::check_username,
    ),
    ("cedros-login:logout-all", super::account::logout_all),
    ("cedros-login:list-sessions", super::account::list_sessions),
    (
        "cedros-login:revoke-session",
        super::account::revoke_session,
    ),
    (
        "cedros-login:revoke-all-sessions",
        super::account::revoke_all_sessions,
    ),
    ("cedros-login:get-current-user", super::profile::get_user),
    (
        "cedros-login:identity-profile-current",
        super::identity_profile::current,
    ),
    (
        "cedros-login:update-profile",
        super::profile::update_profile,
    ),
    ("cedros-login:change-email", super::account::change_email),
    (
        "cedros-login:account-emails-list",
        super::account_emails::list,
    ),
    (
        "cedros-login:account-emails-add",
        super::account_emails::add,
    ),
    (
        "cedros-login:account-emails-verify",
        super::account_emails::verify,
    ),
    (
        "cedros-login:account-emails-resend",
        super::account_emails::resend,
    ),
    (
        "cedros-login:account-emails-delete",
        super::account_emails::delete,
    ),
    (
        "cedros-login:account-emails-primary",
        super::account_emails::set_primary,
    ),
    (
        "cedros-login:welcome-completed",
        super::profile::welcome_completed,
    ),
    (
        "cedros-login:request-account-deletion",
        super::account::request_deletion,
    ),
    (
        "cedros-login:confirm-account-deletion",
        super::account::confirm_deletion,
    ),
    (
        "cedros-login:delete-account",
        super::account::delete_account,
    ),
    ("cedros-login:avatar-upload", super::avatar::upload),
    ("cedros-login:avatar-get", super::avatar::get),
    ("cedros-login:avatar-delete", super::avatar::delete),
    ("cedros-login:orgs-create", super::orgs::create),
    ("cedros-login:orgs-list", super::orgs::list),
    ("cedros-login:orgs-get", super::orgs::get),
    ("cedros-login:orgs-update", super::orgs::update),
    ("cedros-login:orgs-delete", super::orgs::delete),
    ("cedros-login:orgs-switch", super::orgs::switch),
    ("cedros-login:members-list", super::members::list),
    ("cedros-login:members-update", super::members::update_role),
    ("cedros-login:members-remove", super::members::remove),
    ("cedros-login:invites-create", super::invites::create),
    ("cedros-login:invites-list", super::invites::list),
    ("cedros-login:invites-cancel", super::invites::cancel),
    ("cedros-login:invites-resend", super::invites::resend),
    ("cedros-login:custom-roles-list", super::custom_roles::list),
    (
        "cedros-login:custom-roles-create",
        super::custom_roles::create,
    ),
    ("cedros-login:custom-roles-get", super::custom_roles::get),
    (
        "cedros-login:custom-roles-update",
        super::custom_roles::update,
    ),
    (
        "cedros-login:custom-roles-delete",
        super::custom_roles::delete,
    ),
    ("cedros-login:invites-accept", super::invites::accept),
    ("cedros-login:setup-status", super::setup::status),
    ("cedros-login:setup-admin", super::setup::create_first_admin),
    (
        "cedros-login:setup-admin-import",
        super::setup::import_first_admin,
    ),
    ("cedros-login:api-keys-create", super::api_keys::create),
    (
        "cedros-login:portal-agent-keys-create",
        super::portal_agent_keys::create,
    ),
    (
        "cedros-login:portal-agent-keys-list",
        super::portal_agent_keys::list,
    ),
    (
        "cedros-login:portal-agent-keys-revoke",
        super::portal_agent_keys::revoke,
    ),
    (
        "cedros-login:portal-agent-keys-identity",
        super::portal_agent_keys::identity,
    ),
    ("cedros-login:api-keys-list", super::api_keys::list),
    ("cedros-login:api-keys-revoke", super::api_keys::revoke),
    ("cedros-login:api-keys-validate", super::api_keys::validate),
    ("cedros-login:authorize", super::authorize::authorize),
    ("cedros-login:permissions", super::authorize::permissions),
    ("cedros-login:policies-list", super::policies::list),
    ("cedros-login:policies-create", super::policies::create),
    ("cedros-login:policies-get", super::policies::get),
    ("cedros-login:policies-update", super::policies::update),
    ("cedros-login:policies-delete", super::policies::delete),
    (
        "cedros-login:admin-settings-get",
        super::admin::get_settings,
    ),
    (
        "cedros-login:admin-settings-update",
        super::admin::update_settings,
    ),
    (
        "cedros-login:admin-email-test",
        super::admin_email::send_test,
    ),
    (
        "cedros-login:admin-invite-codes-list",
        super::invite_codes::list_admin,
    ),
    (
        "cedros-login:admin-invite-codes-create",
        super::invite_codes::create_admin,
    ),
    (
        "cedros-login:admin-invite-codes-update",
        super::invite_codes::update_admin,
    ),
    (
        "cedros-login:admin-invite-codes-delete",
        super::invite_codes::delete_admin,
    ),
    ("cedros-login:admin-audit-list", super::admin_audit::list),
    (
        "cedros-login:admin-users-list",
        super::admin_users::list_users,
    ),
    ("cedros-login:admin-users-get", super::admin_users::get_user),
    (
        "cedros-login:admin-users-update",
        super::admin_users::update_user,
    ),
    (
        "cedros-login:admin-users-set-system-admin",
        super::admin_users::set_system_admin,
    ),
    (
        "cedros-login:admin-users-delete",
        super::admin_users::delete_user,
    ),
    (
        "cedros-login:admin-sso-providers-list",
        super::admin_sso::list,
    ),
    (
        "cedros-login:admin-sso-providers-create",
        super::admin_sso::create,
    ),
    (
        "cedros-login:admin-sso-providers-get",
        super::admin_sso::get,
    ),
    (
        "cedros-login:admin-sso-providers-update",
        super::admin_sso::update,
    ),
    (
        "cedros-login:admin-sso-providers-delete",
        super::admin_sso::delete,
    ),
    (
        "cedros-login:admin-relying-parties-list",
        super::admin_relying_parties::list,
    ),
    (
        "cedros-login:admin-data-membership-relationship",
        super::admin_relying_parties::data_membership_relationship,
    ),
    (
        "cedros-login:admin-relying-parties-configure",
        super::admin_relying_parties::configure,
    ),
    (
        "cedros-login:admin-relying-parties-verify",
        super::admin_relying_parties::verify,
    ),
    (
        "cedros-login:relying-party-session-introspect",
        super::relying_party::introspect_session,
    ),
    (
        "cedros-login:relying-party-user-get",
        super::relying_party::get_user,
    ),
    (
        "cedros-login:relying-party-users-count",
        super::relying_party::count_users,
    ),
    (
        "cedros-login:relying-party-membership-authority-get",
        super::relying_party::get_membership_authority,
    ),
    (
        "cedros-login:identity-profile-admin-get",
        super::relying_party::get_identity_profile,
    ),
    (
        "cedros-login:user-lookup-by-wallet",
        super::user_lookup::by_wallet,
    ),
    ("cedros-login:org-audit-list", super::admin_audit::org_list),
    (
        "cedros-login:custom-roles-set-default",
        super::custom_roles::set_default,
    ),
    ("cedros-login:admin-orgs-list", super::admin_orgs::list),
    ("cedros-login:admin-orgs-get", super::admin_orgs::get),
    (
        "cedros-login:admin-dashboard-permissions-get",
        super::admin_config::dashboard_get,
    ),
    (
        "cedros-login:admin-dashboard-permissions-update",
        super::admin_config::dashboard_put,
    ),
    (
        "cedros-login:admin-disposable-domains-get",
        super::admin_config::disposable_get,
    ),
    (
        "cedros-login:admin-disposable-domains-update",
        super::admin_config::disposable_put,
    ),
    ("cedros-login:admin-users-stats", super::admin_users::stats),
    (
        "cedros-login:admin-users-force-password-reset",
        super::admin_users::force_password_reset,
    ),
    ("cedros-login:features", super::discovery::features),
    ("cedros-login:mfa-verify", super::mfa::verify),
    ("cedros-login:credentials-list", super::credentials::list),
    (
        "cedros-login:credentials-update",
        super::credentials::update,
    ),
    (
        "cedros-login:credentials-unlink",
        super::credentials::unlink,
    ),
];

const PUBLIC_AUTH_ONLY_HANDLERS: &[(&str, &str, Handler)] = &[
    (
        "POST",
        "cedros-login:public-auth-invite-codes-redeem",
        super::invite_codes::redeem,
    ),
    (
        "GET",
        "cedros-login:public-auth-account-invite-codes-list",
        super::invite_codes::list_account,
    ),
    (
        "GET",
        "cedros-login:public-auth-account-invite-discount",
        super::invite_codes::discount_account,
    ),
];

pub(super) fn resolve(method: &str, path: &str, route_id: &str) -> Option<Handler> {
    let canonical_path = super::relative_path(path);
    super::registry::find(method, canonical_path)
        .and_then(|route| handler_for(route.id))
        .or_else(|| {
            path.starts_with(super::PUBLIC_AUTH_PREFIX)
                .then(|| public_auth_handler_for(method, route_id))
                .flatten()
        })
}

fn handler_for(route_id: &str) -> Option<Handler> {
    HANDLERS
        .iter()
        .find_map(|(id, handler)| (*id == route_id).then_some(*handler))
}

fn public_auth_handler_for(method: &str, route_id: &str) -> Option<Handler> {
    PUBLIC_AUTH_ONLY_HANDLERS
        .iter()
        .find_map(|(m, id, handler)| (*m == method && *id == route_id).then_some(*handler))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_registered_route_spec_resolves_to_a_dispatch_handler() {
        let unresolved: Vec<String> = super::super::registry::list()
            .into_iter()
            .filter_map(|spec| {
                let path = concrete_path(&spec.path);
                resolve(&spec.method, &path, &spec.route_id)
                    .is_none()
                    .then(|| format!("{} {} {}", spec.route_id, spec.method, path))
            })
            .collect();

        assert!(
            unresolved.is_empty(),
            "registered route specs without dispatch handlers: {unresolved:?}"
        );
    }

    #[test]
    fn every_canonical_route_id_has_a_handler_mapping() {
        let unresolved: Vec<&str> = super::super::registry::routes()
            .iter()
            .filter_map(|route| handler_for(route.id).is_none().then_some(route.id))
            .collect();

        assert!(
            unresolved.is_empty(),
            "canonical route ids without dispatch handlers: {unresolved:?}"
        );
    }

    #[test]
    fn public_auth_only_aliases_resolve_from_their_registered_route_ids() {
        assert!(resolve(
            "POST",
            "/public-auth/invite-codes/redeem",
            "cedros-login:public-auth-invite-codes-redeem"
        )
        .is_some());
        assert!(resolve(
            "GET",
            "/public-auth/account/invite-codes",
            "cedros-login:public-auth-account-invite-codes-list"
        )
        .is_some());
    }

    fn concrete_path(template: &str) -> String {
        template
            .split('/')
            .map(|segment| {
                if segment.starts_with('{') && segment.ends_with('}') {
                    "dummy-id"
                } else {
                    segment
                }
            })
            .collect::<Vec<_>>()
            .join("/")
    }
}

#[cfg(test)]
#[path = "route_dispatch_tests.rs"]
mod route_dispatch_tests;
