//! Individual skill file endpoints
//!
//! Each skill file provides detailed documentation for a specific capability area.

use axum::extract::State;
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use std::sync::Arc;

use super::content::{
    generate_skill_admin_md, generate_skill_auth_md, generate_skill_mfa_md, generate_skill_orgs_md,
    generate_skill_profile_md, generate_skill_wallet_md, ContentConfig,
};
use crate::callback::AuthCallback;
use crate::services::EmailService;
use crate::AppState;

/// GET /skills/auth.md - Authentication & Sessions
pub async fn skill_auth_md<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let content = generate_skill_auth_md(&config);

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/markdown; charset=utf-8")],
        content,
    )
        .into_response()
}

/// GET /skills/profile.md - User Profile Management
pub async fn skill_profile_md<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let content = generate_skill_profile_md(&config);

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/markdown; charset=utf-8")],
        content,
    )
        .into_response()
}

/// GET /skills/orgs.md - Organization Management
pub async fn skill_orgs_md<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let content = generate_skill_orgs_md(&config);

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/markdown; charset=utf-8")],
        content,
    )
        .into_response()
}

/// GET /skills/mfa.md - Multi-Factor Authentication
pub async fn skill_mfa_md<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let content = generate_skill_mfa_md(&config);

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/markdown; charset=utf-8")],
        content,
    )
        .into_response()
}

/// GET /skills/wallet.md - Embedded Wallet Operations
pub async fn skill_wallet_md<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let content = generate_skill_wallet_md(&config);

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/markdown; charset=utf-8")],
        content,
    )
        .into_response()
}

/// GET /skills/admin.md - Administrative Operations
pub async fn skill_admin_md<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let content = generate_skill_admin_md(&config);

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/markdown; charset=utf-8")],
        content,
    )
        .into_response()
}

fn get_content_config<C: AuthCallback, E: EmailService>(state: &AppState<C, E>) -> ContentConfig {
    let base_path = state.config.server.auth_base_path.trim_end_matches('/');
    ContentConfig::new(if base_path.is_empty() { "" } else { base_path })
}
