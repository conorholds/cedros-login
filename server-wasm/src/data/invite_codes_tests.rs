use super::*;
use crate::data::verifications::VersionedVerificationEntry;

const NOW: &str = "2026-06-10T00:00:00.000Z";

fn code(
    active: bool,
    uses: i32,
    max: Option<i32>,
    starts: Option<&str>,
    expires: Option<&str>,
) -> InviteCode {
    InviteCode {
        id: "c1".into(),
        code: "ABCD".into(),
        created_by: None,
        owner_user_id: None,
        max_uses: max,
        uses_count: uses,
        starts_at: starts.map(str::to_string),
        expires_at: expires.map(str::to_string),
        active,
        batch_key: None,
        discount_percent: None,
        discount_months: None,
        created_at: "2026-06-01T00:00:00.000Z".into(),
        updated_at: "2026-06-01T00:00:00.000Z".into(),
    }
}

#[test]
fn availability_respects_active_window_and_uses() {
    assert!(code(true, 0, Some(1), None, None).is_available_at(NOW));
    assert!(!code(false, 0, Some(1), None, None).is_available_at(NOW));
    assert!(!code(true, 1, Some(1), None, None).is_available_at(NOW));
    assert!(!code(true, 0, None, Some("2026-06-20T00:00:00.000Z"), None).is_available_at(NOW));
    assert!(!code(true, 0, None, None, Some("2026-06-05T00:00:00.000Z")).is_available_at(NOW));
    assert!(code(
        true,
        9,
        None,
        Some("2026-06-01T00:00:00.000Z"),
        Some("2026-06-20T00:00:00.000Z")
    )
    .is_available_at(NOW));
}

#[test]
fn round_trips_camelcase() {
    let value = code(true, 2, Some(5), None, None);
    let json = serde_json::to_value(&value).unwrap();
    assert_eq!(json["usesCount"], 2);
    assert_eq!(json["maxUses"], 5);
    assert_eq!(serde_json::from_value::<InviteCode>(json).unwrap(), value);
}

fn verification() -> VersionedVerificationEntry {
    VersionedVerificationEntry {
        value: crate::data::verifications::VerificationEntry {
            id: "redemption-1".into(),
            user_id: "user-1".into(),
            token_hash: "hash-1".into(),
            token_type: "invite_code_pending".into(),
            target_email: None,
            subject_id: None,
            created_at: NOW.into(),
            expires_at: "2026-07-10T00:00:00.000Z".into(),
            used_at: None,
        },
        entry_key: "token-entry-1".into(),
    }
}

fn account() -> VersionedInviteCodeAccount {
    VersionedInviteCodeAccount {
        value: InviteCodeAccount {
            user_id: "user-1".into(),
            activated_at: None,
            created_at: NOW.into(),
            redemption_id: None,
            invite_code_id: None,
        },
        entry_key: "user-1".into(),
        updated_at: "2026-07-10T00:00:02.000Z".into(),
    }
}

#[test]
fn redemption_shape_matches_the_versioned_v2_contract() {
    let invite = VersionedInviteCode {
        value: code(true, 0, Some(1), None, None),
        entry_key: "code-entry-1".into(),
        updated_at: "2026-07-10T00:00:01.000Z".into(),
    };
    let params = redemption_params(&verification(), &invite, &account());
    assert_eq!(params["redemptionId"], "redemption-1");
    assert_eq!(params["verification"]["entryKey"], "token-entry-1");
    assert_eq!(params["verification"]["tokenHash"], "hash-1");
    assert_eq!(
        params["verification"]["allowedTokenTypes"][0],
        "invite_code_pending"
    );
    assert_eq!(params["inviteCode"]["entryKey"], "code-entry-1");
    assert_eq!(
        params["inviteCode"]["expectedUpdatedAt"],
        "2026-07-10T00:00:01.000Z"
    );
    assert_eq!(params["account"]["entryKey"], "user-1");
    assert_eq!(
        params["account"]["expectedUpdatedAt"],
        "2026-07-10T00:00:02.000Z"
    );
    assert_eq!(params.as_object().unwrap().len(), 4);
}

#[test]
fn redemption_response_distinguishes_replay_and_fails_closed() {
    for (already_applied, expected) in [
        (false, RedemptionOutcome::Applied),
        (true, RedemptionOutcome::Replayed),
    ] {
        assert_eq!(
            decode_redemption_output(
                &serde_json::json!({"userId":"user-1","alreadyApplied":already_applied}),
                "user-1"
            )
            .unwrap(),
            expected
        );
    }
    assert!(decode_redemption_output(
        &serde_json::json!({"userId":"other","alreadyApplied":false}),
        "user-1"
    )
    .is_err());
    assert!(decode_redemption_output(&serde_json::json!({"userId":"user-1"}), "user-1").is_err());
}

/// The host seam rejects writes that omit a field present in existing rows, so
/// `discountPercent` must serialize even when unset (null, never skipped).
#[test]
fn discount_percent_is_always_serialized_for_the_host_seam() {
    let json = serde_json::to_value(code(true, 0, None, None, None)).unwrap();
    assert!(json.as_object().unwrap().contains_key("discountPercent"));
    assert!(json["discountPercent"].is_null());
}

#[test]
fn legacy_codes_default_to_lifetime_and_fixed_months_round_trip() {
    let code = code(true, 0, None, None, None);
    let mut json = serde_json::to_value(&code).unwrap();
    json.as_object_mut().unwrap().remove("discountMonths");
    let legacy: InviteCode = serde_json::from_value(json).unwrap();
    assert_eq!(legacy.discount_months, None);
    let mut fixed = legacy;
    fixed.discount_percent = Some(100);
    fixed.discount_months = Some(3);
    let round_trip: InviteCode =
        serde_json::from_value(serde_json::to_value(&fixed).unwrap()).unwrap();
    assert_eq!(round_trip.discount_months, Some(3));
}
