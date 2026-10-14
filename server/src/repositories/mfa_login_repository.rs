//! Atomic persistence boundary for completing an MFA login challenge.

use async_trait::async_trait;
use chrono::Utc;
use uuid::Uuid;

use super::{
    InMemorySessionRepository, InMemoryTotpRepository, InMemoryVerificationRepository,
    SessionEntity, TokenType,
};
use crate::errors::AppError;

/// A factor already verified without mutating persistence.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MfaFactorClaim {
    TotpTimeStep { enrollment_id: Uuid, time_step: i64 },
    RecoveryCode(Uuid),
}

/// Result of atomically claiming a challenge, factor, and new session.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MfaFactorClaimOutcome {
    Claimed,
    ChallengeUnavailable,
    FactorUnavailable,
}

/// Commits challenge consumption, factor replay state, and session creation together.
///
/// Implementations lock/check the challenge before mutating factor state. Errors and
/// unavailable outcomes leave all three records unchanged. A successful return means
/// the session is durable, so no fallible work remains before the handler responds.
#[async_trait]
pub trait AtomicMfaRepository: Send + Sync {
    async fn claim_with_session(
        &self,
        token_hash: &str,
        user_id: Uuid,
        factor: MfaFactorClaim,
        session: SessionEntity,
    ) -> Result<MfaFactorClaimOutcome, AppError>;
}

/// In-memory implementation sharing the stores used by the normal repositories.
pub struct InMemoryAtomicMfaRepository {
    verification: InMemoryVerificationRepository,
    totp: InMemoryTotpRepository,
    sessions: InMemorySessionRepository,
}

impl InMemoryAtomicMfaRepository {
    pub fn new(
        verification: InMemoryVerificationRepository,
        totp: InMemoryTotpRepository,
        sessions: InMemorySessionRepository,
    ) -> Self {
        Self {
            verification,
            totp,
            sessions,
        }
    }
}

#[async_trait]
impl AtomicMfaRepository for InMemoryAtomicMfaRepository {
    async fn claim_with_session(
        &self,
        token_hash: &str,
        user_id: Uuid,
        factor: MfaFactorClaim,
        session: SessionEntity,
    ) -> Result<MfaFactorClaimOutcome, AppError> {
        let mut tokens = self.verification.tokens.write().await;
        let now = Utc::now();
        let token_id = tokens
            .values()
            .find(|token| {
                token.token_hash == token_hash
                    && token.user_id == user_id
                    && token.token_type == TokenType::MfaPending
                    && token.used_at.is_none()
                    && token.expires_at > now
            })
            .map(|token| token.id);
        let Some(token_id) = token_id else {
            return Ok(MfaFactorClaimOutcome::ChallengeUnavailable);
        };

        // Match SessionRepository's sessions -> token-index order while the challenge
        // remains locked. Rejecting collisions before the factor mutation gives the
        // in-memory backend the same rollback behavior as PostgreSQL.
        let mut sessions = self.sessions.sessions.write().await;
        let mut token_index = self.sessions.token_index.write().await;
        if sessions.contains_key(&session.id)
            || token_index.contains_key(&session.refresh_token_hash)
            || session.user_id != user_id
        {
            return Err(AppError::Internal(anyhow::anyhow!(
                "MFA session identity collision"
            )));
        }

        let factor_claimed = match factor {
            MfaFactorClaim::TotpTimeStep {
                enrollment_id,
                time_step,
            } => {
                let mut secrets = self.totp.secrets.write().await;
                secrets.get_mut(&user_id).is_some_and(|secret| {
                    if !secret.enabled
                        || secret.id != enrollment_id
                        || secret
                            .last_used_time_step
                            .is_some_and(|last| last >= time_step)
                    {
                        return false;
                    }
                    secret.last_used_time_step = Some(time_step);
                    true
                })
            }
            MfaFactorClaim::RecoveryCode(code_id) => {
                let secrets = self.totp.secrets.read().await;
                if !secrets.get(&user_id).is_some_and(|secret| secret.enabled) {
                    return Ok(MfaFactorClaimOutcome::FactorUnavailable);
                }
                let mut codes_by_user = self.totp.recovery_codes.write().await;
                codes_by_user.get_mut(&user_id).is_some_and(|codes| {
                    let Some(code) = codes
                        .iter_mut()
                        .find(|code| code.id == code_id && !code.used)
                    else {
                        return false;
                    };
                    code.used = true;
                    code.used_at = Some(now);
                    true
                })
            }
        };
        if !factor_claimed {
            return Ok(MfaFactorClaimOutcome::FactorUnavailable);
        }

        tokens.get_mut(&token_id).expect("locked MFA token").used_at = Some(now);
        token_index.insert(session.refresh_token_hash.clone(), session.id);
        sessions.insert(session.id, session);
        Ok(MfaFactorClaimOutcome::Claimed)
    }
}

#[cfg(test)]
#[path = "mfa_login_repository_tests.rs"]
mod tests;
