//! Input validation utilities

use crate::errors::AppError;
use serde_json::Value;
use std::net::Ipv4Addr;

/// Common disposable/temporary email domains.
/// This list is compiled from various sources and covers the most popular
/// disposable email providers. Domains are lowercase for case-insensitive matching.
const DISPOSABLE_EMAIL_DOMAINS: &[&str] = &[
    // Popular disposable email services
    "10minutemail.com",
    "10minutemail.net",
    "20minutemail.com",
    "33mail.com",
    "anonymbox.com",
    "binkmail.com",
    "bobmail.info",
    "burnmymail.com",
    "burnermail.io",
    "crazymailing.com",
    "deadaddress.com",
    "discard.email",
    "discardmail.com",
    "disposable.com",
    "disposableaddress.com",
    "disposableemail.net",
    "disposableemailaddresses.com",
    "disposableinbox.com",
    "dispostable.com",
    "dodgeit.com",
    "dropmail.me",
    "dumpmail.de",
    "e4ward.com",
    "emaildrop.io",
    "emailsensei.com",
    "emailtemporaire.fr",
    "eyepaste.com",
    "fakeinbox.com",
    "fakemailgenerator.com",
    "fakemail.net",
    "fastmail.fm",
    "filzmail.com",
    "fizmail.com",
    "freemail.ms",
    "getnada.com",
    "getonemail.com",
    "gishpuppy.com",
    "guerrillamail.com",
    "guerrillamail.net",
    "guerrillamail.org",
    "guerrillamail.info",
    "guerrillamail.biz",
    "guerrillamailblock.com",
    "harakirimail.com",
    "hmamail.com",
    "imails.info",
    "inboxalias.com",
    "incognitomail.com",
    "jetable.com",
    "jetable.org",
    "jetable.net",
    "kasmail.com",
    "klzlv.com",
    "koszmail.pl",
    "lortemail.dk",
    "lr78.com",
    "maildrop.cc",
    "mailexpire.com",
    "mailforspam.com",
    "mailin8r.com",
    "mailinator.com",
    "mailinator.net",
    "mailinator2.com",
    "mailincubator.com",
    "mailnesia.com",
    "mailnull.com",
    "mailsac.com",
    "mailslite.com",
    "mailzilla.com",
    "meltmail.com",
    "mintemail.com",
    "moakt.com",
    "mohmal.com",
    "mytempemail.com",
    "mytrashmail.com",
    "nervmich.net",
    "nobulk.com",
    "nospam.ze.tc",
    "nospamfor.us",
    "nowmymail.com",
    "obobbo.com",
    "odnorazovoe.ru",
    "one-time.email",
    "onetimeemail.org",
    "owlpic.com",
    "pjjkp.com",
    "pokemail.net",
    "proxymail.eu",
    "putthisinyourspamdatabase.com",
    "quickinbox.com",
    "rcpt.at",
    "reallymymail.com",
    "rppkn.com",
    "safe-mail.net",
    "safetymail.info",
    "sendspamhere.com",
    "sharklasers.com",
    "shieldemail.com",
    "shortmail.net",
    "smellfear.com",
    "smashmail.de",
    "soodonims.com",
    "spam4.me",
    "spamavert.com",
    "spambog.com",
    "spambog.de",
    "spambog.net",
    "spambog.ru",
    "spambox.info",
    "spambox.irishspringrealty.com",
    "spambox.us",
    "spamcannon.com",
    "spamcannon.net",
    "spamcero.com",
    "spamcon.org",
    "spamcorptastic.com",
    "spamday.com",
    "spamex.com",
    "spamfree24.com",
    "spamfree24.de",
    "spamfree24.eu",
    "spamfree24.info",
    "spamfree24.net",
    "spamgoes.in",
    "spamgourmet.com",
    "spamgourmet.net",
    "spamgourmet.org",
    "spamherelots.com",
    "spamhereplease.com",
    "spamhole.com",
    "spamify.com",
    "spaminator.de",
    "spamkill.info",
    "spaml.com",
    "spaml.de",
    "spammote.com",
    "spammotel.com",
    "spamobox.com",
    "spamspot.com",
    "spamthis.co.uk",
    "spamtroll.net",
    "speed.1s.fr",
    "superrito.com",
    "suremail.info",
    "temp-mail.org",
    "temp-mail.ru",
    "tempail.com",
    "tempemail.biz",
    "tempemail.com",
    "tempinbox.com",
    "tempmail.it",
    "tempmail.net",
    "tempomail.fr",
    "temporaryemail.net",
    "temporaryemail.us",
    "temporaryforwarding.com",
    "temporaryinbox.com",
    "thanksnospam.info",
    "thisisnotmyrealemail.com",
    "throwam.com",
    "throwawayemailaddress.com",
    "throwawaymail.com",
    "tilien.com",
    "tmpmail.net",
    "tmpmail.org",
    "tradermail.info",
    "trash-mail.at",
    "trash-mail.com",
    "trash-mail.de",
    "trash2009.com",
    "trashbox.eu",
    "trashdevil.com",
    "trashdevil.de",
    "trashemail.de",
    "trashmail.at",
    "trashmail.com",
    "trashmail.de",
    "trashmail.me",
    "trashmail.net",
    "trashmail.org",
    "trashmail.ws",
    "trashmailer.com",
    "trashymail.com",
    "trashymail.net",
    "trbvm.com",
    "turual.com",
    "twinmail.de",
    "tyldd.com",
    "uggsrock.com",
    "upliftnow.com",
    "venompen.com",
    "veryrealemail.com",
    "viditag.com",
    "viewcastmedia.com",
    "viewcastmedia.net",
    "viewcastmedia.org",
    "wegwerfadresse.de",
    "wegwerfemail.de",
    "wetrainbayarea.com",
    "wetrainbayarea.org",
    "whatpaas.com",
    "whyspam.me",
    "wilemail.com",
    "willselfdestruct.com",
    "xagloo.com",
    "xemaps.com",
    "xents.com",
    "xmaily.com",
    "xoxy.net",
    "yep.it",
    "yogamaven.com",
    "yopmail.com",
    "yopmail.fr",
    "yopmail.net",
    "you-spam.com",
    "ypmail.webarnak.fr.eu.org",
    "yuurok.com",
    "zehnminuten.de",
    "zehnminutenmail.de",
    "zippymail.info",
    "zoaxe.com",
    "zoemail.org",
];

/// Check if an email domain is a known disposable email provider
pub fn is_disposable_email(email: &str) -> bool {
    // Extract domain from email
    let domain = match email.rsplit_once('@') {
        Some((_, domain)) => domain.to_lowercase(),
        None => return false,
    };

    DISPOSABLE_EMAIL_DOMAINS.contains(&domain.as_str())
}

/// S-11: Common typo TLDs that are likely user errors, not intentional.
/// These are rejected to prevent delivery failures and user frustration.
const TYPO_TLDS: &[&str] = &[
    // .com typos
    "con", // common keyboard typo
    "cmo", // transposition
    "ocm", // transposition
    "cm",  // Cameroon - often accidental .com typo
    "vom", // v/c swap on QWERTY
    "xom", // x/c swap on QWERTY
    "cpm", // p/o swap
    "clm", // l/o swap
    // .net typos
    "ney", // t/y swap
    "met", // n/m swap
    "bet", // n/b swap
    "nrt", // e/r swap
    // .org typos
    "ogr", // transposition
    "rog", // transposition
    "prg", // o/p swap
    "irg", // o/i swap
    // .edu typos
    "edi", // u/i swap
    "rdu", // e/r swap
];

/// Check if a TLD is a known typo
fn is_typo_tld(tld: &str) -> bool {
    TYPO_TLDS.contains(&tld)
}

/// Validate email address format
///
/// Checks for:
/// - Presence of exactly one @ symbol
/// - Non-empty local part (before @)
/// - Non-empty domain part (after @)
/// - Domain contains at least one dot
/// - No spaces in the email
/// - Reasonable length constraints
pub fn is_valid_email(email: &str) -> bool {
    // Check basic length constraints
    if email.is_empty() || email.len() > 254 {
        return false;
    }

    // No spaces allowed
    if email.contains(' ') {
        return false;
    }

    // Split by @ - must have exactly one
    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() != 2 {
        return false;
    }

    let local = parts[0];
    let domain = parts[1];

    // Local part validation
    if local.is_empty() || local.len() > 64 {
        return false;
    }

    // Local part can't start or end with a dot
    if local.starts_with('.') || local.ends_with('.') {
        return false;
    }

    // B-14: RFC 5321 disallows consecutive dots in local part
    if local.contains("..") {
        return false;
    }

    // Domain validation
    if domain.is_empty() || domain.len() > 253 {
        return false;
    }

    // Domain must contain at least one dot
    if !domain.contains('.') {
        return false;
    }

    // Domain can't start or end with a dot or hyphen
    if domain.starts_with('.')
        || domain.ends_with('.')
        || domain.starts_with('-')
        || domain.ends_with('-')
    {
        return false;
    }

    // Check each domain label doesn't start or end with hyphen
    for label in domain.split('.') {
        if label.starts_with('-') || label.ends_with('-') {
            return false;
        }
    }

    // Check TLD (part after last dot) is at least 2 chars
    if let Some(tld) = domain.rsplit('.').next() {
        if tld.len() < 2 {
            return false;
        }
        // TLD must be alphabetic (no numbers)
        if !tld.chars().all(|c| c.is_ascii_alphabetic()) {
            return false;
        }
        // S-11: Deny common typo TLDs to prevent user errors
        let tld_lower = tld.to_ascii_lowercase();
        if is_typo_tld(&tld_lower) {
            return false;
        }
    }

    // Domain parts can only contain alphanumeric, dots, and hyphens
    if !domain
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-')
    {
        return false;
    }

    // Local part can contain alphanumeric, dots, and certain special chars
    // Simplified check: allow common characters
    if !local.chars().all(|c| {
        c.is_ascii_alphanumeric() || c == '.' || c == '_' || c == '-' || c == '+' || c == '!'
    }) {
        return false;
    }

    true
}

/// Validate that a string looks like an IPv4 address
pub fn is_valid_ipv4(ip: &str) -> bool {
    ip.parse::<Ipv4Addr>().is_ok()
}

// =============================================================================
// Metadata Validation
// =============================================================================

/// Common secret key name patterns (case-insensitive)
const SECRET_KEY_PATTERNS: &[&str] = &[
    "password",
    "passwd",
    "secret",
    "api_key",
    "apikey",
    "api-key",
    "token",
    "auth",
    "credential",
    "private_key",
    "privatekey",
    "private-key",
    "access_key",
    "accesskey",
    "access-key",
    "secret_key",
    "secretkey",
    "secret-key",
    "bearer",
    "jwt",
    "session",
    "cookie",
    "authorization",
];

/// Patterns that indicate a value might be a secret
const SECRET_VALUE_PATTERNS: &[&str] = &[
    "sk_live_",   // Stripe live key
    "sk_test_",   // Stripe test key
    "pk_live_",   // Stripe publishable
    "pk_test_",   // Stripe publishable
    "ghp_",       // GitHub personal access token
    "gho_",       // GitHub OAuth token
    "ghu_",       // GitHub user token
    "ghs_",       // GitHub server token
    "AKIA",       // AWS access key
    "eyJ",        // JWT header (base64 encoded)
    "bearer ",    // Bearer token
    "basic ",     // Basic auth
    "AIza",       // Google API key
    "xox",        // Slack token
    "ssh-rsa",    // SSH key
    "-----BEGIN", // PEM encoded key
];

/// Validate metadata does not contain obvious secrets
///
/// Returns Ok(()) if metadata is safe, or an error describing the issue.
/// Checks both key names and string values for secret patterns.
pub fn validate_metadata_no_secrets(metadata: Option<&Value>) -> Result<(), AppError> {
    let Some(value) = metadata else {
        return Ok(());
    };

    validate_value_recursive(value, 0)
}

fn validate_value_recursive(value: &Value, depth: usize) -> Result<(), AppError> {
    // Prevent deep nesting attacks
    if depth > 10 {
        return Err(AppError::Validation(
            "Metadata nesting too deep (max 10 levels)".into(),
        ));
    }

    match value {
        Value::Object(map) => {
            for (key, val) in map.iter() {
                // Check key name for secret patterns
                let key_lower = key.to_lowercase();
                for pattern in SECRET_KEY_PATTERNS {
                    if key_lower.contains(pattern) {
                        return Err(AppError::Validation(format!(
                            "Metadata key '{}' appears to contain sensitive data. \
                             Do not store secrets in metadata.",
                            key
                        )));
                    }
                }

                // Recursively check value
                validate_value_recursive(val, depth + 1)?;
            }
        }
        Value::Array(arr) => {
            // Limit array size
            if arr.len() > 100 {
                return Err(AppError::Validation(
                    "Metadata array too large (max 100 elements)".into(),
                ));
            }
            for item in arr {
                validate_value_recursive(item, depth + 1)?;
            }
        }
        Value::String(s) => {
            // Check string length
            if s.len() > 10_000 {
                return Err(AppError::Validation(
                    "Metadata string value too long (max 10000 chars)".into(),
                ));
            }

            // Check for secret value patterns
            let s_lower = s.to_lowercase();
            for pattern in SECRET_VALUE_PATTERNS {
                if s_lower.starts_with(&pattern.to_lowercase()) {
                    return Err(AppError::Validation(
                        "Metadata value appears to contain a secret or API key. \
                         Do not store secrets in metadata."
                            .into(),
                    ));
                }
            }
        }
        _ => {}
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_emails() {
        assert!(is_valid_email("test@example.com"));
        assert!(is_valid_email("user.name@example.com"));
        assert!(is_valid_email("user+tag@example.com"));
        assert!(is_valid_email("user_name@example.co.uk"));
        assert!(is_valid_email("a@b.co"));
        assert!(is_valid_email("test123@test123.com"));
        assert!(is_valid_email("user-name@example.org"));
        assert!(is_valid_email("user!@example.com"));
    }

    #[test]
    fn test_invalid_emails_no_at() {
        assert!(!is_valid_email("testexample.com"));
        assert!(!is_valid_email("test"));
    }

    #[test]
    fn test_invalid_emails_multiple_at() {
        assert!(!is_valid_email("test@@example.com"));
        assert!(!is_valid_email("test@test@example.com"));
    }

    #[test]
    fn test_invalid_emails_empty_parts() {
        assert!(!is_valid_email("@example.com"));
        assert!(!is_valid_email("test@"));
        assert!(!is_valid_email("@"));
        assert!(!is_valid_email(""));
    }

    #[test]
    fn test_invalid_emails_no_tld() {
        assert!(!is_valid_email("test@example"));
        assert!(!is_valid_email("test@localhost"));
    }

    #[test]
    fn test_invalid_emails_short_tld() {
        assert!(!is_valid_email("test@example.c"));
    }

    #[test]
    fn test_invalid_emails_numeric_tld() {
        assert!(!is_valid_email("test@example.123"));
    }

    #[test]
    fn test_invalid_emails_spaces() {
        assert!(!is_valid_email("test @example.com"));
        assert!(!is_valid_email("test@ example.com"));
        assert!(!is_valid_email(" test@example.com"));
        assert!(!is_valid_email("test@example.com "));
    }

    #[test]
    fn test_invalid_emails_invalid_chars() {
        assert!(!is_valid_email("test<>@example.com"));
        assert!(!is_valid_email("test@exam ple.com"));
    }

    #[test]
    fn test_invalid_emails_dots() {
        assert!(!is_valid_email(".test@example.com"));
        assert!(!is_valid_email("test.@example.com"));
        assert!(!is_valid_email("test@.example.com"));
        assert!(!is_valid_email("test@example.com."));
        // B-14: Consecutive dots are invalid per RFC 5321
        assert!(!is_valid_email("user..name@example.com"));
        assert!(!is_valid_email("user...name@example.com"));
    }

    #[test]
    fn test_invalid_emails_domain_hyphens() {
        assert!(!is_valid_email("test@-example.com"));
        assert!(!is_valid_email("test@example-.com"));
    }

    #[test]
    fn test_invalid_emails_too_long() {
        let long_local = "a".repeat(65);
        let long_email = format!("{}@example.com", long_local);
        assert!(!is_valid_email(&long_email));

        let very_long_email = format!("test@{}.com", "a".repeat(250));
        assert!(!is_valid_email(&very_long_email));
    }

    #[test]
    fn test_valid_ipv4() {
        assert!(is_valid_ipv4("127.0.0.1"));
        assert!(is_valid_ipv4("192.168.1.1"));
        assert!(is_valid_ipv4("0.0.0.0"));
        assert!(is_valid_ipv4("255.255.255.255"));
    }

    #[test]
    fn test_invalid_ipv4() {
        assert!(!is_valid_ipv4("256.0.0.1"));
        assert!(!is_valid_ipv4("192.168.1"));
        assert!(!is_valid_ipv4("192.168.1.1.1"));
        assert!(!is_valid_ipv4("not.an.ip.address"));
        assert!(!is_valid_ipv4(""));
    }

    #[test]
    fn test_typo_tlds_rejected() {
        // .com typos
        assert!(!is_valid_email("test@example.con"));
        assert!(!is_valid_email("test@example.cmo"));
        assert!(!is_valid_email("test@example.cm"));
        assert!(!is_valid_email("test@example.vom"));
        // .net typos
        assert!(!is_valid_email("test@example.ney"));
        assert!(!is_valid_email("test@example.met"));
        // .org typos
        assert!(!is_valid_email("test@example.ogr"));
        assert!(!is_valid_email("test@example.prg"));
        // Case insensitive
        assert!(!is_valid_email("test@example.CON"));
        assert!(!is_valid_email("test@example.Con"));
    }

    #[test]
    fn test_valid_tlds_allowed() {
        // Real TLDs should still work
        assert!(is_valid_email("test@example.com"));
        assert!(is_valid_email("test@example.net"));
        assert!(is_valid_email("test@example.org"));
        assert!(is_valid_email("test@example.edu"));
        assert!(is_valid_email("test@example.io"));
        assert!(is_valid_email("test@example.co"));
        assert!(is_valid_email("test@example.co.uk"));
    }

    // =========================================================================
    // Metadata Validation Tests
    // =========================================================================

    #[test]
    fn test_metadata_none_is_valid() {
        assert!(validate_metadata_no_secrets(None).is_ok());
    }

    #[test]
    fn test_metadata_safe_values_allowed() {
        use serde_json::json;

        let metadata = json!({
            "order_id": "12345",
            "items": ["widget", "gadget"],
            "quantity": 5,
            "customer_note": "Please ship quickly"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_ok());
    }

    #[test]
    fn test_metadata_rejects_password_key() {
        use serde_json::json;

        let metadata = json!({
            "password": "my-secret"
        });

        let result = validate_metadata_no_secrets(Some(&metadata));
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("password"));
    }

    #[test]
    fn test_metadata_rejects_api_key() {
        use serde_json::json;

        let metadata = json!({
            "api_key": "sk_live_xxx"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_secret_key_pattern() {
        use serde_json::json;

        let metadata = json!({
            "user_secret": "abc123"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_stripe_key_value() {
        use serde_json::json;

        let metadata = json!({
            "notes": "sk_live_abcdefg12345"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_jwt_value() {
        use serde_json::json;

        let metadata = json!({
            "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_aws_key_value() {
        use serde_json::json;

        let metadata = json!({
            "info": "AKIAIOSFODNN7EXAMPLE"
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_nested_secret() {
        use serde_json::json;

        let metadata = json!({
            "user": {
                "profile": {
                    "api_token": "secret123"
                }
            }
        });

        assert!(validate_metadata_no_secrets(Some(&metadata)).is_err());
    }

    #[test]
    fn test_metadata_rejects_too_deep_nesting() {
        use serde_json::json;

        // Create deeply nested structure
        let mut value = json!("leaf");
        for _ in 0..15 {
            value = json!({ "nested": value });
        }

        let result = validate_metadata_no_secrets(Some(&value));
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("nesting"));
    }

    #[test]
    fn test_metadata_rejects_large_array() {
        use serde_json::json;

        let large_array: Vec<i32> = (0..150).collect();
        let metadata = json!({ "items": large_array });

        let result = validate_metadata_no_secrets(Some(&metadata));
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("array"));
    }

    #[test]
    fn test_metadata_rejects_long_string() {
        use serde_json::json;

        let long_string = "x".repeat(15_000);
        let metadata = json!({ "data": long_string });

        let result = validate_metadata_no_secrets(Some(&metadata));
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("string"));
    }

    // =========================================================================
    // Disposable Email Tests
    // =========================================================================

    #[test]
    fn test_disposable_email_detected() {
        assert!(is_disposable_email("test@mailinator.com"));
        assert!(is_disposable_email("user@guerrillamail.com"));
        assert!(is_disposable_email("temp@10minutemail.com"));
        assert!(is_disposable_email("spam@yopmail.com"));
        assert!(is_disposable_email("throwaway@tempmail.net"));
    }

    #[test]
    fn test_disposable_email_case_insensitive() {
        assert!(is_disposable_email("test@MAILINATOR.COM"));
        assert!(is_disposable_email("test@Mailinator.Com"));
        assert!(is_disposable_email("test@MailInator.COM"));
    }

    #[test]
    fn test_legitimate_email_allowed() {
        assert!(!is_disposable_email("user@gmail.com"));
        assert!(!is_disposable_email("user@outlook.com"));
        assert!(!is_disposable_email("user@yahoo.com"));
        assert!(!is_disposable_email("user@company.com"));
        assert!(!is_disposable_email("user@university.edu"));
    }

    #[test]
    fn test_disposable_email_invalid_input() {
        // Invalid emails should return false (not disposable)
        assert!(!is_disposable_email("notanemail"));
        assert!(!is_disposable_email(""));
        assert!(!is_disposable_email("@"));
    }
}
