//! Individual skill content generators — compliance and admin skills
//!
//! kyc, compliance, rewards, admin

use super::content::ContentConfig;

/// Skill file content for kyc.md
pub fn generate_skill_kyc_md(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"---
skill: kyc
name: KYC
version: "{version}"
description: KYC identity verification (Stripe Identity)
apiBase: "{base}"
requiresAuth: true
---

# KYC Skill

Identity verification via Stripe Identity. Users are redirected to a hosted
verification flow; the server receives results via webhook.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | {base}/kyc/start | User JWT | Start verification session, returns redirectUrl |
| GET | {base}/kyc/status | User JWT | Get status + enforcement mode |

## Start Verification Session

```
POST {base}/kyc/start
Authorization: Bearer <api-key>
```

Response:
```json
{{
  "sessionId": "uuid",
  "redirectUrl": "https://verify.stripe.com/..."
}}
```

## Get KYC Status

```
GET {base}/kyc/status
Authorization: Bearer <api-key>
```

Response:
```json
{{
  "status": "verified",
  "verifiedAt": "2024-01-01T00:00:00Z",
  "expiresAt": "2025-01-01T00:00:00Z",
  "enforcementMode": "all"
}}
```

Status values: `none` | `pending` | `verified` | `failed` | `canceled`

Enforcement modes: `none` | `optional` | `withdrawals` | `deposits` | `all`

## Workflow

1. Call `GET {base}/kyc/status` — check current status.
2. If status is not `verified`, call `POST {base}/kyc/start`.
3. Redirect the user to `redirectUrl` (Stripe hosted flow).
4. Poll `GET {base}/kyc/status` until status changes from `pending`.

## Error Codes

| Code | Description |
|------|-------------|
| UNAUTHORIZED | Not authenticated |
| NOT_FOUND | KYC service not configured |
"#,
        version = config.version,
        base = base
    )
}

/// Skill file content for compliance.md
pub fn generate_skill_compliance_md(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"---
skill: compliance
name: Compliance
version: "{version}"
description: Compliance & gating — accreditation, sanctions, and token gating
apiBase: "{base}"
requiresAuth: true
---

# Compliance Skill

Accredited investor verification, sanctions screening, and token gating.
Sanctions and token gating are enforced automatically server-side.

## Accredited Investor Verification

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | {base}/accreditation/status | User JWT | Get accreditation status |
| POST | {base}/accreditation/submit | User JWT | Submit verification (6 methods) |
| POST | {base}/accreditation/upload | User JWT | Upload supporting document (multipart, max 10 MB) |
| GET | {base}/accreditation/submissions | User JWT | List own submissions |

### Get Accreditation Status

```
GET {base}/accreditation/status
Authorization: Bearer <api-key>
```

Response:
```json
{{
  "status": "approved",
  "verifiedAt": "2024-01-01T00:00:00Z",
  "expiresAt": "2025-01-01T00:00:00Z",
  "enforcementMode": "all"
}}
```

Status values: `none` | `pending` | `approved` | `rejected` | `expired`

### Submit Verification

```
POST {base}/accreditation/submit
Authorization: Bearer <api-key>
Content-Type: application/json

{{
  "method": "income",
  "incomeType": "individual",
  "statedAmountUsd": 250000
}}
```

Verification methods: `income` | `net_worth` | `credential` | `third_party_letter` | `insider` | `investment_threshold`

Response:
```json
{{"submissionId": "uuid"}}
```

### Upload Supporting Document

```
POST {base}/accreditation/upload
Authorization: Bearer <api-key>
Content-Type: multipart/form-data

Fields: submissionId (UUID), documentType (string), file (bytes)
Allowed types: PDF, JPEG, PNG, TIFF
```

## Sanctions Screening

Checked automatically on deposit and withdrawal operations. No user-facing
endpoints. Admins can inspect the cache via the admin skills.

## Token Gating

Rules are configured by admins and evaluated server-side. Use
`GET {base}/features` to check whether token gating is enabled for your app.

## Server-to-Server Compliance Check

```
GET {base}/admin/users/{{user_id}}/compliance
Authorization: Bearer <admin-api-key>
```

Response:
```json
{{
  "kycStatus": "verified",
  "accreditedInvestor": true,
  "accreditedVerifiedAt": "2024-01-01T00:00:00Z",
  "tokenGated": true
}}
```

## Error Codes

| Code | Description |
|------|-------------|
| UNAUTHORIZED | Not authenticated |
| NOT_FOUND | Service not configured |
| VALIDATION_ERROR | Invalid method or missing fields |
"#,
        version = config.version,
        base = base
    )
}

/// Skill file content for rewards.md
pub fn generate_skill_rewards_md(config: &ContentConfig) -> String {
    let base = &config.base_path;
    format!(
        r#"---
skill: rewards
name: Rewards
version: "{version}"
description: Referral rewards and payouts
apiBase: "{base}"
requiresAuth: true
---

# Rewards Skill

Referral program: share your code, earn rewards when referred users sign up.
Rewards are paid as platform credits or direct Solana wallet payouts depending
on admin configuration.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | {base}/referral | User JWT | Get referral code + count + directPayoutEnabled |
| GET | {base}/referral/rewards | User JWT | Get rewards summary |
| GET | {base}/referral/rewards/history | User JWT | Get reward history (paginated) |
| POST | {base}/referral/payout-wallet | User JWT | Set or clear payout wallet address |
| POST | {base}/referral/regenerate | User JWT | Regenerate referral code |
| POST | {base}/referral/set-code | User JWT | Set vanity referral code |

## Get Referral Code

```
GET {base}/referral
Authorization: Bearer <api-key>
```

Response:
```json
{{
  "referralCode": "MYCODE",
  "referralCount": 12,
  "directPayoutEnabled": true
}}
```

## Get Rewards Summary

```
GET {base}/referral/rewards
Authorization: Bearer <api-key>
```

Response:
```json
{{
  "totalEarned": 50000,
  "pendingAmount": 5000,
  "pendingCount": 2,
  "currency": "USDC",
  "rewardType": "direct_payout",
  "payoutWalletAddress": "SolanaWallet...",
  "referralCount": 12
}}
```

Reward types: `credits` | `direct_payout`

## Get Reward History

```
GET {base}/referral/rewards/history?limit=20&offset=0
Authorization: Bearer <api-key>
```

Response:
```json
{{
  "items": [
    {{
      "id": "uuid",
      "triggerType": "signup",
      "amount": 2500,
      "currency": "USDC",
      "status": "completed",
      "txSignature": "base58...",
      "createdAt": "2024-01-01T00:00:00Z",
      "completedAt": "2024-01-01T00:01:00Z"
    }}
  ],
  "total": 12
}}
```

Status values: `pending` | `processing` | `completed` | `failed` | `cancelled` | `credited`

## Set Payout Wallet

```
POST {base}/referral/payout-wallet
Authorization: Bearer <api-key>
Content-Type: application/json

{{"walletAddress": "SolanaBase58PublicKey..."}}
```

Pass `{{"walletAddress": null}}` to clear the wallet.

## Set Vanity Code

```
POST {base}/referral/set-code
Authorization: Bearer <api-key>
Content-Type: application/json

{{"code": "MYCODE"}}
```

Code rules: 4–16 uppercase alphanumeric characters (A-Z, 0-9).

## Error Codes

| Code | Description |
|------|-------------|
| UNAUTHORIZED | Not authenticated |
| NOT_FOUND | Referrals feature not enabled |
| VALIDATION_ERROR | Invalid code format or wallet address |
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
