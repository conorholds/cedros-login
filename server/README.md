# Cedros Login Server

The `cedros-login` crate is a standalone authentication and account service and
an embeddable Axum router. It owns users, sessions, organizations, credentials,
API keys, runtime settings, audit records, and relying-party identity APIs.

This crate is distinct from the packaged Cedros backend in `../server-wasm/`.
The standalone server owns its storage and provider adapters; the Wasm backend
uses capabilities supplied by a Cedros host.

## Features

- Email/password, Google, Apple, Solana, instant-link, OIDC SSO, and
  WebAuthn/passkey authentication.
- TOTP MFA, recovery codes, credential linking, session rotation, password
  recovery, and account deletion.
- Organizations, memberships, invites, custom roles, ABAC policies, and audit
  logs.
- API keys, scoped relying parties, public JWKS, Prometheus metrics, and
  agent-oriented discovery endpoints.
- PostgreSQL persistence for production and in-memory storage for development
  and tests.
- Outbox-backed transactional email through Postmark in standalone mode.

## Quick Start

Prerequisites:

- Rust `1.97.0` (selected by the repository `rust-toolchain.toml`).
- PostgreSQL when `DATABASE_URL` is set; the local Compose service uses 16.
- OpenSSL for generating local secrets, and the SQLx CLI for database setup.

Run with in-memory storage:

```bash
JWT_SECRET="$(openssl rand -hex 32)" \
HOST=127.0.0.1 \
CORS_ORIGINS=http://localhost:57164 \
GOOGLE_ENABLED=false \
APPLE_ENABLED=false \
WEBAUTHN_ENABLED=false \
DATABASE_URL= \
cargo run --manifest-path server/Cargo.toml
```

Set `CORS_ORIGINS` to the origin of your consuming web application. Restarting
this in-memory example discards accounts and sessions and generates a new
signing secret.

The server listens on `http://localhost:57165` by default. When run from
`server/`, dotenv loads `server/.env`; remove or clear `DATABASE_URL` there to
select in-memory storage.

Run with the repository's development PostgreSQL service:

```bash
cp server/.env.example server/.env
# Replace the example JWT secret and review the remaining settings.
# Compose evaluates the optional server profile's required variables too.
JWT_SECRET="$(openssl rand -hex 32)" SETUP_TOKEN="$(openssl rand -hex 32)" \
  docker compose up -d postgres
cd server
sqlx database create
sqlx migrate run
cargo run
```

The compose service binds PostgreSQL to `127.0.0.1:15432`. The example
`DATABASE_URL` already targets that port. Disable Google, Apple, and WebAuthn
in `server/.env` until their real provider settings are configured.

## API

Most endpoints are mounted below `AUTH_BASE_PATH`, which defaults to `/auth`.
Health, readiness, metrics, first-run setup, and JWKS have root paths. Important
groups include:

| Group | Representative paths |
| --- | --- |
| Health and setup | `/health`, `/ready`, `/metrics`, `/setup/status`, `/setup/admin` |
| Authentication | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` |
| Federated and passwordless | `/auth/google`, `/auth/apple`, `/auth/solana`, `/auth/sso/start`, `/auth/instant-link` |
| Account security | `/auth/mfa/*`, `/auth/webauthn/*`, `/auth/credentials`, `/auth/sessions` |
| Profile and identity | `/auth/user`, `/auth/me`, `/auth/account/*`, `/auth/user/api-keys` |
| Organizations | `/auth/orgs/*`, `/auth/invites/accept`, `/auth/authorize`, `/auth/permissions` |
| Administration | `/auth/admin/users`, `/auth/admin/orgs`, `/auth/admin/settings`, `/auth/admin/audit` |
| Discovery | `/auth/features`, `/auth/discovery`, `/auth/openapi.json`, `/auth/llms.txt`, `/auth/skill.json` |

The checked-in OpenAPI document at `src/openapi.json` is the complete HTTP
reference and is served at `GET /auth/openapi.json` with the default base path.
Use the live document when `AUTH_BASE_PATH` is customized.

## Configuration

Copy `.env.example` for a documented development configuration. The complete
static and runtime setting reference is in
[`docs/settings-reference.md`](docs/settings-reference.md).

Common static variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | required | Local signing/encryption secret; minimum 32 characters |
| `HOST` / `PORT` | `0.0.0.0` / `57165` | Listener address |
| `AUTH_BASE_PATH` | `/auth` | API mount path |
| `SETUP_TOKEN` | required for first setup | At least 32 bytes; send as `x-cedros-setup-token` to `POST /setup/admin` |
| `DATABASE_URL` | unset | PostgreSQL connection; unset selects in-memory storage |
| `CORS_ORIGINS` | empty | Comma-separated browser origins |
| `COOKIE_ENABLED` | `true` | HTTP-only access and refresh cookies |
| `RATE_LIMIT_STORE` | `memory` | `memory` or `redis`; `REDIS_URL` is required for Redis |
| `GOOGLE_CLIENT_ID` | unset | Google ID-token audience |
| `APPLE_CLIENT_ID` | unset | Primary Apple client ID |
| `POSTMARK_API_TOKEN` / `POSTMARK_FROM_EMAIL` | unset | Standalone email delivery |
| `TOTP_ENCRYPTION_SECRET` | falls back to `JWT_SECRET` outside production | TOTP secret encryption |

Production-like configuration validation additionally requires secure cookies,
explicit CORS origins, an RSA JWT private key, a distinct TOTP encryption
secret, HTTPS SSO callback configuration where applicable, and a real email
provider. See [the security guide](../SECURITY.md).

## Embedding

For development or tests, create an in-memory router:

```rust
use cedros_login::{router, Config, NoopCallback};
use std::sync::Arc;

let config = Config::from_env()?;
let auth_router = router(config, Arc::new(NoopCallback));
let app = axum::Router::new().nest("/auth", auth_router);
# Ok::<(), Box<dyn std::error::Error>>(())
```

Production embedders should construct `Storage` and use
`router_with_storage_and_email_delivery`. Pass
`EmailDeliveryCapability::Delivering` only when a real provider is configured
and an active worker drains the same storage's outbox; otherwise readiness must
remain unavailable. The Rust docs on those functions contain the exact
signatures.

Custom storage implementations must preserve the repository interfaces' atomic
token, canonical-email, MFA, session, and organization invariants. Prefer the
provided storage constructors over manual `Storage` struct literals.

## Database Lifecycle

Migrations under `migrations/` are forward-only:

```bash
cd server
sqlx database create
sqlx migrate run
```

Use a database restore or a reviewed follow-up migration to reverse schema
changes. Do not edit an already-applied migration.

## Verification

From the repository root:

```bash
cargo fmt --manifest-path server/Cargo.toml -- --check
cargo check --manifest-path server/Cargo.toml --locked
cargo test --manifest-path server/Cargo.toml --lib --locked
cargo clippy --manifest-path server/Cargo.toml --locked -- -D warnings
```

PostgreSQL-bound tests use `TEST_DATABASE_URL`. Set
`CEDROS_REQUIRE_POSTGRES_TESTS=1` when a missing or unusable test database must
fail instead of skipping those cases.

## License

This project is source-available under PILL-1.0.0. Redistribution, resale, and
offering the software as a service require separate permission. See
[LICENSE](LICENSE).
