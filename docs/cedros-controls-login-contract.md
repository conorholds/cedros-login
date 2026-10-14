# Cedros Controls login integration contract

This document is the production contract for Cedros Controls. The complete
contract begins with Cedros Login `0.0.80`; earlier releases published the
capability identifiers but did not provide all of the current-state and safe
rotation guarantees below. Controls does not receive a Login service credential.

## Published seams

| Contract | Wire schema | Authentication | Failure behavior |
| --- | --- | --- | --- |
| `cedros-login:auth-response` | `contracts/schemas/cedros-login-auth-response.schema.json` | The public login/registration endpoint authenticates the submitted factor. On success Login sets HttpOnly `cedros_access` and `cedros_refresh` cookies when cookie mode is enabled; otherwise `tokens` is present in the body. | Factor/validation failures use the route's 4xx JSON error. A response that requires an invite code has no session and includes `inviteCodeRequired`, `pendingInviteToken`, and `inviteGateHandoffStatus`. No cookie or token is authentication success unless the response completed a session. |
| `cedros-login:user-context` | `contracts/schemas/cedros-login-user-context.schema.json` | `GET /extensions/cedros-login/user` accepts the end-user `cedros_access` cookie or `Authorization: Bearer <access-token>`. No service token is accepted or needed. | Missing or cryptographically invalid credentials are `401 {"error":"invalid_credentials"}`. Revoked/expired/missing sessions are `401 invalid_session`; stale role context is `401 organization_role_changed`; removed membership or organization is `403`; suspension is `403 account_suspended`. Host database failures are redacted `502 db_error`. No identity body is returned on failure. |
| `cedros-login:v1-jwks` | `contracts/schemas/cedros-login-v1-jwks.schema.json` | Public, unauthenticated `GET /extensions/cedros-login/v1/.well-known/jwks.json`. | Returns `200` JSON, redacted `502 secrets_error` when the secret seam is unavailable/invalid, or `500 internal_error` for invalid cryptographic key material. It never returns private key material. |

The TypeScript `LoginUserContext` type is exported by the shared Login contracts
and generated into both client packages. `user-context` contains Login-owned
identity, session, membership, and role state only. `restrictions` is reserved
for Login-owned organization/account restrictions and is always empty in v1;
account suspension fails the request instead of appearing as a restriction.
Cedros Core remains the sole authority for site-level permissions and the site
registry.

## Access token

The exact claim schema is
`contracts/schemas/cedros-login-access-token.schema.json`.

| Field | Contract |
| --- | --- |
| Protected header | `alg=RS256`, a required 16-character lowercase hexadecimal `kid`, and JWT type as produced by the RS256 library. Any other algorithm or a missing/unknown `kid` fails closed. |
| `iss` | Exactly `cedros-login`. |
| `aud` | Exactly `cedros`. This is the platform audience Cedros Controls must validate; `cedros-controls` is not emitted as a separate audience. |
| `sub` | Stable Cedros Login user id. It is the authoritative customer identity key; email, username, and wallet are mutable attributes and must not be used as the subject key. |
| `sid` | Login session id. Local signature validation alone does not prove that this mutable session is still active. |
| `iat`, `nbf`, `exp` | NumericDate seconds. Login issues `nbf == iat` and `exp == iat + expiresIn`; extension default `expiresIn` is 900 seconds, with an operator-provided unsigned `jwt_access_ttl_secs` setting supported as the lifetime override. The auth response's `expiresIn` is authoritative. Verifiers must reject `exp <= now` and `nbf > now` (normal clock-skew policy may be applied by the host, but Login itself issues no future skew). |
| `org_id`, `role` | Optional active Login organization and current membership role (`owner`, `admin`, or `member`) at issuance. Controls must use `user-context` for authoritative current state rather than trusting these mutable snapshot claims indefinitely. |
| `is_system_admin`, `email_verified` | Optional Login snapshot claims. They do not grant Cedros Core site permissions. |

## Session and organization freshness

Every extension-mode authenticated Login request now performs, in order:

1. RS256 signature, exact `kid`, issuer, audience, expiry, and not-before checks.
2. Session lookup by `sid`, ownership check, expiry check, and revocation check.
3. Current user lookup, suspension/system-admin-state check, and current email-verification policy/claim check.
4. Current organization lookup plus membership and role equality checks when
   `org_id` is present.

Therefore logout, explicit revocation, logout-all, account suspension/deletion,
organization deletion, membership removal, and role changes take effect on the
next authoritative request. A role change deliberately rejects the stale access
token; refresh/re-authentication issues a token with current context. Controls
should fetch `user-context` at request boundaries where current organization
state matters. There is no separate revocation feed in this version.

## JWKS caching and rotation

JWKS responses use `Cache-Control: public, max-age=60, must-revalidate`. Controls
should cache normally, then make one forced JWKS refresh when an otherwise valid
token has an unknown `kid`; if the refreshed set still lacks it, reject the token.

`POST /extensions/cedros-login/admin/jwt/rotate` is restricted to a host-verified
system administrator with CSRF-immune bearer authentication. Rotation installs a
new active key and keeps the previous key in JWKS and validation for the access
token lifetime plus the 60-second JWKS cache window. The response identifies the
active and previous `kid` and the overlap deadline. After that deadline Login
stops publishing/accepting the previous key. A second rotation attempted before
the returned deadline fails with `409 key_rotation_in_progress`.

## Consumer verification behavior

Controls must fail closed for wrong issuer, wrong audience, invalid signature,
missing/unknown `kid`, expired token, or future `nbf`. Local JWKS verification is
appropriate for provenance and short-lived routing decisions. Any decision that
must observe logout/revocation, suspension, membership removal, or role change
must use the host-supplied/current `cedros-login:user-context` seam.
