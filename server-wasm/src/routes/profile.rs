//! Account self-service profile routes (part of the `cedros-login:auth` family):
//! get current user, update profile (name/username/picture), mark onboarding
//! complete. Faithful port of the profile handlers in
//! `server/src/handlers/auth/session.rs`.
use serde::{Deserialize, Serialize};

use super::auth::{self, user_view, AuthUserView};
use super::{error_response, json, validation, RouteError};
use crate::clock;
use crate::data::users;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, to_json};

/// Usernames that cannot be claimed.
const RESERVED_USERNAMES: &[&str] = &[
    "admin",
    "system",
    "support",
    "help",
    "root",
    "moderator",
    "mod",
    "staff",
    "cedros",
];

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateProfileRequest {
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    username: Option<String>,
    #[serde(default)]
    picture: Option<String>,
}

#[derive(Serialize)]
struct UserResponse {
    user: AuthUserView,
}

/// Published `cedros-login:user-context` response. It intentionally carries
/// Login-owned identity/session/org state only; site permissions remain Core's.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UserContextResponse {
    authenticated: bool,
    user: AuthUserView,
    session: UserContextSession,
    organization: Option<UserContextOrganization>,
    restrictions: Vec<&'static str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    signup_resume: Option<SignupResume>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SignupResume {
    post_login: Option<auth::PostLoginAction>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UserContextSession {
    id: String,
    valid: bool,
    expires_at: String,
    token_expires_at: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UserContextOrganization {
    id: String,
    name: String,
    slug: String,
    role: String,
}

#[derive(Serialize)]
struct AvailabilityResponse {
    available: bool,
}

pub fn get_user(request: &RouteRequest) -> RouteResponse {
    super::identity_profile::no_store(run(get_user_inner(request)))
}
pub fn update_profile(request: &RouteRequest) -> RouteResponse {
    run(update_profile_inner(request))
}
pub fn welcome_completed(request: &RouteRequest) -> RouteResponse {
    run(welcome_completed_inner(request))
}
pub fn check_username(request: &RouteRequest) -> RouteResponse {
    run(check_username_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// GET /user — the authenticated user's profile.
fn get_user_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let context = auth::authenticated_context(request)?;
    let claims = context.claims;
    let session = context.session;
    let user = context.user;
    // Only explicit signup recovery rechecks Pay. Routine profile/session reads
    // stay independent of billing and never expose the HttpOnly access token.
    let signup_resume = if request
        .query
        .iter()
        .any(|(key, value)| key == "resumeSignup" && value == "true")
    {
        let token = auth::access_token(request).ok_or(RouteError::Status(401, "invalid_token"))?;
        Some(SignupResume {
            post_login: super::subscription_selection::post_login_action(&user.id, &token),
        })
    } else {
        None
    };
    let organization = context
        .organization
        .map(|validated| UserContextOrganization {
            id: validated.org.id,
            name: validated.org.name,
            slug: validated.org.slug,
            role: validated.membership.role,
        });
    let token_expires_at =
        clock::from_unix(claims.exp).ok_or(RouteError::Status(401, "invalid_token"))?;
    Ok(json(
        200,
        &to_json(&UserContextResponse {
            authenticated: true,
            user: user_view(&user),
            session: UserContextSession {
                id: session.id,
                valid: true,
                expires_at: session.expires_at,
                token_expires_at,
            },
            organization,
            restrictions: Vec::new(),
            signup_resume,
        })?,
    ))
}

/// PATCH /me — update name / username / picture (all optional).
fn update_profile_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = auth::authenticated_user(request)?;
    let req: UpdateProfileRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let mut user =
        users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(401, "invalid_token"))?;
    let original = user.clone();

    if let Some(name) = req.name {
        let trimmed = name.trim();
        if trimmed.is_empty() {
            return Err(validation("Name cannot be empty"));
        }
        if trimmed.len() > 100 {
            return Err(validation("Name must be 100 characters or less"));
        }
        user.name = Some(trimmed.to_string());
    }

    if let Some(username) = req.username {
        let trimmed = username.trim().to_lowercase();
        validate_username(&trimmed)?;
        // Allow re-submitting one's own current username; otherwise enforce uniqueness.
        if user.username.as_deref() != Some(trimmed.as_str())
            && users::find_by_username(&trimmed)?.is_some()
        {
            return Err(validation("Username is already taken"));
        }
        user.username = Some(trimmed);
    }

    if let Some(picture) = req.picture {
        let trimmed = picture.trim();
        if trimmed.is_empty() {
            user.picture = None; // empty string clears the picture
        } else {
            if !trimmed.starts_with("https://") && !trimmed.starts_with("http://") {
                return Err(validation("Picture must be a valid URL"));
            }
            if trimmed.len() > 2048 {
                return Err(validation("Picture URL must be 2048 characters or less"));
            }
            user.picture = Some(trimmed.to_string());
        }
    }

    user.updated_at = clock::now_iso();
    users::update_if_current(&original, &user)?;
    Ok(json(
        200,
        &to_json(&UserResponse {
            user: user_view(&user),
        })?,
    ))
}

/// POST /welcome-completed — mark onboarding done (idempotent); 204 No Content.
fn welcome_completed_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = auth::authenticated_user(request)?;
    let mut user =
        users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(401, "invalid_token"))?;
    let original = user.clone();
    if user.welcome_completed_at.is_none() {
        let now = clock::now_iso();
        user.welcome_completed_at = Some(now.clone());
        user.updated_at = now;
        users::update_if_current(&original, &user)?;
    }
    Ok(RouteResponse {
        status: 204,
        headers: vec![],
        body: String::new(),
    })
}

/// GET /username/available?username=X — whether a username is valid + unclaimed.
/// Requires a session (reduces username-enumeration abuse).
fn check_username_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    auth::authenticated_user(request)?;
    let username = request
        .query
        .iter()
        .find(|(key, _)| key == "username")
        .map(|(_, value)| value.trim().to_lowercase())
        .unwrap_or_default();
    let available =
        validate_username(&username).is_ok() && users::find_by_username(&username)?.is_none();
    Ok(json(200, &to_json(&AvailabilityResponse { available })?))
}

/// Validate a username: 3-30 chars, lowercase alphanumeric + underscores, no
/// leading/trailing underscore, not reserved.
fn validate_username(username: &str) -> Result<(), RouteError> {
    if username.len() < 3 {
        return Err(validation("Username must be at least 3 characters"));
    }
    if username.len() > 30 {
        return Err(validation("Username must be 30 characters or less"));
    }
    if !username
        .chars()
        .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_')
    {
        return Err(validation(
            "Username may only contain lowercase letters, numbers, and underscores",
        ));
    }
    if username.starts_with('_') || username.ends_with('_') {
        return Err(validation(
            "Username cannot start or end with an underscore",
        ));
    }
    if RESERVED_USERNAMES.contains(&username) {
        return Err(validation("This username is reserved"));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn username_rules() {
        assert!(validate_username("good_name1").is_ok());
        assert!(matches!(validate_username("ab"), Err(RouteError::Auth(_)))); // too short
        assert!(matches!(
            validate_username("_lead"),
            Err(RouteError::Auth(_))
        )); // leading underscore
        assert!(matches!(validate_username("Bad"), Err(RouteError::Auth(_)))); // uppercase
        assert!(matches!(
            validate_username("admin"),
            Err(RouteError::Auth(_))
        )); // reserved
    }
}
