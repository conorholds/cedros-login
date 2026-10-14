//! Per-extension key/value settings (host `settings` seam, granted by
//! `settingsSchemas`). Values are JSON strings, scoped to this extension.
use super::{Result, SeamError};
use crate::cedros::extension::settings;

fn map_err(e: settings::HostError) -> SeamError {
    SeamError::Settings(e.message)
}

pub fn get(key: &str) -> Result<Option<String>> {
    #[cfg(test)]
    if let Some(result) = super::key_value_test_support::get("settings", key) {
        return result;
    }
    settings::get(key)
        .map_err(map_err)
        .map(|value| value.map(unwrap_host_json_string))
}

/// The host stores settings as JSON and serializes the stored value for the
/// guest, so a string setting arrives quoted (`"\"/pricing\""`). Unwrap it to
/// the plain text the catalog, validators and admin form work with; booleans,
/// numbers and JSON documents keep their JSON text.
fn unwrap_host_json_string(raw: String) -> String {
    match serde_json::from_str::<serde_json::Value>(&raw) {
        Ok(serde_json::Value::String(inner)) => inner,
        _ => raw,
    }
}

pub fn set(key: &str, value: &str) -> Result<()> {
    settings::set(key, value).map_err(map_err)
}

/// Secret catalog values use the encrypted seam. Preserve released setting keys
/// and migrate legacy plaintext before clearing it; a failed secret write must
/// never destroy the only copy. Empty secrets are authoritative after clearing.
pub fn get_secret(key: &str) -> Result<Option<String>> {
    get_secret_with(key, super::secrets::get, get, super::secrets::set, set)
}

fn get_secret_with(
    key: &str,
    read_secret: impl FnOnce(&str) -> Result<Option<String>>,
    read_setting: impl FnOnce(&str) -> Result<Option<String>>,
    write_secret: impl FnOnce(&str, &str) -> Result<()>,
    write_setting: impl FnOnce(&str, &str) -> Result<()>,
) -> Result<Option<String>> {
    let secret = read_secret(key)?;
    let legacy = read_setting(key)?.filter(|value| !value.is_empty());
    let value = match (secret, legacy.as_ref()) {
        (Some(secret), _) => Some(secret),
        (None, Some(legacy)) => {
            write_secret(key, legacy)?;
            Some(legacy.clone())
        }
        (None, None) => None,
    };
    if legacy.is_some() {
        write_setting(key, "")?;
    }
    Ok(value)
}

pub fn set_secret(key: &str, value: &str) -> Result<()> {
    super::secrets::set(key, value)?;
    // Keep the encrypted value authoritative even if legacy cleanup must retry.
    set(key, "")
}

/// Parse a boolean setting, tolerating JSON-quoted / cased / yes-no values.
/// `default` applies when the key is absent, empty, or unrecognized — so callers
/// must pass the FAIL-SAFE default (provider off / security control on). This is
/// the one true bool gate; never hand-roll `== "true"` (which fails OPEN for
/// quoted/`no`/`0`/cased values — the divergence this replaces).
pub fn bool(key: &str, default: bool) -> bool {
    parse_bool(get(key).ok().flatten().as_deref(), default)
}

/// Parse a positive-integer setting (TTLs, limits), clamped to `[1, max]`.
/// `default`/`max` must already be sane. Absent, unparseable, or non-positive
/// values fall back to `default` — never a 0/negative/overflowing TTL.
pub fn int(key: &str, default: i64, max: i64) -> i64 {
    parse_int(get(key).ok().flatten().as_deref(), default, max)
}

fn parse_int(raw: Option<&str>, default: i64, max: i64) -> i64 {
    raw.map(|v| v.trim().trim_matches('"'))
        .and_then(|v| v.parse::<i64>().ok())
        .filter(|&n| n >= 1)
        .map(|n| n.min(max))
        .unwrap_or(default)
}

/// Pure bool parser (unit-tested). `default` for absent/empty/unrecognized.
pub(crate) fn parse_bool(raw: Option<&str>, default: bool) -> bool {
    match raw {
        Some(v) => match v.trim().trim_matches('"').to_ascii_lowercase().as_str() {
            "true" | "1" | "yes" | "on" => true,
            "false" | "0" | "no" | "off" => false,
            _ => default,
        },
        None => default,
    }
}

#[cfg(test)]
mod tests {
    use super::parse_bool;

    #[test]
    fn parse_bool_is_case_quote_and_synonym_tolerant() {
        for t in ["true", "TRUE", "\"true\"", "1", "yes", "on", " True "] {
            assert!(parse_bool(Some(t), false), "{t} should be true");
        }
        // The fail-open cases this replaces: quoted / cased / no / 0 now disable.
        for f in ["false", "FALSE", "\"false\"", "0", "no", "off", " False "] {
            assert!(!parse_bool(Some(f), true), "{f} should be false");
        }
        // Absent / empty / unrecognized fall back to the (fail-safe) default.
        assert!(parse_bool(None, true));
        assert!(!parse_bool(None, false));
        assert!(parse_bool(Some(""), true));
        assert!(!parse_bool(Some("garbage"), false));
    }

    #[test]
    fn parse_int_clamps_and_falls_back_safely() {
        use super::parse_int;
        assert_eq!(parse_int(Some("600"), 900, 86_400), 600);
        assert_eq!(parse_int(Some("\"600\""), 900, 86_400), 600);
        assert_eq!(parse_int(Some("99999999"), 900, 86_400), 86_400); // clamped to max
        assert_eq!(parse_int(Some("0"), 900, 86_400), 900); // non-positive -> default
        assert_eq!(parse_int(Some("-5"), 900, 86_400), 900);
        assert_eq!(parse_int(Some("nan"), 900, 86_400), 900);
        assert_eq!(parse_int(None, 900, 86_400), 900);
    }
}

#[cfg(test)]
mod secret_tests {
    use super::*;
    use std::cell::RefCell;

    #[test]
    fn legacy_secret_migrates_before_plaintext_is_cleared() {
        let writes = RefCell::new(Vec::new());
        let value = get_secret_with(
            "signup_access_code",
            |_| Ok(None),
            |_| Ok(Some("legacy-code".into())),
            |key, value| {
                writes
                    .borrow_mut()
                    .push(("secret", key.to_string(), value.to_string()));
                Ok(())
            },
            |key, value| {
                writes
                    .borrow_mut()
                    .push(("setting", key.to_string(), value.to_string()));
                Ok(())
            },
        )
        .unwrap();
        assert_eq!(value.as_deref(), Some("legacy-code"));
        assert_eq!(
            *writes.borrow(),
            vec![
                ("secret", "signup_access_code".into(), "legacy-code".into()),
                ("setting", "signup_access_code".into(), "".into()),
            ]
        );
    }

    #[test]
    fn failed_secret_migration_preserves_legacy_value_and_fails_closed() {
        let result = get_secret_with(
            "signup_access_code",
            |_| Ok(None),
            |_| Ok(Some("legacy-code".into())),
            |_, _| Err(SeamError::Secrets("unavailable".into())),
            |_, _| panic!("must not clear the only durable copy"),
        );
        assert!(matches!(result, Err(SeamError::Secrets(_))));
    }

    #[test]
    fn existing_secret_including_empty_value_wins_over_legacy_plaintext() {
        for current in ["new-code", ""] {
            let value = get_secret_with(
                "signup_access_code",
                |_| Ok(Some(current.into())),
                |_| Ok(Some("legacy-code".into())),
                |_, _| panic!("must not resurrect an old credential"),
                |_, value| {
                    assert!(value.is_empty());
                    Ok(())
                },
            )
            .unwrap();
            assert_eq!(value.as_deref(), Some(current));
        }
    }
}
