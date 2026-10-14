//! Canonical timestamps: RFC3339 UTC, millisecond precision, `Z` suffix — so the
//! DB seam's lexical `lt`/`gt` compare chronologically. `Utc::now()` resolves via
//! the host-provided wasi clock. Every stored timestamp uses this exact format.
use chrono::{Duration, SecondsFormat, Utc};

pub fn now_iso() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)
}

/// `seconds` before now, in the canonical format — for retention cutoffs.
pub fn ago_iso(seconds: i64) -> String {
    (Utc::now() - Duration::seconds(seconds)).to_rfc3339_opts(SecondsFormat::Millis, true)
}

/// `seconds` after now, in the canonical format — for token/session expiry.
pub fn in_secs(seconds: i64) -> String {
    (Utc::now() + Duration::seconds(seconds)).to_rfc3339_opts(SecondsFormat::Millis, true)
}

/// Current Unix time in seconds — for TOTP time-step math.
pub fn now_unix() -> u64 {
    Utc::now().timestamp().max(0) as u64
}

/// Render a Unix timestamp (seconds, e.g. a JWT `exp`) as an RFC3339 UTC string,
/// or `None` when out of range — for the relying-party `expiresAt` contract.
pub fn from_unix(seconds: i64) -> Option<String> {
    chrono::DateTime::from_timestamp(seconds, 0)
        .map(|dt| dt.to_rfc3339_opts(SecondsFormat::Secs, true))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn now_is_canonical_z_millis() {
        let n = now_iso();
        assert!(n.ends_with('Z'), "ends with Z: {n}");
        assert_eq!(n.len(), 24, "YYYY-MM-DDTHH:MM:SS.mmmZ: {n}");
    }

    #[test]
    fn ago_is_strictly_before_now() {
        assert!(ago_iso(60) < now_iso());
    }

    #[test]
    fn from_unix_renders_rfc3339_z() {
        // 2021-01-01T00:00:00Z
        assert_eq!(
            from_unix(1_609_459_200).as_deref(),
            Some("2021-01-01T00:00:00Z")
        );
    }
}
