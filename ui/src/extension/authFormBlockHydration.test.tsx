import { act } from 'react';
import { waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthFormBlock } from './authFormBlock';

const LOGIN_BLOCK_PROPS = {
  mode: 'sign-in',
  title: 'Log in',
  submitLabel: 'Log in',
  successMessage: 'You will continue after logging in.',
  showProviderButtons: true,
  enabledProviders: ['email', 'solana'],
  layout: 'card',
  serverUrl: '/extensions/cedros-login',
  features: {
    email: true,
    google: false,
    apple: false,
    solana: true,
    webauthn: false,
    instantLink: false,
  },
};

describe('AuthFormBlock hydration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('hydrates the public login block without recoverable React mismatches', async () => {
    const recoverableErrors: unknown[] = [];
    mockLoggedOutRuntime();
    const target = renderHostBlockTarget((children) => renderToString(children));
    let root: ReturnType<typeof hydrateRoot> | null = null;

    await act(async () => {
      root = hydrateRoot(target, <AuthFormBlock props={LOGIN_BLOCK_PROPS} />, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
      await flushHydration();
    });

    expect(recoverableErrors).toEqual([]);
    await act(async () => root?.unmount());
  });

  it('keeps static-markup first paint compatible with browser hydration', async () => {
    const recoverableErrors: unknown[] = [];
    mockLoggedOutRuntime();
    const target = renderHostBlockTarget((children) => renderToStaticMarkup(children));
    let root: ReturnType<typeof hydrateRoot> | null = null;

    await act(async () => {
      root = hydrateRoot(target, <AuthFormBlock props={LOGIN_BLOCK_PROPS} />, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
      await flushHydration();
    });

    expect(recoverableErrors).toEqual([]);
    await act(async () => root?.unmount());
  });

  it('keeps the auth shell hidden while client-only host rendering loads the interactive form', async () => {
    mockLoggedOutRuntime();
    const target = document.createElement('div');
    document.body.appendChild(target);
    const root = createRoot(target);

    await act(async () => {
      flushSync(() => root.render(<AuthFormBlock props={LOGIN_BLOCK_PROPS} />));
      await vi.dynamicImportSettled();
    });

    expect(target.querySelector('.cedros-auth-form__title')).not.toBeInTheDocument();
    await waitFor(() => expect(target.querySelector('.cedros-login-form')).toBeInTheDocument());
    await waitFor(() =>
      expect(target.querySelector('[role="tab"][aria-selected="true"]')).toHaveTextContent(
        'Sign in'
      )
    );
    await act(async () => root.unmount());
  });
});

function renderHostBlockTarget(render: (children: ReactElement) => string): Element {
  document.body.innerHTML = [
    '<div data-cedros-public-extension-block="true">',
    render(<AuthFormBlock props={LOGIN_BLOCK_PROPS} />),
    '</div>',
  ].join('');
  return document.querySelector('[data-cedros-public-extension-block="true"]')!;
}

function mockLoggedOutRuntime() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/user') || url.endsWith('/refresh')) {
        return jsonResponse({ code: 'UNAUTHORIZED', message: 'No active session' }, 401);
      }
      return jsonResponse({});
    })
  );
}

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

function flushHydration() {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}
