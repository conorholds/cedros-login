//! Admin handlers

mod audit;
mod dashboard_permissions;
mod disposable_domains;
mod orgs;
mod settings;
mod settings_autosave;
mod sso_providers;
mod users;

pub use audit::{get_org_audit_logs, get_system_audit_logs};
pub use dashboard_permissions::{get_dashboard_permissions, update_dashboard_permissions};
pub use disposable_domains::{get_disposable_domains, update_disposable_domains};
pub use orgs::{get_org, list_orgs};
pub use settings::{list_settings, update_settings};
pub use settings_autosave::autosave_settings;
pub use sso_providers::{
    create_sso_provider, delete_sso_provider, get_sso_provider, list_sso_providers,
    update_sso_provider,
};
pub use users::{
    delete_user, force_password_reset, get_user, get_user_stats, list_users, set_system_admin,
    update_user, validate_system_admin,
};
