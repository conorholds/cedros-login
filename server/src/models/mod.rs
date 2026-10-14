//! Data models for authentication

// Import zeroize for sensitive data structs
mod admin;
mod api_key;
mod audit;
mod auth;
mod invite;
mod org;
mod session;
pub mod sso;

pub use admin::{
    AdminOrgResponse, AdminUpdateUserRequest, AdminUserResponse, ListAdminOrgsResponse,
    ListOrgsQueryParams, ListUsersQueryParams, ListUsersResponse, SetSystemAdminRequest,
};
pub use api_key::{
    ApiKeyListResponse, ApiKeyResponse, CreateApiKeyRequest, CreateApiKeyResponse,
    ValidateApiKeyRequest, ValidateApiKeyResponse,
};
pub use audit::{AuditLogQueryParams, AuditLogResponse, ListAuditLogsResponse};
pub use auth::*;
pub use invite::{
    AcceptInviteRequest, AcceptInviteResponse, CreateInviteRequest, InviteResponse,
    InviteWithTokenResponse, ListInvitesResponse,
};
pub use org::{
    CreateOrgRequest, ListMembersResponse, ListOrgsResponse, MemberResponse, OrgResponse,
    UpdateMemberRoleRequest, UpdateOrgRequest,
};
pub use session::{ListSessionsResponse, RevokeAllSessionsResponse, SessionResponse};

#[cfg(test)]
#[path = "auth_tests.rs"]
mod tests;
