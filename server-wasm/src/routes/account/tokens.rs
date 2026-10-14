use uuid::Uuid;

use super::{clock, normalize_email};
use crate::data::verifications::VerificationEntry;
use crate::services::tokens::{generate_verification_token, hash_verification_token};

pub(crate) struct PreparedToken {
    pub raw: String,
    pub entry: VerificationEntry,
}

pub(super) fn prepare_email_token(user_id: &str, email: &str) -> PreparedToken {
    prepare_token(
        user_id,
        super::EMAIL_VERIFICATION,
        super::VERIFICATION_TTL_SECS,
        Some(normalize_email(email)),
    )
}

pub(crate) fn prepare_token(
    user_id: &str,
    token_type: &str,
    ttl_secs: i64,
    target_email: Option<String>,
) -> PreparedToken {
    let raw = generate_verification_token();
    let entry = VerificationEntry {
        id: Uuid::new_v4().to_string(),
        user_id: user_id.to_string(),
        token_hash: hash_verification_token(&raw),
        token_type: token_type.to_string(),
        target_email,
        subject_id: None,
        created_at: clock::now_iso(),
        expires_at: clock::in_secs(ttl_secs),
        used_at: None,
    };
    PreparedToken { raw, entry }
}
