use async_trait::async_trait;
use chrono::{DateTime, Duration, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

pub const PENDING_EMAIL_EXPIRY_HOURS: i64 = 48;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UserEmailEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub email: String,
    pub verified_at: Option<DateTime<Utc>>,
    pub is_primary: bool,
    pub created_at: DateTime<Utc>,
}

impl UserEmailEntity {
    pub fn new(user_id: Uuid, email: String, verified: bool, is_primary: bool) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            user_id,
            email,
            verified_at: verified.then_some(now),
            is_primary,
            created_at: now,
        }
    }

    pub fn is_verified(&self) -> bool {
        self.verified_at.is_some()
    }

    pub fn blocks_signup(&self) -> bool {
        self.is_verified()
            || Utc::now().signed_duration_since(self.created_at)
                <= Duration::hours(PENDING_EMAIL_EXPIRY_HOURS)
    }
}

#[async_trait]
pub trait UserEmailRepository: Send + Sync {
    async fn create(&self, email: UserEmailEntity) -> Result<UserEmailEntity, AppError>;
    async fn list_by_user(&self, user_id: Uuid) -> Result<Vec<UserEmailEntity>, AppError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<UserEmailEntity>, AppError>;
    async fn find_active_by_email(&self, email: &str) -> Result<Option<UserEmailEntity>, AppError>;
    async fn find_verified_by_email(
        &self,
        email: &str,
    ) -> Result<Option<UserEmailEntity>, AppError>;
    async fn email_blocks_signup(&self, email: &str) -> Result<bool, AppError>;
    async fn mark_verified(&self, id: Uuid) -> Result<UserEmailEntity, AppError>;
    async fn set_primary(&self, user_id: Uuid, id: Uuid) -> Result<UserEmailEntity, AppError>;
    async fn delete(&self, id: Uuid) -> Result<UserEmailEntity, AppError>;
    async fn delete_secondary_by_user(&self, user_id: Uuid) -> Result<u64, AppError>;
    async fn delete_expired_unverified(&self) -> Result<u64, AppError>;
}

#[derive(Debug, Default)]
pub struct InMemoryUserEmailRepository {
    pub(crate) emails: RwLock<HashMap<Uuid, UserEmailEntity>>,
}

impl InMemoryUserEmailRepository {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl UserEmailRepository for InMemoryUserEmailRepository {
    async fn create(&self, email: UserEmailEntity) -> Result<UserEmailEntity, AppError> {
        let mut emails = self.emails.write().await;
        remove_expired_pending(&mut emails);
        if emails
            .values()
            .any(|row| row.email == email.email && (row.is_primary || row.blocks_signup()))
        {
            return Err(AppError::EmailExists);
        }
        if email.is_primary {
            for row in emails
                .values_mut()
                .filter(|row| row.user_id == email.user_id)
            {
                row.is_primary = false;
            }
        }
        emails.insert(email.id, email.clone());
        Ok(email)
    }

    async fn list_by_user(&self, user_id: Uuid) -> Result<Vec<UserEmailEntity>, AppError> {
        let mut emails = self.emails.write().await;
        remove_expired_pending(&mut emails);
        let mut rows: Vec<_> = emails
            .values()
            .filter(|row| row.user_id == user_id)
            .cloned()
            .collect();
        rows.sort_by_key(|row| (!row.is_primary, row.created_at));
        Ok(rows)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<UserEmailEntity>, AppError> {
        let mut emails = self.emails.write().await;
        remove_expired_pending(&mut emails);
        Ok(emails.get(&id).cloned())
    }

    async fn find_active_by_email(&self, email: &str) -> Result<Option<UserEmailEntity>, AppError> {
        let mut emails = self.emails.write().await;
        remove_expired_pending(&mut emails);
        Ok(emails
            .values()
            .find(|row| row.email == email && (row.is_primary || row.blocks_signup()))
            .cloned())
    }

    async fn find_verified_by_email(
        &self,
        email: &str,
    ) -> Result<Option<UserEmailEntity>, AppError> {
        let emails = self.emails.read().await;
        Ok(emails
            .values()
            .find(|row| row.email == email && row.is_verified())
            .cloned())
    }

    async fn email_blocks_signup(&self, email: &str) -> Result<bool, AppError> {
        Ok(self.find_active_by_email(email).await?.is_some())
    }

    async fn mark_verified(&self, id: Uuid) -> Result<UserEmailEntity, AppError> {
        let mut emails = self.emails.write().await;
        let row = emails
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Email not found".into()))?;
        row.verified_at = Some(Utc::now());
        Ok(row.clone())
    }

    async fn set_primary(&self, user_id: Uuid, id: Uuid) -> Result<UserEmailEntity, AppError> {
        let mut emails = self.emails.write().await;
        let target = emails
            .get(&id)
            .filter(|row| row.user_id == user_id)
            .cloned()
            .ok_or_else(|| AppError::NotFound("Email not found".into()))?;
        if !target.is_verified() {
            return Err(AppError::Validation(
                "Primary email must be verified".into(),
            ));
        }
        for row in emails.values_mut().filter(|row| row.user_id == user_id) {
            row.is_primary = row.id == id;
        }
        Ok(emails.get(&id).cloned().expect("primary row exists"))
    }

    async fn delete(&self, id: Uuid) -> Result<UserEmailEntity, AppError> {
        let mut emails = self.emails.write().await;
        let row = emails
            .get(&id)
            .cloned()
            .ok_or_else(|| AppError::NotFound("Email not found".into()))?;
        if row.is_primary {
            return Err(AppError::Validation(
                "Primary email cannot be removed".into(),
            ));
        }
        emails.remove(&id);
        Ok(row)
    }

    async fn delete_secondary_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let mut emails = self.emails.write().await;
        let before = emails.len();
        emails.retain(|_, row| row.user_id != user_id || row.is_primary);
        Ok((before - emails.len()) as u64)
    }

    async fn delete_expired_unverified(&self) -> Result<u64, AppError> {
        let mut emails = self.emails.write().await;
        let before = emails.len();
        remove_expired_pending(&mut emails);
        Ok((before - emails.len()) as u64)
    }
}

fn remove_expired_pending(emails: &mut HashMap<Uuid, UserEmailEntity>) {
    let cutoff = Utc::now() - Duration::hours(PENDING_EMAIL_EXPIRY_HOURS);
    emails.retain(|_, row| row.is_primary || row.is_verified() || row.created_at >= cutoff);
}

#[cfg(test)]
mod cleanup_tests {
    use super::*;

    #[tokio::test]
    async fn cleanup_never_removes_an_unverified_primary() {
        let repository = InMemoryUserEmailRepository::new();
        let mut primary = UserEmailEntity::new(
            Uuid::new_v4(),
            "primary-pending@example.com".into(),
            false,
            true,
        );
        primary.created_at = Utc::now() - Duration::hours(PENDING_EMAIL_EXPIRY_HOURS + 1);
        repository.create(primary.clone()).await.unwrap();
        repository.delete_expired_unverified().await.unwrap();
        assert!(repository.find_by_id(primary.id).await.unwrap().is_some());
    }
}
