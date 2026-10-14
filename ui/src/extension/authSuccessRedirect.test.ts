import { describe, expect, it, vi } from 'vitest';

import { redirectAfterAuthSuccess, resolveAuthSuccessRedirectUrl } from './authSuccessRedirect';
import type { AuthResponse } from '../types';

function authResponse(redirectUrl?: string): AuthResponse {
  return {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      authMethods: ['email'],
      emailVerified: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    isNewUser: false,
    postLogin: redirectUrl ? { action: 'redirect', redirectUrl } : undefined,
  };
}

describe('authSuccessRedirect', () => {
  it('continues to the styled server plan chooser after email verification without a preselection', () => {
    const response = authResponse('/pricing');
    response.postLogin = { action: 'choose_subscription', redirectUrl: '/pricing' };
    expect(
      resolveAuthSuccessRedirectUrl(
        {},
        response,
        'https://site.example/verify-email?returnTo=%2Fportal'
      )
    ).toBe('/pricing');
  });

  it('preserves the signup plan only for the server subscription chooser', () => {
    const response = authResponse('/pricing');
    response.postLogin = { action: 'choose_subscription', redirectUrl: '/pricing' };
    const selected = '/pricing?plan=agency&billing=monthly#agency';
    const current = 'https://site.example/verify-email?returnTo=' + encodeURIComponent(selected);
    expect(resolveAuthSuccessRedirectUrl({}, response, current)).toBe(selected);
    response.postLogin = { action: 'redirect', redirectUrl: '/mfa' };
    expect(resolveAuthSuccessRedirectUrl({}, response, current)).toBe('/mfa');
  });
  it('uses the server post-login redirect before URL-controlled return paths', () => {
    expect(
      resolveAuthSuccessRedirectUrl(
        { redirectUrl: '/host-dashboard' },
        authResponse('/subscribe'),
        'https://site.example/register?returnTo=%2Fprofile'
      )
    ).toBe('/subscribe');
  });

  it('preserves a same-origin return path with its own query and fragment', () => {
    expect(
      resolveAuthSuccessRedirectUrl(
        {},
        undefined,
        'https://site.example/login?returnTo=%2Fportal%2Fcreate-site%3Fplan%3Dpro%23start&redirect=https%3A%2F%2Fevil.example'
      )
    ).toBe('/portal/create-site?plan=pro#start');
  });

  it.each([
    'https%3A%2F%2Fevil.example%2Fsteal',
    'https%3A%2F%2Fsite.example%2Fprofile',
    '%2F%2Fevil.example%2Fsteal',
    '%2F%5Cevil.example%2Fsteal',
    'relative%2Fpath',
  ])('rejects an unsafe returnTo value: %s', (returnTo) => {
    expect(
      resolveAuthSuccessRedirectUrl(
        { redirectUrl: '/safe-fallback' },
        undefined,
        `https://site.example/login?returnTo=${returnTo}`
      )
    ).toBe('/safe-fallback');
  });

  it('rejects duplicate returnTo parameters instead of choosing an attacker-controlled value', () => {
    expect(
      resolveAuthSuccessRedirectUrl(
        {},
        undefined,
        'https://site.example/login?returnTo=%2Fportal%2Fcreate-site&returnTo=https%3A%2F%2Fevil.example'
      )
    ).toBe('/profile');
  });

  it('rejects an oversized return path', () => {
    const oversized = encodeURIComponent(`/${'x'.repeat(2_048)}`);
    expect(
      resolveAuthSuccessRedirectUrl(
        { redirectUrl: '/safe-fallback' },
        undefined,
        `https://site.example/login?returnTo=${oversized}`
      )
    ).toBe('/safe-fallback');
  });

  it('uses the server post-login redirect before host props', () => {
    expect(
      resolveAuthSuccessRedirectUrl(
        { redirectUrl: '/host-dashboard' },
        authResponse('https://app.example.com/dashboard')
      )
    ).toBe('https://app.example.com/dashboard');
  });

  it('falls back to a safe host redirect when the server redirect is unsafe', () => {
    expect(
      resolveAuthSuccessRedirectUrl(
        { redirectUrl: '/profile/security' },
        authResponse('javascript:alert(1)')
      )
    ).toBe('/profile/security');
  });

  it('blocks protocol-relative host redirects and falls back to the profile route', () => {
    expect(resolveAuthSuccessRedirectUrl({ redirectUrl: '//evil.example.com' })).toBe('/profile');
  });

  it('assigns the resolved redirect target after auth success', () => {
    const location = {
      href: 'https://site.example/login?returnTo=%2Fportal%2Fcreate-site',
      assign: vi.fn(),
    };

    redirectAfterAuthSuccess({ continueHref: '/continue' }, undefined, location);

    expect(location.assign).toHaveBeenCalledWith('/portal/create-site');
  });
});
