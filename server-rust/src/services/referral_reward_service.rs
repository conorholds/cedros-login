//! Referral reward issuance
//!
//! Issues rewards to referrers based on admin-configured settings:
//! - `referral_reward_lamports`: amount to reward (0 = disabled)
//! - `referral_reward_type`: "credits" or "direct_payout"
//! - `referral_reward_trigger`: "on_signup", "on_first_spend", or "on_every_spend"
//!
//! When `referral_reward_type` is "credits", credits are added to the referrer's
//! balance immediately. When "direct_payout", a pending ReferralPayoutEntity is
//! created for later batch processing by the admin.

use uuid::Uuid;

use crate::callback::{AuthCallback, ReferralRewardPayload};
use crate::errors::AppError;
use crate::repositories::{
    CreditRepository, CreditTransactionEntity, ReferralPayoutEntity, ReferralPayoutRepository,
    UserRepository,
};
use crate::services::SettingsService;

/// Map company_currency (the on-chain asset like "USDC") to the credit system's
/// internal currency (like "USD"). Must match `DepositCreditService::credit_currency()`.
fn to_credit_currency(company_currency: &str) -> &'static str {
    match company_currency.to_uppercase().as_str() {
        "SOL" => "SOL",
        "USDC" | "USDT" => "USD",
        "EURC" => "EUR",
        _ => "USD",
    }
}

/// Referral reward trigger mode
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RewardTrigger {
    OnSignup,
    OnFirstSpend,
    OnEverySpend,
}

impl RewardTrigger {
    pub fn from_str(s: &str) -> Self {
        match s {
            "on_first_spend" => Self::OnFirstSpend,
            "on_every_spend" => Self::OnEverySpend,
            _ => Self::OnSignup,
        }
    }
}

/// Read reward settings from the settings service.
/// Returns (amount, reward_type, trigger). Amount of 0 means disabled.
async fn read_reward_settings(settings: &SettingsService) -> (i64, String, RewardTrigger) {
    // Feature flag gate: if referrals disabled, all rewards are disabled
    let enabled = settings
        .get_bool("feature_referrals_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);
    if !enabled {
        return (0, "credits".to_string(), RewardTrigger::OnSignup);
    }

    let amount = settings
        .get("referral_reward_lamports")
        .await
        .ok()
        .flatten()
        .and_then(|v| v.parse::<i64>().ok())
        .unwrap_or(0);

    // Reject negative amounts (admin config error)
    if amount < 0 {
        tracing::error!(
            amount = amount,
            "Referral reward amount is negative; treating as disabled"
        );
        return (0, "credits".to_string(), RewardTrigger::OnSignup);
    }

    let reward_type = settings
        .get("referral_reward_type")
        .await
        .ok()
        .flatten()
        .unwrap_or_else(|| "credits".to_string());

    let trigger_str = settings
        .get("referral_reward_trigger")
        .await
        .ok()
        .flatten()
        .unwrap_or_else(|| "on_signup".to_string());

    (amount, reward_type, RewardTrigger::from_str(&trigger_str))
}

/// Check if adding `reward_amount` would exceed the per-referrer cap.
/// Returns true if the reward should be skipped (cap exceeded).
///
/// For direct_payout mode, sums from the payout repo (pending + completed).
/// For credits mode, sums from the credit repo (reference_type LIKE 'referral_%').
async fn is_capped(
    settings: &SettingsService,
    credit_repo: &dyn CreditRepository,
    payout_repo: &dyn ReferralPayoutRepository,
    referrer_id: Uuid,
    reward_amount: i64,
    reward_type: &str,
    company_currency: &str,
) -> bool {
    let max = settings
        .get("referral_reward_max_per_referrer")
        .await
        .ok()
        .flatten()
        .and_then(|v| v.parse::<i64>().ok())
        .unwrap_or(0);

    if max <= 0 {
        return false; // 0 = unlimited
    }

    let existing = if reward_type == "direct_payout" {
        payout_repo.sum_for_referrer(referrer_id).await.unwrap_or(0)
    } else {
        credit_repo
            .sum_adjustments_by_reference_type_prefix(referrer_id, company_currency, "referral_")
            .await
            .unwrap_or(0)
    };

    if existing + reward_amount > max {
        tracing::info!(
            referrer_id = %referrer_id,
            existing = existing,
            reward = reward_amount,
            max = max,
            "Referral reward capped — skipping"
        );
        return true;
    }

    false
}

/// Issue a referral reward to the referrer when a referred user signs up.
///
/// Checks `referral_reward_type`:
/// - "credits" → credits added to referrer's balance immediately
/// - "direct_payout" → pending ReferralPayoutEntity created for batch processing
///
/// `company_currency` is used as the currency for direct payouts.
/// `callback` is invoked after a reward is successfully issued; errors are logged as warnings.
pub async fn issue_signup_reward(
    user_repo: &dyn UserRepository,
    credit_repo: &dyn CreditRepository,
    payout_repo: &dyn ReferralPayoutRepository,
    settings: &SettingsService,
    callback: &dyn AuthCallback,
    referred_user_id: Uuid,
    referrer_id: Uuid,
    company_currency: &str,
) -> Result<(), AppError> {
    let (amount, reward_type, trigger) = read_reward_settings(settings).await;
    if amount <= 0 || trigger != RewardTrigger::OnSignup {
        return Ok(());
    }

    // Verify referrer still exists
    if user_repo.find_by_id(referrer_id).await?.is_none() {
        return Ok(());
    }

    // Cross-system dedup: if the credits path already rewarded this pair, don't payout too
    // (protects against admin switching reward_type between credits and direct_payout)
    let credit_idempotency_key = format!("referral_signup:{}:{}", referrer_id, referred_user_id);
    if credit_repo
        .find_transaction_by_idempotency_key(referrer_id, &credit_idempotency_key)
        .await?
        .is_some()
    {
        return Ok(());
    }
    if payout_repo
        .exists_for_pair(referrer_id, referred_user_id, "signup")
        .await?
    {
        return Ok(());
    }

    if reward_type == "direct_payout" {
        // Cap check
        if is_capped(
            settings,
            credit_repo,
            payout_repo,
            referrer_id,
            amount,
            &reward_type,
            company_currency,
        )
        .await
        {
            return Ok(());
        }

        let payout = ReferralPayoutEntity {
            id: Uuid::new_v4(),
            referrer_id,
            referred_user_id,
            trigger_type: "signup".to_string(),
            amount,
            currency: company_currency.to_string(),
            status: "pending".to_string(),
            tx_signature: None,
            error_message: None,
            spend_transaction_id: None,
            created_at: chrono::Utc::now(),
            completed_at: None,
        };
        payout_repo.create(payout).await?;
        tracing::info!(
            referrer_id = %referrer_id,
            referred_user_id = %referred_user_id,
            amount = amount,
            "Created pending referral signup payout"
        );
        let reward_payload = ReferralRewardPayload {
            referrer_id,
            referred_user_id,
            trigger_type: "signup".to_string(),
            amount,
            currency: company_currency.to_string(),
            reward_type: "direct_payout".to_string(),
        };
        if let Err(e) = callback.on_referral_reward(&reward_payload).await {
            tracing::warn!(error = %e, "Referral reward callback failed");
        }
        return Ok(());
    }

    // Default: credits path — use the credit system's internal currency
    let credit_currency = to_credit_currency(company_currency);

    // Cap check for credits mode
    if is_capped(
        settings,
        credit_repo,
        payout_repo,
        referrer_id,
        amount,
        &reward_type,
        credit_currency,
    )
    .await
    {
        return Ok(());
    }

    let idempotency_key = format!("referral_signup:{}:{}", referrer_id, referred_user_id);

    if credit_repo
        .find_transaction_by_idempotency_key(referrer_id, &idempotency_key)
        .await?
        .is_some()
    {
        return Ok(());
    }

    let mut tx = CreditTransactionEntity::new_adjustment(
        referrer_id,
        amount,
        credit_currency,
        referrer_id,
        &format!("Referral reward: user {} signed up", referred_user_id),
        Some("referral_signup"),
        Some(referred_user_id),
    );
    tx.idempotency_key = Some(idempotency_key);

    credit_repo
        .add_credit(referrer_id, amount, credit_currency, tx)
        .await?;

    tracing::info!(
        referrer_id = %referrer_id,
        referred_user_id = %referred_user_id,
        amount = amount,
        currency = %company_currency,
        "Issued referral signup credit reward"
    );

    let reward_payload = ReferralRewardPayload {
        referrer_id,
        referred_user_id,
        trigger_type: "signup".to_string(),
        amount,
        currency: credit_currency.to_string(),
        reward_type: "credits".to_string(),
    };
    if let Err(e) = callback.on_referral_reward(&reward_payload).await {
        tracing::warn!(error = %e, "Referral reward callback failed");
    }

    Ok(())
}

/// Issue a referral reward to the referrer on a spend event.
///
/// Checks `referral_reward_type`:
/// - "credits" → credits added immediately
/// - "direct_payout" → pending payout created
///
/// `company_currency` is used for direct payouts.
/// `callback` is invoked after a reward is successfully issued; errors are logged as warnings.
pub async fn issue_spend_reward(
    user_repo: &dyn UserRepository,
    credit_repo: &dyn CreditRepository,
    payout_repo: &dyn ReferralPayoutRepository,
    settings: &SettingsService,
    callback: &dyn AuthCallback,
    spending_user_id: Uuid,
    spend_transaction_id: Uuid,
    company_currency: &str,
) -> Result<(), AppError> {
    let (amount, reward_type, trigger) = read_reward_settings(settings).await;
    if amount <= 0 {
        return Ok(());
    }

    match trigger {
        RewardTrigger::OnSignup => return Ok(()),
        RewardTrigger::OnFirstSpend | RewardTrigger::OnEverySpend => {}
    }

    let spending_user = match user_repo.find_by_id(spending_user_id).await? {
        Some(u) => u,
        None => return Ok(()),
    };

    let referrer_id = match spending_user.referred_by {
        Some(id) => id,
        None => return Ok(()),
    };

    // Cross-system dedup: check BOTH credit repo and payout repo to prevent
    // double-payment if admin switches reward_type between credits and direct_payout.
    match trigger {
        RewardTrigger::OnFirstSpend => {
            let credit_key = format!("referral_first_spend:{}:{}", referrer_id, spending_user_id);
            if credit_repo
                .find_transaction_by_idempotency_key(referrer_id, &credit_key)
                .await?
                .is_some()
            {
                return Ok(());
            }
            if payout_repo
                .exists_for_pair(referrer_id, spending_user_id, "first_spend")
                .await?
            {
                return Ok(());
            }
        }
        RewardTrigger::OnEverySpend => {
            let credit_key = format!("referral_spend:{}:{}", referrer_id, spend_transaction_id);
            if credit_repo
                .find_transaction_by_idempotency_key(referrer_id, &credit_key)
                .await?
                .is_some()
            {
                return Ok(());
            }
            if payout_repo
                .exists_for_spend_transaction(referrer_id, spend_transaction_id)
                .await?
            {
                return Ok(());
            }
        }
        RewardTrigger::OnSignup => unreachable!(),
    }

    if reward_type == "direct_payout" {
        let trigger_type = match trigger {
            RewardTrigger::OnFirstSpend => "first_spend",
            RewardTrigger::OnEverySpend => "spend",
            RewardTrigger::OnSignup => unreachable!(),
        };

        // Cap check
        if is_capped(
            settings,
            credit_repo,
            payout_repo,
            referrer_id,
            amount,
            &reward_type,
            company_currency,
        )
        .await
        {
            return Ok(());
        }

        let payout = ReferralPayoutEntity {
            id: Uuid::new_v4(),
            referrer_id,
            referred_user_id: spending_user_id,
            trigger_type: trigger_type.to_string(),
            amount,
            currency: company_currency.to_string(),
            status: "pending".to_string(),
            tx_signature: None,
            error_message: None,
            spend_transaction_id: Some(spend_transaction_id),
            created_at: chrono::Utc::now(),
            completed_at: None,
        };
        payout_repo.create(payout).await?;
        tracing::info!(
            referrer_id = %referrer_id,
            spending_user_id = %spending_user_id,
            trigger = trigger_type,
            amount = amount,
            "Created pending referral spend payout"
        );
        let reward_payload = ReferralRewardPayload {
            referrer_id,
            referred_user_id: spending_user_id,
            trigger_type: trigger_type.to_string(),
            amount,
            currency: company_currency.to_string(),
            reward_type: "direct_payout".to_string(),
        };
        if let Err(e) = callback.on_referral_reward(&reward_payload).await {
            tracing::warn!(error = %e, "Referral reward callback failed");
        }
        return Ok(());
    }

    // Credits path — use the credit system's internal currency
    let credit_currency = to_credit_currency(company_currency);

    // Cap check for credits mode
    if is_capped(
        settings,
        credit_repo,
        payout_repo,
        referrer_id,
        amount,
        &reward_type,
        credit_currency,
    )
    .await
    {
        return Ok(());
    }

    let idempotency_key = match trigger {
        RewardTrigger::OnFirstSpend => {
            format!("referral_first_spend:{}:{}", referrer_id, spending_user_id)
        }
        RewardTrigger::OnEverySpend => {
            format!("referral_spend:{}:{}", referrer_id, spend_transaction_id)
        }
        RewardTrigger::OnSignup => unreachable!(),
    };

    if credit_repo
        .find_transaction_by_idempotency_key(referrer_id, &idempotency_key)
        .await?
        .is_some()
    {
        return Ok(());
    }

    if user_repo.find_by_id(referrer_id).await?.is_none() {
        return Ok(());
    }

    let ref_type = match trigger {
        RewardTrigger::OnFirstSpend => "referral_first_spend",
        RewardTrigger::OnEverySpend => "referral_spend",
        RewardTrigger::OnSignup => unreachable!(),
    };

    let mut tx = CreditTransactionEntity::new_adjustment(
        referrer_id,
        amount,
        credit_currency,
        referrer_id,
        &format!("Referral reward: user {} made a purchase", spending_user_id),
        Some(ref_type),
        Some(spending_user_id),
    );
    tx.idempotency_key = Some(idempotency_key);

    credit_repo
        .add_credit(referrer_id, amount, credit_currency, tx)
        .await?;

    tracing::info!(
        referrer_id = %referrer_id,
        spending_user_id = %spending_user_id,
        trigger = %ref_type,
        amount = amount,
        currency = %credit_currency,
        "Issued referral spend credit reward"
    );

    let trigger_type_str = match trigger {
        RewardTrigger::OnFirstSpend => "first_spend",
        RewardTrigger::OnEverySpend => "spend",
        RewardTrigger::OnSignup => unreachable!(),
    };
    let reward_payload = ReferralRewardPayload {
        referrer_id,
        referred_user_id: spending_user_id,
        trigger_type: trigger_type_str.to_string(),
        amount,
        currency: credit_currency.to_string(),
        reward_type: "credits".to_string(),
    };
    if let Err(e) = callback.on_referral_reward(&reward_payload).await {
        tracing::warn!(error = %e, "Referral reward callback failed");
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;
    use uuid::Uuid;

    use super::{issue_signup_reward, issue_spend_reward};
    use crate::callback::NoopCallback;
    use crate::repositories::{
        CreditRepository, InMemoryCreditRepository, InMemoryReferralPayoutRepository,
        InMemorySystemSettingsRepository, InMemoryUserRepository, ReferralPayoutRepository,
        SystemSetting, SystemSettingsRepository, UserEntity, UserRepository,
    };
    use crate::services::SettingsService;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /// Build a `SettingsService` seeded with the given referral settings.
    /// TTL=0 so every read goes to the repo without a stale cache hit.
    async fn make_settings(
        enabled: bool,
        amount: i64,
        trigger: &str,
        reward_type: &str,
    ) -> SettingsService {
        let repo = Arc::new(InMemorySystemSettingsRepository::new());
        let settings = vec![
            SystemSetting::new(
                "feature_referrals_enabled".to_string(),
                if enabled { "true" } else { "false" }.to_string(),
                "features".to_string(),
            ),
            SystemSetting::new(
                "referral_reward_lamports".to_string(),
                amount.to_string(),
                "referral".to_string(),
            ),
            SystemSetting::new(
                "referral_reward_trigger".to_string(),
                trigger.to_string(),
                "referral".to_string(),
            ),
            SystemSetting::new(
                "referral_reward_type".to_string(),
                reward_type.to_string(),
                "referral".to_string(),
            ),
        ];
        repo.upsert_many(settings).await.unwrap();
        SettingsService::with_ttl(repo, 0)
    }

    /// Like `make_settings` but also seeds a per-referrer cap.
    async fn make_settings_with_cap(
        enabled: bool,
        amount: i64,
        trigger: &str,
        reward_type: &str,
        cap: i64,
    ) -> SettingsService {
        let repo = Arc::new(InMemorySystemSettingsRepository::new());
        let mut settings = vec![
            SystemSetting::new(
                "feature_referrals_enabled".to_string(),
                if enabled { "true" } else { "false" }.to_string(),
                "features".to_string(),
            ),
            SystemSetting::new(
                "referral_reward_lamports".to_string(),
                amount.to_string(),
                "referral".to_string(),
            ),
            SystemSetting::new(
                "referral_reward_trigger".to_string(),
                trigger.to_string(),
                "referral".to_string(),
            ),
            SystemSetting::new(
                "referral_reward_type".to_string(),
                reward_type.to_string(),
                "referral".to_string(),
            ),
        ];
        if cap > 0 {
            settings.push(SystemSetting::new(
                "referral_reward_max_per_referrer".to_string(),
                cap.to_string(),
                "referral".to_string(),
            ));
        }
        repo.upsert_many(settings).await.unwrap();
        SettingsService::with_ttl(repo, 0)
    }

    /// Create and persist a referrer and a referred user. Returns `(referrer_id, referred_id)`.
    async fn create_referral_pair(user_repo: &InMemoryUserRepository) -> (Uuid, Uuid) {
        let referrer = UserEntity::new_email_user(
            "referrer@example.com".to_string(),
            "hash".to_string(),
            None,
        );
        let referrer_id = referrer.id;
        user_repo.create(referrer).await.unwrap();

        let mut referred = UserEntity::new_email_user(
            "referred@example.com".to_string(),
            "hash".to_string(),
            None,
        );
        referred.referred_by = Some(referrer_id);
        let referred_id = referred.id;
        user_repo.create(referred).await.unwrap();

        (referrer_id, referred_id)
    }

    // -------------------------------------------------------------------------
    // Signup reward — guard conditions
    // -------------------------------------------------------------------------

    #[tokio::test]
    async fn test_signup_reward_disabled_when_feature_off() {
        let settings = make_settings(false, 1000, "on_signup", "credits").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        issue_signup_reward(
            &user_repo,
            &credit_repo,
            &payout_repo,
            &settings,
            &NoopCallback,
            Uuid::new_v4(),
            Uuid::new_v4(),
            "SOL",
        )
        .await
        .unwrap();

        // Nothing should have been written.
        assert_eq!(payout_repo.count_pending().await.unwrap(), 0);
    }

    #[tokio::test]
    async fn test_signup_reward_disabled_when_amount_zero() {
        let settings = make_settings(true, 0, "on_signup", "credits").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        let referrer_id = Uuid::new_v4();
        issue_signup_reward(
            &user_repo,
            &credit_repo,
            &payout_repo,
            &settings,
            &NoopCallback,
            Uuid::new_v4(),
            referrer_id,
            "SOL",
        )
        .await
        .unwrap();

        assert_eq!(
            credit_repo.get_balance(referrer_id, "SOL").await.unwrap(),
            0
        );
        assert_eq!(payout_repo.count_pending().await.unwrap(), 0);
    }

    #[tokio::test]
    async fn test_signup_reward_negative_amount_treated_as_disabled() {
        let settings = make_settings(true, -100, "on_signup", "credits").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        let referrer_id = Uuid::new_v4();
        issue_signup_reward(
            &user_repo,
            &credit_repo,
            &payout_repo,
            &settings,
            &NoopCallback,
            Uuid::new_v4(),
            referrer_id,
            "SOL",
        )
        .await
        .unwrap();

        assert_eq!(
            credit_repo.get_balance(referrer_id, "SOL").await.unwrap(),
            0
        );
        assert_eq!(payout_repo.count_pending().await.unwrap(), 0);
    }

    // -------------------------------------------------------------------------
    // Signup reward — credits path
    // -------------------------------------------------------------------------

    #[tokio::test]
    async fn test_signup_reward_credits_mode() {
        let settings = make_settings(true, 1000, "on_signup", "credits").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        let (referrer_id, referred_id) = create_referral_pair(&user_repo).await;

        issue_signup_reward(
            &user_repo,
            &credit_repo,
            &payout_repo,
            &settings,
            &NoopCallback,
            referred_id,
            referrer_id,
            "SOL",
        )
        .await
        .unwrap();

        assert_eq!(
            credit_repo.get_balance(referrer_id, "SOL").await.unwrap(),
            1000
        );
        // No pending payout in credits mode.
        assert_eq!(payout_repo.count_pending().await.unwrap(), 0);
    }

    #[tokio::test]
    async fn test_signup_reward_credits_idempotent() {
        let settings = make_settings(true, 1000, "on_signup", "credits").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        let (referrer_id, referred_id) = create_referral_pair(&user_repo).await;

        for _ in 0..2 {
            issue_signup_reward(
                &user_repo,
                &credit_repo,
                &payout_repo,
                &settings,
                &NoopCallback,
                referred_id,
                referrer_id,
                "SOL",
            )
            .await
            .unwrap();
        }

        // Only one credit should have been issued despite two calls.
        assert_eq!(
            credit_repo.get_balance(referrer_id, "SOL").await.unwrap(),
            1000
        );
    }

    // -------------------------------------------------------------------------
    // Signup reward — direct_payout path
    // -------------------------------------------------------------------------

    #[tokio::test]
    async fn test_signup_reward_payout_mode() {
        let settings = make_settings(true, 2000, "on_signup", "direct_payout").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        let (referrer_id, referred_id) = create_referral_pair(&user_repo).await;

        issue_signup_reward(
            &user_repo,
            &credit_repo,
            &payout_repo,
            &settings,
            &NoopCallback,
            referred_id,
            referrer_id,
            "SOL",
        )
        .await
        .unwrap();

        assert_eq!(payout_repo.count_pending().await.unwrap(), 1);

        let payouts = payout_repo.list_pending(10, 0).await.unwrap();
        let p = &payouts[0];
        assert_eq!(p.referrer_id, referrer_id);
        assert_eq!(p.referred_user_id, referred_id);
        assert_eq!(p.amount, 2000);
        assert_eq!(p.trigger_type, "signup");
        assert_eq!(p.status, "pending");
        assert_eq!(p.currency, "SOL");

        // No credit balance in payout mode.
        assert_eq!(
            credit_repo.get_balance(referrer_id, "SOL").await.unwrap(),
            0
        );
    }

    #[tokio::test]
    async fn test_signup_reward_payout_dedup() {
        let settings = make_settings(true, 2000, "on_signup", "direct_payout").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        let (referrer_id, referred_id) = create_referral_pair(&user_repo).await;

        for _ in 0..2 {
            issue_signup_reward(
                &user_repo,
                &credit_repo,
                &payout_repo,
                &settings,
                &NoopCallback,
                referred_id,
                referrer_id,
                "SOL",
            )
            .await
            .unwrap();
        }

        assert_eq!(payout_repo.count_pending().await.unwrap(), 1);
    }

    // -------------------------------------------------------------------------
    // Spend reward tests
    // -------------------------------------------------------------------------

    #[tokio::test]
    async fn test_spend_reward_on_signup_trigger_returns_early() {
        // trigger=on_signup means issue_spend_reward is always a no-op.
        let settings = make_settings(true, 1000, "on_signup", "credits").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        let (referrer_id, referred_id) = create_referral_pair(&user_repo).await;

        issue_spend_reward(
            &user_repo,
            &credit_repo,
            &payout_repo,
            &settings,
            &NoopCallback,
            referred_id,
            Uuid::new_v4(),
            "SOL",
        )
        .await
        .unwrap();

        assert_eq!(
            credit_repo.get_balance(referrer_id, "SOL").await.unwrap(),
            0
        );
        assert_eq!(payout_repo.count_pending().await.unwrap(), 0);
    }

    #[tokio::test]
    async fn test_spend_reward_first_spend_credits() {
        let settings = make_settings(true, 500, "on_first_spend", "credits").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        let (referrer_id, referred_id) = create_referral_pair(&user_repo).await;

        issue_spend_reward(
            &user_repo,
            &credit_repo,
            &payout_repo,
            &settings,
            &NoopCallback,
            referred_id,
            Uuid::new_v4(),
            "SOL",
        )
        .await
        .unwrap();

        assert_eq!(
            credit_repo.get_balance(referrer_id, "SOL").await.unwrap(),
            500
        );
    }

    #[tokio::test]
    async fn test_spend_reward_first_spend_idempotent() {
        let settings = make_settings(true, 500, "on_first_spend", "credits").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        let (referrer_id, referred_id) = create_referral_pair(&user_repo).await;

        // on_first_spend idempotency key is pair-based, so a different
        // spend_transaction_id does not produce a second credit.
        for _ in 0..2 {
            issue_spend_reward(
                &user_repo,
                &credit_repo,
                &payout_repo,
                &settings,
                &NoopCallback,
                referred_id,
                Uuid::new_v4(),
                "SOL",
            )
            .await
            .unwrap();
        }

        assert_eq!(
            credit_repo.get_balance(referrer_id, "SOL").await.unwrap(),
            500
        );
    }

    #[tokio::test]
    async fn test_spend_reward_every_spend_multiple() {
        let settings = make_settings(true, 300, "on_every_spend", "credits").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        let (referrer_id, referred_id) = create_referral_pair(&user_repo).await;

        // Each distinct spend_transaction_id should produce a separate credit.
        for _ in 0..3 {
            issue_spend_reward(
                &user_repo,
                &credit_repo,
                &payout_repo,
                &settings,
                &NoopCallback,
                referred_id,
                Uuid::new_v4(),
                "SOL",
            )
            .await
            .unwrap();
        }

        assert_eq!(
            credit_repo.get_balance(referrer_id, "SOL").await.unwrap(),
            900 // 3 × 300
        );
    }

    #[tokio::test]
    async fn test_spend_reward_no_referrer_returns_early() {
        let settings = make_settings(true, 500, "on_first_spend", "credits").await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        // User with no referred_by.
        let user = UserEntity::new_email_user(
            "noreferral@example.com".to_string(),
            "hash".to_string(),
            None,
        );
        let user_id = user.id;
        user_repo.create(user).await.unwrap();

        issue_spend_reward(
            &user_repo,
            &credit_repo,
            &payout_repo,
            &settings,
            &NoopCallback,
            user_id,
            Uuid::new_v4(),
            "SOL",
        )
        .await
        .unwrap();

        assert_eq!(credit_repo.get_balance(user_id, "SOL").await.unwrap(), 0);
        assert_eq!(payout_repo.count_pending().await.unwrap(), 0);
    }

    // -------------------------------------------------------------------------
    // Cap enforcement
    // -------------------------------------------------------------------------

    #[tokio::test]
    async fn test_cap_enforcement() {
        // cap=2000, reward=1000: rewards 1 and 2 succeed; reward 3 is blocked.
        let settings = make_settings_with_cap(true, 1000, "on_signup", "credits", 2000).await;
        let user_repo = InMemoryUserRepository::new();
        let credit_repo = InMemoryCreditRepository::new();
        let payout_repo = InMemoryReferralPayoutRepository::new();

        let referrer = UserEntity::new_email_user(
            "referrer_cap@example.com".to_string(),
            "hash".to_string(),
            None,
        );
        let referrer_id = referrer.id;
        user_repo.create(referrer).await.unwrap();

        for i in 0..3u8 {
            let mut referred = UserEntity::new_email_user(
                format!("referred_cap_{}@example.com", i),
                "hash".to_string(),
                None,
            );
            referred.referred_by = Some(referrer_id);
            let referred_id = referred.id;
            user_repo.create(referred).await.unwrap();

            issue_signup_reward(
                &user_repo,
                &credit_repo,
                &payout_repo,
                &settings,
                &NoopCallback,
                referred_id,
                referrer_id,
                "SOL",
            )
            .await
            .unwrap();
        }

        // Third reward should have been blocked by the cap.
        assert_eq!(
            credit_repo.get_balance(referrer_id, "SOL").await.unwrap(),
            2000
        );
    }
}
