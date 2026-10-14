//! Solana wallet sign-in: challenge generation + ed25519 signature verification.
//! Ported verbatim from `server/src/services/solana_service.rs` (message format,
//! strict nonce extraction, base58 pubkey / base64 signature). Pure — unit-tested.
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use ed25519_dalek::{Signature, VerifyingKey};
use rand::distributions::Alphanumeric;
use rand::{rngs::OsRng, Rng};

use super::AuthError;
use crate::clock;

const MESSAGE_PREFIX: &str = "Sign in with wallet ";
const NONCE_MARKER: &str = "Nonce: ";

pub struct Challenge {
    pub nonce: String,
    pub message: String,
    pub expires_at: String,
}

/// Validate a base58 Solana public key (decodes to exactly 32 bytes).
pub fn validate_public_key(public_key_base58: &str) -> Result<(), AuthError> {
    match bs58::decode(public_key_base58).into_vec() {
        Ok(bytes) if bytes.len() == 32 => Ok(()),
        _ => Err(AuthError::Validation(
            vec!["Invalid public key".to_string()],
        )),
    }
}

/// Build a challenge message bound to the wallet (and optional domain) with a
/// 32-char nonce and an expiry, mirroring the standalone wallet-popup copy.
pub fn generate_challenge(public_key: &str, expiry_secs: i64, domain: Option<&str>) -> Challenge {
    let nonce: String = OsRng
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect();
    let expires_at = clock::in_secs(expiry_secs);

    let pk_display = if public_key.len() > 12 {
        format!(
            "{}...{}",
            &public_key[..6],
            &public_key[public_key.len() - 6..]
        )
    } else {
        public_key.to_string()
    };
    let domain_clause = domain.map(|d| format!(" on {d}")).unwrap_or_default();
    let message = format!(
        "{MESSAGE_PREFIX}{pk_display}{domain_clause}. This message confirms ownership of your wallet and costs nothing to sign. Expires: {expires_at}. Nonce: {nonce}."
    );

    Challenge {
        nonce,
        message,
        expires_at,
    }
}

/// Verify an ed25519 signature (base64) over `message` for a base58 pubkey.
pub fn verify_signature(
    public_key_base58: &str,
    signature_base64: &str,
    message: &str,
) -> Result<bool, AuthError> {
    let pk_bytes = bs58::decode(public_key_base58)
        .into_vec()
        .map_err(|_| AuthError::Validation(vec!["Invalid public key format".to_string()]))?;
    let pk: [u8; 32] = pk_bytes
        .try_into()
        .map_err(|_| AuthError::Validation(vec!["Invalid public key length".to_string()]))?;
    let verifying_key = VerifyingKey::from_bytes(&pk)
        .map_err(|_| AuthError::Validation(vec!["Invalid public key".to_string()]))?;

    let sig_bytes = STANDARD
        .decode(signature_base64)
        .map_err(|_| AuthError::Validation(vec!["Invalid signature format".to_string()]))?;
    let sig: [u8; 64] = sig_bytes
        .try_into()
        .map_err(|_| AuthError::Validation(vec!["Invalid signature length".to_string()]))?;
    let signature = Signature::from_bytes(&sig);

    Ok(verifying_key
        .verify_strict(message.as_bytes(), &signature)
        .is_ok())
}

/// Strictly extract the 32-char nonce from a challenge message.
pub fn extract_nonce(message: &str) -> Option<String> {
    if !message.starts_with(MESSAGE_PREFIX) || !message.ends_with('.') {
        return None;
    }
    if message.matches(NONCE_MARKER).count() != 1 {
        return None;
    }
    let start = message.find(NONCE_MARKER)?;
    let nonce = message[start + NONCE_MARKER.len()..].strip_suffix('.')?;
    if nonce.len() != 32 || !nonce.chars().all(|c| c.is_ascii_alphanumeric()) {
        return None;
    }
    Some(nonce.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};

    fn keypair() -> (SigningKey, String) {
        let signing = SigningKey::from_bytes(&[7u8; 32]);
        let pk_b58 = bs58::encode(signing.verifying_key().to_bytes()).into_string();
        (signing, pk_b58)
    }

    #[test]
    fn rejects_identity_point_signature_forgery() {
        use base64::Engine;
        // Identity public key and R with S=0 satisfy the permissive equation
        // for arbitrary messages, without possession of a private key.
        let mut key = [0u8; 32];
        key[0] = 1;
        let pk = bs58::encode(key).into_string();
        let mut signature = [0u8; 64];
        signature[0] = 1;
        let sig = base64::engine::general_purpose::STANDARD.encode(signature);
        let message = "Sign in with wallet identity. Nonce: attacker.";
        assert!(!verify_signature(&pk, &sig, message).unwrap());
    }

    #[test]
    fn sign_and_verify_round_trip() {
        let (signing, pk_b58) = keypair();
        let message = "Sign in with wallet ABCDEF...123456. Nonce: x.";
        let sig_b64 = STANDARD.encode(signing.sign(message.as_bytes()).to_bytes());
        assert!(verify_signature(&pk_b58, &sig_b64, message).unwrap());
        // Tampered message fails.
        assert!(!verify_signature(&pk_b58, &sig_b64, "different message").unwrap());
    }

    #[test]
    fn challenge_message_round_trips_through_extract_nonce() {
        let challenge = generate_challenge(
            "ABCDEFghijklmnopqrstuvwxyz123456",
            300,
            Some("https://x.test"),
        );
        assert!(challenge.message.starts_with(MESSAGE_PREFIX));
        assert!(challenge.message.contains("on https://x.test"));
        assert_eq!(
            extract_nonce(&challenge.message).as_deref(),
            Some(challenge.nonce.as_str())
        );
    }

    #[test]
    fn extract_nonce_rejects_malformed() {
        assert!(extract_nonce("no prefix. Nonce: abcdefghijklmnopqrstuvwxyz123456.").is_none());
        // Injected second marker.
        assert!(extract_nonce(
            "Sign in with wallet x. Nonce: a. Nonce: abcdefghijklmnopqrstuvwxyz123456."
        )
        .is_none());
    }

    #[test]
    fn validate_public_key_checks_length() {
        let (_, pk_b58) = keypair();
        assert!(validate_public_key(&pk_b58).is_ok());
        assert!(validate_public_key("tooshort").is_err());
    }
}
