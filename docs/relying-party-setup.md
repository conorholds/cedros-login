# Cedros Login relying-party setup

Cedros Login keeps service authentication fail closed. Every relying party needs
its own service token and policy before the published introspection route is
usable. Installing and enabling an extension does not create or activate this
relationship.

## Operator setup

In Login Admin, open **Relying parties** and configure Portal and Pay
independently. Each configuration requires:

- a unique service token of at least 32 characters;
- the `session:introspect` scope;
- at least one allowed session audience;
- at least one allowed organization ID.

Login stores the token under `rp_token:{relyingPartyId}` and normalized policy
JSON under `rp_policy:{relyingPartyId}` in its encrypted extension-secret seam.
New policies bind the intended token by SHA-256 inside the encrypted policy secret.
If a rotation partially commits, access fails closed until configuration is
retried; the old token cannot inherit the replacement token's policy. Existing
unbound policies remain compatible until their next configuration save.
Read responses and Login Admin expose only whether each value is configured,
the parsed allowlist summary, and validation errors. They never return the
stored token or raw policy value.

Use **Verify relationship** with the caller's token, audience, and organization
ID. Login first reports the precise provider-side diagnostic, then exercises
the normal introspection handler with intentionally invalid end-user session
material. A ready relationship returns the canonical inactive result:

```json
{ "active": false }
```

No customer token or customer data is required for this check.

## Caller contract

Call:

```text
POST /extensions/cedros-login/v1/session/introspect
Authorization: Bearer <that caller's service token>
X-Cedros-Relying-Party: <relying-party ID>
Content-Type: application/json
```

with:

```json
{
  "token": "<customer access token>",
  "relyingPartyId": "<relying-party ID>"
}
```

The caller ID may be supplied by the `X-Cedros-Relying-Party` header, the
`relyingPartyId` body field, or both. When both are present they must match.
Login resolves the service token and policy using that exact ID; one caller's
token cannot authenticate another caller.

The coordinated fixtures are:

| Consumer | Relying-party ID | Required scope |
| --- | --- | --- |
| Portal | `cedros-portal` | `session:introspect` |
| Pay | `cedros-pay` | `session:introspect` |
| Data | `cedros-data` | `memberships:read` |

Portal already sends `cedros-portal`. Pay must be updated by the Pay team to
send `cedros-pay`; provider-side setup alone cannot compensate for a missing
caller ID.

Data uses `GET /extensions/cedros-login/v1/organizations/{orgId}/members/{userId}`
to reauthorize delayed control-plane work against the current Login user and
membership records. Its policy may use the explicit `"*"` organization entry
because customer organization IDs are created dynamically. The wildcard applies
only to `memberships:read`, even when the same policy also grants directory or
profile scopes; those routes still require explicit organization IDs. Data's
verification probes the membership route without reading customer records and
returns `membership: {status: 404, error: "not_found"}`. It does not require or
probe `session:introspect`.

For normal customer introspection, missing or mismatched service credentials,
missing/malformed policies, and missing scopes fail closed. A valid customer
token whose audience or organization is outside the caller's policy is returned
as inactive so the route does not become a cross-tenant claims oracle. Login
Admin's verification operation distinguishes `caller_unknown`, `token_absent`,
`token_mismatch`, `policy_absent`, `policy_malformed`, `scope_missing`,
`audience_policy_mismatch`, `organization_policy_mismatch`, and `ready`.
