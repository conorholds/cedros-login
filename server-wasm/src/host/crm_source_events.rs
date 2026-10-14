//! Trusted, identity-bearing source events submitted to the Cedros platform host.
//! Unlike analytics, this seam may carry opaque Login account identifiers, but
//! callers must still keep PII and auth tokens out of its payloads.

use crate::cedros::extension::crm_source_events;

use super::{Result, SeamError};

fn map_err(error: crm_source_events::HostError) -> SeamError {
    SeamError::CrmSource(error.message)
}

/// Submit a source event through a manifest-granted access id.
pub fn submit(
    access_id: &str,
    source_kind: &str,
    event_type: &str,
    payload_json: &str,
) -> Result<String> {
    crm_source_events::submit(access_id, source_kind, event_type, payload_json).map_err(map_err)
}
