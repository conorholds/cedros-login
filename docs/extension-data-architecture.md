# Extension platform Architecture

This document covers the packaged `server-wasm` backend and its React and React
Native clients. The Axum crate in `server/` is a separate standalone deployment
and manifest source; its PostgreSQL repositories are not linked into the Wasm
component.

## Runtime Boundary

The Wasm backend has no direct SQL client, database pool, filesystem database,
or durable process-local state. Cedros Core supplies scoped host imports for:

- database reads, counts, writes, deletes, and conditional batches;
- settings and secret access;
- email and object-storage providers;
- bounded HTTP egress;
- logging, analytics, Site Brain records, routes, and scheduled jobs.

Every operation selects a manifest-declared access ID. A missing grant,
capability, provider, or secret fails closed. Host errors become stable redacted
responses; payloads, tokens, email bodies, and database diagnostics are not
copied into logs or telemetry.

## Authoritative platform

Identity, session, proof, credential, organization, settings, audit, and outbox
records are authoritative in the Cedros host. Browser/native state is display
state only and cannot grant access.

The signup access code is a credential: catalog reads and writes use the
host secret seam. Existing plaintext `signup_access_code` settings migrate on
first use; the encrypted write must succeed before the legacy setting is
cleared. A configured encrypted value (including an intentionally empty value)
always takes precedence, and host failures never disable the signup gate.

Sensitive transitions use typed host operations and per-access atomic batches:

- password registration with required verification commits the account,
  verification proof, and outbox work through `registration.account.complete`;
- refresh rotation and session revocation use the
  `cedros-data:session-atomic-v1` contract;
- verification proofs, required email work, and new pending account emails are
  batched before a route reports queued success;
- canonical email, MFA, invite redemption, last-owner/last-admin, and lifecycle
  changes use the conditional operations declared by the database-concurrency
  contract.

The host must implement the required uniqueness constraints, lifecycle guards,
and conditional operations. The executable contract and staging requirements
are documented in
[cedros-database-concurrency-contract.md](cedros-database-concurrency-contract.md).

## Read and Cache Model

Wasm repository reads are request-scoped. Revocable authentication and
authorization data is not cached in guest process memory.

Web and native clients use short-lived in-memory single-flight caches for
display reads. Keys include the server, identity/token generation, resource,
and request parameters as appropriate. Successful mutations invalidate related
entries; identity changes make old entries unreachable; stale responses are
discarded. Permission, membership, session, and account state is still checked
by Core when an action executes.

The web active-organization preference is local, user-scoped convenience state.
It is never treated as authoritative membership. Token persistence follows each
client package's security contract and is separate from response caching.

## Writes and Ambiguous Outcomes

Clients do not automatically replay non-idempotent mutations. A timeout can
occur after Core committed a write, so callers should inspect authoritative
state before retrying. Success responses are returned only after the guest has
validated the expected host result shape and operation IDs.

Settings autosave is revisioned, serialized per resource, and idempotency-keyed.
Conflicts remain visible rather than being overwritten. Other account and
organization mutations are immediate and invalidate client display caches only
after a successful response.

## External Effects

Email uses a durable outbox and scheduled dispatch job. Provider acceptance and
local acknowledgement cannot share a transaction, so delivery is at least once
and duplicate messages remain possible. A queued response proves durable work,
not recipient delivery.

Avatar storage and identity metadata cross the object-storage and database
seams. They cannot commit atomically with the current host interface. Stable
per-user object keys and truthful failures make retries converge, but a failed
metadata update can leave an unreferenced object and a failed delete metadata
update can leave stale metadata.

## Realtime and Jobs

No Login UI flow currently requires an extension-owned WebSocket or SSE
channel. Normal request responses, explicit refresh, short display caches, and
the host-owned dashboard refresh contract cover current UI state. The local
rate-limit countdown performs no network polling.

Core schedules the cleanup and outbox jobs. Claims, leases, completion receipts,
retry limits, and failure records are durable host data. A browser is never the
owner of email delivery or cleanup progress.

## Cross-Layer Guarantees

| User action | Authoritative boundary | Client behavior | Important limitation |
| --- | --- | --- | --- |
| Register or sign in | Host identity/session operation | Hydrate from the returned user/session | Verification or invite gates may defer a usable session |
| Request a proof email | Proof and outbox batch | Report queued state | Queued is not delivered |
| Change an email | Canonical-email/proof operations | Preserve old address until verification | Proof is single use |
| Edit profile or settings | Host write or revisioned update | Invalidate after commit | Timeout can mean unknown completion |
| Upload or delete avatar | Storage plus identity metadata | Preserve prior image on failure | No cross-provider transaction |
| Change membership or delete data | Conditional/lifecycle operation | Refetch after success | Tenant and last-owner rules are action-time checks |
| Dispatch email | Lease, provider call, completion receipt | No optimistic delivery claim | Provider boundary is at least once |

## Verification

Use `make cedros-validate` for manifest and contract alignment, run the targeted
Wasm and client tests for changed paths, and complete the installed-host smoke
and concurrency checks in [RUNTIME-TESTING.md](RUNTIME-TESTING.md). Local mocks
do not prove a deployed Core implementation or provider configuration.
