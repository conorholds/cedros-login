//! Individual skill content generators — core skills
//!
//! auth, profile, orgs, mfa, wallet

use super::content::ContentConfig;

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

When authenticated via API key, use `"authMethod": "api_key"` to encrypt Share A
with the API key itself. This enables fully headless signing.

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

## Rotate Wallet

Replaces the current wallet with a new keypair. **Irreversible** — funds at old
address are NOT migrated.

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
