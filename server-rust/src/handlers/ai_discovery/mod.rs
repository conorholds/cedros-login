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
pub mod content;
mod heartbeat;
mod llms;
mod manifests;
mod skill_files;
mod skills;
pub mod types;

// LLM text endpoints
pub use llms::{ai_txt, llms_admin_txt, llms_full_txt, llms_txt};

// Skill endpoints
pub use skills::{skill_json, skill_md};

// Individual skill files
pub use skill_files::{
    skill_admin_md, skill_auth_md, skill_mfa_md, skill_orgs_md, skill_profile_md, skill_wallet_md,
};

// Agent integration guide
pub use agent::agent_md;

// Health endpoints
pub use heartbeat::{heartbeat_json, heartbeat_md};

// Standard manifests
pub use manifests::{agent_json, ai_discovery_index, ai_plugin_json, mcp_discovery};

// Downloadable skills bundle
pub use bundle::skills_bundle_zip;
