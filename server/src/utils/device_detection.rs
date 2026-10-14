//! Device detection utilities for security alerts

use sha2::{Digest, Sha256};

/// Maximum user-agent length to prevent DoS via memory exhaustion.
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
    /// Truncates oversized user-agents to prevent DoS attacks.
    pub fn from_user_agent(user_agent: Option<&str>) -> Self {
        let ua = user_agent.unwrap_or("Unknown");
        // Truncate to prevent memory exhaustion from malicious user-agents.
        // Round down to the nearest UTF-8 char boundary so multi-byte codepoints
        // straddling MAX_USER_AGENT_LEN do not panic (string slicing requires
        // byte indices that fall on char boundaries).
        let ua = if ua.len() > MAX_USER_AGENT_LEN {
            let mut end = MAX_USER_AGENT_LEN;
            while end > 0 && !ua.is_char_boundary(end) {
                end -= 1;
            }
            &ua[..end]
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

/// Generate a coarse browser + device fingerprint from the user agent.
/// This is used to detect if a device has been seen before.
///
/// Uses SHA-256 over normalized browser/device labels instead of the raw
/// user-agent, so routine browser version bumps do not look like new devices.
fn generate_fingerprint(ua: &str) -> String {
    let coarse = format!("{}|{}", parse_browser(ua), parse_device_type(ua));
    let hash = Sha256::digest(coarse.as_bytes());
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
    fn test_is_new_device_ignores_browser_version_bump() {
        let current = generate_fingerprint(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/121.0.0.0 Safari/537.36",
        );
        let previous = vec![Some(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36"
                .to_string(),
        )];

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
        // Verify that oversized user-agents are truncated
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

    // Regression: an oversized user-agent whose truncation byte falls in the
    // middle of a multi-byte UTF-8 codepoint must not panic. Previously the
    // truncation used `&ua[..MAX_USER_AGENT_LEN]` which would panic when the
    // byte index landed inside a multi-byte char (e.g. a 4-byte emoji).
    #[test]
    fn test_oversized_user_agent_multibyte_boundary_does_not_panic() {
        // Build a UA whose byte MAX_USER_AGENT_LEN falls inside a 4-byte emoji.
        // 🦀 (U+1F980) is 4 bytes in UTF-8.
        let mut s = String::with_capacity(MAX_USER_AGENT_LEN + 8);
        // Pad with ASCII so the next char starts at byte (MAX_USER_AGENT_LEN - 2).
        s.push_str(&"a".repeat(MAX_USER_AGENT_LEN - 2));
        s.push('🦀');
        s.push('🦀');
        // Now byte index MAX_USER_AGENT_LEN is 2 bytes into the first 🦀.
        let info = DeviceInfo::from_user_agent(Some(&s));
        assert!(!info.fingerprint.is_empty());
    }

    // =========================================================================
    // Property tests
    // =========================================================================

    use proptest::prelude::*;

    proptest! {
        // No-panic across arbitrary unicode input.
        // PARSE_CRASH discovered a real bug here: see test above.
        #[test]
        fn property_from_user_agent_never_panics(
            chars in proptest::collection::vec(any::<char>(), 0..3000)
        ) {
            let s: String = chars.into_iter().collect();
            let info = DeviceInfo::from_user_agent(Some(&s));
            // Fingerprint is a non-empty hex string.
            prop_assert!(!info.fingerprint.is_empty());
            prop_assert!(info.fingerprint.chars().all(|c| c.is_ascii_hexdigit()));
        }

        // Even None and empty inputs produce a valid DeviceInfo.
        #[test]
        fn property_from_user_agent_handles_empty(unused in 0u8..1) {
            let _ = unused;
            let info = DeviceInfo::from_user_agent(None);
            prop_assert!(!info.fingerprint.is_empty());
            let info = DeviceInfo::from_user_agent(Some(""));
            prop_assert!(!info.fingerprint.is_empty());
        }

        // Determinism: same input → same fingerprint.
        #[test]
        fn property_fingerprint_deterministic(s in ".{0,500}") {
            let a = DeviceInfo::from_user_agent(Some(&s));
            let b = DeviceInfo::from_user_agent(Some(&s));
            prop_assert_eq!(a.fingerprint, b.fingerprint);
        }

        // is_new_device: if the current UA's fingerprint matches any in history,
        // it is NOT a new device.
        #[test]
        fn property_is_new_device_detects_match(
            ua in "[a-zA-Z0-9 /.()]{1,80}",
            other_uas in proptest::collection::vec("[a-zA-Z0-9 /.()]{1,80}", 0..10),
        ) {
            let fp = generate_fingerprint(&ua);
            let mut history: Vec<Option<String>> =
                other_uas.into_iter().map(Some).collect();
            history.push(Some(ua.clone()));
            prop_assert!(!is_new_device(&fp, &history));
        }
    }
}
