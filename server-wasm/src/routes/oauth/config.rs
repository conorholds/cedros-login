//! Explicit static public-client registration. No automatic client trust, DCR,
//! metadata URL fetching, secrets, or wildcard redirects.
use super::*;
use std::collections::HashSet;

const CONFIG_KEY: &str = "oauth_authorization_server";
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct Config {
    pub issuer: String,
    pub consent_uri: String,
    pub clients: Vec<Client>,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct Client {
    pub client_id: String,
    pub client_name: String,
    pub redirect_uris: Vec<String>,
    pub resources: Vec<String>,
    pub scopes: Vec<String>,
}
impl Config {
    pub fn load() -> Result<Self, RouteError> {
        let raw =
            settings::get(CONFIG_KEY)?.ok_or(RouteError::Status(503, "oauth_not_configured"))?;
        let config: Self = serde_json::from_str(&raw)
            .map_err(|_| RouteError::Status(503, "oauth_configuration_invalid"))?;
        config.validate()?;
        Ok(config)
    }
    pub fn client(&self, id: &str) -> Result<&Client, RouteError> {
        self.clients
            .iter()
            .find(|c| c.client_id == id)
            .ok_or(RouteError::Status(400, "invalid_client"))
    }
    pub fn validate(&self) -> Result<(), RouteError> {
        let issuer = https(&self.issuer)?;
        let consent = https(&self.consent_uri)?;
        if self.issuer.ends_with('/')
            || issuer.origin() != consent.origin()
            || self.clients.is_empty()
            || self.clients.len() > 20
        {
            return Err(bad());
        }
        let mut ids = HashSet::new();
        for c in &self.clients {
            if c.client_id.is_empty()
                || c.client_id.len() > 256
                || !c.client_id.bytes().all(|byte| byte.is_ascii_graphic())
                || !ids.insert(&c.client_id)
                || c.client_name.trim().is_empty()
                || c.client_name.len() > 120
                || c.redirect_uris.is_empty()
                || c.redirect_uris.len() > 20
                || c.resources.is_empty()
                || c.resources.len() > 20
                || c.scopes.is_empty()
                || c.scopes.len() > 30
            {
                return Err(bad());
            }
            for uri in &c.redirect_uris {
                redirect_uri(uri)?;
            }
            for uri in &c.resources {
                https(uri)?;
            }
            if c.scopes.iter().any(|s| {
                !scope_token(s)
                    || (!ACCOUNT_SCOPES.contains(&s.as_str()) && !SITE_SCOPES.contains(&s.as_str()))
            }) {
                return Err(bad());
            }
        }
        Ok(())
    }
}
fn bad() -> RouteError {
    RouteError::Status(400, "invalid_oauth_configuration")
}
/// Native clients may register an exact localhost callback and port, or the
/// IPv4 loopback callback without a port for an ephemeral listener (RFC 8252).
/// Validate the literal spelling before parsing so URL normalization cannot
/// admit credentials, alternate hosts, encoded paths, or implicit ports.
pub(super) fn redirect_uri(value: &str) -> Result<Url, RouteError> {
    if let Some(rest) = value.strip_prefix("http://127.0.0.1") {
        let (authority, path) = rest.split_once('/').ok_or_else(bad)?;
        let valid_port = authority.is_empty()
            || authority.strip_prefix(':').is_some_and(|port| {
                port.parse::<u16>()
                    .is_ok_and(|number| number != 0 && number.to_string() == port)
            });
        let valid_path = path == "callback"
            || path.strip_prefix("callback/").is_some_and(|id| {
                !id.is_empty()
                    && id.len() <= 128
                    && id
                        .bytes()
                        .all(|b| b.is_ascii_alphanumeric() || b"-_".contains(&b))
            });
        if valid_port && valid_path {
            return Url::parse(value).map_err(|_| bad());
        }
        return Err(bad());
    }
    if let Some(port) = value
        .strip_prefix("http://localhost:")
        .and_then(|rest| rest.strip_suffix("/callback"))
    {
        let number = port.parse::<u16>().map_err(|_| bad())?;
        if number != 0 && number.to_string() == port {
            return Url::parse(value).map_err(|_| bad());
        }
    }
    https(value)
}
pub(super) fn redirect_matches(registered: &[String], requested: &str) -> bool {
    let Ok(requested_url) = redirect_uri(requested) else {
        return false;
    };
    registered.iter().any(|uri| {
        uri == requested
            || (uri.starts_with("http://127.0.0.1/")
                && requested.starts_with("http://127.0.0.1:")
                && redirect_uri(uri)
                    .is_ok_and(|registered_url| registered_url.path() == requested_url.path()))
    })
}
pub(super) fn https(value: &str) -> Result<Url, RouteError> {
    let url = Url::parse(value).map_err(|_| bad())?;
    if value.trim() != value
        || value.chars().any(char::is_control)
        || url.scheme() != "https"
        || url.host_str().is_none()
        || !url.username().is_empty()
        || url.password().is_some()
        || url.query().is_some()
        || url.fragment().is_some()
        || value.len() > 2048
    {
        return Err(bad());
    }
    Ok(url)
}
pub(super) fn scope_token(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= 80
        && value
            .bytes()
            .all(|b| b == 0x21 || (0x23..=0x5b).contains(&b) || (0x5d..=0x7e).contains(&b))
}
pub(super) fn get(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    super::super::require_system_admin(request)?;
    let config = Config::load()?;
    Ok(json(200, &to_json(&config)?))
}
pub(super) fn put(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    super::super::require_system_admin_write(request)?;
    if request.body.len() > 32_768 {
        return Err(RouteError::Status(413, "request_too_large"));
    }
    let config: Config = from_json(&request.body).map_err(|_| bad())?;
    config.validate()?;
    settings::set(CONFIG_KEY, &to_json(&config)?)?;
    Ok(json(200, &to_json(&config)?))
}
