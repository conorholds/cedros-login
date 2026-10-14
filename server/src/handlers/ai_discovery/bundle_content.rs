//! Generated content for the downloadable AI skill bundle.

use super::content::ContentConfig;
use super::extension_ai::extension_bundle_skills;

pub(super) fn generate_readme(base: &str) -> String {
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
| admin | System administration (requires admin role) |

Extension-owned skills may also be included using their namespaced skill ids.

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
"#
    )
}

pub(super) fn generate_skill_contents(base: &str) -> Vec<(String, String)> {
    let mut skills = vec![
        ("auth".to_string(), generate_auth_skill(base)),
        ("profile".to_string(), generate_profile_skill(base)),
        ("orgs".to_string(), generate_orgs_skill(base)),
        ("mfa".to_string(), generate_mfa_skill(base)),
        ("admin".to_string(), generate_admin_skill(base)),
    ];
    skills.extend(extension_bundle_skills(&ContentConfig::new(base)));
    skills
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
| GET | {base}/user/api-keys | List API keys |
| POST | {base}/user/api-keys | Create API key |
"#
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
"#
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
"#
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
"#
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
| PATCH | {base}/admin/settings | Update settings |

## Audit Logs

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/admin/audit | Get system audit logs |
| GET | {base}/orgs/{{id}}/audit | Get org audit logs |

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
"#
    )
}
