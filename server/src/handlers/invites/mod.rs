//! Invite handlers

mod accept;
mod cancel;
mod create;
mod list;
mod resend;

pub use accept::accept_invite;
pub use cancel::cancel_invite;
pub use create::create_invite;
pub use list::list_invites;
pub use resend::resend_invite;

use crate::errors::AppError;
use crate::repositories::OrgRole;

fn ensure_invite_role_manageable(
    actor_role: OrgRole,
    invite_role: OrgRole,
) -> Result<(), AppError> {
    if invite_role == OrgRole::Owner && actor_role != OrgRole::Owner {
        return Err(AppError::Forbidden(
            "Only owners can manage owner invitations".into(),
        ));
    }
    Ok(())
}

#[cfg(feature = "postgres")]
async fn prepare_invite_email<
    C: crate::callback::AuthCallback,
    E: crate::services::EmailService,
>(
    state: &std::sync::Arc<crate::AppState<C, E>>,
    invite: &crate::repositories::InviteEntity,
    token: &str,
) -> Result<Option<crate::repositories::OutboxEvent>, AppError> {
    let Some(email) = invite.email.as_deref() else {
        return Ok(None);
    };
    let org = state
        .org_repo
        .find_by_id(invite.org_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Organization not found".into()))?;
    let inviter = state.user_repo.find_by_id(invite.invited_by).await?;
    state
        .comms_service
        .prepare_invite_email(
            email,
            &org.name,
            inviter.as_ref().and_then(|user| user.name.as_deref()),
            invite.role.as_str(),
            token,
            invite.org_id,
            invite.invited_by,
        )
        .map(Some)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn admins_cannot_manage_owner_invitations() {
        assert!(ensure_invite_role_manageable(OrgRole::Owner, OrgRole::Owner).is_ok());
        assert!(matches!(
            ensure_invite_role_manageable(OrgRole::Admin, OrgRole::Owner),
            Err(AppError::Forbidden(_))
        ));
        assert!(ensure_invite_role_manageable(OrgRole::Admin, OrgRole::Member).is_ok());
    }
}
