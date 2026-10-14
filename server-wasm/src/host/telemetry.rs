//! Analytics + durable site-brain records (host `telemetry` seam, granted by
//! `surfaces.server.events`). Payloads must be redacted — no tokens, raw emails,
//! session ids, or PII (see SECURITY.md).
use super::{to_json, Result, SeamError};
use crate::cedros::extension::telemetry;
use serde::Serialize;

fn map_err(e: telemetry::HostError) -> SeamError {
    SeamError::Telemetry(e.message)
}

/// Emit one analytics event attributed to this extension.
pub fn emit_event<T: Serialize>(event_id: &str, label: &str, metadata: &T) -> Result<()> {
    telemetry::emit_event(event_id, label, &to_json(metadata)?).map_err(map_err)
}

/// Publish one durable site-brain record (operational log).
pub fn emit_record<T: Serialize>(
    category: &str,
    title: &str,
    text: &str,
    payload: &T,
) -> Result<()> {
    telemetry::emit_record(category, title, text, &to_json(payload)?).map_err(map_err)
}
