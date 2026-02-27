//! Admin handlers

mod audit;
mod credit_refunds;
mod credits;
mod dashboard_permissions;
mod disposable_domains;
pub(crate) mod deposits;
mod orgs;
mod settings;
mod sso_providers;
mod treasury;
mod users;

pub use audit::{get_org_audit_logs, get_system_audit_logs};
pub use credit_refunds::reject_credit_refund_request;
pub use credit_refunds::{list_credit_refund_requests, process_credit_refund_request};
pub use credits::{adjust_credits, get_stats as get_credit_stats};
pub use dashboard_permissions::{get_dashboard_permissions, update_dashboard_permissions};
pub use disposable_domains::{get_disposable_domains, update_disposable_domains};
pub use deposits::{
    get_stats as get_deposit_stats, get_status as get_privacy_status,
    list_deposits as list_admin_deposits, list_in_privacy_period, list_pending_withdrawals,
    process_all_withdrawals, process_withdrawal,
};
pub use orgs::{get_org, list_orgs};
pub use settings::{list_settings, update_settings};
pub use sso_providers::{
    create_sso_provider, delete_sso_provider, get_sso_provider, list_sso_providers,
    update_sso_provider,
};
pub use treasury::{authorize_treasury, get_treasury, revoke_treasury};
pub use users::{
    delete_user, force_password_reset, get_user, get_user_credits, get_user_deposits,
    get_user_stats, get_user_withdrawal_history, list_users, set_system_admin, update_user,
    validate_system_admin,
};
