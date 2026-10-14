use uuid::Uuid;

use crate::models::AuthMethod;
use crate::repositories::UserEntity;

/// Row type for user queries.
#[derive(sqlx::FromRow)]
pub(in crate::repositories::postgres) struct UserRow {
    id: Uuid,
    email: Option<String>,
    email_verified: bool,
    password_hash: Option<String>,
    name: Option<String>,
    username: Option<String>,
    picture: Option<String>,
    wallet_address: Option<String>,
    google_id: Option<String>,
    apple_id: Option<String>,
    auth_methods: Vec<String>,
    is_system_admin: bool,
    created_at: chrono::DateTime<chrono::Utc>,
    updated_at: chrono::DateTime<chrono::Utc>,
    last_login_at: Option<chrono::DateTime<chrono::Utc>>,
    welcome_completed_at: Option<chrono::DateTime<chrono::Utc>>,
    referral_code: String,
    referred_by: Option<Uuid>,
}

impl From<UserRow> for UserEntity {
    fn from(row: UserRow) -> Self {
        Self {
            id: row.id,
            email: row.email,
            email_verified: row.email_verified,
            password_hash: row.password_hash,
            name: row.name,
            username: row.username,
            picture: row.picture,
            wallet_address: row.wallet_address,
            google_id: row.google_id,
            apple_id: row.apple_id,
            auth_methods: row
                .auth_methods
                .into_iter()
                .filter_map(|method| match method.as_str() {
                    "email" => Some(AuthMethod::Email),
                    "google" => Some(AuthMethod::Google),
                    "solana" => Some(AuthMethod::Solana),
                    "apple" => Some(AuthMethod::Apple),
                    "webauthn" => Some(AuthMethod::WebAuthn),
                    "sso" => Some(AuthMethod::Sso),
                    _ => None,
                })
                .collect(),
            is_system_admin: row.is_system_admin,
            created_at: row.created_at,
            updated_at: row.updated_at,
            last_login_at: row.last_login_at,
            welcome_completed_at: row.welcome_completed_at,
            referral_code: row.referral_code,
            referred_by: row.referred_by,
        }
    }
}

pub(super) fn auth_methods_to_strings(methods: &[AuthMethod]) -> Vec<String> {
    methods
        .iter()
        .map(|method| match method {
            AuthMethod::Email => "email".to_string(),
            AuthMethod::Google => "google".to_string(),
            AuthMethod::Apple => "apple".to_string(),
            AuthMethod::Solana => "solana".to_string(),
            AuthMethod::WebAuthn => "webauthn".to_string(),
            AuthMethod::Sso => "sso".to_string(),
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_auth_methods_roundtrip() {
        let row = UserRow {
            id: Uuid::new_v4(),
            email: Some("test@example.com".to_string()),
            email_verified: true,
            password_hash: Some("hash".to_string()),
            name: Some("Test".to_string()),
            username: None,
            picture: None,
            wallet_address: None,
            google_id: None,
            apple_id: None,
            auth_methods: vec![
                "email".to_string(),
                "webauthn".to_string(),
                "sso".to_string(),
            ],
            is_system_admin: false,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            last_login_at: None,
            welcome_completed_at: None,
            referral_code: "TESTCODE".to_string(),
            referred_by: None,
        };

        let entity: UserEntity = row.into();
        assert!(entity.auth_methods.contains(&AuthMethod::Email));
        assert!(entity.auth_methods.contains(&AuthMethod::WebAuthn));
        assert!(entity.auth_methods.contains(&AuthMethod::Sso));
    }
}
