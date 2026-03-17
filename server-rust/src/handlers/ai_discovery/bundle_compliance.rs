//! Bundle skill content generators — compliance skills (kyc, compliance, rewards)

pub(super) fn generate_kyc_skill(base: &str) -> String {
    format!(
        r#"---
skill: kyc
name: KYC
version: "1.0.0"
description: KYC identity verification (Stripe Identity)
apiBase: "{base}"
requiresAuth: true
---

# KYC Skill

Identity verification via Stripe Identity.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | {base}/kyc/start | Start verification session, returns redirectUrl |
| GET | {base}/kyc/status | Get status + enforcement mode |

## Workflow

1. `GET {base}/kyc/status` — check current status.
2. If not `verified`, call `POST {base}/kyc/start`.
3. Redirect user to `redirectUrl`.
4. Poll `GET {base}/kyc/status` until status changes from `pending`.

## Status Values

`none` | `pending` | `verified` | `failed` | `canceled`

## Enforcement Modes

`none` | `optional` | `withdrawals` | `deposits` | `all`
"#,
        base = base
    )
}

pub(super) fn generate_compliance_skill(base: &str) -> String {
    format!(
        r#"---
skill: compliance
name: Compliance
version: "1.0.0"
description: Compliance & gating — accreditation, sanctions, and token gating
apiBase: "{base}"
requiresAuth: true
---

# Compliance Skill

Accredited investor verification, sanctions screening, and token gating.

## Accredited Investor Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/accreditation/status | Get accreditation status |
| POST | {base}/accreditation/submit | Submit verification (6 methods) |
| POST | {base}/accreditation/upload | Upload document (multipart, 10 MB) |
| GET | {base}/accreditation/submissions | List own submissions |

## Verification Methods

`income` | `net_worth` | `credential` | `third_party_letter` | `insider` | `investment_threshold`

## Submit Example
```
POST {base}/accreditation/submit
Authorization: Bearer <api-key>
Content-Type: application/json

{{"method": "income", "incomeType": "individual", "statedAmountUsd": 250000}}
```

## Server-to-Server Compliance Check
```
GET {base}/admin/users/{{user_id}}/compliance
Authorization: Bearer <admin-api-key>
```

Returns: `kycStatus`, `accreditedInvestor`, `accreditedVerifiedAt`, `tokenGated`

## Notes

Sanctions and token gating are enforced automatically server-side.
No user-facing endpoints for those features.
"#,
        base = base
    )
}

pub(super) fn generate_rewards_skill(base: &str) -> String {
    format!(
        r#"---
skill: rewards
name: Rewards
version: "1.0.0"
description: Referral rewards and payouts
apiBase: "{base}"
requiresAuth: true
---

# Rewards Skill

Referral program: earn credits or direct Solana payouts when referred users sign up.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | {base}/referral | Get referral code + count + directPayoutEnabled |
| GET | {base}/referral/rewards | Get rewards summary |
| GET | {base}/referral/rewards/history | Get reward history (paginated) |
| POST | {base}/referral/payout-wallet | Set or clear payout wallet address |
| POST | {base}/referral/regenerate | Regenerate referral code |
| POST | {base}/referral/set-code | Set vanity referral code |

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

## Set Vanity Code

Code: 4–16 uppercase alphanumeric characters.
```
POST {base}/referral/set-code
Authorization: Bearer <api-key>

{{"code": "MYCODE"}}
```
"#,
        base = base
    )
}
