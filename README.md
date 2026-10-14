# Cedros Login

**The identity foundation for the Cedros platform.**

[Explore Cedros](https://cedros.ai/) · [Cedros Pay](https://github.com/conorholds/cedros-pay) · [React](ui/README.md) · [React Native](react-native/README.md) · [Security](SECURITY.md) · [License](LICENSE.md)

## What is Cedros?

Cedros is an AI-native website platform that enables businesses, agencies, and developers to create, manage, and operate websites using artificial intelligence.

Unlike traditional website builders that primarily use AI to generate designs or content, Cedros is designed for ongoing collaboration between website owners and AI agents. Websites become active business tools that agents can understand, modify, and operate through natural language instructions.

The platform combines website creation, hosting, content management, AI capabilities, and an extensible ecosystem of business functionality.

**Key capabilities include:**

- **AI Website Creation:** Build and customize websites using natural language, with control over design, structure, content, and functionality.
- **Agent-Native Management:** Enable authorized AI agents to manage website content, make changes, and interact with supported business operations.
- **Extensible Functionality:** Add capabilities such as online stores, payments, directories, events, and other business-specific workflows through extensions.
- **Integrated Intelligence:** Use AI to assist with content creation, ongoing website management, and operational tasks.
- **Business and Developer Tools:** Manage hosted websites, custom domains, permissions, and extensible functionality for different business requirements.

Cedros is designed for small and medium-sized businesses seeking to reduce the technical work involved in maintaining an online presence, as well as agencies and developers building websites for clients.

Its agent-native architecture allows websites to function as more than static destinations. Rather than relying entirely on manual administration, owners can delegate supported tasks to AI while maintaining control over their websites and business operations.

The goal of Cedros is to make websites an active part of running a business, combining the flexibility of modern web development with the accessibility and operational capabilities of AI agents.

**Websites that think, act, and work for you.**

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

- **Building a custom extension with an AI agent?** Start at
  [cedros.ai/skill.md](https://cedros.ai/skill.md) and follow the integration
  guidance below.
- **New to the platform?** [Explore Cedros](https://cedros.ai/) to see the broader
  platform and what you can build with it.
- **Building a web or mobile app?** Follow the [React](ui/README.md) or
  [React Native](react-native/README.md) source-installation guide.
- **Integrating with a Cedros site?** Start with [admin embedding](docs/admin-shell-embedding.md)
  and the [Wasm backend](server-wasm/README.md).
- **Running authentication in your own application?** Use the
  [standalone server guide](server/README.md).

## Build a custom extension with an AI agent

Start with the [Cedros agent entry point](https://cedros.ai/skill.md). It routes
agents to the current extension-authoring workflow, versioned documentation,
and published integration contracts.

For an extension that needs customer accounts or payments, follow **Extension
Authoring** from that entry point, then search **Official extension integrations**
for **Cedros Login** or **Cedros Pay**, as required. Read the matching
**Composability and relying-party contracts** guidance before designing how
those extensions work together. Use the documentation version that matches
your target Cedros site.

You can give your agent a brief such as:

> Read https://cedros.ai/skill.md and follow the extension-authoring workflow.
> Build a members-only learning extension for Cedros. Find and use the current
> published Cedros Login contracts for customer identity and Cedros Pay contracts
> for subscription access. Use only supported public APIs and capabilities.

The authoring guides explain the supported contracts and package workflow;
this repository provides the implementation source. Use the published
integration contracts when building a separate extension.

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
