use std::sync::Arc;

use axum::routing::{delete, get, patch, post};
use axum::Router;

use crate::callback::AuthCallback;
use crate::handlers;
use crate::services::EmailService;
use crate::AppState;

pub(super) fn routes<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    organizations::<C, E>()
        .merge(roles_and_policies::<C, E>())
        .merge(invites_and_access::<C, E>())
}

fn organizations<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route(
            "/orgs",
            get(handlers::list_orgs::<C, E>).post(handlers::create_org::<C, E>),
        )
        .route(
            "/orgs/{org_id}",
            get(handlers::get_org::<C, E>)
                .patch(handlers::update_org::<C, E>)
                .delete(handlers::delete_org::<C, E>),
        )
        .route("/orgs/{org_id}/switch", post(handlers::switch_org::<C, E>))
        .route(
            "/orgs/{org_id}/members",
            get(handlers::list_members::<C, E>),
        )
        .route(
            "/orgs/{org_id}/members/{user_id}",
            patch(handlers::update_member_role::<C, E>).delete(handlers::remove_member::<C, E>),
        )
}

fn roles_and_policies<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route(
            "/orgs/{org_id}/roles",
            get(handlers::list_custom_roles::<C, E>).post(handlers::create_custom_role::<C, E>),
        )
        .route(
            "/orgs/{org_id}/roles/{role_id}",
            get(handlers::get_custom_role::<C, E>)
                .patch(handlers::update_custom_role::<C, E>)
                .delete(handlers::delete_custom_role::<C, E>),
        )
        .route(
            "/orgs/{org_id}/roles/{role_id}/default",
            post(handlers::set_default_role::<C, E>),
        )
        .route(
            "/orgs/{org_id}/policies",
            get(handlers::list_policies::<C, E>).post(handlers::create_policy::<C, E>),
        )
        .route(
            "/orgs/{org_id}/policies/{policy_id}",
            get(handlers::get_policy::<C, E>)
                .patch(handlers::update_policy::<C, E>)
                .delete(handlers::delete_policy::<C, E>),
        )
}

fn invites_and_access<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route(
            "/orgs/{org_id}/invites",
            get(handlers::list_invites::<C, E>).post(handlers::create_invite::<C, E>),
        )
        .route(
            "/orgs/{org_id}/invites/{invite_id}",
            delete(handlers::cancel_invite::<C, E>),
        )
        .route(
            "/orgs/{org_id}/invites/{invite_id}/resend",
            post(handlers::resend_invite::<C, E>),
        )
        .route("/invites/accept", post(handlers::accept_invite::<C, E>))
        .route("/authorize", post(handlers::authorize::<C, E>))
        .route("/permissions", post(handlers::get_permissions::<C, E>))
        .route(
            "/orgs/{org_id}/audit",
            get(handlers::get_org_audit_logs::<C, E>),
        )
}
