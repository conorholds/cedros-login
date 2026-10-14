use std::sync::Arc;

use axum::routing::{get, post};
use axum::Router;

use crate::callback::AuthCallback;
use crate::handlers;
use crate::services::EmailService;
use crate::AppState;

pub(super) fn sensitive<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    primary::<C, E>()
        .merge(password_and_links::<C, E>())
        .merge(mfa_and_passkeys::<C, E>())
}

fn primary<C: AuthCallback + 'static, E: EmailService + 'static>() -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route("/register", post(handlers::register::<C, E>))
        .route(
            "/invite-codes/redeem",
            post(handlers::redeem_invite_code::<C, E>),
        )
        .route("/login", post(handlers::login::<C, E>))
        .route("/login/mfa", post(handlers::complete_mfa_login::<C, E>))
        .route("/refresh", post(handlers::refresh::<C, E>))
        .route("/google", post(handlers::google_auth::<C, E>))
        .route("/apple", post(handlers::apple_auth::<C, E>))
        .route("/apple/nonce", post(handlers::apple_nonce::<C, E>))
        .route(
            "/solana/challenge",
            post(handlers::solana_challenge::<C, E>),
        )
        .route("/solana", post(handlers::solana_auth::<C, E>))
        .route("/solana/link", post(handlers::solana_link::<C, E>))
}

fn password_and_links<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route("/forgot-password", post(handlers::forgot_password::<C, E>))
        .route("/reset-password", post(handlers::reset_password::<C, E>))
        .route(
            "/account-deletion/request",
            post(handlers::request_account_deletion::<C, E>),
        )
        .route(
            "/account-deletion/confirm",
            post(handlers::confirm_account_deletion::<C, E>),
        )
        .route(
            "/account-deletion/me",
            post(handlers::delete_current_account::<C, E>),
        )
        .route("/change-password", post(handlers::change_password::<C, E>))
        .route("/set-password", post(handlers::set_password::<C, E>))
        .route("/link-oauth", post(handlers::link_oauth::<C, E>))
        .route("/instant-link", post(handlers::send_instant_link::<C, E>))
        .route(
            "/instant-link/verify",
            post(handlers::verify_instant_link::<C, E>),
        )
        .route(
            "/api-key/validate",
            post(handlers::validate_api_key::<C, E>),
        )
}

fn mfa_and_passkeys<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route("/mfa/verify", post(handlers::verify_mfa::<C, E>))
        .route("/mfa/recovery", post(handlers::use_recovery_code::<C, E>))
        .route(
            "/webauthn/auth/options",
            post(handlers::webauthn_auth_options::<C, E>),
        )
        .route(
            "/webauthn/auth/verify",
            post(handlers::webauthn_auth_verify::<C, E>),
        )
        .route(
            "/webauthn/register/options",
            post(handlers::webauthn_register_options::<C, E>),
        )
        .route(
            "/webauthn/register/verify",
            post(handlers::webauthn_register_verify::<C, E>),
        )
        .route(
            "/webauthn/signup/options",
            post(handlers::webauthn_signup_options::<C, E>),
        )
        .route(
            "/webauthn/signup/verify",
            post(handlers::webauthn_signup_verify::<C, E>),
        )
        .route("/username/available", get(handlers::check_username::<C, E>))
        .route("/sso/start", post(handlers::start_sso::<C, E>))
}
