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
/// ├── wallet/
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
            let path = format!("skills/{}/SKILL.md", skill_id);
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

/// Generate README for the bundle
fn generate_readme(base: &str) -> String {
    format!(
        r#"# Cedros Login Skills Bundle

This bundle contains skills for the Cedros Login authentication service.

## Installation

### Claude Code
Copy the skill folders to your Claude Code skills directory:
```bash
unzip skills.zip -d ~/.claude/skills/cedros-login/
```

### OpenAI Codex
Copy to your Codex skills directory:
```bash
unzip skills.zip -d ~/.codex/skills/cedros-login/
```

## Available Skills

| Skill | Description |
|-------|-------------|
| auth | User registration, login, sessions, API keys |
| profile | User profile and settings management |
| orgs | Team and organization management |
| mfa | Multi-factor authentication setup |
| wallet | Embedded Solana wallet operations |
| admin | System administration (requires admin role) |

## API Base URL

All endpoints are relative to: `{base}`

## Online Documentation

- Full API: {base}/openapi.json
- Agent Guide: {base}/agent.md
- Skill Index: {base}/skill.md

## Authentication

The fastest way to authenticate as an agent:

1. `POST {base}/solana/challenge` with `{{"publicKey": "<your-pubkey>"}}`
2. Sign the returned nonce with your private key
3. `POST {base}/solana` with `{{"publicKey": "...", "signature": "..."}}`
4. Use returned API key: `Authorization: Bearer ck_xxx`
"#,
        base = base
    )
}

/// Generate content for all skills
fn generate_skill_contents(base: &str) -> Vec<(&'static str, String)> {
    vec![
        ("auth", generate_auth_skill(base)),
        ("profile", generate_profile_skill(base)),
        ("orgs", generate_orgs_skill(base)),
        ("mfa", generate_mfa_skill(base)),
        ("wallet", generate_wallet_skill(base)),
        ("admin", generate_admin_skill(base)),
    ]
}

fn generate_auth_skill(base: &str) -> String {
    format!(
        r#"---
skill: auth
name: Authentication
version: "1.0.0"
description: User registration, login, sessions, and API key management
apiBase: "{base}"
requiresAuth: false
---

# Authentication Skill

Handles user registration, login, session management, and API key operations.

## Solana Wallet Auth (Recommended for Agents)

### Step 1: Request Challenge
```
POST {base}/solana/challenge
Content-Type: application/json

{{"publicKey": "YourBase58SolanaPublicKey"}}
```

Response:
```json
{{"nonce": "Sign this message: cedros-auth-abc123...", "expiresAt": "2024-..."}}
```

### Step 2: Submit Signed Challenge
```
POST {base}/solana
Content-Type: application/json

{{
  "publicKey": "YourBase58SolanaPublicKey",
  "signature": "Base58SignatureOfNonce"
}}
```

Response:
```json
{{
  "user": {{"id": "uuid", "walletAddress": "..."}},
  "tokens": {{"accessToken": "...", "refreshToken": "..."}},
  "apiKey": "ck_live_abc123...",
  "isNewUser": true
}}
```

## Email/Password Auth

### Register
```
POST {base}/register
Content-Type: application/json

{{"email": "user@example.com", "password": "SecurePassword123!", "name": "User Name"}}
```

### Login
```
POST {base}/login
Content-Type: application/json

{{"email": "user@example.com", "password": "..."}}
```

## Session Management

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/sessions | List active sessions |
| DELETE | {base}/sessions | Revoke all sessions |
| POST | {base}/logout | Logout current session |
| POST | {base}/logout-all | Logout all sessions |

## API Key Management

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/user/api-key | Get current API key |
| POST | {base}/user/api-key/regenerate | Regenerate API key |
"#,
        base = base
    )
}

fn generate_profile_skill(base: &str) -> String {
    format!(
        r#"---
skill: profile
name: Profile
version: "1.0.0"
description: User profile and settings management
apiBase: "{base}"
requiresAuth: true
---

# Profile Skill

Manage user profile information and account settings.

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
  "walletAddress": "...",
  "mfaEnabled": false,
  "createdAt": "2024-..."
}}
```

## Update Profile
```
PATCH {base}/me
Authorization: Bearer <api-key>
Content-Type: application/json

{{"name": "New Name"}}
```

## Change Password
```
POST {base}/change-password
Authorization: Bearer <api-key>
Content-Type: application/json

{{"currentPassword": "...", "newPassword": "..."}}
```

## Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/user | Get current user |
| PATCH | {base}/me | Update profile |
| POST | {base}/change-password | Change password |
"#,
        base = base
    )
}

fn generate_orgs_skill(base: &str) -> String {
    format!(
        r#"---
skill: orgs
name: Organizations
version: "1.0.0"
description: Team and organization management with RBAC
apiBase: "{base}"
requiresAuth: true
---

# Organizations Skill

Create and manage organizations, members, invites, and roles.

## List Organizations
```
GET {base}/orgs
Authorization: Bearer <api-key>
```

## Create Organization
```
POST {base}/orgs
Authorization: Bearer <api-key>
Content-Type: application/json

{{"name": "My Organization", "slug": "my-org"}}
```

## Get Organization
```
GET {base}/orgs/{{id}}
Authorization: Bearer <api-key>
```

## Member Management

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/orgs/{{id}}/members | List members |
| PATCH | {base}/orgs/{{id}}/members/{{userId}} | Update member role |
| DELETE | {base}/orgs/{{id}}/members/{{userId}} | Remove member |

## Invites

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/orgs/{{id}}/invites | List pending invites |
| POST | {base}/orgs/{{id}}/invites | Create invite |
| POST | {base}/invites/{{token}}/accept | Accept invite |
| DELETE | {base}/orgs/{{id}}/invites/{{id}} | Cancel invite |

## Roles

Built-in roles: `owner`, `admin`, `member`, `viewer`

Custom roles can be created via the RBAC endpoints.
"#,
        base = base
    )
}

fn generate_mfa_skill(base: &str) -> String {
    format!(
        r#"---
skill: mfa
name: MFA
version: "1.0.0"
description: Multi-factor authentication setup and verification
apiBase: "{base}"
requiresAuth: true
---

# MFA Skill

Setup and manage multi-factor authentication using TOTP.

## Check MFA Status
```
GET {base}/mfa/status
Authorization: Bearer <api-key>
```

Response:
```json
{{"enabled": false, "backupCodesRemaining": 0}}
```

## Setup MFA

### Step 1: Start Setup
```
POST {base}/mfa/setup
Authorization: Bearer <api-key>
```

Response:
```json
{{
  "secret": "BASE32SECRET",
  "qrCodeUrl": "otpauth://totp/...",
  "backupCodes": ["code1", "code2", ...]
}}
```

### Step 2: Enable MFA
```
POST {base}/mfa/enable
Authorization: Bearer <api-key>
Content-Type: application/json

{{"code": "123456"}}
```

## Disable MFA
```
POST {base}/mfa/disable
Authorization: Bearer <api-key>
Content-Type: application/json

{{"code": "123456"}}
```

## Verify MFA (during login)
```
POST {base}/mfa/verify
Content-Type: application/json

{{"mfaToken": "...", "code": "123456"}}
```

## Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/mfa/status | Get MFA status |
| POST | {base}/mfa/setup | Start MFA setup |
| POST | {base}/mfa/enable | Enable MFA |
| POST | {base}/mfa/disable | Disable MFA |
| POST | {base}/mfa/verify | Verify MFA code |
"#,
        base = base
    )
}

fn generate_wallet_skill(base: &str) -> String {
    format!(
        r#"---
skill: wallet
name: Wallet
version: "1.0.0"
description: Embedded Solana wallet operations
apiBase: "{base}"
requiresAuth: true
---

# Wallet Skill

Manage embedded Solana wallet for transaction signing.

## Get Wallet Status
```
GET {base}/wallet/status
Authorization: Bearer <api-key>
```

Response:
```json
{{
  "enrolled": true,
  "publicKey": "SolanaPublicKey...",
  "locked": true
}}
```

## Enroll Wallet
```
POST {base}/wallet/enroll
Authorization: Bearer <api-key>
Content-Type: application/json

{{"userSecret": "user-chosen-passphrase"}}
```

## Unlock Wallet
```
POST {base}/wallet/unlock
Authorization: Bearer <api-key>
Content-Type: application/json

{{"userSecret": "user-chosen-passphrase"}}
```

## Sign Transaction
```
POST {base}/wallet/sign
Authorization: Bearer <api-key>
Content-Type: application/json

{{
  "transaction": "base64-encoded-transaction",
  "userSecret": "user-chosen-passphrase"
}}
```

Response:
```json
{{"signature": "base58-signature"}}
```

## Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/wallet/status | Get wallet status |
| GET | {base}/wallet/material | Get wallet material |
| POST | {base}/wallet/enroll | Enroll new wallet |
| POST | {base}/wallet/unlock | Unlock wallet |
| POST | {base}/wallet/sign | Sign transaction |
"#,
        base = base
    )
}

fn generate_admin_skill(base: &str) -> String {
    format!(
        r#"---
skill: admin
name: Admin
version: "1.0.0"
description: System administration and user management
apiBase: "{base}"
requiresAuth: true
requiresAdmin: true
---

# Admin Skill

System administration operations. Requires admin role.

## User Management

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/admin/users | List all users (paginated) |
| GET | {base}/admin/users/stats | Get user statistics |
| GET | {base}/admin/users/{{id}} | Get user details |
| PATCH | {base}/admin/users/{{id}} | Update user |
| DELETE | {base}/admin/users/{{id}} | Delete user |
| POST | {base}/admin/users/{{id}}/system-admin | Set system admin status |

## System Settings

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/admin/settings | List all settings |
| PUT | {base}/admin/settings | Update settings |

## Audit Logs

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/admin/audit-logs | Get system audit logs |
| GET | {base}/admin/orgs/{{id}}/audit-logs | Get org audit logs |

## Example: List Users
```
GET {base}/admin/users?page=1&limit=20
Authorization: Bearer <admin-api-key>
```

Response:
```json
{{
  "users": [...],
  "total": 150,
  "page": 1,
  "limit": 20
}}
```

## Full Admin Reference

See {base}/llms-admin.txt for complete admin documentation.
"#,
        base = base
    )
}

fn get_base_path<C: AuthCallback, E: EmailService>(state: &AppState<C, E>) -> String {
    let base_path = state.config.server.auth_base_path.trim_end_matches('/');
    if base_path.is_empty() {
        String::new()
    } else {
        base_path.to_string()
    }
}
