# Cedros Analytics Events

Cedros Login declares eighteen owner-actionable identity/security/lifecycle
analytics events in `manifest.analytics.events`. Server emission is live through
the Wasm telemetry host import; browser-only code does not emit these events
directly. Every event is `category: identity`, `visibility: authenticated`, and
carries only redacted, structured metadata (method/scope/reason enums, route id,
boolean flags) — never a direct identifier.

## Identity & session

| Event | Trigger | Runtime status |
|---|---|---|
| `cedros-login:authenticated` | successful session creation after login, OAuth, wallet, WebAuthn, SSO, instant-link, or MFA completion | Wasm telemetry |
| `cedros-login:registered` | successful account creation commit (incl. OAuth/wallet/WebAuthn/SSO/instant-link first login) | Wasm telemetry |
| `cedros-login:logout` | successful current-session or all-session revocation | Wasm telemetry |
| `cedros-login:registration-created` | notification setup event after registration | Wasm telemetry |
| `cedros-login:user-login` | notification setup event after login | Wasm telemetry |
| `cedros-login:identifier-linked` | additional sign-in method attached (link-oauth, passkey register, set-password, verified email, solana-link) | Wasm telemetry |
| `cedros-login:identifier-unlinked` | additional identifier removed from an existing account | Wasm telemetry |

## Security & risk

| Event | Trigger | Runtime status |
|---|---|---|
| `cedros-login:login-failed` | a password sign-in attempt is rejected before a session is issued (reported as `invalid-credentials` for all failure shapes) | Wasm telemetry |
| `cedros-login:account-locked` | recent failed attempts reach the lockout threshold and the login is throttled (429) | Wasm telemetry |
| `cedros-login:token-reuse-detected` | a rotated refresh token is replayed; all sessions are revoked and the user is alerted | Wasm telemetry |
| `cedros-login:mfa-enabled` | a user turns on MFA (TOTP) | Wasm telemetry |
| `cedros-login:mfa-disabled` | a user turns off MFA (TOTP) after re-verifying their password | Wasm telemetry |

## Recovery & lifecycle

| Event | Trigger | Runtime status |
|---|---|---|
| `cedros-login:password-reset-requested` | forgot-password queues a reset email for an existing account (never fires for unknown accounts) | Wasm telemetry |
| `cedros-login:password-reset-completed` | reset-password stores the new hash and revokes all sessions | Wasm telemetry |
| `cedros-login:email-verified` | a user proves control of an email (signup verify, email change, additional email, or magic-link) | Wasm telemetry |
| `cedros-login:account-deleted` | an account is purged via the email-confirmed or typed-confirmation deletion path | Wasm telemetry |

## Team

| Event | Trigger | Runtime status |
|---|---|---|
| `cedros-login:invite-sent` | a team invite is committed (create or resend) | Wasm telemetry |
| `cedros-login:invite-accepted` | a team invite is accepted and the membership is created | Wasm telemetry |

`cedros-login:accounts-merged` is RESERVED for a future account-merge feature
and is intentionally not declared until it can fire (the analytics map requires
declared events to be runtime-live). Identifier values (user id, wallet
address, email) never ride on analytics events; hosts consume them from the link
response body, which carries a `linked` marker naming the attached method plus
the updated `user` only after the method is verified. Pending email-change
responses intentionally omit `linked` until `/verify-email` succeeds. A future
CRM push event must not be declared until its durable consumer contract and
runtime emission both exist.

## Safe Properties

Property schemas are runtime/documentation guidance, not raw user payloads. Keys
are validated against a forbidden-key set in
`scripts/validate-cedros-analytics-events.mjs`.

| Event(s) | Safe properties | Forbidden data |
|---|---|---|
| auth/session events | `method` (`password`/`google`/`apple`/`solana`/`webauthn`/`sso`/`instant-link`/`unknown`), `mfaRequired` flag, `routeId`, logout `scope` | email, user id, token, cookie, raw provider payload |
| notification seed events | `method`, `routeId` | email, user id, session id, provider payload, network metadata |
| `identifier-linked` / `identifier-unlinked` | `identifierType` (`password`/`google`/`apple`/`wallet`/`webauthn`/`email`), `routeId` | email, user id, wallet address, token, raw provider payload |
| `login-failed` / `account-locked` | `method` (`password`), `reason` (`invalid-credentials`), `threshold`, `routeId` | email, user id, ip address, token, password |
| `token-reuse-detected` | `reason`, `alertEmailQueued`, `routeId` | user id, session id, token, cookie, raw headers |
| `mfa-enabled` / `mfa-disabled` | `method` (`totp`), `recoveryCodesGenerated`, `routeId` | email, user id, secret, recovery codes |
| `password-reset-requested` / `password-reset-completed` | `channel`, `scope`, `routeId` | email, user id, token, session id |
| `email-verified` | `context` (`signup-verify`/`email-change`/`additional-email`/`magic-link`), `routeId` | email address, user id, token |
| `account-deleted` | `confirmationMethod` (`email-link`/`typed-confirm`), `routeId` | email, user id, token, cookie |
| `invite-sent` / `invite-accepted` | `identifierType` (`email`/`wallet`), `role` (`owner`/`admin`/`member`), `resent`/`emailQueued`, `routeId` | email, user id, wallet address, invite token |

## Runtime Rules

- Emit only after the underlying workflow has committed.
- Keep payloads small, structured, and redacted.
- Do not reuse success-event ids for failed auth attempts or validation errors —
  failures have their own ids (`login-failed`, `account-locked`).
- Failure/recovery events that fire inside an account-existence guard (e.g.
  `login-failed`, `password-reset-requested`) carry no identifier, so they can
  never be used to enumerate accounts.
- Preserve manifest ids exactly so analytics reports resolve back to extension
  metadata.

## Acceptance Checks

- Manifest event ids are namespaced and unique, and match the analytics map 1:1.
- Runtime trigger map covers every manifest event id (each declared event is
  emitted by server-wasm route code).
- Event visibility is `authenticated`.
- Safe property keys avoid direct identifiers and secret-like fields.
- Wasm tests cover logout and registration/login event paths through telemetry
  mocks.
