import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthFormBlock } from './authFormBlock';
import { AuthFormShell } from './authFormBlockRenderer';

const ALL_PROVIDER_PROPS = {
  mode: 'sign-in',
  submitLabel: 'Log in',
  showProviderButtons: true,
  enabledProviders: ['email', 'google', 'apple', 'passkey', 'solana', 'instant-link'],
};

// The presentational shell is the SSR/first-paint output of the block; these
// tests exercise it directly (the block wrapper swaps to the interactive form
// after mount, which is covered separately).
function renderSignInBlock() {
  return render(
    <AuthFormShell
      props={{
        mode: 'sign-in',
        submitLabel: 'Sign in',
        showProviderButtons: false,
        enabledProviders: ['email'],
        features: { email: true },
      }}
    />
  );
}

function renderAllProviderBlock() {
  return render(<AuthFormShell props={ALL_PROVIDER_PROPS} />);
}

/** Provider-button ids (`data-provider`) in document order from static markup. */
function providerOrder(markup: string): string[] {
  return [...markup.matchAll(/data-provider="([^"]+)"/g)].map((match) => match[1]);
}

function mockRuntimeFeatures(features: Record<string, unknown>) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(features), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('AuthFormBlock', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('enables submit after email and password are typed', async () => {
    const user = userEvent.setup();
    renderSignInBlock();

    const submit = screen.getByRole('button', { name: 'Sign in' });
    expect(submit).toBeDisabled();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'owner@example.com');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'TestPassword1!');

    expect(submit).toBeEnabled();
  });

  it('syncs DOM-filled values when the user focuses an autofilled field', async () => {
    renderSignInBlock();

    const email = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
    const password = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;
    const submit = screen.getByRole('button', { name: 'Sign in' });

    email.value = 'owner@example.com';
    password.value = 'TestPassword1!';
    fireEvent.focus(email);

    await waitFor(() => expect(submit).toBeEnabled());
  });

  it('hides optional provider buttons when runtime features disable them', async () => {
    const fetchMock = mockRuntimeFeatures({
      email: true,
      google: false,
      apple: false,
      solana: false,
      webauthn: false,
      instantLink: false,
    });

    renderAllProviderBlock();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByText('Continue with Solana')).not.toBeInTheDocument();
    expect(screen.queryByText('Continue with passkey')).not.toBeInTheDocument();
    expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
    expect(screen.queryByText('Continue with Apple')).not.toBeInTheDocument();
  });

  it('shows provider buttons enabled by runtime features', async () => {
    mockRuntimeFeatures({
      email: true,
      google: true,
      googleClientId: 'google-client.apps.googleusercontent.com',
      apple: false,
      solana: true,
      webauthn: false,
      instantLink: false,
    });

    renderAllProviderBlock();

    expect(await screen.findByText('Continue with Solana')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.queryByText('Continue with passkey')).not.toBeInTheDocument();
    expect(screen.queryByText('Continue with Apple')).not.toBeInTheDocument();
  });

  it('does not show OAuth buttons when the public client id is missing', async () => {
    const fetchMock = mockRuntimeFeatures({
      email: true,
      google: true,
      apple: true,
      solana: false,
      webauthn: false,
      instantLink: false,
    });

    renderAllProviderBlock();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
    expect(screen.queryByText('Continue with Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
  });

  it('renders only client-stable host-enabled providers in interactive static SSR markup', () => {
    // Mirrors the host static-render path (renderToStaticMarkup runs no effects).
    // Host-supplied `features` can render OAuth/passkey providers immediately,
    // but browser-capability providers stay hidden until the interactive form
    // can confirm them.
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const markup = renderToStaticMarkup(
      createElement(AuthFormBlock, {
        props: {
          ...ALL_PROVIDER_PROPS,
          features: {
            email: true,
            google: true,
            googleClientId: 'google-client.apps.googleusercontent.com',
            apple: false,
            solana: true,
            webauthn: false,
            instantLink: false,
          },
        },
      })
    );

    expect(markup).toContain('Continue with Google');
    expect(markup).not.toContain('Continue with Solana');
    expect(markup).not.toContain('Continue with Apple');
    expect(markup).not.toContain('Continue with passkey');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not render a divider when only client-conditional providers are enabled in SSR', () => {
    const markup = renderToStaticMarkup(
      createElement(AuthFormBlock, {
        props: {
          ...ALL_PROVIDER_PROPS,
          features: {
            email: true,
            google: false,
            apple: false,
            solana: true,
            webauthn: false,
            instantLink: false,
          },
        },
      })
    );

    expect(markup).not.toContain('Continue with Solana');
    expect(markup).not.toContain('Or continue with');
  });

  it('uses hydrated LoginForm tab classes in static SSR markup', () => {
    const markup = renderToStaticMarkup(
      createElement(AuthFormBlock, {
        props: {
          ...ALL_PROVIDER_PROPS,
          features: {
            email: true,
            google: false,
            apple: false,
            solana: false,
            webauthn: false,
            instantLink: false,
          },
        },
      })
    );

    expect(markup).toMatch(/id="[^"]+-tab-login"/);
    expect(markup).toContain('class="cedros-tab cedros-tab-active"');
    expect(markup).toContain('class="cedros-tab "');
    expect(markup).not.toMatch(/<button[^>]*cedros-auth-form__tab/);
    expect(markup).not.toContain('cedros-auth-form__tab--active');
  });

  it('uses hydrated LoginForm field spacing classes in static SSR markup', () => {
    const markup = renderToStaticMarkup(
      createElement(AuthFormBlock, {
        props: {
          ...ALL_PROVIDER_PROPS,
          features: {
            email: true,
            google: false,
            apple: false,
            solana: false,
            webauthn: false,
            instantLink: false,
          },
        },
      })
    );

    expect(markup).toContain('class="cedros-login-form"');
    expect(markup).toContain('role="tabpanel"');
    expect(markup).toMatch(/<label for="[^"]+-email" class="cedros-label">Email<\/label>/);
    expect(markup).toContain('class="cedros-password-input"');
    expect(markup).toContain('class="cedros-label-row"');
    expect(markup).not.toContain('Email address');
    expect(markup).not.toContain('Log in');
    expect(markup).not.toContain('cedros-auth-form__field-label');
    expect(markup).not.toContain('cedros-auth-form__submit');
  });

  it('falls back to email-only in static SSR markup when the host supplies no features', () => {
    const markup = renderToStaticMarkup(
      createElement(AuthFormBlock, { props: ALL_PROVIDER_PROPS })
    );

    expect(markup).not.toContain('Continue with Google');
    expect(markup).not.toContain('Continue with Solana');
  });

  it('treats host SSR features as authoritative and skips the client fetch when hydrated', async () => {
    // Even hydrated, SSR features win over what a client fetch would report, and
    // the fetch must not run (it is only a standalone/authored-only fallback).
    const fetchMock = mockRuntimeFeatures({
      email: true,
      google: false,
      apple: false,
      solana: false,
      webauthn: false,
      instantLink: false,
    });

    render(
      <AuthFormShell
        props={{
          ...ALL_PROVIDER_PROPS,
          features: {
            email: true,
            google: true,
            googleClientId: 'google-client.apps.googleusercontent.com',
            apple: false,
            solana: true,
            webauthn: false,
            instantLink: false,
          },
        }}
      />
    );

    expect(await screen.findByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with Solana')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('orders provider buttons by the host-supplied socialButtonOrder', () => {
    const markup = renderToStaticMarkup(
      createElement(AuthFormShell, {
        props: {
          ...ALL_PROVIDER_PROPS,
          features: googleSolanaFeatures(),
          // Default order is solana-before-google; the operator order flips it.
          socialButtonOrder: ['google', 'solana'],
        },
      })
    );

    expect(providerOrder(markup)).toEqual(['google', 'solana']);
  });

  it('maps webauthn to the passkey button when applying socialButtonOrder', () => {
    const markup = renderToStaticMarkup(
      createElement(AuthFormShell, {
        props: {
          ...ALL_PROVIDER_PROPS,
          features: { ...googleSolanaFeatures(), webauthn: true },
          socialButtonOrder: ['webauthn', 'solana', 'google'],
        },
      })
    );

    expect(providerOrder(markup)).toEqual(['passkey', 'solana', 'google']);
  });

  it('falls back to the default button order when socialButtonOrder is absent', () => {
    const markup = renderToStaticMarkup(
      createElement(AuthFormShell, {
        props: { ...ALL_PROVIDER_PROPS, features: googleSolanaFeatures() },
      })
    );

    expect(providerOrder(markup)).toEqual(['solana', 'google']);
  });

  // The host page has no dark-mode marker of its own, so the block self-scopes
  // `cedros-dark` at its root from the visitor's OS preference (the host ships
  // static light-only --cedros-* tokens; a documentElement class would
  // half-flip host surfaces we don't own).
  // The host owns color mode (footer toggle, <html>.cedros-dark) and passes
  // the resolved mode to block renderers; the root class follows that prop,
  // never prefers-color-scheme. Undefined (SSR, older hosts) renders light
  // and lets the .cedros-dark ancestor CSS own first paint.
  describe('host color-mode scoping', () => {
    it('adds cedros-dark to the section root when the host resolves dark', () => {
      const { container } = render(
        <AuthFormShell
          props={{
            mode: 'sign-in',
            submitLabel: 'Sign in',
            showProviderButtons: false,
            enabledProviders: ['email'],
          }}
          colorMode="dark"
        />
      );
      const section = container.querySelector('section.cedros-auth-form');
      expect(section).not.toBeNull();
      expect(section!.classList.contains('cedros-dark')).toBe(true);
      expect(document.documentElement.classList.contains('cedros-dark')).toBe(false);
    });

    it('omits cedros-dark when colorMode is light or unknown', () => {
      for (const colorMode of ['light', undefined] as const) {
        const { container, unmount } = render(
          <AuthFormShell
            props={{
              mode: 'sign-in',
              submitLabel: 'Sign in',
              showProviderButtons: false,
              enabledProviders: ['email'],
            }}
            colorMode={colorMode}
          />
        );
        const section = container.querySelector('section.cedros-auth-form');
        expect(section).not.toBeNull();
        expect(section!.classList.contains('cedros-dark')).toBe(false);
        unmount();
      }
    });

    it('ignores the OS preference (host contract owns the mode)', () => {
      vi.stubGlobal('matchMedia', (query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }));

      const { container } = renderSignInBlock();
      const section = container.querySelector('section.cedros-auth-form');
      expect(section).not.toBeNull();
      expect(section!.classList.contains('cedros-dark')).toBe(false);
    });
  });
});

function googleSolanaFeatures() {
  return {
    email: true,
    google: true,
    googleClientId: 'google-client.apps.googleusercontent.com',
    apple: false,
    solana: true,
    webauthn: false,
    instantLink: false,
  };
}

it('keeps static embedded form labels and tab references scoped to their own form', () => {
  const markup = renderToStaticMarkup(
    createElement(
      'div',
      null,
      createElement(AuthFormBlock, { props: { mode: 'sign-in' } }),
      createElement(AuthFormBlock, { props: { mode: 'sign-in' } })
    )
  );
  const container = document.createElement('div');
  container.innerHTML = markup;
  const ids = Array.from(container.querySelectorAll('[id]'), (element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const form of container.querySelectorAll('form')) {
    for (const label of form.querySelectorAll('label')) {
      expect(
        Array.from(form.querySelectorAll('input')).some((input) => input.id === label.htmlFor)
      ).toBe(true);
    }
  }
});
