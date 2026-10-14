import { describe, expect, it } from 'vitest';
import { HOST_SERVICE_IDS } from './platform';

import { cedrosLoginPlugin, hasCedrosPayPlugin, resolveCedrosPayInstalled } from './plugin';

describe('cedrosLoginPlugin', () => {
  it('builds plugin context from the host service bag', () => {
    const pluginContext = cedrosLoginPlugin.createPluginContext({
      services: {
        [HOST_SERVICE_IDS.cedrosLogin]: {
          user: { id: 'user-1', email: 'user@example.com' },
          getAccessToken: () => 'token-1',
          serverUrl: 'https://auth.example.com',
        },
        [HOST_SERVICE_IDS.org]: {
          orgId: 'org-1',
          role: 'owner',
          permissions: ['admin'],
        },
      },
      custom: {
        cedrosLoginPasskeyDefaults: {
          serverUrl: 'https://admin.example.com',
          path: '/admin/runtime/cedros-login/passkey-defaults',
        },
        cedrosLoginEarlyAccess: {
          getState: async () => ({}),
          setEnabled: async () => ({}),
        },
      },
    });

    // The shared plugin is also used by standalone admin surfaces, where the
    // cedros-login server exposes admin routes directly at /admin/*.
    expect(pluginContext.serverUrl).toBe('https://auth.example.com');
    expect(pluginContext.userId).toBe('user-1');
    expect(pluginContext.getAccessToken()).toBe('token-1');
    expect(pluginContext.orgId).toBe('org-1');
    expect(pluginContext.pluginData?.cedrosLoginPasskeyDefaults).toEqual({
      serverUrl: 'https://admin.example.com',
      path: '/admin/runtime/cedros-login/passkey-defaults',
    });
    expect(pluginContext.pluginData?.cedrosLoginEarlyAccess).toBeDefined();
  });

  it('fails closed when required login host service is missing', () => {
    expect(() => cedrosLoginPlugin.createPluginContext({ services: {} })).toThrow(
      'cedros-login plugin requires the cedros-login host service'
    );
  });

  it('reads explicit Cedros Pay installed state from host context', () => {
    const pluginContext = cedrosLoginPlugin.createPluginContext({
      services: {
        [HOST_SERVICE_IDS.cedrosLogin]: {
          user: { id: 'user-1' },
          getAccessToken: () => null,
          serverUrl: 'https://auth.example.com',
        },
      },
      custom: { cedrosPayInstalled: false },
    });

    expect(pluginContext.pluginData?.cedrosPayInstalled).toBe(false);
  });

  it('detects Cedros Pay from host-installed extension identifiers', () => {
    expect(resolveCedrosPayInstalled({ installedExtensionIds: ['cedros-pay'] })).toBe(true);
    expect(resolveCedrosPayInstalled({ installedExtensions: [] })).toBe(false);
    expect(hasCedrosPayPlugin([{ id: 'cedros-pay', name: 'Cedros Pay' } as never])).toBe(true);
  });

  it('checks permissions through the org service bag', () => {
    expect(
      cedrosLoginPlugin.checkPermission('login:users:read', {
        services: {
          [HOST_SERVICE_IDS.cedrosLogin]: {
            user: { id: 'user-1' },
            getAccessToken: () => null,
            serverUrl: 'https://auth.example.com',
          },
          [HOST_SERVICE_IDS.org]: {
            orgId: 'org-1',
            role: 'owner',
            permissions: [],
          },
        },
      })
    ).toBe(true);

    expect(
      cedrosLoginPlugin.checkPermission('login:users:read', {
        services: {
          [HOST_SERVICE_IDS.org]: {
            orgId: 'org-1',
            role: 'member',
            permissions: [],
          },
        },
      })
    ).toBe(false);
  });

  it('maps Cedros built-in admin permissions to existing owner/admin roles', () => {
    const hostContext = {
      services: {
        [HOST_SERVICE_IDS.cedrosLogin]: {
          user: { id: 'user-1' },
          getAccessToken: () => null,
          serverUrl: 'https://auth.example.com',
        },
        [HOST_SERVICE_IDS.org]: {
          orgId: 'org-1',
          role: 'admin',
          permissions: [],
        },
      },
    };

    expect(cedrosLoginPlugin.checkPermission('manage_users', hostContext)).toBe(true);
    expect(cedrosLoginPlugin.checkPermission('manage_settings', hostContext)).toBe(true);
  });

  it('registers consolidated sidebar entries plus the invite handoff route', () => {
    expect(cedrosLoginPlugin.sections.map((section) => section.id)).toEqual([
      'users',
      'team',
      'team-invites',
      'login',
    ]);

    expect(cedrosLoginPlugin.groups).toEqual([
      { id: 'users', label: 'Users', order: 0 },
      { id: 'extension-settings', label: 'Extension Settings', order: 1 },
    ]);

    expect(Object.keys(cedrosLoginPlugin.components)).toEqual([
      'users',
      'team',
      'team-invites',
      'login',
    ]);

    expect(cedrosLoginPlugin.sections.find((section) => section.id === 'team')).toMatchObject({
      label: 'Team',
      group: 'Users',
      routePath: '/users/team',
    });

    expect(
      cedrosLoginPlugin.sections.find((section) => section.id === 'team-invites')
    ).toMatchObject({
      label: 'Invite Team Members',
      group: 'Users',
      routePath: '/users/team/invite',
      defaultTab: 'invites',
      hideFromNavigation: true,
    });

    expect(cedrosLoginPlugin.sections.find((section) => section.id === 'login')).toMatchObject({
      label: 'Login',
      group: 'Extension Settings',
      requiredPermission: 'login:settings:read',
    });

    // The legacy per-feature ids must NOT be re-registered as sidebar entries.
    for (const legacyId of [
      'settings-auth',
      'settings-email',
      'settings-webhooks',
      'settings-server',
      'settings-images',
      'activity',
    ]) {
      expect(
        cedrosLoginPlugin.sections.find((entry) => entry.id === legacyId),
        `${legacyId} must not be registered as its own sidebar entry`
      ).toBeUndefined();
    }
  });
});
