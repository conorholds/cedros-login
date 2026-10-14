use super::{disposable_domain_count, is_disposable_email, is_valid_email};
use proptest::prelude::*;
use std::collections::HashSet;

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
    // Consecutive dots are invalid per RFC 5321
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
    let long_email = format!("{long_local}@example.com");
    assert!(!is_valid_email(&long_email));

    let very_long_email = format!("test@{}.com", "a".repeat(250));
    assert!(!is_valid_email(&very_long_email));
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

#[test]
fn test_disposable_email_detected() {
    assert!(is_disposable_email("test@mailinator.com", None));
    assert!(is_disposable_email("user@guerrillamail.com", None));
    assert!(is_disposable_email("temp@10minutemail.com", None));
    assert!(is_disposable_email("spam@yopmail.com", None));
    assert!(is_disposable_email("throwaway@tempmail.it", None));
}

#[test]
fn test_disposable_email_case_insensitive() {
    assert!(is_disposable_email("test@MAILINATOR.COM", None));
    assert!(is_disposable_email("test@Mailinator.Com", None));
    assert!(is_disposable_email("test@MailInator.COM", None));
}

#[test]
fn test_legitimate_email_allowed() {
    assert!(!is_disposable_email("user@gmail.com", None));
    assert!(!is_disposable_email("user@outlook.com", None));
    assert!(!is_disposable_email("user@yahoo.com", None));
    assert!(!is_disposable_email("user@company.com", None));
    assert!(!is_disposable_email("user@university.edu", None));
}

#[test]
fn test_disposable_email_invalid_input() {
    // Invalid emails should return false (not disposable)
    assert!(!is_disposable_email("notanemail", None));
    assert!(!is_disposable_email("", None));
    assert!(!is_disposable_email("@", None));
}

#[test]
fn test_disposable_email_custom_domains() {
    let custom = HashSet::from(["blocked.example.com".to_string()]);
    assert!(is_disposable_email(
        "user@blocked.example.com",
        Some(&custom)
    ));
    assert!(!is_disposable_email(
        "user@allowed.example.com",
        Some(&custom)
    ));
}

#[test]
fn test_disposable_domain_count() {
    assert!(disposable_domain_count() > 3000);
}

proptest! {
    // Never-panic property: arbitrary input must not panic the validator.
    // Email validation is exposed to client-controlled input on signup/login,
    // so a panic here would be a denial-of-service.
    #[test]
    fn property_is_valid_email_never_panics(s in ".{0,300}") {
        let _ = is_valid_email(&s);
    }

    // No-panic on arbitrary unicode (covers surrogates / multibyte / RTL).
    #[test]
    fn property_is_valid_email_never_panics_unicode(s in proptest::collection::vec(any::<char>(), 0..200)) {
        let collected: String = s.into_iter().collect();
        let _ = is_valid_email(&collected);
    }

    // Validator is deterministic.
    #[test]
    fn property_is_valid_email_deterministic(s in ".{0,200}") {
        prop_assert_eq!(is_valid_email(&s), is_valid_email(&s));
    }

    // No '@' or empty input → never valid.
    #[test]
    fn property_is_valid_email_rejects_no_at(s in "[^@]{0,200}") {
        prop_assert!(!is_valid_email(&s));
    }

    // Strings with whitespace are rejected by design (no spaces allowed).
    #[test]
    fn property_is_valid_email_rejects_spaces(prefix in "[a-z]{1,10}", suffix in "[a-z]{1,10}") {
        let with_space = format!("{prefix} @example.com");
        prop_assert!(!is_valid_email(&with_space));
        let with_space_in_domain = format!("{prefix}@exa{suffix}.com");
        // sanity: this one is fine without a space
        let _ = is_valid_email(&with_space_in_domain);
    }

    // Generated valid-shape addresses are accepted.
    #[test]
    fn property_is_valid_email_accepts_simple_form(
        local in "[a-z][a-z0-9]{0,30}",
        sld in "[a-z][a-z0-9-]{0,30}[a-z0-9]",
        tld in "(com|net|org|io|co|edu)",
    ) {
        let email = format!("{local}@{sld}.{tld}");
        // Length budget: local ≤ 64, total ≤ 254; both honored above.
        prop_assert!(is_valid_email(&email),
            "expected valid: {}", email);
    }

    // Disposable check never panics on arbitrary input.
    #[test]
    fn property_is_disposable_email_never_panics(
        s in proptest::collection::vec(any::<char>(), 0..100)
    ) {
        let collected: String = s.into_iter().collect();
        let _ = is_disposable_email(&collected, None);
    }
}
