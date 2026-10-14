import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import InteractiveAuthForm from './interactiveAuthForm';
import { redirectAfterAuthSuccess } from './authSuccessRedirect';

vi.mock('./authSuccessRedirect', () => ({
  redirectAfterAuthSuccess: vi.fn(),
}));

function sameOriginRuntimeUrl() {
  return `${window.location.origin}/extensions/cedros-login`;
}

function publicAuthRuntimeUrl() {
  return `${sameOriginRuntimeUrl()}/public-auth`;
}

function mockFeatures(features: Record<string, unknown>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    void input;
    void init;
    return new Response(JSON.stringify(features), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('InteractiveAuthForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(redirectAfterAuthSuccess).mockReset();
    window.history.replaceState({}, '', '/');
  });

  it('mounts the wired non-wallet provider stack at the trusted same-origin runtime', async () => {
    const fetchMock = mockFeatures({
      email: true,
      google: false,
      apple: false,
      solana: false,
      webauthn: false,
      instantLink: false,
    });

    const { container } = render(
      <InteractiveAuthForm
        props={{
          layout: 'card',
          mode: 'sign-in',
          serverUrl: 'https://attacker.example/collect',
          runtimeBaseUrl: 'https://attacker.example/runtime',
        }}
        runtimeBaseUrl={sameOriginRuntimeUrl()}
      />
    );

    expect((await screen.findAllByRole('textbox')).length).toBeGreaterThan(0);

    const block = container.querySelector('[data-cedros-block="cedros-login:auth-form"]');
    expect(block).toHaveClass('cedros-auth-form', 'cedros-auth-form--card');
    expect(block).toHaveAttribute('data-auth-mode', 'sign-in');
    expect(block?.querySelector('.cedros-auth-form__panel')).toBeInTheDocument();

    await waitFor(() => {
      const requestedUrls = fetchMock.mock.calls.map((call) => String(call[0]));
      expect(requestedUrls).toContain(`${publicAuthRuntimeUrl()}/features`);
      expect(requestedUrls.some((url) => url.includes('attacker.example'))).toBe(false);
    });
  });

  it('keeps wallet-adapter UI out of the ZIP-hosted public runtime', async () => {
    mockFeatures({
      email: true,
      google: false,
      apple: false,
      solana: true,
      webauthn: false,
      instantLink: false,
    });

    render(<InteractiveAuthForm props={{ mode: 'sign-in' }} />);

    expect(await screen.findByRole('tab', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('Continue with Solana')).not.toBeInTheDocument();
  });

  it('ignores authored server URL props when no trusted runtime is supplied', async () => {
    const fetchMock = mockFeatures({
      email: true,
      google: false,
      apple: false,
      solana: false,
      webauthn: false,
      instantLink: false,
    });

    render(
      <InteractiveAuthForm
        props={{
          mode: 'sign-in',
          serverUrl: 'https://attacker.example/collect',
          runtimeBaseUrl: 'https://attacker.example/runtime',
        }}
      />
    );

    await screen.findAllByRole('textbox');
    await waitFor(() => {
      const requestedUrls = fetchMock.mock.calls.map((call) => String(call[0]));
      expect(requestedUrls).toContain(`${publicAuthRuntimeUrl()}/features`);
      expect(requestedUrls.some((url) => url.includes('attacker.example'))).toBe(false);
    });
  });

  it('submits email credentials only to the same-origin runtime', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/features')) {
        return jsonResponse({
          email: true,
          google: false,
          apple: false,
          solana: false,
          webauthn: false,
          instantLink: false,
        });
      }
      if (url.endsWith('/login')) {
        return jsonResponse({
          user: {
            id: 'user-1',
            email: 'victim@example.com',
            authMethods: ['email'],
            emailVerified: true,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          tokens: { accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 },
          isNewUser: false,
        });
      }
      return jsonResponse({});
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <InteractiveAuthForm
        props={{
          mode: 'sign-in',
          serverUrl: 'https://attacker.invalid/cedros-runtime',
          runtimeBaseUrl: 'https://attacker.invalid/runtime-base',
        }}
      />
    );

    fireEvent.change(await screen.findByLabelText('Email'), {
      target: { value: 'victim@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'CorrectHorseBatteryStaple!' },
    });
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      const fetchCalls = fetchMock.mock.calls as Array<[RequestInfo | URL, RequestInit?]>;
      const loginRequest = fetchCalls.find((call) => String(call[0]).endsWith('/login'));
      expect(loginRequest).toBeDefined();
      expect(String(loginRequest?.[0])).toBe(`${publicAuthRuntimeUrl()}/login`);
      expect(JSON.parse(String(loginRequest?.[1]?.body))).toEqual({
        email: 'victim@example.com',
        password: 'CorrectHorseBatteryStaple!',
      });
      expect(
        fetchMock.mock.calls.some((call) => String(call[0]).startsWith('https://attacker.invalid/'))
      ).toBe(false);
    });
  });

  it.each([
    { mode: 'sign-in', page: '/login', endpoint: '/login', submitLabel: 'Sign in' },
    {
      mode: 'create-account',
      page: '/register',
      endpoint: '/register',
      submitLabel: 'Create account',
    },
  ])(
    'returns through $page after standard email auth',
    async ({ mode, page, endpoint, submitLabel }) => {
      window.history.replaceState(
        {},
        '',
        `${page}?returnTo=%2Fextensions%2Fcedros-portal%2Fapp%2Fcreate-site`
      );
      const user = userEvent.setup();
      const response = authenticatedResponse();
      const fetchMock = mockActionRuntime({ [endpoint]: response });

      render(<InteractiveAuthForm props={actionProps(mode)} />);

      fireEvent.change(await screen.findByLabelText('Email'), {
        target: { value: 'owner@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'CorrectHorseBatteryStaple!42' },
      });
      if (mode === 'create-account') {
        fireEvent.change(screen.getByLabelText(/Confirm password/i), {
          target: { value: 'CorrectHorseBatteryStaple!42' },
        });
      }
      await user.click(screen.getByRole('button', { name: submitLabel }));

      await waitFor(() =>
        expect(redirectAfterAuthSuccess).toHaveBeenCalledWith(
          expect.any(Object),
          response,
          window.location
        )
      );
      expect(actionRequest(fetchMock, endpoint)).toBeDefined();
    }
  );

  it('continues an existing verified session to the requested Portal billing route', async () => {
    window.history.replaceState(
      {},
      '',
      '/login?returnTo=%2Fextensions%2Fcedros-portal%2Fapp%2Fbilling'
    );
    mockActionRuntime({ '/user': { user: authenticatedResponse().user } });

    render(<InteractiveAuthForm props={actionProps('sign-in')} />);

    await waitFor(() =>
      expect(redirectAfterAuthSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        undefined,
        window.location
      )
    );
    expect(screen.queryByText("You're signed in")).not.toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('keeps session discovery invisible before showing the signed-out form', async () => {
    let finishSession!: (response: Response) => void;
    const session = new Promise<Response>((resolve) => {
      finishSession = resolve;
    });
    const runtime = mockActionRuntime({});
    const fallback = runtime.getMockImplementation()!;
    runtime.mockImplementation((input) =>
      String(input).endsWith('/user') ? session : fallback(input)
    );
    render(<InteractiveAuthForm props={actionProps('sign-in')} />);
    await waitFor(() =>
      expect(runtime.mock.calls.some((call) => String(call[0]).endsWith('/user'))).toBe(true)
    );
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    finishSession(new Response('{}', { status: 401 }));
    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
    expect(redirectAfterAuthSuccess).not.toHaveBeenCalled();
  });

  it.each(['sign-in', 'create-account'])(
    'resumes an unfinished plan from a restored %s session',
    async (mode) => {
      mockActionRuntime({
        '/user': { user: authenticatedResponse().user },
        '/features': {
          subscriptionSelectionRequired: true,
          subscriptionSelectionRoute: '/pricing',
        },
        '/user?resumeSignup=true': {
          authenticated: true,
          signupResume: { postLogin: { action: 'choose_subscription', redirectUrl: '/pricing' } },
        },
      });
      render(
        <StrictMode>
          <InteractiveAuthForm props={actionProps(mode)} />
        </StrictMode>
      );

      await waitFor(() =>
        expect(redirectAfterAuthSuccess).toHaveBeenCalledWith(
          expect.any(Object),
          { postLogin: { action: 'choose_subscription', redirectUrl: '/pricing' } },
          window.location
        )
      );
      expect(redirectAfterAuthSuccess).toHaveBeenCalledTimes(1);
    }
  );

  it('continues normally when the restored account has completed plan selection', async () => {
    mockActionRuntime({
      '/user': { user: authenticatedResponse().user },
      '/features': { subscriptionSelectionRequired: true, subscriptionSelectionRoute: '/pricing' },
      '/user?resumeSignup=true': { authenticated: true, signupResume: { postLogin: null } },
    });
    render(<InteractiveAuthForm props={actionProps('create-account')} />);
    await waitFor(() =>
      expect(redirectAfterAuthSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        undefined,
        window.location
      )
    );
  });

  it('offers retry instead of losing signup when the plan check fails', async () => {
    let checks = 0;
    const runtime = mockActionRuntime({
      '/user': { user: authenticatedResponse().user },
      '/features': { subscriptionSelectionRequired: true, subscriptionSelectionRoute: '/pricing' },
    });
    const fallback = runtime.getMockImplementation()!;
    runtime.mockImplementation((input) => {
      if (!String(input).endsWith('/user?resumeSignup=true')) return fallback(input);
      checks += 1;
      return checks === 1
        ? jsonResponse({}, 503)
        : jsonResponse({
            authenticated: true,
            signupResume: { postLogin: { action: 'choose_subscription', redirectUrl: '/pricing' } },
          });
    });
    render(<InteractiveAuthForm props={actionProps('create-account')} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to resume');
    expect(redirectAfterAuthSuccess).not.toHaveBeenCalled();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(redirectAfterAuthSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        { postLogin: { action: 'choose_subscription', redirectUrl: '/pricing' } },
        window.location
      )
    );
    expect(checks).toBe(2);
  });

  it('does not redirect after the pending recovery screen unmounts', async () => {
    let finishSelection!: (response: Response) => void;
    const selection = new Promise<Response>((resolve) => {
      finishSelection = resolve;
    });
    const runtime = mockActionRuntime({
      '/user': { user: authenticatedResponse().user },
      '/features': { subscriptionSelectionRequired: true, subscriptionSelectionRoute: '/pricing' },
    });
    const fallback = runtime.getMockImplementation()!;
    runtime.mockImplementation((input) =>
      String(input).endsWith('/user?resumeSignup=true') ? selection : fallback(input)
    );
    const view = render(<InteractiveAuthForm props={actionProps('create-account')} />);
    await waitFor(() =>
      expect(
        runtime.mock.calls.some(([url]) => String(url).endsWith('/user?resumeSignup=true'))
      ).toBe(true)
    );
    view.unmount();
    await act(async () => {
      finishSelection(
        await jsonResponse({
          authenticated: true,
          signupResume: { postLogin: { action: 'choose_subscription', redirectUrl: '/pricing' } },
        })
      );
      await selection;
    });
    expect(redirectAfterAuthSuccess).not.toHaveBeenCalled();
  });

  it('keeps unverified registration on the public journey and resends through the proxy', async () => {
    window.history.replaceState(
      {},
      '',
      '/register?returnTo=%2Fextensions%2Fcedros-portal%2Fmeet-your-assistant'
    );
    const user = userEvent.setup();
    const fetchMock = mockActionRuntime({
      '/register': {
        user: {
          ...authenticatedResponse().user,
          email: 'owner@example.com',
          emailVerified: false,
        },
        isNewUser: true,
        emailQueued: true,
        method: 'email',
      },
      '/send-verification': { message: 'ok' },
    });

    render(<InteractiveAuthForm props={actionProps('create-account')} />);

    fireEvent.change(await screen.findByLabelText('Email'), {
      target: { value: 'owner@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'CorrectHorseBatteryStaple!42' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm password/i), {
      target: { value: 'CorrectHorseBatteryStaple!42' },
    });
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
    expect(redirectAfterAuthSuccess).not.toHaveBeenCalled();
    expect(actionRequest(fetchMock, '/register')).toMatchObject({
      body: {
        email: 'owner@example.com',
        returnTo: '/extensions/cedros-portal/meet-your-assistant',
      },
    });

    expect(
      screen.queryByText('Verification email sent. It may take a moment to arrive.')
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Resend verification email' }));
    await waitFor(() => {
      expect(actionRequest(fetchMock, '/send-verification')).toEqual({
        url: `${publicAuthRuntimeUrl()}/send-verification`,
        body: {
          email: 'owner@example.com',
          returnTo: '/extensions/cedros-portal/meet-your-assistant',
        },
      });
    });
    expect(
      screen.queryByText('Verification email sent. It may take a moment to arrive.')
    ).not.toBeInTheDocument();
  });

  it('keeps email signup available and preserves details after a failed registration', async () => {
    window.history.replaceState({}, '', '/register');
    let finishRegistration!: (response: Response) => void;
    const registration = new Promise<Response>((resolve) => {
      finishRegistration = resolve;
    });
    const runtime = mockActionRuntime({
      '/features': { subscriptionSelectionRequired: true, subscriptionSelectionRoute: '/pricing' },
      '/subscription/plans?interval=monthly': signupCatalog('monthly'),
      '/subscription/plans?interval=annual': signupCatalog('yearly'),
    });
    const fallback = runtime.getMockImplementation()!;
    runtime.mockImplementation((input) =>
      String(input).endsWith('/register') ? registration : fallback(input)
    );
    render(<InteractiveAuthForm props={actionProps('create-account')} />);
    const user = userEvent.setup();
    fireEvent.change(await screen.findByLabelText('Email'), {
      target: { value: 'owner@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'CorrectHorseBatteryStaple!42' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm password/i), {
      target: { value: 'CorrectHorseBatteryStaple!42' },
    });
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.queryByRole('button', { name: 'Change plan' })).not.toBeInTheDocument();
    finishRegistration(
      await jsonResponse({ code: 'VALIDATION_ERROR', message: 'Please check your details' }, 400)
    );
    expect(await screen.findByText('Please check your details')).toBeVisible();
    expect(screen.getByLabelText('Email')).toHaveValue('owner@example.com');
    expect(screen.queryByRole('heading', { name: 'Choose your plan' })).not.toBeInTheDocument();
  });

  it('creates the email account before plan selection and preserves verification return paths', async () => {
    window.history.replaceState(
      {},
      '',
      '/register?returnTo=%2Fextensions%2Fcedros-portal%2Fmeet-your-assistant'
    );
    const user = userEvent.setup();
    const fetchMock = mockActionRuntime({
      '/features': { subscriptionSelectionRequired: true, subscriptionSelectionRoute: '/pricing' },
      '/subscription/plans?interval=monthly': signupCatalog('monthly'),
      '/subscription/plans?interval=annual': signupCatalog('yearly'),
      '/register': {
        user: {
          ...authenticatedResponse().user,
          email: 'owner@example.com',
          emailVerified: false,
        },
        isNewUser: true,
        emailQueued: true,
        method: 'email',
      },
      '/send-verification': { message: 'ok' },
    });

    render(<InteractiveAuthForm props={actionProps('create-account')} />);

    fireEvent.change(await screen.findByLabelText('Email'), {
      target: { value: 'owner@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'CorrectHorseBatteryStaple!42' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm password/i), {
      target: { value: 'CorrectHorseBatteryStaple!42' },
    });
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
    expect(redirectAfterAuthSuccess).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Change plan' })).not.toBeInTheDocument();
    expect(actionRequest(fetchMock, '/register')).toMatchObject({
      body: {
        email: 'owner@example.com',
        returnTo: '/extensions/cedros-portal/meet-your-assistant',
      },
    });

    expect(
      screen.queryByText('Verification email sent. It may take a moment to arrive.')
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Resend verification email' }));
    await waitFor(() => {
      expect(actionRequest(fetchMock, '/send-verification')).toEqual({
        url: `${publicAuthRuntimeUrl()}/send-verification`,
        body: {
          email: 'owner@example.com',
          returnTo: '/extensions/cedros-portal/meet-your-assistant',
        },
      });
    });
    expect(
      screen.queryByText('Verification email sent. It may take a moment to arrive.')
    ).not.toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([input]) => String(input).includes('/subscription/plans'))
    ).toBe(false);
  });

  it('opens email signup directly when switching from sign in on a subscription site', async () => {
    const fetchMock = mockActionRuntime({
      '/features': { subscriptionSelectionRequired: true, subscriptionSelectionRoute: '/pricing' },
    });
    render(<InteractiveAuthForm props={actionProps('sign-in')} />);
    await userEvent.setup().click(await screen.findByRole('tab', { name: 'Sign up' }));

    await waitFor(() => expect(screen.getByLabelText(/Confirm password/i)).toBeVisible());
    expect(screen.queryByRole('heading', { name: 'Choose your plan' })).not.toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([input]) => String(input).includes('/subscription/plans'))
    ).toBe(false);
  });

  it('uses host-supplied features without optimistic passkey rendering or refetching', async () => {
    const fetchMock = mockFeatures({
      email: true,
      google: false,
      apple: false,
      solana: false,
      webauthn: true,
      instantLink: false,
    });

    render(
      <InteractiveAuthForm
        props={{
          layout: 'card',
          mode: 'sign-in',
          serverUrl: 'https://attacker.example/collect',
          features: {
            email: true,
            google: false,
            apple: false,
            solana: false,
            webauthn: false,
            instantLink: false,
          },
        }}
      />
    );

    expect(await screen.findByRole('tab', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('Continue with passkey')).not.toBeInTheDocument();
    expect(
      fetchMock.mock.calls.map((call) => String(call[0])).some((url) => url.includes('/features'))
    ).toBe(false);
  });

  it('waits for runtime feature discovery before rendering optional providers', async () => {
    const fetchMock = mockFeatures({
      email: true,
      google: false,
      apple: false,
      solana: false,
      webauthn: false,
      instantLink: false,
    });

    render(
      <InteractiveAuthForm
        props={{
          layout: 'card',
          mode: 'sign-in',
          serverUrl: 'https://attacker.example/collect',
        }}
      />
    );

    expect(screen.queryByText('Continue with passkey')).not.toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('Continue with passkey')).not.toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls.map((call) => String(call[0]))).toContain(
      `${publicAuthRuntimeUrl()}/features`
    );
  });

  it('consumes the trusted query token on the email-verification route', async () => {
    window.history.replaceState(
      {},
      '',
      '/verify-email?token=verified-token&returnTo=%2Fextensions%2Fcedros-portal%2Fmeet-your-assistant'
    );
    const response = {
      ...authenticatedResponse(),
      isNewUser: true,
      method: 'email',
      postLogin: { action: 'choose_subscription', redirectUrl: '/pricing' },
    };
    const fetchMock = mockActionRuntime({ '/verify-email': response });

    render(<InteractiveAuthForm props={actionProps('verify-email')} />);

    await waitFor(() =>
      expect(redirectAfterAuthSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        response,
        window.location
      )
    );
    expect(actionRequest(fetchMock, '/verify-email')).toMatchObject({
      url: `${publicAuthRuntimeUrl()}/verify-email`,
      body: { token: 'verified-token' },
    });
    expect(screen.queryByRole('link', { name: 'Go to login' })).not.toBeInTheDocument();
  });

  it('fails closed without a token and never calls an action endpoint', async () => {
    const fetchMock = mockActionRuntime();

    render(
      <InteractiveAuthForm
        props={{ ...actionProps('verify-email'), token: 'authored-token-must-be-ignored' }}
      />
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('missing its secure token');
    expect(actionRequest(fetchMock, '/verify-email')).toBeUndefined();
  });

  it('submits password-recovery requests through the public runtime', async () => {
    const user = userEvent.setup();
    const fetchMock = mockActionRuntime();
    render(<InteractiveAuthForm props={actionProps('forgot-password')} />);

    fireEvent.change(await screen.findByLabelText('Email address'), {
      target: { value: 'owner@example.com' },
    });
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() =>
      expect(actionRequest(fetchMock, '/forgot-password')).toMatchObject({
        body: { email: 'owner@example.com' },
      })
    );
  });

  it('resets a password with the query token rather than authored fields', async () => {
    window.history.replaceState({}, '', '/reset-password?token=reset-token&utm=campaign#reset');
    const user = userEvent.setup();
    const fetchMock = mockActionRuntime();
    render(
      <StrictMode>
        <InteractiveAuthForm props={actionProps('reset-password')} />
      </StrictMode>
    );

    expect(window.location.href).toBe(
      `${window.location.origin}/reset-password?utm=campaign#reset`
    );

    fireEvent.change(await screen.findByLabelText('New password'), {
      target: { value: 'CorrectHorseBatteryStaple!42' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm password/i), {
      target: { value: 'CorrectHorseBatteryStaple!42' },
    });
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() =>
      expect(actionRequest(fetchMock, '/reset-password')).toMatchObject({
        body: { token: 'reset-token', newPassword: 'CorrectHorseBatteryStaple!42' },
      })
    );
  });

  it('verifies an instant link and follows the shared success redirect', async () => {
    window.history.replaceState({}, '', '/instant-link?token=instant-token');
    const authResponse = authenticatedResponse();
    const fetchMock = mockActionRuntime({ '/instant-link/verify': authResponse });

    render(<InteractiveAuthForm props={actionProps('instant-link-verify')} />);

    await waitFor(() =>
      expect(redirectAfterAuthSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        authResponse,
        window.location
      )
    );
    expect(actionRequest(fetchMock, '/instant-link/verify')).toMatchObject({
      body: { token: 'instant-token' },
    });
  });

  it('does not redirect when instant-link verification is expired', async () => {
    window.history.replaceState({}, '', '/instant-link?token=expired-token');
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/instant-link/verify')) {
        return jsonResponse({ code: 'TOKEN_EXPIRED', message: 'Link expired' }, 401);
      }
      return jsonResponse({ code: 'UNAUTHORIZED', message: 'No active session' }, 401);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<InteractiveAuthForm props={actionProps('instant-link-verify')} />);

    await waitFor(() => expect(actionRequest(fetchMock, '/instant-link/verify')).toBeDefined());
    expect(redirectAfterAuthSuccess).not.toHaveBeenCalled();
  });

  it('continues an instant-link MFA challenge without redirecting early', async () => {
    window.history.replaceState({}, '', '/instant-link?token=instant-token');
    mockActionRuntime({
      '/instant-link/verify': { mfaRequired: true, mfaToken: 'mfa-token', userId: 'user-1' },
    });

    render(<InteractiveAuthForm props={actionProps('instant-link-verify')} />);

    expect(await screen.findByText('Two-factor authentication')).toBeInTheDocument();
    expect(redirectAfterAuthSuccess).not.toHaveBeenCalled();
  });

  it('accepts an invite only after restoring an authenticated session', async () => {
    window.history.replaceState({}, '', '/invite?token=invite-token');
    const fetchMock = mockActionRuntime({
      '/user': { user: authenticatedResponse().user },
      '/invites/accept': { orgId: 'org-1', orgName: 'Cedros Team', role: 'member' },
    });

    render(<InteractiveAuthForm props={actionProps('accept-invite')} />);

    expect(await screen.findByText('You joined Cedros Team as member.')).toBeInTheDocument();
    expect(actionRequest(fetchMock, '/invites/accept')).toMatchObject({
      body: { token: 'invite-token' },
    });
  });

  it('requires sign-in before sending an invite-accept mutation', async () => {
    window.history.replaceState({}, '', '/invite?token=invite-token');
    const fetchMock = mockActionRuntime();

    render(<InteractiveAuthForm props={actionProps('accept-invite')} />);

    expect(await screen.findByText('Sign in with the invited account to continue.')).toBeVisible();
    expect(actionRequest(fetchMock, '/invites/accept')).toBeUndefined();
  });

  it('lets an authenticated recipient switch accounts without losing the invite', async () => {
    window.history.replaceState({}, '', '/accept-invite?token=invite-token');
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/user')) return jsonResponse({ user: authenticatedResponse().user });
      if (url.endsWith('/invites/accept')) {
        return jsonResponse(
          { code: 'FORBIDDEN', message: 'Invite recipient does not match this account' },
          403
        );
      }
      if (url.endsWith('/logout')) return jsonResponse({ message: 'Signed out' });
      return jsonResponse({ code: 'UNAUTHORIZED', message: 'No active session' }, 401);
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<InteractiveAuthForm props={actionProps('accept-invite')} />);

    expect(await screen.findByText(/invite belongs to a different account/i)).toBeVisible();
    expect(window.location.search).toBe('');
    await user.click(screen.getByRole('button', { name: 'Use another account' }));

    expect(await screen.findByText('Sign in with the invited account to continue.')).toBeVisible();
    expect(
      fetchMock.mock.calls.filter(([input]) => String(input).endsWith('/invites/accept'))
    ).toHaveLength(1);
  });

  it('retries a failed invite acceptance with the captured token', async () => {
    window.history.replaceState({}, '', '/accept-invite?token=invite-token');
    let accepts = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/user')) return jsonResponse({ user: authenticatedResponse().user });
      if (url.endsWith('/invites/accept')) {
        accepts += 1;
        if (accepts === 1) return jsonResponse({ code: 'SERVER_ERROR' }, 500);
        return jsonResponse({ orgId: 'org-1', orgName: 'Cedros Team', role: 'member' });
      }
      return jsonResponse({ code: 'UNAUTHORIZED', message: 'No active session' }, 401);
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<InteractiveAuthForm props={actionProps('accept-invite')} />);

    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('You joined Cedros Team as member.')).toBeVisible();
    expect(accepts).toBe(2);
  });
});

function actionProps(mode: string) {
  return {
    mode,
    features: {
      email: true,
      google: false,
      apple: false,
      solana: false,
      webauthn: false,
      instantLink: true,
    },
  };
}

function mockActionRuntime(responses: Record<string, unknown> = {}) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const match = Object.entries(responses).find(([path]) => url.endsWith(path));
    if (match) return jsonResponse(match[1]);
    if (url.endsWith('/user?resumeSignup=true'))
      return jsonResponse({ authenticated: true, signupResume: { postLogin: null } });
    if (url.endsWith('/user') || url.endsWith('/refresh')) {
      return jsonResponse({ code: 'UNAUTHORIZED', message: 'No active session' }, 401);
    }
    return jsonResponse({ message: 'ok' });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function actionRequest(fetchMock: ReturnType<typeof vi.fn>, path: string) {
  const call = fetchMock.mock.calls.find(([input]) => String(input).endsWith(path));
  if (!call) return undefined;
  return {
    url: String(call[0]),
    body: JSON.parse(String((call[1] as RequestInit | undefined)?.body)),
  };
}

function authenticatedResponse() {
  return {
    user: {
      id: 'user-1',
      email: 'owner@example.com',
      authMethods: ['email'],
      emailVerified: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    tokens: { accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 },
    isNewUser: false,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

function signupCatalog(interval: string) {
  return {
    enabled: true,
    configuredEnabled: true,
    plans: [
      {
        planId: 'agency',
        displayName: 'Agency',
        description: 'Five sites',
        interval,
        priceId: 'agency-' + interval,
        priceCents: 15900,
        currency: 'USD',
        active: true,
        public: true,
        purchasable: true,
        publicOnMainPricingPage: true,
        paymentMethods: ['stripe'],
      },
    ],
  };
}
