//! Invite-code gate and user-code business rules.

use chrono::{DateTime, Duration, Utc};
use std::sync::Arc;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    generate_invite_code, normalize_invite_code, InviteCodeEntity, InviteCodeRepository,
    InviteCodeUpdate, InviteDiscountGrant, NullableUpdate,
};
use crate::services::SettingsService;

const ENABLED_KEY: &str = "invite_codes_enabled";
const USERS_CAN_ISSUE_KEY: &str = "invite_codes_users_can_issue";
const PER_USER_KEY: &str = "invite_codes_per_user";
const RESET_DAYS_KEY: &str = "invite_codes_reset_interval_days";

#[derive(Debug, Clone, Copy)]
pub struct InviteCodeConfig {
    pub enabled: bool,
    pub users_can_issue: bool,
    pub per_user: u32,
    pub reset_interval_days: u32,
}

/// Discount settings supplied together when creating an admin invite.
pub struct InviteCodeDiscount {
    pub percent: Option<i32>,
    pub months: Option<i32>,
}

/// Service for invite-code gate checks, redemption, and user code issuance.
#[derive(Clone)]
pub struct InviteCodeService {
    repo: Arc<dyn InviteCodeRepository>,
    settings: Arc<SettingsService>,
}

impl InviteCodeService {
    pub fn new(repo: Arc<dyn InviteCodeRepository>, settings: Arc<SettingsService>) -> Self {
        Self { repo, settings }
    }

    pub async fn config(&self) -> Result<InviteCodeConfig, AppError> {
        Ok(InviteCodeConfig {
            enabled: self.settings.get_bool(ENABLED_KEY).await?.unwrap_or(false),
            users_can_issue: self
                .settings
                .get_bool(USERS_CAN_ISSUE_KEY)
                .await?
                .unwrap_or(false),
            per_user: self
                .settings
                .get_u32(PER_USER_KEY)
                .await?
                .unwrap_or(0)
                .min(100),
            reset_interval_days: self
                .settings
                .get_u32(RESET_DAYS_KEY)
                .await?
                .unwrap_or(30)
                .min(3650),
        })
    }

    pub async fn gate_enabled(&self) -> Result<bool, AppError> {
        Ok(self.config().await?.enabled)
    }

    pub async fn mark_pending(&self, user_id: Uuid) -> Result<(), AppError> {
        self.repo.mark_user_pending(user_id).await
    }

    pub async fn activate_user(&self, user_id: Uuid) -> Result<(), AppError> {
        self.repo.activate_user(user_id).await
    }

    pub async fn is_user_blocked(&self, user_id: Uuid) -> Result<bool, AppError> {
        Ok(self.gate_enabled().await? && self.repo.is_user_pending(user_id).await?)
    }

    pub async fn is_user_pending(&self, user_id: Uuid) -> Result<bool, AppError> {
        self.repo.is_user_pending(user_id).await
    }

    pub async fn redeem_for_user(
        &self,
        code: &str,
        user_id: Uuid,
    ) -> Result<InviteCodeEntity, AppError> {
        let redeemed = self
            .repo
            .redeem(code, user_id)
            .await?
            .ok_or_else(|| AppError::Forbidden("Invalid or unavailable invite code".into()))?;
        Ok(redeemed)
    }

    pub async fn create_admin_code(
        &self,
        requested_code: Option<&str>,
        created_by: Uuid,
        max_uses: Option<i32>,
        starts_at: Option<DateTime<Utc>>,
        expires_at: Option<DateTime<Utc>>,
        discount: InviteCodeDiscount,
    ) -> Result<InviteCodeEntity, AppError> {
        validate_code_window(starts_at, expires_at)?;
        if matches!(max_uses, Some(value) if value <= 0) {
            return Err(AppError::Validation(
                "maxUses must be greater than 0".into(),
            ));
        }
        validate_discount_percent(discount.percent)?;
        validate_discount_months(discount.months, discount.percent)?;

        let code = match requested_code
            .map(str::trim)
            .filter(|code| !code.is_empty())
        {
            Some(code) => normalize_invite_code(code)?,
            None => generate_invite_code(),
        };
        let mut entity = InviteCodeEntity::new(
            code,
            Some(created_by),
            None,
            max_uses,
            starts_at,
            expires_at,
            None,
        );
        entity.discount_percent = discount.percent;
        entity.discount_months = discount.months;
        self.repo.create(entity).await
    }

    pub async fn update_admin_code(
        &self,
        id: Uuid,
        mut update: InviteCodeUpdate,
    ) -> Result<InviteCodeEntity, AppError> {
        if let Some(code) = update.code.as_deref() {
            update.code = Some(normalize_invite_code(code)?);
        }
        if matches!(update.max_uses, NullableUpdate::Set(Some(value)) if value <= 0) {
            return Err(AppError::Validation(
                "maxUses must be greater than 0".into(),
            ));
        }
        if let NullableUpdate::Set(value) = update.discount_percent {
            validate_discount_percent(value)?;
        }

        let current = self
            .repo
            .find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound("Invite code not found".into()))?;
        validate_discount_months(
            update.discount_months.resolve(current.discount_months),
            update.discount_percent.resolve(current.discount_percent),
        )?;
        validate_code_window(
            update.starts_at.resolve(current.starts_at),
            update.expires_at.resolve(current.expires_at),
        )?;
        self.repo.update(id, update).await
    }

    pub async fn delete_admin_code(&self, id: Uuid) -> Result<(), AppError> {
        self.repo.delete(id).await
    }

    /// The subscription discount the user holds from redeeming a
    /// discount-carrying invite code, if any.
    pub async fn find_redeemed_discount(
        &self,
        user_id: Uuid,
    ) -> Result<Option<InviteDiscountGrant>, AppError> {
        self.repo.find_redeemed_discount(user_id).await
    }

    pub async fn list_admin(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<InviteCodeEntity>, AppError> {
        self.repo.list_admin(limit, offset).await
    }

    pub async fn list_or_create_user_codes(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<InviteCodeEntity>, AppError> {
        let config = self.config().await?;
        if !config.enabled || !config.users_can_issue || config.per_user == 0 {
            return Ok(Vec::new());
        }

        let batch_key = current_batch_key(config.reset_interval_days);
        self.repo
            .deactivate_stale_user_codes(user_id, &batch_key)
            .await?;

        let mut codes = self.repo.list_user_codes(user_id).await?;
        let active_current = codes
            .iter()
            .filter(|code| {
                code.active && code.uses_count == 0 && code.batch_key.as_deref() == Some(&batch_key)
            })
            .count() as u32;

        for _ in active_current..config.per_user {
            let code = InviteCodeEntity::new(
                generate_invite_code(),
                Some(user_id),
                Some(user_id),
                Some(1),
                None,
                user_code_expires_at(config.reset_interval_days),
                Some(batch_key.clone()),
            );
            codes.push(self.repo.create(code).await?);
        }

        codes.sort_by_key(|b| std::cmp::Reverse(b.created_at));
        Ok(codes)
    }
}

fn validate_discount_months(months: Option<i32>, percent: Option<i32>) -> Result<(), AppError> {
    if matches!(months, Some(value) if value <= 0 || percent.is_none()) {
        return Err(AppError::Validation(
            "discountMonths must be a positive integer and requires discountPercent".into(),
        ));
    }
    Ok(())
}

fn validate_discount_percent(value: Option<i32>) -> Result<(), AppError> {
    if matches!(value, Some(percent) if !(1..=100).contains(&percent)) {
        return Err(AppError::Validation(
            "discountPercent must be between 1 and 100".into(),
        ));
    }
    Ok(())
}

fn validate_code_window(
    starts_at: Option<DateTime<Utc>>,
    expires_at: Option<DateTime<Utc>>,
) -> Result<(), AppError> {
    if let (Some(starts), Some(expires)) = (starts_at, expires_at) {
        if expires <= starts {
            return Err(AppError::Validation(
                "expiresAt must be after startsAt".into(),
            ));
        }
    }
    Ok(())
}

fn current_batch_key(reset_interval_days: u32) -> String {
    if reset_interval_days == 0 {
        return "never".to_string();
    }
    let seconds = i64::from(reset_interval_days) * 86_400;
    let bucket = Utc::now().timestamp().div_euclid(seconds);
    format!("{reset_interval_days}d:{bucket}")
}

fn user_code_expires_at(reset_interval_days: u32) -> Option<DateTime<Utc>> {
    if reset_interval_days == 0 {
        None
    } else {
        Some(Utc::now() + Duration::days(i64::from(reset_interval_days)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::{
        InMemoryInviteCodeRepository, InMemorySystemSettingsRepository, SystemSettingsRepository,
    };

    #[tokio::test]
    async fn user_codes_are_one_time_when_enabled() {
        let settings = Arc::new(InMemorySystemSettingsRepository::with_defaults());
        settings
            .upsert(crate::repositories::SystemSetting::new(
                ENABLED_KEY.into(),
                "true".into(),
                "auth.invite_codes".into(),
            ))
            .await
            .unwrap();
        settings
            .upsert(crate::repositories::SystemSetting::new(
                USERS_CAN_ISSUE_KEY.into(),
                "true".into(),
                "auth.invite_codes".into(),
            ))
            .await
            .unwrap();
        settings
            .upsert(crate::repositories::SystemSetting::new(
                PER_USER_KEY.into(),
                "2".into(),
                "auth.invite_codes".into(),
            ))
            .await
            .unwrap();

        let service = InviteCodeService::new(
            Arc::new(InMemoryInviteCodeRepository::new()),
            Arc::new(SettingsService::new(settings)),
        );

        let codes = service
            .list_or_create_user_codes(Uuid::new_v4())
            .await
            .unwrap();
        assert_eq!(codes.len(), 2);
        assert!(codes.iter().all(|code| code.max_uses == Some(1)));
    }
}
