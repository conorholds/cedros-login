use super::{
    register_extension_family, CedrosExtensionManifest, CedrosExtensionPackageRef,
    CEDROS_EXTENSION_MIN_CEDROS_DATA_VERSION, CEDROS_LOGIN_EXTENSION_ID,
    CEDROS_LOGIN_EXTENSION_VERSION, CEDROS_LOGIN_SERVER_REGISTRATION_ENTRYPOINT,
};
use crate::extension_manifest_metadata::is_host_admin_icon_name;
use crate::{
    CedrosExtensionNotificationAudience, CedrosExtensionNotificationChannelKind,
    CEDROS_LOGIN_REGISTRATION_CREATED_EVENT_ID, CEDROS_LOGIN_USER_LOGIN_EVENT_ID,
};

#[test]
fn register_extension_family_returns_canonical_login_manifest() {
    let manifest = register_extension_family();

    assert_eq!(manifest.schema_version, 1);
    assert_eq!(manifest.extension_id, CEDROS_LOGIN_EXTENSION_ID);
    assert_eq!(manifest.version, CEDROS_LOGIN_EXTENSION_VERSION);
    assert_eq!(
        manifest.compatibility.min_cedros_data_version.as_deref(),
        Some(CEDROS_EXTENSION_MIN_CEDROS_DATA_VERSION)
    );
    assert_registration(&manifest);
    assert_surfaces(&manifest);
    assert_admin_module(&manifest);
    assert_notification_setup_seeds(&manifest);
    assert_web_inventory(&manifest);
    assert!(manifest.database_access.iter().all(|access| {
        !access.content_models.is_empty()
            && (!access.migrations.is_empty()
                || matches!(
                    access.id.as_str(),
                    "cedros-login:registration-db"
                        | "cedros-login:account-lifecycle-db"
                        | "cedros-login:organization-lifecycle-db"
                        | "cedros-login:oauth-consent-db"
                ))
    }));
}

fn assert_registration(manifest: &CedrosExtensionManifest) {
    assert_eq!(
        manifest.registration.server.entrypoint,
        CEDROS_LOGIN_SERVER_REGISTRATION_ENTRYPOINT
    );
    assert_eq!(
        manifest.registration.admin.entrypoint,
        "@cedros/login-react/admin/register"
    );
    assert_eq!(
        manifest.registration.web.entrypoint,
        "@cedros/login-react/web/register"
    );
    assert_eq!(
        manifest.registration.native.entrypoint,
        "@cedros/login-react-native/register"
    );
}

fn assert_surfaces(manifest: &CedrosExtensionManifest) {
    assert_eq!(
        manifest.surfaces.server.package_ref,
        CedrosExtensionPackageRef::Server
    );
    assert_eq!(
        manifest.surfaces.admin.package_ref,
        CedrosExtensionPackageRef::React
    );
    assert_eq!(
        manifest.surfaces.web.package_ref,
        CedrosExtensionPackageRef::React
    );
    assert_eq!(
        manifest.surfaces.native.package_ref,
        CedrosExtensionPackageRef::ReactNative
    );
    assert!(manifest.surfaces.admin.required);
    assert!(manifest.surfaces.web.required);
    assert!(manifest.surfaces.native.required);
    assert_eq!(manifest.surfaces.admin.module_ids, ["cedros-login:admin"]);
    assert_eq!(manifest.surfaces.server.routes.len(), 198);
    assert!(manifest
        .surfaces
        .server
        .routes
        .contains(&"cedros-login:admin-jwt-rotate".to_string()));
    assert!(manifest
        .surfaces
        .server
        .routes
        .contains(&"cedros-login:setup-admin-import".to_string()));
    assert!(manifest
        .surfaces
        .server
        .routes
        .contains(&"cedros-login:relying-party-session-introspect".to_string()));
    for route_id in [
        "cedros-login:oauth-consent-authority",
        "cedros-login:apple-nonce",
        "cedros-login:public-auth-apple-nonce",
        "cedros-login:public-auth-invite-codes-redeem",
        "cedros-login:public-auth-verify-email",
        "cedros-login:public-auth-account-invite-codes-list",
        "cedros-login:public-auth-account-invite-discount",
        "cedros-login:admin-invite-codes-list",
        "cedros-login:admin-invite-codes-create",
        "cedros-login:admin-invite-codes-update",
        "cedros-login:admin-invite-codes-delete",
        "cedros-login:identity-profile-current",
        "cedros-login:identity-profile-admin-get",
    ] {
        assert!(manifest
            .surfaces
            .server
            .routes
            .contains(&route_id.to_string()));
    }
    assert!(manifest
        .surfaces
        .server
        .events
        .contains(&CEDROS_LOGIN_REGISTRATION_CREATED_EVENT_ID.to_string()));
    assert_eq!(
        manifest.crm_source_access[0].event_types,
        ["invite_gate.pending"]
    );
    assert!(manifest
        .surfaces
        .server
        .events
        .contains(&CEDROS_LOGIN_USER_LOGIN_EVENT_ID.to_string()));
}

fn assert_admin_module(manifest: &CedrosExtensionManifest) {
    assert_eq!(manifest.admin_modules.len(), 1);
    let module = &manifest.admin_modules[0];
    assert_eq!(module.extension_id, CEDROS_LOGIN_EXTENSION_ID);
    assert_eq!(module.display_name, "Cedros Login");
    // Team / Team Invites are host-owned now (read via the team-directory host
    // service); the extension's admin module is the Login section only.
    assert_eq!(module.section_ids, ["cedros-login:login"]);
    assert_eq!(
        module
            .section_icons
            .get("cedros-login:login")
            .map(String::as_str),
        Some("account"),
        "manifest must declare a host-resolvable icon name for the login section"
    );

    // Every declared section id must have a sectionIcons entry, and that icon
    // name must come from the host's published vocabulary. Otherwise the host
    // renders the sidebar entry without an icon (as in the prior regression).
    for section_id in &module.section_ids {
        let icon = module
            .section_icons
            .get(section_id)
            .unwrap_or_else(|| panic!("section {section_id} has no sectionIcons entry"));
        assert!(
            is_host_admin_icon_name(icon),
            "section {section_id} declares icon '{icon}' which is not in the host allowlist"
        );
    }
    for icon_section_id in module.section_icons.keys() {
        assert!(
            module.section_ids.iter().any(|id| id == icon_section_id),
            "sectionIcons references {icon_section_id} which is not in sectionIds"
        );
    }
    let cards = &module
        .contributions
        .as_ref()
        .expect("dashboard contributions")
        .dashboard_cards;
    assert_eq!(cards.len(), 1);
    assert_eq!(cards[0].id, "cedros-login:identity-health-card");
}

fn assert_notification_setup_seeds(manifest: &CedrosExtensionManifest) {
    let setup_seeds = manifest.setup_seeds.as_ref().expect("setup seeds");
    let setup_seed_json = serde_json::to_value(setup_seeds).expect("setup seeds serialize");
    assert!(setup_seed_json.get("siteAdminImports").is_none());

    let event_ids: Vec<_> = setup_seeds
        .notifications
        .iter()
        .map(|seed| seed.event_id.as_str())
        .collect();

    assert_eq!(
        event_ids,
        [
            CEDROS_LOGIN_REGISTRATION_CREATED_EVENT_ID,
            CEDROS_LOGIN_USER_LOGIN_EVENT_ID
        ]
    );
    for seed in &setup_seeds.notifications {
        assert!(seed.id.starts_with("cedros-login:"));
        assert_eq!(seed.audience, CedrosExtensionNotificationAudience::Team);
        assert_eq!(
            seed.default_channels,
            [CedrosExtensionNotificationChannelKind::Email]
        );
        assert!(manifest.surfaces.server.events.contains(&seed.event_id));
        assert_redacted_template(seed.subject_template.as_deref());
        assert_redacted_template(Some(&seed.body_template));
    }
}

fn assert_redacted_template(template: Option<&str>) {
    let Some(template) = template else {
        return;
    };
    for forbidden in [
        "{{email",
        "{{user",
        "{{session",
        "{{token",
        "{{password",
        "{{ip",
        "{{wallet",
        "{{auth",
        "{{provider",
    ] {
        assert!(
            !template.to_lowercase().contains(forbidden),
            "notification template leaked {forbidden}: {template}"
        );
    }
}

fn assert_web_inventory(manifest: &CedrosExtensionManifest) {
    assert_eq!(manifest.surfaces.web.route_ids.len(), 8);
    assert!(manifest
        .surfaces
        .web
        .route_ids
        .contains(&"cedros-login:public-profile-page".to_string()));
    assert!(!manifest
        .surfaces
        .web
        .route_ids
        .contains(&"cedros-login:account-workspace-page".to_string()));
    assert_eq!(manifest.page_seeds.len(), 8);
    let noindex_routes = [
        "/login",
        "/register",
        "/password-recovery",
        "/reset-password",
        "/verify-email",
        "/instant-link/verify",
        "/accept-invite",
        "/profile",
    ];
    // Every seeded page id must be declared in surfaces.web.routeIds — the host
    // only auto-provisions a page seed whose id is a declared web route.
    // (Ref: docs/extension-authoring/17-public-pages-page-seeds.md.)
    for seed in &manifest.page_seeds {
        assert!(
            manifest.surfaces.web.route_ids.contains(&seed.id),
            "page seed {} is not declared in surfaces.web.routeIds",
            seed.id
        );
        // Materialize as a real record on install (autoCreateOnEnable), not a
        // "Use Template" starter card; publishOnEnable because several pages are
        // email-link targets (reset/verify/instant-link/accept-invite) that 404
        // the auth flow unless live on enable.
        assert_eq!(
            seed.auto_create_on_enable,
            Some(true),
            "page seed {} must set autoCreateOnEnable=true",
            seed.id
        );
        assert_eq!(
            seed.publish_on_enable,
            Some(true),
            "page seed {} must set publishOnEnable=true",
            seed.id
        );
        if noindex_routes.contains(&seed.route_path.as_str()) {
            let seo = seed.seo.as_ref().expect("auth page seed seo");
            assert_eq!(
                seo.noindex,
                Some(true),
                "auth page seed {} must set seo.noindex=true",
                seed.id
            );
            assert!(
                seo.canonical_path.is_none() && seo.og_image.is_none(),
                "auth page seed {} must not emit canonical or OG image metadata",
                seed.id
            );
        }
    }
    assert!(!manifest
        .page_seeds
        .iter()
        .any(|seed| seed.route_path == "/account"));
    let profile_seeds: Vec<_> = manifest
        .page_seeds
        .iter()
        .filter(|seed| seed.route_path == "/profile")
        .collect();
    assert_eq!(profile_seeds.len(), 1);
    let profile_seed = profile_seeds[0];
    assert_eq!(profile_seed.id, "cedros-login:public-profile-page");
    assert_eq!(
        profile_seed.seo.as_ref().and_then(|seo| seo.noindex),
        Some(true)
    );
    assert_eq!(manifest.surfaces.web.block_types.len(), 4);
    assert!(manifest
        .surfaces
        .web
        .block_types
        .contains(&"cedros-login:account-workspace".to_string()));
    assert_eq!(manifest.content_templates.len(), 8);
    let login_template = manifest
        .content_templates
        .iter()
        .find(|template| template.id == "cedros-login:login-page-template")
        .expect("login page template");
    assert_eq!(login_template.display_name, "Login Page Template");
    assert_eq!(login_template.content_types, ["page"]);
    let login_template_json =
        serde_json::to_value(login_template).expect("content template serializes");
    for runtime_only_field in ["label", "zones", "blocks"] {
        assert!(
            login_template_json.get(runtime_only_field).is_none(),
            "manifest template must not serialize runtime-only field {runtime_only_field}"
        );
    }
    let profile_template = manifest
        .content_templates
        .iter()
        .find(|template| template.id == "cedros-login:public-profile-page-template")
        .expect("profile workspace page template");
    assert_eq!(profile_template.content_types, ["page"]);
    assert_eq!(manifest.form_templates.len(), 1);
    assert_eq!(manifest.docs_articles.len(), 2);
    assert!(manifest
        .docs_articles
        .iter()
        .all(|article| !article.internal));
    assert_eq!(manifest.onboarding_pages.len(), 1);
    let onboarding = &manifest.onboarding_pages[0];
    assert_eq!(onboarding.id, "cedros-login:setup-login");
    assert_eq!(onboarding.module_id, "cedros-login:admin");
    assert_eq!(onboarding.section_id, "cedros-login:login");
}

#[test]
fn register_extension_family_publishes_login_integration_contracts() {
    let manifest = register_extension_family();
    let dependencies = manifest.dependencies.as_ref().expect("dependencies");
    let capability_ids: Vec<_> = manifest
        .capabilities
        .iter()
        .map(|capability| capability.id.as_str())
        .collect();

    assert!(dependencies.services.is_empty());
    assert_eq!(
        dependencies
            .capabilities
            .iter()
            .map(|dependency| (dependency.capability_id.as_str(), dependency.required))
            .collect::<Vec<_>>(),
        [
            ("cedros-data:database-concurrency-v2", Some(true)),
            ("cedros-data:token-email-evidence-v1", Some(true)),
            ("cedros-data:identity-atomic-v1", Some(true)),
            ("cedros-data:session-atomic-v1", Some(true)),
            ("cedros-data:signup-limit-atomic-v1", Some(true)),
            ("cedros-data:abuse-budget-consume-v1", Some(true)),
            ("cedros-data:extension-storage-cas-v1", Some(true)),
            ("cedros-data:mcp-connection-revoke-v1", Some(true)),
            ("cedros-pay:subscription-read", Some(false)),
        ]
    );
    assert_eq!(
        manifest.required_capabilities,
        [
            "cedros-data:database-concurrency-v2",
            "cedros-data:token-email-evidence-v1",
            "cedros-data:identity-atomic-v1",
            "cedros-data:session-atomic-v1",
            "cedros-data:signup-limit-atomic-v1",
            "cedros-data:abuse-budget-consume-v1",
            "cedros-data:extension-storage-cas-v1",
            "cedros-data:mcp-connection-revoke-v1",
        ]
    );
    assert_eq!(dependencies.extensions.len(), 1);
    let pay = &dependencies.extensions[0];
    assert_eq!(pay.extension_id, "cedros-pay");
    assert_eq!(pay.min_version.as_deref(), Some("4.0.5"));
    assert_eq!(pay.required, Some(false));
    assert!(pay.reason.as_deref().unwrap().contains("denies"));
    assert_eq!(
        capability_ids,
        [
            "cedros-login:user-context",
            "cedros-login:identity-profile",
            "cedros-login:session-manage",
            "cedros-login:admin-auth",
            "cedros-login:site-brain-records",
            "cedros-login:auth-response",
            "cedros-login:invite-discount"
        ]
    );
    assert!(manifest
        .capabilities
        .iter()
        .all(|capability| !capability.requested_scopes.is_empty()));
    assert!(manifest
        .capabilities
        .iter()
        .flat_map(|capability| capability.requested_scopes.iter())
        .all(|scope| !scope.verb.is_empty()
            && !scope.resource.is_empty()
            && !scope.summary.is_empty()));
}

#[test]
fn register_extension_family_keeps_identity_integration_without_customer_pages() {
    let manifest = register_extension_family();

    assert!(manifest
        .surfaces
        .server
        .content_models
        .contains(&"cedros-login:identity-records".to_string()));
    assert!(manifest
        .surfaces
        .server
        .routes
        .contains(&"cedros-login:admin-users-list".to_string()));
    let analytics_ids: Vec<&str> = manifest
        .analytics
        .as_ref()
        .expect("analytics")
        .events
        .iter()
        .map(|event| event.id.as_str())
        .collect();
    assert!(analytics_ids.contains(&"cedros-login:registered"));
    assert!(analytics_ids.contains(&"cedros-login:registration-created"));
    assert!(analytics_ids.contains(&"cedros-login:user-login"));
    assert!(manifest.admin_modules.iter().all(|module| module
        .section_ids
        .iter()
        .all(|section_id| section_id != "cedros-login:users")));
    assert!(manifest
        .admin_modules
        .iter()
        .flat_map(|module| module.section_ids.iter())
        .any(|section_id| section_id == "cedros-login:login"));
    // Team / Team Invites are host-owned now (read via the team-directory host
    // service), so the extension's admin module no longer contributes them.
    assert!(manifest.admin_modules.iter().all(|module| module
        .section_ids
        .iter()
        .all(|section_id| section_id != "cedros-login:team"
            && section_id != "cedros-login:team-invites")));
}
