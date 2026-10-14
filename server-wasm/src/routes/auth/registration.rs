use super::*;

struct Prepared {
    request: RegisterRequest,
    user: UserEntry,
    require_verification: bool,
    email_queued: Option<bool>,
    gate: bool,
    handoff_status: Option<crate::routes::invite_gate_handoff::InviteGateHandoffStatus>,
    session: Option<(
        crate::services::jwt::TokenPair,
        crate::data::sessions::SessionEntry,
    )>,
    ip: Option<String>,
    agent: Option<String>,
}

pub(super) fn run(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_email_enabled()?;
    let request_data: RegisterRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let (user, org_id, require_verification) = build_user(&request_data)?;
    let prepared = persist(request, request_data, user, org_id, require_verification)?;
    respond_to_registration(prepared)
}

fn build_user(request: &RegisterRequest) -> Result<(UserEntry, String, bool), RouteError> {
    if !email::is_valid_email(&request.email) {
        return Err(AuthError::Validation(vec!["Invalid email format".to_string()]).into());
    }
    email::validate_ascii_local(&request.email)?;
    let normalized = email::normalize_email(&request.email);
    super::super::signup_access::enforce(request.access_code.as_deref())?;
    if email_blocks_signup(&normalized)? {
        return Err(RouteError::Status(409, "email_exists"));
    }
    let password = PasswordService::default();
    password.validate(&request.password)?;
    let password_hash = password.hash(&request.password)?;
    let _accepted_referral = request
        .referral
        .as_deref()
        .map(str::trim)
        .filter(|v| !v.is_empty());
    let org_id = resolve_default_org_id()?;
    let now = clock::now_iso();
    let require_verification = settings::bool("auth_email_require_verification", true);
    let user = UserEntry {
        id: Uuid::new_v4().to_string(),
        email: Some(normalized),
        // Policy may permit an unverified account to sign in, but it never
        // turns absence of proof into a verified identity assertion.
        email_verified: false,
        password_hash: Some(password_hash),
        name: request.name.clone(),
        username: None,
        picture: None,
        wallet_address: None,
        evm_wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec!["password".into()],
        suspended_at: None,
        is_system_admin: false,
        created_at: now.clone(),
        updated_at: now.clone(),
        last_login_at: Some(now),
        welcome_completed_at: None,
        avatar_content_type: None,
    };
    Ok((user, org_id, require_verification))
}

fn persist(
    request: &RouteRequest,
    request_data: RegisterRequest,
    user: UserEntry,
    org_id: String,
    require_verification: bool,
) -> Result<Prepared, RouteError> {
    let membership = MembershipEntry {
        id: Uuid::new_v4().to_string(),
        user_id: user.id.clone(),
        org_id: org_id.clone(),
        role: "member".into(),
        joined_at: clock::now_iso(),
    };
    let gate = super::super::invite_codes::gate_enabled();
    let pending = gate.then(|| super::super::invite_codes::pending_account(&user.id));
    let ip = client_ip(request);
    let agent = user_agent(request);
    let context = TokenContext {
        org_id: Some(org_id.clone()),
        role: Some("member".into()),
        email_verified: Some(user.email_verified),
        ..Default::default()
    };
    let session = (!gate && register_should_issue_session(require_verification))
        .then(|| {
            prepare_session(
                &user,
                &context,
                ip.clone(),
                agent.clone(),
                Some(clock::now_iso()),
            )
        })
        .transpose()?;
    let verification_email = if require_verification {
        Some(
            super::super::account::prepare_verification_email(
                &user,
                request_data.return_to.as_deref(),
            )
            .ok_or(RouteError::Status(500, "verification_email_unavailable"))?,
        )
    } else {
        None
    };
    if let Some(email) = verification_email.as_ref() {
        registration_account::complete(
            &user,
            None,
            &membership,
            session.as_ref().map(|(_, row)| row),
            pending.as_ref(),
            None,
            registration_account::RegistrationEmail {
                verification: &email.verification,
                outbox: &email.outbox,
            },
        )?;
        super::super::account::dispatch_verification_email(email);
    } else {
        registration_account::create(
            &user,
            None,
            &membership,
            session.as_ref().map(|(_, row)| row),
            pending.as_ref(),
            None,
        )?;
    }
    if let Some(email) = user.email.as_deref() {
        super::super::flag_email_collision(email, "cedros-login:register");
    }
    let email_queued = require_verification.then_some(true);
    let needs_handoff = gate
        && request_data
            .invite_code
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .is_none();
    let handoff_status = needs_handoff
        .then(|| super::super::invite_gate_handoff::submit_pending(request, &user.id, &org_id));
    Ok(Prepared {
        request: request_data,
        user,
        require_verification,
        email_queued,
        gate,
        handoff_status,
        session,
        ip,
        agent,
    })
}

fn respond_to_registration(mut prepared: Prepared) -> Result<RouteResponse, RouteError> {
    for event in [
        "cedros-login:registered",
        "cedros-login:registration-created",
    ] {
        let _ = telemetry::emit_event(
            event,
            "",
            &serde_json::json!({"method":"password","routeId":"cedros-login:register"}),
        );
    }
    if prepared.gate {
        if let Some(code) = prepared
            .request
            .invite_code
            .as_deref()
            .map(str::trim)
            .filter(|v| !v.is_empty())
        {
            super::super::invite_codes::redeem_for_user(code, &prepared.user.id)?;
        } else {
            let token = super::super::invite_codes::issue_pending_token(&prepared.user.id)?;
            return respond_invite_code_required(
                201,
                &prepared.user,
                true,
                Some("password"),
                &token,
                prepared.handoff_status.unwrap_or(
                    crate::routes::invite_gate_handoff::InviteGateHandoffStatus::Unavailable,
                ),
            );
        }
    }
    if !register_should_issue_session(prepared.require_verification) {
        return respond_without_session(
            201,
            &prepared.user,
            true,
            Some("password"),
            prepared.email_queued,
        );
    }
    let tokens = match prepared.session.take() {
        Some((tokens, session)) => {
            maybe_alert_new_device_after_session(
                &prepared.user,
                prepared.ip.as_deref(),
                prepared.agent.as_deref(),
                &session.id,
            );
            tokens
        }
        None => issue_session(&prepared.user, prepared.ip, prepared.agent)?,
    };
    respond(
        201,
        &prepared.user,
        tokens,
        true,
        Some("password"),
        &cookies::config(),
    )
}
