//! Configuration for the outbox worker

/// Configuration for the outbox worker
#[derive(Debug, Clone)]
pub struct OutboxWorkerConfig {
    /// How often to poll for pending events (in seconds)
    pub poll_interval_secs: u64,
    /// Maximum events to process per poll
    pub batch_size: u32,
    /// Lock timeout for stale processing events (in seconds)
    pub lock_timeout_secs: u64,
    /// Timeout for individual delivery operations (in seconds)
    pub delivery_timeout_secs: u64,
}

impl Default for OutboxWorkerConfig {
    fn default() -> Self {
        Self {
            poll_interval_secs: 5,
            batch_size: 20,
            lock_timeout_secs: 300,
            delivery_timeout_secs: 30,
        }
    }
}
