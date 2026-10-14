use super::*;
use crate::data::invite_codes::RedemptionOutcome;

#[test]
fn replayed_redemption_cannot_mint_a_replacement_session() {
    assert!(matches!(
        redemption_response_policy(RedemptionOutcome::Replayed, true, true),
        Err(RouteError::Status(400, "invalid_token"))
    ));
}

#[test]
fn first_redemption_is_marked_new_without_bypassing_email_gate() {
    let (is_new_user, issue_session) =
        redemption_response_policy(RedemptionOutcome::Applied, false, true).unwrap();
    assert!(is_new_user);
    assert!(!issue_session);
}

#[test]
fn used_pending_invite_token_is_not_live() {
    let token = VerificationEntry {
        id: "token-1".into(),
        user_id: "user-1".into(),
        token_hash: "hash".into(),
        token_type: PENDING_TOKEN_TYPE.into(),
        target_email: None,
        subject_id: None,
        created_at: "2026-09-16T00:00:00Z".into(),
        expires_at: "2026-09-18T00:00:00Z".into(),
        used_at: Some("2026-09-16T00:01:00Z".into()),
    };
    assert!(!pending_token_is_live(&token, "2026-09-17T00:00:00Z"));
}

#[test]
fn discount_percent_validation_accepts_1_through_100_only() {
    assert!(validate_discount_percent(None).is_ok());
    assert!(validate_discount_percent(Some(1)).is_ok());
    assert!(validate_discount_percent(Some(100)).is_ok());
    assert!(validate_discount_percent(Some(0)).is_err());
    assert!(validate_discount_percent(Some(101)).is_err());
    assert!(validate_discount_percent(Some(-5)).is_err());
}

#[test]
fn fixed_discount_term_requires_positive_months_and_a_discount() {
    assert!(validate_discount_months(None, Some(100)).is_ok());
    assert!(validate_discount_months(Some(3), Some(100)).is_ok());
    assert!(validate_discount_months(Some(1), Some(50)).is_ok());
    assert!(validate_discount_months(Some(0), Some(100)).is_err());
    assert!(validate_discount_months(Some(-1), Some(100)).is_err());
    assert!(validate_discount_months(Some(3), None).is_err());
}

#[test]
fn duration_patch_distinguishes_omission_clear_and_fixed_term() {
    let unchanged: UpdateRequest = serde_json::from_str("{}").unwrap();
    assert_eq!(unchanged.discount_months.resolve(Some(3)), Some(3));
    let cleared: UpdateRequest = serde_json::from_str(r#"{"discountMonths":null}"#).unwrap();
    assert_eq!(cleared.discount_months.resolve(Some(3)), None);
    let changed: UpdateRequest = serde_json::from_str(r#"{"discountMonths":6}"#).unwrap();
    assert_eq!(changed.discount_months.resolve(Some(3)), Some(6));
    assert!(serde_json::from_str::<CreateRequest>(r#"{"discountMonths":1.5}"#).is_err());
}
