//! Durable OAuth-to-site-key teardown. Revocation is committed before transport;
//! an accepted host response transfers retry ownership to Data, not proof that
//! an offline source site has already deleted its key. No credential is sent.
use super::*;
use crate::cedros::extension::extension_services::{ServiceRequest, ServiceResponse};
use crate::host::db::{self, OAUTH};
use crate::host::SeamError;

pub(crate) const CHECK_INTERVAL: i64 = 120;
const RETRY_INTERVAL: i64 = 60;
const MAX_BATCH: u32 = 50;
const CAPABILITY: &str = "cedros-data:mcp-connection-revoke-v1";

#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct Report {
    pub checked: u32,
    pub accepted: u32,
    pub pending: u32,
    pub failed: u32,
    pub has_more: bool,
}

/// Existing OAuth token-reuse, RFC7009 and authenticated disconnect paths all
/// enter here. Host failure must not undo immediate OAuth/session revocation.
pub(super) fn revoke(connection: &Connection, condition: db::Condition) -> Result<(), RouteError> {
    let mut connection = connection.clone();
    connection.status = "revoked".into();
    store::save(&connection, condition)?;
    if let Err(error) = deliver(&connection.id) {
        // The committed pending state is the retry obligation. Only a bounded
        // error category is logged; no identity, envelope, key or token is logged.
        #[cfg(not(test))]
        crate::host::log::op_warn("oauth", "cleanup-pending", error.code());
        #[cfg(test)]
        let _ = error;
    }
    Ok(())
}

/// A successful synchronous call acknowledges only Data's durable retry queue.
/// If either transport or the acknowledgement CAS fails, the same immutable
/// request is retried after restart. Data's cancellation tombstone makes replay
/// harmless and prevents an already-authorized but delayed issuance from winning.
fn deliver(id: &str) -> crate::host::Result<bool> {
    let Some(mut row) = store::read(id)? else {
        return Ok(false);
    };
    if row.value.status != "revoked" || row.value.cleanup_state.as_deref() != Some("pending") {
        return Ok(false);
    }
    let c = &row.value;
    let identity = c
        .identity
        .as_ref()
        .ok_or_else(|| SeamError::Db("missing OAuth cleanup identity".into()))?;
    let org = identity
        .org_id
        .as_deref()
        .filter(|s| !s.is_empty())
        .ok_or_else(|| SeamError::Db("missing OAuth cleanup organization".into()))?;
    let response = invoke(&ServiceRequest {
        target_extension_id: "cedros-data".into(),
        capability_id: CAPABILITY.into(),
        route_id: CAPABILITY.into(),
        method: "POST".into(),
        path: "/runtime/mcp-connections/revoke-v1".into(),
        query: vec![],
        body_json: serde_json::json!({
            "contractVersion":1,"oauthIssuer":c.issuer,"oauthSubject":identity.sub,
            "oauthGrantId":c.id,"organizationId":org,"clientId":c.client_id,
            "resource":c.resource,"grantExpiresAt":c.expires_at
        })
        .to_string(),
    })?;
    #[derive(Deserialize)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    struct Acceptance {
        contract_version: u32,
        accepted: bool,
    }
    let accepted: Acceptance = serde_json::from_str(&response.body)
        .map_err(|_| SeamError::ExtensionService("invalid OAuth cleanup acknowledgement".into()))?;
    if response.status != 200 || accepted.contract_version != 1 || !accepted.accepted {
        return Err(SeamError::ExtensionService(
            "OAuth cleanup not accepted".into(),
        ));
    }
    row.value.cleanup_state = Some("accepted".into());
    row.value.cleanup_check_at = None;
    store::save(&row.value, row.condition)?;
    Ok(true)
}

/// Keyset-by-due-time progress: every examined row moves to a later check time,
/// so an unavailable source/user/host cannot starve the rest of the queue. The
/// check timestamp is persisted when consent is created, not only on revoke;
/// it also survives direct host account deletion or session invalidation.
pub(crate) fn run() -> crate::host::Result<Report> {
    let now = clock::now_iso();
    let due = db::read_typed::<Connection>(
        OAUTH,
        &db::Query {
            filters: vec![db::lte("cleanupCheckAt", now.clone())],
            order_by: Some(db::asc("cleanupCheckAt")),
            limit: Some(MAX_BATCH),
            ..Default::default()
        },
    )?;
    let mut report = Report {
        has_more: due.len() == MAX_BATCH as usize,
        ..Report::default()
    };
    for candidate in due {
        report.checked += 1;
        let result = check(&candidate.id, &now);
        match result {
            Ok(Some(true)) => report.accepted += 1,
            Ok(Some(false)) => report.pending += 1,
            Ok(None) => {}
            Err(error) => {
                report.failed += 1;
                #[cfg(not(test))]
                crate::host::log::op_warn("oauth", "cleanup-retry", error.code());
                #[cfg(test)]
                let _ = error;
            }
        }
    }
    Ok(report)
}

fn check(id: &str, now: &str) -> crate::host::Result<Option<bool>> {
    let Some(mut row) = store::read(id)? else {
        return Ok(None);
    };
    if !row
        .value
        .cleanup_check_at
        .as_deref()
        .is_some_and(|due| due <= now)
    {
        return Ok(None);
    }
    // Persist the next check before invoking anything. An interruption can delay
    // the retry by at most one interval, never erase or exhaust the obligation.
    row.value.cleanup_check_at = Some(clock::in_secs(RETRY_INTERVAL));
    let live = if matches!(row.value.status.as_str(), "active" | "code") {
        is_live(&row.value)
    } else {
        Ok(false)
    };
    match live {
        Ok(true) => {
            row.value.cleanup_check_at = Some(clock::in_secs(CHECK_INTERVAL));
            store::save(&row.value, row.condition)?;
            Ok(None)
        }
        Ok(false) => {
            row.value.status = "revoked".into();
            store::save(&row.value, row.condition)?;
            deliver(id).map(Some)
        }
        Err(error) => {
            store::save(&row.value, row.condition)?;
            Err(error)
        }
    }
}

fn is_live(c: &Connection) -> crate::host::Result<bool> {
    if c.expires_at <= clock::now_iso()
        || (c.status == "code"
            && !c
                .code_expires_at
                .as_ref()
                .is_some_and(|t| t > &clock::now_iso()))
    {
        return Ok(false);
    }
    let Some(identity) = c.identity.clone() else {
        return Ok(false);
    };
    match auth::authoritative_session(identity) {
        Ok(_) => {}
        Err(RouteError::Status(401 | 403, _)) | Err(RouteError::Auth(_)) => return Ok(false),
        Err(RouteError::Seam(error)) => return Err(error),
        Err(_) => return Err(SeamError::Db("OAuth authority check unavailable".into())),
    }
    match Config::load() {
        Ok(config) => Ok(tokens::validate_registration(&config, c).is_ok()),
        Err(RouteError::Seam(error)) => Err(error),
        // Removing or invalidating authorization-server registration disconnects
        // grants too, rather than leaving their source key indefinitely alive.
        Err(_) => Ok(false),
    }
}

#[cfg(not(test))]
fn invoke(request: &ServiceRequest) -> crate::host::Result<ServiceResponse> {
    crate::host::extension_services::invoke(request)
}
#[cfg(test)]
thread_local! {
    pub(super) static TEST_REQUESTS: std::cell::RefCell<Vec<ServiceRequest>> = const { std::cell::RefCell::new(Vec::new()) };
    pub(super) static TEST_RESPONSE: std::cell::RefCell<Option<crate::host::Result<ServiceResponse>>> = const { std::cell::RefCell::new(None) };
}
#[cfg(test)]
fn invoke(request: &ServiceRequest) -> crate::host::Result<ServiceResponse> {
    TEST_REQUESTS.with_borrow_mut(|requests| {
        requests.push(ServiceRequest {
            target_extension_id: request.target_extension_id.clone(),
            capability_id: request.capability_id.clone(),
            route_id: request.route_id.clone(),
            method: request.method.clone(),
            path: request.path.clone(),
            query: request.query.clone(),
            body_json: request.body_json.clone(),
        })
    });
    TEST_RESPONSE
        .with_borrow_mut(|response| response.take())
        .unwrap_or_else(|| Err(SeamError::ExtensionService("test host unavailable".into())))
}
