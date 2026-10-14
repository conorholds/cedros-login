//! Bounded admission for expensive blocking work. No unbounded executor queue.
use std::sync::{Arc, OnceLock};
use std::time::Instant;
use tokio::sync::{OwnedSemaphorePermit, Semaphore};

use crate::errors::AppError;

// Separate memory budgets: at most two Argon2 workspaces (128 MiB)
// and one image decoder (existing allocation ceiling 256 MiB). Shared across
// service clones and AppStates in this process; no global Tokio tuning.
static AUTH: OnceLock<Arc<Semaphore>> = OnceLock::new();
static IMAGE: OnceLock<Arc<Semaphore>> = OnceLock::new();

pub(crate) struct CpuPermit {
    _permit: OwnedSemaphorePermit,
    kind: &'static str,
    admitted_at: Instant,
}

fn acquire(pool: &Arc<Semaphore>, kind: &'static str) -> Result<CpuPermit, AppError> {
    let permit = pool.clone().try_acquire_owned().map_err(|_| {
        metrics::counter!("cedros_cpu_rejected_total", "kind" => kind).increment(1);
        AppError::ServiceUnavailable("Server is busy. Please try again shortly.".into())
    })?;
    metrics::gauge!("cedros_cpu_admitted", "kind" => kind).increment(1.0);
    Ok(CpuPermit {
        _permit: permit,
        kind,
        admitted_at: Instant::now(),
    })
}

pub(crate) fn admit_image() -> Result<CpuPermit, AppError> {
    acquire(IMAGE.get_or_init(|| Arc::new(Semaphore::new(1))), "image")
}

pub(crate) async fn auth<T: Send + 'static>(
    work: impl FnOnce() -> Result<T, AppError> + Send + 'static,
) -> Result<T, AppError> {
    acquire(AUTH.get_or_init(|| Arc::new(Semaphore::new(2))), "auth")?
        .run(work)
        .await
}

impl CpuPermit {
    pub(crate) async fn run<T: Send + 'static>(
        self,
        work: impl FnOnce() -> Result<T, AppError> + Send + 'static,
    ) -> Result<T, AppError> {
        tokio::task::spawn_blocking(move || {
            // Ownership stays in this closure even if the awaiting request is canceled.
            let _permit = self;
            metrics::histogram!("cedros_cpu_admission_seconds", "kind" => _permit.kind)
                .record(_permit.admitted_at.elapsed().as_secs_f64());
            let _active = ActiveWork::new(_permit.kind);
            work()
        })
        .await
        .map_err(|error| AppError::Internal(anyhow::anyhow!("CPU task failed: {error}")))?
    }
}

impl Drop for CpuPermit {
    fn drop(&mut self) {
        metrics::gauge!("cedros_cpu_admitted", "kind" => self.kind).decrement(1.0);
    }
}

struct ActiveWork {
    kind: &'static str,
    started: Instant,
}
impl ActiveWork {
    fn new(kind: &'static str) -> Self {
        metrics::gauge!("cedros_cpu_active", "kind" => kind).increment(1.0);
        Self {
            kind,
            started: Instant::now(),
        }
    }
}
impl Drop for ActiveWork {
    fn drop(&mut self) {
        metrics::gauge!("cedros_cpu_active", "kind" => self.kind).decrement(1.0);
        metrics::histogram!("cedros_cpu_execution_seconds", "kind" => self.kind)
            .record(self.started.elapsed().as_secs_f64());
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn cancellation_keeps_admission_until_blocking_work_finishes() {
        let pool = Arc::new(Semaphore::new(1));
        let permit = acquire(&pool, "test").unwrap();
        let (started, ready) = tokio::sync::oneshot::channel();
        let (release, wait) = std::sync::mpsc::channel();
        let task = tokio::spawn(permit.run(move || {
            started.send(()).unwrap();
            wait.recv().unwrap();
            Ok(())
        }));
        ready.await.unwrap();
        task.abort();
        assert!(acquire(&pool, "test").is_err());
        // Tokio can still drive unrelated work on this single-thread test runtime.
        tokio::task::yield_now().await;
        release.send(()).unwrap();
        let recovered = tokio::time::timeout(std::time::Duration::from_secs(2), pool.acquire())
            .await
            .unwrap()
            .unwrap();
        drop(recovered);
        assert!(acquire(&pool, "test").is_ok());
    }

    #[tokio::test]
    async fn errors_panics_and_unused_admission_release_the_slot() {
        let pool = Arc::new(Semaphore::new(1));
        drop(acquire(&pool, "test").unwrap());
        assert!(acquire(&pool, "test")
            .unwrap()
            .run(|| Err::<(), _>(AppError::Validation("bad image".into())))
            .await
            .is_err());
        assert!(acquire(&pool, "test")
            .unwrap()
            .run(|| -> Result<(), AppError> { panic!("test CPU failure") })
            .await
            .is_err());
        assert_eq!(
            acquire(&pool, "test")
                .unwrap()
                .run(|| Ok(42))
                .await
                .unwrap(),
            42
        );
    }
}
