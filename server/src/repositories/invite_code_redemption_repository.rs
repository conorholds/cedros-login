//! Atomic pending-invite token redemption.

use async_trait::async_trait;
use chrono::Utc;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::errors::AppError;

use super::{
    normalize_invite_code, InMemoryInviteCodeRepository, InMemoryVerificationRepository,
    InviteCodeEntity, TokenType, UserRepository,
};

#[derive(Debug, Clone)]
pub enum PendingInviteRedemptionOutcome {
    Redeemed {
        user_id: uuid::Uuid,
        invite_code: InviteCodeEntity,
    },
    InvalidToken,
    InvalidCode,
}

/// Transactional boundary for consuming a pending-invite token, recording the
/// code redemption, and activating the account. Exactly one concurrent caller
/// may win for a pending account.
#[async_trait]
pub trait PendingInviteRedemptionRepository: Send + Sync {
    async fn redeem(
        &self,
        token_hash: &str,
        code: &str,
    ) -> Result<PendingInviteRedemptionOutcome, AppError>;
}

pub struct InMemoryPendingInviteRedemptionRepository {
    users: Arc<dyn UserRepository>,
    verifications: Arc<InMemoryVerificationRepository>,
    invite_codes: Arc<InMemoryInviteCodeRepository>,
    mutation_lock: Mutex<()>,
}

impl InMemoryPendingInviteRedemptionRepository {
    pub fn new(
        users: Arc<dyn UserRepository>,
        verifications: Arc<InMemoryVerificationRepository>,
        invite_codes: Arc<InMemoryInviteCodeRepository>,
    ) -> Self {
        Self {
            users,
            verifications,
            invite_codes,
            mutation_lock: Mutex::new(()),
        }
    }
}

#[async_trait]
impl PendingInviteRedemptionRepository for InMemoryPendingInviteRedemptionRepository {
    async fn redeem(
        &self,
        token_hash: &str,
        code: &str,
    ) -> Result<PendingInviteRedemptionOutcome, AppError> {
        let normalized = normalize_invite_code(code)?;
        let _mutation = self.mutation_lock.lock().await;
        let now = Utc::now();

        let mut tokens = self.verifications.tokens.write().await;
        let Some(token_id) = tokens
            .values()
            .find(|token| {
                token.token_hash == token_hash
                    && token.token_type == TokenType::InviteCodePending
                    && token.used_at.is_none()
                    && token.expires_at > now
            })
            .map(|token| token.id)
        else {
            return Ok(PendingInviteRedemptionOutcome::InvalidToken);
        };
        let user_id = tokens
            .get(&token_id)
            .ok_or_else(|| AppError::Internal(anyhow::anyhow!("pending invite token disappeared")))?
            .user_id;
        let Some(user) = self.users.find_by_id(user_id).await? else {
            return Ok(PendingInviteRedemptionOutcome::InvalidToken);
        };
        if user.is_deleted() {
            return Ok(PendingInviteRedemptionOutcome::InvalidToken);
        }

        let mut gate_accounts = self.invite_codes.gate_accounts.write().await;
        if !matches!(gate_accounts.get(&user_id), Some(None)) {
            return Ok(PendingInviteRedemptionOutcome::InvalidToken);
        }

        let mut codes = self.invite_codes.codes.write().await;
        let Some(invite_code) = codes
            .values_mut()
            .find(|candidate| candidate.code == normalized && candidate.is_available_at(now))
        else {
            return Ok(PendingInviteRedemptionOutcome::InvalidCode);
        };

        invite_code.uses_count += 1;
        invite_code.updated_at = now;
        let invite_code = invite_code.clone();
        self.invite_codes
            .redemptions
            .write()
            .await
            .push((invite_code.id, user_id, now));
        gate_accounts.insert(user_id, Some(now));
        tokens
            .get_mut(&token_id)
            .ok_or_else(|| AppError::Internal(anyhow::anyhow!("pending invite token disappeared")))?
            .used_at = Some(now);

        Ok(PendingInviteRedemptionOutcome::Redeemed {
            user_id,
            invite_code,
        })
    }
}
