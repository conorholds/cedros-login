//! Pure request validation for the OAuth trust boundary.
use super::*;
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use sha2::{Digest, Sha256};
use std::collections::{BTreeSet, HashMap};

pub(super) fn parameters(
    pairs: &[(String, String)],
) -> Result<HashMap<String, String>, RouteError> {
    if pairs.len() > 16 || pairs.iter().map(|(k, v)| k.len() + v.len()).sum::<usize>() > 8192 {
        return Err(RouteError::Status(400, "invalid_request"));
    }
    let mut result = HashMap::new();
    for (key, value) in pairs {
        if result.insert(key.clone(), value.clone()).is_some() {
            return Err(RouteError::Status(400, "invalid_request"));
        }
    }
    Ok(result)
}
pub(super) fn form(request: &RouteRequest) -> Result<HashMap<String, String>, RouteError> {
    if request.body.len() > 8192 {
        return Err(RouteError::Status(413, "request_too_large"));
    }
    if !request.headers.iter().any(|(k, v)| {
        k.eq_ignore_ascii_case("content-type")
            && v.split(';').next().is_some_and(|v| {
                v.trim()
                    .eq_ignore_ascii_case("application/x-www-form-urlencoded")
            })
    }) {
        return Err(RouteError::Status(415, "invalid_request"));
    }
    parameters(
        &url::form_urlencoded::parse(request.body.as_bytes())
            .into_owned()
            .collect::<Vec<_>>(),
    )
}
pub(super) fn required<'a>(
    p: &'a HashMap<String, String>,
    key: &str,
) -> Result<&'a str, RouteError> {
    p.get(key)
        .map(String::as_str)
        .filter(|v| !v.is_empty())
        .ok_or(RouteError::Status(400, "invalid_request"))
}
pub(super) fn scopes(raw: &str, client: &config::Client) -> Result<String, RouteError> {
    let tokens: BTreeSet<&str> = raw.split(' ').collect();
    if tokens.is_empty()
        || tokens
            .iter()
            .any(|s| !config::scope_token(s) || !client.scopes.iter().any(|allowed| allowed == s))
    {
        return Err(RouteError::Status(400, "invalid_scope"));
    }
    Ok(tokens.into_iter().collect::<Vec<_>>().join(" "))
}
pub(super) fn challenge_valid(value: &str) -> bool {
    value.len() == 43 && URL_SAFE_NO_PAD.decode(value).is_ok_and(|v| v.len() == 32)
}
pub(super) fn verify_pkce(verifier: &str, challenge: &str) -> bool {
    (43..=128).contains(&verifier.len())
        && verifier
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"-._~".contains(&b))
        && constant_time_eq(
            &URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes())),
            challenge,
        )
}
pub(super) fn constant_time_eq(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.bytes()
        .zip(b.bytes())
        .fold(0u8, |diff, (a, b)| diff | (a ^ b))
        == 0
}
pub(super) fn id_from_path(path: &str) -> Result<&str, RouteError> {
    let id = path
        .strip_prefix("/oauth/requests/")
        .ok_or(RouteError::Status(400, "invalid_request"))?;
    if id.len() != 64 || !id.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err(RouteError::Status(400, "invalid_request"));
    }
    Ok(id)
}
pub(super) fn redirect(c: &Connection, key: &str, value: &str) -> Result<String, RouteError> {
    let mut url = config::redirect_uri(&c.redirect_uri)?;
    url.query_pairs_mut()
        .append_pair(key, value)
        .append_pair("state", &c.state)
        .append_pair("iss", &c.issuer);
    if url.scheme() == "http" {
        // URL serialization drops explicit port 80; retain the registered URI.
        Ok(format!(
            "{}?{}",
            c.redirect_uri,
            url.query().unwrap_or_default()
        ))
    } else {
        Ok(url.into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rfc7636_vector_and_rejections() {
        let verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
        let challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
        assert!(challenge_valid(challenge));
        assert!(verify_pkce(verifier, challenge));
        for wrong in ["short", "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXz"] {
            assert!(!verify_pkce(wrong, challenge));
        }
        assert!(!challenge_valid("plain"));
        assert!(!verify_pkce(&"!".repeat(43), challenge));
    }
    #[test]
    fn duplicate_parameters_and_untrusted_redirects_rejected() {
        assert!(parameters(&[
            ("resource".into(), "one".into()),
            ("resource".into(), "two".into())
        ])
        .is_err());
        for bad in [
            "http://example.com",
            "https://user:pass@example.com",
            "https://example.com/#fragment",
            "https://example.com/?query",
        ] {
            assert!(config::https(bad).is_err());
        }
    }
}
