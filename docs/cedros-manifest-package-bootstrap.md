# Cedros Manifest, Package Family, And Bootstrap

`<version>` denotes the release version in `cedros-extension.manifest.json`.
Use that exact version in package metadata, archive names, and deployment checks.

This document describes the canonical generated shell for `cedros-login`.
`cedros-extension.manifest.json` and `cedros-extension.bootstrap.json` are
generated from the Rust registration export through
`scripts/generate-cedros-extension-shell.mjs`. Validation requires the bootstrap
root `{ "manifest": ... }` to deep-equal the root manifest.

## Package Family

| Package ref | Package | Version | Required | Runtime path |
|---|---|---:|---:|---|
| `server` | `cedros-login` | `<version>` | yes | Rust manifest export plus packaged Wasm backend |
| `react` | `@cedros/login-react` | `<version>` | yes | React admin/web package exports |
| `reactNative` | `@cedros/login-react-native` | `<version>` | yes | React Native bootstrap export |

The manifest and every package-family member must use the same version.
Any version bump must update the package metadata and regenerate every manifest
copy before validation and packaging.

## Registration Entrypoints

| Surface | Manifest entrypoint | Package export |
|---|---|---|
| server | `cedros_login::register_extension_family` | Rust crate export |
| admin | `@cedros/login-react/admin/register` | `./admin/register` |
| web | `@cedros/login-react/web/register` | `./web/register` |
| native | `@cedros/login-react-native/register` | `./register` |

## Compatibility And Dependencies

| Declaration | Value |
|---|---|
| `schemaVersion` | `1` |
| `platformApiVersion` | `"1"` |
| `compatibility.platformApiVersion` | `"1"` |
| `compatibility.minCedrosDataVersion` | `"0.1.82"` |
| `compatibility.witChecksum` | `2bb16879743cfd2748b7deefefcb82204c16b55a1c1a70385f4e9707a83d48f9` |
| dependency services | none; email/storage setup is declared through `providerAccess[]` |
| required host capabilities | `cedros-data:database-concurrency-v2`, `cedros-data:token-email-evidence-v1`, `cedros-data:identity-atomic-v1`, `cedros-data:session-atomic-v1`, `cedros-data:signup-limit-atomic-v1`, `cedros-data:abuse-budget-consume-v1` |
| optional extension dependency | `cedros-pay >= 3.0.2` for buyer-authenticated subscription selection; disabled by default, configured status failures keep the chooser gate closed and deny plan-limited invites. |
| root capabilities | `cedros-login:user-context`, `cedros-login:identity-profile`, `cedros-login:session-manage`, `cedros-login:admin-auth`, `cedros-login:site-brain-records`, `cedros-login:auth-response`, `cedros-login:invite-discount` |
| official contracts | Login user context, session management, admin authorization, JWKS, session introspection, user directory, and auth-response contracts. `cedros-login:auth-response` pins the auth-completing response shape (cedros_access/cedros_refresh cookies, logout Max-Age=0 expiry, user body fields, isNewUser, per-login method); its presence in a manifest version is the host's min-version gate, and breaking changes require a new capability id. |
| supply chain | evidence omitted; verification status is `not-provided` |

## Contribution Metadata

| Contribution | IDs |
|---|---|
| Admin module | `cedros-login:admin` |
| Admin sections | `cedros-login:login` |
| Dashboard card | `cedros-login:identity-health-card` |
| Onboarding | `cedros-login:setup-login` |
| Page seeds | login, register, password recovery, reset password, email verification, instant-link verification, invite acceptance, public profile |
| Visual builder | auth copy, auth form, login button, account workspace blocks plus page templates |
| Forms/docs | `cedros-login:account-support-form`, setup/security docs starters |
| Analytics | authenticated, registered, logout, registration-created, user-login |
| Site Brain | setup, provider, job, AI, and security records with declared write scopes |
| Providers | email send; storage put/get/delete |
| Database | identity, organization, and settings/audit content models and operations |
| AI | three skills and four executable capabilities mapped to route ids |
| Server | Route IDs and jobs declared in `surfaces.server` |
| Native | `cedros-login:login-screen`, `cedros-login:provider` |

## Runtime Bootstrap Contributions

| Stack | Runtime contribution |
|---|---|
| Rust server | Canonical manifest export and release `wasm32-wasip2` server component. |
| React admin | Compiled Login settings module, team-directory service, and identity-health dashboard card for a host-owned shell. |
| React web | Manifest, content block definitions, and content template definitions. |
| React Native | Manifest bootstrap; executable native loading remains host-coordinated. |

## ZIP Archive Plan

Archive script and validation:

- `node scripts/package-cedros-extension.mjs`
- `node scripts/validate-cedros-package-archive.mjs`
- `make cedros-package`

Archive root entries include:

- `cedros-extension.manifest.json`
- `cedros-extension.bootstrap.json`
- `cedros-extension.server.wasm`
- `workspace/README.md`
- compiled React admin runtime under `workspace/react/dist/**`
- package manifests and registration entrypoints for server, React, and React Native
- current handoff/readiness/package maps under `workspace/docs`

The generated local intake ZIP, source review ZIP, runtime tarball, and release
packet are written to `dist/` and ignored by git. The source review ZIP is
separate from local package intake and does not make uploaded source executable.

## Host Integration Notes

| Item | Classification | Why |
|---|---|---|
| Server routes/jobs | Wasm-backed runtime | Manifest ids map to the packaged component route/job exports. |
| Database/settings/secrets/providers | Declared host imports | Runtime calls use Cedros host APIs and fail closed on missing grants. |
| Analytics/Site Brain | Wasm telemetry | Events/records are emitted through Cedros telemetry imports with redacted payloads. |
| Native loader | host-coordinated | Native ids remain unavailable until a mobile host loader is bound. |
| Payments/wallet/compliance/affiliates | out of scope | No published applicable contract is consumed by this auth extension. |

## Acceptance Checks

- `node scripts/generate-cedros-extension-shell.mjs`
- `make cedros-validate`
- `make cedros-package`
- `cargo test --manifest-path server/Cargo.toml --locked extension_manifest -- --nocapture`
- `cargo test --manifest-path server-wasm/Cargo.toml --locked -- --nocapture`
- `cd ui && npm run typecheck`
- `cd ui && npm test -- --run src/extension/register.test.ts src/admin/dashboard/LoginHealthDashboardCard.test.tsx`
