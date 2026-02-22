//! Shared types for AI discovery endpoints

use serde::Serialize;

// ============================================================================
// Skill Metadata (skill.json)
// ============================================================================

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillMetadata {
    pub name: String,
    pub version: String,
    pub description: String,
    pub homepage: Option<String>,
    pub api_base: String,
    pub category: String,
    pub capabilities: SkillCapabilities,
    pub skills: Vec<SkillReference>,
    pub authentication: SkillAuth,
    pub rate_limits: RateLimits,
    /// Downloadable skill bundles for local installation (Claude Code, Codex)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub downloadable_bundles: Option<DownloadableBundles>,
}

/// URLs to downloadable skill bundles for local agent frameworks
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadableBundles {
    /// ZIP bundle compatible with Claude Code skill format
    pub claude_code: String,
    /// ZIP bundle compatible with OpenAI Codex skill format
    pub codex: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillCapabilities {
    pub user_auth: bool,
    pub admin_auth: bool,
    pub organizations: bool,
    pub embedded_wallet: bool,
    pub mfa: bool,
    pub rbac: bool,
    pub api_keys: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillReference {
    pub id: String,
    pub name: String,
    pub path: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub requires_auth: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub requires_admin: Option<bool>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillAuth {
    pub methods: Vec<String>,
    pub recommended: String,
    pub api_key_prefix: String,
    pub header: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RateLimits {
    pub auth_endpoints: String,
    pub api_endpoints: String,
    pub admin_endpoints: String,
}

// ============================================================================
// OpenAI Plugin Manifest
// ============================================================================

#[derive(Debug, Serialize)]
pub struct AiPluginManifest {
    pub schema_version: String,
    pub name_for_human: String,
    pub name_for_model: String,
    pub description_for_human: String,
    pub description_for_model: String,
    pub auth: AiPluginAuth,
    pub api: AiPluginApi,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logo_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub contact_email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub legal_info_url: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AiPluginAuth {
    #[serde(rename = "type")]
    pub auth_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instructions: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AiPluginApi {
    #[serde(rename = "type")]
    pub api_type: String,
    pub url: String,
}

// ============================================================================
// Google A2A Agent Card
// ============================================================================

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentCard {
    pub name: String,
    pub description: String,
    pub url: String,
    pub version: String,
    pub capabilities: AgentCapabilities,
    pub authentication: AgentAuthentication,
    pub skills: Vec<AgentSkill>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub documentation_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider: Option<AgentProvider>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentCapabilities {
    pub streaming: bool,
    pub push_notifications: bool,
    pub state_management: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentAuthentication {
    pub schemes: Vec<AuthScheme>,
    /// Available OAuth/permission scopes
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scopes: Option<Vec<AuthScope>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthScheme {
    pub scheme: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instructions_url: Option<String>,
    /// For OAuth flows, the token endpoint
    #[serde(skip_serializing_if = "Option::is_none")]
    pub token_url: Option<String>,
    /// For OAuth flows, the authorization endpoint
    #[serde(skip_serializing_if = "Option::is_none")]
    pub authorization_url: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthScope {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentSkill {
    pub id: String,
    pub name: String,
    pub description: String,
    pub input_modes: Vec<String>,
    pub output_modes: Vec<String>,
    /// Link to detailed skill documentation
    #[serde(skip_serializing_if = "Option::is_none")]
    pub documentation_url: Option<String>,
    /// OpenAPI tag this skill maps to
    #[serde(skip_serializing_if = "Option::is_none")]
    pub openapi_tag: Option<String>,
    /// Required scopes/permissions for this skill
    #[serde(skip_serializing_if = "Option::is_none")]
    pub required_scopes: Option<Vec<String>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentProvider {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
}

// ============================================================================
// MCP Discovery
// ============================================================================

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpDiscovery {
    pub name: String,
    pub version: String,
    pub protocol_version: String,
    pub description: String,
    pub capabilities: McpCapabilities,
    pub tools: Vec<McpTool>,
    pub authentication: McpAuth,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpCapabilities {
    pub tools: bool,
    pub resources: bool,
    pub prompts: bool,
    pub sampling: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpTool {
    pub name: String,
    pub description: String,
    pub input_schema: serde_json::Value,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpAuth {
    pub required: bool,
    pub schemes: Vec<String>,
    pub instructions: String,
}

// ============================================================================
// AI Discovery Index (canonical entry point)
// ============================================================================

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AiDiscoveryIndex {
    pub version: String,
    pub name: String,
    pub description: String,
    pub endpoints: DiscoveryEndpoints,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub skills: Option<Vec<SkillPointer>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiscoveryEndpoints {
    /// Brief API summary for LLMs
    pub llms_txt: String,
    /// Complete API documentation
    pub llms_full_txt: String,
    /// Admin operations documentation
    #[serde(skip_serializing_if = "Option::is_none")]
    pub llms_admin_txt: Option<String>,
    /// Skill index (markdown with YAML frontmatter)
    pub skill_index_markdown: String,
    /// Skill index (machine-readable JSON)
    pub skill_index_json: String,
    /// Agent integration guide
    pub agent_guide: String,
    /// OpenAPI specification
    pub openapi: String,
    /// Google A2A Agent Card
    pub a2a_agent_card: String,
    /// OpenAI plugin manifest
    pub ai_plugin: String,
    /// MCP server discovery
    pub mcp: String,
    /// Health status (JSON)
    pub health: String,
    /// Auth configuration
    pub auth_discovery: String,
    /// Downloadable skills bundle (ZIP)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub skills_bundle: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillPointer {
    pub id: String,
    pub name: String,
    pub path: String,
}

// ============================================================================
// Heartbeat
// ============================================================================

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HeartbeatResponse {
    pub status: String,
    pub version: String,
    pub timestamp: String,
    pub services: ServiceStatus,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceStatus {
    pub auth: bool,
    pub database: bool,
    pub wallet: bool,
}
