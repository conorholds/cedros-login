use crate::api_support::*;
use cedros_login::repositories::{
    AbacPolicy, ApiKeyEntity, CustomRole, MembershipEntity, OrgRole, PolicyEffect, SessionEntity,
    UserEntity,
};
use cedros_login::services::JwtService;
use uuid::Uuid;

async fn actor(
    storage: &Storage,
    config: &Config,
    org: Uuid,
    role: Option<OrgRole>,
) -> (Uuid, String, String) {
    let mut user = UserEntity::new_email_user(
        format!("{}@example.com", Uuid::new_v4()),
        "unused".into(),
        None,
    );
    user.email_verified = true;
    let user = storage.user_repo.create(user).await.unwrap();
    if let Some(role) = role {
        storage
            .membership_repo
            .create(MembershipEntity::new(user.id, org, role))
            .await
            .unwrap();
    }
    let session = storage
        .session_repo
        .create(SessionEntity::new(
            user.id,
            Uuid::new_v4().to_string(),
            chrono::Utc::now() + chrono::Duration::hours(1),
            None,
            None,
        ))
        .await
        .unwrap();
    let token = JwtService::new(&config.jwt)
        .generate_access_token(user.id, session.id)
        .unwrap();
    let key = cedros_login::repositories::generate_api_key();
    storage
        .api_key_repo
        .create(ApiKeyEntity::new(user.id, &key, "test"))
        .await
        .unwrap();
    (user.id, token, key)
}

#[tokio::test]
async fn authorization_matrix_isolates_roles_orgs_and_api_keys() {
    let config = test_config();
    let storage = Storage::in_memory();
    seed_runtime_auth_settings(&storage, &config).await;
    let org = storage
        .org_repo
        .create(OrgEntity::new(
            "Matrix".into(),
            "matrix".into(),
            Uuid::new_v4(),
            false,
        ))
        .await
        .unwrap();
    let mut actors = Vec::new();
    for role in [
        Some(OrgRole::Owner),
        Some(OrgRole::Admin),
        Some(OrgRole::Member),
        None,
    ] {
        actors.push((role, actor(&storage, &config, org.id, role).await));
    }
    let app = router_with_storage(config, Arc::new(NoopCallback), storage);
    let owner_id = actors[0].1 .0;
    for (role, (user_id, token, key)) in actors {
        for credential in [&token, &key] {
            for permission in cedros_login::services::Permission::ALL {
                let (status, response) = auth_request(
                    app.clone(),
                    Method::POST,
                    "/authorize",
                    credential,
                    Some(json!({"orgId":org.id,"permission":permission.as_str()})),
                )
                .await;
                assert_eq!(status, StatusCode::OK, "{response}");
                assert_eq!(
                    response["allowed"],
                    role.is_some_and(|role| permission.is_allowed_for(role)),
                    "{role:?} {permission:?}"
                );
            }
            for path in [
                format!("/orgs/{}", org.id),
                format!("/orgs/{}/members", org.id),
                format!("/orgs/{}/roles", org.id),
            ] {
                let (status, body) =
                    auth_request(app.clone(), Method::GET, &path, credential, None).await;
                assert_eq!(
                    status,
                    if role.is_some() {
                        StatusCode::OK
                    } else {
                        StatusCode::FORBIDDEN
                    },
                    "{path}: {body}"
                );
            }
            for permission in [
                "org:read",
                "manage_extension_trust",
                "host:admin",
                "cedros-pay:spend",
            ] {
                let (_, body) = auth_request(
                    app.clone(),
                    Method::POST,
                    "/authorize",
                    credential,
                    Some(json!({"orgId":Uuid::new_v4(),"permission":permission})),
                )
                .await;
                assert_eq!(body["allowed"], false);
            }
            let (status, _) = auth_request(app.clone(), Method::POST, "/authorize", credential,
                Some(json!({"orgId":org.id,"permission":"org:delete","resource":{"org_id":org.id},"environment":{"site":"forged"}}))).await;
            assert_eq!(status, StatusCode::BAD_REQUEST);
            for path in [
                "/admin/users".to_string(),
                "/admin/users/stats".into(),
                format!("/admin/users/{user_id}"),
                "/admin/orgs".into(),
                format!("/admin/orgs/{}", org.id),
                "/admin/settings".into(),
                "/admin/audit".into(),
                "/admin/dashboard-permissions".into(),
                "/admin/disposable-domains".into(),
                "/admin/sso-providers".into(),
                "/admin/invite-codes".into(),
            ] {
                let (status, body) =
                    auth_request(app.clone(), Method::GET, &path, credential, None).await;
                let expected = if path == "/admin/sso-providers"
                    && role == Some(OrgRole::Owner)
                    && credential == &token
                {
                    StatusCode::OK
                } else {
                    StatusCode::FORBIDDEN
                };
                assert_eq!(status, expected, "{path}: {body}");
            }
            let (status, _) = auth_request(
                app.clone(),
                Method::PATCH,
                &format!("/orgs/{}/members/{owner_id}", org.id),
                credential,
                Some(json!({"role":"owner"})),
            )
            .await;
            assert_eq!(status, StatusCode::FORBIDDEN);
        }
        let (status, _) = auth_request(
            app.clone(),
            Method::POST,
            "/user/api-keys",
            &key,
            Some(json!({"label":"escalated"})),
        )
        .await;
        assert_eq!(status, StatusCode::FORBIDDEN);
    }
}

#[tokio::test]
async fn authorization_policies_constrain_real_endpoints_and_update_without_refresh() {
    let config = test_config();
    let storage = Storage::in_memory();
    seed_runtime_auth_settings(&storage, &config).await;
    let org = storage
        .org_repo
        .create(OrgEntity::new(
            "Policies".into(),
            "policies".into(),
            Uuid::new_v4(),
            false,
        ))
        .await
        .unwrap();
    let (_, token, key) = actor(&storage, &config, org.id, Some(OrgRole::Owner)).await;
    let policies = storage.policy_repo.clone();
    let app = router_with_storage(config, Arc::new(NoopCallback), storage);
    let path = format!("/orgs/{}", org.id);
    assert_eq!(
        auth_request(app.clone(), Method::GET, &path, &token, None)
            .await
            .0,
        StatusCode::OK
    );
    let policy = policies
        .create(AbacPolicy::new(
            org.id,
            "deny read",
            "org:read",
            PolicyEffect::Deny,
        ))
        .await
        .unwrap();
    for credential in [&token, &key] {
        assert_eq!(
            auth_request(app.clone(), Method::GET, &path, credential, None)
                .await
                .0,
            StatusCode::FORBIDDEN
        );
        let (_, permissions) = auth_request(
            app.clone(),
            Method::POST,
            "/permissions",
            credential,
            Some(json!({"orgId":org.id})),
        )
        .await;
        assert!(!permissions["permissions"]
            .as_array()
            .unwrap()
            .contains(&json!("org:read")));
    }
    policies.delete(policy.id).await.unwrap();
    let invite_policy = policies
        .create(AbacPolicy::new(
            org.id,
            "deny member invite",
            "member:invite",
            PolicyEffect::Deny,
        ))
        .await
        .unwrap();
    let (status, body) = auth_request(
        app.clone(),
        Method::POST,
        &format!("/orgs/{}/invites", org.id),
        &token,
        Some(json!({"email":"invited@example.com","role":"member"})),
    )
    .await;
    assert_eq!(status, StatusCode::FORBIDDEN, "{body}");
    policies.delete(invite_policy.id).await.unwrap();

    assert_eq!(
        auth_request(app, Method::GET, &path, &token, None).await.0,
        StatusCode::OK
    );
}

#[tokio::test]
async fn authorization_admin_cannot_manage_owner_grants_or_foreign_definitions() {
    let config = test_config();
    let storage = Storage::in_memory();
    seed_runtime_auth_settings(&storage, &config).await;
    let org = storage
        .org_repo
        .create(OrgEntity::new(
            "Delegation".into(),
            "delegation".into(),
            Uuid::new_v4(),
            false,
        ))
        .await
        .unwrap();
    let (_, admin, _) = actor(&storage, &config, org.id, Some(OrgRole::Admin)).await;
    let (_, owner, _) = actor(&storage, &config, org.id, Some(OrgRole::Owner)).await;
    let protected = storage
        .custom_role_repo
        .create(CustomRole::new(
            org.id,
            "Owner powers",
            ["org:delete".into()].into_iter().collect(),
        ))
        .await
        .unwrap();
    let foreign = storage
        .custom_role_repo
        .create(CustomRole::new(
            Uuid::new_v4(),
            "Foreign",
            ["org:read".into()].into_iter().collect(),
        ))
        .await
        .unwrap();
    let app = router_with_storage(config, Arc::new(NoopCallback), storage);
    for permission in ["org:delete", "manage_extension_trust"] {
        for (suffix, body) in [
            (
                "roles",
                json!({"name":format!("Escalation {permission}"),"permissions":[permission]}),
            ),
            (
                "policies",
                json!({"name":format!("Escalation {permission}"),"permission":permission,"conditions":{},"effect":"allow"}),
            ),
        ] {
            let path = format!("/orgs/{}/{suffix}", org.id);
            assert_eq!(
                auth_request(app.clone(), Method::POST, &path, &admin, Some(body.clone()))
                    .await
                    .0,
                StatusCode::FORBIDDEN
            );
            assert_eq!(
                auth_request(app.clone(), Method::POST, &path, &owner, Some(body))
                    .await
                    .0,
                StatusCode::OK
            );
        }
    }
    for (method, suffix, body) in [
        (Method::PATCH, "", Some(json!({"name":"Changed"}))),
        (Method::DELETE, "", None),
        (Method::POST, "/default", None),
    ] {
        let path = format!("/orgs/{}/roles/{}{suffix}", org.id, protected.id);
        assert_eq!(
            auth_request(app.clone(), method, &path, &admin, body)
                .await
                .0,
            StatusCode::FORBIDDEN
        );
    }
    assert_eq!(
        auth_request(
            app,
            Method::GET,
            &format!("/orgs/{}/roles/{}", org.id, foreign.id),
            &owner,
            None
        )
        .await
        .0,
        StatusCode::NOT_FOUND
    );
}

#[tokio::test]
async fn authorization_invite_and_key_ids_cannot_transfer_another_users_authority() {
    let config = test_config();
    let storage = Storage::in_memory();
    seed_runtime_auth_settings(&storage, &config).await;
    let org = storage
        .org_repo
        .create(OrgEntity::new(
            "Invites".into(),
            "invites-matrix".into(),
            Uuid::new_v4(),
            false,
        ))
        .await
        .unwrap();
    let (owner_id, owner, _) = actor(&storage, &config, org.id, Some(OrgRole::Owner)).await;
    let (recipient_id, recipient, _) = actor(&storage, &config, org.id, None).await;
    let (stranger_id, stranger, _) = actor(&storage, &config, org.id, None).await;
    let email = storage
        .user_repo
        .find_by_id(recipient_id)
        .await
        .unwrap()
        .unwrap()
        .email
        .unwrap();
    let memberships = storage.membership_repo.clone();
    let keys = storage.api_key_repo.clone();
    let policies = storage.policy_repo.clone();
    let owner_key = keys.find_by_user_id(owner_id).await.unwrap().remove(0);
    let app = router_with_storage(config, Arc::new(NoopCallback), storage);
    let (status, invite) = auth_request(
        app.clone(),
        Method::POST,
        &format!("/orgs/{}/invites", org.id),
        &owner,
        Some(json!({"email":email,"role":"member"})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{invite}");
    let resend_path = format!(
        "/orgs/{}/invites/{}/resend",
        org.id,
        invite["id"].as_str().unwrap()
    );
    let deny_cancel = policies
        .create(AbacPolicy::new(
            org.id,
            "deny cancellation",
            "invite:cancel",
            PolicyEffect::Deny,
        ))
        .await
        .unwrap();
    assert_eq!(
        auth_request(app.clone(), Method::POST, &resend_path, &owner, None)
            .await
            .0,
        StatusCode::FORBIDDEN
    );
    policies.delete(deny_cancel.id).await.unwrap();
    let (status, resent) =
        auth_request(app.clone(), Method::POST, &resend_path, &owner, None).await;
    assert_eq!(status, StatusCode::OK, "{resent}");
    assert_eq!(
        auth_request(
            app.clone(),
            Method::POST,
            "/invites/accept",
            &recipient,
            Some(json!({"token":invite["token"]}))
        )
        .await
        .0,
        StatusCode::NOT_FOUND
    );
    let token = resent["token"].as_str().unwrap();
    let (status, _) = auth_request(
        app.clone(),
        Method::POST,
        "/invites/accept",
        &stranger,
        Some(json!({"token":token,"userId":recipient_id})),
    )
    .await;
    assert_eq!(status, StatusCode::FORBIDDEN);
    let (status, body) = auth_request(
        app.clone(),
        Method::POST,
        "/invites/accept",
        &recipient,
        Some(json!({"token":token,"role":"owner","userId":stranger_id,"orgId":Uuid::new_v4()})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{body}");
    let membership = memberships
        .find_by_user_and_org(recipient_id, org.id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(membership.role, OrgRole::Member);
    assert!(memberships
        .find_by_user_and_org(stranger_id, org.id)
        .await
        .unwrap()
        .is_none());
    memberships.delete(membership.id).await.unwrap();
    assert!(auth_request(
        app.clone(),
        Method::POST,
        "/invites/accept",
        &recipient,
        Some(json!({"token":token}))
    )
    .await
    .0
    .is_client_error());
    assert!(auth_request(
        app,
        Method::DELETE,
        &format!("/user/api-keys/{}", owner_key.id),
        &stranger,
        None
    )
    .await
    .0
    .is_client_error());
    assert_eq!(keys.find_by_user_id(owner_id).await.unwrap().len(), 1);
}

#[tokio::test]
async fn authorization_org_switch_requires_current_session_and_target_membership() {
    let config = test_config();
    let storage = Storage::in_memory();
    seed_runtime_auth_settings(&storage, &config).await;
    let org = storage
        .org_repo
        .create(OrgEntity::new(
            "Switch".into(),
            "switch".into(),
            Uuid::new_v4(),
            false,
        ))
        .await
        .unwrap();
    let (user_id, token, key) = actor(&storage, &config, org.id, Some(OrgRole::Member)).await;
    let (_, stranger, _) = actor(&storage, &config, org.id, None).await;
    let members = storage.membership_repo.clone();
    let app = router_with_storage(config, Arc::new(NoopCallback), storage);
    let path = format!("/orgs/{}/switch", org.id);
    assert_eq!(
        auth_request(app.clone(), Method::POST, &path, &key, None)
            .await
            .0,
        StatusCode::FORBIDDEN
    );
    assert_eq!(
        auth_request(app.clone(), Method::POST, &path, &stranger, None)
            .await
            .0,
        StatusCode::FORBIDDEN
    );
    let (status, switched) = auth_request(app.clone(), Method::POST, &path, &token, None).await;
    assert_eq!(status, StatusCode::OK, "{switched}");
    let new_token = switched["tokens"]["accessToken"].as_str().unwrap();
    assert_eq!(
        auth_request(app.clone(), Method::GET, "/user", &token, None)
            .await
            .0,
        StatusCode::UNAUTHORIZED
    );
    assert_eq!(
        auth_request(app.clone(), Method::GET, "/user", new_token, None)
            .await
            .0,
        StatusCode::OK
    );
    let membership = members
        .find_by_user_and_org(user_id, org.id)
        .await
        .unwrap()
        .unwrap();
    members.delete(membership.id).await.unwrap();
    assert_eq!(
        auth_request(app, Method::POST, &path, new_token, None)
            .await
            .0,
        StatusCode::UNAUTHORIZED
    );
}
