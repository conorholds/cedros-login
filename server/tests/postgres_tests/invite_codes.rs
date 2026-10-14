use super::*;
use cedros_login::repositories::{InviteCodeEntity, InviteCodeUpdate, NullableUpdate};

#[tokio::test]
async fn invite_discount_duration_survives_storage_redemption_and_admin_updates() {
    let Some(storage) = create_test_storage().await else {
        return;
    };
    let user = create_user(&storage).await;
    let repo = &storage.invite_code_repo;
    let mut code = InviteCodeEntity::new(
        format!("OFFER_{}", Uuid::new_v4().simple()).to_uppercase(),
        None,
        None,
        None,
        None,
        None,
        None,
    );
    code.discount_percent = Some(50);
    let code = repo.create(code).await.unwrap();
    assert_eq!(code.discount_months, None);
    let updated = repo
        .update(
            code.id,
            InviteCodeUpdate {
                discount_months: NullableUpdate::Set(Some(3)),
                ..Default::default()
            },
        )
        .await
        .unwrap();
    assert_eq!(updated.discount_months, Some(3));
    assert_eq!(
        repo.find_by_id(code.id)
            .await
            .unwrap()
            .unwrap()
            .discount_months,
        Some(3)
    );
    assert_eq!(
        repo.list_admin(100, 0)
            .await
            .unwrap()
            .iter()
            .find(|row| row.id == code.id)
            .unwrap()
            .discount_months,
        Some(3)
    );
    repo.mark_user_pending(user.id).await.unwrap();
    let redeemed = repo.redeem(&code.code, user.id).await.unwrap().unwrap();
    assert_eq!(redeemed.discount_months, Some(3));
    let grant = repo.find_redeemed_discount(user.id).await.unwrap().unwrap();
    assert_eq!(grant.percent_off, 50);
    assert_eq!(grant.duration_months, Some(3));
    repo.update(
        code.id,
        InviteCodeUpdate {
            active: Some(false),
            ..Default::default()
        },
    )
    .await
    .unwrap();
    assert_eq!(
        repo.find_redeemed_discount(user.id)
            .await
            .unwrap()
            .unwrap()
            .duration_months,
        Some(3)
    );
    repo.update(
        code.id,
        InviteCodeUpdate {
            discount_months: NullableUpdate::Set(None),
            ..Default::default()
        },
    )
    .await
    .unwrap();
    assert_eq!(
        repo.find_redeemed_discount(user.id)
            .await
            .unwrap()
            .unwrap()
            .duration_months,
        None
    );
    repo.update(
        code.id,
        InviteCodeUpdate {
            discount_percent: NullableUpdate::Set(None),
            ..Default::default()
        },
    )
    .await
    .unwrap();
    assert!(repo
        .find_redeemed_discount(user.id)
        .await
        .unwrap()
        .is_none());
}

#[tokio::test]
async fn invite_discount_database_constraint_rejects_invalid_terms_atomically() {
    let Some(storage) = create_test_storage().await else {
        return;
    };
    let mut code = InviteCodeEntity::new(
        format!("TERM_{}", Uuid::new_v4().simple()).to_uppercase(),
        None,
        None,
        None,
        None,
        None,
        None,
    );
    code.discount_percent = Some(100);
    code.discount_months = Some(1);
    let repo = &storage.invite_code_repo;
    let code = repo.create(code).await.unwrap();
    for months in [0, -1] {
        assert!(repo
            .update(
                code.id,
                InviteCodeUpdate {
                    discount_months: NullableUpdate::Set(Some(months)),
                    ..Default::default()
                }
            )
            .await
            .is_err());
    }
    assert!(repo
        .update(
            code.id,
            InviteCodeUpdate {
                discount_percent: NullableUpdate::Set(None),
                ..Default::default()
            }
        )
        .await
        .is_err());
    let unchanged = repo.find_by_id(code.id).await.unwrap().unwrap();
    assert_eq!(unchanged.discount_percent, Some(100));
    assert_eq!(unchanged.discount_months, Some(1));
    let cleared = repo
        .update(
            code.id,
            InviteCodeUpdate {
                discount_percent: NullableUpdate::Set(None),
                discount_months: NullableUpdate::Set(None),
                ..Default::default()
            },
        )
        .await
        .unwrap();
    assert_eq!(cleared.discount_months, None);
    assert_eq!(cleared.discount_percent, None);
}
