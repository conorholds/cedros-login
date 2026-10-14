# Cedros Automation Jobs

This guide covers every Cedros Login job ID. Canonical schedule examples,
metadata schemas, retry/idempotency rules, notification assumptions, and
owner-visible outcome records live in `docs/cedros-automation-jobs-map.json`.
Executors are backed by the packaged server Wasm component.

## Manifest Job IDs

| Job ID | Purpose | Executor export | Default enabled? | Runtime status |
|---|---|---|---:|---|
| `cedros-login:cleanup-expired-auth-data` | cleanup expired auth data and stale challenges | `cleanup_expired_auth_data_executor` | no | `wasm-ready` |
| `cedros-login:outbox-dispatch` | dispatch queued auth/account emails through host email provider | `outbox_dispatch_executor` | no | `wasm-ready` |
| `cedros-login:oauth-connection-cleanup` | recheck OAuth authority and hand backing-key cleanup to the durable host worker | `oauth_connection_cleanup_executor` | no | `wasm-ready` |

Schedule instances remain Cedros automation settings. Extension disable pauses
schedules and executor calls fail closed until re-enable.

## Job Runtime Rules

| Job ID | Cron | Timeout | Retries | Concurrency | Idempotency |
|---|---|---:|---:|---|---|
| `cedros-login:cleanup-expired-auth-data` | `0 */6 * * *` | 300s | 0 | single-flight/site | site id + schedule instance + retention cutoff |
| `cedros-login:outbox-dispatch` | `*/5 * * * *` | 180s | 0 | concurrent/host-leased row | at-least-once; stable outbox identity + optional provider acceptance reference |
| `cedros-login:oauth-connection-cleanup` | `*/2 * * * *` | 60s | 0 | concurrent/host-CAS grant row | immutable grant binding; durable cancellation fencing |

Outbound delivery is not exactly-once: provider acceptance and local queue
acknowledgement are separate operations. A failure between them can replay the
same stable delivery identity. Hosts may suppress that replay only when their
email provider contract explicitly supports idempotency; correlation metadata
alone is not a duplicate-send guarantee.

Every provider call is preceded by host-owned
`identity.outbox.claim-delivery`. The guest processes the returned payload and
host revision, completes provider acceptance through idempotent
`identity.outbox.complete-delivery`, and releases retry/failure through
versioned `identity.outbox.release-delivery`. Both terminal operations bind the
lease owner and revision, so a stale worker cannot overwrite its successor.
Expired `sending` leases remain reclaimable after a worker crash.

Messages created for an existing account persist a nullable `userId` ownership
link. The composite account-lifecycle transaction uses it to delete queued
verification, reset, deletion, instant-link, account-email, and security-alert
mail with the account. Pre-account organization invitations intentionally keep
the field null.

Job metadata is small, safe JSON with a 2048-byte limit. It may contain dry-run
flags, batch sizes, opaque cursor references, and opaque window references. It
must not contain tokens, provider credentials, raw PII, private keys, raw row
payloads, or email bodies.

## Owner-Visible Outcomes

Jobs emit Site Brain/telemetry records for successful and failed runs. Logs use
safe details: counts, opaque references, retryable cause codes, and next-step
guidance. Supported outcome statuses remain `succeeded`, `failed`, and
`retryable`; other states are platform extension requests.

## Acceptance Checks

- `docs/cedros-automation-jobs-map.json` covers every id in
  `surfaces.server.jobs[]`.
- Every schedule example uses valid 5-field cron, an IANA timezone, timeout
  `1..86400`, and `maxRetries = 0` because automatic executor retries are unsupported.
- Every job declares safe metadata, retryable conditions, idempotency,
  notification behavior, Site Brain record plans, and staging verification.
- No job metadata carries secrets or raw PII.
