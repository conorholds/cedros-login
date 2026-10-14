# Cedros Autosave Standard

Status: adopted.

Owner: Cedros Core Team.

Last updated: 2026-07-01.

## Goal

Cedros autosave is a shared product, frontend, backend, telemetry, and extension protocol capability. Core owns the primitives. Extensions declare resource-specific configuration and use the shared path instead of reimplementing timers, retry loops, status labels, conflict UI, or backend write semantics.

## Surface Policy

| Surface                                                                 | Current behavior                                                                                                                            | Endpoint                                                                                                                                                                                     | Classification                                              | Standard target                                                                                                                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin settings pages: auth, behavior, email, server, security, webhooks | Policy-split save path: non-secret settings use `useCedrosAutosave`; secret/high-impact fields stay on an explicit manual path              | `PATCH /admin/settings/autosave` when ETags are available; bundled extension runtimes without ETags autosave through `PATCH /admin/settings`; manual-only fields use `PATCH /admin/settings` | Mixed: non-secret settings plus secret/high-impact settings | Non-secret settings autosave through the shared state machine. Secrets and high-impact permission/compliance changes remain manual unless product/security approves an exception. |
| Legacy `SystemSettings` component                                       | Manual save/reset                                                                                                                           | `PATCH /admin/settings`                                                                                                                                                                      | Mixed/sensitive                                             | Keep manual by default.                                                                                                                                                           |
| Dashboard permissions matrix                                            | Explicit manual Save/Reset; local drafts are not sent until the admin confirms                                                              | `PUT /admin/dashboard-permissions`                                                                                                                                                           | Permission-changing, high impact                            | Manual save by default. No autosave without product/security approval and explicit review UX.                                                                                     |
| Profile name/username settings                                          | Manual inline save                                                                                                                          | `PATCH /me`                                                                                                                                                                                  | Low/medium risk user profile                                | Both allowed after backend ETag/idempotency support; username needs explicit conflict/availability handling.                                                                      |
| Complete account prompt                                                 | Manual save                                                                                                                                 | `PATCH /me`                                                                                                                                                                                  | Account setup                                               | Manual preferred.                                                                                                                                                                 |
| Org/member role/custom role/policy updates                              | Manual explicit actions                                                                                                                     | `PATCH /orgs/*`, `PATCH /members/*`, `PATCH /roles/*`, `PATCH /policies/*`                                                                                                                   | Permission/business-rule impact                             | Manual by default; no autosave without approval.                                                                                                                                  |
| SSO provider and invite-code modals                                     | Manual create/update                                                                                                                        | SSO/invite-code admin endpoints                                                                                                                                                              | Auth/security/compliance impact                             | Manual only by default.                                                                                                                                                           |
| Wasm extension route mirrors                                            | Settings PATCH is composed through the shared autosave UI fallback where the host route has no ETag; other PATCH/PUT handlers remain manual | `server-wasm/src/routes/*`                                                                                                                                                                   | Mirrors server resources                                    | Must compose host/core autosave protocol or an approved host-runtime fallback before certification.                                                                               |

## Save Policy

Use autosave for long-form drafts, low-risk incremental edits, and fields where automatic persistence clearly reduces data loss. Do not use autosave by default for security-sensitive, privacy-sensitive, financial, irreversible, destructive, permission-changing, publication-changing, or compliance-sensitive edits.

Manual save may coexist with autosave when users need explicit confirmation. Every autosave surface must show one shared status language: `Unsaved changes`, `Saving...`, `Saved just now`, `Offline - changes will sync`, `Conflict - review changes`, or `Save failed - retry`.

## Frontend API

Canonical package exports:

- `CedrosAutosaveProvider`
- `useCedrosAutosave<TPatch, TResource>()`
- `AutosaveStatusIndicator`
- `AutosaveConflictDialog`
- `AutosaveRetryBanner`
- `useCedrosAutosaveTelemetry`
- `AutosaveResourceDefinition`
- test helpers in `ui/src/autosave/testUtils.ts`

The hook owns debounce, a shared per-resource mutation lock, one in-flight mutation per hook, one latest pending snapshot, retry, offline pause/resume, IndexedDB-backed pending-draft persistence, best-effort blur/visibility/pagehide flush, before-exit warning, and telemetry. The caller owns the editable draft state and provides:

- `resourceType`
- `resourceId`
- `baseRevision` or `etag`
- `confirmedDraft`
- `draft`
- `makePatch(previous, current)`
- `validatePatch(patch)`
- `save(patch, metadata)`
- `debounceProfile`
- `conflictStrategy`
- `persistenceKey`
- `enabled`
- `blockedFields`
- lifecycle callbacks

Implemented debounce profiles:

| Profile        |   Delay | Lifecycle flush | Saved visible | Retry delays             |
| -------------- | ------: | --------------- | ------------: | ------------------------ |
| `text`         |  800 ms | yes             |       2000 ms | 500 ms, 1500 ms          |
| `longDraft`    | 1200 ms | yes             |       2500 ms | 750 ms, 2000 ms, 5000 ms |
| `selectToggle` |  150 ms | yes             |       2000 ms | 500 ms, 1500 ms          |
| `background`   | 2000 ms | no              |       1500 ms | 1000 ms, 3000 ms         |

Local persistence decision: the API is `CedrosAutosavePersistence` on `CedrosAutosaveProvider`. The package default is `createIndexedDbAutosavePersistence()` for structured unsent queues, with an in-memory fallback for browsers or server-side environments where IndexedDB is unavailable. `CedrosAutosavePersistenceStorage` remains a deprecated type alias for compatibility.

## Backend API

Canonical module: `server/src/autosave/mod.rs`.

Preferred HTTP shape:

```http
PATCH /api/{resource_type}/{resource_id}
If-Match: "<resource_type>:<revision>"
Idempotency-Key: "<uuid-or-random-key>"
Content-Type: application/json
```

```json
{
  "autosave": true,
  "clientMutationId": "uuid",
  "editingSessionId": "uuid",
  "clientSeq": 123,
  "updateMask": ["fieldA", "nested.fieldB"],
  "patch": {},
  "schemaVersion": "v1"
}
```

Successful response:

```json
{
  "resourceId": "resource-id",
  "revision": 124,
  "etag": "\"resource_type:124\"",
  "savedAt": "server timestamp",
  "canonicalPatchOrResource": {},
  "warnings": []
}
```

Backend decisions:

- Use both strong ETags and numeric revisions. `If-Match` is required on mutable autosave writes; the response includes both `revision` and `etag`.
- Use resource-specific handlers composed with the shared autosave layer, not one generic unsafe catch-all write endpoint.
- Idempotency keys are scoped by tenant, user, resource type, resource id, operation, and key.
- Idempotency TTL is 72 hours by default. PostgreSQL deployments persist keys in `autosave_idempotency_keys`; in-memory deployments retain keys in the owning repository process.
- A resource mutation and its completed replay payload must share one atomic persistence boundary. PostgreSQL implementations use one database transaction; the in-memory implementation uses one repository critical section. Repositories that cannot provide this guarantee fail closed instead of performing a write followed by fallible idempotency completion.
- Store normalized payload fingerprints/hashes, not raw draft content.
- Return `application/problem+json` for autosave protocol failures.

Error mapping:

| Status | Meaning                                                                                         |
| ------ | ----------------------------------------------------------------------------------------------- |
| 400    | malformed request or missing required autosave headers/fields                                   |
| 401    | unauthenticated                                                                                 |
| 403    | unauthorized                                                                                    |
| 404    | resource not found                                                                              |
| 409    | idempotency key in progress or non-ETag resource conflict                                       |
| 412    | stale `If-Match` / revision conflict                                                            |
| 413    | payload too large                                                                               |
| 422    | invalid patch, invalid field, schema violation, idempotency key reused with a different payload |
| 429    | rate limited                                                                                    |
| 5xx    | retryable server failure unless documented otherwise                                            |

## Extension Contract

An extension must define `AutosaveResourceDefinition`:

- `extensionId`
- `resourceType`
- resource id derivation
- patch schema version
- allowed autosave fields
- blocked fields
- debounce profile
- optimistic UI policy
- conflict strategy
- validation rules
- authz requirements
- data sensitivity classification
- payload size expectation
- local persistence needs
- telemetry labels
- migration notes

No extension is autosave-compliant until it uses the core hook/provider, backend protocol, shared status UI, telemetry events, and required tests.

## Blocked Resource Types

Blocked from autosave by default:

- credentials, tokens, secrets, API keys, SSO providers, OAuth provider credentials
- auth/security policy toggles unless approved
- permissions, roles, memberships, org ownership, admin status
- billing, financial, subscription, publication, deletion, destructive, and compliance-sensitive resources
- interdependent multi-field forms that are invalid until complete

No current Cedros Login resource needs collaborative editing or CRDT behavior. If a future resource needs multi-cursor or real-time merge semantics, it must use a separate collaboration RFC rather than ordinary autosave.

## Reference Implementations

Frontend core/reference:

- `ui/src/autosave/useCedrosAutosave.ts`
- `ui/src/autosave/CedrosAutosaveProvider.tsx`
- `ui/src/autosave/persistence.ts`
- shared status/conflict/retry components
- tests in `ui/src/autosave/useCedrosAutosave.test.tsx`

Current Cedros Login extension reference path:

- `ui/src/hooks/useSettingsAutosave.ts` bridges non-secret settings fields to `useCedrosAutosave`.
- `ui/src/hooks/systemSettingsAutosavePolicy.ts` is the frontend non-secret autosave policy.
- `ui/src/components/admin/settings/ManualSettingCommitActions.tsx` gives secret/manual-only settings an explicit shared confirm/cancel path on pages that still expose those fields.
- This standardizes queueing, retry, offline status, local pending state, accessible status UI, and manual-only confirmation UX for existing settings users.
- Other Cedros packages can adopt these exported primitives and guardrails, but
  their migrations and persistence contracts remain owned by those packages.

Backend reference:

- `server/src/autosave/mod.rs` provides header extraction, ETag revision helpers, problem+json errors, payload fingerprinting, request validation, payload/update-mask validation, `AutosaveWriteRequest`, the `AutosaveResource` trait, and 413/429 mappings.
- `server/src/autosave/idempotency.rs` provides scoped retry-safe idempotency reservation/replay with a 72-hour default TTL and Postgres-backed storage when available.
- `server/src/handlers/admin/settings_autosave.rs` is the concrete Cedros Login reference handler for non-secret system settings. It requires `If-Match` and `Idempotency-Key`, validates update masks against known non-secret settings, rejects secret/high-impact keys, uses atomic revision compare-and-set, returns problem+json conflicts, and logs only setting keys plus revision metadata.

## Required Tests

Frontend shared tests must cover:

- debounce behavior
- blur/manual flush
- queue superseding old pending snapshots
- no parallel writes for the same resource
- stale response cannot overwrite newer drafts
- retry after transient failure
- offline pause/resume
- refresh/remount with local pending changes
- route leave warning
- accessible status messaging
- conflict UI
- React Strict Mode behavior

Backend resource tests must cover:

- atomic revision compare-and-set
- concurrent write race behavior
- duplicate idempotency key returns the same result
- duplicate key with different payload returns 422
- stale ETag returns 412
- blocked fields return 422
- validation failures return 422
- payload limits return 413
- rate limits return 429
- problem+json shape
- no sensitive draft content in logs or fingerprints

## Telemetry

Emit these events without raw draft content:

- `autosave_dirty`
- `autosave_queued`
- `autosave_started`
- `autosave_succeeded`
- `autosave_failed`
- `autosave_retrying`
- `autosave_conflict`
- `autosave_offline_paused`
- `autosave_resumed`
- `autosave_discarded`
- `autosave_local_restore`
- `autosave_manual_flush`

Each event includes `resourceType`, optional `extensionId`, `status`, duration, retry count, conflict type, payload size bucket, queue depth, network state, and request/trace ID when available.

## Adoption Checklist

1. Inventory each extension write surface and classify it as autosave, manual save, or both.
2. Add an `AutosaveResourceDefinition` for approved autosave resources.
3. Replace raw timers/fetch loops with `useCedrosAutosave`.
4. Add shared status UI and retry/conflict UI.
5. Move backend writes to resource-specific handlers that compose `server/src/autosave/mod.rs`.
6. Add frontend, backend, and e2e failure simulations.
7. Keep `scripts/audit-autosave-standard.mjs` free of migration allowlist entries; any new ad-hoc autosave loop is a build failure.

## Enforcement

`npm run check:autosave` and `npm run audit:autosave` run `scripts/audit-autosave-standard.mjs`, which scans `ui/src`, local extension/package roots, and sibling `cedros-providers-manager` / `cedros-domains-manager` checkouts when present. `make lint-ui` runs it after ESLint and i18n checks. There are no migration allowlist entries; dashboard permissions are manual-save and new ad-hoc autosave loops fail the audit.

## Certification Checklist

An autosave surface is certified only when:

- It uses `CedrosAutosaveProvider` and `useCedrosAutosave`.
- It uses `AutosaveStatusIndicator` or an approved wrapper.
- It has an `AutosaveResourceDefinition`.
- Its backend handler requires `If-Match` and `Idempotency-Key`.
- It validates schema, allowed fields, blocked fields, authz, payload size, and invariants.
- It returns autosave `application/problem+json` errors.
- It has happy-path, edge-case, conflict, retry, offline, and accessibility tests.
- It emits standard telemetry without sensitive values.
