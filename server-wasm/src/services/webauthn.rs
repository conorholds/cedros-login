//! Pure-Rust WebAuthn relying-party verification (W3C WebAuthn L2). webauthn-rs
//! pulls openssl and won't build to wasip2, so we verify ceremonies directly.
//!
//! Scope: **ES256** (COSE alg -7, P-256) — the algorithm platform authenticators
//! and passkeys use — with **"none" attestation** (consumer passkeys; we don't
//! validate an attestation certificate chain, which is enterprise-only). This
//! module is pure: parsing + signature verification. Challenge state and
//! credential storage live in the route/data layers (per-request fresh instance,
//! so the challenge is persisted between begin and finish).
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use ciborium::Value;
use p256::ecdsa::signature::Verifier;
use sha2::{Digest, Sha256};

use super::AuthError;

/// COSE algorithm identifier for ES256.
pub const ES256: i64 = -7;

// authenticatorData flag bits (WebAuthn §6.1).
const FLAG_UP: u8 = 0x01; // user present
const FLAG_UV: u8 = 0x04; // user verified
const FLAG_BE: u8 = 0x08;
const FLAG_BS: u8 = 0x10;
const FLAG_ED: u8 = 0x80;
const FLAG_AT: u8 = 0x40; // attested credential data included

/// A credential extracted from a verified registration.
pub struct RegisteredCredential {
    pub credential_id_b64: String,
    pub cose_public_key_b64: String,
    pub sign_count: u32,
    pub backup_eligible: bool,
}

/// Outcome of a verified authentication assertion.
pub struct VerifiedAssertion {
    pub sign_count: u32,
    pub backup_eligible: bool,
}

pub fn b64url_encode(bytes: &[u8]) -> String {
    URL_SAFE_NO_PAD.encode(bytes)
}

/// Decode standard or URL-safe base64, with or without padding (clients vary).
pub fn b64url_decode(s: &str) -> Result<Vec<u8>, AuthError> {
    let t = s
        .trim()
        .trim_end_matches('=')
        .replace('+', "-")
        .replace('/', "_");
    URL_SAFE_NO_PAD
        .decode(t.as_bytes())
        .map_err(|_| unauthorized("malformed base64url"))
}

/// Verify a registration ceremony and extract the (ES256) credential public key.
/// `client_data_json` / `attestation_object` are the raw decoded bytes.
pub fn verify_registration(
    client_data_json: &[u8],
    attestation_object: &[u8],
    expected_challenge: &str,
    expected_origins: &[&str],
    rp_id: &str,
    require_uv: bool,
) -> Result<RegisteredCredential, AuthError> {
    verify_client_data(
        client_data_json,
        "webauthn.create",
        expected_challenge,
        expected_origins,
    )?;

    let value = decode_cbor_exact(attestation_object)?;
    let map = value.as_map().ok_or_else(|| invalid("attestationObject"))?;
    let auth_data_bytes = map_text(map, "authData")
        .and_then(Value::as_bytes)
        .ok_or_else(|| invalid("authData"))?;
    if map_text(map, "fmt").and_then(Value::as_text) != Some("none")
        || !map_text(map, "attStmt")
            .and_then(Value::as_map)
            .is_some_and(Vec::is_empty)
    {
        return Err(invalid("only empty none attestation is supported"));
    }
    let auth_data = parse_auth_data(auth_data_bytes)?;
    verify_rp_and_flags(&auth_data, rp_id, require_uv)?;

    let attested = auth_data
        .attested
        .ok_or_else(|| invalid("missing attested credential data"))?;
    if cose_alg(&attested.cose_public_key)? != ES256 {
        return Err(AuthError::Validation(vec![
            "unsupported credential algorithm (need ES256)".to_string(),
        ]));
    }
    cose_es256_key(&attested.cose_public_key)?; // ensure it parses to a valid P-256 key
    Ok(RegisteredCredential {
        credential_id_b64: b64url_encode(&attested.credential_id),
        cose_public_key_b64: b64url_encode(&attested.cose_public_key),
        sign_count: auth_data.sign_count,
        backup_eligible: auth_data.flags & FLAG_BE != 0,
    })
}

/// Verify an authentication assertion against a stored COSE public key.
#[allow(clippy::too_many_arguments)]
pub fn verify_authentication(
    client_data_json: &[u8],
    authenticator_data: &[u8],
    signature: &[u8],
    cose_public_key: &[u8],
    stored_sign_count: u32,
    expected_challenge: &str,
    expected_origins: &[&str],
    rp_id: &str,
    require_uv: bool,
) -> Result<VerifiedAssertion, AuthError> {
    verify_client_data(
        client_data_json,
        "webauthn.get",
        expected_challenge,
        expected_origins,
    )?;
    let auth_data = parse_auth_data(authenticator_data)?;
    verify_rp_and_flags(&auth_data, rp_id, require_uv)?;

    if auth_data.attested.is_some() {
        return Err(invalid("attested data in assertion"));
    }

    // Signature is over authenticatorData || SHA-256(clientDataJSON).
    let mut signed = Vec::with_capacity(authenticator_data.len() + 32);
    signed.extend_from_slice(authenticator_data);
    signed.extend_from_slice(&Sha256::digest(client_data_json));

    let key = cose_es256_key(cose_public_key)?;
    let sig =
        p256::ecdsa::Signature::from_der(signature).map_err(|_| invalid("signature encoding"))?;
    key.verify(&signed, &sig)
        .map_err(|_| unauthorized("assertion signature invalid"))?;

    // Clone detection: if either counter is set, the new one must advance.
    if (auth_data.sign_count != 0 || stored_sign_count != 0)
        && auth_data.sign_count <= stored_sign_count
    {
        return Err(unauthorized("authenticator sign count did not increase"));
    }
    Ok(VerifiedAssertion {
        sign_count: auth_data.sign_count,
        backup_eligible: auth_data.flags & FLAG_BE != 0,
    })
}

struct AuthData {
    rp_id_hash: [u8; 32],
    flags: u8,
    sign_count: u32,
    attested: Option<AttestedCredential>,
}

struct AttestedCredential {
    credential_id: Vec<u8>,
    cose_public_key: Vec<u8>,
}

/// Parse authenticatorData (WebAuthn §6.1): 32-byte rpIdHash, flags, 4-byte
/// signCount, then optional attested credential data when the AT flag is set.
fn parse_auth_data(bytes: &[u8]) -> Result<AuthData, AuthError> {
    if bytes.len() < 37 {
        return Err(invalid("authenticatorData too short"));
    }
    let mut rp_id_hash = [0u8; 32];
    rp_id_hash.copy_from_slice(&bytes[0..32]);
    let flags = bytes[32];
    let sign_count = u32::from_be_bytes([bytes[33], bytes[34], bytes[35], bytes[36]]);

    let mut offset = 37;
    let attested = if flags & FLAG_AT != 0 {
        // aaguid[16], credIdLen[2 BE], credId[credIdLen], then the COSE key (CBOR).
        if bytes.len() < 55 {
            return Err(invalid("attested credential data too short"));
        }
        let cred_len = u16::from_be_bytes([bytes[53], bytes[54]]) as usize;
        if cred_len == 0 || cred_len > 1023 {
            return Err(invalid("credentialId length"));
        }
        let cred_start = 55usize;
        let cred_end = cred_start
            .checked_add(cred_len)
            .filter(|&e| e <= bytes.len())
            .ok_or_else(|| invalid("credentialId length"))?;
        let credential_id = bytes[cred_start..cred_end].to_vec();
        // The COSE key is a CBOR item; decode via a cursor to learn its byte length
        // (extensions, if any, follow it).
        let mut cursor = std::io::Cursor::new(&bytes[cred_end..]);
        let _: Value =
            ciborium::de::from_reader(&mut cursor).map_err(|_| invalid("COSE public key"))?;
        let consumed = cursor.position() as usize;
        offset = cred_end + consumed;
        let cose_public_key = bytes[cred_end..offset].to_vec();
        Some(AttestedCredential {
            credential_id,
            cose_public_key,
        })
    } else {
        None
    };
    if flags & FLAG_ED != 0 {
        if !matches!(decode_cbor_exact(&bytes[offset..])?, Value::Map(_)) {
            return Err(invalid("authenticator extensions"));
        }
    } else if offset != bytes.len() {
        return Err(invalid("trailing authenticator data"));
    }
    Ok(AuthData {
        rp_id_hash,
        flags,
        sign_count,
        attested,
    })
}

fn verify_rp_and_flags(auth: &AuthData, rp_id: &str, require_uv: bool) -> Result<(), AuthError> {
    if auth.flags & FLAG_BS != 0 && auth.flags & FLAG_BE == 0 {
        return Err(invalid("backup state without backup eligibility"));
    }
    if auth.rp_id_hash != Sha256::digest(rp_id.as_bytes())[..] {
        return Err(unauthorized("RP ID hash mismatch"));
    }
    if auth.flags & FLAG_UP == 0 {
        return Err(unauthorized("user not present"));
    }
    if require_uv && auth.flags & FLAG_UV == 0 {
        return Err(unauthorized("user verification required"));
    }
    Ok(())
}

#[derive(serde::Deserialize)]
struct ClientData {
    #[serde(rename = "type")]
    kind: String,
    challenge: String,
    origin: String,
    #[serde(default, rename = "crossOrigin")]
    cross_origin: bool,
}

fn verify_client_data(
    bytes: &[u8],
    expected_type: &str,
    expected_challenge: &str,
    expected_origins: &[&str],
) -> Result<(), AuthError> {
    let data: ClientData = serde_json::from_slice(bytes).map_err(|_| invalid("clientDataJSON"))?;
    if data.kind != expected_type {
        return Err(unauthorized("clientData type mismatch"));
    }
    // The challenge is base64url(challenge bytes); compare canonically (no padding).
    if data.challenge != expected_challenge {
        return Err(unauthorized("challenge mismatch"));
    }
    if !expected_origins.contains(&data.origin.as_str()) {
        return Err(unauthorized("origin not allowed"));
    }
    if data.cross_origin {
        return Err(unauthorized("cross-origin ceremony not allowed"));
    }
    Ok(())
}

/// The COSE `alg` (label 3) of a CBOR-encoded COSE_Key.
fn cose_alg(cose_bytes: &[u8]) -> Result<i64, AuthError> {
    let value = decode_cbor_exact(cose_bytes)?;
    let map = value.as_map().ok_or_else(|| invalid("COSE key"))?;
    cose_int(map, 3).ok_or_else(|| invalid("COSE alg"))
}

/// Build a P-256 verifying key from a CBOR-encoded COSE EC2 key.
fn cose_es256_key(cose_bytes: &[u8]) -> Result<p256::ecdsa::VerifyingKey, AuthError> {
    let value = decode_cbor_exact(cose_bytes)?;
    let map = value.as_map().ok_or_else(|| invalid("COSE key"))?;
    if cose_int(map, 3) != Some(ES256) {
        return Err(invalid("COSE algorithm"));
    }
    if cose_int(map, 1) != Some(2) {
        return Err(invalid("COSE key type (need EC2)"));
    }
    if cose_int(map, -1) != Some(1) {
        return Err(invalid("COSE curve (need P-256)"));
    }
    let x = cose_field_bytes(map, -2).ok_or_else(|| invalid("COSE x"))?;
    let y = cose_field_bytes(map, -3).ok_or_else(|| invalid("COSE y"))?;
    if x.len() != 32 || y.len() != 32 {
        return Err(invalid("COSE coordinate length"));
    }
    let mut sec1 = Vec::with_capacity(65);
    sec1.push(0x04); // uncompressed point
    sec1.extend_from_slice(x);
    sec1.extend_from_slice(y);
    p256::ecdsa::VerifyingKey::from_sec1_bytes(&sec1).map_err(|_| invalid("COSE EC point"))
}

fn decode_cbor_exact(bytes: &[u8]) -> Result<Value, AuthError> {
    let mut cursor = std::io::Cursor::new(bytes);
    let value: Value = ciborium::from_reader(&mut cursor).map_err(|_| invalid("CBOR"))?;
    if cursor.position() != bytes.len() as u64 {
        return Err(invalid("trailing CBOR"));
    }
    if let Value::Map(ref entries) = value {
        for (index, (key, _)) in entries.iter().enumerate() {
            if entries[..index].iter().any(|(other, _)| key == other) {
                return Err(invalid("duplicate CBOR key"));
            }
        }
    }
    Ok(value)
}

fn map_text<'a>(map: &'a [(Value, Value)], key: &str) -> Option<&'a Value> {
    map.iter()
        .find(|(k, _)| matches!(k, Value::Text(t) if t == key))
        .map(|(_, v)| v)
}

fn cose_int(map: &[(Value, Value)], key: i64) -> Option<i64> {
    let v = map
        .iter()
        .find(|(k, _)| as_i64(k) == Some(key))
        .map(|(_, v)| v)?;
    as_i64(v)
}

fn cose_field_bytes(map: &[(Value, Value)], key: i64) -> Option<&[u8]> {
    map.iter()
        .find(|(k, _)| as_i64(k) == Some(key))
        .and_then(|(_, v)| v.as_bytes())
        .map(Vec::as_slice)
}

fn as_i64(v: &Value) -> Option<i64> {
    match v {
        Value::Integer(i) => i64::try_from(i128::from(*i)).ok(),
        _ => None,
    }
}

fn invalid(what: &str) -> AuthError {
    AuthError::Validation(vec![format!("invalid {what}")])
}

fn unauthorized(msg: &str) -> AuthError {
    AuthError::Unauthorized(msg.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use p256::ecdsa::{signature::Signer, SigningKey};
    use rand::rngs::OsRng;

    /// COSE EC2/ES256 key (CBOR) from a P-256 verifying key.
    fn cose_key(vk: &p256::ecdsa::VerifyingKey) -> Vec<u8> {
        let point = vk.to_encoded_point(false);
        let entries = vec![
            (Value::from(1i64), Value::from(2i64)),  // kty EC2
            (Value::from(3i64), Value::from(-7i64)), // alg ES256
            (Value::from(-1i64), Value::from(1i64)), // crv P-256
            (
                Value::from(-2i64),
                Value::Bytes(point.x().unwrap().to_vec()),
            ),
            (
                Value::from(-3i64),
                Value::Bytes(point.y().unwrap().to_vec()),
            ),
        ];
        let mut out = Vec::new();
        ciborium::into_writer(&Value::Map(entries), &mut out).unwrap();
        out
    }

    /// DER-encoded ES256 signature over `msg` (what an authenticator returns).
    fn sign_der(sk: &SigningKey, msg: &[u8]) -> Vec<u8> {
        let sig: p256::ecdsa::Signature = sk.sign(msg);
        sig.to_der().as_ref().to_vec()
    }

    fn auth_data(
        rp_id: &str,
        flags: u8,
        sign_count: u32,
        attested: Option<(&[u8], &[u8])>,
    ) -> Vec<u8> {
        let mut d = Sha256::digest(rp_id.as_bytes()).to_vec();
        d.push(flags);
        d.extend_from_slice(&sign_count.to_be_bytes());
        if let Some((cred_id, cose)) = attested {
            d.extend_from_slice(&[0u8; 16]); // aaguid
            d.extend_from_slice(&(cred_id.len() as u16).to_be_bytes());
            d.extend_from_slice(cred_id);
            d.extend_from_slice(cose);
        }
        d
    }

    fn client_data(kind: &str, challenge: &str, origin: &str) -> Vec<u8> {
        format!(r#"{{"type":"{kind}","challenge":"{challenge}","origin":"{origin}","crossOrigin":false}}"#).into_bytes()
    }

    const RP: &str = "example.com";
    const ORIGIN: &str = "https://example.com";
    const CHALLENGE: &str = "Q0hBTExFTkdF"; // base64url, no padding

    #[test]
    fn registration_extracts_es256_credential() {
        let sk = SigningKey::random(&mut OsRng);
        let cose = cose_key(sk.verifying_key());
        let ad = auth_data(RP, FLAG_UP | FLAG_AT, 0, Some((b"cred-1", &cose)));
        let mut att = Vec::new();
        ciborium::into_writer(
            &Value::Map(vec![
                (Value::Text("fmt".into()), Value::Text("none".into())),
                (Value::Text("authData".into()), Value::Bytes(ad)),
                (Value::Text("attStmt".into()), Value::Map(vec![])),
            ]),
            &mut att,
        )
        .unwrap();
        let cd = client_data("webauthn.create", CHALLENGE, ORIGIN);

        let cred = verify_registration(&cd, &att, CHALLENGE, &[ORIGIN], RP, false).unwrap();
        assert_eq!(b64url_decode(&cred.credential_id_b64).unwrap(), b"cred-1");
        assert_eq!(cred.sign_count, 0);
    }

    #[test]
    fn authentication_verifies_a_real_signature() {
        let sk = SigningKey::random(&mut OsRng);
        let cose = cose_key(sk.verifying_key());
        let ad = auth_data(RP, FLAG_UP, 7, None);
        let cd = client_data("webauthn.get", CHALLENGE, ORIGIN);

        let mut signed = ad.clone();
        signed.extend_from_slice(&Sha256::digest(&cd));
        let sig = sign_der(&sk, &signed);

        let out = verify_authentication(&cd, &ad, &sig, &cose, 1, CHALLENGE, &[ORIGIN], RP, false)
            .unwrap();
        assert_eq!(out.sign_count, 7);
    }

    #[test]
    fn authentication_rejects_tamper_and_bad_inputs() {
        let sk = SigningKey::random(&mut OsRng);
        let cose = cose_key(sk.verifying_key());
        let ad = auth_data(RP, FLAG_UP, 7, None);
        let cd = client_data("webauthn.get", CHALLENGE, ORIGIN);
        let mut signed = ad.clone();
        signed.extend_from_slice(&Sha256::digest(&cd));
        let sig = sign_der(&sk, &signed);

        // Wrong origin, wrong challenge, and sign-count regression all fail.
        assert!(verify_authentication(
            &cd,
            &ad,
            &sig,
            &cose,
            1,
            CHALLENGE,
            &["https://evil.test"],
            RP,
            false
        )
        .is_err());
        assert!(
            verify_authentication(&cd, &ad, &sig, &cose, 1, "ZZZ", &[ORIGIN], RP, false).is_err()
        );
        assert!(
            verify_authentication(&cd, &ad, &sig, &cose, 7, CHALLENGE, &[ORIGIN], RP, false)
                .is_err()
        );
        let cross_origin = String::from_utf8(cd.clone())
            .unwrap()
            .replace("\"crossOrigin\":false", "\"crossOrigin\":true")
            .into_bytes();
        assert!(verify_client_data(&cross_origin, "webauthn.get", CHALLENGE, &[ORIGIN]).is_err());
        // Verification required but UV flag absent.
        assert!(
            verify_authentication(&cd, &ad, &sig, &cose, 1, CHALLENGE, &[ORIGIN], RP, true)
                .is_err()
        );
    }
    #[test]
    fn signed_assertions_fail_closed_for_invalid_protocol_fields() {
        let sk = SigningKey::random(&mut OsRng);
        let cose = cose_key(sk.verifying_key());
        for (kind, challenge, origin, rp, flags, count, previous, valid) in [
            (
                "webauthn.get",
                CHALLENGE,
                ORIGIN,
                RP,
                FLAG_UP | FLAG_UV,
                0,
                0,
                true,
            ),
            (
                "webauthn.get",
                CHALLENGE,
                ORIGIN,
                RP,
                FLAG_UP | FLAG_UV,
                0,
                1,
                false,
            ),
            (
                "webauthn.get",
                CHALLENGE,
                ORIGIN,
                RP,
                FLAG_UP | FLAG_UV,
                7,
                7,
                false,
            ),
            ("webauthn.get", CHALLENGE, ORIGIN, RP, FLAG_UV, 8, 7, false),
            ("webauthn.get", CHALLENGE, ORIGIN, RP, FLAG_UP, 8, 7, false),
            (
                "webauthn.get",
                CHALLENGE,
                ORIGIN,
                RP,
                FLAG_UP | FLAG_UV | FLAG_BS,
                8,
                7,
                false,
            ),
            (
                "webauthn.create",
                CHALLENGE,
                ORIGIN,
                RP,
                FLAG_UP | FLAG_UV,
                8,
                7,
                false,
            ),
            (
                "webauthn.get",
                "expired-challenge",
                ORIGIN,
                RP,
                FLAG_UP | FLAG_UV,
                8,
                7,
                false,
            ),
            (
                "webauthn.get",
                CHALLENGE,
                "https://evil.test",
                RP,
                FLAG_UP | FLAG_UV,
                8,
                7,
                false,
            ),
            (
                "webauthn.get",
                CHALLENGE,
                ORIGIN,
                "other.example",
                FLAG_UP | FLAG_UV,
                8,
                7,
                false,
            ),
        ] {
            let ad = auth_data(rp, flags, count, None);
            let cd = client_data(kind, challenge, origin);
            let mut signed = ad.clone();
            signed.extend_from_slice(&Sha256::digest(&cd));
            let sig = sign_der(&sk, &signed);
            assert_eq!(
                verify_authentication(
                    &cd,
                    &ad,
                    &sig,
                    &cose,
                    previous,
                    CHALLENGE,
                    &[ORIGIN],
                    RP,
                    true
                )
                .is_ok(),
                valid
            );
        }
    }

    #[test]
    fn rejects_non_none_attestation_duplicate_fields_and_malformed_auth_data() {
        let sk = SigningKey::random(&mut OsRng);
        let cose = cose_key(sk.verifying_key());
        let ad = auth_data(RP, FLAG_UP | FLAG_UV | FLAG_AT, 0, Some((b"cred", &cose)));
        let cd = client_data("webauthn.create", CHALLENGE, ORIGIN);
        for (fmt, statement, valid) in [
            ("none", vec![], true),
            ("packed", vec![], false),
            (
                "none",
                vec![(Value::Text("sig".into()), Value::Bytes(vec![1]))],
                false,
            ),
        ] {
            let mut att = Vec::new();
            ciborium::into_writer(
                &Value::Map(vec![
                    (Value::Text("fmt".into()), Value::Text(fmt.into())),
                    (Value::Text("authData".into()), Value::Bytes(ad.clone())),
                    (Value::Text("attStmt".into()), Value::Map(statement)),
                ]),
                &mut att,
            )
            .unwrap();
            assert_eq!(
                verify_registration(&cd, &att, CHALLENGE, &[ORIGIN], RP, true).is_ok(),
                valid
            );
        }
        let mut trailing = auth_data(RP, FLAG_UP, 0, None);
        trailing.push(0);
        assert!(parse_auth_data(&trailing).is_err());
        assert!(parse_auth_data(&[0; 36]).is_err());
        let duplicate = Value::Map(vec![
            (Value::from(3), Value::from(-7)),
            (Value::from(3), Value::from(-8)),
        ]);
        let mut bytes = Vec::new();
        ciborium::into_writer(&duplicate, &mut bytes).unwrap();
        assert!(cose_es256_key(&bytes).is_err());
    }
}
