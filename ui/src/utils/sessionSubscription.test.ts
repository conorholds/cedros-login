import { afterEach, describe, expect, it, vi } from 'vitest';
import { sessionSubscriptionAction } from './sessionSubscription';

const currentUrl = 'https://site.example/register';
const config = { baseUrl: 'https://site.example/extensions/cedros-login/public-auth' };
const choice = { action: 'choose_subscription', redirectUrl: '/pricing' };
const resume = (postLogin: unknown) => ({ authenticated: true, signupResume: { postLogin } });

function mockRuntime(body: unknown) {
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('sessionSubscriptionAction', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('recovers through Login with the HttpOnly session instead of calling Pay directly', async () => {
    const fetchMock = mockRuntime(resume(choice));
    expect(await sessionSubscriptionAction(config, currentUrl)).toEqual(choice);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://site.example/extensions/cedros-login/public-auth/user?resumeSignup=true',
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('continues when Login confirms there is no outstanding plan requirement', async () => {
    mockRuntime(resume(null));
    expect(await sessionSubscriptionAction(config, currentUrl)).toBeNull();
  });

  it('does not reuse a completed selection after its status changes', async () => {
    mockRuntime(resume(null));
    expect(await sessionSubscriptionAction(config, currentUrl)).toBeNull();
    mockRuntime(resume(choice));
    expect(await sessionSubscriptionAction(config, currentUrl)).toEqual(choice);
  });

  it.each([
    {},
    null,
    { authenticated: true },
    { authenticated: false, signupResume: { postLogin: null } },
    resume(undefined),
    resume({ action: 'redirect', redirectUrl: '/profile' }),
  ])('rejects malformed or unchecked recovery responses: %j', async (body) => {
    mockRuntime(body);
    await expect(sessionSubscriptionAction(config, currentUrl)).rejects.toThrow();
  });

  it('rejects an off-site chooser without sending the session there', async () => {
    const fetchMock = mockRuntime(
      resume({ ...choice, redirectUrl: 'https://attacker.example/collect' })
    );
    await expect(sessionSubscriptionAction(config, currentUrl)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
