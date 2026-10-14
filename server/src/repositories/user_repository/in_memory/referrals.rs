//! Referral lookup, mutation, and reporting operations.

use chrono::{DateTime, Utc};
use std::collections::HashMap;
use uuid::Uuid;

use super::InMemoryUserRepository;
use crate::errors::AppError;
use crate::repositories::user_repository::{generate_referral_code, TopReferrerRow, UserEntity};

impl InMemoryUserRepository {
    pub(super) async fn find_by_referral_code_impl(
        &self,
        code: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        let referral_index = self.referral_code_index.read().await;
        let user_id = match referral_index.get(code).copied() {
            Some(id) => id,
            None => return Ok(None),
        };
        drop(referral_index);

        let users = self.users.read().await;
        Ok(users
            .get(&user_id)
            .filter(|user| !user.is_deleted())
            .cloned())
    }

    pub(super) async fn count_referrals_impl(&self, user_id: Uuid) -> Result<u64, AppError> {
        let users = self.users.read().await;
        Ok(users
            .values()
            .filter(|user| user.referred_by == Some(user_id))
            .count() as u64)
    }

    pub(super) async fn regenerate_referral_code_impl(&self, id: Uuid) -> Result<String, AppError> {
        let mut users = self.users.write().await;
        let user = users
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;
        let old_code = user.referral_code.clone();

        let mut referral_index = self.referral_code_index.write().await;
        referral_index.remove(&old_code);
        let new_code = generate_referral_code();
        referral_index.insert(new_code.clone(), id);
        user.referral_code = new_code.clone();
        user.updated_at = Utc::now();

        Ok(new_code)
    }

    pub(super) async fn set_referral_code_impl(
        &self,
        id: Uuid,
        code: &str,
    ) -> Result<(), AppError> {
        let referral_index = self.referral_code_index.read().await;
        if let Some(&existing_id) = referral_index.get(code) {
            if existing_id != id {
                return Err(AppError::Validation(
                    "Referral code is already taken".into(),
                ));
            }
            return Ok(());
        }
        drop(referral_index);

        let mut users = self.users.write().await;
        let user = users
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;
        let old_code = user.referral_code.clone();

        let mut referral_index = self.referral_code_index.write().await;
        referral_index.remove(&old_code);
        referral_index.insert(code.to_string(), id);
        user.referral_code = code.to_string();
        user.updated_at = Utc::now();

        Ok(())
    }

    pub(super) async fn count_referred_impl(&self) -> Result<u64, AppError> {
        let users = self.users.read().await;
        Ok(users
            .values()
            .filter(|user| user.referred_by.is_some())
            .count() as u64)
    }

    pub(super) async fn count_referred_since_impl(
        &self,
        since: DateTime<Utc>,
    ) -> Result<u64, AppError> {
        let users = self.users.read().await;
        Ok(users
            .values()
            .filter(|user| user.referred_by.is_some() && user.created_at >= since)
            .count() as u64)
    }

    pub(super) async fn top_referrers_impl(
        &self,
        limit: u32,
    ) -> Result<Vec<TopReferrerRow>, AppError> {
        let users = self.users.read().await;
        let mut counts: HashMap<Uuid, u64> = HashMap::new();
        for user in users.values() {
            if let Some(referrer_id) = user.referred_by {
                *counts.entry(referrer_id).or_insert(0) += 1;
            }
        }

        let mut rows: Vec<TopReferrerRow> = counts
            .into_iter()
            .filter_map(|(referrer_id, count)| {
                users.get(&referrer_id).map(|user| TopReferrerRow {
                    user_id: referrer_id,
                    email: user.email.clone(),
                    name: user.name.clone(),
                    referral_code: user.referral_code.clone(),
                    referral_count: count,
                })
            })
            .collect();

        rows.sort_by_key(|b| std::cmp::Reverse(b.referral_count));
        rows.truncate(limit as usize);
        Ok(rows)
    }

    pub(super) async fn find_referred_by_impl(
        &self,
        referrer_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<UserEntity>, AppError> {
        const MAX_PAGE_SIZE: u32 = 100;
        let capped_limit = limit.min(MAX_PAGE_SIZE);

        let users = self.users.read().await;
        let mut referred: Vec<_> = users
            .values()
            .filter(|user| user.referred_by == Some(referrer_id))
            .cloned()
            .collect();
        referred.sort_by_key(|b| std::cmp::Reverse(b.created_at));
        Ok(referred
            .into_iter()
            .skip(offset as usize)
            .take(capped_limit as usize)
            .collect())
    }

    pub(super) async fn count_referred_by_impl(&self, referrer_id: Uuid) -> Result<u64, AppError> {
        let users = self.users.read().await;
        Ok(users
            .values()
            .filter(|user| user.referred_by == Some(referrer_id))
            .count() as u64)
    }
}
