//! Composable content generators for AI discovery
//!
//! This module exports functions that generate AI discovery content without
//! being tied to HTTP handlers. This allows consuming applications to:
//!
//! 1. Use the default handlers for standalone deployment
//! 2. Compose unified discovery from multiple packages (e.g., cedros-login + cedros-pay)
//!
//! # Example: Composing unified discovery
//!
//! ```text
//! use cedros_login::ai_discovery::{ContentConfig, get_skills, get_llms_content};
//! use cedros_pay::ai_discovery as pay_discovery;
//!
//! // Get skills from both packages
//! let login_config = ContentConfig::new("/auth");
//! let pay_config = pay_discovery::ContentConfig::new("/pay");
//!
//! let mut all_skills = get_skills(&login_config);
//! all_skills.extend(pay_discovery::get_skills(&pay_config));
//!
//! // Generate unified llms.txt
//! let unified_llms = format!(
//!     "# Cedros Platform\n\n{}\n\n{}",
//!     get_llms_section(&login_config),
//!     pay_discovery::get_llms_section(&pay_config),
//! );
//! ```

use super::types::*;

/// Configuration for content generation
#[derive(Debug, Clone)]
pub struct ContentConfig {
    /// Base path for all endpoints (e.g., "" for root, "/auth" for mounted)
    pub base_path: String,
    /// Service name
    pub name: String,
    /// Service version
    pub version: String,
    /// Service description
    pub description: String,
    /// Homepage URL (optional)
    pub homepage: Option<String>,
}

impl ContentConfig {
    /// Create a new content config with the given base path
    pub fn new(base_path: &str) -> Self {
        Self {
            base_path: base_path.to_string(),
            name: "cedros-login".to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            description: "Authentication and authorization API for apps and AI agents".to_string(),
            homepage: None,
        }
    }

    /// Create config with custom name and description
    pub fn with_details(base_path: &str, name: &str, description: &str) -> Self {
        Self {
            base_path: base_path.to_string(),
            name: name.to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            description: description.to_string(),
            homepage: None,
        }
    }

    /// Set homepage URL
    pub fn with_homepage(mut self, url: &str) -> Self {
        self.homepage = Some(url.to_string());
        self
    }

    /// Get full path for an endpoint
    pub fn path(&self, endpoint: &str) -> String {
        format!("{}{}", self.base_path, endpoint)
    }
}

impl Default for ContentConfig {
    fn default() -> Self {
        Self::new("")
    }
}

// ============================================================================
// Skill Definitions
// ============================================================================

/// Get all skill references for cedros-login
pub fn get_skill_references(config: &ContentConfig) -> Vec<SkillReference> {
    vec![
        SkillReference {
            id: "auth".to_string(),
            name: "Authentication".to_string(),
            path: config.path("/skills/auth.md"),
            description: "User registration, login, sessions, and API key management".to_string(),
            requires_auth: Some(false),
            requires_admin: None,
        },
        SkillReference {
            id: "profile".to_string(),
            name: "Profile".to_string(),
            path: config.path("/skills/profile.md"),
            description: "User profile management and settings".to_string(),
            requires_auth: Some(true),
            requires_admin: None,
        },
        SkillReference {
            id: "orgs".to_string(),
            name: "Organizations".to_string(),
            path: config.path("/skills/orgs.md"),
            description: "Organization management, members, invites, and RBAC".to_string(),
            requires_auth: Some(true),
            requires_admin: None,
        },
        SkillReference {
            id: "mfa".to_string(),
            name: "MFA".to_string(),
            path: config.path("/skills/mfa.md"),
            description: "Multi-factor authentication setup and management".to_string(),
            requires_auth: Some(true),
            requires_admin: None,
        },
        SkillReference {
            id: "wallet".to_string(),
            name: "Wallet".to_string(),
            path: config.path("/skills/wallet.md"),
            description: "Embedded Solana wallet operations".to_string(),
            requires_auth: Some(true),
            requires_admin: None,
        },
        SkillReference {
            id: "admin".to_string(),
            name: "Admin".to_string(),
            path: config.path("/skills/admin.md"),
            description: "System administration and user management".to_string(),
            requires_auth: Some(true),
            requires_admin: Some(true),
        },
    ]
}

/// Get skill capabilities for cedros-login
pub fn get_skill_capabilities() -> SkillCapabilities {
    SkillCapabilities {
        user_auth: true,
        admin_auth: true,
        organizations: true,
        embedded_wallet: true,
        mfa: true,
        rbac: true,
        api_keys: true,
    }
}

/// Get authentication info for cedros-login
pub fn get_skill_auth() -> SkillAuth {
    SkillAuth {
        methods: vec![
            "solana-wallet".to_string(),
            "email-password".to_string(),
            "passkey".to_string(),
            "oauth".to_string(),
            "api-key".to_string(),
        ],
        recommended: "solana-wallet".to_string(),
        api_key_prefix: "ck_".to_string(),
        header: "Authorization".to_string(),
    }
}

/// Get rate limits for cedros-login
pub fn get_rate_limits() -> RateLimits {
    RateLimits {
        auth_endpoints: "10 req/min per IP".to_string(),
        api_endpoints: "100 req/min per key".to_string(),
        admin_endpoints: "30 req/min per key".to_string(),
    }
}

/// Get complete skill metadata for cedros-login
pub fn get_skill_metadata(config: &ContentConfig) -> SkillMetadata {
    SkillMetadata {
        name: config.name.clone(),
        version: config.version.clone(),
        description: config.description.clone(),
        homepage: config.homepage.clone(),
        api_base: config.base_path.clone(),
        category: "authentication".to_string(),
        capabilities: get_skill_capabilities(),
        skills: get_skill_references(config),
        authentication: get_skill_auth(),
        rate_limits: get_rate_limits(),
        downloadable_bundles: Some(DownloadableBundles {
            claude_code: config.path("/.well-known/skills.zip"),
            codex: config.path("/.well-known/skills.zip"),
        }),
    }
}

// ============================================================================
// Discovery Index
// ============================================================================

/// Get AI discovery index for cedros-login
pub fn get_discovery_index(config: &ContentConfig) -> AiDiscoveryIndex {
    AiDiscoveryIndex {
        version: "1.0.0".to_string(),
        name: config.name.clone(),
        description: config.description.clone(),
        endpoints: DiscoveryEndpoints {
            llms_txt: config.path("/llms.txt"),
            llms_full_txt: config.path("/llms-full.txt"),
            llms_admin_txt: Some(config.path("/llms-admin.txt")),
            skill_index_markdown: config.path("/skill.md"),
            skill_index_json: config.path("/skill.json"),
            agent_guide: config.path("/agent.md"),
            openapi: config.path("/openapi.json"),
            a2a_agent_card: config.path("/.well-known/agent.json"),
            ai_plugin: config.path("/.well-known/ai-plugin.json"),
            mcp: config.path("/.well-known/mcp"),
            health: config.path("/heartbeat.json"),
            auth_discovery: config.path("/discovery"),
            skills_bundle: Some(config.path("/.well-known/skills.zip")),
        },
        skills: Some(
            get_skill_references(config)
                .into_iter()
                .map(|s| SkillPointer {
                    id: s.id,
                    name: s.name,
                    path: s.path,
                })
                .collect(),
        ),
    }
}

// ============================================================================
// Text Content Generators
// ============================================================================

/// Generate llms.txt content
pub fn generate_llms_txt(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"# Cedros Login

> Authentication and authorization API for apps and AI agents. Supports Solana wallet auth (recommended for agents), email/password, OAuth, passkeys, MFA, organizations with RBAC, and embedded Solana wallet operations.

Cedros Login provides identity and access management with first-class support for AI agents. Agents can authenticate using Solana wallet signatures without requiring email verification, receiving an API key for subsequent requests.

## Quick Start

1. Generate Ed25519 keypair (Solana format)
2. `POST {base}/solana/challenge` with `{{"publicKey": "<base58-pubkey>"}}`
3. Sign the returned nonce with your private key
4. `POST {base}/solana` with `{{"publicKey": "...", "signature": "<base58-sig>"}}`
5. Use returned API key: `Authorization: Bearer ck_xxx`

## Docs

- [{base}/agent.md]({base}/agent.md): Agent integration guide with code examples in Python, JavaScript, and Rust
- [{base}/llms-full.txt]({base}/llms-full.txt): Complete API documentation
- [{base}/llms-admin.txt]({base}/llms-admin.txt): Admin operations reference

## Skills

- [{base}/skills/auth.md]({base}/skills/auth.md): Authentication, sessions, API keys
- [{base}/skills/profile.md]({base}/skills/profile.md): User profile management
- [{base}/skills/orgs.md]({base}/skills/orgs.md): Organizations, members, invites, RBAC
- [{base}/skills/mfa.md]({base}/skills/mfa.md): Multi-factor authentication setup
- [{base}/skills/wallet.md]({base}/skills/wallet.md): Embedded Solana wallet operations
- [{base}/skills/admin.md]({base}/skills/admin.md): System administration (requires admin role)

## API

- [{base}/openapi.json]({base}/openapi.json): Full OpenAPI 3.0 specification
- [{base}/discovery]({base}/discovery): Machine-readable auth configuration
- [{base}/skill.json]({base}/skill.json): Machine-readable skill metadata

## Optional

- [{base}/heartbeat.json]({base}/heartbeat.json): Health check endpoint
- [{base}/.well-known/ai-discovery.json]({base}/.well-known/ai-discovery.json): Discovery index (links to all endpoints)
- [{base}/.well-known/agent.json]({base}/.well-known/agent.json): Google A2A Agent Card
- [{base}/.well-known/mcp]({base}/.well-known/mcp): MCP server discovery
"#,
        base = base
    )
}

/// Generate ai.txt content
pub fn generate_ai_txt(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"# AI Access Policy
# This file signals permissions for AI crawlers and agents.
# See: https://ai-txt.org (emerging standard)

# Policy: Allow all AI access
User-agent: *
Allow: /

# AI Discovery Entry Point
# Start here to discover all available endpoints and capabilities
AI-Discovery: {base}/.well-known/ai-discovery.json

# Quick Links for AI Systems
LLMs-Txt: {base}/llms.txt
LLMs-Full: {base}/llms-full.txt
OpenAPI: {base}/openapi.json
Skills: {base}/skill.json
Agent-Guide: {base}/agent.md

# Authentication
# This service supports AI agent authentication via Solana wallet signatures.
# No email verification required for agents.
# See: {base}/agent.md

# Rate Limits
# Auth endpoints: 10 req/min per IP
# API endpoints: 100 req/min per key
# Admin endpoints: 30 req/min per key

# Contact
# For API access issues, see the documentation at {base}/llms.txt
"#,
        base = base
    )
}

/// Generate skill.md content (YAML frontmatter + markdown)
pub fn generate_skill_md(config: &ContentConfig) -> String {
    let base = &config.base_path;
    let skills = get_skill_references(config);

    let skills_yaml: Vec<String> = skills
        .iter()
        .map(|s| {
            let mut yaml = format!(
                "  - id: {}\n    path: {}\n    requiresAuth: {}",
                s.id,
                s.path,
                s.requires_auth.unwrap_or(false)
            );
            if let Some(true) = s.requires_admin {
                yaml.push_str("\n    requiresAdmin: true");
            }
            yaml
        })
        .collect();

    let skills_table: Vec<String> = skills
        .iter()
        .map(|s| {
            let auth = if s.requires_admin == Some(true) {
                "Yes (Admin)"
            } else if s.requires_auth == Some(true) {
                "Yes"
            } else {
                "No"
            };
            format!(
                "| [{}]({}) | {} | {} |",
                s.name, s.path, s.description, auth
            )
        })
        .collect();

    format!(
        r#"---
name: cedros-login
version: "{version}"
description: Authentication and authorization API for apps and AI agents
category: authentication
apiBase: "{base}"
capabilities:
  userAuth: true
  adminAuth: true
  organizations: true
  embeddedWallet: true
  mfa: true
  rbac: true
  apiKeys: true
authentication:
  methods: [solana-wallet, email-password, passkey, oauth, api-key]
  recommended: solana-wallet
  apiKeyPrefix: "ck_"
  header: "Authorization: Bearer <api-key>"
rateLimits:
  auth: "10 req/min per IP"
  api: "100 req/min per key"
  admin: "30 req/min per key"
skills:
{skills_yaml}
---

# Cedros Login Skills

Authentication and authorization API for apps and AI agents. Supports Solana wallet auth (recommended for agents), email/password, OAuth, passkeys, MFA, organizations with RBAC, and embedded Solana wallet operations.

## Available Skills

| Skill | Description | Auth Required |
|-------|-------------|---------------|
{skills_table}

## Quick Start for Agents

1. Generate Ed25519 keypair (Solana format)
2. Request challenge: `POST {base}/solana/challenge` with `{{"publicKey": "<base58>"}}`
3. Sign the nonce with your private key
4. Authenticate: `POST {base}/solana` with `{{"publicKey": "...", "signature": "..."}}`
5. Use API key: `Authorization: Bearer ck_xxx`

## Discovery Endpoints

| Endpoint | Format | Purpose |
|----------|--------|---------|
| {base}/llms.txt | text | Brief API summary |
| {base}/llms-full.txt | text | Complete documentation |
| {base}/llms-admin.txt | text | Admin operations |
| {base}/skill.json | JSON | Machine-readable skill metadata |
| {base}/agent.md | markdown | Integration guide with code |
| {base}/openapi.json | JSON | Full OpenAPI specification |
| {base}/discovery | JSON | Auth configuration |

## Authentication Methods

### Solana Wallet (Recommended for Agents)

No email verification required. Sign a challenge with your Ed25519 key to get an API key.

### API Key

After initial authentication, use your API key for all requests:
```
Authorization: Bearer ck_xxx
```

### Email/Password

Traditional auth with optional email verification.

## Rate Limits

| Category | Limit |
|----------|-------|
| Auth endpoints | 10 req/min per IP |
| API endpoints | 100 req/min per key |
| Admin endpoints | 30 req/min per key |

## Error Format

```json
{{
  "code": "ERROR_CODE",
  "message": "Human-readable description",
  "details": {{}}
}}
```
"#,
        version = config.version,
        base = base,
        skills_yaml = skills_yaml.join("\n"),
        skills_table = skills_table.join("\n"),
    )
}

// ============================================================================
// Manifest Generators
// ============================================================================

/// Generate OpenAI plugin manifest
pub fn get_ai_plugin_manifest(config: &ContentConfig) -> AiPluginManifest {
    AiPluginManifest {
        schema_version: "v1".to_string(),
        name_for_human: "Cedros Login".to_string(),
        name_for_model: "cedros_login".to_string(),
        description_for_human: "Authentication and identity management for apps and AI agents"
            .to_string(),
        description_for_model: format!(
            "Cedros Login API for authentication. Supports Solana wallet auth (recommended), \
            email/password, passkeys, OAuth, MFA, organizations with RBAC, and embedded wallets. \
            Agents should use Solana wallet auth: POST {}/solana/challenge then POST {}/solana.",
            config.base_path, config.base_path
        ),
        auth: AiPluginAuth {
            auth_type: "bearer".to_string(),
            instructions: Some(format!(
                "Authenticate via Solana wallet signature to get an API key. \
                See {}/agent.md for complete guide.",
                config.base_path
            )),
        },
        api: AiPluginApi {
            api_type: "openapi".to_string(),
            url: config.path("/openapi.json"),
        },
        logo_url: None,
        contact_email: None,
        legal_info_url: None,
    }
}

/// Generate A2A Agent Card
pub fn get_agent_card(config: &ContentConfig) -> AgentCard {
    let skills = get_skill_references(config);

    AgentCard {
        name: "Cedros Login".to_string(),
        description: config.description.clone(),
        url: config.base_path.clone(),
        version: config.version.clone(),
        capabilities: AgentCapabilities {
            streaming: false,
            push_notifications: false,
            state_management: true,
        },
        authentication: AgentAuthentication {
            schemes: vec![
                AuthScheme {
                    scheme: "bearer".to_string(),
                    description: "API key authentication (recommended for agents)".to_string(),
                    instructions_url: Some(config.path("/agent.md")),
                    token_url: None,
                    authorization_url: None,
                },
                AuthScheme {
                    scheme: "oauth2".to_string(),
                    description: "OAuth 2.0 with JWT tokens".to_string(),
                    instructions_url: Some(config.path("/skills/auth.md")),
                    token_url: Some(config.path("/login")),
                    authorization_url: Some(config.path("/oauth/authorize")),
                },
            ],
            scopes: Some(vec![
                AuthScope {
                    name: "user:read".to_string(),
                    description: "Read user profile and settings".to_string(),
                },
                AuthScope {
                    name: "user:write".to_string(),
                    description: "Modify user profile and settings".to_string(),
                },
                AuthScope {
                    name: "org:read".to_string(),
                    description: "Read organization data".to_string(),
                },
                AuthScope {
                    name: "org:write".to_string(),
                    description: "Manage organization members and settings".to_string(),
                },
                AuthScope {
                    name: "wallet:read".to_string(),
                    description: "Read wallet balance and history".to_string(),
                },
                AuthScope {
                    name: "wallet:sign".to_string(),
                    description: "Sign transactions with embedded wallet".to_string(),
                },
                AuthScope {
                    name: "admin:read".to_string(),
                    description: "Read admin data (requires admin role)".to_string(),
                },
                AuthScope {
                    name: "admin:write".to_string(),
                    description: "Perform admin operations (requires admin role)".to_string(),
                },
            ]),
        },
        skills: skills
            .into_iter()
            .map(|s| {
                let scopes = match s.id.as_str() {
                    "auth" => vec!["user:read".to_string(), "user:write".to_string()],
                    "profile" => vec!["user:read".to_string(), "user:write".to_string()],
                    "orgs" => vec!["org:read".to_string(), "org:write".to_string()],
                    "wallet" => vec!["wallet:read".to_string(), "wallet:sign".to_string()],
                    "admin" => vec!["admin:read".to_string(), "admin:write".to_string()],
                    _ => vec!["user:read".to_string()],
                };
                AgentSkill {
                    id: s.id.clone(),
                    name: s.name,
                    description: s.description,
                    input_modes: vec!["application/json".to_string()],
                    output_modes: vec!["application/json".to_string()],
                    documentation_url: Some(s.path),
                    openapi_tag: Some(s.id.to_uppercase()),
                    required_scopes: Some(scopes),
                }
            })
            .collect(),
        documentation_url: Some(config.path("/llms-full.txt")),
        provider: Some(AgentProvider {
            name: "Cedros".to_string(),
            url: config.homepage.clone(),
        }),
    }
}

/// Generate MCP discovery info
pub fn get_mcp_discovery(config: &ContentConfig) -> McpDiscovery {
    McpDiscovery {
        name: config.name.clone(),
        version: config.version.clone(),
        protocol_version: "2024-11-05".to_string(),
        description: config.description.clone(),
        capabilities: McpCapabilities {
            tools: true,
            resources: true,
            prompts: false,
            sampling: false,
        },
        tools: vec![
            McpTool {
                name: "authenticate".to_string(),
                description: "Authenticate with Solana wallet signature".to_string(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "publicKey": {
                            "type": "string",
                            "description": "Base58-encoded Solana public key"
                        },
                        "signature": {
                            "type": "string",
                            "description": "Base58-encoded signature of the challenge nonce"
                        }
                    },
                    "required": ["publicKey", "signature"]
                }),
            },
            McpTool {
                name: "get_user".to_string(),
                description: "Get current user profile".to_string(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {}
                }),
            },
            McpTool {
                name: "list_orgs".to_string(),
                description: "List organizations the user belongs to".to_string(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {}
                }),
            },
        ],
        authentication: McpAuth {
            required: true,
            schemes: vec!["bearer".to_string()],
            instructions: format!(
                "Authenticate via Solana wallet signature. See {}/agent.md",
                config.base_path
            ),
        },
    }
}

// ============================================================================
// Individual Skill Content
// ============================================================================

/// Skill file content for auth.md
pub fn generate_skill_auth_md(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"---
skill: auth
name: Authentication
version: "{version}"
description: User registration, login, sessions, and API key management
apiBase: "{base}"
requiresAuth: false
---

# Authentication Skill

User registration, login, session management, and API key operations.

## Solana Wallet Auth (Recommended for Agents)

### Step 1: Get Challenge

```
POST {base}/solana/challenge
Content-Type: application/json

{{"publicKey": "<base58-encoded-public-key>"}}
```

Response:
```json
{{"nonce": "<challenge-string-to-sign>", "expiresAt": "2024-01-01T00:00:00Z"}}
```

### Step 2: Authenticate

```
POST {base}/solana
Content-Type: application/json

{{
  "publicKey": "<base58-encoded-public-key>",
  "signature": "<base58-encoded-signature-of-nonce>"
}}
```

Response:
```json
{{
  "user": {{"id": "uuid", "walletAddress": "..."}},
  "apiKey": "ck_xxx"
}}
```

## Email/Password Auth

### Register

```
POST {base}/register
Content-Type: application/json

{{"email": "user@example.com", "password": "secure-password"}}
```

### Login

```
POST {base}/login
Content-Type: application/json

{{"email": "user@example.com", "password": "secure-password"}}
```

## API Keys

### Get Current API Key (Legacy)

```
GET {base}/user/api-key
Authorization: Bearer <jwt-or-api-key>
```

### Regenerate API Key (Legacy)

```
POST {base}/user/api-key/regenerate
Authorization: Bearer <jwt-or-api-key>
```

### List All API Keys

```
GET {base}/user/api-keys
Authorization: Bearer <jwt-or-api-key>
```

Response:
```json
{{"keys": [{{"id": "uuid", "keyPrefix": "ck_xxxx", "label": "default", "createdAt": "...", "lastUsedAt": "..."}}]}}
```

### Create API Key

```
POST {base}/user/api-keys
Authorization: Bearer <jwt-or-api-key>
Content-Type: application/json

{{"label": "bot-alpha"}}
```

### Delete API Key

```
DELETE {base}/user/api-keys/{{key_id}}
Authorization: Bearer <jwt-or-api-key>
```

## Sessions

### Logout Current Session

```
POST {base}/logout
Authorization: Bearer <jwt-or-api-key>
```

### Logout All Sessions

```
POST {base}/logout-all
Authorization: Bearer <jwt-or-api-key>
```

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_CREDENTIALS | Email/password incorrect |
| INVALID_SIGNATURE | Wallet signature verification failed |
| NONCE_EXPIRED | Challenge nonce has expired |
| EMAIL_NOT_VERIFIED | Email verification required |
| RATE_LIMITED | Too many auth attempts |
"#,
        version = config.version,
        base = base
    )
}

/// Skill file content for profile.md
pub fn generate_skill_profile_md(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"---
skill: profile
name: Profile
version: "{version}"
description: User profile management and settings
apiBase: "{base}"
requiresAuth: true
---

# Profile Skill

Manage user profile information and settings.

## Get Current User

```
GET {base}/user
Authorization: Bearer <api-key>
```

Response:
```json
{{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "walletAddress": "base58...",
  "emailVerified": true,
  "mfaEnabled": false,
  "createdAt": "2024-01-01T00:00:00Z"
}}
```

## Update Profile

```
PATCH {base}/me
Authorization: Bearer <api-key>
Content-Type: application/json

{{"name": "New Name"}}
```

## Email Verification

### Send Verification Email

```
POST {base}/send-verification
Authorization: Bearer <api-key>
```

### Verify Email

```
POST {base}/verify-email
Content-Type: application/json

{{"token": "<verification-token>"}}
```

## Error Codes

| Code | Description |
|------|-------------|
| UNAUTHORIZED | Not authenticated |
| INVALID_TOKEN | Verification token invalid or expired |
"#,
        version = config.version,
        base = base
    )
}

/// Skill file content for orgs.md
pub fn generate_skill_orgs_md(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"---
skill: orgs
name: Organizations
version: "{version}"
description: Organization management, members, invites, and RBAC
apiBase: "{base}"
requiresAuth: true
---

# Organizations Skill

Create and manage organizations with role-based access control.

## List My Organizations

```
GET {base}/orgs
Authorization: Bearer <api-key>
```

## Create Organization

```
POST {base}/orgs
Authorization: Bearer <api-key>
Content-Type: application/json

{{"name": "My Organization"}}
```

## Get Organization

```
GET {base}/orgs/{{org_id}}
Authorization: Bearer <api-key>
```

## Members

### List Members

```
GET {base}/orgs/{{org_id}}/members
Authorization: Bearer <api-key>
```

### Update Member Role

```
PATCH {base}/orgs/{{org_id}}/members/{{user_id}}
Authorization: Bearer <api-key>
Content-Type: application/json

{{"role": "admin"}}
```

Roles: `owner`, `admin`, `member`, `viewer`

### Remove Member

```
DELETE {base}/orgs/{{org_id}}/members/{{user_id}}
Authorization: Bearer <api-key>
```

## Invites

### Create Invite (Email)

```
POST {base}/orgs/{{org_id}}/invites
Authorization: Bearer <api-key>
Content-Type: application/json

{{"email": "newuser@example.com", "role": "member"}}
```

### Create Invite (Wallet)

```
POST {base}/orgs/{{org_id}}/invites
Authorization: Bearer <api-key>
Content-Type: application/json

{{"walletAddress": "base58...", "role": "member"}}
```

### List Pending Invites

```
GET {base}/orgs/{{org_id}}/invites
Authorization: Bearer <api-key>
```

### Accept Invite

```
POST {base}/invites/accept
Authorization: Bearer <api-key>
Content-Type: application/json

{{"token": "<invite-token>"}}
```

## Error Codes

| Code | Description |
|------|-------------|
| FORBIDDEN | Insufficient permissions |
| NOT_FOUND | Organization not found |
| ALREADY_MEMBER | User already in organization |
| INVITE_EXPIRED | Invite has expired |
"#,
        version = config.version,
        base = base
    )
}

/// Skill file content for mfa.md
pub fn generate_skill_mfa_md(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"---
skill: mfa
name: MFA
version: "{version}"
description: Multi-factor authentication setup and management
apiBase: "{base}"
requiresAuth: true
---

# MFA Skill

Set up and manage multi-factor authentication.

## TOTP (Authenticator App)

### Begin Setup

```
POST {base}/mfa/totp/setup
Authorization: Bearer <api-key>
```

Response includes QR code URL and secret for authenticator apps.

### Verify Setup

```
POST {base}/mfa/totp/verify
Authorization: Bearer <api-key>
Content-Type: application/json

{{"code": "123456"}}
```

### Disable TOTP

```
DELETE {base}/mfa/totp
Authorization: Bearer <api-key>
Content-Type: application/json

{{"code": "123456"}}
```

## WebAuthn (Passkeys)

### Register Passkey

```
POST {base}/webauthn/register/begin
Authorization: Bearer <api-key>
```

```
POST {base}/webauthn/register/finish
Authorization: Bearer <api-key>
Content-Type: application/json

{{...webauthn-response...}}
```

### List Passkeys

```
GET {base}/webauthn/credentials
Authorization: Bearer <api-key>
```

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_CODE | TOTP code incorrect |
| MFA_ALREADY_ENABLED | MFA already set up |
| MFA_REQUIRED | Operation requires MFA verification |
"#,
        version = config.version,
        base = base
    )
}

/// Skill file content for wallet.md
pub fn generate_skill_wallet_md(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"---
skill: wallet
name: Wallet
version: "{version}"
description: Embedded Solana wallet operations
apiBase: "{base}"
requiresAuth: true
---

# Wallet Skill

Manage embedded Solana wallets with secure key sharding.

## Check Wallet Status

```
GET {base}/wallet/status
Authorization: Bearer <api-key>
```

Response:
```json
{{
  "hasWallet": true,
  "publicKey": "base58...",
  "authMethod": "passkey"
}}
```

## Enroll Wallet

```
POST {base}/wallet/enroll
Authorization: Bearer <api-key>
Content-Type: application/json

{{
  "authMethod": "passkey",
  "prfSalt": "<base64-salt>",
  "encryptedShareA": "<base64-encrypted>",
  "encryptedShareB": "<base64-encrypted>",
  "walletPubkey": "base58..."
}}
```

Auth methods: `passkey`, `pin`, `password`, `api_key`

When authenticated via API key, use `"authMethod": "api_key"` to encrypt Share A with the API key itself. This enables fully headless signing — no separate credential needed.

## Sign Transaction

```
POST {base}/wallet/sign
Authorization: Bearer <api-key>
Content-Type: application/json

{{
  "transaction": "<base64-serialized-tx>",
  "shareA": "<decrypted-share-a>"
}}
```

Response:
```json
{{
  "signature": "base58...",
  "signedTransaction": "<base64-signed-tx>"
}}
```

## Get Balance

```
GET {base}/wallet/balance
Authorization: Bearer <api-key>
```

## List Wallets

```
GET {base}/wallet/list
Authorization: Bearer <api-key>
```

Response:
```json
{{
  "wallets": [
    {{"id": "uuid", "walletPubkey": "base58...", "authMethod": "passkey", "apiKeyLabel": null, "isDefault": true, "createdAt": "..."}},
    {{"id": "uuid", "walletPubkey": "base58...", "authMethod": "api_key", "apiKeyLabel": "bot-alpha", "isDefault": false, "createdAt": "..."}}
  ]
}}
```

## Rotate Wallet

Replaces the current wallet with a new keypair. **Irreversible** — funds at old address are NOT migrated.

```
POST {base}/wallet/rotate
Authorization: Bearer <api-key>
Content-Type: application/json

{{
  "authMethod": "passkey",
  "walletPubkey": "new-base58...",
  "encryptedShareA": "<base64>",
  "encryptedShareB": "<base64>"
}}
```

## Multi-Wallet Support

Each user can have:
- **One default wallet** (enrolled via JWT auth)
- **One wallet per API key** (enrolled via API key auth)

Wallet selection is automatic: API key auth uses the key-linked wallet, JWT auth uses the default wallet.

## Error Codes

| Code | Description |
|------|-------------|
| NO_WALLET | User has no enrolled wallet |
| INVALID_SHARE | Share decryption/verification failed |
| SIGNING_FAILED | Transaction signing failed |
"#,
        version = config.version,
        base = base
    )
}

/// Skill file content for admin.md
pub fn generate_skill_admin_md(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"---
skill: admin
name: Admin
version: "{version}"
description: System administration and user management
apiBase: "{base}"
requiresAuth: true
requiresAdmin: true
---

# Admin Skill

Administrative operations requiring elevated permissions.

## User Management

### List Users (Org Admin)

```
GET {base}/orgs/{{org_id}}/members?page=1&limit=20
Authorization: Bearer <api-key>
```

### Update User Role

```
PATCH {base}/orgs/{{org_id}}/members/{{user_id}}
Authorization: Bearer <api-key>
Content-Type: application/json

{{"role": "admin"}}
```

### Remove User

```
DELETE {base}/orgs/{{org_id}}/members/{{user_id}}
Authorization: Bearer <api-key>
```

## Organization Settings

### Get Settings

```
GET {base}/orgs/{{org_id}}/settings
Authorization: Bearer <api-key>
```

### Update Settings

```
PUT {base}/orgs/{{org_id}}/settings
Authorization: Bearer <api-key>
Content-Type: application/json

{{...settings...}}
```

## Audit Logs

### Query Audit Events

```
GET {base}/orgs/{{org_id}}/audit?event_type=login&limit=100
Authorization: Bearer <api-key>
```

## Error Codes

| Code | Description |
|------|-------------|
| FORBIDDEN | Requires admin role |
| CANNOT_DEMOTE_OWNER | Cannot change owner's role |
| LAST_OWNER | Cannot remove last owner |
"#,
        version = config.version,
        base = base
    )
}
