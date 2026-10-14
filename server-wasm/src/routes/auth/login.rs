use super::*;

pub(super) fn run(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_email_enabled()?;
    let request_data: LoginRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let normalized = email::normalize_email(&request_data.email);
    let user = authenticate(request, &request_data, &normalized)?;
    finish(request, user)
}

fn authenticate(
    request: &RouteRequest,
    request_data: &LoginRequest,
    normalized: &str,
) -> Result<UserEntry, RouteError> {
    let password = PasswordService::default();
    let require_verification = settings::bool("auth_email_require_verification", true);
    let candidate = find_user_by_password_email(normalized, require_verification)?;
    let identity = candidate
        .as_ref()
        .map(|user| user.id.clone())
        .unwrap_or_else(|| format!("email:{normalized}"));
    // Unknown accounts make the same budget call and consume the same source
    // allowance; otherwise the throttling threshold itself reveals existence.
    super::super::abuse::enforce_password_action(request, &identity)?;
    let mut user = match candidate {
        Some(user) => user,
        None => return invalid_credentials(&password, request_data),
    };
    let Some(hash) = user.password_hash.as_deref() else {
        return invalid_credentials(&password, request_data);
    };
    if !password.verify(&request_data.password, hash) {
        record_failure();
        return Err(AuthError::Unauthorized("invalid credentials".into()).into());
    }
    if require_verification && !user.email_verified {
        return Err(RouteError::Status(403, "email_not_verified"));
    }
    if password.needs_rehash(hash) {
        let original = user.clone();
        user.password_hash = Some(password.hash(&request_data.password)?);
        user.updated_at = clock::now_iso();
        crate::data::users::update_if_current(&original, &user)?;
    }
    Ok(user)
}

fn invalid_credentials(
    password: &PasswordService,
    request_data: &LoginRequest,
) -> Result<UserEntry, RouteError> {
    if password.is_verifiable_input(&request_data.password) {
        password.verify_dummy(&request_data.password);
    }
    record_failure();
    Err(AuthError::Unauthorized("invalid credentials".into()).into())
}

fn finish(request: &RouteRequest, mut user: UserEntry) -> Result<RouteResponse, RouteError> {
    if let Some(response) =
        super::super::invite_codes::pending_login_response(request, &user, "password")?
    {
        return Ok(response);
    }
    if totp::has_mfa(&user.id)? {
        return mfa_challenge(&user, "password");
    }
    touch_login_timestamp(&mut user);
    let tokens = issue_session(&user, client_ip(request), user_agent(request))?;
    for event in ["cedros-login:authenticated", "cedros-login:user-login"] {
        let _ = telemetry::emit_event(
            event,
            "",
            &serde_json::json!({"method":"password","routeId":"cedros-login:login"}),
        );
    }
    respond(
        200,
        &user,
        tokens,
        false,
        Some("password"),
        &cookies::config(),
    )
}
