import { http, HttpResponse } from 'msw';

import type { DashboardPermissions } from '../../../types/dashboardPermissions';
import { TEST_SERVER_AUTH_URL, TEST_SERVER_URL } from './mockState';
import { getMockSettingsResponse, mockSettingsMutationResponse } from './settingsSupport';

function getMockDashboardPermissions(): DashboardPermissions {
  return {
    admin: {
      users: true,
      team: true,
      login: true,
      referrals: true,
      'settings-referrals': true,
    },
    member: {
      users: false,
      team: true,
      login: false,
      referrals: false,
      'settings-referrals': false,
    },
  };
}

export const adminSettingsHandlers = [
  // =============================================================================
  // SYSTEM SETTINGS HANDLERS
  // =============================================================================

  // GET /admin/settings - return all system settings
  http.get(`${TEST_SERVER_URL}/admin/settings`, () => {
    return HttpResponse.json(getMockSettingsResponse());
  }),

  http.get(`${TEST_SERVER_AUTH_URL}/admin/settings`, () => {
    return HttpResponse.json(getMockSettingsResponse());
  }),

  // PATCH /admin/settings - update settings
  http.patch(`${TEST_SERVER_URL}/admin/settings`, async ({ request }) => {
    const body = (await request.json()) as { settings: Array<{ key: string; value: string }> };
    return HttpResponse.json(mockSettingsMutationResponse(body.settings));
  }),

  http.patch(`${TEST_SERVER_AUTH_URL}/admin/settings`, async ({ request }) => {
    const body = (await request.json()) as { settings: Array<{ key: string; value: string }> };
    return HttpResponse.json(mockSettingsMutationResponse(body.settings));
  }),

  // PATCH /admin/settings/autosave - Cedros autosave protocol path
  http.patch(`${TEST_SERVER_URL}/admin/settings/autosave`, async ({ request }) => {
    const body = (await request.json()) as { patch: Array<{ key: string; value: string }> };
    return HttpResponse.json(mockSettingsMutationResponse(body.patch));
  }),

  http.patch(`${TEST_SERVER_AUTH_URL}/admin/settings/autosave`, async ({ request }) => {
    const body = (await request.json()) as { patch: Array<{ key: string; value: string }> };
    return HttpResponse.json(mockSettingsMutationResponse(body.patch));
  }),

  // =============================================================================
  // DASHBOARD PERMISSIONS HANDLERS
  // =============================================================================

  // GET /admin/dashboard-permissions - get current permissions config
  http.get(`${TEST_SERVER_URL}/admin/dashboard-permissions`, () => {
    return HttpResponse.json({
      permissions: getMockDashboardPermissions(),
    });
  }),

  http.get(`${TEST_SERVER_AUTH_URL}/admin/dashboard-permissions`, () => {
    return HttpResponse.json({
      permissions: getMockDashboardPermissions(),
    });
  }),

  // PUT /admin/dashboard-permissions - update permissions config
  http.put(`${TEST_SERVER_URL}/admin/dashboard-permissions`, async ({ request }) => {
    const body = (await request.json()) as {
      admin: Record<string, boolean>;
      member: Record<string, boolean>;
    };
    return HttpResponse.json({ permissions: body });
  }),

  http.put(`${TEST_SERVER_AUTH_URL}/admin/dashboard-permissions`, async ({ request }) => {
    const body = (await request.json()) as {
      admin: Record<string, boolean>;
      member: Record<string, boolean>;
    };
    return HttpResponse.json({ permissions: body });
  }),

  // =============================================================================
  // SETUP HANDLERS (first-run wizard)
  // =============================================================================

  // Get setup status (returns needsSetup: false for normal test operation)
  http.get(`${TEST_SERVER_URL}/setup/status`, () => {
    return HttpResponse.json({
      needsSetup: false,
      hasAdmin: true,
    });
  }),

  http.get(`${TEST_SERVER_AUTH_URL}/setup/status`, () => {
    return HttpResponse.json({
      needsSetup: false,
      hasAdmin: true,
    });
  }),

  // Create first admin (would only work if needsSetup: true)
  http.post(`${TEST_SERVER_URL}/setup/admin`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; name?: string };
    return HttpResponse.json({
      user: {
        id: 'new-admin-id',
        email: body.email,
        name: body.name || null,
        isSystemAdmin: true,
      },
      message: 'Admin account created successfully',
    });
  }),

  http.post(`${TEST_SERVER_AUTH_URL}/setup/admin`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; name?: string };
    return HttpResponse.json({
      user: {
        id: 'new-admin-id',
        email: body.email,
        name: body.name || null,
        isSystemAdmin: true,
      },
      message: 'Admin account created successfully',
    });
  }),

  // =============================================================================
  // SSO PROVIDER HANDLERS
  // =============================================================================

  // GET /admin/sso-providers - list SSO providers
  http.get(`${TEST_SERVER_URL}/admin/sso-providers`, () => {
    return HttpResponse.json({
      providers: [],
      total: 0,
      limit: 50,
      offset: 0,
    });
  }),

  http.get(`${TEST_SERVER_AUTH_URL}/admin/sso-providers`, () => {
    return HttpResponse.json({
      providers: [],
      total: 0,
      limit: 50,
      offset: 0,
    });
  }),

  // POST /admin/sso-providers - create SSO provider
  http.post(`${TEST_SERVER_URL}/admin/sso-providers`, async ({ request }) => {
    const body = (await request.json()) as {
      orgId: string;
      name: string;
      issuerUrl: string;
      clientId: string;
      clientSecret: string;
      scopes?: string[];
      enabled?: boolean;
      allowRegistration?: boolean;
      emailDomain?: string | null;
    };
    const now = new Date().toISOString();
    return HttpResponse.json({
      id: `sso-${Date.now()}`,
      orgId: body.orgId,
      name: body.name,
      issuerUrl: body.issuerUrl,
      clientId: body.clientId,
      scopes: body.scopes || ['openid', 'email', 'profile'],
      enabled: body.enabled ?? true,
      allowRegistration: body.allowRegistration ?? false,
      emailDomain: body.emailDomain ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }),

  http.post(`${TEST_SERVER_AUTH_URL}/admin/sso-providers`, async ({ request }) => {
    const body = (await request.json()) as {
      orgId: string;
      name: string;
      issuerUrl: string;
      clientId: string;
      clientSecret: string;
      scopes?: string[];
      enabled?: boolean;
      allowRegistration?: boolean;
      emailDomain?: string | null;
    };
    const now = new Date().toISOString();
    return HttpResponse.json({
      id: `sso-${Date.now()}`,
      orgId: body.orgId,
      name: body.name,
      issuerUrl: body.issuerUrl,
      clientId: body.clientId,
      scopes: body.scopes || ['openid', 'email', 'profile'],
      enabled: body.enabled ?? true,
      allowRegistration: body.allowRegistration ?? false,
      emailDomain: body.emailDomain ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }),

  // PUT /admin/sso-providers/:id - update SSO provider
  http.put(`${TEST_SERVER_URL}/admin/sso-providers/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    return HttpResponse.json({
      id,
      orgId: 'mock-org-id',
      name: body.name || 'Updated Provider',
      issuerUrl: body.issuerUrl || 'https://example.com',
      clientId: body.clientId || 'client-id',
      scopes: (body.scopes as string[]) || ['openid', 'email', 'profile'],
      enabled: body.enabled ?? true,
      allowRegistration: body.allowRegistration ?? false,
      emailDomain: (body.emailDomain as string | null) ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }),

  http.put(`${TEST_SERVER_AUTH_URL}/admin/sso-providers/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    return HttpResponse.json({
      id,
      orgId: 'mock-org-id',
      name: body.name || 'Updated Provider',
      issuerUrl: body.issuerUrl || 'https://example.com',
      clientId: body.clientId || 'client-id',
      scopes: (body.scopes as string[]) || ['openid', 'email', 'profile'],
      enabled: body.enabled ?? true,
      allowRegistration: body.allowRegistration ?? false,
      emailDomain: (body.emailDomain as string | null) ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }),

  // DELETE /admin/sso-providers/:id - delete SSO provider
  http.delete(`${TEST_SERVER_URL}/admin/sso-providers/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.delete(`${TEST_SERVER_AUTH_URL}/admin/sso-providers/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
];
