//! Shared PostgreSQL integration-test boundary.

use std::env;

const REQUIRE_POSTGRES_ENV: &str = "CEDROS_REQUIRE_POSTGRES_TESTS";

/// Return the configured test database URL.
///
/// Local runs may omit PostgreSQL and skip these integration tests. CI and
/// other required environments set `CEDROS_REQUIRE_POSTGRES_TESTS=1`, which
/// converts a missing URL into a hard failure and emits an execution marker.
pub fn database_url() -> Option<String> {
    let url = env::var("TEST_DATABASE_URL")
        .ok()
        .filter(|value| !value.trim().is_empty());

    if required() {
        let url = url.unwrap_or_else(|| {
            panic!(
                "{REQUIRE_POSTGRES_ENV}=1 requires a non-empty TEST_DATABASE_URL; refusing to skip PostgreSQL tests"
            )
        });
        eprintln!("CEDROS_POSTGRES_BOUNDARY_EXECUTED");
        Some(url)
    } else {
        url
    }
}

fn required() -> bool {
    env::var(REQUIRE_POSTGRES_ENV)
        .ok()
        .is_some_and(|value| matches!(value.trim(), "1" | "true" | "TRUE"))
}
