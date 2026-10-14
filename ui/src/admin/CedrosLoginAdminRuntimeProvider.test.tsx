import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CedrosLoginAdminRuntimeProvider } from './CedrosLoginAdminRuntimeProvider';
import { useCedrosLoginAdminRuntimeOptional } from './CedrosLoginAdminRuntimeContext';
import type { AdminSectionProps } from './types';

describe('CedrosLoginAdminRuntimeProvider', () => {
  it('provides the Workbench root classes and extension id', () => {
    renderProvider({
      serverUrl: 'https://admin.example.com/extensions/cedros-login',
      passkeyDefaults: undefined,
    });

    const root = screen.getByTestId('endpoint').parentElement;
    expect(root).toHaveClass('cedros-login-admin-root', 'cedros-data');
    expect(root).toHaveAttribute('data-extension-id', 'cedros-login');
  });

  it('keeps passkey defaults endpoints on the Cedros Login server origin', () => {
    renderProvider({
      serverUrl: 'https://admin.example.com/extensions/cedros-login',
      passkeyDefaults: {
        serverUrl: 'https://admin.example.com',
        path: 'admin/runtime/cedros-login/passkey-defaults',
      },
    });

    expect(screen.getByTestId('endpoint').textContent).toBe(
      'https://admin.example.com/admin/runtime/cedros-login/passkey-defaults'
    );
  });

  it('rejects cross-origin passkey defaults endpoints', () => {
    renderProvider({
      serverUrl: 'https://admin.example.com/extensions/cedros-login',
      passkeyDefaults: {
        serverUrl: 'https://attacker.example',
        path: '/collect/passkey-defaults',
      },
    });

    expect(screen.getByTestId('endpoint').textContent).toBe('none');
  });

  it('forwards only boolean Cedros Pay installed state', () => {
    renderProvider({
      serverUrl: 'https://admin.example.com/extensions/cedros-login',
      passkeyDefaults: undefined,
      cedrosPayInstalled: false,
    });

    expect(screen.getByTestId('pay-installed').textContent).toBe('false');
  });

  it('ignores malformed Cedros Pay installed state', () => {
    renderProvider({
      serverUrl: 'https://admin.example.com/extensions/cedros-login',
      passkeyDefaults: undefined,
      cedrosPayInstalled: 'false',
    });

    expect(screen.getByTestId('pay-installed').textContent).toBe('undefined');
  });

  it('accepts a complete host early-access bridge', () => {
    const getState = vi.fn().mockResolvedValue({
      available: true,
      editable: true,
      waitlistModeEnabled: true,
      enabled: false,
    });
    renderProvider({
      serverUrl: 'https://admin.example.com/extensions/cedros-login',
      passkeyDefaults: undefined,
      earlyAccessHost: { getState, setEnabled: vi.fn() },
    });

    expect(screen.getByTestId('early-access-host').textContent).toBe('available');
  });
});

function renderProvider({
  cedrosPayInstalled,
  earlyAccessHost,
  passkeyDefaults,
  serverUrl,
}: {
  cedrosPayInstalled?: unknown;
  earlyAccessHost?: unknown;
  passkeyDefaults: unknown;
  serverUrl: string;
}) {
  const pluginContext: AdminSectionProps['pluginContext'] = {
    getAccessToken: vi.fn(() => 'admin-token'),
    hasPermission: vi.fn(() => true),
    pluginData: {
      cedrosLoginPasskeyDefaults: passkeyDefaults,
      cedrosPayInstalled,
      cedrosLoginEarlyAccess: earlyAccessHost,
    },
    serverUrl,
  };

  return render(
    <CedrosLoginAdminRuntimeProvider pluginContext={pluginContext}>
      <RuntimeProbe />
    </CedrosLoginAdminRuntimeProvider>
  );
}

function RuntimeProbe() {
  const runtime = useCedrosLoginAdminRuntimeOptional();
  const endpoint = runtime?.passkeyDefaultsEndpoint;
  return (
    <>
      <div data-testid="endpoint">
        {endpoint ? `${endpoint.serverUrl}${endpoint.path}` : 'none'}
      </div>
      <div data-testid="pay-installed">{String(runtime?.cedrosPayInstalled)}</div>
      <div data-testid="early-access-host">{runtime?.earlyAccessHost ? 'available' : 'none'}</div>
    </>
  );
}
