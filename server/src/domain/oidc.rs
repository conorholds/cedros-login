//! Additional OIDC claims validation after cryptographic JWT verification.
use serde_json::Value;

pub(crate) fn valid_claims(claims: &Value, audiences: &[&str], now: i64) -> bool {
    let Some(subject) = claims.get("sub").and_then(Value::as_str) else {
        return false;
    };
    let Some(issued) = claims.get("iat").and_then(Value::as_i64) else {
        return false;
    };
    let Some(expires) = claims.get("exp").and_then(Value::as_i64) else {
        return false;
    };
    if subject.is_empty()
        || subject.len() > 255
        || !subject.is_ascii()
        || issued < 0
        || issued > now.saturating_add(60)
        || expires <= now
        || expires <= issued
    {
        return false;
    }
    if let Some(nbf) = claims.get("nbf") {
        if !nbf.as_i64().is_some_and(|value| value <= now) {
            return false;
        }
    }
    let audience_count = match claims.get("aud") {
        Some(Value::String(value)) if audiences.contains(&value.as_str()) => 1,
        Some(Value::Array(values))
            if !values.is_empty()
                && values
                    .iter()
                    .all(|value| value.as_str().is_some_and(|value| !value.is_empty()))
                && values.iter().any(|value| {
                    value
                        .as_str()
                        .is_some_and(|value| audiences.contains(&value))
                }) =>
        {
            values.len()
        }
        _ => return false,
    };
    match claims.get("azp") {
        Some(value) => value
            .as_str()
            .is_some_and(|value| audiences.contains(&value)),
        None => audience_count == 1,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn claims_bind_subject_time_audience_and_authorized_party() {
        let good = serde_json::json!({"sub":"subject", "iat":900, "exp":1100, "aud":"client"});
        assert!(valid_claims(&good, &["client"], 1000));
        for (field, value) in [
            ("sub", serde_json::json!("")),
            ("sub", serde_json::json!(null)),
            ("iat", serde_json::json!(1061)),
            ("iat", serde_json::json!(null)),
            ("exp", serde_json::json!(1000)),
            ("nbf", serde_json::json!(1001)),
            ("aud", serde_json::json!("other")),
            ("aud", serde_json::json!(["client", "other"])),
            ("azp", serde_json::json!("other")),
            ("azp", serde_json::json!(null)),
        ] {
            let mut bad = good.clone();
            bad[field] = value;
            assert!(!valid_claims(&bad, &["client"], 1000), "{bad}");
        }
        let mut multiple = good;
        multiple["aud"] = serde_json::json!(["client", "other"]);
        multiple["azp"] = serde_json::json!("client");
        assert!(valid_claims(&multiple, &["client"], 1000));
    }
}
