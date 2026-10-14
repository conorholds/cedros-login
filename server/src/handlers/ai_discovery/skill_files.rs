//! Individual skill file endpoints
//!
//! Each skill file provides detailed documentation for a specific capability area.

use axum::extract::{Path, State};
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use std::sync::Arc;

use super::content::{
    generate_skill_admin_md, generate_skill_auth_md, generate_skill_mfa_md, generate_skill_orgs_md,
    generate_skill_profile_md,
};
use super::extension_ai::get_extension_skill_markdown;
use super::get_content_config;
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

/// GET /skills/{skill_id}.md - Extension-owned skill markdown
pub async fn skill_extension_md<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
    Path(skill_path): Path<String>,
) -> Response {
    let Some(skill_id) = extract_extension_skill_id(&skill_path) else {
        return StatusCode::NOT_FOUND.into_response();
    };

    let config = get_content_config(&state);
    match get_extension_skill_markdown(&config, skill_id) {
        Some(content) => (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "text/markdown; charset=utf-8")],
            content,
        )
            .into_response(),
        None => StatusCode::NOT_FOUND.into_response(),
    }
}

fn extract_extension_skill_id(skill_file: &str) -> Option<&str> {
    let skill_id = skill_file.strip_suffix(".md")?;
    if skill_id.is_empty() {
        return None;
    }
    Some(skill_id)
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

#[cfg(test)]
mod tests {
    use super::extract_extension_skill_id;

    #[test]
    fn extracts_extension_skill_id_from_markdown_file() {
        assert_eq!(
            extract_extension_skill_id("cedros-example.md"),
            Some("cedros-example")
        );
    }

    #[test]
    fn rejects_extension_skill_file_without_markdown_suffix() {
        assert_eq!(extract_extension_skill_id("cedros-example"), None);
        assert_eq!(extract_extension_skill_id(".md"), None);
    }
}
