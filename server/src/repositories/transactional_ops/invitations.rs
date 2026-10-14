//! Durable invitation issuance: replacement, seat reservation and email enqueue.
use super::TransactionalOps;
use crate::errors::AppError;
use crate::repositories::{InviteEntity, OutboxEvent};
use sqlx::PgPool;

impl TransactionalOps {
    pub async fn issue_invite_atomic(
        pool: &PgPool,
        invite: &InviteEntity,
        replacement: Option<&InviteEntity>,
        email: Option<&OutboxEvent>,
        seat_limit: Option<(&str, u64)>,
    ) -> Result<(), AppError> {
        let mut tx = pool.begin().await.map_err(db)?;
        let org: Option<uuid::Uuid> =
            sqlx::query_scalar("SELECT id FROM organizations WHERE id=$1 FOR UPDATE")
                .bind(invite.org_id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(db)?;
        if org.is_none() {
            return Err(AppError::NotFound("Organization not found".into()));
        }
        let actor: Option<String> = sqlx::query_scalar(
            "SELECT role FROM memberships WHERE org_id=$1 AND user_id=$2 FOR UPDATE",
        )
        .bind(invite.org_id)
        .bind(invite.invited_by)
        .fetch_optional(&mut *tx)
        .await
        .map_err(db)?;
        if !matches!(actor.as_deref(), Some("owner" | "admin"))
            || (invite.role.as_str() == "owner" && actor.as_deref() != Some("owner"))
        {
            return Err(AppError::Forbidden("Invitation authority changed".into()));
        }
        if let Some(previous) = replacement {
            if previous.org_id != invite.org_id
                || previous.email != invite.email
                || previous.wallet_address != invite.wallet_address
                || previous.role != invite.role
            {
                return Err(AppError::Validation(
                    "Invitation replacement mismatch".into(),
                ));
            }
            let removed = sqlx::query("DELETE FROM invites WHERE id=$1 AND org_id=$2 AND token_hash=$3 AND accepted_at IS NULL")
                .bind(previous.id).bind(previous.org_id).bind(&previous.token_hash).execute(&mut *tx).await.map_err(db)?;
            if removed.rows_affected() != 1 {
                return Err(AppError::Validation(
                    "Invitation changed or was accepted".into(),
                ));
            }
        }
        sqlx::query("INSERT INTO invites (id, org_id, email, wallet_address, role, token_hash, invited_by, created_at, expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)")
            .bind(invite.id).bind(invite.org_id).bind(&invite.email).bind(&invite.wallet_address)
            .bind(invite.role.as_str()).bind(&invite.token_hash).bind(invite.invited_by)
            .bind(invite.created_at).bind(invite.expires_at).execute(&mut *tx).await.map_err(db)?;
        if let Some((plan, limit)) = seat_limit {
            let occupied: i64 = sqlx::query_scalar("SELECT (SELECT COUNT(*) FROM memberships WHERE org_id=$1) + (SELECT COUNT(*) FROM invites WHERE org_id=$1 AND accepted_at IS NULL AND expires_at > NOW())")
                .bind(invite.org_id).fetch_one(&mut *tx).await.map_err(db)?;
            if occupied as u64 > limit {
                return Err(AppError::Validation(format!("The {plan} plan allows {limit} team seats. Upgrade the subscription or remove a pending invitation before adding another team member.")));
            }
        }
        if let Some(event) = email {
            if event.org_id != Some(invite.org_id)
                || event.user_id != Some(invite.invited_by)
                || event.event_type != crate::repositories::OutboxEventType::EmailInvite
            {
                return Err(AppError::Validation(
                    "Invitation email context mismatch".into(),
                ));
            }
            sqlx::query("INSERT INTO outbox_events (id,event_type,payload,max_attempts,org_id,user_id) VALUES ($1,$2,$3,$4,$5,$6)")
                .bind(event.id).bind(event.event_type.as_str()).bind(&event.payload).bind(event.max_attempts as i32)
                .bind(event.org_id).bind(event.user_id).execute(&mut *tx).await.map_err(db)?;
        } else if invite.email.is_some() {
            return Err(AppError::Validation(
                "Email invitation requires durable delivery".into(),
            ));
        }
        tx.commit().await.map_err(db)
    }
}

fn db(error: sqlx::Error) -> AppError {
    AppError::Internal(error.into())
}
