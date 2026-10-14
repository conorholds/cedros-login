use super::{SettingSpec, SettingValueKind};
use url::Url;

/// Validate a value without logging or echoing it (some values are sensitive).
pub fn validate_setting_value(spec: SettingSpec, value: &str) -> Result<(), String> {
    match spec.kind {
        SettingValueKind::Boolean => validate_bool(value),
        SettingValueKind::Integer { min, max } => validate_integer(value, min, max),
        SettingValueKind::Text {
            allow_empty,
            max_len,
        } => validate_text(value, allow_empty, max_len),
        SettingValueKind::Enum(values) => validate_enum(value, values),
        SettingValueKind::HttpUrl { allow_empty } => validate_http_url(value, allow_empty),
        SettingValueKind::Origin { allow_empty } => validate_origin(value, allow_empty),
        SettingValueKind::OriginList => validate_origin_list(value),
        SettingValueKind::Host { allow_empty } => validate_host(value, allow_empty),
        SettingValueKind::Email { allow_empty } => validate_email(value, allow_empty),
        SettingValueKind::InternalPath { allow_empty } => validate_path(value, allow_empty),
        SettingValueKind::UrlOrPath { allow_empty } => validate_url_or_path(value, allow_empty),
        SettingValueKind::CsvPermutation(values) => validate_csv(value, values, true),
        SettingValueKind::CsvUnique(values) => validate_csv(value, values, false),
    }
}

fn validate_bool(value: &str) -> Result<(), String> {
    matches!(value, "true" | "false")
        .then_some(())
        .ok_or_else(|| "Value must be true or false.".to_string())
}

fn validate_integer(value: &str, min: u64, max: u64) -> Result<(), String> {
    if value.is_empty() || !value.bytes().all(|byte| byte.is_ascii_digit()) {
        return Err(format!(
            "Value must be an integer from {min} through {max}."
        ));
    }
    let parsed = value
        .parse::<u64>()
        .map_err(|_| format!("Value must be an integer from {min} through {max}."))?;
    (min..=max)
        .contains(&parsed)
        .then_some(())
        .ok_or_else(|| format!("Value must be an integer from {min} through {max}."))
}

fn validate_text(value: &str, allow_empty: bool, max_len: usize) -> Result<(), String> {
    if (!allow_empty && value.is_empty())
        || value.chars().count() > max_len
        || value.chars().any(char::is_control)
    {
        return Err(format!(
            "Value must contain at most {max_len} printable characters."
        ));
    }
    Ok(())
}

fn validate_enum(value: &str, values: &[&str]) -> Result<(), String> {
    values
        .contains(&value)
        .then_some(())
        .ok_or_else(|| format!("Value must be one of: {}.", values.join(", ")))
}

fn parse_http_url(value: &str) -> Result<Url, String> {
    let parsed =
        Url::parse(value).map_err(|_| "Value must be an absolute HTTP(S) URL.".to_string())?;
    if !matches!(parsed.scheme(), "http" | "https")
        || parsed.host().is_none()
        || !parsed.username().is_empty()
        || parsed.password().is_some()
    {
        return Err("Value must be an absolute HTTP(S) URL without credentials.".to_string());
    }
    Ok(parsed)
}

fn validate_http_url(value: &str, allow_empty: bool) -> Result<(), String> {
    if allow_empty && value.is_empty() {
        return Ok(());
    }
    parse_http_url(value).map(|_| ())
}

fn validate_origin(value: &str, allow_empty: bool) -> Result<(), String> {
    if allow_empty && value.is_empty() {
        return Ok(());
    }
    let parsed = parse_http_url(value)?;
    if parsed.path() != "/" || parsed.query().is_some() || parsed.fragment().is_some() {
        return Err(
            "Value must be an HTTP(S) origin without a path, query, or fragment.".to_string(),
        );
    }
    Ok(())
}

fn validate_origin_list(value: &str) -> Result<(), String> {
    if value.is_empty() {
        return Ok(());
    }
    let origins: Vec<_> = value.split(',').map(str::trim).collect();
    if origins.iter().any(|origin| origin.is_empty()) {
        return Err("Value must be a comma-separated list of HTTP(S) origins.".to_string());
    }
    for origin in origins {
        validate_origin(origin, false)?;
    }
    Ok(())
}

fn validate_host(value: &str, allow_empty: bool) -> Result<(), String> {
    if allow_empty && value.is_empty() {
        return Ok(());
    }
    let host = value.strip_prefix('.').unwrap_or(value);
    url::Host::parse(host)
        .map(|_| ())
        .map_err(|_| "Value must be a valid hostname or IP address.".to_string())
}

fn validate_email(value: &str, allow_empty: bool) -> Result<(), String> {
    if allow_empty && value.is_empty() {
        return Ok(());
    }
    if value.len() > 254 || value.chars().any(char::is_control) {
        return Err("Value must be a valid email address.".to_string());
    }
    let (local, domain) = value
        .split_once('@')
        .ok_or_else(|| "Value must be a valid email address.".to_string())?;
    if local.is_empty() || local.len() > 64 || domain.contains('@') {
        return Err("Value must be a valid email address.".to_string());
    }
    validate_host(domain, false).map_err(|_| "Value must be a valid email address.".to_string())
}

fn validate_path(value: &str, allow_empty: bool) -> Result<(), String> {
    if allow_empty && value.is_empty() {
        return Ok(());
    }
    if !value.starts_with('/')
        || value.starts_with("//")
        || value.contains('\\')
        || value.contains('?')
        || value.contains('#')
        || value
            .split('/')
            .any(|segment| matches!(segment, "." | ".."))
        || value.chars().any(char::is_whitespace)
        || value.chars().any(char::is_control)
    {
        return Err("Value must be an internal path beginning with one '/'.".to_string());
    }
    Ok(())
}

fn validate_url_or_path(value: &str, allow_empty: bool) -> Result<(), String> {
    if allow_empty && value.is_empty() {
        return Ok(());
    }
    if value.starts_with('/') {
        validate_path(value, false)
    } else {
        validate_http_url(value, false)
    }
}

fn validate_csv(value: &str, allowed: &[&str], exact: bool) -> Result<(), String> {
    let parts: Vec<_> = value.split(',').map(str::trim).collect();
    let valid_count = !exact || parts.len() == allowed.len();
    let valid_values = parts.iter().all(|part| allowed.contains(part));
    let unique = parts
        .iter()
        .enumerate()
        .all(|(index, part)| !parts[..index].contains(part));
    (valid_count && valid_values && unique && !parts.is_empty())
        .then_some(())
        .ok_or_else(|| {
            format!(
                "Value must contain unique entries from: {}.",
                allowed.join(", ")
            )
        })
}
