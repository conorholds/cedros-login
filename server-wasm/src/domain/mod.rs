//! Pure domain types shared across routes/services (no IO, no host seams).
pub mod permissions;
#[path = "../../../server/src/domain/plan_seat_policy.rs"]
pub mod plan_seat_policy;
pub mod policy;
pub mod settings_catalog;
#[path = "../../../server/src/settings_registry.rs"]
pub mod settings_registry;
