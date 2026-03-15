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
}
