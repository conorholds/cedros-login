# Cedros Host Integration Requirements

`<version>` denotes the release version in `cedros-extension.manifest.json`.
Use that exact version in package metadata, archive names, and deployment checks.

This guide covers host integration requirements for platform API `1`.
Routes, jobs, database access, providers, analytics, Site Brain records, and AI
capabilities are backed by the packaged
`cedros-extension.server.wasm` component and declared host imports. The
machine-readable source of truth is
`docs/cedros-host-coordination-handoff-map.json`.

## Required Handoff Table

| Item | Manifest ID | Type | Runtime package | Host hook required | Status | Owner | Blocking? | Launch gate |
|---|---|---|---|---|---|---|---:|---|
| atomic identity and abuse-control operations | `cedros-login:registration-db` | host capability set | `cedros-login@<version>` | Cedros Data `0.1.82+` authenticated registry for `cedros-data:database-concurrency-v2`, `cedros-data:token-email-evidence-v1`, `cedros-data:identity-atomic-v1`, `cedros-data:session-atomic-v1`, `cedros-data:signup-limit-atomic-v1`, and `cedros-data:abuse-budget-consume-v1`, including `identity.outbox.enqueue-token-email`, `registration.signup-limit.status`, `registration.account.create`, `registration.account.complete`, and `/runtime/abuse-budget/consume-v1` | `host-hook-requested` | Cedros Data + Cedros Login | yes | staging and production |
| invite-gate pending handoff | `cedros-login:invite-gate-handoff` | CRM source event | `cedros-login@<version>` | durable `cedros_login` / `invite_gate.pending` receipt binding | `host-hook-requested` | Cedros CRM + Cedros Login | only when invite gate is enabled | early-access registration |
| login screen | `cedros-login:login-screen` | native screen | `@cedros/login-react-native@<version>` | native screen loader | `unsupported` | Cedros mobile | yes | mobile production |
| provider | `cedros-login:provider` | native provider | `@cedros/login-react-native@<version>` | native provider loader/context | `unsupported` | Cedros mobile | yes | mobile production |

## Runtime-Owned Surfaces

The Wasm package owns the following surfaces, validated through the manifest,
route registry, and package archive:

- Concrete server route IDs under `surfaces.server.routes[]`, including
  relying-party JWKS, introspection, user lookup, and user count contracts.
- Cleanup and outbox automation jobs under `surfaces.server.jobs[]`.
- Database operations through declared `databaseAccess[]` ids and Cedros host
  database imports.
- Email/storage provider calls through declared `providerAccess[]` ids.
- Analytics events and Site Brain records through Cedros telemetry host imports.
- AI capabilities mapped to concrete route ids.

The registration database row remains host-coordinated because the public kit
defines the required operations, while the installed host must still prove its
full six-capability registry, fail-closed abuse-budget behavior, and all 50 live
transaction vectors. The CRM row is optional
unless early-access registration is enabled; a truthful durable receipt is then
required before Login reports the handoff as accepted.

These still fail closed at runtime if the host denies an explicitly declared
capability, provider, database operation, or telemetry import.

## Native Handoff

Generic native loading remains unavailable in the current Cedros host. Keep
native Login hidden or unavailable until Cedros mobile publishes or binds:

- package import and version resolution for `@cedros/login-react-native`;
- screen registration for `cedros-login:login-screen`;
- provider context registration for `cedros-login:provider`;
- simulator/device smoke tests for login, logout, disabled-provider, and missing
  host-context states.

## Host Ticket Template

```md
Title: Bind cedros-login native <screen/provider>

Extension:
- id: cedros-login
- version: <version>
- package/artifact: @cedros/login-react-native@<version>
- manifest id:
- runtime export: @cedros/login-react-native/register

Requested host binding:
- type: native screen or native provider
- native target:
- auth and permission requirement:
- required host services/providers:

Safety:
- unavailable-state behavior:
- secret/token redaction:
- rollback/disable behavior:

Verification:
- local smoke command: node scripts/validate-cedros-extension-shell.mjs
- staging device or simulator run:
- production launch gate:
```

## Acceptance Checks

- Every host-coordinated manifest id is present in
  `docs/cedros-host-coordination-handoff-map.json`.
- `scripts/validate-cedros-extension-shell.mjs` checks handoff coverage and
  accepted status values.
- Server route/job/provider/database/analytics/Site Brain/AI execution remains
  covered by the Wasm package, not by native host handoff rows.
