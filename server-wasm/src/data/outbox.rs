//! Transactional-email outbox over the host DB seam (`cedros-login:outbox`,
//! identity-db). Routes enqueue a fully-rendered email; the outbox-dispatch job
//! [`dispatch`] sends it via the `providers` seam with bounded exponential
//! backoff. This decouples email from the request path (no latency/failure
//! coupling) and gives durability + retry — the standalone's outbox_worker.
//!
//! Delivery is at least once across provider acceptance + local acknowledgement.
//! The stable outbox-derived key is correlation metadata unless the host provider
//! explicitly implements deduplication; a crash before acknowledgement can send
//! a duplicate.
//!
//! Successful sends are deleted (the queue stays lean); entries that exhaust
//! `max_attempts` are kept as `failed` for inspection. Recipient + token live in
//! the row, so it is sensitive and short-lived.
use crate::clock;
use crate::data::verifications::VerificationEntry;
use crate::host::db::{
    self, AtomicBatchOp, BatchOp, ConditionalBatchOp, ConditionalOperation, Query, OUTBOX,
};
use crate::host::{log, Result, SeamError};
use uuid::Uuid;

#[path = "outbox_claim.rs"]
mod claim;
#[path = "outbox_delivery.rs"]
mod delivery;
#[path = "outbox_state.rs"]
mod state;
#[path = "outbox_transition.rs"]
mod transition;
#[cfg(test)]
use state::BACKOFF_CAP_SECS;
use state::DEFAULT_MAX_ATTEMPTS;
pub use state::{DispatchStats, OutboxEntry, STATUS_FAILED, STATUS_PENDING};

/// Queue a rendered email for delivery (due immediately).
pub fn enqueue_email(
    to: &str,
    subject: &str,
    html_body: Option<&str>,
    text_body: Option<&str>,
) -> Result<()> {
    enqueue(None, to, subject, html_body, text_body)
}

/// Queue email owned by an existing account so lifecycle deletion can purge it.
pub fn enqueue_user_email(
    user_id: &str,
    to: &str,
    subject: &str,
    html_body: Option<&str>,
    text_body: Option<&str>,
) -> Result<()> {
    enqueue(Some(user_id), to, subject, html_body, text_body)
}

/// Atomically persist a single-use token and its required email work through
/// the Core identity database grant.
pub fn enqueue_token_email(
    token: &VerificationEntry,
    to: &str,
    subject: &str,
    html_body: Option<&str>,
    text_body: Option<&str>,
) -> Result<()> {
    let email = prepare_user_email(&token.user_id, to, subject, html_body, text_body);
    enqueue_prepared_token_email(token, &email)
}

/// Build, but do not persist, a rendered account-owned outbox row. Registration
/// uses this to include required verification mail in the host's published
/// `registration.account.complete` transaction.
pub fn prepare_user_email(
    user_id: &str,
    to: &str,
    subject: &str,
    html_body: Option<&str>,
    text_body: Option<&str>,
) -> OutboxEntry {
    new_entry(
        Some(user_id),
        to,
        subject,
        html_body,
        text_body,
        Uuid::new_v4().to_string(),
        clock::now_iso(),
    )
}

/// Atomically persist an already prepared single-use token and email row.
pub fn enqueue_prepared_token_email(token: &VerificationEntry, email: &OutboxEntry) -> Result<()> {
    db::batch_with_results(&token_email_ops(token, email)?)?;
    Ok(())
}

/// Atomically persist companion identity writes with a token and its email.
pub fn enqueue_token_email_with_ops(
    token: &VerificationEntry,
    to: &str,
    subject: &str,
    html_body: Option<&str>,
    text_body: Option<&str>,
    companion_ops: Vec<BatchOp>,
) -> Result<()> {
    let email = prepare_user_email(&token.user_id, to, subject, html_body, text_body);
    let mut ops = companion_ops
        .into_iter()
        .map(AtomicBatchOp::from)
        .collect::<Vec<_>>();
    ops.extend(token_email_ops(token, &email)?);
    db::batch_with_results(&ops)?;
    Ok(())
}

fn token_email_ops(token: &VerificationEntry, email: &OutboxEntry) -> Result<Vec<AtomicBatchOp>> {
    let token_value =
        serde_json::to_value(token).map_err(|error| SeamError::Encoding(error.to_string()))?;
    let email_value =
        serde_json::to_value(email).map_err(|error| SeamError::Encoding(error.to_string()))?;
    Ok(vec![ConditionalBatchOp::new(
        ConditionalOperation::EnqueueTokenEmail,
        serde_json::json!({
            "verification": {"entryKey": token.id, "data": token_value},
            "outbox": {"entryKey": email.id, "data": email_value},
        }),
    )
    .into()])
}

fn enqueue(
    user_id: Option<&str>,
    to: &str,
    subject: &str,
    html_body: Option<&str>,
    text_body: Option<&str>,
) -> Result<()> {
    let now = clock::now_iso();
    let id = Uuid::new_v4().to_string();
    let entry = new_entry(user_id, to, subject, html_body, text_body, id, now);
    db::write(OUTBOX, &entry.id, &entry)
}

fn new_entry(
    user_id: Option<&str>,
    to: &str,
    subject: &str,
    html_body: Option<&str>,
    text_body: Option<&str>,
    id: String,
    now: String,
) -> OutboxEntry {
    OutboxEntry {
        id,
        user_id: user_id.map(str::to_string),
        to: to.to_string(),
        subject: subject.to_string(),
        html_body: html_body.map(str::to_string),
        text_body: text_body.map(str::to_string),
        status: STATUS_PENDING.to_string(),
        attempts: 0,
        max_attempts: DEFAULT_MAX_ATTEMPTS,
        created_at: now.clone(),
        next_attempt_at: now,
        last_error: None,
        provider_accepted_at: None,
        provider_message_ref: None,
        lease_owner: None,
        lease_expires_at: None,
        host_fields: Default::default(),
    }
}

/// Delete `failed` outbox rows older than `cutoff`. A failed row still holds the
/// recipient address and the rendered (token-bearing) email body, so it must not
/// be retained indefinitely — the durable exhaustion is already recorded
/// redacted via the site-brain record. Bounded by `page`; mirrors
/// `db::sweep_expired` but adds the `status == failed` filter.
pub fn sweep_failed(cutoff_iso: &str, page: u32) -> Result<u64> {
    let rows = db::read_entries(
        OUTBOX,
        &Query {
            filters: vec![
                db::eq("status", STATUS_FAILED),
                db::lt("createdAt", cutoff_iso),
            ],
            order_by: Some(db::asc("createdAt")),
            limit: Some(page),
            ..Default::default()
        },
    )?;
    let ops: Vec<db::BatchOp> = rows
        .iter()
        .map(|e| db::BatchOp::delete(OUTBOX, &e.entry_key))
        .collect();
    db::batch(&ops)
}

/// Process up to `max` due entries: send via the provider, delete on success,
/// reschedule with backoff on failure, mark `failed` once attempts are exhausted.
/// Per-entry failures don't abort the batch.
pub fn dispatch(max: u32) -> Result<DispatchStats> {
    let now = clock::now_iso();
    let worker = format!("cedros-login-outbox-{}", Uuid::new_v4());
    let mut stats = DispatchStats::default();
    let candidates = claim::find_candidates(&now, max.saturating_add(1))?;
    stats.has_more = candidates.len() > max as usize;
    for candidate in candidates.into_iter().take(max as usize) {
        let entry = match claim::claim(&candidate.id, &worker) {
            Ok(Some(entry)) => entry,
            Ok(None) => continue,
            Err(error) => {
                stats.retried += 1;
                log::op_warn("outbox", "claim-delivery", error.code());
                continue;
            }
        };
        delivery::process(entry, &now, &mut stats);
    }
    Ok(stats)
}

/// Immediately attempt one already-persisted outbox entry. Registration and
/// verification routes use this after their durable write commits so customers
/// do not wait for the scheduled dispatcher; any failure leaves the row queued
/// for the ordinary retry job.
pub fn dispatch_one(entry_id: &str) -> Result<DispatchStats> {
    let now = clock::now_iso();
    let worker = format!("cedros-login-outbox-immediate-{}", Uuid::new_v4());
    dispatch_one_with(entry_id, &now, &worker, claim::claim, delivery::process)
}

fn dispatch_one_with<C, P>(
    entry_id: &str,
    now: &str,
    worker: &str,
    claim_entry: C,
    process_entry: P,
) -> Result<DispatchStats>
where
    C: FnOnce(&str, &str) -> Result<Option<claim::ClaimedOutbox>>,
    P: FnOnce(claim::ClaimedOutbox, &str, &mut DispatchStats),
{
    let mut stats = DispatchStats::default();
    if let Some(entry) = claim_entry(entry_id, worker)? {
        process_entry(entry, now, &mut stats);
    }
    Ok(stats)
}

#[cfg(test)]
#[path = "outbox_tests.rs"]
mod tests;
