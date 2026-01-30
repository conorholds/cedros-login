//! HTTP request handlers

pub mod admin;
mod api_keys;
mod apple;
mod auth;
mod authorize;
mod credentials;
mod credit_operations;
mod credits;
mod custom_roles;
mod deposit;
mod deposit_tiered;
mod discovery;
mod email_verification;
mod google;
mod health;
mod instant_link;
pub mod invites;
pub mod members;
mod mfa;
pub mod orgs;
mod password_change;
mod password_reset;
mod policies;
mod prices;
mod sessions;
mod solana;
mod sso;
mod user_lookup;
mod wallet;
mod webauthn;
mod webhook;

pub use admin::{
    adjust_credits, authorize_treasury, create_sso_provider, delete_sso_provider, delete_user,
    force_password_reset, get_credit_stats, get_deposit_stats, get_org as get_admin_org,
    get_org_audit_logs, get_privacy_status, get_sso_provider, get_system_audit_logs, get_treasury,
    get_user as get_admin_user, get_user_credits, get_user_deposits, get_user_withdrawal_history,
    list_credit_refund_requests, process_credit_refund_request, reject_credit_refund_request,
    list_admin_deposits, list_in_privacy_period, list_orgs as list_admin_orgs,
    list_pending_withdrawals, list_settings, list_sso_providers, list_users,
    process_all_withdrawals, process_withdrawal, revoke_treasury, set_system_admin,
    update_settings, update_sso_provider, update_user,
};
pub use api_keys::{get_api_key, regenerate_api_key, validate_api_key};
pub use apple::apple_auth;
pub use auth::{complete_mfa_login, get_user, login, logout, logout_all, refresh, register};
pub use authorize::{authorize, get_permissions};
pub use credentials::{list_credentials, unlink_credential, update_credential};
pub use credit_operations::{capture_hold, create_hold, release_hold, spend_credits};
pub use credits::{
    get_balance, get_history, get_pending_holds, get_sol_balance, get_usage, request_refund,
};
pub use custom_roles::{
    create_custom_role, delete_custom_role, get_custom_role, list_custom_roles, set_default_role,
    update_custom_role,
};
pub use deposit::{
    cancel_deposit, confirm_spl_deposit, deposit_config, deposit_status, execute_deposit,
    list_deposits, list_pending_spl_deposits,
};
pub use deposit_tiered::{deposit_quote, execute_micro_deposit, execute_public_deposit};
pub use discovery::{auth_config, jwks, openapi_spec};
pub use email_verification::{send_verification, verify_email};
pub use google::google_auth;
pub use health::health_check;
pub use instant_link::{send_instant_link, verify_instant_link};
pub use invites::{accept_invite, cancel_invite, create_invite, list_invites, resend_invite};
pub use members::{list_members, remove_member, update_member_role};
pub use mfa::{
    disable_mfa, enable_mfa, mfa_status, regenerate_recovery_codes, setup_mfa, use_recovery_code,
    verify_mfa,
};
pub use orgs::{create_org, delete_org, get_org, list_orgs, switch_org, update_org};
pub use password_change::change_password;
pub use password_reset::{forgot_password, reset_password};
pub use policies::{create_policy, delete_policy, get_policy, list_policies, update_policy};
pub use prices::token_prices;
pub use sessions::{list_sessions, revoke_all_sessions};
pub use solana::{solana_auth, solana_challenge};
pub use sso::{sso_callback, start_sso};
pub use user_lookup::{link_stripe_customer, lookup_by_stripe_customer, lookup_by_wallet};
pub use wallet::{
    acknowledge_recovery, get_pending_recovery, get_share_b_for_recovery, get_wallet_material,
    rotate_user_secret, sign_transaction, wallet_enroll, wallet_lock, wallet_recover,
    wallet_status, wallet_unlock,
};
pub use webauthn::{
    auth_options as webauthn_auth_options, auth_verify as webauthn_auth_verify,
    register_options as webauthn_register_options, register_verify as webauthn_register_verify,
};
pub use webhook::handle_deposit_webhook;
