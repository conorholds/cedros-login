# cedros-login WASM extension — runtime testing (install → serve smoke)

The `server-wasm/` crate compiles + unit-tests + builds to `wasm32-wasip2`, but it
has **never run against a live host**. This is the operator/CI checklist to stand
it up on a real Cedros (cedros-data) host and smoke each flow.

> Scope: the WASM **extension** mode (`server-wasm/`), not the standalone Axum
> server (`server/`), which ships separately and is unchanged.

## 1. Prerequisites

### Build the component

```sh
rustup target add wasm32-wasip2          # once
cd server-wasm && cargo build --target wasm32-wasip2 --release
# -> target/wasm32-wasip2/release/cedros_login_server_wasm.wasm
```

Or package the full archive (component at `cedros-extension.server.wasm` + the
generated manifest/bootstrap):

```sh
node scripts/generate-cedros-extension-shell.mjs
node scripts/validate-cedros-extension-shell.mjs   # must print "validation passed"
node scripts/package-cedros-extension.mjs
```

### Secrets (`secrets` seam)

The per-extension `secrets` seam is **guest-writable only** (no operator path to
populate a per-extension secret), so the component **self-seeds its own**
signing/encryption material via `secrets::get_or_create`: generated once on the
first route that actually needs each secret and reused stably across per-request
instances. Setup routes intentionally do not pre-seed these secrets so extension
install/activation cannot spend its route deadline on one-time crypto generation.

| Secret key                                       | Purpose                                                                             | Provisioning                                                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `jwt-rsa-private-key`                            | RS256 access-token signing (JWKS at `/v1/.well-known/jwks.json` is derived from it) | **self-seeded on first token/JWKS use** (RSA-2048 PEM)                                                                  |
| `jwt-secret`                                     | Refresh-token HMAC key                                                              | **self-seeded on first session/refresh use** (256-bit random)                                                           |
| `totp-secret:{userId}:{enrollmentId}`                           | Immutable per-enrollment TOTP factor seed                                                         | **generated during MFA setup**; stored only in the host secret seam and deleted with factor/account deletion            |
| `sso-client-secret:{providerId}`                 | Per-provider external OIDC credential                                                | **operator-entered through Login admin**; stored only in the host secret seam and deleted with provider/org deletion    |
| `totp-encryption` / `sso-encryption`             | Legacy database-ciphertext migration keys                                            | Existing keys are required to read legacy ciphertext; TOTP never creates a replacement decryption key. New factors/providers use the secret seam     |
| `rp_token:{relyingPartyId}`                      | Per-relying-party service token                                                      | **operator-provided** (cannot be generated; fail closed when absent)                                                    |
| `CEDROS_EXTENSION_SECRETS_PASSPHRASE`            | Host secrets-seam passphrase                                                        | Host/operator level; without it the `secrets` seam is inert and the self-seed write fails closed, so auth fails closed. |

### Settings (`settings` seam)

| Setting                                                                                               | Default                                                              | Purpose                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server_frontend_url`                                                                                 | (empty)                                                              | Email action links, the default WebAuthn RP origin, the SSO redirect base, and Solana challenge domain. **Required** for email/passkey/SSO flows unless WebAuthn has an explicit `auth_webauthn_rp_origin`. Legacy `frontend_url` is still read as a fallback. |
| `auth_email_enabled`                                                                                  | `true`                                                               | Email/password register + login.                                                                                                                                                                                                                               |
| `auth_google_enabled` / `auth_google_client_id`                                                       | `false` / —                                                          | Google sign-in.                                                                                                                                                                                                                                                |
| `auth_apple_enabled` / `auth_apple_client_id`                                                         | `false` / —                                                          | Apple sign-in.                                                                                                                                                                                                                                                 |
| `auth_solana_enabled`                                                                                 | `false`                                                              | Solana wallet sign-in.                                                                                                                                                                                                                                         |
| `feature_sso`                                                                                         | `false`                                                              | Enterprise SSO.                                                                                                                                                                                                                                                |
| `sso_callback_url`                                                                                    | —                                                                    | The exact redirect URI registered at each IdP (required when SSO is on).                                                                                                                                                                                       |
| `auth_webauthn_enabled` / `auth_webauthn_rp_id` / `auth_webauthn_rp_name` / `auth_webauthn_rp_origin` | `false` / host of frontend origin / `Cedros Login` / frontend origin | WebAuthn/passkey sign-in.                                                                                                                                                                                                                                      |
| `auth_instantlink_enabled`                                                                            | `false`                                                              | Passwordless magic-link sign-in.                                                                                                                                                                                                                               |
| `auth_new_device_alert_enabled`                                                                       | `true`                                                               | Email users on a successful sign-in from a device (browser+OS) not in their recent sessions. Opt-out (set `false` to disable).                                                                                                                                 |
| `auth_avatar_upload_enabled`                                                                          | `false`                                                              | Profile avatar upload (needs a storage provider).                                                                                                                                                                                                              |
| `default_org_id`                                                                                      | —                                                                    | Internal bootstrap key set by `/setup/admin` when the settings seam accepts it; new signups fall back to the oldest setup org if the key is absent.                                                                                                            |
| `jwt_access_ttl_secs` / `jwt_refresh_ttl_secs`                                                       | `900` / `604800`                                                     | Optional token-lifetime overrides. Extension-mode issuer and audience are fixed by the v1 public contract to `cedros-login` and `cedros`; settings cannot override them.                                                                                       |

### Egress allowlist (`CEDROS_EXTENSION_HTTP_ALLOWLIST`)

Operator-only, never manifest-declared. Add the hosts each enabled federated
provider needs (empty list denies all egress, so social/SSO degrade gracefully):

- Google: `www.googleapis.com`
- Apple: `appleid.apple.com`
- Each SSO IdP issuer host (e.g. `login.microsoftonline.com`, `dev-xxx.okta.com`).

### Provider access (granted by the manifest `providerAccess[]`)

- `email` (site email provider) — verification/reset/invite/magic-link/alert email.
- `storage` (site media storage, ops `put`/`get`/`delete`) — avatar upload (opt-in).

### Jobs (host scheduler)

The host should schedule the two exported jobs:

- `cedros-login:cleanup-expired-auth-data` — sweeps expired sessions/tokens/attempts.
- `cedros-login:outbox-dispatch` — delivers queued transactional email (retry/backoff).

### Required database concurrency behavior

Production activation requires the semantics defined in
`contracts/host/cedros-database-concurrency-contract.v2.json`. Package install
does not depend on an advertised capability id. Cedros platform independently
refuses Login Wasm install and boot binding when its concurrency invariants are
unavailable; the live acceptance suite verifies that host-owned gate. The host
must atomically
reclaim expired `sending` outbox leases. Run
`make cedros-db-concurrency-reference` before packaging.

Deploy a Cedros platform 0.1.82+ host with the current Cedros Login package. The
guest must advertise the v2 database-concurrency contract and include the
required parent `userId` on guarded outbox rows. Completion receipts bind
`deliveryId` and `leaseOwner`; a lost-response replay by that owner is
idempotent, while a stale worker with a different owner must conflict.

## 2. First-run setup

```
GET  /setup/status            -> { needsSetup: true } on a fresh install
POST /setup/admin             -> host-admin write session required; creates the first
                                 system-admin + bootstrap org and sets default_org_id.
                                 Idempotent-guarded (403 once done).
POST /setup/admin/import      -> host-admin write session required; imports the first
                                 system-admin hash. Import treats org/default-org
                                 bootstrap as retryable so activation is not failed
                                 by a noncritical settings/org seam issue.
```

Until either `default_org_id` or a setup org exists, email/password + magic-link
signup fail closed.

## 3. Smoke checklist

All paths are relative to the extension mount (e.g.
`https://{site}/extensions/cedros-login`).

- [ ] **Discovery** — `GET /.well-known/jwks.json` returns a key whose `kid`
      matches issued access-token headers; `GET /discovery` lists enabled methods.
- [ ] **Register/login** — `POST /register` then `POST /login`; access token
      verifies against the JWKS; `org_id`/`role` claims reflect the default org.
- [ ] **Refresh rotation + reuse** — `POST /refresh` rotates; replaying the old
      refresh token returns 401 and (on a rotated token) revokes all sessions +
      queues a security-alert email + writes a `security.token_reuse_detected` audit row.
- [ ] **Logout** — `POST /logout` clears the session/cookies.
- [ ] **Email flows** — send-verification / forgot-password / magic-link queue
      email to the outbox; the dispatch job delivers it (check the provider).
      Verify the host accepts delivery contract v1 fields (`idempotencyKey`,
      `attempt`, `duplicateRisk`), returns an optional `providerMessageRef`, and
      clearly declares whether the key suppresses duplicates or is correlation
      only. Inject a post-send DB acknowledgement failure and confirm retry/
      duplicate-risk telemetry contains no recipient, subject, body, or token.
- [ ] **MFA** — `/mfa/setup` → `/mfa/enable` (returns recovery codes) → login
      returns an MFA challenge → `/login/mfa` (TOTP) or `/mfa/recovery` (code).
- [ ] **WebAuthn** — register a passkey (`/webauthn/register/options|verify`),
      then log in (`/webauthn/auth/options|verify`); passwordless signup
      (`/webauthn/signup/options|verify`).
- [ ] **Social/Solana** — with a provider enabled + host allowlisted, `POST
    /google` | `/apple` | `/solana`; `POST /link-oauth` links to a logged-in account.
- [ ] **SSO** — configure a provider (`POST /admin/sso-providers`), `POST
    /sso/start` (returns the authorize URL), complete the IdP round-trip to
      `GET /sso/callback` → session.
- [ ] **Organizations** — create/list/get/update/delete; `/orgs/:id/switch`
      rotates the session into that org's context; members + invites + custom roles.
- [ ] **API keys** — create one, then use `Authorization: Bearer ck_…` on an org
      route (proves `auth::principal` API-key auth).
- [ ] **Account** — profile update, set-password (passwordless account), avatar
      upload (if enabled), account-deletion request→confirm and `/account-deletion/me`.
- [ ] **Admin** — `/admin/users` (+ mutations), `/admin/settings`,
      `/admin/sso-providers`, `/admin/audit` (gated on the host admin session).
- [ ] **Database concurrency gate** — against a real, multi-worker Cedros platform
      staging host, run at least 50 concurrent attempts for every scenario in
      `contracts/fixtures/cedros-database-concurrency-v2.json`. Prove the
      declared outcome across all 22 top-level scenarios and 28 recovery
      vectors. Cover proof/result composites, atomic registration completion
      and rollback, signup-limit status and last-slot enforcement, invite replay,
      expired/stale outbox leases, owner-bound completion-response replay, and
      serializable-or-equivalent account/organization deletion. Race and
      post-commit stale root/child
      writes against lifecycle tombstones. All rejected attempts must return
      the declared redacted marker. Retain results with release evidence. Do
      not launch if v2 is absent, final state differs, or a raw diagnostic or
      identifier is returned.

## 4. Host-coordinated boundaries

- **Database concurrency, session atomicity, and abuse budgets** — the installed
  host must advertise all six required capabilities, pass the live multi-worker
  vectors above, and prove `/runtime/abuse-budget/consume-v1` allows requests
  within budget, rejects exhausted budgets with bounded retry metadata, and
  fails closed when its datastore is unavailable. Do not activate the extension
  with a partial operation set.
- **Invite-gate CRM handoff** — enable the gate only when the host durably binds
  `cedros_login` / `invite_gate.pending` and returns a non-empty receipt after
  the write.
- **Native loading** — the package exports the screen/provider registration,
  but mobile production requires a host loader plus simulator or device checks.
- **Providers and OIDC egress** — enable email, avatar storage, or federated SSO
  only after their exact grants, secrets, HTTPS allowlist, and failure paths are
  verified in staging.

Current owners, statuses, and evidence requirements are in
`docs/cedros-host-coordination-handoff-map.json` and
`docs/cedros-release-readiness-handoff.md`.
