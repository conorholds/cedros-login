use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::callback::AuthCallbackPayload;
use crate::extension_manifest::CEDROS_LOGIN_EXTENSION_ID;

pub const CEDROS_LOGIN_REGISTRATION_CREATED_EVENT_ID: &str = "cedros-login:registration-created";
pub const CEDROS_LOGIN_USER_LOGIN_EVENT_ID: &str = "cedros-login:user-login";

const CEDROS_LOGIN_AUTH_ROUTE_GROUP_ID: &str = "cedros-login:auth";

/// Redacted Cedros extension server event envelope.
///
/// The payload intentionally omits account identifiers, session identifiers,
/// provider payloads, network metadata, tokens, and profile fields.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosLoginServerEvent {
    pub extension_id: String,
    pub event_id: String,
    pub occurred_at_ms: u64,
    #[serde(default)]
    pub payload: Value,
}

pub fn registration_created_event(payload: &AuthCallbackPayload) -> CedrosLoginServerEvent {
    auth_event(CEDROS_LOGIN_REGISTRATION_CREATED_EVENT_ID, payload)
}

pub fn user_login_event(payload: &AuthCallbackPayload) -> CedrosLoginServerEvent {
    auth_event(CEDROS_LOGIN_USER_LOGIN_EVENT_ID, payload)
}

pub fn publish_server_event(event: &CedrosLoginServerEvent) {
    tracing::info!(
        target: "cedros_login::server_event",
        extension_id = %event.extension_id,
        event_id = %event.event_id,
        occurred_at_ms = event.occurred_at_ms,
        payload = %event.payload,
        "Cedros Login server event published"
    );
}

fn auth_event(event_id: &str, payload: &AuthCallbackPayload) -> CedrosLoginServerEvent {
    CedrosLoginServerEvent {
        extension_id: CEDROS_LOGIN_EXTENSION_ID.to_string(),
        event_id: event_id.to_string(),
        occurred_at_ms: now_ms(),
        payload: json!({
            "method": payload.method.as_str(),
            "routeGroup": CEDROS_LOGIN_AUTH_ROUTE_GROUP_ID,
        }),
    }
}

fn now_ms() -> u64 {
    chrono::Utc::now().timestamp_millis().max(0) as u64
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{AuthMethod, AuthUser};
    use chrono::Utc;
    use uuid::Uuid;

    #[test]
    fn registration_event_uses_notification_event_id_and_redacted_payload() {
        let payload = test_payload(true);
        let event = registration_created_event(&payload);

        assert_eq!(event.extension_id, CEDROS_LOGIN_EXTENSION_ID);
        assert_eq!(event.event_id, CEDROS_LOGIN_REGISTRATION_CREATED_EVENT_ID);
        assert_eq!(event.payload["method"], "email");
        assert_eq!(
            event.payload["routeGroup"],
            CEDROS_LOGIN_AUTH_ROUTE_GROUP_ID
        );
        assert_redacted(&event);
    }

    #[test]
    fn user_login_event_omits_identifiers_and_secrets() {
        let payload = test_payload(false);
        let event = user_login_event(&payload);

        assert_eq!(event.event_id, CEDROS_LOGIN_USER_LOGIN_EVENT_ID);
        assert_eq!(event.payload["method"], "email");
        assert_redacted(&event);
    }

    fn test_payload(is_new_user: bool) -> AuthCallbackPayload {
        AuthCallbackPayload {
            user: AuthUser {
                id: Uuid::new_v4(),
                email: Some("test@example.com".to_string()),
                emails: Vec::new(),
                name: Some("Test User".to_string()),
                username: Some("tester".to_string()),
                picture: Some("https://example.com/avatar.png".to_string()),
                wallet_address: Some("wallet-address".to_string()),
                auth_methods: vec![AuthMethod::Email],
                email_verified: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
                welcome_completed_at: None,
                referral_code: Some("REF123".to_string()),
            },
            method: AuthMethod::Email,
            is_new_user,
            session_id: "test-session-id".to_string(),
            ip_address: Some("127.0.0.1".to_string()),
            user_agent: Some("TestAgent/1.0".to_string()),
            referral: Some("referral-metadata".to_string()),
        }
    }

    fn assert_redacted(event: &CedrosLoginServerEvent) {
        let payload = event.payload.to_string();
        for forbidden in [
            "test@example.com",
            "Test User",
            "tester",
            "avatar.png",
            "wallet-address",
            "test-session-id",
            "127.0.0.1",
            "TestAgent",
            "REF123",
            "referral-metadata",
        ] {
            assert!(
                !payload.contains(forbidden),
                "event payload leaked {forbidden}: {payload}"
            );
        }
    }
}
