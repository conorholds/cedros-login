//! Coarse device fingerprinting for the new-device-login security alert.
//!
//! Mirrors the standalone server's `DeviceInfo` at a coarse grain: a fingerprint
//! is (browser family / OS family) only — it deliberately ignores versions so a
//! routine browser auto-update is NOT treated as a new device (which would spam
//! users with false alerts). Used purely to decide whether a successful login
//! arrived from a device the account hasn't recently used.

/// A coarse `browser/os` fingerprint from a User-Agent. Empty/absent → `unknown`.
pub fn device_fingerprint(user_agent: Option<&str>) -> String {
    let ua = user_agent.unwrap_or("").to_lowercase();
    if ua.trim().is_empty() {
        return "unknown".to_string();
    }
    // Order matters: Edge/Opera UAs also contain "chrome"; Chrome UAs also
    // contain "safari". Check the more specific tokens first.
    let browser = if ua.contains("edg/") || ua.contains("edge") {
        "edge"
    } else if ua.contains("opr/") || ua.contains("opera") {
        "opera"
    } else if ua.contains("chrome") || ua.contains("crios") {
        "chrome"
    } else if ua.contains("firefox") || ua.contains("fxios") {
        "firefox"
    } else if ua.contains("safari") {
        "safari"
    } else {
        "other"
    };
    let os = if ua.contains("windows") {
        "windows"
    } else if ua.contains("iphone") || ua.contains("ipad") || ua.contains("ios") {
        "ios"
    } else if ua.contains("android") {
        "android"
    } else if ua.contains("mac os") || ua.contains("macintosh") {
        "macos"
    } else if ua.contains("linux") {
        "linux"
    } else {
        "other"
    };
    format!("{browser}/{os}")
}

/// Whether `current_ua` is a device not seen among `prior_uas`. Returns `false`
/// when there is no prior history (a first/only session must never alert) or when
/// the current fingerprint is `unknown` (can't be judged reliably).
pub fn is_new_device(current_ua: Option<&str>, prior_uas: &[Option<String>]) -> bool {
    if prior_uas.is_empty() {
        return false;
    }
    let current = device_fingerprint(current_ua);
    if current == "unknown" {
        return false;
    }
    !prior_uas
        .iter()
        .any(|ua| device_fingerprint(ua.as_deref()) == current)
}

#[cfg(test)]
mod tests {
    use super::*;

    const CHROME_MAC: &str =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
    const CHROME_MAC_NEWER: &str =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
    const SAFARI_IPHONE: &str =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    const EDGE_WINDOWS: &str =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 Edg/124.0";

    #[test]
    fn fingerprint_is_browser_and_os_family_only() {
        assert_eq!(device_fingerprint(Some(CHROME_MAC)), "chrome/macos");
        assert_eq!(device_fingerprint(Some(SAFARI_IPHONE)), "safari/ios");
        // Edge before Chrome (its UA contains both tokens).
        assert_eq!(device_fingerprint(Some(EDGE_WINDOWS)), "edge/windows");
        assert_eq!(device_fingerprint(None), "unknown");
        assert_eq!(device_fingerprint(Some("   ")), "unknown");
    }

    #[test]
    fn browser_version_bump_is_not_a_new_device() {
        // Same browser+OS, newer Chrome version -> same fingerprint -> not new.
        let prior = vec![Some(CHROME_MAC.to_string())];
        assert!(!is_new_device(Some(CHROME_MAC_NEWER), &prior));
    }

    #[test]
    fn different_device_is_new_but_first_login_is_not() {
        let prior = vec![Some(CHROME_MAC.to_string())];
        assert!(is_new_device(Some(SAFARI_IPHONE), &prior));
        // No prior history: never alert (first session, or all-logged-out).
        assert!(!is_new_device(Some(SAFARI_IPHONE), &[]));
        // Unknown current UA can't be judged.
        assert!(!is_new_device(None, &prior));
    }
}
