# Cedros Login

[Wasm backend](server-wasm/README.md) · [Standalone server](server/README.md) ·
[Web client](ui/README.md) · [Native client](react-native/README.md) ·
[Security](SECURITY.md) · [License](LICENSE.md)

Cedros Login provides authentication and identity for Cedros sites and custom
applications. This source-available repository includes:

- a Cedros `wasm32-wasip2` extension backend;
- React and React Native clients with Cedros registration entrypoints;
- a standalone Rust/Axum server and embeddable crate.

It supports email/password, Google, Apple, Solana, passkeys, instant links,
TOTP MFA, sessions, organizations, API keys, account administration, and
relying-party identity APIs.

## Packages

| Component | Path | Distribution | Registration entrypoint |
| --- | --- | --- | --- |
| `cedros-login` | `server/` | Rust crate / standalone service | `cedros_login::register_extension_family` |
| Cedros Wasm backend | `server-wasm/` | Cedros extension archive | `cedros-extension.server.wasm` |
| `@cedros/login-react` | `ui/` | React library / extension UI | `@cedros/login-react/admin/register`, `@cedros/login-react/web/register` |
| `@cedros/login-react-native` | `react-native/` | React Native library / extension UI | `@cedros/login-react-native/register` |

The package metadata and generated extension manifests are kept at the same
version. The current source version is defined by `server/Cargo.toml`,
`ui/package.json`, `react-native/package.json`, and
`cedros-extension.manifest.json`.

For Cedros sites, install the complete extension archive. For custom
applications, build the libraries from source using the package guides below.
Registry packages have their own release schedule; this repository's API and
version do not imply that matching npm or crates.io packages have been published.

## Development

Use Node `24.17.0` with npm `11.13.0` and Rust `1.97.0`; the checked-in
`.nvmrc`, `.node-version`, package metadata, and `rust-toolchain.toml` pin those
versions.

For Cedros sites, start with the [Wasm backend guide](server-wasm/README.md)
and the [extension deployment checklist](docs/cedros-release-readiness-handoff.md).
For custom applications, use the [standalone server quick start](server/README.md#quick-start)
and the React or React Native package guides. The client directories contain
libraries, not standalone demo applications.

From the repository root:

```bash
make install       # install React and React Native dependencies
make test          # run package tests and Cedros validators
make lint          # run JS linters and Rust clippy
make fmt-check     # check UI and Rust formatting
make build         # build all publishable packages
```

`make dev-server` requires `JWT_SECRET` and uses in-memory storage when
`DATABASE_URL` is unset. See the server guide for provider configuration and
PostgreSQL setup. Run the aggregate checks above sequentially; use
[the command reference](docs/command-map.md) for focused package checks.

For the standalone server's default routes, React's `config.serverUrl` is the
auth base URL (for example, `http://localhost:57165/auth`). React Native's
`config.serverUrl` is the origin (`http://localhost:57165`); its client adds
`/auth` to requests.

## Cedros Extension

The generated `cedros-extension.manifest.json` and
`cedros-extension.bootstrap.json` describe the extension family. Do not edit
them by hand; regenerate and validate them through the repository scripts.

```bash
make cedros-validate   # validate manifests, contracts, and machine-readable maps
make cedros-package    # build and validate the ignored archive under dist/
```

The archive contains the compiled React admin runtime and Wasm backend. Cedros
host capabilities, provider grants, mobile loading, and staging checks remain
separate deployment responsibilities; see the
[deployment checklist](docs/cedros-release-readiness-handoff.md).

## Documentation

- [Repository map](docs/repo-map.md): code layout and ownership boundaries.
- [Command reference](docs/command-map.md): setup, validation, packaging, and
  performance commands.
- [Standalone server](server/README.md): quick start, API groups,
  configuration, embedding, and database lifecycle.
- [Wasm backend](server-wasm/README.md): component build, host boundaries,
  and verification.
- [React package](ui/README.md) and
  [React Native package](react-native/README.md): installation and client usage.
- [Runtime testing](docs/RUNTIME-TESTING.md): installed Cedros Wasm smoke tests.
- [Extension data architecture](docs/extension-data-architecture.md): host data,
  provider, cache, and async-delivery boundaries.
- [Admin embedding](docs/admin-shell-embedding.md): host-owned admin shell
  integration.
- [Relying-party setup](docs/relying-party-setup.md): scoped service access.
- [Server settings](server/docs/settings-reference.md),
  [canonical email](server/docs/canonical-email-invariant.md), and
  [outbox delivery](server/docs/outbox-delivery-contract.md): durable server
  contracts.
- [Security guide](SECURITY.md): production configuration and integration
  requirements.
- [Publishing](PUBLISHING.md): public source snapshots and separate registry package releases.

Source publication is a reference snapshot, not installed-host acceptance. The
[release-readiness record](docs/cedros-release-readiness-map.json) identifies
remaining provider, host, and release gates. Build archives and verify the exact
host deployment before relying on them in production.

Keep source changes aligned with the documented contracts and affected tests.
Generated contracts, package manifests, and migrations are part of the reference
implementation; agent instructions, build archives, dependency directories, local
environment files, and workspace notes are excluded from public source snapshots.

Machine-readable `docs/cedros-*-map.json` files are validation inputs and
release metadata, not generated build output. Their corresponding validators
run through `make cedros-validate`.

## Google OAuth Setup

Create a Web application OAuth client in Google Cloud Console. Add each browser
origin under **Authorized JavaScript origins**. Do not add a redirect URI for
the Google Identity Services ID-token flow used by the client package.

Set `GOOGLE_CLIENT_ID` for the standalone server, or configure the
`auth_google_client_id` runtime setting in Cedros. The React provider normally
discovers enabled methods and public client IDs from `GET /features`; pass a
client ID directly only when the host intentionally pins frontend
configuration.

## License

This project is source-available, not open source. It is licensed under
PILL-1.0.0 for personal and internal business use; redistribution, resale, and
offering the software as a service require separate permission. See
[LICENSE.md](LICENSE.md).

Earlier public snapshots retain their original license notices in Git history.
Use `SPDX-License-Identifier: LicenseRef-PILL-1.0.0` in source-file headers.
