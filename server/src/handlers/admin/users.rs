//! Admin user handlers.

mod access;
mod management;
mod queries;

pub use access::validate_system_admin;
pub use management::{delete_user, force_password_reset, set_system_admin, update_user};
pub use queries::{get_user, get_user_stats, list_users};
