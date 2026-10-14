const MAX_METADATA_FIELDS: usize = 5;
const MAX_METADATA_VALUE_LEN: usize = 160;

fn should_redact_metadata_key(key: &str) -> bool {
    let key = key.to_ascii_lowercase();
    key.contains("token")
        || key.contains("secret")
        || key.contains("password")
        || key.contains("authorization")
        || key.contains("cookie")
        || key.ends_with("_key")
        || key.ends_with("_api_key")
}

fn looks_like_secret_value(value: &str) -> bool {
    if value.matches('.').count() == 2 && value.len() > 40 {
        return true;
    }

    let longish = value.len() > 64;
    let mostly_base64 = value.chars().all(|character| {
        character.is_ascii_alphanumeric()
            || character == '+'
            || character == '/'
            || character == '='
            || character == '-'
            || character == '_'
    });
    longish && mostly_base64
}

pub(super) fn truncate_value(value: String) -> String {
    if value.len() <= MAX_METADATA_VALUE_LEN {
        return value;
    }

    let mut truncated = value;
    let safe_index = truncated
        .char_indices()
        .map(|(index, _)| index)
        .take_while(|index| *index <= MAX_METADATA_VALUE_LEN)
        .last()
        .unwrap_or(0);

    truncated.truncate(safe_index);
    truncated.push('…');
    truncated
}

pub(super) fn sanitize_metadata_for_display(metadata: &serde_json::Value) -> Vec<(String, String)> {
    let Some(object) = metadata.as_object() else {
        return vec![];
    };

    object
        .iter()
        .take(MAX_METADATA_FIELDS)
        .map(|(key, value)| {
            let value = value.to_string().trim_matches('"').to_string();
            let rendered = if should_redact_metadata_key(key) || looks_like_secret_value(&value) {
                "[redacted]".to_string()
            } else {
                truncate_value(value)
            };
            (key.clone(), rendered)
        })
        .collect()
}

#[cfg(test)]
pub(super) const TEST_MAX_METADATA_VALUE_LEN: usize = MAX_METADATA_VALUE_LEN;
