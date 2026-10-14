//! Provider delivery plus host-owned lease/version checked transitions.
use super::claim::ClaimedOutbox;
use super::state::{backoff_secs, DispatchStats, OutboxEntry, STATUS_FAILED, STATUS_PENDING};
use super::transition;
use crate::clock;
use crate::host::providers::{self, EmailAcceptance, EmailMessage};
use crate::host::{log, telemetry};

pub(super) fn process(claimed: ClaimedOutbox, now: &str, stats: &mut DispatchStats) {
    if let Some(accepted_at) = claimed.entry.provider_accepted_at.clone() {
        recover_acknowledgement(&claimed, &accepted_at, stats);
        return;
    }
    send_claimed(&claimed, now, stats);
}

fn recover_acknowledgement(claimed: &ClaimedOutbox, accepted_at: &str, stats: &mut DispatchStats) {
    let acceptance = EmailAcceptance {
        provider_message_ref: claimed.entry.provider_message_ref.clone(),
    };
    match transition::complete(claimed, accepted_at, &acceptance) {
        Ok(_) => stats.acknowledgement_recovered += 1,
        Err(error) => {
            stats.acknowledgement_pending += 1;
            log::op_warn("outbox", "recover-provider-acceptance", error.code());
        }
    }
}

fn send_claimed(claimed: &ClaimedOutbox, now: &str, stats: &mut DispatchStats) {
    let entry = &claimed.entry;
    let duplicate_risk = entry.attempts > 1;
    stats.duplicate_risk += u64::from(duplicate_risk);
    log_attempt(entry, duplicate_risk);
    let idempotency_key = delivery_id(&entry.id);
    let message = EmailMessage {
        to: &entry.to,
        subject: &entry.subject,
        html_body: entry.html_body.as_deref(),
        text_body: entry.text_body.as_deref(),
        contract_version: Some(providers::EMAIL_MESSAGE_CONTRACT_VERSION),
        idempotency_key: Some(&idempotency_key),
        attempt: Some(entry.attempts),
        duplicate_risk: Some(duplicate_risk),
        essential_email_evidence: entry.host_fields.get("essentialEmailEvidence"),
    };
    match providers::send_email(&message) {
        Ok(acceptance) => record_acceptance(claimed, now, duplicate_risk, acceptance, stats),
        Err(error) => record_provider_failure(claimed, error.code(), stats),
    }
}

fn record_acceptance(
    claimed: &ClaimedOutbox,
    now: &str,
    duplicate_risk: bool,
    acceptance: EmailAcceptance,
    stats: &mut DispatchStats,
) {
    let reference = acceptance.provider_message_ref.is_some();
    log::outbox_delivery(
        "info",
        "provider-accepted",
        acceptance_cause(reference),
        claimed.entry.attempts,
        duplicate_risk,
        reference,
    );
    stats.sent += 1;
    if let Err(error) = transition::complete(claimed, now, &acceptance) {
        stats.acknowledgement_pending += 1;
        log::op_warn("outbox", "complete-provider-acceptance", error.code());
    }
}

fn record_provider_failure(claimed: &ClaimedOutbox, cause: &str, stats: &mut DispatchStats) {
    let entry = &claimed.entry;
    let terminal = entry.attempts >= entry.max_attempts;
    let (status, retry_at) = if terminal {
        (STATUS_FAILED, entry.next_attempt_at.clone())
    } else {
        (STATUS_PENDING, clock::in_secs(backoff_secs(entry.attempts)))
    };
    match transition::release(claimed, status, &retry_at, cause) {
        Ok(released) if terminal => {
            stats.failed += 1;
            emit_permanent_failure(&released);
        }
        Ok(_) => {
            stats.retried += 1;
            log::op_warn("outbox", "delivery-retry", cause);
        }
        Err(error) => {
            stats.retried += 1;
            log::op_warn("outbox", "release-delivery-lease", error.code());
        }
    }
}

fn log_attempt(entry: &OutboxEntry, duplicate_risk: bool) {
    let cause = if duplicate_risk {
        "duplicate_risk_replay"
    } else {
        "first_attempt"
    };
    let level = if duplicate_risk { "warn" } else { "info" };
    log::outbox_delivery(
        level,
        "delivery-attempt",
        cause,
        entry.attempts,
        duplicate_risk,
        entry.provider_message_ref.is_some(),
    );
}

fn emit_permanent_failure(entry: &OutboxEntry) {
    let _ = telemetry::emit_record(
        "provider", "Login email delivery failed",
        "A queued transactional email exhausted its retries and was not delivered by the site email provider.",
        &serde_json::json!({
            "providerAccessId": providers::EMAIL_ACCESS,
            "feature": "transactional-email",
            "cause": entry.last_error.as_deref().unwrap_or("provider_error"),
        }),
    );
}

const fn acceptance_cause(reference: bool) -> &'static str {
    if reference {
        "acceptance_ref_present"
    } else {
        "acceptance_ref_unavailable"
    }
}

pub(super) fn delivery_id(outbox_id: &str) -> String {
    format!("cedros-login-outbox-{outbox_id}")
}
