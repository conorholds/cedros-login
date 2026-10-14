use std::sync::Arc;

use axum::routing::get;
use axum::Router;

use crate::callback::AuthCallback;
use crate::handlers;
use crate::services::EmailService;
use crate::AppState;

pub(super) fn routes<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    core::<C, E>().merge(ai::<C, E>())
}

fn core<C: AuthCallback + 'static, E: EmailService + 'static>() -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route("/discovery", get(handlers::auth_config::<C, E>))
        .route("/features", get(handlers::auth_features::<C, E>))
        .route("/openapi.json", get(handlers::openapi_spec))
        .route(
            "/account-deletion",
            get(handlers::account_deletion_page::<C, E>),
        )
}

fn ai<C: AuthCallback + 'static, E: EmailService + 'static>() -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route("/ai.txt", get(handlers::ai_txt::<C, E>))
        .route("/llms.txt", get(handlers::llms_txt::<C, E>))
        .route("/llms-full.txt", get(handlers::llms_full_txt::<C, E>))
        .route("/llms-admin.txt", get(handlers::llms_admin_txt::<C, E>))
        .route("/agent.md", get(handlers::agent_md::<C, E>))
        .route("/skill.md", get(handlers::skill_md::<C, E>))
        .route("/skill.json", get(handlers::skill_json::<C, E>))
        .route("/heartbeat.md", get(handlers::heartbeat_md::<C, E>))
        .route("/heartbeat.json", get(handlers::heartbeat_json::<C, E>))
        .route("/skills/auth.md", get(handlers::skill_auth_md::<C, E>))
        .route(
            "/skills/profile.md",
            get(handlers::skill_profile_md::<C, E>),
        )
        .route("/skills/orgs.md", get(handlers::skill_orgs_md::<C, E>))
        .route("/skills/mfa.md", get(handlers::skill_mfa_md::<C, E>))
        .route("/skills/admin.md", get(handlers::skill_admin_md::<C, E>))
        .route(
            "/skills/{skill_file}",
            get(handlers::skill_extension_md::<C, E>),
        )
        .route(
            "/.well-known/ai-discovery.json",
            get(handlers::ai_discovery_index::<C, E>),
        )
        .route(
            "/.well-known/ai-plugin.json",
            get(handlers::ai_plugin_json::<C, E>),
        )
        .route("/.well-known/agent.json", get(handlers::agent_json::<C, E>))
        .route("/.well-known/mcp", get(handlers::mcp_discovery::<C, E>))
        .route(
            "/.well-known/skills.zip",
            get(handlers::skills_bundle_zip::<C, E>),
        )
}
