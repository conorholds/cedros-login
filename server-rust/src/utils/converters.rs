//! Type conversion utilities

use crate::models::AuthUser;
use crate::repositories::UserEntity;

/// Convert a UserEntity from the repository to an AuthUser for API responses.
pub fn user_entity_to_auth_user(entity: &UserEntity) -> AuthUser {
    AuthUser {
        id: entity.id,
        email: entity.email.clone(),
        name: entity.name.clone(),
        username: entity.username.clone(),
        picture: entity.picture.clone(),
        wallet_address: entity.wallet_address.clone(),
        auth_methods: entity.auth_methods.clone(),
        email_verified: entity.email_verified,
        created_at: entity.created_at,
        updated_at: entity.updated_at,
        welcome_completed_at: entity.welcome_completed_at,
        referral_code: Some(entity.referral_code.clone()),
        payout_wallet_address: entity.payout_wallet_address.clone(),
    }
}
