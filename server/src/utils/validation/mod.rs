//! Input validation utilities.

mod email;
#[cfg(test)]
mod email_tests;
mod metadata;
mod network;
mod wallet;

pub use email::{disposable_domain_count, is_disposable_email, is_valid_email};
pub use metadata::validate_metadata_no_secrets;
pub use network::is_valid_ipv4;
pub use wallet::is_valid_wallet_address;
