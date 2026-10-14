//! Diagnostic logging through the always-granted host `logging` seam.
//!
//! Redaction is the caller's responsibility — never log tokens, secrets, raw
//! emails, IDs, or PII, and never the raw Display of a downstream/seam error
//! (which carries the host's raw db/provider/http detail). The host tracing
//! pipeline is operator/owner-adjacent; the redaction contract lives in
//! `docs/cedros-site-brain-logging.md`.
//!
//! Prefer the structured [`op_error`]/[`op_warn`]/[`op_info`] helpers: they emit
//! a stable `extension=… surface=… op=… cause=…` line so operators can filter
//! this extension's lines, and they keep `cause` a safe, stable code (e.g.
//! [`crate::host::SeamError::code`]) rather than a raw error string.
use crate::cedros::extension::logging;

/// Stable prefix so operators can filter this extension in the shared host
/// tracing pipeline.
const EXTENSION_ID: &str = "cedros-login";

pub fn info(message: &str) {
    logging::log("info", message);
}

pub fn warn(message: &str) {
    logging::log("warn", message);
}

pub fn error(message: &str) {
    logging::log("error", message);
}

/// A redacted, structured diagnostic line. `surface`/`operation` are stable
/// extension-defined labels; `cause` MUST be a safe, stable code (never a raw
/// error Display, which leaks downstream/provider/db detail).
fn structured(surface: &str, operation: &str, cause: &str) -> String {
    format!("extension={EXTENSION_ID} surface={surface} op={operation} cause={cause}")
}

/// Operator error: an operation failed and fails closed / aborts.
pub fn op_error(surface: &str, operation: &str, cause: &str) {
    error(&structured(surface, operation, cause));
}

/// Operator warning: an expected fail-closed, degraded, or best-effort
/// condition the request tolerated (e.g. a non-fatal enqueue/seam failure).
pub fn op_warn(surface: &str, operation: &str, cause: &str) {
    warn(&structured(surface, operation, cause));
}

/// Operator breadcrumb: a routine, non-error lifecycle event.
pub fn op_info(surface: &str, operation: &str, cause: &str) {
    info(&structured(surface, operation, cause));
}

/// Redacted outbox delivery diagnostic. Only bounded counters/booleans and
/// acceptance-reference presence are exposed; message/provider IDs stay in DB.
pub fn outbox_delivery(
    level: &str,
    operation: &str,
    cause: &str,
    attempt: u32,
    duplicate_risk: bool,
    provider_ref_present: bool,
) {
    let message = format!(
        "{} attempt={} duplicate_risk={} provider_ref_present={}",
        structured("outbox", operation, cause),
        attempt,
        duplicate_risk,
        provider_ref_present
    );
    logging::log(level, &message);
}
