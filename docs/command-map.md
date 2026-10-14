# Command Reference

Run commands from the repository root unless a different working directory is
shown. Use Node `24.17.0`, npm `11.13.0`, and Rust `1.97.0` as pinned by the
repository. Heavy builds, full test suites, Docker operations, and performance
measurements should run sequentially.

## Setup and Development

| Command | Purpose | Requirements |
| --- | --- | --- |
| `make help` | List maintained Make targets | none |
| `make install` | Run `npm ci` in `ui/` and `react-native/` | npm registry access |
| `make dev` | Start Vite library development and the standalone server | free local ports; required server env |
| `make dev-ui` | Start Vite for the React library (no demo app) | `ui/node_modules` |
| `make dev-server` | Start the standalone server only | `JWT_SECRET`; optional database/provider env |
| `make db-up` | Start development PostgreSQL on `127.0.0.1:15432` | Docker Compose (`docker-compose` command) |
| `make db-migrate` | Apply forward SQLx migrations | SQLx CLI, running PostgreSQL, and `DATABASE_URL` |
| `make db-down` | Stop the repository's Compose services | Docker Compose (`docker-compose` command) |
| `make db-reset` | Drop and recreate the configured development database | destructive; disposable local database only |

Copy `server/.env.example` to `server/.env` for PostgreSQL-backed standalone
development. Remove or clear `DATABASE_URL` to use volatile in-memory storage.
The client packages need a consuming application to render their UI. See the
[server quick start](../server/README.md#quick-start) for the required secrets
and the database-only Compose invocation.

## Targeted Verification

| Area | Type/build | Lint/format | Tests |
| --- | --- | --- | --- |
| React | `npm --prefix ui run typecheck`; `npm --prefix ui run build` | `npm --prefix ui run lint`; `npm --prefix ui run format:check` | `npm --prefix ui test -- --reporter=dot` |
| React Native | `npm --prefix react-native run typecheck`; `npm --prefix react-native run build` | `npm --prefix react-native run lint`; `npm --prefix react-native run format:check` | `npm --prefix react-native test` |
| Rust server | `cargo check --manifest-path server/Cargo.toml --locked` | `cargo fmt --manifest-path server/Cargo.toml -- --check`; `cargo clippy --manifest-path server/Cargo.toml --locked -- -D warnings` | `cargo test --manifest-path server/Cargo.toml --lib --locked` |
| Wasm backend | `cargo build --manifest-path server-wasm/Cargo.toml --target wasm32-wasip2 --release --locked` | `cargo fmt --manifest-path server-wasm/Cargo.toml -- --check`; `cargo clippy --manifest-path server-wasm/Cargo.toml --locked -- -D warnings` | `cargo test --manifest-path server-wasm/Cargo.toml --locked` |
| Repository scripts | n/a | n/a | `node --test scripts/system-performance-smoke.test.mjs` |

Additional React checks:

```bash
npm --prefix ui run check:i18n
npm --prefix ui run check:autosave
npm --prefix ui run check:unused
npm --prefix ui run verify:exports      # run after build
npm --prefix ui run verify:browser-web  # run after build
npm --prefix ui run smoke:pack          # run after build
```

Use `TEST_DATABASE_URL` for PostgreSQL-bound server tests. Add
`CEDROS_REQUIRE_POSTGRES_TESTS=1` when those tests must fail rather than skip if
the database is missing.

## Aggregate Checks

These commands cover the whole repository and are intentionally heavier:

| Command | Runs |
| --- | --- |
| `make fmt-check` | React Prettier check and Rust server formatting check |
| `make lint` | React lint/i18n/autosave, server clippy, and React Native lint |
| `make test` | React, Rust server, Wasm, React Native, script, and contract tests |
| `make build` | React, release Rust server, and React Native builds |
| `make security-audit` | RustSec and Semgrep security scans |

## Cedros Metadata and Packaging

| Command | Purpose |
| --- | --- |
| `node scripts/generate-shared-contracts.mjs` | Regenerate shared contract mirrors |
| `node scripts/generate-cedros-extension-shell.mjs` | Regenerate manifest/bootstrap copies |
| `make cedros-validate` | Validate contracts, manifests, route/job metadata, and machine-readable docs maps |
| `make cedros-db-concurrency-reference` | Validate and execute the host database-concurrency reference vectors |
| `make cedros-runtime` | Build the ignored React runtime tarball |
| `make cedros-package` | Build and validate the ignored Cedros archive and release packet |

`make cedros-package-copy` additionally writes the generated archive to an
external checkout. Inspect `CEDROS_MAIN_DIR` before using it.

## Performance Fixtures

Performance tools use synthetic data and do not establish production SLOs.

| Command | Scope |
| --- | --- |
| `node --test scripts/system-performance-smoke.test.mjs` | Local smoke-runner regression tests |
| `node --expose-gc scripts/benchmark-client-cache.mjs` | Web request-cache heap/count behavior |
| `cargo run --manifest-path server/Cargo.toml --locked --release --example performance_cpu` | Native password, recovery, image, and JWT kernels |
| `cargo test --manifest-path server-wasm/Cargo.toml --locked --release --lib performance_kernels -- --ignored --nocapture` | Native test-executable timing for Wasm guest kernels; not Wasmtime timing |
| `psql -X -qAt "$TEST_DATABASE_URL" -f scripts/performance-postgres.sql` | Rolled-back PostgreSQL fixture and query plans on a disposable database |

For an HTTP smoke, start an isolated server and set `PERF_BASE_URL`. The runner
defaults to public, generated, and authenticated scenarios; authenticated
coverage needs `PERF_ADMIN_EMAIL` and `PERF_ADMIN_PASSWORD`. Set
`PERF_SETUP_ADMIN=1` only against a disposable environment where creating the
fixture administrator is intended.

## Publishing

`make publish-source` (also `make publish-all`) exports committed source to the
existing public Git checkout; `PUBLISH_ARGS=--dry-run` previews it. Run
`make test-publish-source` for the publication regression tests.
`make publish-packages` and the individual package targets retain the separate
standalone registry preparation workflow. These targets do not push or publish.
See [`PUBLISHING.md`](../PUBLISHING.md) before running them.
