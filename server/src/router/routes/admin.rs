use std::sync::Arc;

use axum::routing::{get, patch};
use axum::Router;

use crate::callback::AuthCallback;
use crate::handlers;
use crate::services::EmailService;
use crate::AppState;

pub(super) fn routes<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    users::<C, E>()
        .merge(settings::<C, E>())
        .merge(system::<C, E>())
}

fn users<C: AuthCallback + 'static, E: EmailService + 'static>() -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route("/admin/audit", get(handlers::get_system_audit_logs::<C, E>))
        .route("/admin/users", get(handlers::list_users::<C, E>))
        .route("/admin/users/stats", get(handlers::get_user_stats::<C, E>))
        .route(
            "/admin/users/{user_id}",
            get(handlers::get_admin_user::<C, E>)
                .patch(handlers::update_user::<C, E>)
                .delete(handlers::delete_user::<C, E>),
        )
        .route(
            "/admin/users/{user_id}/system-admin",
            patch(handlers::set_system_admin::<C, E>),
        )
        .route(
            "/admin/users/{user_id}/force-password-reset",
            axum::routing::post(handlers::force_password_reset::<C, E>),
        )
        .route("/admin/orgs", get(handlers::list_admin_orgs::<C, E>))
        .route("/admin/orgs/{org_id}", get(handlers::get_admin_org::<C, E>))
}

fn settings<C: AuthCallback + 'static, E: EmailService + 'static>() -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route(
            "/admin/sso-providers",
            get(handlers::list_sso_providers::<C, E>).post(handlers::create_sso_provider::<C, E>),
        )
        .route(
            "/admin/sso-providers/{id}",
            get(handlers::get_sso_provider::<C, E>)
                .put(handlers::update_sso_provider::<C, E>)
                .delete(handlers::delete_sso_provider::<C, E>),
        )
        .route(
            "/admin/settings",
            get(handlers::list_settings::<C, E>).patch(handlers::update_settings::<C, E>),
        )
        .route(
            "/admin/settings/autosave",
            patch(handlers::autosave_settings::<C, E>),
        )
        .route(
            "/admin/invite-codes",
            get(handlers::list_admin_invite_codes::<C, E>)
                .post(handlers::create_admin_invite_code::<C, E>),
        )
        .route(
            "/admin/invite-codes/{id}",
            patch(handlers::update_admin_invite_code::<C, E>)
                .delete(handlers::delete_admin_invite_code::<C, E>),
        )
}

fn system<C: AuthCallback + 'static, E: EmailService + 'static>() -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route(
            "/admin/dashboard-permissions",
            get(handlers::get_dashboard_permissions::<C, E>)
                .put(handlers::update_dashboard_permissions::<C, E>),
        )
        .route(
            "/admin/disposable-domains",
            get(handlers::get_disposable_domains::<C, E>)
                .put(handlers::update_disposable_domains::<C, E>),
        )
        .route(
            "/users/by-wallet/{wallet_address}",
            get(handlers::lookup_by_wallet::<C, E>),
        )
}
