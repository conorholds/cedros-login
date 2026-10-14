use crate::data::user_emails::{self, UserEmailEntry};
use crate::data::users::{self, UserEntry};
use crate::host::{Result, SeamError};

pub(super) fn ensure_available(user: &UserEntry, email: &str) -> Result<()> {
    if users::find_by_email(email)?.is_some_and(|owner| owner.id != user.id)
        || user_emails::find_by_email(email)?.is_some_and(|row| row.user_id != user.id)
    {
        return Err(SeamError::Db("email is already in use".into()));
    }
    Ok(())
}

pub(super) fn ensure_target_unique(rows: &[UserEmailEntry], email: &str) -> Result<()> {
    if rows.iter().filter(|row| row.email == email).count() <= 1 {
        return Ok(());
    }
    #[cfg(not(test))]
    crate::host::log::op_error(
        "canonical-email",
        "validate-invariant",
        "duplicate_target_rows",
    );
    Err(inconsistent())
}

pub(super) fn checked_primary(user: &UserEntry, rows: &[UserEmailEntry]) -> Result<()> {
    let primaries: Vec<_> = rows.iter().filter(|row| row.is_primary).collect();
    let valid = match (user.email.as_deref(), primaries.as_slice()) {
        (None, []) => true,
        (Some(email), [row]) => row.email == email && row.is_verified() == user.email_verified,
        _ => false,
    };
    if valid {
        return Ok(());
    }
    let reason = match (user.email.as_deref(), primaries.len()) {
        (Some(_), 0) => "missing_primary",
        (_, count) if count > 1 => "multiple_primaries",
        (None, _) => "primary_without_user_email",
        _ => "primary_mismatch",
    };
    #[cfg(not(test))]
    crate::host::log::op_error("canonical-email", "validate-invariant", reason);
    #[cfg(test)]
    let _ = reason;
    Err(inconsistent())
}

fn inconsistent() -> SeamError {
    SeamError::Db("canonical email state is inconsistent; repair is required".into())
}
