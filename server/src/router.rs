//! Router configuration and composition.

mod layers;
mod routes;

use std::sync::Arc;

use axum::routing::{get, post};
use axum::Router;
use tower_http::limit::RequestBodyLimitLayer;

use crate::callback::AuthCallback;
use crate::handlers;
use crate::middleware::rate_limit::RateLimitLayer;
use crate::services::{EmailDeliveryCapability, EmailService};
use crate::AppState;

const MAX_BODY_SIZE: usize = 1024 * 1024;
const MAX_AVATAR_BODY_SIZE: usize = 5 * 1024 * 1024;

/// Create the authentication router.
pub fn create_router<C: AuthCallback + 'static, E: EmailService + 'static>(
    state: Arc<AppState<C, E>>,
) -> Router {
    create_router_with_email_delivery(state, EmailDeliveryCapability::Delivering)
}

pub(crate) fn create_router_with_email_delivery<
    C: AuthCallback + 'static,
    E: EmailService + 'static,
>(
    state: Arc<AppState<C, E>>,
    email_delivery: EmailDeliveryCapability,
) -> Router {
    let cors = layers::cors(state.as_ref());
    let (auth_limit, general_limit) = layers::rate_limits(state.as_ref());
    let backend = auth_limit.backend();
    let base = base_routes::<C, E>(&state, auth_limit, general_limit);
    let root = root_routes::<C, E>();
    let root = if state.config.rate_limit.enabled {
        root.layer(axum::middleware::from_fn_with_state(
            (state.clone(), backend),
            crate::middleware::abuse::enforce::<C, E>,
        ))
    } else {
        root
    };
    let routed = mount_at_configured_path(base, root, &state);
    layers::apply(routed, state, cors, email_delivery)
}

fn base_routes<C: AuthCallback + 'static, E: EmailService + 'static>(
    state: &Arc<AppState<C, E>>,
    auth_limit: RateLimitLayer,
    general_limit: RateLimitLayer,
) -> Router<Arc<AppState<C, E>>> {
    let backend = auth_limit.backend();
    let auth = routes::sensitive::<C, E>();
    let general = routes::general::<C, E>();
    let base = if state.config.rate_limit.enabled {
        auth.layer(auth_limit)
            .merge(general.layer(general_limit.clone()))
    } else {
        auth.merge(general)
    };
    let base = if state.config.rate_limit.enabled {
        base.layer(axum::middleware::from_fn_with_state(
            (state.clone(), backend),
            crate::middleware::abuse::enforce::<C, E>,
        ))
    } else {
        base
    };
    let upload = upload_routes::<C, E>(state.config.rate_limit.enabled, general_limit);
    base.layer(RequestBodyLimitLayer::new(MAX_BODY_SIZE))
        .merge(upload)
}

fn upload_routes<C: AuthCallback + 'static, E: EmailService + 'static>(
    rate_limit_enabled: bool,
    rate_limit: RateLimitLayer,
) -> Router<Arc<AppState<C, E>>> {
    let routes = Router::new()
        .route(
            "/upload/avatar",
            post(handlers::upload::upload_avatar::<C, E>),
        )
        .layer(RequestBodyLimitLayer::new(MAX_AVATAR_BODY_SIZE));
    if rate_limit_enabled {
        routes.layer(rate_limit)
    } else {
        routes
    }
}

fn root_routes<C: AuthCallback + 'static, E: EmailService + 'static>() -> Router<Arc<AppState<C, E>>>
{
    Router::new()
        .route("/health", get(handlers::health_check_with_delivery::<C, E>))
        .route(
            "/ready",
            get(handlers::readiness_check_with_delivery::<C, E>),
        )
        .route("/metrics", get(handlers::prometheus_metrics::<C, E>))
        .route("/.well-known/jwks.json", get(handlers::jwks::<C, E>))
        .route("/setup/status", get(handlers::setup_status::<C, E>))
        .route("/setup/admin", post(handlers::create_first_admin::<C, E>))
        .route(
            "/setup/admin/import",
            post(handlers::import_first_admin::<C, E>),
        )
}

fn mount_at_configured_path<C: AuthCallback + 'static, E: EmailService + 'static>(
    base: Router<Arc<AppState<C, E>>>,
    root: Router<Arc<AppState<C, E>>>,
    state: &AppState<C, E>,
) -> Router<Arc<AppState<C, E>>> {
    let configured = state.config.server.auth_base_path.trim_end_matches('/');
    let base_path = if configured.is_empty() {
        "/"
    } else {
        configured
    };
    if base_path == "/" {
        base.merge(root)
    } else {
        root.merge(Router::new().nest(base_path, base))
    }
}
