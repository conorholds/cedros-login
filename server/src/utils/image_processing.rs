//! Image processing utility for avatar uploads
//!
//! Decodes, resizes to 256x256 (center-crop), and encodes as WebP.

use image::imageops::FilterType;
use image::ImageReader;
use image::{ImageError, ImageFormat, Limits};
use std::io::Cursor;

use crate::errors::AppError;

/// Output avatar dimensions
const AVATAR_SIZE: u32 = 256;
const MAX_SOURCE_DIMENSION: u32 = 8_192;
const MAX_DECODE_ALLOC_BYTES: u64 = 256 * 1024 * 1024;

/// Process raw image bytes into a 256x256 WebP avatar.
///
/// - Auto-detects format (JPEG, PNG, GIF, WebP)
/// - Center-crops to square, then resizes to 256x256
/// - Encodes as WebP
pub fn process_avatar(input: &[u8]) -> Result<Vec<u8>, AppError> {
    if input.is_empty() {
        return Err(AppError::Validation("Empty image data".into()));
    }

    let mut reader = ImageReader::new(Cursor::new(input))
        .with_guessed_format()
        .map_err(|e| AppError::Validation(format!("Cannot read image: {e}")))?;
    match reader.format() {
        Some(ImageFormat::Jpeg | ImageFormat::Png | ImageFormat::Gif | ImageFormat::WebP) => {}
        _ => {
            return Err(AppError::Validation("Unsupported or corrupt image".into()));
        }
    }

    // Bound decoded resource use rather than compressed source-file size.
    let mut limits = Limits::default();
    limits.max_image_width = Some(MAX_SOURCE_DIMENSION);
    limits.max_image_height = Some(MAX_SOURCE_DIMENSION);
    limits.max_alloc = Some(MAX_DECODE_ALLOC_BYTES);
    reader.limits(limits);

    let img = reader.decode().map_err(|error| match error {
        ImageError::Limits(_) => {
            AppError::Validation("Image dimensions are too large to process".into())
        }
        _ => AppError::Validation("Unsupported or corrupt image".into()),
    })?;

    // Resize first and crop the small intermediate image to keep peak memory bounded.
    let resized = img.resize_to_fill(AVATAR_SIZE, AVATAR_SIZE, FilterType::Lanczos3);

    // Encode as WebP
    let mut output = Cursor::new(Vec::new());
    resized
        .write_to(&mut output, ImageFormat::WebP)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to encode avatar as WebP: {e}")))?;

    Ok(output.into_inner())
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{DynamicImage, GenericImageView, Rgb, RgbImage};

    fn png_bytes(width: u32, height: u32) -> Vec<u8> {
        let image = RgbImage::from_fn(width, height, |x, y| {
            let seed = x
                .wrapping_mul(747_796_405)
                .wrapping_add(y.wrapping_mul(2_891_336_453));
            let mixed = (seed ^ (seed >> 16)).wrapping_mul(2_246_822_519);
            Rgb([mixed as u8, (mixed >> 8) as u8, (mixed >> 16) as u8])
        });
        let mut encoded = Cursor::new(Vec::new());
        DynamicImage::ImageRgb8(image)
            .write_to(&mut encoded, ImageFormat::Png)
            .expect("test PNG should encode");
        encoded.into_inner()
    }

    #[test]
    fn normalizes_source_files_larger_than_the_previous_limit() {
        let input = png_bytes(1_536, 1_536);
        assert!(input.len() > 5 * 1024 * 1024, "fixture must exceed 5 MiB");

        let output = process_avatar(&input).expect("large source should process");
        let reader = ImageReader::new(Cursor::new(output))
            .with_guessed_format()
            .expect("output format should be detectable");
        assert_eq!(reader.format(), Some(ImageFormat::WebP));
        assert_eq!(
            reader
                .decode()
                .expect("output WebP should decode")
                .dimensions(),
            (AVATAR_SIZE, AVATAR_SIZE)
        );
    }

    #[test]
    fn rejects_excessive_source_dimensions() {
        let input = png_bytes(MAX_SOURCE_DIMENSION + 1, 1);
        assert!(matches!(
            process_avatar(&input),
            Err(AppError::Validation(_))
        ));
    }
}
