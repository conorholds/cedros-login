//! Atomic persistence boundary for the denormalized canonical-email identity.

use async_trait::async_trait;
use chrono::Utc;
use std::sync::Arc;
use uuid::Uuid;

use crate::errors::AppError;

use super::{
    normalize_email, InMemoryUserEmailRepository, InMemoryUserRepository, UserEmailEntity,
    UserEntity,
};

/// Admin-controlled fields applied with a canonical-email transition.
#[derive(Debug, Clone, Default)]
pub struct AdminCanonicalEmailUpdate {
    /// Target user.
    pub user_id: Uuid,
    /// Replacement display name; omitted means unchanged.
    pub name: Option<String>,
    /// Validated, normalized canonical address; omitted means unchanged.
    pub email: Option<String>,
    /// Explicit canonical verification state; omitted preserves target-row state.
    pub email_verified: Option<bool>,
}

/// Owns atomic IO for `users.email` and the matching primary `user_emails` row.
#[async_trait]
pub trait CanonicalEmailRepository: Send + Sync {
    /// Apply an admin profile update. If either email field is present, existing
    /// canonical state must be unambiguous and all email writes are atomic.
    /// Returns the committed user or a validation, uniqueness, not-found, data
    /// integrity, or storage error without committing a partial transition.
    async fn admin_update(&self, update: AdminCanonicalEmailUpdate)
        -> Result<UserEntity, AppError>;

    /// Promote a verified account email and update the denormalized user fields.
    /// Returns the committed user; unverified, missing, or inconsistent targets fail.
    async fn promote(&self, user_id: Uuid, email_id: Uuid) -> Result<UserEntity, AppError>;
}

/// In-memory implementation. It acquires every affected lock before mutating,
/// so readers cannot observe a completed transition with split canonical state.
pub struct InMemoryCanonicalEmailRepository {
    users: Arc<InMemoryUserRepository>,
    emails: Arc<InMemoryUserEmailRepository>,
}

impl InMemoryCanonicalEmailRepository {
    pub fn new(
        users: Arc<InMemoryUserRepository>,
        emails: Arc<InMemoryUserEmailRepository>,
    ) -> Self {
        Self { users, emails }
    }
}

#[async_trait]
impl CanonicalEmailRepository for InMemoryCanonicalEmailRepository {
    async fn admin_update(
        &self,
        update: AdminCanonicalEmailUpdate,
    ) -> Result<UserEntity, AppError> {
        let mut users = self.users.users.write().await;
        let mut email_index = self.users.email_index.write().await;
        let mut emails = self.emails.emails.write().await;
        let user = users
            .get(&update.user_id)
            .cloned()
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        if update.email.is_none() && update.email_verified.is_none() {
            return update_name_only(user, update.name, &mut users);
        }
        let primary = checked_primary(&user, emails.values())?;
        let target_email = update
            .email
            .clone()
            .or_else(|| user.email.clone())
            .ok_or_else(|| AppError::Validation("User has no canonical email".into()))?;
        ensure_email_available(&users, &emails, user.id, &target_email)?;

        let target_ids: Vec<_> = emails
            .values()
            .filter(|row| row.user_id == user.id && row.email == target_email)
            .map(|row| row.id)
            .collect();
        if target_ids.len() > 1 {
            return Err(integrity_error(user.id, "duplicate target email rows"));
        }
        let target_id = target_ids.first().copied();
        let target_verified = target_id
            .and_then(|id| emails.get(&id))
            .map(UserEmailEntity::is_verified)
            .unwrap_or(false);
        let verified = update.email_verified.unwrap_or(target_verified);
        let target_id = target_id.unwrap_or_else(Uuid::new_v4);
        apply_email_rows(
            &mut emails,
            &user,
            primary,
            target_id,
            &target_email,
            verified,
        );

        let mut updated = user;
        if let Some(name) = update.name {
            updated.name = Some(name);
        }
        replace_email_index(&mut email_index, &updated, &target_email);
        updated.email = Some(target_email);
        updated.email_verified = verified;
        updated.updated_at = Utc::now();
        users.insert(updated.id, updated.clone());
        Ok(updated)
    }

    async fn promote(&self, user_id: Uuid, email_id: Uuid) -> Result<UserEntity, AppError> {
        let mut users = self.users.users.write().await;
        let mut email_index = self.users.email_index.write().await;
        let mut emails = self.emails.emails.write().await;
        let user = users
            .get(&user_id)
            .cloned()
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;
        let primary = checked_primary(&user, emails.values())?;
        let target = emails
            .get(&email_id)
            .filter(|row| row.user_id == user_id)
            .cloned()
            .ok_or_else(|| AppError::NotFound("Email not found".into()))?;
        if emails
            .values()
            .filter(|row| row.user_id == user_id && row.email == target.email)
            .count()
            > 1
        {
            return Err(integrity_error(user.id, "duplicate target email rows"));
        }
        if !target.is_verified() {
            return Err(AppError::Validation(
                "Primary email must be verified".into(),
            ));
        }
        apply_email_rows(&mut emails, &user, primary, target.id, &target.email, true);
        let mut updated = user;
        replace_email_index(&mut email_index, &updated, &target.email);
        updated.email = Some(target.email);
        updated.email_verified = true;
        updated.updated_at = Utc::now();
        users.insert(user_id, updated.clone());
        Ok(updated)
    }
}

fn update_name_only(
    mut user: UserEntity,
    name: Option<String>,
    users: &mut std::collections::HashMap<Uuid, UserEntity>,
) -> Result<UserEntity, AppError> {
    if let Some(name) = name {
        user.name = Some(name);
        user.updated_at = Utc::now();
        users.insert(user.id, user.clone());
    }
    Ok(user)
}

fn checked_primary<'a>(
    user: &UserEntity,
    rows: impl Iterator<Item = &'a UserEmailEntity>,
) -> Result<Option<UserEmailEntity>, AppError> {
    let primaries: Vec<_> = rows
        .filter(|row| row.user_id == user.id && row.is_primary)
        .cloned()
        .collect();
    match (user.email.as_deref(), primaries.as_slice()) {
        (None, []) => Ok(None),
        (Some(email), [row]) if row.email == email && row.is_verified() == user.email_verified => {
            Ok(Some(row.clone()))
        }
        (Some(_), []) => Err(integrity_error(user.id, "missing primary email row")),
        (_, [row]) if user.email.as_deref() != Some(row.email.as_str()) => Err(integrity_error(
            user.id,
            "primary email does not match user",
        )),
        (Some(_), [..]) if primaries.len() > 1 => {
            Err(integrity_error(user.id, "multiple primary email rows"))
        }
        (Some(_), [_]) => Err(integrity_error(
            user.id,
            "primary verification does not match user",
        )),
        (None, [_]) | (None, [_, ..]) => Err(integrity_error(
            user.id,
            "primary exists without user email",
        )),
        _ => Err(integrity_error(user.id, "ambiguous canonical email state")),
    }
}

fn ensure_email_available(
    users: &std::collections::HashMap<Uuid, UserEntity>,
    emails: &std::collections::HashMap<Uuid, UserEmailEntity>,
    user_id: Uuid,
    target: &str,
) -> Result<(), AppError> {
    let owned_by_other_user = users.values().any(|user| {
        user.id != user_id && user.email.as_deref().map(normalize_email).as_deref() == Some(target)
    }) || emails
        .values()
        .any(|row| row.user_id != user_id && row.email == target);
    if owned_by_other_user {
        return Err(AppError::EmailExists);
    }
    Ok(())
}

fn apply_email_rows(
    emails: &mut std::collections::HashMap<Uuid, UserEmailEntity>,
    user: &UserEntity,
    old_primary: Option<UserEmailEntity>,
    target_id: Uuid,
    target_email: &str,
    verified: bool,
) {
    for row in emails.values_mut().filter(|row| row.user_id == user.id) {
        row.is_primary = row.id == target_id;
    }
    let created_at = emails
        .get(&target_id)
        .map(|row| row.created_at)
        .unwrap_or_else(Utc::now);
    let mut target = UserEmailEntity {
        id: target_id,
        user_id: user.id,
        email: target_email.to_string(),
        verified_at: verified.then_some(Utc::now()),
        is_primary: true,
        created_at,
    };
    if verified {
        target.verified_at = emails
            .get(&target_id)
            .and_then(|row| row.verified_at)
            .or(target.verified_at);
    }
    emails.insert(target_id, target);
    if let Some(mut old) = old_primary.filter(|row| row.id != target_id) {
        old.is_primary = false;
        emails.insert(old.id, old);
    }
}

fn replace_email_index(
    index: &mut std::collections::HashMap<String, Uuid>,
    user: &UserEntity,
    target: &str,
) {
    if let Some(old) = user.email.as_deref() {
        index.remove(&normalize_email(old));
    }
    index.insert(target.to_string(), user.id);
}

pub(crate) fn integrity_error(user_id: Uuid, reason: &'static str) -> AppError {
    tracing::error!(%user_id, reason, "Canonical email invariant violation");
    AppError::ServiceUnavailable("Canonical email state is inconsistent; repair is required".into())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::{UserEmailRepository, UserRepository};

    struct Fixture {
        users: Arc<InMemoryUserRepository>,
        emails: Arc<InMemoryUserEmailRepository>,
        repository: InMemoryCanonicalEmailRepository,
        user: UserEntity,
        primary: UserEmailEntity,
    }

    async fn fixture(email: &str, verified: bool) -> Fixture {
        let users = Arc::new(InMemoryUserRepository::new());
        let emails = Arc::new(InMemoryUserEmailRepository::new());
        let mut user = UserEntity::new_email_user(email.into(), "hash".into(), None);
        user.email_verified = verified;
        let user = users.create(user).await.unwrap();
        let primary = emails
            .create(UserEmailEntity::new(user.id, email.into(), verified, true))
            .await
            .unwrap();
        let repository = InMemoryCanonicalEmailRepository::new(users.clone(), emails.clone());
        Fixture {
            users,
            emails,
            repository,
            user,
            primary,
        }
    }

    #[tokio::test]
    async fn admin_change_preserves_verified_old_address_as_secondary() {
        let f = fixture("old@example.com", true).await;
        let updated = f
            .repository
            .admin_update(AdminCanonicalEmailUpdate {
                user_id: f.user.id,
                email: Some("new@example.com".into()),
                ..Default::default()
            })
            .await
            .unwrap();
        assert_eq!(updated.email.as_deref(), Some("new@example.com"));
        assert!(!updated.email_verified);
        let rows = f.emails.list_by_user(f.user.id).await.unwrap();
        assert!(rows
            .iter()
            .any(|row| { row.id == f.primary.id && row.is_verified() && !row.is_primary }));
        assert!(rows
            .iter()
            .any(|row| { row.email == "new@example.com" && !row.is_verified() && row.is_primary }));
    }

    #[tokio::test]
    async fn verification_only_updates_user_and_primary() {
        let f = fixture("verify@example.com", false).await;
        let updated = f
            .repository
            .admin_update(AdminCanonicalEmailUpdate {
                user_id: f.user.id,
                email_verified: Some(true),
                ..Default::default()
            })
            .await
            .unwrap();
        assert!(updated.email_verified);
        let rows = f.emails.list_by_user(f.user.id).await.unwrap();
        assert_eq!(rows.len(), 1);
        assert!(rows[0].is_primary && rows[0].is_verified());
    }

    #[tokio::test]
    async fn duplicate_rejection_leaves_original_state_unchanged() {
        let first = fixture("first@example.com", true).await;
        let mut other = UserEntity::new_email_user("taken@example.com".into(), "hash".into(), None);
        other.email_verified = true;
        let other = first.users.create(other).await.unwrap();
        first
            .emails
            .create(UserEmailEntity::new(
                other.id,
                "taken@example.com".into(),
                true,
                true,
            ))
            .await
            .unwrap();

        let result = first
            .repository
            .admin_update(AdminCanonicalEmailUpdate {
                user_id: first.user.id,
                email: Some("taken@example.com".into()),
                ..Default::default()
            })
            .await;
        assert!(matches!(result, Err(AppError::EmailExists)));
        let stored = first
            .users
            .find_by_id(first.user.id)
            .await
            .unwrap()
            .unwrap();
        assert_eq!(stored.email.as_deref(), Some("first@example.com"));
        assert!(
            first
                .emails
                .find_by_id(first.primary.id)
                .await
                .unwrap()
                .unwrap()
                .is_primary
        );
    }

    #[tokio::test]
    async fn missing_and_mismatched_primary_are_diagnosed_without_repair() {
        let users = Arc::new(InMemoryUserRepository::new());
        let emails = Arc::new(InMemoryUserEmailRepository::new());
        let user = users
            .create(UserEntity::new_email_user(
                "legacy@example.com".into(),
                "hash".into(),
                None,
            ))
            .await
            .unwrap();
        let repository = InMemoryCanonicalEmailRepository::new(users, emails.clone());
        let missing = repository
            .admin_update(AdminCanonicalEmailUpdate {
                user_id: user.id,
                email_verified: Some(true),
                ..Default::default()
            })
            .await;
        assert!(matches!(missing, Err(AppError::ServiceUnavailable(_))));

        emails
            .create(UserEmailEntity::new(
                user.id,
                "different@example.com".into(),
                false,
                true,
            ))
            .await
            .unwrap();
        let mismatch = repository.promote(user.id, Uuid::new_v4()).await;
        assert!(matches!(mismatch, Err(AppError::ServiceUnavailable(_))));
    }

    #[tokio::test]
    async fn duplicate_same_user_target_rows_are_diagnosed_without_rewrite() {
        let f = fixture("duplicate-target@example.com", true).await;
        let duplicate = UserEmailEntity::new(
            f.user.id,
            "duplicate-target@example.com".into(),
            true,
            false,
        );
        f.emails
            .emails
            .write()
            .await
            .insert(duplicate.id, duplicate);
        let result = f
            .repository
            .admin_update(AdminCanonicalEmailUpdate {
                user_id: f.user.id,
                email_verified: Some(false),
                ..Default::default()
            })
            .await;
        assert!(matches!(result, Err(AppError::ServiceUnavailable(_))));
        let rows = f.emails.list_by_user(f.user.id).await.unwrap();
        assert_eq!(rows.iter().filter(|row| row.is_primary).count(), 1);
        assert!(rows.iter().all(UserEmailEntity::is_verified));
    }

    #[tokio::test]
    async fn concurrent_promotions_leave_exactly_one_matching_primary() {
        let f = fixture("start@example.com", true).await;
        let one = f
            .emails
            .create(UserEmailEntity::new(
                f.user.id,
                "one@example.com".into(),
                true,
                false,
            ))
            .await
            .unwrap();
        let two = f
            .emails
            .create(UserEmailEntity::new(
                f.user.id,
                "two@example.com".into(),
                true,
                false,
            ))
            .await
            .unwrap();
        let repository = Arc::new(f.repository);
        let (a, b) = tokio::join!(
            repository.promote(f.user.id, one.id),
            repository.promote(f.user.id, two.id)
        );
        assert!(a.is_ok() && b.is_ok());
        let user = f.users.find_by_id(f.user.id).await.unwrap().unwrap();
        let rows = f.emails.list_by_user(f.user.id).await.unwrap();
        let primaries: Vec<_> = rows.iter().filter(|row| row.is_primary).collect();
        assert_eq!(primaries.len(), 1);
        assert_eq!(user.email.as_deref(), Some(primaries[0].email.as_str()));
        assert_eq!(user.email_verified, primaries[0].is_verified());
    }
}
