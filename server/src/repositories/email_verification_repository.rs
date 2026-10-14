//! Atomic token-consumption and canonical email-verification persistence.

use async_trait::async_trait;
use chrono::Utc;
use std::sync::Arc;

use crate::errors::AppError;

use super::{
    InMemoryUserEmailRepository, InMemoryUserRepository, InMemoryVerificationRepository, TokenType,
    UserEmailEntity,
};

#[derive(Debug, Clone)]
pub struct EmailVerificationOutcome {
    pub email: UserEmailEntity,
    pub credentials_reset: bool,
}

/// Atomically consumes an email-verification token and verifies its bound row.
#[async_trait]
pub trait EmailVerificationRepository: Send + Sync {
    /// Complete a mailbox ownership claim from an already consumed instant-link
    /// or recovery proof, against the exact pre-consumption account snapshot.
    async fn claim_unverified_primary(
        &self,
        expected: &super::UserEntity,
        email_id: uuid::Uuid,
        password_hash: Option<&str>,
    ) -> Result<super::UserEntity, AppError> {
        let _ = (expected, email_id, password_hash);
        Err(AppError::Config(
            "Atomic mailbox ownership claim is not implemented".into(),
        ))
    }

    /// `Ok(None)` means the token is unknown, expired, used, or has the wrong purpose.
    /// Invalid or inconsistent token subjects fail without consuming the token.
    async fn verify_email_token(
        &self,
        token_hash: &str,
        expected_types: &[TokenType],
    ) -> Result<Option<EmailVerificationOutcome>, AppError>;
}

/// In-memory implementation. Lock order is users -> email rows -> tokens.
pub struct InMemoryEmailVerificationRepository {
    users: Arc<InMemoryUserRepository>,
    emails: Arc<InMemoryUserEmailRepository>,
    tokens: Arc<InMemoryVerificationRepository>,
    credentials: Arc<super::InMemoryCredentialLifecycleRepository>,
    #[cfg(test)]
    fail_before_commit: std::sync::atomic::AtomicBool,
}

impl InMemoryEmailVerificationRepository {
    pub fn new(
        users: Arc<InMemoryUserRepository>,
        emails: Arc<InMemoryUserEmailRepository>,
        tokens: Arc<InMemoryVerificationRepository>,
        credentials: Arc<super::InMemoryCredentialLifecycleRepository>,
    ) -> Self {
        Self {
            users,
            emails,
            tokens,
            credentials,
            #[cfg(test)]
            fail_before_commit: std::sync::atomic::AtomicBool::new(false),
        }
    }
}

#[async_trait]
impl EmailVerificationRepository for InMemoryEmailVerificationRepository {
    async fn claim_unverified_primary(
        &self,
        expected: &super::UserEntity,
        email_id: uuid::Uuid,
        password_hash: Option<&str>,
    ) -> Result<super::UserEntity, AppError> {
        let mut users = self.users.users.write().await;
        let mut emails = self.emails.emails.write().await;
        let mut tokens = self.tokens.tokens.write().await;
        let mut user = users
            .get(&expected.id)
            .cloned()
            .ok_or_else(invalid_subject)?;
        if user.updated_at != expected.updated_at
            || user.email_verified
            || checked_primary(&user, emails.values())? != email_id
        {
            return Err(invalid_subject());
        }
        self.credentials
            .discard_pre_registration_authority(user.id)
            .await?;
        self.users.clear_credential_indexes(user.id).await;
        user.reset_unverified_credentials();
        user.password_hash = password_hash.map(ToString::to_string);
        user.email_verified = true;
        user.updated_at = Utc::now();
        emails
            .get_mut(&email_id)
            .ok_or_else(invalid_subject)?
            .verified_at = Some(user.updated_at);
        emails.retain(|_, row| row.user_id != user.id || row.is_primary);
        tokens.retain(|_, token| token.user_id != user.id);
        users.insert(user.id, user.clone());
        Ok(user)
    }

    async fn verify_email_token(
        &self,
        token_hash: &str,
        expected_types: &[TokenType],
    ) -> Result<Option<EmailVerificationOutcome>, AppError> {
        if expected_types.is_empty() {
            return Ok(None);
        }
        let mut users = self.users.users.write().await;
        let mut emails = self.emails.emails.write().await;
        let mut tokens = self.tokens.tokens.write().await;
        let now = Utc::now();
        let Some(token) = tokens
            .values()
            .find(|token| {
                token.token_hash == token_hash
                    && expected_types.contains(&token.token_type)
                    && token.used_at.is_none()
                    && token.expires_at > now
            })
            .cloned()
        else {
            return Ok(None);
        };

        let mut user = users
            .get(&token.user_id)
            .cloned()
            .ok_or_else(invalid_subject)?;
        let primary_id = checked_primary(&user, emails.values())?;
        let target_id = match token.token_type {
            TokenType::EmailVerify if token.subject_id == Some(primary_id) => primary_id,
            TokenType::AccountEmailVerify => token.subject_id.ok_or_else(invalid_subject)?,
            _ => return Err(invalid_subject()),
        };
        if !emails
            .get(&target_id)
            .is_some_and(|row| row.user_id == token.user_id)
        {
            return Err(invalid_subject());
        }

        #[cfg(test)]
        if self
            .fail_before_commit
            .swap(false, std::sync::atomic::Ordering::SeqCst)
        {
            return Err(AppError::Internal(anyhow::anyhow!(
                "injected email verification failure"
            )));
        }

        let row = emails.get_mut(&target_id).expect("validated target exists");
        row.verified_at.get_or_insert(now);
        let row = row.clone();
        let credentials_reset = row.is_primary && user.reset_unverified_credentials();
        if row.is_primary {
            user.email_verified = true;
            user.updated_at = now;
            users.insert(token.user_id, user);
        }
        if credentials_reset {
            self.users.clear_credential_indexes(token.user_id).await;
            self.credentials
                .discard_pre_registration_authority(token.user_id)
                .await?;
            tokens.retain(|_, other| other.user_id != token.user_id || other.id == token.id);
            emails.retain(|_, email| email.user_id != token.user_id || email.is_primary);
        }
        tokens
            .get_mut(&token.id)
            .expect("locked token exists")
            .used_at = Some(now);
        Ok(Some(EmailVerificationOutcome {
            email: row,
            credentials_reset,
        }))
    }
}

fn checked_primary<'a>(
    user: &super::UserEntity,
    rows: impl Iterator<Item = &'a UserEmailEntity>,
) -> Result<uuid::Uuid, AppError> {
    let primaries: Vec<_> = rows
        .filter(|row| row.user_id == user.id && row.is_primary)
        .collect();
    match (user.email.as_deref(), primaries.as_slice()) {
        (Some(email), [row]) if row.email == email && row.is_verified() == user.email_verified => {
            Ok(row.id)
        }
        _ => Err(super::canonical_email_repository::integrity_error(
            user.id,
            "invalid primary during email verification",
        )),
    }
}

fn invalid_subject() -> AppError {
    AppError::Validation("Invalid token subject".into())
}

#[cfg(test)]
#[path = "email_verification_repository_tests.rs"]
mod tests;
