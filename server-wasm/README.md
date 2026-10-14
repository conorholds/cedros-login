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
Cedros extension installations load it as `cedros-extension.server.wasm`
alongside the manifest and client runtimes. The crate is not
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

Native unit tests and contract validation do not exercise an installed host's
transaction, provider, or permission behavior. The host must implement the
[database concurrency contract](../contracts/host/cedros-database-concurrency-contract.v2.json)
and [session atomic contract](../contracts/host/cedros-session-atomic-contract.v1.json).
Verify tenant isolation, provider access, and auth flows on the intended host
before deployment.

## License

Source-available under [PILL-1.0.0](../LICENSE.md).
