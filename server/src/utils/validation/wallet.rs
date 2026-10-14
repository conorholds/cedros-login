/// Validate a Solana wallet address format.
///
/// Solana addresses are base58-encoded 32-byte public keys, typically 32-44 characters.
/// This performs basic format validation but does not verify the key is on the curve.
pub fn is_valid_wallet_address(address: &str) -> bool {
    // Solana addresses are typically 32-44 characters (base58 encoding of 32 bytes)
    if address.len() < 32 || address.len() > 44 {
        return false;
    }

    // Must be valid base58 characters (1-9, A-H, J-N, P-Z, a-k, m-z)
    // Excludes: 0, O, I, l (to avoid ambiguity)
    const BASE58_CHARS: &str = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    address.chars().all(|c| BASE58_CHARS.contains(c))
}

#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    #[test]
    fn test_valid_wallet_addresses() {
        // Valid Solana addresses (base58, 32-44 chars)
        assert!(is_valid_wallet_address(
            "6o6HrBfnmzpQsMJHJZuQTFhBnXPKadjFnPkKB7p2AFSL"
        ));
        assert!(is_valid_wallet_address("11111111111111111111111111111111"));
        assert!(is_valid_wallet_address(
            "So11111111111111111111111111111111111111112"
        ));
    }

    #[test]
    fn test_invalid_wallet_too_short() {
        assert!(!is_valid_wallet_address("1234567890123456789012345678901")); // 31 chars
        assert!(!is_valid_wallet_address("abc"));
        assert!(!is_valid_wallet_address(""));
    }

    #[test]
    fn test_invalid_wallet_too_long() {
        assert!(!is_valid_wallet_address(
            "123456789012345678901234567890123456789012345"
        )); // 45 chars
    }

    #[test]
    fn test_invalid_wallet_invalid_chars() {
        // Contains 0 (zero), O, I, l - not valid base58
        assert!(!is_valid_wallet_address(
            "0o6HrBfnmzpQsMJHJZuQTFhBnXPKadjFnPkKB7p2AFSL"
        )); // 0
        assert!(!is_valid_wallet_address(
            "Oo6HrBfnmzpQsMJHJZuQTFhBnXPKadjFnPkKB7p2AFSL"
        )); // O
        assert!(!is_valid_wallet_address(
            "Io6HrBfnmzpQsMJHJZuQTFhBnXPKadjFnPkKB7p2AFSL"
        )); // I
        assert!(!is_valid_wallet_address(
            "lo6HrBfnmzpQsMJHJZuQTFhBnXPKadjFnPkKB7p2AFSL"
        )); // l
    }

    proptest! {
        // Wallet validator never panics on arbitrary unicode.
        #[test]
        fn property_is_valid_wallet_address_never_panics(
            s in proptest::collection::vec(any::<char>(), 0..80)
        ) {
            let collected: String = s.into_iter().collect();
            let _ = is_valid_wallet_address(&collected);
        }

        // Length ranges outside [32, 44] are always rejected.
        #[test]
        fn property_is_valid_wallet_address_length_bounds(s in "[1-9A-HJ-NP-Za-km-z]{0,200}") {
            let len = s.len();
            if !(32..=44).contains(&len) {
                prop_assert!(!is_valid_wallet_address(&s));
            }
        }

        // Strings of valid length using only base58 chars are accepted.
        #[test]
        fn property_is_valid_wallet_address_accepts_base58(
            s in "[1-9A-HJ-NP-Za-km-z]{32,44}"
        ) {
            prop_assert!(is_valid_wallet_address(&s));
        }

        // Any string containing a forbidden base58 char is rejected.
        #[test]
        fn property_is_valid_wallet_address_rejects_forbidden_chars(
            prefix in "[1-9A-HJ-NP-Za-km-z]{15,20}",
            suffix in "[1-9A-HJ-NP-Za-km-z]{15,22}",
            forbidden in "[0OIl]",
        ) {
            let s = format!("{prefix}{forbidden}{suffix}");
            // s.len() ∈ [31, 43]; if outside [32,44] still rejected.
            prop_assert!(!is_valid_wallet_address(&s));
        }
    }
}
