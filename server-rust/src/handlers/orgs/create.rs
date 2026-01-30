//! Create organization handler

use axum::{extract::State, http::HeaderMap, Json};
#[cfg(feature = "postgres")]
use sqlx::PgPool;
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{CreateOrgRequest, OrgResponse};
use crate::repositories::{generate_slug, MembershipEntity, OrgEntity, OrgRole};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

#[cfg(feature = "postgres")]
async fn create_org_with_owner_tx(
    pool: &PgPool,
    org: &OrgEntity,
    membership: &MembershipEntity,
) -> Result<(), AppError> {
    let mut tx = pool
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    sqlx::query(
        r#"
        INSERT INTO organizations (id, name, slug, logo_url, is_personal, owner_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        "#,
    )
    .bind(org.id)
    .bind(&org.name)
    .bind(&org.slug)
    .bind(&org.logo_url)
    .bind(org.is_personal)
    .bind(org.owner_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;

    sqlx::query(
        r#"
        INSERT INTO memberships (id, user_id, org_id, role)
        VALUES ($1, $2, $3, $4)
        "#,
    )
    .bind(membership.id)
    .bind(membership.user_id)
    .bind(membership.org_id)
    .bind(membership.role.as_str())
    .execute(&mut *tx)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;

    tx.commit()
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
    Ok(())
}

/// POST /orgs - Create a new organization
pub async fn create_org<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<CreateOrgRequest>,
) -> Result<Json<OrgResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Validate name
    let name = req.name.trim();
    if name.is_empty() || name.len() > 255 {
        return Err(AppError::Validation(
            "Organization name must be 1-255 characters".into(),
        ));
    }

    // Generate or validate slug
    let slug = match req.slug {
        Some(s) => {
            let s = s.trim().to_lowercase();
            if s.is_empty() || s.len() > 100 {
                return Err(AppError::Validation("Slug must be 1-100 characters".into()));
            }
            // Basic slug validation - alphanumeric and hyphens only
            if !s.chars().all(|c| c.is_alphanumeric() || c == '-') {
                return Err(AppError::Validation(
                    "Slug can only contain letters, numbers, and hyphens".into(),
                ));
            }
            s
        }
        None => generate_slug(name),
    };
    if slug.is_empty() || slug.len() > 100 {
        return Err(AppError::Validation("Slug must be 1-100 characters".into()));
    }

    // Check if slug exists
    if state.org_repo.slug_exists(&slug).await? {
        return Err(AppError::Validation(
            "Organization slug already exists".into(),
        ));
    }

    // Create organization
    let org = OrgEntity::new(name.to_string(), slug, auth.user_id, false);
    let mut created_org = org.clone();

    // Create owner membership
    let membership = MembershipEntity::new(auth.user_id, created_org.id, OrgRole::Owner);
    #[cfg(feature = "postgres")]
    if let Some(pool) = state.postgres_pool.as_ref() {
        create_org_with_owner_tx(pool, &created_org, &membership).await?;
    } else {
        created_org = state.org_repo.create(created_org).await?;
        state.membership_repo.create(membership).await?;
    }

    #[cfg(not(feature = "postgres"))]
    {
        created_org = state.org_repo.create(created_org).await?;
        state.membership_repo.create(membership).await?;
    }

    Ok(Json(OrgResponse::from_entity(&created_org, OrgRole::Owner)))
}
