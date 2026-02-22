//! Skill index and metadata endpoints
//!
//! - /skill.md - Human-readable skill index with YAML frontmatter
//! - /skill.json - Machine-readable skill metadata

use axum::extract::State;
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::Json;
use std::sync::Arc;

use super::content::{generate_skill_md, get_skill_metadata, ContentConfig};
use crate::callback::AuthCallback;
use crate::services::EmailService;
use crate::AppState;

/// GET /skill.md - Skill index with YAML frontmatter
pub async fn skill_md<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let content = generate_skill_md(&config);

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/markdown; charset=utf-8")],
        content,
    )
        .into_response()
}

/// GET /skill.json - Machine-readable skill metadata
pub async fn skill_json<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let metadata = get_skill_metadata(&config);

    (StatusCode::OK, Json(metadata)).into_response()
}

fn get_content_config<C: AuthCallback, E: EmailService>(state: &AppState<C, E>) -> ContentConfig {
    let base_path = state.config.server.auth_base_path.trim_end_matches('/');
    ContentConfig::new(if base_path.is_empty() { "" } else { base_path })
}
