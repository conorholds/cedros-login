import { Suspense } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cedrosLoginExtensionAdminModule } from './cedrosAdminModule';
import { HOST_SERVICE_IDS } from './platform';
import { registerCedrosAdminSurface } from './register';
import type { HostContext } from './types';
import { cedrosLoginAdminModuleManifest, cedrosLoginAdminNavigation } from '../extension/manifest';

const systemSettingsClientConstructors = vi.fn();
const getSettingsMock = vi.fn();

vi.mock('../utils/systemSettingsApi', () => {
  class MockSystemSettingsApiClient {
    constructor(
      baseUrl: string,
      timeoutMs?: number,
      retryAttempts?: number,
      getAccessToken?: () => string | null
    ) {
      systemSettingsClientConstructors({
        baseUrl,
        timeoutMs,
        retryAttempts,
        token: getAccessToken?.() ?? null,
      });
    }

    getSettings = getSettingsMock;
    updateSettings = vi.fn();
  }

  return { SystemSettingsApiClient: MockSystemSettingsApiClient };
});

function createServiceBagHostContext(): HostContext {
  return {
    services: {
      [HOST_SERVICE_IDS.cedrosLogin]: {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User One',
        },
        getAccessToken: () => 'token-123',
        serverUrl: 'https://auth.example.com',
      },
      [HOST_SERVICE_IDS.org]: {
        orgId: 'org-1',
        role: 'owner',
        permissions: [],
      },
    },
  };
}

function createSettingsResponse() {
  const updatedAt = '2026-01-01T00:00:00.000Z';
  const setting = (key: string, value: string) => ({
    key,
    value,
    description: null,
    isSecret: false,
    updatedAt,
    updatedBy: null,
  });

  return {
    settings: {
      'auth.email': [setting('auth_email_enabled', 'true')],
      postlogin: [setting('postlogin_redirect_url', '')],
      'postlogin.welcome': [
        setting('postlogin_welcome_enabled', 'false'),
        setting('postlogin_welcome_route', '/welcome'),
      ],
      'postlogin.username': [setting('postlogin_username_enabled', 'false')],
      'postlogin.complete': [setting('postlogin_complete_enabled', 'false')],
      'postlogin.subscription': [
        setting('subscription_selection_required', 'false'),
        setting('subscription_selection_route', '/subscribe'),
        setting('subscription_selection_pay_base_url', ''),
      ],
    },
  };
}

describe('cedros-login admin module integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSettingsMock.mockResolvedValue(createSettingsResponse());
  });

  it('renders the contributed Login component without a Login-owned shell', async () => {
    const bootstrap = registerCedrosAdminSurface();
    const adminModule = bootstrap.modules?.[0];
    if (!adminModule) throw new Error('bootstrap.modules[0] missing');

    const Component = adminModule.components['cedros-login:login'];
    if (!Component) throw new Error('Login admin component missing');
    expect(typeof Component).toBe('function');

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <Component
          pluginContext={adminModule.createPluginContext(createServiceBagHostContext())}
          pageSize={20}
          refreshInterval={30_000}
        />
      </Suspense>
    );

    expect(await screen.findByRole('heading', { name: 'Authentication' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Methods' })).toBeInTheDocument();
    expect(await screen.findByRole('switch', { name: 'Email' })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('tab', { name: 'Behavior' }));
    expect(await screen.findByText('Require subscription selection')).toBeInTheDocument();

    expect(systemSettingsClientConstructors).toHaveBeenCalledWith({
      baseUrl: 'https://auth.example.com/extensions/cedros-login',
      timeoutMs: undefined,
      retryAttempts: undefined,
      token: 'token-123',
    });
  });

  it('contributes only the host-owned Login route and no team routes', () => {
    expect(cedrosLoginExtensionAdminModule.sections.map((section) => section.id)).toEqual([
      'cedros-login:login',
    ]);
    expect(cedrosLoginExtensionAdminModule.components['cedros-login:team']).toBeUndefined();
    expect(cedrosLoginExtensionAdminModule.components['cedros-login:team-invites']).toBeUndefined();
    expect(cedrosLoginExtensionAdminModule.manifest?.sectionIds).toEqual(['cedros-login:login']);
  });

  it('matches the canonical manifest navigation projection exactly', () => {
    const runtimeSections = cedrosLoginExtensionAdminModule.sections.map((section) =>
      Object.fromEntries(
        Object.entries(section).filter(([key]) => !['icon', 'routeId', 'routePath'].includes(key))
      )
    );
    const runtimeGroups = (cedrosLoginExtensionAdminModule.groups ?? []).map((group) =>
      Object.fromEntries(Object.entries(group).filter(([key]) => key !== 'icon'))
    );

    expect(runtimeSections).toEqual(cedrosLoginAdminNavigation.sections);
    expect(runtimeGroups).toEqual(cedrosLoginAdminNavigation.groups);
    expect(cedrosLoginExtensionAdminModule.manifest).toMatchObject({
      extensionId: cedrosLoginAdminModuleManifest.extensionId,
      moduleId: cedrosLoginAdminModuleManifest.moduleId,
      version: cedrosLoginAdminModuleManifest.version,
      sectionIds: cedrosLoginAdminModuleManifest.sectionIds,
      navigation: cedrosLoginAdminModuleManifest.navigation,
    });
  });
});
