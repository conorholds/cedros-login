//! PostgreSQL atomic MFA challenge, factor, and session claim.

use async_trait::async_trait;
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use super::session_repository::insert_session;
use crate::errors::AppError;
use crate::repositories::{
    AtomicMfaRepository, MfaFactorClaim, MfaFactorClaimOutcome, SessionEntity,
};

pub struct PostgresAtomicMfaRepository {
    pool: PgPool,
}

impl PostgresAtomicMfaRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl AtomicMfaRepository for PostgresAtomicMfaRepository {
    async fn claim_with_session(
        &self,
        token_hash: &str,
        user_id: Uuid,
        factor: MfaFactorClaim,
        session: SessionEntity,
    ) -> Result<MfaFactorClaimOutcome, AppError> {
        if session.user_id != user_id {
            return Err(AppError::Internal(anyhow::anyhow!(
                "MFA session user mismatch"
            )));
        }
        let mut tx = self.pool.begin().await.map_err(internal)?;
        // Password changes take the same account -> challenge -> session locks.
        // A pending proof cannot create a session after that revocation commits.
        sqlx::query("SELECT id FROM users WHERE id = $1 FOR UPDATE")
            .bind(user_id)
            .fetch_optional(&mut *tx)
            .await
            .map_err(internal)?;
        let token_id = lock_challenge(&mut tx, token_hash, user_id).await?;
        let Some(token_id) = token_id else {
            return Ok(MfaFactorClaimOutcome::ChallengeUnavailable);
        };
        if !claim_factor(&mut tx, user_id, factor).await? {
            return Ok(MfaFactorClaimOutcome::FactorUnavailable);
        }
        insert_session(&mut tx, &session).await?;
        let updated = sqlx::query(
            "UPDATE verification_tokens SET used_at = NOW() WHERE id = $1 AND used_at IS NULL",
        )
        .bind(token_id)
        .execute(&mut *tx)
        .await
        .map_err(internal)?;
        if updated.rows_affected() != 1 {
            return Ok(MfaFactorClaimOutcome::ChallengeUnavailable);
        }
        tx.commit().await.map_err(internal)?;
        Ok(MfaFactorClaimOutcome::Claimed)
    }
}

async fn lock_challenge(
    tx: &mut Transaction<'_, Postgres>,
    token_hash: &str,
    user_id: Uuid,
) -> Result<Option<Uuid>, AppError> {
    let row: Option<(Uuid,)> = sqlx::query_as(
        r#"
        SELECT id FROM verification_tokens
        WHERE token_hash = $1 AND user_id = $2 AND token_type = 'mfa_pending'
          AND used_at IS NULL AND expires_at > NOW()
        FOR UPDATE
        "#,
    )
    .bind(token_hash)
    .bind(user_id)
    .fetch_optional(&mut **tx)
    .await
    .map_err(internal)?;
    Ok(row.map(|(id,)| id))
}

async fn claim_factor(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
    factor: MfaFactorClaim,
) -> Result<bool, AppError> {
    let result = match factor {
        MfaFactorClaim::TotpTimeStep {
            enrollment_id,
            time_step,
        } => {
            sqlx::query(
                r#"
            UPDATE totp_secrets SET last_used_time_step = $2
            WHERE user_id = $1 AND enabled = TRUE AND id = $3
              AND (last_used_time_step IS NULL OR last_used_time_step < $2)
            "#,
            )
            .bind(user_id)
            .bind(time_step)
            .bind(enrollment_id)
            .execute(&mut **tx)
            .await
        }
        MfaFactorClaim::RecoveryCode(code_id) => {
            sqlx::query(
                r#"
            UPDATE totp_recovery_codes SET used = TRUE, used_at = NOW()
            WHERE id = $2 AND user_id = $1 AND used = FALSE
              AND EXISTS (
                SELECT 1 FROM totp_secrets
                WHERE user_id = $1 AND enabled = TRUE
              )
            "#,
            )
            .bind(user_id)
            .bind(code_id)
            .execute(&mut **tx)
            .await
        }
    }
    .map_err(internal)?;
    Ok(result.rows_affected() == 1)
}

fn internal(error: sqlx::Error) -> AppError {
    AppError::Internal(error.into())
}
