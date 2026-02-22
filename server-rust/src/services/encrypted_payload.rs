use base64::{engine::general_purpose::STANDARD as BASE64, Engine};

use crate::errors::AppError;
use crate::services::{NoteEncryptionService, NOTE_NONCE_SIZE};

pub(crate) fn decrypt_base64_payload(
    note_encryption: &NoteEncryptionService,
    encrypted: &str,
    invalid_encoding_message: &str,
    invalid_format_message: &str,
) -> Result<Vec<u8>, AppError> {
    let combined = BASE64
        .decode(encrypted)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("{}: {}", invalid_encoding_message, e)))?;

    if combined.len() <= NOTE_NONCE_SIZE {
        return Err(AppError::Internal(anyhow::anyhow!(
            "{}",
            invalid_format_message
        )));
    }

    let nonce = &combined[..NOTE_NONCE_SIZE];
    let ciphertext = &combined[NOTE_NONCE_SIZE..];
    note_encryption.decrypt(ciphertext, nonce)
}

#[cfg(test)]
mod tests {
    use super::decrypt_base64_payload;
    use crate::errors::AppError;
    use crate::services::NoteEncryptionService;
    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};

    fn test_note_encryption() -> NoteEncryptionService {
        NoteEncryptionService::new(&[3u8; 32], "test-key").expect("create test encryption service")
    }

    #[test]
    fn decrypt_base64_payload_round_trip() {
        let note_encryption = test_note_encryption();
        let encrypted = note_encryption
            .encrypt(b"test-private-key")
            .expect("encrypt payload");
        let mut combined = encrypted.nonce;
        combined.extend(encrypted.ciphertext);

        let decrypted = decrypt_base64_payload(
            &note_encryption,
            &BASE64.encode(combined),
            "Invalid payload encoding",
            "Invalid payload format",
        )
        .expect("decrypt payload");

        assert_eq!(decrypted, b"test-private-key");
    }

    #[test]
    fn decrypt_base64_payload_rejects_short_payload() {
        let note_encryption = test_note_encryption();
        let result = decrypt_base64_payload(
            &note_encryption,
            &BASE64.encode(vec![0u8; 12]),
            "Invalid payload encoding",
            "Invalid payload format",
        );

        assert!(matches!(result, Err(AppError::Internal(_))));
    }
}
