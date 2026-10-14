use rand::{rngs::OsRng, RngCore};
use serde_json::Value;
use uuid::Uuid;

use crate::clock;
use crate::data::verifications::{self, VerificationEntry};
use crate::services::webauthn as rp;

use super::{RouteError, CHALLENGE_TTL_SECS};

/// The decoded pieces of an authentication assertion.
pub(super) struct Assertion {
    pub(super) credential_id: String,
    pub(super) client_data: Vec<u8>,
    pub(super) authenticator_data: Vec<u8>,
    pub(super) signature: Vec<u8>,
    pub(super) user_handle: Option<Vec<u8>>,
}

/// Generate and persist a fresh 32-byte challenge; returns (challengeId, b64url).
pub(super) fn new_challenge(
    user_id: &str,
    kind: &str,
    cfg: &super::super::webauthn_support::WebauthnConfig,
    allowed: &[String],
    session_id: Option<&str>,
) -> Result<(String, String), RouteError> {
    let mut bytes = [0u8; 32];
    OsRng.fill_bytes(&mut bytes);
    let challenge = rp::b64url_encode(&bytes);
    let challenge_id = Uuid::new_v4().to_string();
    verifications::create(&VerificationEntry {
        id: challenge_id.clone(),
        user_id: user_id.to_string(),
        token_hash: challenge.clone(),
        token_type: kind.to_string(),
        target_email: None,
        subject_id: Some(
            serde_json::json!({"rpId": cfg.rp_id, "origins": cfg.origins, "allowed": allowed, "sessionId": session_id})
                .to_string(),
        ),
        created_at: clock::now_iso(),
        expires_at: clock::in_secs(CHALLENGE_TTL_SECS),
        used_at: None,
    })?;
    Ok((challenge_id, challenge))
}

/// A guest-validated challenge that has not yet been consumed.
pub(super) struct PendingChallenge {
    pub(super) entry: VerificationEntry,
    pub(super) allowed: Vec<String>,
    pub(super) session_id: Option<String>,
}

impl PendingChallenge {
    pub(super) fn require_session(&self, expected: &str) -> Result<(), RouteError> {
        if self.session_id.as_deref() != Some(expected) {
            return Err(RouteError::Status(400, "invalid_challenge"));
        }
        Ok(())
    }

    pub(super) fn challenge(&self) -> &str {
        &self.entry.token_hash
    }

    pub(super) fn user_id(&self) -> &str {
        &self.entry.user_id
    }
}

/// Validate and load a stored challenge without consuming it.
///
/// The ceremony response must be cryptographically verified before the caller
/// atomically consumes this proof together with its result writes.
pub(super) fn load_challenge(
    challenge_id: &str,
    kind: &str,
    expected_user: Option<&str>,
    cfg: &super::super::webauthn_support::WebauthnConfig,
) -> Result<PendingChallenge, RouteError> {
    let entry = verifications::find_by_id(challenge_id)?
        .ok_or(RouteError::Status(400, "invalid_challenge"))?;
    if entry.token_type != kind || entry.used_at.is_some() || entry.expires_at <= clock::now_iso() {
        return Err(RouteError::Status(400, "invalid_challenge"));
    }
    if let Some(user_id) = expected_user {
        if entry.user_id != user_id {
            return Err(RouteError::Status(400, "invalid_challenge"));
        }
    }
    #[derive(serde::Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct Binding {
        rp_id: String,
        origins: Vec<String>,
        allowed: Vec<String>,
        #[serde(default)]
        session_id: Option<String>,
    }
    let binding: Binding = entry
        .subject_id
        .as_deref()
        .and_then(|value| serde_json::from_str(value).ok())
        .ok_or(RouteError::Status(400, "invalid_challenge"))?;
    if binding.rp_id != cfg.rp_id || binding.origins != cfg.origins {
        return Err(RouteError::Status(400, "invalid_challenge"));
    }
    Ok(PendingChallenge {
        entry,
        allowed: binding.allowed,
        session_id: binding.session_id,
    })
}

/// Decode the (clientDataJSON, attestationObject) from a registration response.
pub(super) fn extract_registration(credential: &Value) -> Result<(Vec<u8>, Vec<u8>), RouteError> {
    credential_id(credential)?;
    let response = credential
        .get("response")
        .ok_or(RouteError::Status(400, "invalid_credential"))?;
    let client_data = rp::b64url_decode(field_str(response, "clientDataJSON")?)?;
    let attestation = rp::b64url_decode(field_str(response, "attestationObject")?)?;
    Ok((client_data, attestation))
}

/// Decode an authentication response. The credential id is canonicalized to
/// no-pad base64url so it matches the stored key.
pub(super) fn extract_assertion(credential: &Value) -> Result<Assertion, RouteError> {
    let credential_id = credential_id(credential)?;
    let response = credential
        .get("response")
        .ok_or(RouteError::Status(400, "invalid_credential"))?;
    Ok(Assertion {
        credential_id,
        client_data: rp::b64url_decode(field_str(response, "clientDataJSON")?)?,
        authenticator_data: rp::b64url_decode(field_str(response, "authenticatorData")?)?,
        signature: rp::b64url_decode(field_str(response, "signature")?)?,
        user_handle: match response.get("userHandle") {
            None | Some(Value::Null) => None,
            Some(Value::String(value)) => Some(rp::b64url_decode(value)?),
            _ => return Err(RouteError::Status(400, "invalid_credential")),
        },
    })
}

fn field_str<'a>(value: &'a Value, key: &str) -> Result<&'a str, RouteError> {
    value
        .get(key)
        .and_then(Value::as_str)
        .ok_or(RouteError::Status(400, "invalid_credential"))
}

fn credential_id(credential: &Value) -> Result<String, RouteError> {
    if field_str(credential, "type")? != "public-key" {
        return Err(RouteError::Status(400, "invalid_credential"));
    }
    let id = rp::b64url_decode(field_str(credential, "id")?)?;
    let raw = rp::b64url_decode(field_str(credential, "rawId")?)?;
    if id.is_empty() || id != raw {
        return Err(RouteError::Status(400, "invalid_credential"));
    }
    Ok(rp::b64url_encode(&id))
}

pub(super) fn verify_registration_id(credential: &Value, expected: &str) -> Result<(), RouteError> {
    if credential_id(credential)? != expected {
        return Err(RouteError::Status(400, "invalid_credential"));
    }
    Ok(())
}

pub(super) fn verify_assertion_identity(
    assertion: &Assertion,
    allowed: &[String],
    user: &str,
) -> Result<(), RouteError> {
    if (!allowed.is_empty() && !allowed.contains(&assertion.credential_id))
        || (allowed.is_empty() && assertion.user_handle.is_none())
        || assertion
            .user_handle
            .as_deref()
            .is_some_and(|handle| handle != user.as_bytes())
    {
        return Err(RouteError::Status(401, "invalid_credentials"));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn registration_requires_the_issuing_session_and_rejects_legacy_unbound_proof() {
        let entry: VerificationEntry = serde_json::from_value(serde_json::json!({
            "id":"c", "userId":"u", "tokenHash":"h", "tokenType":"register",
            "createdAt":"t", "expiresAt":"t", "usedAt":null
        }))
        .unwrap();
        let mut proof = PendingChallenge {
            entry,
            allowed: vec![],
            session_id: Some("original".into()),
        };
        assert!(proof.require_session("original").is_ok());
        assert!(proof.require_session("different").is_err());
        proof.session_id = None;
        assert!(proof.require_session("original").is_err());
    }

    #[test]
    fn challenges_are_bound_to_purpose_user_site_and_expiry() {
        let cfg = super::super::super::webauthn_support::WebauthnConfig {
            rp_id: "login.example".into(),
            rp_name: "Login".into(),
            origins: vec!["https://login.example".into()],
        };
        let good = serde_json::json!({"id":"challenge","userId":"user","tokenHash":"random-challenge",
            "tokenType":"register","createdAt":"2026-01-01T00:00:00Z","expiresAt":"2099-01-01T00:00:00Z","usedAt":null,
            "subjectId":serde_json::json!({"rpId":cfg.rp_id,"origins":cfg.origins,"allowed":[]}).to_string()});
        for (field, value, valid) in [
            ("usedAt", Value::Null, true),
            ("usedAt", serde_json::json!("2026-01-01T00:00:00Z"), false),
            ("expiresAt", serde_json::json!("2000-01-01T00:00:00Z"), false),
            ("tokenType", serde_json::json!("authenticate"), false),
            ("userId", serde_json::json!("other-user"), false),
            ("subjectId", Value::Null, false),
            ("subjectId", serde_json::json!(serde_json::json!({"rpId":"other.example","origins":["https://login.example"],"allowed":[]}).to_string()), false),
            ("subjectId", serde_json::json!(serde_json::json!({"rpId":"login.example","origins":["https://other.example"],"allowed":[]}).to_string()), false),
        ] {
            let mut payload = good.clone(); payload[field] = value;
            crate::host::db::test_support::with_db(move |operation, _, _| {
                assert_eq!(operation, "read");
                Ok(serde_json::json!({"entries":[{"entry_key":"challenge","payload":payload}]}))
            }, || { assert_eq!(load_challenge("challenge", "register", Some("user"), &cfg).is_ok(), valid, "{field}"); });
        }
    }
}
