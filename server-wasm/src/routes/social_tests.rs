use super::bind_provider_id;
use super::{
    hex_sha256, percent_encode_query, provider_email_claim_blocks_session,
    provider_email_is_authoritative, verify_apple_nonce, GoogleAccessTokenInfo, LinkRequest,
    ProviderClaims, TokenRequest,
};

fn apple_claims(nonce: Option<&str>) -> ProviderClaims {
    ProviderClaims {
        sub: "a1".into(),
        email: None,
        email_verified: Some(true),
        name: None,
        picture: None,
        hd: None,
        nonce: nonce.map(str::to_string),
    }
}

#[test]
fn apple_nonce_binds_token_to_client_ceremony() {
    assert_eq!(
        hex_sha256("abc"),
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
    let claims = apple_claims(Some(&hex_sha256("raw-nonce")));
    assert!(verify_apple_nonce(&claims, Some("raw-nonce")).is_ok());
    assert!(verify_apple_nonce(&claims, Some("other")).is_err());
    assert!(verify_apple_nonce(&claims, None).is_err());
    assert!(verify_apple_nonce(&apple_claims(None), None).is_err());
}

#[test]
fn provider_claims_email_verified_accepts_bool_string_and_missing() {
    let g: ProviderClaims =
        serde_json::from_str(r#"{"sub":"g1","email":"a@b","email_verified":true}"#).unwrap();
    assert_eq!(g.email_verified, Some(true));
    let a: ProviderClaims =
        serde_json::from_str(r#"{"sub":"a1","email_verified":"true"}"#).unwrap();
    assert_eq!(a.email_verified, Some(true));
    let f: ProviderClaims = serde_json::from_str(r#"{"sub":"x","email_verified":false}"#).unwrap();
    assert_eq!(f.email_verified, Some(false));
    let fs: ProviderClaims =
        serde_json::from_str(r#"{"sub":"x","email_verified":"false"}"#).unwrap();
    assert_eq!(fs.email_verified, Some(false));
    let missing: ProviderClaims = serde_json::from_str(r#"{"sub":"x"}"#).unwrap();
    assert_eq!(missing.email_verified, None);
}

#[test]
fn provider_email_claim_requires_verified_email_when_present() {
    let mut claims = apple_claims(None);
    claims.email = Some("a@example.com".into());
    claims.email_verified = Some(true);
    assert!(!provider_email_claim_blocks_session(&claims));
    claims.email_verified = Some(false);
    assert!(provider_email_claim_blocks_session(&claims));
    claims.email_verified = None;
    assert!(provider_email_claim_blocks_session(&claims));
    claims.email = None;
    assert!(!provider_email_claim_blocks_session(&claims));
}

#[test]
fn token_request_accepts_camel_and_legacy_access_code_keys() {
    let camel: TokenRequest =
        serde_json::from_str(r#"{"idToken":"jwt","accessToken":"at","accessCode":"launch"}"#)
            .unwrap();
    assert_eq!(camel.access_token.as_deref(), Some("at"));
    assert_eq!(camel.access_code.as_deref(), Some("launch"));
    let legacy: TokenRequest =
        serde_json::from_str(r#"{"idToken":"jwt","access_code":"legacy"}"#).unwrap();
    assert_eq!(legacy.access_code.as_deref(), Some("legacy"));
}

#[test]
fn link_request_accepts_google_access_token() {
    let req: LinkRequest =
        serde_json::from_str(r#"{"provider":"google","accessToken":"at"}"#).unwrap();
    assert_eq!(req.access_token.as_deref(), Some("at"));
    assert!(req.id_token.is_none());
}

#[test]
fn google_access_token_info_accepts_any_client_binding_field() {
    let info = GoogleAccessTokenInfo {
        aud: None,
        azp: Some("client".into()),
        issued_to: None,
    };
    assert!(info.matches_client_id("client"));
    assert!(!info.matches_client_id("other"));

    let conflicting = GoogleAccessTokenInfo {
        aud: Some("attacker-client".into()),
        azp: Some("client".into()),
        issued_to: Some("client".into()),
    };
    assert!(!conflicting.matches_client_id("client"));
}

#[test]
fn google_email_is_authoritative_only_for_gmail_or_workspace() {
    let mut claims = apple_claims(None);
    claims.email = Some("person@example.com".into());
    assert!(!provider_email_is_authoritative("google", &claims));
    claims.email = Some("person@gmail.com".into());
    assert!(provider_email_is_authoritative("google", &claims));
    claims.email = Some("person@example.com".into());
    claims.hd = Some("example.com".into());
    assert!(provider_email_is_authoritative("google", &claims));
    claims.email_verified = Some(false);
    assert!(!provider_email_is_authoritative("google", &claims));
}

#[test]
fn percent_encode_query_escapes_reserved_bytes() {
    assert_eq!(percent_encode_query("a b+/"), "a%20b%2B%2F");
}

#[test]
fn linking_provider_never_silently_replaces_another_subject() {
    let mut slot = Some("existing-subject".to_string());
    assert!(bind_provider_id(&mut slot, "attacker-subject".into()).is_err());
    assert_eq!(slot.as_deref(), Some("existing-subject"));
    assert!(bind_provider_id(&mut slot, "existing-subject".into()).is_ok());
}
