use super::*;
use chrono::Utc;
use uuid::Uuid;

#[test]
fn test_auth_method_as_str() {
    assert_eq!(AuthMethod::Email.as_str(), "email");
    assert_eq!(AuthMethod::Google.as_str(), "google");
    assert_eq!(AuthMethod::Solana.as_str(), "solana");
}

#[test]
fn test_auth_method_display() {
    assert_eq!(format!("{}", AuthMethod::Email), "email");
    assert_eq!(format!("{}", AuthMethod::Google), "google");
    assert_eq!(format!("{}", AuthMethod::Solana), "solana");
}

#[test]
fn test_auth_method_to_string() {
    assert_eq!(AuthMethod::Email.to_string(), "email");
    assert_eq!(AuthMethod::Google.to_string(), "google");
    assert_eq!(AuthMethod::Solana.to_string(), "solana");
}

#[test]
fn test_auth_method_serialize() {
    let email = serde_json::to_string(&AuthMethod::Email).unwrap();
    assert_eq!(email, "\"email\"");

    let google = serde_json::to_string(&AuthMethod::Google).unwrap();
    assert_eq!(google, "\"google\"");

    let solana = serde_json::to_string(&AuthMethod::Solana).unwrap();
    assert_eq!(solana, "\"solana\"");
}

#[test]
fn test_auth_method_deserialize() {
    let email: AuthMethod = serde_json::from_str("\"email\"").unwrap();
    assert_eq!(email, AuthMethod::Email);

    let google: AuthMethod = serde_json::from_str("\"google\"").unwrap();
    assert_eq!(google, AuthMethod::Google);

    let solana: AuthMethod = serde_json::from_str("\"solana\"").unwrap();
    assert_eq!(solana, AuthMethod::Solana);
}

#[test]
fn test_auth_user_serialization() {
    let user = AuthUser {
        id: Uuid::nil(),
        email: Some("test@example.com".to_string()),
        emails: Vec::new(),
        name: Some("Test User".to_string()),
        username: None,
        picture: None,
        wallet_address: None,
        auth_methods: vec![AuthMethod::Email],
        email_verified: true,
        created_at: Utc::now(),
        updated_at: Utc::now(),
        welcome_completed_at: None,
        referral_code: None,
    };

    let json = serde_json::to_string(&user).unwrap();
    assert!(json.contains("\"email\":\"test@example.com\""));
    assert!(json.contains("\"authMethods\":[\"email\"]"));
    assert!(json.contains("\"emailVerified\":true"));
    // Optional None fields should not be serialized
    assert!(!json.contains("picture"));
    assert!(!json.contains("walletAddress"));
}

#[test]
fn test_token_pair_serialization() {
    let tokens = TokenPair {
        access_token: "access123".to_string(),
        refresh_token: "refresh456".to_string(),
        expires_in: 900,
    };

    let json = serde_json::to_string(&tokens).unwrap();
    assert!(json.contains("\"accessToken\":\"access123\""));
    assert!(json.contains("\"refreshToken\":\"refresh456\""));
    assert!(json.contains("\"expiresIn\":900"));
}

#[test]
fn test_register_request_deserialization() {
    let json = r#"{"email":"test@example.com","password":"SecurePass1!","name":"Test"}"#;
    let request: RegisterRequest = serde_json::from_str(json).unwrap();
    assert_eq!(request.email, "test@example.com");
    assert_eq!(request.password, "SecurePass1!");
    assert_eq!(request.name, Some("Test".to_string()));
}

#[test]
fn test_login_request_deserialization() {
    let json = r#"{"email":"test@example.com","password":"SecurePass1!"}"#;
    let request: LoginRequest = serde_json::from_str(json).unwrap();
    assert_eq!(request.email, "test@example.com");
    assert_eq!(request.password, "SecurePass1!");
}

#[test]
fn test_google_auth_request_deserialization_id_token() {
    let json = r#"{"idToken":"google-id-token-123"}"#;
    let request: GoogleAuthRequest = serde_json::from_str(json).unwrap();
    assert_eq!(request.id_token.unwrap(), "google-id-token-123");
    assert!(request.access_token.is_none());
}

#[test]
fn test_google_auth_request_deserialization_access_token() {
    let json = r#"{"accessToken":"google-access-token-456"}"#;
    let request: GoogleAuthRequest = serde_json::from_str(json).unwrap();
    assert!(request.id_token.is_none());
    assert_eq!(request.access_token.unwrap(), "google-access-token-456");
}

#[test]
fn test_solana_challenge_request_deserialization() {
    let json = r#"{"publicKey":"SoLaNaPubKeY123"}"#;
    let request: SolanaChallengeRequest = serde_json::from_str(json).unwrap();
    assert_eq!(request.public_key, "SoLaNaPubKeY123");
}

#[test]
fn test_solana_auth_request_deserialization() {
    let json = r#"{"publicKey":"SoLaNaPubKeY123","signature":"sig456","message":"msg789"}"#;
    let request: SolanaAuthRequest = serde_json::from_str(json).unwrap();
    assert_eq!(request.public_key, "SoLaNaPubKeY123");
    assert_eq!(request.signature, "sig456");
    assert_eq!(request.message, "msg789");
}

#[test]
fn test_refresh_request_deserialization() {
    let json = r#"{"refreshToken":"refresh-token-abc"}"#;
    let request: RefreshRequest = serde_json::from_str(json).unwrap();
    assert_eq!(request.refresh_token.as_deref(), Some("refresh-token-abc"));
}

#[test]
fn test_challenge_response_serialization() {
    let response = ChallengeResponse {
        nonce: "nonce123".to_string(),
        message: "Sign this message".to_string(),
        expires_at: Utc::now(),
    };
    let json = serde_json::to_string(&response).unwrap();
    assert!(json.contains("\"nonce\":\"nonce123\""));
    assert!(json.contains("\"message\":\"Sign this message\""));
    assert!(json.contains("\"expiresAt\""));
}

#[test]
fn test_refresh_response_serialization() {
    let response = RefreshResponse {
        tokens: Some(TokenPair {
            access_token: "new-access".to_string(),
            refresh_token: "new-refresh".to_string(),
            expires_in: 900,
        }),
    };
    let json = serde_json::to_string(&response).unwrap();
    assert!(json.contains("\"accessToken\":\"new-access\""));
    assert!(json.contains("\"refreshToken\":\"new-refresh\""));
}

#[test]
fn test_message_response_serialization() {
    let response = MessageResponse {
        message: "Success".to_string(),
    };
    let json = serde_json::to_string(&response).unwrap();
    assert_eq!(json, r#"{"message":"Success"}"#);
}

#[test]
fn test_health_response_serialization() {
    // Test without database field (in-memory mode)
    let response = HealthResponse {
        status: "healthy".to_string(),
        version: "1.0.0".to_string(),
        email_delivery: "provider".to_string(),
        database: None,
        rate_limit_backend: None,
        rate_limit_status: None,
    };
    let json = serde_json::to_string(&response).unwrap();
    assert!(json.contains("\"status\":\"healthy\""));
    assert!(json.contains("\"version\":\"1.0.0\""));
    assert!(json.contains("\"emailDelivery\":\"provider\""));
    // Database field should be omitted when None
    assert!(!json.contains("database"));

    // Test with database field (postgres mode)
    let response = HealthResponse {
        status: "healthy".to_string(),
        version: "1.0.0".to_string(),
        email_delivery: "development_log".to_string(),
        database: Some("connected".to_string()),
        rate_limit_backend: Some("redis".to_string()),
        rate_limit_status: Some("connected".to_string()),
    };
    let json = serde_json::to_string(&response).unwrap();
    assert!(json.contains("\"database\":\"connected\""));
    assert!(json.contains("\"rateLimitBackend\":\"redis\""));
    assert!(json.contains("\"rateLimitStatus\":\"connected\""));
}

#[test]
fn test_auth_user_with_wallet() {
    let user = AuthUser {
        id: Uuid::nil(),
        email: None,
        emails: Vec::new(),
        name: None,
        username: None,
        picture: None,
        wallet_address: Some("SoLaNaWaLlEt123".to_string()),
        auth_methods: vec![AuthMethod::Solana],
        email_verified: false,
        created_at: Utc::now(),
        updated_at: Utc::now(),
        welcome_completed_at: None,
        referral_code: None,
    };

    let json = serde_json::to_string(&user).unwrap();
    assert!(json.contains("\"walletAddress\":\"SoLaNaWaLlEt123\""));
    assert!(json.contains("\"authMethods\":[\"solana\"]"));
    // Optional None fields should not be serialized
    assert!(!json.contains("\"email\":"));
    assert!(!json.contains("\"name\":"));
}
