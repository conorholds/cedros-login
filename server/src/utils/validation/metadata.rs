use crate::errors::AppError;
use serde_json::{Map, Value};

/// Common secret key name patterns (case-insensitive)
const SECRET_KEY_PATTERNS: &[&str] = &[
    "password",
    "passwd",
    "secret",
    "api_key",
    "apikey",
    "api-key",
    "token",
    "auth",
    "credential",
    "private_key",
    "privatekey",
    "private-key",
    "access_key",
    "accesskey",
    "access-key",
    "secret_key",
    "secretkey",
    "secret-key",
    "bearer",
    "jwt",
    "session",
    "cookie",
    "authorization",
];

/// Patterns that indicate a value might be a secret
const SECRET_VALUE_PATTERNS: &[&str] = &[
    "sk_live_",   // Payment provider live key
    "sk_test_",   // Payment provider test key
    "pk_live_",   // Payment provider publishable key
    "pk_test_",   // Payment provider publishable key
    "ghp_",       // GitHub personal access token
    "gho_",       // GitHub OAuth token
    "ghu_",       // GitHub user token
    "ghs_",       // GitHub server token
    "AKIA",       // AWS access key
    "eyJ",        // JWT header (base64 encoded)
    "bearer ",    // Bearer token
    "basic ",     // Basic auth
    "AIza",       // Google API key
    "xox",        // Slack token
    "ssh-rsa",    // SSH key
    "-----BEGIN", // PEM encoded key
];

/// Validate metadata does not contain obvious secrets
///
/// Returns Ok(()) if metadata is safe, or an error describing the issue.
/// Checks both key names and string values for secret patterns.
pub fn validate_metadata_no_secrets(metadata: Option<&Value>) -> Result<(), AppError> {
    let Some(value) = metadata else {
        return Ok(());
    };

    validate_value_recursive(value, 0)
}

fn validate_value_recursive(value: &Value, depth: usize) -> Result<(), AppError> {
    if depth > 10 {
        return Err(AppError::Validation(
            "Metadata nesting too deep (max 10 levels)".into(),
        ));
    }

    match value {
        Value::Object(map) => validate_object(map, depth)?,
        Value::Array(values) => validate_array(values, depth)?,
        Value::String(value) => validate_string(value)?,
        _ => {}
    }

    Ok(())
}

fn validate_object(map: &Map<String, Value>, depth: usize) -> Result<(), AppError> {
    for (key, value) in map {
        let key_lower = key.to_lowercase();
        if SECRET_KEY_PATTERNS
            .iter()
            .any(|pattern| key_lower.contains(pattern))
        {
            return Err(AppError::Validation(format!(
                "Metadata key '{key}' appears to contain sensitive data. \
                 Do not store secrets in metadata."
            )));
        }
        validate_value_recursive(value, depth + 1)?;
    }
    Ok(())
}

fn validate_array(values: &[Value], depth: usize) -> Result<(), AppError> {
    if values.len() > 100 {
        return Err(AppError::Validation(
            "Metadata array too large (max 100 elements)".into(),
        ));
    }
    for value in values {
        validate_value_recursive(value, depth + 1)?;
    }
    Ok(())
}

fn validate_string(value: &str) -> Result<(), AppError> {
    if value.len() > 10_000 {
        return Err(AppError::Validation(
            "Metadata string value too long (max 10000 chars)".into(),
        ));
    }

    let value_lower = value.to_lowercase();
    if SECRET_VALUE_PATTERNS
        .iter()
        .any(|pattern| value_lower.starts_with(&pattern.to_lowercase()))
    {
        return Err(AppError::Validation(
            "Metadata value appears to contain a secret or API key. \
             Do not store secrets in metadata."
                .into(),
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_metadata_none_is_valid() {
        assert!(validate_metadata_no_secrets(None).is_ok());
    }

    #[test]
    fn test_metadata_safe_values_allowed() {
        let metadata = json!({
            "order_id": "12345",
            "items": ["widget", "gadget"],
            "quantity": 5,
            "customer_note": "Please ship quickly"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_ok());
    }

    #[test]
    fn test_metadata_rejects_password_key() {
        let metadata = json!({
            "password": "my-secret"
        });

        let result = validate_metadata_no_secrets(Some(&metadata));
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("password"));
    }

    #[test]
    fn test_metadata_rejects_api_key() {
        let metadata = json!({
            "api_key": "sk_live_xxx"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_secret_key_pattern() {
        let metadata = json!({
            "user_secret": "abc123"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_payment_key_value() {
        let metadata = json!({
            "notes": "sk_live_abcdefg12345"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_jwt_value() {
        let metadata = json!({
            "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_aws_key_value() {
        let metadata = json!({
            "info": "AKIAIOSFODNN7EXAMPLE"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_nested_secret() {
        let metadata = json!({
            "user": {
                "profile": {
                    "api_token": "secret123"
                }
            }
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_too_deep_nesting() {
        // Create deeply nested structure
        let mut value = json!("leaf");
        for _ in 0..15 {
            value = json!({ "nested": value });
        }

        let result = validate_metadata_no_secrets(Some(&value));
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("nesting"));
    }

    #[test]
    fn test_metadata_rejects_large_array() {
        let large_array: Vec<i32> = (0..150).collect();
        let metadata = json!({ "items": large_array });

        let result = validate_metadata_no_secrets(Some(&metadata));
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("array"));
    }

    #[test]
    fn test_metadata_rejects_long_string() {
        let long_string = "x".repeat(15_000);
        let metadata = json!({ "data": long_string });

        let result = validate_metadata_no_secrets(Some(&metadata));
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("string"));
    }
}
