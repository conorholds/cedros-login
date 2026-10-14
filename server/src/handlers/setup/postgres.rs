use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{OrgEntity, OrgRole, UserEntity};

const SETUP_ADVISORY_LOCK_KEY: i64 = 8_827_381_001;

pub(super) async fn create_first_admin_postgres_atomic(
    pool: &PgPool,
    user: &UserEntity,
    org: &OrgEntity,
) -> Result<(), AppError> {
    let mut tx = pool
        .begin()
        .await
        .map_err(|error| database_error("begin setup transaction", error))?;

    acquire_setup_lock(&mut tx).await?;
    insert_user(&mut tx, user).await?;
    insert_primary_email(&mut tx, user).await?;
    insert_org(&mut tx, org).await?;
    upsert_default_org(&mut tx, org).await?;
    insert_owner_membership(&mut tx, user, org).await?;

    tx.commit()
        .await
        .map_err(|error| database_error("commit setup transaction", error))
}

async fn acquire_setup_lock(tx: &mut Transaction<'_, Postgres>) -> Result<(), AppError> {
    // Cross-process serialization for multi-instance deployments. PostgreSQL
    // holds this advisory lock for the transaction lifetime.
    sqlx::query("SELECT pg_advisory_xact_lock($1)")
        .bind(SETUP_ADVISORY_LOCK_KEY)
        .execute(&mut **tx)
        .await
        .map_err(|error| database_error("acquire setup advisory lock", error))?;
    Ok(())
}

async fn insert_user(
    tx: &mut Transaction<'_, Postgres>,
    user: &UserEntity,
) -> Result<(), AppError> {
    sqlx::query(
        r#"
        INSERT INTO users (
            id, email, email_verified, password_hash, name, picture, wallet_address, google_id,
            apple_id, auth_methods, is_system_admin, created_at, updated_at, last_login_at,
            referral_code, referred_by
        ) VALUES (
            $1, $2, $3, $4, $5, NULL, NULL, NULL,
            NULL, $6, $7, $8, $9, $10, $11, $12
        )
        "#,
    )
    .bind(user.id)
    .bind(&user.email)
    .bind(user.email_verified)
    .bind(&user.password_hash)
    .bind(&user.name)
    .bind(vec!["email".to_string()])
    .bind(user.is_system_admin)
    .bind(user.created_at)
    .bind(user.updated_at)
    .bind(user.last_login_at)
    .bind(&user.referral_code)
    .bind(user.referred_by)
    .execute(&mut **tx)
    .await
    .map_err(|error| database_error("create setup admin user", error))?;
    Ok(())
}

async fn insert_primary_email(
    tx: &mut Transaction<'_, Postgres>,
    user: &UserEntity,
) -> Result<(), AppError> {
    let Some(email) = &user.email else {
        return Ok(());
    };
    sqlx::query(
        r#"
        INSERT INTO user_emails
            (id, user_id, email, verified_at, is_primary, created_at)
        VALUES ($1, $2, $3, $4, true, $5)
        ON CONFLICT (email) DO NOTHING
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(user.id)
    .bind(email)
    .bind(user.updated_at)
    .bind(user.created_at)
    .execute(&mut **tx)
    .await
    .map_err(|error| database_error("create setup admin email", error))?;
    Ok(())
}

async fn insert_org(tx: &mut Transaction<'_, Postgres>, org: &OrgEntity) -> Result<(), AppError> {
    sqlx::query(
        r#"
        INSERT INTO organizations
            (id, name, slug, logo_url, is_personal, owner_id, created_at, updated_at)
        VALUES ($1, $2, $3, NULL, $4, $5, $6, $7)
        "#,
    )
    .bind(org.id)
    .bind(&org.name)
    .bind(&org.slug)
    .bind(org.is_personal)
    .bind(org.owner_id)
    .bind(org.created_at)
    .bind(org.updated_at)
    .execute(&mut **tx)
    .await
    .map_err(|error| database_error("create setup organization", error))?;
    Ok(())
}

async fn upsert_default_org(
    tx: &mut Transaction<'_, Postgres>,
    org: &OrgEntity,
) -> Result<(), AppError> {
    sqlx::query(
        r#"
        INSERT INTO system_settings
            (key, value, category, description, is_secret, encryption_version, updated_at, updated_by)
        VALUES ($1, $2, $3, NULL, false, NULL, NOW(), NULL)
        ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            category = EXCLUDED.category,
            updated_at = NOW(),
            updated_by = NULL
        "#,
    )
    .bind("default_org_id")
    .bind(org.id.to_string())
    .bind("org")
    .execute(&mut **tx)
    .await
    .map_err(|error| database_error("set default org id", error))?;
    Ok(())
}

async fn insert_owner_membership(
    tx: &mut Transaction<'_, Postgres>,
    user: &UserEntity,
    org: &OrgEntity,
) -> Result<(), AppError> {
    sqlx::query(
        r#"
        INSERT INTO memberships (id, user_id, org_id, role, joined_at)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(user.id)
    .bind(org.id)
    .bind(OrgRole::Owner.as_str())
    .bind(chrono::Utc::now())
    .execute(&mut **tx)
    .await
    .map_err(|error| database_error("create owner membership", error))?;
    Ok(())
}

fn database_error(context: &str, error: sqlx::Error) -> AppError {
    AppError::Database(format!("Failed to {context}: {error}"))
}
