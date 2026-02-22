//! Input validation helpers for wallet handlers

use crate::errors::AppError;
use crate::models::{KdfParamsDto, WalletEnrollRequest, WalletRecoverRequest, WalletRotateRequest};

use super::{is_valid_base58, MIN_SOLANA_PUBKEY_LEN, MAX_SOLANA_PUBKEY_LEN};

// Nonce / salt sizes
const NONCE_LEN: usize = 12;
const MIN_KDF_SALT_LEN: usize = 16;
const PRF_SALT_LEN: usize = 32;
const MIN_PIN_LEN: usize = 6;
const MAX_PIN_LEN: usize = 20;

// KDF parameter bounds (OWASP minimums + DoS protection)
const MIN_M_COST: u32 = 19456; // 19 MiB minimum
const MAX_M_COST: u32 = 1048576; // 1 GiB maximum
const MIN_T_COST: u32 = 2;
const MAX_T_COST: u32 = 10;
const MIN_P_COST: u32 = 1;
const MAX_P_COST: u32 = 4;

fn validate_solana_pubkey(pubkey: &str) -> Result<(), AppError> {
    if pubkey.len() < MIN_SOLANA_PUBKEY_LEN || pubkey.len() > MAX_SOLANA_PUBKEY_LEN {
        return Err(AppError::Validation(
            "Invalid Solana pubkey length (expected 32-50 characters)".into(),
        ));
    }
    if !is_valid_base58(pubkey) {
        return Err(AppError::Validation(
            "Invalid Solana pubkey: contains invalid base58 characters".into(),
        ));
    }
    Ok(())
}

pub fn validate_enroll_request(req: &WalletEnrollRequest) -> Result<(), AppError> {
    validate_solana_pubkey(&req.solana_pubkey)
}

pub fn validate_recover_request(req: &WalletRecoverRequest) -> Result<(), AppError> {
    validate_solana_pubkey(&req.solana_pubkey)
}

pub fn validate_rotate_request(req: &WalletRotateRequest) -> Result<(), AppError> {
    validate_solana_pubkey(&req.solana_pubkey)
}

pub fn validate_kdf_params(params: &KdfParamsDto) -> Result<(), AppError> {
    if params.m_cost < MIN_M_COST {
        return Err(AppError::Validation(format!(
            "KDF mCost too low (minimum {} KiB)",
            MIN_M_COST
        )));
    }
    if params.m_cost > MAX_M_COST {
        return Err(AppError::Validation(format!(
            "KDF mCost too high (maximum {} KiB)",
            MAX_M_COST
        )));
    }
    if params.t_cost < MIN_T_COST {
        return Err(AppError::Validation(format!(
            "KDF tCost too low (minimum {})",
            MIN_T_COST
        )));
    }
    if params.t_cost > MAX_T_COST {
        return Err(AppError::Validation(format!(
            "KDF tCost too high (maximum {})",
            MAX_T_COST
        )));
    }
    if params.p_cost < MIN_P_COST {
        return Err(AppError::Validation(format!(
            "KDF pCost too low (minimum {})",
            MIN_P_COST
        )));
    }
    if params.p_cost > MAX_P_COST {
        return Err(AppError::Validation(format!(
            "KDF pCost too high (maximum {})",
            MAX_P_COST
        )));
    }
    Ok(())
}

pub fn validate_nonce(nonce: &[u8], field_name: &str) -> Result<(), AppError> {
    if nonce.len() != NONCE_LEN {
        return Err(AppError::Validation(format!(
            "{} must be {} bytes (AES-GCM nonce)",
            field_name, NONCE_LEN
        )));
    }
    Ok(())
}

pub fn validate_kdf_salt(salt: &[u8]) -> Result<(), AppError> {
    if salt.len() < MIN_KDF_SALT_LEN {
        return Err(AppError::Validation(format!(
            "shareAKdfSalt must be at least {} bytes",
            MIN_KDF_SALT_LEN
        )));
    }
    Ok(())
}

pub fn validate_prf_salt(salt: &[u8]) -> Result<(), AppError> {
    if salt.len() != PRF_SALT_LEN {
        return Err(AppError::Validation(format!(
            "prfSalt must be {} bytes",
            PRF_SALT_LEN
        )));
    }
    Ok(())
}

pub fn validate_pin(pin: &str) -> Result<(), AppError> {
    if pin.len() < MIN_PIN_LEN {
        return Err(AppError::Validation(format!(
            "PIN must be at least {} characters",
            MIN_PIN_LEN
        )));
    }
    if pin.len() > MAX_PIN_LEN {
        return Err(AppError::Validation(format!(
            "PIN must be at most {} characters",
            MAX_PIN_LEN
        )));
    }
    if !pin.chars().all(|c| c.is_ascii_digit()) {
        return Err(AppError::Validation("PIN must contain only digits".into()));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};

    #[test]
    fn test_validate_kdf_params_valid() {
        let params = KdfParamsDto {
            m_cost: 19456,
            t_cost: 2,
            p_cost: 1,
        };
        assert!(validate_kdf_params(&params).is_ok());
    }

    #[test]
    fn test_validate_kdf_params_m_cost_too_low() {
        let params = KdfParamsDto {
            m_cost: 1000,
            t_cost: 2,
            p_cost: 1,
        };
        assert!(validate_kdf_params(&params).is_err());
    }

    #[test]
    fn test_validate_kdf_params_m_cost_too_high() {
        let params = KdfParamsDto {
            m_cost: 2000000,
            t_cost: 2,
            p_cost: 1,
        };
        assert!(validate_kdf_params(&params).is_err());
    }

    #[test]
    fn test_validate_nonce_valid() {
        let nonce = vec![0u8; 12];
        assert!(validate_nonce(&nonce, "test").is_ok());
    }

    #[test]
    fn test_validate_nonce_invalid_length() {
        let nonce = vec![0u8; 16];
        assert!(validate_nonce(&nonce, "test").is_err());
    }

    #[test]
    fn test_validate_prf_salt_valid() {
        let salt = vec![0u8; 32];
        assert!(validate_prf_salt(&salt).is_ok());
    }

    #[test]
    fn test_validate_prf_salt_invalid_length() {
        let salt = vec![0u8; 16];
        assert!(validate_prf_salt(&salt).is_err());
    }

    #[test]
    fn test_decode_base64_valid() {
        let encoded = BASE64.encode(b"hello");
        let decoded = super::super::decode_base64(&encoded, "test").unwrap();
        assert_eq!(decoded, b"hello");
    }

    #[test]
    fn test_decode_base64_invalid() {
        let result = super::super::decode_base64("not-valid-base64!!!", "test");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_pin_valid() {
        assert!(validate_pin("123456").is_ok());
        assert!(validate_pin("12345678").is_ok());
    }

    #[test]
    fn test_validate_pin_too_short() {
        assert!(validate_pin("12345").is_err());
    }

    #[test]
    fn test_validate_pin_too_long() {
        assert!(validate_pin("123456789012345678901").is_err());
    }

    #[test]
    fn test_validate_pin_non_digits() {
        assert!(validate_pin("12345a").is_err());
        assert!(validate_pin("abcdef").is_err());
    }
}
