//! Avatar image normalization for the Cedros Core storage route.

use std::io::Cursor;

use image::imageops::FilterType;
use image::{ImageError, ImageFormat, ImageReader, Limits};

pub const AVATAR_CONTENT_TYPE: &str = "image/webp";
const AVATAR_SIZE: u32 = 256;
const MAX_SOURCE_DIMENSION: u32 = 8_192;
const MAX_DECODE_ALLOC_BYTES: u64 = 256 * 1024 * 1024;

#[derive(Debug, PartialEq, Eq)]
pub enum AvatarImageError {
    Empty,
    Invalid,
    ResourceLimit,
    Encode,
}

/// Decode a supported source image and normalize it to a center-cropped 256px WebP.
///
/// Source file bytes are intentionally not capped: compressed size is not a useful
/// proxy for processing cost. Decoder allocation and strict dimension limits bound
/// the actual work instead.
pub fn process_avatar(input: &[u8]) -> Result<Vec<u8>, AvatarImageError> {
    if input.is_empty() {
        return Err(AvatarImageError::Empty);
    }

    let mut reader = ImageReader::new(Cursor::new(input))
        .with_guessed_format()
        .map_err(|_| AvatarImageError::Invalid)?;
    match reader.format() {
        Some(ImageFormat::Jpeg | ImageFormat::Png | ImageFormat::Gif | ImageFormat::WebP) => {}
        _ => return Err(AvatarImageError::Invalid),
    }

    let mut limits = Limits::default();
    limits.max_image_width = Some(MAX_SOURCE_DIMENSION);
    limits.max_image_height = Some(MAX_SOURCE_DIMENSION);
    limits.max_alloc = Some(MAX_DECODE_ALLOC_BYTES);
    reader.limits(limits);

    let image = reader.decode().map_err(|error| match error {
        ImageError::Limits(_) => AvatarImageError::ResourceLimit,
        _ => AvatarImageError::Invalid,
    })?;
    let resized = image.resize_to_fill(AVATAR_SIZE, AVATAR_SIZE, FilterType::Lanczos3);
    let mut output = Cursor::new(Vec::new());
    resized
        .write_to(&mut output, ImageFormat::WebP)
        .map_err(|_| AvatarImageError::Encode)?;
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
    fn normalizes_a_large_source_file_to_256px_webp() {
        let input = png_bytes(1_024, 1_024);
        assert!(input.len() > 1024 * 1024, "fixture must exceed 1 MiB");

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
    fn rejects_invalid_and_empty_input() {
        assert_eq!(process_avatar(&[]), Err(AvatarImageError::Empty));
        assert_eq!(
            process_avatar(b"not an image"),
            Err(AvatarImageError::Invalid)
        );
    }

    #[test]
    fn rejects_excessive_source_dimensions() {
        let input = png_bytes(MAX_SOURCE_DIMENSION + 1, 1);
        assert_eq!(process_avatar(&input), Err(AvatarImageError::ResourceLimit));
    }
}
