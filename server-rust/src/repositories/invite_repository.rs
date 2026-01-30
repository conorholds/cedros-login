//! Invite repository trait and implementations
//!
//! # Performance Note (In-Memory Implementation)
//!
//! The in-memory implementation uses O(n) scans for duplicate checking and email lookups.
//! This is acceptable for development/testing but not suitable for production with many invites.
//! The PostgreSQL implementation uses proper indexes for efficient lookups.
//!
//! # Unicode Case Folding
//!
//! Email comparisons use `to_lowercase()` which handles ASCII case folding correctly.
//! Edge cases like Turkish İ/i (dotted/dotless) are not handled specially, but email
//! addresses are effectively ASCII-only per RFC 5321 (internationalized emails are rare
//! and typically use Punycode for domain parts).

use async_trait::async_trait;
use chrono::{DateTime, Duration, Utc};
use rand::{rngs::OsRng, Rng};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::membership_repository::OrgRole;

/// Invite entity for storage
#[derive(Debug, Clone)]
pub struct InviteEntity {
    pub id: Uuid,
    pub org_id: Uuid,
    pub email: String,
    pub role: OrgRole,
    pub token_hash: String,
    pub invited_by: Uuid,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub accepted_at: Option<DateTime<Utc>>,
}

impl InviteEntity {
    /// Check if the invite is still valid (not expired, not accepted)
    pub fn is_valid(&self) -> bool {
        self.accepted_at.is_none() && self.expires_at > Utc::now()
    }

    /// Check if the invite has been accepted
    pub fn is_accepted(&self) -> bool {
        self.accepted_at.is_some()
    }

    /// Check if the invite has expired
    pub fn is_expired(&self) -> bool {
        self.expires_at <= Utc::now()
    }
}

/// Generate a random invite token (returned to user)
pub fn generate_invite_token() -> String {
    // SEC-08: Use OsRng for cryptographic random generation
    let mut rng = OsRng;
    let bytes: [u8; 32] = rng.gen();
    hex::encode(bytes)
}

/// Hash an invite token for storage
pub fn hash_invite_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}

/// Default invite expiry in days
pub const INVITE_EXPIRY_DAYS: u32 = 7;

/// Default invite expiry (7 days)
pub fn default_invite_expiry() -> DateTime<Utc> {
    Utc::now() + Duration::days(INVITE_EXPIRY_DAYS as i64)
}

/// Invite repository trait
#[async_trait]
pub trait InviteRepository: Send + Sync {
    /// Find invite by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<InviteEntity>, AppError>;

    /// Find invite by token hash
    async fn find_by_token_hash(&self, token_hash: &str) -> Result<Option<InviteEntity>, AppError>;

    /// Find invite by org and email
    async fn find_by_org_and_email(
        &self,
        org_id: Uuid,
        email: &str,
    ) -> Result<Option<InviteEntity>, AppError>;

    /// Find all pending invites for an organization
    ///
    /// # Implicit Limit (R-05)
    ///
    /// This method has an implicit limit of 1000 results to prevent memory issues
    /// with organizations that have many pending invites. Results beyond this limit
    /// are silently truncated. For paginated access to all invites, use
    /// `find_pending_by_org_paged` with `count_pending_by_org` for total count.
    async fn find_pending_by_org(&self, org_id: Uuid) -> Result<Vec<InviteEntity>, AppError>;

    /// Find pending invites for an organization (paged)
    async fn find_pending_by_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<InviteEntity>, AppError>;

    /// Find all pending invites for an email
    ///
    /// # Implicit Limit (R-05)
    ///
    /// This method has an implicit limit of 1000 results to prevent memory issues.
    /// In practice, a single email having >1000 pending invites is unlikely.
    async fn find_pending_by_email(&self, email: &str) -> Result<Vec<InviteEntity>, AppError>;

    /// Create a new invite
    async fn create(&self, invite: InviteEntity) -> Result<InviteEntity, AppError>;

    /// Mark invite as accepted
    async fn mark_accepted(&self, id: Uuid) -> Result<(), AppError>;

    /// Atomically mark invite as accepted if still valid.
    /// Returns Ok(Some(invite)) if successfully marked, Ok(None) if already accepted/expired.
    /// This prevents race conditions when accepting invites concurrently.
    async fn mark_accepted_if_valid(&self, id: Uuid) -> Result<Option<InviteEntity>, AppError>;

    /// Clear invite acceptance (used for rollback on downstream failure)
    async fn unmark_accepted(&self, id: Uuid) -> Result<(), AppError>;

    /// Delete an invite
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;

    /// Delete all invites for an organization
    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError>;

    /// Delete expired invites
    async fn delete_expired(&self) -> Result<u64, AppError>;

    /// Count pending invites for an organization
    async fn count_pending_by_org(&self, org_id: Uuid) -> Result<u64, AppError>;
}

/// In-memory invite repository for development/testing
pub struct InMemoryInviteRepository {
    invites: RwLock<HashMap<Uuid, InviteEntity>>,
}

impl InMemoryInviteRepository {
    pub fn new() -> Self {
        Self {
            invites: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryInviteRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl InviteRepository for InMemoryInviteRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<InviteEntity>, AppError> {
        let invites = self.invites.read().await;
        Ok(invites.get(&id).cloned())
    }

    async fn find_by_token_hash(&self, token_hash: &str) -> Result<Option<InviteEntity>, AppError> {
        let invites = self.invites.read().await;
        Ok(invites
            .values()
            .find(|i| i.token_hash == token_hash)
            .cloned())
    }

    async fn find_by_org_and_email(
        &self,
        org_id: Uuid,
        email: &str,
    ) -> Result<Option<InviteEntity>, AppError> {
        let invites = self.invites.read().await;
        let email_lower = email.to_lowercase();
        Ok(invites
            .values()
            .find(|i| i.org_id == org_id && i.email.to_lowercase() == email_lower)
            .cloned())
    }

    async fn find_pending_by_org(&self, org_id: Uuid) -> Result<Vec<InviteEntity>, AppError> {
        let invites = self.invites.read().await;
        Ok(invites
            .values()
            .filter(|i| i.org_id == org_id && i.is_valid())
            .cloned()
            .collect())
    }

    async fn find_pending_by_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<InviteEntity>, AppError> {
        let mut invites = self.find_pending_by_org(org_id).await?;
        invites.sort_by(|a, b| b.created_at.cmp(&a.created_at));

        let start = offset as usize;
        let limit = limit as usize;
        Ok(invites.into_iter().skip(start).take(limit).collect())
    }

    async fn find_pending_by_email(&self, email: &str) -> Result<Vec<InviteEntity>, AppError> {
        let invites = self.invites.read().await;
        let email_lower = email.to_lowercase();
        Ok(invites
            .values()
            .filter(|i| i.email.to_lowercase() == email_lower && i.is_valid())
            .cloned()
            .collect())
    }

    async fn create(&self, invite: InviteEntity) -> Result<InviteEntity, AppError> {
        // REPO-04: Atomic check-and-insert - write lock held for entire operation
        // prevents TOCTOU race where concurrent requests could both pass the check.
        let mut invites = self.invites.write().await;

        // Check for existing pending invite for same org+email
        let email_lower = invite.email.to_lowercase();
        if invites.values().any(|i| {
            i.org_id == invite.org_id && i.email.to_lowercase() == email_lower && i.is_valid()
        }) {
            return Err(AppError::Validation(
                "An active invite already exists for this email".into(),
            ));
        }

        invites.insert(invite.id, invite.clone());
        Ok(invite)
    }

    async fn mark_accepted(&self, id: Uuid) -> Result<(), AppError> {
        let mut invites = self.invites.write().await;

        let invite = invites
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Invite not found".into()))?;

        invite.accepted_at = Some(Utc::now());
        Ok(())
    }

    async fn mark_accepted_if_valid(&self, id: Uuid) -> Result<Option<InviteEntity>, AppError> {
        let mut invites = self.invites.write().await;

        let invite = match invites.get_mut(&id) {
            Some(inv) => inv,
            None => return Ok(None),
        };

        // Check if already accepted or expired
        if invite.accepted_at.is_some() || invite.expires_at <= Utc::now() {
            return Ok(None);
        }

        // Atomically mark as accepted and return the invite
        invite.accepted_at = Some(Utc::now());
        Ok(Some(invite.clone()))
    }

    async fn unmark_accepted(&self, id: Uuid) -> Result<(), AppError> {
        let mut invites = self.invites.write().await;

        if let Some(invite) = invites.get_mut(&id) {
            invite.accepted_at = None;
        }

        Ok(())
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let mut invites = self.invites.write().await;

        if invites.remove(&id).is_none() {
            return Err(AppError::NotFound("Invite not found".into()));
        }

        Ok(())
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let mut invites = self.invites.write().await;

        let ids_to_remove: Vec<Uuid> = invites
            .values()
            .filter(|i| i.org_id == org_id)
            .map(|i| i.id)
            .collect();

        let count = ids_to_remove.len() as u64;
        for id in ids_to_remove {
            invites.remove(&id);
        }

        Ok(count)
    }

    async fn delete_expired(&self) -> Result<u64, AppError> {
        let mut invites = self.invites.write().await;

        let now = Utc::now();
        let ids_to_remove: Vec<Uuid> = invites
            .values()
            .filter(|i| i.expires_at <= now)
            .map(|i| i.id)
            .collect();

        let count = ids_to_remove.len() as u64;
        for id in ids_to_remove {
            invites.remove(&id);
        }

        Ok(count)
    }

    async fn count_pending_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let invites = self.invites.read().await;
        Ok(invites
            .values()
            .filter(|i| i.org_id == org_id && i.is_valid())
            .count() as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_invite(org_id: Uuid, email: &str, invited_by: Uuid) -> InviteEntity {
        let token = generate_invite_token();
        InviteEntity {
            id: Uuid::new_v4(),
            org_id,
            email: email.to_string(),
            role: OrgRole::Member,
            token_hash: hash_invite_token(&token),
            invited_by,
            created_at: Utc::now(),
            expires_at: default_invite_expiry(),
            accepted_at: None,
        }
    }

    #[tokio::test]
    async fn test_create_invite() {
        let repo = InMemoryInviteRepository::new();
        let org_id = Uuid::new_v4();
        let invited_by = Uuid::new_v4();

        let invite = create_test_invite(org_id, "test@example.com", invited_by);
        let created = repo.create(invite).await.unwrap();

        assert_eq!(created.email, "test@example.com");
        assert!(created.is_valid());
    }

    #[tokio::test]
    async fn test_duplicate_invite_rejected() {
        let repo = InMemoryInviteRepository::new();
        let org_id = Uuid::new_v4();
        let invited_by = Uuid::new_v4();

        let invite1 = create_test_invite(org_id, "test@example.com", invited_by);
        let invite2 = create_test_invite(org_id, "test@example.com", invited_by);

        repo.create(invite1).await.unwrap();
        let result = repo.create(invite2).await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_find_by_token_hash() {
        let repo = InMemoryInviteRepository::new();
        let org_id = Uuid::new_v4();
        let invited_by = Uuid::new_v4();

        let token = generate_invite_token();
        let token_hash = hash_invite_token(&token);

        let invite = InviteEntity {
            id: Uuid::new_v4(),
            org_id,
            email: "test@example.com".to_string(),
            role: OrgRole::Member,
            token_hash: token_hash.clone(),
            invited_by,
            created_at: Utc::now(),
            expires_at: default_invite_expiry(),
            accepted_at: None,
        };

        repo.create(invite).await.unwrap();

        let found = repo.find_by_token_hash(&token_hash).await.unwrap();
        assert!(found.is_some());
    }

    #[tokio::test]
    async fn test_mark_accepted() {
        let repo = InMemoryInviteRepository::new();
        let org_id = Uuid::new_v4();
        let invited_by = Uuid::new_v4();

        let invite = create_test_invite(org_id, "test@example.com", invited_by);
        let created = repo.create(invite).await.unwrap();

        assert!(created.is_valid());

        repo.mark_accepted(created.id).await.unwrap();

        let found = repo.find_by_id(created.id).await.unwrap().unwrap();
        assert!(found.is_accepted());
        assert!(!found.is_valid());
    }

    #[tokio::test]
    async fn test_unmark_accepted() {
        let repo = InMemoryInviteRepository::new();
        let org_id = Uuid::new_v4();
        let invited_by = Uuid::new_v4();

        let invite = create_test_invite(org_id, "test@example.com", invited_by);
        let created = repo.create(invite).await.unwrap();

        repo.mark_accepted(created.id).await.unwrap();
        repo.unmark_accepted(created.id).await.unwrap();

        let found = repo.find_by_id(created.id).await.unwrap().unwrap();
        assert!(!found.is_accepted());
        assert!(found.is_valid());
    }

    #[tokio::test]
    async fn test_find_pending_by_org() {
        let repo = InMemoryInviteRepository::new();
        let org_id = Uuid::new_v4();
        let invited_by = Uuid::new_v4();

        let invite1 = create_test_invite(org_id, "test1@example.com", invited_by);
        let invite2 = create_test_invite(org_id, "test2@example.com", invited_by);
        let invite3 = create_test_invite(Uuid::new_v4(), "test3@example.com", invited_by);

        repo.create(invite1).await.unwrap();
        let created2 = repo.create(invite2).await.unwrap();
        repo.create(invite3).await.unwrap();

        // Accept one invite
        repo.mark_accepted(created2.id).await.unwrap();

        let pending = repo.find_pending_by_org(org_id).await.unwrap();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].email, "test1@example.com");
    }

    #[tokio::test]
    async fn test_find_pending_by_org_paged() {
        let repo = InMemoryInviteRepository::new();
        let org_id = Uuid::new_v4();
        let invited_by = Uuid::new_v4();

        let base_time = Utc::now();
        for i in 0..3 {
            let mut invite =
                create_test_invite(org_id, &format!("user{}@example.com", i), invited_by);
            invite.created_at = base_time + chrono::Duration::seconds(i);
            repo.create(invite).await.unwrap();
        }

        let total = repo.count_pending_by_org(org_id).await.unwrap();
        assert_eq!(total, 3);

        let page = repo.find_pending_by_org_paged(org_id, 2, 1).await.unwrap();
        assert_eq!(page.len(), 2);
        assert!(page[0].created_at >= page[1].created_at);
    }

    #[test]
    fn test_invite_token_generation() {
        let token1 = generate_invite_token();
        let token2 = generate_invite_token();

        // Tokens should be unique
        assert_ne!(token1, token2);
        // Tokens should be 64 hex characters
        assert_eq!(token1.len(), 64);
    }

    #[test]
    fn test_invite_token_hashing() {
        let token = generate_invite_token();
        let hash1 = hash_invite_token(&token);
        let hash2 = hash_invite_token(&token);

        // Same token should produce same hash
        assert_eq!(hash1, hash2);
        // Hash should be 64 hex characters (SHA256)
        assert_eq!(hash1.len(), 64);
    }
}
