# Security Guide

This guide covers the durable security requirements for deploying and
integrating Cedros Login. It is not a record of past audits; use the current
source, lockfiles, tests, and deployed configuration as the source of truth.

## Trust Boundaries

- `server/` is the standalone Axum service. It owns HTTP middleware,
  authentication and authorization, PostgreSQL or development-memory storage,
  and outbound providers.
- `server-wasm/` is the Cedros extension backend. A Cedros host supplies scoped
  database, settings, secret, HTTP, provider, telemetry, route, and job
  capabilities. The component still authenticates Login users and authorizes
  every request.
- `ui/` and `react-native/` are untrusted public clients. Client state, decoded
  tokens, hidden controls, and cached permissions are never authorization
  grants.
- OAuth/OIDC providers, email delivery, object storage, webhooks, reverse
  proxies, and relying parties are external trust boundaries.

Protect passwords, private keys, access and refresh tokens, API keys, MFA seeds
and recovery codes, OAuth/OIDC client secrets, verification links, WebAuthn
state, identity data, and token-bearing outbox rows. Do not log or expose them.

## Production Checklist

The standalone server validates several production-like requirements at
startup. At minimum:

- Terminate TLS and set `ENVIRONMENT=production`.
- Generate unique `JWT_SECRET`, `JWT_RSA_PRIVATE_KEY`, and
  `TOTP_ENCRYPTION_SECRET` values. Keep the TOTP secret distinct from the JWT
  secret.
- Set `COOKIE_SECURE=true`; choose the narrowest workable `COOKIE_DOMAIN` and
  `COOKIE_SAME_SITE` policy.
- Set `CORS_ORIGINS` to the exact browser origins that may use the API. Never
  use a wildcard with credentialed requests.
- Keep `RATE_LIMIT_ENABLED=true`. Use Redis or edge rate limiting for
  multi-instance deployments; in-memory limits are per process.
- Set `FRONTEND_URL` to the public HTTPS site URL and configure an HTTPS
  `SSO_CALLBACK_URL` when SSO is enabled.
- Configure both `POSTMARK_API_TOKEN` and `POSTMARK_FROM_EMAIL`, and run the
  outbox worker. Production-like readiness fails closed without real delivery.
- Use PostgreSQL with reviewed backups, restore procedures, and restricted
  credentials. In-memory storage is for development and tests only.
- Review `/ready` and provider-specific failure paths before accepting traffic.

The complete variable and runtime-setting reference is
[server/docs/settings-reference.md](server/docs/settings-reference.md).

## Browser Sessions and CSRF

HTTP-only cookies are the recommended browser token transport. They reduce
token theft from JavaScript, but XSS can still perform authenticated actions.
Cedros Login uses a double-submit CSRF cookie/header check for state-changing,
cookie-authenticated requests; do not strip the `XSRF-TOKEN` cookie or
`X-CSRF-Token` header at a proxy.

```tsx
<CedrosLoginProvider
  config={{
    serverUrl: 'https://auth.example.com',
    session: {
      storage: 'cookie',
      autoRefresh: true,
      syncTabs: true,
    },
  }}
>
  <App />
</CedrosLoginProvider>
```

`localStorage` and `sessionStorage` expose bearer tokens to any script running
on the page. They require the explicit `session.allowWebStorage: true` opt-in.
Use them only when cookies are not workable, minimize third-party scripts, and
deploy a strict Content Security Policy. `memory` avoids persistent browser
storage but loses the session on reload.

## Native Token Storage

React Native uses `react-native-keychain` by default or a supplied
`secureStorage.adapter`. AsyncStorage fallback is allowed automatically in
development and requires `secureStorage.allowInsecureStorage: true` otherwise;
do not enable that fallback for production credentials.

Scope each provider to its own canonical auth server and secure-storage service.
Legacy token import is opt-in and must be enabled temporarily on exactly one
provider. See [react-native/README.md](react-native/README.md) for the migration
and concurrency contract.

## OAuth, Apple, and OIDC

Google and Apple browser/native sign-in sends a provider-signed ID token to the
server. The server validates the signature algorithm, key ID, issuer, audience,
expiry, and provider claims before creating a Login session. A social email
collision does not silently link accounts.

Apple flows must preserve and verify the nonce. Enterprise SSO uses an OIDC
authorization-code flow with state, nonce, and PKCE. Discovery, authorization,
JWKS, and token endpoints must share the configured issuer's exact scheme,
canonical host, and effective port; redirects are disabled in the standalone
client.

For the Wasm backend, grant `CEDROS_EXTENSION_HTTP_ALLOWLIST` access only to the
reviewed HTTPS provider origins. The Cedros host must also disable redirects or
reapply the same egress policy to every redirect target.

## Authentication and Authorization

- Revalidate the authoritative session and account state for protected
  requests. JWT validity alone is not sufficient for mutable suspension,
  revocation, membership, or role state.
- Enforce system-admin, organization-role, ABAC, relying-party scope, and tenant
  checks at the server boundary.
- Preserve atomic single-use proof consumption, refresh rotation, canonical
  email updates, MFA changes, and last-owner/last-admin protections when
  implementing custom storage.
- Return indistinguishable errors where identity or tenant existence would leak.
- Require step-up proof for sensitive credential and MFA changes.
- Treat timeouts after mutations as ambiguous; inspect authoritative state
  before replaying a non-idempotent request.

## Email and External Effects

Email delivery is at least once because provider acceptance and local outbox
acknowledgement cannot share a transaction. Consumers and operators must allow
duplicate messages. Details and correlation rules are in
[server/docs/outbox-delivery-contract.md](server/docs/outbox-delivery-contract.md).

Avatar object storage and identity metadata also cannot commit atomically.
Monitor and reconcile partial external effects without logging user content or
credentials.

## Data Handling

Canonical account emails are validated, NFKC-normalized, and lowercased before
storage and comparison. The `users` record and primary `user_emails` row must
remain consistent; see
[server/docs/canonical-email-invariant.md](server/docs/canonical-email-invariant.md).

Sessions intentionally are not bound to a client IP because mobile networks,
proxies, and VPNs change addresses. IP data is for rate limiting and audit
context, not an authentication factor. If a deployment adds binding, design it
as an explicit policy with user-visible recovery behavior.

## Verification

Run affected tests and static checks before release. The repository provides:

```bash
make lint
make test
make security-audit
make cedros-validate
```

The web and native dependency trees pin `shell-quote` 1.11.0 and use the
MIT-licensed [`braces` depth-guard backport](https://github.com/dieub/braces-depth-guard)
through an npm alias override. Upstream `braces` has no patched release for
CVE-2026-93687; the backport bounds parsing and AST traversal without replacing
the matching API. `make test-dependency-security` exercises normal expansion,
deep-pattern/AST rejection, safe shell arguments, and the comment/newline
injection case against each package's resolved dependency tree. Run it after
installing both locked dependency trees.

Development tools also use a local BSD-licensed `sprintf-js` precision backport
through the existing API Extractor argument parser. It clamps numeric precision
while retaining normal formatting. The dependency regressions exercise CLI
help, invalid arguments, and declaration rollup as well as the formatter. Both
npm trees pin patched brace expansion, URI parsing, source-map, and TOML parsing
releases. Standalone TLS and QUIC dependencies are updated in the lockfile.

Security scans are point-in-time evidence. Refresh advisory databases and npm
registry data for release decisions, then verify the exact built artifact and
deployed host configuration. The repository's scoped RustSec ignore is valid
only while RSA is used for signing/key handling and not private-key decryption.

## Reporting Security Issues

Report vulnerabilities through [GitHub private vulnerability reporting](https://github.com/conorholds/cedros-login/security/advisories/new)
or the security contact supplied by your deployment. Include the affected
version, reproduction steps, and impact with secrets removed. Do not open a
public issue containing a working exploit, credentials, tokens, or personal data.
