import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import registerCedrosLoginAdminSurface, {
  cedrosLoginAdminBootstrap,
  cedrosLoginAdminExtensionBootstrap,
  registerCedrosAdminSurface,
} from '../admin/register';

const repoRoot = resolve(__dirname, '../../..');
const readArchiveManifest = () =>
  JSON.parse(readFileSync(resolve(repoRoot, 'cedros-extension.manifest.json'), 'utf8'));
const readArchiveBootstrap = () =>
  JSON.parse(readFileSync(resolve(repoRoot, 'cedros-extension.bootstrap.json'), 'utf8'));

describe('cedros-login extension registration', () => {
  it('exports the same admin bootstrap as both factory functions and bootstrap objects', () => {
    // Cedros platform accepts any of these four entries, as either a bootstrap
    // object or a factory function. They must resolve to one shared object so
    // a host that picks any entry sees the same surfaces.
    expect(typeof registerCedrosAdminSurface).toBe('function');
    expect(typeof registerCedrosLoginAdminSurface).toBe('function');
    expect(registerCedrosLoginAdminSurface).toBe(registerCedrosAdminSurface);
    expect(cedrosLoginAdminBootstrap).toBe(cedrosLoginAdminExtensionBootstrap);
    expect(registerCedrosAdminSurface()).toBe(cedrosLoginAdminExtensionBootstrap);
    expect(registerCedrosLoginAdminSurface()).toBe(cedrosLoginAdminExtensionBootstrap);
  });

  it('keeps the runtime bootstrap version-locked to the installed-extension archive', () => {
    // Cedros platform hydration is gated on exact (extensionId, version) match
    // between the installed ZIP record and the trusted runtime bootstrap
    // registered via extensionRuntimeBootstraps / extensionRuntimeRegistry.
    // If the runtime drifts from the archive, the host refuses to hydrate
    // and the cedros-login UI stays inert. Lock the two together here.
    const runtime = registerCedrosAdminSurface();
    const archiveManifest = readArchiveManifest();
    const archiveBootstrap = readArchiveBootstrap();
    expect(runtime.manifest.extensionId).toBe(archiveManifest.extensionId);
    expect(runtime.manifest.version).toBe(archiveManifest.version);
    expect(runtime.manifest).toEqual(archiveManifest);
    expect(archiveBootstrap.manifest.extensionId).toBe(runtime.manifest.extensionId);
    expect(archiveBootstrap.manifest.version).toBe(runtime.manifest.version);
    // The intake ZIP carries executable React surfaces as JavaScript under
    // workspace/react/dist/**. bootstrap.json carries only the serializable
    // template layouts that Data needs before it can provision page seeds.
    expect(archiveBootstrap.modules).toBeUndefined();
    expect(archiveBootstrap.contentBlocks).toBeUndefined();
    expect(archiveBootstrap.contentTemplates).toHaveLength(archiveManifest.contentTemplates.length);
    expect(
      archiveBootstrap.contentTemplates.every(
        (template: { zones?: unknown[]; blocks?: unknown[] }) =>
          template.zones?.length && template.blocks?.length
      )
    ).toBe(true);
    expect(archiveBootstrap.contentBlockRenderers).toBeUndefined();
    expect(archiveBootstrap.hostServices).toBeUndefined();
  });

  it('returns an executable admin bootstrap with Extension Settings and Users handoff sections', () => {
    const bootstrap = registerCedrosLoginAdminSurface();

    expect(registerCedrosAdminSurface()).toBe(cedrosLoginAdminExtensionBootstrap);
    expect(registerCedrosLoginAdminSurface()).toBe(cedrosLoginAdminBootstrap);
    expect(bootstrap.manifest.extensionId).toBe('cedros-login');
    expect(bootstrap.manifest.registration.admin.entrypoint).toBe(
      '@cedros/login-react/admin/register'
    );
    expect(bootstrap.manifest.registration.web.entrypoint).toBe('@cedros/login-react/web/register');
    expect(bootstrap.manifest.surfaces.admin.required).toBe(true);
    expect(bootstrap.manifest.surfaces.admin.moduleIds).toEqual(['cedros-login:admin']);
    expect(bootstrap.manifest.adminModules?.[0]).toMatchObject({
      moduleId: 'cedros-login:admin',
      extensionId: 'cedros-login',
      displayName: 'Cedros Login',
      packageName: '@cedros/login-react',
      sectionIds: ['cedros-login:login'],
      sectionIcons: {
        'cedros-login:login': 'account',
      },
    });
    const modules = bootstrap.modules ?? [];
    expect(modules).toHaveLength(1);
    const adminModule = modules[0]!;
    expect(adminModule.id).toBe('cedros-login:admin');
    expect(adminModule.manifest?.extensionId).toBe('cedros-login');
    // Team / Team Invites are host-owned now (read via the team-directory host
    // service); the extension module ships only the Login section.
    expect(adminModule.sections.map((section) => section.id)).toEqual(['cedros-login:login']);
    expect(adminModule.sections.map((section) => section.id)).not.toContain('cedros-login:team');
    expect(adminModule.sections.map((section) => section.id)).not.toContain('cedros-login:users');
    expect(adminModule.sections.some((section) => /customers/i.test(section.label))).toBe(false);
    expect(
      adminModule.sections.find((section) => section.id === 'cedros-login:login')
    ).toMatchObject({
      label: 'Login',
      requiredPermission: 'manage_settings',
      replacesSectionIds: [
        'cedros-data:account-settings',
        'account-settings',
        'cedros-login:account-settings',
        'cedros-login:settings-email',
        'cedros-login:settings-webhooks',
        'cedros-login:settings-server',
        'cedros-login:settings-images',
        'cedros-login:activity',
      ],
    });
    expect(adminModule.sections.find((section) => section.id === 'cedros-login:login')?.group).toBe(
      'Extension Settings'
    );
    expect(adminModule.components['cedros-login:team']).toBeUndefined();
    expect(adminModule.components['cedros-login:team-invites']).toBeUndefined();
    expect(adminModule.components['cedros-login:login']).toBeDefined();
    expect(adminModule.contributions?.dashboardCards?.map((card) => card.id)).toEqual([
      'cedros-login:identity-health-card',
    ]);
    expect(bootstrap.hostServices.map((service) => service.id)).toEqual([
      'cedros-login-team-directory',
    ]);
    expect(bootstrap.contentBlocks).toBeUndefined();
    expect(bootstrap.contentBlockRenderers).toBeUndefined();
    expect(bootstrap.contentTemplates).toBeUndefined();
  });

  it('keeps login identity integration metadata available to CRM hosts', () => {
    const bootstrap = registerCedrosLoginAdminSurface();

    expect(bootstrap.manifest.compatibility.minCedrosDataVersion).toBe('0.1.91');
    expect(bootstrap.manifest.databaseAccess?.[0]?.contentModels).toContain(
      'cedros-login:identity-records'
    );
    expect(bootstrap.manifest.providerAccess?.map((access) => access.id)).toContain(
      'cedros-login:email-provider'
    );
    expect(bootstrap.manifest.dependencies?.services ?? []).toEqual([]);
    expect(
      (bootstrap.manifest.dependencies?.capabilities ?? []).map(({ capabilityId, required }) => ({
        capabilityId,
        required,
      }))
    ).toEqual([
      { capabilityId: 'cedros-data:database-concurrency-v2', required: true },
      { capabilityId: 'cedros-data:token-email-evidence-v1', required: true },
      { capabilityId: 'cedros-data:identity-atomic-v1', required: true },
      { capabilityId: 'cedros-data:session-atomic-v1', required: true },
      { capabilityId: 'cedros-data:signup-limit-atomic-v1', required: true },
      { capabilityId: 'cedros-data:abuse-budget-consume-v1', required: true },
      { capabilityId: 'cedros-data:extension-storage-cas-v1', required: true },
      { capabilityId: 'cedros-data:mcp-connection-revoke-v1', required: true },
    ]);
    expect(bootstrap.manifest.requiredCapabilities).toEqual([
      'cedros-data:database-concurrency-v2',
      'cedros-data:token-email-evidence-v1',
      'cedros-data:identity-atomic-v1',
      'cedros-data:session-atomic-v1',
      'cedros-data:signup-limit-atomic-v1',
      'cedros-data:abuse-budget-consume-v1',
      'cedros-data:extension-storage-cas-v1',
      'cedros-data:mcp-connection-revoke-v1',
    ]);
    expect(
      bootstrap.manifest.dependencies?.extensions?.map(({ extensionId, minVersion, required }) => ({
        extensionId,
        minVersion,
        required,
      }))
    ).toEqual([{ extensionId: 'cedros-pay', minVersion: '3.0.2', required: false }]);
    expect(bootstrap.manifest.surfaces.server.routes).toContain('cedros-login:admin-users-list');
    expect(bootstrap.manifest.surfaces.server.routes).toContain('cedros-login:system-email-preview');
    expect(bootstrap.manifest.providerAccess?.find((access) => access.id === 'cedros-login:email-provider')?.scopes).toContain('email.design.resolve');
    expect(bootstrap.manifest.surfaces.server.routes).toContain(
      'cedros-login:relying-party-session-introspect'
    );
    expect(bootstrap.manifest.analytics?.events.map((event) => event.id)).toEqual([
      'cedros-login:authenticated',
      'cedros-login:registered',
      'cedros-login:logout',
      'cedros-login:registration-created',
      'cedros-login:user-login',
      'cedros-login:identifier-linked',
      'cedros-login:identifier-unlinked',
      'cedros-login:login-failed',
      'cedros-login:account-locked',
      'cedros-login:token-reuse-detected',
      'cedros-login:mfa-enabled',
      'cedros-login:mfa-disabled',
      'cedros-login:password-reset-requested',
      'cedros-login:password-reset-completed',
      'cedros-login:email-verified',
      'cedros-login:account-deleted',
      'cedros-login:invite-sent',
      'cedros-login:invite-accepted',
    ]);
    expect(
      bootstrap.manifest.analytics?.events.every((event) => event.visibility === 'authenticated')
    ).toBe(true);
    expect(
      bootstrap.manifest.analytics?.events.every((event) => event.id.startsWith('cedros-login:'))
    ).toBe(true);
    expect(bootstrap.manifest.surfaces.server.events).toContain(
      'cedros-login:registration-created'
    );
    expect(bootstrap.manifest.surfaces.server.events).toContain('cedros-login:user-login');
    expect(bootstrap.manifest.setupSeeds).not.toHaveProperty('siteAdminImports');
    expect(bootstrap.manifest.surfaces.server.routes).toContain('cedros-login:setup-admin-import');
    expect(bootstrap.manifest.setupSeeds?.notifications?.map((seed) => seed.eventId)).toEqual([
      'cedros-login:registration-created',
      'cedros-login:user-login',
    ]);
    expect(
      bootstrap.manifest.setupSeeds?.notifications?.every((seed) => seed.audience === 'team')
    ).toBe(true);
    expect(JSON.stringify(bootstrap.manifest.setupSeeds)).not.toMatch(
      /\{\{\s*(email|user|session|token|password|ip|wallet|auth|provider)/i
    );
    expect(JSON.stringify(bootstrap.manifest.setupSeeds)).not.toMatch(/\$argon2id|admin@example/i);
    expect(bootstrap.manifest.capabilities?.map((capability) => capability.id)).toEqual([
      'cedros-login:user-context',
      'cedros-login:identity-profile',
      'cedros-login:session-manage',
      'cedros-login:admin-auth',
      'cedros-login:site-brain-records',
      'cedros-login:auth-response',
      'cedros-login:invite-discount',
    ]);
    expect(
      bootstrap.manifest.capabilities?.every((capability) => capability.requestedScopes.length > 0)
    ).toBe(true);
    expect(bootstrap.manifest.surfaces.ai?.packageRef).toBe('server');
    expect(bootstrap.manifest.surfaces.ai?.skills?.map((skill) => skill.id)).toEqual([
      'cedros-login:auth-and-onboarding',
      'cedros-login:account-security',
      'cedros-login:identity-admin',
    ]);
    expect(
      bootstrap.manifest.surfaces.ai?.capabilities?.map((capability) => capability.id)
    ).toEqual([
      'cedros-login:data-membership-relationship',
      'cedros-login:send-verification-email',
      'cedros-login:verify-email-token',
      'cedros-login:logout-all-sessions',
      'cedros-login:disable-mfa',
    ]);
    const disableMfa = bootstrap.manifest.surfaces.ai?.capabilities?.find(
      (capability) => capability.id === 'cedros-login:disable-mfa'
    );
    expect(disableMfa?.inputSchema).toMatchObject({
      additionalProperties: false,
      minProperties: 1,
      maxProperties: 1,
    });
    expect(Object.keys(disableMfa?.inputSchema.properties ?? {}).sort()).toEqual([
      'code',
      'recoveryCode',
    ]);
    expect(disableMfa?.inputSchema.required).toBeUndefined();
    expect(disableMfa?.inputSchema.description).toMatch(/code or recoveryCode/);
  });
});
