//! cedros-login server backend as a Cedros extension wasm component.
//!
//! Implements the `cedros-login` world (a subset of `cedros:extension`): exports
//! `routes` + `jobs`, imports the host db/settings/secrets/providers/telemetry/
//! http/extension-service seams ([`host`]). It owns no database — all
//! persistence is host-mediated.
//! The standalone Axum server in `../server` is unchanged.

wit_bindgen::generate!({
    path: "wit",
    world: "cedros-login",
});

#[cfg(test)]
mod performance_tests;

mod clock;
mod context;
mod data;
mod domain;
mod host;
mod routes;
mod services;

use crate::data::cleanup::SweepReport;
use crate::exports::cedros::extension::jobs::{
    Guest as JobsGuest, JobExecution, JobOutcome, JobSpec, JobStatus,
};
use crate::exports::cedros::extension::routes::{
    Guest as RoutesGuest, RouteRequest, RouteResponse, RouteSpec,
};
use crate::host::{log, telemetry};

const CLEANUP_JOB_ID: &str = "cedros-login:cleanup-expired-auth-data";
const OAUTH_CLEANUP_JOB_ID: &str = "cedros-login:oauth-connection-cleanup";
const OUTBOX_JOB_ID: &str = "cedros-login:outbox-dispatch";
/// Max outbox entries delivered per dispatch run (bounds CPU/time per job tick).
const MAX_OUTBOX_BATCH: u32 = 50;

struct CedrosLogin;

impl RoutesGuest for CedrosLogin {
    fn list_routes() -> Vec<RouteSpec> {
        routes::list()
    }

    fn handle_route(request: RouteRequest) -> RouteResponse {
        routes::handle(request)
    }
}

impl JobsGuest for CedrosLogin {
    fn list_jobs() -> Vec<JobSpec> {
        vec![
            spec(CLEANUP_JOB_ID),
            spec(OUTBOX_JOB_ID),
            spec(OAUTH_CLEANUP_JOB_ID),
        ]
    }

    fn run_job(execution: JobExecution) -> JobOutcome {
        log::info(&format!(
            "job {} attempt {}",
            execution.job_id, execution.attempt
        ));
        match execution.job_id.as_str() {
            CLEANUP_JOB_ID => cleanup(),
            OAUTH_CLEANUP_JOB_ID => cleanup_oauth(),
            OUTBOX_JOB_ID => dispatch_outbox(),
            _ => {
                log::op_error("job", "dispatch", "unknown_job_id");
                outcome(JobStatus::Failed, r#"{"error":"unknown_job"}"#)
            }
        }
    }
}

/// Cleanup job: bounded expiry sweep across auth collections via the DB seam.
fn cleanup() -> JobOutcome {
    let mut report = data::cleanup::sweep_all();
    if !matches!(routes::oauth::cleanup::run(), Ok(result) if result.failed == 0 && result.pending == 0 && !result.has_more) {
        report.failures.push(data::cleanup::SweepFailure {
            collection: "oauth-cleanup",
            cause: "cleanup_pending",
        });
    }
    let status = cleanup_status(&report);
    let details = cleanup_details(&report);
    let details_json = details.to_string();
    if report.has_failures() || report.has_remaining_work() {
        for failure in &report.failures {
            log::op_error(
                "job",
                &format!("cleanup:{}", failure.collection),
                failure.cause,
            );
        }
        emit_job_record(CLEANUP_JOB_ID, "retryable", details);
        outcome(status, &details_json)
    } else {
        emit_job_record(CLEANUP_JOB_ID, "completed", details);
        outcome(status, &details_json)
    }
}

/// Bounded durable OAuth authority/revocation maintenance, independent of the
/// transactional-email worker. Daily expiry cleanup also retries this queue.
fn cleanup_oauth() -> JobOutcome {
    match routes::oauth::cleanup::run() {
        Ok(report) => {
            let retry = report.failed > 0 || report.pending > 0 || report.has_more;
            let details = serde_json::json!(report);
            emit_job_record(
                OAUTH_CLEANUP_JOB_ID,
                if retry { "retryable" } else { "completed" },
                details.clone(),
            );
            outcome(
                if retry { JobStatus::Retryable } else { JobStatus::Succeeded },
                &details.to_string(),
            )
        }
        Err(error) => {
            log::op_error("job", "oauth-cleanup", error.code());
            outcome(JobStatus::Retryable, r#"{"error":"oauth_cleanup_unavailable"}"#)
        }
    }
}

fn cleanup_status(report: &SweepReport) -> JobStatus {
    if report.has_failures() || report.has_remaining_work() {
        JobStatus::Retryable
    } else {
        JobStatus::Succeeded
    }
}

fn cleanup_details(report: &SweepReport) -> serde_json::Value {
    let mut details = serde_json::json!(report);
    if report.has_failures() || report.has_remaining_work() {
        if let Some(object) = details.as_object_mut() {
            object.insert(
                "error".to_string(),
                serde_json::Value::String(
                    if report.has_failures() {
                        "partial_cleanup_failed"
                    } else {
                        "cleanup_budget_exhausted"
                    }
                    .to_string(),
                ),
            );
        }
    }
    details
}

/// Outbox-dispatch job: deliver queued transactional email via the providers
/// seam, with per-entry backoff/retry. One bounded batch per run.
fn dispatch_outbox() -> JobOutcome {
    match data::outbox::dispatch(MAX_OUTBOX_BATCH) {
        Ok(stats) => {
            let details = serde_json::json!({
                "sent": stats.sent,
                "retried": stats.retried,
                "failed": stats.failed,
                "duplicateRisk": stats.duplicate_risk,
                "acknowledgementPending": stats.acknowledgement_pending,
                "acknowledgementRecovered": stats.acknowledgement_recovered,
                "hasMore": stats.has_more,
            });
            emit_job_record(
                OUTBOX_JOB_ID,
                if stats.has_more {
                    "retryable"
                } else {
                    "completed"
                },
                details.clone(),
            );
            outcome(
                if stats.has_more {
                    JobStatus::Retryable
                } else {
                    JobStatus::Succeeded
                },
                &details.to_string(),
            )
        }
        Err(e) => {
            log::op_error("job", "outbox-dispatch", e.code());
            emit_job_record(
                OUTBOX_JOB_ID,
                "failed",
                serde_json::json!({ "cause": e.code() }),
            );
            outcome(JobStatus::Retryable, r#"{"error":"db_seam_error"}"#)
        }
    }
}

fn emit_job_record(job_id: &str, status: &str, payload: serde_json::Value) {
    let (title, text) = match status {
        "completed" => (
            "Login job completed",
            "Cedros Login job completed with redacted aggregate counts.",
        ),
        "retryable" => (
            "Login job retryable",
            "Cedros Login job partially completed with redacted aggregate counts and cause codes.",
        ),
        _ => (
            "Login job failed",
            "Cedros Login job failed closed with a redacted cause code.",
        ),
    };
    let _ = telemetry::emit_record(
        "job",
        title,
        text,
        &serde_json::json!({
            "jobId": job_id,
            "status": status,
            "details": payload
        }),
    );
}

fn spec(job_id: &str) -> JobSpec {
    JobSpec {
        job_id: job_id.to_string(),
    }
}

fn outcome(status: JobStatus, details_json: &str) -> JobOutcome {
    JobOutcome {
        status,
        details_json: details_json.to_string(),
    }
}

export!(CedrosLogin);
