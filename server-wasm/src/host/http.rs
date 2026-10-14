//! Outbound HTTPS via the operator-allowlisted egress seam (host `http`).
//!
//! Used for federated login: OIDC discovery, JWKS fetch, token exchange (Google/
//! Apple/enterprise IdPs). The interface is always linked but inert until the
//! operator sets `CEDROS_EXTENSION_HTTP_ALLOWLIST` for cedros-login — every call
//! returns an error until then, so social/SSO degrades gracefully. HTTPS-only,
//! SSRF-guarded by the host.
use super::{from_json, to_json, Result, SeamError};
use crate::cedros::extension::http;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpRequest<'a> {
    pub method: &'a str,
    pub url: &'a str,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub headers: Vec<(String, String)>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
}

#[derive(Deserialize)]
pub struct HttpResponse {
    pub status: u16,
    #[serde(default)]
    pub body: String,
}

fn map_err(e: http::HostError) -> SeamError {
    SeamError::Http(e.message)
}

/// Perform one outbound request. Fails closed if the host host-allowlist denies it.
pub fn fetch(request: &HttpRequest) -> Result<HttpResponse> {
    let raw = http::fetch(&to_json(request)?).map_err(map_err)?;
    from_json(&raw)
}

/// GET a JSON document (e.g. an OIDC discovery doc or JWKS) over allowlisted egress.
pub fn get_json(url: &str) -> Result<serde_json::Value> {
    get_json_typed(url)
}

pub fn get_json_typed<T: serde::de::DeserializeOwned>(url: &str) -> Result<T> {
    let resp = fetch(&HttpRequest {
        method: "GET",
        url,
        headers: Vec::new(),
        body: None,
    })?;
    if !(200..300).contains(&resp.status) {
        return Err(SeamError::Http(format!(
            "GET {url} returned status {}",
            resp.status
        )));
    }
    from_json(&resp.body)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn request_serializes_https_shape() {
        let r = HttpRequest {
            method: "POST",
            url: "https://oauth2.googleapis.com/token",
            headers: vec![("content-type".into(), "application/json".into())],
            body: Some("{}".into()),
        };
        let j = serde_json::to_value(&r).unwrap();
        assert_eq!(j["method"], "POST");
        assert_eq!(j["headers"][0][0], "content-type");
        assert_eq!(j["body"], "{}");
    }
}
