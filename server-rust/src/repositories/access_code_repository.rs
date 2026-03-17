//! Access code repository trait and in-memory implementation
//!
//! Access codes gate user signups. Three types are supported:
//! - `"global"` — a single code stored in system_settings (handled by SignupGatingService)
//! - `"limited"` — admin-created codes with optional use caps and expiry
//! - `"user_invite"` — user-generated single-use invite codes

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// A persisted access code record.
#[derive(Debug, Clone)]
pub struct AccessCodeEntity {
    pub id: Uuid,
    /// The plaintext code presented by the user.
    pub code: String,
    /// `"global"`, `"limited"`, or `"user_invite"`.
    pub code_type: String,
    /// Maximum number of times the code may be used (`None` = unlimited).
    pub max_uses: Option<i32>,
    /// Number of successful uses so far.
    pub current_uses: i32,
    /// The user who created this code (`None` for admin-created codes).
    pub created_by: Option<Uuid>,
    /// When the code expires (`None` = never).
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

/// Repository for signup access codes.
#[async_trait]
pub trait AccessCodeRepository: Send + Sync {
    /// Look up a code by its plaintext value. Returns `None` if not found.
    async fn find_by_code(&self, code: &str) -> Result<Option<AccessCodeEntity>, AppError>;

    /// Atomically increment uses if the code still has capacity.
    ///
    /// Returns `true` when the increment succeeded (code had remaining uses),
    /// `false` when the code was already exhausted (`current_uses >= max_uses`).
    /// Always returns `true` when `max_uses` is `None`.
    async fn increment_uses(&self, id: Uuid) -> Result<bool, AppError>;

    /// Persist a new access code. Returns the stored entity.
    async fn create(&self, entity: AccessCodeEntity) -> Result<AccessCodeEntity, AppError>;

    /// Delete a code by ID.
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;

    /// List codes with optional type filter, ordered by `created_at` DESC.
    async fn list_all(
        &self,
        limit: u32,
        offset: u32,
        code_type: Option<&str>,
    ) -> Result<Vec<AccessCodeEntity>, AppError>;

    /// Count codes with optional type filter.
    async fn count_all(&self, code_type: Option<&str>) -> Result<u64, AppError>;

    /// Count codes created by a specific user since `since`.
    async fn count_by_creator_since(
        &self,
        user_id: Uuid,
        since: DateTime<Utc>,
    ) -> Result<u64, AppError>;

    /// List codes created by a specific user, ordered by `created_at` DESC.
    async fn list_by_creator(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AccessCodeEntity>, AppError>;
}

// ---------------------------------------------------------------------------
// In-memory implementation
// ---------------------------------------------------------------------------

/// In-memory access code repository for development and testing.
pub struct InMemoryAccessCodeRepository {
    codes: RwLock<HashMap<Uuid, AccessCodeEntity>>,
}

impl InMemoryAccessCodeRepository {
    pub fn new() -> Self {
        Self {
            codes: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryAccessCodeRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl AccessCodeRepository for InMemoryAccessCodeRepository {
    async fn find_by_code(&self, code: &str) -> Result<Option<AccessCodeEntity>, AppError> {
        let codes = self.codes.read().await;
        Ok(codes.values().find(|c| c.code == code).cloned())
    }

    async fn increment_uses(&self, id: Uuid) -> Result<bool, AppError> {
        let mut codes = self.codes.write().await;
        match codes.get_mut(&id) {
            None => Ok(false),
            Some(c) => {
                if let Some(max) = c.max_uses {
                    if c.current_uses >= max {
                        return Ok(false);
                    }
                }
                c.current_uses += 1;
                Ok(true)
            }
        }
    }

    async fn create(&self, entity: AccessCodeEntity) -> Result<AccessCodeEntity, AppError> {
        let mut codes = self.codes.write().await;
        codes.insert(entity.id, entity.clone());
        Ok(entity)
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let mut codes = self.codes.write().await;
        codes.remove(&id);
        Ok(())
    }

    async fn list_all(
        &self,
        limit: u32,
        offset: u32,
        code_type: Option<&str>,
    ) -> Result<Vec<AccessCodeEntity>, AppError> {
        let codes = self.codes.read().await;
        let mut items: Vec<_> = codes
            .values()
            .filter(|c| code_type.map_or(true, |t| c.code_type == t))
            .cloned()
            .collect();
        items.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(items
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_all(&self, code_type: Option<&str>) -> Result<u64, AppError> {
        let codes = self.codes.read().await;
        Ok(codes
            .values()
            .filter(|c| code_type.map_or(true, |t| c.code_type == t))
            .count() as u64)
    }

    async fn count_by_creator_since(
        &self,
        user_id: Uuid,
        since: DateTime<Utc>,
    ) -> Result<u64, AppError> {
        let codes = self.codes.read().await;
        Ok(codes
            .values()
            .filter(|c| c.created_by == Some(user_id) && c.created_at >= since)
            .count() as u64)
    }

    async fn list_by_creator(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AccessCodeEntity>, AppError> {
        let codes = self.codes.read().await;
        let mut items: Vec<_> = codes
            .values()
            .filter(|c| c.created_by == Some(user_id))
            .cloned()
            .collect();
        items.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(items
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_code(code: &str, max_uses: Option<i32>, created_by: Option<Uuid>) -> AccessCodeEntity {
        AccessCodeEntity {
            id: Uuid::new_v4(),
            code: code.to_string(),
            code_type: "limited".to_string(),
            max_uses,
            current_uses: 0,
            created_by,
            expires_at: None,
            created_at: Utc::now(),
        }
    }

    #[tokio::test]
    async fn test_create_and_find_by_code() {
        let repo = InMemoryAccessCodeRepository::new();
        let entity = make_code("TESTCODE", Some(5), None);
        let id = entity.id;
        repo.create(entity).await.unwrap();

        let found = repo.find_by_code("TESTCODE").await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().id, id);

        let not_found = repo.find_by_code("MISSING").await.unwrap();
        assert!(not_found.is_none());
    }

    #[tokio::test]
    async fn test_increment_uses_respects_max() {
        let repo = InMemoryAccessCodeRepository::new();
        let mut entity = make_code("LIMITED", Some(2), None);
        entity.current_uses = 1;
        let id = entity.id;
        repo.create(entity).await.unwrap();

        // First increment should succeed (1 -> 2)
        assert!(repo.increment_uses(id).await.unwrap());
        // Second attempt at id=2 where max=2 should fail
        assert!(!repo.increment_uses(id).await.unwrap());
    }

    #[tokio::test]
    async fn test_increment_uses_unlimited() {
        let repo = InMemoryAccessCodeRepository::new();
        let entity = make_code("UNLIMITED", None, None);
        let id = entity.id;
        repo.create(entity).await.unwrap();

        for _ in 0..10 {
            assert!(repo.increment_uses(id).await.unwrap());
        }
    }

    #[tokio::test]
    async fn test_count_by_creator_since() {
        let repo = InMemoryAccessCodeRepository::new();
        let user_id = Uuid::new_v4();
        let other_id = Uuid::new_v4();
        let now = Utc::now();

        let mut e1 = make_code("A1", None, Some(user_id));
        e1.created_at = now;
        let mut e2 = make_code("A2", None, Some(user_id));
        e2.created_at = now;
        let mut e3 = make_code("B1", None, Some(other_id));
        e3.created_at = now;

        repo.create(e1).await.unwrap();
        repo.create(e2).await.unwrap();
        repo.create(e3).await.unwrap();

        let since = now - chrono::Duration::seconds(1);
        assert_eq!(
            repo.count_by_creator_since(user_id, since).await.unwrap(),
            2
        );
        assert_eq!(
            repo.count_by_creator_since(other_id, since).await.unwrap(),
            1
        );
    }
}
