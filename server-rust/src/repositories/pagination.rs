//! R-08: Shared pagination constants for repositories
//!
//! Centralizes pagination limits to ensure consistency across the codebase
//! and make it easy to adjust limits in one place.

/// Default maximum page size for paginated queries
pub const DEFAULT_MAX_PAGE_SIZE: u32 = 100;

/// Maximum offset to prevent excessive memory usage on deep pagination
pub const DEFAULT_MAX_OFFSET: u32 = 1_000_000;

/// Limit for non-paginated queries that return collections (e.g., pending invites)
pub const DEFAULT_COLLECTION_LIMIT: usize = 1000;

/// Maximum sessions per user (used by session repository)
pub const MAX_SESSIONS_PER_USER: usize = 100;

/// Cap a limit value to the maximum page size
#[inline]
pub fn cap_limit(limit: u32) -> u32 {
    limit.min(DEFAULT_MAX_PAGE_SIZE)
}

/// Cap an offset value to the maximum offset
#[inline]
pub fn cap_offset(offset: u32) -> u32 {
    offset.min(DEFAULT_MAX_OFFSET)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cap_limit() {
        assert_eq!(cap_limit(50), 50);
        assert_eq!(cap_limit(100), 100);
        assert_eq!(cap_limit(200), DEFAULT_MAX_PAGE_SIZE);
    }

    #[test]
    fn test_cap_offset() {
        assert_eq!(cap_offset(500), 500);
        assert_eq!(cap_offset(1_000_000), 1_000_000);
        assert_eq!(cap_offset(2_000_000), DEFAULT_MAX_OFFSET);
    }
}
