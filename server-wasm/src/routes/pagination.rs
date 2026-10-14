//! Query-param pagination shared by the org/member list routes.

/// Parse `limit`/`offset` query params, applying the given caps. Missing or
/// unparseable values fall back to `default_limit` / `0`.
pub fn paged(
    query: &[(String, String)],
    default_limit: u32,
    max_limit: u32,
    max_offset: u32,
) -> (u32, u32) {
    let value = |key: &str| {
        query
            .iter()
            .find(|(k, _)| k == key)
            .and_then(|(_, v)| v.parse::<u32>().ok())
    };
    let limit = value("limit").unwrap_or(default_limit).min(max_limit);
    let offset = value("offset").unwrap_or(0).min(max_offset);
    (limit, offset)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn defaults_and_caps() {
        assert_eq!(paged(&[], 50, 100, 1_000_000), (50, 0));
        assert_eq!(
            paged(&[("limit".into(), "500".into())], 50, 100, 1_000_000),
            (100, 0)
        );
        assert_eq!(
            paged(&[("offset".into(), "5".into())], 50, 100, 1_000_000),
            (50, 5)
        );
        assert_eq!(
            paged(&[("offset".into(), "9999999".into())], 50, 100, 1_000_000),
            (50, 1_000_000)
        );
    }
}
