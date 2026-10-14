//! Aggregate expiry sweep for the `cleanup-expired-auth-data` job.
//!
//! Bounded per run so it stays within the host CPU deadline and is resumable:
//! drains up to `MAX_PAGES` per collection, leaving any remainder for the next
//! scheduled run. Each page is one atomic batch delete.
use crate::clock;
use crate::data::{invites, login_attempts, nonces, outbox, sessions, user_emails, verifications};
use crate::host::Result;
use serde::Serialize;

const PAGE: u32 = 500;
const MAX_PAGES: u32 = 20; // up to 10k rows per collection per run
const LOGIN_ATTEMPT_RETENTION_SECS: i64 = 24 * 60 * 60;
const OUTBOX_FAILED_RETENTION_SECS: i64 = 7 * 24 * 60 * 60;

/// Uniform per-collection sweep: `(cutoff_iso, page) -> removed`.
type Sweep = fn(&str, u32) -> Result<u64>;

struct SweepTask<'a> {
    collection: &'static str,
    cutoff: &'a str,
    sweep: Sweep,
}

/// Redacted count for one successfully swept collection.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct CollectionSweep {
    pub collection: &'static str,
    pub removed: u64,
    pub pages: u32,
    pub budget_exhausted: bool,
}

/// Redacted failure for one collection sweep.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct SweepFailure {
    pub collection: &'static str,
    pub cause: &'static str,
}

/// Aggregate cleanup result: successful counts plus redacted per-collection failures.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize)]
pub struct SweepReport {
    pub removed: u64,
    pub collections: Vec<CollectionSweep>,
    pub failures: Vec<SweepFailure>,
}

impl SweepReport {
    pub fn has_remaining_work(&self) -> bool {
        self.collections
            .iter()
            .any(|collection| collection.budget_exhausted)
    }

    pub fn has_failures(&self) -> bool {
        !self.failures.is_empty()
    }
}

/// Round-robin pages keep every collection progressing during catch-up. Each
/// invocation can restart from the oldest expiry; no persisted cursor can skip
/// rows after interruption. A full final page means possible remaining work.
fn sweep_collections(tasks: &[SweepTask<'_>]) -> SweepReport {
    let mut report = SweepReport::default();
    let mut active = vec![true; tasks.len()];
    let mut counts: Vec<CollectionSweep> = tasks
        .iter()
        .map(|task| CollectionSweep {
            collection: task.collection,
            removed: 0,
            pages: 0,
            budget_exhausted: false,
        })
        .collect();
    for _ in 0..MAX_PAGES {
        for (index, task) in tasks.iter().enumerate() {
            if !active[index] {
                continue;
            }
            match (task.sweep)(task.cutoff, PAGE) {
                Ok(removed) => {
                    report.removed += removed;
                    counts[index].removed += removed;
                    counts[index].pages += 1;
                    counts[index].budget_exhausted = removed >= u64::from(PAGE);
                    active[index] = counts[index].budget_exhausted;
                }
                Err(error) => {
                    active[index] = false;
                    counts[index].budget_exhausted = false;
                    report.failures.push(SweepFailure {
                        collection: task.collection,
                        cause: error.code(),
                    });
                }
            }
        }
        if !active.iter().any(|active| *active) {
            break;
        }
    }
    report.collections = counts.into_iter().filter(|count| count.pages > 0).collect();
    report
}

/// Sweep every expiring auth collection, continuing after per-collection errors.
pub fn sweep_all() -> SweepReport {
    let now = clock::now_iso();
    let attempt_cutoff = clock::ago_iso(LOGIN_ATTEMPT_RETENTION_SECS);
    let pending_email_cutoff = clock::ago_iso(user_emails::PENDING_EMAIL_EXPIRY_SECS);
    let outbox_failed_cutoff = clock::ago_iso(OUTBOX_FAILED_RETENTION_SECS);
    let tasks = [
        SweepTask { collection: "oauth-connections", cutoff: &now, sweep: crate::data::oauth::sweep_expired },
        SweepTask {
            collection: "sessions",
            cutoff: &now,
            sweep: sessions::sweep_expired,
        },
        SweepTask {
            collection: "nonces",
            cutoff: &now,
            sweep: nonces::sweep_expired,
        },
        SweepTask {
            collection: "verifications",
            cutoff: &now,
            sweep: verifications::sweep_expired,
        },
        SweepTask {
            collection: "user-emails",
            cutoff: &pending_email_cutoff,
            sweep: user_emails::sweep_expired,
        },
        SweepTask {
            collection: "login-attempts",
            cutoff: &attempt_cutoff,
            sweep: login_attempts::sweep_expired,
        },
        SweepTask {
            collection: "invites",
            cutoff: &now,
            sweep: invites::sweep_expired,
        },
        SweepTask {
            collection: "outbox",
            cutoff: &outbox_failed_cutoff,
            sweep: outbox::sweep_failed,
        },
    ];
    sweep_collections(&tasks)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::host::SeamError;
    use std::sync::Mutex;

    static CALLS: Mutex<Vec<u64>> = Mutex::new(Vec::new());
    static TEST_LOCK: Mutex<()> = Mutex::new(());

    fn task(collection: &'static str, cutoff: &'static str, sweep: Sweep) -> SweepTask<'static> {
        SweepTask {
            collection,
            cutoff,
            sweep,
        }
    }

    fn mark(cutoff: &str) -> u64 {
        let value = match cutoff {
            "one" => 1,
            "two" => 2,
            "three" => 3,
            _ => panic!("unexpected cutoff label"),
        };
        CALLS.lock().unwrap().push(value);
        value
    }

    fn sweep_ok(cutoff: &str, page: u32) -> Result<u64> {
        assert_eq!(page, PAGE);
        Ok(mark(cutoff))
    }

    fn sweep_fails(cutoff: &str, page: u32) -> Result<u64> {
        assert_eq!(page, PAGE);
        mark(cutoff);
        Err(SeamError::Db("raw host detail is not exposed".into()))
    }

    fn reset_calls() {
        CALLS.lock().unwrap().clear();
    }

    fn collection_counts(report: &SweepReport) -> Vec<(&'static str, u64)> {
        report
            .collections
            .iter()
            .map(|entry| (entry.collection, entry.removed))
            .collect()
    }

    fn failure_causes(report: &SweepReport) -> Vec<(&'static str, &'static str)> {
        report
            .failures
            .iter()
            .map(|failure| (failure.collection, failure.cause))
            .collect()
    }

    #[test]
    fn cleanup_all_green_reports_every_collection_count() {
        let _guard = TEST_LOCK.lock().unwrap();
        reset_calls();
        let tasks = [
            task("collection-one", "one", sweep_ok),
            task("collection-two", "two", sweep_ok),
            task("collection-three", "three", sweep_ok),
        ];

        let report = sweep_collections(&tasks);

        assert_eq!(CALLS.lock().unwrap().as_slice(), &[1, 2, 3]);
        assert_eq!(report.removed, 6);
        assert_eq!(
            collection_counts(&report),
            vec![
                ("collection-one", 1),
                ("collection-two", 2),
                ("collection-three", 3),
            ]
        );
        assert!(report.failures.is_empty());
        assert!(!report.has_failures());
    }

    #[test]
    fn cleanup_collection_failure_records_failure_and_continues() {
        let _guard = TEST_LOCK.lock().unwrap();
        reset_calls();
        let tasks = [
            task("collection-one", "one", sweep_ok),
            task("collection-two", "two", sweep_fails),
            task("collection-three", "three", sweep_ok),
        ];

        let report = sweep_collections(&tasks);

        assert_eq!(CALLS.lock().unwrap().as_slice(), &[1, 2, 3]);
        assert_eq!(report.removed, 4);
        assert_eq!(
            collection_counts(&report),
            vec![("collection-one", 1), ("collection-three", 3)]
        );
        assert_eq!(
            failure_causes(&report),
            vec![("collection-two", "db_error")]
        );
        assert!(report.has_failures());
    }
}

#[cfg(test)]
mod backlog_tests {
    use super::*;
    use std::cell::RefCell;
    thread_local! { static ORDER: RefCell<Vec<String>> = const { RefCell::new(Vec::new()) }; }
    fn saturated(cutoff: &str, page: u32) -> Result<u64> {
        ORDER.with_borrow_mut(|calls| calls.push(cutoff.into()));
        Ok(u64::from(page))
    }
    #[test]
    fn saturated_collections_are_fair_and_report_remaining_work() {
        ORDER.with_borrow_mut(Vec::clear);
        let tasks = [
            SweepTask {
                collection: "a",
                cutoff: "a",
                sweep: saturated,
            },
            SweepTask {
                collection: "b",
                cutoff: "b",
                sweep: saturated,
            },
        ];
        let report = sweep_collections(&tasks);
        assert!(report.has_remaining_work());
        assert!(!report.has_failures());
        assert_eq!(report.removed, u64::from(PAGE * MAX_PAGES * 2));
        assert!(report
            .collections
            .iter()
            .all(|count| count.pages == MAX_PAGES));
        ORDER.with_borrow(|calls| {
            for pair in calls.chunks_exact(2) {
                assert_eq!(pair, &["a", "b"]);
            }
        });
    }
}

