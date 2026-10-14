use std::net::Ipv4Addr;

/// Validate that a string looks like an IPv4 address
pub fn is_valid_ipv4(ip: &str) -> bool {
    ip.parse::<Ipv4Addr>().is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;

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
}
