use std::collections::HashSet;
use std::sync::OnceLock;

/// Built-in disposable email domain blocklist, loaded once from the vendored
/// data file (~5,000 domains, MIT-licensed from disposable-email-domains).
static DISPOSABLE_DOMAINS: OnceLock<HashSet<&str>> = OnceLock::new();

fn disposable_domains() -> &'static HashSet<&'static str> {
    DISPOSABLE_DOMAINS.get_or_init(|| {
        include_str!("../../data/disposable_domains.txt")
            .lines()
            .filter(|l| !l.is_empty() && !l.starts_with('#'))
            .collect()
    })
}

/// Number of built-in disposable domains (for admin info endpoint).
pub fn disposable_domain_count() -> usize {
    disposable_domains().len()
}

/// Check if an email domain is a known disposable email provider.
///
/// Checks the built-in blocklist first, then the optional custom domain set.
pub fn is_disposable_email(email: &str, custom_domains: Option<&HashSet<String>>) -> bool {
    let domain = match email.rsplit_once('@') {
        Some((_, domain)) => domain.to_lowercase(),
        None => return false,
    };

    if disposable_domains().contains(domain.as_str()) {
        return true;
    }

    if let Some(custom) = custom_domains {
        return custom.contains(&domain);
    }

    false
}

/// Common typo TLDs that are likely user errors, not intentional.
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
    if email.is_empty() || email.len() > 254 || email.contains(' ') {
        return false;
    }

    let mut parts = email.split('@');
    let (Some(local), Some(domain), None) = (parts.next(), parts.next(), parts.next()) else {
        return false;
    };

    is_valid_email_local_part(local) && is_valid_email_domain(domain)
}

fn is_valid_email_local_part(local: &str) -> bool {
    if local.is_empty()
        || local.len() > 64
        || local.starts_with('.')
        || local.ends_with('.')
        || local.contains("..")
    {
        return false;
    }

    local.chars().all(|c| {
        c.is_ascii_alphanumeric() || c == '.' || c == '_' || c == '-' || c == '+' || c == '!'
    })
}

fn is_valid_email_domain(domain: &str) -> bool {
    if domain.is_empty()
        || domain.len() > 253
        || !domain.contains('.')
        || domain.starts_with(['.', '-'])
        || domain.ends_with(['.', '-'])
    {
        return false;
    }

    if domain
        .split('.')
        .any(|label| label.starts_with('-') || label.ends_with('-'))
    {
        return false;
    }

    let Some(tld) = domain.rsplit('.').next() else {
        return false;
    };
    if tld.len() < 2
        || !tld.chars().all(|c| c.is_ascii_alphabetic())
        || is_typo_tld(&tld.to_ascii_lowercase())
    {
        return false;
    }

    domain
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-')
}
