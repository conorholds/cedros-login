# Cedros Site Brain And Logging

Cedros Login emits redacted Site Brain records and structured logs through the
Wasm telemetry/logging host imports. The canonical record map is
`docs/cedros-site-brain-logging-map.json`, and the manifest declares root
`site-brain-record:*` write scopes for every durable category it uses.

## Durable Records

| Record | Category | Subject | Operator value |
|---|---|---|---|
| Setup completed | `setup` | `cedros-login:setup-completed` | Confirms auth/email/image setup steps without storing credentials. |
| Provider unavailable | `provider` | `cedros-login:provider-unavailable` | Tells owners which site provider blocks email or image workflows. |
| Job completed | `job` | `cedros-login:job-completed` | Records aggregate job outcomes for cleanup and outbox work. |
| Job failed | `job` | `cedros-login:job-failed` | Gives operators redacted recovery context for failed workers. |
| AI capability failed | `ai` | `cedros-login:ai-capability-failed` | Explains capability failures without storing prompts or raw payloads. |
| Secret lifecycle changed | `security` | `cedros-login:secret-lifecycle` | Records configured/rotated/deleted secret categories, never values. |

## Transient Logs

Route/job code logs through the Cedros logging import via the structured helpers
`log::op_error` / `op_warn` / `op_info` (`server-wasm/src/host/log.rs`), which
emit a stable `extension=cedros-login surface=<area> op=<operation> cause=<code>`
line. The `cause` is always a safe, stable code — `SeamError::code()` /
`AuthError::code()` (`db_error`, `provider_error`, `http_error`, …) or a fixed
literal — never a raw error `Display`, which carries the host's raw
db/provider/http detail. Levels: `op_error` = an operation failed/aborted (fails
closed, job aborted, security revocation failed); `op_warn` = an expected
fail-closed, degraded, or best-effort condition the request tolerated (non-fatal
enqueue/seam failure, retryable provider delivery, deferred bootstrap repair).
Routine auth failures (bad password, invalid/expired token) are normal probes
and are not logged. Admin/browser UI keeps user-facing errors safe and
non-authoritative.

Outbox delivery diagnostics additionally expose only the one-based attempt,
`duplicate_risk`, and whether an optional provider acceptance reference exists.
Standalone tracing stores the stable outbox delivery identity and opaque
provider message reference as structured operational fields. Wasm keeps those
raw identifiers in the outbox row and logs only reference presence, preserving
the host rule against direct identifiers. Both runtimes emit an explicit
post-send acknowledgement-failure warning so operators know a replay may occur.

## Redaction

Site Brain details and transient logs must exclude raw emails, phone numbers,
auth headers, cookies, bearer tokens, passwords, private keys, raw prompts, IP
addresses, user-agent strings, session ids, direct user ids, wallet addresses,
row payloads, and raw provider/downstream errors.

## Acceptance Checks

- Durable record subjects and ids are namespaced and stable.
- Details schemas contain no direct identifier or secret-like keys.
- References point to safe admin, route, job, provider, database, or AI
  resources.
- Manifest requested scopes cover every durable record category.
- Wasm job paths emit completed/failed records through telemetry mocks.
