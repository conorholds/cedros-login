# Outbox Email Delivery Contract

Cedros Login provides **at-least-once** outbound email delivery. Provider
acceptance and the local outbox acknowledgement cannot share one transaction.
If the provider accepts a message and acknowledgement then fails, a later worker
attempt may submit the same message again.

Each persisted outbox row produces a stable, non-PII delivery identity:
`cedros-login-outbox-{outbox UUID}`. Attempts reuse that identity and carry a
one-based attempt number plus a `duplicateRisk` flag. Provider acceptance
references are stored when available. Logs include the delivery identity,
attempt, duplicate-risk state, provider reference, and acknowledgement outcome,
but never recipients, subjects, bodies, tokens, or provider credentials.

## Standalone Postmark

Postmark receives the stable identity as a custom RFC `Message-ID` header and as
`cedros-delivery-id` metadata. Its returned `MessageID` is stored for correlation
with delivery/bounce activity. Postmark explicitly does not support idempotency
keys, so neither the custom header nor metadata suppresses a repeated API send.
See Postmark's official [email API](https://postmarkapp.com/developer/api/email-api),
[single-email guide](https://postmarkapp.com/developer/user-guide/send-email-with-api/send-a-single-email),
and [idempotency-key statement](https://postmarkapp.com/support/article/what-is-an-idempotency-key).

## Wasm Host Provider Handoff

`email.send` keeps the original fields and adds optional contract-v1 fields:

- `contractVersion: 1`
- `idempotencyKey`: the stable outbox-derived identity
- `attempt`: the one-based attempt
- `duplicateRisk`: whether an earlier attempt may have reached a provider

The success response may be empty for existing hosts or JSON containing
`providerMessageRef` (legacy `messageId` is also accepted). Hosts must ignore
unknown additive fields. A host may advertise duplicate suppression only if it
durably binds `idempotencyKey` to the original provider acceptance and returns
that acceptance on retries without sending again. Otherwise the key is
correlation-only and the at-least-once warning remains.

Wasm records a provider acceptance before retrying a failed local delete when
the database seam is still writable. A subsequent job then retries only the
acknowledgement. A process failure before that record, or failure of both delete
and acceptance persistence, can still replay delivery.
