# Cedros Invite-Gate Pending Handoff Contract v1

Status: Login implementation complete; joint Cedros platform binding and staging
verification required before automatic waitlist enrollment is release-ready.

## Trusted host seam

Cedros Login uses the existing `cedros:extension/crm-source-events.submit` WIT
import. This is not the redacted analytics pipe. It is a manifest-granted,
extension-instance-scoped host call with a synchronous acceptance result.

Manifest grant:

```json
{
  "id": "cedros-login:invite-gate-handoff",
  "sourceKind": "cedros_login",
  "scopes": ["write"],
  "eventTypes": ["invite_gate.pending"]
}
```

Call:

```text
crm-source-events.submit(
  "cedros-login:invite-gate-handoff",
  "cedros_login",
  "invite_gate.pending",
  payloadJson
)
```

Login calls the seam only after the pending Login user, primary identifier,
default organization membership, and invite-code-account row commit. Returning
pending logins retry the same handoff using the same occurrence identity.

## Request payload

```json
{
  "contractVersion": "1",
  "eventId": "igp_<sha256>",
  "occurrenceId": "igp_<sha256>",
  "eventType": "invite_gate.pending",
  "reason": "registration_without_invite_code",
  "loginUserId": "<opaque Login user id>",
  "loginOrgId": "<opaque Login organization id>",
  "extensionId": "cedros-login",
  "siteId": "<host site id>",
  "installationId": "<optional host installation id>",
  "environment": "<optional host environment>",
  "occurredAt": "<RFC3339 timestamp>"
}
```

`eventId` and `occurrenceId` are identical. They are a deterministic SHA-256
identity over contract version, event type, site id, and Login user id. Cedros
The Cedros platform must use this value as the idempotency key. A retry may have a later
`occurredAt`, but it represents the same occurrence.

The payload must never contain email, name/profile data, a pending invite token,
session/auth tokens, cookies, credentials, or generic provider payloads.

## Acceptance response

Cedros platform returns success only after its product-waitlist write is durably
committed or an idempotent reread proves the same occurrence was already
committed:

```json
{
  "accepted": true,
  "receiptId": "<stable non-empty Data waitlist receipt>",
  "status": "created"
}
```

`status` may be `created` or `alreadyExists`. Login treats the handoff as
accepted only when `accepted` is `true` and `receiptId` is non-empty. A host
error, malformed response, explicit rejection, or missing site context produces
`inviteGateHandoffStatus: "unavailable"` or `"rejected"`; it never blocks invite
redemption and never produces waitlist-success copy.

## Trusted email resolution

While processing the opaque handoff, before returning acceptance, Cedros platform
resolves the account email from:

```http
GET /extensions/cedros-login/v1/users/{loginUserId}?orgId={loginOrgId}&includeEmail=true
Authorization: Bearer <rp_token:cedros-data>
X-Cedros-Relying-Party: cedros-data
```

The corresponding `rp_policy:cedros-data` secret must explicitly grant:

```json
{
  "scopes": ["users:read", "users:email:read"],
  "audiences": ["<configured Login audience>"],
  "orgIds": ["<permitted Login org id>"]
}
```

Response:

```json
{
  "userId": "<opaque Login user id>",
  "email": "user@example.com",
  "emailVerified": false
}
```

This is the only new PII-bearing mode on the existing directory read. The
ordinary `users:read` response remains PII-free; `includeEmail=true` additionally
requires the narrower `users:email:read` scope and remains organization-scoped.
Missing membership/user returns 404; missing credentials or scope returns
401/403.

## Public auth response and UI rule

Pending register/login responses add:

```json
{
  "inviteCodeRequired": true,
  "pendingInviteToken": "<opaque redemption token>",
  "inviteGateHandoffStatus": "accepted"
}
```

The React UI shows “we’ve added you to the waitlist” only for `accepted`.
`rejected`, `unavailable`, or an absent field shows a retry/fallback message.
The pending invite token is returned only to the browser redemption flow and is
never sent through the handoff or relying-party route.

## Joint acceptance

Before release, Cedros platform must grant/bind `cedros_login` +
`invite_gate.pending`, populate site context on public auth requests, implement
idempotent durable acceptance and receipt responses, provision the scoped
relying-party policy, and pass created/replayed/failure staging cases. Until
then, the invite gate works but automatic product-waitlist enrollment remains
not release-ready.
