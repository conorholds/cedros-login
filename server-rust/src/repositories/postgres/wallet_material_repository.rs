//! PostgreSQL wallet material repository implementation (v2 - server-side signing)

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde_json::Value as JsonValue;
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    CreateWalletMaterial, KdfParams, RotateUserSecret, ShareAAuthMethod, WalletMaterialEntity,
    WalletMaterialRepository,
};

/// PostgreSQL wallet material repository
pub struct PostgresWalletMaterialRepository {
    pool: PgPool,
}

impl PostgresWalletMaterialRepository {
    /// Create a new Postgres wallet material repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct WalletMaterialRow {
    id: Uuid,
    user_id: Uuid,
    solana_pubkey: String,
    scheme_version: i16,
    share_a_auth_method: String, // NOT NULL in v2
    share_a_ciphertext: Vec<u8>,
    share_a_nonce: Vec<u8>,
    share_a_kdf_salt: Option<Vec<u8>>,
    share_a_kdf_params_json: Option<JsonValue>,
    prf_salt: Option<Vec<u8>>,
    share_a_pin_hash: Option<String>,
    share_b: Vec<u8>, // NOT NULL in v2 (33 bytes: index + value)
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl TryFrom<WalletMaterialRow> for WalletMaterialEntity {
    type Error = AppError;

    fn try_from(row: WalletMaterialRow) -> Result<Self, Self::Error> {
        let kdf_params: Option<KdfParams> = row
            .share_a_kdf_params_json
            .map(serde_json::from_value)
            .transpose()
            .map_err(|e| AppError::Internal(e.into()))?;

        let auth_method = row
            .share_a_auth_method
            .parse::<ShareAAuthMethod>()
            .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;

        Ok(Self {
            id: row.id,
            user_id: row.user_id,
            solana_pubkey: row.solana_pubkey,
            scheme_version: row.scheme_version,
            share_a_auth_method: auth_method,
            share_a_ciphertext: row.share_a_ciphertext,
            share_a_nonce: row.share_a_nonce,
            share_a_kdf_salt: row.share_a_kdf_salt,
            share_a_kdf_params: kdf_params,
            prf_salt: row.prf_salt,
            share_a_pin_hash: row.share_a_pin_hash,
            share_b: row.share_b,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}

#[async_trait]
impl WalletMaterialRepository for PostgresWalletMaterialRepository {
    async fn create(
        &self,
        material: CreateWalletMaterial,
    ) -> Result<WalletMaterialEntity, AppError> {
        let kdf_params_json: Option<JsonValue> = material
            .share_a_kdf_params
            .as_ref()
            .map(serde_json::to_value)
            .transpose()
            .map_err(|e| AppError::Internal(e.into()))?;

        let auth_method_str = material.share_a_auth_method.to_string();

        let row: WalletMaterialRow = sqlx::query_as(
            r#"
            INSERT INTO solana_wallet_material (
                id, user_id, solana_pubkey, scheme_version,
                share_a_auth_method, share_a_ciphertext, share_a_nonce,
                share_a_kdf_salt, share_a_kdf_params_json, prf_salt, share_a_pin_hash,
                share_b, shamir_t, shamir_n,
                created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 2, 3, NOW(), NOW())
            RETURNING id, user_id, solana_pubkey, scheme_version,
                      share_a_auth_method, share_a_ciphertext, share_a_nonce,
                      share_a_kdf_salt, share_a_kdf_params_json, prf_salt, share_a_pin_hash,
                      share_b, created_at, updated_at
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(material.user_id)
        .bind(&material.solana_pubkey)
        .bind(2i16) // scheme_version = 2 for v2
        .bind(&auth_method_str)
        .bind(&material.share_a_ciphertext)
        .bind(&material.share_a_nonce)
        .bind(&material.share_a_kdf_salt)
        .bind(&kdf_params_json)
        .bind(&material.prf_salt)
        .bind(&material.share_a_pin_hash)
        .bind(&material.share_b)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| {
            if let sqlx::Error::Database(ref db_err) = e {
                if let Some(constraint) = db_err.constraint() {
                    if constraint == "idx_solana_wallet_user"
                        || constraint == "solana_wallet_material_user_id_key"
                    {
                        return AppError::Validation("User already has wallet material".into());
                    }
                    if constraint == "idx_solana_wallet_pubkey" {
                        return AppError::Validation("Solana pubkey already registered".into());
                    }
                }
            }
            AppError::Internal(e.into())
        })?;

        row.try_into()
    }

    async fn find_by_user(&self, user_id: Uuid) -> Result<Option<WalletMaterialEntity>, AppError> {
        let row: Option<WalletMaterialRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, solana_pubkey, scheme_version,
                   share_a_auth_method, share_a_ciphertext, share_a_nonce,
                   share_a_kdf_salt, share_a_kdf_params_json, prf_salt, share_a_pin_hash,
                   share_b, created_at, updated_at
            FROM solana_wallet_material
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(TryInto::try_into).transpose()
    }

    async fn find_by_pubkey(&self, pubkey: &str) -> Result<Option<WalletMaterialEntity>, AppError> {
        let row: Option<WalletMaterialRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, solana_pubkey, scheme_version,
                   share_a_auth_method, share_a_ciphertext, share_a_nonce,
                   share_a_kdf_salt, share_a_kdf_params_json, prf_salt, share_a_pin_hash,
                   share_b, created_at, updated_at
            FROM solana_wallet_material
            WHERE solana_pubkey = $1
            "#,
        )
        .bind(pubkey)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(TryInto::try_into).transpose()
    }

    async fn find_by_pubkeys(
        &self,
        pubkeys: &[String],
    ) -> Result<Vec<WalletMaterialEntity>, AppError> {
        if pubkeys.is_empty() {
            return Ok(Vec::new());
        }

        let pubkeys: Vec<String> = pubkeys.to_vec();
        let rows: Vec<WalletMaterialRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, solana_pubkey, scheme_version,
                   share_a_auth_method, share_a_ciphertext, share_a_nonce,
                   share_a_kdf_salt, share_a_kdf_params_json, prf_salt, share_a_pin_hash,
                   share_b, created_at, updated_at
            FROM solana_wallet_material
            WHERE solana_pubkey = ANY($1)
            "#,
        )
        .bind(pubkeys)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        rows.into_iter()
            .map(TryInto::try_into)
            .collect::<Result<Vec<_>, AppError>>()
    }

    async fn exists_for_user(&self, user_id: Uuid) -> Result<bool, AppError> {
        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM solana_wallet_material WHERE user_id = $1)",
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(exists)
    }

    async fn rotate_user_secret(
        &self,
        user_id: Uuid,
        params: RotateUserSecret,
    ) -> Result<WalletMaterialEntity, AppError> {
        let kdf_params_json: Option<JsonValue> = params
            .share_a_kdf_params
            .as_ref()
            .map(serde_json::to_value)
            .transpose()
            .map_err(|e| AppError::Internal(e.into()))?;

        let auth_method_str = params.new_auth_method.to_string();

        let row: Option<WalletMaterialRow> = sqlx::query_as(
            r#"
            UPDATE solana_wallet_material
            SET share_a_auth_method = $2,
                share_a_ciphertext = $3,
                share_a_nonce = $4,
                share_a_kdf_salt = $5,
                share_a_kdf_params_json = $6,
                prf_salt = $7,
                share_a_pin_hash = $8,
                updated_at = NOW()
            WHERE user_id = $1
            RETURNING id, user_id, solana_pubkey, scheme_version,
                      share_a_auth_method, share_a_ciphertext, share_a_nonce,
                      share_a_kdf_salt, share_a_kdf_params_json, prf_salt, share_a_pin_hash,
                      share_b, created_at, updated_at
            "#,
        )
        .bind(user_id)
        .bind(&auth_method_str)
        .bind(&params.share_a_ciphertext)
        .bind(&params.share_a_nonce)
        .bind(&params.share_a_kdf_salt)
        .bind(&kdf_params_json)
        .bind(&params.prf_salt)
        .bind(&params.share_a_pin_hash)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let row = row.ok_or_else(|| AppError::NotFound("Wallet material not found".into()))?;
        row.try_into()
    }

    async fn delete_by_user(&self, user_id: Uuid) -> Result<(), AppError> {
        sqlx::query("DELETE FROM solana_wallet_material WHERE user_id = $1")
            .bind(user_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }
}
