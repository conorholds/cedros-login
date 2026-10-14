/**
 * Browser journey regressions, using the production React components and HTTP client.
 * Start: cd ui && npx vite --config e2e/vite.config.ts
 * Run: import this function into a Playwright runner and await runAuthJourneys(page).
 * API responses and the OS passkey prompt are fixtures; no real account/provider is contacted.
 */
export default async function runAuthJourneys(page, baseUrl = 'http://localhost:18082') {
  const results = [];
  const unexpected = [];
  const requests = [];
  const errors = [];
  const onPageError = (error) => errors.push(error.message);
  page.on('pageerror', onPageError);
  let signedIn = false;
  let resetRequests = 0;
  let loginRequests = 0;
  const fixtureUser = {
    id: 'fixture-user',
    email: 'person@example.test',
    emailVerified: true,
    name: 'Fixture Person',
    authMethods: ['email'],
    createdAt: '2026-01-01T00:00:00Z',
  };
  const auth = {
    user: fixtureUser,
    tokens: { accessToken: 'fixture-access', refreshToken: 'fixture-refresh', expiresIn: 3600 },
    isNewUser: false,
  };
  const handler = async (route) => {
    const request = route.request();
    const path = request.url().split('/fixture-auth')[1].split('?')[0];
    requests.push(path);
    const body = request.postDataJSON();
    const reply = (json, status = 200) => route.fulfill({ status, json });
    if (path === '/features')
      return reply({
        email: true,
        google: false,
        apple: false,
        solana: false,
        webauthn: true,
        instantLink: false,
      });
    if (path === '/user')
      return signedIn ? reply({ user: fixtureUser }) : reply({ code: 'UNAUTHORIZED' }, 401);
    if (path === '/refresh') return reply({ code: 'UNAUTHORIZED' }, 401);
    if (path === '/login') {
      loginRequests++;
      if (loginRequests === 1) return reply({ code: 'INVALID_CREDENTIALS' }, 401);
      return reply({ mfaRequired: true, mfaToken: 'fixture-mfa', email: fixtureUser.email });
    }
    if (path === '/login/mfa') {
      if (body.code !== 'ABCD-EFGH-IJKL-MNOP')
        return reply({ code: 'INVALID_TOTP_CODE', message: 'Incorrect verification code' }, 401);
      signedIn = true;
      return reply(auth);
    }
    if (path === '/logout') {
      signedIn = false;
      return reply({ success: true });
    }
    if (path === '/register')
      return reply({
        user: { ...fixtureUser, email: body.email, emailVerified: false },
        isNewUser: true,
      });
    if (path === '/send-verification') return reply({ success: true });
    if (path === '/reset-password') return reply({ code: 'TOKEN_EXPIRED' }, 400);
    if (path === '/forgot-password') {
      resetRequests++;
      if (resetRequests === 1) return route.abort('internetdisconnected');
      return reply({ success: true });
    }
    if (path === '/webauthn/auth/options')
      return reply({
        challengeId: 'fixture-challenge',
        options: {
          publicKey: { challenge: 'AQIDBAUGBwg', rpId: 'localhost', userVerification: 'required' },
        },
      });
    unexpected.push(path);
    return reply({ code: 'SERVER_ERROR', message: 'Unexpected fixture request' }, 500);
  };
  await page.route('**/fixture-auth/**', handler);
  const check = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const visible = (role, name) => page.getByRole(role, { name, exact: true }).waitFor();
  try {
    await page.goto(baseUrl);
    await page.getByLabel('Email', { exact: true }).fill(fixtureUser.email);
    await page.getByLabel('Password', { exact: true }).fill('FixturePassword1!');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Incorrect email or password' }).waitFor();
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await visible('heading', 'Two-factor authentication');
    await page.setViewportSize({ width: 320, height: 640 });
    check(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      'MFA overflows a narrow viewport'
    );
    await page.getByRole('textbox', { name: 'Digit 1', exact: true }).fill('123456');
    await page.getByRole('alert').filter({ hasText: 'Incorrect verification code' }).waitFor();
    await page.getByRole('button', { name: 'Use a recovery code' }).click();
    await page.getByLabel('Recovery code', { exact: true }).fill(' ABCD-EFGH-IJKL-MNOP ');
    await page.getByRole('button', { name: 'Verify', exact: true }).click();
    await visible('heading', "You're signed in");
    check(
      await page.getByText('Continue as person@example.test', { exact: true }).isVisible(),
      'Signed-in account identity missing'
    );
    await page.getByRole('button', { name: 'Sign out' }).click();
    await visible('tab', 'Sign in');
    results.push('Wrong password → MFA rejection → recovery code → named account → logout');

    await page.goto(`${baseUrl}/?journey=reset`);
    await page.getByLabel('New password', { exact: true }).fill('ReplacementPassword1!');
    await page.getByLabel('Confirm Password', { exact: true }).fill('ReplacementPassword1!');
    await page.getByRole('button', { name: 'Reset password', exact: true }).click();
    await page.getByRole('button', { name: 'Request a new reset link' }).click();
    await page.getByLabel('Email address', { exact: true }).fill(fixtureUser.email);
    await page.getByRole('button', { name: 'Send reset link' }).click();
    await page.getByRole('alert').waitFor();
    await page.getByRole('button', { name: 'Send reset link' }).click();
    await visible('heading', 'Check your email');
    results.push('Expired reset link → offline request → successful retry');

    await page.goto(baseUrl);
    await page.getByRole('tab', { name: 'Sign up' }).click();
    const registration = page.getByRole('tabpanel', { name: 'Sign up', exact: true });
    await registration.getByLabel('Email', { exact: true }).fill(fixtureUser.email);
    await registration.getByLabel('Password', { exact: true }).fill('FixturePassword1!');
    await registration.getByLabel('Confirm Password', { exact: true }).fill('FixturePassword1!');
    await registration.getByRole('button', { name: 'Create account', exact: true }).click();
    await visible('heading', 'Check your email');
    await page.getByRole('button', { name: 'Resend verification email' }).click();
    await page.getByRole('status').filter({ hasText: 'Verification email requested' }).waitFor();
    results.push('Registration → verification required → resend confirmation');

    await page.goto(`${baseUrl}/?journey=embedded`);
    const first = page.getByRole('region', { name: 'First' });
    const second = page.getByRole('region', { name: 'Second' });
    await second.getByRole('tab', { name: 'Sign in' }).focus();
    await page.keyboard.press('ArrowRight');
    check(
      await second
        .getByRole('tab', { name: 'Sign up' })
        .evaluate((element) => element === document.activeElement),
      'Embedded tab focus escaped'
    );
    check(
      (await first.getByRole('tab', { name: 'Sign in' }).getAttribute('aria-selected')) === 'true',
      'Another form changed tabs'
    );
    check(
      await page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id);
        return new Set(ids).size === ids.length;
      }),
      'Duplicate form IDs'
    );
    results.push('Embedded forms preserve independent labels and keyboard navigation');

    await page.goto(`${baseUrl}/?journey=modal`);
    const trigger = page.getByRole('button', { name: 'Open sign-in' });
    await trigger.click();
    await page.keyboard.press('Shift+Tab');
    check(
      await page
        .getByRole('dialog')
        .evaluate((element) => element.contains(document.activeElement)),
      'Initial Shift+Tab escaped modal'
    );
    await page.keyboard.press('Escape');
    check(
      await trigger.evaluate((element) => element === document.activeElement),
      'Modal did not restore focus'
    );
    results.push('Modal keyboard containment and focus restoration');

    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'credentials', {
        configurable: true,
        value: {
          get: async () => {
            throw new DOMException('Cancelled', 'NotAllowedError');
          },
          create: async () => {
            throw new Error('Unexpected account creation');
          },
        },
      });
    });
    await page.goto(`${baseUrl}/?journey=passkey`);
    await page.getByRole('button', { name: 'Continue with passkey' }).click();
    await page.getByRole('alert').filter({ hasText: 'cancelled' }).waitFor();
    check(
      !requests.some((path) => path.startsWith('/webauthn/signup')),
      'Passkey cancellation attempted signup'
    );
    results.push('Passkey cancellation never starts account creation');
    check(unexpected.length === 0, `Unexpected requests: ${unexpected.join(', ')}`);
    check(errors.length === 0, `Browser exceptions: ${errors.join(', ')}`);
    return results;
  } finally {
    await page.unroute('**/fixture-auth/**', handler);
    page.off('pageerror', onPageError);
  }
}
