# Cedros Package Family Shape

`<version>` denotes the release version in `cedros-extension.manifest.json`.
Use that exact version in package metadata, archive names, and deployment checks.

Cedros Login keeps the existing repository layout: Rust code in `server`, React
admin/web code in `ui`, React Native code in `react-native`, and the Wasm
backend in `server-wasm`. The canonical manifest declares the package family;
the local intake ZIP carries the compiled React admin runtime and the compiled
server Wasm component.

## Package Members

| Package ref | Local path | Package name | Version | Registration entrypoint | Build/smoke command |
|---|---|---|---:|---|---|
| `server` | `server` | `cedros-login` | `<version>` | `cedros_login::register_extension_family` | `cargo test --manifest-path server/Cargo.toml --locked extension_manifest -- --nocapture` |
| `react` | `ui` | `@cedros/login-react` | `<version>` | `@cedros/login-react/admin/register`, `@cedros/login-react/web/register` | `cd ui && npm run build && npm run verify:exports` |
| `reactNative` | `react-native` | `@cedros/login-react-native` | `<version>` | `@cedros/login-react-native/register` | generated manifest parity via `make cedros-validate` |

The manifest and all three package members use the same version, as required
by the current package-family contract. `docs/cedros-package-family-shape-map.json`
records and validates the alignment.

## Runtime Artifacts

| Artifact | Source | Included in intake ZIP | Notes |
|---|---|---:|---|
| React admin runtime | `ui/dist/admin/register.js` and dependent chunks | yes | Cedros Data loads `./admin/register` directly from the ZIP. |
| Server Wasm backend | `cedros-extension.server.wasm` | yes | Copied from the locked `wasm32-wasip2` build and packaged at the canonical root path. |
| Source review ZIP | source entry plan from server, UI, RN, server-wasm, docs | no | Separate evidence artifact for human/source review. |
| Runtime tarball | `dist/cedros-login-react-<version>.tgz` | no | Optional React package evidence; not the intake artifact. |

## Export Shape

| Package | Required export | Existing file | Status |
|---|---|---|---|
| Rust server | `cedros_login::register_extension_family` | `server/src/extension_manifest.rs` | implemented |
| React admin | `./admin/register` | `ui/src/admin/register.ts` | implemented and compiled |
| React web | `./web/register` | `ui/src/web/register.ts` | implemented |
| React Native | `./register` | `react-native/src/register.ts` | implemented |

## Local Smoke Loop

1. `node scripts/generate-cedros-extension-shell.mjs`
2. `make cedros-validate`
3. `cargo test --manifest-path server-wasm/Cargo.toml --locked -- --nocapture`
4. `cargo build --manifest-path server-wasm/Cargo.toml --target wasm32-wasip2 --release --locked`
5. `wasm-tools validate server-wasm/target/wasm32-wasip2/release/cedros_login_server_wasm.wasm`
6. `node scripts/benchmark-server-wasm-artifact.mjs`
7. `cd ui && npm run typecheck && npm test -- --run src/extension/register.test.ts src/admin/dashboard/LoginHealthDashboardCard.test.tsx`
8. `make cedros-package`

## Deployment Boundaries

- Supply-chain provenance, signatures, and SBOM are not supplied in this local
  package.
- React Native executable loading depends on a Cedros mobile host loader.
- Repo-local provisional manifest types remain until the exact published Cedros
  SDK package versions are available.

## Acceptance Checks

- Package names and versions in Cargo/npm metadata match `packageFamily`.
- Manifest registration entrypoints match package names and fixed subpaths.
- React and React Native package exports expose required registration subpaths.
- Bootstrap manifest deep-equals the root manifest.
- Intake archive coverage maps every included entry, including runtime artifacts.
