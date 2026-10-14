//! Image storage service for S3-compatible object storage
//!
//! Supports DigitalOcean Spaces, AWS S3, and any S3-compatible provider.
//! Constructed on-demand from runtime settings (not stored in AppState).

use async_trait::async_trait;
use aws_sdk_s3::config::{BehaviorVersion, Credentials, Region};
use aws_sdk_s3::presigning::PresigningConfig;
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::{Client, Config};
use std::time::Duration;
use uuid::Uuid;

use super::settings_service::SettingsService;
use crate::errors::AppError;

/// Trait for image storage operations
#[async_trait]
pub trait ImageStorageService: Send + Sync {
    /// Upload a processed avatar image, returning the public URL.
    async fn upload_avatar(&self, user_id: Uuid, data: &[u8]) -> Result<String, AppError>;

    /// Delete an avatar by its object key.
    async fn delete_avatar(&self, key: &str) -> Result<(), AppError>;

    /// Upload raw bytes to an arbitrary S3 key with the given content type.
    /// Returns the resulting object key (same as `s3_key`).
    async fn upload_document(
        &self,
        s3_key: &str,
        data: &[u8],
        content_type: &str,
    ) -> Result<(), AppError>;

    /// Generate a presigned GET URL for the given S3 key.
    /// `expiry_secs` must be ≤ 604800 (7 days).
    async fn presign_get(&self, s3_key: &str, expiry_secs: u32) -> Result<String, AppError>;
}

/// Configuration for S3-compatible image storage
pub struct S3ImageStorageConfig {
    pub bucket: String,
    pub region: String,
    pub endpoint: String,
    pub access_key: String,
    pub secret_key: String,
    /// Optional CDN URL prefix (e.g. https://cdn.example.com). Falls back to bucket URL.
    pub cdn_url: Option<String>,
}

/// S3-compatible image storage implementation
pub struct S3ImageStorageService {
    client: Client,
    bucket: String,
    public_base_url: String,
    cdn_url: Option<String>,
}

impl S3ImageStorageService {
    /// Create from configuration. Returns error if credentials or bucket are invalid.
    pub fn new(config: S3ImageStorageConfig) -> Result<Self, AppError> {
        if config.bucket.is_empty() || config.access_key.is_empty() || config.secret_key.is_empty()
        {
            return Err(AppError::Validation(
                "Image storage bucket and credentials are required".into(),
            ));
        }
        let endpoint = if config.endpoint.is_empty() {
            format!("https://s3.{}.amazonaws.com", config.region)
        } else {
            config.endpoint.trim_end_matches('/').to_string()
        };
        let public_base_url = bucket_public_url(&endpoint, &config.bucket)?;
        let sdk_config = Config::builder()
            .behavior_version(BehaviorVersion::latest())
            .region(Region::new(config.region.clone()))
            .credentials_provider(Credentials::new(
                config.access_key,
                config.secret_key,
                None,
                None,
                "cedros-login",
            ))
            .endpoint_url(endpoint)
            .force_path_style(false)
            .build();
        let cdn_url = config
            .cdn_url
            .filter(|u| !u.is_empty())
            .map(|u| u.trim_end_matches('/').to_string());

        Ok(Self {
            client: Client::from_conf(sdk_config),
            bucket: config.bucket,
            public_base_url,
            cdn_url,
        })
    }
}

fn bucket_public_url(endpoint: &str, bucket: &str) -> Result<String, AppError> {
    let mut url = url::Url::parse(endpoint).map_err(|error| {
        AppError::Validation(format!("Invalid image storage endpoint: {error}"))
    })?;
    let host = url
        .host_str()
        .ok_or_else(|| AppError::Validation("Image storage endpoint requires a host".into()))?;
    url.set_host(Some(&format!("{bucket}.{host}")))
        .map_err(|_| AppError::Validation("Invalid image storage bucket or endpoint".into()))?;
    Ok(url.to_string().trim_end_matches('/').to_string())
}

/// Return the deterministic avatar object key for a user.
pub(crate) fn avatar_key_for_user(user_id: Uuid) -> String {
    format!("avatars/{user_id}.webp")
}

/// Build an S3ImageStorageService from runtime settings, decrypting secrets.
pub(crate) async fn build_s3_image_storage_service(
    settings: &SettingsService,
) -> Result<S3ImageStorageService, AppError> {
    let bucket = settings
        .get("image_storage_bucket")
        .await?
        .unwrap_or_default();
    let region = settings
        .get("image_storage_region")
        .await?
        .unwrap_or_default();
    let endpoint = settings
        .get("image_storage_endpoint")
        .await?
        .unwrap_or_default();
    let cdn_url = settings
        .get("image_storage_cdn_url")
        .await?
        .unwrap_or_default();

    let access_key = settings
        .get_secret("image_storage_access_key")
        .await?
        .unwrap_or_default();
    let secret_key = settings
        .get_secret("image_storage_secret_key")
        .await?
        .unwrap_or_default();

    if bucket.is_empty() {
        return Err(AppError::Validation(
            "Image storage bucket is not configured".into(),
        ));
    }
    if access_key.is_empty() || secret_key.is_empty() {
        return Err(AppError::Validation(
            "Image storage credentials are not configured".into(),
        ));
    }

    S3ImageStorageService::new(S3ImageStorageConfig {
        bucket,
        region,
        endpoint,
        access_key,
        secret_key,
        cdn_url: Some(cdn_url),
    })
}

#[async_trait]
impl ImageStorageService for S3ImageStorageService {
    async fn upload_avatar(&self, user_id: Uuid, data: &[u8]) -> Result<String, AppError> {
        let key = avatar_key_for_user(user_id);

        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(&key)
            .content_type("image/webp")
            .body(ByteStream::from(data.to_vec()))
            .send()
            .await
            .map_err(|e| {
                tracing::error!(error = %e, key = %key, "Failed to upload avatar to S3");
                AppError::Internal(anyhow::anyhow!("Failed to upload avatar: {e}"))
            })?;

        // Build public URL
        let url = if let Some(cdn) = &self.cdn_url {
            format!("{cdn}/{key}")
        } else {
            // Fallback: construct from bucket URL
            format!("{}/{key}", self.public_base_url)
        };

        Ok(url)
    }

    async fn delete_avatar(&self, key: &str) -> Result<(), AppError> {
        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
            .map_err(|e| {
                tracing::error!(error = %e, key = %key, "Failed to delete avatar from S3");
                AppError::Internal(anyhow::anyhow!("Failed to delete avatar: {e}"))
            })?;

        Ok(())
    }

    async fn upload_document(
        &self,
        s3_key: &str,
        data: &[u8],
        content_type: &str,
    ) -> Result<(), AppError> {
        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(s3_key)
            .content_type(content_type)
            .body(ByteStream::from(data.to_vec()))
            .send()
            .await
            .map_err(|e| {
                tracing::error!(error = %e, key = %s3_key, "Failed to upload document to S3");
                AppError::Internal(anyhow::anyhow!("Failed to upload document: {e}"))
            })?;
        Ok(())
    }

    async fn presign_get(&self, s3_key: &str, expiry_secs: u32) -> Result<String, AppError> {
        let presigning = PresigningConfig::expires_in(Duration::from_secs(expiry_secs.into()))
            .map_err(|e| AppError::Validation(format!("Invalid presign expiry: {e}")))?;
        self.client
            .get_object()
            .bucket(&self.bucket)
            .key(s3_key)
            .presigned(presigning)
            .await
            .map(|request| request.uri().to_string())
            .map_err(|e| {
                tracing::error!(error = %e, key = %s3_key, "Failed to generate presigned URL");
                AppError::Internal(anyhow::anyhow!("Failed to generate presigned URL: {e}"))
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn avatar_key_is_user_scoped_and_predictable() {
        let user_id = Uuid::parse_str("11111111-1111-4111-8111-111111111111").unwrap();

        assert_eq!(
            avatar_key_for_user(user_id),
            "avatars/11111111-1111-4111-8111-111111111111.webp"
        );
    }

    #[test]
    fn public_bucket_url_preserves_endpoint_scheme_port_and_path() {
        assert_eq!(
            bucket_public_url("https://objects.example.test:9443/root", "avatars").unwrap(),
            "https://avatars.objects.example.test:9443/root"
        );
    }

    #[test]
    fn public_bucket_url_rejects_endpoints_without_a_host() {
        assert!(bucket_public_url("not-a-url", "avatars").is_err());
    }
}
