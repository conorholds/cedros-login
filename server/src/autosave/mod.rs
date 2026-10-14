//! Shared autosave protocol helpers for Cedros resource handlers.
//!
//! Handlers compose this module to enforce the Cedros autosave HTTP contract:
//! strong `If-Match`, scoped `Idempotency-Key`, normalized payload
//! fingerprints, `application/problem+json` errors, and retry-safe
//! idempotency decisions.

use axum::{
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use uuid::Uuid;

mod idempotency;

#[cfg(feature = "postgres")]
pub use idempotency::{
    postgres_abort as postgres_abort_idempotency, postgres_begin as postgres_begin_idempotency,
    postgres_complete as postgres_complete_idempotency,
};
pub use idempotency::{
    AutosaveIdempotencyDecision, AutosaveIdempotencyLedger, AutosaveIdempotencyScope,
};

pub const IF_MATCH_HEADER: &str = "if-match";
pub const IDEMPOTENCY_KEY_HEADER: &str = "idempotency-key";
pub const DEFAULT_IDEMPOTENCY_TTL_SECS: u64 = 72 * 60 * 60;
pub const DEFAULT_AUTOSAVE_MAX_PAYLOAD_BYTES: usize = 64 * 1024;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AutosaveHeaders {
    pub if_match: String,
    pub idempotency_key: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AutosaveRequest<Patch> {
    pub autosave: bool,
    pub client_mutation_id: Uuid,
    pub editing_session_id: Uuid,
    pub client_seq: u64,
    pub update_mask: Vec<String>,
    pub patch: Patch,
    pub schema_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AutosaveSuccess<Resource> {
    pub resource_id: String,
    pub revision: u64,
    pub etag: String,
    pub saved_at: chrono::DateTime<chrono::Utc>,
    pub canonical_patch_or_resource: Resource,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct AutosaveWriteRequest<Patch> {
    pub resource_type: String,
    pub resource_id: String,
    pub if_match: String,
    pub idempotency_key: String,
    pub client_mutation_id: Uuid,
    pub editing_session_id: Uuid,
    pub client_seq: u64,
    pub update_mask: Vec<String>,
    pub patch: Patch,
    pub schema_version: String,
}

impl<Patch> AutosaveWriteRequest<Patch> {
    pub fn from_parts(
        resource_type: impl Into<String>,
        resource_id: impl Into<String>,
        headers: AutosaveHeaders,
        body: AutosaveRequest<Patch>,
    ) -> Self {
        Self {
            resource_type: resource_type.into(),
            resource_id: resource_id.into(),
            if_match: headers.if_match,
            idempotency_key: headers.idempotency_key,
            client_mutation_id: body.client_mutation_id,
            editing_session_id: body.editing_session_id,
            client_seq: body.client_seq,
            update_mask: body.update_mask,
            patch: body.patch,
            schema_version: body.schema_version,
        }
    }
}

#[cfg_attr(feature = "postgres", async_trait::async_trait)]
pub trait AutosaveResource: Send + Sync {
    type Patch: Send + Sync + 'static;
    type Resource: Send + Sync + 'static;

    fn resource_type(&self) -> &'static str;
    fn validate_patch(
        &self,
        patch: &Self::Patch,
        update_mask: &[String],
    ) -> Result<(), AutosaveProblem>;

    #[cfg(feature = "postgres")]
    async fn apply_patch(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        request: AutosaveWriteRequest<Self::Patch>,
    ) -> Result<AutosaveSuccess<Self::Resource>, AutosaveProblem>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AutosaveProblemBody {
    #[serde(rename = "type")]
    pub problem_type: String,
    pub title: String,
    pub status: u16,
    pub detail: String,
    pub code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trace_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub conflict: Option<Value>,
}

#[derive(Debug, Clone)]
pub struct AutosaveProblem {
    status: StatusCode,
    body: Box<AutosaveProblemBody>,
}

impl AutosaveProblem {
    pub fn new(status: StatusCode, code: &str, title: &str, detail: &str) -> Self {
        Self {
            status,
            body: Box::new(AutosaveProblemBody {
                problem_type: format!("https://cedros.dev/problems/autosave/{code}"),
                title: title.to_string(),
                status: status.as_u16(),
                detail: detail.to_string(),
                code: code.to_string(),
                trace_id: None,
                conflict: None,
            }),
        }
    }

    pub fn malformed(detail: &str) -> Self {
        Self::new(
            StatusCode::BAD_REQUEST,
            "autosave_malformed",
            "Malformed autosave request",
            detail,
        )
    }

    pub fn stale(detail: &str) -> Self {
        Self::new(
            StatusCode::PRECONDITION_FAILED,
            "autosave_stale_revision",
            "Autosave revision conflict",
            detail,
        )
    }

    pub fn invalid_patch(detail: &str) -> Self {
        Self::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "autosave_invalid_patch",
            "Invalid autosave patch",
            detail,
        )
    }

    pub fn payload_too_large(max_bytes: usize) -> Self {
        Self::new(
            StatusCode::PAYLOAD_TOO_LARGE,
            "autosave_payload_too_large",
            "Autosave payload too large",
            &format!("Autosave payload must be {max_bytes} bytes or smaller."),
        )
    }

    pub fn rate_limited(detail: &str) -> Self {
        Self::new(
            StatusCode::TOO_MANY_REQUESTS,
            "autosave_rate_limited",
            "Autosave rate limited",
            detail,
        )
    }

    pub fn in_progress() -> Self {
        Self::new(
            StatusCode::CONFLICT,
            "autosave_idempotency_in_progress",
            "Autosave mutation already in progress",
            "The same idempotency key is already processing for this resource.",
        )
    }

    pub fn server_error(detail: &str) -> Self {
        Self::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "autosave_server_error",
            "Autosave server error",
            detail,
        )
    }

    pub fn with_conflict(mut self, conflict: Value) -> Self {
        self.body.conflict = Some(conflict);
        self
    }

    pub fn status(&self) -> StatusCode {
        self.status
    }
}

impl IntoResponse for AutosaveProblem {
    fn into_response(self) -> Response {
        let mut response = (self.status, Json(*self.body)).into_response();
        response.headers_mut().insert(
            header::CONTENT_TYPE,
            HeaderValue::from_static("application/problem+json"),
        );
        response
    }
}

pub fn extract_autosave_headers(headers: &HeaderMap) -> Result<AutosaveHeaders, AutosaveProblem> {
    let if_match = required_header(headers, IF_MATCH_HEADER)?;
    let idempotency_key = required_header(headers, IDEMPOTENCY_KEY_HEADER)?;
    if idempotency_key.len() > 128 {
        return Err(AutosaveProblem::malformed(
            "Idempotency-Key must be 128 characters or fewer.",
        ));
    }
    Ok(AutosaveHeaders {
        if_match,
        idempotency_key,
    })
}

pub fn strong_revision_etag(resource_type: &str, revision: u64) -> String {
    format!("\"{resource_type}:{revision}\"")
}

pub fn revision_from_strong_etag(etag: &str) -> Result<u64, AutosaveProblem> {
    let unquoted = etag
        .strip_prefix('"')
        .and_then(|value| value.strip_suffix('"'))
        .ok_or_else(|| AutosaveProblem::malformed("If-Match must be a strong quoted ETag."))?;
    let (_, revision) = unquoted
        .rsplit_once(':')
        .ok_or_else(|| AutosaveProblem::malformed("If-Match ETag is missing a revision."))?;
    revision
        .parse::<u64>()
        .map_err(|_| AutosaveProblem::malformed("If-Match ETag revision is invalid."))
}

pub fn ensure_revision_match(
    headers: &HeaderMap,
    current_revision: u64,
) -> Result<(), AutosaveProblem> {
    let autosave_headers = extract_autosave_headers(headers)?;
    let expected_revision = revision_from_strong_etag(&autosave_headers.if_match)?;
    if expected_revision != current_revision {
        return Err(AutosaveProblem::stale(
            "The resource changed after the client draft was based.",
        ));
    }
    Ok(())
}

pub fn validate_autosave_request<Patch>(
    request: &AutosaveRequest<Patch>,
) -> Result<(), AutosaveProblem> {
    if !request.autosave {
        return Err(AutosaveProblem::malformed(
            "autosave must be true for autosave endpoints.",
        ));
    }
    if request.update_mask.is_empty() {
        return Err(AutosaveProblem::invalid_patch(
            "updateMask must include at least one field.",
        ));
    }
    if request.schema_version.trim().is_empty() {
        return Err(AutosaveProblem::malformed("schemaVersion is required."));
    }
    Ok(())
}

pub fn ensure_payload_size(bytes_len: usize, max_bytes: usize) -> Result<(), AutosaveProblem> {
    if bytes_len > max_bytes {
        return Err(AutosaveProblem::payload_too_large(max_bytes));
    }
    Ok(())
}

pub fn validate_update_mask_fields(
    update_mask: &[String],
    allowed_fields: &[&str],
    blocked_fields: &[&str],
) -> Result<(), AutosaveProblem> {
    for field in update_mask {
        let field = field.trim();
        if field.is_empty() {
            return Err(AutosaveProblem::invalid_patch(
                "updateMask fields must not be empty.",
            ));
        }
        if contains_field(blocked_fields, field) {
            return Err(AutosaveProblem::invalid_patch(
                "updateMask includes a field blocked from autosave.",
            ));
        }
        if !allowed_fields.is_empty() && !contains_field(allowed_fields, field) {
            return Err(AutosaveProblem::invalid_patch(
                "updateMask includes a field not allowed for autosave.",
            ));
        }
    }
    Ok(())
}

pub fn autosave_payload_fingerprint<T: Serialize>(payload: &T) -> Result<String, AutosaveProblem> {
    let bytes = serde_json::to_vec(payload)
        .map_err(|_| AutosaveProblem::malformed("Autosave payload is not serializable."))?;
    let digest = Sha256::digest(bytes);
    Ok(hex::encode(digest))
}

fn contains_field(fields: &[&str], candidate: &str) -> bool {
    fields.contains(&candidate)
}

fn required_header(headers: &HeaderMap, name: &'static str) -> Result<String, AutosaveProblem> {
    headers
        .get(name)
        .ok_or_else(|| AutosaveProblem::malformed(&format!("{name} header is required.")))?
        .to_str()
        .map(|value| value.to_string())
        .map_err(|_| AutosaveProblem::malformed(&format!("{name} header is invalid.")))
}

#[cfg(test)]
mod tests {
    use super::*;
    use http_body_util::BodyExt;

    #[test]
    fn extracts_required_autosave_headers() {
        let mut headers = HeaderMap::new();
        headers.insert(IF_MATCH_HEADER, HeaderValue::from_static("\"settings:3\""));
        headers.insert(
            IDEMPOTENCY_KEY_HEADER,
            HeaderValue::from_static("mutation-1"),
        );

        let extracted = extract_autosave_headers(&headers).unwrap();

        assert_eq!(extracted.if_match, "\"settings:3\"");
        assert_eq!(extracted.idempotency_key, "mutation-1");
    }

    #[tokio::test]
    async fn missing_headers_return_problem_json() {
        let error = extract_autosave_headers(&HeaderMap::new()).unwrap_err();
        assert_eq!(error.status(), StatusCode::BAD_REQUEST);

        let response = error.into_response();
        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
        assert_eq!(
            response.headers().get(header::CONTENT_TYPE).unwrap(),
            "application/problem+json"
        );

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let body: AutosaveProblemBody = serde_json::from_slice(&body).unwrap();
        assert_eq!(body.code, "autosave_malformed");
    }

    #[test]
    fn strong_etag_revision_mismatch_returns_412() {
        let mut headers = HeaderMap::new();
        headers.insert(IF_MATCH_HEADER, HeaderValue::from_static("\"profile:7\""));
        headers.insert(
            IDEMPOTENCY_KEY_HEADER,
            HeaderValue::from_static("mutation-2"),
        );

        let error = ensure_revision_match(&headers, 8).unwrap_err();

        assert_eq!(error.status(), StatusCode::PRECONDITION_FAILED);
    }

    #[test]
    fn payload_size_limit_returns_413() {
        let error = ensure_payload_size(1025, 1024).unwrap_err();

        assert_eq!(error.status(), StatusCode::PAYLOAD_TOO_LARGE);
    }

    #[test]
    fn update_mask_rejects_blocked_or_unapproved_fields() {
        let blocked = vec!["secret".to_string()];
        let disallowed = vec!["unknown".to_string()];

        let blocked_error =
            validate_update_mask_fields(&blocked, &["title", "body"], &["secret"]).unwrap_err();
        let disallowed_error =
            validate_update_mask_fields(&disallowed, &["title", "body"], &[]).unwrap_err();

        assert_eq!(blocked_error.status(), StatusCode::UNPROCESSABLE_ENTITY);
        assert_eq!(disallowed_error.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[test]
    fn write_request_preserves_headers_and_body_protocol_fields() {
        let headers = AutosaveHeaders {
            if_match: "\"note:4\"".to_string(),
            idempotency_key: "mutation-key".to_string(),
        };
        let mutation_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let body = AutosaveRequest {
            autosave: true,
            client_mutation_id: mutation_id,
            editing_session_id: session_id,
            client_seq: 9,
            update_mask: vec!["title".to_string()],
            patch: serde_json::json!({ "title": "Draft" }),
            schema_version: "v1".to_string(),
        };

        let request = AutosaveWriteRequest::from_parts("note", "n1", headers, body);

        assert_eq!(request.resource_type, "note");
        assert_eq!(request.resource_id, "n1");
        assert_eq!(request.if_match, "\"note:4\"");
        assert_eq!(request.idempotency_key, "mutation-key");
        assert_eq!(request.client_mutation_id, mutation_id);
        assert_eq!(request.update_mask, vec!["title"]);
    }

    #[test]
    fn payload_fingerprint_hashes_normalized_payload() {
        let payload = serde_json::json!({
            "autosave": true,
            "patch": { "title": "Draft" }
        });

        let fingerprint = autosave_payload_fingerprint(&payload).unwrap();

        assert_eq!(fingerprint.len(), 64);
        assert!(!fingerprint.contains("Draft"));
    }
}
