//! Device detection utilities for security alerts

use sha2::{Digest, Sha256};

/// S-14: Maximum user-agent length to prevent DoS via memory exhaustion.
/// Typical user-agents are <256 chars; max observed is ~1024.
const MAX_USER_AGENT_LEN: usize = 2048;

/// Parsed device information from a user agent string
#[derive(Debug, Clone)]
pub struct DeviceInfo {
    pub device_type: String,
    pub browser: String,
    pub fingerprint: String,
}

impl DeviceInfo {
    /// Parse device info from a user agent string.
    /// S-14: Truncates oversized user-agents to prevent DoS attacks.
    pub fn from_user_agent(user_agent: Option<&str>) -> Self {
        let ua = user_agent.unwrap_or("Unknown");
        // Truncate to prevent memory exhaustion from malicious user-agents
        let ua = if ua.len() > MAX_USER_AGENT_LEN {
            &ua[..MAX_USER_AGENT_LEN]
        } else {
            ua
        };

        let device_type = parse_device_type(ua);
        let browser = parse_browser(ua);
        let fingerprint = generate_fingerprint(ua);

        Self {
            device_type,
            browser,
            fingerprint,
        }
    }
}

/// Parse the device type from a user agent
fn parse_device_type(ua: &str) -> String {
    let ua_lower = ua.to_lowercase();

    if ua_lower.contains("iphone") {
        "iPhone".to_string()
    } else if ua_lower.contains("ipad") {
        "iPad".to_string()
    } else if ua_lower.contains("android") && ua_lower.contains("mobile") {
        "Android Phone".to_string()
    } else if ua_lower.contains("android") {
        "Android Tablet".to_string()
    } else if ua_lower.contains("macintosh") || ua_lower.contains("mac os") {
        "Mac".to_string()
    } else if ua_lower.contains("windows") {
        "Windows PC".to_string()
    } else if ua_lower.contains("linux") {
        "Linux".to_string()
    } else if ua_lower.contains("cros") {
        "Chromebook".to_string()
    } else {
        "Unknown device".to_string()
    }
}

/// Parse the browser from a user agent
fn parse_browser(ua: &str) -> String {
    // Order matters - check more specific patterns first
    if ua.contains("Edg/") || ua.contains("Edge/") {
        "Microsoft Edge".to_string()
    } else if ua.contains("OPR/") || ua.contains("Opera") {
        "Opera".to_string()
    } else if ua.contains("Chrome/") && !ua.contains("Chromium/") {
        "Chrome".to_string()
    } else if ua.contains("Safari/") && !ua.contains("Chrome/") {
        "Safari".to_string()
    } else if ua.contains("Firefox/") {
        "Firefox".to_string()
    } else if ua.contains("MSIE") || ua.contains("Trident/") {
        "Internet Explorer".to_string()
    } else {
        "Unknown browser".to_string()
    }
}

/// Generate a fingerprint hash from the user agent
/// This is used to detect if a device has been seen before.
///
/// S-12: Uses SHA-256 (cryptographically secure, stable across versions)
/// instead of DefaultHasher (non-crypto, unstable hash values).
fn generate_fingerprint(ua: &str) -> String {
    let hash = Sha256::digest(ua.as_bytes());
    // Use first 16 bytes (32 hex chars) for reasonable fingerprint length
    hex::encode(&hash[..16])
}

/// Check if this is a new device by comparing fingerprints against previous sessions
pub fn is_new_device(current_fingerprint: &str, previous_user_agents: &[Option<String>]) -> bool {
    !previous_user_agents
        .iter()
        .flatten() // Filters out None values and unwraps Some
        .any(|prev_ua| generate_fingerprint(prev_ua) == current_fingerprint)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_device_type_iphone() {
        let ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)";
        assert_eq!(parse_device_type(ua), "iPhone");
    }

    #[test]
    fn test_parse_device_type_mac() {
        let ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";
        assert_eq!(parse_device_type(ua), "Mac");
    }

    #[test]
    fn test_parse_device_type_windows() {
        let ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
        assert_eq!(parse_device_type(ua), "Windows PC");
    }

    #[test]
    fn test_parse_browser_chrome() {
        let ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36";
        assert_eq!(parse_browser(ua), "Chrome");
    }

    #[test]
    fn test_parse_browser_safari() {
        let ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15";
        assert_eq!(parse_browser(ua), "Safari");
    }

    #[test]
    fn test_parse_browser_firefox() {
        let ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Firefox/120.0";
        assert_eq!(parse_browser(ua), "Firefox");
    }

    #[test]
    fn test_parse_browser_edge() {
        let ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
        assert_eq!(parse_browser(ua), "Microsoft Edge");
    }

    #[test]
    fn test_device_info_from_user_agent() {
        let ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36";
        let info = DeviceInfo::from_user_agent(Some(ua));
        assert_eq!(info.device_type, "Mac");
        assert_eq!(info.browser, "Chrome");
        assert!(!info.fingerprint.is_empty());
    }

    #[test]
    fn test_is_new_device_true() {
        let current = generate_fingerprint("Chrome/120.0 on Mac");
        let previous = vec![
            Some("Firefox/120.0 on Windows".to_string()),
            Some("Safari on iPhone".to_string()),
        ];
        assert!(is_new_device(&current, &previous));
    }

    #[test]
    fn test_is_new_device_false() {
        let ua = "Chrome/120.0 on Mac";
        let current = generate_fingerprint(ua);
        let previous = vec![
            Some("Firefox/120.0 on Windows".to_string()),
            Some(ua.to_string()),
        ];
        assert!(!is_new_device(&current, &previous));
    }

    #[test]
    fn test_is_new_device_empty_history() {
        let current = generate_fingerprint("Chrome/120.0 on Mac");
        let previous: Vec<Option<String>> = vec![];
        assert!(is_new_device(&current, &previous));
    }

    #[test]
    fn test_oversized_user_agent_truncated() {
        // S-14: Verify that oversized user-agents are truncated
        let long_ua = "x".repeat(MAX_USER_AGENT_LEN + 1000);
        let info = DeviceInfo::from_user_agent(Some(&long_ua));
        // Should still produce valid output without panic
        assert_eq!(info.device_type, "Unknown device");
        assert_eq!(info.browser, "Unknown browser");
        assert!(!info.fingerprint.is_empty());
        // Fingerprint should be based on truncated string
        let truncated_ua = &long_ua[..MAX_USER_AGENT_LEN];
        let expected_fingerprint = generate_fingerprint(truncated_ua);
        assert_eq!(info.fingerprint, expected_fingerprint);
    }
}
