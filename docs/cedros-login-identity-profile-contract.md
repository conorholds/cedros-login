# Cedros Login identity-profile contract

Contract `cedros-login:identity-profile:v1` is available in Cedros Login `0.1.8` and later. It returns only a stable Login subject, tenant binding, five booleans, and the Login user-record `updatedAt` value. It never returns email addresses, wallet addresses, password hashes, provider identifiers, credential material, recovery data, or arbitrary metadata.

## Routes and request schemas

`GET /extensions/cedros-login/v1/identity/profile` (`cedros-login:identity-profile-current`) has no request body, subject path parameter, or subject query parameter. It accepts the normal Login bearer token or access cookie. Login validates the JWT, current session, user, suspension state, and current organization membership, then derives `subjectId` exclusively from the token `sub` claim. An absent, invalid, expired, or revoked session cannot read a projection.

`GET /extensions/cedros-login/v1/identity/users/{subjectId}/profile?orgId={orgId}` (`cedros-login:identity-profile-admin-get`) uses the existing relying-party service authentication: `Authorization: Bearer <service token>` and `x-cedros-relying-party: <id>`. It additionally requires the exact `identity-profile:read` scope. The RP policy must allow `orgId`, and the requested Login subject must be a current member of that organization. A subject outside the organization is indistinguishable from a missing subject (`404 subject_not_found`). Every successful response first commits `admin.identity_profile_read` with the authenticated `relyingPartyId`, authorized `orgId`, `targetType: identity_profile`, and requested subject as `targetId`; the service principal is never mislabeled as `actorUserId`. Audit failure fails the read closed.

Both routes have an empty request body. The current-user route accepts no caller-supplied identity. The privileged route accepts one stable Login subject path identifier and one required Login organization query identifier. Response and error schemas are [identity profile v1](../contracts/schemas/cedros-login-identity-profile-v1.schema.json) and [identity profile error v1](../contracts/schemas/cedros-login-identity-profile-error-v1.schema.json).

## Boolean derivation

| Field | Login-owned source |
| --- | --- |
| `emailLinked` | Non-empty canonical Login email. |
| `emailVerified` | `emailLinked` and Login's canonical email-verification bit. |
| `passwordConfigured` | Non-empty Login password hash exists; the hash is never returned. |
| `solanaWalletLinked` | Non-empty Login Solana wallet link exists. This does not claim a Ledger transaction proof. |
| `evmWalletLinked` | Non-empty dedicated Login EVM wallet link exists. Missing pre-contract fields deserialize as unlinked. Generic metadata and arbitrary auth-method strings do not count. |

Only a proof-backed Login flow or trusted identity migration may populate the dedicated EVM link. The projection itself is read-only and cannot create an identity assertion.

## Errors, tenancy, and freshness

Errors use `{ "error": "<stable-code>" }`. Current-user authentication failures are `401`; current membership removal is `403`. Privileged authentication failures are `401 unauthorized`; missing/malformed policies, missing scope, and disallowed organizations are `403`; missing `orgId` is `400 org_required`; a missing or out-of-tenant subject is `404 subject_not_found`; host-seam failures are redacted `502` codes (or `409 resource_conflict` for a versioned host write conflict).

The host installation scopes Login's secrets and databases to the site. The privileged route adds RP-token, explicit-scope, RP organization allowlist, and current membership checks inside that installation. No global user lookup is performed before the membership boundary.

Responses, including denials, carry `Cache-Control: private, no-store`. Values are synchronous reads of Login-owned state. `updatedAt` identifies the source user revision, but consumers must not reuse a projection after the request/session boundary; refetch after email verification, password changes, or wallet link/unlink actions.

## Fixtures and installed-host acceptance

The [v1 fixture](../contracts/fixtures/cedros-login-identity-profile-v1.json) contains complete and legacy-without-EVM projections, a declarative installed-host seed specification, and the required cases: current user, privileged administrator/support read with an audit record, expired database session, missing-scope denial, and cross-tenant subject rejection. The expired-session token must have a still-valid JWT whose authoritative Login session row is expired, proving the mutable session check rather than only JWT expiry. Installed-host execution must use the isolated fixture site and must assert that denial paths create no successful-read audit event.

After seeding the fixture identities, organizations, sessions, and RP policies in an isolated host, run [the installed-host test](../scripts/test-cedros-login-identity-profile-installed-host.mjs) with `CEDROS_LOGIN_IDENTITY_PROFILE_BASE_URL` set to the site origin and the five token variables named at the top of the script. The system-admin token is used only to compare the filtered audit count before denials and after the authorized read; token values are never printed.

## Remaining identity-proof owners

Ledger transaction proof remains Login-owned authentication work, but no proof contract is published in v1. A Ledger transaction signature must use a dedicated, single-use nonce-bound Solana transaction-proof contract; `solanaWalletLinked` cannot be used as a substitute.

Bot verification is a transient action verdict, not durable profile state. The assigned identity-verification provider owns the verdict contract, while Login owns enforcement at the applicable registration/login action. No provider verdict contract is currently published, so Login does not expose a bot flag and does not copy a result into generic user metadata.
