use chrono::{DateTime, Utc};
use uuid::Uuid;

use super::row::UserRow;
use super::PostgresUserRepository;
use crate::errors::AppError;
use crate::repositories::{TopReferrerRow, UserEntity};

impl PostgresUserRepository {
    pub(super) async fn find_by_referral_code_query(
        &self,
        code: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by
            FROM users WHERE referral_code = $1
            "#,
        )
        .bind(code)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row
            .map(Into::into)
            .filter(|user: &UserEntity| !user.is_deleted()))
    }

    pub(super) async fn count_referrals_query(&self, user_id: Uuid) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE referred_by = $1")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    pub(super) async fn count_referred_query(&self) -> Result<u64, AppError> {
        let count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE referred_by IS NOT NULL")
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;
        Ok(count.max(0) as u64)
    }

    pub(super) async fn count_referred_since_query(
        &self,
        since: DateTime<Utc>,
    ) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM users WHERE referred_by IS NOT NULL AND created_at >= $1",
        )
        .bind(since)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(count.max(0) as u64)
    }

    pub(super) async fn top_referrers_query(
        &self,
        limit: u32,
    ) -> Result<Vec<TopReferrerRow>, AppError> {
        #[derive(sqlx::FromRow)]
        struct TopReferrerSqlRow {
            id: Uuid,
            email: Option<String>,
            name: Option<String>,
            referral_code: String,
            referral_count: i64,
        }

        let rows: Vec<TopReferrerSqlRow> = sqlx::query_as(
            r#"
            SELECT u.id, u.email, u.name, u.referral_code, COUNT(r.id) AS referral_count
            FROM users u
            JOIN users r ON r.referred_by = u.id
            GROUP BY u.id, u.email, u.name, u.referral_code
            ORDER BY referral_count DESC
            LIMIT $1
            "#,
        )
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows
            .into_iter()
            .map(|r| TopReferrerRow {
                user_id: r.id,
                email: r.email,
                name: r.name,
                referral_code: r.referral_code,
                referral_count: r.referral_count.max(0) as u64,
            })
            .collect())
    }

    pub(super) async fn regenerate_referral_code_query(
        &self,
        id: Uuid,
    ) -> Result<String, AppError> {
        // Retry loop for unique constraint violations on the new code.
        for _ in 0..5 {
            let new_code = crate::repositories::generate_referral_code();
            let result = sqlx::query(
                "UPDATE users SET referral_code = $2, updated_at = NOW() WHERE id = $1",
            )
            .bind(id)
            .bind(&new_code)
            .execute(&self.pool)
            .await;

            match result {
                Ok(r) => {
                    if r.rows_affected() == 0 {
                        return Err(AppError::NotFound("User not found".into()));
                    }
                    return Ok(new_code);
                }
                Err(e) => {
                    let err_str = e.to_string();
                    if err_str.contains("unique") || err_str.contains("duplicate") {
                        continue;
                    }
                    return Err(AppError::Internal(e.into()));
                }
            }
        }

        Err(AppError::Internal(anyhow::anyhow!(
            "Failed to generate unique referral code after retries"
        )))
    }

    pub(super) async fn set_referral_code_query(
        &self,
        id: Uuid,
        code: &str,
    ) -> Result<(), AppError> {
        // Attempt to set the new code. Unique constraint catches duplicates.
        let result =
            sqlx::query("UPDATE users SET referral_code = $2, updated_at = NOW() WHERE id = $1")
                .bind(id)
                .bind(code)
                .execute(&self.pool)
                .await;

        match result {
            Ok(r) => {
                if r.rows_affected() == 0 {
                    return Err(AppError::NotFound("User not found".into()));
                }
            }
            Err(e) => {
                let err_str = e.to_string();
                if err_str.contains("unique") || err_str.contains("duplicate") {
                    return Err(AppError::Validation(
                        "Referral code is already taken".into(),
                    ));
                }
                return Err(AppError::Internal(e.into()));
            }
        }

        Ok(())
    }

    pub(super) async fn find_referred_by_query(
        &self,
        referrer_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<UserEntity>, AppError> {
        const MAX_PAGE_SIZE: u32 = 100;
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
            WHERE referred_by = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(referrer_id)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    pub(super) async fn count_referred_by_query(&self, referrer_id: Uuid) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE referred_by = $1")
            .bind(referrer_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(count.max(0) as u64)
    }

    pub(super) async fn count_non_admin_created_since_query(
        &self,
        since: DateTime<Utc>,
    ) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM users WHERE NOT is_system_admin AND created_at >= $1",
        )
        .bind(since)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(count.max(0) as u64)
    }

    pub(super) async fn initialize_signup_limit_usage_query(
        &self,
        period: &str,
        period_start: DateTime<Utc>,
        period_end: DateTime<Utc>,
    ) -> Result<u64, AppError> {
        let used: i64 = sqlx::query_scalar(
            r#"
            INSERT INTO signup_limit_state (period, period_start, used)
            SELECT $1, $2, COUNT(*)
              FROM users
             WHERE NOT is_system_admin
               AND created_at >= $2
               AND created_at < $3
            ON CONFLICT (period, period_start)
            DO UPDATE SET used = signup_limit_state.used
            RETURNING used
            "#,
        )
        .bind(period)
        .bind(period_start)
        .bind(period_end)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(used.max(0) as u64)
    }
}
