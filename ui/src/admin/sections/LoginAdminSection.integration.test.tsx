import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CedrosLoginAdminRuntimeProvider } from '../CedrosLoginAdminRuntimeProvider';
import type { AdminSectionProps } from '../types';
import LoginAdminSection from './LoginAdminSection';

describe('LoginAdminSection settings response compatibility', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders settings from the pre-grouped Wasm key/value response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input) => {
        if (String(input).endsWith('/admin/invite-codes')) {
          return jsonResponse({ codes: [] });
        }
        return jsonResponse({
          settings: {
            auth_email_enabled: true,
            auth_email_require_verification: true,
            auth_instantlink_expiry: 900,
          },
        });
      })
    );
    const props = sectionProps();

    render(
      <CedrosLoginAdminRuntimeProvider pluginContext={props.pluginContext}>
        <LoginAdminSection {...props} />
      </CedrosLoginAdminRuntimeProvider>
    );

    expect(await screen.findByRole('heading', { name: 'Authentication' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Email' })).toBeChecked();
    for (const name of ['Methods', 'Behavior', 'Advanced', 'Signup limits', 'Invite codes']) {
      fireEvent.click(screen.getByRole('tab', { name }));
      expect(screen.queryByRole('heading', { name: 'OAuth clients' })).not.toBeInTheDocument();
      expect(screen.queryByText('Service integrations')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Relying parties' })).not.toBeInTheDocument();
    }
    expect(screen.queryByRole('tab', { name: 'Service integrations' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'OAuth clients' })).not.toBeInTheDocument();
    expect(
      vi
        .mocked(fetch)
        .mock.calls.every(
          ([url]) =>
            !String(url).includes('relying-parties') && !String(url).includes('/admin/oauth')
        )
    ).toBe(true);
  });
});

function sectionProps(): AdminSectionProps {
  return {
    pluginContext: {
      serverUrl: 'https://admin.example.com/extensions/cedros-login',
      getAccessToken: () => 'admin-token',
      hasPermission: () => true,
      userId: 'admin-1',
      pluginData: {
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
        },
      },
    },
    pageSize: 20,
    refreshInterval: 30_000,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
