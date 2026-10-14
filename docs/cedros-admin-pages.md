# Cedros Admin Pages

Cedros Login registers an executable packaged admin module for login/account
configuration. Cedros platform still owns the
operator-facing CRM for people, prospects, customers, and lifecycle records;
Cedros Login supplies the identity/auth/account layer behind those CRM views,
including the team-directory host service used by Cedros platform's Team UI.

## Manifest Metadata

| Field | Value |
|---|---|
| `surfaces.admin.moduleIds[]` | `cedros-login:admin` |
| `adminModules[]` | `cedros-login:admin` |
| Dashboard cards | `cedros-login:identity-health-card` |
| Content editor panels | not in scope |
| Slots | not in scope |
| Onboarding pages | `cedros-login:setup-login` |

The React package exports `cedrosLoginPlugin` and `cedrosLoginAdminModule` for
direct module consumers. The Cedros
extension admin bootstrap exports the executable `cedros-login:login` section
plus the `LoginHealthDashboardCard` contribution and
`cedros-login-team-directory` host service. Customers/CRM/Team pages stay with
Cedros platform.

## Settings Sections

| Section | Group | Permission | Notes |
|---|---|---|---|
| `cedros-login:login` | Extension Settings | `manage_settings` | Single `Login` sidebar entry for extension-owned authentication setup/settings/policy. Explicitly replaces `cedros-data:account-settings`, `account-settings`, and legacy per-feature settings ids. |

The old per-feature Settings ids remain only in `replacesSectionIds` so the
host can dedupe or migrate persisted sidebar/permission state. They are not
registered as live admin sections.

## Team Ownership

Cedros platform's Account settings alias can resolve to the Cedros Login account
section because the runtime module advertises `extensionId: "cedros-login"` and
the Login section publishes explicit replacement ids. Cedros platform Team remains a
host-owned UI and reads redacted team metadata through the
`cedros-login-team-directory` host service when Cedros Login is active.

## CRM Integration Boundary

Cedros platform should render identity/account information inside its CRM surfaces.
Cedros Login exposes the backing contracts through server routes, database
access declarations, provider access declarations, and account lifecycle event
metadata.

| Integration need | Cedros Login source |
|---|---|
| Login-backed identity records | `cedros-login:identity-records` and `cedros-login:identity-db` |
| Authenticated user and permission context | `cedros-login:user-context` and `cedros-login:admin-auth` |
| Account status, provider, roles, login metadata | host-mediated `cedros-login:admin-users-settings-audit` route family |
| Reset, disable, invite, profile handoff actions | `cedros-login:session-manage` plus permission-gated server route contracts, Extension Settings, and host Team targets |
| Account creation and login activity events | `cedros-login:registered`, `cedros-login:authenticated`, `cedros-login:logout` |
| Login activity audit review | host analytics/audit surfaces backed by declared login events and `/admin/audit` |
| Vault Team directory handoff | `cedros-login-team-directory` runtime host service for redacted metadata and password reset delegation |

Cedros Login does not register a Customers admin page. Any CRM integration
panel or setup task is CRM-owned and calls Cedros Login contracts rather than
using a Cedros Login Customers module id.

## Acceptance Checks

- Admin registration returns the executable Login section.
- Admin registration returns the identity-health dashboard card contribution.
- Admin registration returns the team-directory host service.
- `surfaces.admin.moduleIds[]` and `adminModules[]` both declare `cedros-login:admin`.
- Cedros platform does not create a cedros-login Customers sidebar/page.
- Identity/account integration remains available through server, database,
  provider, event, Extension Settings, Users, and team-directory host-service metadata.

## Runtime Injection Path

The `.cedros-extension.zip` is now the **complete admin runtime deliverable**.
Cedros platform no longer fetches the React admin runtime from npm, tarballs,
workspaces, registries, or crates — `make cedros-package` compiles it and
embeds it in the ZIP under `workspace/react/dist/**`, including
`./admin/register.js` and every relative chunk/module/style/json it imports.

### What the intake ZIP contains

- `cedros-extension.manifest.json` + `cedros-extension.bootstrap.json` — the
  canonical metadata. The serialized `bootstrap.json` is still `{ manifest }`
  only; live `modules` / `contentBlocks` / `hostServices` ship as compiled
  JavaScript, not JSON.
- `workspace/react/package.json` — declares `exports['./admin/register'].import.default`
  as `./dist/admin/register.js` so the host's loader resolves the entrypoint.
- `workspace/react/dist/**` — the compiled React admin runtime. The
  `./admin/register` chunk and its transitive imports are present; runtime
  source-map files (`.map`) are excluded as debug-only.
- `workspace/{react,react-native,server}/src/**` — small TS/Rust source slice
  for human review (advisory; intake never executes these).

### Allowed bare imports at runtime

Compiled chunks may declare bare imports for the React host shims and
nothing else:

- `react`
- `react/jsx-runtime`

The packaging script asserts the compiled admin chunk only depends on these.
Other runtime deps must be bundled into the compiled output by the Vite build.

### Hydration: version-exact match required

After install, Cedros platform hydrates the inventoried extension by loading
`workspace/react/dist/admin/register.js` from the uploaded ZIP, calling
`registerCedrosAdminSurface()` (or any of the four equivalent entries below),
and verifying that the returned bootstrap's `manifest.extensionId` AND
`manifest.version` exactly match the installed record. Mismatch ⇒ the host
refuses to hydrate.

`ui/src/extension/register.test.ts` asserts that the bootstrap returned by
`registerCedrosAdminSurface()` shares its `extensionId` and `version` with
the on-disk `cedros-extension.manifest.json`, so any drift between the
compiled runtime and the manifest fails CI before it can ship.

### Runtime bootstrap shape

`@cedros/login-react/admin/register` exposes the trusted bootstrap in four
equivalent shapes so the host integration can pick whichever it prefers without
breaking:

| Entry                                  | Shape    | Notes                                  |
| -------------------------------------- | -------- | -------------------------------------- |
| `default`                              | function | Factory; returns the shared bootstrap. |
| `registerCedrosAdminSurface`           | function | Named alias of the default.            |
| `registerCedrosLoginAdminSurface`      | function | Named alias of the default.            |
| `cedrosLoginAdminExtensionBootstrap`   | object   | The shared bootstrap object.           |
| `cedrosLoginAdminBootstrap`            | object   | Named alias of the object.             |

All four entries resolve to one shared `CedrosExtensionBootstrap`-shaped
object:

```ts
// bootstrap.manifest       -> deep-equals cedros-extension.manifest.json
// bootstrap.modules[]      -> AdminPlugin[] with executable sections + components
// bootstrap.hostServices[] -> live createService factories
```

The four-way contract is locked by `ui/src/extension/register.test.ts`.

## Host Responsibilities

The `cedros-login:admin` runtime module exposes fields that Cedros platform's host
shell or sidebar adapter is responsible for honoring:

- `section.replacesSectionIds` — `cedros-login:login` lists the legacy
  per-feature settings ids it subsumes (account-settings, settings-email,
  settings-webhooks, settings-server, settings-images, activity). Cedros platform
  must dedupe these when merging sidebar entries from other modules.
- Cedros platform's built-in Team sidebar item remains the visible entry point for
  team workflows; it should use the `cedros-login-team-directory` host service
  for login-backed identity data rather than expecting packaged
  `cedros-login:team` or `cedros-login:team-invites` sections.
- The host owns section-id normalization and deep-link routing. The contributed
  section id is already qualified as `cedros-login:login`.
