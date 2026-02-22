# Cedros Login Server

> **Warning: Development Preview**
>
> This package is in early development (v0.0.x) and is **not ready for production use**. APIs may change without notice. Use at your own risk.

Production-ready authentication server with multi-tenancy, flexible auth methods, and comprehensive access control.

## Features

### Authentication Methods
- **Email/Password**: Registration and login with Argon2id password hashing
- **Google OAuth**: Sign-in via Google ID token verification
- **Apple Sign In**: Sign-in via Apple ID token verification
- **Solana Wallet**: Sign-in by signing a challenge message with Ed25519
- **Instant Link**: Passwordless email authentication
- **WebAuthn/Passkeys**: Passwordless authentication with passkeys and security keys
- **TOTP MFA**: Time-based one-time password with recovery codes

### Multi-Tenancy
- **Organizations**: Create and manage workspaces
- **Memberships**: Users belong to multiple orgs with roles
- **Invites**: Email invitations with configurable expiry
- **Org Switching**: Switch active organization context

### Access Control
- **Built-in Roles**: Owner, Admin, Member, Viewer with preset permissions
- **Custom Roles**: Define org-specific roles with granular permissions
- **ABAC Policies**: Attribute-based access control for fine-grained rules
- **Authorization API**: Check permissions via POST /authorize

### Security
- **JWT Tokens**: Short-lived access tokens with refresh rotation
- **Refresh Reuse Alerts**: Reuse of rotated refresh tokens revokes all sessions and triggers security notifications
- **Cookie Support**: HTTP-only secure cookies for token storage
- **Token Responses**: When cookie auth is enabled, auth endpoints omit token fields from JSON responses
- **Rate Limiting**: Configurable sliding window rate limiter
- **Login Lockout**: Progressive lockout after failed attempts
- **New Device Alerts**: Security emails for unrecognized devices
- **Audit Logging**: Track all auth events with IP, user agent, and session ID
- **TOTP Replay Protection**: Each code can only be used once (S-14)
- **Encryption at Rest**: TOTP secrets encrypted with AES-256-GCM (S-22). Uses `TOTP_ENCRYPTION_SECRET` or falls back to `JWT_SECRET`.
- **Step-Up Required for MFA Enrollment**: MFA setup/enabling requires recent strong authentication
- **Production Validation**: Enforces COOKIE_SECURE and CORS_ORIGINS in production

### Communications
- **Outbox Pattern**: Reliable async email delivery
- **Email Templates**: Verification, password reset, instant link, security alerts
- **Retry with Backoff**: Exponential backoff for failed deliveries

### Storage
- **PostgreSQL**: Production-ready with sqlx migrations
- **In-Memory**: Development mode with no external dependencies

## Quick Start

### Prerequisites

- Rust 1.70+ (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- PostgreSQL 14+ (optional, uses in-memory storage by default)

### Run Locally

```bash
cd server

# Copy environment file
cp .env.example .env

# Edit .env and set JWT_SECRET (required)
# Generate with: openssl rand -base64 32
#
# Optional:
# - FRONTEND_URL for email links
# - SSO_CALLBACK_URL to override the SSO redirect (useful behind proxies)
# - AUTH_BASE_PATH to override the auth router base path (default: /auth)

# Run with in-memory storage (development)
cargo run

# Or run with PostgreSQL
 docker-compose -f ../docker-compose.yml up -d postgres
cargo run
```

The server starts at `http://localhost:8080`.

### Using Docker

```bash
# Start PostgreSQL only
 docker-compose -f ../docker-compose.yml up -d postgres

# Start everything (requires building the image)
 docker-compose -f ../docker-compose.yml --profile full up -d
```

## API Endpoints

All endpoints are served under `AUTH_BASE_PATH` (default: `/auth`). Paths below are relative to that base path.

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/register` | Email/password registration |
| `POST` | `/login` | Email/password login |
| `POST` | `/logout` | Logout and revoke session |
| `POST` | `/refresh` | Refresh access token |
| `GET` | `/user` | Get current user |
| `POST` | `/google` | Google ID token authentication |
| `POST` | `/apple` | Apple ID token authentication |
| `POST` | `/solana/challenge` | Get Solana sign-in challenge |
| `POST` | `/solana` | Verify Solana signature |

### WebAuthn / Passkeys

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/webauthn/register/options` | Get registration options for new passkey |
| `POST` | `/webauthn/register/verify` | Complete passkey registration |
| `POST` | `/webauthn/auth/options` | Get authentication options (with email) |
| `POST` | `/webauthn/auth/options/discoverable` | Get options for username-less login |
| `POST` | `/webauthn/auth/verify` | Complete passkey authentication |

### Email Verification & Password Reset

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/send-verification` | Send email verification link |
| `POST` | `/verify-email` | Verify email with token |
| `POST` | `/forgot-password` | Request password reset email |
| `POST` | `/reset-password` | Reset password with token |

### Instant Link

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/instant-link` | Send instant link email |
| `POST` | `/instant-link/verify` | Verify instant link and login |

### MFA (TOTP)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/mfa/setup` | Generate TOTP secret and QR code |
| `POST` | `/mfa/enable` | Enable MFA with verification code |
| `POST` | `/mfa/disable` | Disable MFA |
| `GET` | `/mfa/status` | Get MFA status |
| `POST` | `/mfa/verify` | Verify MFA code for authenticated step-up |
| `POST` | `/mfa/recovery` | Use recovery code for authenticated step-up |
| `POST` | `/mfa/recovery` | Use recovery code |

### Organizations

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/orgs` | List user's organizations |
| `POST` | `/orgs` | Create organization |
| `GET` | `/orgs/:org_id` | Get organization details |
| `PATCH` | `/orgs/:org_id` | Update organization |
| `DELETE` | `/orgs/:org_id` | Delete organization |
| `POST` | `/orgs/:org_id/switch` | Switch active organization |

### Members

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/orgs/:org_id/members` | List organization members |
| `PATCH` | `/orgs/:org_id/members/:user_id` | Update member role |
| `DELETE` | `/orgs/:org_id/members/:user_id` | Remove member |

### Custom Roles

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/orgs/:org_id/roles` | List custom roles |
| `POST` | `/orgs/:org_id/roles` | Create custom role |
| `GET` | `/orgs/:org_id/roles/:role_id` | Get custom role |
| `PATCH` | `/orgs/:org_id/roles/:role_id` | Update custom role |
| `DELETE` | `/orgs/:org_id/roles/:role_id` | Delete custom role |
| `POST` | `/orgs/:org_id/roles/:role_id/default` | Set default role for new members |

### ABAC Policies

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/orgs/:org_id/policies` | List ABAC policies |
| `POST` | `/orgs/:org_id/policies` | Create ABAC policy |
| `GET` | `/orgs/:org_id/policies/:policy_id` | Get ABAC policy |
| `PATCH` | `/orgs/:org_id/policies/:policy_id` | Update ABAC policy |
| `DELETE` | `/orgs/:org_id/policies/:policy_id` | Delete ABAC policy |

### Invites

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/orgs/:org_id/invites` | List pending invites |
| `POST` | `/orgs/:org_id/invites` | Create invite |
| `DELETE` | `/orgs/:org_id/invites/:invite_id` | Cancel invite |
| `POST` | `/orgs/:org_id/invites/:invite_id/resend` | Resend invite email |
| `POST` | `/invites/accept` | Accept invite (public) |

### Authorization

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/authorize` | Check if action is allowed |
| `POST` | `/permissions` | Get user's permissions in org |

### Sessions

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/sessions` | List active sessions |
| `DELETE` | `/sessions` | Revoke all sessions (logout everywhere) |

### Credentials

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/user/credentials` | List all user credentials (passwords, passkeys, OAuth) |
| `PATCH` | `/user/credentials/:id` | Update credential (e.g., label) |
| `DELETE` | `/user/credentials/:id` | Unlink credential |

### Wallet (Server-Side Signing)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/wallet/enroll` | Create wallet with Shamir shares |
| `GET` | `/wallet/material` | Get wallet metadata (pubkey, auth method) |
| `GET` | `/wallet/status` | Check wallet enrollment and unlock status |
| `POST` | `/wallet/unlock` | Unlock wallet for session-based signing |
| `POST` | `/wallet/lock` | Explicitly lock wallet |
| `POST` | `/wallet/sign` | Sign transaction (uses cached key if unlocked) |
| `POST` | `/wallet/rotate-user-secret` | Re-encrypt Share A with new credential |
| `GET` | `/wallet/list` | List all wallets (default + per-API-key) |
| `POST` | `/wallet/rotate` | Rotate wallet (replace keypair, irreversible) |

### User Withdrawals

Withdraw SOL/SPL tokens from the user's embedded wallet to an external Solana address. Gated by the `feature_user_withdrawals` system setting (disabled by default). All endpoints use auth-sensitive rate limiting (10 req/60s per IP+path).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/wallet/withdraw/balances` | Get SOL + SPL token balances from wallet |
| `POST` | `/wallet/withdraw/sol` | Withdraw native SOL to external address |
| `POST` | `/wallet/withdraw/spl` | Withdraw SPL token to external address |
| `GET` | `/wallet/withdraw/history` | Get paginated withdrawal history |

### Credits

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/credits/balance` | Get all credit balances |
| `GET` | `/credits/history` | Get credit transaction history |
| `GET` | `/credits/holds` | Get pending credit holds |
| `GET` | `/credits/usage` | Get credit usage analytics |
| `POST` | `/credits/refund-request` | Submit a refund request for an original credit transaction |

### User Lookup (Server-to-Server)

These endpoints require system admin authentication (API key/JWT) and are intended for
server-to-server flows (e.g. payments/webhooks) where only an external identifier is available.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users/by-wallet/:wallet_address` | Resolve `user_id` for a Solana wallet address |
| `GET` | `/users/by-stripe-customer/:stripe_customer_id` | Resolve `user_id` for a Stripe customer |
| `POST` | `/users/by-stripe-customer/:stripe_customer_id/link` | Link a Stripe customer to a user |

### API Keys

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/user/api-key` | Get API key metadata (legacy, single-key) |
| `POST` | `/user/api-key/regenerate` | Regenerate API key (legacy, returns full key once) |
| `GET` | `/user/api-keys` | List all API keys for current user |
| `POST` | `/user/api-keys` | Create new API key with label |
| `DELETE` | `/user/api-keys/:key_id` | Delete a specific API key |
| `POST` | `/auth/validate-api-key` | Validate API key (server-to-server) |

### Audit Logs

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/orgs/:org_id/audit` | Get org audit logs (admin only) |
| `GET` | `/admin/audit` | Get system audit logs (system admin) |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/users` | List all users (system admin) |
| `GET` | `/admin/users/:user_id` | Get user details (system admin) |
| `PATCH` | `/admin/users/:user_id/system-admin` | Set system admin status |
| `GET` | `/admin/orgs` | List all orgs (system admin) |
| `GET` | `/admin/orgs/:org_id` | Get org details (system admin) |
| `GET` | `/admin/settings` | Get all system settings grouped by category |
| `PATCH` | `/admin/settings` | Update system settings |

### System Settings

Runtime-configurable settings stored in the database. Changes take effect immediately without server restart.

**Categories:**
- `privacy` - Privacy period before withdrawal
- `withdrawal` - Withdrawal worker configuration (poll interval, batch size, timeouts)
- `rate_limit` - Rate limiting thresholds (auth, general, credit, window)

```bash
# Get all settings
curl http://localhost:8080/admin/settings \
  -H "Authorization: Bearer <admin_token>"

# Update settings
curl -X PATCH http://localhost:8080/admin/settings \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"settings": [{"key": "privacy_period_secs", "value": "1209600"}]}'
```

### Privacy Cash Admin (Deposits & Withdrawals)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/deposits` | List all deposits (system admin) |
| `GET` | `/admin/deposits/stats` | Get deposit statistics |
| `GET` | `/admin/withdrawals/pending` | List pending withdrawals |
| `POST` | `/admin/withdrawals/:id/process` | Process single withdrawal |
| `POST` | `/admin/withdrawals/process-all` | Process all ready withdrawals |
| `GET` | `/admin/credits/stats` | Get credit spending statistics |
| `GET` | `/admin/credits/refund-requests` | List credit refund requests |
| `POST` | `/admin/credits/refund-requests/:id/process` | Process a credit refund request (ledger reversal) |
| `POST` | `/admin/credits/refund-requests/:id/reject` | Reject a credit refund request |
| `GET` | `/admin/privacy/status` | Get Privacy Cash system status |

#### Get System Status

Returns current Privacy Cash configuration and sidecar connection status:

```bash
curl http://localhost:8080/admin/privacy/status \
  -H "Authorization: Bearer <admin_token>"
```

Response:
```json
{
  "enabled": true,
  "companyWallet": "ABC123...",
  "companyCurrency": "SOL",
  "privacyPeriodSecs": 604800,
  "privacyPeriodDisplay": "7 days",
  "minDepositLamports": 10000000,
  "minDepositSol": 0.01,
  "withdrawalPollIntervalSecs": 3600,
  "withdrawalBatchSize": 10,
  "withdrawalPercentage": 100,
  "partialWithdrawalCount": 0,
  "partialWithdrawalMinLamports": 500000000,
  "partialWithdrawalMinSol": 0.5,
  "sidecarStatus": "connected",
  "sidecarUrl": "http://127.0.0.1:****/",
  "webhookConfigured": true
}
```

#### Process Single Withdrawal

Process a specific withdrawal. Can force early withdrawal (before privacy period ends) with confirmation:

```bash
# Process withdrawal (must be past privacy period)
curl -X POST http://localhost:8080/admin/withdrawals/<session_id>/process \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{}'

# Force early withdrawal (before privacy period)
curl -X POST http://localhost:8080/admin/withdrawals/<session_id>/process \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

Response:
```json
{
  "success": true,
  "sessionId": "...",
  "txSignature": "...",
  "earlyWithdrawal": false
}
```

#### Process All Withdrawals

Process ready withdrawals in a bounded batch (safe for large datasets). Re-run to continue processing:

```bash
curl -X POST "http://localhost:8080/admin/withdrawals/process-all?limit=50" \
  -H "Authorization: Bearer <admin_token>"
```

Response:
```json
{
  "totalProcessed": 5,
  "totalSucceeded": 4,
  "totalFailed": 1,
  "results": [...]
}
```

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/webhook/deposit` | Handle deposit notifications (Helius/Quicknode) |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |

## Usage Examples

### Register and Login

```bash
# Register
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass1!", "name": "John Doe"}'

# Login
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass1!"}'
```

### Organization Management

```bash
# Create organization
curl -X POST http://localhost:8080/orgs \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Team", "slug": "my-team"}'

# List organizations
curl http://localhost:8080/orgs \
  -H "Authorization: Bearer <access_token>"

# Switch active organization
curl -X POST http://localhost:8080/orgs/<org_id>/switch \
  -H "Authorization: Bearer <access_token>"
```

### Invite Team Members

```bash
# Create invite
curl -X POST http://localhost:8080/orgs/<org_id>/invites \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "teammate@example.com", "role": "member"}'

# Accept invite (by invitee)
curl -X POST http://localhost:8080/invites/accept \
  -H "Content-Type: application/json" \
  -d '{"token": "<invite_token>"}'
```

### Check Authorization

```bash
# Check if user can perform action
curl -X POST http://localhost:8080/authorize \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "<org_id>",
    "action": "member:invite",
    "resource_type": "member"
  }'

# Response: {"allowed": true}
```

### MFA Setup

Note: MFA during login is completed via `POST /login/mfa` using the temporary `mfaToken`
returned by `POST /login`. The `/mfa/verify` and `/mfa/recovery` endpoints are intended
for authenticated step-up checks, not initial login.

```bash
# Setup MFA (returns secret and QR code)
curl -X POST http://localhost:8080/mfa/setup \
  -H "Authorization: Bearer <access_token>"

# Enable MFA with TOTP code
curl -X POST http://localhost:8080/mfa/enable \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

### Credits Refunds

Refunds are a ledger reversal implemented as a positive adjustment linked back to the original
credit transaction (`referenceType='refund'`, `referenceId=<originalTransactionId>`).

User request:

```bash
# 1) Look up the original credits transaction
curl http://localhost:8080/credits/history \
  -H "Authorization: Bearer <access_token>"

# 2) Submit a refund request referencing the original transaction
curl -X POST http://localhost:8080/credits/refund-request \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "<credit_transaction_uuid>",
    "amountLamports": 5000000,
    "reason": "Accidental purchase"
  }'
```

Admin review + process:

```bash
# List refund requests
curl "http://localhost:8080/admin/credits/refund-requests?status=pending&limit=50" \
  -H "Authorization: Bearer <admin_token>"

# Process a request (can be partial, but cannot exceed remaining refundable amount)
curl -X POST http://localhost:8080/admin/credits/refund-requests/<request_id>/process \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amountLamports": 2500000,
    "reason": "Approved partial refund"
  }'

# Reject a request
curl -X POST http://localhost:8080/admin/credits/refund-requests/<request_id>/reject \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Not eligible for refund"
  }'
```

## Configuration

All configuration is via environment variables. See `.env.example` for the complete list.

### Required

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8080` | Server port |
| `DATABASE_URL` | - | PostgreSQL connection URL |
| `JWT_RSA_PRIVATE_KEY` | - | RSA private key (PKCS#1 PEM). Required in production for stable JWT signing across restarts/instances |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed origins (comma-separated) |
| `RATE_LIMIT_ENABLED` | `true` | Enable rate limiting |
| `RATE_LIMIT_STORE` | `memory` | Rate limit store backend (`memory` only) |
| `COOKIE_ENABLED` | `true` | Enable cookie-based token storage |
| `EMAIL_ENABLED` | `true` | Enable email/password auth |
| `EMAIL_REQUIRE_VERIFICATION` | `false` | Require email verification (defaults to true in production) |
| `WEBAUTHN_ENABLED` | `false` | Enable WebAuthn/passkey support |
| `WEBAUTHN_RP_ID` | - | WebAuthn relying party ID (e.g. `example.com`) |
| `WEBAUTHN_RP_NAME` | - | WebAuthn relying party name shown to users |
| `WEBAUTHN_RP_ORIGIN` | - | WebAuthn origin (e.g. `https://login.example.com`) |
| `WEBAUTHN_CHALLENGE_TTL` | `300` | WebAuthn challenge TTL in seconds |
| `WEBAUTHN_ALLOW_PLATFORM` | `true` | Allow platform authenticators (built-in passkeys) |
| `WEBAUTHN_ALLOW_CROSS_PLATFORM` | `true` | Allow cross-platform authenticators (security keys) |
| `WEBAUTHN_REQUIRE_UV` | `true` | Require user verification (biometric/PIN) |
| `GOOGLE_CLIENT_ID` | - | Google OAuth client ID |
| `SMTP_HOST` | - | SMTP server for emails |
| `SMTP_USERNAME` | - | SMTP username |
| `SMTP_PASSWORD` | - | SMTP password |
| `EMAIL_FROM` | - | From address for emails |
| `WALLET_ENABLED` | `false` | Enable server-side signing wallet |
| `WALLET_RECOVERY_MODE` | `share_c_only` | Recovery mode: `share_c_only` (app-locked) or `full_seed` (portable) |
| `WALLET_UNLOCK_TTL` | `900` | Session unlock TTL in seconds (default 15 min) |
| `PRIVACY_CASH_ENABLED` | `false` | Enable Privacy Cash deposits |
| `PRIVACY_PERIOD_SECS` | `604800` | Privacy period before withdrawal (default 7 days) |
| `WITHDRAWAL_POLL_INTERVAL_SECS` | `3600` | Auto-withdrawal poll interval (default 1 hour) |
| `WITHDRAWAL_BATCH_SIZE` | `10` | Max withdrawals per poll cycle |
| `WITHDRAWAL_PERCENTAGE` | `100` | % of ready withdrawals per cycle (1-100) |
| `PARTIAL_WITHDRAWAL_COUNT` | `0` | Max partial withdrawals per batch (0=disabled) |
| `PARTIAL_WITHDRAWAL_MIN_LAMPORTS` | `500000000` | Min balance for partial withdrawal (0.5 SOL) |
| `DEPOSIT_WEBHOOK_SECRET` | - | HMAC secret for Helius/Quicknode webhooks |

### SSO (OIDC) Notes

- Issuer URLs must use `https` in production.
- Provider scopes must include `openid` and `email`.

## Library Usage

Embed the auth router in your own Axum application:

```rust
use cedros_login::{router, Config, NoopCallback};
use std::sync::Arc;

#[tokio::main]
async fn main() {
    let config = Config::from_env().expect("Failed to load config");
    let callback = Arc::new(NoopCallback);

    // Create auth router with in-memory storage (for development)
    let auth_router = router(config, callback);

    let app = axum::Router::new()
        .nest("/auth", auth_router)
        .layer(/* your middleware */);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

### Custom Callbacks

Implement the `AuthCallback` trait to hook into auth events:

```rust
use cedros_login::{AuthCallback, AuthCallbackPayload, AppError};
use async_trait::async_trait;
use serde_json::Value;

struct MyCallback;

#[async_trait]
impl AuthCallback for MyCallback {
    async fn on_authenticated(&self, payload: &AuthCallbackPayload) -> Result<Value, AppError> {
        println!("User {} logged in via {:?}", payload.user.id, payload.method);
        // Return custom data to include in auth response
        Ok(serde_json::json!({"subscription": "premium"}))
    }

    async fn on_registered(&self, payload: &AuthCallbackPayload) -> Result<Value, AppError> {
        println!("New user registered: {}", payload.user.id);
        // Provision resources, send welcome email, etc.
        Ok(Value::Null)
    }

    async fn on_logout(&self, user_id: &str) -> Result<(), AppError> {
        println!("User {} logged out", user_id);
        Ok(())
    }
}
```

### Custom Email Service

Implement the `EmailService` trait for your email provider:

```rust
use cedros_login::{EmailService, VerificationEmailData, PasswordResetEmailData};
use async_trait::async_trait;

struct SendGridEmailService { /* ... */ }

#[async_trait]
impl EmailService for SendGridEmailService {
    async fn send_verification_email(
        &self,
        to: &str,
        data: &VerificationEmailData,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Send via SendGrid, Postmark, etc.
        Ok(())
    }

    // Implement other email methods...
}
```

## Embedded Wallet (Server-Side Signing)

The server includes an optional embedded Ed25519 wallet using 2-of-3 Shamir Secret Sharing for key management. The server performs all signing operations—users never see the raw private key.

### Architecture

| Share | Storage | Protection | Purpose |
|-------|---------|------------|---------|
| Share A | Server (encrypted) | User credential (password/PIN/passkey) | Decrypted JIT for signing |
| Share B | Server (plaintext) | SSS math protects it | Combined with A for signing |
| Share C | User backup | 24-word recovery phrase | Disaster recovery |

### Auth Methods for Share A

- **Email/password users**: Reuse their login password
- **OAuth users** (Google/Apple): Create a 6+ digit PIN
- **Passkey users**: Use passkey PRF extension

### Session-Based Unlock

Instead of requiring credentials for every sign operation, users unlock their wallet once per session:

1. `POST /wallet/unlock` with credential → server caches derived key
2. Subsequent `POST /wallet/sign` requests use cached key (no credential needed)
3. Key auto-expires after TTL (default 15 min) or on explicit `POST /wallet/lock`

### Recovery Modes

Configure via `WALLET_RECOVERY_MODE`:

| Mode | Recovery Phrase | Portability |
|------|-----------------|-------------|
| `share_c_only` (default) | Share C only | Can recover within app only |
| `full_seed` | Full 32-byte seed | Can use wallet elsewhere |

### Security Model

- Server never has the full seed at rest (only JIT during signing)
- Server compromise → encrypted Share A + plaintext Share B → cannot sign without user credential
- Device compromise → nothing (shares stored server-side)
- Keys are zeroized from memory immediately after signing

## Privacy Cash (Deposits & Withdrawals)

Optional privacy-preserving deposit system using the Privacy Cash protocol. Users deposit SOL/SPL tokens to their embedded wallet, funds are held for a configurable privacy period, then automatically withdrawn to the company wallet.

### Deposit Types & Recovery Modes

**Deposits work in all wallet recovery modes**, but private (privacy-preserving) deposits require `WALLET_RECOVERY_MODE=none`:

| Recovery Mode | Private Deposits | Public Deposits | Config Value |
|--------------|-----------------|-----------------|--------------|
| None | ✅ Available | ✅ Available | `none` |
| Share C Only | ❌ Blocked | ✅ Available | `share_c_only` |
| Full Seed | ❌ Blocked | ✅ Available | `full_seed` |

**Why private deposits require no-recovery mode:** In recovery modes where users can export their private key, they could front-run withdrawal transactions by extracting their key and signing before the Privacy Cash relayer processes the batched withdrawal.

The `/deposit/config` endpoint returns `privateDepositsEnabled: false` when recovery mode is enabled, allowing the UI to automatically route users to public deposit methods.

### How It Works

1. **Deposit**: User sends SOL/USDC/USDT to their embedded wallet address
2. **Privacy Period**: Funds held in Privacy Cash account (default 7 days)
3. **Auto-Withdrawal**: Background worker processes ready withdrawals to company wallet
4. **Credit**: User's account credited with deposited amount

### Timing Analysis Protection

To prevent correlation of deposits and withdrawals, the system supports two layers of timing obfuscation:

#### Withdrawal Percentage

Spread withdrawals over multiple cycles by only processing a percentage per batch:

```bash
# Process only 20% of ready withdrawals each hour
WITHDRAWAL_PERCENTAGE=20
WITHDRAWAL_POLL_INTERVAL_SECS=3600
```

With 10 ready withdrawals and 20% setting, only ~2 withdrawals per hour (randomly selected).

#### Partial Withdrawals

Additionally, some withdrawals can be split across multiple cycles:

```bash
# Up to 3 partial withdrawals per batch (30-70% of balance each)
PARTIAL_WITHDRAWAL_COUNT=3
PARTIAL_WITHDRAWAL_MIN_LAMPORTS=500000000  # 0.5 SOL minimum for partials
```

Sessions with balance ≥ 0.5 SOL may have a random portion (30-70%) withdrawn, leaving the remainder for future cycles. This adds variance to both timing AND amounts.

#### Example Privacy Configuration

For maximum timing obfuscation:

```bash
PRIVACY_PERIOD_SECS=604800           # 7 day minimum hold
WITHDRAWAL_POLL_INTERVAL_SECS=3600   # Check every hour
WITHDRAWAL_BATCH_SIZE=20             # Claim up to 20 at a time
WITHDRAWAL_PERCENTAGE=20             # Process ~20% per cycle
PARTIAL_WITHDRAWAL_COUNT=3           # Up to 3 partial withdrawals
PARTIAL_WITHDRAWAL_MIN_LAMPORTS=500000000  # 0.5 SOL min for partials
```

This configuration means:
- Deposits held for at least 7 days
- Every hour, ~20% of ready sessions processed
- Up to 3 of those may be partial (30-70%)
- Average time from "ready" to "fully withdrawn" spreads across multiple cycles

### Fee Considerations

Privacy Cash charges ~0.006 SOL per withdrawal. The `PARTIAL_WITHDRAWAL_MIN_LAMPORTS` setting (default 0.5 SOL) ensures partial withdrawals only occur on balances large enough to avoid excessive fee overhead (~1.2% at 0.5 SOL).

## Database Schema

The server uses 10 PostgreSQL tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts with profile info |
| `sessions` | Active login sessions |
| `verification_tokens` | Email verification, password reset, instant link tokens |
| `organizations` | Workspaces/teams |
| `memberships` | User-org relationships with roles |
| `invites` | Pending org invitations |
| `custom_roles` | Org-specific custom roles |
| `abac_policies` | Attribute-based access control rules |
| `audit_logs` | Security and activity audit trail |
| `outbox_events` | Reliable async message delivery queue |
| `login_attempts` | Failed login tracking for lockout |

### Run Migrations

```bash
# Install sqlx-cli
cargo install sqlx-cli

# Run migrations
sqlx migrate run
```

## Role & Permission System

### Built-in Roles

| Role | Permissions |
|------|-------------|
| `owner` | All permissions, can delete org |
| `admin` | Manage members, invites, roles, settings |
| `member` | Standard access, create content |
| `viewer` | Read-only access |

### Custom Roles

Create org-specific roles with custom permissions:

```bash
curl -X POST http://localhost:8080/orgs/<org_id>/roles \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Moderator",
    "description": "Can manage content but not members",
    "permissions": ["content:read", "content:write", "content:delete"]
  }'
```

### ABAC Policies

Define fine-grained attribute-based rules:

```bash
curl -X POST http://localhost:8080/orgs/<org_id>/policies \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Owners can delete",
    "description": "Only resource owners can delete",
    "effect": "allow",
    "actions": ["delete"],
    "resource_type": "document",
    "conditions": {"owner_id": {"equals_subject": "user_id"}}
  }'
```

## Password Requirements

- Minimum 10 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (@$!%*?&#^())

## Rate Limits

Default limits (configurable):

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Auth endpoints | 10 req | 60 sec |
| General endpoints | 60 req | 60 sec |

Rate-limited responses return `429 Too Many Requests` with headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `Retry-After`

Note: Rate limiting is enforced in-memory per server instance. `RATE_LIMIT_STORE`
accepts only `memory` today. In multi-instance deployments, limits are not shared
across nodes. For distributed rate limiting, use a shared store (e.g., Redis) or
front the service with a gateway that enforces global limits.

## Testing

```bash
# Run all tests (515+ tests)
cargo test

# Run with logging
RUST_LOG=debug cargo test -- --nocapture

# Run specific test
cargo test test_name
```

## License

MIT
