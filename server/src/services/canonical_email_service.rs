//! Business boundary for canonical-email identity transitions.

use std::sync::Arc;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    normalize_email, validate_email_ascii_local, AdminCanonicalEmailUpdate,
    CanonicalEmailRepository, UserEntity,
};
use crate::utils::is_valid_email;

/// Validates requested semantics, then delegates all multi-row IO atomically.
#[derive(Clone)]
pub struct CanonicalEmailService {
    repository: Arc<dyn CanonicalEmailRepository>,
}

impl CanonicalEmailService {
    pub fn new(repository: Arc<dyn CanonicalEmailRepository>) -> Self {
        Self { repository }
    }

    /// Apply an admin profile update. A changed address starts unverified unless
    /// it already exists as a verified secondary or `email_verified` is explicit.
    pub async fn admin_update(
        &self,
        user_id: Uuid,
        name: Option<String>,
        email: Option<String>,
        email_verified: Option<bool>,
    ) -> Result<UserEntity, AppError> {
        let email = email.map(|raw| validate_and_normalize(&raw)).transpose()?;
        self.repository
            .admin_update(AdminCanonicalEmailUpdate {
                user_id,
                name,
                email,
                email_verified,
            })
            .await
    }

    /// Promote an already-verified secondary email to canonical primary.
    pub async fn promote(&self, user_id: Uuid, email_id: Uuid) -> Result<UserEntity, AppError> {
        self.repository.promote(user_id, email_id).await
    }
}

fn validate_and_normalize(raw: &str) -> Result<String, AppError> {
    if !is_valid_email(raw) {
        return Err(AppError::Validation("Invalid email format".into()));
    }
    validate_email_ascii_local(raw)?;
    Ok(normalize_email(raw))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validates_before_normalizing_admin_email() {
        assert_eq!(
            validate_and_normalize("Admin@Example.COM").unwrap(),
            "admin@example.com"
        );
        assert!(validate_and_normalize("not-an-email").is_err());
        assert!(validate_and_normalize("\u{0430}dmin@example.com").is_err());
    }
}
