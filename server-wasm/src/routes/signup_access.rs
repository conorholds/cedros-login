//! Shared signup access-code gate for extension new-user paths.
//!
//! When `signup_access_code_enabled` is true, every route that can create a
//! user must receive the configured `signup_access_code` value before it writes
//! the account. The helper fails closed if enforcement is enabled but the
//! expected code is missing from encrypted secrets or the host is unavailable.
use super::RouteError;
use crate::host::settings;

pub(crate) const SIGNUP_ACCESS_CODE_ENABLED_KEY: &str = "signup_access_code_enabled";
pub(crate) const SIGNUP_ACCESS_CODE_KEY: &str = "signup_access_code";

pub(crate) fn enforce(access_code: Option<&str>) -> Result<(), RouteError> {
    let configured = settings::get(SIGNUP_ACCESS_CODE_ENABLED_KEY)?;
    let gate_enabled = configured
        .as_deref()
        .is_some_and(|value| settings::parse_bool(Some(value), true));
    if !gate_enabled {
        return Ok(());
    }
    let expected =
        settings::get_secret(SIGNUP_ACCESS_CODE_KEY)?.and_then(|value| clean_setting(&value));
    evaluate(gate_enabled, expected.as_deref(), access_code)
}

fn evaluate(
    gate_enabled: bool,
    expected_code: Option<&str>,
    access_code: Option<&str>,
) -> Result<(), RouteError> {
    if !gate_enabled {
        return Ok(());
    }
    let expected =
        expected_code.ok_or(RouteError::Status(503, "signup_access_code_not_configured"))?;
    let provided = access_code
        .map(str::trim)
        .filter(|code| !code.is_empty())
        .ok_or(RouteError::Status(403, "signup_access_code_required"))?;
    if constant_time_eq(provided.as_bytes(), expected.as_bytes()) {
        Ok(())
    } else {
        Err(RouteError::Status(403, "invalid_signup_access_code"))
    }
}

fn clean_setting(value: &str) -> Option<String> {
    let trimmed = value.trim().trim_matches('"').trim().to_string();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    }
}

fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    let max = a.len().max(b.len());
    let mut diff = a.len() ^ b.len();
    for index in 0..max {
        diff |= usize::from(*a.get(index).unwrap_or(&0) ^ *b.get(index).unwrap_or(&0));
    }
    diff == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn evaluate_allows_signup_when_gate_disabled() {
        assert!(evaluate(false, None, None).is_ok());
    }

    #[test]
    fn evaluate_allows_matching_trimmed_code() {
        assert!(evaluate(true, Some("launch"), Some(" launch ")).is_ok());
    }

    #[test]
    fn evaluate_rejects_missing_or_invalid_code() {
        assert!(matches!(
            evaluate(true, Some("launch"), None),
            Err(RouteError::Status(403, "signup_access_code_required"))
        ));
        assert!(matches!(
            evaluate(true, Some("launch"), Some("wrong")),
            Err(RouteError::Status(403, "invalid_signup_access_code"))
        ));
    }

    #[test]
    fn evaluate_fails_closed_without_configured_code() {
        assert!(matches!(
            evaluate(true, None, Some("launch")),
            Err(RouteError::Status(503, "signup_access_code_not_configured"))
        ));
    }

    #[test]
    fn helper_uses_admin_settings_catalog_keys() {
        assert_eq!(SIGNUP_ACCESS_CODE_ENABLED_KEY, "signup_access_code_enabled");
        assert_eq!(SIGNUP_ACCESS_CODE_KEY, "signup_access_code");
    }
}

#[cfg(test)]
mod boundary_tests {
    use super::*;
    use crate::host::{key_value_test_support, SeamError};

    #[test]
    fn unavailable_gate_settings_never_disable_signup_protection() {
        key_value_test_support::with_values(
            |_, _| Err(SeamError::Settings("unavailable".into())),
            || {
                assert!(matches!(
                    enforce(None),
                    Err(RouteError::Seam(SeamError::Settings(_)))
                ))
            },
        );
    }

    #[test]
    fn enabled_gate_reads_encrypted_code_and_rejects_wrong_code() {
        key_value_test_support::with_values(
            |seam, key| {
                Ok(match (seam, key) {
                    ("settings", SIGNUP_ACCESS_CODE_ENABLED_KEY) => Some("TRUE".into()),
                    ("secrets", SIGNUP_ACCESS_CODE_KEY) => Some("encrypted-code".into()),
                    ("settings", SIGNUP_ACCESS_CODE_KEY) => None,
                    other => panic!("unexpected read: {other:?}"),
                })
            },
            || {
                assert!(enforce(Some("encrypted-code")).is_ok());
                assert!(matches!(
                    enforce(Some("wrong")),
                    Err(RouteError::Status(403, "invalid_signup_access_code"))
                ));
            },
        );
    }

    #[test]
    fn disabled_gate_does_not_require_secret_provider() {
        key_value_test_support::with_values(
            |seam, key| {
                assert_eq!((seam, key), ("settings", SIGNUP_ACCESS_CODE_ENABLED_KEY));
                Ok(Some("false".into()))
            },
            || assert!(enforce(None).is_ok()),
        );
    }
}
