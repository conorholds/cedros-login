//! HTTP request handlers

mod account_deletion;
mod account_emails;
pub mod admin;
pub mod ai_discovery;
mod api_keys;
mod apple;
mod auth;
mod authorize;
mod credentials;
mod custom_roles;
mod discovery;
mod email_verification;
mod features;
mod google;
mod health;
mod instant_link;
mod invite_codes;
pub mod invites;
mod link_oauth;
pub mod members;
mod metrics;
mod mfa;
mod mfa_disable;
mod mfa_recovery_codes;
pub mod orgs;
mod password_change;
mod password_reset;
mod policies;
mod sessions;
mod set_password;
pub mod setup;
mod solana;
mod sso;
pub mod upload;
mod user_lookup;
mod username;
mod webauthn;
mod webauthn_signup;

pub use account_deletion::{
    account_deletion_page, confirm_account_deletion, delete_current_account,
    request_account_deletion,
};
pub use account_emails::{
    add_account_email, delete_account_email, list_account_emails, resend_account_email,
    set_primary_account_email, verify_account_email,
};
pub use admin::{
    autosave_settings, create_sso_provider, delete_sso_provider, delete_user, force_password_reset,
    get_dashboard_permissions, get_disposable_domains, get_org as get_admin_org,
    get_org_audit_logs, get_sso_provider, get_system_audit_logs, get_user as get_admin_user,
    get_user_stats, list_orgs as list_admin_orgs, list_settings, list_sso_providers, list_users,
    set_system_admin, update_dashboard_permissions, update_disposable_domains, update_settings,
    update_sso_provider, update_user,
};
pub use ai_discovery::{
    agent_json, agent_md, ai_discovery_index, ai_plugin_json, ai_txt, heartbeat_json, heartbeat_md,
    llms_admin_txt, llms_full_txt, llms_txt, mcp_discovery, skill_admin_md, skill_auth_md,
    skill_extension_md, skill_json, skill_md, skill_mfa_md, skill_orgs_md, skill_profile_md,
    skills_bundle_zip,
};
pub use api_keys::{create_api_key, delete_api_key, list_api_keys, validate_api_key};
pub use apple::{apple_auth, apple_nonce};
pub use auth::{
    complete_mfa_login, get_user, login, logout, logout_all, refresh, register, update_profile,
    welcome_completed,
};
pub use authorize::{authorize, get_permissions};
pub use credentials::{list_credentials, unlink_credential, update_credential};
pub use custom_roles::{
    create_custom_role, delete_custom_role, get_custom_role, list_custom_roles, set_default_role,
    update_custom_role,
};
pub use discovery::{auth_config, jwks, openapi_spec};
pub use email_verification::{send_verification, verify_email};
pub use features::auth_features;
pub use google::google_auth;
pub use health::{health_check, readiness_check};
pub(crate) use health::{health_check_with_delivery, readiness_check_with_delivery};
pub use instant_link::{send_instant_link, verify_instant_link};
pub use invite_codes::{
    create_admin_invite_code, delete_admin_invite_code, get_account_invite_discount,
    list_account_invite_codes, list_admin_invite_codes, redeem_invite_code,
    update_admin_invite_code,
};
pub use invites::{accept_invite, cancel_invite, create_invite, list_invites, resend_invite};
pub use link_oauth::link_oauth;
pub use members::{list_members, remove_member, update_member_role};
pub use metrics::prometheus_metrics;
pub use mfa::{enable_mfa, mfa_status, setup_mfa, use_recovery_code, verify_mfa};
pub use mfa_disable::disable_mfa;
pub use mfa_recovery_codes::regenerate_recovery_codes;
pub use orgs::{create_org, delete_org, get_org, list_orgs, switch_org, update_org};
pub use password_change::change_password;
pub use password_reset::{forgot_password, reset_password};
pub use policies::{create_policy, delete_policy, get_policy, list_policies, update_policy};
pub use sessions::{list_sessions, revoke_all_sessions};
pub use set_password::set_password;
pub use setup::{create_first_admin, import_first_admin, setup_status};
pub use solana::{solana_auth, solana_challenge, solana_link};
pub use sso::{sso_callback, start_sso};
pub use user_lookup::lookup_by_wallet;
pub use username::check_username;
pub use webauthn::{
    auth_options as webauthn_auth_options, auth_verify as webauthn_auth_verify,
    register_options as webauthn_register_options, register_verify as webauthn_register_verify,
};
pub use webauthn_signup::{
    signup_options as webauthn_signup_options, signup_verify as webauthn_signup_verify,
};
