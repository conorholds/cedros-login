//! Standard manifest endpoints for AI/agent discovery
//!
//! - /.well-known/ai-discovery.json - Canonical discovery index
//! - /.well-known/ai-plugin.json - OpenAI plugin manifest
//! - /.well-known/agent.json - Google A2A Agent Card
//! - /.well-known/mcp - MCP server discovery

use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use std::sync::Arc;

use super::content::{
    get_agent_card, get_ai_plugin_manifest, get_discovery_index, get_mcp_discovery, ContentConfig,
};
use crate::callback::AuthCallback;
use crate::services::EmailService;
use crate::AppState;

/// GET /.well-known/ai-discovery.json - Canonical discovery index
///
/// This is the primary entry point for AI agents discovering this service.
/// It provides pointers to all other discovery endpoints.
pub async fn ai_discovery_index<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let index = get_discovery_index(&config);
    (StatusCode::OK, Json(index)).into_response()
}

/// GET /.well-known/ai-plugin.json - OpenAI plugin manifest
pub async fn ai_plugin_json<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let manifest = get_ai_plugin_manifest(&config);
    (StatusCode::OK, Json(manifest)).into_response()
}

/// GET /.well-known/agent.json - Google A2A Agent Card (API-first)
///
/// This endpoint follows Google's A2A protocol for agent discovery.
/// Skills map directly to API capabilities and OpenAPI tags.
pub async fn agent_json<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let card = get_agent_card(&config);
    (StatusCode::OK, Json(card)).into_response()
}

/// GET /.well-known/mcp - MCP server discovery
pub async fn mcp_discovery<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let discovery = get_mcp_discovery(&config);
    (StatusCode::OK, Json(discovery)).into_response()
}

fn get_content_config<C: AuthCallback, E: EmailService>(state: &AppState<C, E>) -> ContentConfig {
    let base_path = state.config.server.auth_base_path.trim_end_matches('/');
    ContentConfig::new(if base_path.is_empty() { "" } else { base_path })
}
