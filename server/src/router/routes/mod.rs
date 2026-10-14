mod account;
mod admin;
mod auth;
mod discovery;
mod organizations;

use std::sync::Arc;

use axum::Router;

use crate::callback::AuthCallback;
use crate::services::EmailService;
use crate::AppState;

pub(super) fn sensitive<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    auth::sensitive::<C, E>()
}

pub(super) fn general<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    discovery::routes::<C, E>()
        .merge(account::routes::<C, E>())
        .merge(organizations::routes::<C, E>())
        .merge(admin::routes::<C, E>())
}
