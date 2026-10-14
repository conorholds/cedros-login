//! LLM-friendly text endpoints
//!
//! - /ai.txt - AI crawler permissions and discovery pointer
//! - /llms.txt - Brief summary for all users
//! - /llms-full.txt - Complete documentation
//! - /llms-admin.txt - Admin operations

use axum::extract::State;
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use std::sync::Arc;

use super::content::{generate_ai_txt, generate_llms_txt};
use super::extension_ai::get_extension_skill_references;
use super::{get_base_path, get_content_config};
use crate::callback::AuthCallback;
use crate::services::EmailService;
use crate::AppState;

/// GET /llms.txt - Brief API summary for LLM crawlers
///
/// Follows the llmstxt.org specification:
/// 1. H1 heading (required)
/// 2. Blockquote summary
/// 3. Content sections
/// 4. File list sections with H2 headers
pub async fn llms_txt<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let content = generate_llms_txt(&config);

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
        content,
    )
        .into_response()
}

/// GET /llms-admin.txt - Admin operations for privileged agents
///
/// Follows the llmstxt.org specification.
pub async fn llms_admin_txt<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let base = get_base_path(&state);

    // Following llmstxt.org spec: H1, blockquote, content with H2+ subsections
    let content = format!(
        r#"# Cedros Login Admin API

> Administrative operations for system management. System administration requires an interactive JWT session; organization administration accepts JWT or API-key identity plus a current owner/admin membership.

## Prerequisites

Admin operations require:
1. An interactive JWT session and current system-admin status for `/admin/*`
2. A JWT or API key plus current owner/admin membership for org-scoped operations

## First-Run Setup (Root Path)
| Method | Path | Description |
|--------|------|-------------|
| GET | /setup/status | Check if first-run setup is needed (needsSetup, hasAdmin) |
| POST | /setup/admin | Create the first admin user with `x-cedros-setup-token` (one-time only) |

Note: Setup endpoints are at the ROOT path, NOT under the auth base path.

## System Admin Operations
These require `is_system_admin: true` on the user account.

## User Management
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/admin/users | List all users (paginated) |
| GET | {base}/admin/users/stats | Get user statistics |
| GET | {base}/admin/users/{{id}} | Get user details |
| PATCH | {base}/admin/users/{{id}} | Update user |
| DELETE | {base}/admin/users/{{id}} | Delete user |
| POST | {base}/admin/users/{{id}}/system-admin | Set system admin status |
| POST | {base}/admin/users/{{id}}/force-password-reset | Force password reset |

## System Settings
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/admin/settings | List all system settings |
| PATCH | {base}/admin/settings | Update system settings |

## SSO Provider Management
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/admin/sso-providers | List SSO providers |
| POST | {base}/admin/sso-providers | Create SSO provider |
| GET | {base}/admin/sso-providers/{{id}} | Get provider details |
| PATCH | {base}/admin/sso-providers/{{id}} | Update provider |
| DELETE | {base}/admin/sso-providers/{{id}} | Delete provider |

## Audit Logs
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/admin/audit | Get system audit logs |
| GET | {base}/orgs/{{id}}/audit | Get org audit logs |

## Dashboard Permissions
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/admin/dashboard-permissions | Get dashboard permissions config |
| PUT | {base}/admin/dashboard-permissions | Update dashboard permissions |

## Org Admin Operations

These require owner/admin role within the organization.

## Member Management
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/orgs/{{id}}/members | List org members |
| PATCH | {base}/orgs/{{id}}/members/{{userId}} | Update member role |
| DELETE | {base}/orgs/{{id}}/members/{{userId}} | Remove member |

## Invite Management
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/orgs/{{id}}/invites | List pending invites |
| POST | {base}/orgs/{{id}}/invites | Create invite |
| POST | {base}/orgs/{{id}}/invites/{{id}}/resend | Resend invite |
| DELETE | {base}/orgs/{{id}}/invites/{{id}} | Cancel invite |

## Custom Roles (RBAC)
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/orgs/{{id}}/roles | List custom roles |
| POST | {base}/orgs/{{id}}/roles | Create custom role |
| PATCH | {base}/orgs/{{id}}/roles/{{id}} | Update role |
| DELETE | {base}/orgs/{{id}}/roles/{{id}} | Delete role |

## ABAC Policies
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/orgs/{{id}}/policies | List policies |
| POST | {base}/orgs/{{id}}/policies | Create policy |
| PATCH | {base}/orgs/{{id}}/policies/{{id}} | Update policy |
| DELETE | {base}/orgs/{{id}}/policies/{{id}} | Delete policy |

## Example: List Users (Admin)
```
GET {base}/admin/users?page=1&limit=20
Authorization: Bearer ck_xxx

Response:
{{
  "users": [...],
  "total": 150,
  "page": 1,
  "limit": 20
}}
```

## Error Handling
Admin endpoints return standard error format:
```json
{{
  "code": "FORBIDDEN",
  "message": "Admin access required"
}}
```

Common admin error codes:
- FORBIDDEN - Insufficient permissions
- NOT_FOUND - Resource not found
- VALIDATION_ERROR - Invalid input

## API

- [{base}/openapi.json]({base}/openapi.json): Full OpenAPI 3.0 specification
- [{base}/llms.txt]({base}/llms.txt): Brief API summary
- [{base}/llms-full.txt]({base}/llms-full.txt): Complete API documentation
- [{base}/skills/admin.md]({base}/skills/admin.md): Admin skill documentation
"#
    );

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
        content,
    )
        .into_response()
}

/// GET /llms-full.txt - Complete API documentation
///
/// Follows the llmstxt.org specification with detailed endpoint reference.
pub async fn llms_full_txt<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let base = get_base_path(&state);
    let content_config = get_content_config(&state);
    let skill_links = get_extension_skill_references(&content_config)
        .into_iter()
        .map(|skill| format!("- [{}]({}): {}", skill.path, skill.path, skill.description))
        .collect::<Vec<_>>()
        .join("\n");

    // Following llmstxt.org spec: H1, blockquote, content, then H2 file lists at end
    let content = format!(
        r#"# Cedros Login API

> Complete authentication and authorization API documentation. Supports Solana wallet auth (recommended for agents), email/password, OAuth, passkeys, MFA, and organizations with RBAC.

All endpoints are relative to: `{base}`

## Authentication for AI Agents

### Recommended: Solana Wallet Auth

#### Step 1: Get Challenge
```
POST {base}/solana/challenge
Content-Type: application/json

{{"publicKey": "YourBase58SolanaPublicKey"}}
```

Response:
```json
{{"nonce": "Sign this message: cedros-auth-abc123...", "expiresAt": "2024-..."}}
```

#### Step 2: Sign and Authenticate
```
POST {base}/solana
Content-Type: application/json

{{
  "publicKey": "YourBase58SolanaPublicKey",
  "signature": "Base58SignatureOfNonce"
}}
```

Response (new user):
```json
{{
  "user": {{"id": "uuid", "walletAddress": "..."}},
  "tokens": {{"accessToken": "...", "refreshToken": "..."}},
  "apiKey": "ck_live_abc123...",
  "isNewUser": true
}}
```

#### Step 3: Use API Key
```
Authorization: Bearer ck_live_abc123...
```

## Core Endpoints

### User Operations
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/user | Get current user (JWT or API key) |
| PATCH | {base}/me | Update profile (JWT or API key) |
| POST | {base}/change-password | Change password (JWT session) |
| GET | {base}/user/api-keys | List API keys (JWT session) |
| POST | {base}/user/api-keys | Create API key (JWT session) |

### Sessions
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/sessions | List sessions |
| DELETE | {base}/sessions | Revoke all |
| POST | {base}/logout | Logout current |
| POST | {base}/logout-all | Logout all |

### Organizations
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/orgs | List orgs |
| POST | {base}/orgs | Create org |
| GET | {base}/orgs/{{id}} | Get org |
| PATCH | {base}/orgs/{{id}} | Update org |
| DELETE | {base}/orgs/{{id}} | Delete org |
| POST | {base}/orgs/{{id}}/switch | Switch context |

### Members
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/orgs/{{id}}/members | List members |
| PATCH | {base}/orgs/{{id}}/members/{{userId}} | Update role |
| DELETE | {base}/orgs/{{id}}/members/{{userId}} | Remove |

### Invites
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/orgs/{{id}}/invites | List invites |
| POST | {base}/orgs/{{id}}/invites | Create |
| POST | {base}/invites/{{token}}/accept | Accept |
| DELETE | {base}/orgs/{{id}}/invites/{{id}} | Cancel |

### Authorization
| Method | Path | Description |
|--------|------|-------------|
| POST | {base}/authorize | Check permission |
| GET | {base}/permissions | Get all permissions |

### MFA
| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/mfa/status | Get status |
| POST | {base}/mfa/setup | Start setup |
| POST | {base}/mfa/enable | Enable |
| POST | {base}/mfa/disable | Disable |
| POST | {base}/mfa/verify | Verify code |

## Error Format
```json
{{
  "code": "ERROR_CODE",
  "message": "Human-readable message",
  "details": {{}}
}}
```

## Rate Limits
- Auth: 10 req/min per IP
- API: 100 req/min per key
- Admin: 30 req/min per key

## Docs

- [{base}/agent.md]({base}/agent.md): Agent integration guide with code examples
- [{base}/llms.txt]({base}/llms.txt): Brief API summary
- [{base}/llms-admin.txt]({base}/llms-admin.txt): Admin operations reference

## Skills

- [{base}/skills/auth.md]({base}/skills/auth.md): Authentication, sessions, API keys
- [{base}/skills/profile.md]({base}/skills/profile.md): User profile management
- [{base}/skills/orgs.md]({base}/skills/orgs.md): Organizations, members, invites, RBAC
- [{base}/skills/mfa.md]({base}/skills/mfa.md): Multi-factor authentication setup
- [{base}/skills/admin.md]({base}/skills/admin.md): System administration (requires admin role)
{skill_links}

## API

- [{base}/openapi.json]({base}/openapi.json): Full OpenAPI 3.0 specification
- [{base}/discovery]({base}/discovery): Machine-readable auth configuration
- [{base}/skill.json]({base}/skill.json): Machine-readable skill metadata
- [{base}/heartbeat.json]({base}/heartbeat.json): Health check endpoint
"#
    );

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
        content,
    )
        .into_response()
}

/// GET /ai.txt - AI crawler permissions and discovery pointer
///
/// Signals AI-friendly intent and points to discovery endpoints.
/// Similar to robots.txt but specifically for AI systems.
pub async fn ai_txt<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let config = get_content_config(&state);
    let content = generate_ai_txt(&config);

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
        content,
    )
        .into_response()
}
