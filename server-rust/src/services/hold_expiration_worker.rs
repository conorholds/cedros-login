//! Background worker for expiring stale credit holds
//!
//! Periodically scans for holds that have exceeded their TTL and marks them
//! as expired, releasing the held credits back to available balance.
//!
//! Default poll interval: 60 seconds

use std::sync::Arc;
use std::time::Duration;
use tokio::task::JoinHandle;
use tokio_util::sync::CancellationToken;
use tracing::{debug, error, info};

use crate::repositories::{CreditHoldRepository, CreditRepository};
use crate::services::CreditService;

/// Default poll interval for hold expiration (60 seconds)
const DEFAULT_POLL_INTERVAL_SECS: u64 = 60;

/// Configuration for the hold expiration worker
#[derive(Debug, Clone)]
pub struct HoldExpirationConfig {
    /// How often to check for expired holds (seconds)
    pub poll_interval_secs: u64,
}

impl Default for HoldExpirationConfig {
    fn default() -> Self {
        Self {
            poll_interval_secs: DEFAULT_POLL_INTERVAL_SECS,
        }
    }
}

/// Background worker that expires stale credit holds
pub struct HoldExpirationWorker {
    credit_repo: Arc<dyn CreditRepository>,
    hold_repo: Arc<dyn CreditHoldRepository>,
    config: HoldExpirationConfig,
}

impl HoldExpirationWorker {
    /// Create a new hold expiration worker
    pub fn new(
        credit_repo: Arc<dyn CreditRepository>,
        hold_repo: Arc<dyn CreditHoldRepository>,
        config: HoldExpirationConfig,
    ) -> Self {
        Self {
            credit_repo,
            hold_repo,
            config,
        }
    }

    /// Start the worker as a background task with graceful shutdown support
    pub fn start(self, cancel_token: CancellationToken) -> JoinHandle<()> {
        tokio::spawn(async move {
            let poll_interval = Duration::from_secs(self.config.poll_interval_secs);

            info!(
                poll_interval_secs = self.config.poll_interval_secs,
                "Hold expiration worker started"
            );

            loop {
                tokio::select! {
                    _ = cancel_token.cancelled() => {
                        info!("Hold expiration worker shutting down");
                        break;
                    }
                    _ = tokio::time::sleep(poll_interval) => {
                        if let Err(e) = self.expire_holds().await {
                            error!(error = %e, "Failed to expire holds");
                        }
                    }
                }
            }
        })
    }

    /// Expire stale holds
    async fn expire_holds(&self) -> Result<(), crate::errors::AppError> {
        let service = CreditService::new(self.credit_repo.clone(), self.hold_repo.clone());
        let expired_count = service.expire_holds().await?;

        if expired_count > 0 {
            info!(count = expired_count, "Expired stale credit holds");
        } else {
            debug!("No holds to expire");
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = HoldExpirationConfig::default();
        assert_eq!(config.poll_interval_secs, 60);
    }
}
