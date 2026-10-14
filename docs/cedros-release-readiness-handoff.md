# Cedros Deployment Checklist

`<version>` denotes the release version in `cedros-extension.manifest.json`.
Use that exact version in package metadata, archive names, and deployment checks.

This checklist describes deploying a Cedros Login release, aligned to the public
Cedros Extension Authoring kit whose `AUTHORING-KIT.json` pins platform API `1`,
WIT package `cedros:extension@0.1.0`, and canonical WIT SHA-256
`2bb16879743cfd2748b7deefefcb82204c16b55a1c1a70385f4e9707a83d48f9`.
Local package intake readiness is distinct from installed-host launch evidence.

## Release Packet

| Field | Value |
|---|---|
| Extension id | `cedros-login` |
| Version | `<version>` |
| Minimum Cedros Data host | `0.1.82` |
| Local intake archive | `dist/cedros-login-<version>.cedros-extension.zip` |
| Source review archive | `dist/cedros-login-<version>.source-review.zip` |
| Release packet | `dist/cedros-login-<version>.release.json` |
| Install gate | `ready` after local checks |
| Launch gate | `host-coordinated` |
| Supply-chain verification | `not-provided` |

The generated release packet records final archive SHA-256 values, package
members, validation evidence, known risks, and rollback instructions. Mutable
archive digests do not appear in the manifest inside the ZIP.

## Included Surfaces

- The root manifest/bootstrap, compiled React admin and web graphs, React Native
  registration runtime, and Wasm component are present in the intake archive.
- All declared server route IDs and jobs are Wasm-backed; existing IDs, owner
  content, migrations, content models, settings, events, and capabilities are
  preserved.
- Password registration with required email verification uses the public
  `registration.account.complete` operation so the account, verification token,
  outbox row, and signup-limit usage commit or roll back together.
- Signup availability uses `registration.signup-limit.status`; both registration
  creation operations enforce the same durable UTC-period ledger atomically.
- Token-backed email uses `identity.outbox.enqueue-token-email` and requires
  `cedros-data:token-email-evidence-v1` so the host can issue delivery evidence
  in the same transaction as the verification and outbox rows.
- Native screen/provider loading remains host-coordinated.

The complete machine-readable surface table is
`docs/cedros-release-readiness-map.json`.

## Host And Operator Handoffs

1. On the authenticated staging host, read
   `GET /admin/runtime/wasm-extensions/capabilities`. Confirm Cedros Data
   `>=0.1.82`, all six required capabilities
   (`cedros-data:database-concurrency-v2`,
   `cedros-data:token-email-evidence-v1`, `cedros-data:identity-atomic-v1`, and
   `cedros-data:session-atomic-v1`, `cedros-data:signup-limit-atomic-v1`, and
   `cedros-data:abuse-budget-consume-v1`), the exact WIT checksum above,
   `identity.outbox.enqueue-token-email`,
   `identity.sessions.rotate`, `identity.sessions.revoke`,
   `registration.signup-limit.status`, `registration.account.create`,
   `registration.account.complete`, `/runtime/abuse-budget/consume-v1`, and every
   additional retained operation ID in the repository's v2 concurrency contract.
   Exercise one allowed and one exhausted abuse-budget decision and verify
   datastore failures deny the request.
2. Run all 22 database-concurrency scenarios and 28 recovery vectors with at
   least 50 attempts on at least two host workers. Also inject a failure into
   password registration and prove there is either one complete account/token/
   outbox/signup-limit commit or no write.
3. If early-access registration is enabled, bind `cedros-login:invite-gate-handoff`
   to a durable waitlist write. Return `accepted: true` only with a non-empty
   receipt after that write. Otherwise leave the invite gate disabled.
4. For enabled federated login, set `CEDROS_EXTENSION_HTTP_ALLOWLIST` to only the
   exact HTTPS issuer, discovery, JWKS, and token hosts configured by the owner;
   verify that an unlisted host is denied.
5. Bind and test the native screen and provider before mobile production, or
   explicitly exclude native surfaces from that launch.

Exact owners, statuses, and requested evidence live in
`docs/cedros-host-coordination-handoff-map.json`.

## Smoke Checklist

- Upload accepts the canonical manifest/bootstrap and shows version `<version>`.
- Enable provisions the declared models and surfaces without replacing owner
  pages, forms, docs, settings, or identity records.
- Exercise one public route, one admin route with host-authenticated admin/CSRF
  context, one relying-party denial, and every declared job.
- Provider-disabled, missing-capability, missing-secret, and denied-egress paths
  fail closed with redacted diagnostics.
- Disable/re-enable preserves owner and identity data.

## Rollback

Disable `<version>` first to hide surfaces and stop new Wasm route/job execution.
Verify no registration transaction is in flight, then reinstall the previous
package family. Before rollback, confirm that the previous package supports the
installed host capabilities and existing schema. Review the release diff for
changes to IDs, migrations, and content models. Preserve all identity, audit,
settings references, secret handles, and owner-created content;
delete data only through an explicitly approved deletion workflow.

## Remaining Risks

- Local schemas and the 50-vector reference model do not prove installed-host
  behavior. Authenticated registry and live-host evidence remain production
  launch blockers.
- Native binding is unavailable locally.
- No SBOM, artifact signature, provenance attestation, or reproducible rebuild
  proof is supplied.
