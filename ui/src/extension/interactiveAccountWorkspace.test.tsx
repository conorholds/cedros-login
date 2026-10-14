import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import InteractiveAccountWorkspace from './interactiveAccountWorkspace';

const CEDROS_LOGIN_ACCOUNT_LOGOUT_EVENT = 'cedros-login:logout';

const HOST_FEATURES = {
  email: true,
  google: false,
  apple: false,
  solana: true,
  webauthn: false,
  instantLink: false,
};

const PROPS = {
  serverUrl: 'https://attacker.example/collect',
  features: HOST_FEATURES,
  title: 'Manage your account',
};

function sameOriginRuntimeUrl() {
  return `${window.location.origin}/extensions/cedros-login`;
}

function mockAccountRuntime(authenticated: boolean) {
  const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/user')) {
      if (!authenticated) {
        return jsonResponse({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, 401);
      }
      return jsonResponse({
        user: { id: 'user-1', email: 'owner@example.com', name: 'Site Owner' },
      });
    }
    if (url.endsWith('/refresh')) {
      return jsonResponse({ code: 'UNAUTHORIZED', message: 'No refresh session' }, 401);
    }
    if (url.endsWith('/credentials')) {
      return jsonResponse({
        credentials: [
          {
            id: 'credential-1',
            credentialType: 'solana',
            label: 'Solana Wallet',
            createdAt: '2026-06-07T12:00:00.000Z',
            lastUsedAt: null,
            isPrimary: true,
          },
        ],
      });
    }
    if (url.endsWith('/sessions')) {
      return jsonResponse({ sessions: [], total: 0 });
    }
    if (url.endsWith('/mfa/status')) {
      return jsonResponse({ enabled: false });
    }
    return jsonResponse({});
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

describe('InteractiveAccountWorkspace', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the account settings page for authenticated users', async () => {
    const fetchMock = mockAccountRuntime(true);

    const { container } = render(
      <InteractiveAccountWorkspace props={PROPS} runtimeBaseUrl={sameOriginRuntimeUrl()} />
    );

    // Profile section is the default landing section.
    expect(await screen.findByText('Site Owner')).toBeInTheDocument();
    expect(screen.getAllByText('owner@example.com').length).toBeGreaterThan(0);
    expect(container.querySelector('.cedros-account')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Security' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Connected accounts' })).toBeInTheDocument();

    await waitFor(() => {
      // Session + account calls must target the host-proxied public-auth
      // surface; the bare runtime base is not forwarded by the public site.
      expect(fetchMock.mock.calls.map((call) => String(call[0]))).toContain(
        `${sameOriginRuntimeUrl()}/public-auth/user`
      );
      expect(
        fetchMock.mock.calls.some((call) => String(call[0]).includes('attacker.example'))
      ).toBe(false);
    });
  });

  it('switches sections from the sidebar nav', async () => {
    mockAccountRuntime(true);

    const { container } = render(
      <InteractiveAccountWorkspace props={PROPS} runtimeBaseUrl={sameOriginRuntimeUrl()} />
    );
    await screen.findByText('Site Owner');

    fireEvent.click(screen.getByRole('tab', { name: 'Security' }));
    await waitFor(() => {
      expect(container.querySelector('.cedros-account-stack')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Connected accounts' }));
    await waitFor(() => {
      expect(container.querySelector('.cedros-linked-accounts')).toBeInTheDocument();
    });
  });

  it('logs out through public auth and notifies the host shell', async () => {
    const fetchMock = mockAccountRuntime(true);
    const logoutEvents: CustomEvent[] = [];
    const onLogout = (event: Event) => logoutEvents.push(event as CustomEvent);
    window.addEventListener(CEDROS_LOGIN_ACCOUNT_LOGOUT_EVENT, onLogout);

    try {
      render(<InteractiveAccountWorkspace props={PROPS} runtimeBaseUrl={sameOriginRuntimeUrl()} />);
      await screen.findByText('Site Owner');

      fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

      await waitFor(() => {
        expect(
          fetchMock.mock.calls.some(([input, init]) => {
            const request = init as RequestInit | undefined;
            return (
              String(input) === `${sameOriginRuntimeUrl()}/public-auth/logout` &&
              request?.method === 'POST'
            );
          })
        ).toBe(true);
        expect(logoutEvents).toHaveLength(1);
      });
      expect(logoutEvents[0].detail).toEqual({ source: 'account-workspace' });
      expect(logoutEvents[0].detail).not.toHaveProperty('serverUrl');
      expect(logoutEvents[0].detail).not.toHaveProperty('user');
    } finally {
      window.removeEventListener(CEDROS_LOGIN_ACCOUNT_LOGOUT_EVENT, onLogout);
    }
  });

  it('shows a sanitized sign-in handoff when no account session exists', async () => {
    mockAccountRuntime(false);
    const logoutEvents: CustomEvent[] = [];
    const onLogout = (event: Event) => logoutEvents.push(event as CustomEvent);
    window.addEventListener(CEDROS_LOGIN_ACCOUNT_LOGOUT_EVENT, onLogout);

    try {
      render(
        <InteractiveAccountWorkspace
          props={{ ...PROPS, signInHref: 'javascript:alert(1)' }}
          runtimeBaseUrl={sameOriginRuntimeUrl()}
        />
      );

      const signInLink = await screen.findByRole('link', { name: 'Log in to manage account' });
      expect(signInLink).toHaveAttribute('href', '/');
      expect(document.querySelector('.cedros-account')).not.toBeInTheDocument();
      expect(logoutEvents).toHaveLength(0);
    } finally {
      window.removeEventListener(CEDROS_LOGIN_ACCOUNT_LOGOUT_EVENT, onLogout);
    }
  });

  it('keeps account loading UI visible while runtime feature discovery is pending', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {}))
    );

    render(
      <InteractiveAccountWorkspace
        props={{ title: 'Manage your account' }}
        runtimeBaseUrl={sameOriginRuntimeUrl()}
      />
    );

    expect(screen.getByText('Manage your account')).toBeInTheDocument();
    expect(screen.getByText('Loading account...')).toBeInTheDocument();
  });
});
