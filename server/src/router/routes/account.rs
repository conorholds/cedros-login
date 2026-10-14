use std::sync::Arc;

use axum::routing::{delete, get, patch, post};
use axum::Router;

use crate::callback::AuthCallback;
use crate::handlers;
use crate::services::EmailService;
use crate::AppState;

pub(super) fn routes<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    identity::<C, E>()
        .merge(emails::<C, E>())
        .merge(security::<C, E>())
}

fn identity<C: AuthCallback + 'static, E: EmailService + 'static>() -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route("/logout", post(handlers::logout::<C, E>))
        .route("/logout-all", post(handlers::logout_all::<C, E>))
        .route("/user", get(handlers::get_user::<C, E>))
        .route("/me", patch(handlers::update_profile::<C, E>))
        .route(
            "/welcome-completed",
            post(handlers::welcome_completed::<C, E>),
        )
        .route(
            "/send-verification",
            post(handlers::send_verification::<C, E>),
        )
        .route("/verify-email", post(handlers::verify_email::<C, E>))
}

fn emails<C: AuthCallback + 'static, E: EmailService + 'static>() -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route(
            "/account/emails",
            get(handlers::list_account_emails::<C, E>).post(handlers::add_account_email::<C, E>),
        )
        .route(
            "/account/emails/verify",
            post(handlers::verify_account_email::<C, E>),
        )
        .route(
            "/account/emails/{id}",
            delete(handlers::delete_account_email::<C, E>),
        )
        .route(
            "/account/emails/{id}/resend",
            post(handlers::resend_account_email::<C, E>),
        )
        .route(
            "/account/emails/{id}/primary",
            post(handlers::set_primary_account_email::<C, E>),
        )
        .route(
            "/account/invite-codes",
            get(handlers::list_account_invite_codes::<C, E>),
        )
        .route(
            "/account/invite-discount",
            get(handlers::get_account_invite_discount::<C, E>),
        )
}

fn security<C: AuthCallback + 'static, E: EmailService + 'static>() -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route(
            "/user/api-keys",
            get(handlers::list_api_keys::<C, E>).post(handlers::create_api_key::<C, E>),
        )
        .route(
            "/user/api-keys/{id}",
            delete(handlers::delete_api_key::<C, E>),
        )
        .route(
            "/sessions",
            get(handlers::list_sessions::<C, E>).delete(handlers::revoke_all_sessions::<C, E>),
        )
        .route("/mfa/setup", post(handlers::setup_mfa::<C, E>))
        .route("/mfa/enable", post(handlers::enable_mfa::<C, E>))
        .route("/mfa/disable", post(handlers::disable_mfa::<C, E>))
        .route("/mfa/status", get(handlers::mfa_status::<C, E>))
        .route(
            "/mfa/recovery-codes/regenerate",
            post(handlers::regenerate_recovery_codes::<C, E>),
        )
        .route("/credentials", get(handlers::list_credentials::<C, E>))
        .route(
            "/credentials/{credential_id}",
            patch(handlers::update_credential::<C, E>).delete(handlers::unlink_credential::<C, E>),
        )
        .route("/sso/callback", get(handlers::sso_callback::<C, E>))
}
