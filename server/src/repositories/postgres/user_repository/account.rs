use std::collections::HashMap;
use uuid::Uuid;

use super::row::UserRow;
use super::PostgresUserRepository;
use crate::errors::AppError;
use crate::repositories::{normalize_email, UserEntity};

impl PostgresUserRepository {
    pub(super) async fn email_exists_query(&self, email: &str) -> Result<bool, AppError> {
        // Normalize email with NFKC + lowercase before querying
        // Use direct equality (not LOWER()) since normalize_email() already lowercases
        // and emails are stored normalized. This allows index usage on the email column.
        let email_normalized = normalize_email(email);

        let exists: bool =
            sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)")
                .bind(&email_normalized)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(exists)
    }

    pub(super) async fn wallet_exists_query(&self, wallet: &str) -> Result<bool, AppError> {
        let exists: bool =
            sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE wallet_address = $1)")
                .bind(wallet)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(exists)
    }

    pub(super) async fn set_email_verified_query(
        &self,
        id: Uuid,
        verified: bool,
    ) -> Result<(), AppError> {
        let result =
            sqlx::query("UPDATE users SET email_verified = $2, updated_at = NOW() WHERE id = $1")
                .bind(id)
                .bind(verified)
                .execute(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    pub(super) async fn update_password_query(
        &self,
        id: Uuid,
        password_hash: &str,
    ) -> Result<(), AppError> {
        let result =
            sqlx::query("UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1")
                .bind(id)
                .bind(password_hash)
                .execute(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    pub(super) async fn list_all_query(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<UserEntity>, AppError> {
        // Cap page size to prevent DoS via large limit values
        const MAX_PAGE_SIZE: u32 = 100;
        // Cap offset to prevent wasted DB resources with absurd values
        const MAX_OFFSET: u32 = 1_000_000;

        let capped_limit = limit.min(MAX_PAGE_SIZE);
        let capped_offset = offset.min(MAX_OFFSET);

        let rows: Vec<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
        )
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    pub(super) async fn count_query(&self) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    pub(super) async fn set_system_admin_query(
        &self,
        id: Uuid,
        is_admin: bool,
    ) -> Result<(), AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        if !is_admin {
            super::guard_admin_removal(&mut tx, id).await?;
        }
        let result =
            sqlx::query("UPDATE users SET is_system_admin = $2, updated_at = NOW() WHERE id = $1")
                .bind(id)
                .bind(is_admin)
                .execute(&mut *tx)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    pub(super) async fn count_system_admins_query(&self) -> Result<u64, AppError> {
        let count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE is_system_admin = true")
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    pub(super) async fn delete_query(&self, id: Uuid) -> Result<(), AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        super::guard_admin_removal(&mut tx, id).await?;
        let result = sqlx::query("DELETE FROM users WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    pub(super) async fn anonymize_for_deletion_query(
        &self,
        id: Uuid,
        replacement_referral_code: &str,
    ) -> Result<UserEntity, AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        super::guard_admin_removal(&mut tx, id).await?;
        let empty_methods: Vec<String> = Vec::new();
        let row: UserRow = sqlx::query_as(
            r#"
            UPDATE users SET
                email = NULL,
                email_verified = false,
                password_hash = NULL,
                name = 'Deleted Account',
                username = NULL,
                picture = NULL,
                wallet_address = NULL,
                google_id = NULL,
                apple_id = NULL,
                auth_methods = $2,
                is_system_admin = false,
                updated_at = NOW(),
                last_login_at = NULL,
                welcome_completed_at = NULL,
                referral_code = $3,
                referred_by = NULL
            WHERE id = $1
            RETURNING id, email, email_verified, password_hash, name, username, picture,
                      wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                      created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by
            "#,
        )
        .bind(id)
        .bind(&empty_methods)
        .bind(replacement_referral_code)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(row.into())
    }

    pub(super) async fn count_by_auth_methods_query(
        &self,
    ) -> Result<HashMap<String, u64>, AppError> {
        // Use UNNEST to expand the auth_methods array and count occurrences
        let rows: Vec<(String, i64)> = sqlx::query_as(
            r#"
            SELECT method, COUNT(*) as count
            FROM users, UNNEST(auth_methods) AS method
            GROUP BY method
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let mut counts = HashMap::new();
        for (method, count) in rows {
            counts.insert(method, count.max(0) as u64);
        }

        Ok(counts)
    }

    pub(super) async fn update_last_login_query(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query("UPDATE users SET last_login_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    pub(super) async fn set_welcome_completed_query(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE users SET welcome_completed_at = NOW(), updated_at = NOW() WHERE id = $1",
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    pub(super) async fn username_exists_query(&self, username: &str) -> Result<bool, AppError> {
        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(username) = LOWER($1))",
        )
        .bind(username)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(exists)
    }

    pub(super) async fn set_username_query(
        &self,
        id: Uuid,
        username: &str,
    ) -> Result<(), AppError> {
        let result =
            sqlx::query("UPDATE users SET username = $2, updated_at = NOW() WHERE id = $1")
                .bind(id)
                .bind(username)
                .execute(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }
}
