# Cedros Login authorization matrix

Authentication proves the caller's identity. Every authorization decision also uses current server-side user, organization, membership, role, policy, and resource state. Token claims are freshness checks and display context; they are not portable authority for another Cedros extension.

## Principals and trust boundaries

| Principal | Proves | May authorize |
| --- | --- | --- |
| Login session JWT | Current Login user and active session | Current org membership and role; standalone system-admin authority after a live DB check |
| User API key (`ck_`) | Current Login user only | Current org membership plus RBAC/ABAC; never system-admin, credential-management, or API-key-management authority |
| Packaged host admin context | Host-authenticated system administrator | Packaged `/admin/*` reads; writes additionally require the host CSRF/write gate |
| Relying-party credential | Configured extension/service identity | Only its configured scopes, audience, organization allowlist, profile-field allowlist, and current user state |
| Public/anonymous caller | Nothing | Public authentication, discovery, verification, and invite-acceptance ceremonies only |

The active organization and role in a JWT must still match the current membership. Switching active organizations requires a JWT session, rechecks membership, rotates the session, and issues current claims. Path and body organization identifiers are independently authorized against current storage.

## Built-in organization roles

| Permission | Owner | Admin | Member | Session system admin default |
| --- | :---: | :---: | :---: | :---: |
| `org:read` | yes | yes | yes | yes |
| `org:update` | yes | yes | no | yes |
| `org:delete` | yes | no | no | yes |
| `member:read` | yes | yes | yes | yes |
| `member:invite` | yes | yes | no | yes |
| `member:remove` | yes | yes | no | yes |
| `member:role_change` | yes | yes | no | yes |
| `invite:read` | yes | yes | yes | yes |
| `invite:create` | yes | yes | no | yes |
| `invite:cancel` | yes | yes | no | yes |
| `audit:read` | yes | yes | no | yes |
| `manage_extension_trust` | yes | no | no | no |

An admin cannot create an owner invite, promote a member to owner, modify an owner, or manage a custom role or policy containing permissions beyond its built-in grants (including `org:delete` and `manage_extension_trust`). Owner changes preserve the last-owner invariant. Custom roles are organization-scoped definitions for consuming applications; Cedros Login memberships continue to use the built-in roles unless a consumer explicitly and authoritatively binds a custom role.

## Endpoint matrix

| Surface | Required authority | Isolation rule |
| --- | --- | --- |
| Organization list/create | Authenticated principal | List returns current memberships only; create makes the caller owner |
| Organization read/update/delete | Current membership / admin+ / creator with owner membership, plus ABAC | Path organization is authoritative; personal/default-org deletion restrictions still apply |
| Active-org switch | JWT session plus current membership | API keys cannot switch; the old session is rotated |
| Member list | Current membership | Query is scoped to the path organization |
| Member role change/removal | Current admin+ membership plus ABAC | Target membership must belong to the path organization; owner and last-owner rules apply |
| Invite list/create/cancel/resend | Current membership for reads; admin+ for writes, plus ABAC | Invite is loaded within the path organization; only owners may create, cancel, or resend owner invitations |
| Invite accept | Authenticated intended recipient plus live invite | Token, recipient identity, expiry, status, and organization are checked server-side |
| Custom-role list/get | Current membership | Role identifier must belong to the path organization |
| Custom-role create/update/delete/default | Current admin+ membership | Creation, modification, deletion, and default selection cannot manage permissions beyond the actor's built-in grants; both the target and displaced default are checked |
| Policy list/get/create/update/delete | Current admin+ membership; standalone JWT system admin may manage ordinary policies | Existing and replacement permission must be within the actor's built-in grants; policy identifier must belong to the path organization |
| `POST /authorize` | JWT or user API key | Recognized Login permission, live org, and membership are required before ABAC; session system admins are the sole membership exception |
| `POST /permissions` | JWT or user API key plus current membership | Returns context-free effective permissions after ABAC, not raw role grants |
| API-key list/create/delete | JWT session | Key ownership is always the authenticated user; an API key cannot mint, enumerate, or revoke keys |
| Email, passkey/credential, password, and account deletion management | JWT session; existing step-up/proof gates also apply | A user API key cannot add a login method or mutate authentication factors or account recovery state |
| Organization audit | Current admin+ membership plus ABAC | Logs are filtered by the path organization |
| Standalone `/admin/sso-providers*` | JWT system admin or current organization owner | Non-system-admin reads/writes are limited to owned organizations; API keys cannot manage identity-provider trust |
| Standalone other `/admin/*` | JWT session plus current DB system-admin status | User API keys never inherit system-admin authority |
| Packaged `/admin/*` | Trusted host system-admin context | Login JWTs and API keys cannot synthesize host authority; mutations also require the write/CSRF gate |
| Relying-party introspection/directory | Relying-party credential and configured scope | Audience, organization, user status, and allowed fields are independently enforced |
| Standalone first-admin setup | Operator `SETUP_TOKEN`, at least 32 bytes, while no admin exists | The public setup-status response conveys no setup authority; first-admin creation is serialized and one-shot |

## ABAC decision rules

1. Reject unknown permission names, missing or inactive users, missing organizations, and nonmembers before evaluating organization policies. A session-backed system administrator is the only membership exception, and never receives `manage_extension_trust` implicitly.
2. Seed `subject.user_id`, `subject.email`, `subject.role`, `subject.is_system_admin`, and `resource.org_id` from current server-side state. Supplied values cannot replace them.
3. The public `/authorize` endpoint rejects caller-supplied `resource` and `environment` maps. Resource-aware ABAC must be invoked inside a trusted server integration that derives attributes from the resource being protected.
4. Evaluate only enabled policies for the requested organization and permission. At the highest matching priority, deny overrides allow. Lower priorities do not override that tier.
5. Missing attributes or unresolved interpolation in any applicable policy make the decision indeterminate and deny access. They cannot skip a deny and reach an RBAC allow. An explicit JSON `null` can satisfy `exists: false`.
6. With complete context, if no policy matches, use the built-in role matrix. Policy and membership changes take effect on the next request because authorization reads current storage.

Organization detail reads/updates/deletes, member reads/role changes/removals, invite reads/creation/cancellation/resends, and organization audit reads enforce these policies in addition to endpoint-specific built-in role and object constraints. Invite creation requires both `member:invite` and `invite:create`; resending also requires `invite:cancel` because it revokes the old invitation. Self-leave remains available subject to personal-org and last-owner rules. Org list/switch only disclose membership context. Role/policy management uses built-in administration gates so administrators can repair a restrictive policy; those gates do not grant owner-only powers. `/authorize` is a permission decision, not a promise that object-specific management constraints (creator-only deletion, owner targets, self-change, last owner) will pass.

## Concurrency and credential boundaries

- Membership mutations recheck the actor and target in the commit boundary. Native PostgreSQL serializes organization mutations and locks actor/target/owner rows; memory uses its repository lock. Hosted mutations condition on opaque actor/target row versions and an unchanged surviving-owner witness. A removed/downgraded actor cannot commit using a stale role, and concurrent removals/demotions cannot remove every owner. Account deletion uses the same guarded membership removal when leaving retained organizations. Hosted membership reads reject duplicate or mismatched user/org rows instead of choosing arbitrary authority.
- Hosted invitation acceptance conditions on the exact invitation and organization revisions while creating the membership. Cancellation, replay, replaced invitations, expired or malformed invitations, ambiguous recipients, and concurrent acceptance conflict instead of overwriting state. The organization revision serializes acceptance of different invitations for one recipient.
- User API keys are **unscoped user credentials** in the current contract, constrained by the user's current organization membership and endpoint gates. No per-key organization/permission restriction is advertised. Creation rejects unknown fields, including `scopes`, `orgId`, and `userId`, so unsupported restrictions are never silently ignored. Use the separately scoped relying-party contracts for service integrations.
- Default custom-role replacement is atomic. Ordinary role edits cannot write the default flag or restore a stale definition; hosted inline `isDefault` changes must use the dedicated default-selection endpoint.
- Custom `MembershipRepository` implementations must accept the actor user ID and perform membership authority and last-owner checks atomically; a preflight handler check is insufficient.

## Regression matrix

| Invariant | Automated coverage |
| --- | --- |
| Owner/admin/member/nonmember × every permission × session/API key | Native `api_authorization_tests`, both runtime permission/delegation matrix tests |
| Cross-org identifiers, forged resource/site attributes, unknown extension permissions | Native HTTP matrix, existing hosted ABAC and relying-party isolation tests |
| Admin cannot create/change/delete/default an owner-permission role or policy | Native HTTP regression and exhaustive native/hosted delegation tests |
| Policy denial reaches the real endpoint and disappears after policy removal | Native HTTP regression; shared hosted org permission guard |
| Missing resource/interpolation cannot skip a deny | Native policy-service test and hosted ABAC context tests |
| Downgraded actor, owner target, self-escalation, wrong org | Exhaustive native membership matrix and hosted CAS tests |
| Concurrent last-owner removal | PostgreSQL concurrent transaction test; hosted surviving-owner CAS condition test |
| Invite replay/cancellation/expiry/replacement/ambiguous recipient | Hosted invitation acceptance tests; native existing verified-recipient and consumption checks |
| Admin and relying-party privilege separation | Native session/admin regression tests; hosted admin gate and relying-party scope tests |

The baseline is deny-by-default, authorization on each request, and object-level checks from the [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). Hosted tenant/site isolation still depends on the host enforcing Login's declared database grants; guest seam tests do not substitute for an installed-host isolation run.

## Extension integration invariant

Another Cedros extension must treat a Login JWT or API key as identity evidence only. It must not infer its own privileges from `role`, `orgId`, `isSystemAdmin`, or mere token validity. It must either:

- use its own server-side authorization model after binding the Login user to its resource and tenant; or
- use Cedros Login's relying-party APIs with an independently authenticated relying-party credential and explicit scopes/allowlists.

Possession of a valid Login token alone never grants another extension's permission namespace, host administration, system administration, or resource attributes.
