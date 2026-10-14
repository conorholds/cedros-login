//! AI Discovery endpoints for LLMs and agent systems
//!
//! Provides multiple discovery formats for different AI consumers:
//! - /llms.txt, /llms-full.txt, /llms-admin.txt - Text documentation
//! - /skill.md, /skill.json - Skill metadata
//! - /skills/*.md - Individual skill files
//! - /agent.md - Integration guide
//! - /heartbeat.md, /heartbeat.json - Health status
//! - /.well-known/* - Standard manifests (OpenAI, A2A, MCP)
//! - /.well-known/skills.zip - Downloadable skills bundle
//!
//! ## Composable Content
//!
//! The `content` module exports functions for generating discovery content
//! without HTTP handlers. This allows consuming applications to compose
//! unified discovery from multiple packages.
//!
//! ```text
//! use cedros_login::handlers::ai_discovery::content::{ContentConfig, get_skill_metadata};
//!
//! let config = ContentConfig::new("/auth");
//! let skills = get_skill_metadata(&config);
//! ```

mod agent;
mod bundle;
mod bundle_content;
pub mod content;
mod content_admin;
mod content_skills;
mod extension_ai;
mod heartbeat;
mod llms;
mod manifests;
mod skill_files;
mod skills;
pub mod types;

use self::content::ContentConfig;
use crate::callback::AuthCallback;
use crate::services::EmailService;
use crate::AppState;

pub(super) fn get_base_path<C: AuthCallback, E: EmailService>(state: &AppState<C, E>) -> String {
    normalize_base_path(&state.config.server.auth_base_path)
}

fn normalize_base_path(base_path: &str) -> String {
    let trimmed = base_path.trim_end_matches('/');
    if trimmed.is_empty() {
        String::new()
    } else {
        trimmed.to_string()
    }
}

pub(super) fn get_content_config<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
) -> ContentConfig {
    let base_path = get_base_path(state);
    ContentConfig::new(&base_path)
}

// LLM text endpoints
pub use llms::{ai_txt, llms_admin_txt, llms_full_txt, llms_txt};

// Skill endpoints
pub use skills::{skill_json, skill_md};

// Individual skill files
pub use skill_files::{
    skill_admin_md, skill_auth_md, skill_extension_md, skill_mfa_md, skill_orgs_md,
    skill_profile_md,
};

// Agent integration guide
pub use agent::agent_md;

// Health endpoints
pub use heartbeat::{heartbeat_json, heartbeat_md};

// Standard manifests
pub use manifests::{agent_json, ai_discovery_index, ai_plugin_json, mcp_discovery};

// Downloadable skills bundle
pub use bundle::skills_bundle_zip;

#[cfg(test)]
mod tests {
    use super::normalize_base_path;

    #[test]
    fn normalizes_configured_auth_base_path() {
        assert_eq!(normalize_base_path("/auth"), "/auth");
        assert_eq!(normalize_base_path("/auth/"), "/auth");
    }

    #[test]
    fn normalizes_root_auth_base_path_to_empty() {
        assert_eq!(normalize_base_path(""), "");
        assert_eq!(normalize_base_path("/"), "");
    }
}
