//! Image storage service for S3-compatible object storage
//!
//! Supports DigitalOcean Spaces, AWS S3, and any S3-compatible provider.
//! Constructed on-demand from runtime settings (not stored in AppState).

use async_trait::async_trait;
use s3::creds::Credentials;
use s3::Bucket;
use s3::Region;
use uuid::Uuid;

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
    bucket: Box<Bucket>,
    cdn_url: Option<String>,
}

impl S3ImageStorageService {
    /// Create from configuration. Returns error if credentials or bucket are invalid.
    pub fn new(config: S3ImageStorageConfig) -> Result<Self, AppError> {
        let region = if config.endpoint.is_empty() {
            Region::Custom {
                region: config.region.clone(),
                endpoint: format!("https://s3.{}.amazonaws.com", config.region),
            }
        } else {
            Region::Custom {
                region: config.region.clone(),
                endpoint: config.endpoint.clone(),
            }
        };

        let credentials = Credentials::new(
            Some(&config.access_key),
            Some(&config.secret_key),
            None,
            None,
            None,
        )
        .map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Invalid S3 credentials: {}", e))
        })?;

        let bucket =
            Bucket::new(&config.bucket, region, credentials).map_err(|e| {
                AppError::Internal(anyhow::anyhow!("Failed to create S3 bucket handle: {}", e))
            })?;

        let cdn_url = config
            .cdn_url
            .filter(|u| !u.is_empty())
            .map(|u| u.trim_end_matches('/').to_string());

        Ok(Self { bucket, cdn_url })
    }
}

#[async_trait]
impl ImageStorageService for S3ImageStorageService {
    async fn upload_avatar(&self, user_id: Uuid, data: &[u8]) -> Result<String, AppError> {
        let key = format!("avatars/{}.webp", user_id);

        self.bucket
            .put_object_with_content_type(&key, data, "image/webp")
            .await
            .map_err(|e| {
                tracing::error!(error = %e, key = %key, "Failed to upload avatar to S3");
                AppError::Internal(anyhow::anyhow!("Failed to upload avatar: {}", e))
            })?;

        // Build public URL
        let url = if let Some(cdn) = &self.cdn_url {
            format!("{}/{}", cdn, key)
        } else {
            // Fallback: construct from bucket URL
            format!("{}/{}", self.bucket.url(), key)
        };

        Ok(url)
    }

    async fn delete_avatar(&self, key: &str) -> Result<(), AppError> {
        self.bucket.delete_object(key).await.map_err(|e| {
            tracing::error!(error = %e, key = %key, "Failed to delete avatar from S3");
            AppError::Internal(anyhow::anyhow!("Failed to delete avatar: {}", e))
        })?;

        Ok(())
    }

    async fn upload_document(
        &self,
        s3_key: &str,
        data: &[u8],
        content_type: &str,
    ) -> Result<(), AppError> {
        self.bucket
            .put_object_with_content_type(s3_key, data, content_type)
            .await
            .map_err(|e| {
                tracing::error!(error = %e, key = %s3_key, "Failed to upload document to S3");
                AppError::Internal(anyhow::anyhow!("Failed to upload document: {}", e))
            })?;
        Ok(())
    }

    async fn presign_get(&self, s3_key: &str, expiry_secs: u32) -> Result<String, AppError> {
        self.bucket
            .presign_get(s3_key, expiry_secs, None)
            .await
            .map_err(|e| {
                tracing::error!(error = %e, key = %s3_key, "Failed to generate presigned URL");
                AppError::Internal(anyhow::anyhow!("Failed to generate presigned URL: {}", e))
            })
    }
}
