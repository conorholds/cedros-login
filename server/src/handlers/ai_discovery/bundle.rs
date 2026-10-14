//! Downloadable skills bundle endpoint
//!
//! - /.well-known/skills.zip - ZIP bundle containing all skills for local installation
//!
//! Compatible with Claude Code (SKILL.md format) and OpenAI Codex skill folders.

use axum::extract::State;
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use std::io::{Cursor, Write};
use std::sync::Arc;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

use crate::callback::AuthCallback;
use crate::services::EmailService;
use crate::AppState;

use super::bundle_content::{generate_readme, generate_skill_contents};
use super::get_base_path;

/// GET /.well-known/skills.zip - Downloadable skills bundle
///
/// Returns a ZIP file containing all skills in a format compatible with
/// Claude Code and OpenAI Codex local skill installation.
///
/// Structure:
/// ```text
/// skills/
/// ├── auth/
/// │   └── SKILL.md
/// ├── profile/
/// │   └── SKILL.md
/// ├── orgs/
/// │   └── SKILL.md
/// ├── mfa/
/// │   └── SKILL.md
/// └── admin/
///     └── SKILL.md
/// ```
pub async fn skills_bundle_zip<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let base = get_base_path(&state);

    // Create ZIP in memory
    let mut buffer = Cursor::new(Vec::new());
    {
        let mut zip = ZipWriter::new(&mut buffer);
        let options = SimpleFileOptions::default()
            .compression_method(zip::CompressionMethod::Deflated)
            .unix_permissions(0o644);

        // Generate and add each skill file
        let skills = generate_skill_contents(&base);
        for (skill_id, content) in skills {
            let path = format!("skills/{skill_id}/SKILL.md");
            if let Err(e) = zip.start_file(&path, options) {
                tracing::error!("Failed to create zip entry {}: {}", path, e);
                return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create bundle")
                    .into_response();
            }
            if let Err(e) = zip.write_all(content.as_bytes()) {
                tracing::error!("Failed to write zip content for {}: {}", path, e);
                return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create bundle")
                    .into_response();
            }
        }

        // Add a README at the root
        let readme = generate_readme(&base);
        if let Err(e) = zip.start_file("skills/README.md", options) {
            tracing::error!("Failed to create README entry: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create bundle").into_response();
        }
        if let Err(e) = zip.write_all(readme.as_bytes()) {
            tracing::error!("Failed to write README: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create bundle").into_response();
        }

        if let Err(e) = zip.finish() {
            tracing::error!("Failed to finalize zip: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create bundle").into_response();
        }
    }

    let bytes = buffer.into_inner();

    (
        StatusCode::OK,
        [
            (header::CONTENT_TYPE, "application/zip"),
            (
                header::CONTENT_DISPOSITION,
                "attachment; filename=\"skills.zip\"",
            ),
        ],
        bytes,
    )
        .into_response()
}
