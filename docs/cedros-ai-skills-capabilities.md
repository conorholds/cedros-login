# Cedros AI Skills And Capabilities

Cedros Login publishes a server-owned AI surface with three skill discovery
entries and four executable capability declarations. Capabilities are backed by
concrete Wasm route ids.

## Skills

| Skill | Visibility | Status |
|---|---|---|
| `cedros-login:auth-and-onboarding` | public | discovery metadata |
| `cedros-login:account-security` | authenticated | discovery metadata |
| `cedros-login:identity-admin` | admin | discovery metadata |

## Capability Route Mapping

| Capability ID | Endpoint path | Server route ID | Status |
|---|---|---|---|
| `cedros-login:send-verification-email` | `/send-verification` | `cedros-login:send-verification` | `wasm-ready` |
| `cedros-login:verify-email-token` | `/verify-email` | `cedros-login:verify-email` | `wasm-ready` |
| `cedros-login:logout-all-sessions` | `/logout-all` | `cedros-login:logout-all` | `wasm-ready` |
| `cedros-login:disable-mfa` | `/mfa/disable` | `cedros-login:disable-mfa` | `wasm-ready` |

The send-verification capability schema intentionally avoids the JSON Schema
`format` keyword. Email validation happens in the route handler.

## Safety Plan

Side-effecting capabilities require route-level validation, permission checks,
idempotency where applicable, redacted logs, and Site Brain failure records.
Email sends require host provider rate limits and duplicate-send guards.
Logout-all and disable-MFA require explicit user intent; disable-MFA also
requires downstream reauthentication/confirmation.

## Acceptance Checks

- Skill and capability ids are namespaced and stable.
- `surfaces.ai.packageRef` is `server`.
- Capability endpoint methods and paths avoid reserved host paths.
- Each capability maps to a manifest-declared concrete server route.
- Input/output schemas stay within the safe object-schema subset.
