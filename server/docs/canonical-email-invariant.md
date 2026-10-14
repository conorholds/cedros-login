# Canonical email invariant

Cedros stores the canonical account email in two forms for compatibility:

- `users.email` and `users.email_verified` are the denormalized authentication view.
- `user_emails` is the email identity ledger. Exactly one row is primary when a
  user has a canonical email.

The primary row must have the same normalized address and verification state as
the corresponding `users` fields. A user without a canonical email must not
have a primary row.

## Admin update semantics

`PATCH /auth/admin/users/{user_id}` validates email addresses with the same
format, ASCII-local-part, NFKC-normalization, and lowercase rules used by the
account email flow.

When an admin changes an address:

- a new address starts unverified unless `emailVerified` is explicitly set or
  the address is an already-verified secondary for that user;
- the previous address remains a secondary row, preserving its verification
  state;
- an address owned by another user is rejected;
- `users` and every affected `user_emails` row are written atomically.

An `emailVerified`-only update changes both the user field and primary-row
verification state. Name-only updates do not require or repair email state.

User-driven primary promotion uses the same persistence boundary and requires
the target secondary address to be verified.

Email-verification endpoints use a purpose-bound persistence operation that
validates token liveness and subject ownership before atomically consuming the
token and updating the matching ledger row. If that row is primary,
`users.email_verified` changes in the same commit. A failed transition leaves
the token live so the operation can be retried safely.

## Atomicity by runtime

- PostgreSQL locks the user and email rows, serializes contenders for the same
  normalized target address, and commits all writes in one transaction.
- In-memory storage holds the user, email-index, and email-ledger write locks for
  the complete transition.
- Wasm writes the user and all same-user email rows in one host database batch.
  Both content models use `cedros-login:identity-db`; cross-access batches are
  rejected before invoking the host. Verification batches include the consumed
  token. The current host ABI does not expose conditional batch/CAS, so two
  Wasm instances can both report success after reading the same unused token;
  their writes are idempotent and cannot split persisted state, but strict
  single-winner behavior requires the host concurrency contract.

Expired-pending cleanup never deletes a primary row. An unverified canonical
email remains part of the account identity until explicitly changed.

## Legacy mismatch handling

Transitions fail closed when existing state has a missing primary, multiple
primaries, a primary address mismatch, or a verification mismatch. The server
logs a redacted diagnostic containing the user identifier and mismatch class;
the Wasm runtime reports a stable operation diagnostic without the email value.
No transition auto-deletes or guesses among ambiguous legacy rows.

Operators should inspect both records and repair the intended canonical row in
a reviewed data operation before retrying. Preserve every non-primary address
unless ownership has been independently established and a separate retention
policy authorizes deletion.
