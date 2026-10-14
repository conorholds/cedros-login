# Cedros Server And Native Coordination

The Cedros Login server runtime is a Cedros Wasm backend packaged as
`cedros-extension.server.wasm`. Native screen/provider activation is still
host-coordinated. The canonical detail is
`docs/cedros-server-native-host-coordination-map.json`.

## Server Route Contracts

`surfaces.server.routes[]` declares the concrete route IDs. Each id maps to one
`method + path` pair in `server-wasm/src/routes/registry.rs` and the mirrored
manifest list in `server/src/extension_server_routes.rs`.

Route groups include:

- public discovery and JWKS endpoints, including `/v1/.well-known/jwks.json`;
- registration, login, logout, refresh, session, and account management;
- organization, member, invite, role, API key, MFA, WebAuthn, SSO, and setup
  workflows, including host-admin first-admin hash import;
- admin users, settings, audit, health, metrics, support, and recovery;
- AI discovery/capability endpoints;
- relying-party introspection and user-directory contracts.

Auth requirements are encoded in the manifest/route map as public,
authenticated, admin, or service. Write routes validate inputs, use bounded JSON
payloads, and route persistence/provider work through declared host capabilities.

## Job Contracts

| Job ID | Executor | Runtime status | Notes |
|---|---|---|---|
| `cedros-login:cleanup-expired-auth-data` | Wasm job export | `wasm-ready` | Removes expired transient auth data and emits redacted job records. |
| `cedros-login:outbox-dispatch` | Wasm job export | `wasm-ready` | Dispatches queued notification/email work through declared providers. |
| `cedros-login:oauth-connection-cleanup` | Wasm job export | `wasm-ready` | Rechecks OAuth authority and delegates backing-key cleanup to the durable host worker. |

Jobs keep metadata safe JSON, use idempotent run semantics, and surface failures
through telemetry/Site Brain records.

## Data, Settings, Providers, And Events

The server component uses Cedros host imports for database, settings, secrets,
providers, logging, telemetry, routes, and jobs. The manifest explicitly declares
database ids, provider ids/scopes, settings schemas, secret refs, analytics
events, and Site Brain write scopes. Missing grants fail closed.

## Native Fallback

| Native ID | Kind | Package export | Fallback | Owner-visible behavior |
|---|---|---|---|---|
| `cedros-login:login-screen` | screen | `registerCedrosLoginNativeSurface` | hide entry point or show unavailable state | unavailable until Cedros mobile loader is bound |
| `cedros-login:provider` | provider | `registerCedrosLoginNativeSurface` | bootstrap importable; provider unavailable | host mobile app must bind provider context before native auth works |

Generic native loading is not self-serve in platform API `1`. Production native
launch is blocked until Cedros mobile provides loader details and staging
device/simulator verification.

## Acceptance Checks

- `server-wasm` route registry has unique ids and unique method/path pairs.
- Manifest route ids match the server registry list.
- Route/job provider and database references point only to declared manifest ids.
- The native loader, installed-host database capability evidence, and the
  conditional invite-gate CRM receipt are the remaining host-coordinated rows.
