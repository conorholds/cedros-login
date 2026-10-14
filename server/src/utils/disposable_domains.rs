//! Helpers for persisted disposable-domain settings.

use crate::errors::AppError;

/// Parse the `custom_blocked_domains` setting value.
///
/// Inputs must be a JSON string array. Returns the parsed domains without
/// normalization; callers that merge user input should normalize before use.
/// Malformed values return an internal error so auth paths do not silently
/// ignore a configured blocklist.
pub fn parse_custom_blocked_domains(value: &str) -> Result<Vec<String>, AppError> {
    serde_json::from_str::<Vec<String>>(value).map_err(|e| {
        AppError::Internal(anyhow::anyhow!(
            "Invalid custom_blocked_domains setting: {e}"
        ))
    })
}

#[cfg(test)]
mod tests {
    use super::parse_custom_blocked_domains;
    use crate::errors::AppError;

    #[test]
    fn parses_custom_blocked_domains_json_array() {
        let domains = parse_custom_blocked_domains(r#"["example.com","mail.test"]"#).unwrap();

        assert_eq!(domains, vec!["example.com", "mail.test"]);
    }

    #[test]
    fn rejects_invalid_custom_blocked_domains_json() {
        let err = parse_custom_blocked_domains(r#"{"domain":"example.com"}"#).unwrap_err();

        assert!(matches!(err, AppError::Internal(_)));
    }
}
