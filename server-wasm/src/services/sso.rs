//! Pure OIDC SSO helpers: PKCE, the authorization URL, and the token-exchange
//! form body. The HTTP calls (discovery, token exchange, JWKS verify) live in
//! the route layer over the `http` seam; this stays pure and unit-testable.
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use rand::{rngs::OsRng, RngCore};
use sha2::{Digest, Sha256};

/// A PKCE pair: the secret `verifier` (stored server-side) and the S256
/// `challenge` (sent to the provider).
pub struct Pkce {
    pub verifier: String,
    pub challenge: String,
}

/// Generate a PKCE pair (S256): verifier = 32 random bytes (b64url), challenge =
/// b64url(SHA-256(verifier)).
pub fn generate_pkce() -> Pkce {
    let mut bytes = [0u8; 32];
    OsRng.fill_bytes(&mut bytes);
    let verifier = URL_SAFE_NO_PAD.encode(bytes);
    let challenge = URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()));
    Pkce {
        verifier,
        challenge,
    }
}

/// A random URL-safe token (OIDC `state` / `nonce`).
pub fn random_token() -> String {
    let mut bytes = [0u8; 32];
    OsRng.fill_bytes(&mut bytes);
    URL_SAFE_NO_PAD.encode(bytes)
}

/// Percent-encode per RFC 3986 (keep unreserved chars).
pub fn percent_encode(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    for &b in input.as_bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(b as char)
            }
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}

/// Build the OIDC authorization URL (Authorization Code + PKCE).
#[allow(clippy::too_many_arguments)]
pub fn authorize_url(
    endpoint: &str,
    client_id: &str,
    redirect_uri: &str,
    scope: &str,
    state: &str,
    nonce: &str,
    code_challenge: &str,
) -> String {
    let sep = if endpoint.contains('?') { '&' } else { '?' };
    format!(
        "{endpoint}{sep}response_type=code&client_id={}&redirect_uri={}&scope={}&state={}&nonce={}&code_challenge={}&code_challenge_method=S256",
        percent_encode(client_id),
        percent_encode(redirect_uri),
        percent_encode(scope),
        percent_encode(state),
        percent_encode(nonce),
        percent_encode(code_challenge),
    )
}

/// Build the `application/x-www-form-urlencoded` token-exchange body.
pub fn token_request_form(
    code: &str,
    redirect_uri: &str,
    client_id: &str,
    client_secret: &str,
    code_verifier: &str,
) -> String {
    format!(
        "grant_type=authorization_code&code={}&redirect_uri={}&client_id={}&client_secret={}&code_verifier={}",
        percent_encode(code),
        percent_encode(redirect_uri),
        percent_encode(client_id),
        percent_encode(client_secret),
        percent_encode(code_verifier),
    )
}

/// Extract the canonical host and effective port from an **https** URL.
/// Userinfo, single-label hosts, and malformed URLs are rejected so callers can
/// compare complete origins and fail closed.
pub fn https_origin(url: &str) -> Option<(String, u16)> {
    let url = url::Url::parse(url.trim()).ok()?;
    if url.scheme() != "https" || !url.username().is_empty() || url.password().is_some() {
        return None;
    }
    let host = url.host_str()?.trim_end_matches('.').to_ascii_lowercase();
    if host.is_empty() || !host.contains('.') {
        return None;
    }
    Some((host, url.port_or_known_default()?))
}

/// Whether the endpoint uses the issuer's exact HTTPS origin. DNS ancestry is
/// not sufficient because parent and child zones can have different operators.
pub fn same_origin(issuer_url: &str, endpoint_url: &str) -> bool {
    https_origin(issuer_url).is_some_and(|issuer| Some(issuer) == https_origin(endpoint_url))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pkce_challenge_is_s256_of_verifier() {
        let p = generate_pkce();
        assert_eq!(
            p.challenge,
            URL_SAFE_NO_PAD.encode(Sha256::digest(p.verifier.as_bytes()))
        );
        assert_ne!(generate_pkce().verifier, generate_pkce().verifier);
    }

    #[test]
    fn percent_encode_keeps_unreserved_and_escapes_the_rest() {
        assert_eq!(percent_encode("aZ0-_.~"), "aZ0-_.~");
        assert_eq!(percent_encode("a b/c?d"), "a%20b%2Fc%3Fd");
        assert_eq!(percent_encode("openid email"), "openid%20email");
    }

    #[test]
    fn https_origin_extracts_or_rejects() {
        assert_eq!(
            https_origin("https://login.microsoftonline.com/tenant/v2.0"),
            Some(("login.microsoftonline.com".to_string(), 443))
        );
        assert_eq!(
            https_origin("https://idp.example.com:8443/path?q#f"),
            Some(("idp.example.com".to_string(), 8443))
        );
        assert_eq!(https_origin("https://user:pw@idp.example.com"), None);
        assert_eq!(https_origin("http://idp.example.com"), None); // not https
        assert_eq!(https_origin("https://localhost"), None); // no dot
        assert_eq!(https_origin("not a url"), None);
    }

    #[test]
    fn same_origin_rejects_host_scheme_and_port_pivots() {
        assert!(same_origin(
            "https://login.okta.com/tenant",
            "https://login.okta.com/token"
        ));
        assert!(same_origin(
            "https://login.okta.com:443/tenant",
            "https://login.okta.com/token"
        ));
        assert!(!same_origin(
            "https://github.io/tenant",
            "https://attacker.github.io/token"
        ));
        assert!(!same_origin(
            "https://idp.example.com/tenant",
            "https://example.com/token"
        ));
        assert!(!same_origin(
            "https://idp.example.com/tenant",
            "https://idp.example.com:8443/token"
        ));
        assert!(!same_origin(
            "https://idp.example.com/tenant",
            "http://idp.example.com/token"
        ));
    }

    #[test]
    fn authorize_url_carries_pkce_and_state() {
        let url = authorize_url(
            "https://idp.test/authorize",
            "cid",
            "https://app/cb",
            "openid email",
            "st",
            "no",
            "ch",
        );
        assert!(url.starts_with("https://idp.test/authorize?response_type=code"));
        assert!(url.contains("client_id=cid"));
        assert!(url.contains("redirect_uri=https%3A%2F%2Fapp%2Fcb"));
        assert!(url.contains("scope=openid%20email"));
        assert!(url.contains("code_challenge=ch&code_challenge_method=S256"));
        assert!(url.contains("state=st"));
    }

    #[test]
    fn token_form_is_form_encoded() {
        let form = token_request_form("the code", "https://app/cb", "cid", "sec/ret", "ver");
        assert!(form.contains("grant_type=authorization_code"));
        assert!(form.contains("code=the%20code"));
        assert!(form.contains("client_secret=sec%2Fret"));
        assert!(form.contains("code_verifier=ver"));
    }
}
