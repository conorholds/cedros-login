# Changelog

## 2.0.22

- Organization updates commit only while the account and acting membership
  retain their observed revisions. An optional `expectedName` rejects stale
  collaborative rename forms without overwriting the current account name.
- Persist an explicit null Portal agent binding on ordinary API keys, keeping
  their field shape compatible with scoped agent keys in the same host model.

## 2.0.14

- Add system-administrator OAuth public-client configuration to the Login admin surface, including strict contract validation, stale-save detection, and ambiguous-save recovery.

## 1.0.23

- Include the plan selection and signup flow fixes added after 1.0.22; give the updated extension archive a unique version.

## 1.0.22

- Keep public session discovery and authenticated redirects free of intermediary loading screens.

## Unreleased

## 1.0.21 — 2026-09-25

### Changed

- Subscription selection no longer needs a Cedros Pay base URL on a Cedros
  site: the gate defaults to this site's own `/extensions/cedros-pay` (rooted at
  the frontend URL) and the setting is only an override for a Pay deployment on
  another site.
- Team seat limits are edited per plan (unrestricted, limited to a seat count,
  or unlimited) from the plans Cedros Pay publishes, instead of a hand-typed
  JSON map. The stored `team_plan_seat_limits` value is unchanged.
- Settings that apply immediately are no longer labelled under every field.

### Fixed

- Hosted (Wasm) settings reads now decode JSON strings from the host, so
  route and URL settings no longer show quoted values and false validation
  errors in the admin.

## 1.0.16 — 2026-09-12

### Changed

- Added `cedros-data:token-email-evidence-v1` as a required Cedros host
  capability and moved token-backed email enqueueing onto
  `identity.outbox.enqueue-token-email`, which binds the live token purpose,
  recipient, and exact message to host-issued delivery evidence.
- Added `cedros-data:session-atomic-v1` as a required Cedros host capability and
  moved Wasm session rotation/revocation onto the atomic host contract.
- Replaced the repository's MIT license with the source-available PILL-1.0.0
  license.
- Refreshed contributor, integration, security, release, and package
  documentation and removed completed audit/planning artifacts.

### Fixed

- Pinned standalone and Wasm OIDC discovery, authorization, JWKS, and token
  endpoints to the configured issuer origin and disabled standalone redirects.
- Updated JavaScript transitive dependencies and overrides to resolve current
  npm advisories.
- Improved account-session management, including deterministic revoke actions
  and current-session protection in the React UI.
- Stabilized shared-resource regression tests.

## 1.0.15 — 2026-09-08

### Added

- **Invite-code subscription discounts.** Admin invite codes accept an
  optional `discountPercent` (1-100; 100 = free). Redeeming such a code
  grants the discount to the user: the redeem response additively embeds
  `inviteDiscount`, and the new authenticated
  `GET /account/invite-discount` route (public-auth alias
  `cedros-login:public-auth-account-invite-discount` in extension mode)
  serves the held grant for billing. Published as the
  `cedros-login:invite-discount` manifest capability; contract in
  `docs/cedros-invite-discount-contract.md`.

### Deprecated

- `themeOverrides['--cedros-success-light']` — use
  `themeOverrides['--cedros-login-success-soft']`. The Cedros theme kernel emits
  `--cedros-success-light` as a mode-scoped brand color, so the package's pale
  success wash moved to its own namespace. Existing values are still applied:
  the legacy key is forwarded to the new one.

### Changed

- **Public block theming follows the host theme in both color modes.** The
  auth-form and account-workspace blocks no longer paint a hardcoded dark
  palette. Every themeable `--cedros-login-*` alias now resolves through the
  host's `--cedros-runtime-*` block tokens (which Cedros Data flips for dark
  mode and rebinds to the live site theme), so the card, inputs, tabs and
  primary action match the surrounding page and follow site themes. Standalone
  and admin surfaces, where those tokens are undefined, are unchanged.
- **Site themes now reach the package's shape and elevation.** `--cedros-radius`
  and `--cedros-shadow-sm/md/lg` were being assigned inside the package's roots,
  which discarded any value a consumer theme or the Cedros theme kernel set for
  them. They are now read (with the previous values as fallbacks) through
  `--cedros-login-radius` and `--cedros-login-shadow-*`.
- Refreshed Cedros Login documentation, AI discovery references, OpenAPI route coverage, settings reference, env template, and package examples against the current router, config loader, migrations, and package exports.

### Fixed

- Email-verification links now complete initial signup by issuing the authenticated
  session and continuing the preserved return route; email-change and additional
  address links remain verification-only.
- Registration now makes the automatic verification send explicit, presents a
  resend action, and uses a branded transactional-email layout with an absolute
  site URL supplied by the host.
- Aligned in-memory system-settings defaults with migration-seeded settings so local development exposes the same runtime setting surface as Postgres.
- Updated Docker defaults and health checks from the old `8080` server port to the current `57165` default.

## 1.0.1 — 2026-08-23

### Fixed

- The Login readiness card's **Review methods** action now selects and focuses
  the Methods tab, including when that tab was already active.

## 1.0.0 — 2026-08-23

### Changed

- Aligned the extension family to the public Cedros platform API 1 authoring
  kit and its canonical `cedros:extension@0.1.0` WIT checksum.
- Declared the existing `cedros-data:database-concurrency-v2` dependency and
  the published `cedros-data:identity-atomic-v1` dependency. The minimum Cedros
  Data version is now 0.1.10, making this a major compatibility release.

### Fixed

- Password registration with required email verification now uses
  `registration.account.complete`, atomically committing or rolling back the
  account, verification record, and outbox email.

## 0.0.56 — 2026-05-27

### Changed

- **Admin sidebar consolidation.** Collapsed the seven separate Settings
  entries (Login Account, Team Invites, Login Email, Login Webhooks,
  Login Server, Login Images, Login Activity) into a single consolidated
  `Login` sidebar page with internal tabs (Auth, Email, Webhooks, Server,
  Images, Team Access, Activity). Tab visibility honors the existing
  per-feature permission gating; the active tab is reflected in the
  `?loginTab=` query parameter so links remain shareable. The new
  `Login` section declares all legacy ids in `replacesSectionIds` so the
  host migrates persisted permission configurations cleanly.
- Tablist implements the WAI-ARIA Tabs pattern with automatic
  activation: ArrowLeft / ArrowRight cycle through visible tabs, Home /
  End jump to first / last, and a roving `tabindex` keeps the tablist
  to a single Tab stop.

### Added

- **`adminModules[].sectionIcons` manifest field.** Declared a
  host-resolvable string icon (`account`) for `cedros-login:login` so the
  Cedros Data sidebar can render an icon next to the Login entry even
  when sections are loaded from manifest metadata only (React `icon`
  ReactNodes don't survive serialization to the manifest-driven sidebar
  renderer, which is why the previous Settings entries shipped without
  icons in the host UI).
- **Host icon name allowlist.** `HOST_ADMIN_ICON_NAMES` is exported from
  both the Rust manifest crate and the TS contracts module. The TS
  `HostAdminIconName` union types `sectionIcons` values at compile time;
  the Rust `cedros_login_admin_modules()` function panics if a section
  declares an icon name outside the allowlist; the manifest generator
  script (`scripts/generate-cedros-extension-shell.mjs`) repeats the same
  check so the regenerated JSON cannot ship with an unrecognized icon.
- **`login` dashboard permission key.** Added to both the server-side
  default permissions and the TypeScript dashboard permission map.

### Removed

- **Legacy per-feature admin section ids** (`settings-auth`,
  `settings-email`, `settings-webhooks`, `settings-server`,
  `settings-images`, `settings-wallet`, `activity`,
  `cedros-login:account-settings`, `cedros-login:team-invites`).
  Previously kept as hidden sidebar entries for back-compat; now removed
  entirely from `CEDROS_LOGIN_SECTION_IDS`, `CEDROS_LOGIN_ADMIN_SECTION_IDS`,
  `cedrosLoginPlugin.sections`, the `DashboardSection` type,
  `LOGIN_DASHBOARD_SECTIONS`, `DASHBOARD_SECTION_LABELS`,
  `DEFAULT_DASHBOARD_PERMISSIONS`, and the Rust
  `default_permissions()` defaults. Persisted permission blobs that still
  contain these keys deserialize without error (extra keys land in the
  HashMap and are ignored). External code that imports the removed
  constants must switch to the consolidated `CEDROS_LOGIN_ADMIN_SECTION_IDS.login`.
- Removed obsolete alternate paths, stale planning artifacts, and adjacent
  non-identity surfaces so Cedros Login contains only its current auth,
  identity, organization, admin, settings, AI discovery, and native login
  architecture.
