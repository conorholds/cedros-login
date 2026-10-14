//! Invite-code repository trait and in-memory implementation.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use rand::{rngs::OsRng, RngCore};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Stored invite code. `owner_user_id` is set for user-issued one-time codes.
#[derive(Debug, Clone)]
pub struct InviteCodeEntity {
    pub id: Uuid,
    pub code: String,
    pub created_by: Option<Uuid>,
    pub owner_user_id: Option<Uuid>,
    pub max_uses: Option<i32>,
    pub uses_count: i32,
    pub starts_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub active: bool,
    pub batch_key: Option<String>,
    /// Optional subscription discount granted on redemption (1-100; 100 = free).
    pub discount_percent: Option<i32>,
    pub discount_months: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Default)]
pub struct InviteCodeUpdate {
    pub code: Option<String>,
    pub max_uses: NullableUpdate<i32>,
    pub starts_at: NullableUpdate<DateTime<Utc>>,
    pub expires_at: NullableUpdate<DateTime<Utc>>,
    pub active: Option<bool>,
    pub discount_percent: NullableUpdate<i32>,
    pub discount_months: NullableUpdate<i32>,
}

/// A subscription discount a user holds from redeeming an invite code. The
/// percent tracks the code's current value (an admin edit updates live grants).
#[derive(Debug, Clone)]
pub struct InviteDiscountGrant {
    pub percent_off: i32,
    pub duration_months: Option<i32>,
    pub code: String,
    pub redeemed_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Default)]
pub enum NullableUpdate<T> {
    #[default]
    Unchanged,
    Set(Option<T>),
}

impl<T: Clone> NullableUpdate<T> {
    pub fn is_set(&self) -> bool {
        matches!(self, Self::Set(_))
    }

    pub fn value(&self) -> Option<T> {
        match self {
            Self::Unchanged => None,
            Self::Set(value) => value.clone(),
        }
    }

    pub fn resolve(&self, current: Option<T>) -> Option<T> {
        match self {
            Self::Unchanged => current,
            Self::Set(value) => value.clone(),
        }
    }
}

impl InviteCodeEntity {
    /// Builds a new invite code. Callers must pass a normalized, validated code.
    pub fn new(
        code: String,
        created_by: Option<Uuid>,
        owner_user_id: Option<Uuid>,
        max_uses: Option<i32>,
        starts_at: Option<DateTime<Utc>>,
        expires_at: Option<DateTime<Utc>>,
        batch_key: Option<String>,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            code,
            created_by,
            owner_user_id,
            max_uses,
            uses_count: 0,
            starts_at,
            expires_at,
            active: true,
            batch_key,
            discount_percent: None,
            discount_months: None,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn is_available_at(&self, now: DateTime<Utc>) -> bool {
        self.active
            && self.starts_at.map(|starts| starts <= now).unwrap_or(true)
            && self.expires_at.map(|expires| expires > now).unwrap_or(true)
            && self
                .max_uses
                .map(|max_uses| self.uses_count < max_uses)
                .unwrap_or(true)
    }
}

/// Normalize and validate an invite code for storage and comparison.
pub fn normalize_invite_code(code: &str) -> Result<String, AppError> {
    let normalized = code.trim().to_ascii_uppercase();
    if !(4..=64).contains(&normalized.len()) {
        return Err(AppError::Validation(
            "Invite code must be 4-64 characters".into(),
        ));
    }
    if !normalized
        .bytes()
        .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
    {
        return Err(AppError::Validation(
            "Invite code can only contain letters, numbers, hyphens, and underscores".into(),
        ));
    }
    Ok(normalized)
}

/// Generate a random, user-facing invite code.
pub fn generate_invite_code() -> String {
    const ALPHABET: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let mut bytes = [0u8; 10];
    OsRng.fill_bytes(&mut bytes);
    bytes
        .iter()
        .map(|byte| ALPHABET[*byte as usize % ALPHABET.len()] as char)
        .collect()
}

/// Repository for invite-code records and per-user gate state.
#[async_trait]
pub trait InviteCodeRepository: Send + Sync {
    /// Create a code. Returns `Validation` if the normalized code already exists.
    async fn create(&self, code: InviteCodeEntity) -> Result<InviteCodeEntity, AppError>;

    /// List codes for admins, newest first.
    async fn list_admin(&self, limit: u32, offset: u32) -> Result<Vec<InviteCodeEntity>, AppError>;

    /// Find one invite code by id.
    async fn find_by_id(&self, id: Uuid) -> Result<Option<InviteCodeEntity>, AppError>;

    /// Update admin-editable code fields.
    async fn update(
        &self,
        id: Uuid,
        update: InviteCodeUpdate,
    ) -> Result<InviteCodeEntity, AppError>;

    /// Delete one invite code.
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;

    /// Atomically redeem one currently available code and activate the user.
    async fn redeem(&self, code: &str, user_id: Uuid)
        -> Result<Option<InviteCodeEntity>, AppError>;

    /// Mark a user as waiting on invite-code activation.
    async fn mark_user_pending(&self, user_id: Uuid) -> Result<(), AppError>;

    /// Mark a user as allowed through the invite-code gate.
    async fn activate_user(&self, user_id: Uuid) -> Result<(), AppError>;

    /// Returns true when a user was registered under the gate and is not active yet.
    async fn is_user_pending(&self, user_id: Uuid) -> Result<bool, AppError>;

    /// List user-owned invite codes, newest first.
    async fn list_user_codes(&self, user_id: Uuid) -> Result<Vec<InviteCodeEntity>, AppError>;

    /// Deactivate unused user-owned codes outside the current reset batch.
    async fn deactivate_stale_user_codes(
        &self,
        user_id: Uuid,
        current_batch_key: &str,
    ) -> Result<(), AppError>;

    /// The discount granted by the user's most recent redemption of a
    /// discount-carrying code, if any.
    async fn find_redeemed_discount(
        &self,
        user_id: Uuid,
    ) -> Result<Option<InviteDiscountGrant>, AppError>;
}

/// In-memory invite-code repository for tests and local development.
pub struct InMemoryInviteCodeRepository {
    pub(crate) codes: RwLock<HashMap<Uuid, InviteCodeEntity>>,
    pub(crate) gate_accounts: RwLock<HashMap<Uuid, Option<DateTime<Utc>>>>,
    /// (invite_code_id, user_id, redeemed_at) history, insertion-ordered.
    pub(crate) redemptions: RwLock<Vec<(Uuid, Uuid, DateTime<Utc>)>>,
}

impl InMemoryInviteCodeRepository {
    pub fn new() -> Self {
        Self {
            codes: RwLock::new(HashMap::new()),
            gate_accounts: RwLock::new(HashMap::new()),
            redemptions: RwLock::new(Vec::new()),
        }
    }
}

impl Default for InMemoryInviteCodeRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl InviteCodeRepository for InMemoryInviteCodeRepository {
    async fn create(&self, code: InviteCodeEntity) -> Result<InviteCodeEntity, AppError> {
        let mut codes = self.codes.write().await;
        if codes.values().any(|existing| existing.code == code.code) {
            return Err(AppError::Validation("Invite code already exists".into()));
        }
        codes.insert(code.id, code.clone());
        Ok(code)
    }

    async fn list_admin(&self, limit: u32, offset: u32) -> Result<Vec<InviteCodeEntity>, AppError> {
        let codes = self.codes.read().await;
        let mut rows: Vec<_> = codes.values().cloned().collect();
        rows.sort_by_key(|b| std::cmp::Reverse(b.created_at));
        Ok(rows
            .into_iter()
            .skip(offset as usize)
            .take(limit.min(100) as usize)
            .collect())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<InviteCodeEntity>, AppError> {
        let codes = self.codes.read().await;
        Ok(codes.get(&id).cloned())
    }

    async fn update(
        &self,
        id: Uuid,
        update: InviteCodeUpdate,
    ) -> Result<InviteCodeEntity, AppError> {
        let mut codes = self.codes.write().await;
        if let Some(new_code) = &update.code {
            if codes
                .values()
                .any(|existing| existing.id != id && existing.code == *new_code)
            {
                return Err(AppError::Validation("Invite code already exists".into()));
            }
        }

        let code = codes
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Invite code not found".into()))?;
        if let Some(new_code) = update.code {
            code.code = new_code;
        }
        if update.max_uses.is_set() {
            code.max_uses = update.max_uses.value();
        }
        if update.starts_at.is_set() {
            code.starts_at = update.starts_at.value();
        }
        if update.expires_at.is_set() {
            code.expires_at = update.expires_at.value();
        }
        if let Some(active) = update.active {
            code.active = active;
        }
        if update.discount_percent.is_set() {
            code.discount_percent = update.discount_percent.value();
        }
        if update.discount_months.is_set() {
            code.discount_months = update.discount_months.value();
        }
        code.updated_at = Utc::now();
        Ok(code.clone())
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let mut codes = self.codes.write().await;
        codes
            .remove(&id)
            .map(|_| ())
            .ok_or_else(|| AppError::NotFound("Invite code not found".into()))
    }

    async fn redeem(
        &self,
        code: &str,
        user_id: Uuid,
    ) -> Result<Option<InviteCodeEntity>, AppError> {
        let normalized = normalize_invite_code(code)?;
        let mut gate_accounts = self.gate_accounts.write().await;
        if !matches!(gate_accounts.get(&user_id), Some(None)) {
            return Ok(None);
        }
        let mut codes = self.codes.write().await;
        let now = Utc::now();
        let found = codes
            .values_mut()
            .find(|candidate| candidate.code == normalized && candidate.is_available_at(now));

        if let Some(candidate) = found {
            candidate.uses_count += 1;
            candidate.updated_at = now;
            self.redemptions
                .write()
                .await
                .push((candidate.id, user_id, now));
            gate_accounts.insert(user_id, Some(now));
            return Ok(Some(candidate.clone()));
        }
        Ok(None)
    }

    async fn mark_user_pending(&self, user_id: Uuid) -> Result<(), AppError> {
        let mut accounts = self.gate_accounts.write().await;
        accounts.entry(user_id).or_insert(None);
        Ok(())
    }

    async fn activate_user(&self, user_id: Uuid) -> Result<(), AppError> {
        let mut accounts = self.gate_accounts.write().await;
        accounts.insert(user_id, Some(Utc::now()));
        Ok(())
    }

    async fn is_user_pending(&self, user_id: Uuid) -> Result<bool, AppError> {
        let accounts = self.gate_accounts.read().await;
        Ok(matches!(accounts.get(&user_id), Some(None)))
    }

    async fn list_user_codes(&self, user_id: Uuid) -> Result<Vec<InviteCodeEntity>, AppError> {
        let codes = self.codes.read().await;
        let mut rows: Vec<_> = codes
            .values()
            .filter(|code| code.owner_user_id == Some(user_id))
            .cloned()
            .collect();
        rows.sort_by_key(|b| std::cmp::Reverse(b.created_at));
        Ok(rows)
    }

    async fn deactivate_stale_user_codes(
        &self,
        user_id: Uuid,
        current_batch_key: &str,
    ) -> Result<(), AppError> {
        let mut codes = self.codes.write().await;
        for code in codes.values_mut() {
            if code.owner_user_id == Some(user_id)
                && code.active
                && code.uses_count == 0
                && code.batch_key.as_deref() != Some(current_batch_key)
            {
                code.active = false;
                code.updated_at = Utc::now();
            }
        }
        Ok(())
    }

    async fn find_redeemed_discount(
        &self,
        user_id: Uuid,
    ) -> Result<Option<InviteDiscountGrant>, AppError> {
        let codes = self.codes.read().await;
        let redemptions = self.redemptions.read().await;
        Ok(redemptions
            .iter()
            .rev()
            .filter(|(_, redeemer, _)| *redeemer == user_id)
            .find_map(|(code_id, _, redeemed_at)| {
                let code = codes.get(code_id)?;
                Some(InviteDiscountGrant {
                    percent_off: code.discount_percent?,
                    duration_months: code.discount_months,
                    code: code.code.clone(),
                    redeemed_at: *redeemed_at,
                })
            }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_invite_codes() {
        assert_eq!(normalize_invite_code(" ab-c1 ").unwrap(), "AB-C1");
        assert!(normalize_invite_code("bad code").is_err());
    }

    #[tokio::test]
    async fn redeem_respects_fixed_use_limit() {
        let repo = InMemoryInviteCodeRepository::new();
        let code = InviteCodeEntity::new("LIMIT1".into(), None, None, Some(1), None, None, None);
        repo.create(code).await.unwrap();
        let first_user = Uuid::new_v4();
        let second_user = Uuid::new_v4();
        repo.mark_user_pending(first_user).await.unwrap();
        repo.mark_user_pending(second_user).await.unwrap();

        assert!(repo.redeem("limit1", first_user).await.unwrap().is_some());
        assert!(!repo.is_user_pending(first_user).await.unwrap());
        assert!(repo.redeem("limit1", second_user).await.unwrap().is_none());
        assert!(repo.is_user_pending(second_user).await.unwrap());
    }

    #[tokio::test]
    async fn pending_user_can_be_activated() {
        let repo = InMemoryInviteCodeRepository::new();
        let user_id = Uuid::new_v4();
        repo.mark_user_pending(user_id).await.unwrap();
        assert!(repo.is_user_pending(user_id).await.unwrap());
        repo.activate_user(user_id).await.unwrap();
        assert!(!repo.is_user_pending(user_id).await.unwrap());
    }
}
