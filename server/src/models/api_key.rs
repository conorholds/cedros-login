//! API key models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// API key metadata response (does NOT include the actual key)
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeyResponse {
    pub id: Uuid,
    pub key_prefix: String,
    pub label: String,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_used_at: Option<DateTime<Utc>>,
}

/// Request to create a new API key with a label
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CreateApiKeyRequest {
    /// Human-readable label for the key (e.g., "default", "bot-alpha")
    pub label: String,
}

/// Response when creating a new API key
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateApiKeyResponse {
    /// The full API key - only returned once, user must save it
    pub api_key: String,
    pub id: Uuid,
    pub key_prefix: String,
    pub label: String,
    pub created_at: DateTime<Utc>,
    pub message: String,
}

/// Response listing all API keys for a user
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeyListResponse {
    pub keys: Vec<ApiKeyResponse>,
}

/// Request to validate an API key
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidateApiKeyRequest {
    pub api_key: String,
}

/// Response when validating an API key
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidateApiKeyResponse {
    pub valid: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<Uuid>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_api_key_response_serialization() {
        let response = ApiKeyResponse {
            id: Uuid::nil(),
            key_prefix: "ck_abc123".to_string(),
            label: "default".to_string(),
            created_at: Utc::now(),
            last_used_at: None,
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"keyPrefix\":\"ck_abc123\""));
        assert!(json.contains("\"label\":\"default\""));
        // Optional None fields should not be serialized
        assert!(!json.contains("lastUsedAt"));
    }

    #[test]
    fn test_validate_request_deserialization() {
        let json = r#"{"apiKey":"ck_test_key_123"}"#;
        let request: ValidateApiKeyRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.api_key, "ck_test_key_123");
    }

    #[test]
    fn test_validate_response_valid() {
        let response = ValidateApiKeyResponse {
            valid: true,
            user_id: Some(Uuid::nil()),
            user_email: Some("test@example.com".to_string()),
            message: None,
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"valid\":true"));
        assert!(json.contains("\"userEmail\":\"test@example.com\""));
        assert!(!json.contains("\"message\""));
    }

    #[test]
    fn test_validate_response_invalid() {
        let response = ValidateApiKeyResponse {
            valid: false,
            user_id: None,
            user_email: None,
            message: Some("Invalid API key".to_string()),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"valid\":false"));
        assert!(json.contains("\"message\":\"Invalid API key\""));
        assert!(!json.contains("\"userId\""));
    }
    #[test]
    fn key_creation_rejects_unsupported_scope_and_identity_fields() {
        assert!(
            serde_json::from_value::<CreateApiKeyRequest>(serde_json::json!({"label":"ok"}))
                .is_ok()
        );
        for field in ["scopes", "orgId", "userId", "isSystemAdmin"] {
            let mut request = serde_json::json!({"label":"restricted"});
            request[field] = serde_json::json!(["read"]);
            assert!(
                serde_json::from_value::<CreateApiKeyRequest>(request).is_err(),
                "{field}"
            );
        }
    }
}
