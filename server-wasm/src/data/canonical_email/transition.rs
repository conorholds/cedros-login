use crate::clock;
use crate::data::canonical_email::VerificationOutcome;
use crate::data::user_emails::{self, UserEmailEntry, VersionedUserEmailEntry};
use crate::data::users::{self, UserEntry, VersionedUserEntry};
use crate::host::db::{self, AtomicBatchOp, ConditionalBatchOp, ConditionalOperation};
use crate::host::{Result, SeamError};

pub(super) struct PlannedVerification {
    pub(super) public: VerificationOutcome,
    pub(super) user: PlannedUser,
    rows: Vec<PlannedEmail>,
    claimed_email: String,
    resets_unverified_credentials: bool,
    revokes_sessions: bool,
}

impl PlannedVerification {
    pub(super) fn operation(&self) -> Result<ConditionalBatchOp> {
        let emails = self
            .rows
            .iter()
            .map(PlannedEmail::params)
            .collect::<Result<Vec<_>>>()?;
        Ok(ConditionalBatchOp::new(
            ConditionalOperation::TransitionCanonicalEmail,
            serde_json::json!({
                "user": {
                    "entryKey": self.user.entry_key,
                    "expectedUpdatedAt": self.user.expected_updated_at,
                    "data": value(&self.user.value)?,
                },
                "emails": emails,
                "claimedEmail": self.claimed_email,
            }),
        ))
    }

    pub(super) fn resets_unverified_credentials(&self) -> bool {
        self.resets_unverified_credentials
    }

    pub(super) fn revokes_sessions(&self) -> bool {
        self.revokes_sessions
    }

    pub(super) fn secondary_email_ids(&self) -> Vec<String> {
        self.rows
            .iter()
            .filter(|row| !row.value.is_primary)
            .map(|row| row.value.id.clone())
            .collect()
    }
}

pub(super) struct PlannedUser {
    pub(super) value: UserEntry,
    entry_key: String,
    expected_updated_at: String,
}

struct PlannedEmail {
    value: UserEmailEntry,
    entry_key: String,
    expected_updated_at: Option<String>,
}

impl PlannedEmail {
    fn params(&self) -> Result<serde_json::Value> {
        let mut params = serde_json::json!({
            "action": "write",
            "entryKey": self.entry_key,
            "data": value(&self.value)?,
        });
        if let Some(expected) = &self.expected_updated_at {
            params["expectedUpdatedAt"] = serde_json::Value::String(expected.clone());
        }
        Ok(params)
    }
}

pub(super) struct Snapshot {
    pub(super) user: VersionedUserEntry,
    pub(super) rows: Vec<VersionedUserEmailEntry>,
}

pub(super) fn snapshot(user_id: &str) -> Result<Option<Snapshot>> {
    let Some(user) = users::find_by_id_versioned(user_id)? else {
        return Ok(None);
    };
    Ok(Some(Snapshot {
        user,
        rows: user_emails::list_by_user_versioned(user_id)?,
    }))
}

pub(super) fn planned(
    public: VerificationOutcome,
    user: UserEntry,
    rows: Vec<UserEmailEntry>,
    state: Snapshot,
    claimed_email: String,
    resets_unverified_credentials: bool,
    revokes_sessions: bool,
) -> PlannedVerification {
    let rows = rows
        .into_iter()
        .map(|value| planned_email(value, &state.rows))
        .collect();
    PlannedVerification {
        public,
        user: PlannedUser {
            value: user,
            entry_key: state.user.entry_key,
            expected_updated_at: state.user.updated_at,
        },
        rows,
        claimed_email,
        resets_unverified_credentials,
        revokes_sessions,
    }
}

fn planned_email(value: UserEmailEntry, state: &[VersionedUserEmailEntry]) -> PlannedEmail {
    let revision = state.iter().find(|row| row.value.id == value.id);
    PlannedEmail {
        entry_key: revision
            .map(|row| row.entry_key.clone())
            .unwrap_or_else(|| value.id.clone()),
        expected_updated_at: revision.map(|row| row.updated_at.clone()),
        value,
    }
}

pub(super) fn plan_transition(
    mut user: UserEntry,
    mut rows: Vec<UserEmailEntry>,
    target_email: &str,
    verified: bool,
    target_id: Option<&str>,
) -> (UserEntry, Vec<UserEmailEntry>) {
    let existing = target_id
        .and_then(|id| rows.iter().position(|row| row.id == id))
        .or_else(|| rows.iter().position(|row| row.email == target_email));
    let target_index = existing.unwrap_or_else(|| {
        rows.push(UserEmailEntry::new(
            &user.id,
            target_email.to_string(),
            verified,
            false,
        ));
        rows.len() - 1
    });
    for (index, row) in rows.iter_mut().enumerate() {
        row.is_primary = index == target_index;
    }
    rows[target_index].verified_at = if verified {
        rows[target_index]
            .verified_at
            .clone()
            .or_else(|| Some(clock::now_iso()))
    } else {
        None
    };
    user.email = Some(target_email.to_string());
    user.email_verified = verified;
    user.updated_at = clock::now_iso();
    (user, rows)
}

pub(super) fn write_transition(transition: &PlannedVerification) -> Result<()> {
    let ops = [AtomicBatchOp::from(transition.operation()?)];
    db::batch_with_results(&ops)?;
    Ok(())
}

fn value<T: serde::Serialize>(value: &T) -> Result<serde_json::Value> {
    serde_json::to_value(value).map_err(|error| SeamError::Encoding(error.to_string()))
}
