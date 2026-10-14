use super::*;
use crate::data::invite_codes::{InviteCodeAccount, VersionedInviteCodeAccount};
use crate::host::db::{self, ConditionalOperation};

fn account() -> VersionedInviteCodeAccount {
    VersionedInviteCodeAccount {
        value: InviteCodeAccount {
            user_id: "user-1".into(),
            activated_at: None,
            created_at: "2026-06-10T00:00:00.000Z".into(),
            redemption_id: None,
            invite_code_id: None,
        },
        entry_key: "user-1".into(),
        updated_at: "2026-07-10T00:00:02.000Z".into(),
    }
}

fn output(account: &VersionedInviteCodeAccount, status: &str) -> db::AtomicBatchResult {
    db::AtomicBatchResult {
        applied: 1,
        results: vec![db::ConditionalBatchResult {
            operation_id: ConditionalOperation::ReleaseInviteGate.id().into(),
            output: serde_json::json!({
                "userId": account.value.user_id,
                "status": status,
                "activatedAt": "2026-07-10T00:00:03.000Z",
                "redemptionId": account.value.redemption_id,
                "inviteCodeId": account.value.invite_code_id,
            }),
        }],
    }
}

#[test]
fn shape_binds_version_and_preserves_receipt() {
    let mut account = account();
    account.value.redemption_id = Some("redemption-1".into());
    account.value.invite_code_id = Some("invite-1".into());
    let expected = account.clone_for_test();
    let outcome = release_gate_with(&account, |ops| {
        let wire = serde_json::to_value(&ops[0]).unwrap();
        assert_eq!(wire["op"], "conditional");
        assert_eq!(wire["operationId"], "registration.invite-gate.release");
        assert_eq!(wire["params"]["account"]["entryKey"], "user-1");
        assert_eq!(
            wire["params"]["account"]["expectedUpdatedAt"],
            "2026-07-10T00:00:02.000Z"
        );
        Ok(output(&expected, "released"))
    })
    .unwrap();
    assert_eq!(outcome, GateReleaseOutcome::Released);
}

#[test]
fn accepts_exact_replay_and_rejects_receipt_loss() {
    let mut account = account();
    account.value.activated_at = Some("2026-07-10T00:00:03.000Z".into());
    account.value.redemption_id = Some("redemption-1".into());
    account.value.invite_code_id = Some("invite-1".into());
    assert_eq!(
        decode_gate_release_output(
            &output(&account, "already-activated").results[0].output,
            &account,
        )
        .unwrap(),
        GateReleaseOutcome::AlreadyActivated
    );
    let mut lossy = output(&account, "already-activated").results[0]
        .output
        .clone();
    lossy["redemptionId"] = serde_json::Value::Null;
    assert!(decode_gate_release_output(&lossy, &account).is_err());
    lossy.as_object_mut().unwrap().remove("inviteCodeId");
    assert!(decode_gate_release_output(&lossy, &account).is_err());
}

impl VersionedInviteCodeAccount {
    fn clone_for_test(&self) -> Self {
        Self {
            value: self.value.clone(),
            entry_key: self.entry_key.clone(),
            updated_at: self.updated_at.clone(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
struct GateModel {
    revision: u8,
    activated: bool,
    redemption_id: Option<&'static str>,
    invite_code_id: Option<&'static str>,
}

impl GateModel {
    fn release(&mut self, expected: u8) -> std::result::Result<(), ()> {
        if self.revision != expected {
            return Err(());
        }
        if !self.activated {
            self.activated = true;
            self.revision += 1;
        }
        Ok(())
    }

    fn redeem(&mut self, expected: u8) -> std::result::Result<(), ()> {
        if self.revision != expected || self.activated {
            return Err(());
        }
        self.activated = true;
        self.redemption_id = Some("redemption-1");
        self.invite_code_id = Some("invite-1");
        self.revision += 1;
        Ok(())
    }
}

#[test]
fn model_is_idempotent_and_never_erases_receipts() {
    let mut model = GateModel {
        revision: 1,
        activated: false,
        redemption_id: Some("existing-redemption"),
        invite_code_id: Some("existing-invite"),
    };
    assert_eq!(model.release(1), Ok(()));
    let released = model.clone();
    assert_eq!(model.release(2), Ok(()));
    assert_eq!(model, released);
}

#[test]
fn model_makes_redeem_and_release_exclusive() {
    for redeem_first in [true, false] {
        let mut model = GateModel {
            revision: 1,
            activated: false,
            redemption_id: None,
            invite_code_id: None,
        };
        let outcomes = if redeem_first {
            [model.redeem(1), model.release(1)]
        } else {
            [model.release(1), model.redeem(1)]
        };
        assert_eq!(outcomes.iter().filter(|result| result.is_ok()).count(), 1);
        assert!(model.activated);
        if redeem_first {
            assert_eq!(model.redemption_id, Some("redemption-1"));
            assert_eq!(model.invite_code_id, Some("invite-1"));
        }
    }
}
