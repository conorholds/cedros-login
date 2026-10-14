# Repository Map

Cedros Login contains a standalone auth service, a Cedros Wasm backend, web and
native client packages, shared contracts, and extension packaging metadata.

## Top-Level Layout

| Path | Purpose | Primary source of truth |
| --- | --- | --- |
| `server/` | Standalone Rust/Axum server and `cedros-login` crate | `server/src/router.rs`, `server/src/lib.rs` |
| `server-wasm/` | Cedros `wasm32-wasip2` backend | `server-wasm/src/lib.rs`, `server-wasm/src/routes/` |
| `ui/` | `@cedros/login-react` web/admin package | `ui/src/index.ts`, package `exports` |
| `react-native/` | `@cedros/login-react-native` package | `react-native/src/index.ts`, package `exports` |
| `contracts/` | Shared schemas, host contracts, and fixtures | schema and contract JSON files |
| `docs/` | Durable integration guidance and validator-owned maps | linked guide or matching validation script |
| `scripts/` | Generation, validation, packaging, security, and publish tools | executable script behavior |
| `cedros-extension.manifest.json` | Generated Cedros manifest | `server/src/extension_manifest.rs` and related modules |
| `cedros-extension.bootstrap.json` | Generated bootstrap wrapper | generated manifest source |

## Standalone Server

- Binary entry: `server/src/main.rs`.
- Library composition: `server/src/lib.rs`.
- Router and middleware: `server/src/router.rs` and `server/src/router/`.
- HTTP handlers: `server/src/handlers/`.
- Domain rules and services: `server/src/domain/` and `server/src/services/`.
- Persistence boundaries: `server/src/repositories/` and `server/src/storage/`.
- PostgreSQL implementations: `server/src/repositories/postgres/`.
- Forward-only migrations: `server/migrations/`.
- Static config: `server/src/config/` and `server/.env.example`.
- Runtime settings: `server/docs/settings-reference.md`.
- OpenAPI source: `server/src/openapi.json`, served by the discovery handler.

## Wasm Backend

- Component entry and job exports: `server-wasm/src/lib.rs`.
- Route registry, dispatch, and handlers: `server-wasm/src/routes/`.
- Host-mediated data adapters: `server-wasm/src/data/`.
- Host imports for database, settings, secrets, HTTP, providers, logging, and
  telemetry: `server-wasm/src/host/`.
- Domain rules and service adapters: `server-wasm/src/domain/` and
  `server-wasm/src/services/`.
- WIT contract: `server-wasm/wit/`.

The standalone and Wasm backends share product contracts but have separate
storage and runtime composition. Do not assume a standalone environment setting
configures an installed extension.

## React Package

- Public and split entrypoints: `ui/src/index.ts`, `ui/src/*-only.ts`, and
  `ui/package.json`.
- Provider and session lifecycle: `ui/src/context/` and `ui/src/hooks/`.
- API client and token handling: `ui/src/utils/`.
- Auth/account UI: `ui/src/components/`.
- Admin registration and modules: `ui/src/admin/`.
- Web registration and content contributions: `ui/src/web/` and
  `ui/src/web/register.ts`.
- Extension manifest mirror: `ui/src/extension/`.
- Tests: colocated `*.test.ts(x)` files and `ui/src/test/`.

## React Native Package

- Public exports and registration: `react-native/src/index.ts` and
  `react-native/src/register.ts`.
- Provider and hooks: `react-native/src/context/` and `react-native/src/hooks/`.
- Screens and controls: `react-native/src/components/`.
- API and token services: `react-native/src/services/` and
  `react-native/src/utils/`.
- Platform adapters: `react-native/src/platform/`.
- Extension manifest mirror: `react-native/src/extension/`.
- Tests: colocated `*.test.ts(x)` files.

## Generated and Machine-Readable Files

Regenerate the root manifest, bootstrap, and package copies with
`node scripts/generate-cedros-extension-shell.mjs`; do not hand-edit them.
Machine-readable `docs/cedros-*-map.json` files are checked-in validation inputs
and release metadata. Update them with the corresponding source and run
`make cedros-validate`.

Build output is ignored and should not be reviewed as source: `dist/`,
`target/`, package `dist/` directories, `node_modules/`, coverage output,
`.tsbuildinfo`, local environment files, and `.context/` scratch files.
