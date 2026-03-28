//! Username availability check and suggestion endpoint

use axum::extract::{Query, State};
use axum::Json;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::repositories::UserRepository;
use crate::services::EmailService;
use crate::AppState;

const ADJECTIVES: &[&str] = &[
    "swift", "bright", "calm", "bold", "keen", "noble", "vivid", "brave", "cool", "fair", "glad",
    "kind", "pure", "rare", "sage", "true", "warm", "wise", "deep", "free",
];

const NOUNS: &[&str] = &[
    "falcon", "cedar", "river", "spark", "frost", "stone", "cloud", "ember", "bloom", "coral",
    "drift", "grove", "lunar", "onyx", "pearl", "quill", "ridge", "shade", "thorn", "wave",
];

#[derive(Debug, Deserialize)]
pub struct CheckUsernameQuery {
    #[serde(default)]
    pub username: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckUsernameResponse {
    pub available: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub suggestion: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

/// GET /auth/username/available?username=foo
///
/// Empty username returns a random suggestion. Non-empty checks availability.
pub async fn check_username<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
    Query(query): Query<CheckUsernameQuery>,
) -> Json<CheckUsernameResponse> {
    let username = query.username.trim().to_lowercase();

    // Empty → generate a suggestion
    if username.is_empty() {
        let suggestion = generate_unique_username(state.user_repo.as_ref()).await;
        return Json(CheckUsernameResponse {
            available: false,
            suggestion: Some(suggestion),
            error: None,
        });
    }

    // Validate format
    if let Err(msg) = validate_format(&username) {
        return Json(CheckUsernameResponse {
            available: false,
            suggestion: None,
            error: Some(msg),
        });
    }

    // Check availability
    let taken = state
        .user_repo
        .username_exists(&username)
        .await
        .unwrap_or(true);

    if taken {
        let suggestion = generate_unique_username(state.user_repo.as_ref()).await;
        Json(CheckUsernameResponse {
            available: false,
            suggestion: Some(suggestion),
            error: None,
        })
    } else {
        Json(CheckUsernameResponse {
            available: true,
            suggestion: None,
            error: None,
        })
    }
}

fn validate_format(username: &str) -> Result<(), String> {
    if username.len() < 3 {
        return Err("Username must be at least 3 characters".into());
    }
    if username.len() > 30 {
        return Err("Username must be 30 characters or less".into());
    }
    if !username
        .chars()
        .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_')
    {
        return Err("Only lowercase letters, numbers, and underscores allowed".into());
    }
    if username.starts_with('_') || username.ends_with('_') {
        return Err("Cannot start or end with an underscore".into());
    }
    Ok(())
}

/// Generate a random username candidate (synchronous).
fn random_candidate(large_suffix: bool) -> String {
    let mut rng = rand::thread_rng();
    let adj = ADJECTIVES[rng.gen_range(0..ADJECTIVES.len())];
    let noun = NOUNS[rng.gen_range(0..NOUNS.len())];
    if large_suffix {
        let num: u32 = rng.gen_range(1000..10000);
        format!("{adj}_{noun}_{num}")
    } else {
        let num: u32 = rng.gen_range(10..100);
        format!("{adj}_{noun}_{num}")
    }
}

/// Generate a random username that doesn't collide with existing ones.
/// Tries up to 5 candidates before falling back to a 4-digit suffix.
async fn generate_unique_username(user_repo: &dyn UserRepository) -> String {
    for _ in 0..5 {
        let candidate = random_candidate(false);
        if !user_repo.username_exists(&candidate).await.unwrap_or(true) {
            return candidate;
        }
    }

    // Fallback — extremely unlikely to collide with 4-digit suffix
    random_candidate(true)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_format_valid() {
        assert!(validate_format("swift_falcon_42").is_ok());
        assert!(validate_format("abc").is_ok());
        assert!(validate_format("user123").is_ok());
    }

    #[test]
    fn test_validate_format_too_short() {
        assert!(validate_format("ab").is_err());
    }

    #[test]
    fn test_validate_format_leading_underscore() {
        assert!(validate_format("_bad").is_err());
    }

    #[test]
    fn test_validate_format_trailing_underscore() {
        assert!(validate_format("bad_").is_err());
    }

    #[test]
    fn test_validate_format_uppercase() {
        assert!(validate_format("Bad").is_err());
    }

    #[test]
    fn test_validate_format_special_chars() {
        assert!(validate_format("user@name").is_err());
        assert!(validate_format("user-name").is_err());
    }

    #[test]
    fn test_random_candidate_format() {
        for _ in 0..10 {
            let name = random_candidate(false);
            assert!(
                validate_format(&name).is_ok(),
                "Generated name '{name}' should be valid"
            );
        }
    }
}
