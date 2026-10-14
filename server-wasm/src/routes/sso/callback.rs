use super::*;

struct Validated {
    pending: PendingSsoState,
    provider: sso_providers::SsoProviderEntry,
    claims: SsoIdClaims,
    email: String,
}

type Completed = (
    UserEntry,
    bool,
    Option<crate::services::jwt::TokenPair>,
    Option<String>,
);

enum FlowResult {
    Response(RouteResponse),
    Completed(Box<Completed>),
}

struct ExistingInput<'a> {
    request: &'a RouteRequest,
    provider: &'a sso_providers::SsoProviderEntry,
    pending: &'a PendingSsoState,
    binding: &'a str,
    durable_binding: bool,
    ip: Option<String>,
    agent: Option<String>,
}

pub(super) fn run(request: &RouteRequest, frontend: &str) -> Result<RouteResponse, RouteError> {
    let validated = validate(request)?;
    complete(request, frontend, validated)
}

fn validate(request: &RouteRequest) -> Result<Validated, RouteError> {
    let code = query(request, "code").ok_or(RouteError::Status(400, "missing_code"))?;
    let state_id = query(request, "state").ok_or(RouteError::Status(400, "missing_state"))?;
    let pending = load_state(&state_id)?;
    let mut provider = sso_providers::find_by_id(&pending.state.provider_id)?
        .ok_or(RouteError::Status(400, "invalid_state"))?;
    let secret = super::super::sso_credentials::get(&mut provider)?;
    let meta = discover(&provider.issuer_url)?;
    let token = exchange_code(
        &meta.token_endpoint,
        &code,
        &callback_url()?,
        &provider.client_id,
        &secret,
        &pending.state.pkce_verifier,
    )?;
    let claims: SsoIdClaims = oidc::verify_id_token(
        &meta.jwks_uri,
        &token,
        &[&provider.client_id],
        &[&provider.issuer_url],
    )?;
    if claims.nonce.as_deref() != Some(pending.state.nonce.as_str()) {
        return Err(RouteError::Status(401, "nonce_mismatch"));
    }
    let raw_email = claims
        .email
        .as_deref()
        .ok_or(RouteError::Status(400, "email_required"))?;
    if claims.email_verified != Some(true) {
        return Err(RouteError::Status(403, "email_not_verified"));
    }
    let email = normalize_email(raw_email);
    if let Some(domain) = &provider.email_domain {
        validate_domain(&email, domain)?;
    }
    Ok(Validated {
        pending,
        provider,
        claims,
        email,
    })
}

fn complete(
    request: &RouteRequest,
    frontend: &str,
    validated: Validated,
) -> Result<RouteResponse, RouteError> {
    let ip = auth::client_ip(request);
    let agent = auth::user_agent(request);
    let binding = sso_binding(&validated.provider.id, &validated.claims.sub);
    let durable_identity = crate::data::sso_identities::find_by_id(&binding)?;
    if durable_identity
        .as_ref()
        .is_some_and(|identity| identity.id != binding)
    {
        return Err(RouteError::Status(409, "account_link_required"));
    }
    let bound_user = if let Some(identity) = durable_identity.as_ref() {
        Some(
            crate::data::users::find_by_id(&identity.user_id)?
                .ok_or(RouteError::Status(409, "account_link_required"))?,
        )
    } else {
        let deterministic = crate::data::users::find_by_id(&sso_user_id(
            &validated.provider.id,
            &validated.claims.sub,
        ))?;
        if deterministic
            .as_ref()
            .is_some_and(|user| !has_sso_binding(user, &binding))
        {
            return Err(RouteError::Status(409, "account_link_required"));
        }
        match deterministic {
            Some(user) => Some(user),
            None => crate::data::users::find_by_legacy_sso_binding(&binding)?,
        }
    };
    // Email may only bootstrap a one-time legacy binding when the IdP
    // explicitly attests mailbox ownership.
    let email_user = if bound_user.is_none() && validated.claims.email_verified == Some(true) {
        auth::find_user_by_verified_email(&validated.email)?
    } else {
        None
    };
    let flow = match bound_user.or(email_user) {
        Some(user) => existing(
            user,
            ExistingInput {
                request,
                provider: &validated.provider,
                pending: &validated.pending,
                binding: &binding,
                durable_binding: durable_identity.is_some(),
                ip,
                agent,
            },
        )?,
        None if auth::email_blocks_signup(&validated.email)? => {
            return Err(RouteError::Status(409, "account_link_required"));
        }
        None => FlowResult::Completed(Box::new(new_account(validated, binding, ip, agent)?)),
    };
    let FlowResult::Completed(outcome) = flow else {
        let FlowResult::Response(response) = flow else {
            unreachable!()
        };
        return Ok(response);
    };
    emit_events(outcome.1);
    render(request, frontend, *outcome)
}

fn existing(user: UserEntry, input: ExistingInput<'_>) -> Result<FlowResult, RouteError> {
    if crate::data::memberships::find(&user.id, &input.provider.org_id)?.is_none() {
        return Err(RouteError::Status(403, "forbidden"));
    }
    let exact_legacy_binding = has_sso_binding(&user, input.binding);
    let unbound_legacy_account =
        !has_any_sso_binding(&user) && user.auth_methods.iter().any(|method| method == "sso");
    if !input.durable_binding && !exact_legacy_binding && !unbound_legacy_account {
        return Err(RouteError::Status(409, "account_link_required"));
    }
    let pending_identity =
        (!input.durable_binding).then(|| crate::data::sso_identities::SsoIdentityEntry {
            id: input.binding.to_string(),
            user_id: user.id.clone(),
            created_at: clock::now_iso(),
        });
    if super::super::invite_codes::is_user_pending(&user.id)? {
        if super::super::invite_codes::gate_enabled() {
            let pending =
                completion::pending_invite(&user, pending_identity.as_ref(), &input.pending.entry)?;
            let status = super::super::invite_codes::pending_handoff_status(input.request, &user)?;
            let response = auth::respond_invite_code_required(
                200,
                &user,
                false,
                Some("sso"),
                &pending,
                status,
            )?;
            return Ok(FlowResult::Response(response));
        }
        super::super::invite_codes::activate_user(&user.id)?;
    }
    if crate::data::totp::has_mfa(&user.id)? {
        let response = completion::mfa(&user, pending_identity.as_ref(), &input.pending.entry)?;
        return Ok(FlowResult::Response(response));
    }
    let redirect = input.pending.state.redirect_uri.clone();
    let (user, is_new, tokens) = completion::existing(
        user,
        pending_identity.as_ref(),
        &input.pending.entry,
        input.ip,
        input.agent,
    )?;
    Ok(FlowResult::Completed(Box::new((
        user, is_new, tokens, redirect,
    ))))
}

fn new_account(
    validated: Validated,
    binding: String,
    ip: Option<String>,
    agent: Option<String>,
) -> Result<Completed, RouteError> {
    if !validated.provider.allow_registration {
        return Err(RouteError::Status(403, "registration_disabled"));
    }
    let user = build_sso_user(
        sso_user_id(&validated.provider.id, &validated.claims.sub),
        &validated.email,
        validated.claims.email_verified,
        validated.claims.name,
        validated.claims.picture,
        binding.clone(),
    );
    let identity = crate::data::sso_identities::SsoIdentityEntry {
        id: binding,
        user_id: user.id.clone(),
        created_at: clock::now_iso(),
    };
    let redirect = validated.pending.state.redirect_uri.clone();
    let (user, is_new, tokens) = completion::new(
        user,
        &identity,
        &validated.provider.org_id,
        &validated.pending.entry,
        ip,
        agent,
    )?;
    Ok((user, is_new, tokens, redirect))
}

fn emit_events(is_new: bool) {
    let events = if is_new {
        [
            "cedros-login:registered",
            "cedros-login:registration-created",
        ]
    } else {
        ["cedros-login:authenticated", "cedros-login:user-login"]
    };
    for event in events {
        let _ = telemetry::emit_event(
            event,
            "",
            &serde_json::json!({"method":"sso","routeId":"cedros-login:sso-callback"}),
        );
    }
}

fn render(
    request: &RouteRequest,
    frontend: &str,
    outcome: Completed,
) -> Result<RouteResponse, RouteError> {
    let (user, is_new, tokens, redirect_uri) = outcome;
    let Some(tokens) = tokens else {
        let pending = super::super::invite_codes::issue_pending_token(&user.id)?;
        let status = super::super::invite_codes::pending_handoff_status(request, &user)?;
        return auth::respond_invite_code_required(
            201,
            &user,
            is_new,
            Some("sso"),
            &pending,
            status,
        );
    };
    let dest = safe_redirect(redirect_uri, frontend);
    let cfg = cookies::config();
    if !cfg.enabled {
        return Ok(json(200, &to_json(&tokens)?));
    }
    let mut headers = vec![("location".to_string(), dest)];
    headers.extend(cfg.auth_cookies(&tokens, auth::refresh_ttl_secs()));
    Ok(RouteResponse {
        status: 302,
        headers,
        body: String::new(),
    })
}
