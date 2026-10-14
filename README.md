# Cedros Login

**The identity foundation for the Cedros platform.**

[Explore Cedros](https://cedros.ai/) · [Cedros Pay](https://github.com/conorholds/cedros-pay) · [React](ui/README.md) · [React Native](react-native/README.md) · [Security](SECURITY.md) · [License](LICENSE.md)

## What is Cedros?

Cedros is a platform for building and running business websites.
It brings visual page authoring, content, customer accounts, commerce, and site
administration together, with extensions that add new features and workflows to
the same site.

Developers can build custom extensions, pages, and integrations around shared
platform services. That gives a membership site, customer portal, or online
store a common foundation for its accounts, payments, and administration.

## Where Cedros Login fits

Cedros Login is one of the platform's core extensions: the identity building
block that other extensions and applications can build around. It provides
accounts, sign-in, sessions, and organization management for experiences that
need to know who a customer is and which resources they can access.

- **Give customers a choice of sign-in methods:** email/password, Google, Apple,
  Solana, passkeys, and instant links.
- **Support the complete account journey:** profiles, recovery, session
  management, and multi-factor authentication.
- **Build for individuals and teams:** organizations, memberships, invitations,
  and authorization contracts support customer portals and team workflows.
- **Meet customers on web and mobile:** React and React Native clients connect
  to the Cedros extension backend or the standalone Rust server.

[Cedros Pay](https://github.com/conorholds/cedros-pay) adds checkout,
subscriptions, credits, and payment-linked access. A custom learning or
membership extension can use Login for accounts and Pay for subscription
status, then build its own content, features, and access rules around them.

## Start here

- **New to the platform?** [Explore Cedros](https://cedros.ai/) to see the broader
  platform and what you can build with it.
- **Building a web or mobile app?** Follow the [React](ui/README.md) or
  [React Native](react-native/README.md) source-installation guide.
- **Integrating with a Cedros site?** Start with [admin embedding](docs/admin-shell-embedding.md)
  and the [Wasm backend](server-wasm/README.md).
- **Running authentication in your own application?** Use the
  [standalone server guide](server/README.md).

## Components

| Component | Source | Purpose |
| --- | --- | --- |
| Wasm backend | `server-wasm/` | Host-embedded Cedros extension routes and jobs |
| Rust server | `server/` | Standalone Axum service and embeddable crate |
| React client | `ui/` | Authentication UI and admin/web registration modules |
| React Native client | `react-native/` | Native authentication components |
| Shared contracts | `contracts/` | Client types, schemas, and host protocol fixtures |

[cedros-extension.manifest.json](cedros-extension.manifest.json) defines the
extension family and its current source version. Registry packages follow a
separate release schedule; the source version does not imply that matching npm
or crates.io packages have been published. Follow the package guides to build
and consume the current libraries from source.

## Development

Use Node.js `24.17.0`, npm `11.13.0`, and Rust `1.97.0`; the repository's toolchain
files pin these versions.

```sh
make install       # install locked React and React Native dependencies
make build         # build client libraries and the standalone server
make test          # run component tests and shared contract checks
make lint          # run client linters and Rust Clippy
make fmt-check     # check client and Rust formatting
make cedros-validate # validate shared types, versions, and manifest contracts
```

Run builds and tests sequentially. `make help` lists focused commands.
`make dev-server` requires `JWT_SECRET`; it uses in-memory storage when
`DATABASE_URL` is unset. The [server guide](server/README.md) covers provider
configuration, PostgreSQL, first-admin setup, and embedding.

React's `config.serverUrl` is the standalone auth base URL, for example
`http://localhost:57165/auth`. React Native expects the server origin, for example
`http://localhost:57165`, and adds `/auth` to its requests.

## Cedros extension integration

The [Wasm guide](server-wasm/README.md) covers the component build and host
boundary. The Cedros host supplies storage, settings, secrets, providers,
permissions, and scheduled jobs through the checked-in WIT interfaces. Local
unit tests do not verify an installed host or its provider configuration.

- [Admin embedding](docs/admin-shell-embedding.md): registration and host services.
- [Authorization matrix](docs/authorization-permission-matrix.md): principal,
  organization, ABAC, and relying-party boundaries.
- [Server settings](server/docs/settings-reference.md): configuration reference.
- [Canonical email](server/docs/canonical-email-invariant.md) and
  [outbox delivery](server/docs/outbox-delivery-contract.md): durable server contracts.

## Google sign-in

Create a Web application OAuth client in Google Cloud Console. Add browser
origins under **Authorized JavaScript origins** for the Google Identity Services
ID-token flow. Set `GOOGLE_CLIENT_ID` on the standalone server, or configure the
`auth_google_client_id` setting in the Cedros host. The React provider discovers
enabled methods and public client IDs through `GET /features`.

## Security and license

Read the [security guide](SECURITY.md) before deploying authentication services.
Report vulnerabilities using GitHub private vulnerability reporting linked there.

This repository is source-available under [PILL-1.0.0](LICENSE.md), the Personal
and Internal Limited License. See the license for permitted uses and restrictions.
Historical releases retain their original license notices in Git history.
