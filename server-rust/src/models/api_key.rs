//! API key models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::repositories::ApiKeyEntity;

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

impl From<&ApiKeyEntity> for ApiKeyResponse {
    fn from(entity: &ApiKeyEntity) -> Self {
        Self {
            id: entity.id,
            key_prefix: entity.key_prefix.clone(),
            label: entity.label.clone(),
            created_at: entity.created_at,
            last_used_at: entity.last_used_at,
        }
    }
}

/// Response when regenerating an API key (includes the full key - shown once)
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegenerateApiKeyResponse {
    /// The full API key - only returned once, user must save it
    pub api_key: String,
    pub key_prefix: String,
    pub label: String,
    pub created_at: DateTime<Utc>,
    pub message: String,
}

/// Request to create a new API key with a label
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
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
    fn test_regenerate_response_serialization() {
        let response = RegenerateApiKeyResponse {
            api_key: "ck_full_key_here".to_string(),
            key_prefix: "ck_full_key_here".to_string(),
            label: "default".to_string(),
            created_at: Utc::now(),
            message: "Store this key securely.".to_string(),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"apiKey\":\"ck_full_key_here\""));
        assert!(json.contains("\"message\":\"Store this key securely.\""));
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
}
