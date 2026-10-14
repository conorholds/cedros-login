//! Auth cookie building + parsing, ported from `server/src/utils/cookies.rs`.
//! Config comes from the settings seam with production-safe defaults. The
//! refresh cookie is scoped to the extension mount so public-auth refresh can
//! rotate sessions; the access cookie is site-wide.
use crate::exports::cedros::extension::routes::RouteRequest;
use crate::host::settings;
use crate::services::jwt::TokenPair;

const ACCESS_COOKIE_PATH: &str = "/";
// The host mounts this extension at /extensions/cedros-login.
const REFRESH_COOKIE_PATH: &str = "/extensions/cedros-login";
const LEGACY_REFRESH_COOKIE_PATH: &str = "/extensions/cedros-login/refresh";

pub struct CookieSettings {
    pub enabled: bool,
    pub access_name: String,
    pub refresh_name: String,
    secure: bool,
    same_site: String,
    domain: Option<String>,
}

/// Load cookie config from settings (secure defaults).
pub fn config() -> CookieSettings {
    CookieSettings {
        enabled: bool_setting("cookie_enabled", true),
        secure: bool_setting("cookie_secure", true),
        same_site: str_setting("cookie_same_site", "lax"),
        domain: settings::get("cookie_domain")
            .ok()
            .flatten()
            .map(|v| v.trim().trim_matches('"').to_string())
            .filter(|d| !d.is_empty() && is_valid_domain(d)),
        access_name: str_setting("cookie_access_name", "cedros_access"),
        refresh_name: str_setting("cookie_refresh_name", "cedros_refresh"),
    }
}

impl CookieSettings {
    /// Set-Cookie headers for a fresh token pair (`refresh_max_age` in seconds).
    pub fn auth_cookies(&self, tokens: &TokenPair, refresh_max_age: i64) -> Vec<(String, String)> {
        vec![
            (
                "set-cookie".to_string(),
                self.cookie(
                    &self.access_name,
                    &tokens.access_token,
                    tokens.expires_in as i64,
                    ACCESS_COOKIE_PATH,
                ),
            ),
            (
                "set-cookie".to_string(),
                self.cookie(
                    &self.refresh_name,
                    &tokens.refresh_token,
                    refresh_max_age,
                    REFRESH_COOKIE_PATH,
                ),
            ),
            (
                "set-cookie".to_string(),
                self.delete(&self.refresh_name, LEGACY_REFRESH_COOKIE_PATH),
            ),
        ]
    }

    /// Set-Cookie headers that clear the auth cookies (logout).
    pub fn logout_cookies(&self) -> Vec<(String, String)> {
        vec![
            (
                "set-cookie".to_string(),
                self.delete(&self.access_name, ACCESS_COOKIE_PATH),
            ),
            (
                "set-cookie".to_string(),
                self.delete(&self.refresh_name, REFRESH_COOKIE_PATH),
            ),
            (
                "set-cookie".to_string(),
                self.delete(&self.refresh_name, LEGACY_REFRESH_COOKIE_PATH),
            ),
        ]
    }

    fn cookie(&self, name: &str, value: &str, max_age: i64, path: &str) -> String {
        let mut c = format!("{name}={value}; Path={path}; Max-Age={max_age}; HttpOnly");
        self.append_attrs(&mut c);
        c
    }

    fn delete(&self, name: &str, path: &str) -> String {
        let mut c = format!("{name}=deleted; Path={path}; Max-Age=0; HttpOnly");
        self.append_attrs(&mut c);
        c
    }

    fn append_attrs(&self, c: &mut String) {
        if self.secure {
            c.push_str("; Secure");
        }
        match self.same_site.to_lowercase().as_str() {
            "strict" => c.push_str("; SameSite=Strict"),
            "none" => c.push_str("; SameSite=None"),
            _ => c.push_str("; SameSite=Lax"),
        }
        if let Some(domain) = &self.domain {
            c.push_str(&format!("; Domain={domain}"));
        }
    }
}

/// Parse one cookie value from the request `Cookie` header.
pub fn extract(request: &RouteRequest, name: &str) -> Option<String> {
    let header = request
        .headers
        .iter()
        .find(|(k, _)| k.eq_ignore_ascii_case("cookie"))
        .map(|(_, v)| v.as_str())?;
    let prefix = format!("{name}=");
    for part in header.split(';') {
        if let Some(value) = part.trim().strip_prefix(&prefix) {
            return Some(value.to_string());
        }
    }
    None
}

fn bool_setting(key: &str, default: bool) -> bool {
    settings::get(key)
        .ok()
        .flatten()
        .map(|v| {
            let t = v.trim().trim_matches('"');
            t != "false" && t != "0"
        })
        .unwrap_or(default)
}

fn str_setting(key: &str, default: &str) -> String {
    settings::get(key)
        .ok()
        .flatten()
        .map(|v| v.trim().trim_matches('"').to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| default.to_string())
}

/// Reject overly broad domains (require ≥2 labels, valid chars).
fn is_valid_domain(domain: &str) -> bool {
    let stripped = domain.strip_prefix('.').unwrap_or(domain);
    domain
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-')
        && stripped.split('.').count() >= 2
        && stripped.split('.').all(|label| !label.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::exports::cedros::extension::routes::RouteRequest;

    fn cfg() -> CookieSettings {
        CookieSettings {
            enabled: true,
            access_name: "cedros_access".into(),
            refresh_name: "cedros_refresh".into(),
            secure: true,
            same_site: "lax".into(),
            domain: None,
        }
    }

    #[test]
    fn auth_cookies_have_secure_httponly_paths() {
        let tokens = TokenPair {
            access_token: "AT".into(),
            refresh_token: "RT".into(),
            expires_in: 900,
        };
        let headers = cfg().auth_cookies(&tokens, 604800);
        let access = &headers[0].1;
        let refresh = &headers[1].1;
        assert!(access.starts_with("cedros_access=AT; Path=/; Max-Age=900; HttpOnly"));
        assert!(access.contains("; Secure"));
        assert!(access.contains("; SameSite=Lax"));
        assert!(refresh.contains("Path=/extensions/cedros-login"));
        assert!(refresh.contains("Max-Age=604800"));
    }

    #[test]
    fn logout_cookies_expire_current_and_legacy_paths() {
        let headers = cfg().logout_cookies();
        assert!(headers[0].1.contains("Max-Age=0"));
        assert!(headers[1].1.contains("Max-Age=0"));
        assert!(headers[1].1.contains("Path=/extensions/cedros-login"));
        assert!(headers[2]
            .1
            .contains("Path=/extensions/cedros-login/refresh"));
        assert!(headers[2].1.contains("Max-Age=0"));
    }

    #[test]
    fn extract_parses_named_cookie() {
        let req = RouteRequest {
            route_id: "cedros-login:auth".into(),
            method: "POST".into(),
            path: "/refresh".into(),
            headers: vec![(
                "cookie".into(),
                "cedros_access=AT; cedros_refresh=RT".into(),
            )],
            query: vec![],
            body: String::new(),
            context_json: String::new(),
        };
        assert_eq!(extract(&req, "cedros_refresh").as_deref(), Some("RT"));
        assert_eq!(extract(&req, "missing"), None);
    }

    #[test]
    fn rejects_broad_domains() {
        assert!(is_valid_domain("example.com"));
        assert!(is_valid_domain(".sub.example.com"));
        assert!(!is_valid_domain("com"));
        assert!(!is_valid_domain("example..com"));
    }
}
