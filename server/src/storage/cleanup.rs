use std::sync::Arc;
use std::time::Duration;

use chrono::{Duration as ChronoDuration, Utc};
use tokio::task::JoinHandle;
use tracing::{debug, error, info};

use crate::repositories::{
    InviteRepository, LoginAttemptRepository, NonceRepository, OutboxRepository, SessionRepository,
    SsoRepository, UserEmailRepository, VerificationRepository, WebAuthnRepository,
};

use super::Storage;

#[derive(Clone)]
struct CleanupRepositories {
    sessions: Arc<dyn SessionRepository>,
    nonces: Arc<dyn NonceRepository>,
    verifications: Arc<dyn VerificationRepository>,
    invites: Arc<dyn InviteRepository>,
    outbox: Arc<dyn OutboxRepository>,
    login_attempts: Arc<dyn LoginAttemptRepository>,
    sso: Arc<dyn SsoRepository>,
    webauthn: Arc<dyn WebAuthnRepository>,
    user_emails: Arc<dyn UserEmailRepository>,
}

impl From<&Storage> for CleanupRepositories {
    fn from(storage: &Storage) -> Self {
        Self {
            sessions: storage.session_repo.clone(),
            nonces: storage.nonce_repo.clone(),
            verifications: storage.verification_repo.clone(),
            invites: storage.invite_repo.clone(),
            outbox: storage.outbox_repo.clone(),
            login_attempts: storage.login_attempt_repo.clone(),
            sso: storage.sso_repo.clone(),
            webauthn: storage.webauthn_repo.clone(),
            user_emails: storage.user_email_repo.clone(),
        }
    }
}

impl Storage {
    /// Start periodic cleanup of expired authentication data.
    pub fn start_cleanup_task(
        &self,
        interval_secs: u64,
        mut shutdown: tokio::sync::watch::Receiver<bool>,
    ) -> JoinHandle<()> {
        let repositories = CleanupRepositories::from(self);
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(interval_secs));
            info!(
                "Background cleanup task started (interval: {}s)",
                interval_secs
            );
            loop {
                tokio::select! {
                    _ = interval.tick() => repositories.run().await,
                    _ = shutdown.changed() => {
                        info!("Cleanup task received shutdown signal, stopping gracefully");
                        break;
                    }
                }
            }
        })
    }
}

impl CleanupRepositories {
    async fn run(&self) {
        report(self.sessions.delete_expired().await, "expired sessions");
        report(self.nonces.delete_expired().await, "expired nonces");
        report(
            self.verifications.delete_expired().await,
            "expired verification tokens",
        );
        report(self.invites.delete_expired().await, "expired invites");
        report(
            self.sso.delete_expired_states().await,
            "expired SSO auth states",
        );
        report(
            self.webauthn.delete_expired_challenges().await,
            "expired WebAuthn challenges",
        );
        report(
            self.user_emails.delete_expired_unverified().await,
            "expired pending emails",
        );
        self.clean_retained_data().await;
    }

    async fn clean_retained_data(&self) {
        let outbox_cutoff = Utc::now() - ChronoDuration::days(30);
        report(
            self.outbox.cleanup_old(outbox_cutoff).await,
            "old outbox events",
        );
        let attempts_cutoff = Utc::now() - ChronoDuration::hours(24);
        report(
            self.login_attempts
                .cleanup_old_records(attempts_cutoff)
                .await,
            "old login attempts",
        );
    }
}

fn report<E: std::fmt::Display>(result: Result<u64, E>, item: &str) {
    match result {
        Ok(count) if count > 0 => debug!(count, item, "Cleaned up expired authentication data"),
        Err(cause) => error!(%cause, item, "Failed to clean up expired authentication data"),
        _ => {}
    }
}
