# Cedros Database Concurrency Contract v2

Cedros Login requires the `cedros-data:database-concurrency-v2` semantics for
production Wasm activation. Version 2 strictly supersedes, but does not redefine, the six
operations in `database-concurrency-v1`. The immutable v1 and expanded v2
contracts, schemas, fixtures, and validators remain side by side under
`contracts/`.

## Wire and activation contract

No WIT change is required. Conditional operations use the existing
`database.batch` JSON import:

```json
{ "op": "conditional", "operationId": "identity.outbox.claim-delivery", "params": {} }
```

The additive response is `{ "applied": n, "results": [{ "operationId":
"...", "output": {} }] }`. Cedros Login validates the applied count, ordered
operation ids, and operation-specific output before accepting a result. Every
request and output schema is machine-declared in the catalogs under
`contracts/host/operations/v2/`. `guest-wire-examples.json` supplies checked
serialized requests and results; `make cedros-validate` validates them against
the schemas and guest operation catalog.

A host must install all 11 unique constraints,
implement all 22 conditional operations, enable the lifecycle write guard, and
pass the live acceptance suite before production activation. Cedros Data's
Login-specific activation gate independently blocks Wasm install and boot
binding when those invariants are unavailable. The extension manifest declares
`cedros-data:database-concurrency-v2` as required, while the host remains the
authority that proves and enforces the underlying invariants.

Conflicts cross the current string-only WIT seam as exactly:

```text
cedros.db.v1|<unique|precondition|lease>|<operation-id>
```

The marker is PII-free. Cedros Login maps only a valid marker to HTTP 409
`resource_conflict`; malformed or unknown host errors remain redacted 502s.

## Required operations

The contract covers normalized identity/organization uniqueness plus:

- purpose-bound proof consumption, first-admin claiming, last-admin demotion,
  last-owner role changes, and canonical-email transitions;
- outbox claim, expired-lease reclaim, versioned release, and idempotent
  provider-acceptance completion;
- password-reset completion with all-session revocation;
- instant-link, SSO, Solana, WebAuthn authentication, and WebAuthn credential
  registration with proof consumption and result writes in one transaction;
- signup-limit status plus capacity enforcement against a durable UTC-period
  ledger that is not replenished by account deletion;
- account creation across identity and default-organization rows, including a
  distinct completion operation that atomically adds required verification and
  outbox rows;
- idempotent invite-code redemption and versioned invite-gate release that
  preserves any concurrent redemption receipt;
- serializable-or-equivalent account and organization deletion with complete
  cascades.

The exact parameters and outputs are the JSON Schemas in:

- `identity-core.json`: proof, setup, administrator, and canonical-email ops;
- `identity-auth.json`: password, instant-link, SSO, Solana, and WebAuthn ops;
- `outbox.json`: claim, complete, and release lease transitions;
- `registration.json`: signup-limit status, account creation and completion,
  invite redemption, and gate release;
- `lifecycle.json`: membership, account deletion, and organization deletion.

## Durable lifecycle guard

Transaction isolation during deletion does not by itself prevent a stale worker
from recreating a root or child after the deletion commits. V2 therefore
requires host-owned, durable tombstones:

- account/organization deletion writes the tombstone in the same transaction;
- every ordinary `write` and batch write to a guarded root rejects a tombstoned
  entry key;
- every guarded child write locks and requires its `userId` or `orgId` parent
  to exist and not be tombstoned;
- account-owned children carry `userId`, organization-owned children carry
  `orgId`, and root UUIDs are never reused;
- a violation returns
  `cedros.db.v1|precondition|lifecycle.tombstone-guard`.

This applies to ordinary writes as well as conditional operations. It prevents
stale root updates and child inserts from resurrecting deleted graphs.

The contract term `single-host-serializable-transaction` describes the required
observable isolation, not a mandatory PostgreSQL isolation-level setting. A host
may instead use an equivalent mechanism that is phantom-safe for every declared
predicate and race. Cedros Data 0.1.9 takes an exclusive per-root lifecycle
advisory lock for deletion and the corresponding shared lock for every guarded
root or child write, together with `FOR UPDATE` row locks and predicate sweeps in
the same transaction. The live multi-worker acceptance vectors validate that
equivalence; literal `SERIALIZABLE` is not additionally required.

## Outbox safety

`claim-delivery` returns both the claimed payload and its host `updatedAt`.
`complete-delivery` and `release-delivery` require the exact lease owner and
revision, so a stale worker cannot clobber a successor. Completion persists a
durable, PII-free delivery receipt before deleting the queue row; replay after a
lost response returns `alreadyApplied` without another side effect only when the
receipt's `deliveryId` and `leaseOwner` match. The durable receipt must bind the
completing lease owner; a mismatched stale-worker replay conflicts rather than
claiming another worker's completion. Provider acceptance is still
correlation-only, so a host outage before completion can produce at-least-once
delivery; logs and metrics retain duplicate-risk context.

For `identity.account.delete`, `transferredOrganizations` counts shared
organizations where the deleted user held `owner` and another owner remains;
the deleted user's membership is removed. `detachedMemberships` counts removed
non-owner memberships. `deletedOrganizations` counts sole-member organizations
cascaded by the deletion. These categories are mutually exclusive per removed
membership.

## Invite-gate release safety

`registration.invite-gate.release` locks the versioned invite-code-account row.
For a pending row it stamps `activatedAt` at host transaction time without
changing `redemptionId` or `inviteCodeId`. An already-activated row returns an
exact `already-activated` result with the original timestamp and receipt. A
stale request conflicts. The guest then rereads the row and treats the conflict
as benign only when identity and `createdAt` are unchanged, the host revision
advanced, authoritative state is activated, and the receipt is either preserved
exactly or coherently created by a concurrent redemption. Missing, still-pending,
identity-mismatched, or receipt-erasing state fails closed. This makes gate
disablement exclusive with concurrent code redemption and prevents an
unversioned login write from erasing the receipt.

## Acceptance and release gate

Run the deterministic model check locally:

```sh
make cedros-db-concurrency-reference
```

It checks 50 vectors with 50 serialized model attempts each and is explicitly
model-only. It does not claim deployed concurrency evidence. Cedros Data must
run all 22 top-level scenarios and 28 recovery vectors against live Postgres
with at least 50 attempts across at least two independent worker pools, checking
the exact redacted marker on every rejected attempt and final database state.

The live suite includes expired-lease reclaim, stale-worker completion,
completion-response replay, proof/result atomicity, idempotent registration and
invite redemption, signup-limit reads and last-slot enforcement, atomic
registration-email rollback and response-loss replay without duplicate capacity
or email work, competing redeem/gate-release transitions, receipt-preserving
release replay, deletion rollback/cascade, and stale root/child writes both
racing and following deletion.

Cedros Login declares `minCedrosDataVersion: 0.1.82` and requires
`cedros-data:database-concurrency-v2`, `cedros-data:token-email-evidence-v1`,
`cedros-data:identity-atomic-v1`, `cedros-data:session-atomic-v1`, and
`cedros-data:signup-limit-atomic-v1` for this database contract. The extension
also requires the published `cedros-data:abuse-budget-consume-v1` host service
capability for public identity-route abuse controls. Staging must inspect the
authenticated host capability registry and exercise the released host and Login
artifacts before the production gate is satisfied. Never retain an observe-only
or unsafe fallback path when a required operation is unavailable.

Rollback is capability withdrawal plus extension deactivation. Never drop
constraints/tombstones or relax CAS while extension writes continue.
