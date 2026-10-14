# Cedros Login Wasm Backend

This crate implements Cedros Login routes and background jobs as a
`wasm32-wasip2` component. It runs inside a Cedros host, which supplies database,
settings, secrets, provider, HTTP, logging, and telemetry capabilities through
the WIT interfaces in `wit/`.

For a standalone HTTP service or embeddable Axum router, use
[`server/`](../server/README.md). This component has no independent database
or HTTP listener, and does not read the standalone server's `.env` file.

## Build

Use the Rust toolchain selected by the repository's `rust-toolchain.toml`.
From the repository root:

```bash
rustup target add wasm32-wasip2
cargo build --manifest-path server-wasm/Cargo.toml --target wasm32-wasip2 --release --locked
```

The component is written to
`server-wasm/target/wasm32-wasip2/release/cedros_login_server_wasm.wasm`.
`make cedros-package` includes it as `cedros-extension.server.wasm` in the
extension archive alongside the manifest and client runtimes. The crate is not
published separately to crates.io; its deployment version comes from the
extension manifest.

## Code Layout

- `src/lib.rs`: component exports and job dispatch.
- `src/routes/`: route registry, request handling, and authorization.
- `src/domain/` and `src/services/`: auth rules and service operations.
- `src/data/`: host-mediated persistence operations.
- `src/host/`: adapters for imported host capabilities.
- `wit/`: component interface definitions.

## Verification

Run these checks sequentially from the repository root:

```bash
cargo test --manifest-path server-wasm/Cargo.toml --locked
make cedros-validate
```

Native unit tests and metadata validation do not exercise an installed host's
transaction, provider, or permission behavior. See the
[runtime testing guide](../docs/RUNTIME-TESTING.md),
[data architecture](../docs/extension-data-architecture.md), and
[deployment checklist](../docs/cedros-release-readiness-handoff.md) for host
integration requirements and smoke tests.

## License

Source-available under [PILL-1.0.0](../LICENSE.md).
