//! Image processing utility for avatar uploads
//!
//! Decodes, resizes to 256x256 (center-crop), and encodes as WebP.

use image::imageops::FilterType;
use image::ImageReader;
use image::{DynamicImage, ImageFormat};
use std::io::Cursor;

use crate::errors::AppError;

/// Maximum input file size (5 MB)
const MAX_INPUT_SIZE: usize = 5 * 1024 * 1024;

/// Output avatar dimensions
const AVATAR_SIZE: u32 = 256;

/// Process raw image bytes into a 256x256 WebP avatar.
///
/// - Validates input size (max 5 MB)
/// - Auto-detects format (JPEG, PNG, GIF, WebP)
/// - Center-crops to square, then resizes to 256x256
/// - Encodes as WebP
pub fn process_avatar(input: &[u8]) -> Result<Vec<u8>, AppError> {
    if input.len() > MAX_INPUT_SIZE {
        return Err(AppError::Validation(format!(
            "Image too large ({:.1} MB). Maximum is 5 MB.",
            input.len() as f64 / 1_048_576.0
        )));
    }

    if input.is_empty() {
        return Err(AppError::Validation("Empty image data".into()));
    }

    // Decode
    let reader = ImageReader::new(Cursor::new(input))
        .with_guessed_format()
        .map_err(|e| AppError::Validation(format!("Cannot read image: {}", e)))?;

    let img = reader
        .decode()
        .map_err(|e| AppError::Validation(format!("Unsupported or corrupt image: {}", e)))?;

    // Center-crop to square
    let cropped = center_crop_square(img);

    // Resize to 256x256
    let resized = cropped.resize_exact(AVATAR_SIZE, AVATAR_SIZE, FilterType::Lanczos3);

    // Encode as WebP
    let mut output = Cursor::new(Vec::new());
    resized
        .write_to(&mut output, ImageFormat::WebP)
        .map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to encode avatar as WebP: {}", e))
        })?;

    Ok(output.into_inner())
}

/// Crop an image to a centered square using the shorter dimension.
fn center_crop_square(img: DynamicImage) -> DynamicImage {
    let (w, h) = (img.width(), img.height());
    if w == h {
        return img;
    }

    let side = w.min(h);
    let x = (w - side) / 2;
    let y = (h - side) / 2;
    img.crop_imm(x, y, side, side)
}
